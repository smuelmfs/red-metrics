'use client'

import { Trophy, Medal, Award } from 'lucide-react'

interface DepartmentRankingProps {
  departments: Array<{
    id: string
    name: string
    code: string | null
  }>
  results: Array<{
    departmentId: string
    performance: number | null
    totalRevenue: number
    objective: number | null
  }>
}

export default function DepartmentRanking({ departments, results }: DepartmentRankingProps) {
  // Criar ranking ordenado por performance (do melhor para o pior)
  const ranking = departments
    .map(dept => {
      const result = results.find(r => r.departmentId === dept.id)
      return {
        ...dept,
        performance: result?.performance ?? null,
        totalRevenue: result?.totalRevenue ?? 0,
        objective: result?.objective ?? null
      }
    })
    .filter(dept => dept.performance !== null) // Apenas departamentos com dados
    .sort((a, b) => {
      // Ordenar do maior para o menor (melhor performance primeiro)
      const perfA = a.performance ?? 0
      const perfB = b.performance ?? 0
      return perfB - perfA
    })

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <p className="text-gray-500 text-center">Nenhum dado disponível para classificação</p>
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

  const getPerformanceColor = (performance: number) => {
    if (performance >= 100) return 'text-green-600 bg-green-50'
    if (performance >= 80) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
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
          const performance = dept.performance ?? 0

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
                    <div className={`px-3 py-1 rounded-full ${getPerformanceColor(performance)}`}>
                      <span className="text-sm lg:text-base font-bold">
                        {performance.toFixed(1)}%
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

