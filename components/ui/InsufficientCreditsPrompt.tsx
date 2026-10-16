// components/ui/InsufficientCreditsPrompt.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shown inside the AI panels when the user can't afford an action.
// "You need X credits · you have Y · [Buy Credits]"
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import React, { useState } from 'react'
import { Zap, ShoppingCart } from 'lucide-react'
import { BuyCreditsModal } from './BuyCreditsModal'

interface InsufficientCreditsPromptProps {
    balance: number
    cost: number
    featureName?: string
}

export function InsufficientCreditsPrompt({
    balance,
    cost,
    featureName = 'this AI feature',
}: InsufficientCreditsPromptProps) {
    const [buyOpen, setBuyOpen] = useState(false)
    const needed = cost - balance

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Zap size={14} color="#ef4444" fill="#ef4444" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
                        Not enough credits
                    </span>
                </div>

                <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                    {featureName} costs <strong style={{ color: '#374151' }}>{cost} credits</strong>.
                    You have <strong style={{ color: '#374151' }}>{balance}</strong> — you need{' '}
                    <strong style={{ color: '#374151' }}>{needed} more</strong>.
                </p>

                <button
                    onClick={() => setBuyOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        background: '#6366f1',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                    }}
                >
                    <ShoppingCart size={12} />
                    Buy Credits
                </button>
            </div>

            {buyOpen && <BuyCreditsModal onClose={() => setBuyOpen(false)} />}
        </>
    )
}
