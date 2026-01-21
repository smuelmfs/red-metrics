'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import Logo from './Logo'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Clock,
  Shield,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  DollarSign,
  BookOpen,
  List,
  BarChart3
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['departments', 'retainers'])
  
  // Usar dados da sessão se disponíveis, senão usar props (fallback para SSR)
  const userRole = session?.user?.role || propUserRole || 'USER'
  const userName = session?.user?.name || propUserName
  const userEmail = session?.user?.email || propUserEmail

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path
    }
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    )
  }

  const isMenuExpanded = (menu: string) => expandedMenus.includes(menu)

  // Menu principal baseado nas abas da planilha
  const mainMenuItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      hasSubmenu: false
    },
  ]

  // Submenu de Departamentos
  const departmentsSubmenu = [
    { href: '/dashboard/departments', label: 'Lista de Departamentos', icon: List },
    { href: '/dashboard/departments/annual', label: 'Visão Anual Consolidada', icon: BarChart3 },
    { href: '/dashboard/planned-hours', label: 'Horas Faturáveis', icon: Clock },
  ]

  // Submenu de Avenças
  const retainersSubmenu = [
    { href: '/dashboard/retainers', label: 'Avenças Ativas', icon: FileText },
    { href: '/dashboard/retainers/catalog', label: 'Catálogo de Avenças', icon: BookOpen },
  ]

  // Menu de Gastos da Empresa (admin/manager)
  const fixedCostsMenu = userRole === 'ADMIN' || userRole === 'MANAGER'
    ? [{ href: '/dashboard/fixed-costs', label: 'Gastos da Empresa', icon: DollarSign, hasSubmenu: false }]
    : []

  // Menu de Admin
  const adminItems = userRole === 'ADMIN'
    ? [
        { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
        { href: '/dashboard/audit', label: 'Auditoria', icon: Shield },
      ]
    : []

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      {/* Logo - apenas em desktop */}
      <div className="hidden lg:block p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
        <Logo size="md" showText={true} />
      </div>

      {/* Navigation - pode rolar se necessário */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Dashboard */}
        {mainMenuItems.map((item) => {
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

        {/* Departamentos com submenu */}
        <div>
          <button
            onClick={() => toggleMenu('departments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/departments') || isActive('/dashboard/planned-hours')
                ? 'bg-red-50 text-red-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-base">Departamentos</span>
            </div>
            {isMenuExpanded('departments') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isMenuExpanded('departments') && (
            <div className="ml-4 mt-1 space-y-1">
              {departmentsSubmenu.map((subItem) => {
                const SubIcon = subItem.icon
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={onLinkClick}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive(subItem.href)
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                    }`}
                  >
                    <SubIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{subItem.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Avenças com submenu */}
        <div>
          <button
            onClick={() => toggleMenu('retainers')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/retainers')
                ? 'bg-red-50 text-red-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className="text-base">Avenças</span>
            </div>
            {isMenuExpanded('retainers') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isMenuExpanded('retainers') && (
            <div className="ml-4 mt-1 space-y-1">
              {retainersSubmenu.map((subItem) => {
                const SubIcon = subItem.icon
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={onLinkClick}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive(subItem.href)
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                    }`}
                  >
                    <SubIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{subItem.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Gastos da Empresa */}
        {fixedCostsMenu.map((item) => {
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
        {adminItems.length > 0 && (
          <div className="pt-6 mt-6 border-t border-gray-200 space-y-1">
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
