// app/api/admin/kill-switches/request-kill-all/route.ts
// ══════════════════════════════════════════════════════════════
// Creates a Kill All approval request
// → If only 1 admin exists → executes immediately with warning
// → If 2+ admins exist → sends approval request to other admins
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seller-pulse-app-git-main-xceptionalriaz-3369s-projects.vercel.app'

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
      .from('profiles').select('role, name, email').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { reason } = await req.json()
    if (!reason?.trim() || reason.trim().length < 5) {
      return NextResponse.json({ error: 'Reason of at least 5 characters required' }, { status: 400 })
    }

    const now = new Date()

    // ── Check how many super admins exist ─────────────────
    const { data: allAdmins } = await adminClient
      .from('profiles').select('id, name, email, is_super_admin').eq('role', 'admin')

    const otherSuperAdmins = (allAdmins ?? []).filter((a: any) => 
      a.id !== user.id && a.is_super_admin === true
    )

    // ── No other super admin — execute directly ───────────
    if (otherSuperAdmins.length === 0) {
      const { data: activeSwitches } = await (adminClient.from('kill_switches') as any)
        .select('id, title').eq('is_enabled', true)

      if (!activeSwitches || activeSwitches.length === 0) {
        return NextResponse.json({ error: 'No active switches to disable' }, { status: 400 })
      }

      await (adminClient.from('kill_switches') as any)
        .update({ is_enabled: false, changed_by: user.id, change_note: reason.trim(), updated_at: now.toISOString() })
        .eq('is_enabled', true)

      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        action:     'kill_all_switches',
        details:    `EMERGENCY KILL ALL (single admin — no approval needed): ${(activeSwitches as any[]).map((s: any) => s.title).join(', ')}`,
        metadata:   { admin_name: (profile as any)?.name, change_note: reason.trim(), count: activeSwitches.length, single_admin: true },
        created_at: now.toISOString(),
      })

      return NextResponse.json({ success: true, mode: 'direct', killed: activeSwitches.length })
    }

    // ── Multiple admins — create approval request ──────────
    const approvalToken = crypto.randomBytes(32).toString('hex')
    const expiresAt     = new Date(now.getTime() + 10 * 60000) // 10 minutes

    const { data: approval, error: approvalErr } = await (adminClient.from('kill_switch_approvals') as any)
      .insert({
        action:         'kill_all',
        requested_by:   user.id,
        requester_name: (profile as any)?.name ?? 'Admin',
        reason:         reason.trim(),
        status:         'pending',
        expires_at:     expiresAt.toISOString(),
        token:          approvalToken,
      }).select().single()

    if (approvalErr) return NextResponse.json({ error: approvalErr.message }, { status: 500 })

    // ── Send approval email to super admins only ──────────
    for (const admin of otherSuperAdmins) {
      try {
        const approveUrl = `${APP_URL}/dashboard/admin/approve?token=${approvalToken}&action=approve`
        const rejectUrl  = `${APP_URL}/dashboard/admin/approve?token=${approvalToken}&action=reject`

        await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:    'notifications@dropnrest.com',
            to:      [(admin as any).email],
            subject: `[Riazify] Approval Required — Kill All requested by ${(profile as any)?.name}`,
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f9f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8ede2;">
    <div style="background:#b91c1c;padding:24px 32px;">
      <p style="margin:0;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;">🚨 APPROVAL REQUIRED</p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:900;">Kill All — Awaiting Your Approval</h1>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px;">Requested by</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0a0d08;">${(profile as any)?.name ?? 'Admin'}</td>
        </tr>
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Action</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:#b91c1c;">KILL ALL SWITCHES</td>
        </tr>
        <tr style="border-bottom:1px solid #e8ede2;">
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Reason</td>
          <td style="padding:8px 0;font-size:13px;font-style:italic;color:#0a0d08;">"${reason.trim()}"</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Expires</td>
          <td style="padding:8px 0;font-size:13px;color:#d97706;">In 10 minutes</td>
        </tr>
      </table>
      <div style="margin-top:24px;display:flex;gap:12px;text-align:center;">
        <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:700;margin-right:12px;">
          Approve Kill All
        </a>
        <a href="${rejectUrl}" style="display:inline-block;background:#f1f5f9;color:#64748b;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:700;">
          Reject
        </a>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#94a3b8;text-align:center;">
        This request expires in 10 minutes. After that it will be automatically cancelled.
      </p>
    </div>
  </div>
</body>
</html>`,
          }),
        })
      } catch { /* non-critical */ }
    }

    // ── Log the request ────────────────────────────────────
    await (adminClient.from('admin_logs') as any).insert({
      admin_id:   user.id,
      action:     'kill_all_requested',
      details:    `Kill All approval requested by ${(profile as any)?.name}`,
      metadata:   { admin_name: (profile as any)?.name, reason: reason.trim(), approval_id: approval.id, expires_at: expiresAt.toISOString() },
      created_at: now.toISOString(),
    })

    return NextResponse.json({
      success:    true,
      mode:       'pending_approval',
      approvalId: approval.id,
      expiresAt:  expiresAt.toISOString(),
      notified:   otherSuperAdmins.length,
    })

  } catch (err: any) {
    console.error('[request-kill-all]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}