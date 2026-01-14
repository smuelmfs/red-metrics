import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createGlobalSettingSchema } from '@/lib/business-logic/validations'
import { createAuditLog } from '@/lib/business-logic/audit'

// GET - Listar todas as configurações globais
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins podem ver configurações
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const settings = await prisma.globalSetting.findMany({
      orderBy: { key: 'asc' }
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error fetching global settings:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar configurações
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins podem atualizar configurações
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body // Array de { key, value }

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Formato inválido. Esperado array de settings.' },
        { status: 400 }
      )
    }

    const updatedSettings = []

    for (const setting of settings) {
      const validated = createGlobalSettingSchema.partial().parse(setting)
      
      // Buscar setting atual para audit
      const currentSetting = await prisma.globalSetting.findUnique({
        where: { key: validated.key }
      })

      if (!currentSetting) {
        return NextResponse.json(
          { error: `Configuração não encontrada: ${validated.key}` },
          { status: 404 }
        )
      }

      // Atualizar
      const updated = await prisma.globalSetting.update({
        where: { key: validated.key },
        data: {
          value: validated.value,
          description: validated.description,
          updatedBy: session.user.id
        }
      })

      // Log de auditoria
      await createAuditLog({
        userId: session.user.id,
        entityType: 'GlobalSetting',
        entityId: updated.id,
        action: 'UPDATE',
        oldValue: { value: currentSetting.value },
        newValue: { value: updated.value }
      })

      updatedSettings.push(updated)
    }

    return NextResponse.json({ 
      message: 'Configurações atualizadas com sucesso',
      settings: updatedSettings 
    })
  } catch (error: any) {
    console.error('Error updating global settings:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}

