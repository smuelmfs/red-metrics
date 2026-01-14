'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import MobileHeader from './MobileHeader'
import Sidebar from './Sidebar'
import Logo from './Logo'
import { X } from 'lucide-react'

interface MobileHeaderWrapperProps {
  userRole?: string
  userName?: string | null
  userEmail?: string | null
}

export default function MobileHeaderWrapper({ userRole: propUserRole, userName: propUserName, userEmail: propUserEmail }: MobileHeaderWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  
  // Usar dados da sessão se disponíveis, senão usar props (fallback para SSR)
  const userRole = session?.user?.role || propUserRole || 'USER'
  const userName = session?.user?.name || propUserName
  const userEmail = session?.user?.email || propUserEmail

  return (
    <>
      <MobileHeader onMenuClick={() => setIsOpen(true)} />

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
              <Logo size="sm" showText={true} />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
              <Sidebar
                userRole={userRole}
                userName={userName}
                userEmail={userEmail}
                onLinkClick={() => setIsOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

