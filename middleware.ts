import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const cookieNames = request.cookies.getAll().map(c => c.name)
  const hasSession = cookieNames.some(name => name.startsWith('sb-') && name.endsWith('-auth-token'))

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json).*)'],
}
