import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar status de cada componente do sistema
    const [
      usersCount,
      settingsCount,
      departmentsCount,
      plannedHoursCount,
      objectivesCount,
      fixedCostsCount,
      retainersCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.globalSetting.count(),
      prisma.department.count({ where: { isActive: true } }),
      prisma.plannedHours.count(),
      prisma.objective.count(),
      prisma.fixedCost.count({ where: { isActive: true } }),
      prisma.retainer.count({ where: { isActive: true } })
    ])

    // Verificar se as configurações essenciais existem
    const requiredSettings = [
      'targetMargin',
      'hoursPerMonth',
      'targetUtilization',
      'costPerPersonPerMonth',
      'overheadPeople'
    ]
    
    const existingSettings = await prisma.globalSetting.findMany({
      where: {
        key: { in: requiredSettings }
      },
      select: { key: true }
    })
    
    const existingSettingsKeys = existingSettings.map(s => s.key)
    const missingSettings = requiredSettings.filter(key => !existingSettingsKeys.includes(key))

    // Verificar se há departamentos com dados completos
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const departmentsWithData = await prisma.department.findMany({
      where: {
        isActive: true,
        plannedHours: {
          some: {
            month: currentMonth,
            year: currentYear
          }
        }
      },
      select: { id: true }
    })

    const status = {
      users: {
        completed: usersCount > 0,
        count: usersCount,
        message: usersCount > 0 ? 'Usuários configurados' : 'Nenhum usuário encontrado'
      },
      settings: {
        completed: missingSettings.length === 0,
        count: settingsCount,
        missing: missingSettings,
        message: missingSettings.length === 0 
          ? 'Todas as configurações globais estão definidas'
          : `Faltam configurações: ${missingSettings.join(', ')}`
      },
      departments: {
        completed: departmentsCount > 0,
        count: departmentsCount,
        message: departmentsCount > 0 
          ? `${departmentsCount} departamento(s) configurado(s)`
          : 'Nenhum departamento criado'
      },
      plannedHours: {
        completed: plannedHoursCount > 0,
        count: plannedHoursCount,
        message: plannedHoursCount > 0
          ? 'Horas planejadas configuradas'
          : 'Nenhuma hora planejada registrada (opcional)'
      },
      objectives: {
        completed: objectivesCount > 0,
        count: objectivesCount,
        message: objectivesCount > 0
          ? 'Objetivos definidos'
          : 'Nenhum objetivo definido (opcional)'
      },
      fixedCosts: {
        completed: fixedCostsCount > 0,
        count: fixedCostsCount,
        message: fixedCostsCount > 0
          ? `${fixedCostsCount} custo(s) fixo(s) configurado(s)`
          : 'Nenhum custo fixo configurado (opcional)'
      },
      retainers: {
        completed: retainersCount > 0,
        count: retainersCount,
        message: retainersCount > 0
          ? `${retainersCount} retainer(s) ativo(s)`
          : 'Nenhum retainer configurado (opcional)'
      },
      departmentsWithData: {
        completed: departmentsWithData.length > 0,
        count: departmentsWithData.length,
        message: departmentsWithData.length > 0
          ? `${departmentsWithData.length} departamento(s) com dados para ${currentMonth}/${currentYear}`
          : `Nenhum departamento com dados para ${currentMonth}/${currentYear}`
      }
    }

    // Determinar se o sistema está completamente configurado
    const isFullyConfigured = 
      status.users.completed &&
      status.settings.completed &&
      status.departments.completed &&
      status.departmentsWithData.completed

    return NextResponse.json({
      status,
      isFullyConfigured,
      progress: {
        essential: {
          completed: status.users.completed && status.settings.completed && status.departments.completed,
          steps: 3,
          completedSteps: [
            status.users.completed,
            status.settings.completed,
            status.departments.completed
          ].filter(Boolean).length
        },
        optional: {
          completed: status.plannedHours.completed || status.objectives.completed || status.fixedCosts.completed || status.retainers.completed,
          steps: 4,
          completedSteps: [
            status.plannedHours.completed,
            status.objectives.completed,
            status.fixedCosts.completed,
            status.retainers.completed
          ].filter(Boolean).length
        }
      }
    })
  } catch (error: any) {
    console.error('Error checking setup status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do sistema', details: error.message },
      { status: 500 }
    )
  }
}

