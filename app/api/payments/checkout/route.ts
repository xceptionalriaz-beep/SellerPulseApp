// app/api/payments/checkout/route.ts
// Creates a LemonSqueezy checkout URL for a given plan + billing cycle

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Variant ID map from ls_config table ───────────────────────
async function getVariantId(plan: string, billing: string): Promise<string | null> {
  const key = `${plan}_${billing}` // e.g. starter_monthly
  const { data } = await (adminClient.from('ls_config') as any)
    .select('value')
    .eq('key', key)
    .single()
  return (data as any)?.value ?? null
}

export async function POST(req: NextRequest) {
  try {
    const { plan, billing, userId, userEmail, userName } = await req.json()

    // Validate
    if (!plan || !billing || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['starter', 'growth', 'custom'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!['monthly', 'annual'].includes(billing)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    // Get variant ID
    const variantId = await getVariantId(plan, billing)
    if (!variantId) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
    }

    // Get store ID
    const { data: storeData } = await (adminClient.from('ls_config') as any)
      .select('value')
      .eq('key', 'store_id')
      .single()
    const storeId = (storeData as any)?.value

    // Get API key from DB (fallback to env var)
    const { data: lsKeyData } = await (adminClient.from('api_fleet_config') as any)
      .select('primary_key_1')
      .eq('platform_name', 'lemonsqueezy')
      .single()
    const lsApiKey = (lsKeyData as any)?.primary_key_1 ?? process.env.LEMONSQUEEZY_API_KEY

    if (!lsApiKey) {
      return NextResponse.json({ error: 'LemonSqueezy not configured' }, { status: 500 })
    }

    // Build checkout via LemonSqueezy API
    const lsRes = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lsApiKey}`,
        'Content-Type':  'application/vnd.api+json',
        'Accept':        'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email:  userEmail,
              name:   userName ?? '',
              custom: {
                user_id:  userId,
                plan:     plan,
                billing:  billing,
              },
            },
            checkout_options: {
              embed:          false,
              media:          true,
              logo:           true,
              desc:           true,
              discount:       true,
              skip_trial:     false,
              subscription_preview: true,
            },
            product_options: {
              enabled_variants:   [parseInt(variantId)],
              redirect_url:       `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
              receipt_link_url:   `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
              receipt_thank_you_note: `Welcome to Riazify ${plan.charAt(0).toUpperCase() + plan.slice(1)}! Your account has been upgraded.`,
            },
            expires_at: null,
          },
          relationships: {
            store: {
              data: { type: 'stores', id: storeId }
            },
            variant: {
              data: { type: 'variants', id: variantId }
            },
          },
        },
      }),
    })

    if (!lsRes.ok) {
      const err = await lsRes.text()
      console.error('[checkout] LemonSqueezy error:', err)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    const lsData = await lsRes.json()
    const checkoutUrl = lsData?.data?.attributes?.url

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }

    // Log to api_usage_logs
    try {
      await (adminClient.from('api_usage_logs') as any).insert({
        platform_name:    'lemonsqueezy',
        tool_name:        'payments',
        call_name:        'CreateCheckout',
        endpoint:         'checkouts',
        success_count:    1,
        error_count:      0,
        response_time_ms: 0,
        logged_at:        new Date().toISOString(),
      })
      await (adminClient.from('api_fleet_config') as any)
        .update({
          last_used_at:    new Date().toISOString(),
          last_request_at: new Date().toISOString(),
        })
        .eq('platform_name', 'lemonsqueezy')
    } catch {}

    return NextResponse.json({ url: checkoutUrl })

  } catch (err: any) {
    console.error('[checkout] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}