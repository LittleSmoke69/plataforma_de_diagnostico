import { NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { z } from 'zod'

type UsersTable = Database['public']['Tables']['users']

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional().nullable(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  diagnostics_limit: z.number().int().min(0).optional(),
  password: z.string().min(6).optional(),
})

/**
 * GET /api/admin/users/[id]
 * Busca um usuário específico (apenas para admins)
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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar usuário:', error)
      return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Atualiza um usuário (apenas para admins)
 */
export async function PATCH(
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

    const body = await req.json()

    // Valida os dados
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = createServiceClient()

    // Prepara o objeto de atualização - usando any para evitar problemas de inferência do Supabase
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.email !== undefined) {
      updateData.email = data.email.toLowerCase().trim()
    }
    if (data.name !== undefined) {
      updateData.name = data.name || null
    }
    if (data.role !== undefined) {
      updateData.role = data.role
    }
    if (data.status !== undefined) {
      updateData.status = data.status
    }
    if (data.diagnostics_limit !== undefined) {
      updateData.diagnostics_limit = data.diagnostics_limit
    }
    if (data.password !== undefined) {
      // Em produção, deve-se usar hash de senha (bcrypt, argon2, etc.)
      // Por enquanto, mantém como está no sistema existente
      updateData.password = data.password
    }

    // Atualiza o usuário - Supabase type inference limitation com objetos dinâmicos
    const { data: user, error } = await (supabase
      .from('users') as any)
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      }
      console.error('Erro ao atualizar usuário:', error)
      return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
    }

    return NextResponse.json({ user, message: 'Usuário atualizado com sucesso' })
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

