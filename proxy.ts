// proxy.ts (na RAIZ do projeto!)
import { type NextRequest } from 'next/server'

const publicPaths = [
  '/_next',
  '/_vercel',
  '/favicon.ico',
  '/api/validate',
  '/assets',
]

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Deixa passar rotas públicas
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return null
  }

  // Verifica sessão
  const sessionCookie = req.cookies.get('acaoleve_session')?.value

  if (!sessionCookie) {
    const loginUrl = new URL('https://acaoleve.com/login')
    loginUrl.searchParams.set('next', req.url) // req.url já tem host + path completos
    return Response.redirect(loginUrl, 307) // 307 preserva método (bom pra POSTs futuros)
  }

  // Tudo ok → deixa seguir
  return null
}

export const config = {
  // Matcher mais enxuto e oficial
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - api (API routes)
     * - favicon.ico
     * - public files (.*\..*)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}