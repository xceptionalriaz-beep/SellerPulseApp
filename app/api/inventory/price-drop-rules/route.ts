// app/api/inventory/price-drop-rules/route.ts
// CRUD for price_drop_rules — per-listing or global rule.
//
// GET  /api/inventory/price-drop-rules?listing_id=<uuid>  → rule for that listing
// POST /api/inventory/price-drop-rules                    → upsert (body: PriceDropRulePayload)

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll() } } }
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const listingId = req.nextUrl.searchParams.get('listing_id')

        let query = (supabase as any)
            .from('price_drop_rules')
            .select('*')
            .eq('user_id', user.id)

        if (listingId) {
            query = query.eq('listing_id', listingId)
        } else {
            query = query.is('listing_id', null)
        }

        const { data: rule } = await query.maybeSingle()

        return NextResponse.json({ rule: rule ?? null })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll() } } }
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { listing_id, days_unsold, drop_percent, min_price, max_drops, enabled } = body

        const payload = {
            user_id: user.id,
            listing_id: listing_id ?? null,
            days_unsold: Number(days_unsold) || 14,
            drop_percent: Number(drop_percent) || 10,
            min_price: min_price != null ? Number(min_price) : null,
            max_drops: Number(max_drops) || 3,
            enabled: enabled !== false,
            updated_at: new Date().toISOString(),
        }

        // Upsert on (user_id, listing_id) — listing_id may be null for global rule
        const { data, error } = await (supabase as any)
            .from('price_drop_rules')
            .upsert(payload, {
                onConflict: listing_id ? 'user_id,listing_id' : undefined,
                ignoreDuplicates: false,
            })
            .select()
            .single()

        if (error) {
            // Fallback: try insert then update if upsert fails on null listing_id
            const existing = await (supabase as any)
                .from('price_drop_rules')
                .select('id')
                .eq('user_id', user.id)
                .is('listing_id', null)
                .maybeSingle()

            if (existing.data?.id) {
                const { data: updated } = await (supabase as any)
                    .from('price_drop_rules')
                    .update(payload)
                    .eq('id', existing.data.id)
                    .select()
                    .single()
                return NextResponse.json({ rule: updated })
            }

            const { data: inserted } = await (supabase as any)
                .from('price_drop_rules')
                .insert(payload)
                .select()
                .single()
            return NextResponse.json({ rule: inserted })
        }

        return NextResponse.json({ rule: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
