// app/api/admin/create-user/route.ts
// Server-side API route — uses service role key safely

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // ── Create admin client with service role key ─────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── Verify caller is admin ────────────────────────────────
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', caller.id)
      .single()

    if ((callerProfile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ── Get request body ──────────────────────────────────────
    const { name, email, password, gender, plan, role, sendWelcome } = await req.json()

    // ── Validate ──────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // ── Create user in Supabase Auth ──────────────────────────
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email:         email.trim(),
      password:      password.trim(),
      email_confirm: true,
      user_metadata: {
        full_name:    name.trim(),
        gender:       gender ?? 'Unspecified',
        plan_name:    plan ?? 'Free',
        send_welcome: sendWelcome ?? true,
      },
    })

    if (createError) {
      if (createError.message.includes('already registered')) {
        return NextResponse.json({ error: 'This email is already registered!' }, { status: 409 })
      }
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    const newUserId = data.user.id

    // ── Update profiles table ─────────────────────────────────
    await supabase.from('profiles').update({
      name:           name.trim(),
      gender:         gender ?? 'Unspecified',
      plan_name:      plan ?? 'Free',
      account_status: 'Active',
      role:           role ?? 'user',
    }).eq('id', newUserId)

    // ── Insert into subscriptions ─────────────────────────────
    const amount = (plan ?? '').toLowerCase().includes('elite') ? 99
                 : (plan ?? '').toLowerCase().includes('pro')   ? 49 : 0

    await supabase.from('subscriptions').insert({
      user_id:         newUserId,
      plan_name:       plan ?? 'Free',
      amount,
      status:          amount === 0 ? 'trial' : 'active',
      provider:        'manual',
      paid_at:         new Date().toISOString(),
      next_billing_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    })

    // ── Insert admin notification ─────────────────────────────
    await supabase.from('admin_notifications').insert({
      type:    'new_user',
      title:   '👤 New User Added',
      message: `${name.trim()} (${email.trim()}) was added manually by admin.`,
      is_read: false,
    })

    // ── Get caller IP ─────────────────────────────────────────
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null

    // ── Log to admin_logs ─────────────────────────────────────
    try {
      await (supabase.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        target_id:  newUserId,
        action:     'create_user',
        details:    `Created new user account — ${name.trim()} (${email.trim()})`,
        metadata:   {
          admin_name:   (callerProfile as any)?.name ?? 'Admin',
          target_name:  name.trim(),
          target_email: email.trim(),
          plan:         plan ?? 'Free',
          role:         role ?? 'user',
        },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    // ── Log signup event to user journey timeline ─────────────
    try {
      await supabase.from('user_events').insert({
        user_id:     newUserId,
        event_type:  'signup',
        event_title: 'Signed up for Riazify',
        event_desc:  `${plan ?? 'Free'} started · Created by admin`,
        metadata:    {
          plan:         plan ?? 'Free',
          role:         role ?? 'user',
          created_by:   caller.id,
          send_welcome: sendWelcome ?? true,
        },
        created_at: new Date().toISOString(),
      })

      // If paid plan — also log the upgrade event
      if (amount > 0) {
        await supabase.from('user_events').insert({
          user_id:     newUserId,
          event_type:  'plan_upgraded',
          event_title: `Upgraded to ${plan}`,
          event_desc:  `$${amount}/month · Activated by admin`,
          metadata:    { plan, amount, created_by: caller.id },
          created_at:  new Date().toISOString(),
        })
      }
    } catch { /* non-critical — user is already created */ }

    return NextResponse.json({
      success: true,
      userId:  newUserId,
      message: 'User created successfully',
    })

  } catch (err) {
    console.error('Create user error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}