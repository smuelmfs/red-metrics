'use client'

import Link from 'next/link'

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

interface SerializedRetainer {
  id: string
  departmentId: string
  catalogId: string | null
  name: string
  type: string | null
  monthlyPrice: number
  quantity: number
  monthlyRevenue: number
  hoursPerMonth: number | null
  variableCostPerMonth: number | null
  monthlyChurn: number | null
  newRetainersPerMonth: number | null
  startDate: string
  endDate: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  department: { id: string; name: string }
  catalog: { id: string; name: string } | null
}

interface RetainersListProps {
  retainers: SerializedRetainer[]
  departments: SerializedDepartment[]
  canEdit?: boolean
}

export default function RetainersList({ retainers, departments, canEdit = false }: RetainersListProps) {
  const retainersByDepartment = departments.map(dept => ({
    department: dept,
    retainers: retainers.filter(r => r.departmentId === dept.id)
  }))

  // Total de receita já calculado no backend (monthlyRevenue já vem calculado)
  // Apenas somamos para exibição - não é cálculo de regra de negócio
  const totalRevenue = retainers.reduce((sum, r) => sum + r.monthlyRevenue, 0)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Resumo</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total de Avenças</p>
            <p className="text-2xl font-bold text-gray-900">{retainers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Receita Mensal Total</p>
            <p className="text-2xl font-bold text-gray-900">
              €{totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Departamentos com Avenças</p>
            <p className="text-2xl font-bold text-gray-900">
              {retainersByDepartment.filter(d => d.retainers.length > 0).length}
            </p>
          </div>
        </div>
      </div>

      {retainersByDepartment.map(({ department, retainers: deptRetainers }) => (
        <div key={department.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">{department.name}</h3>
          
          {deptRetainers.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma avença ativa</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Mensal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita Mensal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                    {canEdit && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deptRetainers.map((retainer) => (
                    <tr key={retainer.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{retainer.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retainer.type || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        €{Number(retainer.monthlyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{retainer.quantity}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        €{Number(retainer.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(retainer.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-sm text-right">
                          <Link
                            href={`/dashboard/retainers/${retainer.id}/edit`}
                            className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm"
                          >
                            Editar
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      Total do Departamento:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {/* Total já calculado no backend - apenas soma para exibição */}
                      €{deptRetainers.reduce((sum, r) => sum + Number(r.monthlyRevenue), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

