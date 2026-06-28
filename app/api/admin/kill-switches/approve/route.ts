// app/api/admin/kill-switches/approve/route.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Handles approval or rejection of a Kill All request
// Called when admin clicks Approve/Reject in email or UI
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://seller-pulse-app-git-main-xceptionalriaz-3369s-projects.vercel.app'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { token, action } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })
    if (!['approve', 'reject'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    // â”€â”€ Get approver identity (optional auth) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let approverId:   string | null = null
    let approverName: string | null = null

    const authToken = req.headers.get('authorization')?.replace('Bearer ', '')
    if (authToken) {
      const { data: { user } } = await adminClient.auth.getUser(authToken)
      if (user) {
        approverId = user.id
        const { data: profile } = await adminClient.from('profiles').select('name, role').eq('id', user.id).single()
        approverName = (profile as any)?.name ?? 'Admin'
        // Prevent self-approval
        const { data: approval } = await (adminClient.from('kill_switch_approvals') as any)
          .select('requested_by').eq('token', token).single()
        if ((approval as any)?.requested_by === user.id) {
          return NextResponse.json({ error: 'You cannot approve your own request' }, { status: 403 })
        }
      }
    }

    const now = new Date().toISOString()

    // â”€â”€ Fetch the approval request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: approval } = await (adminClient.from('kill_switch_approvals') as any)
      .select('*').eq('token', token).single()

    if (!approval) return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
    if ((approval as any).status !== 'pending') {
      return NextResponse.json({ error: `Request already ${(approval as any).status}`, status: (approval as any).status }, { status: 400 })
    }
    if (new Date((approval as any).expires_at) < new Date()) {
      await (adminClient.from('kill_switch_approvals') as any)
        .update({ status: 'expired', resolved_at: now }).eq('token', token)
      return NextResponse.json({ error: 'Request has expired', status: 'expired' }, { status: 400 })
    }

    if (action === 'reject') {
      // â”€â”€ Reject â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      await (adminClient.from('kill_switch_approvals') as any).update({
        status:       'rejected',
        approved_by:  approverId,
        approver_name: approverName ?? 'Admin',
        resolved_at:  now,
      }).eq('token', token)

      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   approverId,
        action:     'kill_all_rejected',
        details:    `Kill All rejected by ${approverName ?? 'Admin'}`,
        metadata:   { approver_name: approverName, requester_name: (approval as any).requester_name, reason: (approval as any).reason },
        created_at: now,
      })

      // Notify requester
      try {
        const { data: requester } = await adminClient.from('profiles').select('email').eq('id', (approval as any).requested_by).single()
        if ((requester as any)?.email) {
          await fetch('https://api.resend.com/emails', {
            method:  'POST',
            headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from:    'notifications@dropnrest.com',
              to:      [(requester as any).email],
              subject: '[Riazify] Kill All Request â€” REJECTED',
              html: `<div style="font-family:sans-serif;max-width:500px;margin:40px auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e8ede2;">
                <h2 style="color:#b91c1c;">Kill All Request Rejected</h2>
                <p>Your Kill All request was <strong>rejected</strong> by ${approverName ?? 'an admin'}.</p>
                <p style="color:#6b7280;">Reason you gave: "${(approval as any).reason}"</p>
                <a href="${APP_URL}/dashboard/admin" style="display:inline-block;background:#0a0d08;color:#8fff00;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;">View Kill Switches</a>
              </div>`,
            }),
          })
        }
      } catch { /* non-critical */ }

      return NextResponse.json({ success: true, status: 'rejected' })
    }

    // â”€â”€ Approve â€” execute Kill All â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: activeSwitches } = await (adminClient.from('kill_switches') as any)
      .select('id, title').eq('is_enabled', true)

    if (!activeSwitches || activeSwitches.length === 0) {
      await (adminClient.from('kill_switch_approvals') as any)
        .update({ status: 'approved', approved_by: approverId, approver_name: approverName, resolved_at: now })
        .eq('token', token)
      return NextResponse.json({ success: true, status: 'approved', killed: 0, message: 'No active switches to disable' })
    }

    await (adminClient.from('kill_switches') as any)
      .update({ is_enabled: false, changed_by: (approval as any).requested_by, change_note: (approval as any).reason, updated_at: now })
      .eq('is_enabled', true)

    await (adminClient.from('kill_switch_approvals') as any).update({
      status:        'approved',
      approved_by:   approverId,
      approver_name: approverName ?? 'Admin',
      resolved_at:   now,
    }).eq('token', token)

    await (adminClient.from('admin_logs') as any).insert({
      admin_id:   approverId,
      action:     'kill_all_switches',
      details:    `EMERGENCY KILL ALL approved by ${approverName ?? 'Admin'} â€” requested by ${(approval as any).requester_name}`,
      metadata:   {
        admin_name:      approverName ?? 'Admin',
        requester_name:  (approval as any).requester_name,
        change_note:     (approval as any).reason,
        switches_killed: (activeSwitches as any[]).map((s: any) => ({ id: s.id, title: s.title })),
        count:           activeSwitches.length,
        two_person_auth: true,
        priority:        'HIGH',
      },
      created_at: now,
    })

    // Notify requester of approval
    try {
      const { data: requester } = await adminClient.from('profiles').select('email').eq('id', (approval as any).requested_by).single()
      if ((requester as any)?.email) {
        await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:    'notifications@dropnrest.com',
            to:      [(requester as any).email],
            subject: `[Riazify] Kill All APPROVED â€” ${activeSwitches.length} switches offline`,
            html: `<div style="font-family:sans-serif;max-width:500px;margin:40px auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e8ede2;">
              <h2 style="color:#16a34a;">Kill All Approved</h2>
              <p>Your Kill All request was <strong>approved</strong> by ${approverName ?? 'an admin'}.</p>
              <p style="color:#6b7280;">${activeSwitches.length} switches are now offline.</p>
              <a href="${APP_URL}/dashboard/admin" style="display:inline-block;background:#0a0d08;color:#8fff00;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;">View Kill Switches</a>
            </div>`,
          }),
        })
      }
    } catch { /* non-critical */ }

    // Send notification email
    try {
      const appUrlFetch = process.env.NEXT_PUBLIC_APP_URL ?? APP_URL
      await fetch(`${appUrlFetch}/api/admin/notify/kill-switch`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '' },
        body: JSON.stringify({
          switchTitle:  'ALL SYSTEMS',
          adminName:    `${(approval as any).requester_name} (approved by ${approverName ?? 'Admin'})`,
          reason:       (approval as any).reason,
          userMessage:  null,
          reEnableMins: null,
          action:       'kill_all',
          time:         new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        }),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, status: 'approved', killed: activeSwitches.length })

  } catch (err: any) {
    console.error('[approve-kill-all]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
