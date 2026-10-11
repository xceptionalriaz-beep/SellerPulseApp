'use client'
// components/PlanUpgradeModal.tsx
// ─────────────────────────────────────────────────────────────
// Wraps the existing PlanCards component in a modal overlay.
// Shown when a user hits their plan limit anywhere in the app.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { X, TrendingUp } from 'lucide-react'
import PlanCards from '@/components/dashboard/PlanCards'
import { useState } from 'react'

interface PlanUpgradeModalProps {
    currentTier?: string
    onClose: () => void
    onSelect?: (tier: string) => void
}

export function PlanUpgradeModal({ currentTier = 'free', onClose }: PlanUpgradeModalProps) {
    const [isAnnual, setIsAnnual] = useState(true)

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
                background: 'rgba(10, 13, 8, 0.6)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                overflowY: 'auto',
            }}>

            {/* Modal card */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#f9fdf4',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '1140px',
                    padding: '32px',
                    position: 'relative',
                    boxShadow: '0 32px 80px rgba(10,13,8,0.25)',
                    fontFamily: 'Inter, sans-serif',
                    margin: 'auto',
                }}>

                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: '1px solid #e8ede2', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#8a9e78',
                    }}>
                    <X size={15} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                        <TrendingUp size={16} style={{ color: '#8fff00' }} />
                        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#4a8f00', textTransform: 'uppercase' }}>
                            Plans & Pricing
                        </span>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0a0d08', margin: 0, lineHeight: 1.2 }}>
                        Upgrade to keep growing
                    </h2>
                    <p style={{ fontSize: '13px', color: '#8a9e78', margin: '6px 0 0' }}>
                        You've reached your plan limit. Pick a plan to continue.
                    </p>
                </div>

                {/* Plan cards — reuses the existing billing page component */}
                <PlanCards
                    currentPlan={currentTier}
                    isAnnual={isAnnual}
                    onBillingToggle={() => setIsAnnual(a => !a)}
                />

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#8a9e78', marginTop: '20px' }}>
                    7-day free trial on all plans · Cancel anytime · Prices exc. VAT
                </p>
            </div>
        </div>
    )
}
