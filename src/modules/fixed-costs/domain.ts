/**
 * Domínio: Custos Fixos Mensais da Empresa
 * 
 * Representa custos fixos recorrentes da empresa como:
 * - Aluguel de escritórios
 * - Utilidades (luz, água, internet)
 * - Softwares e licenças
 * - Viaturas
 * - Outros custos fixos
 */

/**
 * Categoria de custo fixo
 */
export type FixedCostCategory = 
  | 'Aluguel'
  | 'Utilidades'
  | 'Software'
  | 'Viaturas'
  | 'Outros'

/**
 * Custo fixo mensal
 */
export interface FixedCost {
  id: string
  name: string
  category: FixedCostCategory
  monthlyAmount: number
  description: string | null
  isActive: boolean
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Resumo de custos fixos por categoria
 */
export interface FixedCostSummary {
  category: FixedCostCategory
  totalMonthly: number
  totalAnnual: number
  count: number
}

/**
 * Resumo consolidado de todos os custos fixos
 */
export interface FixedCostsOverview {
  totalMonthly: number
  totalAnnual: number
  byCategory: FixedCostSummary[]
  activeCount: number
}

