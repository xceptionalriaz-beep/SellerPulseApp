// app/api/payments/portal/route.ts
// Returns a LemonSqueezy customer portal URL for updating payment method

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user profile â€” need subscription_id and customer_id
    const { data: profile } = await (adminClient.from('profiles') as any)
      .select('subscription_id, ls_customer_id, plan_name')
      .eq('id', user.id)
      .single()

    const subscriptionId = (profile as any)?.subscription_id
    const customerId     = (profile as any)?.ls_customer_id

    if (!subscriptionId && !customerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Get LS API key
    const { data: lsKeyData } = await (adminClient.from('api_fleet_config') as any)
      .select('primary_key_1')
      .eq('platform_name', 'lemonsqueezy')
      .single()

    const lsApiKey = (lsKeyData as any)?.primary_key_1 ?? process.env.LEMONSQUEEZY_API_KEY
    if (!lsApiKey) return NextResponse.json({ error: 'LemonSqueezy not configured' }, { status: 500 })

    const lsHeaders = {
      'Authorization': `Bearer ${lsApiKey}`,
      'Accept':        'application/vnd.api+json',
    }

    // Try to get portal URL from subscription
    if (subscriptionId) {
      const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
        headers: lsHeaders,
      })

      if (res.ok) {
        const data  = await res.json()
        const urls  = data?.data?.attributes?.urls
        const portalUrl = urls?.customer_portal ?? urls?.update_payment_method ?? null

        if (portalUrl) {
          return NextResponse.json({ url: portalUrl })
        }
      }
    }

    // Fallback â€” try customer portal via customer ID
    if (customerId) {
      const res = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
        headers: lsHeaders,
      })

      if (res.ok) {
        const data      = await res.json()
        const portalUrl = data?.data?.attributes?.urls?.customer_portal ?? null

        if (portalUrl) {
          return NextResponse.json({ url: portalUrl })
        }
      }
    }

    return NextResponse.json({ error: 'Could not get portal URL from LemonSqueezy' }, { status: 500 })

  } catch (err: any) {
    console.error('[portal] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
