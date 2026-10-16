'use client'
// app/credits/cancelled/page.tsx
// Stripe redirects here when the user cancels checkout.

import React from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function CreditsCancelledPage() {
    const router = useRouter()

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            padding: 24,
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: 48,
                maxWidth: 440,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <XCircle size={36} color="#ef4444" />
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                    Purchase Cancelled
                </h1>
                <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.6 }}>
                    No problem — your payment was not charged.
                    You can buy AI credits anytime from the app.
                </p>

                <button
                    onClick={() => router.push('/')}
                    style={{
                        width: '100%', padding: '12px',
                        background: '#6366f1', color: '#fff',
                        border: 'none', borderRadius: 10,
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                >
                    Back to App
                </button>
            </div>
        </div>
    )
}
