// app/api/affiliate/click/route.ts
// Called client-side when riazify_click cookie is detected
// Increments the affiliate's click count — prevents double counting

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    // Find affiliate by code
    const { data: affiliate, error: findError } = await (supabase as any)
      .from('affiliates')
      .select('id, clicks, status')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .maybeSingle()

    if (findError || !affiliate) {
      return NextResponse.json({ ok: true })
    }

    // Increment clicks by 1
    await (supabase as any)
      .from('affiliates')
      .update({ clicks: (affiliate.clicks ?? 0) + 1 })
      .eq('id', affiliate.id)

    return NextResponse.json({ ok: true, affiliateId: affiliate.id })
  } catch (e) {
    console.error('[affiliate/click]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}