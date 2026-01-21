/**
 * Serviço: Departamentos
 * 
 * Centraliza regras de negócio relacionadas a departamentos:
 * - Cálculo de overhead alocado
 * - Cálculo de métricas anuais
 * - Cálculo de receita mínima necessária
 * - Cálculo de resultado mensal (orquestra hours, retainers, etc.)
 */

import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '@/lib/prisma'
import { getCompanySettings } from '../settings/service'
import { calculateUtilizationRate } from '../hours'
import { getActiveRetainersForMonth } from '../retainers'
import { getTotalFixedCostsAnnual } from '../fixed-costs'
import { DepartmentAnnualMetrics } from './domain'

/**
 * Calcula o overhead alocado para um departamento
 * 
 * REGRA DE NEGÓCIO:
 * - Overhead total anual = (overheadPeople * costPerPersonPerMonth * 12) + custos fixos anuais
 * - Alocação proporcional baseada em billableHeadcount
 * - Fórmula: (dept.billableHeadcount / totalBillableHC) * totalOverheadCost
 * 
 * IMPORTANTE: Agora inclui custos fixos mensais (aluguel, utilidades, softwares, etc.)
 * 
 * @param departmentId - ID do departamento
 * @param month - Mês de referência para custos fixos (padrão: mês atual)
 * @param year - Ano de referência para custos fixos (padrão: ano atual)
 * @returns Overhead alocado anual em €
 */
export async function calculateOverheadAllocation(
  departmentId: string,
  month?: number,
  year?: number
): Promise<number> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  })

  if (!department) {
    throw new Error('Department not found')
  }

  const companySettings = await getCompanySettings()
  
  // Usar mês/ano atual se não fornecidos
  const currentDate = new Date()
  const refMonth = month || currentDate.getMonth() + 1
  const refYear = year || currentDate.getFullYear()
  
  // Overhead de pessoas (mantido para compatibilidade)
  const peopleOverheadAnnual = 
    companySettings.overheadPeople * 
    companySettings.costPerPersonPerMonth * 
    12

  // Custos fixos anuais (novo)
  const fixedCostsAnnual = await getTotalFixedCostsAnnual(refMonth, refYear)
  
  // Overhead total anual = pessoas + custos fixos
  const totalOverheadCost = peopleOverheadAnnual + fixedCostsAnnual

  // Total de HC faturável de todos os departamentos ativos
  const totalBillableHC = await prisma.department.aggregate({
    where: { isActive: true },
    _sum: { billableHeadcount: true }
  })

  // Se não houver HC faturável, não há o que alocar
  if (!totalBillableHC._sum.billableHeadcount || totalBillableHC._sum.billableHeadcount === 0) {
    return 0
  }

  // Alocar proporcionalmente
  const allocationRatio = 
    department.billableHeadcount / totalBillableHC._sum.billableHeadcount

  return totalOverheadCost * allocationRatio
}

/**
 * Calcula todas as métricas anuais de um departamento
 * 
 * REGRAS DE NEGÓCIO:
 * 
 * 1. Custo direto anual:
 *    directCostAnnual = billableHeadcount * costPerPerson * 12
 *    (usa costPerPersonPerMonth do dept, ou padrão da empresa)
 * 
 * 2. Horas faturáveis anuais:
 *    billableHoursAnnual = billableHeadcount * hoursPerMonth * targetUtilization * 12
 * 
 * 3. Capacidade de receita anual:
 *    revenueCapacityAnnual = billableHoursAnnual * averageHourlyRate
 * 
 * 4. Overhead alocado:
 *    overheadAllocatedAnnual = calculado via calculateOverheadAllocation()
 * 
 * 5. Receita mínima anual:
 *    minimumRevenueAnnual = (directCostAnnual + overheadAllocatedAnnual) / (1 - targetMargin)
 *    (garante que, com a margem alvo, cubra todos os custos)
 * 
 * @param departmentId - ID do departamento
 * @returns Departamento atualizado com métricas calculadas
 */
