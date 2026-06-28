// app/api/admin/gamification/quest/save/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { id, title, description, reward_text, reward_type, reward_value, target_count, action_type, xp_reward, icon, category, is_active, sort_order } = body

    if (id) {
      const { data, error } = await (adminClient.from('quests') as any)
        .update({ title, description, reward_text, reward_type, reward_value, target_count, action_type, xp_reward, icon, category, is_active, sort_order, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, quest: data })
    } else {
      const { data, error } = await (adminClient.from('quests') as any)
        .insert({ title, description, reward_text, reward_type: reward_type ?? 'badge', reward_value: reward_value ?? 0, target_count: target_count ?? 1, action_type: action_type ?? 'manual', xp_reward: xp_reward ?? 50, icon: icon ?? 'trophy', category: category ?? 'onboarding', is_active: true, sort_order: sort_order ?? 99 })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, quest: data })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
