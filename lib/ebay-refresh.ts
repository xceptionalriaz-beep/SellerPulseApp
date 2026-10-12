// lib/ebay-refresh.ts
// Silently refreshes an expired eBay access token using the stored refresh token.
// Called from API routes before making eBay API calls.

import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export interface TokenRefreshResult {
    success: boolean
    accessToken?: string
    expiresAt?: string
    error?: string
}

/**
 * Refresh the eBay access token for a given user.
 * Updates the profiles table with the new token + expiry.
 * Returns the new access token on success.
 */
export async function refreshEbayAccessToken(userId: string): Promise<TokenRefreshResult> {
    try {
        // Load current refresh token from DB
        const { data: profile, error } = await (adminClient.from('profiles') as any)
            .select('ebay_refresh_token, ebay_refresh_token_expires_at')
            .eq('id', userId)
            .single()

        if (error || !profile?.ebay_refresh_token) {
            return { success: false, error: 'No refresh token found' }
        }

        // Check if refresh token itself is expired
        if (profile.ebay_refresh_token_expires_at) {
            const refreshExpiry = new Date(profile.ebay_refresh_token_expires_at)
            if (refreshExpiry < new Date()) {
                return { success: false, error: 'Refresh token expired — user must reconnect' }
            }
        }

        const clientId = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!
        const clientSecret = process.env.EBAY_CLIENT_SECRET!
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

        const tokenRes = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: profile.ebay_refresh_token,
                scope: [
                    'https://api.ebay.com/oauth/api_scope',
                    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.inventory',
                    'https://api.ebay.com/oauth/api_scope/sell.account',
                    'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
                ].join(' '),
            }).toString(),
        })

        if (!tokenRes.ok) {
            const errText = await tokenRes.text()
            console.error('[ebay-refresh] Token refresh failed:', errText)
            return { success: false, error: `eBay token refresh failed: ${tokenRes.status}` }
        }

        const tokenData = await tokenRes.json()
        const { access_token, expires_in } = tokenData
        const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

        // Save new access token to DB
        await (adminClient.from('profiles') as any).update({
            ebay_access_token: access_token,
            ebay_token_expires_at: expiresAt,
            updated_at: new Date().toISOString(),
        }).eq('id', userId)

        console.log('[ebay-refresh] Token refreshed for user', userId, 'expires', expiresAt)
        return { success: true, accessToken: access_token, expiresAt }

    } catch (err: any) {
        console.error('[ebay-refresh] Unexpected error:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Returns a valid eBay access token for the user, auto-refreshing if needed.
 * Call this before every eBay API call instead of reading the token directly.
 */
export async function getValidEbayToken(userId: string): Promise<{ token: string | null; error?: string }> {
    const { data: profile } = await (adminClient.from('profiles') as any)
        .select('ebay_access_token, ebay_token_expires_at')
        .eq('id', userId)
        .single()

    if (!profile?.ebay_access_token) {
        return { token: null, error: 'Not connected to eBay' }
    }

    // If token expires within 5 minutes, refresh it now
    const expiresAt = profile.ebay_token_expires_at
        ? new Date(profile.ebay_token_expires_at)
        : new Date(0)

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)

    if (expiresAt <= fiveMinutesFromNow) {
        const result = await refreshEbayAccessToken(userId)
        if (result.success && result.accessToken) {
            return { token: result.accessToken }
        }
        // If refresh failed, try the existing token anyway (may still work briefly)
        console.warn('[ebay-refresh] Auto-refresh failed, using existing token')
    }

    return { token: profile.ebay_access_token }
}

/**
 * Calculate a human-readable token status for display in the UI.
 */
export function getTokenStatus(
    accessExpiresAt: string | null,
    refreshExpiresAt: string | null,
    connectedAt: string | null
): { label: string; daysLeft: number; isExpired: boolean; needsReconnect: boolean } {
    const now = Date.now()

    // Refresh token expiry: use stored value, or infer from connected_at + 18 months
    let refreshExpiry: Date
    if (refreshExpiresAt) {
        refreshExpiry = new Date(refreshExpiresAt)
    } else if (connectedAt) {
        // eBay refresh tokens last 47304000 seconds = ~547.5 days ≈ 18 months
        refreshExpiry = new Date(new Date(connectedAt).getTime() + 47304000 * 1000)
    } else {
        // Unknown — assume 18 months from now (best guess)
        refreshExpiry = new Date(now + 47304000 * 1000)
    }

    const msLeft = refreshExpiry.getTime() - now
    const daysLeft = Math.max(0, Math.floor(msLeft / 86400000))
    const isExpired = msLeft <= 0
    const needsReconnect = daysLeft < 7

    if (isExpired) return { label: 'Expired', daysLeft: 0, isExpired: true, needsReconnect: true }
    if (daysLeft < 1) return { label: '<1d left', daysLeft: 0, isExpired: false, needsReconnect: true }
    if (daysLeft < 30) return { label: `${daysLeft}d left`, daysLeft, isExpired: false, needsReconnect: true }
    if (daysLeft < 60) return { label: `${daysLeft}d left`, daysLeft, isExpired: false, needsReconnect: false }

    const months = Math.floor(daysLeft / 30)
    return { label: `~${months}mo left`, daysLeft, isExpired: false, needsReconnect: false }
}
