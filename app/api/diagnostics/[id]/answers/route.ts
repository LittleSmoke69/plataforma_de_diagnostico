import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Diagnostic = Database['public']['Tables']['diagnostics']['Row']
type DiagnosticDetailInsert = Database['public']['Tables']['diagnostic_details']['Insert']

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { answers } = await req.json()

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers deve ser um array' }, { status: 400 })
    }

    // Verifica se o diagnóstico pertence ao usuário
    const { data: diagnosticData, error: diagnosticError } = await supabase
      .from('diagnostics')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    const diagnostic = diagnosticData as Pick<Diagnostic, 'id'> | null

    if (diagnosticError || !diagnostic) {
      return NextResponse.json({ error: 'Diagnóstico não encontrado' }, { status: 404 })
    }

    // Valida e tipa as respostas
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'answers deve ser um array não vazio' }, { status: 400 })
    }

    // Remove respostas antigas
    await supabase.from('diagnostic_details').delete().eq('diagnostic_id', params.id)

    // Insere novas respostas
    const { error: insertError } = await supabase
      .from('diagnostic_details')
      .insert(answers as DiagnosticDetailInsert[])

    if (insertError) {
      console.error('Erro ao salvar respostas:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar respostas' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

