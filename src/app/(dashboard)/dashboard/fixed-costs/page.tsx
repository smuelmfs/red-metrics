import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FixedCostsList from '@/components/fixed-costs/FixedCostsList'

/**
 * Página: Gastos da Empresa (Custos Fixos)
 * 
 * Equivalente à seção de custos fixos da aba "Inputs" da planilha.
 * Permite gerenciar custos fixos mensais como aluguel, utilidades, softwares, viaturas, etc.
 */
export default async function FixedCostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  // Apenas admins e managers podem gerenciar custos fixos
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
    redirect('/dashboard')
  }

  const fixedCosts = await prisma.fixedCost.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  })

  // Converter dados do Prisma para objetos serializáveis
  const serializedFixedCosts = fixedCosts.map(cost => ({
    id: cost.id,
    name: cost.name,
    category: cost.category,
    monthlyAmount: Number(cost.monthlyAmount),
    description: cost.description,
    isActive: cost.isActive,
    startDate: cost.startDate.toISOString(),
    endDate: cost.endDate?.toISOString() || null,
    createdAt: cost.createdAt.toISOString(),
    updatedAt: cost.updatedAt.toISOString(),
  }))

  // Calcular totais
  const activeCosts = fixedCosts.filter(c => c.isActive)
  const totalMonthly = activeCosts.reduce(
    (sum, cost) => sum + Number(cost.monthlyAmount),
    0
  )
  const totalAnnual = totalMonthly * 12

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gastos da Empresa</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
            Gerencie os custos fixos mensais da empresa (aluguel, utilidades, softwares, viaturas, etc.)
          </p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <Link
            href="/dashboard/fixed-costs/new"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base shadow-sm"
          >
            Novo Custo Fixo
          </Link>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Total Mensal</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            €{totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Total Anual</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            €{totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Custos Ativos</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            {activeCosts.length}
          </p>
        </div>
      </div>

      <FixedCostsList fixedCosts={serializedFixedCosts} />
    </div>
  )
}

