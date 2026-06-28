// app/api/admin/promo/track-ab-event/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Public endpoint â€” no auth required
// Called from landing pages to increment A/B test counters
// Rate limited per IP to prevent abuse
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter â€” 60 events per IP per minute
const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT   = 60
const WINDOW_MS    = 60 * 1000

function isRateLimited(ip: string): boolean {
  const now    = Date.now()
  const entry  = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    // â”€â”€ Rate limiting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { testId, variant, action } = await req.json()

    if (!testId)                           return NextResponse.json({ error: 'testId is required' }, { status: 400 })
    if (!['a', 'b'].includes(variant))     return NextResponse.json({ error: 'variant must be a or b' }, { status: 400 })
    if (!['visitor', 'signup'].includes(action)) return NextResponse.json({ error: 'action must be visitor or signup' }, { status: 400 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ Verify test exists and is running â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: test } = await (adminClient.from('ab_tests') as any)
      .select('id, status')
      .eq('id', testId)
      .single()

    if (!test)                           return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    if ((test as any).status !== 'running') return NextResponse.json({ error: 'Test is not running' }, { status: 409 })

    // â”€â”€ Increment the correct counter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const field = `variant_${variant}_${action === 'visitor' ? 'visitors' : 'signups'}`

    const { error } = await (adminClient.from('ab_tests') as any).rpc
      ? await adminClient.rpc('increment_ab_counter', { test_id: testId, field_name: field })
      : await (adminClient.from('ab_tests') as any)
          .update({ [field]: (test as any)[field] + 1, updated_at: new Date().toISOString() })
          .eq('id', testId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, testId, variant, action })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
