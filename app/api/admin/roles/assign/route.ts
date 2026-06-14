// app/api/admin/roles/assign/route.ts
// ──────────────────────────────────────────────────────────────
// Assigns or revokes a role from a user (updates profiles.role_id)
// Pass roleId: null to revoke access
// Requires admin Bearer token
// Cannot modify the founder account (role = 'admin')
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

    // ── 1. Verify caller is admin ──────────────────────────────
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: callerProfile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()

    if ((callerProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ── 2. Parse body ──────────────────────────────────────────
    // roleId can be null → revokes access
    const { userId, roleId } = await req.json()

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    // ── 3. Verify target user exists and is not founder ────────
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role, name, email')
      .eq('id', userId)
      .single()

    if (!targetProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if ((targetProfile as any).role === 'admin') {
      return NextResponse.json({ error: 'Cannot modify the founder account role' }, { status: 403 })
    }

    // ── 4. If roleId provided, verify it exists ────────────────
    if (roleId) {
      const { data: role } = await adminClient
        .from('admin_roles')
        .select('id, role_name')
        .eq('id', roleId)
        .single()

      if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // ── 5. Update profiles.role_id ─────────────────────────────
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role_id: roleId ?? null })
      .eq('id', userId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // ── 6. Log to user_events ──────────────────────────────────
    try {
      const action = roleId ? 'Role Assigned' : 'Role Revoked'
      const roleName = roleId
        ? (await adminClient.from('admin_roles').select('role_name').eq('id', roleId).single())?.data?.role_name ?? 'Unknown Role'
        : 'No Role'
      await adminClient.from('user_events').insert({
        user_id:     userId,
        event_type:  'admin_action',
        event_title: action,
        event_desc:  roleId
          ? `Assigned "${roleName}" role by ${(callerProfile as any).name ?? 'Admin'}`
          : `Role revoked by ${(callerProfile as any).name ?? 'Admin'}`,
        metadata:    { performed_by: caller.id, admin_name: (callerProfile as any)?.name ?? 'Admin', role_id: roleId ?? null },
        created_at:  new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Assign role error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}