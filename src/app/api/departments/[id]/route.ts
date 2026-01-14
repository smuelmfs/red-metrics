import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateDepartmentSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { calculateDepartmentAnnualMetrics } from '@/lib/business-logic/calculations'

// GET /api/departments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        plannedHours: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12
        },
        objectives: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12
        },
        retainers: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' }
        },
        results: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12
        }
      }
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/departments/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const oldDepartment = await prisma.department.findUnique({
      where: { id: params.id }
    })

    if (!oldDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateDepartmentSchema.parse(body)

    const department = await prisma.department.update({
      where: { id: params.id },
      data: validatedData
    })

    // Recalcular métricas se necessário
    if (
      validatedData.billableHeadcount ||
      validatedData.costPerPersonPerMonth ||
      validatedData.targetUtilization ||
      validatedData.averageHourlyRate
    ) {
      await calculateDepartmentAnnualMetrics(department.id)
    }

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'Department',
      entityId: department.id,
      action: 'UPDATE',
      oldValue: oldDepartment,
      newValue: department,
      departmentId: department.id
    })

    return NextResponse.json(department)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/departments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id }
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    await prisma.department.delete({
      where: { id: params.id }
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'Department',
      entityId: params.id,
      action: 'DELETE',
      oldValue: department,
      departmentId: params.id
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

