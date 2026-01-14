import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AuditLogsList from '@/components/audit/AuditLogsList'

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { page?: string; entityType?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  // Apenas administradores podem acessar
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const page = parseInt(searchParams.page || '1')
  const itemsPerPage = 50
  const skip = (page - 1) * itemsPerPage

  const where: any = {}
  if (searchParams.entityType) {
    where.entityType = searchParams.entityType
  }

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: itemsPerPage
    }),
    prisma.auditLog.count({ where })
  ])

  const totalPages = Math.ceil(total / itemsPerPage)

  // Obter tipos de entidades únicos para filtro
  const entityTypes = await prisma.auditLog.findMany({
    select: {
      entityType: true
    },
    distinct: ['entityType'],
    orderBy: {
      entityType: 'asc'
    }
  })

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">Auditoria</h1>
      <AuditLogsList
        logs={auditLogs}
        currentPage={page}
        totalPages={totalPages}
        entityTypes={entityTypes.map(e => e.entityType)}
        selectedEntityType={searchParams.entityType}
      />
    </div>
  )
}

