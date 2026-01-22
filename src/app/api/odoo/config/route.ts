import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getOdooIntegration, 
  getAllOdooIntegrations,
  upsertOdooIntegration,
  testOdooConnection,
  initializeOdooFromEnv
} from '@/lib/integrations/odoo/service'

// GET - Obter configuração atual
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admins podem ver configuração
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Tentar inicializar automaticamente a partir de variáveis de ambiente se não houver configuração
    await initializeOdooFromEnv()
    
    const integration = await getOdooIntegration()
    
    if (!integration) {
      return NextResponse.json(null)
    }

    // Não retornar senha descriptografada
    return NextResponse.json({
      id: integration.id,
      isEnabled: integration.isEnabled,
      baseUrl: integration.baseUrl,
      database: integration.database,
      username: integration.username,
      apiType: integration.apiType,
      syncFrequency: integration.syncFrequency,
      lastSyncAt: integration.lastSyncAt,
      lastSyncStatus: integration.lastSyncStatus,
      lastSyncError: integration.lastSyncError,
      departmentMappings: integration.departmentMappings.map(m => ({
        id: m.id,
        departmentId: m.departmentId,
        departmentName: m.department.name,
        odooDepartmentId: m.odooDepartmentId,
        odooDepartmentName: m.odooDepartmentName,
        mappingType: m.mappingType,
        isActive: m.isActive
      }))
    })
  } catch (error: any) {
    console.error('Error fetching Odoo config:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração do Odoo' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar configuração
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
    const { baseUrl, database, username, password, apiType, isEnabled } = body

    if (!baseUrl || !database || !username || !password) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: baseUrl, database, username, password' },
        { status: 400 }
      )
    }

    const integration = await upsertOdooIntegration({
      baseUrl,
      database,
      username,
      password,
      apiType: apiType || 'xmlrpc',
      isEnabled: isEnabled ?? true
    })

    return NextResponse.json({
      id: integration.id,
      isEnabled: integration.isEnabled,
      baseUrl: integration.baseUrl,
      database: integration.database,
      username: integration.username,
      apiType: integration.apiType
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error saving Odoo config:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar configuração do Odoo' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar configuração parcial
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const integration = await getOdooIntegration()

    if (!integration) {
      return NextResponse.json(
        { error: 'Configuração do Odoo não encontrada' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled
    if (body.baseUrl) updateData.baseUrl = body.baseUrl
    if (body.database) updateData.database = body.database
    if (body.username) updateData.username = body.username
    if (body.password) {
      // Criptografar senha antes de salvar
      const crypto = require('crypto')
      const ENCRYPTION_KEY = process.env.ODOO_ENCRYPTION_KEY || 'default-key-change-in-production'
      const ALGORITHM = 'aes-256-cbc'
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv)
      let encrypted = cipher.update(body.password, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      updateData.password = iv.toString('hex') + ':' + encrypted
    }
    if (body.apiType) updateData.apiType = body.apiType

    const { prisma } = await import('@/lib/prisma')
    const updated = await prisma.odooIntegration.update({
      where: { id: integration.id },
      data: updateData
    })

    return NextResponse.json({
      id: updated.id,
      isEnabled: updated.isEnabled,
      baseUrl: updated.baseUrl,
      database: updated.database,
      username: updated.username,
      apiType: updated.apiType
    })
  } catch (error: any) {
    console.error('Error updating Odoo config:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar configuração do Odoo' },
      { status: 500 }
    )
  }
}

