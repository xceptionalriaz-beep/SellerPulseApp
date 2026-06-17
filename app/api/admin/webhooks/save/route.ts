// app/api/admin/webhooks/save/route.ts
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

    const { id, name, type, url, secret, is_active, events } = await req.json()

    if (id) {
      // Update existing
      await (adminClient.from('webhook_destinations') as any)
        .update({ name, type, url, secret: secret || null, is_active, updated_at: new Date().toISOString() })
        .eq('id', id)

      // Update events
      if (events) {
        for (const [event_type, is_enabled] of Object.entries(events)) {
          await (adminClient.from('webhook_events') as any)
            .update({ is_enabled })
            .eq('destination_id', id)
            .eq('event_type', event_type)
        }
      }

      return NextResponse.json({ success: true, id })
    } else {
      // Create new destination
      const { data: dest, error } = await (adminClient.from('webhook_destinations') as any)
        .insert({ name, type, url, secret: secret || null, is_active: false })
        .select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Create default events
      const ALL_EVENTS = [
        'user.signup', 'plan.upgraded', 'plan.cancelled', 'payment.failed',
        'payment.recovered', 'kill_switch.activated', 'high_risk_order',
        'api.failure', 'user.limit_hit', 'admin.login',
      ]
      await (adminClient.from('webhook_events') as any).insert(
        ALL_EVENTS.map(event_type => ({
          destination_id: (dest as any).id,
          event_type,
          is_enabled: ['user.signup','plan.upgraded','plan.cancelled','payment.failed','kill_switch.activated'].includes(event_type),
        }))
      )

      return NextResponse.json({ success: true, destination: dest })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}