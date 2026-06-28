// app/api/admin/email-flows/create/route.ts
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

    const { name, trigger_event, description } = await req.json()
    if (!name || !trigger_event) return NextResponse.json({ error: 'name and trigger_event required' }, { status: 400 })

    const { data: flow, error } = await (adminClient.from('email_flows') as any)
      .insert({
        name,
        trigger_event,
        description:  description ?? null,
        is_active:    false, // starts inactive
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, flow })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
