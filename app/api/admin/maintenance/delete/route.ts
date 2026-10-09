// app/api/admin/maintenance/delete/route.ts
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

    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // â”€â”€ Fetch schedule details before deleting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: schedule } = await (adminClient.from('maintenance_schedules') as any)
      .select('label, switch_id, kill_switches(title)')
      .eq('id', id).single()

    const { error } = await (adminClient.from('maintenance_schedules') as any)
      .delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // â”€â”€ Log to audit trail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      const { data: profile } = await adminClient.from('profiles').select('name').eq('id', user.id).single()
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        action:     'schedule_deleted',
        details:    `Deleted schedule: ${(schedule as any)?.kill_switches?.title ?? 'Unknown'} â€” ${(schedule as any)?.label ?? id}`,
        metadata:   {
          admin_name:   (profile as any)?.name ?? 'Admin',
          schedule_id:  id,
          switch_title: (schedule as any)?.kill_switches?.title ?? 'Unknown',
          label:        (schedule as any)?.label ?? id,
        },
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[maintenance/delete]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
