'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { GlobalSetting } from '@prisma/client'
import Spinner from '@/components/ui/Spinner'

interface SettingsFormProps {
  initialSettings: GlobalSetting[]
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(initialSettings)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/global-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings: settings.map(s => ({
            key: s.key,
            value: s.value,
            description: s.description
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações')
      }

      addToast('Configurações atualizadas com sucesso', 'success')
    } catch (error: any) {
      addToast(error.message || 'Erro ao salvar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => 
      prev.map(s => s.key === key ? { ...s, value } : s)
    )
  }

  // Mapear nomes amigáveis para as chaves
  const settingLabels: Record<string, string> = {
    targetMargin: 'Margem Alvo',
    hoursPerMonth: 'Horas de Trabalho por Mês',
    targetUtilization: 'Utilização Faturável Média',
    costPerPersonPerMonth: 'Custo Médio por Pessoa/Mês (€)',
    overheadPeople: 'Nº Pessoas NÃO Faturáveis (Overhead)'
  }

  // Mapear tipos de input
  const getInputType = (key: string): string => {
    if (key === 'overheadPeople') return 'number'
    if (key === 'hoursPerMonth') return 'number'
    return 'text'
  }

  // Mapear step para inputs numéricos
  const getStep = (key: string): string => {
    if (key === 'targetMargin' || key === 'targetUtilization') return '0.01'
    if (key === 'costPerPersonPerMonth') return '0.01'
    return '1'
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <div className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  {settingLabels[setting.key] || setting.key}
                </label>
                {setting.description && (
                  <p className="text-xs text-gray-500 mb-2">
                    {setting.description}
                  </p>
                )}
                <input
                  type={getInputType(setting.key)}
                  step={getStep(setting.key)}
                  value={setting.value}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold text-base shadow-sm flex items-center justify-center gap-2 min-w-[200px]"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="!flex" />
              <span>Salvando...</span>
            </>
          ) : (
            'Salvar Configurações'
          )}
        </button>
      </div>
    </form>
  )
}

