import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateDepartmentResult, recalculateDepartmentResultsForYear } from '@/lib/business-logic/calculations'

// POST /api/results/calculate
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { departmentId, month, year, recalculateYear } = body

    if (recalculateYear && departmentId && year) {
      // Recalcular todos os meses do ano
      const results = await recalculateDepartmentResultsForYear(departmentId, year)
      return NextResponse.json({ results, message: 'Year recalculated' })
    }

    if (departmentId && month && year) {
      const result = await calculateDepartmentResult(departmentId, month, year)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error calculating result:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

