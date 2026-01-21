import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

/**
 * Visão Mensal Consolidada
 * 
 * Equivalente à aba "Horas Faturáveis – Dept" da planilha original.
 * Mostra todos os departamentos × todos os meses em uma tabela consolidada.
 */
export default async function MonthlyBreakdownPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const currentDate = new Date()
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear()

  // Buscar todos os departamentos ativos
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  // Buscar todos os resultados do ano
  const results = await prisma.result.findMany({
    where: { year: selectedYear },
    include: {
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  })

  // Organizar resultados por departamento e mês
  const resultsByDept = new Map<string, Map<number, typeof results[0]>>()
  
  departments.forEach(dept => {
    const deptResults = new Map<number, typeof results[0]>()
    for (let month = 1; month <= 12; month++) {
      const result = results.find(r => r.departmentId === dept.id && r.month === month)
      if (result) {
        deptResults.set(month, result)
      }
    }
    resultsByDept.set(dept.id, deptResults)
  })

  // Calcular totais por mês
  const monthlyTotals = new Map<number, {
    revenue: number
    objective: number
    performance: number | null
  }>()

  for (let month = 1; month <= 12; month++) {
    const monthResults = results.filter(r => r.month === month)
    const revenue = monthResults.reduce((sum, r) => sum + Number(r.totalRevenue), 0)
    const objective = monthResults.reduce((sum, r) => sum + (r.objective ? Number(r.objective) : 0), 0)
    const performance = objective > 0 ? (revenue / objective) * 100 : null

    monthlyTotals.set(month, { revenue, objective, performance })
  }

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <Link
          href="/dashboard"
          className="text-red-600 hover:text-red-800 mb-4 inline-block transition-colors"
        >
          ← Voltar para Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Visão Mensal Consolidada</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
              Todos os departamentos × todos os meses de {selectedYear} (equivalente à aba "Horas Faturáveis – Dept")
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-24"
              defaultValue={selectedYear}
              onChange={(e) => {
                const year = parseInt(e.target.value) || selectedYear
                window.location.href = `?year=${year}`
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                  Departamento
                </th>
                {months.map((month, index) => (
                  <th key={index + 1} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    {month}
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[100px]">
                  Total Anual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Linha de Receita Total */}
              <tr className="bg-blue-50">
                <td className="px-3 py-2 font-semibold text-gray-900 sticky left-0 bg-blue-50 z-10">
                  Receita Total (€)
                </td>
                {months.map((_, index) => {
                  const month = index + 1
                  const total = monthlyTotals.get(month)
                  return (
                    <td key={month} className="px-2 py-2 text-right text-gray-900">
                      {total ? Number(total.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-right font-semibold text-gray-900 bg-gray-100">
                  {Array.from(monthlyTotals.values()).reduce((sum, t) => sum + t.revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* Linha de Objetivo Total */}
              <tr className="bg-yellow-50">
                <td className="px-3 py-2 font-semibold text-gray-900 sticky left-0 bg-yellow-50 z-10">
                  Objetivo Total (€)
                </td>
                {months.map((_, index) => {
                  const month = index + 1
                  const total = monthlyTotals.get(month)
                  return (
                    <td key={month} className="px-2 py-2 text-right text-gray-900">
                      {total ? Number(total.objective).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-right font-semibold text-gray-900 bg-gray-100">
                  {Array.from(monthlyTotals.values()).reduce((sum, t) => sum + t.objective, 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
              </tr>

              {/* Linha de Performance Total */}
              <tr className="bg-green-50">
                <td className="px-3 py-2 font-semibold text-gray-900 sticky left-0 bg-green-50 z-10">
                  Performance Total (%)
                </td>
                {months.map((_, index) => {
                  const month = index + 1
                  const total = monthlyTotals.get(month)
                  return (
                    <td key={month} className="px-2 py-2 text-right text-gray-900">
                      {total && total.performance !== null ? `${total.performance.toFixed(1)}%` : '-'}
                    </td>
                  )
                })}
                <td className="px-3 py-2 text-right font-semibold text-gray-900 bg-gray-100">
                  -
                </td>
              </tr>

              {/* Separador */}
              <tr>
                <td colSpan={14} className="px-3 py-1 bg-gray-200"></td>
              </tr>

              {/* Linhas por departamento - Receita */}
              {departments.map((dept) => {
                const deptResults = resultsByDept.get(dept.id) || new Map()
                const annualRevenue = Array.from(deptResults.values()).reduce(
                  (sum, r) => sum + Number(r.totalRevenue),
                  0
                )

                return (
                  <tr key={`${dept.id}-revenue`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700 sticky left-0 bg-white z-10">
                      {dept.name} - Receita
                    </td>
                    {months.map((_, index) => {
                      const month = index + 1
                      const result = deptResults.get(month)
                      return (
                        <td key={month} className="px-2 py-2 text-right text-gray-900">
                          {result ? Number(result.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-right font-semibold text-gray-900 bg-gray-100">
                      {annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                )
              })}

              {/* Separador */}
              <tr>
                <td colSpan={14} className="px-3 py-1 bg-gray-200"></td>
              </tr>

              {/* Linhas por departamento - Performance */}
              {departments.map((dept) => {
                const deptResults = resultsByDept.get(dept.id) || new Map()

                return (
                  <tr key={`${dept.id}-performance`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700 sticky left-0 bg-white z-10">
                      {dept.name} - Performance (%)
                    </td>
                    {months.map((_, index) => {
                      const month = index + 1
                      const result = deptResults.get(month)
                      const performance = result && result.performance ? Number(result.performance) : null
                      return (
                        <td key={month} className={`px-2 py-2 text-right ${
                          performance !== null
                            ? (performance >= 100 ? 'text-green-600 font-semibold' : performance >= 80 ? 'text-yellow-600' : 'text-red-600')
                            : 'text-gray-500'
                        }`}>
                          {performance !== null ? `${performance.toFixed(1)}%` : '-'}
                        </td>
                      )
                    })}
                    <td className="px-3 py-2 text-right text-gray-500 bg-gray-100">
                      -
                    </td>
                  </tr>
                )
              })}
            </tbody>
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

