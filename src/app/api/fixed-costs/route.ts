import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { createAuditLog } from '@/lib/business-logic/audit'
import { z } from 'zod'

const fixedCostCategorySchema = z.enum(['Aluguel', 'Utilidades', 'Software', 'Viaturas', 'Outros'])

const createFixedCostSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: fixedCostCategorySchema,
  monthlyAmount: z.number().positive('Valor mensal deve ser positivo'),
  description: z.string().optional().nullable(),
  startDate: z.union([
    z.string().datetime(),
    z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data de início inválida' }),
    z.date()
  ]),
  endDate: z.union([
    z.string().datetime(),
    z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data de término inválida' }),
    z.date()
  ]).optional().nullable(),
})

const updateFixedCostSchema = createFixedCostSchema.partial()

// GET /api/fixed-costs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const category = searchParams.get('category')

    const fixedCosts = await prisma.fixedCost.findMany({
      where: {
        ...(activeOnly && { isActive: true }),
        ...(category && { category }),
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(fixedCosts)
  } catch (error) {
    console.error('Error fetching fixed costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/fixed-costs
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
    const validatedData = createFixedCostSchema.parse(body)

    const fixedCost = await prisma.fixedCost.create({
      data: {
        name: validatedData.name,
        category: validatedData.category,
        monthlyAmount: new Decimal(validatedData.monthlyAmount),
        description: validatedData.description || null,
        startDate: validatedData.startDate instanceof Date 
          ? validatedData.startDate 
          : new Date(validatedData.startDate),
        endDate: validatedData.endDate 
          ? (validatedData.endDate instanceof Date 
              ? validatedData.endDate 
              : new Date(validatedData.endDate))
          : null,
      }
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      entityType: 'FixedCost',
      entityId: fixedCost.id,
      action: 'CREATE',
      newValue: fixedCost,
    })

    return NextResponse.json(fixedCost, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating fixed cost:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

