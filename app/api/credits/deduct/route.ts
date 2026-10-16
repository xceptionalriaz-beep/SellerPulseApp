// app/api/credits/deduct/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// AI Credit Wallet — Atomic credit deduction
//
// Locks and deducts credits before the AI call runs. Uses a Postgres function
// to keep the wallet update + ledger insert atomic, preventing double-spend.
//
// POST body:
//   feature_key   — e.g. 'ai_photo_studio'
//   reference_id  — optional idempotency key (e.g. blockId, requestId)
//
// Response (200):
//   { new_balance: number, cost: number, ledger_id: string }
//
// Response (402):
//   { error: 'Insufficient credits', balance: number, cost: number }
//
// Response (503):
//   { error: '...', code: 'FEATURE_DISABLED' }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { },
                },
            }
        )
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id ?? null
    } catch {
        return null
    }
}

// ── Ensure the user has a wallet row (auto-created on first AI use) ───────────
async function ensureWallet(userId: string): Promise<void> {
    await supabaseAdmin
        .from('user_ai_wallets')
        .upsert(
            { user_id: userId, balance: 0, lifetime_credits: 0, lifetime_spent: 0 },
            { onConflict: 'user_id', ignoreDuplicates: true }
        )
}

export async function POST(req: NextRequest) {
    let body: { feature_key?: string; reference_id?: string }
    try { body = await req.json() } catch { body = {} }

    const { feature_key, reference_id } = body

    if (!feature_key) {
        return NextResponse.json({ error: 'feature_key is required' }, { status: 400 })
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const userId = await getAuthUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Look up action cost ───────────────────────────────────────────────────
    const { data: action } = await supabaseAdmin
        .from('ai_action_costs')
        .select('credits_cost, is_enabled, name')
        .eq('feature_key', feature_key)
        .single()

    if (!action) {
        // Unknown feature key — allow it but charge 0
        return NextResponse.json({ new_balance: 0, cost: 0, ledger_id: '' })
    }

    if (!action.is_enabled) {
        return NextResponse.json(
            { error: `${action.name} is currently disabled.`, code: 'FEATURE_DISABLED' },
            { status: 503 }
        )
    }

    const cost = action.credits_cost

    // If the feature is free, skip the whole deduction flow
    if (cost === 0) {
        return NextResponse.json({ new_balance: null, cost: 0, ledger_id: null })
    }

    // ── Ensure wallet exists ──────────────────────────────────────────────────
    await ensureWallet(userId)

    // ── Atomic deduction via Postgres RPC ────────────────────────────────────
    // We call a DB function that:
    //   1. Reads current balance (with FOR UPDATE lock)
    //   2. Returns error if balance < cost
    //   3. Deducts cost from wallet
    //   4. Updates lifetime_spent
    //   5. Inserts ledger entry
    //   All in one transaction.
    const { data: result, error: rpcError } = await supabaseAdmin.rpc(
        'deduct_ai_credits',
        {
            p_user_id: userId,
            p_feature_key: feature_key,
            p_cost: cost,
            p_note: action.name,
            p_reference: reference_id ?? null,
        }
    )

    if (rpcError) {
        console.error('[credits/deduct] RPC error:', rpcError)

        // The RPC raises an exception on insufficient funds
        if (rpcError.message?.includes('Insufficient credits')) {
            // Read current balance to return in 402
            const { data: wallet } = await supabaseAdmin
                .from('user_ai_wallets')
                .select('balance')
                .eq('user_id', userId)
                .single()

            return NextResponse.json(
                { error: 'Insufficient credits', balance: wallet?.balance ?? 0, cost },
                { status: 402 }
            )
        }

        return NextResponse.json(
            { error: 'Credit deduction failed. Please try again.' },
            { status: 500 }
        )
    }

    // result shape: { new_balance: number, ledger_id: string }
    return NextResponse.json({
        new_balance: result?.new_balance ?? 0,
        cost,
        ledger_id: result?.ledger_id ?? null,
    })
}
