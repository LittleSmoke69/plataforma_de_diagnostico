import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Busca o usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user || !user.password) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verifica se a senha confere (comparação em texto plano)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Cria uma sessão simples usando cookies
    const cookieStore = await cookies()
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Salva o token na sessão (válido por 7 dias)
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Retorna sucesso (sem retornar a senha)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

