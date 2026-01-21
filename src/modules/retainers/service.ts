/**
 * Serviço: Avenças (Retainers)
 *
 * Centraliza regras de negócio de receita recorrente:
 * - Cálculo de monthlyRevenue de uma avença
 * - Seleção de avenças ativas em um mês
 * - Receita total de avenças por departamento/mês
 */

import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '@/lib/prisma'
import { DepartmentRetainerSummary, RetainerPricing } from './domain'

/**
 * Calcula a receita mensal de uma avença.
 *
 * REGRA (já usada em /api/retainers):
 *   monthlyRevenue = monthlyPrice * quantity
 */
export function calculateRetainerMonthlyRevenue(
  monthlyPrice: number,
  quantity: number = 1
): RetainerPricing {
  const safeQuantity = quantity || 1
  const monthlyRevenue = monthlyPrice * safeQuantity

  return {
    monthlyPrice,
    quantity: safeQuantity,
    monthlyRevenue,
  }
}

/**
 * Busca avenças ativas para um mês específico.
 *
 * REGRA (extraída de lib/business-logic/calculations.ts):
 * - departmentId bate
 * - isActive = true
 * - startDate <= fim do mês
 * - (endDate é null OU endDate >= início do mês)
 */
export async function getActiveRetainersForMonth(
  departmentId: string,
  month: number,
  year: number
) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  return prisma.retainer.findMany({
    where: {
      departmentId,
      isActive: true,
      startDate: { lte: endOfMonth },
      OR: [
        { endDate: null },
        { endDate: { gte: startOfMonth } },
      ],
    },
  })
}

/**
 * Calcula a receita total de avenças de um departamento
 * em um determinado mês/ano.
 *
 * Usa exatamente a mesma soma já existente em calculateDepartmentResult:
 *   sum(activeRetainer.monthlyRevenue)
 */
export async function getDepartmentRetainerRevenueForMonth(
  departmentId: string,
  month: number,
  year: number
): Promise<DepartmentRetainerSummary> {
  const activeRetainers = await getActiveRetainersForMonth(
    departmentId,
    month,
    year
  )

  const retainerMonthlyRevenue = activeRetainers.reduce(
    (sum, r) => sum + Number(r.monthlyRevenue),
    0
  )

  return {
    departmentId,
    month,
    year,
    retainerMonthlyRevenue,
    activeRetainersCount: activeRetainers.length,
  }
}


