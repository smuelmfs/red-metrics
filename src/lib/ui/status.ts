/**
 * Helper unificado para status visual
 * 
 * Centraliza mapeamento de PerformanceStatus do domínio para classes CSS.
 * UI nunca deve decidir cores baseado em números - apenas mapeia status.
 */

import { PerformanceStatus } from '@/modules/dashboards'

/**
 * Retorna classes CSS para texto baseado em status
 */
export function getStatusTextClasses(status: PerformanceStatus | null): string {
  if (status === 'good') return 'text-green-600'
  if (status === 'warning') return 'text-yellow-600'
  if (status === 'bad') return 'text-red-600'
  return 'text-gray-600'
}

/**
 * Retorna classes CSS para background + texto baseado em status
 */
export function getStatusBadgeClasses(status: PerformanceStatus | null): string {
  if (status === 'good') return 'text-green-600 bg-green-50'
  if (status === 'warning') return 'text-yellow-600 bg-yellow-50'
  if (status === 'bad') return 'text-red-600 bg-red-50'
  return 'text-gray-600 bg-gray-50'
}

/**
 * Retorna classes CSS para card/border baseado em status
 */
export function getStatusCardClasses(status: PerformanceStatus | null): string {
  if (status === 'good') return 'border-green-200 bg-green-50'
  if (status === 'warning') return 'border-yellow-200 bg-yellow-50'
  if (status === 'bad') return 'border-red-200 bg-red-50'
  return 'border-gray-200 bg-gray-50'
}

