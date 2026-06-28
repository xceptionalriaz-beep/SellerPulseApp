// app/api/admin/promo/create-ab-test/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Creates a new A/B pricing test
// Founder only OR admin with manage_ab_tests scope
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ Verify auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller } } = await adminClient.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // â”€â”€ Check founder or manage_ab_tests scope â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: profile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()

    const isFounder = (profile as any)?.role === 'admin'

    if (!isFounder) {
      // Check admin_roles for manage_ab_tests scope
      const { data: roleData } = await (adminClient.from('admin_roles') as any)
        .select('scopes')
        .eq('id', caller.id)
        .maybeSingle()
      const scopes: string[] = (roleData as any)?.scopes ?? []
      if (!scopes.includes('manage_ab_tests')) {
        return NextResponse.json({ error: 'Founder access or manage_ab_tests scope required' }, { status: 403 })
      }
    }

    // â”€â”€ Parse and validate body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const {
      name,
      variant_a_label,
      variant_a_price,
      variant_b_label,
      variant_b_price,
    } = await req.json()

    if (!name?.trim())           return NextResponse.json({ error: 'Test name is required' }, { status: 400 })
    if (!variant_a_price)        return NextResponse.json({ error: 'Variant A price is required' }, { status: 400 })
    if (!variant_b_price)        return NextResponse.json({ error: 'Variant B price is required' }, { status: 400 })
    if (Number(variant_a_price) <= 0) return NextResponse.json({ error: 'Variant A price must be positive' }, { status: 400 })
    if (Number(variant_b_price) <= 0) return NextResponse.json({ error: 'Variant B price must be positive' }, { status: 400 })
    if (Number(variant_a_price) === Number(variant_b_price)) {
      return NextResponse.json({ error: 'Variant prices must be different' }, { status: 400 })
    }

    // â”€â”€ Insert into ab_tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data, error } = await (adminClient.from('ab_tests') as any)
      .insert({
        name:               name.trim(),
        variant_a_label:    variant_a_label?.trim() || 'Variant A (Control)',
        variant_a_price:    Number(variant_a_price),
        variant_a_visitors: 0,
        variant_a_signups:  0,
        variant_a_mrr:      0,
        variant_b_label:    variant_b_label?.trim() || 'Variant B (Test)',
        variant_b_price:    Number(variant_b_price),
        variant_b_visitors: 0,
        variant_b_signups:  0,
        variant_b_mrr:      0,
        winner:             null,
        status:             'running',
        created_at:         new Date().toISOString(),
        updated_at:         new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // â”€â”€ Log to admin_logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'create_ab_test',
        details:    `Launched A/B test: ${name.trim()}`,
        metadata:   {
          admin_name:      (profile as any)?.name ?? 'Founder',
          test_name:       name.trim(),
          variant_a_price: Number(variant_a_price),
          variant_b_price: Number(variant_b_price),
        },
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, test: data })

  } catch (err: any) {
    console.error('[create-ab-test]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
