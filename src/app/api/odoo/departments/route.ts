import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOdooConfig } from '@/lib/integrations/odoo/service'
import { OdooClient } from '@/lib/integrations/odoo/client'

// GET - Buscar departamentos do Odoo
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const config = await getOdooConfig()
    if (!config) {
      return NextResponse.json(
        { error: 'Configuração do Odoo não encontrada' },
        { status: 404 }
      )
    }

    const client = new OdooClient(config)
    const departments = await client.getDepartments()

    return NextResponse.json(departments)
  } catch (error: any) {
    console.error('Error fetching Odoo departments:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar departamentos do Odoo' },
      { status: 500 }
    )
  }
}

