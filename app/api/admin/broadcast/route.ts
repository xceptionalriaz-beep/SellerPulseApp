// app/api/admin/broadcast/route.ts
// Saves announcement to DB for all target users to see

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { message, target, action_url, action_text, expires_hours } = await req.json()

    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Calculate expiry (default 7 days)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (expires_hours ?? 168))

    const { data, error } = await (adminClient.from('announcements') as any).insert({
      message:     message.trim(),
      action_url:  action_url ?? null,
      action_text: action_text ?? null,
      target:      target ?? 'all',
      is_active:   true,
      created_by:  user.id,
      created_at:  new Date().toISOString(),
      expires_at:  expiresAt.toISOString(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Log to admin notifications
    await (adminClient.from('admin_notifications') as any).insert({
      type:       'broadcast',
      title:      'Broadcast Sent',
      message:    `Announcement sent to ${target}: "${message.trim().slice(0, 60)}..."`,
      is_read:    false,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, announcement: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Get active announcements for current user
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ announcements: [] })

    const { data: { user } } = await adminClient.auth.getUser(token)
    if (!user) return NextResponse.json({ announcements: [] })

    // Get user plan for targeting
    const { data: profile } = await (adminClient.from('profiles') as any)
      .select('plan_name')
      .eq('id', user.id)
      .single()

    const plan = ((profile as any)?.plan_name ?? '').toLowerCase()

    // Get active non-expired announcements
    const { data: all } = await (adminClient.from('announcements') as any)
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    // Get dismissed announcements for this user
    const { data: dismissed } = await (adminClient.from('announcement_dismissals') as any)
      .select('announcement_id')
      .eq('user_id', user.id)

    const dismissedIds = new Set((dismissed ?? []).map((d: any) => d.announcement_id))

    // Filter by target and not dismissed
    const announcements = (all ?? []).filter((a: any) => {
      if (dismissedIds.has(a.id)) return false
      if (a.target === 'all')     return true
      if (a.target === 'starter') return plan === 'starter'
      if (a.target === 'growth')  return plan === 'growth'
      if (a.target === 'custom')  return plan === 'custom'
      if (a.target === 'free')    return plan === 'free' || plan === 'free trial'
      return true
    })

    return NextResponse.json({ announcements })
  } catch (err: any) {
    return NextResponse.json({ announcements: [] })
  }
}