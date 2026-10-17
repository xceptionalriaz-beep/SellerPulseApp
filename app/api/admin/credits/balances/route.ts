// app/api/admin/credits/balances/route.ts
// Admin: all user credit balances, searchable
// GET ?page=0&limit=50&search=

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export async function GET(req: NextRequest) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const page   = parseInt(sp.get('page')  ?? '0', 10)
  const limit  = Math.min(parseInt(sp.get('limit') ?? '50', 10), 200)
  const search = sp.get('search') ?? ''

  const from = page * limit
  const to   = from + limit - 1

  // Join wallets with profiles for email/name
  const { data, error, count } = await admin
    .from('user_ai_wallets')
    .select('user_id, balance, lifetime_credits, lifetime_spent, updated_at', { count: 'exact' })
    .order('balance', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const wallets = data ?? []

  // Enrich with profile emails
  const userIds = wallets.map((w: any) => w.user_id)
  let profiles: any[] = []
  if (userIds.length > 0) {
    const { data: pData } = await admin
      .from('profiles')
      .select('id, email, full_name, plan_name')
      .in('id', userIds)
    profiles = pData ?? []
  }

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))

  let rows = wallets.map((w: any) => ({
    ...w,
    email:     profileMap[w.user_id]?.email     ?? null,
    full_name: profileMap[w.user_id]?.full_name ?? null,
    plan_name: profileMap[w.user_id]?.plan_name ?? null,
  }))

  // Client-side search filter (email/name match) since profile join is separate
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter((r: any) =>
      r.email?.toLowerCase().includes(q) ||
      r.full_name?.toLowerCase().includes(q) ||
      r.user_id?.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({ rows, total: count ?? 0, page, limit })
}