export async function calculateAnnualMetrics(
  departmentId: string
) {
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  })

  if (!department) {
    throw new Error('Department not found')
  }

  const companySettings = await getCompanySettings()
  const targetUtilization = Number(department.targetUtilization)

  // 1. Custo direto anual
  // Usa costPerPersonPerMonth do dept se existir, senão usa padrão da empresa
  const costPerPerson = department.costPerPersonPerMonth
    ? Number(department.costPerPersonPerMonth)
    : companySettings.costPerPersonPerMonth
  
  const directCostAnnual = department.billableHeadcount * costPerPerson * 12

  // 2. Horas faturáveis anuais
  const billableHoursAnnual = 
    department.billableHeadcount * 
    companySettings.hoursPerMonth * 
    targetUtilization * 
    12

  // 3. Capacidade de receita anual
  const revenueCapacityAnnual = 
    billableHoursAnnual * Number(department.averageHourlyRate)

  // 4. Overhead alocado (usa mês atual como referência para custos fixos)
  const currentDate = new Date()
  const overheadAllocatedAnnual = await calculateOverheadAllocation(
    departmentId,
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  )

  // 5. Receita mínima anual (com margem alvo)
  const totalCost = directCostAnnual + overheadAllocatedAnnual
  const minimumRevenueAnnual = totalCost / (1 - companySettings.targetMargin)

  // Persistir métricas calculadas
  return await prisma.department.update({
    where: { id: departmentId },
    data: {
      directCostAnnual: new Decimal(directCostAnnual),
      billableHoursAnnual: new Decimal(billableHoursAnnual),
      revenueCapacityAnnual: new Decimal(revenueCapacityAnnual),
      overheadAllocatedAnnual: new Decimal(overheadAllocatedAnnual),
      minimumRevenueAnnual: new Decimal(minimumRevenueAnnual)
    }
  })
}

/**
 * Calcula métricas anuais sem persistir
 * 
 * Útil para simulações ou validações antes de salvar.
 * 
 * @param departmentId - ID do departamento
 * @returns Métricas calculadas (não persistidas)
 */
export async function calculateAnnualMetricsWithoutSaving(
  departmentId: string
): Promise<DepartmentAnnualMetrics> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  })

  if (!department) {
    throw new Error('Department not found')
  }

  const companySettings = await getCompanySettings()
  const targetUtilization = Number(department.targetUtilization)

  const costPerPerson = department.costPerPersonPerMonth
    ? Number(department.costPerPersonPerMonth)
    : companySettings.costPerPersonPerMonth
  
  const directCostAnnual = department.billableHeadcount * costPerPerson * 12
  const billableHoursAnnual = 
    department.billableHeadcount * 
    companySettings.hoursPerMonth * 
    targetUtilization * 
    12
  const revenueCapacityAnnual = 
    billableHoursAnnual * Number(department.averageHourlyRate)
  
  // Overhead alocado (usa mês atual como referência para custos fixos)
  const currentDate = new Date()
  const overheadAllocatedAnnual = await calculateOverheadAllocation(
    departmentId,
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  )
  const totalCost = directCostAnnual + overheadAllocatedAnnual
  const minimumRevenueAnnual = totalCost / (1 - companySettings.targetMargin)

  return {
    directCostAnnual,
    billableHoursAnnual,
    revenueCapacityAnnual,
    overheadAllocatedAnnual,
    minimumRevenueAnnual
  }
}

/**
 * Calcula o resultado mensal completo de um departamento.
 * 
 * Esta é a função "motor mensal" que orquestra todos os módulos:
 * - Busca horas planejadas/reais (hours)
 * - Busca avenças ativas (retainers)
 * - Calcula receita total
 * - Calcula performance vs objetivo
 * - Calcula utilização (hours)
 * - Persiste em Result
 * 
 * REGRAS DE NEGÓCIO:
 * 
 * 1. Receita de horas:
 *    revenueFromHours = actualBillableHours * averageHourlyRate
 * 
 * 2. Receita de avenças:
 *    retainersRevenue = sum(activeRetainers.monthlyRevenue)
 * 
 * 3. Receita total:
 *    totalRevenue = revenueFromHours + retainersRevenue + projectRevenue
 * 
 * 4. Performance:
 *    performance = (totalRevenue / objective) * 100
 * 
 * 5. Utilização:
 *    utilizationRate = actualBillableHours / targetAvailableHours
 * 
 * @param departmentId - ID do departamento
 * @param month - Mês (1-12)
 * @param year - Ano
 * @returns Result persistido no banco
 */
