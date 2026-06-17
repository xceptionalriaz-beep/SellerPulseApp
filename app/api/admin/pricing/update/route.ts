// app/api/admin/pricing/update/route.ts
// ══════════════════════════════════════════════════════════════
// Updates landing page pricing card content
// Admin only — saves to landing_pricing table
// ══════════════════════════════════════════════════════════════

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
      .from('profiles').select('role, name').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { data: updated, error } = await (adminClient.from('landing_pricing') as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Log to admin_logs
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        action:     'update_pricing',
        details:    `Updated pricing card: ${updates.name}`,
        metadata:   { admin_name: (profile as any)?.name, plan_name: updates.name },
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, plan: updated })

  } catch (err: any) {
    console.error('[pricing/update]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}