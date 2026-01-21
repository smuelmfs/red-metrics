/**
 * Módulo: Custos Fixos Mensais
 * 
 * Exporta tipos e serviços relacionados a custos fixos da empresa.
 */

export type {
  FixedCost,
  FixedCostCategory,
  FixedCostSummary,
  FixedCostsOverview
} from './domain'

export {
  getActiveFixedCostsForMonth,
  getTotalFixedCostsForMonth,
  getTotalFixedCostsAnnual,
  getFixedCostsOverview
} from './service'

