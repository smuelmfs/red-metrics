/**
 * Serviço de integração com Odoo
 * Gerencia configuração e sincronização
 */

import { prisma } from '@/lib/prisma'
import { OdooClient } from './client'
import type { OdooConfig, OdooSyncResult } from './types'
import { calculateDepartmentResult } from '@/lib/business-logic/calculations'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ODOO_ENCRYPTION_KEY || 'default-key-change-in-production'
const ALGORITHM = 'aes-256-cbc'

/**
 * Criptografa uma string
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Descriptografa uma string
 */
function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Inicializa automaticamente a configuração do Odoo a partir de variáveis de ambiente
 * Se as variáveis estiverem definidas e não houver configuração salva, cria automaticamente
 */
export async function initializeOdooFromEnv() {
  const envConfig = {
    baseUrl: process.env.ODOO_BASE_URL,
    database: process.env.ODOO_DATABASE,
    username: process.env.ODOO_USERNAME,
    password: process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY,
    apiType: (process.env.ODOO_API_TYPE as 'xmlrpc' | 'jsonrpc') || 'xmlrpc',
    isEnabled: process.env.ODOO_ENABLED !== 'false'
  }

  // Só inicializar se todas as variáveis necessárias estiverem definidas
  if (!envConfig.baseUrl || !envConfig.database || !envConfig.username || !envConfig.password) {
    return null
  }

  // Verificar se já existe uma configuração
  const existing = await prisma.odooIntegration.findFirst({
    where: { isEnabled: true }
  })

  // Se já existe, atualizar com valores do ambiente (se diferentes)
  if (existing) {
    const needsUpdate = 
      existing.baseUrl !== envConfig.baseUrl ||
      existing.database !== envConfig.database ||
      existing.username !== envConfig.username

    if (needsUpdate) {
      return await upsertOdooIntegration({
        baseUrl: envConfig.baseUrl,
        database: envConfig.database,
        username: envConfig.username,
        password: envConfig.password,
        apiType: envConfig.apiType,
        isEnabled: envConfig.isEnabled
      })
    }
    return existing
  }

  // Se não existe, criar nova configuração
  return await upsertOdooIntegration({
    baseUrl: envConfig.baseUrl,
    database: envConfig.database,
    username: envConfig.username,
    password: envConfig.password,
    apiType: envConfig.apiType,
    isEnabled: envConfig.isEnabled
  })
}

/**
 * Obtém a configuração ativa do Odoo
 * Tenta inicializar automaticamente a partir de variáveis de ambiente se não houver configuração
 */
export async function getOdooIntegration() {
  // Primeiro, tentar buscar configuração existente
  let integration = await prisma.odooIntegration.findFirst({
    where: { isEnabled: true },
    include: {
      departmentMappings: {
        where: { isActive: true },
        include: {
          department: true
        }
      }
    }
  })

  // Se não houver configuração, tentar inicializar a partir de variáveis de ambiente
  if (!integration) {
    await initializeOdooFromEnv()
    // Buscar novamente após inicialização
    integration = await prisma.odooIntegration.findFirst({
      where: { isEnabled: true },
      include: {
        departmentMappings: {
          where: { isActive: true },
          include: {
            department: true
          }
        }
      }
    })
  }

  return integration
}

/**
 * Obtém todas as configurações do Odoo (incluindo desabilitadas)
 */
