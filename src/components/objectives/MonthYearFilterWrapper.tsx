'use client'

import MonthYearFilter from '../planned-hours/MonthYearFilter'

export default function MonthYearFilterWrapper({ 
  month, 
  year 
}: { 
  month: number
  year: number 
}) {
  return <MonthYearFilter initialMonth={month} initialYear={year} />
}

