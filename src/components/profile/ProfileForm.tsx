'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'

interface ProfileFormProps {
  userId: string
  initialName?: string
}

export default function ProfileForm({ userId, initialName = '' }: ProfileFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const { update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialName,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar senha se fornecida
      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          addToast('A senha deve ter pelo menos 6 caracteres', 'error')
          setLoading(false)
          return
        }

        if (formData.newPassword !== formData.confirmPassword) {
          addToast('As senhas não coincidem', 'error')
          setLoading(false)
          return
        }

        if (!formData.currentPassword) {
          addToast('Digite a senha atual para alterar', 'error')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name || undefined,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil')
      }

      addToast('Perfil atualizado com sucesso', 'success')

      // Atualizar sessão do NextAuth para refletir mudanças na sidebar
      await updateSession()

      // Limpar campos de senha
      setFormData({
        name: formData.name,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      router.refresh()
    } catch (error: any) {
      addToast(error.message || 'Erro ao atualizar perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Seu nome completo"
          />
        </div>

        {/* Senha atual */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Senha Atual
          </label>
          <input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite sua senha atual (obrigatório para alterar)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Obrigatório apenas se desejar alterar a senha
          </p>
        </div>

        {/* Nova senha */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Nova Senha
          </label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Deixe em branco para manter a senha atual"
          />
        </div>

        {/* Confirmar senha */}
        {formData.newPassword && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Confirme a nova senha"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-semibold text-base shadow-sm flex items-center justify-center gap-2 min-w-[180px]"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="!flex" />
                <span>Salvando...</span>
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

