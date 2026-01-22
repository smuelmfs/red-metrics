/**
 * Tipos para integração com Odoo
 */

export interface OdooConfig {
  baseUrl: string
  database: string
  username: string
  password: string
  apiType: 'xmlrpc' | 'jsonrpc'
}

export interface OdooDepartment {
  id: number
  name: string
  code?: string
}

export interface OdooTimesheetLine {
  id: number
  employee_id: [number, string] // [id, name]
  department_id?: [number, string] // [id, name]
  date: string // YYYY-MM-DD
  unit_amount: number // Horas trabalhadas
  billable?: boolean
  project_id?: [number, string]
  task_id?: [number, string]
}

export interface OdooSyncResult {
  success: boolean
  syncedCount: number
  errors: string[]
  lastSyncAt: Date
}

export type BillingType = 'fixed_price' | 'timesheet' | 'milestone' | 'manual' | 'all'

export interface OdooHoursData {
  departmentId: number
  departmentName: string
  month: number
  year: number
  totalHours: number
  billingType?: BillingType
}

