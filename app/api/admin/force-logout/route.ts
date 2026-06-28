// app/api/admin/force-logout/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Forces a user's active session to end â€” requires admin role
// Uses service role key server-side (never on client)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const token    = auth.replace('Bearer ', '')
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // â”€â”€ Verify requester is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { data: profile } = await adminClient
      .from('profiles').select('role, name').eq('id', user.id).single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden â€” admin only' }, { status: 403 })
    }

    // â”€â”€ Get target name for logging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: targetProfile } = await adminClient
      .from('profiles').select('name, email').eq('id', userId).single()

    // â”€â”€ Force sign out â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { error: logoutErr } = await adminClient.auth.admin.signOut(userId)
    if (logoutErr) throw logoutErr

    // â”€â”€ Get caller IP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null

    // â”€â”€ Log to admin_logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        target_id:  userId,
        action:     'force_logout',
        details:    `Force logged out â€” ${(targetProfile as any)?.name ?? (targetProfile as any)?.email ?? userId}`,
        metadata:   { admin_name: (profile as any)?.name ?? 'Admin', target_name: (targetProfile as any)?.name ?? userId },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // â”€â”€ Log to audit_logs (legacy) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('audit_logs') as any).insert({
        action:         'force_logout',
        target_user_id: userId,
        performed_by:   user.id,
        details:        'Admin force-logged out user from all devices',
        created_at:     new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // â”€â”€ Log to user_events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await adminClient.from('user_events').insert({
        user_id:     userId,
        event_type:  'force_logout',
        event_title: 'Force Logged Out by Admin',
        event_desc:  'Admin remotely signed out all active sessions',
        metadata:    { performed_by: user.id, admin_name: (profile as any)?.name ?? 'Admin' },
        created_at:  new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[force-logout]', e)
    return NextResponse.json({ error: e.message ?? 'Failed to logout user' }, { status: 500 })
  }
}
