// app/api/admin/promo/create/route.ts
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

    const body = await req.json()
    const { code, description, discount, discount_type, discount_value, max_uses, expires_at, status, created_by } = body

    if (!code?.trim()) return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    if (!discount_value || isNaN(Number(discount_value))) return NextResponse.json({ error: 'Discount value is required' }, { status: 400 })

    const { data, error } = await (adminClient.from('promo_codes') as any).insert({
      code:           code.trim().toUpperCase(),
      description:    description ?? null,
      discount:       discount ?? null,
      discount_type:  discount_type ?? 'percentage',
      discount_value: Number(discount_value),
      max_uses:       max_uses ?? null,
      uses_count:     0,
      status:         status ?? 'active',
      expires_at:     expires_at ?? null,
      created_by:     created_by ?? caller.id,
    }).select().single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'A promo code with this name already exists' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'create_promo_code',
        details:    `Created promo code: ${code.trim().toUpperCase()}`,
        metadata:   { code: code.trim().toUpperCase(), discount_type, discount_value },
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, promo: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}