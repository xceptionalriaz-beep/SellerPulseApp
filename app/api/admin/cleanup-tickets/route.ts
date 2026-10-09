// app/api/admin/cleanup-tickets/route.ts
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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    // Delete resolved/closed tickets older than 30 days
    const { data: resolved } = await (adminClient.from('tickets') as any)
      .delete()
      .in('status', ['resolved', 'closed'])
      .lt('created_at', thirtyDaysAgo)
      .select('id')

    // Delete abandoned open tickets older than 90 days
    const { data: abandoned } = await (adminClient.from('tickets') as any)
      .delete()
      .eq('status', 'open')
      .lt('created_at', ninetyDaysAgo)
      .select('id')

    const deleted = (resolved?.length ?? 0) + (abandoned?.length ?? 0)

    // Log cleanup
    if (deleted > 0) {
      await (adminClient.from('admin_notifications') as any).insert({
        type:       'system',
        title:      'Tickets Cleaned',
        message:    `${deleted} old tickets manually deleted by admin`,
        is_read:    false,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, deleted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
