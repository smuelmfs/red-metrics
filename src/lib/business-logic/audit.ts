import { prisma } from '../prisma'

export type EntityType = 
  | 'Department' 
  | 'Objective' 
  | 'PlannedHours' 
  | 'Retainer' 
  | 'RetainerCatalog'
  | 'GlobalSetting'
  | 'FixedCost'

export type Action = 'CREATE' | 'UPDATE' | 'DELETE'

interface AuditLogData {
  userId: string
  entityType: EntityType
  entityId: string
  action: Action
  oldValue?: any
  newValue?: any
  departmentId?: string
}

/**
 * Cria um log de auditoria
 * 
 * Se o usuário não existir no banco, o log não é criado (silenciosamente ignorado).
 * Isso evita erros quando o banco foi limpo mas ainda há sessões ativas.
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // Verificar se o usuário existe antes de criar o log
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true }
    })

    // Se o usuário não existir, não criar o log (banco pode ter sido limpo)
    if (!userExists) {
      console.warn(`Audit log skipped: User ${data.userId} does not exist`)
      return null
    }

    return await prisma.auditLog.create({
      data: {
        userId: data.userId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : null,
        newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : null,
        departmentId: data.departmentId
      }
    })
  } catch (error) {
    // Se houver qualquer erro ao criar o log, apenas logar e continuar
    // Não queremos que falhas de auditoria quebrem operações principais
    console.error('Error creating audit log:', error)
    return null
  }
}

/**
 * Busca logs de auditoria
 */
export async function getAuditLogs(filters?: {
  entityType?: EntityType
  entityId?: string
  userId?: string
  departmentId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  return await prisma.auditLog.findMany({
    where: {
      ...(filters?.entityType && { entityType: filters.entityType }),
      ...(filters?.entityId && { entityId: filters.entityId }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.departmentId && { departmentId: filters.departmentId }),
      ...(filters?.startDate && filters?.endDate && {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      })
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: filters?.limit || 100
  })
}

