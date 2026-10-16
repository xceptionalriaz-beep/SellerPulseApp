// app/api/credits/check/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// AI Credit Wallet — Check balance + action cost
//
// Returns the user's current balance and whether they can afford a given
// AI action. Used by the client to gate the UI before running any AI call.
//
// POST body:
//   feature_key — e.g. 'ai_photo_studio'
//
// Response (200):
//   {
//     balance: number           — user's current credit balance
//     cost: number              — credits this action costs
//     can_afford: boolean       — balance >= cost && feature is enabled
//     feature_enabled: boolean  — admin kill-switch for the feature
//   }
//
// If the user has no wallet yet → returns balance: 0, can_afford: false
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Admin client — reads wallet (bypasses RLS for server-side check)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Get the calling user's ID from their session cookie ──────────────────────
async function getAuthUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { /* read-only in server component */ },
                },
            }
        )
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id ?? null
    } catch {
        return null
    }
}

export async function POST(req: NextRequest) {
    let body: { feature_key?: string }
    try { body = await req.json() } catch { body = {} }

    const { feature_key } = body

    if (!feature_key) {
        return NextResponse.json({ error: 'feature_key is required' }, { status: 400 })
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const userId = await getAuthUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Fetch action cost + user wallet in parallel ───────────────────────────
    const [actionRes, walletRes] = await Promise.all([
        supabaseAdmin
            .from('ai_action_costs')
            .select('credits_cost, is_enabled')
            .eq('feature_key', feature_key)
            .single(),
        supabaseAdmin
            .from('user_ai_wallets')
            .select('balance')
            .eq('user_id', userId)
            .maybeSingle(),   // returns null if wallet row doesn't exist yet
    ])

    // Unknown feature → cost 0, enabled (don't block on a missing seed row)
    const credits_cost = actionRes.data?.credits_cost ?? 0
    const feature_enabled = actionRes.data?.is_enabled ?? true
    const balance = walletRes.data?.balance ?? 0

    const can_afford = feature_enabled && balance >= credits_cost

    return NextResponse.json({
        balance,
        cost: credits_cost,
        can_afford,
        feature_enabled,
    })
}
