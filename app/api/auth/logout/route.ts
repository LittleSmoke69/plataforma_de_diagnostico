import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Remove os cookies de sessão
    cookieStore.delete('session_token')
    cookieStore.delete('user_id')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}

