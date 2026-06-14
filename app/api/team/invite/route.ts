// app/api/team/invite/route.ts
// ─────────────────────────────────────────────────────────────
// Owner sends an invite email to a team member
// Checks plan limits before allowing invite
// Sends email via Resend with accept link
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { Resend }       from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Max team members per plan
const PLAN_LIMITS: Record<string, number> = {
  'free trial': 0,
  'pro plan':   3,
  'elite plan': 10,
}

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

    // ── 2. Get owner profile + plan ───────────────────────────
    const { data: owner } = await supabase
      .from('profiles').select('*').eq('id', caller.id).single()

    const plan      = ((owner as any)?.plan_name ?? 'free trial').toLowerCase()
    const limit     = PLAN_LIMITS[plan] ?? 0

    if (limit === 0) {
      return NextResponse.json({
        error: 'Your plan does not support team members. Upgrade to Pro or Elite.'
      }, { status: 403 })
    }

    // ── 3. Check current team size ────────────────────────────
    const { count: currentCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', caller.id)
      .eq('status', 'active')

    if ((currentCount ?? 0) >= limit) {
      return NextResponse.json({
        error: `Team limit reached. Your ${plan} allows ${limit} member${limit > 1 ? 's' : ''}.`
      }, { status: 403 })
    }

    // ── 4. Parse body ─────────────────────────────────────────
    const { email, role = 'viewer' } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const validRoles = ['viewer', 'order_manager', 'full_access']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // ── 5. Check not already a member ────────────────────────
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('email', email).single()

    if (existing) {
      const { data: alreadyMember } = await supabase
        .from('team_members')
        .select('id').eq('owner_id', caller.id)
        .eq('member_id', (existing as any).id)
        .eq('status', 'active').single()

      if (alreadyMember) {
        return NextResponse.json({ error: 'This person is already in your team' }, { status: 400 })
      }
    }

    // ── 6. Cancel any pending invite for same email ───────────
    await supabase.from('team_invites')
      .update({ status: 'expired' })
      .eq('owner_id', caller.id)
      .eq('email', email)
      .eq('status', 'pending')

    // ── 7. Create new invite ──────────────────────────────────
    const { data: invite, error: inviteErr } = await supabase
      .from('team_invites')
      .insert({ owner_id: caller.id, email, role })
      .select().single()

    if (inviteErr || !invite) throw inviteErr ?? new Error('Failed to create invite')

    // ── 8. Send invite email ──────────────────────────────────
    const origin     = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const acceptLink = `${origin}/team/accept?token=${(invite as any).token}`
    const ownerName  = (owner as any)?.name ?? caller.email?.split('@')[0] ?? 'Someone'
    const roleName   = role === 'order_manager' ? 'Order Manager' : role === 'full_access' ? 'Full Access' : 'Viewer'
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Riazify <support@riazify.com>'

    await resend.emails.send({
      from:    fromAddress,
      to:      [email],
      subject: `${ownerName} invited you to their Riazify team`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#0a0d08;font-size:22px;margin-bottom:8px;">
            You've been invited to join a team
          </h2>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;">
            <strong>${ownerName}</strong> has invited you to manage their
            Riazify account as <strong>${roleName}</strong>.
          </p>
          <p style="color:#4a5568;font-size:15px;line-height:1.6;">
            You'll be able to access their eBay orders and tools
            without sharing passwords.
          </p>
          <a href="${acceptLink}"
             style="display:inline-block;margin-top:20px;padding:14px 32px;background:#8fff00;
                    color:#0a0d08;font-weight:700;border-radius:12px;text-decoration:none;font-size:15px;">
            Accept Invitation →
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            This invite expires in 7 days.
            If you didn't expect this, you can ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      inviteId: (invite as any).id,
    })

  } catch (err: any) {
    console.error('Team invite error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to send invite' }, { status: 500 })
  }
}