/**
 * Domínio: Departamentos
 * 
 * Representa departamentos da empresa e suas métricas financeiras
 * calculadas (custos, capacidade, overhead, objetivos mínimos).
 */

/**
 * Métricas anuais calculadas de um departamento
 * 
 * Estes valores são calculados e persistidos no model Department,
 * mas este tipo representa o conceito de domínio.
 */
export interface DepartmentAnnualMetrics {
  /** Custo direto anual (billableHeadcount * costPerPerson * 12) */
  directCostAnnual: number
  /** Horas faturáveis anuais (billableHeadcount * hoursPerMonth * targetUtilization * 12) */
  billableHoursAnnual: number
  /** Capacidade de receita anual (billableHoursAnnual * averageHourlyRate) */
  revenueCapacityAnnual: number
  /** Overhead alocado anualmente (proporcional ao billableHeadcount) */
  overheadAllocatedAnnual: number
  /** Receita mínima anual necessária (considerando custos + margem alvo) */
  minimumRevenueAnnual: number
}

/**
 * Visão consolidada de um departamento com métricas
 * 
 * Útil para dashboards e relatórios onde precisamos
 * de departamento + métricas calculadas.
 */
export interface DepartmentView {
  id: string
  name: string
  code: string | null
  billableHeadcount: number
  costPerPersonPerMonth: number | null
  targetUtilization: number
  averageHourlyRate: number
  isActive: boolean
  metrics: DepartmentAnnualMetrics
}

