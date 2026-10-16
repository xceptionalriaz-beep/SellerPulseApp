// lib/ai/credits.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers for AI credit deduction used by all AI API routes.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Get authed user ID from session cookies ───────────────────────────────────
export async function getAuthUserId(): Promise<string | null> {
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

// ── Ensure wallet exists (auto-create on first AI use) ────────────────────────
async function ensureWallet(userId: string): Promise<void> {
    await supabaseAdmin
        .from('user_ai_wallets')
        .upsert(
            { user_id: userId, balance: 0, lifetime_credits: 0, lifetime_spent: 0 },
            { onConflict: 'user_id', ignoreDuplicates: true }
        )
}

// ── Result types ──────────────────────────────────────────────────────────────
export type DeductResult =
    | { ok: true; new_balance: number; cost: number; ledger_id: string | null }
    | { ok: false; response: NextResponse }

// ── deductCredits ─────────────────────────────────────────────────────────────
// Call this at the TOP of any AI route handler, before calling the AI.
// Returns { ok: true, ... } on success, { ok: false, response } on failure.
//
// Usage:
//   const credit = await deductCredits(userId, 'ai_photo_studio', blockId)
//   if (!credit.ok) return credit.response
//
export async function deductCredits(
    userId: string,
    featureKey: string,
    referenceId?: string
): Promise<DeductResult> {
    // Look up action cost
    const { data: action } = await supabaseAdmin
        .from('ai_action_costs')
        .select('credits_cost, is_enabled, name')
        .eq('feature_key', featureKey)
        .single()

    // Unknown feature → allow free (don't block on a missing row)
    if (!action) {
        return { ok: true, new_balance: 0, cost: 0, ledger_id: null }
    }

    if (!action.is_enabled) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: 'This AI feature is currently unavailable.', code: 'FEATURE_DISABLED' },
                { status: 503 }
            ),
        }
    }

    const cost = action.credits_cost

    // Free feature → skip deduction entirely
    if (cost === 0) {
        return { ok: true, new_balance: 0, cost: 0, ledger_id: null }
    }

    // Ensure wallet exists
    await ensureWallet(userId)

    // Atomic deduction via RPC
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('deduct_ai_credits', {
        p_user_id: userId,
        p_feature_key: featureKey,
        p_cost: cost,
        p_note: action.name,
        p_reference: referenceId ?? null,
    })

    if (rpcError) {
        console.error(`[credits] deduct_ai_credits error for ${featureKey}:`, rpcError)

        if (rpcError.message?.includes('Insufficient credits')) {
            // Get balance to return in 402
            const { data: wallet } = await supabaseAdmin
                .from('user_ai_wallets')
                .select('balance')
                .eq('user_id', userId)
                .single()

            return {
                ok: false,
                response: NextResponse.json(
                    {
                        error: 'You don\'t have enough AI credits for this action.',
                        code: 'INSUFFICIENT_CREDITS',
                        balance: wallet?.balance ?? 0,
                        cost,
                    },
                    { status: 402 }
                ),
            }
        }

        return {
            ok: false,
            response: NextResponse.json(
                { error: 'Credit check failed. Please try again.' },
                { status: 500 }
            ),
        }
    }

    return {
        ok: true,
        new_balance: result?.new_balance ?? 0,
        cost,
        ledger_id: result?.ledger_id ?? null,
    }
}
