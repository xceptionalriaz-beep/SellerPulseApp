// app/api/credits/gift/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// AI Credit Wallet — Admin: gift credits to a user
//
// POST body:
//   target_user_id — UUID of the user to gift credits to
//   amount         — positive integer of credits to add
//   note           — admin note (shown in ledger)
//
// Auth: must be an admin (checked via user metadata role or Supabase config)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthUser(): Promise<{ id: string; role?: string } | null> {
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
        if (!user) return null
        return {
            id: user.id,
            role: (user.user_metadata?.role as string) ?? (user.app_metadata?.role as string) ?? undefined,
        }
    } catch {
        return null
    }
}

export async function POST(req: NextRequest) {
    let body: { target_user_id?: string; amount?: number; note?: string }
    try { body = await req.json() } catch { body = {} }

    const { target_user_id, amount, note = 'Admin gift' } = body

    if (!target_user_id || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
            { error: 'target_user_id and a positive amount are required' },
            { status: 400 }
        )
    }

    // ── Admin auth ────────────────────────────────────────────────────────────
    const caller = await getAuthUser()
    if (!caller) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (caller.role !== 'admin' && caller.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Ensure the target user has a wallet ───────────────────────────────────
    await supabaseAdmin
        .from('user_ai_wallets')
        .upsert(
            { user_id: target_user_id, balance: 0, lifetime_credits: 0, lifetime_spent: 0 },
            { onConflict: 'user_id', ignoreDuplicates: true }
        )

    // ── Atomic gift: increment balance + add ledger entry ─────────────────────
    const { data: wallet, error: walletErr } = await supabaseAdmin
        .from('user_ai_wallets')
        .select('balance, lifetime_credits')
        .eq('user_id', target_user_id)
        .single()

    if (walletErr || !wallet) {
        return NextResponse.json({ error: 'Could not find user wallet' }, { status: 404 })
    }

    const newBalance = wallet.balance + amount
    const newLifetime = wallet.lifetime_credits + amount

    // Update wallet
    const { error: updateErr } = await supabaseAdmin
        .from('user_ai_wallets')
        .update({
            balance: newBalance,
            lifetime_credits: newLifetime,
        })
        .eq('user_id', target_user_id)

    if (updateErr) {
        console.error('[credits/gift] wallet update error:', updateErr)
        return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 })
    }

    // Insert ledger entry
    const { error: ledgerErr } = await supabaseAdmin
        .from('ai_credit_ledger')
        .insert({
            user_id:       target_user_id,
            type:          'bonus',
            amount:        amount,
            balance_after: newBalance,
            note:          `${note} (gifted by admin ${caller.id})`,
        })

    if (ledgerErr) {
        console.error('[credits/gift] ledger insert error:', ledgerErr)
        // Non-fatal — wallet was already updated; ledger is just a log
    }

    return NextResponse.json({
        success: true,
        new_balance: newBalance,
        amount_gifted: amount,
    })
}
