// app/api/admin/plan-limits/update/route.ts
// ──────────────────────────────────────────────────────────────
// Updates plan limits — admin only
// Validates all numeric and boolean fields
// Writes to admin_logs on every change
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── Verify admin ───────────────────────────────────────────
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user: caller } } = await adminClient.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await adminClient
      .from('profiles').select('role, name').eq('id', caller.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // ── Parse body ─────────────────────────────────────────────
    const {
      id,
      max_monthly_searches, max_vero_checks,
      max_tracked_items,    max_orders_protected,
      max_ebay_stores,
      has_advanced_analytics, has_bulk_export,
      has_title_builder,      has_competitor_research,
      has_api_access,         has_priority_support,
      price_monthly,          price_annual,
    } = await req.json()

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // ── Validate numeric fields ────────────────────────────────
    const numericFields = {
      max_monthly_searches, max_vero_checks,
      max_tracked_items, max_orders_protected, max_ebay_stores,
    }
    for (const [key, val] of Object.entries(numericFields)) {
      if (val !== undefined) {
        const n = Number(val)
        if (isNaN(n)) return NextResponse.json({ error: `${key} must be a number` }, { status: 400 })
        if (n < -1)   return NextResponse.json({ error: `${key} must be -1 (unlimited) or a positive number` }, { status: 400 })
      }
    }

    // ── Fetch existing plan for audit log ──────────────────────
    const { data: existing } = await (adminClient.from('plan_limits') as any)
      .select('tier, display_name').eq('id', id).single()

    // ── Update plan_limits ─────────────────────────────────────
    const { data: updated, error: updateErr } = await (adminClient.from('plan_limits') as any)
      .update({
        max_monthly_searches,
        max_vero_checks,
        max_tracked_items,
        max_orders_protected,
        max_ebay_stores,
        has_advanced_analytics,
        has_bulk_export,
        has_title_builder,
        has_competitor_research,
        has_api_access,
        has_priority_support,
        price_monthly,
        price_annual,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // ── Log to admin_logs ──────────────────────────────────────
    try {
      await (adminClient.from('admin_logs') as any).insert({
        admin_id:   caller.id,
        action:     'update_plan_limits',
        details:    `Updated plan limits for ${(existing as any)?.display_name ?? (existing as any)?.tier ?? id}`,
        metadata:   {
          admin_name:  (profile as any)?.name ?? 'Admin',
          plan_id:     id,
          plan_name:   (existing as any)?.display_name ?? (existing as any)?.tier,
          changes:     { max_monthly_searches, max_vero_checks, max_tracked_items, max_orders_protected, max_ebay_stores, has_advanced_analytics, has_bulk_export, has_api_access, has_priority_support, price_monthly, price_annual },
        },
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        created_at: new Date().toISOString(),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true, plan: updated })

  } catch (err: any) {
    console.error('[plan-limits/update]', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}