import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import RetainersList from '@/components/retainers/RetainersList'

export default async function RetainersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

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

  const retainers = await prisma.retainer.findMany({
    where: { isActive: true },
    include: {
      department: {
        select: {
          id: true,
          name: true
        }
      },
      catalog: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { department: { name: 'asc' } },
      { startDate: 'desc' }
    ]
  })

  // Serializar retainers para Client Component
  const serializedRetainers = retainers.map(retainer => ({
    id: retainer.id,
    departmentId: retainer.departmentId,
    catalogId: retainer.catalogId,
    name: retainer.name,
    type: retainer.type,
    monthlyPrice: Number(retainer.monthlyPrice),
    quantity: retainer.quantity,
    monthlyRevenue: Number(retainer.monthlyRevenue),
    hoursPerMonth: retainer.hoursPerMonth ? Number(retainer.hoursPerMonth) : null,
    variableCostPerMonth: retainer.variableCostPerMonth ? Number(retainer.variableCostPerMonth) : null,
    monthlyChurn: retainer.monthlyChurn ? Number(retainer.monthlyChurn) : null,
    newRetainersPerMonth: retainer.newRetainersPerMonth,
    startDate: retainer.startDate.toISOString(),
    endDate: retainer.endDate?.toISOString() || null,
    isActive: retainer.isActive,
    notes: retainer.notes,
    createdAt: retainer.createdAt.toISOString(),
    updatedAt: retainer.updatedAt.toISOString(),
    department: retainer.department,
    catalog: retainer.catalog,
  }))

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Avenças (Retainers)</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
            Gerencie as avenças ativas por departamento
          </p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <Link
            href="/dashboard/retainers/new"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base shadow-sm"
          >
            Nova Avença
          </Link>
        )}
      </div>

      <RetainersList
        retainers={serializedRetainers}
        departments={serializedDepartments}
        canEdit={session.user.role === 'ADMIN' || session.user.role === 'MANAGER'}
      />
    </div>
  )
}

