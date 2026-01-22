import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OdooIntegrationPage from '@/components/odoo/OdooIntegrationPage'

export default async function OdooPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  // Apenas admins podem acessar
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <OdooIntegrationPage />
}

