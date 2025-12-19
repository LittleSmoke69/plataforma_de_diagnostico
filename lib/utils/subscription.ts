import { createServiceClient } from '@/lib/supabase/server'
import { isAfter } from 'date-fns'
import { Database } from '@/types/database'

type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions']['Update']
type User = Database['public']['Tables']['users']['Row']

export interface SubscriptionStatus {
  isActive: boolean
  endDate: string | null
  planId: string | null
}

/**
 * Verifica se a assinatura do usuário está ativa
 */
export async function checkSubscriptionActive(userId: string): Promise<SubscriptionStatus> {
  const supabase = createServiceClient()

  const { data: subscriptionData, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })
    .limit(1)
    .single()

  const subscription = subscriptionData as UserSubscription | null

  if (error || !subscription) {
    return {
      isActive: false,
      endDate: null,
      planId: null,
    }
  }

  const now = new Date()
  const endDate = new Date(subscription.end_date)
  const isActive = isAfter(endDate, now)

  // Se expirou, atualiza o status
  if (!isActive && subscription.status === 'active') {
    const updateData: Partial<UserSubscriptionUpdate> = {
      status: 'expired',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscription.id)
  }

  return {
    isActive,
    endDate: subscription.end_date,
    planId: subscription.plan_id,
  }
}

/**
 * Verifica se o usuário pode criar um novo diagnóstico
 */
export async function canCreateDiagnostic(userId: string): Promise<{
  canCreate: boolean
  reason?: string
  remaining?: number
}> {
  const subscription = await checkSubscriptionActive(userId)

  // Se tem assinatura ativa, usa o período da assinatura
  if (subscription.isActive && subscription.endDate) {
    const remaining = await getRemainingDiagnostics(userId, subscription.endDate)

    if (remaining <= 0) {
      return {
        canCreate: false,
        reason: 'Você atingiu o limite de diagnósticos deste período.',
        remaining: 0,
      }
    }

    return {
      canCreate: true,
      remaining,
    }
  }

  // Se não tem assinatura ativa, usa o limite do usuário diretamente
  const supabase = createServiceClient()
  const { data: userData } = await supabase
    .from('users')
    .select('diagnostics_limit')
    .eq('id', userId)
    .single()

  const user = userData as Pick<User, 'diagnostics_limit'> | null

  if (!user) {
    return {
      canCreate: false,
      reason: 'Usuário não encontrado.',
    }
  }

  const limit = user.diagnostics_limit || 4

  // Conta todos os diagnósticos do usuário
  const { count } = await supabase
    .from('diagnostics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const used = count || 0
  const remaining = Math.max(0, limit - used)

  if (remaining <= 0) {
    return {
      canCreate: false,
      reason: 'Você atingiu o limite de diagnósticos. Considere adquirir uma assinatura para aumentar seu limite.',
      remaining: 0,
    }
  }

  return {
    canCreate: true,
    remaining,
  }
}

/**
 * Calcula quantos diagnósticos restam no período ativo
 */
export async function getRemainingDiagnostics(
  userId: string,
  subscriptionEndDate: string
): Promise<number> {
  const supabase = createServiceClient()

  // Busca o limite do usuário
  const { data: userData } = await supabase
    .from('users')
    .select('diagnostics_limit')
    .eq('id', userId)
    .single()

  const user = userData as Pick<User, 'diagnostics_limit'> | null

  if (!user) {
    return 0
  }

  const limit = user.diagnostics_limit || 4

  // Busca a assinatura ativa para obter a data de início
  const { data: subscriptionData } = await supabase
    .from('user_subscriptions')
    .select('start_date, end_date')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })
    .limit(1)
    .single()

  const subscription = subscriptionData as Pick<UserSubscription, 'start_date' | 'end_date'> | null

  // Se não tem assinatura ativa, conta todos os diagnósticos do usuário
  if (!subscription) {
    const { count } = await supabase
      .from('diagnostics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const used = count || 0
    return Math.max(0, limit - used)
  }

  // Usa a data de início da assinatura (não calcula 30 dias atrás)
  const startDate = new Date(subscription.start_date)
  const endDate = new Date(subscriptionEndDate)

  // Conta diagnósticos criados no período da assinatura
  const { count } = await supabase
    .from('diagnostics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const used = count || 0
  return Math.max(0, limit - used)
}

/**
 * Obtém informações completas da assinatura e limites
 */
export async function getSubscriptionInfo(userId: string) {
  const subscription = await checkSubscriptionActive(userId)
  
  let remaining = 0
  if (subscription.isActive && subscription.endDate) {
    remaining = await getRemainingDiagnostics(userId, subscription.endDate)
  } else {
    // Se não tem assinatura ativa, calcula baseado no limite do usuário
    const supabase = createServiceClient()
    const { data: userData } = await supabase
      .from('users')
      .select('diagnostics_limit')
      .eq('id', userId)
      .single()

    const user = userData as Pick<User, 'diagnostics_limit'> | null

    if (user) {
      const limit = user.diagnostics_limit || 4
      const { count } = await supabase
        .from('diagnostics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const used = count || 0
      remaining = Math.max(0, limit - used)
    }
  }

  const supabase = createServiceClient()
  const { data: userData } = await supabase
    .from('users')
    .select('diagnostics_limit')
    .eq('id', userId)
    .single()

  const user = userData as Pick<User, 'diagnostics_limit'> | null

  return {
    subscription,
    remaining,
    limit: user?.diagnostics_limit || 4,
  }
}

