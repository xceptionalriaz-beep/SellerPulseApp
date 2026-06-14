import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── Blocked IP enforcement ─────────────────────────────────
  // Runs FIRST — before auth checks — blocked IPs get 403 immediately
  // Uses Supabase REST API directly (Edge-compatible, no Node.js SDK)
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null

  if (clientIp) {
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blocked_ips?ip_address=eq.${encodeURIComponent(clientIp)}&select=id,reason&limit=1`
      const res = await fetch(url, {
        headers: {
          'apikey':        process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          return NextResponse.json(
            {
              error:   'Access denied',
              message: 'Your IP address has been blocked from accessing this service.',
              code:    403,
            },
            { status: 403 }
          )
        }
      }
    } catch {
      // Non-critical — if blocked_ips check fails, allow request through
      // Never block legitimate users due to a DB connectivity error
    }
  }

  // ── Auth session ───────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // ── Affiliate ref tracking ─────────────────────────────────
  const refCode = request.nextUrl.searchParams.get('ref')?.trim().toUpperCase()

  const isDashboardRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/profit-calculator') ||
    pathname.startsWith('/title-builder') ||
    pathname.startsWith('/product-research') ||
    pathname.startsWith('/competitor-research') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/profile')

  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute  = pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/signup') ||
    pathname.startsWith('/auth/reset-password')

  if (!session && (isDashboardRoute || isAdminRoute)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    const redirectResponse = NextResponse.redirect(redirectUrl)

    if (refCode) {
      redirectResponse.cookies.set('riazify_ref', refCode, {
        maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
      })
      redirectResponse.cookies.set('riazify_click', refCode, {
        maxAge: 60 * 10, path: '/', sameSite: 'lax',
      })
    }
    return redirectResponse
  }

  if (session && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(redirectUrl)

    if (refCode) {
      redirectResponse.cookies.set('riazify_ref', refCode, {
        maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
      })
      redirectResponse.cookies.set('riazify_click', refCode, {
        maxAge: 60 * 10, path: '/', sameSite: 'lax',
      })
    }
    return redirectResponse
  }

  if (refCode) {
    response.cookies.set('riazify_ref', refCode, {
      maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
    })
    response.cookies.set('riazify_click', refCode, {
      maxAge: 60 * 10, path: '/', sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}