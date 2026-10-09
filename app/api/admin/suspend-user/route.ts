// app/api/admin/suspend-user/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Handles: suspend | reactivate | ban
// All 3 use Supabase Auth admin.updateUserById
// Requires admin Bearer token
// Cannot suspend/ban other admins or self
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
    const { userId, action } = await req.json()
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 })
    }
    if (!['suspend', 'reactivate', 'ban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // â”€â”€ 3. Prevent self-action â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (userId === caller.id) {
      return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 })
    }

    // â”€â”€ 4. Prevent suspending other admins â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: targetProfile } = await adminClient
      .from('profiles').select('role, name, account_status').eq('id', userId).single()

    if ((targetProfile as any)?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot suspend another admin account' }, { status: 403 })
    }

    // â”€â”€ 5. Apply action via Supabase Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const banDuration = action === 'reactivate' ? 'none' : '876000h'
    const { error: banErr } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
    })
    if (banErr) throw banErr

    // â”€â”€ 6. Update profiles.account_status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const newStatus =
      action === 'suspend'    ? 'Suspended' :
      action === 'ban'        ? 'Banned'    : 'Active'

    await adminClient.from('profiles')
      .update({ account_status: newStatus })
      .eq('id', userId)

    // â”€â”€ 7. Force logout if suspending â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (action !== 'reactivate') {
      await adminClient.auth.admin.signOut(userId)
    }

    // â”€â”€ 8. Get caller IP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null

    // â”€â”€ 9. Log to admin_logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        target_id:  userId,
        action:     action === 'reactivate' ? 'reactivate_user' : action === 'ban' ? 'ban_user' : 'suspend_user',
        details:    `${action === 'suspend' ? 'Suspended' : action === 'ban' ? 'Banned' : 'Reactivated'} account â€” ${(targetProfile as any)?.name ?? userId}`,
        metadata:   { admin_name: (callerProfile as any)?.name ?? 'Admin', target_name: (targetProfile as any)?.name ?? userId, new_status: newStatus },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // â”€â”€ 10. Log to user journey timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const eventMap: Record<string, { type: string; title: string; desc: string }> = {
      suspend:    { type: 'account_suspended',   title: 'Account Suspended',         desc: 'Admin suspended account â€” login blocked'     },
      reactivate: { type: 'account_reactivated', title: 'Account Reactivated',       desc: 'Admin restored access â€” user can login again' },
      ban:        { type: 'account_banned',      title: 'Account Permanently Banned', desc: 'Admin permanently banned this account'       },
    }
    const ev = eventMap[action]
    try {
      await adminClient.from('user_events').insert({
        user_id:     userId,
        event_type:  ev.type,
        event_title: ev.title,
        event_desc:  ev.desc,
        metadata:    { performed_by: caller.id, admin_name: (callerProfile as any)?.name ?? 'Admin' },
        created_at:  new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({
      success:   true,
      action,
      newStatus,
      message:   `User ${action === 'suspend' ? 'suspended' : action === 'ban' ? 'banned' : 'reactivated'} successfully`,
    })

  } catch (err: any) {
    console.error('Suspend user error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
