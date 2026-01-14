import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PlannedHoursForm from '@/components/planned-hours/PlannedHoursForm'
import MonthYearFilter from '@/components/planned-hours/MonthYearFilter'

export default async function PlannedHoursPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const currentDate = new Date()
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear()

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  const plannedHours = await prisma.plannedHours.findMany({
    where: {
      month: selectedMonth,
      year: selectedYear
    },
    include: {
      department: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

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

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Horas Planejadas</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
          Registre as horas planejadas e reais por departamento e mês
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="mb-4">
          <MonthYearFilter initialMonth={selectedMonth} initialYear={selectedYear} />
        </div>
        <h2 className="text-xl font-semibold mb-4">
          {months[selectedMonth - 1]?.label} {selectedYear}
        </h2>

        {departments.length === 0 ? (
          <p className="text-gray-500">Nenhum departamento cadastrado.</p>
        ) : (
          <div className="space-y-4">
            {departments.map((dept) => {
              const planned = plannedHours.find(ph => ph.departmentId === dept.id)
              return (
                <PlannedHoursForm
                  key={dept.id}
                  department={dept}
                  month={selectedMonth}
                  year={selectedYear}
                  initialData={planned || undefined}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

