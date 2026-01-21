/**
 * Domínio: Avenças (Retainers)
 *
 * Representa a precificação e o vínculo contratual das avenças
 * e a visão resumida de receita recorrente por departamento.
 */

/**
 * Precificação de uma avença.
 *
 * monthlyRevenue é sempre derivado:
 *   monthlyRevenue = monthlyPrice * quantity
 */
export interface RetainerPricing {
  monthlyPrice: number
  quantity: number
  monthlyRevenue: number
}

/**
 * Contrato de avença (vínculo com departamento).
 *
 * Não representa diretamente o modelo Prisma, mas o conceito de
 * "avença ativa" no domínio.
 */
export interface RetainerContract {
  id: string
  departmentId: string
  catalogId?: string | null
  name: string
  type?: string | null
  pricing: RetainerPricing

  hoursPerMonth?: number | null
  variableCostPerMonth?: number | null

  monthlyChurn?: number | null
  newRetainersPerMonth?: number | null

  startDate: Date
  endDate?: Date | null
  isActive: boolean
}

/**
 * Resumo mensal de receita de avenças por departamento.
 *
 * É um view model / DTO de domínio, NÃO uma entidade persistida.
 */
export interface DepartmentRetainerSummary {
  departmentId: string
  month: number
  year: number
  /** Receita recorrente mensal total de avenças ativas no período */
  retainerMonthlyRevenue: number
  /** Quantidade de avenças ativas consideradas no período */
  activeRetainersCount: number
}


