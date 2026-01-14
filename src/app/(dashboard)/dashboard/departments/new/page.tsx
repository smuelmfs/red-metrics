'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

export default function NewDepartmentPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    billableHeadcount: 4,
    costPerPersonPerMonth: 2200,
    targetUtilization: 0.65,
    averageHourlyRate: 45
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar departamento')
      }

      addToast('Departamento criado com sucesso!', 'success')
      router.push('/dashboard/departments')
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar departamento'
      setError(errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Novo Departamento</h1>
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
              placeholder="Ex: Branding & Design"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: DESIGN"
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
                onChange={(e) => setFormData({ ...formData, billableHeadcount: parseInt(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, averageHourlyRate: parseFloat(e.target.value) || 0 })}
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
                value={formData.costPerPersonPerMonth}
                onChange={(e) => setFormData({ ...formData, costPerPersonPerMonth: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, targetUtilization: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(formData.targetUtilization * 100)}% de utilização
              </p>
            </div>
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
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold text-base shadow-sm flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="!flex" />
                  <span>Salvando...</span>
                </>
              ) : (
                'Criar Departamento'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

