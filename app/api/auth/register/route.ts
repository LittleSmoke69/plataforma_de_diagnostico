import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verifica se o email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Cria o usuário
    const { data, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        password: password, // ⚠️ Senha em texto plano
        diagnostics_limit: 4,
      })
      .select('id, email')
      .single()

    const newUser = data as Pick<User, 'id' | 'email'> | null

    if (userError || !newUser) {
      console.error('Erro ao criar usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao criar conta' },
        { status: 500 }
      )
    }

    // Retorna sucesso (sem retornar a senha)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    })
  } catch (error: any) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

