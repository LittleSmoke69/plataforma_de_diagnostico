import { NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/users
 * Lista todos os usuários (apenas para admins)
 * Query params: page, limit, search
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
    const search = searchParams.get('search') || ''

    const supabase = createServiceClient()
    const offset = (page - 1) * limit

    // Monta a query base
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    // Adiciona filtro de busca se fornecido
    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    // Adiciona paginação e ordenação
    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
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

