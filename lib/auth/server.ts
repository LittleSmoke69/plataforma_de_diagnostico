import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

export interface User {
  id: string
  email: string
  name: string | null
  current_plan_id: string | null
  diagnostics_limit: number
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'blocked'
}

/**
 * Obtém o usuário atual da sessão
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return null
    }

    // Verifica se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Variáveis de ambiente do Supabase não configuradas')
      return null
    }

    const supabase = createServiceClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, current_plan_id, diagnostics_limit, role, status')
      .eq('id', userId)
      .single()

    if (error) {
      // Se erro 404 (usuário não encontrado), limpa o cookie inválido
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar usuário:', error)
      return null
    }

    if (!user) {
      return null
    }

    return user
  } catch (error: any) {
    // Se erro de conexão ou configuração, não quebra a aplicação
    console.error('Erro ao obter usuário:', error?.message || error)
    return null
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Verifica se o usuário atual é administrador
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null && user.role === 'admin' && user.status === 'active'
}

