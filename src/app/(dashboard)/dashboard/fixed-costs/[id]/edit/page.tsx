'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

const categories = ['Aluguel', 'Utilidades', 'Software', 'Viaturas', 'Outros'] as const

interface FixedCost {
  id: string
  name: string
  category: string
  monthlyAmount: number
  description: string | null
  isActive: boolean
  startDate: string
  endDate: string | null
}

export default function EditFixedCostPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const fixedCostId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FixedCost | null>(null)

  useEffect(() => {
    fetch(`/api/fixed-costs/${fixedCostId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setFormData({
            ...data,
            startDate: new Date(data.startDate).toISOString().split('T')[0],
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : null,
          })
        }
        setLoading(false)
      })
      .catch(err => {
        setError('Erro ao carregar custo fixo')
        setLoading(false)
      })
  }, [fixedCostId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/fixed-costs/${fixedCostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        // Se tiver detalhes de validação, incluir na mensagem
        if (data.details) {
          throw { message: data.error, details: data.details }
        }
        throw new Error(data.error || 'Erro ao atualizar custo fixo')
      }

      addToast('Custo fixo atualizado com sucesso!', 'success')
      router.push('/dashboard/fixed-costs')
      router.refresh()
    } catch (err: any) {
      let errorMessage = 'Erro ao atualizar custo fixo'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.details && Array.isArray(err.details)) {
        // Se for erro de validação Zod, mostrar detalhes
        const validationErrors = err.details.map((e: any) => {
          const field = e.path.join('.')
          return `${field}: ${e.message}`
        }).join(', ')
        errorMessage = `Erro de validação: ${validationErrors}`
      }
      
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
        <p className="text-red-600">Custo fixo não encontrado</p>
        <Link href="/dashboard/fixed-costs" className="text-red-600 hover:text-red-800 mt-4 inline-block transition-colors">
          ← Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/fixed-costs"
          className="text-red-600 hover:text-red-800 mb-4 inline-block transition-colors"
        >
          ← Voltar para Gastos da Empresa
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Editar Custo Fixo</h1>
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
              Nome do Custo *
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="monthlyAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Valor Mensal (€) *
            </label>
            <input
              type="number"
              id="monthlyAmount"
              required
              min="0"
              step="0.01"
              value={formData.monthlyAmount}
              onChange={(e) => setFormData({ ...formData, monthlyAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Valor Anual: €{(formData.monthlyAmount * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                id="startDate"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Término (opcional)
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Custo ativo</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/fixed-costs"
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

