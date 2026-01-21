/**
 * WRAPPERS DE COMPATIBILIDADE
 * 
 * Este arquivo agora contém APENAS wrappers que delegam para os módulos de domínio.
 * Nenhuma regra de negócio nova deve ser adicionada aqui.
 * 
 * Para novas funcionalidades, use os módulos em modules/{nome}/service.ts
 */

// Importar serviços dos módulos de domínio
import { calculateOverheadAllocation, calculateAnnualMetrics, getDepartmentMonthlyResult } from '@/modules/departments/service'

/**
 * Calcula o resultado mensal de um departamento
 * Equivalente ao cálculo na aba "Horas Faturáveis – Dept"
 * 
 * WRAPPER: Delega para modules/departments/service.ts
 * Mantido para compatibilidade com código existente.
 */
export async function calculateDepartmentResult(
  departmentId: string,
  month: number,
  year: number
) {
  return await getDepartmentMonthlyResult(departmentId, month, year)
}

/**
 * Calcula overhead alocado por departamento
 * Baseado em: Base de alocação de overhead = Billable headcount
 * 
 * WRAPPER: Delega para modules/departments/service.ts
 * Mantido para compatibilidade com código existente.
 */
export async function calculateDepartmentOverhead(
  departmentId: string
): Promise<number> {
  return await calculateOverheadAllocation(departmentId)
}

/**
 * Calcula métricas anuais do departamento
 * 
 * WRAPPER: Delega para modules/departments/service.ts
 * Mantido para compatibilidade com código existente.
 */
export async function calculateDepartmentAnnualMetrics(departmentId: string) {
  return await calculateAnnualMetrics(departmentId)
}

/**
 * Busca configurações globais
 * 
 * DEPRECATED: Use modules/settings/service.getCompanySettings() para valores tipados.
 * Mantido apenas para compatibilidade interna desta função.
 * 
 * @deprecated Use getCompanySettings() from modules/settings/service
 */
async function getGlobalSettings(): Promise<Record<string, string>> {
  // Importação dinâmica para evitar dependência circular
  const { getCompanySettings } = await import('@/modules/settings/service')
  const settings = await getCompanySettings()
  
  // Converter de volta para Record<string, string> (compatibilidade)
  return {
    targetMargin: String(settings.targetMargin),
    hoursPerMonth: String(settings.hoursPerMonth),
    targetUtilization: String(settings.targetUtilization),
    costPerPersonPerMonth: String(settings.costPerPersonPerMonth),
    overheadPeople: String(settings.overheadPeople),
  }
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

