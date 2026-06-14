// app/api/promo/validate/route.ts
// ──────────────────────────────────────────────────────────────
// PUBLIC endpoint — no auth required
// Called at checkout when a user applies a promo code
// Double-checks all conditions regardless of DB status column
// Increments uses_count on successful validation
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── Parse body ─────────────────────────────────────────────
    const { code, userId, planName } = await req.json()

    if (!code?.trim()) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }

    // ── Fetch code from DB ─────────────────────────────────────
    const { data: promo, error: fetchErr } = await (adminClient.from('promo_codes') as any)
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single()

    // ── Code not found ─────────────────────────────────────────
    if (fetchErr || !promo) {
      return NextResponse.json({
        valid:   false,
        reason:  'invalid',
        message: 'This promo code does not exist',
      }, { status: 404 })
    }

    // ── Check 1: expiry date (independent of status column) ───
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({
        valid:   false,
        reason:  'expired',
        message: 'This promo code has expired',
        code:    promo.code,
      }, { status: 400 })
    }

    // ── Check 2: usage cap (independent of status column) ─────
    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
      return NextResponse.json({
        valid:   false,
        reason:  'exhausted',
        message: 'This promo code has reached its maximum number of uses',
        code:    promo.code,
      }, { status: 400 })
    }

    // ── Check 3: manually disabled ────────────────────────────
    if (promo.status === 'disabled' || promo.status === 'expired') {
      return NextResponse.json({
        valid:   false,
        reason:  'disabled',
        message: 'This promo code is no longer active',
        code:    promo.code,
      }, { status: 400 })
    }

    // ── All checks passed — increment uses_count ───────────────
    // Trigger will auto-update status if this hits the cap
    const { error: updateErr } = await (adminClient.from('promo_codes') as any)
      .update({ uses_count: promo.uses_count + 1 })
      .eq('id', promo.id)

    if (updateErr) {
      console.error('[promo/validate] increment error:', updateErr)
      return NextResponse.json({ error: 'Failed to apply code' }, { status: 500 })
    }

    // ── Log usage to user_events if userId provided ────────────
    if (userId) {
      try {
        await adminClient.from('user_events').insert({
          user_id:     userId,
          event_type:  'promo_code_applied',
          event_title: `Promo Code Applied: ${promo.code}`,
          event_desc:  `Applied ${promo.code} — ${promo.discount ?? 'discount'} on ${planName ?? 'plan'}`,
          metadata:    {
            promo_id:       promo.id,
            code:           promo.code,
            discount:       promo.discount,
            discount_type:  promo.discount_type,
            discount_value: promo.discount_value,
            plan_name:      planName ?? null,
          },
          created_at: new Date().toISOString(),
        })
      } catch { /* non-critical */ }
    }

    // ── Return discount details to checkout ────────────────────
    return NextResponse.json({
      valid:          true,
      code:           promo.code,
      description:    promo.description,
      discount:       promo.discount,
      discount_type:  promo.discount_type,
      discount_value: promo.discount_value,
      uses_remaining: promo.max_uses !== null
        ? promo.max_uses - promo.uses_count - 1
        : null,
      message: `Code applied — ${promo.discount ?? 'discount activated'}`,
    })

  } catch (err: any) {
    console.error('[promo/validate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}