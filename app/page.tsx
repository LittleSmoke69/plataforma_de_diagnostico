import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  // Verifica apenas o cookie, sem fazer query no banco (evita loop)
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (userId) {
    redirect('/app/dashboard')
  } else {
    redirect('/login')
  }
}

