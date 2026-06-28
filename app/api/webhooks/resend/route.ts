// app/api/webhooks/resend/route.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Receives Resend webhook events
// Updates email_telemetry_logs with open/click/bounce data
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const payload = await req.json()
    const { type, data } = payload

    // Supported event types from Resend
    const supportedEvents = [
      'email.sent', 'email.delivered', 'email.opened',
      'email.clicked', 'email.bounced', 'email.complained',
    ]

    if (!supportedEvents.includes(type)) {
      return NextResponse.json({ received: true, skipped: true })
    }

    const resendId = data?.email_id
    const now      = new Date().toISOString()

    // Find the queue row by resend_id
    const { data: queueRow } = await (adminClient.from('email_queue') as any)
      .select('id').eq('resend_id', resendId).single()

    // Log telemetry event
    await (adminClient.from('email_telemetry_logs') as any).insert({
      queue_id:    queueRow?.id ?? null,
      resend_id:   resendId,
      event_type:  type,
      occurred_at: now,
      metadata:    data ?? {},
    })

    // Update queue status for delivery events
    if (queueRow?.id) {
      if (type === 'email.delivered') {
        await (adminClient.from('email_queue') as any)
          .update({ status: 'delivered' }).eq('id', queueRow.id)
      }
      if (type === 'email.bounced') {
        await (adminClient.from('email_queue') as any)
          .update({ status: 'bounced' }).eq('id', queueRow.id)
      }
    }

    return NextResponse.json({ received: true, event: type })

  } catch (err: any) {
    console.error('[webhooks/resend]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
