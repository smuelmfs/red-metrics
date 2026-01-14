import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/ui/Sidebar'
import MobileHeaderWrapper from '@/components/ui/MobileHeaderWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - apenas visível em desktop (lg+) */}
      <div className="hidden lg:block">
        <Sidebar
          userRole={session.user.role}
          userName={session.user.name}
          userEmail={session.user.email}
        />
      </div>
      <main className="flex-1 overflow-y-auto">
        <MobileHeaderWrapper
          userRole={session.user.role}
          userName={session.user.name}
          userEmail={session.user.email}
        />
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

