/**
 * Serviço: Dashboards
 *
 * Centraliza regras de agregação para a visão executiva:
 * - Totais da empresa
 * - Performance geral
 * - Ranking de departamentos
 * - Séries temporais de receita vs objetivo
 */

import { prisma } from '@/lib/prisma'
import {
  CompanyDashboardOverview,
  DepartmentDashboardSummary,
  PerformanceChartPoint,
  PerformanceStatus,
  RankedDepartment,
  RevenueEvolutionPoint,
  PERFORMANCE_GOOD_THRESHOLD,
  PERFORMANCE_WARNING_THRESHOLD,
} from './domain'

function getPerformanceStatus(value: number | null): PerformanceStatus | null {
  if (value === null) return null
  if (value >= PERFORMANCE_GOOD_THRESHOLD) return 'good'
  if (value >= PERFORMANCE_WARNING_THRESHOLD) return 'warning'
  return 'bad'
}

/**
 * Monta visão consolidada do dashboard para um mês/ano específico.
 *
 * IMPORTANTE: Este serviço replica exatamente a lógica existente em
 * `dashboard/page.tsx`, apenas centralizando as regras numéricas e de
 * classificação fora da UI.
 */
export async function getCompanyDashboardOverview(
  month: number,
  year: number
): Promise<CompanyDashboardOverview> {
  // Buscar departamentos com contagem de avenças ativas
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          retainers: {
            where: { isActive: true },
          },
        },
      },
    },
  })

  // Buscar resultados do mês/ano selecionado
  const results = await prisma.result.findMany({
    where: {
      month,
      year,
    },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  })

  // Totais da empresa
  const totalRevenue = results.reduce(
    (sum, r) => sum + Number(r.totalRevenue),
    0
  )
  const totalObjective = results.reduce(
    (sum, r) => sum + (r.objective ? Number(r.objective) : 0),
    0
  )
  const overallPerformancePercentage =
    totalObjective > 0 ? (totalRevenue / totalObjective) * 100 : null
  const overallGap =
    totalObjective > 0 ? totalRevenue - totalObjective : null
  const overallStatus = getPerformanceStatus(overallPerformancePercentage)

  // Mapear para summaries por departamento
  const departmentSummaries: DepartmentDashboardSummary[] = departments.map(
    (dept) => {
      const result = results.find((r) => r.departmentId === dept.id)
      const totalRevenueDept = result ? Number(result.totalRevenue) : null
      const objectiveDept = result && result.objective
        ? Number(result.objective)
        : null
      const performanceDept =
        result && result.performance !== null
          ? Number(result.performance)
          : null
      const gapDept =
        totalRevenueDept !== null && objectiveDept !== null
          ? totalRevenueDept - objectiveDept
          : null

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        billableHeadcount: dept.billableHeadcount,
        averageHourlyRate: Number(dept.averageHourlyRate),
        activeRetainersCount: dept._count.retainers,
        totalRevenue: totalRevenueDept,
        objective: objectiveDept,
        performancePercentage: performanceDept,
        gap: gapDept,
        status: getPerformanceStatus(performanceDept),
      }
    }
  )

  // Dados para gráfico de performance por departamento
  const performanceData: PerformanceChartPoint[] = results
    .filter((r) => r.performance !== null)
    .map((r) => ({
      departmentId: r.departmentId,
      departmentName: r.department.name,
      performancePercentage: Number(r.performance),
      objective: r.objective ? Number(r.objective) : 0,
      revenue: Number(r.totalRevenue),
    }))

  // Série dos últimos 12 meses (incluindo o mês selecionado)
  // Equivalente à visão anual da planilha
  const last12Months: RevenueEvolutionPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(year, month - 1 - i, 1)
    const m = date.getMonth() + 1
    const y = date.getFullYear()

    const monthResults = await prisma.result.findMany({
      where: { month: m, year: y },
    })

    const monthRevenue = monthResults.reduce(
      (sum, r) => sum + Number(r.totalRevenue),
      0
    )
    const monthObjective = monthResults.reduce(
      (sum, r) => sum + (r.objective ? Number(r.objective) : 0),
      0
    )

    last12Months.push({
      month: date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      }),
      monthNumber: m,
      year: y,
      revenue: monthRevenue,
      objective: monthObjective,
    })
  }
  
  // Manter compatibilidade: last6Months são os últimos 6 de last12Months
  const last6Months = last12Months.slice(-6)

  // Ranking de departamentos (apenas com performance conhecida)
  const rankingSource: RankedDepartment[] = departmentSummaries
    .filter(
      (dept) =>
        dept.performancePercentage !== null &&
        dept.status !== null
    )
    .map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      performancePercentage: dept.performancePercentage as number,
      totalRevenue: dept.totalRevenue || 0,
      objective: dept.objective,
      status: dept.status as PerformanceStatus,
    }))
    .sort(
      (a, b) =>
        b.performancePercentage - a.performancePercentage
    )

  return {
    month,
    year,
    totalRevenue,
    totalObjective,
    overallPerformancePercentage,
    overallGap,
    status: overallStatus,
    departments: departmentSummaries,
    performanceData,
    last6Months, // Compatibilidade
    last12Months, // Série anual completa
    ranking: rankingSource,
  }
}


