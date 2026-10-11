'use client'
// app/checkout/page.tsx
// Route: /checkout?plan=growth&billing=annual

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter }                  from 'next/navigation'
import { createClient }                                from '@/lib/supabase'
import { Check, RefreshCw, ArrowLeft, Lock, Zap, ShieldCheck } from 'lucide-react'

// ── Design tokens (Riazify v2) ────────────────────────────────────────────────
const T = {
    bgApp:     '#f8f7ff',
    white:     '#ffffff',
    border:    '#ede9fe',
    borderIn:  '#e5e0f5',
    primary:   '#7530fb',
    primaryHov:'#6020e0',
    primaryLt: '#f3eeff',
    accent:    '#b8fa33',
    dark:      '#1e1535',
    darkHov:   '#2d1f4e',
    textPri:   '#1f1d2e',
    textSec:   '#6b7280',
    textMuted: '#9ca3af',
    success:   '#16a34a',
    successBg: '#dcfce7',
}

interface DBPlan {
    id:                 string
    plan_id:            string
    name:               string
    price:              string
    price_annual:       string | null
    price_annual_total: string | null
    description:        string
    features:           { text: string; included: boolean }[]
}

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router       = useRouter()
    const supabase     = createClient()

    const planId = searchParams.get('plan') ?? 'growth'
    const initialBilling = (searchParams.get('billing') ?? 'annual') as 'monthly' | 'annual'

    const [plan,        setPlan]        = useState<DBPlan | null>(null)
    const [planLoading, setPlanLoading] = useState(true)
    const [billing,     setBilling]     = useState<'monthly' | 'annual'>(initialBilling)
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
    const [urlLoading,  setUrlLoading]  = useState(false)
    const [paying,      setPaying]      = useState(false)
    const [error,       setError]       = useState<string | null>(null)

    // Load LS embed script
    useEffect(() => {
        const s = document.createElement('script')
        s.src = 'https://assets.lemonsqueezy.com/lemon.js'
        s.defer = true
        document.head.appendChild(s)
        return () => { try { document.head.removeChild(s) } catch {} }
    }, [])

    // Load plan
    useEffect(() => {
        ;(async () => {
            setPlanLoading(true)
            const { data } = await (supabase.from('landing_pricing') as any)
                .select('*').eq('plan_id', planId).eq('is_active', true).single()
            if (data) setPlan(data as DBPlan)
            setPlanLoading(false)
        })()
    }, [planId])

    // Fetch checkout URL
    const fetchUrl = useCallback(async (cycle: 'monthly' | 'annual') => {
        setUrlLoading(true)
        setCheckoutUrl(null)
        setError(null)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { router.push(`/login?redirect=/checkout?plan=${planId}&billing=${cycle}`); return }
            const res  = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ plan: planId, billing: cycle, userId: session.user.id, userEmail: session.user.email, userName: session.user.user_metadata?.full_name ?? '' }),
            })
            const json = await res.json()
            if (json.url) setCheckoutUrl(json.url)
            else setError('Could not load checkout. Please try again.')
        } catch { setError('Could not load checkout. Please try again.') }
        setUrlLoading(false)
    }, [planId, supabase, router])

    useEffect(() => { fetchUrl(billing) }, [billing, fetchUrl])

    function handlePay() {
        if (!checkoutUrl) return
        setPaying(true)
        const ls = (window as any).LemonSqueezy
        if (ls?.Url?.Open) {
            ls.Url.Open(checkoutUrl)
            setTimeout(() => setPaying(false), 2500)
        } else {
            window.location.href = checkoutUrl
        }
    }

    if (planLoading) return (
        <div style={{ minHeight: '100vh', background: T.bgApp, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${T.border}`, borderTopColor: T.primary, animation: 'sp .7s linear infinite' }} />
        </div>
    )

    const isAnnual = billing === 'annual'
    const price    = isAnnual && plan?.price_annual ? plan.price_annual : (plan?.price ?? '—')
    const included = plan?.features.filter(f => f.included) ?? []

    return (
        <div style={{ minHeight: '100vh', background: T.bgApp, fontFamily: '"DM Sans", Inter, sans-serif' }}>
            <style>{`
                @keyframes sp { to { transform: rotate(360deg) } }
                @keyframes up { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
                .fade { animation: up .3s ease both }
                button:disabled { opacity: .55; cursor: not-allowed }
            `}</style>

            {/* ── Navbar ───────────────────────────────────────────────── */}
            <nav style={{
                background:     T.dark,
                height:         56,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '0 24px',
                position:       'sticky',
                top:            0,
                zIndex:         20,
            }}>
                <button
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#a89cc8', fontSize: 13, fontWeight: 500 }}>
                    <ArrowLeft size={14} /> Back
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={14} fill={T.accent} color={T.accent} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>SellerPulse</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a89cc8' }}>
                    <Lock size={11} /> Secure checkout
                </div>
            </nav>

            {/* ── Page content ──────────────────────────────────────────── */}
            <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px 64px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* ── LEFT: Plan details ────────────────────────────────── */}
                <div className="fade" style={{ flex: '1 1 440px', minWidth: 0, animationDelay: '0ms' }}>

                    {/* Plan header card */}
                    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: '28px', marginBottom: 16 }}>

                        {/* Plan badge + name */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                                    textTransform: 'uppercase', color: T.primary,
                                    display: 'block', marginBottom: 4,
                                }}>
                                    {plan?.name ?? planId} Plan
                                </span>
                                <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>{plan?.description}</p>
                            </div>
                            <div style={{ background: T.primaryLt, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: T.primary, lineHeight: 1 }}>{price}</div>
                                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>/mo</div>
                            </div>
                        </div>

                        {isAnnual && plan?.price_annual_total && (
                            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
                                {plan.price_annual_total} billed annually
                            </p>
                        )}

                        {/* Divider */}
                        <div style={{ height: 1, background: T.border, marginBottom: 20 }} />

                        {/* Billing toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: !isAnnual ? T.textPri : T.textMuted }}>Monthly</span>
                            <button
                                onClick={() => setBilling(b => b === 'annual' ? 'monthly' : 'annual')}
                                style={{
                                    width: 40, height: 22, borderRadius: 11,
                                    background: isAnnual ? T.primary : T.borderIn,
                                    border: 'none', cursor: 'pointer', position: 'relative',
                                    transition: 'background .2s', flexShrink: 0,
                                }}>
                                <div style={{
                                    position: 'absolute', top: 2, left: 2,
                                    width: 18, height: 18, borderRadius: '50%', background: T.white,
                                    transform: isAnnual ? 'translateX(18px)' : 'translateX(0)',
                                    transition: 'transform .2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                                }} />
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 500, color: isAnnual ? T.textPri : T.textMuted }}>Annual</span>
                            {isAnnual && (
                                <span style={{ fontSize: 10, fontWeight: 700, background: T.accent, color: T.dark, borderRadius: 100, padding: '2px 8px', letterSpacing: '0.04em' }}>
                                    SAVE 20%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, padding: '24px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 16 }}>
                            What's included
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {included.map((f, i) => {
                                const [label, value] = f.text.includes('|') ? f.text.split('|') : [f.text, null]
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.primaryLt, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={9} strokeWidth={3} color={T.primary} />
                                        </div>
                                        <span style={{ fontSize: 13.5, color: T.textPri }}>
                                            {label}
                                            {value && <strong style={{ marginLeft: 4, color: T.primary }}>{value}</strong>}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Order summary + pay ────────────────────────── */}
                <div className="fade" style={{ flex: '0 0 288px', minWidth: 264, animationDelay: '60ms' }}>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '11px 14px', fontSize: 12, color: '#991b1b', marginBottom: 14 }}>
                            {error} <button onClick={() => fetchUrl(billing)} style={{ marginLeft: 6, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', color: '#991b1b', textDecoration: 'underline' }}>Retry</button>
                        </div>
                    )}

                    {/* Order summary */}
                    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 14 }}>

                        <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 14 }}>
                                Order Summary
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: T.textPri }}>{plan?.name ?? planId} Plan</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: T.textPri }}>{price}<span style={{ fontSize: 11, color: T.textMuted, fontWeight: 400 }}>/mo</span></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: T.textMuted }}>Billed {isAnnual ? 'annually' : 'monthly'}</span>
                                {isAnnual && plan?.price_annual_total && (
                                    <span style={{ fontSize: 12, color: T.textMuted }}>{plan.price_annual_total}/yr</span>
                                )}
                            </div>
                        </div>

                        {/* 7-day trial */}
                        <div style={{ padding: '12px 20px', background: T.successBg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShieldCheck size={13} color={T.success} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>7-day free trial included</span>
                        </div>

                        {/* Tax */}
                        <div style={{ padding: '12px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: T.textMuted }}>Tax</span>
                                <span style={{ fontSize: 12, color: T.textMuted }}>At checkout</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA button */}
                    <button
                        onClick={handlePay}
                        disabled={!checkoutUrl || paying || urlLoading}
                        style={{
                            width: '100%', padding: '14px 20px',
                            borderRadius: 10, border: 'none',
                            background: T.primary,
                            color: '#fff', fontSize: 14, fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            marginBottom: 14,
                            boxShadow: '0 4px 16px rgba(117,48,251,0.3)',
                            transition: 'background .15s',
                            letterSpacing: '0.01em',
                        }}>
                        {(urlLoading || paying) ? (
                            <><RefreshCw size={14} style={{ animation: 'sp .7s linear infinite' }} /> {paying ? 'Opening…' : 'Loading…'}</>
                        ) : (
                            <><Lock size={13} /> Start 7-Day Free Trial</>
                        )}
                    </button>

                    {/* Trust list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        {[
                            'Cancel anytime, no questions asked',
                            'No charge until free trial ends',
                            'Secure payment · 256-bit SSL',
                        ].map(txt => (
                            <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.textMuted }}>
                                <Check size={12} color={T.success} />
                                {txt}
                            </div>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                        Payment processed by Lemon Squeezy.<br />
                        Your card details never touch our servers.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#f8f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #ede9fe', borderTopColor: '#7530fb', animation: 'sp .7s linear infinite' }} />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
