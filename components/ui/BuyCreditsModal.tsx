// components/ui/BuyCreditsModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal that shows AI credit packages (one-time + monthly) and routes
// the user to the checkout page.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import React, { useEffect, useState } from 'react'
import { X, Zap, Check, Loader2, Star, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CreditPackage {
    id: string
    name: string
    description: string | null
    price_usd: number
    credits: number
    bonus_credits: number
    display_order: number
    billing_type: 'one_time' | 'monthly'
    rollover_cap: number | null
}

interface BuyCreditsModalProps {
    onClose: () => void
}

export function BuyCreditsModal({ onClose }: BuyCreditsModalProps) {
    const router = useRouter()
    const [packages,   setPackages]   = useState<CreditPackage[]>([])
    const [loading,    setLoading]    = useState(true)
    const [selected,   setSelected]   = useState<string | null>(null)
    const [purchasing, setPurchasing] = useState(false)
    const [billingTab, setBillingTab] = useState<'monthly' | 'one_time'>('monthly')

    useEffect(() => {
        supabase
            .from('ai_credit_packages')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .then(({ data }) => {
                const pkgs = (data ?? []) as CreditPackage[]
                setPackages(pkgs)
                // Default tab to whichever type has packages; prefer monthly
                const hasMonthly = pkgs.some(p => p.billing_type === 'monthly')
                const tab = hasMonthly ? 'monthly' : 'one_time'
                setBillingTab(tab)
                const visible = pkgs.filter(p => p.billing_type === tab)
                if (visible.length > 0) setSelected(visible[Math.min(1, visible.length - 1)].id)
                setLoading(false)
            })
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    // When switching tabs, auto-select middle package of that tab
    const switchTab = (tab: 'monthly' | 'one_time') => {
        setBillingTab(tab)
        setSelected(null)
        const visible = packages.filter(p => p.billing_type === tab)
        if (visible.length > 0) setSelected(visible[Math.min(1, visible.length - 1)].id)
    }

    const handlePurchase = () => {
        if (!selected) return
        setPurchasing(true)
        router.push(`/checkout?type=credits&package_id=${selected}`)
    }

    const visiblePkgs = packages.filter(p => p.billing_type === billingTab)
    const selectedPkg = packages.find(p => p.id === selected)
    const hasMonthly  = packages.some(p => p.billing_type === 'monthly')
    const hasOneTime  = packages.some(p => p.billing_type === 'one_time')

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 16px', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(135deg, #7530fb 0%, #1e1535 100%)', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={18} fill="#b8fa33" color="#b8fa33" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Buy AI Credits</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>Use across all AI features</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 20 }}>

                    {/* Monthly / One-time tab switcher */}
                    {hasMonthly && hasOneTime && (
                        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3, marginBottom: 16, gap: 2 }}>
                            {([['monthly', '↺ Monthly subscription'], ['one_time', '✓ One-time top-up']] as const).map(([key, label]) => (
                                <button key={key} onClick={() => switchTab(key)}
                                    style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all .15s', background: billingTab === key ? '#fff' : 'transparent', color: billingTab === key ? '#7530fb' : '#6b7280', boxShadow: billingTab === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Monthly explanation banner */}
                    {billingTab === 'monthly' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(117,48,251,0.06)', border: '1px solid rgba(117,48,251,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#5b21b6' }}>
                            <RefreshCw size={13} />
                            <span>Credits refresh every month. Unused credits roll over (up to cap).</span>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#7530fb' }} />
                        </div>
                    ) : visiblePkgs.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '24px 0' }}>No packages available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {visiblePkgs.map((pkg, idx) => {
                                const totalCredits = pkg.credits + pkg.bonus_credits
                                const isSelected   = selected === pkg.id
                                const isPopular    = idx === 1

                                return (
                                    <button key={pkg.id} onClick={() => setSelected(pkg.id)}
                                        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: isSelected ? '2px solid #7530fb' : '2px solid #e5e7eb', background: isSelected ? 'rgba(117,48,251,0.05)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>

                                        {isPopular && (
                                            <div style={{ position: 'absolute', top: -10, left: 14, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#f59e0b', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                                <Star size={9} fill="white" /> Most popular
                                            </div>
                                        )}

                                        {/* Radio */}
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: isSelected ? '6px solid #7530fb' : '2px solid #d1d5db', flexShrink: 0, transition: 'all 0.15s' }} />

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{pkg.name}</span>
                                                {pkg.bonus_credits > 0 && (
                                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 99 }}>+{pkg.bonus_credits} bonus</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                                {pkg.description ?? `${totalCredits} credits`}
                                                {pkg.billing_type === 'monthly' && pkg.rollover_cap != null && (
                                                    <span style={{ marginLeft: 6, color: '#7530fb' }}>· rolls over up to {pkg.rollover_cap} cr</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
                                                ${pkg.price_usd.toFixed(0)}
                                                {pkg.billing_type === 'monthly' && <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>/mo</span>}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{totalCredits} credits</div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Summary blurb */}
                    {selectedPkg && (
                        <div style={{ marginTop: 14, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                            <strong style={{ color: '#374151' }}>{selectedPkg.credits + selectedPkg.bonus_credits} credits{selectedPkg.billing_type === 'monthly' ? '/month' : ''}</strong>{' '}
                            ≈ {Math.floor((selectedPkg.credits + selectedPkg.bonus_credits) / 10)} Photo Studio generations,{' '}
                            {Math.floor((selectedPkg.credits + selectedPkg.bonus_credits) / 2)} Copy Optimizer rewrites,
                            or mix and match across all AI features.
                        </div>
                    )}

                    {/* CTA */}
                    <button
                        onClick={handlePurchase}
                        disabled={!selected || purchasing || loading}
                        style={{ marginTop: 14, width: '100%', padding: '13px', borderRadius: 10, background: selected && !purchasing ? '#7530fb' : '#e5e7eb', color: selected && !purchasing ? '#fff' : '#9ca3af', border: 'none', fontWeight: 700, fontSize: 14, cursor: selected && !purchasing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
                        {purchasing ? (
                            <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting…</>
                        ) : (
                            <><Check size={15} /> {selectedPkg?.billing_type === 'monthly' ? 'Subscribe' : 'Continue to Payment'}{selectedPkg ? ` — $${selectedPkg.price_usd.toFixed(0)}${selectedPkg.billing_type === 'monthly' ? '/mo' : ''}` : ''}</>
                        )}
                    </button>

                    <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>
                        {selectedPkg?.billing_type === 'monthly'
                            ? 'Cancel anytime · Secured by Stripe · Credits roll over each month'
                            : 'One-time purchase · Secured by Stripe · Credits never expire'}
                    </p>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
