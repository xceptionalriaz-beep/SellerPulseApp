'use client'
// components/UpgradeTeaser.tsx
// ─────────────────────────────────────────────────────────────
// Step 1 of the upgrade flow — shown when user hits a plan limit.
// Simple banner popup with a CTA that opens the full pricing modal.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

interface UpgradeTeaserProps {
    onClose:       () => void
    onViewPlans:   () => void
    title?:        string
    description?:  string
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
    title       = "You've reached your plan limit.",
    description = 'Upgrade to Pro to keep generating AI-powered eBay listings without limits.',
}: UpgradeTeaserProps) {

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

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(10, 13, 8, 0.55)',
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
                    maxWidth: '480px',
                    padding: '36px 32px 32px',
                    position: 'relative',
                    boxShadow: '0 24px 64px rgba(10,13,8,0.18)',
                    fontFamily: 'Inter, sans-serif',
                }}>

                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: '1px solid #e8ede2', background: '#f9fdf4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#8a9e78',
                    }}>
                    <X size={15} />
                </button>

                {/* Heading */}
                <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#4a8f00', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    Upgrade your plan
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0a0d08', margin: '0 0 8px', lineHeight: 1.2 }}>
                    {title}
                </h2>
                <p style={{ fontSize: '14px', color: '#8a9e78', margin: '0 0 24px', lineHeight: 1.55 }}>
                    {description}
                </p>

                {/* Bullets */}
                <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BULLETS.map(b => (
                        <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#0a0d08' }}>
                            <CheckCircle2 size={16} color="#8fff00" style={{ flexShrink: 0 }} />
                            {b}
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <button
                    onClick={onViewPlans}
                    style={{
                        width: '100%', padding: '14px',
                        borderRadius: '10px', border: 'none',
                        background: '#8fff00', color: '#0a0d08',
                        fontSize: '15px', fontWeight: 800,
                        cursor: 'pointer', letterSpacing: '0.01em',
                    }}>
                    View Plans & Upgrade →
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#8a9e78', margin: '14px 0 0' }}>
                    7-day free trial on all plans · Cancel anytime
                </p>
            </div>
        </div>
    )
}
