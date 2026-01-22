/**
 * Cliente Odoo para comunicação via XML-RPC
 */

import xmlrpc from 'xmlrpc'
import type { OdooConfig, OdooDepartment, OdooTimesheetLine, OdooHoursData } from './types'

export class OdooClient {
  private config: OdooConfig
  private uid: number | null = null
  private models: any = null

  constructor(config: OdooConfig) {
    this.config = config
  }

  /**
   * Normaliza a URL do Odoo
   */
  private normalizeUrl(url: string): { host: string; port: number; protocol: string } {
    // Garantir que a URL tenha protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    // Remover barra final se houver
    url = url.replace(/\/$/, '')

    try {
      const urlObj = new URL(url)
      return {
        host: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === 'https:' ? 443 : 80),
        protocol: urlObj.protocol
      }
    } catch (error) {
      throw new Error(`URL inválida: ${url}. Use o formato: https://odoo.example.com`)
    }
  }

  /**
   * Autentica no Odoo e retorna o UID
   */
  async authenticate(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const { host, port, protocol } = this.normalizeUrl(this.config.baseUrl)
        const isSecure = protocol === 'https:'

        // Para HTTPS, usar createSecureClient, para HTTP usar createClient
        const client = isSecure
          ? xmlrpc.createSecureClient({
              host: host,
              port: port,
              path: '/xmlrpc/2/common',
              basic_auth: {
                user: this.config.username,
                pass: this.config.password
              }
            })
          : xmlrpc.createClient({
              host: host,
              port: port,
              path: '/xmlrpc/2/common',
              basic_auth: {
                user: this.config.username,
                pass: this.config.password
              }
            })

        client.methodCall('authenticate', [
          this.config.database,
          this.config.username,
          this.config.password,
          {}
        ], (error: any, uid: number) => {
          if (error) {
            // Melhorar mensagem de erro
            let errorMsg = error.message || String(error)
            if (errorMsg.includes('unknown xml-rpc tag') || errorMsg.includes('title') || errorMsg.includes('TITLE')) {
              errorMsg = `O servidor retornou HTML em vez de XML-RPC. Verifique:
- A URL está correta? (ex: https://odoo.example.com)
- O endpoint XML-RPC está acessível? (${this.config.baseUrl}/xmlrpc/2/common)
- O servidor não está redirecionando para uma página de login?
- A URL não precisa de barra final`
            } else if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ENOTFOUND')) {
              errorMsg = `Não foi possível conectar ao servidor Odoo. Verifique se a URL está correta: ${this.config.baseUrl}`
            }
            reject(new Error(`Erro de autenticação Odoo: ${errorMsg}`))
            return
          }
          if (!uid) {
            reject(new Error('Credenciais inválidas. Verifique usuário, senha e nome do banco de dados.'))
            return
          }
          this.uid = uid
          resolve(uid)
        })
      } catch (error: any) {
        reject(new Error(`Erro ao criar cliente XML-RPC: ${error.message || error}`))
      }
    })
  }

  /**
   * Obtém o cliente de modelos
   */
  private getModelsClient() {
    if (!this.models) {
      const { host, port, protocol } = this.normalizeUrl(this.config.baseUrl)
      const isSecure = protocol === 'https:'

      // Para HTTPS, usar createSecureClient, para HTTP usar createClient
      this.models = isSecure
        ? xmlrpc.createSecureClient({
            host: host,
            port: port,
            path: '/xmlrpc/2/object',
            basic_auth: {
              user: this.config.username,
              pass: this.config.password
            }
          })
        : xmlrpc.createClient({
            host: host,
            port: port,
            path: '/xmlrpc/2/object',
            basic_auth: {
              user: this.config.username,
              pass: this.config.password
            }
          })
    }
    return this.models
  }

  /**
   * Busca departamentos no Odoo
   */
  async getDepartments(): Promise<OdooDepartment[]> {
    if (!this.uid) {
      await this.authenticate()
    }

    return new Promise((resolve, reject) => {
      const models = this.getModelsClient()

      // Sintaxe correta do execute_kw para search_read:
      // execute_kw(model, method, args, kwargs)
      // search_read(domain, fields, offset=0, limit=None, order=None)
      // args = [domain, fields] (posicionais)
      // kwargs = {offset: 0, limit: None, order: 'name'} (nomeados)
      models.methodCall('execute_kw', [
        this.config.database,
        this.uid!,
        this.config.password,
        'hr.department',
        'search_read',
        [
          [], // domain (filtros)
          ['id', 'name'] // fields (lista de campos)
        ],
        {
          order: 'name',
          limit: 0 // 0 = sem limite
        }
      ], (error: any, departments: any[]) => {
        if (error) {
          reject(new Error(`Erro ao buscar departamentos: ${error.message || error}`))
          return
        }
        resolve(departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          code: dept.code || undefined // code pode não existir, mas tentamos pegar se houver
        })))
      })
    })
  }

  /**
   * Busca horas faturáveis agregadas por departamento em um mês/ano usando read_group
   * Apenas busca registros a partir de 2026
   * 
   * @param month - Mês (1-12)
   * @param year - Ano (>= 2026)
   * @param billingTypes - Tipos de faturamento a filtrar. Se não especificado, busca todos os tipos faturáveis
   */
  async getAllDepartmentsHours(
    month: number,
    year: number,
    billingTypes?: Array<'fixed_price' | 'timesheet' | 'milestone' | 'manual'>
  ): Promise<OdooHoursData[]> {
    // Validar que o ano é >= 2026
    if (year < 2026) {
      throw new Error(`Apenas anos a partir de 2026 são permitidos. Ano solicitado: ${year}`)
    }

    if (!this.uid) {
      await this.authenticate()
    }

    // Calcular datas de início e fim do mês
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // Construir filtros base
    const filters: any[] = [
      ['date', '>=', startDate],
      ['date', '<=', endDate]
    ]

    // Se temos filtros de billing type, adicionar filtro por timesheet_invoice_type
    // Os tipos de faturamento já garantem que são horas faturáveis
    if (billingTypes && billingTypes.length > 0) {
      // Mapear os tipos para valores do Odoo
      const odooBillingValues: string[] = []
      
      billingTypes.forEach(type => {
        switch (type) {
          case 'timesheet':
            odooBillingValues.push('billable_time')
            break
          case 'fixed_price':
            odooBillingValues.push('billable_fixed')
            break
          case 'milestone':
            odooBillingValues.push('billable_milestones')
            break
          case 'manual':
            odooBillingValues.push('billable_manual')
            break
        }
      })

      // Construir filtro OR para os tipos de faturamento
      // Usar operador 'in' quando possível, ou construir OR corretamente
      if (odooBillingValues.length === 1) {
        filters.push(['timesheet_invoice_type', '=', odooBillingValues[0]])
      } else if (odooBillingValues.length === 2) {
        // Para 2 condições: ['|', cond1, cond2]
        filters.push([
          '|',
          ['timesheet_invoice_type', '=', odooBillingValues[0]],
          ['timesheet_invoice_type', '=', odooBillingValues[1]]
        ])
      } else {
        // Para 3+ condições, usar operador 'in' que é mais simples e eficiente
        filters.push(['timesheet_invoice_type', 'in', odooBillingValues])
      }
    }

    return new Promise((resolve, reject) => {
      const models = this.getModelsClient()

      // Usar read_group para agregar horas por departamento
      // Sintaxe: read_group(domain, fields, groupby, offset=0, limit=None, orderby=None)
      // No execute_kw: args = [domain, fields, groupby], kwargs = {offset, limit, orderby}
      // O read_group retorna: {groups: [...], length: N}
      models.methodCall('execute_kw', [
        this.config.database,
        this.uid!,
        this.config.password,
        'account.analytic.line',
        'read_group',
        [
          filters, // domain
          ['unit_amount:sum'], // fields (agregações) - soma de unit_amount
          ['department_id'] // groupby - agrupar por departamento
        ],
        {
          offset: 0,
          limit: 0, // 0 = sem limite
          orderby: 'department_id' // ordenar por departamento
        }
      ], (error: any, result: any) => {
        if (error) {
          reject(new Error(`Erro ao buscar horas: ${error.message || error}`))
          return
        }

        console.log(`[Odoo Client] Resultado do read_group:`, JSON.stringify(result, null, 2))

        // Processar resultados agrupados
        const hoursData: OdooHoursData[] = []
        
        // O read_group retorna um objeto com 'groups' e 'length'
        // Cada grupo tem: department_id (pode ser [id, nome] ou false), unit_amount (soma), department_id_count
        let groups: any[] = []
        if (result && Array.isArray(result)) {
          // Se for array direto (formato antigo)
          groups = result
        } else if (result && result.groups && Array.isArray(result.groups)) {
          // Formato padrão: {groups: [...], length: N}
          groups = result.groups
        } else if (result && typeof result === 'object') {
          // Tentar acessar como objeto
          groups = result.groups || []
        }
        
        console.log(`[Odoo Client] Processando ${groups.length} grupos`)
        console.log(`[Odoo Client] Filtros aplicados:`, JSON.stringify(filters, null, 2))
        console.log(`[Odoo Client] Tipos de faturamento solicitados:`, billingTypes)
        
        // Log detalhado de cada grupo recebido
        console.log(`[Odoo Client] Grupos recebidos do Odoo:`, groups.map((g: any) => ({
          department_id: g.department_id,
          department_id_count: g.department_id_count,
          unit_amount: g.unit_amount
        })))
        
        for (const group of groups) {
            // Ignorar grupos sem departamento (department_id = false ou null)
            if (!group.department_id || group.department_id === false || group.department_id === null) {
              console.log(`[Odoo Client] Ignorando grupo sem departamento:`, group)
              continue
            }

            // department_id vem como [id, nome] ou false
            const deptId = Array.isArray(group.department_id) ? group.department_id[0] : group.department_id
            const deptName = Array.isArray(group.department_id) ? group.department_id[1] : `Departamento ${deptId}`
            
            // unit_amount já vem como soma agregada do read_group (unit_amount:sum)
            // Pode vir como número ou como objeto com a soma
            let totalHours = 0
            if (typeof group.unit_amount === 'number') {
              totalHours = group.unit_amount
            } else if (group.unit_amount && typeof group.unit_amount === 'object') {
              // Se vier como objeto, tentar extrair o valor
              totalHours = group.unit_amount.sum || group.unit_amount || 0
            }

            console.log(`[Odoo Client] Departamento: ${deptName} (ID: ${deptId}) - ${totalHours}h (count: ${group.department_id_count || 'N/A'})`)

            // IMPORTANTE: Incluir apenas departamentos com horas > 0
            // Isso evita criar departamentos baseados em registros antigos ou sem horas
            if (totalHours > 0) {
              hoursData.push({
                departmentId: deptId,
                departmentName: deptName,
                month,
                year,
                totalHours: totalHours,
                billingType: billingTypes && billingTypes.length === 1 ? billingTypes[0] : undefined
              })
            } else {
              console.log(`[Odoo Client] Ignorando departamento ${deptName} (ID: ${deptId}) - sem horas no período`)
            }
        }

        if (groups.length === 0) {
          console.log(`[Odoo Client] Nenhum grupo encontrado no resultado`)
        }

        console.log(`[Odoo Client] Total de departamentos com horas: ${hoursData.length}`)
        resolve(hoursData)
      })
    })
  }



  /**
   * Testa a conexão com o Odoo
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const uid = await this.authenticate()
      const departments = await this.getDepartments()
      return {
        success: true,
        message: `Conexão bem-sucedida! Autenticado como UID ${uid}. ${departments.length} departamentos encontrados.`
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro desconhecido ao conectar com Odoo'
      }
    }
  }
}


