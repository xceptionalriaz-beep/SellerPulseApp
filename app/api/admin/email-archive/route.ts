// app/api/admin/email-archive/route.ts
// ══════════════════════════════════════════════════════════════
// Archives monthly stats and cleans old email data
// Runs daily via cron-job.org
// Also callable manually from admin panel
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return await runArchive()
}

export async function POST(req: NextRequest) {
  // Manual trigger from admin panel
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: { user } } = await adminClient.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await adminClient
    .from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  return await runArchive()
}

async function runArchive() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    // Get retention settings
    const { data: settings } = await (adminClient.from('email_retention_settings') as any)
      .select('*').single()

    if (!(settings as any)?.auto_archive_enabled) {
      return NextResponse.json({ success: true, message: 'Auto-archive disabled', archived: 0, deleted: 0 })
    }

    const retentionDays = (settings as any)?.retention_days ?? 90
    const cutoffDate    = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    const cutoffISO = cutoffDate.toISOString()

    // ── Step 1: Archive monthly stats per flow ────────────────
    const { data: flows } = await (adminClient.from('email_flows') as any)
      .select('id, name, title')

    let archived = 0
    const now        = new Date()
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    for (const flow of flows ?? []) {
      const flowName = (flow as any).name ?? (flow as any).title ?? 'Unknown Flow'

      // Get queue rows for this flow older than retention period
      const { data: oldQueue } = await (adminClient.from('email_queue') as any)
        .select('id, status')
        .eq('flow_id', (flow as any).id)
        .lte('created_at', cutoffISO)
        .in('status', ['sent', 'delivered', 'failed', 'cancelled', 'bounced'])

      if (!oldQueue || oldQueue.length === 0) continue

      const queueIds  = oldQueue.map((q: any) => q.id)
      const sentCount = oldQueue.filter((q: any) => ['sent','delivered'].includes(q.status)).length

      // Get telemetry for these queue rows
      const { data: telemetry } = await (adminClient.from('email_telemetry_logs') as any)
        .select('event_type')
        .in('queue_id', queueIds)

      const opened  = (telemetry ?? []).filter((t: any) => t.event_type === 'email.opened').length
      const clicked = (telemetry ?? []).filter((t: any) => t.event_type === 'email.clicked').length
      const bounced = (telemetry ?? []).filter((t: any) => t.event_type === 'email.bounced').length

      const openRate  = sentCount > 0 ? Number(((opened  / sentCount) * 100).toFixed(2)) : 0
      const clickRate = sentCount > 0 ? Number(((clicked / sentCount) * 100).toFixed(2)) : 0

      // Check if archive for this month already exists
      const { data: existing } = await (adminClient.from('email_stats_archive') as any)
        .select('id')
        .eq('flow_id', (flow as any).id)
        .eq('period_month', periodMonth)
        .single()

      if (existing) {
        // Update existing archive
        await (adminClient.from('email_stats_archive') as any)
          .update({
            total_sent:    sentCount,
            total_opened:  opened,
            total_clicked: clicked,
            total_bounced: bounced,
            open_rate:     openRate,
            click_rate:    clickRate,
            archived_at:   new Date().toISOString(),
          })
          .eq('id', (existing as any).id)
      } else {
        // Insert new archive
        await (adminClient.from('email_stats_archive') as any).insert({
          flow_id:       (flow as any).id,
          flow_name:     flowName,
          period_month:  periodMonth,
          total_sent:    sentCount,
          total_opened:  opened,
          total_clicked: clicked,
          total_bounced: bounced,
          open_rate:     openRate,
          click_rate:    clickRate,
        })
      }

      archived++
    }

    // ── Step 2: Delete old telemetry logs ─────────────────────
    const { count: telemetryDeleted } = await (adminClient.from('email_telemetry_logs') as any)
      .delete({ count: 'exact' })
      .lte('occurred_at', cutoffISO)

    // ── Step 3: Delete old completed queue rows ───────────────
    const { count: queueDeleted } = await (adminClient.from('email_queue') as any)
      .delete({ count: 'exact' })
      .lte('created_at', cutoffISO)
      .in('status', ['sent', 'delivered', 'failed', 'cancelled', 'bounced'])

    // ── Step 4: Update last_archived_at ──────────────────────
    await (adminClient.from('email_retention_settings') as any)
      .update({ last_archived_at: new Date().toISOString() })
      .eq('id', (settings as any).id)

    // ── Step 5: Webhook delivery log cleanup ──────────────────
    let webhookDeleted = 0
    try {
      const webhookCutoff = new Date()
      webhookCutoff.setDate(webhookCutoff.getDate() - 30) // always 30 days
      const webhookCutoffISO = webhookCutoff.toISOString()

      // Get all destinations for archiving
      const { data: destinations } = await (adminClient.from('webhook_destinations') as any)
        .select('id, name')

      for (const dest of destinations ?? []) {
        const { data: oldLogs } = await (adminClient.from('webhook_delivery_log') as any)
          .select('status, duration_ms')
          .eq('destination_id', (dest as any).id)
          .lte('created_at', webhookCutoffISO)

        if (!oldLogs || oldLogs.length === 0) continue

        const total       = oldLogs.length
        const delivered   = oldLogs.filter((l: any) => l.status === 'delivered').length
        const failed      = oldLogs.filter((l: any) => l.status === 'failed').length
        const speeds      = oldLogs.filter((l: any) => l.duration_ms).map((l: any) => l.duration_ms as number)
        const avgSpeed    = speeds.length > 0 ? Math.round(speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length) : 0
        const successRate = total > 0 ? Number(((delivered / total) * 100).toFixed(2)) : 0

        // Check if archive exists for this month
        const { data: existing } = await (adminClient.from('webhook_stats_archive') as any)
          .select('id')
          .eq('destination_id', (dest as any).id)
          .eq('period_month', periodMonth)
          .maybeSingle()

        if (existing) {
          await (adminClient.from('webhook_stats_archive') as any)
            .update({ total_fired: total, total_delivered: delivered, total_failed: failed, success_rate: successRate, avg_speed_ms: avgSpeed, archived_at: new Date().toISOString() })
            .eq('id', (existing as any).id)
        } else {
          await (adminClient.from('webhook_stats_archive') as any)
            .insert({ destination_id: (dest as any).id, dest_name: (dest as any).name, period_month: periodMonth, total_fired: total, total_delivered: delivered, total_failed: failed, success_rate: successRate, avg_speed_ms: avgSpeed })
        }
      }

      // Delete old delivery logs
      const { count: wDeleted } = await (adminClient.from('webhook_delivery_log') as any)
        .delete({ count: 'exact' })
        .lte('created_at', webhookCutoffISO)

      webhookDeleted = wDeleted ?? 0
    } catch (err) {
      console.error('[archive] Webhook cleanup error:', err)
    }

    // ── Clean old api_usage_logs (keep 90 days) ───────────────
    try {
      const cutoff90 = new Date(Date.now() - 90 * 86400000).toISOString()
      await (adminClient.from('api_usage_logs') as any)
        .delete()
        .lt('logged_at', cutoff90)
      console.log('[archive] Old api_usage_logs cleaned')
    } catch (err) {
      console.error('[archive] api_usage_logs cleanup error:', err)
    }
    
    // ── Fix 12: Reset daily API rate limit counters ───────────
    try {
      await (adminClient.from('api_fleet_config') as any)
        .update({ requests_today: 0, rate_limit_used: 0 })
        .not('platform_name', 'like', '%affiliate%')
      console.log('[archive] API daily counters reset')
    } catch (err) {
      console.error('[archive] API counter reset error:', err)
    }

    // ── Missing 6: Reset Resend monthly quota on 1st of month ─
    try {
      const today = new Date()
      if (today.getDate() === 1) {
        await (adminClient.from('api_fleet_config') as any)
          .update({ monthly_used: 0 })
          .eq('platform_name', 'resend')
        console.log('[archive] Resend monthly quota reset')
      }
    } catch (err) {
      console.error('[archive] Monthly reset error:', err)
    }

    return NextResponse.json({
      success:            true,
      archived_flows:     archived,
      telemetry_deleted:  telemetryDeleted ?? 0,
      queue_deleted:      queueDeleted ?? 0,
      webhook_deleted:    webhookDeleted,
      retention_days:     retentionDays,
      cutoff_date:        cutoffISO,
    })

  } catch (err: any) {
    console.error('[email-archive]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}