export async function getDepartmentMonthlyResult(
  departmentId: string,
  month: number,
  year: number
) {
  // 1. Buscar departamento
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  })

  if (!department) {
    throw new Error('Department not found')
  }

  // 2. Buscar horas planejadas e reais
  const plannedHours = await prisma.plannedHours.findUnique({
    where: {
      departmentId_month_year: { departmentId, month, year }
    }
  })

  // 3. Buscar avenças ativas no mês (módulo retainers)
  const activeRetainers = await getActiveRetainersForMonth(
    departmentId,
    month,
    year
  )
  const retainersRevenue = activeRetainers.reduce(
    (sum, r) => sum + Number(r.monthlyRevenue),
    0
  )

  // 4. Calcular receita de horas
  const actualHours = plannedHours?.actualBillableHours 
    ? Number(plannedHours.actualBillableHours) 
    : 0
  const hourlyRate = Number(department.averageHourlyRate)
  const revenueFromHours = actualHours * hourlyRate

  // 5. Receita de projetos
  const projectRevenue = plannedHours?.projectRevenue 
    ? Number(plannedHours.projectRevenue) 
    : 0

  // 6. Receita total
  const totalRevenue = revenueFromHours + retainersRevenue + projectRevenue

  // Garantir que valores zero/null sejam tratados corretamente
  const safeTotalRevenue = totalRevenue || 0
  const safeRevenueFromHours = revenueFromHours || 0
  const safeProjectRevenue = projectRevenue || 0
  const safeRetainersRevenue = retainersRevenue || 0

  // 7. Buscar objetivo
  const objective = await prisma.objective.findUnique({
    where: {
      departmentId_month_year: { departmentId, month, year }
    }
  })

  // 8. Calcular performance
  const objectiveValue = objective ? Number(objective.targetValue) : null
  const performance = objectiveValue && objectiveValue > 0
    ? (safeTotalRevenue / objectiveValue) * 100
    : null

  // 9. Calcular utilização (módulo hours)
  const availableHours = plannedHours?.targetAvailableHours 
    ? Number(plannedHours.targetAvailableHours) 
    : null
  const utilizationRate = calculateUtilizationRate(
    { actualBillableHours: actualHours },
    availableHours !== null ? { targetAvailableHours: availableHours } : null
  )

  // 10. Salvar ou atualizar resultado
  // Garantir que valores zero sejam salvos como 0, não null
  return await prisma.result.upsert({
    where: {
      departmentId_month_year: { departmentId, month, year }
    },
    create: {
      departmentId,
      month,
      year,
      plannedHours: availableHours && availableHours > 0 ? new Decimal(availableHours) : null,
      actualHours: actualHours > 0 ? new Decimal(actualHours) : null,
      hourlyRate: new Decimal(hourlyRate),
      activeRetainers: new Decimal(safeRetainersRevenue), // Sempre salvar, mesmo se 0
      projectRevenue: projectRevenue > 0 ? new Decimal(projectRevenue) : null,
      revenueFromHours: revenueFromHours > 0 ? new Decimal(revenueFromHours) : null,
      totalRevenue: new Decimal(safeTotalRevenue), // Sempre salvar, mesmo se 0
      objective: objectiveValue && objectiveValue > 0 ? new Decimal(objectiveValue) : null,
      performance: performance !== null && performance >= 0 ? new Decimal(performance) : null,
      utilizationRate: utilizationRate !== null && utilizationRate >= 0 ? new Decimal(utilizationRate) : null,
      calculatedBy: 'system'
    },
    update: {
      plannedHours: availableHours && availableHours > 0 ? new Decimal(availableHours) : null,
      actualHours: actualHours > 0 ? new Decimal(actualHours) : null,
      hourlyRate: new Decimal(hourlyRate),
      activeRetainers: new Decimal(safeRetainersRevenue),
      projectRevenue: projectRevenue > 0 ? new Decimal(projectRevenue) : null,
      revenueFromHours: revenueFromHours > 0 ? new Decimal(revenueFromHours) : null,
      totalRevenue: new Decimal(safeTotalRevenue),
      objective: objectiveValue && objectiveValue > 0 ? new Decimal(objectiveValue) : null,
      performance: performance !== null && performance >= 0 ? new Decimal(performance) : null,
      utilizationRate: utilizationRate !== null && utilizationRate >= 0 ? new Decimal(utilizationRate) : null,
      calculatedAt: new Date()
    }
  })
}
