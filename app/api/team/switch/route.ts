// app/api/team/switch/route.ts
// ─────────────────────────────────────────────────────────────
// Team member switches to an owner's account view
// OR switches back to their own account
// Sets profiles.active_team_owner_id
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
    // ownerId = null means switch back to own account
    const { ownerId } = await req.json()

    if (ownerId) {
      // ── 3. Verify caller is actually a member of this owner ──
      const { data: membership } = await supabase
        .from('team_members')
        .select('id, role')
        .eq('owner_id', ownerId)
        .eq('member_id', caller.id)
        .eq('status', 'active')
        .single()

      if (!membership) {
        return NextResponse.json({
          error: 'You are not a member of this team'
        }, { status: 403 })
      }

      // ── 4. Get owner info ────────────────────────────────────
      const { data: owner } = await supabase
        .from('profiles')
        .select('name, email, account_status')
        .eq('id', ownerId)
        .single()

      // Block if owner account is suspended or banned
      const ownerStatus = ((owner as any)?.account_status ?? 'Active').toLowerCase()
      if (ownerStatus === 'suspended' || ownerStatus === 'banned') {
        return NextResponse.json({
          error: 'This account is currently suspended and cannot be accessed'
        }, { status: 403 })
      }

      const ownerName = (owner as any)?.name
        ?? (owner as any)?.email?.split('@')[0]
        ?? 'Team Account'

      // ── 5. Set active_team_owner_id ──────────────────────────
      await (supabase.from('profiles') as any)
        .update({ active_team_owner_id: ownerId })
        .eq('id', caller.id)

      return NextResponse.json({
        success:   true,
        switched:  true,
        ownerId,
        ownerName,
        role:      (membership as any).role,
        message:   `Now viewing ${ownerName}'s account`,
      })

    } else {
      // ── Switch back to own account ───────────────────────────
      await (supabase.from('profiles') as any)
        .update({ active_team_owner_id: null })
        .eq('id', caller.id)

      return NextResponse.json({
        success:  true,
        switched: false,
        message:  'Switched back to your account',
      })
    }

  } catch (err: any) {
    console.error('Team switch error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to switch' }, { status: 500 })
  }
}