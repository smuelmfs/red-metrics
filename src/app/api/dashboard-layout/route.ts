import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Buscar layout do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Por enquanto, vamos usar localStorage no cliente
    // Mas podemos salvar no banco se necessário
    return NextResponse.json({ message: 'Use localStorage no cliente' })
  } catch (error: any) {
    console.error('Error fetching dashboard layout:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar layout' },
      { status: 500 }
    )
  }
}

// POST - Salvar layout do usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { widgets } = body

    // Por enquanto, vamos usar localStorage no cliente
    // Mas podemos salvar no banco se necessário
    // Exemplo futuro: salvar em UserPreferences ou similar

    return NextResponse.json({ 
      message: 'Layout salvo (usando localStorage)',
      widgets 
    })
  } catch (error: any) {
    console.error('Error saving dashboard layout:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar layout' },
      { status: 500 }
    )
  }
}

