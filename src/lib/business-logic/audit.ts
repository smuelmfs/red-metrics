import { prisma } from '../prisma'

export type EntityType = 
  | 'Department' 
  | 'Objective' 
  | 'PlannedHours' 
  | 'Retainer' 
  | 'RetainerCatalog'
  | 'GlobalSetting'

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
 */
export async function createAuditLog(data: AuditLogData) {
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

