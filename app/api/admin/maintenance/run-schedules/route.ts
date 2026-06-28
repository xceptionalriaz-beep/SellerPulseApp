// app/api/admin/maintenance/run-schedules/route.ts
// â”€â”€ Vercel Cron Job â€” runs every minute â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Checks all active maintenance schedules and:
// 1. Disables switch if maintenance window starts
// 2. Re-enables switch if maintenance window ends

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now     = new Date()
  const nowUTC  = now.toISOString()
  const results = { triggered: 0, ended: 0, errors: 0, autoReEnabled: 0 }

  try {
    // â”€â”€ Check auto re-enable timers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: timedSwitches } = await (adminClient.from('kill_switches') as any)
      .select('id, title, is_enabled, re_enable_at')
      .eq('is_enabled', false)
      .not('re_enable_at', 'is', null)
      .lte('re_enable_at', nowUTC)

    for (const sw of timedSwitches ?? []) {
      try {
        await (adminClient.from('kill_switches') as any).update({
          is_enabled:   true,
          change_note:  null,
          user_message: null,
          re_enable_at: null,
          updated_at:   nowUTC,
        }).eq('id', sw.id)

        await (adminClient.from('admin_logs') as any).insert({
          action:     'enable_kill_switch',
          details:    `Auto re-enabled: ${sw.title}`,
          metadata:   {
            switch_id:    sw.id,
            switch_title: sw.title,
            previous:     false,
            new_value:    true,
            auto:         true,
            admin_name:   'System (Auto Timer)',
          },
          created_at: nowUTC,
        })
        results.autoReEnabled++
      } catch { results.errors++ }
    }

    // Fetch all active schedules
    const { data: schedules } = await (adminClient.from('maintenance_schedules') as any)
      .select('*, kill_switches(id, title, is_enabled)')
      .eq('is_active', true)

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ success: true, message: 'No active schedules', ...results })
    }

    for (const schedule of schedules) {
      try {
        const sw = schedule.kill_switches
        if (!sw) continue

        const inWindow = isInMaintenanceWindow(schedule, now)
        const pastEnd  = isPastEndTime(schedule, now)

        // Window started â€” disable switch
        if (inWindow && sw.is_enabled) {
          await (adminClient.from('kill_switches') as any).update({
            is_enabled:  false,
            change_note: schedule.custom_message ?? `Scheduled maintenance: ${schedule.label}`,
            updated_at:  nowUTC,
          }).eq('id', sw.id)

          // Log to audit
          await (adminClient.from('admin_logs') as any).insert({
            action:     'disable_kill_switch',
            details:    `Scheduled maintenance started: ${sw.title}`,
            metadata:   {
              schedule_id:    schedule.id,
              schedule_label: schedule.label,
              switch_title:   sw.title,
              auto:           true,
            },
            created_at: nowUTC,
          })

          // Update last_triggered_at
          await (adminClient.from('maintenance_schedules') as any).update({
            last_triggered_at: nowUTC,
          }).eq('id', schedule.id)

          results.triggered++
        }

        // Window ended â€” re-enable switch
        if (pastEnd && !sw.is_enabled && schedule.last_triggered_at) {
          await (adminClient.from('kill_switches') as any).update({
            is_enabled:  true,
            change_note: null,
            updated_at:  nowUTC,
          }).eq('id', sw.id)

          // Log to audit
          await (adminClient.from('admin_logs') as any).insert({
            action:     'enable_kill_switch',
            details:    `Scheduled maintenance ended: ${sw.title}`,
            metadata:   {
              schedule_id:    schedule.id,
              schedule_label: schedule.label,
              switch_title:   sw.title,
              auto:           true,
            },
            created_at: nowUTC,
          })

          // Calculate next run
          const nextRun = calculateNextRun(schedule)
          await (adminClient.from('maintenance_schedules') as any).update({
            next_run_at: nextRun,
          }).eq('id', schedule.id)

          results.ended++
        }

      } catch (e) {
        console.error(`[cron] error processing schedule ${schedule.id}:`, e)
        results.errors++
      }
    }

    return NextResponse.json({ success: true, ...results })

  } catch (err: any) {
    console.error('[maintenance/run-schedules]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function isInMaintenanceWindow(schedule: any, now: Date): boolean {
  const currentDay  = now.getUTCDay()
  const currentTime = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`

  if (schedule.frequency === 'weekly') {
    if (currentDay !== schedule.day_of_week) return false
  }
  if (schedule.frequency === 'monthly') {
    if (now.getUTCDate() !== schedule.day_of_month) return false
  }

  const start = schedule.start_time?.slice(0, 5) ?? '00:00'
  const end   = schedule.end_time?.slice(0, 5)   ?? '00:00'

  // Handle overnight windows (e.g. 23:00 - 02:00)
  if (start > end) {
    return currentTime >= start || currentTime < end
  }
  return currentTime >= start && currentTime < end
}

function isPastEndTime(schedule: any, now: Date): boolean {
  const currentDay  = now.getUTCDay()
  const currentTime = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`

  if (schedule.frequency === 'weekly') {
    if (currentDay !== schedule.day_of_week) return false
  }
  if (schedule.frequency === 'monthly') {
    if (now.getUTCDate() !== schedule.day_of_month) return false
  }

  const end = schedule.end_time?.slice(0, 5) ?? '00:00'
  return currentTime >= end
}

function calculateNextRun(schedule: any): string {
  const now = new Date()
  const [hours, minutes] = (schedule.start_time ?? '00:00').split(':').map(Number)

  if (schedule.frequency === 'weekly') {
    const next = new Date()
    const currentDay = next.getUTCDay()
    let daysUntil = (schedule.day_of_week - currentDay + 7) % 7
    if (daysUntil === 0) daysUntil = 7
    next.setUTCDate(next.getUTCDate() + daysUntil)
    next.setUTCHours(hours, minutes, 0, 0)
    return next.toISOString()
  }

  if (schedule.frequency === 'monthly') {
    const next = new Date()
    next.setUTCDate(schedule.day_of_month)
    next.setUTCHours(hours, minutes, 0, 0)
    if (next <= now) next.setUTCMonth(next.getUTCMonth() + 1)
    return next.toISOString()
  }

  return new Date(Date.now() + 86400000).toISOString()
}
