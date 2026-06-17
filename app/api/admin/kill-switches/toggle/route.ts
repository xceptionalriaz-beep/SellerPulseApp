// app/api/admin/kill-switches/toggle/route.ts
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

    const { data: { user: caller } } = await adminClient.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data: existing } = await (adminClient.from('kill_switches') as any)
      .select('title, is_enabled, is_visible').eq('id', id).single()
    if (!existing) return NextResponse.json({ error: 'Switch not found' }, { status: 404 })

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') || null

    const now = new Date().toISOString()

    // ── Handle visibility toggle ───────────────────────────────
    if (typeof body.is_visible === 'boolean') {
      const { data: updated, error } = await (adminClient.from('kill_switches') as any)
        .update({ is_visible: body.is_visible, updated_at: now })
        .eq('id', id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      try {
        await (adminClient.from('admin_logs') as any).insert({
          admin_id:   caller.id,
          action:     body.is_visible ? 'show_kill_switch' : 'hide_kill_switch',
          details:    `${body.is_visible ? 'Shown' : 'Hidden'} from sidebar: ${(existing as any).title}`,
          metadata:   { admin_name: (profile as any)?.name ?? 'Admin', switch_id: id, switch_title: (existing as any).title, is_visible: body.is_visible },
          ip_address: ipAddress,
          created_at: now,
        })
      } catch { /* non-critical */ }
      return NextResponse.json({ success: true, switch: updated })
    }

    // ── Handle read-only toggle ────────────────────────────────
    if (typeof body.is_read_only === 'boolean') {
      const { data: updated, error } = await (adminClient.from('kill_switches') as any)
        .update({ is_read_only: body.is_read_only, updated_at: now })
        .eq('id', id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      try {
        await (adminClient.from('admin_logs') as any).insert({
          admin_id:   caller.id,
          action:     body.is_read_only ? 'set_read_only' : 'unset_read_only',
          details:    `${body.is_read_only ? 'Set to read-only' : 'Restored to full access'}: ${(existing as any).title}`,
          metadata:   { admin_name: (profile as any)?.name ?? 'Admin', switch_id: id, switch_title: (existing as any).title, is_read_only: body.is_read_only },
          ip_address: ipAddress,
          created_at: now,
        })
      } catch { /* non-critical */ }
      return NextResponse.json({ success: true, switch: updated })
    }

    // ── Handle is_enabled toggle ───────────────────────────────
    const { is_enabled, change_note, user_message } = body

    if (typeof is_enabled !== 'boolean') {
      return NextResponse.json({ error: 'is_enabled or is_visible is required' }, { status: 400 })
    }

    if (!is_enabled) {
      if (!change_note?.trim() || change_note.trim().length < 5) {
        return NextResponse.json({ error: 'A reason of at least 5 characters is required to disable a switch' }, { status: 400 })
      }
    }

    const { re_enable_minutes } = body
    let re_enable_at: string | null = null
    if (!is_enabled && re_enable_minutes && re_enable_minutes > 0) {
      re_enable_at = new Date(Date.now() + re_enable_minutes * 60000).toISOString()
    }

    const { data: updated, error: updateErr } = await (adminClient.from('kill_switches') as any)
      .update({
        is_enabled,
        changed_by:   caller.id,
        change_note:  is_enabled ? null : change_note.trim(),
        user_message: is_enabled ? null : (user_message?.trim() || null),
        re_enable_at: is_enabled ? null : re_enable_at,
        updated_at:   now,
      })
      .eq('id', id).select().single()

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     is_enabled ? 'enable_kill_switch' : 'disable_kill_switch',
        details:    `${is_enabled ? 'Enabled' : 'Disabled'} kill switch: ${(existing as any).title}`,
        metadata:   {
          admin_name:        (profile as any)?.name ?? 'Admin',
          switch_id:         id,
          switch_title:      (existing as any).title,
          previous:          (existing as any).is_enabled,
          new_value:         is_enabled,
          change_note:       change_note?.trim() ?? null,
          user_message:      user_message?.trim() ?? null,
          re_enable_minutes: re_enable_minutes ?? null,
        },
        ip_address: ipAddress,
        created_at: now,
      })
    } catch { /* non-critical */ }

    // ── Send notification if disabling ─────────────────────────
    if (!is_enabled) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
        await fetch(`${appUrl}/api/admin/notify/kill-switch`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '' },
          body: JSON.stringify({
            switchTitle:  (existing as any).title,
            adminName:    (profile as any)?.name ?? 'Admin',
            reason:       change_note?.trim() ?? null,
            userMessage:  user_message?.trim() ?? null,
            reEnableMins: re_enable_minutes ?? null,
            action:       'disabled',
            time:         new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          }),
        })
      } catch { /* non-critical */ }
    }

    // ── Fire webhook — kill switch event ───────────────────────
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get('host')}`
      await fetch(`${appUrl}/api/admin/webhooks`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '' },
        body:    JSON.stringify({
          event_type: 'kill_switch.activated',
          data: {
            tool:    (existing as any).title,
            action:  is_enabled ? 'enabled' : 'disabled',
            admin:   (profile as any)?.name ?? 'Admin',
            reason:  change_note?.trim() ?? null,
          }
        }),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, switch: updated })

  } catch (err: any) {
    console.error('[kill-switches/toggle]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}