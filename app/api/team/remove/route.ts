// app/api/team/remove/route.ts
// ─────────────────────────────────────────────────────────────
// Owner removes a team member OR member leaves a team
// Both cases handled in one route
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { Resend }       from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── 1. Verify caller ──────────────────────────────────────
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller } } = await supabase.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── 2. Parse body ─────────────────────────────────────────
    // ownerId + memberId: owner removing a member
    // ownerId only (caller is member): member leaving
    const { ownerId, memberId } = await req.json()
    if (!ownerId) return NextResponse.json({ error: 'ownerId required' }, { status: 400 })

    const targetMemberId = memberId ?? caller.id

    // ── 3. Permission check ───────────────────────────────────
    // Only owner OR the member themselves can remove
    const isOwner  = caller.id === ownerId
    const isMember = caller.id === targetMemberId

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Not authorized to remove this member' }, { status: 403 })
    }

    // Admin can also remove anyone
    const { data: callerProfile } = await supabase
      .from('profiles').select('role').eq('id', caller.id).single()
    const isAdmin = (callerProfile as any)?.role === 'admin'

    if (!isOwner && !isMember && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // ── 4. Remove team member ─────────────────────────────────
    const { error: removeErr } = await supabase
      .from('team_members')
      .update({ status: 'removed' })
      .eq('owner_id', ownerId)
      .eq('member_id', targetMemberId)
      .eq('status', 'active')

    if (removeErr) throw removeErr

    // ── 5. Clear active_team_owner_id if member was switched ──
    await supabase
      .from('profiles')
      .update({ active_team_owner_id: null })
      .eq('id', targetMemberId)
      .eq('active_team_owner_id', ownerId)

    // ── 6. Send email notification to removed member ─────────
    if (isOwner) {
      try {
        const { data: memberAuth } = await supabase.auth.admin.getUserById(targetMemberId)
        const { data: ownerProfile } = await supabase
          .from('profiles').select('name, email').eq('id', caller.id).single()

        const memberEmail = memberAuth?.user?.email
        const ownerName   = (ownerProfile as any)?.name ?? caller.email?.split('@')[0] ?? 'Account Owner'
        const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Riazify <support@riazify.com>'

        if (memberEmail) {
          await resend.emails.send({
            from:    fromAddress,
            to:      [memberEmail],
            subject: `Your access to ${ownerName}'s Riazify account has been removed`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
                <h2 style="color:#0a0d08;font-size:20px;margin-bottom:8px;">
                  Team access removed
                </h2>
                <p style="color:#4a5568;font-size:15px;line-height:1.6;">
                  Your access to <strong>${ownerName}</strong>'s Riazify account
                  has been removed. You can no longer view or manage their account.
                </p>
                <p style="color:#4a5568;font-size:15px;line-height:1.6;">
                  Your own Riazify account remains active and unaffected.
                </p>
                <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
                  The Riazify Team
                </p>
              </div>
            `,
          })
        }
      } catch { /* non-critical — don't fail the removal */ }
    }

    return NextResponse.json({
      success: true,
      message: isOwner
        ? 'Team member removed successfully'
        : 'You have left the team',
    })

  } catch (err: any) {
    console.error('Team remove error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to remove member' }, { status: 500 })
  }
}