export async function getAllOdooIntegrations() {
  return await prisma.odooIntegration.findMany({
    include: {
      departmentMappings: {
        include: {
          department: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Cria ou atualiza a configuração do Odoo
 */
export async function upsertOdooIntegration(data: {
  baseUrl: string
  database: string
  username: string
  password: string
  apiType?: 'xmlrpc' | 'jsonrpc'
  isEnabled?: boolean
}) {
  // Criptografar senha antes de salvar
  const encryptedPassword = encrypt(data.password)

  const existing = await prisma.odooIntegration.findFirst({
    where: { isEnabled: true }
  })

  if (existing) {
    return await prisma.odooIntegration.update({
      where: { id: existing.id },
      data: {
        baseUrl: data.baseUrl,
        database: data.database,
        username: data.username,
        password: encryptedPassword,
        apiType: data.apiType || 'xmlrpc',
        isEnabled: data.isEnabled ?? true
      }
    })
  }

  return await prisma.odooIntegration.create({
    data: {
      baseUrl: data.baseUrl,
      database: data.database,
      username: data.username,
      password: encryptedPassword,
      apiType: data.apiType || 'xmlrpc',
      isEnabled: data.isEnabled ?? true
    }
  })
}

/**
 * Obtém a configuração descriptografada para uso no cliente
 */
export async function getOdooConfig(): Promise<OdooConfig | null> {
  const integration = await getOdooIntegration()
  if (!integration) return null

  return {
    baseUrl: integration.baseUrl,
    database: integration.database,
    username: integration.username,
    password: decrypt(integration.password),
    apiType: integration.apiType as 'xmlrpc' | 'jsonrpc'
  }
}

/**
 * Sincroniza horas reais do Odoo para um mês/ano específico
 * Apenas sincroniza registros a partir de 2026
 * 
 * @param month - Mês (1-12)
 * @param year - Ano (>= 2026)
 * @param billingTypes - Tipos de faturamento a filtrar (opcional). Se não especificado, busca todos os tipos faturáveis
 */
export async function syncOdooHours(
  month: number,
  year: number,
  billingTypes?: Array<'fixed_price' | 'timesheet' | 'milestone' | 'manual'>
): Promise<OdooSyncResult> {
  // Validar que o ano é >= 2026
  if (year < 2026) {
    return {
      success: false,
      syncedCount: 0,
      errors: [`Apenas anos a partir de 2026 são permitidos. Ano solicitado: ${year}`],
      lastSyncAt: new Date()
    }
  }

  const integration = await getOdooIntegration()
  
  if (!integration || !integration.isEnabled) {
    return {
      success: false,
      syncedCount: 0,
      errors: ['Integração Odoo não está habilitada'],
      lastSyncAt: new Date()
    }
  }

  // Não precisamos mais verificar mapeamentos - vamos buscar todos os departamentos do Odoo

  const config = await getOdooConfig()
  if (!config) {
    return {
      success: false,
      syncedCount: 0,
      errors: ['Erro ao obter configuração do Odoo'],
      lastSyncAt: new Date()
    }
  }

  const client = new OdooClient(config)
  const errors: string[] = []
  let syncedCount = 0

    try {
      // Buscar horas agregadas por departamento (apenas departamentos com horas no período)
      console.log(`[Odoo Sync] Buscando horas para ${month}/${year} com filtros:`, billingTypes || 'todos')
      const hoursData = await client.getAllDepartmentsHours(
        month,
        year,
        billingTypes
      )
      console.log(`[Odoo Sync] Dados recebidos do Odoo: ${hoursData.length} departamento(s) com horas registradas`)

      if (hoursData.length === 0) {
        console.log(`[Odoo Sync] Nenhum dado encontrado no Odoo para ${month}/${year}`)
      }

      // Processar apenas os departamentos que têm horas no período
      for (const hours of hoursData) {
        try {
          // Buscar departamento no RED Metrics pelo nome (ou criar se não existir)
          let department = await prisma.department.findFirst({
            where: {
              name: hours.departmentName
            }
          })

          // Se não existir, criar o departamento automaticamente
          if (!department) {
            // Gerar código único baseado no nome
            let code = hours.departmentName
              .replace(/[®©™]/g, '') // Remover símbolos especiais
              .replace(/\s+/g, '') // Remover espaços
              .substring(0, 6)
              .toUpperCase()
            
            // Se o código for muito curto ou vazio, usar um fallback
            if (code.length < 3) {
              code = hours.departmentName.substring(0, 6).toUpperCase().replace(/\s/g, '')
            }
            
            // Verificar se o código já existe e gerar um único se necessário
            let finalCode = code
            let counter = 1
            while (await prisma.department.findUnique({ where: { code: finalCode } })) {
              finalCode = `${code.substring(0, 5)}${counter}`
              counter++
              // Limite de segurança para evitar loop infinito
              if (counter > 99) {
                finalCode = `${code.substring(0, 4)}${Date.now().toString().slice(-2)}`
                break
              }
            }

            try {
              department = await prisma.department.create({
                data: {
                  name: hours.departmentName,
                  code: finalCode,
                  billableHeadcount: 1, // Valor padrão
                  targetUtilization: 0.65, // Valor padrão
                  averageHourlyRate: 50, // Valor padrão - pode ser ajustado depois
                  isActive: true
                }
              })
              console.log(`[Odoo Sync] Departamento criado: ${hours.departmentName} (código: ${finalCode})`)
            } catch (createError: any) {
              // Se ainda assim der erro (race condition), tentar buscar novamente
              if (createError.code === 'P2002') {
                department = await prisma.department.findFirst({
                  where: { name: hours.departmentName }
                })
                if (!department) {
                  throw createError
                }
              } else {
                throw createError
              }
            }
          }

          // Buscar ou criar PlannedHours
          const plannedHours = await prisma.plannedHours.upsert({
            where: {
              departmentId_month_year: {
                departmentId: department.id,
                month,
                year
              }
            },
            create: {
              departmentId: department.id,
              month,
              year,
              actualBillableHours: hours.totalHours,
              syncedFromOdoo: true,
              lastSyncedAt: new Date()
            },
            update: {
              actualBillableHours: hours.totalHours,
              syncedFromOdoo: true,
              lastSyncedAt: new Date()
            }
          })

          // Recalcular resultado do departamento
          await calculateDepartmentResult(department.id, month, year)
          syncedCount++
          console.log(`[Odoo Sync] Sincronizado: ${hours.departmentName} - ${hours.totalHours}h (${month}/${year})`)
        } catch (error: any) {
          const errorMsg = `Erro ao sincronizar ${hours.departmentName}: ${error.message}`
          errors.push(errorMsg)
          console.error(errorMsg, error)
        }
      }

      console.log(`[Odoo Sync] Total sincronizado: ${syncedCount} departamento(s)`)

    // Atualizar status da sincronização
    await prisma.odooIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: errors.length === 0 ? 'success' : 'error',
        lastSyncError: errors.length > 0 ? errors.join('; ') : null
      }
    })

    return {
      success: errors.length === 0,
      syncedCount,
      errors,
      lastSyncAt: new Date()
    }
  } catch (error: any) {
    const errorMsg = error.message || 'Erro desconhecido na sincronização'
    errors.push(errorMsg)

    await prisma.odooIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'error',
        lastSyncError: errorMsg
      }
    })

    return {
      success: false,
      syncedCount,
      errors,
      lastSyncAt: new Date()
    }
  }
}

/**
 * Cria ou atualiza mapeamento de departamento
 */
export async function upsertDepartmentMapping(data: {
  departmentId: string
  odooDepartmentId: number
  odooDepartmentName?: string
  mappingType?: string
}) {
  const integration = await getOdooIntegration()
  if (!integration) {
    throw new Error('Integração Odoo não configurada')
  }

  return await prisma.odooDepartmentMapping.upsert({
    where: { departmentId: data.departmentId },
    create: {
      odooIntegrationId: integration.id,
      departmentId: data.departmentId,
      odooDepartmentId: data.odooDepartmentId,
      odooDepartmentName: data.odooDepartmentName,
      mappingType: data.mappingType || 'id'
    },
    update: {
      odooDepartmentId: data.odooDepartmentId,
      odooDepartmentName: data.odooDepartmentName,
      mappingType: data.mappingType || 'id'
    }
  })
}

/**
 * Testa a conexão com o Odoo
 */
export async function testOdooConnection() {
  const config = await getOdooConfig()
  if (!config) {
    return {
      success: false,
      message: 'Configuração do Odoo não encontrada'
    }
  }

  const client = new OdooClient(config)
  return await client.testConnection()
}

