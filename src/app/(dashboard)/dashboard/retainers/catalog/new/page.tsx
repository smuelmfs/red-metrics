'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

interface Department {
  id: string
  name: string
}

export default function NewRetainerCatalogPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    monthlyPrice: 0,
    hoursPerMonth: 0,
    internalHourlyCost: null as number | null,
    baseHours: null as number | null,
    basePrice: null as number | null
  })

  useEffect(() => {
    fetch('/api/departments?activeOnly=true')
      .then(res => res.json())
      .then(data => setDepartments(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/retainer-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar item do catálogo')
      }

      addToast('Item do catálogo criado com sucesso!', 'success')
      router.push('/dashboard/retainers/catalog')
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar item do catálogo'
      setError(errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Preview de cálculos (apenas visualização - não são regras de negócio)
  // Os cálculos reais são feitos no backend quando necessário
  const monthlyCost = formData.internalHourlyCost && formData.hoursPerMonth
    ? formData.internalHourlyCost * formData.hoursPerMonth
    : null
  const monthlyMargin = monthlyCost !== null
    ? formData.monthlyPrice - monthlyCost
    : null
  const marginPercentage = monthlyMargin !== null && formData.monthlyPrice > 0
    ? (monthlyMargin / formData.monthlyPrice) * 100
    : null

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
          <Link
            href="/dashboard/retainers/catalog"
            className="text-red-600 hover:text-red-800 mb-4 inline-block transition-colors"
          >
            ← Voltar para Catálogo
          </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Novo Item do Catálogo</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Departamento *
            </label>
            <select
              id="departmentId"
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Selecione um departamento</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Avença *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Social Media - Premium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Preço Mensal (€) *
              </label>
              <input
                type="number"
                id="monthlyPrice"
                required
                min="0"
                step="0.01"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="hoursPerMonth" className="block text-sm font-medium text-gray-700 mb-2">
                Horas por Mês *
              </label>
              <input
                type="number"
                id="hoursPerMonth"
                required
                min="0"
                step="0.1"
                value={formData.hoursPerMonth}
                onChange={(e) => setFormData({ ...formData, hoursPerMonth: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="internalHourlyCost" className="block text-sm font-medium text-gray-700 mb-2">
                Custo Interno por Hora (€)
              </label>
              <input
                type="number"
                id="internalHourlyCost"
                min="0"
                step="0.01"
                value={formData.internalHourlyCost || ''}
                onChange={(e) => setFormData({ ...formData, internalHourlyCost: parseFloat(e.target.value) || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo Mensal (calculado)
              </label>
              <input
                type="text"
                value={monthlyCost !== null ? `€${monthlyCost.toFixed(2)}` : 'Preencha custo/hora'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {monthlyMargin !== null && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem Mensal
                </label>
                <input
                  type="text"
                  value={`€${monthlyMargin.toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % Margem
                </label>
                <input
                  type="text"
                  value={marginPercentage !== null ? `${marginPercentage.toFixed(1)}%` : '-'}
                  disabled
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white font-medium ${
                    marginPercentage !== null && marginPercentage >= 30
                      ? 'text-green-600'
                      : marginPercentage !== null && marginPercentage >= 20
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/retainers/catalog"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold text-base shadow-sm flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="!flex" />
                  <span>Salvando...</span>
                </>
              ) : (
                'Criar Item'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

