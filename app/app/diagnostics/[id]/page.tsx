import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DiagnosticResultView } from '@/components/DiagnosticResultView'
import { GeneratePDFButton } from '@/components/GeneratePDFButton'
import { PageHeader } from '@/components/PageHeader'

export default async function DiagnosticResultPage({
  params,
}: {
  params: { id: string }
}) {
  // Obtém user_id do cookie (middleware já validou)
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    redirect('/login')
  }

  const supabase = createServiceClient()

  // Busca o diagnóstico
  const { data: diagnostic, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !diagnostic) {
    redirect('/app/dashboard')
  }

  // Se ainda não foi gerado, redireciona para o formulário
  if (diagnostic.status === 'pending') {
    redirect(`/app/diagnostics/${params.id}/form`)
  }

  // Busca detalhes para montar o resultado
  const { data: details } = await supabase
    .from('diagnostic_details')
    .select('*')
    .eq('diagnostic_id', params.id)

  // Monta objeto de resultado a partir dos dados salvos
  const result: any = {
    general_score: diagnostic.general_score || 0,
    strategic_reading: diagnostic.strategic_reading || '',
    priorities: [],
    bottlenecks: [],
    charts_data: {
      areas: [],
      revenue_impact: {
        current: 0,
        potential: 0,
        gap: 0,
      },
    },
    lost_revenue_indicators: [],
  }

  // Tenta extrair dados adicionais do strategic_reading ou busca em uma tabela separada
  // Por enquanto, vamos usar os dados básicos salvos

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6 relative">
      <PageHeader
        title={diagnostic.company_name}
        subtitle="Diagnóstico de Marketing & Vendas"
        action={<GeneratePDFButton diagnosticId={params.id} />}
      />

      <DiagnosticResultView diagnostic={diagnostic} details={details || []} />
    </div>
  )
}

