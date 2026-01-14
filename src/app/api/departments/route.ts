import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDepartmentSchema, updateDepartmentSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { calculateDepartmentAnnualMetrics } from '@/lib/business-logic/calculations'

// GET /api/departments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const departments = await prisma.department.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        _count: {
          select: {
            plannedHours: true,
            objectives: true,
            retainers: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/departments
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
    const validatedData = createDepartmentSchema.parse(body)

    const department = await prisma.department.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        billableHeadcount: validatedData.billableHeadcount,
        costPerPersonPerMonth: validatedData.costPerPersonPerMonth,
        targetUtilization: validatedData.targetUtilization || 0.65,
        averageHourlyRate: validatedData.averageHourlyRate
      }
    })

    // Calcular métricas anuais
    await calculateDepartmentAnnualMetrics(department.id)

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'Department',
      entityId: department.id,
      action: 'CREATE',
      newValue: department
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

