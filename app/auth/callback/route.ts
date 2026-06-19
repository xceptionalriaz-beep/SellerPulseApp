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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.session) {
      const user = data.session.user

      // ── Password recovery ──────────────────────────────────
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      // ── Check if new user (needs onboarding) ──────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete, name')
        .eq('id', user.id)
        .single()

      const needsOnboarding = !profile?.onboarding_complete

      if (needsOnboarding) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // ── Existing user → dashboard ──────────────────────────
      const redirectTo = next.startsWith('/') ? `${origin}${next}` : next
      return NextResponse.redirect(redirectTo)
    }
  }

  // ── Error or no code → redirect to login ──────────────────
  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
}