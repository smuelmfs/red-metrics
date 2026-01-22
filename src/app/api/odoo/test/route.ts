import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { testOdooConnection } from '@/lib/integrations/odoo/service'

// POST - Testar conexão com Odoo
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const result = await testOdooConnection()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error testing Odoo connection:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Erro ao testar conexão com Odoo' 
      },
      { status: 500 }
    )
  }
}

