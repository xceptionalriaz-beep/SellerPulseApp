// app/api/admin/promo/delete-ab-test/route.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Deletes an A/B test permanently
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
      const { data: memberData } = await (adminClient.from('team_members') as any)
        .select('admin_role_id').eq('user_id', caller.id).maybeSingle()
      if (memberData?.admin_role_id) {
        const { data: roleData } = await (adminClient.from('admin_roles') as any)
          .select('scopes').eq('id', memberData.admin_role_id).maybeSingle()
        const scopes: string[] = (roleData as any)?.scopes ?? []
        if (!scopes.includes('manage_ab_tests')) {
          return NextResponse.json({ error: 'Founder access or manage_ab_tests scope required' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Founder access or manage_ab_tests scope required' }, { status: 403 })
      }
    }

    // â”€â”€ Parse body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { testId } = await req.json()
    if (!testId) return NextResponse.json({ error: 'testId is required' }, { status: 400 })

    // â”€â”€ Fetch test for logging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: test } = await (adminClient.from('ab_tests') as any)
      .select('name, status').eq('id', testId).single()
    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

    // â”€â”€ Delete test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { error: deleteErr } = await (adminClient.from('ab_tests') as any)
      .delete().eq('id', testId)
    if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 })

    // â”€â”€ Log to admin_logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'delete_ab_test',
        details:    `Deleted A/B test: ${(test as any).name}`,
        metadata:   { admin_name: (profile as any)?.name ?? 'Founder', test_name: (test as any).name, test_status: (test as any).status },
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('[delete-ab-test]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
