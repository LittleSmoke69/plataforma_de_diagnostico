import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth/server'
import { DashboardHeader } from '@/components/DashboardHeader'
import { UsersTable } from '@/components/admin/UsersTable'
import { DiagnosticsTable } from '@/components/admin/DiagnosticsTable'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  // Verifica se está autenticado
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Verifica se é admin - redireciona se não for
  if (!(await isAdmin())) {
    redirect('/app/dashboard')
  }

  // Busca dados iniciais
  const supabase = createServiceClient()

  // Usuários
  let initialUsers: any[] = []
  let usersPagination = { page: 1, limit: 10, total: 0, totalPages: 0 }
  try {
    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('*', {
        count: 'exact',
      })
      .limit(10)
    console.log(users)

    if (!usersError && users) {
      initialUsers = users
      usersPagination = {
        page: 1,
        limit: 10,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / 10),
      }
    }
  } catch (err) {
    console.error('Erro ao buscar usuários iniciais:', err)
  }

  // Diagnósticos
  let initialDiagnostics: any[] = []
  let diagnosticsPagination = { page: 1, limit: 10, total: 0, totalPages: 0 }
  try {
    const { data: diagnostics, error: diagnosticsError, count: diagnosticsCount } = await supabase
      .from('diagnostics')
      .select('*', {
        count: 'exact',
      })
      .limit(10)

    if (!diagnosticsError && diagnostics) {
      // Busca emails dos usuários
      const userIds = [...new Set(diagnostics.map((d: any) => d.user_id))]
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds)

      const userMap = new Map((users || []).map((u: any) => [u.id, u.email]))

      initialDiagnostics = diagnostics.map((diag: any) => ({
        ...diag,
        user_email: userMap.get(diag.user_id) || 'N/A',
      }))

      diagnosticsPagination = {
        page: 1,
        limit: 10,
        total: diagnosticsCount || 0,
        totalPages: Math.ceil((diagnosticsCount || 0) / 10),
      }
    }
  } catch (err) {
    console.error('Erro ao buscar diagnósticos iniciais:', err)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6">
      <DashboardHeader
        title="Painel Administrativo"
        subtitle="Gerencie usuários e visualize todas as análises do sistema"
      />

      <div className="space-y-6">
        {/* Seção de Usuários */}
        <div>
          <UsersTable initialUsers={initialUsers} initialPagination={usersPagination} />
        </div>

        {/* Seção de Análises */}
        <div>
          <DiagnosticsTable
            initialDiagnostics={initialDiagnostics}
            initialPagination={diagnosticsPagination}
          />
        </div>
      </div>
    </div>
  )
}

