// app/api/admin/packages/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Admin — AI Credit Packages CRUD
// Uses service-role client so RLS is bypassed; auth is verified via Bearer token.
//
// PATCH /api/admin/packages   { id, ...fields }  → update a package
// POST  /api/admin/packages   { ...fields }       → create a package
// DELETE /api/admin/packages  { id }              → delete a package
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

async function verifyAdmin(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null

    const supabase = adminClient()
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return null

    // Check role in profiles table (primary source of truth for app roles),
    // then fall back to JWT metadata (user_metadata / app_metadata).
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role =
        (profile?.role as string | undefined) ??
        (user.user_metadata?.role as string | undefined) ??
        (user.app_metadata?.role as string | undefined)

    if (!['admin', 'superadmin'].includes(role ?? '')) return null
    return user
}

// ── PATCH — update an existing package ───────────────────────────────────────
export async function PATCH(req: NextRequest) {
    const user = await verifyAdmin(req)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // Whitelist updatable fields
    const allowed = ['name', 'description', 'price_usd', 'credits', 'bonus_credits',
        'billing_type', 'rollover_cap', 'stripe_price_id', 'is_active', 'display_order']
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

    const { error } = await adminClient()
        .from('ai_credit_packages')
        .update({ ...safe, updated_at: new Date().toISOString() })
        .eq('id', id as string)

    if (error) {
        console.error('[admin/packages PATCH]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// ── POST — create a new package ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const user = await verifyAdmin(req)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const { name, price_usd, credits } = body
    if (!name || price_usd == null || credits == null) {
        return NextResponse.json({ error: 'name, price_usd and credits are required' }, { status: 400 })
    }

    const { data, error } = await adminClient()
        .from('ai_credit_packages')
        .insert({
            name,
            description: body.description ?? null,
            price_usd,
            credits,
            bonus_credits: body.bonus_credits ?? 0,
            billing_type: body.billing_type ?? 'one_time',
            rollover_cap: body.rollover_cap ?? null,
            stripe_price_id: body.stripe_price_id ?? null,
            display_order: body.display_order ?? 0,
            is_active: body.is_active ?? true,
        })
        .select()
        .single()

    if (error) {
        console.error('[admin/packages POST]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ package: data })
}

// ── DELETE — remove a package ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    const user = await verifyAdmin(req)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    let body: Record<string, unknown>
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const { id } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await adminClient()
        .from('ai_credit_packages')
        .delete()
        .eq('id', id as string)

    if (error) {
        console.error('[admin/packages DELETE]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
