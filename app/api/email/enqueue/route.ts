// app/api/email/enqueue/route.ts
// ══════════════════════════════════════════════════════════════
// Enqueues emails when trigger events fire
// Called internally when: user signs up, hits limit, payment fails
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Internal only
    const secret = req.headers.get('x-internal-secret')
    if (secret !== process.env.INTERNAL_API_SECRET) {
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

    // Find active flow for this trigger
    const { data: flow } = await (adminClient.from('email_flows') as any)
      .select('id, name').eq('trigger_event', trigger_event).eq('is_active', true).single()

    if (!flow) {
      return NextResponse.json({ success: true, message: 'No active flow for trigger', queued: 0 })
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

    return NextResponse.json({ success: true, queued: queued.length, flow: flow.name })

  } catch (err: any) {
    console.error('[email/enqueue]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}