// hooks/useCreditWallet.ts
// ─────────────────────────────────────────────────────────────────────────────
// Reads the user's AI credit balance and action costs from the DB.
// Provides helpers for the credit UI components.
//
// Usage:
//   const { balance, canAfford, refresh } = useCreditWallet()
//   const ok = canAfford('ai_photo_studio')   // true/false
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ActionCost {
    feature_key: string
    name: string
    credits_cost: number
    is_enabled: boolean
}

export interface CreditWallet {
    balance: number
    actionCosts: Record<string, ActionCost>
    loading: boolean
    error: string | null
    canAfford: (featureKey: string) => boolean
    getCost: (featureKey: string) => number
    refresh: () => Promise<void>
}

export function useCreditWallet(): CreditWallet {
    const [balance, setBalance] = useState(0)
    const [actionCosts, setActionCosts] = useState<Record<string, ActionCost>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setBalance(0)
                setLoading(false)
                return
            }

            // Fetch wallet + action costs in parallel
            const [walletRes, costsRes] = await Promise.all([
                supabase
                    .from('user_ai_wallets')
                    .select('balance')
                    .eq('user_id', user.id)
                    .maybeSingle(),
                supabase
                    .from('ai_action_costs')
                    .select('feature_key, name, credits_cost, is_enabled'),
            ])

            setBalance(walletRes.data?.balance ?? 0)

            const costsMap: Record<string, ActionCost> = {}
            for (const row of costsRes.data ?? []) {
                costsMap[row.feature_key] = row
            }
            setActionCosts(costsMap)
        } catch (e) {
            console.error('[useCreditWallet] fetch error:', e)
            setError('Could not load credit balance.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()

        // Re-fetch when auth state changes (sign-in / sign-out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchData()
        })
        return () => subscription.unsubscribe()
    }, [fetchData])

    const canAfford = useCallback(
        (featureKey: string): boolean => {
            const action = actionCosts[featureKey]
            if (!action) return true   // unknown → don't block
            if (!action.is_enabled) return false
            return balance >= action.credits_cost
        },
        [balance, actionCosts]
    )

    const getCost = useCallback(
        (featureKey: string): number => actionCosts[featureKey]?.credits_cost ?? 0,
        [actionCosts]
    )

    return {
        balance,
        actionCosts,
        loading,
        error,
        canAfford,
        getCost,
        refresh: fetchData,
    }
}
