'use client'

import { ReactNode } from 'react'

interface DashboardWidgetProps {
  id: string
  children: ReactNode
  className?: string
}

export default function DashboardWidget({ id, children, className = '' }: DashboardWidgetProps) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  )
}

