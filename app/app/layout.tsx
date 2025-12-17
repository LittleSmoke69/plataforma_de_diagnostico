import { SidebarProvider } from '@/components/SidebarProvider'
import { getCurrentUser } from '@/lib/auth/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // O middleware já verifica autenticação, então aqui apenas buscamos o usuário para exibir
  // Se não conseguir buscar, não redireciona (evita loop)
  const user = await getCurrentUser()

  return (
    <SidebarProvider userEmail={user?.email}>
      <div className="min-h-screen bg-white flex lg:h-screen">
        <main className="flex-1 lg:ml-64 min-w-0 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}


