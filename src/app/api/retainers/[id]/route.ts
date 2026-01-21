import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRetainerSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateRetainerMonthlyRevenue } from '@/modules/retainers'
import { calculateDepartmentResult } from '@/lib/business-logic/calculations'

// GET /api/retainers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const retainer = await prisma.retainer.findUnique({
      where: { id: params.id }
    })

    if (!retainer) {
      return NextResponse.json({ error: 'Retainer not found' }, { status: 404 })
    }

    return NextResponse.json(retainer)
  } catch (error) {
    console.error('Error fetching retainer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/retainers/[id]
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

    const existing = await prisma.retainer.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Retainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createRetainerSchema.partial().parse(body)

    // Calcular receita mensal com base em price x quantity (se fornecidos)
    const monthlyPrice = validatedData.monthlyPrice ?? Number(existing.monthlyPrice)
    const quantity = validatedData.quantity ?? existing.quantity

    const pricing = calculateRetainerMonthlyRevenue(
      monthlyPrice,
      quantity
    )

    const updated = await prisma.retainer.update({
      where: { id: params.id },
      data: {
        departmentId: validatedData.departmentId ?? existing.departmentId,
        catalogId: validatedData.catalogId ?? existing.catalogId,
        name: validatedData.name ?? existing.name,
        type: validatedData.type ?? existing.type,
        monthlyPrice: new Decimal(pricing.monthlyPrice),
        quantity: pricing.quantity,
        monthlyRevenue: new Decimal(pricing.monthlyRevenue),
        hoursPerMonth: validatedData.hoursPerMonth ?? existing.hoursPerMonth,
        variableCostPerMonth: validatedData.variableCostPerMonth ?? existing.variableCostPerMonth,
        monthlyChurn: validatedData.monthlyChurn ?? existing.monthlyChurn,
        newRetainersPerMonth: validatedData.newRetainersPerMonth ?? existing.newRetainersPerMonth,
        startDate: validatedData.startDate ?? existing.startDate,
        endDate: validatedData.endDate ?? existing.endDate,
        notes: validatedData.notes ?? existing.notes
      }
    })

    await createAuditLog({
      userId: session.user.id,
      entityType: 'Retainer',
      entityId: updated.id,
      action: 'UPDATE',
      oldValue: existing,
      newValue: updated,
      departmentId: updated.departmentId
    })

    // Recalcular resultados do mês atual e próximos meses para o departamento impactado
    const departmentId = updated.departmentId
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    for (let i = 0; i < 4; i++) {
      const rawMonth = currentMonth + i
      const month = rawMonth > 12 ? rawMonth - 12 : rawMonth
      const year = rawMonth > 12 ? currentYear + 1 : currentYear
      try {
        await calculateDepartmentResult(departmentId, month, year)
      } catch {
        // Ignora erros se não houver dados suficientes para aquele mês
      }
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating retainer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


