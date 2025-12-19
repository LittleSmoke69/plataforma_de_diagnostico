import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type DiagnosticDetailInsert = Omit<
  Database['public']['Tables']['diagnostic_details']['Insert'],
  'id' | 'created_at'
>

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
    const { data: diagnostic, error: diagnosticError } = await supabase
      .from('diagnostics')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (diagnosticError || !diagnostic) {
      return NextResponse.json({ error: 'Diagnóstico não encontrado' }, { status: 404 })
    }

    // Valida e prepara as respostas para inserção
    const answersToInsert: DiagnosticDetailInsert[] = answers.map((answer: any) => {
      if (!answer.area || !answer.question || !answer.answer) {
        throw new Error('Cada resposta deve ter: area, question e answer')
      }

      return {
        diagnostic_id: params.id,
        area: String(answer.area),
        question: String(answer.question),
        answer: String(answer.answer),
        ai_feedback: answer.ai_feedback || null,
      }
    })

    // Remove respostas antigas
    await supabase.from('diagnostic_details').delete().eq('diagnostic_id', params.id)

    // Insere novas respostas
    const { error: insertError } = await supabase
      .from('diagnostic_details')
      .insert(answersToInsert as any)

    if (insertError) {
      console.error('Erro ao salvar respostas:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar respostas' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: error.message?.includes('deve ter') ? 400 : 500 }
    )
  }
}

