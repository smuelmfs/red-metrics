/**
 * Serviço: Horas (Planejadas e Reais)
 *
 * Centraliza cálculos relacionados a horas:
 * - targetAvailableHours (capacidade planejada)
 * - utilizationRate (uso real da capacidade)
 */

import { WorkHoursPlan, WorkHoursActual, HoursCapacity } from './domain'

/**
 * Calcula horas disponíveis planejadas no mês (targetAvailableHours).
 *
 * REGRA DE NEGÓCIO (já usada em /api/planned-hours):
 *   targetAvailableHours =
 *     billableHeadcount * targetHoursPerMonth * targetUtilization
 *
 * Se algum dos campos for inválido (<= 0), retorna null para manter
 * o mesmo comportamento da API atual (não salvar valor).
 */
export function calculateTargetAvailableHours(
  plan: Partial<WorkHoursPlan> | null | undefined
): number | null {
  if (
    !plan ||
    plan.billableHeadcount == null ||
    plan.targetHoursPerMonth == null ||
    plan.targetUtilization == null
  ) {
    return null
  }

  const { billableHeadcount, targetHoursPerMonth, targetUtilization } = plan

  if (
    billableHeadcount <= 0 ||
    targetHoursPerMonth <= 0 ||
    targetUtilization <= 0
  ) {
    return null
  }

  return (
    billableHeadcount *
    targetHoursPerMonth *
    targetUtilization
  )
}

/**
 * Calcula taxa de utilização (utilizationRate) a partir de
 * horas reais e capacidade planejada.
 *
 * REGRA (já usada em calculateDepartmentResult):
 *   utilizationRate = actualBillableHours / targetAvailableHours
 *
 * Se não houver capacidade ou se for <= 0, retorna null.
 */
export function calculateUtilizationRate(
  actual: Partial<WorkHoursActual> | null | undefined,
  capacity: Partial<HoursCapacity> | null | undefined
): number | null {
  if (!actual || !capacity) return null

  const actualHours = actual.actualBillableHours
  const availableHours = capacity.targetAvailableHours

  if (
    actualHours == null ||
    availableHours == null ||
    availableHours <= 0
  ) {
    return null
  }

  return actualHours / availableHours
}


