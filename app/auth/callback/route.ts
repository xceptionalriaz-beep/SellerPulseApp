// app/auth/callback/route.ts
// Handles:
//   1. Password recovery link clicks  → redirects to /auth/reset-password
//   2. Google OAuth callback          → redirects to dashboard
//   3. Email verification             → redirects to /onboarding (new users)

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? searchParams.get('redirect') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }) } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }) } catch {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[callback] exchangeCodeForSession error:', error.message, error.status)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log('[callback] session exchanged successfully')

    // ── Affiliate signup tracking ─────────────────────────────
    if (type !== 'recovery') {
      try {
        const refCode = request.cookies.get('riazify_ref')?.value
        if (refCode) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await fetch(`${origin}/api/affiliate/signup`, {
              method:  'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie':       request.headers.get('cookie') ?? '',
              },
              body: JSON.stringify({ newUserId: user.id, newUserEmail: user.email }),
            })
          }
        }
      } catch { /* non-critical */ }
    }

    // Password recovery → reset password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`)
    }

    // ── Check if new user needs onboarding ───────────────────
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('[callback] getUser result:', user?.id, userError?.message)
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        console.log('[callback] profile:', profile, profileError?.message)

        if (!(profile as any)?.onboarding_completed) {
          console.log('[callback] redirecting to /onboarding')
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
    } catch (e: any) {
      console.error('[callback] onboarding check error:', e.message)
    }

    console.log('[callback] redirecting to', next)
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}