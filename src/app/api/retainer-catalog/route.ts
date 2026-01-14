import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRetainerCatalogSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'
import { Decimal } from '@prisma/client/runtime/library'

// GET /api/retainer-catalog
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const catalog = await prisma.retainerCatalog.findMany({
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
        }
      },
      orderBy: [
        { department: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(catalog)
  } catch (error) {
    console.error('Error fetching retainer catalog:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/retainer-catalog
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
    const validatedData = createRetainerCatalogSchema.parse(body)

    // Calcular custo mensal e margem se necessário
    let monthlyCost = null
    let monthlyMargin = null
    let marginPercentage = null

    if (validatedData.internalHourlyCost && validatedData.hoursPerMonth) {
      monthlyCost = validatedData.internalHourlyCost * validatedData.hoursPerMonth
      monthlyMargin = validatedData.monthlyPrice - monthlyCost
      marginPercentage = validatedData.monthlyPrice > 0
        ? (monthlyMargin / validatedData.monthlyPrice) * 100
        : 0
    }

    const catalogItem = await prisma.retainerCatalog.create({
      data: {
        name: validatedData.name,
        departmentId: validatedData.departmentId,
        monthlyPrice: new Decimal(validatedData.monthlyPrice),
        hoursPerMonth: new Decimal(validatedData.hoursPerMonth),
        internalHourlyCost: validatedData.internalHourlyCost
          ? new Decimal(validatedData.internalHourlyCost)
          : null,
        monthlyCost: monthlyCost ? new Decimal(monthlyCost) : null,
        monthlyMargin: monthlyMargin ? new Decimal(monthlyMargin) : null,
        marginPercentage: marginPercentage ? new Decimal(marginPercentage) : null,
        baseHours: validatedData.baseHours ? new Decimal(validatedData.baseHours) : null,
        basePrice: validatedData.basePrice ? new Decimal(validatedData.basePrice) : null
      },
      include: {
        department: true
      }
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'RetainerCatalog',
      entityId: catalogItem.id,
      action: 'CREATE',
      newValue: catalogItem,
      departmentId: validatedData.departmentId
    })

    return NextResponse.json(catalogItem, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating retainer catalog item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

