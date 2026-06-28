// app/api/admin/email-flows/add-step/route.ts
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

    const { flow_id, delay_days, subject_line, email_body } = await req.json()
    if (!flow_id || !subject_line || !email_body) {
      return NextResponse.json({ error: 'flow_id, subject_line and email_body required' }, { status: 400 })
    }

    // Get current max step_order
    const { data: steps } = await (adminClient.from('email_flow_steps') as any)
      .select('step_order').eq('flow_id', flow_id).order('step_order', { ascending: false }).limit(1)
    const nextOrder = ((steps?.[0]?.step_order ?? 0) as number) + 1

    const { data: step, error } = await (adminClient.from('email_flow_steps') as any)
      .insert({
        flow_id,
        step_order:   nextOrder,
        delay_days:   delay_days ?? 0,
        subject_line,
        email_body,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, step })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
