// app/api/admin/impersonate/route.ts
// ──────────────────────────────────────────────────────────────
// Generates a one-time magic link to login as a target user.
// Admin opens the link in a new tab — no password needed.
// User is never notified. Link expires in 24 hours.
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── 1. Verify caller is admin ──────────────────────────────
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user: caller }, error: authErr } =
      await adminClient.auth.getUser(token)
    if (authErr || !caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role, name')
      .eq('id', caller.id)
      .single()

    if ((callerProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ── 2. Parse body ──────────────────────────────────────────
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // ── 3. Prevent self-impersonation ──────────────────────────
    if (userId === caller.id) {
      return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 })
    }

    // ── 4. Get target user info ────────────────────────────────
    const { data: targetAuth } = await adminClient.auth.admin.getUserById(userId)
    if (!targetAuth?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role, name, account_status')
      .eq('id', userId)
      .single()

    // ── 5. Prevent impersonating admins ───────────────────────
    if ((targetProfile as any)?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot impersonate another admin' }, { status: 403 })
    }

    // ── 6. Prevent impersonating banned/suspended users ───────
    const accountStatus = (targetProfile as any)?.account_status ?? ''
    if (accountStatus === 'Banned') {
      return NextResponse.json({ error: 'Cannot impersonate a banned account' }, { status: 403 })
    }

    // ── 7. Generate magic link ─────────────────────────────────
    const origin     = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const redirectTo = `${origin}/admin/view-as`

    const { data: linkData, error: linkErr } =
      await adminClient.auth.admin.generateLink({
        type:    'magiclink',
        email:   targetAuth.user.email!,
        options: { redirectTo },
      })

    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(linkErr?.message ?? 'Failed to generate magic link')
    }

    const magicLink = linkData.properties.action_link

    // ── 8. Get caller IP ───────────────────────────────────────
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null

    // ── 9. Log to admin_logs — impersonation is high risk ─────
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        target_id:  userId,
        action:     'impersonate',
        details:    `Impersonated account — ${(targetProfile as any)?.name ?? targetAuth.user.email}`,
        metadata:   {
          admin_name:   (callerProfile as any)?.name ?? 'Admin',
          target_name:  (targetProfile as any)?.name ?? userId,
          target_email: targetAuth.user.email ?? null,
        },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // ── 10. Log to user_events ─────────────────────────────────
    try {
      await adminClient.from('user_events').insert({
        user_id:     userId,
        event_type:  'admin_impersonation',
        event_title: 'Admin Viewed Account',
        event_desc:  `${(callerProfile as any)?.name ?? 'Admin'} logged in as this user for support`,
        metadata:    {
          admin_id:   caller.id,
          admin_name: (callerProfile as any)?.name ?? 'Admin',
        },
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({
      success:   true,
      magicLink,
      userName:  (targetProfile as any)?.name ?? targetAuth.user.email,
      userEmail: targetAuth.user.email,
    })

  } catch (err: any) {
    console.error('Impersonate error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}