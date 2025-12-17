import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { DiagnosticForm } from '@/components/DiagnosticForm'

export default async function DiagnosticFormPage({
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

  // Verifica se o diagnóstico existe e pertence ao usuário
  const { data: diagnostic, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (error || !diagnostic) {
    redirect('/app/dashboard')
  }

  // Busca respostas já salvas
  const { data: existingAnswers } = await supabase
    .from('diagnostic_details')
    .select('*')
    .eq('diagnostic_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6">
      <DiagnosticForm diagnosticId={params.id} existingAnswers={existingAnswers || []} />
    </div>
  )
}

