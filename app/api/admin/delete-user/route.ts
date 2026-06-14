// app/api/admin/delete-user/route.ts
// ──────────────────────────────────────────────────────────────
// Permanently deletes a user — requires admin role
// Uses service role key server-side (never on client)
// ──────────────────────────────────────────────────────────────

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

    // ── Verify requester is admin ──────────────────────────────
    const { data: { user }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { data: profile } = await adminClient
      .from('profiles').select('role, name').eq('id', user.id).single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    // ── Get target info before deleting ───────────────────────
    const { data: targetProfile } = await adminClient
      .from('profiles').select('name, email').eq('id', userId).single()

    // ── Delete from Supabase Auth ──────────────────────────────
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteErr) throw deleteErr

    // ── Belt-and-suspenders: delete from profiles ──────────────
    await adminClient.from('profiles').delete().eq('id', userId)

    // ── Get caller IP ──────────────────────────────────────────
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null

    // ── Log to admin_logs ──────────────────────────────────────
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        target_id:  null, // already deleted
        action:     'delete_user',
        details:    `Permanently deleted account — ${(targetProfile as any)?.name ?? (targetProfile as any)?.email ?? userId}`,
        metadata:   { admin_name: (profile as any)?.name ?? 'Admin', target_name: (targetProfile as any)?.name ?? userId, target_email: (targetProfile as any)?.email ?? null },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // ── Log to audit_logs (legacy) ─────────────────────────────
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