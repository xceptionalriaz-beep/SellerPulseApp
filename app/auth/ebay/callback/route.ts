// app/auth/ebay/callback/route.ts
// Handles eBay OAuth callback — exchanges code for token
// then saves to profiles table and redirects back to dashboard

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code    = searchParams.get('code')
  const state   = searchParams.get('state') // user_id passed via state param
  const error   = searchParams.get('error')

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xceptionalriazebaysellertoolreazify.vercel.app'

  // ── Handle eBay OAuth error ──────────────────────────────────
  if (error || !code) {
    console.error('[ebay-callback] OAuth error:', error)
    return NextResponse.redirect(`${appUrl}/dashboard/profile?tab=ebay&error=oauth_failed`)
  }

  try {
    // ── Exchange code for access token ───────────────────────
    const clientId     = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!
    const clientSecret = process.env.EBAY_CLIENT_SECRET!
    const redirectUri  = process.env.EBAY_REDIRECT_URI!
    const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const tokenRes = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type:   'authorization_code',
        code:          code,
        redirect_uri:  redirectUri,
      }).toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('[ebay-callback] Token exchange failed:', err)
      return NextResponse.redirect(`${appUrl}/dashboard/profile?tab=ebay&error=token_failed`)
    }

    const tokenData = await tokenRes.json()
    const {
      access_token,
      refresh_token,
      expires_in, // seconds
    } = tokenData

    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // ── Get eBay user info ────────────────────────────────────
    let ebayUsername = ''
    let ebayUserId   = ''
    try {
      const userRes = await fetch('https://apiz.ebay.com/commerce/identity/v1/user/', {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      if (userRes.ok) {
        const userData = await userRes.json()
        ebayUsername   = userData.username ?? ''
        ebayUserId     = userData.userId   ?? ''
      }
    } catch {}

    // ── Save to profiles using state (user_id) ────────────────
    if (state) {
      await (adminClient.from('profiles') as any).update({
        ebay_access_token:     access_token,
        ebay_refresh_token:    refresh_token,
        ebay_token_expires_at: expiresAt,
        ebay_username:         ebayUsername,
        ebay_user_id:          ebayUserId,
        ebay_connected_at:     new Date().toISOString(),
        updated_at:            new Date().toISOString(),
      }).eq('id', state)

      // Auto-sync orders after connecting
      try {
        await fetch(`${appUrl}/api/ebay/sync-orders`, {
          method:  'POST',
          headers: {
            'Content-Type':      'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
          },
          body: JSON.stringify({ user_id: state }),
        })
      } catch {}
    }

    // ── Redirect back to profile with success ─────────────────
    return NextResponse.redirect(
      `${appUrl}/dashboard/profile?tab=ebay&connected=true&username=${encodeURIComponent(ebayUsername)}`
    )

  } catch (err: any) {
    console.error('[ebay-callback]', err)
    return NextResponse.redirect(`${appUrl}/dashboard/profile?tab=ebay&error=server_error`)
  }
}