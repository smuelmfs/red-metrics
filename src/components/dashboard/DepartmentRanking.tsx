'use client'

import { Trophy, Medal, Award } from 'lucide-react'
import { RankedDepartment } from '@/modules/dashboards'
import { getStatusBadgeClasses } from '@/lib/ui/status'

interface DepartmentRankingProps {
  ranking: RankedDepartment[]
}

export default function DepartmentRanking({ ranking }: DepartmentRankingProps) {
  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <p className="text-gray-700 text-center font-medium mb-2">
          Nenhum dado disponível para classificação
        </p>
        <p className="text-sm text-gray-500 text-center">
          Salve horas faturáveis e objetivos, depois clique em "Recalcular Resultados"
        </p>
      </div>
    )
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
            {position}
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg lg:text-xl font-bold text-gray-900">Classificação de Departamentos</h3>
        <p className="text-sm text-gray-600 mt-1">Ordenado por performance (melhor para pior)</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {ranking.map((dept, index) => {
          const position = index + 1

          return (
            <div
              key={dept.id}
              className={`p-4 lg:p-6 hover:bg-gray-50 transition-colors ${
                position <= 3 ? 'bg-gradient-to-r from-gray-50 to-white' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Posição/Ícone */}
                <div className="flex-shrink-0">
                  {getRankIcon(position)}
                </div>

                {/* Informações do Departamento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                      {dept.name}
                    </h4>
                    {dept.code && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Performance */}
                    <div className={`px-3 py-1 rounded-full ${getStatusBadgeClasses(dept.status)}`}>
                      <span className="text-sm lg:text-base font-bold">
                        {dept.performancePercentage.toFixed(1)}%
                      </span>
                    </div>

                    {/* Receita */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        €{dept.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Objetivo */}
                    {dept.objective && (
                      <div className="text-xs text-gray-500">
                        Obj: €{dept.objective.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

