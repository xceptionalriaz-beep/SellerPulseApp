// app/api/ebay/sync-orders/route.ts
// Syncs eBay orders to protected_orders table
// Can be called: manually, after OAuth, or via cron

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// â”€â”€ Risk scoring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function calculateRisk(order: any): { level: string; score: number } {
  let score = 0

  const price    = parseFloat(order.AmountPaid?.value ?? order.Total?.value ?? 0)
  const qty      = parseInt(order.TransactionArray?.Transaction?.[0]?.QuantityPurchased ?? 1)
  const country  = order.ShippingAddress?.Country ?? 'US'
  const isIntl   = country !== 'US' && country !== 'GB'

  // Buyer feedback
  const feedback = order.BuyerFeedbackScore ?? 999
  if      (feedback < 5)  score += 40
  else if (feedback < 10) score += 30
  else if (feedback < 50) score += 15

  // Item value
  if      (price > 500) score += 25
  else if (price > 200) score += 15
  else if (price > 100) score += 10

  // International buyer
  if (isIntl) score += 20

  // Multiple quantities
  if (qty > 1) score += 10

  // New buyer (no feedback at all)
  if (feedback === 0) score += 30

  const level = score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW'
  return { level, score: Math.min(score, 100) }
}

// â”€â”€ Refresh token if expired â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function refreshEbayToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const clientId     = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!
    const clientSecret = process.env.EBAY_CLIENT_SECRET!
    const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
        scope:         'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
      }).toString(),
    })

    if (!res.ok) return null

    const data      = await res.json()
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

    await (adminClient.from('profiles') as any).update({
      ebay_access_token:     data.access_token,
      ebay_token_expires_at: expiresAt,
    }).eq('id', userId)

    return data.access_token
  } catch { return null }
}

