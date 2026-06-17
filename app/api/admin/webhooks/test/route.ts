// app/api/admin/webhooks/test/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { destination_id } = await req.json()

    const { data: dest } = await (adminClient.from('webhook_destinations') as any)
      .select('*').eq('id', destination_id).single()

    if (!dest) return NextResponse.json({ error: 'Destination not found' }, { status: 404 })

    const startTime = Date.now()
    const testPayload = {
      event:     'test.ping',
      timestamp: new Date().toISOString(),
      source:    'riazify',
      message:   'This is a test webhook from Riazify',
      data:      { user: 'admin@riazify.com', plan: 'Growth', amount: '$49' },
    }

    let payload = testPayload
    if ((dest as any).type === 'slack') {
      payload = {
        text: '✅ *Riazify Test Webhook* — connection verified!',
        attachments: [{ color: '#8fff00', text: 'Your Slack webhook is configured correctly.' }],
      } as any
    } else if ((dest as any).type === 'discord') {
      payload = {
        embeds: [{
          title:       '✅ Riazify Test Webhook',
          description: 'Your Discord webhook is configured correctly!',
          color:       0x8FFF00,
          timestamp:   new Date().toISOString(),
        }],
      } as any
    }

    const res = await fetch((dest as any).url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(10000),
    })

    const duration = Date.now() - startTime
    const body     = await res.text().catch(() => '')

    // Log test delivery
    await (adminClient.from('webhook_delivery_log') as any).insert({
      destination_id,
      event_type:    'test.ping',
      status:        res.ok ? 'delivered' : 'failed',
      attempt_number: 1,
      payload:       testPayload,
      response_code: res.status,
      response_body: body.slice(0, 500),
      duration_ms:   duration,
    })

    return NextResponse.json({
      success:       res.ok,
      status_code:   res.status,
      duration_ms:   duration,
      response_body: body.slice(0, 500),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}