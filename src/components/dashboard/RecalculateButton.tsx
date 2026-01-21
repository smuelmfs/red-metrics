'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

export default function RecalculateButton({ year, month }: { year: number; month?: number }) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleRecalculate = async () => {
    setLoading(true)
    try {
      // Recalcular todos os departamentos
      const departmentsResponse = await fetch('/api/departments?activeOnly=true')
      const departments = await departmentsResponse.json()

      let count = 0
      for (const dept of departments) {
        // Recalcular o ano inteiro
        await fetch('/api/results/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departmentId: dept.id,
            year,
            recalculateYear: true
          })
        })
        count++
      }

      // Se um mês específico foi fornecido, também recalcular esse mês para garantir
      if (month) {
        for (const dept of departments) {
          await fetch('/api/results/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              departmentId: dept.id,
              month,
              year
            })
          })
        }
      }

      addToast(`Resultados recalculados para ${count} departamento(s)!`, 'success')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Erro ao recalcular:', error)
      addToast('Erro ao recalcular resultados', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRecalculate}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold text-sm sm:text-base transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[200px]"
    >
      {loading ? (
        <>
          <Spinner size="sm" className="!flex" />
          <span className="whitespace-nowrap">Recalculando...</span>
        </>
      ) : (
        <span className="whitespace-nowrap">Recalcular Resultados</span>
      )}
    </button>
  )
}

