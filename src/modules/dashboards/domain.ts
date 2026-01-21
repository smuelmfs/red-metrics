/**
 * Domínio: Dashboards
 *
 * Centraliza tipos e regras ligadas à visão executiva:
 * - Visão mensal da empresa
 * - Ranking de departamentos
 * - Séries temporais de receita vs objetivo
 */

export type PerformanceStatus = 'good' | 'warning' | 'bad'

/**
 * Thresholds de performance.
 *
 * IMPORTANTE: Estes valores replicam o comportamento atual da UI,
 * onde:
 * - >= 100%  => "verde" (bom)
 * - >= 80%   => "amarelo" (atenção)
 * - <  80%   => "vermelho" (abaixo)
 *
 * Mantidos aqui para que a UI não conheça números mágicos.
 */
export const PERFORMANCE_GOOD_THRESHOLD = 100
export const PERFORMANCE_WARNING_THRESHOLD = 80

/**
 * Ponto da série de evolução mensal de receita vs objetivo
 * para o gráfico de linha.
 */
export interface RevenueEvolutionPoint {
  /** Rótulo amigável, ex: "jan 2025" */
  month: string
  /** Mês numérico (1-12) */
  monthNumber: number
  /** Ano numérico */
  year: number
  /** Receita total no mês (empresa) */
  revenue: number
  /** Objetivo total no mês (empresa) */
  objective: number
}

/**
 * Ponto da série de performance por departamento
 * para o gráfico de barras.
 */
export interface PerformanceChartPoint {
  departmentId: string
  departmentName: string
  /** Performance em % (ex.: 105.3) */
  performancePercentage: number
  /** Objetivo em € */
  objective: number
  /** Receita total em € */
  revenue: number
}

/**
 * Visão de um departamento no contexto do dashboard mensal.
 */
export interface DepartmentDashboardSummary {
  id: string
  name: string
  code: string | null
  billableHeadcount: number
  averageHourlyRate: number
  /** Número de avenças ativas */
  activeRetainersCount: number

  /** Receita total do mês (result.totalRevenue) */
  totalRevenue: number | null
  /** Objetivo do mês (result.objective) */
  objective: number | null
  /** Performance do mês em % (result.performance) */
  performancePercentage: number | null
  /** Gap = receita - objetivo (ou null se objetivo inexistente) */
  gap: number | null
  /** Status categórico (bom / atenção / ruim) baseado na performance */
  status: PerformanceStatus | null
}

/**
 * Entrada do ranking de departamentos (ordenado por performance).
 */
export interface RankedDepartment {
  id: string
  name: string
  code: string | null
  /** Performance em % (garantidamente não null no ranking) */
  performancePercentage: number
  totalRevenue: number
  objective: number | null
  status: PerformanceStatus
}

/**
 * Relatório mensal consolidado da empresa para o dashboard.
 */
export interface CompanyDashboardOverview {
  month: number
  year: number

  /** Receita total do mês (soma de todos os departamentos) */
  totalRevenue: number
  /** Objetivo total do mês (soma de objetivos dos departamentos) */
  totalObjective: number
  /** Performance geral em % (totalRevenue / totalObjective * 100) */
  overallPerformancePercentage: number | null
  /** Gap total = receita - objetivo (ou null se objetivo 0) */
  overallGap: number | null
  /** Status categórico da performance geral */
  status: PerformanceStatus | null

  /** Departamentos com visão resumida e status */
  departments: DepartmentDashboardSummary[]
  /** Dados para o gráfico de barras de performance por departamento */
  performanceData: PerformanceChartPoint[]
  /** Série dos últimos 6 meses (incluindo o selecionado) para o gráfico de linha - compatibilidade */
  last6Months: RevenueEvolutionPoint[]
  /** Série dos últimos 12 meses (incluindo o selecionado) para visão anual completa */
  last12Months: RevenueEvolutionPoint[]
  /** Ranking de departamentos por performance */
  ranking: RankedDepartment[]
}


