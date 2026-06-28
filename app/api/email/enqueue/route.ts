// app/api/email/enqueue/route.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Enqueues emails when trigger events fire
// Called internally when: user signs up, hits limit, payment fails
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export async function POST(req: NextRequest) {
  try {
    // Internal only â€” accept both secret variants
    const secret = req.headers.get('x-internal-secret')
    const validSecret = process.env.INTERNAL_API_SECRET ?? process.env.NEXT_PUBLIC_INTERNAL_SECRET
    if (secret !== validSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { trigger_event, user_id, to_email, to_name, variables } = await req.json()

    if (!trigger_event || !to_email) {
      return NextResponse.json({ error: 'trigger_event and to_email required' }, { status: 400 })
    }

    // Find active flow â€” handle both old (trigger) and new (trigger_event) column names
    const { data: flows } = await (adminClient.from('email_flows') as any)
      .select('id, name, title, trigger, trigger_event')
      .eq('is_active', true)

    const flow = (flows ?? []).find((f: any) =>
      (f.trigger_event ?? f.trigger) === trigger_event
    )

    if (!flow) {
      return NextResponse.json({ success: true, message: 'No active flow for trigger', queued: 0 })
    }

    // Normalize flow name
    const flowName = flow.name ?? flow.title ?? 'Email Flow'

    // â”€â”€ Suppression list check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Never queue emails for unsubscribed users
    const { count: suppressed } = await (adminClient.from('email_suppressions') as any)
      .select('id', { count: 'exact', head: true })
      .eq('email', to_email.toLowerCase())

    if ((suppressed ?? 0) > 0) {
      return NextResponse.json({
        success: true,
        message: 'Email suppressed â€” user unsubscribed',
        queued:  0,
      })
    }

    // â”€â”€ Duplicate prevention â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Check if user already has pending/sent emails for this flow
    if (user_id) {
      const { count } = await (adminClient.from('email_queue') as any)
        .select('id', { count: 'exact', head: true })
        .eq('flow_id', flow.id)
        .eq('user_id', user_id)
        .in('status', ['pending', 'sent', 'delivered'])

      if ((count ?? 0) > 0) {
        return NextResponse.json({
          success: true,
          message: 'User already in this flow â€” skipping duplicate',
          queued:  0,
        })
      }
    }

    // Get all steps for this flow
    const { data: steps } = await (adminClient.from('email_flow_steps') as any)
      .select('*').eq('flow_id', flow.id).order('step_order', { ascending: true })

    if (!steps || steps.length === 0) {
      return NextResponse.json({ success: true, message: 'No steps found', queued: 0 })
    }

    const now    = new Date()
    const queued = []

    for (const step of steps) {
      const scheduledFor = new Date(now)
      scheduledFor.setDate(scheduledFor.getDate() + step.delay_days)

      // Replace variables in subject and body
      let subject  = step.subject_line
      let htmlBody = step.email_body

      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          subject  = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
          htmlBody = htmlBody.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
        }
      }

      // Replace common variables
      subject  = subject.replace(/{{name}}/g, to_name ?? 'there')
      htmlBody = htmlBody.replace(/{{name}}/g, to_name ?? 'there')

      // Add unsubscribe link to all emails
      const unsubscribeUrl = `${APP_URL}/unsubscribe?email=${encodeURIComponent(to_email)}`
      htmlBody += `
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8ede2;text-align:center;">
          <p style="font-size:11px;color:#8a9e78;margin:0;">
            You received this email because you signed up for Riazify.
            <a href="${unsubscribeUrl}" style="color:#8a9e78;text-decoration:underline;">Unsubscribe</a>
          </p>
        </div>`

      const { data: queueRow } = await (adminClient.from('email_queue') as any)
        .insert({
          flow_id:       flow.id,
          step_id:       step.id,
          user_id:       user_id ?? null,
          to_email,
          to_name:       to_name ?? null,
          subject,
          html_body:     htmlBody,
          scheduled_for: scheduledFor.toISOString(),
          status:        'pending',
        })
        .select().single()

      queued.push(queueRow)
    }

    return NextResponse.json({ success: true, queued: queued.length, flow: flowName })

  } catch (err: any) {
    console.error('[email/enqueue]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
