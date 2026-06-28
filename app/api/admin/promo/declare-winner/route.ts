// app/api/admin/promo/declare-winner/route.ts
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
    const { data: profile } = await adminClient.from('profiles').select('role, name').eq('id', caller.id).single()
    if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { testId, winner } = await req.json()
    if (!testId) return NextResponse.json({ error: 'testId is required' }, { status: 400 })
    if (!['a', 'b'].includes(winner)) return NextResponse.json({ error: 'winner must be a or b' }, { status: 400 })

    const { data: test } = await (adminClient.from('ab_tests') as any).select('*').eq('id', testId).single()
    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    if ((test as any).status === 'completed') return NextResponse.json({ error: 'Test already completed' }, { status: 409 })

    const { error } = await (adminClient.from('ab_tests') as any)
      .update({ winner, status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', testId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'declare_ab_winner',
        details:    `Declared winner for A/B test: ${(test as any).name} â€” Variant ${winner.toUpperCase()}`,
        metadata:   { testId, winner, test_name: (test as any).name, admin_name: (profile as any)?.name ?? 'Admin' },
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, winner, testId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
