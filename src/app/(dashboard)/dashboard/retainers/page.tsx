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

      <RetainersList retainers={retainers} departments={departments} />
    </div>
  )
}

