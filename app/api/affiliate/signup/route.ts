// app/api/affiliate/signup/route.ts
// Reads riazify_ref cookie → credits the affiliate with +1 signup

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Service role client — bypasses RLS for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { newUserId, newUserEmail } = await request.json()

    const cookieStore = cookies()
    const refCode = cookieStore.get('riazify_ref')?.value

    if (!refCode) {
      return NextResponse.json({ ok: true, attributed: false })
    }

    // Find the affiliate by code
    const { data: affiliate, error: findError } = await (supabase as any)
      .from('affiliates')
      .select('id, signups, status, email')
      .eq('code', refCode.toUpperCase())
      .eq('status', 'active')
      .maybeSingle()

    if (findError || !affiliate) {
      return NextResponse.json({ ok: true, attributed: false })
    }

    // Prevent self-referral
    if (affiliate.email && affiliate.email === newUserEmail) {
      console.warn('[affiliate/signup] Self-referral blocked:', newUserEmail)
      return NextResponse.json({ ok: true, attributed: false, reason: 'self_referral' })
    }

    // Increment signups
    await (supabase as any)
      .from('affiliates')
      .update({ signups: (affiliate.signups ?? 0) + 1 })
      .eq('id', affiliate.id)

    // Record the referral
    await (supabase as any)
      .from('affiliate_referrals')
      .insert([{
        affiliate_id:   affiliate.id,
        user_id:        newUserId   ?? null,
        user_email:     newUserEmail ?? null,
        ref_code:       refCode.toUpperCase(),
        status:         'active',
        referred_at:    new Date().toISOString(),
      }])

    return NextResponse.json({
      ok:          true,
      attributed:  true,
      affiliateId: affiliate.id,
      code:        refCode,
    })
  } catch (e) {
    console.error('[affiliate/signup]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}