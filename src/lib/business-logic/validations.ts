import { z } from 'zod'

// Department validations
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  // Aceita números enviados como string (ex.: dos inputs HTML)
  billableHeadcount: z.coerce.number().int().positive('Headcount must be positive'),
  costPerPersonPerMonth: z.coerce.number().positive().optional(),
  targetUtilization: z.coerce.number().min(0).max(1).optional(),
  averageHourlyRate: z.coerce.number().positive('Hourly rate must be positive')
})

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Planned Hours validations
// Helper para converter valores para número ou null
const optionalNumber = z.preprocess((val) => {
  if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') {
    return null
  }
  const num = Number(val)
  return isNaN(num) ? null : num
}, z.number().nullable().optional())

export const createPlannedHoursSchema = z.object({
  departmentId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  // Usar preprocess para aceitar strings de inputs HTML e converter para número ou null
  billableHeadcount: z.preprocess((val) => {
    if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return null
    const num = Number(val)
    return isNaN(num) ? null : Math.floor(num)
  }, z.number().int().positive().nullable().optional()),
  targetHoursPerMonth: z.preprocess((val) => {
    if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }, z.number().positive().nullable().optional()),
  targetUtilization: z.preprocess((val) => {
    if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return null
    const num = Number(val)
    return isNaN(num) ? null : num
  }, z.number().min(0).max(1).nullable().optional()),
  targetAvailableHours: optionalNumber,
  actualBillableHours: optionalNumber,
  projectRevenue: optionalNumber
})

// Objective validations
export const createObjectiveSchema = z.object({
  departmentId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  targetValue: z.coerce.number().positive('Target value must be positive')
})

// Retainer validations
export const createRetainerSchema = z.object({
  departmentId: z.string().min(1),
  catalogId: z.string().nullish(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().nullish(),
  monthlyPrice: z.coerce.number().positive('Monthly price must be positive'),
  quantity: z.coerce.number().int().positive().default(1),
  hoursPerMonth: z.coerce.number().nonnegative().nullish(),
  variableCostPerMonth: z.coerce.number().nonnegative().nullish(),
  monthlyChurn: z.coerce.number().min(0).max(1).nullish(),
  newRetainersPerMonth: z.coerce.number().int().nonnegative().nullish(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullish(),
  notes: z.string().nullish()
})

// Retainer Catalog validations
export const createRetainerCatalogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  departmentId: z.string().min(1),
  monthlyPrice: z.coerce.number().positive('Monthly price must be positive'),
  hoursPerMonth: z.coerce.number().positive('Hours per month must be positive'),
  internalHourlyCost: z.coerce.number().nonnegative().nullish(),
  baseHours: z.coerce.number().positive().nullish(),
  basePrice: z.coerce.number().positive().nullish()
})

// Global Setting validations
export const createGlobalSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
  description: z.string().optional()
})

