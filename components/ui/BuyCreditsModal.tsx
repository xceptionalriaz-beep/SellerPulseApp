// components/ui/BuyCreditsModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal that shows AI credit packages and lets the user purchase one
// via Stripe Checkout.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import React, { useEffect, useState } from 'react'
import { X, Zap, Check, Loader2, Star } from 'lucide-react'
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
}

interface BuyCreditsModalProps {
    onClose: () => void
}

export function BuyCreditsModal({ onClose }: BuyCreditsModalProps) {
    const [packages, setPackages] = useState<CreditPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<string | null>(null)
    const [purchasing, setPurchasing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        supabase
            .from('ai_credit_packages')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .then(({ data }) => {
                setPackages(data ?? [])
                if (data && data.length > 0) {
                    // Pre-select the middle package (Growth = index 1)
                    setSelected(data[Math.min(1, data.length - 1)].id)
                }
                setLoading(false)
            })

        // Trap focus + prevent body scroll
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const handlePurchase = async () => {
        if (!selected) return
        setPurchasing(true)
        setError(null)
        try {
            const res = await fetch('/api/credits/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ package_id: selected }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Checkout failed')
            // Redirect to Stripe
            if (data.url) window.location.href = data.url
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
            setPurchasing(false)
        }
    }

    const selectedPkg = packages.find(p => p.id === selected)

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 480,
                    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 20px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#fff',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Zap size={18} fill="white" color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Buy AI Credits</div>
                            <div style={{ fontSize: 12, opacity: 0.85 }}>
                                Use across all AI features
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)', border: 'none',
                            borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff',
                            display: 'flex', alignItems: 'center',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 20 }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {packages.map((pkg, idx) => {
                                const totalCredits = pkg.credits + pkg.bonus_credits
                                const isSelected = selected === pkg.id
                                const isPopular = idx === 1 // Growth = most popular

                                return (
                                    <button
                                        key={pkg.id}
                                        onClick={() => setSelected(pkg.id)}
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 14,
                                            padding: '14px 16px',
                                            borderRadius: 12,
                                            border: isSelected
                                                ? '2px solid #6366f1'
                                                : '2px solid #e5e7eb',
                                            background: isSelected ? 'rgba(99,102,241,0.05)' : '#fff',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {/* Popular badge */}
                                        {isPopular && (
                                            <div style={{
                                                position: 'absolute',
                                                top: -10,
                                                left: 14,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                padding: '2px 8px',
                                                background: '#f59e0b',
                                                borderRadius: 99,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: '#fff',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase',
                                            }}>
                                                <Star size={9} fill="white" />
                                                Most popular
                                            </div>
                                        )}

                                        {/* Radio dot */}
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            border: isSelected ? '6px solid #6366f1' : '2px solid #d1d5db',
                                            flexShrink: 0,
                                            transition: 'all 0.15s',
                                        }} />

                                        {/* Package info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                                                    {pkg.name}
                                                </span>
                                                {pkg.bonus_credits > 0 && (
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600,
                                                        color: '#10b981', background: 'rgba(16,185,129,0.1)',
                                                        padding: '1px 6px', borderRadius: 99,
                                                    }}>
                                                        +{pkg.bonus_credits} bonus
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                                {pkg.description ?? `${totalCredits} credits`}
                                            </div>
                                        </div>

                                        {/* Price + credits */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
                                                ${pkg.price_usd.toFixed(0)}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                                {totalCredits} credits
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* What you can do */}
                    {selectedPkg && (
                        <div style={{
                            marginTop: 16,
                            padding: '10px 14px',
                            background: '#f9fafb',
                            borderRadius: 10,
                            fontSize: 12,
                            color: '#6b7280',
                            lineHeight: 1.6,
                        }}>
                            <strong style={{ color: '#374151' }}>
                                {selectedPkg.credits + selectedPkg.bonus_credits} credits
                            </strong>{' '}
                            will let you run approx{' '}
                            {Math.floor((selectedPkg.credits + selectedPkg.bonus_credits) / 10)} Photo Studio generations,{' '}
                            {Math.floor((selectedPkg.credits + selectedPkg.bonus_credits) / 2)} Copy Optimizer rewrites,
                            or mix and match across all AI features.
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            background: 'rgba(239,68,68,0.07)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8,
                            fontSize: 12,
                            color: '#dc2626',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePurchase}
                        disabled={!selected || purchasing || loading}
                        style={{
                            marginTop: 16,
                            width: '100%',
                            padding: '13px',
                            borderRadius: 10,
                            background: selected && !purchasing ? '#6366f1' : '#e5e7eb',
                            color: selected && !purchasing ? '#fff' : '#9ca3af',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: selected && !purchasing ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.15s',
                        }}
                    >
                        {purchasing ? (
                            <>
                                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                Redirecting to payment…
                            </>
                        ) : (
                            <>
                                <Check size={15} />
                                Continue to Payment
                                {selectedPkg ? ` — $${selectedPkg.price_usd.toFixed(0)}` : ''}
                            </>
                        )}
                    </button>

                    <p style={{
                        margin: '10px 0 0', textAlign: 'center',
                        fontSize: 11, color: '#9ca3af',
                    }}>
                        Secure payment via Stripe · Credits never expire
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}
