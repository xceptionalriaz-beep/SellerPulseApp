// app/api/admin/plan-limits/update/route.ts
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Updates plan limits for a specific plan
// Admin only â€” logs every change to admin_logs
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // â”€â”€ Verify admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    if (!id) return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })

    // â”€â”€ Fetch existing plan for audit log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: existing } = await (adminClient.from('plan_limits') as any)
      .select('*').eq('id', id).single()

    if (!existing) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    // â”€â”€ Validate numeric fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const numericFields = [
      'max_monthly_searches', 'max_vero_checks', 'max_tracked_items',
      'max_orders_protected', 'max_ebay_stores', 'max_competitor_scans',
      'max_title_generations', 'max_profit_calcs', 'max_team_seats',
      'max_message_templates', 'price_monthly', 'price_annual',
    ]

    for (const field of numericFields) {
      if (updates[field] !== undefined) {
        const val = Number(updates[field])
        if (isNaN(val)) {
          return NextResponse.json({ error: `${field} must be a number` }, { status: 400 })
        }
        if (field.startsWith('max_') && val < -1) {
          return NextResponse.json({ error: `${field} must be -1 (unlimited) or a positive number` }, { status: 400 })
        }
        if (field.startsWith('price_') && val < 0) {
          return NextResponse.json({ error: `${field} cannot be negative` }, { status: 400 })
        }
        updates[field] = val
      }
    }

    // â”€â”€ Update plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: updated, error: updateErr } = await (adminClient.from('plan_limits') as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // â”€â”€ Audit log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try {
      // Build diff â€” only log what changed
      const changes: Record<string, { from: any; to: any }> = {}
      for (const key of Object.keys(updates)) {
        if ((existing as any)[key] !== updates[key]) {
          changes[key] = { from: (existing as any)[key], to: updates[key] }
        }
      }

      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   user.id,
        action:     'update_plan_limits',
        details:    `Updated plan limits: ${(existing as any).display_name ?? (existing as any).tier}`,
        metadata:   {
          admin_name: (profile as any)?.name ?? 'Admin',
          plan_id:    (existing as any).plan_id,
          plan_name:  (existing as any).display_name ?? (existing as any).tier,
          changes,
        },
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, plan: updated })

  } catch (err: any) {
    console.error('[plan-limits/update]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
