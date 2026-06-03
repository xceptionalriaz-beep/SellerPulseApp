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

    // ── Verify caller is admin ─────────────────────────────────
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check caller is admin
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
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
        plan_name:    plan ?? 'Free Trial',
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

    // ── Update profiles table ─────────────────────────────────
    await supabase.from('profiles').update({
      name:           name.trim(),
      gender:         gender ?? 'Unspecified',
      plan_name:      plan ?? 'Free Trial',
      account_status: 'Active',
      role:           role ?? 'user',
    }).eq('id', data.user.id)

    // ── Insert into subscriptions ─────────────────────────────
    const amount = (plan ?? '').toLowerCase().includes('elite') ? 99
                 : (plan ?? '').toLowerCase().includes('pro')   ? 49 : 0

    await supabase.from('subscriptions').insert({
      user_id:         data.user.id,
      plan_name:       plan ?? 'Free Trial',
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

    return NextResponse.json({
      success:  true,
      userId:   data.user.id,
      message:  'User created successfully',
    })

  } catch (err) {
    console.error('Create user error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}