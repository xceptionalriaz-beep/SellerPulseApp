// app/api/ebay/end-listing/route.ts
// Ends a live eBay listing via Trading API EndFixedPriceItem,
// then marks the draft as 'ended' in our DB.

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

    const { draftId } = await req.json()
    if (!draftId) return NextResponse.json({ ok: false, error: 'Missing draftId' }, { status: 400 })

    // ── Fetch draft ───────────────────────────────────────────────
    const { data: draft, error: draftErr } = await (adminDb.from('listing_drafts') as any)
      .select('id, ebay_listing_id, title, status')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single()

    if (draftErr || !draft) return NextResponse.json({ ok: false, error: 'Draft not found' }, { status: 404 })
    if (!draft.ebay_listing_id) return NextResponse.json({ ok: false, error: 'No eBay listing ID on this draft' }, { status: 400 })

    // ── Get eBay token ────────────────────────────────────────────
    const token = await getEbayToken(user.id)

    // ── Call Trading API EndFixedPriceItem ─────────────────────────
    const appId  = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID ?? ''
    const devId  = process.env.EBAY_DEV_ID  ?? ''
    const certId = process.env.EBAY_CERT_ID ?? ''

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<EndFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${token}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${draft.ebay_listing_id}</ItemID>
  <EndingReason>NotAvailable</EndingReason>
</EndFixedPriceItemRequest>`

    const ebayRes = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-CALL-NAME':           'EndFixedPriceItem',
        'X-EBAY-API-SITEID':              '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-APP-NAME':            appId,
        'X-EBAY-API-DEV-NAME':            devId,
        'X-EBAY-API-CERT-NAME':           certId,
        'Content-Type':                   'text/xml',
      },
      body: xml,
    })

    const responseXml = await ebayRes.text()

    // Check for eBay errors
    if (responseXml.includes('<Ack>Failure</Ack>')) {
      const errMatch = responseXml.match(/<LongMessage>([^<]+)<\/LongMessage>/)
      const errMsg   = errMatch?.[1] ?? 'eBay API error'
      // Item already ended is OK — still mark our DB
      if (!responseXml.includes('Item Not Available') && !responseXml.includes('already ended')) {
        console.error('[end-listing] eBay error:', errMsg)
        return NextResponse.json({ ok: false, error: errMsg }, { status: 400 })
      }
    }

    // ── Update draft status in DB ─────────────────────────────────
    await (adminDb.from('listing_drafts') as any)
      .update({ status: 'ended', updated_at: new Date().toISOString() })
      .eq('id', draftId)
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error('[end-listing]', err)
    return NextResponse.json({ ok: false, error: err.message ?? 'Server error' }, { status: 500 })
  }
}
