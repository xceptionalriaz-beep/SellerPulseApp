// app/api/admin/test-connection/route.ts
// Server-side API connection tester
// Handles APIs whose keys are stored in env vars (not DB)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const { platform } = await req.json()
  const start = Date.now()

  try {
    let success = false
    let message = ''

    if (platform === 'resend') {
      // Test using RESEND_API_KEY from env
      const key = process.env.RESEND_API_KEY
      if (!key) {
        return NextResponse.json({
          success: false,
          message: 'RESEND_API_KEY not found in environment variables'
        })
      }

      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${key}` }
      })

      success = res.ok
      message = success
        ? `Resend connected â€” ${Date.now() - start}ms`
        : `Resend error â€” ${res.status} ${res.statusText}`

      // Update last_used_at in DB
      if (success) {
        await (adminClient.from('api_fleet_config') as any)
          .update({
            status:          'connected',
            last_tested_at:  new Date().toISOString(),
            last_used_at:    new Date().toISOString(),
            last_request_at: new Date().toISOString(),
          })
          .eq('platform_name', 'resend')
      }

    } else if (platform === 'ebay') {
      // Test eBay using keys from DB
      const { data } = await (adminClient.from('api_fleet_config') as any)
        .select('primary_key_1, primary_key_2')
        .eq('platform_name', 'ebay')
        .single()

      if (!data?.primary_key_1) {
        return NextResponse.json({ success: false, message: 'eBay keys not configured' })
      }

      const clientId     = data.primary_key_1
      const clientSecret = data.primary_key_2
      const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

      const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
        method:  'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type':  'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
      })

      success = res.ok
      message = success
        ? `eBay connected â€” ${Date.now() - start}ms`
        : `eBay error â€” ${res.status}`

      if (success) {
        await (adminClient.from('api_fleet_config') as any)
          .update({
            status:          'connected',
            last_tested_at:  new Date().toISOString(),
            last_used_at:    new Date().toISOString(),
            last_request_at: new Date().toISOString(),
          })
          .eq('platform_name', 'ebay')
      }

     } else if (platform === 'lemonsqueezy') {
      const { data } = await (adminClient.from('api_fleet_config') as any)
        .select('primary_key_1')
        .eq('platform_name', 'lemonsqueezy')
        .single()
      if (!data?.primary_key_1) {
        return NextResponse.json({ success: false, message: 'LemonSqueezy key not configured' })
      }
      const res = await fetch('https://api.lemonsqueezy.com/v1/stores', {
        headers: {
          'Authorization': `Bearer ${data.primary_key_1}`,
          'Accept':        'application/vnd.api+json',
        }
      })
      success = res.ok
      message = success
        ? `LemonSqueezy connected â€” ${Date.now() - start}ms`
        : `LemonSqueezy error â€” ${res.status}`
      if (success) {
        await (adminClient.from('api_fleet_config') as any)
          .update({
            status:          'connected',
            last_tested_at:  new Date().toISOString(),
            last_used_at:    new Date().toISOString(),
            last_request_at: new Date().toISOString(),
          })
          .eq('platform_name', 'lemonsqueezy')
      }
    } else {
      return NextResponse.json({ success: false, message: 'Unknown platform' })
    }

    return NextResponse.json({
      success,
      message,
      responseTime: Date.now() - start,
    })

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message,
      responseTime: Date.now() - start,
    }, { status: 500 })
  }
}
