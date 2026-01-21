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

  // Se ainda não houver configurações no banco, mostrar inputs vazios
  const hasSettings = settings.length > 0

  const initialSettings = hasSettings
    ? settings
    : [
        {
          id: 'temp-targetMargin',
          key: 'targetMargin',
          value: '',
          description: 'Margem alvo (ex.: 0,30 = 30%)',
          updatedAt: new Date(),
          updatedBy: null
        },
        {
          id: 'temp-hoursPerMonth',
          key: 'hoursPerMonth',
          value: '',
          description: 'Horas de trabalho por mês',
          updatedAt: new Date(),
          updatedBy: null
        },
        {
          id: 'temp-targetUtilization',
          key: 'targetUtilization',
          value: '',
          description: 'Utilização faturável média (ex.: 0,65 = 65%)',
          updatedAt: new Date(),
          updatedBy: null
        },
        {
          id: 'temp-costPerPersonPerMonth',
          key: 'costPerPersonPerMonth',
          value: '',
          description: 'Custo médio por pessoa / mês (empresa)',
          updatedAt: new Date(),
          updatedBy: null
        },
        {
          id: 'temp-overheadPeople',
          key: 'overheadPeople',
          value: '',
          description: 'Nº pessoas NÃO faturáveis (overhead)',
          updatedAt: new Date(),
          updatedBy: null
        }
      ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Configurações Globais</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
          Gerencie as configurações globais do sistema
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings as any} />
    </div>
  )
}

