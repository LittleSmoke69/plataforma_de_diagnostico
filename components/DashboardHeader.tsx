'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './SidebarProvider'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { isOpen, toggle } = useSidebar()

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-start gap-3">
        {!isOpen && (
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex-shrink-0 mt-0.5 sticky top-4 z-40"
            aria-label="Abrir menu"
          >
            <Menu className="w-4 h-4 text-gray-700" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

