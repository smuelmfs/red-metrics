/**
 * Serviço: Configurações Globais da Empresa
 * 
 * Centraliza acesso e parsing de GlobalSetting.
 * Todas as regras de negócio relacionadas a configurações
 * devem passar por aqui.
 */

import { prisma } from '@/lib/prisma'
import { CompanySettings, DEFAULT_SETTINGS, SETTING_KEYS } from './domain'

/**
 * Busca e parseia todas as configurações globais
 * 
 * Retorna um objeto tipado com valores numéricos já convertidos.
 * Se uma configuração não existir, usa o valor padrão.
 * 
 * @returns Configurações globais tipadas
 */
export async function getCompanySettings(): Promise<CompanySettings> {
  const settings = await prisma.globalSetting.findMany()
  
  // Converter array de {key, value} para Record<string, string>
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)

  // Parsear e tipar, usando defaults quando necessário
  return {
    targetMargin: parseFloat(settingsMap[SETTING_KEYS.TARGET_MARGIN] || String(DEFAULT_SETTINGS.targetMargin)),
    hoursPerMonth: parseFloat(settingsMap[SETTING_KEYS.HOURS_PER_MONTH] || String(DEFAULT_SETTINGS.hoursPerMonth)),
    targetUtilization: parseFloat(settingsMap[SETTING_KEYS.TARGET_UTILIZATION] || String(DEFAULT_SETTINGS.targetUtilization)),
    costPerPersonPerMonth: parseFloat(settingsMap[SETTING_KEYS.COST_PER_PERSON_PER_MONTH] || String(DEFAULT_SETTINGS.costPerPersonPerMonth)),
    overheadPeople: parseInt(settingsMap[SETTING_KEYS.OVERHEAD_PEOPLE] || String(DEFAULT_SETTINGS.overheadPeople), 10),
  }
}

/**
 * Busca uma configuração específica como string (raw)
 * 
 * Útil para casos onde precisamos do valor original
 * antes de parsear.
 * 
 * @param key - Chave da configuração
 * @returns Valor como string ou null se não existir
 */
export async function getSettingValue(key: string): Promise<string | null> {
  const setting = await prisma.globalSetting.findUnique({
    where: { key }
  })
  return setting?.value || null
}

