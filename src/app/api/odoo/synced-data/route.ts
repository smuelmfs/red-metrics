import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/odoo/synced-data
 * Retorna departamentos e horas sincronizados do Odoo
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null

    // Buscar PlannedHours sincronizados do Odoo
    // IMPORTANTE: Filtrar apenas registros com horas > 0 para evitar mostrar departamentos sem dados
    const where: any = {
      syncedFromOdoo: true,
      actualBillableHours: {
        gt: 0 // Apenas horas > 0
      }
    }

    if (month) where.month = month
    if (year) where.year = year

    const syncedHours = await prisma.plannedHours.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { department: { name: 'asc' } }
      ]
    })

    // Debug: log para verificar se há dados
    console.log(`[Odoo Synced Data] Encontrados ${syncedHours.length} registros com syncedFromOdoo=true`)
    if (syncedHours.length > 0) {
      console.log(`[Odoo Synced Data] Primeiro registro:`, {
        id: syncedHours[0].id,
        departmentId: syncedHours[0].departmentId,
        month: syncedHours[0].month,
        year: syncedHours[0].year,
        syncedFromOdoo: syncedHours[0].syncedFromOdoo,
        actualBillableHours: syncedHours[0].actualBillableHours
      })
    }

    // Agrupar por departamento e mês/ano
    const groupedData = syncedHours.map(ph => ({
      id: ph.id,
      departmentId: ph.departmentId,
      departmentName: ph.department.name,
      departmentCode: ph.department.code,
      month: ph.month,
      year: ph.year,
      actualBillableHours: ph.actualBillableHours ? Number(ph.actualBillableHours) : 0,
      lastSyncedAt: ph.lastSyncedAt?.toISOString() || null
    }))

    // Estatísticas gerais
    const stats = {
      totalDepartments: new Set(syncedHours.map(ph => ph.departmentId)).size,
      totalRecords: syncedHours.length,
      totalHours: syncedHours.reduce((sum, ph) => sum + (ph.actualBillableHours ? Number(ph.actualBillableHours) : 0), 0),
      lastSyncDate: syncedHours.length > 0 
        ? syncedHours.reduce((latest, ph) => {
            if (!ph.lastSyncedAt) return latest
            if (!latest) return ph.lastSyncedAt
            return ph.lastSyncedAt > latest ? ph.lastSyncedAt : latest
          }, null as Date | null)?.toISOString() || null
        : null
    }

    return NextResponse.json({
      data: groupedData,
      stats
    })
  } catch (error: any) {
    console.error('Erro ao buscar dados sincronizados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados sincronizados', details: error.message },
      { status: 500 }
    )
  }
}

