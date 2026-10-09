// app/api/team/accept/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Member clicks the invite link â†’ joins the team
// Token from URL â†’ validates â†’ creates team_members row
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ 1. Verify caller (must be logged in) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Please log in first' }, { status: 401 })

    const { data: { user: caller } } = await supabase.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // â”€â”€ 2. Get invite token from body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { inviteToken } = await req.json()
    if (!inviteToken) return NextResponse.json({ error: 'Invite token required' }, { status: 400 })

    // â”€â”€ 3. Find and validate the invite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: invite } = await supabase
      .from('team_invites')
      .select('*')
      .eq('token', inviteToken)
      .eq('status', 'pending')
      .single()

    if (!invite) {
      return NextResponse.json({
        error: 'Invite not found, already used, or expired'
      }, { status: 404 })
    }

    // Check not expired
    if (new Date((invite as any).expires_at) < new Date()) {
      await supabase.from('team_invites')
        .update({ status: 'expired' }).eq('id', (invite as any).id)
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 })
    }

    // Check email matches
    if (caller.email !== (invite as any).email) {
      return NextResponse.json({
        error: `This invite was sent to ${(invite as any).email}. Please log in with that account.`
      }, { status: 403 })
    }

    // Can't join your own team
    if (caller.id === (invite as any).owner_id) {
      return NextResponse.json({ error: 'You cannot join your own team' }, { status: 400 })
    }

    // â”€â”€ 4. Create team_members row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { error: memberErr } = await supabase
      .from('team_members')
      .upsert({
        owner_id:  (invite as any).owner_id,
        member_id: caller.id,
        role:      (invite as any).role,
        status:    'active',
        joined_at: new Date().toISOString(),
      }, { onConflict: 'owner_id,member_id' })

    if (memberErr) throw memberErr

    // â”€â”€ 5. Mark invite as accepted â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await supabase.from('team_invites')
      .update({ status: 'accepted' }).eq('id', (invite as any).id)

    // â”€â”€ 6. Get owner name for response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: ownerProfile } = await supabase
      .from('profiles').select('name, email').eq('id', (invite as any).owner_id).single()

    const ownerName = (ownerProfile as any)?.name
      ?? (ownerProfile as any)?.email?.split('@')[0]
      ?? 'the account owner'

    return NextResponse.json({
      success:   true,
      message:   `You joined ${ownerName}'s team!`,
      ownerId:   (invite as any).owner_id,
      ownerName,
      role:      (invite as any).role,
    })

  } catch (err: any) {
    console.error('Team accept error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to accept invite' }, { status: 500 })
  }
}
