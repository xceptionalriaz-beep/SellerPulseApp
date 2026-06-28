// app/api/admin/delete-user/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Permanently deletes a user â€” requires admin role
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
    const token      = auth.replace('Bearer ', '')
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

    // â”€â”€ Get target info before deleting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: targetProfile } = await adminClient
      .from('profiles').select('name, email').eq('id', userId).single()

    // â”€â”€ Delete from Supabase Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteErr) throw deleteErr

    // â”€â”€ Belt-and-suspenders: delete from profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await adminClient.from('profiles').delete().eq('id', userId)

    // â”€â”€ Get caller IP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null

    // â”€â”€ Log to admin_logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        target_id:  null, // already deleted
        action:     'delete_user',
        details:    `Permanently deleted account â€” ${(targetProfile as any)?.name ?? (targetProfile as any)?.email ?? userId}`,
        metadata:   { admin_name: (profile as any)?.name ?? 'Admin', target_name: (targetProfile as any)?.name ?? userId, target_email: (targetProfile as any)?.email ?? null },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // â”€â”€ Log to audit_logs (legacy) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('audit_logs') as any).insert({
        action:         'delete_user',
        target_user_id: userId,
        performed_by:   user.id,
        details:        'Admin permanently deleted user account',
        created_at:     new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[delete-user]', e)
    return NextResponse.json({ error: e.message ?? 'Failed to delete user' }, { status: 500 })
  }
}
