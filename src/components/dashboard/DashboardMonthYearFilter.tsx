'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'

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

interface AvailablePeriod {
  year: number
  month: number
}

export default function DashboardMonthYearFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [availablePeriods, setAvailablePeriods] = useState<AvailablePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  const currentMonth = searchParams?.get('month') 
    ? parseInt(searchParams.get('month')!) 
    : new Date().getMonth() + 1
  const currentYear = searchParams?.get('year') 
    ? parseInt(searchParams.get('year')!) 
    : new Date().getFullYear()

  useEffect(() => {
    // Buscar períodos disponíveis
    fetch('/api/dashboard/available-periods')
      .then(res => res.json())
      .then(data => {
        if (data.periods) {
          setAvailablePeriods(data.periods)
          // Extrair anos únicos
          const yearSet = new Set(data.periods.map((p: AvailablePeriod) => p.year))
          const years = Array.from(yearSet) as number[]
          years.sort((a, b) => b - a)
          setAvailableYears(years)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching available periods:', error)
        setLoading(false)
      })
  }, [])

  const handleChange = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('month', month.toString())
    params.set('year', year.toString())
    router.push(`?${params.toString()}`)
  }

  // Filtrar meses disponíveis para o ano selecionado
  const availableMonthsForYear = availablePeriods
    .filter(p => p.year === currentYear)
    .map(p => p.month)
    .sort((a, b) => b - a)

  // Se não houver meses disponíveis para o ano, mostrar todos os meses
  const monthsToShow = availableMonthsForYear.length > 0 
    ? months.filter(m => availableMonthsForYear.includes(m.value))
    : months

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-xs text-gray-500">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1.5 w-full sm:w-auto">
      <span className="text-xs font-medium text-gray-500 whitespace-nowrap hidden sm:inline">
        Período:
      </span>
      <select
        id="dashboard-month"
        value={currentMonth}
        onChange={(e) => handleChange(parseInt(e.target.value), currentYear)}
        className="bg-transparent text-xs sm:text-sm font-medium text-gray-800 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-500 rounded border-none cursor-pointer appearance-none flex-1 sm:flex-initial"
        style={{ backgroundImage: 'none' }}
      >
        {monthsToShow.map(month => (
          <option key={month.value} value={month.value}>{month.label}</option>
        ))}
      </select>
      <span className="text-gray-300 text-xs sm:text-sm">/</span>
      <select
        id="dashboard-year"
        value={currentYear}
        onChange={(e) => handleChange(currentMonth, parseInt(e.target.value))}
        className="bg-transparent text-xs sm:text-sm font-medium text-gray-800 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-red-500 rounded border-none cursor-pointer appearance-none flex-1 sm:flex-initial"
        style={{ backgroundImage: 'none' }}
      >
        {availableYears.length > 0 ? (
          availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))
        ) : (
          Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))
        )}
      </select>
    </div>
  )
}

