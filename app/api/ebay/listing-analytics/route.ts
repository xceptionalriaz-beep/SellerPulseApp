// app/api/ebay/listing-analytics/route.ts
// Fetches listing performance stats from eBay Analytics REST API:
//   - LISTING_IMPRESSION_TOTAL (impressions shown in search)
//   - LISTING_VIEWS_TOTAL      (clicks into the listing page)
//   - CLICK_THROUGH_RATE       (views ÷ impressions)
// Saves results to listing_drafts columns.
//
// POST { draftIds: string[] }  — sync specific drafts
// POST { syncAll: true }       — sync all published drafts for this user

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEbayToken } from '@/lib/ebay-auth'

const adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────
    const { createServerSupabaseClient } = await import('@/lib/supabase-server')
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // ── Resolve which drafts to sync ───────────────────────────────
    let drafts: { id: string; ebay_listing_id: string }[] = []

    if (body.syncAll) {
      const { data } = await (adminDb.from('listing_drafts') as any)
        .select('id, ebay_listing_id')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .not('ebay_listing_id', 'is', null)
      drafts = data ?? []
    } else if (Array.isArray(body.draftIds) && body.draftIds.length > 0) {
      const { data } = await (adminDb.from('listing_drafts') as any)
        .select('id, ebay_listing_id')
        .eq('user_id', user.id)
        .in('id', body.draftIds)
        .not('ebay_listing_id', 'is', null)
      drafts = data ?? []
    }

    if (drafts.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, message: 'No published listings with eBay IDs' })
    }

    // ── Get eBay access token ─────────────────────────────────────
    const token = await getEbayToken(user.id)

    // ── Call eBay Analytics Traffic Report API ────────────────────
    // Scope needed: sell.analytics.readonly
    const params = new URLSearchParams({
      dimension: 'LISTING',
      date_range: 'LAST_30_DAYS',
    })
    params.append('metric', 'LISTING_IMPRESSION_TOTAL')
    params.append('metric', 'LISTING_VIEWS_TOTAL')
    params.append('metric', 'CLICK_THROUGH_RATE')

    const analyticsRes = await fetch(
      `https://api.ebay.com/sell/analytics/v1/traffic_report?${params.toString()}`,
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!analyticsRes.ok) {
      const errText = await analyticsRes.text()
      console.error('[listing-analytics] Analytics API error:', analyticsRes.status, errText)

      // 403 usually means scope not granted; tell the user
      if (analyticsRes.status === 403) {
        return NextResponse.json({
          ok: false,
          error: 'Analytics scope not granted. Please reconnect your eBay account in Settings to enable performance stats.',
          code: 'scope_missing',
        }, { status: 403 })
      }
      return NextResponse.json({ ok: false, error: `eBay Analytics error: ${analyticsRes.status}` }, { status: 500 })
    }

    const analyticsData = await analyticsRes.json()

    // ── Parse response into { itemId → stats } map ────────────────
    // Response shape: { header: { metrics: [...] }, records: [{ dimensionValues, metricValues }] }
    const metricNames: string[] = analyticsData?.header?.metrics ?? []
    const impressionIdx = metricNames.indexOf('LISTING_IMPRESSION_TOTAL')
    const viewsIdx      = metricNames.indexOf('LISTING_VIEWS_TOTAL')
    const ctrIdx        = metricNames.indexOf('CLICK_THROUGH_RATE')

    const statsMap = new Map<string, { impressions: number; views: number; ctr: number }>()

    for (const record of (analyticsData?.records ?? [])) {
      const itemId = record?.dimensionValues?.[0]?.value as string
      if (!itemId) continue
      const mv     = record?.metricValues ?? []
      statsMap.set(itemId, {
        impressions: impressionIdx >= 0 ? Number(mv[impressionIdx]?.value ?? 0) : 0,
        views:       viewsIdx      >= 0 ? Number(mv[viewsIdx]?.value      ?? 0) : 0,
        ctr:         ctrIdx        >= 0 ? Number(mv[ctrIdx]?.value        ?? 0) : 0,
      })
    }

    // ── Upsert stats into listing_drafts ──────────────────────────
    const now = new Date().toISOString()
    let updated = 0

    for (const draft of drafts) {
      const stats = statsMap.get(draft.ebay_listing_id)
      if (!stats) continue // eBay returned no data for this item

      await (adminDb.from('listing_drafts') as any)
        .update({
          ebay_impressions:         stats.impressions,
          ebay_views:               stats.views,
          ebay_click_through_rate:  stats.ctr,
          ebay_analytics_synced_at: now,
          updated_at:               now,
        })
        .eq('id', draft.id)
        .eq('user_id', user.id)

      updated++
    }

    return NextResponse.json({ ok: true, updated, total: drafts.length })

  } catch (err: any) {
    console.error('[listing-analytics]', err)
    return NextResponse.json({ ok: false, error: err.message ?? 'Server error' }, { status: 500 })
  }
}
