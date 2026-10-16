// components/ui/CreditBalance.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shows the user's AI credit balance in the Template Studio header.
// Clicking opens the Buy Credits modal.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import React, { useState } from 'react'
import { Zap } from 'lucide-react'
import { useCreditWallet } from '@/hooks/useCreditWallet'
import { BuyCreditsModal } from './BuyCreditsModal'

interface CreditBalanceProps {
    className?: string
}

export function CreditBalance({ className = '' }: CreditBalanceProps) {
    const { balance, loading } = useCreditWallet()
    const [buyOpen, setBuyOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setBuyOpen(true)}
                className={`credit-balance-btn ${className}`}
                title="AI Credits — click to buy more"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(99,102,241,0.35)',
                    background: 'rgba(99,102,241,0.08)',
                    color: '#6366f1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.background = 'rgba(99,102,241,0.15)'
                    btn.style.borderColor = '#6366f1'
                }}
                onMouseLeave={e => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.background = 'rgba(99,102,241,0.08)'
                    btn.style.borderColor = 'rgba(99,102,241,0.35)'
                }}
            >
                <Zap size={13} fill="currentColor" />
                {loading ? (
                    <span style={{ opacity: 0.5 }}>—</span>
                ) : (
                    <span>{balance.toLocaleString()} credits</span>
                )}
            </button>

            {buyOpen && <BuyCreditsModal onClose={() => setBuyOpen(false)} />}
        </>
    )
}
