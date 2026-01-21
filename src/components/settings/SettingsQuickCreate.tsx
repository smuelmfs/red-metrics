'use client'

import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/toast'

/**
 * Permite colar/criar rapidamente as configurações globais
 * quando ainda não existe nenhum registro em GlobalSetting.
 */
export default function SettingsQuickCreate() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState(
    [
      'targetMargin=0.30|Margem alvo (ex.: 0,30 = 30%)',
      'hoursPerMonth=160|Horas de trabalho por mês',
      'targetUtilization=0.65|Utilização faturável média (ex.: 0,65 = 65%)',
      'costPerPersonPerMonth=2200|Custo médio por pessoa / mês (empresa)',
      'overheadPeople=6|Nº pessoas NÃO faturáveis (overhead)'
    ].join('\n')
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('#'))

      const settings = lines.map(line => {
        const [keyPart, rest] = line.split('=')
        if (!rest) {
          throw new Error(`Linha inválida (esperado formato key=value|descrição): "${line}"`)
        }
        const [valuePart, descriptionPart] = rest.split('|')

        const key = keyPart.trim()
        const value = valuePart.trim()
        const description = descriptionPart ? descriptionPart.trim() : undefined

        if (!key || !value) {
          throw new Error(`Linha inválida (chave ou valor vazio): "${line}"`)
        }

        return { key, value, description }
      })

      const response = await fetch('/api/global-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar configurações')
      }

      addToast('Configurações criadas com sucesso', 'success')
      // Recarregar a página para mostrar o formulário normal
      window.location.reload()
    } catch (error: any) {
      addToast(error.message || 'Erro ao criar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 lg:p-6 space-y-4">
      <div>
        <p className="text-sm text-gray-700 mb-2">
          Não existem configurações globais ainda. Cole ou edite as linhas abaixo no formato{' '}
          <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
            chave=valor|descrição
          </span>{' '}
          e clique em &quot;Criar Configurações&quot;.
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Exemplos já estão preenchidos: targetMargin, hoursPerMonth, targetUtilization,
          costPerPersonPerMonth, overheadPeople.
        </p>
        <textarea
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold text-sm shadow-sm flex items-center justify-center gap-2 min-w-[200px]"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="!flex" />
              <span>Criando...</span>
            </>
          ) : (
            'Criar Configurações'
          )}
        </button>
      </div>
    </form>
  )
}


