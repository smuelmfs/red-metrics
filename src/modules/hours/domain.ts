/**
 * Domínio: Horas (Planejadas e Reais)
 *
 * Representa a capacidade de horas de um departamento,
 * separando claramente:
 * - plano (headcount, horas alvo, utilização alvo)
 * - realizado (horas faturáveis reais)
 */

/**
 * Horas planejadas (plano) para um departamento em um mês.
 *
 * Equivalente aos campos editáveis em PlannedHours que definem a capacidade.
 */
export interface WorkHoursPlan {
  /** Headcount faturável no mês */
  billableHeadcount: number
  /** Horas padrão por pessoa no mês (ex.: 160) */
  targetHoursPerMonth: number
  /** Utilização alvo (0.0 a 1.0, ex.: 0.65) */
  targetUtilization: number
}

/**
 * Horas reais (realizado) de um departamento em um mês.
 */
export interface WorkHoursActual {
  /** Horas faturáveis reais registradas (ex.: do Odoo) */
  actualBillableHours: number
}

/**
 * Capacidade de horas derivada do plano.
 */
export interface HoursCapacity {
  /** Horas disponíveis planejadas no mês (HC * horas * utilização) */
  targetAvailableHours: number
}


