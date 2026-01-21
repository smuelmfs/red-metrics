import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  // Apenas admins podem acessar
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Buscar todas as configurações globais
  const settings = await prisma.globalSetting.findMany({
    orderBy: { key: 'asc' }
  })

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Configurações Globais</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
          Gerencie as configurações globais do sistema
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}

