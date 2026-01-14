import { 
  User, 
  Department, 
  PlannedHours, 
  Objective, 
  Retainer, 
  RetainerCatalog, 
  Result, 
  GlobalSetting,
  Role 
} from '@prisma/client'

export type { 
  User, 
  Department, 
  PlannedHours, 
  Objective, 
  Retainer, 
  RetainerCatalog, 
  Result, 
  GlobalSetting,
  Role 
}

// Extended types with relations
export type DepartmentWithRelations = Department & {
  plannedHours: PlannedHours[]
  objectives: Objective[]
  retainers: Retainer[]
  results: Result[]
}

export type PlannedHoursWithDepartment = PlannedHours & {
  department: Department
}

export type ObjectiveWithDepartment = Objective & {
  department: Department
}

export type RetainerWithRelations = Retainer & {
  department: Department
  catalog: RetainerCatalog | null
}

export type ResultWithDepartment = Result & {
  department: Department
}

// DTOs for API
export interface CreateDepartmentDto {
  name: string
  code?: string
  billableHeadcount: number
  costPerPersonPerMonth?: number
  targetUtilization?: number
  averageHourlyRate: number
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {
  isActive?: boolean
}

export interface CreatePlannedHoursDto {
  departmentId: string
  month: number
  year: number
  billableHeadcount?: number
  targetHoursPerMonth?: number
  targetUtilization?: number
  actualBillableHours?: number
  projectRevenue?: number
}

export interface CreateObjectiveDto {
  departmentId: string
  month: number
  year: number
  targetValue: number
}

export interface CreateRetainerDto {
  departmentId: string
  catalogId?: string
  name: string
  type?: string
  monthlyPrice: number
  quantity?: number
  hoursPerMonth?: number
  variableCostPerMonth?: number
  monthlyChurn?: number
  newRetainersPerMonth?: number
  startDate: Date
  endDate?: Date
  notes?: string
}

export interface CreateRetainerCatalogDto {
  name: string
  departmentId: string
  monthlyPrice: number
  hoursPerMonth: number
  internalHourlyCost?: number
  baseHours?: number
  basePrice?: number
}

