// app/api/admin/roles/invite/route.ts
// ──────────────────────────────────────────────────────────────
// Invites a user to become an admin team member
// Completely separate from /api/team/invite (user eBay team)
// No plan limits — founder only action
// If email exists → assign role_id directly (no email needed)
// If email doesn't exist → create team_invite + send email
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { Resend }       from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── 1. Verify caller is founder ────────────────────────────
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(token)
    if (authErr || !caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: callerProfile } = await adminClient
      .from('profiles').select('role, name, email').eq('id', caller.id).single()

    if ((callerProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Founder access required' }, { status: 403 })
    }

    // ── 2. Parse body ──────────────────────────────────────────
    const { email, adminRoleId } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!adminRoleId) {
      return NextResponse.json({ error: 'Admin role is required' }, { status: 400 })
    }

    // ── 3. Verify the role exists ──────────────────────────────
    const { data: role } = await adminClient
      .from('admin_roles')
      .select('id, role_name')
      .eq('id', adminRoleId)
      .single()

    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 })

    // ── 4. Check if email already has a Riazify account ───────
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, name, email, role_id')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existingProfile) {
      // ── User exists — assign role_id directly ───────────────
      const p = existingProfile as any

      // Cannot assign to another admin/founder
      const { data: existingAuth } = await adminClient
        .from('profiles').select('role').eq('id', p.id).single()
      if ((existingAuth as any)?.role === 'admin') {
        return NextResponse.json({ error: 'Cannot assign a role to another founder account' }, { status: 403 })
      }

      // Assign role_id
      const { error: assignErr } = await adminClient
        .from('profiles')
        .update({ role_id: adminRoleId })
        .eq('id', p.id)

      if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 500 })

      // Log to user_events
      try {
        await adminClient.from('user_events').insert({
          user_id:     p.id,
          event_type:  'admin_action',
          event_title: 'Role Assigned',
          event_desc:  `Admin role "${(role as any).role_name}" assigned by ${(callerProfile as any)?.name ?? 'Founder'}`,
          metadata:    {
            performed_by: caller.id,
            admin_name:   (callerProfile as any)?.name ?? 'Founder',
            role_id:      adminRoleId,
            role_name:    (role as any).role_name,
          },
          created_at: new Date().toISOString(),
        })
      } catch { /* non-critical */ }

      return NextResponse.json({
        success:  true,
        assigned: true,
        message:  `Role assigned directly to ${p.name ?? email} — they already have an account`,
      })
    }

    // ── 5. User doesn't exist — create pending invite ──────────
    // Cancel any existing pending admin invite for this email
    await (adminClient.from('team_invites') as any)
      .update({ status: 'expired' })
      .eq('email', email.trim().toLowerCase())
      .eq('owner_id', caller.id)
      .eq('status', 'pending')
      .not('admin_role_id', 'is', null)

    // Create new invite with admin_role_id
    const { data: invite, error: inviteErr } = await (adminClient.from('team_invites') as any)
      .insert({
        owner_id:      caller.id,
        email:         email.trim().toLowerCase(),
        role:          'viewer', // legacy field — not used for admin invites
        admin_role_id: adminRoleId,
        status:        'pending',
      })
      .select()
      .single()

    if (inviteErr || !invite) {
      return NextResponse.json({ error: inviteErr?.message ?? 'Failed to create invite' }, { status: 500 })
    }

    // ── 6. Send invite email ───────────────────────────────────
    const origin      = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const acceptLink  = `${origin}/team/accept?token=${(invite as any).token}`
    const founderName = (callerProfile as any)?.name ?? 'The Riazify Team'
    const roleName    = (role as any).role_name
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Riazify <support@riazify.com>'

    await resend.emails.send({
      from:    fromAddress,
      to:      [email.trim()],
      subject: `${founderName} invited you to the Riazify admin team`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">
            You've been invited to join the admin team
          </h2>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;">
            <strong>${founderName}</strong> has invited you to manage the
            Riazify platform as <strong>${roleName}</strong>.
          </p>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;">
            Create your account to get started. Your admin access will be
            activated automatically when you sign up with this email address.
          </p>
          <a href="${acceptLink}"
             style="display:inline-block;margin-top:20px;padding:14px 32px;
                    background:#8fff00;color:#0a0d08;font-weight:700;
                    border-radius:12px;text-decoration:none;font-size:15px;">
            Accept Invitation →
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            This invite expires in 7 days.
            If you didn't expect this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success:  true,
      assigned: false,
      message:  `Invite sent to ${email.trim()} — they'll get access when they create an account`,
    })

  } catch (err: any) {
    console.error('Admin roles invite error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}