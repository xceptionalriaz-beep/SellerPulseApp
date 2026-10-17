// app/api/admin/credits/bulk-gift/route.ts
// Admin: gift credits to ALL users on a specific plan (or all users)
// POST body: { plan_name: string | 'all', amount: number, note: string }

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

export async function POST(req: NextRequest) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { plan_name?: string; amount?: number; note?: string }
  try { body = await req.json() } catch { body = {} }

  const { plan_name, amount, note = 'Admin bulk gift' } = body

  if (!plan_name || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'plan_name and a positive amount are required' }, { status: 400 })
  }

  // Cap at 10,000 per bulk action for safety
  if (amount > 10000) {
    return NextResponse.json({ error: 'Maximum bulk gift is 10,000 credits per user' }, { status: 400 })
  }

  // Get target user IDs
  let profileQuery = admin.from('profiles').select('id')
  if (plan_name !== 'all') {
    profileQuery = profileQuery.eq('plan_name', plan_name)
  }
  const { data: profiles, error: pErr } = await profileQuery

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: 'No users found for that plan' }, { status: 404 })
  }

  const userIds = profiles.map((p: any) => p.id)
  let successCount = 0
  let failCount = 0

  // Process in batches of 50
  const BATCH = 50
  for (let i = 0; i < userIds.length; i += BATCH) {
    const batch = userIds.slice(i, i + BATCH)
    await Promise.all(batch.map(async (userId: string) => {
      try {
        // Upsert wallet
        await admin.from('user_ai_wallets').upsert(
          { user_id: userId, balance: 0, lifetime_credits: 0, lifetime_spent: 0 },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )

        // Add credits via RPC
        const { error } = await admin.rpc('gift_ai_credits', {
          p_user_id: userId,
          p_amount: amount,
          p_note: note,
          p_gifted_by: adminUser.id,
        })

        if (error) {
          // Fallback: manual update + ledger insert
          const { data: wallet } = await admin
            .from('user_ai_wallets')
            .select('balance, lifetime_credits')
            .eq('user_id', userId)
            .single()

          const cur = wallet ?? { balance: 0, lifetime_credits: 0 }
          await admin.from('user_ai_wallets').upsert({
            user_id: userId,
            balance: cur.balance + amount,
            lifetime_credits: cur.lifetime_credits + amount,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })

          await admin.from('ai_credit_ledger').insert({
            user_id: userId,
            type: 'gift',
            amount,
            balance_after: cur.balance + amount,
            note,
            feature_key: null,
          })
        }
        successCount++
      } catch {
        failCount++
      }
    }))
  }

  return NextResponse.json({
    ok: true,
    successCount,
    failCount,
    totalTargeted: userIds.length,
  })
}
