'use client'

import Logo from './Logo'
import { Menu } from 'lucide-react'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
      <Logo size="sm" showText={true} />
    </div>
  )
}

