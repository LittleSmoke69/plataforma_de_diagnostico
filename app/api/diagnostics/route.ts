import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { createServiceClient } from '@/lib/supabase/server'
import { canCreateDiagnostic } from '@/lib/utils/subscription'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { company_name, analysis_period } = await req.json()

    if (!company_name || !analysis_period) {
      return NextResponse.json(
        { error: 'company_name e analysis_period são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se pode criar diagnóstico
    const { canCreate, reason } = await canCreateDiagnostic(user.id)

    if (!canCreate) {
      return NextResponse.json({ error: reason || 'Não é possível criar diagnóstico' }, { status: 403 })
    }

    // Cria o diagnóstico
    const { data: diagnostic, error } = await supabase
      .from('diagnostics')
      .insert({
        user_id: user.id,
        company_name,
        analysis_period,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar diagnóstico:', error)
      return NextResponse.json({ error: 'Erro ao criar diagnóstico' }, { status: 500 })
    }

    return NextResponse.json({ id: diagnostic.id })
  } catch (error: any) {
    console.error('Erro no endpoint:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

