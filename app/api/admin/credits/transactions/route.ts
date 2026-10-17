// app/api/admin/credits/transactions/route.ts
// Admin: credit transaction log with user info
// GET ?page=0&limit=50&user_id=&type=&feature_key=

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
  const page  = parseInt(sp.get('page')  ?? '0', 10)
  const limit = Math.min(parseInt(sp.get('limit') ?? '50', 10), 200)
  const userId = sp.get('user_id') ?? ''
  const type   = sp.get('type') ?? ''
  const featureKey = sp.get('feature_key') ?? ''

  const from = page * limit
  const to   = from + limit - 1

  let query = admin
    .from('ai_credit_ledger')
    .select('*, profiles!ai_credit_ledger_user_id_fkey(email, full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (userId) query = query.eq('user_id', userId)
  if (type)   query = query.eq('type', type)
  if (featureKey) query = query.eq('feature_key', featureKey)

  const { data, error, count } = await query

  // If the FK join fails (no FK defined), fall back to plain ledger + manual email lookup
  if (error && error.message.includes('foreign key')) {
    const { data: ledger, error: err2, count: cnt2 } = await admin
      .from('ai_credit_ledger')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
    return NextResponse.json({ rows: ledger ?? [], total: cnt2 ?? 0, page, limit })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data ?? [], total: count ?? 0, page, limit })
}
