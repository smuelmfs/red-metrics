/**
 * Domínio: Configurações Globais da Empresa (CompanySettings)
 * 
 * Representa os parâmetros financeiros e operacionais que afetam
 * todos os cálculos de custos, overhead e objetivos mínimos.
 */

/**
 * Chaves padronizadas para GlobalSetting
 * 
 * IMPORTANTE: Estas são as chaves esperadas no banco de dados.
 * Qualquer mudança aqui deve ser refletida no seed e na UI.
 */
export const SETTING_KEYS = {
  /** Margem alvo da empresa (ex: '0.3' = 30%) */
  TARGET_MARGIN: 'targetMargin',
  /** Horas padrão trabalhadas por mês (ex: '160') */
  HOURS_PER_MONTH: 'hoursPerMonth',
  /** Utilização faturável média padrão (ex: '0.65' = 65%) */
  TARGET_UTILIZATION: 'targetUtilization',
  /** Custo médio por pessoa/mês em € (ex: '2200') */
  COST_PER_PERSON_PER_MONTH: 'costPerPersonPerMonth',
  /** Número de pessoas não faturáveis (overhead) (ex: '6') */
  OVERHEAD_PEOPLE: 'overheadPeople',
} as const

/**
 * Configurações globais tipadas
 * 
 * Valores são parseados e tipados para evitar conversões
 * espalhadas pelo código.
 */
export interface CompanySettings {
  /** Margem alvo (0.0 a 1.0, ex: 0.3 = 30%) */
  targetMargin: number
  /** Horas padrão por mês */
  hoursPerMonth: number
  /** Utilização faturável média padrão (0.0 a 1.0) */
  targetUtilization: number
  /** Custo médio por pessoa/mês em € */
  costPerPersonPerMonth: number
  /** Número de pessoas de overhead */
  overheadPeople: number
}

/**
 * Valores padrão para configurações
 * 
 * Usados quando uma configuração não existe no banco.
 * Estes valores devem refletir os defaults usados em calculations.ts
 */
export const DEFAULT_SETTINGS: CompanySettings = {
  targetMargin: 0.3, // 30%
  hoursPerMonth: 160,
  targetUtilization: 0.65, // 65%
  costPerPersonPerMonth: 2200,
  overheadPeople: 6,
}

