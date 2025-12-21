import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value
  const pathname = request.nextUrl.pathname

  // Ignora rotas de API e assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Protege rotas /app/*
  if (pathname.startsWith('/app')) {
    if (!userId) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // A verificação de admin será feita na página mesmo, pois o middleware
    // não pode fazer chamadas assíncronas complexas de forma eficiente
    // A página /app/admin faz a verificação e redireciona se necessário
  }

  // Redireciona usuários autenticados que tentam acessar /login
  if (pathname === '/login' && userId) {
    const dashboardUrl = new URL('/app/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

