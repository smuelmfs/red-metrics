import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

// GET /api/dashboard/available-periods
// Retorna todos os meses/anos disponíveis no banco de dados
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar todos os períodos únicos (mês/ano) que têm resultados
    const periods = await prisma.result.findMany({
      select: {
        month: true,
        year: true
      },
      distinct: ['month', 'year'],
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    // Também buscar períodos que têm objetivos ou horas planejadas (mesmo sem resultados)
    const objectivesPeriods = await prisma.objective.findMany({
      select: {
        month: true,
        year: true
      },
      distinct: ['month', 'year']
    })

    const plannedHoursPeriods = await prisma.plannedHours.findMany({
      select: {
        month: true,
        year: true
      },
      distinct: ['month', 'year']
    })

    // Combinar todos os períodos únicos
    const allPeriods = new Set<string>()
    periods.forEach(p => allPeriods.add(`${p.year}-${p.month}`))
    objectivesPeriods.forEach(p => allPeriods.add(`${p.year}-${p.month}`))
    plannedHoursPeriods.forEach(p => allPeriods.add(`${p.year}-${p.month}`))

    // Converter de volta para objetos e ordenar
    const uniquePeriods = Array.from(allPeriods)
      .map(period => {
        const [year, month] = period.split('-').map(Number)
        return { year, month }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

    return NextResponse.json({ periods: uniquePeriods })
  } catch (error: any) {
    console.error('Error fetching available periods:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

