// app/api/admin/gamification/route.ts
// Fetch all gamification data for admin tab
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const now         = new Date()
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today       = now.toISOString().slice(0, 10)

    const [
      { data: quests },
      { data: badges },
      { data: leaderboard },
      { data: pendingFulfillments },
      { count: completionsToday },
      { data: levelStats },
    ] = await Promise.all([
      (adminClient.from('quests') as any)
        .select(`
          *,
          quest_progress(
            id,
            completed,
            current_count
          )
        `)
        .order('sort_order'),
      (adminClient.from('badges') as any)
        .select('*, user_badges(count)')
        .order('xp_reward', { ascending: false }),
      (adminClient.from('leaderboard_monthly_cache') as any)
        .select('*, profiles(email)')
        .eq('period_month', periodMonth)
        .order('rank')
        .limit(10),
      (adminClient.from('quest_progress') as any)
        .select('*, quests(title, reward_text, reward_type), profiles(name, email)')
        .eq('fulfillment_status', 'pending')
        .eq('completed', true)
        .order('completed_at', { ascending: false }),
      (adminClient.from('quest_progress') as any)
        .select('id', { count: 'exact', head: true })
        .eq('completed', true)
        .gte('completed_at', today),
      (adminClient.from('profiles') as any)
        .select('seller_level')
        .gt('total_xp', 0),
    ])

    // Calculate avg level
    const levels    = (levelStats ?? []).map((p: any) => p.seller_level)
    const avgLevel  = levels.length > 0
      ? (levels.reduce((a: number, b: number) => a + b, 0) / levels.length).toFixed(1)
      : '0'

    // Active quest count
    const activeQuests = (quests ?? []).filter((q: any) => q.is_active).length

    // Most popular quest
    const mostPopular = (quests ?? []).reduce((best: any, q: any) => {
      const count = q.quest_progress?.[0]?.count ?? 0
      return count > (best?.quest_progress?.[0]?.count ?? 0) ? q : best
    }, null)

    return NextResponse.json({
      quests,
      badges,
      leaderboard,
      pendingFulfillments,
      stats: {
        activeQuests,
        completionsToday: completionsToday ?? 0,
        avgLevel,
        pendingFulfillments: (pendingFulfillments ?? []).length,
        mostPopular: mostPopular?.title ?? 'â€”',
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
