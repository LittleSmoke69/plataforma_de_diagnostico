import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/diagnostics/[id]
 * Busca detalhes completos de uma análise (apenas para admins)
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const supabase = createServiceClient()

    // Busca o diagnóstico
    const { data: diagnostic, error: diagnosticError } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id', params.id)
      .single()

    if (diagnosticError) {
      if (diagnosticError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
      }
      console.error('Erro ao buscar análise:', diagnosticError)
      return NextResponse.json({ error: 'Erro ao buscar análise' }, { status: 500 })
    }

    // Busca os detalhes da análise
    const { data: details, error: detailsError } = await supabase
      .from('diagnostic_details')
      .select('*')
      .eq('diagnostic_id', params.id)
      .order('created_at', { ascending: true })

    if (detailsError) {
      console.error('Erro ao buscar detalhes:', detailsError)
      return NextResponse.json({ error: 'Erro ao buscar detalhes da análise' }, { status: 500 })
    }

    // Busca email do usuário
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', diagnostic.user_id)
      .single()

    // Formata a resposta
    const formattedDiagnostic = {
      id: diagnostic.id,
      user_id: diagnostic.user_id,
      user_email: user?.email || 'N/A',
      company_name: diagnostic.company_name,
      analysis_period: diagnostic.analysis_period,
      status: diagnostic.status,
      general_score: diagnostic.general_score,
      strategic_reading: diagnostic.strategic_reading,
      pdf_report_url: diagnostic.pdf_report_url,
      realization_date: diagnostic.realization_date,
      created_at: diagnostic.created_at,
      updated_at: diagnostic.updated_at,
      details: details || [],
    }

    return NextResponse.json(formattedDiagnostic)
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

