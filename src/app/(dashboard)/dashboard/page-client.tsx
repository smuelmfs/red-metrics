'use client'

import { useState, useMemo } from 'react'
import RecalculateButton from '@/components/dashboard/RecalculateButton'
import PerformanceChart from '@/components/dashboard/PerformanceChart'
import RevenueChart from '@/components/dashboard/RevenueChart'
import DepartmentRanking from '@/components/dashboard/DepartmentRanking'
import DraggableDashboard, { Widget } from '@/components/dashboard/DraggableDashboard'
import DashboardWidget from '@/components/dashboard/DashboardWidget'
import DashboardMonthYearFilter from '@/components/dashboard/DashboardMonthYearFilter'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import Spinner from '@/components/ui/Spinner'

interface DashboardPageClientProps {
  totalRevenue: number
  totalObjective: number
  overallPerformance: number | null
  departments: Array<{
    id: string
    name: string
    code: string | null
    billableHeadcount: number
    averageHourlyRate: number
    _count: { retainers: number }
  }>
  results: Array<{
    departmentId: string
    totalRevenue: number
    objective: number | null
    performance: number | null
  }>
  performanceData: Array<{
    department: string
    performance: number
    objective: number
    revenue: number
  }>
  last6Months: Array<{
    month: string
    revenue: number
    objective: number
  }>
  selectedMonth: number
  selectedYear: number
}

export default function DashboardPageClient({
  totalRevenue,
  totalObjective,
  overallPerformance,
  departments,
  results,
  performanceData,
  last6Months,
  selectedMonth,
  selectedYear
}: DashboardPageClientProps) {
  const defaultWidgets: Widget[] = useMemo(() => [
    {
      id: 'summary-cards',
      type: 'summary-cards',
      title: 'Resumo Geral',
      visible: true,
      order: 0,
      colSpan: 3
    },
    {
      id: 'department-cards',
      type: 'department-cards',
      title: 'Departamentos',
      visible: true,
      order: 1,
      colSpan: 3
    },
    {
      id: 'performance-chart',
      type: 'performance-chart',
      title: 'Gráfico de Performance',
      visible: true,
      order: 2,
      colSpan: 1
    },
    {
      id: 'revenue-chart',
      type: 'revenue-chart',
      title: 'Gráfico de Receita',
      visible: true,
      order: 3,
      colSpan: 1
    },
    {
      id: 'department-ranking',
      type: 'department-ranking',
      title: 'Classificação de Departamentos',
      visible: true,
      order: 4,
      colSpan: 1
    }
  ], [])

  const { widgets, setWidgets, saveLayout, isLoading } = useDashboardLayout(defaultWidgets)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'summary-cards':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <p className="text-xs lg:text-sm text-gray-600 mb-2">Receita Total do Mês</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                €{totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <p className="text-xs lg:text-sm text-gray-600 mb-2">Objetivo Total</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                €{totalObjective.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-xs lg:text-sm text-gray-600 mb-2">Performance Geral</p>
              <p className={`text-2xl lg:text-3xl font-bold ${
                overallPerformance && overallPerformance >= 100
                  ? 'text-green-600'
                  : overallPerformance && overallPerformance >= 80
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {overallPerformance !== null ? `${overallPerformance.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        )

      case 'department-cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {departments.map((dept) => {
              const result = results.find(r => r.departmentId === dept.id)
              const performance = result?.performance ? Number(result.performance) : null

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 break-words">
                      {dept.name}
                    </h3>
                    {dept.code && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {dept.code}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">HC Faturável:</span>
                      <span className="font-medium">{dept.billableHeadcount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa Média:</span>
                      <span className="font-medium">
                        €{Number(dept.averageHourlyRate).toFixed(2)}/h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avenças Ativas:</span>
                      <span className="font-medium">{dept._count.retainers}</span>
                    </div>
                    
                    {result && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Receita Total:</span>
                          <span className="font-medium">
                            €{Number(result.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {result.objective && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Objetivo:</span>
                            <span className="font-medium">
                              €{Number(result.objective).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {performance !== null && (
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-600">Performance:</span>
                            <span
                              className={`font-bold text-lg ${
                                performance >= 100
                                  ? 'text-green-600'
                                  : performance >= 80
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {performance.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!result && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 italic">
                          Sem dados para este mês
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )

      case 'performance-chart':
        return performanceData.length > 0 ? (
          <PerformanceChart data={performanceData} />
        ) : null

      case 'revenue-chart':
        return <RevenueChart data={last6Months} />

      case 'department-ranking':
        return (
          <DepartmentRanking
            departments={departments.map(dept => ({
              id: dept.id,
              name: dept.name,
              code: dept.code
            }))}
            results={results.map(r => ({
              departmentId: r.departmentId,
              performance: r.performance,
              totalRevenue: r.totalRevenue,
              objective: r.objective
            }))}
          />
        )

      default:
        return null
    }
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
              Visão geral dos departamentos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <DashboardMonthYearFilter />
            </div>
            <div className="flex items-center">
              <RecalculateButton year={selectedYear} />
            </div>
          </div>
        </div>
      </div>

      <DraggableDashboard
        widgets={widgets}
        onWidgetsChange={setWidgets}
        onSaveLayout={saveLayout}
        renderWidget={renderWidget}
      />
    </div>
  )
}

