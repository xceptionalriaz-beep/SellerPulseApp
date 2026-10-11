'use client'
// components/PlanUpgradeModal.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Simple upgrade prompt popup
// Shown when a user hits their plan limit.
// Directs to billing page — no plan cards (those live at /dashboard/profile).
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap, CheckCircle2 } from 'lucide-react'

interface PlanUpgradeModalProps {
    currentTier?: string
    onClose: () => void
    onSelect?: (tier: string) => void
}

const BULLETS = [
    'Unlimited AI listing generation',
    'Bulk CSV upload (200 listings/mo)',
    'EAN / barcode auto-fill',
    'Dropship supplier import',
    'Priority support',
]

export function PlanUpgradeModal({ onClose }: PlanUpgradeModalProps) {
    const router = useRouter()

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    function handleUpgrade() {
        onClose()
        router.push('/dashboard/profile?tab=billing')
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(30, 21, 53, 0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}>

            {/* Card */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '460px',
                    padding: '36px 32px 32px',
                    position: 'relative',
                    boxShadow: '0 24px 64px rgba(30,21,53,0.18)',
                    fontFamily: '"DM Sans", sans-serif',
                }}>

                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: 'none', background: '#f3eeff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#7530fb',
                    }}>
                    <X size={15} />
                </button>

                {/* Icon */}
                <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: '#1e1535',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                }}>
                    <Zap size={24} fill="#b8fa33" color="#b8fa33" />
                </div>

                {/* Heading */}
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#7530fb', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    Upgrade your plan
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e1535', margin: '0 0 8px', fontFamily: '"Syne", sans-serif', lineHeight: 1.2 }}>
                    You've reached your listing limit.
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.55 }}>
                    Upgrade to Pro to keep generating AI-powered eBay listings without limits.
                </p>

                {/* Bullets */}
                <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BULLETS.map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e1535' }}>
                            <CheckCircle2 size={16} color="#7530fb" style={{ flexShrink: 0 }} />
                            {b}
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <button
                    onClick={handleUpgrade}
                    style={{
                        width: '100%', padding: '14px',
                        borderRadius: '10px', border: 'none',
                        background: '#b8fa33', color: '#1e1535',
                        fontSize: '15px', fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.01em',
                    }}>
                    View Plans & Upgrade →
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: '14px 0 0' }}>
                    7-day free trial on all plans · Cancel anytime
                </p>
            </div>
        </div>
    )
}
