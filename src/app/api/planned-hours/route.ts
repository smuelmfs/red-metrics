import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPlannedHoursSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { calculateDepartmentResult } from '@/lib/business-logic/calculations'

// GET /api/planned-hours
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

    const plannedHours = await prisma.plannedHours.findMany({
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

    return NextResponse.json(plannedHours)
  } catch (error) {
    console.error('Error fetching planned hours:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/planned-hours
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
    const validatedData = createPlannedHoursSchema.parse(body)

    // Calcular horas disponíveis se necessário
    let targetAvailableHours = null
    if (validatedData.billableHeadcount && validatedData.targetHoursPerMonth && validatedData.targetUtilization) {
      targetAvailableHours = 
        validatedData.billableHeadcount * 
        validatedData.targetHoursPerMonth * 
        validatedData.targetUtilization
    }

    const plannedHours = await prisma.plannedHours.upsert({
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
        billableHeadcount: validatedData.billableHeadcount,
        targetHoursPerMonth: validatedData.targetHoursPerMonth,
        targetUtilization: validatedData.targetUtilization,
        targetAvailableHours: targetAvailableHours,
        actualBillableHours: validatedData.actualBillableHours,
        projectRevenue: validatedData.projectRevenue
      },
      update: {
        billableHeadcount: validatedData.billableHeadcount,
        targetHoursPerMonth: validatedData.targetHoursPerMonth,
        targetUtilization: validatedData.targetUtilization,
        targetAvailableHours: targetAvailableHours,
        actualBillableHours: validatedData.actualBillableHours,
        projectRevenue: validatedData.projectRevenue
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
      entityType: 'PlannedHours',
      entityId: plannedHours.id,
      action: 'UPDATE',
      newValue: plannedHours,
      departmentId: validatedData.departmentId
    })

    return NextResponse.json(plannedHours, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating/updating planned hours:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

