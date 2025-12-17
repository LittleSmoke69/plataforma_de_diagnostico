import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { getSubscriptionInfo } from '@/lib/utils/subscription'
import { DiagnosticsList } from '@/components/DiagnosticsList'
import { NewDiagnosticModal } from '@/components/NewDiagnosticModal'
import { DiagnosticsRemainingCard } from '@/components/DiagnosticsRemainingCard'
import { DashboardHeader } from '@/components/DashboardHeader'
import { createServiceClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  // O middleware já verifica autenticação via cookie
  // Se chegou aqui, o usuário está autenticado
  const user = await getCurrentUser()
  
  // Se não conseguir buscar usuário mas tem cookie, ainda permite acesso
  // (evita loop de redirecionamento)
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Erro ao carregar dados do usuário. Verifique as configurações do banco de dados.
          </p>
        </div>
      </div>
    )
  }

  const subscriptionInfo = await getSubscriptionInfo(user.id)

  // Busca diagnósticos do usuário
  type Diagnostic = {
    id: string
    company_name: string
    realization_date: string | null
    general_score: number | null
    status: 'pending' | 'completed' | 'failed'
    created_at: string
  }

  let diagnostics: Diagnostic[] = []
  let diagnosticsError: string | null = null

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('diagnostics')
      .select('id, company_name, realization_date, general_score, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar diagnósticos:', error)
      console.error('User ID:', user.id)
      console.error('Error details:', JSON.stringify(error, null, 2))
      diagnosticsError = `Erro ao carregar diagnósticos: ${error.message}`
    } else {
      diagnostics = (data as Diagnostic[]) || []
      console.log(`Encontrados ${diagnostics.length} diagnósticos para o usuário ${user.id}`)
      if (diagnostics.length > 0) {
        console.log('Primeiro diagnóstico:', JSON.stringify(diagnostics[0], null, 2))
      }
    }
  } catch (err: any) {
    console.error('Erro inesperado ao buscar diagnósticos:', err)
    diagnosticsError = `Erro inesperado: ${err?.message || 'Erro desconhecido'}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6">
      <DashboardHeader
        title="Dashboard"
        subtitle="Gerencie seus diagnósticos de marketing e vendas"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <DiagnosticsRemainingCard
          remaining={subscriptionInfo.remaining}
          limit={subscriptionInfo.limit}
          isActive={subscriptionInfo.subscription.isActive}
          endDate={subscriptionInfo.subscription.endDate}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Histórico de Diagnósticos</h2>
          <NewDiagnosticModal
            canCreate={subscriptionInfo.remaining > 0}
            reason={
              subscriptionInfo.remaining === 0
                ? !subscriptionInfo.subscription.isActive
                  ? 'Sua assinatura expirou. Renove para continuar usando a plataforma.'
                  : 'Você atingiu o limite de diagnósticos deste período.'
                : undefined
            }
          />
        </div>
        {diagnosticsError ? (
          <div className="p-4 sm:p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{diagnosticsError}</p>
            </div>
          </div>
        ) : (
          <DiagnosticsList diagnostics={diagnostics} />
        )}
      </div>
    </div>
  )
}

