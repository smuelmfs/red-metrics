'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface YearFilterProps {
  initialYear: number
}

export default function YearFilter({ initialYear }: YearFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value) || initialYear
    const params = new URLSearchParams(searchParams?.toString())
    params.set('year', year.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <input
      type="number"
      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-24"
      defaultValue={initialYear}
      onChange={handleChange}
    />
  )
}

