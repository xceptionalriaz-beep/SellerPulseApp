import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This special header tells Google Chrome to let the data through to your Vercel site!
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Grab the user's search text from the Flutter app
    const { query, page } = await req.json()
    const offset = (page - 1) * 25;

    // Securely connect to Supabase Database to grab the hidden eBay keys
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: config, error: dbError } = await supabase
      .from('api_fleet_config')
      .select('primary_key_1, primary_key_2')
      .eq('platform_name', 'ebay')
      .single()

    if (dbError) throw new Error('Database block: ' + dbError.message)

    // 2. Secretly exchange those keys for an eBay Access Token
    const credentials = btoa(`${config.primary_key_1}:${config.primary_key_2}`);
    
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error('eBay rejected keys: ' + JSON.stringify(tokenData));

    // 3. Search eBay directly from the secure server
    const targetUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=25&offset=${offset}`;
    
    const searchResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const searchData = await searchResponse.json();

    // 4. Send the clean list of products back to Flutter
    return new Response(JSON.stringify(searchData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})