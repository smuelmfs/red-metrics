'use client'

import { RetainerCatalog, Department } from '@prisma/client'

interface CatalogWithDepartment extends RetainerCatalog {
  department: { id: string; name: string }
}

interface RetainerCatalogListProps {
  catalog: CatalogWithDepartment[]
  departments: Department[]
}

export default function RetainerCatalogList({ catalog, departments }: RetainerCatalogListProps) {
  const catalogByDepartment = departments.map(dept => ({
    department: dept,
    items: catalog.filter(item => item.departmentId === dept.id)
  }))

  return (
    <div className="space-y-6">
      {catalogByDepartment.map(({ department, items }) => (
        <div key={department.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">{department.name}</h3>
          
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum item no catálogo</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Mensal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas/Mês</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo Interno/h</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo Mensal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Margem</th>
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

