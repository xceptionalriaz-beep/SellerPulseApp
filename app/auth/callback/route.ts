// app/auth/callback/route.ts
// Handles:
//   1. Password recovery link clicks  → redirects to /auth/reset-password
//   2. Google OAuth callback          → redirects to dashboard (or redirect param)
//   3. Email verification             → redirects to dashboard (or redirect param)

import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get('code')
  const type     = searchParams.get('type')
  // Support both 'next' and 'redirect' params — roadmap uses 'redirect'
  const next     = searchParams.get('next') ?? searchParams.get('redirect') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // ── Affiliate signup tracking (Google OAuth) ──────────────
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
              body: JSON.stringify({
                newUserId:    user.id,
                newUserEmail: user.email,
              }),
            })
          }
        }
      } catch { /* non-critical */ }
    }

    // Password recovery → reset password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`)
    }

    // OAuth or email confirm → go to intended route
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}