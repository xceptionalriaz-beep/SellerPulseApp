// lib/ebay-auth.ts
// ─────────────────────────────────────────────────────────────
// eBay Token Helper
//
// Reads eBay OAuth tokens from the `profiles` table, auto-refreshes
// if the access token is within 10 minutes of expiry, saves fresh
// token back to profiles, and returns a valid access_token string.
//
// Throws descriptive errors if eBay is not connected or refresh fails.
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const EBAY_TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token'

// ─────────────────────────────────────────────────────────────
// getEbayToken
// Returns a valid eBay access token for a given user.
// Auto-refreshes if within 10 minutes of expiry.
// Throws if eBay is not connected or refresh fails.
// ─────────────────────────────────────────────────────────────
export async function getEbayToken(userId: string): Promise<string> {
    // 1. Fetch current tokens from profiles
    const { data: profile, error } = await (adminClient.from('profiles') as any)
        .select('ebay_access_token, ebay_refresh_token, ebay_token_expires_at, ebay_marketplace')
        .eq('id', userId)
        .single()

    if (error || !profile) {
        throw new Error('User profile not found')
    }

    const { ebay_access_token, ebay_refresh_token, ebay_token_expires_at } = profile as {
        ebay_access_token: string | null
        ebay_refresh_token: string | null
        ebay_token_expires_at: string | null
        ebay_marketplace: string | null
    }

    if (!ebay_access_token || !ebay_refresh_token) {
        throw new Error('eBay not connected — please connect your eBay account in Settings')
    }

    // 2. Check if access token expires within 10 minutes
    const expiresAt = ebay_token_expires_at ? new Date(ebay_token_expires_at) : new Date(0)
    const tenMinsFromNow = new Date(Date.now() + 10 * 60 * 1000)

    if (expiresAt > tenMinsFromNow) {
        // Token is still valid
        return ebay_access_token
    }

    // 3. Token is expired or near expiry — refresh it
    const freshToken = await refreshEbayToken(userId, ebay_refresh_token)
    return freshToken
}

// ─────────────────────────────────────────────────────────────
// refreshEbayToken
// Exchanges a refresh_token for a new access_token.
// Saves the fresh token back to profiles.
// Throws on failure.
// ─────────────────────────────────────────────────────────────
async function refreshEbayToken(userId: string, refreshToken: string): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!
    const clientSecret = process.env.EBAY_CLIENT_SECRET!
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const res = await fetch(EBAY_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: [
                'https://api.ebay.com/oauth/api_scope',
                'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
                'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
                'https://api.ebay.com/oauth/api_scope/sell.inventory',
                'https://api.ebay.com/oauth/api_scope/sell.account',
            ].join(' '),
        }).toString(),
        signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
        const err = await res.text().catch(() => res.status.toString())
        throw new Error(`eBay token refresh failed (${res.status}): ${err}`)
    }

    const data = await res.json()

    if (!data.access_token) {
        throw new Error('eBay token refresh returned no access_token')
    }

    const expiresAt = new Date(Date.now() + (data.expires_in ?? 7200) * 1000).toISOString()

    // Save fresh token back to profiles
    await (adminClient.from('profiles') as any).update({
        ebay_access_token: data.access_token,
        ebay_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
    }).eq('id', userId)

    return data.access_token as string
}

// ─────────────────────────────────────────────────────────────
// getEbayConnectionStatus
// Returns whether eBay is connected and the username for display.
// Non-throwing — returns { connected: false } on any error.
// ─────────────────────────────────────────────────────────────
export async function getEbayConnectionStatus(userId: string): Promise<{
    connected: boolean
    username: string | null
    marketplace: string | null
    expiresAt: string | null
}> {
    try {
        const { data: profile } = await (adminClient.from('profiles') as any)
            .select('ebay_access_token, ebay_username, ebay_marketplace, ebay_token_expires_at')
            .eq('id', userId)
            .single()

        if (!profile || !(profile as any).ebay_access_token) {
            return { connected: false, username: null, marketplace: null, expiresAt: null }
        }

        return {
            connected: true,
            username: (profile as any).ebay_username ?? null,
            marketplace: (profile as any).ebay_marketplace ?? 'EBAY_US',
            expiresAt: (profile as any).ebay_token_expires_at ?? null,
        }
    } catch {
        return { connected: false, username: null, marketplace: null, expiresAt: null }
    }
}
