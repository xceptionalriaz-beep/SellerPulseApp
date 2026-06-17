// app/api/admin/webhooks/route.ts
// ══════════════════════════════════════════════════════════════
// Global Webhook Engine — handles dispatch, retry, and logging
// Supports Slack, Discord, and Custom endpoints
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Event label map ────────────────────────────────────────────
const EVENT_LABELS: Record<string, { label: string; emoji: string; color: number }> = {
  'user.signup':           { label: 'New Signup',           emoji: '👤', color: 0x3B82F6 },
  'plan.upgraded':         { label: 'Plan Upgraded',         emoji: '💰', color: 0x8FFF00 },
  'plan.cancelled':        { label: 'Plan Cancelled',        emoji: '❌', color: 0xEF4444 },
  'payment.failed':        { label: 'Payment Failed',        emoji: '⚠️', color: 0xF59E0B },
  'payment.recovered':     { label: 'Payment Recovered',     emoji: '✅', color: 0x22C55E },
  'kill_switch.activated': { label: 'Kill Switch Activated', emoji: '🔴', color: 0xEF4444 },
  'high_risk_order':       { label: 'High Risk Order',       emoji: '🛡️', color: 0xF97316 },
  'api.failure':           { label: 'API Failure',           emoji: '🔧', color: 0xEF4444 },
  'user.limit_hit':        { label: 'User Hit Limit',        emoji: '📊', color: 0x8B5CF6 },
  'admin.login':           { label: 'Admin Login',           emoji: '🔐', color: 0x6B7280 },
}

// ── Format payload for Slack ───────────────────────────────────
function formatSlack(event_type: string, data: Record<string, any>) {
  const ev = EVENT_LABELS[event_type] ?? { label: event_type, emoji: '📡', color: 0x8FFF00 }
  const fields = Object.entries(data)
    .filter(([k]) => !['timestamp'].includes(k))
    .map(([k, v]) => ({
      type: 'mrkdwn',
      text: `*${k.replace(/_/g, ' ').toUpperCase()}*\n${v}`,
      short: true,
    }))

  return {
    attachments: [{
      color:    `#${ev.color.toString(16).padStart(6, '0')}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${ev.emoji} *${ev.label}* — Riazify`,
          },
        },
        {
          type: 'section',
          fields: fields.slice(0, 10),
        },
        {
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `🕐 ${new Date(data.timestamp ?? Date.now()).toUTCString()}`,
          }],
        },
      ],
    }],
  }
}

// ── Format payload for Discord ─────────────────────────────────
function formatDiscord(event_type: string, data: Record<string, any>) {
  const ev = EVENT_LABELS[event_type] ?? { label: event_type, emoji: '📡', color: 0x8FFF00 }
  const fields = Object.entries(data)
    .filter(([k]) => !['timestamp'].includes(k))
    .map(([k, v]) => ({
      name:   k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value:  String(v) || '—',
      inline: true,
    }))

  return {
    embeds: [{
      title:       `${ev.emoji} ${ev.label}`,
      description: `Riazify system event fired`,
      color:       ev.color,
      fields:      fields.slice(0, 25),
      footer:      { text: 'Riazify Webhooks' },
      timestamp:   new Date(data.timestamp ?? Date.now()).toISOString(),
    }],
  }
}

