import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PlannedHoursForm from '@/components/planned-hours/PlannedHoursForm'
import MonthYearFilter from '@/components/planned-hours/MonthYearFilter'
import { getOdooIntegration } from '@/lib/integrations/odoo/service'

export default async function PlannedHoursPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const currentDate = new Date()
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear()

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  // Serializar departamentos para Client Component
  const serializedDepartments = departments.map(dept => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    billableHeadcount: dept.billableHeadcount,
    costPerPersonPerMonth: dept.costPerPersonPerMonth ? Number(dept.costPerPersonPerMonth) : null,
    targetUtilization: Number(dept.targetUtilization),
    averageHourlyRate: Number(dept.averageHourlyRate),
    directCostAnnual: dept.directCostAnnual ? Number(dept.directCostAnnual) : null,
    billableHoursAnnual: dept.billableHoursAnnual ? Number(dept.billableHoursAnnual) : null,
    revenueCapacityAnnual: dept.revenueCapacityAnnual ? Number(dept.revenueCapacityAnnual) : null,
    overheadAllocatedAnnual: dept.overheadAllocatedAnnual ? Number(dept.overheadAllocatedAnnual) : null,
    minimumRevenueAnnual: dept.minimumRevenueAnnual ? Number(dept.minimumRevenueAnnual) : null,
    isActive: dept.isActive,
    createdAt: dept.createdAt.toISOString(),
    updatedAt: dept.updatedAt.toISOString(),
  }))

  // Verificar se integração Odoo está ativa
  const odooIntegration = await getOdooIntegration()

  const plannedHours = await prisma.plannedHours.findMany({
    where: {
      month: selectedMonth,
      year: selectedYear
    },
    include: {
      department: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  // Serializar plannedHours para Client Component
  const serializedPlannedHours = plannedHours.map(ph => ({
    id: ph.id,
    departmentId: ph.departmentId,
    month: ph.month,
    year: ph.year,
    billableHeadcount: ph.billableHeadcount,
    targetHoursPerMonth: ph.targetHoursPerMonth ? Number(ph.targetHoursPerMonth) : null,
    targetUtilization: ph.targetUtilization ? Number(ph.targetUtilization) : null,
    targetAvailableHours: ph.targetAvailableHours ? Number(ph.targetAvailableHours) : null,
    actualBillableHours: ph.actualBillableHours ? Number(ph.actualBillableHours) : null,
    actualUtilization: ph.actualUtilization ? Number(ph.actualUtilization) : null,
    syncedFromOdoo: ph.syncedFromOdoo,
    lastSyncedAt: ph.lastSyncedAt?.toISOString() || null,
    retainerRevenue: ph.retainerRevenue ? Number(ph.retainerRevenue) : null,
    projectRevenue: ph.projectRevenue ? Number(ph.projectRevenue) : null,
    totalRevenue: ph.totalRevenue ? Number(ph.totalRevenue) : null,
    revenuePerHour: ph.revenuePerHour ? Number(ph.revenuePerHour) : null,
  }))

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Horas Planejadas</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
          Registre as horas planejadas e reais por departamento e mês
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="mb-4">
          <MonthYearFilter initialMonth={selectedMonth} initialYear={selectedYear} />
        </div>
        <h2 className="text-xl font-semibold mb-4">
          {months[selectedMonth - 1]?.label} {selectedYear}
        </h2>

        {departments.length === 0 ? (
          <p className="text-gray-500">Nenhum departamento cadastrado.</p>
        ) : (
          <div className="space-y-4">
            {serializedDepartments.map((dept) => {
              const planned = serializedPlannedHours.find(ph => ph.departmentId === dept.id)
              // Se a integração Odoo estiver ativa, todos os departamentos podem ter horas sincronizadas
              const hasOdooSync = odooIntegration?.isEnabled && planned?.syncedFromOdoo
              return (
                <PlannedHoursForm
                  key={dept.id}
                  department={dept}
                  month={selectedMonth}
                  year={selectedYear}
                  initialData={planned || undefined}
                  odooEnabled={odooIntegration?.isEnabled || false}
                  hasOdooMapping={hasOdooSync || false}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

