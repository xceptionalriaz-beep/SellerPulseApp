// app/api/admin/kill-switches/kill-all/route.ts
// ──────────────────────────────────────────────────────────────
// Emergency: disables ALL kill switches at once
// Founder only — logs single high-priority audit event
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── Verify admin ───────────────────────────────────────────
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller } } = await adminClient.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ── Validate reason ────────────────────────────────────────
    const { change_note, reason } = await req.json()
    const killReason = change_note ?? reason
    if (!killReason?.trim() || killReason.trim().length < 5) {
      return NextResponse.json({ error: 'Emergency reason of at least 5 characters is required' }, { status: 400 })
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') || null

    const now = new Date().toISOString()

    // ── Fetch all currently active switches ────────────────────
    const { data: activeSwitches } = await (adminClient.from('kill_switches') as any)
      .select('id, title').eq('is_enabled', true)

    if (!activeSwitches || activeSwitches.length === 0) {
      return NextResponse.json({ error: 'No active switches to disable' }, { status: 400 })
    }

    // ── Disable all switches ───────────────────────────────────
    const { error: updateErr } = await (adminClient.from('kill_switches') as any)
      .update({
        is_enabled:  false,
        changed_by:  caller.id,
        change_note: killReason.trim(),
        updated_at:  now,
      })
      .eq('is_enabled', true)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // ── Log single high-priority audit event ───────────────────
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'kill_all_switches',
        details:    `EMERGENCY KILL ALL — disabled ${activeSwitches.length} switch${activeSwitches.length !== 1 ? 'es' : ''}: ${(activeSwitches as any[]).map((s: any) => s.title).join(', ')}`,
        metadata:   {
          admin_name:      (profile as any)?.name ?? 'Admin',
          change_note:     killReason.trim(),
          switches_killed: (activeSwitches as any[]).map((s: any) => ({ id: s.id, title: s.title })),
          count:           activeSwitches.length,
          priority:        'HIGH',
        },
        ip_address: ipAddress,
        created_at: now,
      })
    } catch { /* non-critical */ }

    // ── Send notification ──────────────────────────────────────
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
      await fetch(`${appUrl}/api/admin/notify/kill-switch`, {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
        },
        body: JSON.stringify({
          switchTitle:  'ALL SYSTEMS',
          adminName:    (profile as any)?.name ?? 'Admin',
          reason:       killReason.trim(),
          userMessage:  null,
          reEnableMins: null,
          action:       'kill_all',
          time:         new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        }),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({
      success: true,
      killed:  activeSwitches.length,
      switches: activeSwitches,
    })

  } catch (err: any) {
    console.error('[kill-switches/kill-all]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
