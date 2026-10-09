// app/api/admin/maintenance/create/route.ts
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

    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const {
      switch_id, label, frequency, day_of_week, day_of_month,
      start_time, end_time, timezone, custom_message
    } = body

    if (!switch_id)   return NextResponse.json({ error: 'switch_id is required' }, { status: 400 })
    if (!label?.trim()) return NextResponse.json({ error: 'label is required' }, { status: 400 })
    if (!frequency)   return NextResponse.json({ error: 'frequency is required' }, { status: 400 })
    if (!start_time)  return NextResponse.json({ error: 'start_time is required' }, { status: 400 })
    if (!end_time)    return NextResponse.json({ error: 'end_time is required' }, { status: 400 })
    if (!timezone)    return NextResponse.json({ error: 'timezone is required' }, { status: 400 })

    if (frequency === 'weekly' && day_of_week === undefined) {
      return NextResponse.json({ error: 'day_of_week is required for weekly schedules' }, { status: 400 })
    }
    if (frequency === 'monthly' && !day_of_month) {
      return NextResponse.json({ error: 'day_of_month is required for monthly schedules' }, { status: 400 })
    }

    // Calculate next_run_at
    const nextRun = calculateNextRun({ frequency, day_of_week, day_of_month, start_time, timezone })

    const { data, error } = await (adminClient.from('maintenance_schedules') as any).insert({
      switch_id,
      label:      label.trim(),
      frequency,
      day_of_week:  day_of_week ?? null,
      day_of_month: day_of_month ?? null,
      start_time,
      end_time,
      timezone,
      custom_message: custom_message?.trim() ?? null,
      is_active:  true,
      created_by: user.id,
      next_run_at: nextRun,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // â”€â”€ Log to audit trail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      const { data: profile } = await adminClient.from('profiles').select('name').eq('id', user.id).single()
      const { data: sw } = await (adminClient.from('kill_switches') as any).select('title').eq('id', switch_id).single()
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        action:     'schedule_created',
        details:    `Scheduled maintenance: ${sw?.title ?? switch_id} â€” ${label.trim()}`,
        metadata:   {
          admin_name:   (profile as any)?.name ?? 'Admin',
          switch_id,
          switch_title: sw?.title ?? switch_id,
          label:        label.trim(),
          frequency,
          start_time,
          end_time,
          timezone,
        },
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, schedule: data })

  } catch (err: any) {
    console.error('[maintenance/create]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}

function calculateNextRun({ frequency, day_of_week, day_of_month, start_time, timezone }: {
  frequency: string; day_of_week?: number; day_of_month?: number; start_time: string; timezone: string
}): string {
  try {
    const now = new Date()
    const [hours, minutes] = start_time.split(':').map(Number)

    if (frequency === 'once') {
      const next = new Date()
      next.setHours(hours, minutes, 0, 0)
      if (next <= now) next.setDate(next.getDate() + 1)
      return next.toISOString()
    }

    if (frequency === 'weekly' && day_of_week !== undefined) {
      const next = new Date()
      const currentDay = next.getDay()
      let daysUntil = (day_of_week - currentDay + 7) % 7
      next.setHours(hours, minutes, 0, 0)
      if (daysUntil === 0 && next <= now) daysUntil = 7
      next.setDate(next.getDate() + daysUntil)
      return next.toISOString()
    }

    if (frequency === 'monthly' && day_of_month) {
      const next = new Date()
      next.setDate(day_of_month)
      next.setHours(hours, minutes, 0, 0)
      if (next <= now) {
        next.setMonth(next.getMonth() + 1)
        next.setDate(day_of_month)
      }
      return next.toISOString()
    }

    return new Date(Date.now() + 86400000).toISOString()
  } catch {
    return new Date(Date.now() + 86400000).toISOString()
  }
}
