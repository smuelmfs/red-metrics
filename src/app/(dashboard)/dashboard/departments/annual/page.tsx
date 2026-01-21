import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

/**
 * Visão Anual Consolidada de Departamentos
 * 
 * Equivalente à aba "Depts" da planilha original.
 * Mostra todas as métricas anuais calculadas de todos os departamentos em uma tabela consolidada.
 */
export default async function DepartmentsAnnualPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  // Buscar todos os departamentos ativos com métricas anuais
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  // Calcular totais
  const totals = {
    billableHeadcount: departments.reduce((sum, d) => sum + d.billableHeadcount, 0),
    directCostAnnual: departments.reduce((sum, d) => sum + (d.directCostAnnual ? Number(d.directCostAnnual) : 0), 0),
    billableHoursAnnual: departments.reduce((sum, d) => sum + (d.billableHoursAnnual ? Number(d.billableHoursAnnual) : 0), 0),
    revenueCapacityAnnual: departments.reduce((sum, d) => sum + (d.revenueCapacityAnnual ? Number(d.revenueCapacityAnnual) : 0), 0),
    overheadAllocatedAnnual: departments.reduce((sum, d) => sum + (d.overheadAllocatedAnnual ? Number(d.overheadAllocatedAnnual) : 0), 0),
    minimumRevenueAnnual: departments.reduce((sum, d) => sum + (d.minimumRevenueAnnual ? Number(d.minimumRevenueAnnual) : 0), 0),
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <Link
          href="/dashboard/departments"
          className="text-red-600 hover:text-red-800 mb-4 inline-block transition-colors"
        >
          ← Voltar para Departamentos
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Visão Anual Consolidada</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
              Métricas anuais calculadas de todos os departamentos (equivalente à aba "Depts" da planilha)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Departamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HC Faturável
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa Média (€/h)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custo Direto Anual (€)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Faturáveis Anuais
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidade Receita Anual (€)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overhead Alocado Anual (€)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                  Receita Mínima Anual (€)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                    <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{dept.code || '-'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{dept.billableHeadcount}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {Number(dept.averageHourlyRate).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {dept.directCostAnnual
                        ? Number(dept.directCostAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {dept.billableHoursAnnual
                        ? Number(dept.billableHoursAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {dept.revenueCapacityAnnual
                        ? Number(dept.revenueCapacityAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {dept.overheadAllocatedAnnual
                        ? Number(dept.overheadAllocatedAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right bg-red-50">
                    <div className="text-sm font-semibold text-gray-900">
                      {dept.minimumRevenueAnnual
                        ? Number(dept.minimumRevenueAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">
                  TOTAIS
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {totals.billableHeadcount}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">
                  -
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {totals.directCostAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {totals.billableHoursAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {totals.revenueCapacityAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900">
                  {totals.overheadAllocatedAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900 bg-red-100">
                  {totals.minimumRevenueAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">
            Nenhum departamento cadastrado ainda.
          </p>
        </div>
      )}
    </div>
  )
}

