import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../prisma'

/**
 * Calcula o resultado mensal de um departamento
 * Equivalente ao cálculo na aba "Horas Faturáveis – Dept"
 */
export async function calculateDepartmentResult(
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

  // 3. Buscar avenças ativas no mês
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

  // 9. Calcular utilização
  const availableHours = plannedHours?.targetAvailableHours 
    ? Number(plannedHours.targetAvailableHours) 
    : null
  const utilizationRate = availableHours && availableHours > 0
    ? actualHours / availableHours
    : null

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

/**
 * Busca avenças ativas para um mês específico
 */
async function getActiveRetainersForMonth(
  departmentId: string,
  month: number,
  year: number
) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  return await prisma.retainer.findMany({
    where: {
      departmentId,
      isActive: true,
      startDate: { lte: endOfMonth },
      OR: [
        { endDate: null },
        { endDate: { gte: startOfMonth } }
      ]
    }
  })
}

/**
 * Calcula overhead alocado por departamento
 * Baseado em: Base de alocação de overhead = Billable headcount
 */
export async function calculateDepartmentOverhead(
  departmentId: string
): Promise<number> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  })

  if (!department) {
    throw new Error('Department not found')
  }

  const globalSettings = await getGlobalSettings()
  const totalOverheadPeople = parseInt(globalSettings.overheadPeople || '6')
  const costPerPerson = parseFloat(globalSettings.costPerPersonPerMonth || '2200')
  const totalOverheadCost = totalOverheadPeople * costPerPerson * 12 // Anual

  // Total de HC faturável de todos os departamentos
  const totalBillableHC = await prisma.department.aggregate({
    where: { isActive: true },
    _sum: { billableHeadcount: true }
  })

  // Alocar proporcionalmente
  if (!totalBillableHC._sum.billableHeadcount || totalBillableHC._sum.billableHeadcount === 0) {
    return 0
  }

  const allocationRatio = department.billableHeadcount / 
    totalBillableHC._sum.billableHeadcount

  return totalOverheadCost * allocationRatio
}

/**
 * Calcula métricas anuais do departamento
 */
export async function calculateDepartmentAnnualMetrics(departmentId: string) {
  const department = await prisma.department.findUnique({
    where: { id: departmentId }
  })

  if (!department) {
    throw new Error('Department not found')
  }

  const globalSettings = await getGlobalSettings()
  const hoursPerMonth = parseFloat(globalSettings.hoursPerMonth || '160')
  const targetUtilization = Number(department.targetUtilization)

  // Custo direto anual
  const costPerPerson = department.costPerPersonPerMonth 
    ? Number(department.costPerPersonPerMonth) 
    : parseFloat(globalSettings.costPerPersonPerMonth || '2200')
  const directCostAnnual = department.billableHeadcount * costPerPerson * 12

  // Horas faturáveis anuais
  const billableHoursAnnual = 
    department.billableHeadcount * hoursPerMonth * targetUtilization * 12

  // Capacidade receita anual
  const revenueCapacityAnnual = 
    billableHoursAnnual * Number(department.averageHourlyRate)

  // Overhead alocado
  const overheadAllocatedAnnual = await calculateDepartmentOverhead(departmentId)

  // Receita mínima anual (com margem alvo)
  const targetMargin = parseFloat(globalSettings.targetMargin || '0.3')
  const totalCost = directCostAnnual + overheadAllocatedAnnual
  const minimumRevenueAnnual = totalCost / (1 - targetMargin)

  // Atualizar departamento
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
 * Busca configurações globais
 */
async function getGlobalSettings(): Promise<Record<string, string>> {
  const settings = await prisma.globalSetting.findMany()
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)
}

/**
 * Recalcula todos os resultados de um departamento para um ano
 */
export async function recalculateDepartmentResultsForYear(
  departmentId: string,
  year: number
) {
  const results = []
  for (let month = 1; month <= 12; month++) {
    const result = await calculateDepartmentResult(departmentId, month, year)
    results.push(result)
  }
  return results
}

