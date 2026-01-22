import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { upsertDepartmentMapping } from '@/lib/integrations/odoo/service'
import { prisma } from '@/lib/prisma'

// POST - Criar ou atualizar mapeamento de departamento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { departmentId, odooDepartmentId, odooDepartmentName, mappingType } = body

    if (!departmentId || !odooDepartmentId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: departmentId, odooDepartmentId' },
        { status: 400 }
      )
    }

    const mapping = await upsertDepartmentMapping({
      departmentId,
      odooDepartmentId,
      odooDepartmentName,
      mappingType
    })

    return NextResponse.json(mapping, { status: 201 })
  } catch (error: any) {
    console.error('Error saving department mapping:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar mapeamento' },
      { status: 500 }
    )
  }
}

// GET - Listar todos os mapeamentos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const mappings = await prisma.odooDepartmentMapping.findMany({
      include: {
        department: true,
        odooIntegration: true
      },
      orderBy: {
        department: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json(mappings)
  } catch (error: any) {
    console.error('Error fetching department mappings:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mapeamentos' },
      { status: 500 }
    )
  }
}

