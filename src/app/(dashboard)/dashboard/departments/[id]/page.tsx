import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getDepartmentMonthlyResult } from '@/modules/departments'
import { getCompanySettings } from '@/modules/settings'
import { getStatusTextClasses } from '@/lib/ui/status'
import MonthYearSelector from '@/components/departments/MonthYearSelector'

interface DepartmentDetailPageProps {
  params: { id: string }
  searchParams: { month?: string; year?: string }
}

export default async function DepartmentDetailPage({
  params,
  searchParams
}: DepartmentDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const currentDate = new Date()
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear()

  // Buscar departamento
  const department = await prisma.department.findUnique({
    where: { id: params.id }
  })

  if (!department) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <p className="text-red-600">Departamento não encontrado</p>
        <Link href="/dashboard/departments" className="text-red-600 hover:text-red-800 mt-4 inline-block transition-colors">
          ← Voltar
        </Link>
      </div>
    )
  }

  // Buscar resultado mensal usando o módulo de domínio
  let monthlyResult = null
  try {
    monthlyResult = await getDepartmentMonthlyResult(params.id, selectedMonth, selectedYear)
  } catch (error) {
    console.error('Error fetching monthly result:', error)
  }

  // Buscar horas planejadas
  const plannedHours = await prisma.plannedHours.findUnique({
    where: {
      departmentId_month_year: {
        departmentId: params.id,
        month: selectedMonth,
        year: selectedYear
      }
    }
  })

  // Buscar objetivo
  const objective = await prisma.objective.findUnique({
    where: {
      departmentId_month_year: {
        departmentId: params.id,
        month: selectedMonth,
        year: selectedYear
      }
    }
  })

  // Buscar avenças ativas
  const activeRetainers = await prisma.retainer.findMany({
    where: {
      departmentId: params.id,
      isActive: true,
      startDate: { lte: new Date(selectedYear, selectedMonth, 0) },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date(selectedYear, selectedMonth - 1, 1) } }
      ]
    },
    orderBy: { startDate: 'desc' }
  })

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const performance = monthlyResult?.performance ? Number(monthlyResult.performance) : null
  const status = performance !== null
    ? (performance >= 100 ? 'good' : performance >= 80 ? 'warning' : 'bad')
    : null

  // Buscar configurações para breakdown do objetivo mínimo
  const companySettings = await getCompanySettings()
  const directCost = department.directCostAnnual ? Number(department.directCostAnnual) : 0
  const overhead = department.overheadAllocatedAnnual ? Number(department.overheadAllocatedAnnual) : 0
  const totalCosts = directCost + overhead
  const targetMargin = companySettings.targetMargin

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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
              {months[selectedMonth - 1]} de {selectedYear}
            </p>
          </div>
          <MonthYearSelector currentMonth={selectedMonth} currentYear={selectedYear} />
        </div>
      </div>

      {/* Visão Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Receita Total</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            €{monthlyResult ? Number(monthlyResult.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Objetivo</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            €{objective ? Number(objective.targetValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Gap</p>
          <p className={`text-2xl lg:text-3xl font-bold ${
            monthlyResult && objective
              ? (Number(monthlyResult.totalRevenue) - Number(objective.targetValue) >= 0
                  ? 'text-green-600'
                  : 'text-red-600')
              : 'text-gray-600'
          }`}>
            {monthlyResult && objective
              ? `€${(Number(monthlyResult.totalRevenue) - Number(objective.targetValue)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <p className="text-xs lg:text-sm text-gray-600 mb-2">Performance</p>
          <p className={`text-2xl lg:text-3xl font-bold ${getStatusTextClasses(status)}`}>
            {performance !== null ? `${performance.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Sub-abas: Horas e Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Horas</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Horas Disponíveis (Alvo)</p>
              <p className="text-lg font-semibold text-gray-900">
                {plannedHours?.targetAvailableHours
                  ? Math.round(Number(plannedHours.targetAvailableHours)).toLocaleString('pt-BR')
                  : 'N/A'} h
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Horas Reais (Odoo)</p>
              <p className="text-lg font-semibold text-gray-900">
                {plannedHours?.actualBillableHours
                  ? Math.round(Number(plannedHours.actualBillableHours)).toLocaleString('pt-BR')
                  : 'N/A'} h
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Taxa de Utilização</p>
              <p className={`text-lg font-semibold ${
                monthlyResult?.utilizationRate
                  ? (Number(monthlyResult.utilizationRate) >= 0.8
                      ? 'text-green-600'
                      : Number(monthlyResult.utilizationRate) >= 0.6
                      ? 'text-yellow-600'
                      : 'text-red-600')
                  : 'text-gray-600'
              }`}>
                {monthlyResult?.utilizationRate
                  ? `${(Number(monthlyResult.utilizationRate) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Financeiro</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita por Horas</p>
              <p className="text-lg font-semibold text-gray-900">
                €{monthlyResult?.revenueFromHours
                  ? Number(monthlyResult.revenueFromHours).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : '0,00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita por Avenças</p>
              <p className="text-lg font-semibold text-gray-900">
                {/* Soma apenas para exibição - monthlyRevenue já calculado no backend via módulo retainers */}
                €{activeRetainers.reduce((sum, r) => sum + Number(r.monthlyRevenue), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita de Projetos</p>
              <p className="text-lg font-semibold text-gray-900">
                €{plannedHours?.projectRevenue
                  ? Number(plannedHours.projectRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : '0,00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Overhead Alocado (Anual)</p>
              <p className="text-lg font-semibold text-gray-900">
                €{department.overheadAllocatedAnnual
                  ? Number(department.overheadAllocatedAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Mínima Sustentável (Anual)</p>
              <p className="text-lg font-semibold text-gray-900">
                €{department.minimumRevenueAnnual
                  ? Number(department.minimumRevenueAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown do Objetivo Mínimo Anual */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Composição do Objetivo Mínimo Anual</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">Custo Direto Anual</span>
            <span className="text-sm font-semibold text-gray-900">
              €{directCost > 0 ? directCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">Overhead Alocado Anual</span>
            <span className="text-sm font-semibold text-gray-900">
              €{overhead > 0 ? overhead.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b-2 border-gray-400">
            <span className="text-sm font-semibold text-gray-900">Total de Custos Anuais</span>
            <span className="text-sm font-bold text-gray-900">
              €{totalCosts > 0 ? totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">Margem Alvo</span>
            <span className="text-sm text-gray-900">
              {(targetMargin * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center py-2 bg-red-50 rounded-lg px-4">
            <span className="text-sm font-bold text-gray-900">Receita Mínima Anual Necessária</span>
            <span className="text-lg font-bold text-red-600">
              €{department.minimumRevenueAnnual
                ? Number(department.minimumRevenueAnnual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                : 'N/A'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fórmula: (Custo Direto + Overhead) / (1 - Margem Alvo) = Receita Mínima
          </p>
        </div>
      </div>

      {/* Avenças Ativas */}
      {activeRetainers.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Avenças Ativas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Mensal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita Mensal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeRetainers.map((retainer) => (
                  <tr key={retainer.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{retainer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      €{Number(retainer.monthlyPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{retainer.quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      €{Number(retainer.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

