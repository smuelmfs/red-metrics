'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Logo from './Logo'
import {
  LayoutDashboard,
  Building2,
  Clock,
  Target,
  FileText,
  BookOpen,
  User,
  Shield,
  LogOut,
  Settings
} from 'lucide-react'

interface SidebarProps {
  userRole?: string
  userName?: string | null
  userEmail?: string | null
  onLinkClick?: () => void
}

export default function Sidebar({ userRole: propUserRole, userName: propUserName, userEmail: propUserEmail, onLinkClick }: SidebarProps) {
  const pathname = usePathname()
  const { data: session, update } = useSession()
  
  // Usar dados da sessão se disponíveis, senão usar props (fallback para SSR)
  const userRole = session?.user?.role || propUserRole || 'USER'
  const userName = session?.user?.name || propUserName
  const userEmail = session?.user?.email || propUserEmail

  const isActive = (path: string) => {
    // Dashboard só está ativo se for exatamente /dashboard (não /dashboard/outra-coisa)
    if (path === '/dashboard') {
      return pathname === path
    }
    // Outros paths podem ter subpaths
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/departments', label: 'Departamentos', icon: Building2 },
    { href: '/dashboard/planned-hours', label: 'Horas Planejadas', icon: Clock },
    { href: '/dashboard/objectives', label: 'Objetivos', icon: Target },
    { href: '/dashboard/retainers', label: 'Avenças', icon: FileText },
    { href: '/dashboard/retainers/catalog', label: 'Catálogo', icon: BookOpen },
  ]

  const adminItems = [
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
    { href: '/dashboard/audit', label: 'Auditoria', icon: Shield },
  ]

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      {/* Logo - apenas em desktop */}
      <div className="hidden lg:block p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
        <Logo size="md" showText={true} />
      </div>

      {/* Navigation - pode rolar se necessário */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-base">{item.label}</span>
            </Link>
          )
        })}

        {/* Admin only items */}
        {userRole === 'ADMIN' && (
          <>
            <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
              {adminItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* Profile */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <Link
            href="/dashboard/profile"
            onClick={onLinkClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/profile')
                ? 'bg-red-50 text-red-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
            }`}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className="text-base">Perfil</span>
          </Link>
        </div>
      </nav>

      {/* User info and logout */}
      <div className="p-5 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName || userEmail}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {userRole === 'ADMIN' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

