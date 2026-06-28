// app/api/admin/promo/delete/route.ts
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
    const { data: { user: caller } } = await adminClient.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', caller.id).single()
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data: existing } = await (adminClient.from('promo_codes') as any).select('code').eq('id', id).single()
    const { error } = await (adminClient.from('promo_codes') as any).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'delete_promo_code',
        details:    `Deleted promo code: ${(existing as any)?.code ?? id}`,
        metadata:   { id },
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
