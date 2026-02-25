import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SetupTutorialWizard from '@/components/setup/SetupTutorialWizard'

export default async function SetupPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return <SetupTutorialWizard />
}

