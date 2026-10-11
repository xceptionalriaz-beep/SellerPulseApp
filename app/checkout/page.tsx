'use client'
// app/checkout/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Custom checkout page — shows plan summary + triggers LemonSqueezy overlay
// Route: /checkout?plan=growth&billing=annual
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter }                  from 'next/navigation'
import { createClient }                                from '@/lib/supabase'
import { Check, Shield, RefreshCw, ArrowLeft, Lock, Star, Zap } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
    bg:       '#f9fdf4',
    surface:  '#ffffff',
    border:   '#e8ede2',
    lime:     '#8fff00',
    limeDeep: '#4a8f00',
    limeTint: '#f4ffe6',
    dark:     '#0a0d08',
    muted:    '#8a9e78',
    text:     '#1a2410',
}

interface DBPlan {
    id:                 string
    plan_id:            string
    name:               string
    price:              string
    period:             string
    price_annual:       string | null
    price_annual_total: string | null
    description:        string
    features:           { text: string; included: boolean }[]
    cta_text:           string
    highlight:          boolean
}

// ── Main checkout content (wrapped in Suspense) ───────────────────────────────
function CheckoutContent() {
    const searchParams = useSearchParams()
    const router       = useRouter()
    const supabase     = createClient()

    const planId = searchParams.get('plan') ?? 'growth'
    const initialBilling = (searchParams.get('billing') ?? 'annual') as 'monthly' | 'annual'

    const [plan,         setPlan]         = useState<DBPlan | null>(null)
    const [planLoading,  setPlanLoading]  = useState(true)
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialBilling)
    const [checkoutUrl,  setCheckoutUrl]  = useState<string | null>(null)
    const [urlLoading,   setUrlLoading]   = useState(false)
    const [paying,       setPaying]       = useState(false)
    const [error,        setError]        = useState<string | null>(null)

    // ── Load LemonSqueezy embed script ────────────────────────────────────────
    useEffect(() => {
        const s  = document.createElement('script')
        s.src    = 'https://assets.lemonsqueezy.com/lemon.js'
        s.defer  = true
        document.head.appendChild(s)
        return () => { try { document.head.removeChild(s) } catch {} }
    }, [])

    // ── Load plan data (once) ─────────────────────────────────────────────────
    useEffect(() => {
        loadPlan()
    }, [planId])

    async function loadPlan() {
        setPlanLoading(true)
        const { data } = await (supabase.from('landing_pricing') as any)
            .select('*')
            .eq('plan_id', planId)
            .eq('is_active', true)
            .single()
        if (data) setPlan(data as DBPlan)
        setPlanLoading(false)
    }

    // ── Fetch checkout URL whenever billing cycle changes ─────────────────────
    const fetchCheckoutUrl = useCallback(async (cycle: 'monthly' | 'annual') => {
        setUrlLoading(true)
        setCheckoutUrl(null)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push(`/login?redirect=/checkout?plan=${planId}&billing=${cycle}`)
                return
            }

            const res  = await fetch('/api/payments/checkout', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    plan:      planId,
                    billing:   cycle,
                    userId:    session.user.id,
                    userEmail: session.user.email,
                    userName:  session.user.user_metadata?.full_name ?? '',
                }),
            })
            const json = await res.json()
            if (json.url) {
                setCheckoutUrl(json.url)
            } else {
                setError('Could not load checkout. Please try again.')
            }
        } catch {
            setError('Could not load checkout. Please try again.')
        }
        setUrlLoading(false)
    }, [planId, supabase, router])

    useEffect(() => { fetchCheckoutUrl(billingCycle) }, [billingCycle, fetchCheckoutUrl])

    // ── Trigger LS overlay ────────────────────────────────────────────────────
    function handlePay() {
        if (!checkoutUrl) return
        setPaying(true)

        const ls = (window as any).LemonSqueezy
        if (ls?.Url?.Open) {
            ls.Url.Open(checkoutUrl)
            setTimeout(() => setPaying(false), 2500)
        } else {
            // Fallback: full redirect
            window.location.href = checkoutUrl
        }
    }

    // ── Full-page spinner while plan loads ────────────────────────────────────
    if (planLoading) return (
        <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`@keyframes sp { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${T.border}`, borderTopColor: T.lime, animation: 'sp 0.8s linear infinite' }} />
        </div>
    )

    const isAnnual = billingCycle === 'annual'
    const price    = isAnnual && plan?.price_annual ? plan.price_annual : (plan?.price ?? '—')
    const included = plan?.features.filter(f => f.included) ?? []

    return (
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                @keyframes sp { to { transform: rotate(360deg) } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
                .co-fade { animation: fadeUp 0.35s ease both }
            `}</style>

            {/* ── Top nav ─────────────────────────────────────────────────── */}
            <div style={{
                borderBottom: `1px solid ${T.border}`,
                background:   T.surface,
                padding:      '0 24px',
                height:       56,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
                position:     'sticky',
                top:          0,
                zIndex:       10,
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, color: T.muted,
                        padding: '6px 10px', borderRadius: 8,
                    }}>
                    <ArrowLeft size={14} /> Back
                </button>

                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{
                        width: 26, height: 26, borderRadius: 7,
                        background: T.dark,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={13} fill={T.lime} color={T.lime} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.dark, letterSpacing: '-0.01em' }}>
                        SellerPulse
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.muted }}>
                    <Lock size={10} /> Secure checkout
                </div>
            </div>

            {/* ── Two-column layout ────────────────────────────────────────── */}
            <div style={{
                maxWidth:  960,
                margin:    '0 auto',
                padding:   '40px 20px 60px',
                display:   'flex',
                gap:       28,
                alignItems: 'flex-start',
                flexWrap:  'wrap',
            }}>

                {/* ── LEFT: Plan details ─────────────────────────────────── */}
                <div className="co-fade" style={{ flex: '1 1 460px', minWidth: 0, animationDelay: '0ms' }}>

                    {/* Plan hero card */}
                    <div style={{
                        background:   T.dark,
                        borderRadius: 20,
                        padding:      '32px',
                        marginBottom: 16,
                        position:     'relative',
                        overflow:     'hidden',
                    }}>
                        {/* Lime glow */}
                        <div style={{
                            position: 'absolute', top: -60, right: -60,
                            width: 240, height: 240, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(143,255,0,0.14) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        {/* Plan label + price */}
                        <div style={{ marginBottom: 24 }}>
                            <span style={{
                                fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                                color: T.lime, textTransform: 'uppercase', display: 'block', marginBottom: 10,
                            }}>
                                {plan?.name ?? planId} Plan
                            </span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                                    {price}
                                </span>
                                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>/mo</span>
                            </div>
                            {isAnnual && plan?.price_annual_total && (
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 5 }}>
                                    {plan.price_annual_total} billed annually
                                </p>
                            )}
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, lineHeight: 1.5 }}>
                                {plan?.description}
                            </p>
                        </div>

                        {/* Billing toggle */}
                        <div style={{
                            display:    'flex',
                            alignItems: 'center',
                            gap:        10,
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 12,
                            padding:    '11px 16px',
                            border:     '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: !isAnnual ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                                Monthly
                            </span>
                            <button
                                onClick={() => setBillingCycle(b => b === 'annual' ? 'monthly' : 'annual')}
                                style={{
                                    width: 42, height: 23, borderRadius: 12,
                                    background: isAnnual ? T.lime : 'rgba(255,255,255,0.15)',
                                    border: 'none', cursor: 'pointer', position: 'relative',
                                    transition: 'background 0.2s', flexShrink: 0,
                                }}>
                                <div style={{
                                    position:   'absolute', top: 2, left: 2,
                                    width:      19, height: 19, borderRadius: '50%',
                                    background: isAnnual ? T.dark : '#fff',
                                    transform:  isAnnual ? 'translateX(19px)' : 'translateX(0)',
                                    transition: 'transform 0.2s, background 0.2s',
                                }} />
                            </button>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isAnnual ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                                Annual
                            </span>
                            {isAnnual && (
                                <span style={{
                                    fontSize: 9, fontWeight: 900, letterSpacing: '0.08em',
                                    background: T.lime, color: T.dark,
                                    borderRadius: 100, padding: '2px 8px',
                                }}>
                                    SAVE 20%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Features list */}
                    <div style={{
                        background: T.surface, borderRadius: 16,
                        padding: '22px 24px',
                        border: `1px solid ${T.border}`,
                    }}>
                        <p style={{
                            fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                            color: T.muted, textTransform: 'uppercase', marginBottom: 16,
                        }}>
                            Everything in this plan
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                            {included.map((f, i) => {
                                const [label, value] = f.text.includes('|') ? f.text.split('|') : [f.text, null]
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            background: T.lime, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Check size={9} strokeWidth={3} color={T.dark} />
                                        </div>
                                        <span style={{ fontSize: 13.5, color: T.text, lineHeight: 1.3 }}>
                                            {label}
                                            {value && (
                                                <strong style={{ marginLeft: 4, color: T.limeDeep }}>{value}</strong>
                                            )}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Order summary + pay button ─────────────────── */}
                <div className="co-fade" style={{ flex: '0 0 300px', minWidth: 280, animationDelay: '80ms' }}>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: '#fff5f5', border: '1px solid #fed7d7',
                            borderRadius: 10, padding: '12px 16px',
                            fontSize: 12, color: '#c53030', marginBottom: 14,
                        }}>
                            {error}
                            <button
                                onClick={() => fetchCheckoutUrl(billingCycle)}
                                style={{ marginLeft: 8, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', color: '#c53030', textDecoration: 'underline' }}>
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Order summary card */}
                    <div style={{
                        background: T.surface, borderRadius: 20,
                        border: `1px solid ${T.border}`,
                        overflow: 'hidden', marginBottom: 14,
                    }}>
                        {/* Header */}
                        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', marginBottom: 14 }}>
                                Order Summary
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                                    {plan?.name ?? planId} Plan
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: T.dark }}>
                                    {price}<span style={{ fontSize: 11, fontWeight: 500, color: T.muted }}>/mo</span>
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: T.muted }}>
                                    Billed {isAnnual ? 'annually' : 'monthly'}
                                </span>
                                {isAnnual && plan?.price_annual_total && (
                                    <span style={{ fontSize: 11, color: T.muted }}>{plan.price_annual_total}/yr</span>
                                )}
                            </div>
                        </div>

                        {/* 7-day trial highlight */}
                        <div style={{
                            padding:    '11px 20px',
                            background: T.limeTint,
                            borderBottom: `1px solid ${T.border}`,
                            display:    'flex',
                            alignItems: 'center',
                            gap:        7,
                        }}>
                            <Star size={12} fill={T.lime} color={T.lime} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.limeDeep }}>
                                7-day free trial — charged after
                            </span>
                        </div>

                        {/* Tax row */}
                        <div style={{ padding: '12px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: T.muted }}>Tax</span>
                                <span style={{ fontSize: 12, color: T.muted }}>At checkout</span>
                            </div>
                        </div>
                    </div>

                    {/* Pay button */}
                    <button
                        onClick={handlePay}
                        disabled={!checkoutUrl || paying || urlLoading}
                        style={{
                            width:       '100%',
                            padding:     '15px',
                            borderRadius: 12,
                            border:      'none',
                            background:  (checkoutUrl && !paying && !urlLoading) ? T.lime : T.border,
                            color:       T.dark,
                            fontSize:    15,
                            fontWeight:  900,
                            cursor:      (checkoutUrl && !paying && !urlLoading) ? 'pointer' : 'not-allowed',
                            display:     'flex',
                            alignItems:  'center',
                            justifyContent: 'center',
                            gap:         8,
                            marginBottom: 14,
                            transition:  'transform 0.15s, box-shadow 0.15s',
                            boxShadow:   (checkoutUrl && !paying && !urlLoading) ? '0 6px 24px rgba(143,255,0,0.4)' : 'none',
                            letterSpacing: '0.01em',
                        }}>
                        {(urlLoading || paying) ? (
                            <>
                                <RefreshCw size={15} style={{ animation: 'sp 0.8s linear infinite' }} />
                                {paying ? 'Opening payment…' : 'Loading…'}
                            </>
                        ) : (
                            <>
                                <Lock size={13} />
                                Start 7-Day Free Trial
                            </>
                        )}
                    </button>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                        {[
                            ['Cancel anytime, no questions asked', Shield],
                            ['No charge until trial ends', Check],
                            ['256-bit SSL encryption', Lock],
                        ].map(([txt, Icon]: any) => (
                            <div key={txt as string} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: T.muted }}>
                                <Icon size={11} />
                                {txt}
                            </div>
                        ))}
                    </div>

                    {/* Payment provider note */}
                    <p style={{ textAlign: 'center', fontSize: 10, color: '#c0c8b8', lineHeight: 1.5 }}>
                        Payment securely processed by Lemon Squeezy.<br />
                        Your card details never touch our servers.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ── Export (Suspense required for useSearchParams) ────────────────────────────
export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#f9fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <style>{`@keyframes sp { to { transform: rotate(360deg) } }`}</style>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e8ede2', borderTopColor: '#8fff00', animation: 'sp 0.8s linear infinite' }} />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
