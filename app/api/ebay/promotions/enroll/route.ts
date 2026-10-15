// app/api/ebay/promotions/enroll/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST   — enroll a listing into a campaign (add ad)
// DELETE — remove a listing from a campaign
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEbayToken } from '@/lib/ebay-auth'

const MARKETING_BASE = 'https://api.ebay.com/sell/marketing/v1'

function supabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
}

async function getUser() {
  const { data: { user }, error } = await supabase().auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user
}

// ── POST /api/ebay/promotions/enroll ─────────────────────────────────────────
// Body: { campaignId, listingId, listingTitle?, bidPercentage? }
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    const sb   = supabase()
    const { campaignId, listingId, listingTitle, bidPercentage } = await req.json()

    if (!campaignId || !listingId) {
      return NextResponse.json({ error: 'campaignId and listingId are required' }, { status: 400 })
    }

    // Look up campaign to get bid percentage if not provided
    let resolvedBid = bidPercentage
    if (!resolvedBid) {
      const { data: camp } = await (sb.from('promotion_campaigns') as any)
        .select('bid_percentage, campaign_type')
        .eq('user_id', user.id)
        .eq('campaign_id', campaignId)
        .single()
      if (camp?.campaign_type === 'PROMOTED_LISTINGS') {
        resolvedBid = camp.bid_percentage ?? 5
      }
    }

    const token = await getEbayToken(user.id)

    const res = await fetch(
      `${MARKETING_BASE}/ad_campaign/${campaignId}/bulk_create_ads_by_listing_id`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            listingId,
            ...(resolvedBid ? { bidPercentage: String(Number(resolvedBid).toFixed(1)) } : {}),
          }],
        }),
      }
    )

    let adId: string | null = null
    if (res.ok) {
      const json = await res.json()
      adId = json.responses?.[0]?.adId ?? null
    } else {
      // 409 = already enrolled — treat as success
      if (res.status !== 409) {
        const err = await res.text()
        throw new Error(`eBay enroll failed (${res.status}): ${err}`)
      }
    }

    // Upsert local record
    const { data: row, error: dbErr } = await (sb.from('promotion_ads') as any)
      .upsert({
        user_id:        user.id,
        campaign_id:    campaignId,
        listing_id:     listingId,
        listing_title:  listingTitle ?? null,
        ad_id:          adId,
        bid_percentage: resolvedBid ? Number(resolvedBid) : null,
        status:         'ACTIVE',
        enrolled_at:    new Date().toISOString(),
        synced_at:      new Date().toISOString(),
      }, { onConflict: 'user_id,campaign_id,listing_id' })
      .select()
      .single()

    if (dbErr) throw dbErr

    return NextResponse.json({ ad: row, adId })
  } catch (e: any) {
    console.error('[promotions/enroll POST]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// ── DELETE /api/ebay/promotions/enroll ───────────────────────────────────────
// Body: { campaignId, listingId }
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    const sb   = supabase()
    const { campaignId, listingId } = await req.json()

    if (!campaignId || !listingId) {
      return NextResponse.json({ error: 'campaignId and listingId are required' }, { status: 400 })
    }

    // Get the ad ID from local cache
    const { data: adRow } = await (sb.from('promotion_ads') as any)
      .select('ad_id')
      .eq('user_id', user.id)
      .eq('campaign_id', campaignId)
      .eq('listing_id', listingId)
      .single()

    if (adRow?.ad_id) {
      const token = await getEbayToken(user.id)
      const res = await fetch(
        `${MARKETING_BASE}/ad_campaign/${campaignId}/ad/${adRow.ad_id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      // 404 = already removed — OK
      if (!res.ok && res.status !== 404) {
        const err = await res.text()
        throw new Error(`eBay unenroll failed (${res.status}): ${err}`)
      }
    }

    // Remove from local DB
    await (sb.from('promotion_ads') as any)
      .delete()
      .eq('user_id', user.id)
      .eq('campaign_id', campaignId)
      .eq('listing_id', listingId)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[promotions/enroll DELETE]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
