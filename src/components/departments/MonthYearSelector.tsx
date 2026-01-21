'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface MonthYearSelectorProps {
  currentMonth: number
  currentYear: number
}

export default function MonthYearSelector({ currentMonth, currentYear }: MonthYearSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const handleMonthChange = (month: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', String(month))
    params.set('year', String(currentYear))
    router.push(`?${params.toString()}`)
  }

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', String(currentMonth))
    params.set('year', String(year))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2">
      <select
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        value={currentMonth}
        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
      >
        {months.map((month, index) => (
          <option key={index + 1} value={index + 1}>
            {month}
          </option>
        ))}
      </select>
      <input
        type="number"
        className="px-3 py-2 border border-gray-300 rounded-md text-sm w-24"
        value={currentYear}
        onChange={(e) => handleYearChange(parseInt(e.target.value) || currentYear)}
      />
    </div>
  )
}

