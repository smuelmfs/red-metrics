import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createObjectiveSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { calculateDepartmentResult } from '@/lib/business-logic/calculations'

// GET /api/objectives
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const objectives = await prisma.objective.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(month && year && { month: parseInt(month), year: parseInt(year) })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    return NextResponse.json(objectives)
  } catch (error) {
    console.error('Error fetching objectives:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/objectives
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createObjectiveSchema.parse(body)

    const objective = await prisma.objective.upsert({
      where: {
        departmentId_month_year: {
          departmentId: validatedData.departmentId,
          month: validatedData.month,
          year: validatedData.year
        }
      },
      create: {
        departmentId: validatedData.departmentId,
        month: validatedData.month,
        year: validatedData.year,
        targetValue: validatedData.targetValue
      },
      update: {
        targetValue: validatedData.targetValue
      }
    })

    // Recalcular resultado
    await calculateDepartmentResult(
      validatedData.departmentId,
      validatedData.month,
      validatedData.year
    )

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'Objective',
      entityId: objective.id,
      action: 'UPDATE',
      newValue: objective,
      departmentId: validatedData.departmentId
    })

    return NextResponse.json(objective, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating/updating objective:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

