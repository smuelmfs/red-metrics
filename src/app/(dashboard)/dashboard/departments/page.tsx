import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          plannedHours: true,
          objectives: true,
          retainers: true
        }
      }
    }
  })

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
            Gerencie os departamentos e suas configurações
          </p>
        </div>
        {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
          <Link
            href="/dashboard/departments/new"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base shadow-sm"
          >
            Novo Departamento
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Código
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HC
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Taxa Média
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td className="px-3 lg:px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {dept.name}
                  </div>
                  <div className="text-xs text-gray-500 sm:hidden mt-1">
                    {dept.code && `Código: ${dept.code}`} | HC: {dept.billableHeadcount}
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="text-sm text-gray-500">{dept.code || '-'}</div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dept.billableHeadcount}</div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-sm text-gray-900">
                    €{Number(dept.averageHourlyRate).toFixed(2)}/h
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dept.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dept.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') ? (
                  <Link
                    href={`/dashboard/departments/${dept.id}/edit`}
                    className="text-red-600 hover:text-red-800 mr-4 transition-colors"
                  >
                    Editar
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/departments/${dept.id}`}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Ver detalhes
                  </Link>
                  )}
                </td>
              </tr>
            ))}
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

