'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

interface FixedCost {
  id: string
  name: string
  category: string
  monthlyAmount: number
  description: string | null
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
}

interface FixedCostsListProps {
  fixedCosts: FixedCost[]
}

const categoryColors: Record<string, string> = {
  'Aluguel': 'bg-blue-100 text-blue-800',
  'Utilidades': 'bg-green-100 text-green-800',
  'Software': 'bg-purple-100 text-purple-800',
  'Viaturas': 'bg-orange-100 text-orange-800',
  'Outros': 'bg-gray-100 text-gray-800',
}

export default function FixedCostsList({ fixedCosts }: FixedCostsListProps) {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o custo fixo "${name}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/fixed-costs/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir custo fixo')
      }

      addToast('Custo fixo excluído com sucesso!', 'success')
      window.location.reload()
    } catch (error) {
      addToast('Erro ao excluir custo fixo', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const groupedByCategory = fixedCosts.reduce((acc, cost) => {
    const category = cost.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(cost)
    return acc
  }, {} as Record<string, typeof fixedCosts>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCategory).map(([category, costs]) => {
        const categoryTotal = costs
          .filter(c => c.isActive)
          .reduce((sum, c) => sum + c.monthlyAmount, 0)

        return (
          <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                <span className="text-sm font-medium text-gray-700">
                  Total: €{categoryTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Mensal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Anual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costs.map((cost) => (
                    <tr key={cost.id} className={!cost.isActive ? 'opacity-50' : ''}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{cost.name}</div>
                        {cost.description && (
                          <div className="text-xs text-gray-500 mt-1">{cost.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        €{cost.monthlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        €{(cost.monthlyAmount * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(cost.startDate).toLocaleDateString('pt-BR')}
                        {cost.endDate && ` - ${new Date(cost.endDate).toLocaleDateString('pt-BR')}`}
                        {!cost.endDate && ' (permanente)'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cost.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cost.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/fixed-costs/${cost.id}/edit`}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(cost.id, cost.name)}
                            disabled={deletingId === cost.id}
                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                          >
                            {deletingId === cost.id ? (
                              <Spinner size="sm" className="!flex" />
                            ) : (
                              'Excluir'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {fixedCosts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">
            Nenhum custo fixo cadastrado ainda.
          </p>
        </div>
      )}
    </div>
  )
}

