'use client'

import { useState } from 'react'
import { RetainerCatalog, Department } from '@prisma/client'

interface CatalogWithDepartment extends RetainerCatalog {
  department: { id: string; name: string }
}

interface RetainerCatalogListProps {
  catalog: CatalogWithDepartment[]
  departments: Department[]
}

export default function RetainerCatalogList({ catalog, departments }: RetainerCatalogListProps) {
  const [showDetails, setShowDetails] = useState(false)

  const catalogByDepartment = departments.map(dept => ({
    department: dept,
    items: catalog.filter(item => item.departmentId === dept.id)
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs sm:text-sm text-gray-600">
          Campos de custo e margem só aparecem quando o <span className="font-semibold">Custo Interno/h</span> está configurado.
          Quando o valor não foi definido para um item, a tabela mostra <span className="font-mono">-</span> (não configurado).
        </p>
        <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span>Mostrar detalhes de custo e margem</span>
        </label>
      </div>

      {catalogByDepartment.map(({ department, items }) => (
        <div key={department.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">{department.name}</h3>
          
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Nenhum item no catálogo para este departamento. Crie um item para começar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Mensal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas/Mês</th>
                    {showDetails && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Custo Interno/h
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Custo Mensal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Margem
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          % Margem
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => {
                    const margin = item.monthlyMargin ? Number(item.monthlyMargin) : null
                    const marginPct = item.marginPercentage ? Number(item.marginPercentage) : null
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          €{Number(item.monthlyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {Number(item.hoursPerMonth).toFixed(1)}h
                        </td>
                        {showDetails && (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.internalHourlyCost
                                ? `€${Number(item.internalHourlyCost).toFixed(2)}`
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.monthlyCost
                                ? `€${Number(item.monthlyCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {margin !== null
                                ? `€${margin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {marginPct !== null ? (
                                <span
                                  className={`font-medium ${
                                    marginPct >= 30
                                      ? 'text-green-600'
                                      : marginPct >= 20
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {marginPct.toFixed(1)}%
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

