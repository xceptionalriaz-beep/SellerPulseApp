// app/api/admin/reset-api/route.ts
// Server-side â€” uses service role key to bypass RLS

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // â”€â”€ Admin client with service role key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ Verify caller is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // â”€â”€ Reset counters directly â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { error } = await supabase
      .from('api_fleet_config')
      .update({
        requests_today:  0,
        rate_limit_used: 0,
        updated_at:      new Date().toISOString(),
      })
      .neq('platform_name', 'placeholder') // update all rows

    if (error) throw error

    // â”€â”€ Log to admin notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await supabase.from('admin_notifications').insert({
      type:    'api_limit',
      title:   'ðŸ”„ API Counters Reset',
      message: `Daily API counters were manually reset by admin.`,
      is_read: false,
    })

    return NextResponse.json({ success: true, message: 'API counters reset successfully' })

  } catch (err) {
    console.error('Reset API error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
