import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardPageClient from './page-client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  // Determinar mês/ano selecionado (padrão: mês atual)
  const currentDate = new Date()
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear()

  // Buscar dados para o dashboard
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      results: {
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 1
      },
      _count: {
        select: {
          retainers: {
            where: { isActive: true }
          }
        }
      }
    }
  })

  // Buscar resultados do mês/ano selecionado
  const results = await prisma.result.findMany({
    where: {
      month: selectedMonth,
      year: selectedYear
    },
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

  // Calcular totais
  const totalRevenue = results.reduce((sum, r) => sum + Number(r.totalRevenue), 0)
  const totalObjective = results.reduce((sum, r) => sum + (r.objective ? Number(r.objective) : 0), 0)
  const overallPerformance = totalObjective > 0 ? (totalRevenue / totalObjective) * 100 : null

  // Dados para gráficos
  const performanceData = results
    .filter(r => r.performance !== null)
    .map(r => ({
      department: r.department.name,
      performance: Number(r.performance),
      objective: r.objective ? Number(r.objective) : 0,
      revenue: Number(r.totalRevenue)
    }))

  // Buscar últimos 6 meses anteriores ao mês selecionado para gráfico de evolução
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(selectedYear, selectedMonth - 1 - i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    const monthResults = await prisma.result.findMany({
      where: { month, year },
      include: { department: { select: { name: true } } }
    })
    
    const monthRevenue = monthResults.reduce((sum, r) => sum + Number(r.totalRevenue), 0)
    const monthObjective = monthResults.reduce((sum, r) => sum + (r.objective ? Number(r.objective) : 0), 0)
    
    last6Months.push({
      month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      revenue: monthRevenue,
      objective: monthObjective
    })
  }

  return (
    <DashboardPageClient
      totalRevenue={totalRevenue}
      totalObjective={totalObjective}
      overallPerformance={overallPerformance}
      departments={departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        billableHeadcount: dept.billableHeadcount,
        averageHourlyRate: Number(dept.averageHourlyRate),
        _count: { retainers: dept._count.retainers }
      }))}
      results={results.map(r => ({
        departmentId: r.departmentId,
        totalRevenue: Number(r.totalRevenue),
        objective: r.objective ? Number(r.objective) : null,
        performance: r.performance ? Number(r.performance) : null
      }))}
      performanceData={performanceData}
      last6Months={last6Months}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
    />
  )
}

