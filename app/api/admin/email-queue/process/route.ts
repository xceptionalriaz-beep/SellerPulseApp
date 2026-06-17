// app/api/admin/email-queue/process/route.ts
// ══════════════════════════════════════════════════════════════
// Cron job processor — runs every minute via cron-job.org
// Finds pending emails due to be sent and fires them via Resend
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now     = new Date().toISOString()
  const results = { sent: 0, failed: 0, skipped: 0 }

  try {
    // Fetch pending emails due now
    const { data: dueEmails } = await (adminClient.from('email_queue') as any)
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(50)

    for (const email of dueEmails ?? []) {
      try {
        // Send via Resend
        const res = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    'notifications@dropnrest.com',
            to:      [email.to_email],
            subject: email.subject,
            html:    email.html_body,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          // Update queue row
          await (adminClient.from('email_queue') as any)
            .update({
              status:    'sent',
              resend_id: data.id,
              sent_at:   now,
            })
            .eq('id', email.id)

          // Log telemetry
          await (adminClient.from('email_telemetry_logs') as any).insert({
            queue_id:   email.id,
            resend_id:  data.id,
            event_type: 'sent',
            occurred_at: now,
            metadata:   { to_email: email.to_email, subject: email.subject },
          })

          results.sent++
        } else {
          const err = await res.text()
          await (adminClient.from('email_queue') as any)
            .update({ status: 'failed', error: err })
            .eq('id', email.id)
          results.failed++
        }
      } catch (err: any) {
        await (adminClient.from('email_queue') as any)
          .update({ status: 'failed', error: err.message })
          .eq('id', email.id)
        results.failed++
      }
    }

    return NextResponse.json({ success: true, ...results, processed: (dueEmails ?? []).length })

  } catch (err: any) {
    console.error('[email-queue/process]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}