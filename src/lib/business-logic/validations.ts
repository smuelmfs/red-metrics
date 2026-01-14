import { z } from 'zod'

// Department validations
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  billableHeadcount: z.number().int().positive('Headcount must be positive'),
  costPerPersonPerMonth: z.number().positive().optional(),
  targetUtilization: z.number().min(0).max(1).optional(),
  averageHourlyRate: z.number().positive('Hourly rate must be positive')
})

export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  isActive: z.boolean().optional()
})

// Planned Hours validations
export const createPlannedHoursSchema = z.object({
  departmentId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  billableHeadcount: z.number().int().positive().optional(),
  targetHoursPerMonth: z.number().positive().optional(),
  targetUtilization: z.number().min(0).max(1).optional(),
  actualBillableHours: z.number().nonnegative().optional(),
  projectRevenue: z.number().nonnegative().optional()
})

// Objective validations
export const createObjectiveSchema = z.object({
  departmentId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  targetValue: z.number().positive('Target value must be positive')
})

// Retainer validations
export const createRetainerSchema = z.object({
  departmentId: z.string().min(1),
  catalogId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  monthlyPrice: z.number().positive('Monthly price must be positive'),
  quantity: z.number().int().positive().default(1),
  hoursPerMonth: z.number().nonnegative().optional(),
  variableCostPerMonth: z.number().nonnegative().optional(),
  monthlyChurn: z.number().min(0).max(1).optional(),
  newRetainersPerMonth: z.number().int().nonnegative().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional()
})

// Retainer Catalog validations
export const createRetainerCatalogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  departmentId: z.string().min(1),
  monthlyPrice: z.number().positive('Monthly price must be positive'),
  hoursPerMonth: z.number().positive('Hours per month must be positive'),
  internalHourlyCost: z.number().nonnegative().optional(),
  baseHours: z.number().positive().optional(),
  basePrice: z.number().positive().optional()
})

// Global Setting validations
export const createGlobalSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
  description: z.string().optional()
})

