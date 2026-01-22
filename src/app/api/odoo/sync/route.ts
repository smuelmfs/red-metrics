import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncOdooHours } from '@/lib/integrations/odoo/service'

// POST - Sincronizar horas do Odoo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { month, year, billingTypes } = body

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: month, year' },
        { status: 400 }
      )
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Mês deve estar entre 1 e 12' },
        { status: 400 }
      )
    }

    // Validar que o ano é >= 2026
    if (year < 2026) {
      return NextResponse.json(
        { error: 'Apenas anos a partir de 2026 são permitidos' },
        { status: 400 }
      )
    }

    // Validar billingTypes se fornecido
    const validBillingTypes = ['fixed_price', 'timesheet', 'milestone', 'manual']
    if (billingTypes && Array.isArray(billingTypes)) {
      const invalidTypes = billingTypes.filter((t: string) => !validBillingTypes.includes(t))
      if (invalidTypes.length > 0) {
        return NextResponse.json(
          { error: `Tipos de faturamento inválidos: ${invalidTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const result = await syncOdooHours(month, year, billingTypes)
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    })
  } catch (error: any) {
    console.error('Error syncing Odoo hours:', error)
    return NextResponse.json(
      { 
        success: false,
        syncedCount: 0,
        errors: [error.message || 'Erro ao sincronizar horas do Odoo'],
        lastSyncAt: new Date()
      },
      { status: 500 }
    )
  }
}

