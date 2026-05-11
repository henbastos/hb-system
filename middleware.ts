import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession reads from cookie locally; only makes a network call when
  // the access token is expired and needs refresh (not on every request)
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const isProtected = ['/cronograma', '/tarefas', '/funil', '/financeiro'].some(path =>
    pathname.startsWith(path)
  )

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/cronograma', request.url))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? '/cronograma' : '/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/login', '/cronograma/:path*', '/tarefas/:path*', '/funil/:path*', '/financeiro/:path*'],
}