// â”€â”€ Main handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-internal-secret')
  const cronAuth = req.headers.get('authorization')
  const isInternal = secret === process.env.INTERNAL_API_SECRET
  const isCron     = cronAuth === `Bearer ${process.env.CRON_SECRET}`

  // Also allow authenticated users to trigger their own sync
  let userId: string | null = null

  if (isInternal || isCron) {
    const body = await req.json().catch(() => ({}))
    userId = body.user_id ?? null
  } else {
    // Check user auth
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = user.id
  }

  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  try {
    // â”€â”€ Get user's eBay credentials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: profile } = await (adminClient.from('profiles') as any)
      .select('ebay_access_token, ebay_refresh_token, ebay_token_expires_at, ebay_marketplace')
      .eq('id', userId)
      .single()

    if (!profile || !(profile as any).ebay_access_token) {
      return NextResponse.json({ error: 'eBay not connected' }, { status: 400 })
    }

    let accessToken = (profile as any).ebay_access_token

    // â”€â”€ Refresh token if expired â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const expiresAt = new Date((profile as any).ebay_token_expires_at ?? 0)
    if (expiresAt < new Date()) {
      const newToken = await refreshEbayToken(userId, (profile as any).ebay_refresh_token)
      if (!newToken) return NextResponse.json({ error: 'Token expired â€” please reconnect eBay' }, { status: 401 })
      accessToken = newToken
    }

    // â”€â”€ Fetch orders from eBay Fulfillment API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ordersRes = await fetch(
      'https://api.ebay.com/sell/fulfillment/v1/order?limit=50&orderFulfillmentStatus=NOT_STARTED,IN_PROGRESS',
      {
        headers: {
          'Authorization':  `Bearer ${accessToken}`,
          'Content-Type':   'application/json',
          'X-EBAY-C-MARKETPLACE-ID': (profile as any).ebay_marketplace ?? 'EBAY_US',
        }
      }
    )

    if (!ordersRes.ok) {
      const err = await ordersRes.text()
      console.error('[sync-orders] eBay API error:', err)
      return NextResponse.json({ error: 'eBay API error', details: err }, { status: 500 })
    }

    const ordersData = await ordersRes.json()
    const orders     = ordersData.orders ?? []

    let inserted = 0
    let updated  = 0
    let skipped  = 0

    // â”€â”€ Process each order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const order of orders) {
      try {
        const ebayOrderId    = order.orderId
        const buyerUsername  = order.buyer?.username ?? ''
        const lineItem       = order.lineItems?.[0] ?? {}
        const itemTitle      = lineItem.title ?? ''
        const itemPrice      = parseFloat(lineItem.lineItemCost?.value ?? 0)
        const itemQty        = lineItem.quantity ?? 1
        const itemImageUrl   = lineItem.image?.imageUrl ?? ''
        const ebayItemId     = lineItem.legacyItemId ?? ''
        const orderStatus    = order.orderFulfillmentStatus ?? 'NOT_STARTED'
        const orderDate      = order.creationDate ? new Date(order.creationDate) : new Date()
        const shippingAddr   = order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo ?? {}
        const tracking       = order.fulfillmentStartInstructions?.[0]?.shippingStep?.shippingCarrierCode ?? ''

        // Calculate risk score
        const { level, score } = calculateRisk({
          AmountPaid: { value: itemPrice * itemQty },
          ShippingAddress: { Country: shippingAddr.contactAddress?.countryCode ?? 'US' },
          BuyerFeedbackScore: order.buyer?.feedbackScore ?? 999,
          TransactionArray: { Transaction: [{ QuantityPurchased: itemQty }] },
        })

        // Check if order already exists
        const { data: existing } = await (adminClient.from('protected_orders') as any)
          .select('id, checklist_completed')
          .eq('ebay_order_id', ebayOrderId)
          .eq('user_id', userId)
          .single()

        if (existing) {
          // Update status only â€” don't overwrite user's checklist progress
          await (adminClient.from('protected_orders') as any).update({
            order_status: orderStatus,
            updated_at:   new Date().toISOString(),
          }).eq('id', (existing as any).id)
          updated++
        } else {
          // Insert new order
          await (adminClient.from('protected_orders') as any).insert({
            user_id:          userId,
            ebay_order_id:    ebayOrderId,
            buyer_username:   buyerUsername,
            item_title:       itemTitle,
            item_price:       itemPrice,
            item_quantity:    itemQty,
            item_image_url:   itemImageUrl,
            ebay_item_id:     ebayItemId,
            order_status:     orderStatus,
            order_date:       orderDate.toISOString(),
            risk_level:       level,
            risk_score:       score,
            shipping_city:    shippingAddr.contactAddress?.city ?? '',
            shipping_state:   shippingAddr.contactAddress?.stateOrProvince ?? '',
            shipping_country: shippingAddr.contactAddress?.countryCode ?? '',
            shipping_zip:     shippingAddr.contactAddress?.postalCode ?? '',
            tracking_number:  tracking,
            checklist_completed: false,
            protection_checklist: {},
            created_at:       new Date().toISOString(),
            updated_at:       new Date().toISOString(),
          })
          inserted++

          // Fire webhook for HIGH RISK orders
          if (level === 'HIGH') {
            try {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
              await fetch(`${appUrl}/api/admin/webhooks`, {
                method:  'POST',
                headers: {
                  'Content-Type':      'application/json',
                  'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
                },
                body: JSON.stringify({
                  event_type: 'high_risk_order',
                  data: {
                    order_id: ebayOrderId,
                    buyer:    buyerUsername,
                    item:     itemTitle,
                    price:    `$${(itemPrice * itemQty).toFixed(2)}`,
                    risk:     score,
                  }
                }),
              })
            } catch {}
          }
        }
      } catch (orderErr) {
        console.error('[sync-orders] order error:', orderErr)
        skipped++
      }
    }

    // â”€â”€ Log API usage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      const { data: curr } = await (adminClient.from('api_fleet_config') as any)
        .select('rate_limit_used, requests_today')
        .eq('platform_name', 'ebay').single()

      await (adminClient.from('api_fleet_config') as any).update({
        last_used_at:    new Date().toISOString(),
        last_request_at: new Date().toISOString(),
        last_tested_at:  new Date().toISOString(),
        status:          'connected',
        rate_limit_used: ((curr as any)?.rate_limit_used ?? 0) + 1,
        requests_today:  ((curr as any)?.requests_today  ?? 0) + 1,
      }).eq('platform_name', 'ebay')

      await (adminClient.from('api_usage_logs') as any).insert({
        user_id:          userId,
        platform_name:    'ebay',
        tool_name:        'orders',
        call_name:        'GetOrders',
        endpoint:         'sell/fulfillment/v1/order',
        success_count:    1,
        error_count:      0,
        response_time_ms: 300,
        logged_at:        new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({
      success:  true,
      inserted,
      updated,
      skipped,
      total:    orders.length,
    })

  } catch (err: any) {
    console.error('[sync-orders]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// â”€â”€ GET handler for cron â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Syncs ALL connected users' orders
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all users with eBay connected
    const { data: users } = await (adminClient.from('profiles') as any)
      .select('id')
      .not('ebay_access_token', 'is', null)
      .not('ebay_access_token', 'eq', '')

    const results = []
    for (const user of users ?? []) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/ebay/sync-orders`,
          {
            method:  'POST',
            headers: {
              'Content-Type':      'application/json',
              'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
            },
            body: JSON.stringify({ user_id: (user as any).id }),
          }
        )
        const json = await res.json()
        results.push({ user_id: (user as any).id, ...json })
      } catch (e: any) {
        results.push({ user_id: (user as any).id, error: e.message })
      }
    }

    return NextResponse.json({ success: true, synced: results.length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
