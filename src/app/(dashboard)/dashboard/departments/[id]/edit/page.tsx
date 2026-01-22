'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

interface Department {
  id: string
  name: string
  code: string | null
  billableHeadcount: number
  costPerPersonPerMonth: number | null
  targetUtilization: number
  averageHourlyRate: number
  isActive: boolean
}

export default function EditDepartmentPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const departmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Department | null>(null)

  useEffect(() => {
    fetch(`/api/departments/${departmentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setFormData(data)
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Erro ao carregar departamento')
        setLoading(false)
      })
  }, [departmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          billableHeadcount: formData.billableHeadcount,
          costPerPersonPerMonth: formData.costPerPersonPerMonth,
          targetUtilization: formData.targetUtilization,
          averageHourlyRate: formData.averageHourlyRate,
          isActive: formData.isActive
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar departamento')
      }

      addToast('Departamento atualizado com sucesso!', 'success')
      router.push('/dashboard/departments')
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar departamento'
      setError(errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <p className="text-red-600">Departamento não encontrado</p>
        <Link href="/dashboard/departments" className="text-red-600 hover:text-red-800 mt-4 inline-block transition-colors">
          ← Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
          <Link
            href="/dashboard/departments"
            className="text-red-600 hover:text-red-800 mb-4 inline-block transition-colors"
          >
            ← Voltar para Departamentos
          </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Departamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Departamento *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código
            </label>
            <input
              type="text"
              id="code"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="billableHeadcount" className="block text-sm font-medium text-gray-700 mb-2">
                HC Faturável (pessoas) *
              </label>
              <input
                type="number"
                id="billableHeadcount"
                required
                min="1"
                value={formData.billableHeadcount}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, billableHeadcount: value ? parseInt(value, 10) : formData.billableHeadcount })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="averageHourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                Taxa Média (€/h) *
              </label>
              <input
                type="number"
                id="averageHourlyRate"
                required
                min="0"
                step="0.01"
                value={formData.averageHourlyRate}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, averageHourlyRate: value ? parseFloat(value) : formData.averageHourlyRate })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="costPerPersonPerMonth" className="block text-sm font-medium text-gray-700 mb-2">
                Custo por Pessoa/Mês (€)
              </label>
              <input
                type="number"
                id="costPerPersonPerMonth"
                min="0"
                step="0.01"
                value={formData.costPerPersonPerMonth ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, costPerPersonPerMonth: value ? parseFloat(value) : null })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="targetUtilization" className="block text-sm font-medium text-gray-700 mb-2">
                Utilização Faturável Alvo (0-1)
              </label>
              <input
                type="number"
                id="targetUtilization"
                min="0"
                max="1"
                step="0.01"
                value={formData.targetUtilization}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, targetUtilization: value ? parseFloat(value) : formData.targetUtilization })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(formData.targetUtilization * 100)}% de utilização
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Departamento ativo</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/departments"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold text-base shadow-sm flex items-center justify-center gap-2 min-w-[160px]"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="!flex" />
                  <span>Salvando...</span>
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

