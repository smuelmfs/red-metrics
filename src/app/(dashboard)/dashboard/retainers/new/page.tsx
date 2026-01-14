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

export default function NewRetainerPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState({
    departmentId: '',
    name: '',
    type: '',
    monthlyPrice: 0,
    quantity: 1,
    hoursPerMonth: null as number | null,
    variableCostPerMonth: null as number | null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null as string | null,
    notes: ''
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
      const response = await fetch('/api/retainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: formData.endDate ? new Date(formData.endDate) : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar avença')
      }

      addToast('Avença criada com sucesso!', 'success')
      router.push('/dashboard/retainers')
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar avença'
      setError(errorMessage)
      addToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const monthlyRevenue = formData.monthlyPrice * formData.quantity

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
          <Link
            href="/dashboard/retainers"
            className="text-red-600 hover:text-red-800 mb-4 inline-block transition-colors"
          >
            ← Voltar para Avenças
          </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Nova Avença</h1>
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
              Nome do Cliente/Projeto *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: Cliente ABC - Social Media"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Avença
              </label>
              <input
                type="text"
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Social Media - Premium"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receita Mensal Total
              </label>
              <input
                type="text"
                value={`€${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
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
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Observações sobre esta avença..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/retainers"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold text-base shadow-sm flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="!flex" />
                  <span>Salvando...</span>
                </>
              ) : (
                'Criar Avença'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

