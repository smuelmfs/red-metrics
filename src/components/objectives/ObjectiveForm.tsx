'use client'

import { useState } from 'react'
import { Department, Objective } from '@prisma/client'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

interface ObjectiveFormProps {
  department: Department
  month: number
  year: number
  initialData?: Objective
}

export default function ObjectiveForm({ department, month, year, initialData }: ObjectiveFormProps) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const [targetValue, setTargetValue] = useState(
    initialData ? Number(initialData.targetValue) : Number(department.minimumRevenueAnnual) / 12 || 0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: department.id,
          month,
          year,
          targetValue
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar objetivo')
      }

      addToast('Objetivo salvo com sucesso!', 'success')
    } catch (error) {
      addToast('Erro ao salvar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
          {department.minimumRevenueAnnual && (
            <p className="text-xs text-gray-500 mt-1">
              Objetivo anual: €{Number(department.minimumRevenueAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {' '} | {' '}
              Média mensal: €{(Number(department.minimumRevenueAnnual) / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Objetivo Mínimo Mensal (€)
            </label>
            <span className="text-sm font-semibold text-gray-600">
              €{targetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={targetValue}
            onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-base shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="!flex" />
                <span>Salvando...</span>
              </>
            ) : (
              'Salvar Objetivo'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