// ── Dispatch single webhook ────────────────────────────────────
async function dispatchWebhook(
  destination: any,
  event_type:  string,
  data:        Record<string, any>,
  logId?:      string,
  attempt:     number = 1,
): Promise<{ success: boolean; code: number; body: string; duration: number }> {
  const startTime = Date.now()

  try {
    // Build payload based on destination type
    let payload: any
    if (destination.type === 'slack') {
      payload = formatSlack(event_type, data)
    } else if (destination.type === 'discord') {
      payload = formatDiscord(event_type, data)
    } else {
      payload = {
        event:     event_type,
        timestamp: new Date().toISOString(),
        source:    'riazify',
        data,
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent':   'Riazify-Webhooks/1.0',
    }

    // Add HMAC signature if secret configured
    if (destination.secret) {
      const body      = JSON.stringify(payload)
      const signature = crypto
        .createHmac('sha256', destination.secret)
        .update(body)
        .digest('hex')
      headers['X-Riazify-Signature'] = `sha256=${signature}`
    }

    const res = await fetch(destination.url, {
      method:  'POST',
      headers,
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(10000), // 10s timeout
    })

    const duration = Date.now() - startTime
    const body     = await res.text().catch(() => '')

    return {
      success:  res.ok,
      code:     res.status,
      body:     body.slice(0, 1000),
      duration,
    }
  } catch (err: any) {
    return {
      success:  false,
      code:     0,
      body:     err.message,
      duration: Date.now() - startTime,
    }
  }
}

// ── POST /api/admin/webhooks — Trigger event ──────────────────
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-internal-secret')
    const validSecret = process.env.INTERNAL_API_SECRET ?? process.env.NEXT_PUBLIC_INTERNAL_SECRET
    if (secret !== validSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { event_type, data = {} } = await req.json()
    if (!event_type) return NextResponse.json({ error: 'event_type required' }, { status: 400 })

    // Find all active destinations subscribed to this event
    const { data: events } = await (adminClient.from('webhook_events') as any)
      .select('*, webhook_destinations(*)')
      .eq('event_type', event_type)
      .eq('is_enabled', true)

    const results = []

    for (const event of events ?? []) {
      const destination = event.webhook_destinations
      if (!destination?.is_active || !destination?.url) continue

      // Create log entry
      const { data: logRow } = await (adminClient.from('webhook_delivery_log') as any)
        .insert({
          destination_id: destination.id,
          event_type,
          status:         'pending',
          attempt_number: 1,
          payload:        { event_type, data },
          created_at:     new Date().toISOString(),
        })
        .select().single()

      // Dispatch webhook
      const result = await dispatchWebhook(destination, event_type, {
        ...data,
        timestamp: new Date().toISOString(),
      }, logRow?.id, 1)

      if (result.success) {
        // Update log — success
        await (adminClient.from('webhook_delivery_log') as any)
          .update({
            status:        'delivered',
            response_code: result.code,
            response_body: result.body,
            duration_ms:   result.duration,
          })
          .eq('id', logRow?.id)
      } else {
        // Retry up to 3 times with backoff
        let retryResult = result
        for (let attempt = 2; attempt <= 3; attempt++) {
          await new Promise(r => setTimeout(r, attempt * 1000))

          await (adminClient.from('webhook_delivery_log') as any)
            .update({ status: 'retrying', attempt_number: attempt })
            .eq('id', logRow?.id)

          retryResult = await dispatchWebhook(destination, event_type, {
            ...data,
            timestamp: new Date().toISOString(),
          }, logRow?.id, attempt)

          if (retryResult.success) break
        }

        // Final status
        await (adminClient.from('webhook_delivery_log') as any)
          .update({
            status:        retryResult.success ? 'delivered' : 'failed',
            response_code: retryResult.code,
            response_body: retryResult.body,
            duration_ms:   retryResult.duration,
          })
          .eq('id', logRow?.id)
      }

      results.push({ destination: destination.name, ...result })
    }

    return NextResponse.json({ success: true, dispatched: results.length, results })

  } catch (err: any) {
    console.error('[webhooks]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── GET /api/admin/webhooks — Fetch data (admin only) ─────────
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const [
      { data: destinations },
      { data: events },
      { data: logs },
    ] = await Promise.all([
      (adminClient.from('webhook_destinations') as any).select('*').order('created_at'),
      (adminClient.from('webhook_events') as any).select('*'),
      (adminClient.from('webhook_delivery_log') as any)
        .select('*, webhook_destinations(name, type)')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    return NextResponse.json({ destinations, events, logs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}