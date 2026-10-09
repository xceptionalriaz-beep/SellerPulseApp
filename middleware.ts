// middleware.ts
// ══════════════════════════════════════════════════════════════
// Refreshes Supabase session on every request
// Protects dashboard routes — redirects to login if no session
// ══════════════════════════════════════════════════════════════

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options as any })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options as any })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options as any })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options as any })
        },
      },
    }
  )

  // Refresh session — keeps cookies alive
  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes only
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged in users away from auth pages
  if (user && (
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/signup')
  )) {
    // Check if admin and redirect accordingly
    const riazifyRole = request.cookies.get('riazify_role')?.value
    if (riazifyRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect admin users from /dashboard to /dashboard/admin
  // BUT preserve usermode=1 param when redirecting
  if (user && request.nextUrl.pathname === '/dashboard') {
    const riazifyRole = request.cookies.get('riazify_role')?.value
    const userMode    = request.nextUrl.searchParams.get('usermode')
    if (riazifyRole === 'admin' && userMode !== '1') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url))
    }
    // usermode=1 — let admin through to user dashboard
    if (riazifyRole === 'admin' && userMode === '1') {
      const url = new URL('/dashboard', request.url)
      url.searchParams.delete('usermode')
      const res = NextResponse.rewrite(url)
      return res
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
