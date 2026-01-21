import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRetainerSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { calculateDepartmentResult } from '@/lib/business-logic/calculations'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateRetainerMonthlyRevenue } from '@/modules/retainers'

// GET /api/retainers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const retainers = await prisma.retainer.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(activeOnly && { isActive: true })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        catalog: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(retainers)
  } catch (error) {
    console.error('Error fetching retainers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/retainers
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
    const validatedData = createRetainerSchema.parse(body)

    // Calcular receita mensal (regra centralizada em modules/retainers)
    const pricing = calculateRetainerMonthlyRevenue(
      validatedData.monthlyPrice,
      validatedData.quantity || 1
    )

    const retainer = await prisma.retainer.create({
      data: {
        departmentId: validatedData.departmentId,
        catalogId: validatedData.catalogId,
        name: validatedData.name,
        type: validatedData.type,
        monthlyPrice: new Decimal(pricing.monthlyPrice),
        quantity: pricing.quantity,
        monthlyRevenue: new Decimal(pricing.monthlyRevenue),
        hoursPerMonth: validatedData.hoursPerMonth,
        variableCostPerMonth: validatedData.variableCostPerMonth,
        monthlyChurn: validatedData.monthlyChurn,
        newRetainersPerMonth: validatedData.newRetainersPerMonth,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        notes: validatedData.notes
      },
      include: {
        department: true,
        catalog: true
      }
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'Retainer',
      entityId: retainer.id,
      action: 'CREATE',
      newValue: retainer,
      departmentId: validatedData.departmentId
    })

    // Recalcular resultados do mês atual e próximos meses
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    // Recalcular mês atual e próximos 3 meses
    for (let i = 0; i < 4; i++) {
      const month = currentMonth + i > 12 ? currentMonth + i - 12 : currentMonth + i
      const year = currentMonth + i > 12 ? currentYear + 1 : currentYear
      try {
        await calculateDepartmentResult(validatedData.departmentId, month, year)
      } catch (error) {
        // Ignora erros se não houver dados para aquele mês
      }
    }

    return NextResponse.json(retainer, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating retainer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

