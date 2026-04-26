import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Catch the URL parameters eBay sent us
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const userId = url.searchParams.get('state') // This is the nametag we added!

  // If someone visits this page by mistake, tell them to leave
  if (!code || !userId) {
    return new Response("Missing eBay code or User ID.", { status: 400 })
  }

  // 2. Wake up the Supabase Admin (Bypasses security to read your secret vault)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 3. Secretly grab your keys from the api_fleet_config table
    const { data: vault, error: vaultError } = await supabaseAdmin
      .from('api_fleet_config')
      .select('primary_key_1, primary_key_2') // ✨ FIXED: Changed to primary_key_2
      .eq('platform_name', 'ebay')
      .single()

    if (vaultError || !vault) throw new Error("Vault keys not found")

    const clientId = vault.primary_key_1
    const clientSecret = vault.primary_key_2 // ✨ FIXED: Changed to primary_key_2
    const ruName = "Reazify_LLC-ReazifyL-Seller-qpmttkudp" // Your exact RuName

    // 4. Trade the 'code' for the permanent Access Tokens from eBay
    const credentials = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: decodeURIComponent(code),
        redirect_uri: ruName
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) throw new Error(JSON.stringify(tokenData))

    // Calculate when the token expires
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    // 5. Save the tokens securely in the user's account
    await supabaseAdmin.from('ebay_connections').delete().eq('user_id', userId)
    
    const { error: insertError } = await supabaseAdmin.from('ebay_connections').insert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt
    })

    if (insertError) throw new Error("Failed to save tokens to database")

    // 6. SUCCESS! Send the user back to your app
    return Response.redirect('https://dropnrest.com/dashboard?ebay=success', 302)

  } catch (err: any) {
    return new Response(`eBay Connection Failed: ${err.message}`, { status: 500 })
  }
})