import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCompanyDashboardOverview } from '@/modules/dashboards'
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

  // Buscar visão consolidada do dashboard a partir do domínio
  const overview = await getCompanyDashboardOverview(selectedMonth, selectedYear)

  return (
    <DashboardPageClient
      overview={overview}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
    />
  )
}

