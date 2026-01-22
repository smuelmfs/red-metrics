'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

interface SerializedDepartment {
  id: string
  name: string
  code: string | null
  billableHeadcount: number
  costPerPersonPerMonth: number | null
  targetUtilization: number
  averageHourlyRate: number
  directCostAnnual: number | null
  billableHoursAnnual: number | null
  revenueCapacityAnnual: number | null
  overheadAllocatedAnnual: number | null
  minimumRevenueAnnual: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SerializedPlannedHours {
  id?: string
  departmentId: string
  month: number
  year: number
  billableHeadcount?: number | null
  targetHoursPerMonth?: number | null
  targetUtilization?: number | null
  targetAvailableHours?: number | null
  actualBillableHours?: number | null
  actualUtilization?: number | null
  syncedFromOdoo?: boolean
  lastSyncedAt?: string | null
  retainerRevenue?: number | null
  projectRevenue?: number | null
  totalRevenue?: number | null
  revenuePerHour?: number | null
}

interface PlannedHoursFormProps {
  department: SerializedDepartment
  month: number
  year: number
  initialData?: SerializedPlannedHours
  odooEnabled?: boolean
  hasOdooMapping?: boolean
}

export default function PlannedHoursForm({ 
  department, 
  month, 
  year, 
  initialData,
  odooEnabled = false,
  hasOdooMapping = false
}: PlannedHoursFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()
  const [formData, setFormData] = useState<{
    billableHeadcount: number | null
    targetHoursPerMonth: number | null
    targetUtilization: number | null
    targetAvailableHours: number | null
    actualBillableHours: number | null
    projectRevenue: number | null
  }>({
    billableHeadcount: initialData?.billableHeadcount ?? department.billableHeadcount,
    targetHoursPerMonth: initialData?.targetHoursPerMonth ?? 160,
    targetUtilization: initialData?.targetUtilization ?? Number(department.targetUtilization),
    targetAvailableHours: initialData?.targetAvailableHours ?? null,
    actualBillableHours: initialData?.actualBillableHours ?? null,
    projectRevenue: initialData?.projectRevenue ?? null
  })

  // Atualizar formData quando initialData, month ou year mudarem
  useEffect(() => {
    if (initialData) {
      // Há dados salvos para este mês/ano: usar os dados salvos
      setFormData({
        billableHeadcount: initialData.billableHeadcount ?? department.billableHeadcount,
        targetHoursPerMonth: initialData.targetHoursPerMonth ?? 160,
        targetUtilization: initialData.targetUtilization ?? Number(department.targetUtilization),
        targetAvailableHours: initialData.targetAvailableHours ?? null,
        actualBillableHours: initialData.actualBillableHours ?? null,
        projectRevenue: initialData.projectRevenue ?? null
      })
    } else {
      // Não há dados salvos para este mês/ano: resetar para valores padrão/vazios
      setFormData({
        billableHeadcount: department.billableHeadcount,
        targetHoursPerMonth: 160,
        targetUtilization: Number(department.targetUtilization),
        targetAvailableHours: null,
        actualBillableHours: null,
        projectRevenue: null
      })
    }
  }, [initialData, month, year, department.billableHeadcount, department.targetUtilization])

  // Verificar se houve mudanças nos dados
  const hasChanges = () => {
    if (!initialData) return false
    
    // Comparar cada campo, tratando null/undefined como equivalentes
    const normalize = (val: number | null | undefined) => val ?? null
    
    return (
      normalize(formData.billableHeadcount) !== normalize(initialData.billableHeadcount) ||
      normalize(formData.targetHoursPerMonth) !== normalize(initialData.targetHoursPerMonth) ||
      normalize(formData.targetUtilization) !== normalize(initialData.targetUtilization) ||
      normalize(formData.targetAvailableHours) !== normalize(initialData.targetAvailableHours) ||
      normalize(formData.actualBillableHours) !== normalize(initialData.actualBillableHours) ||
      normalize(formData.projectRevenue) !== normalize(initialData.projectRevenue)
    )
  }

  const hasExistingData = !!initialData
  const hasUnsavedChanges = hasChanges()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/planned-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: department.id,
          month,
          year,
          billableHeadcount: formData.billableHeadcount,
          targetHoursPerMonth: formData.targetHoursPerMonth,
          targetUtilization: formData.targetUtilization,
          // Enviar valor manual se existir, senão null para calcular automaticamente
          targetAvailableHours: formData.targetAvailableHours,
          actualBillableHours: formData.actualBillableHours,
          projectRevenue: formData.projectRevenue
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar horas planejadas')
      }

      addToast('Horas planejadas salvas com sucesso!', 'success')
      // Recarregar a página para mostrar os dados atualizados
      router.refresh()
    } catch (error) {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Calcular horas disponíveis automaticamente se não houver valor manual
  const targetAvailableHoursPreview = formData.billableHeadcount && formData.targetHoursPerMonth && formData.targetUtilization
    ? Number(formData.billableHeadcount) * Number(formData.targetHoursPerMonth) * Number(formData.targetUtilization)
    : null
  
  // Usar valor manual se existir, senão usar o calculado
  const displayAvailableHours = formData.targetAvailableHours ?? targetAvailableHoursPreview

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            HC Faturável
          </label>
          <input
            type="number"
            min="1"
            value={formData.billableHeadcount || ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, billableHeadcount: value ? parseInt(value) : null })
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Horas/Mês (padrão)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.targetHoursPerMonth || ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, targetHoursPerMonth: value ? parseFloat(value) : null })
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Utilização Alvo
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={formData.targetUtilization || ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, targetUtilization: value ? parseFloat(value) : null })
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {formData.targetUtilization && (
            <p className="text-xs text-gray-500 mt-0.5">
              {Math.round(formData.targetUtilization * 100)}%
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Horas Disponíveis (alvo)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={displayAvailableHours || ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, targetAvailableHours: value ? parseFloat(value) : null })
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            title="Calculado automaticamente: HC × Horas/Mês × Utilização (pode editar manualmente)"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Horas Reais {odooEnabled && hasOdooMapping && initialData?.syncedFromOdoo && (
              <span className="text-green-600 text-xs">(Sincronizado do Odoo)</span>
            )}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.actualBillableHours || ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, actualBillableHours: value ? parseFloat(value) : null })
            }}
            disabled={odooEnabled && hasOdooMapping && initialData?.syncedFromOdoo}
            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 ${
              odooEnabled && hasOdooMapping && initialData?.syncedFromOdoo
                ? 'bg-gray-100 cursor-not-allowed'
                : ''
            }`}
            placeholder={initialData?.syncedFromOdoo ? "Horas do Odoo" : "Digite as horas reais"}
          />
          {odooEnabled && hasOdooMapping && initialData?.syncedFromOdoo && initialData?.lastSyncedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Última sincronização: {new Date(initialData.lastSyncedAt).toLocaleString('pt-BR')}
            </p>
          )}
          {!initialData?.syncedFromOdoo && (
            <p className="text-xs text-gray-500 mt-1">
              {odooEnabled 
                ? "Campo editável manualmente. Use a sincronização do Odoo para preencher automaticamente."
                : "Campo editável manualmente."}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Receita Projetos (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.projectRevenue || ''}
            onChange={(e) => {
              const value = e.target.value
              setFormData({ ...formData, projectRevenue: value ? parseFloat(value) : null })
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="!flex" />
                <span>Salvando...</span>
              </>
            ) : (
              hasExistingData && hasUnsavedChanges ? 'Salvar Alterações' : 'Salvar'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

