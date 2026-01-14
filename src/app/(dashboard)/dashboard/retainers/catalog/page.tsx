import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import RetainerCatalogList from '@/components/retainers/RetainerCatalogList'

export default async function RetainerCatalogPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  const catalog = await prisma.retainerCatalog.findMany({
    where: { isActive: true },
    include: {
      department: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { department: { name: 'asc' } },
      { name: 'asc' }
    ]
  })

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/retainers"
            className="text-red-600 hover:text-red-800 mb-2 inline-block transition-colors"
          >
            ← Voltar para Avenças
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Catálogo de Avenças</h1>
          <p className="text-gray-600 mt-2">
            Tipos padronizados de avenças por departamento
          </p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <Link
            href="/dashboard/retainers/catalog/new"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base shadow-sm"
          >
            Novo Item do Catálogo
          </Link>
        )}
      </div>

      <RetainerCatalogList catalog={catalog} departments={departments} />
    </div>
  )
}

