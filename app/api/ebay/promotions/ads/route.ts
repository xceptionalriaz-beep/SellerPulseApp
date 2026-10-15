// app/api/ebay/promotions/ads/route.ts
// GET ?campaignId=xxx — return ads for a campaign from local DB

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function supabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
}

export async function GET(req: NextRequest) {
  try {
    const sb = supabase()
    const { data: { user }, error } = await sb.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const campaignId = req.nextUrl.searchParams.get('campaignId')
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })

    const { data: ads, error: dbErr } = await (sb.from('promotion_ads') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('campaign_id', campaignId)
      .order('enrolled_at', { ascending: false })

    if (dbErr) throw dbErr
    return NextResponse.json({ ads: ads ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
