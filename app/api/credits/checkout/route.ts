// app/api/credits/checkout/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// AI Credits — Stripe Checkout Session
//
// Creates a Stripe checkout session for the selected credit package.
// On success Stripe redirects to /credits/success?session_id=...
// The webhook (app/api/credits/webhook/route.ts) fulfils the credits.
//
// POST body:
//   package_id — UUID from ai_credit_packages
//
// Response (200):
//   { url: string }  — Stripe hosted checkout URL
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-09-30.endive',
})

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthUser(): Promise<{ id: string; email?: string } | null> {
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
        return { id: user.id, email: user.email }
    } catch {
        return null
    }
}

export async function POST(req: NextRequest) {
    let body: { package_id?: string }
    try { body = await req.json() } catch { body = {} }

    const { package_id } = body
    if (!package_id) {
        return NextResponse.json({ error: 'package_id is required' }, { status: 400 })
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Please sign in to purchase credits.' }, { status: 401 })
    }

    // ── Look up the package ───────────────────────────────────────────────────
    const { data: pkg, error: pkgErr } = await supabaseAdmin
        .from('ai_credit_packages')
        .select('*')
        .eq('id', package_id)
        .eq('is_active', true)
        .single()

    if (pkgErr || !pkg) {
        return NextResponse.json({ error: 'Package not found or unavailable.' }, { status: 404 })
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://sellerpulse.app'
    const totalCredits = pkg.credits + pkg.bonus_credits

    // ── Create Stripe Checkout Session ────────────────────────────────────────
    let session: Stripe.Checkout.Session

    try {
        // If the package already has a Stripe price ID (pre-created in Stripe dashboard)
        // use it directly; otherwise use price_data for dynamic pricing.
        const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = pkg.stripe_price_id
            ? { price: pkg.stripe_price_id, quantity: 1 }
            : {
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(pkg.price_usd * 100), // cents
                    product_data: {
                        name: `${pkg.name} — ${totalCredits} AI Credits`,
                        description: pkg.description ?? `${totalCredits} AI credits for SellerPulse`,
                        metadata: {
                            package_id: pkg.id,
                            credits: pkg.credits,
                            bonus_credits: pkg.bonus_credits,
                        },
                    },
                },
                quantity: 1,
            }

        session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [lineItem],
            customer_email: user.email,
            success_url: `${origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${origin}/credits/cancelled`,
            metadata: {
                user_id:       user.id,
                package_id:    pkg.id,
                credits:       String(pkg.credits),
                bonus_credits: String(pkg.bonus_credits),
                total_credits: String(totalCredits),
            },
            payment_intent_data: {
                metadata: {
                    user_id:    user.id,
                    package_id: pkg.id,
                },
            },
        })
    } catch (e: unknown) {
        console.error('[credits/checkout] Stripe error:', e)
        return NextResponse.json(
            { error: 'Could not create checkout session. Please try again.' },
            { status: 500 }
        )
    }

    return NextResponse.json({ url: session.url })
}
