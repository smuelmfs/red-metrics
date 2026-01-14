'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Spinner from '@/components/ui/Spinner'

function MonthYearFilterContent({ 
  initialMonth, 
  initialYear 
}: { 
  initialMonth?: number
  initialYear?: number 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentMonth = initialMonth || parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
  const currentYear = initialYear || parseInt(searchParams.get('year') || String(new Date().getFullYear()))

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

  const handleChange = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', String(month))
    params.set('year', String(year))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-4 mb-6">
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
          Mês
        </label>
        <select
          id="month"
          value={currentMonth}
          onChange={(e) => handleChange(parseInt(e.target.value), currentYear)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
          Ano
        </label>
        <select
          id="year"
          value={currentYear}
          onChange={(e) => handleChange(currentMonth, parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function MonthYearFilter(props: { 
  initialMonth?: number
  initialYear?: number 
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    }>
      <MonthYearFilterContent {...props} />
    </Suspense>
  )
}

