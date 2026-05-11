import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check session cookie locally — no network call to Supabase
  const hasSession = request.cookies.has('sb-access-token') ||
    [...request.cookies.getAll().map(c => c.name)].some(name =>
      name.startsWith('sb-') && name.endsWith('-auth-token')
    )

  const isProtected = ['/cronograma', '/tarefas', '/funil', '/financeiro'].some(path =>
    pathname.startsWith(path)
  )

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/cronograma', request.url))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasSession ? '/cronograma' : '/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/cronograma/:path*', '/tarefas/:path*', '/funil/:path*', '/financeiro/:path*'],
}
