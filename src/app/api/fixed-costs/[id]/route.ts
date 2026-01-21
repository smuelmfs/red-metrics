import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { createAuditLog } from '@/lib/business-logic/audit'
import { z } from 'zod'

const fixedCostCategorySchema = z.enum(['Aluguel', 'Utilidades', 'Software', 'Viaturas', 'Outros'])

const updateFixedCostSchema = z.object({
  name: z.string().min(1).optional(),
  category: fixedCostCategorySchema.optional(),
  monthlyAmount: z.number().positive().optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  startDate: z.union([
    z.string().datetime(),
    z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data de início inválida' }),
    z.date()
  ]).optional(),
  endDate: z.union([
    z.string().datetime(),
    z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data de término inválida' }),
    z.date()
  ]).optional().nullable(),
})

// GET /api/fixed-costs/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fixedCost = await prisma.fixedCost.findUnique({
      where: { id: params.id }
    })

    if (!fixedCost) {
      return NextResponse.json({ error: 'Fixed cost not found' }, { status: 404 })
    }

    return NextResponse.json(fixedCost)
  } catch (error) {
    console.error('Error fetching fixed cost:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/fixed-costs/[id]
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

    const oldFixedCost = await prisma.fixedCost.findUnique({
      where: { id: params.id }
    })

    if (!oldFixedCost) {
      return NextResponse.json({ error: 'Fixed cost not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateFixedCostSchema.parse(body)

    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.monthlyAmount !== undefined) updateData.monthlyAmount = new Decimal(validatedData.monthlyAmount)
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate instanceof Date 
        ? validatedData.startDate 
        : new Date(validatedData.startDate)
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate 
        ? (validatedData.endDate instanceof Date 
            ? validatedData.endDate 
            : new Date(validatedData.endDate))
        : null
    }

    const fixedCost = await prisma.fixedCost.update({
      where: { id: params.id },
      data: updateData
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'FixedCost',
      entityId: fixedCost.id,
      action: 'UPDATE',
      oldValue: oldFixedCost,
      newValue: fixedCost,
    })

    return NextResponse.json(fixedCost)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating fixed cost:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/fixed-costs/[id]
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

    const fixedCost = await prisma.fixedCost.findUnique({
      where: { id: params.id }
    })

    if (!fixedCost) {
      return NextResponse.json({ error: 'Fixed cost not found' }, { status: 404 })
    }

    await prisma.fixedCost.delete({
      where: { id: params.id }
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'FixedCost',
      entityId: params.id,
      action: 'DELETE',
      oldValue: fixedCost,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fixed cost:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

