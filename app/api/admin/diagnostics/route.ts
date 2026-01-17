import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/diagnostics
 * Lista todas as análises do sistema (apenas para admins)
 * Query params: page, limit, status, user_id, start_date, end_date
 */
export async function GET(req: Request) {
  try {
    // Verifica se é admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta rota.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const userId = searchParams.get('user_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const supabase = createServiceClient()
    const offset = (page - 1) * limit

    // Monta a query base
    let query = supabase
      .from('diagnostics')
      .select('*', { count: 'exact' })

    // Adiciona filtros
    if (status) {
      query = query.eq('status', status)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Adiciona paginação e ordenação
    const { data: diagnostics, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar análises:', error)
      return NextResponse.json({ error: 'Erro ao buscar análises' }, { status: 500 })
    }

    // Busca emails dos usuários relacionados
    const userIds = [...new Set((diagnostics || []).map((d: any) => d.user_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    const userMap = new Map((users || []).map((u: any) => [u.id, u.email]))

    // Transforma os dados para incluir email do usuário
    const formattedDiagnostics = (diagnostics || []).map((diag: any) => ({
      id: diag.id,
      user_id: diag.user_id,
      user_email: userMap.get(diag.user_id) || 'N/A',
      company_name: diag.company_name,
      analysis_period: diag.analysis_period,
      status: diag.status,
      general_score: diag.general_score,
      realization_date: diag.realization_date,
      created_at: diag.created_at,
      updated_at: diag.updated_at,
    }))

    return NextResponse.json({
      diagnostics: formattedDiagnostics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

