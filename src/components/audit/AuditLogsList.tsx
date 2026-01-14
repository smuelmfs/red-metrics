'use client'

import Link from 'next/link'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: Date
  user: {
    email: string
    name: string | null
  }
  department: {
    name: string
  } | null
  oldValue: any
  newValue: any
}

interface AuditLogsListProps {
  logs: AuditLog[]
  currentPage: number
  totalPages: number
  entityTypes: string[]
  selectedEntityType?: string
}

export default function AuditLogsList({
  logs,
  currentPage,
  totalPages,
  entityTypes,
  selectedEntityType
}: AuditLogsListProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <label htmlFor="entityType" className="text-sm font-medium text-gray-700">
            Filtrar por tipo:
          </label>
          <select
            id="entityType"
            value={selectedEntityType || ''}
            onChange={(e) => {
              const params = new URLSearchParams()
              if (e.target.value) {
                params.set('entityType', e.target.value)
              }
              window.location.href = `/dashboard/audit?${params.toString()}`
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Usuário
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ação
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Tipo
              </th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Departamento
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                  <div>{format(new Date(log.createdAt), "dd/MM/yyyy")}</div>
                  <div className="text-xs text-gray-500 sm:hidden">{format(new Date(log.createdAt), "HH:mm")}</div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                  {log.user.name || log.user.email}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                  {log.entityType}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                  {log.department?.name || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="px-4 lg:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <Link
                href={`/dashboard/audit?page=${currentPage - 1}${selectedEntityType ? `&entityType=${selectedEntityType}` : ''}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/dashboard/audit?page=${currentPage + 1}${selectedEntityType ? `&entityType=${selectedEntityType}` : ''}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

