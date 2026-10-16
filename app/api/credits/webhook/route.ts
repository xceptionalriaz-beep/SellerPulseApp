// app/api/credits/webhook/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Stripe Webhook — fulfil AI credits on successful payment
//
// Events handled:
//   checkout.session.completed — payment succeeded, credit the user's wallet
//
// Env vars required:
//   STRIPE_SECRET_KEY         — Stripe secret key
//   STRIPE_WEBHOOK_SECRET     — from Stripe dashboard webhook settings
//
// ⚠️  This route must NOT have body parsing — Stripe needs the raw body for
//     signature verification. Next.js App Router sends the raw body by default.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-09-30.endive',
})

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Fulfil credits for a completed checkout session ───────────────────────────
async function fulfilCredits(session: Stripe.Checkout.Session) {
    const userId       = session.metadata?.user_id
    const totalCredits = parseInt(session.metadata?.total_credits ?? '0', 10)
    const packageId    = session.metadata?.package_id

    if (!userId || !totalCredits) {
        console.error('[webhook] Missing metadata:', session.metadata)
        return
    }

    // Idempotency — check if this session was already fulfilled
    const { data: existing } = await supabaseAdmin
        .from('ai_credit_ledger')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

    if (existing) {
        console.log('[webhook] Already fulfilled session:', session.id)
        return
    }

    // Ensure wallet exists
    await supabaseAdmin
        .from('user_ai_wallets')
        .upsert(
            { user_id: userId, balance: 0, lifetime_credits: 0, lifetime_spent: 0 },
            { onConflict: 'user_id', ignoreDuplicates: true }
        )

    // Fetch current wallet
    const { data: wallet } = await supabaseAdmin
        .from('user_ai_wallets')
        .select('balance, lifetime_credits')
        .eq('user_id', userId)
        .single()

    if (!wallet) {
        console.error('[webhook] Wallet not found for user:', userId)
        return
    }

    const newBalance  = wallet.balance + totalCredits
    const newLifetime = wallet.lifetime_credits + totalCredits

    // Update wallet
    const { error: walletErr } = await supabaseAdmin
        .from('user_ai_wallets')
        .update({
            balance:          newBalance,
            lifetime_credits: newLifetime,
        })
        .eq('user_id', userId)

    if (walletErr) {
        console.error('[webhook] Wallet update error:', walletErr)
        return
    }

    // Ledger entry
    const amountPaid = (session.amount_total ?? 0) / 100  // cents → dollars
    await supabaseAdmin.from('ai_credit_ledger').insert({
        user_id:           userId,
        type:              'purchase',
        amount:            totalCredits,
        balance_after:     newBalance,
        stripe_session_id: session.id,
        note:              `Purchased ${totalCredits} credits ($${amountPaid.toFixed(2)})`,
    })

    console.log(`[webhook] ✅ Credited ${totalCredits} credits to user ${userId}, new balance: ${newBalance}`)
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const body      = await req.text()
    const signature = req.headers.get('stripe-signature') ?? ''
    const secret    = process.env.STRIPE_WEBHOOK_SECRET!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, signature, secret)
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[webhook] Signature verification failed:', msg)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                if (session.payment_status === 'paid') {
                    await fulfilCredits(session)
                }
                break
            }
            // Future: handle refunds
            // case 'charge.refunded': { ... }
            default:
                // Ignore unknown events
        }
    } catch (err) {
        console.error('[webhook] Handler error:', err)
        return NextResponse.json({ error: 'Handler error' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
