// app/api/admin/roles/update/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Updates name, description and scopes of a custom role
// Bumps updated_at timestamp â†’ triggers stale session detection
// Requires admin Bearer token
// Cannot modify system roles
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ 1. Verify caller is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: callerProfile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()

    if ((callerProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // â”€â”€ 2. Parse body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { roleId, roleName, description, scopes } = await req.json()

    if (!roleId) return NextResponse.json({ error: 'roleId is required' }, { status: 400 })
    if (!roleName || typeof roleName !== 'string' || roleName.trim().length < 2) {
      return NextResponse.json({ error: 'Role name must be at least 2 characters' }, { status: 400 })
    }
    if (!Array.isArray(scopes)) {
      return NextResponse.json({ error: 'Scopes must be an array' }, { status: 400 })
    }

    // â”€â”€ 3. Check role exists and is not a system role â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: existing } = await adminClient
      .from('admin_roles')
      .select('is_system_role, role_name')
      .eq('id', roleId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    if ((existing as any).is_system_role) {
      return NextResponse.json({ error: 'System roles cannot be modified' }, { status: 403 })
    }

    // â”€â”€ 4. Update role â€” bump updated_at for stale session check
    const now = new Date().toISOString()
    const { data, error } = await adminClient
      .from('admin_roles')
      .update({
        role_name:   roleName.trim(),
        description: (description ?? '').trim(),
        scopes:      scopes,
        updated_at:  now,
      })
      .eq('id', roleId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // â”€â”€ 5. Log to user_events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await adminClient.from('user_events').insert({
        user_id:     caller.id,
        event_type:  'admin_action',
        event_title: 'Role Updated',
        event_desc:  `Admin updated role: ${roleName.trim()}`,
        metadata:    { performed_by: caller.id, admin_name: (callerProfile as any)?.name ?? 'Admin', role_id: roleId, scopes },
        created_at:  now,
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, role: data })

  } catch (err: any) {
    console.error('Update role error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
