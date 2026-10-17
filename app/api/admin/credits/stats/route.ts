// app/api/admin/credits/stats/route.ts
// Admin: credit usage analytics
// GET — returns daily spend by feature, top users, totals

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

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10)
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const [dailyRes, featureRes, topUsersRes, totalsRes] = await Promise.all([
    // Daily spend (deductions only, last N days)
    admin.from('ai_credit_ledger')
      .select('created_at, amount')
      .eq('type', 'deduction')
      .gte('created_at', since)
      .order('created_at', { ascending: true }),

    // Per-feature totals
    admin.from('ai_credit_ledger')
      .select('feature_key, amount')
      .eq('type', 'deduction')
      .gte('created_at', since),

    // Top spenders
    admin.from('user_ai_wallets')
      .select('user_id, lifetime_spent')
      .order('lifetime_spent', { ascending: false })
      .limit(10),

    // Overall wallet totals
    admin.rpc('sum_credit_wallets').single(),
  ])

  // Aggregate daily spend into { date: string, credits: number }[]
  const dailyMap: Record<string, number> = {}
  for (const row of (dailyRes.data ?? [])) {
    const date = row.created_at.slice(0, 10)
    dailyMap[date] = (dailyMap[date] ?? 0) + Math.abs(row.amount)
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, credits]) => ({ date, credits }))

  // Per-feature totals
  const featureMap: Record<string, number> = {}
  for (const row of (featureRes.data ?? [])) {
    const k = row.feature_key ?? 'unknown'
    featureMap[k] = (featureMap[k] ?? 0) + Math.abs(row.amount)
  }
  const byFeature = Object.entries(featureMap)
    .sort(([, a], [, b]) => b - a)
    .map(([feature_key, credits]) => ({ feature_key, credits }))

  // Enrich top users with email
  const topWallets = topUsersRes.data ?? []
  const topIds = topWallets.map((w: any) => w.user_id)
  let topProfiles: any[] = []
  if (topIds.length > 0) {
    const { data } = await admin.from('profiles').select('id, email, full_name').in('id', topIds)
    topProfiles = data ?? []
  }
  const profileMap = Object.fromEntries(topProfiles.map((p: any) => [p.id, p]))
  const topUsers = topWallets.map((w: any) => ({
    user_id: w.user_id,
    lifetime_spent: w.lifetime_spent,
    email:     profileMap[w.user_id]?.email     ?? null,
    full_name: profileMap[w.user_id]?.full_name ?? null,
  }))

  // Totals: sum from wallets
  const allWallets = await admin.from('user_ai_wallets').select('balance, lifetime_credits, lifetime_spent')
  const totalBalance  = (allWallets.data ?? []).reduce((s: number, w: any) => s + (w.balance ?? 0), 0)
  const totalIssued   = (allWallets.data ?? []).reduce((s: number, w: any) => s + (w.lifetime_credits ?? 0), 0)
  const totalSpent    = (allWallets.data ?? []).reduce((s: number, w: any) => s + (w.lifetime_spent ?? 0), 0)
  const activeWallets = (allWallets.data ?? []).filter((w: any) => w.lifetime_spent > 0).length

  return NextResponse.json({
    daily,
    byFeature,
    topUsers,
    totals: { totalBalance, totalIssued, totalSpent, activeWallets },
    days,
  })
}
