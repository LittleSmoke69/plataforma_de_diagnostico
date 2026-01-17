'use client'

import { useState, createContext, useContext } from 'react'
import { Sidebar } from './Sidebar'
import { MobileMenuButton } from './MobileMenuButton'

interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  userEmail?: string
  isAdmin?: boolean
}

export function SidebarProvider({ children, userEmail, isAdmin = false }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <Sidebar userEmail={userEmail} isAdmin={isAdmin} isOpen={isOpen} onClose={close} />
      {children}
    </SidebarContext.Provider>
  )
}

