'use client'

import { useState } from 'react'
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
}

export default function PlannedHoursForm({ department, month, year, initialData }: PlannedHoursFormProps) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const [formData, setFormData] = useState<{
    billableHeadcount: number | null
    targetHoursPerMonth: number | null
    targetUtilization: number | null
    actualBillableHours: number | null
    projectRevenue: number | null
  }>({
    billableHeadcount: initialData?.billableHeadcount ? Number(initialData.billableHeadcount) : department.billableHeadcount,
    targetHoursPerMonth: initialData?.targetHoursPerMonth ? Number(initialData.targetHoursPerMonth) : 160,
    targetUtilization: initialData?.targetUtilization ? Number(initialData.targetUtilization) : Number(department.targetUtilization),
    actualBillableHours: initialData?.actualBillableHours ? Number(initialData.actualBillableHours) : null,
    projectRevenue: initialData?.projectRevenue ? Number(initialData.projectRevenue) : null
  })

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
          ...formData
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar horas planejadas')
      }

      addToast('Horas planejadas salvas com sucesso!', 'success')
    } catch (error) {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Preview da capacidade (apenas visualização - cálculo real é feito no backend via módulo hours)
  const targetAvailableHoursPreview = formData.billableHeadcount && formData.targetHoursPerMonth && formData.targetUtilization
    ? Number(formData.billableHeadcount) * Number(formData.targetHoursPerMonth) * Number(formData.targetUtilization)
    : null

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
            type="text"
            value={targetAvailableHoursPreview ? Math.round(targetAvailableHoursPreview) : 'Calculado automaticamente'}
            disabled
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600"
            title="Preview - cálculo real é feito no backend via módulo hours"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Horas Reais (Odoo)
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
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Horas do Odoo"
          />
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
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

