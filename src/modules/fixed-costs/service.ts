/**
 * Serviço: Custos Fixos Mensais
 * 
 * Centraliza regras de negócio relacionadas a custos fixos:
 * - Cálculo de total mensal/anual
 * - Agrupamento por categoria
 * - Filtro de custos ativos em um período
 */

import { prisma } from '@/lib/prisma'
import { FixedCostsOverview, FixedCostSummary, FixedCostCategory } from './domain'

/**
 * Busca todos os custos fixos ativos em um mês/ano específico
 * 
 * Um custo está ativo se:
 * - isActive = true
 * - startDate <= fim do mês
 * - endDate é null OU endDate >= início do mês
 * 
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Lista de custos fixos ativos no período
 */
export async function getActiveFixedCostsForMonth(
  month: number,
  year: number
) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  return await prisma.fixedCost.findMany({
    where: {
      isActive: true,
      startDate: { lte: endOfMonth },
      OR: [
        { endDate: null },
        { endDate: { gte: startOfMonth } }
      ]
    },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  })
}

/**
 * Calcula o total mensal de custos fixos ativos em um mês/ano
 * 
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Total em €
 */
export async function getTotalFixedCostsForMonth(
  month: number,
  year: number
): Promise<number> {
  const activeCosts = await getActiveFixedCostsForMonth(month, year)
  
  return activeCosts.reduce(
    (sum, cost) => sum + Number(cost.monthlyAmount),
    0
  )
}

/**
 * Calcula o total anual de custos fixos (baseado no mês atual)
 * 
 * @param month - Mês de referência (1-12)
 * @param year - Ano de referência
 * @returns Total anual em € (total mensal × 12)
 */
export async function getTotalFixedCostsAnnual(
  month: number,
  year: number
): Promise<number> {
  const monthlyTotal = await getTotalFixedCostsForMonth(month, year)
  return monthlyTotal * 12
}

/**
 * Monta visão consolidada de custos fixos
 * 
 * @param month - Mês de referência (1-12)
 * @param year - Ano de referência
 * @returns Visão consolidada com totais e breakdown por categoria
 */
export async function getFixedCostsOverview(
  month: number,
  year: number
): Promise<FixedCostsOverview> {
  const activeCosts = await getActiveFixedCostsForMonth(month, year)
  
  const totalMonthly = activeCosts.reduce(
    (sum, cost) => sum + Number(cost.monthlyAmount),
    0
  )
  const totalAnnual = totalMonthly * 12

  // Agrupar por categoria
  const byCategoryMap = new Map<FixedCostCategory, FixedCostSummary>()
  
  activeCosts.forEach(cost => {
    const category = cost.category as FixedCostCategory
    const amount = Number(cost.monthlyAmount)
    
    const existing = byCategoryMap.get(category)
    if (existing) {
      existing.totalMonthly += amount
      existing.totalAnnual += amount * 12
      existing.count += 1
    } else {
      byCategoryMap.set(category, {
        category,
        totalMonthly: amount,
        totalAnnual: amount * 12,
        count: 1
      })
    }
  })

  const byCategory = Array.from(byCategoryMap.values())
    .sort((a, b) => b.totalMonthly - a.totalMonthly)

  return {
    totalMonthly,
    totalAnnual,
    byCategory,
    activeCount: activeCosts.length
  }
}

