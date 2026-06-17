// app/api/admin/email-queue/process/route.ts
// ══════════════════════════════════════════════════════════════
// Cron job processor — runs every minute via cron-job.org
// Finds pending emails due to be sent and fires them via Resend
// Also checks exit conditions before sending
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const FROM_EMAIL = 'notifications@dropnrest.com'

// Exit conditions — cancel remaining steps if these are true
const EXIT_CONDITIONS: Record<string, (profile: any) => boolean> = {
  'user.signup':    (p) => p?.plan_name && p.plan_name !== 'Free',      // upgraded
  'usage.limit_80': (p) => p?.plan_name && p.plan_name !== 'Free',      // upgraded
  'payment.failed': (p) => p?.subscription_status === 'active',         // payment recovered
}

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
  const results = { sent: 0, failed: 0, skipped: 0, exited: 0 }

  try {
    // Fetch pending emails due now
    const { data: dueEmails } = await (adminClient.from('email_queue') as any)
      .select('*, email_flows(trigger_event, trigger)')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(50)

    for (const email of dueEmails ?? []) {
      try {
        // Check suppression list first
        const { data: suppressed } = await (adminClient.from('email_suppressions') as any)
          .select('email').eq('email', email.to_email.toLowerCase()).single()

        if (suppressed) {
          await (adminClient.from('email_queue') as any)
            .update({ status: 'cancelled', error: 'Email suppressed — user unsubscribed' })
            .eq('id', email.id)
          results.skipped++
          continue
        }

        // Check exit condition before sending
        if (email.user_id) {
          const triggerEvent = email.email_flows?.trigger_event ?? email.email_flows?.trigger
          const exitCondition = EXIT_CONDITIONS[triggerEvent]

          if (exitCondition) {
            const { data: profile } = await adminClient
              .from('profiles')
              .select('plan_name, subscription_status')
              .eq('id', email.user_id)
              .single()

            if (exitCondition(profile)) {
              // Cancel this and all remaining steps for this user/flow
              await (adminClient.from('email_queue') as any)
                .update({ status: 'cancelled', error: 'Exit condition met' })
                .eq('user_id', email.user_id)
                .eq('flow_id', email.flow_id)
                .eq('status', 'pending')

              results.exited++
              continue
            }
          }
        }

        // Send via Resend
        const res = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    FROM_EMAIL,
            to:      [email.to_email],
            subject: email.subject,
            html:    email.html_body,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          await (adminClient.from('email_queue') as any)
            .update({ status: 'sent', resend_id: data.id, sent_at: now })
            .eq('id', email.id)

          await (adminClient.from('email_telemetry_logs') as any).insert({
            queue_id:    email.id,
            resend_id:   data.id,
            event_type:  'sent',
            occurred_at: now,
            metadata:    { to_email: email.to_email, subject: email.subject },
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

    return NextResponse.json({
      success: true,
      ...results,
      processed: (dueEmails ?? []).length,
    })

  } catch (err: any) {
    console.error('[email-queue/process]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Test email sender — direct send without queue ─────────────
export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-internal-secret')
  const validSecret = process.env.INTERNAL_API_SECRET ?? process.env.NEXT_PUBLIC_INTERNAL_SECRET
  if (auth !== validSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { to_email, subject, html_body } = await req.json()
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to_email], subject: `[TEST] ${subject}`, html: html_body }),
    })
    if (res.ok) return NextResponse.json({ success: true })
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}