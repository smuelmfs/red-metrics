'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
import { RefreshCw } from 'lucide-react'

interface OdooConfig {
  id?: string
  isEnabled: boolean
  baseUrl: string
  database: string
  username: string
  apiType: string
  lastSyncAt?: string
  lastSyncStatus?: string
  lastSyncError?: string
  departmentMappings?: Array<{
    id: string
    departmentId: string
    departmentName: string
    odooDepartmentId: number
    odooDepartmentName?: string
  }>
}


export default function OdooIntegrationPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<OdooConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'sync' | 'synced'>('sync')
  const [syncing, setSyncing] = useState(false)
  const [syncedData, setSyncedData] = useState<any>(null)
  const [loadingSyncedData, setLoadingSyncedData] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/odoo/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }




  const loadSyncedData = async () => {
    setLoadingSyncedData(true)
    try {
      const response = await fetch('/api/odoo/synced-data')
      if (response.ok) {
        const data = await response.json()
        console.log('[Odoo] Dados sincronizados recebidos:', data)
        setSyncedData(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('[Odoo] Erro ao carregar dados:', errorData)
        throw new Error(errorData.error || 'Erro ao carregar dados sincronizados')
      }
    } catch (error: any) {
      console.error('[Odoo] Erro ao carregar dados sincronizados:', error)
      addToast(error.message || 'Erro ao carregar dados sincronizados', 'error')
    } finally {
      setLoadingSyncedData(false)
    }
  }

  const handleSync = async (month: number, year: number, billingTypes?: string[]) => {
    setSyncing(true)
    try {
      const response = await fetch('/api/odoo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, billingTypes })
      })

      const result = await response.json()

      if (result.success) {
        addToast(
          `Sincronização concluída! ${result.syncedCount} departamento(s) atualizado(s).`,
          'success'
        )
        await loadConfig()
        // Recarregar dados sincronizados se estiver na aba
        if (activeTab === 'synced') {
          await loadSyncedData()
        }
      } else {
        addToast(
          `Sincronização com erros: ${result.errors.join(', ')}`,
          'error'
        )
      }
    } catch (error: any) {
      addToast('Erro ao sincronizar', 'error')
    } finally {
      setSyncing(false)
    }
  }

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Integração Odoo</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
          Sincronize horas reais do Odoo automaticamente. Configure as credenciais no arquivo <code className="bg-gray-100 px-1 rounded">.env</code>
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sync'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <RefreshCw className="inline w-4 h-4 mr-2" />
            Sincronização
          </button>
          <button
            onClick={() => {
              setActiveTab('synced')
              loadSyncedData()
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'synced'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <RefreshCw className="inline w-4 h-4 mr-2" />
            Dados Sincronizados
          </button>
        </nav>
      </div>

      {/* Info sobre configuração */}
      {!config?.isEnabled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Configuração do Odoo não encontrada:</strong> Configure as credenciais no arquivo <code className="bg-yellow-100 px-1 rounded">.env</code> usando as variáveis:
            <br />
            <code className="block mt-2 text-xs bg-gray-100 p-2 rounded">
              ODOO_BASE_URL, ODOO_DATABASE, ODOO_USERNAME, ODOO_API_KEY
            </code>
          </p>
        </div>
      )}

      {config?.isEnabled && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✓ Integração Odoo configurada:</strong> As credenciais estão configuradas via variáveis de ambiente e serão usadas automaticamente.
            {config.lastSyncAt && (
              <span className="block mt-1">
                Última sincronização: {new Date(config.lastSyncAt).toLocaleString('pt-BR')}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Sync Tab */}
      {activeTab === 'sync' && (
        <OdooSyncTab
          config={config}
          syncing={syncing}
          onSync={handleSync}
        />
      )}

      {/* Synced Data Tab */}
      {activeTab === 'synced' && (
        <OdooSyncedDataTab
          syncedData={syncedData}
          loading={loadingSyncedData}
          onRefresh={loadSyncedData}
          onMount={loadSyncedData}
        />
      )}
    </div>
  )
}

// Componente para a aba de sincronização
function OdooSyncTab({
  config,
  syncing,
  onSync
}: {
  config: OdooConfig | null
  syncing: boolean
  onSync: (month: number, year: number, billingTypes?: string[]) => void
}) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(Math.max(2026, new Date().getFullYear())) // Garantir que começa em 2026
  // Sempre usar todos os tipos de faturamento
  const billingTypes = ['fixed_price', 'timesheet', 'milestone', 'manual']

  if (!config?.isEnabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Configure e habilite a integração Odoo primeiro na aba "Configuração"
        </p>
      </div>
    )
  }

  // Não precisamos mais verificar mapeamentos - os departamentos serão buscados automaticamente do Odoo

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h2 className="text-lg font-semibold mb-4">Sincronizar Horas do Odoo</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mês
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ano (apenas a partir de 2026)
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2026"
            max="2100"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Apenas registros a partir de 2026 serão sincronizados
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">
            Tipos de Faturamento Incluídos:
          </p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Billed at a fixed price</li>
            <li>Billed on Timesheets</li>
            <li>Billed on Milestones</li>
            <li>Billed Manually</li>
          </ul>
          <p className="text-xs text-blue-700 mt-2">
            A sincronização buscará a <strong>soma total</strong> de horas de todos os tipos de faturamento acima.
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Como funciona:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-1 list-disc list-inside space-y-1">
            <li>A sincronização busca automaticamente todos os departamentos do Odoo</li>
            <li>Departamentos que não existem no sistema serão criados automaticamente</li>
            <li>As horas faturáveis serão atualizadas nos registros de "Horas Reais"</li>
            <li>A busca inclui <strong>todos</strong> os tipos de faturamento e retorna a <strong>soma total</strong> de horas</li>
          </ul>
        </div>

        <button
          onClick={() => onSync(month, year, billingTypes)}
          disabled={syncing}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {syncing ? (
            <>
              <Spinner size="sm" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sincronizar Horas
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Componente para a aba de dados sincronizados
function OdooSyncedDataTab({
  syncedData,
  loading,
  onRefresh,
  onMount
}: {
  syncedData: any
  loading: boolean
  onRefresh: () => void
  onMount: () => void
}) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Carregar dados quando o componente é montado
  useEffect(() => {
    if (!syncedData && !loading) {
      onMount()
    }
  }, [syncedData, loading, onMount])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!syncedData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Dados Sincronizados do Odoo</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
        <p className="text-gray-600">Nenhum dado sincronizado encontrado.</p>
      </div>
    )
  }

  const { data, stats } = syncedData

  // Agrupar por departamento
  const byDepartment = data.reduce((acc: any, item: any) => {
    if (!acc[item.departmentId]) {
      acc[item.departmentId] = {
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        departmentCode: item.departmentCode,
        records: []
      }
    }
    acc[item.departmentId].records.push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Departamentos</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalDepartments}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Registros</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalRecords}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Total de Horas</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalHours.toFixed(2)}h
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Última Sincronização</p>
            <p className="text-sm font-semibold text-orange-600">
              {stats.lastSyncDate
                ? new Date(stats.lastSyncDate).toLocaleString('pt-BR')
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de dados */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Departamentos e Horas Sincronizados</h2>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {Object.keys(byDepartment).length === 0 ? (
          <p className="text-gray-600">Nenhum dado sincronizado encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês/Ano
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Sincronizadas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Sincronização
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(byDepartment).map((dept: any) =>
                  dept.records.map((record: any, idx: number) => (
                    <tr key={`${record.departmentId}-${record.month}-${record.year}`}>
                      {idx === 0 && (
                        <td
                          rowSpan={dept.records.length}
                          className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {dept.departmentName}
                          {dept.departmentCode && (
                            <span className="text-gray-500 ml-2">({dept.departmentCode})</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {months[record.month - 1]} {record.year}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {record.actualBillableHours.toFixed(2)}h
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {record.lastSyncedAt
                          ? new Date(record.lastSyncedAt).toLocaleString('pt-BR')
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

