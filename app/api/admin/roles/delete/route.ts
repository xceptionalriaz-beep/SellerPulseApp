// app/api/admin/roles/delete/route.ts
// ──────────────────────────────────────────────────────────────
// Deletes a custom role from admin_roles table
// HARD BLOCK: refuses deletion if any profiles still use this role
// Requires admin Bearer token
// Cannot delete system roles
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
    const { roleId } = await req.json()
    if (!roleId) return NextResponse.json({ error: 'roleId is required' }, { status: 400 })

    // ── 3. Check role exists and is not a system role ──────────
    const { data: existing } = await adminClient
      .from('admin_roles')
      .select('is_system_role, role_name')
      .eq('id', roleId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    if ((existing as any).is_system_role) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 403 })
    }

    // ── 4. HARD BLOCK — check if any profiles use this role ───
    const { count, error: countError } = await adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role_id', roleId)

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

    if (count && count > 0) {
      return NextResponse.json({
        error: `Cannot delete: ${count} member${count !== 1 ? 's are' : ' is'} still assigned to this role. Reassign them first.`,
        code:  'MEMBERS_ASSIGNED',
        count,
      }, { status: 409 })
    }

    // ── 5. Safe to delete ─────────────────────────────────────
    const { error: deleteError } = await adminClient
      .from('admin_roles')
      .delete()
      .eq('id', roleId)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

    // ── 6. Log to user_events ──────────────────────────────────
    try {
      await adminClient.from('user_events').insert({
        user_id:     caller.id,
        event_type:  'admin_action',
        event_title: 'Role Deleted',
        event_desc:  `Admin deleted role: ${(existing as any).role_name}`,
        metadata:    { performed_by: caller.id, admin_name: (callerProfile as any)?.name ?? 'Admin', role_id: roleId },
        created_at:  new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Delete role error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}