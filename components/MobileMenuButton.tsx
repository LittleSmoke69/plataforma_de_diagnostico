'use client'

import { Menu, X } from 'lucide-react'

interface MobileMenuButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 right-4 sm:right-6 lg:right-8 z-[60] p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <X className="w-4 h-4 text-gray-700" />
      ) : (
        <Menu className="w-4 h-4 text-gray-700" />
      )}
    </button>
  )
}

