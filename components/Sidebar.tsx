'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { LayoutDashboard, FileText, User, X } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

interface SidebarProps {
  userEmail?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ userEmail, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/app/dashboard') {
      return pathname === '/app/dashboard'
    }
    return pathname?.startsWith(href)
  }

  // Fecha a sidebar quando a rota muda (mobile)
  useEffect(() => {
    if (isOpen && onClose) {
      onClose()
    }
  }, [pathname])

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          lg:fixed lg:h-screen lg:translate-x-0 lg:z-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <Link
            href="/app/dashboard"
            className="flex items-center space-x-2"
            onClick={onClose}
          >
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Diagnóstico M&V</span>
          </Link>
          {/* Botão fechar para mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation - ocupa espaço disponível */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section - fixado no final */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 px-4 py-2 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail || 'Usuário'}</p>
            </div>
          </div>
          <div className="px-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  )
}

