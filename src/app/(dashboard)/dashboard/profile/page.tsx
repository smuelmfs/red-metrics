import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

  if (!user) {
    redirect('/')
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">Perfil</h1>
      <ProfileForm userId={user.id} initialName={user.name || ''} />
    </div>
  )
}

