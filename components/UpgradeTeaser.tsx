'use client'
// components/UpgradeTeaser.tsx

import { useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

interface UpgradeTeaserProps {
    onClose: () => void
    onViewPlans: () => void
    title?: string
    description?: string
}

const BULLETS = [
    'Unlimited AI listing generation',
    'Bulk CSV upload (200 listings/mo)',
    'EAN / barcode auto-fill',
    'Dropship supplier import',
    'Priority support',
]

export function UpgradeTeaser({
    onClose,
    onViewPlans,
    title = "You've reached your plan limit.",
    description = 'Upgrade to unlock full access to AI-powered eBay listing tools.',
}: UpgradeTeaserProps) {

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

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

            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '460px',
                    padding: '32px',
                    position: 'relative',
                    boxShadow: '0 24px 64px rgba(117,48,251,0.15)',
                    border: '1px solid #ede9fe',
                    fontFamily: '"DM Sans", Inter, sans-serif',
                }}>

                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '14px', right: '14px',
                        width: '30px', height: '30px', borderRadius: '50%',
                        border: '1px solid #ede9fe', background: '#f8f7ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#9ca3af',
                    }}>
                    <X size={14} />
                </button>

                {/* Label */}
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#7530fb', textTransform: 'uppercase', margin: '0 0 8px' }}>
                    Upgrade your plan
                </p>

                {/* Heading */}
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1535', margin: '0 0 8px', lineHeight: 1.25 }}>
                    {title}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.55 }}>
                    {description}
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: '#ede9fe', marginBottom: '20px' }} />

                {/* Bullets */}
                <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {BULLETS.map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1f1d2e' }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: '#f3eeff', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <CheckCircle2 size={12} color="#7530fb" />
                            </div>
                            {b}
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <button
                    onClick={onViewPlans}
                    style={{
                        width: '100%', padding: '13px',
                        borderRadius: '10px', border: 'none',
                        background: '#7530fb', color: '#ffffff',
                        fontSize: '14px', fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.01em',
                        boxShadow: '0 4px 16px rgba(117,48,251,0.3)',
                    }}>
                    View Plans & Upgrade →
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: '12px 0 0' }}>
                    7-day free trial on all plans · Cancel anytime
                </p>
            </div>
        </div>
    )
}
