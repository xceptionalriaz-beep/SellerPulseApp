// app/auth/callback/route.ts
// Handles:
//   1. Password recovery link clicks  → redirects to /auth/reset-password
//   2. Google OAuth callback          → redirects to dashboard
//   3. Email verification             → redirects to dashboard
//
// This replaces the AuthChangeEvent.passwordRecovery listener in auth_gate.dart

import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const type  = searchParams.get('type')   // 'recovery' for password reset
  const next  = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Password recovery → go to reset password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`)
    }

    // OAuth or email confirm → go to dashboard (or intended route)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code → back to login
  return NextResponse.redirect(`${origin}/auth/login`)
}