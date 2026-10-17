// app/api/admin/credits/settings/route.ts
// Admin: read/write credit policy settings stored in admin_settings
// Settings managed: signup_credits, overage_policy, credit_expiry_policy

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const KEYS = ['signup_credits', 'overage_policy', 'credit_expiry_policy'] as const
type SettingKey = typeof KEYS[number]

async function getAdminUser() {
  try {
    const cookieStore = await cookies()
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return null
    const role = (user.user_metadata?.role ?? user.app_metadata?.role) as string | undefined
    if (role !== 'admin' && role !== 'superadmin') return null
    return user
  } catch { return null }
}

export async function GET() {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await admin
    .from('admin_settings')
    .select('key, value')
    .in('key', [...KEYS])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings: Record<string, string> = {}
  for (const row of (data ?? [])) {
    settings[row.key] = row.value
  }
  // Apply defaults for any missing keys
  return NextResponse.json({
    signup_credits:       settings['signup_credits']       ?? '25',
    overage_policy:       settings['overage_policy']       ?? 'block',
    credit_expiry_policy: settings['credit_expiry_policy'] ?? 'rollover',
  })
}

export async function POST(req: NextRequest) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Partial<Record<SettingKey, string>>
  try { body = await req.json() } catch { body = {} }

  const updates = Object.entries(body)
    .filter(([k]) => KEYS.includes(k as SettingKey))
    .map(([key, value]) => ({ key, value: String(value) }))

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
  }

  // Upsert each setting
  const { error } = await admin
    .from('admin_settings')
    .upsert(updates.map(u => ({ ...u, updated_at: new Date().toISOString() })), { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
