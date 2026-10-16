'use client'
// app/credits/success/page.tsx
// Stripe redirects here after a successful payment.
// Shows a confirmation and refreshes the user's credit balance.

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Zap } from 'lucide-react'

export default function CreditsSuccessPage() {
    const router = useRouter()

    useEffect(() => {
        // Auto-redirect back to the app after 4 seconds
        const timer = setTimeout(() => router.push('/'), 4000)
        return () => clearTimeout(timer)
    }, [router])

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
                    background: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <CheckCircle size={36} color="#10b981" />
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                    Credits Added!
                </h1>
                <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.6 }}>
                    Your AI credits have been added to your wallet.
                    You can now use them across all AI features.
                </p>

                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 20px',
                    background: 'rgba(99,102,241,0.07)',
                    borderRadius: 12, marginBottom: 28,
                    fontSize: 14, color: '#6366f1', fontWeight: 600,
                }}>
                    <Zap size={16} fill="#6366f1" />
                    Redirecting you back…
                </div>

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
