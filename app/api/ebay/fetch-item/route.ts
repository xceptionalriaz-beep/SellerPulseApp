// app/api/ebay/fetch-item/route.ts
// ─────────────────────────────────────────────────────────────
// Fetches eBay item details using Browse API
// Reads credentials from Supabase vault (api_fleet_config)
// NOT from .env — keys managed via API Vault UI
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Extract Item ID from URL or raw ID ────────────────────────
function extractItemId(input: string): string | null {
    const trimmed = input.trim()

    // Raw numeric Item ID
    if (/^\d{9,13}$/.test(trimmed)) return trimmed

    // eBay URL formats:
    // https://www.ebay.com/itm/123456789
    // https://www.ebay.com/itm/title-here/123456789
    // https://ebay.com/itm/123456789?hash=...
    const urlMatch = trimmed.match(/\/itm\/(?:[^/]+\/)?(\d{9,13})/)
    if (urlMatch) return urlMatch[1]

    // Short URL: https://ebay.us/xxxxx (redirect — can't extract directly)
    return null
}

// ── Detect marketplace from URL ────────────────────────────────
function detectMarketplace(input: string): string {
    if (input.includes('ebay.co.uk')) return 'EBAY_GB'
    if (input.includes('ebay.com.au')) return 'EBAY_AU'
    if (input.includes('ebay.ca')) return 'EBAY_CA'
    if (input.includes('ebay.de')) return 'EBAY_DE'
    if (input.includes('ebay.fr')) return 'EBAY_FR'
    if (input.includes('ebay.it')) return 'EBAY_IT'
    if (input.includes('ebay.es')) return 'EBAY_ES'
    if (input.includes('ebay.at')) return 'EBAY_AT'
    if (input.includes('ebay.be')) return 'EBAY_BE'
    if (input.includes('ebay.nl')) return 'EBAY_NL'
    if (input.includes('ebay.pl')) return 'EBAY_PL'
    if (input.includes('ebay.ch')) return 'EBAY_CH'
    if (input.includes('ebay.ie')) return 'EBAY_IE'
    return 'EBAY_US' // default
}

// ── Fetch OAuth token from Supabase vault
async function getVaultToken(): Promise<{ appId: string; token: string } | null> {
    const { data, error } = await supabase
        .from('api_fleet_config')
        .select('primary_key_1, primary_key_2')
        .eq('platform_name', 'ebay')
        .single()
    if (error || !data) {
        console.error('[getVaultToken] DB error:', error, 'data:', data)
        return null
    }
    const appId = data.primary_key_1
    const certId = data.primary_key_2
    if (!appId || appId === 'EMPTY') return null
    if (!certId || certId === 'EMPTY') return null
    const token = await refreshToken(appId, certId)
    if (!token) return null
    return { appId, token }
}

// ── Trading API fallback (GetSingleItem) — works for ended/sold listings
async function fetchFromTradingApi(itemId: string, appId: string, token?: string, marketplace: string = 'EBAY_US'): Promise<any | null> {
    try {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetSingleItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <ApplicationId>${appId}</ApplicationId>
  </RequesterCredentials>
  <ItemID>${itemId}</ItemID>
  <IncludeSelector>Details,Description,ItemSpecifics,ShippingCosts</IncludeSelector>
</GetSingleItemRequest>`

        const res = await fetch(`https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0?fieldgroups=PRODUCT,ADDITIONAL_IMAGES,VARIATIONS`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-EBAY-C-MARKETPLACE-ID': marketplace,
                'Content-Type': 'application/json',
            },
        })

        if (!res.ok) {
            console.error('[Trading API] HTTP error:', res.status, await res.text())
            return null
        }
        const data = await res.json()
        console.log('[Trading API] Response:', JSON.stringify(data).slice(0, 500))
        const item = data?.Item
        if (!item) {
            console.error('[Trading API] No item in response:', JSON.stringify(data).slice(0, 300))
            return null
        }

        const price = parseFloat(item.ConvertedCurrentPrice?.Value ?? item.CurrentPrice?.Value ?? '0')
        const url = item.ViewItemURL ?? `https://www.ebay.com/itm/${itemId}`

        return {
            itemId,
            title: item.Title ?? '',
            price,
            currency: item.ConvertedCurrentPrice?.CurrencyID ?? 'USD',
            shippingCost: parseFloat(item.ShippingCostSummary?.ShippingServiceCost?.Value ?? '0'),
            freeShipping: item.ShippingCostSummary?.ShippingType === 'Free',
            condition: item.ConditionDisplayName ?? '',
            conditionId: item.ConditionID ?? '',
            categoryId: item.PrimaryCategoryID ?? '',
            categoryName: item.PrimaryCategoryName ?? '',
            imageUrl: item.PictureURL?.[0] ?? '',
            itemUrl: url,
            seller: item.Seller?.UserID ?? '',
            sellerFeedback: String(item.Seller?.PositiveFeedbackPercent ?? ''),
            location: item.Location ?? '',
            quantity: item.Quantity ?? 1,
            sold: item.QuantitySold ?? 0,
            returns: item.ReturnsAccepted ?? false,
            returnPeriod: '',
            brand: item.ItemSpecifics?.NameValueList?.find((s: any) => s.Name === 'Brand')?.Value?.[0] ?? '',
            mpn: '',
            ean: '',
            fetchedAt: new Date().toISOString(),
            site: (() => {
                if (url.includes('ebay.co.uk')) return 'EBAY_GB'
                if (url.includes('ebay.de')) return 'EBAY_DE'
                if (url.includes('ebay.fr')) return 'EBAY_FR'
                if (url.includes('ebay.com.au')) return 'EBAY_AU'
                if (url.includes('ebay.ca')) return 'EBAY_CA'
                return 'EBAY_US'
            })(),
            sellerCountry: item.Location?.split(',').pop()?.trim() ?? '',
            source: 'trading_api',
        }
    } catch (e) {
        console.error('[Trading API fallback error]', e)
        return null
    }
}

// ── Refresh OAuth token if expired
async function refreshToken(appId: string, certId: string): Promise<string | null> {
    try {
        const encoded = Buffer.from(`${appId}:${certId}`).toString('base64')
        const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encoded}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
        })
        const data = await res.json()
        console.log('[eBay OAuth]', res.status, JSON.stringify(data))
        return data.access_token ?? null
    } catch (e) {
        console.error('[eBay OAuth Error]', e)
        return null
    }
}

// ── Update rate limit usage in vault ──────────────────────────
async function incrementUsage() {
    // Log API call to usage table
    try {
        const { error: insertError } = await supabase.from('api_usage_logs').insert({
            user_id: '977f3057-069a-4ff4-999b-5b2c0a17d72b',
            platform_name: 'ebay_browse_api',
            endpoint: '/buy/browse/v1/item',
            tool_name: 'Profit Calculator',
            call_name: 'getItem',
            success_count: 1,
            error_count: 0,
            response_time_ms: 0,
            logged_at: new Date().toISOString(),
        })
        if (insertError) console.error('[fetch-item] Usage log error:', insertError)

        // Update last used in vault
        await supabase.from('api_fleet_config')
            .update({
                last_used_at: new Date().toISOString(),
                rate_limit_used: 1,
            })
            .eq('platform_name', 'ebay_browse_api')
    } catch (e) {
        console.error('[fetch-item] Tracking error:', e)
    }
}

// ── Main handler ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const input = searchParams.get('item') ?? searchParams.get('url') ?? ''

    if (!input) {
        return NextResponse.json(
            { error: 'Missing item parameter. Pass ?item=123456789 or ?item=ebay.com/itm/...' },
            { status: 400 }
        )
    }

    // ── Extract Item ID ──────────────────────────────────────────
    const itemId = extractItemId(input)
    const marketplaceOverride = searchParams.get('marketplace')
    let marketplace = marketplaceOverride ?? detectMarketplace(input)
    if (!itemId) {
        return NextResponse.json(
            { error: 'Could not extract a valid eBay Item ID from the input.' },
            { status: 400 }
        )
    }

    // ── Load credentials from vault ───────────────────────────────
    const vault = await getVaultToken()
    if (!vault) {
        return NextResponse.json(
            { error: 'eBay Browse API credentials not configured. Add them in API Vault.' },
            { status: 503 }
        )
    }

    // ── Call eBay Browse API ──────────────────────────────────────
    let token = vault.token

    // If bare Item ID (no URL), try multiple marketplaces
    const isBareId = /^\d{9,13}$/.test(input.trim())
    let ebayRes = await fetch(
        `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0?fieldgroups=PRODUCT,ADDITIONAL_IMAGES,VARIATIONS`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-EBAY-C-MARKETPLACE-ID': marketplace,
                'Content-Type': 'application/json',
            },
        }
    )

    // If not found on initial marketplace, refresh token and try all marketplaces
    if (!ebayRes.ok) {
        // Refresh token first before trying marketplaces
        const { data: vaultFull } = await supabase
            .from('api_fleet_config')
            .select('primary_key_1, primary_key_2')
            .eq('platform_name', 'ebay')
            .single()
        if (vaultFull?.primary_key_2) {
            const newToken = await refreshToken(vaultFull.primary_key_1, vaultFull.primary_key_2)
            if (newToken) token = newToken
        }
        const marketplacesToTry = ['EBAY_GB', 'EBAY_CA', 'EBAY_AU', 'EBAY_DE', 'EBAY_FR', 'EBAY_IT', 'EBAY_ES', 'EBAY_AT', 'EBAY_BE', 'EBAY_NL', 'EBAY_PL', 'EBAY_CH', 'EBAY_IE', 'EBAY_US']

        // Run all marketplace checks in parallel for speed
        const results = await Promise.all(
            marketplacesToTry.map(async mp => {
                const res = await fetch(
                    `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0?fieldgroups=PRODUCT`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-EBAY-C-MARKETPLACE-ID': mp,
                            'Content-Type': 'application/json',
                        },
                    }
                )
                return { mp, res, ok: res.ok }
            })
        )

        const found = results.find(r => r.ok)
        if (found) {
            console.log('[Marketplace Loop] Found item on:', found.mp)
            marketplace = found.mp
            ebayRes = found.res
        }
    }

    // ── Handle token expiry — refresh and retry ───────────────────
    if (ebayRes.status === 401) {
        // Get Cert ID from vault for refresh
        const { data: vaultFull } = await supabase
            .from('api_fleet_config')
            .select('primary_key_1, primary_key_2')
            .eq('platform_name', 'ebay')
            .single()

        if (vaultFull?.primary_key_2) {
            const newToken = await refreshToken(vaultFull.primary_key_1, vaultFull.primary_key_2)
            if (newToken) {
                token = newToken
                // Save new token to vault
                await supabase.from('api_fleet_config')
                    .update({ primary_key_2: newToken, updated_at: new Date().toISOString() })
                    .eq('platform_name', 'ebay_browse_api')

                // Retry with new token
                ebayRes = await fetch(
                    `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0?fieldgroups=PRODUCT`,
                    {
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                            'X-EBAY-C-MARKETPLACE-ID': marketplace,
                            'Content-Type': 'application/json',
                        },
                    }
                )
            }
        }
    }

    if (!ebayRes.ok) {
        const errText = await ebayRes.text()
        console.error('[eBay Browse API] Error:', ebayRes.status, errText)

        console.log('[Browse API] Status:', ebayRes.status, 'for item:', itemId)
        if (ebayRes.status === 404) {
            // Fallback: Try getItemByLegacyId (works for some ended listings)
            const legacyRes = await fetch(
                `https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${itemId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-EBAY-C-MARKETPLACE-ID': marketplace,
                        'Content-Type': 'application/json',
                    },
                }
            )
            if (legacyRes.ok) {
                ebayRes = legacyRes
            } else {
                return NextResponse.json(
                    { error: `Item ${itemId} has ended or is no longer available on eBay. Please use an active listing.` },
                    { status: 404 }
                )
            }
        }
        if (ebayRes.status === 429) {
            return NextResponse.json(
                { error: 'eBay API rate limit reached. Try again later.' },
                { status: 429 }
            )
        }
        return NextResponse.json(
            { error: `eBay API error: ${ebayRes.status}` },
            { status: 502 }
        )
    }

    const item = await ebayRes.json()

    // ── Extract and clean the data ────────────────────────────────
    const price = parseFloat(item.price?.value ?? item.currentBidPrice?.value ?? '0')
    const currency = item.price?.currency ?? 'USD'

    const shippingOptions = item.shippingOptions ?? []
    const freeShipping = shippingOptions.some((s: any) =>
        s.shippingCost?.value === '0.00' || s.type === 'FREE_SHIPPING'
    )
    const shippingCost = freeShipping
        ? 0
        : parseFloat(shippingOptions[0]?.shippingCost?.value ?? '0')

    const result = {
        itemId,
        title: item.title ?? '',
        price,
        currency,
        shippingCost,
        freeShipping,
        condition: item.condition ?? '',
        conditionId: item.conditionId ?? '',
        categoryId: item.categoryId ?? '',
        categoryName: item.categoryPath ?? '',
        imageUrl: item.image?.imageUrl ?? item.additionalImages?.[0]?.imageUrl ?? '',
        itemUrl: item.itemWebUrl ?? `https://www.ebay.com/itm/${itemId}`,
        seller: item.seller?.username ?? '',
        sellerFeedback: item.seller?.feedbackPercentage ?? '',
        location: item.itemLocation?.city
            ? `${item.itemLocation.city}, ${item.itemLocation.stateOrProvince ?? ''}`
            : item.itemLocation?.country ?? '',
        quantity: item.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity ?? 1,
        sold: item.estimatedAvailabilities?.[0]?.estimatedSoldQuantity ?? 0,
        returns: item.returnTerms?.returnsAccepted ?? false,
        returnPeriod: item.returnTerms?.returnPeriod?.value ?? '',
        brand: item.localizedAspects?.find((a: any) => a.name === 'Brand')?.value ?? '',
        mpn: item.mpn ?? '',
        ean: item.gtin ?? '',
        sellerCountry: item.itemLocation?.country ?? '',
        fetchedAt: new Date().toISOString(),
        site: (() => {
            // 1. Check itemWebUrl domain first (reliable when URL is pasted)
            const webUrl = item.itemWebUrl ?? ''
            if (webUrl.includes('ebay.co.uk')) return 'EBAY_GB'
            if (webUrl.includes('ebay.com.au')) return 'EBAY_AU'
            if (webUrl.includes('ebay.ca')) return 'EBAY_CA'
            if (webUrl.includes('ebay.de')) return 'EBAY_DE'
            if (webUrl.includes('ebay.fr')) return 'EBAY_FR'
            if (webUrl.includes('ebay.it')) return 'EBAY_IT'
            if (webUrl.includes('ebay.es')) return 'EBAY_ES'
            if (webUrl.includes('ebay.at')) return 'EBAY_AT'
            if (webUrl.includes('ebay.be')) return 'EBAY_BE'
            if (webUrl.includes('ebay.nl')) return 'EBAY_NL'
            if (webUrl.includes('ebay.pl')) return 'EBAY_PL'
            if (webUrl.includes('ebay.ch')) return 'EBAY_CH'
            if (webUrl.includes('ebay.ie')) return 'EBAY_IE'
            // 2. Use currency for unambiguous currencies
            const cur = item.price?.currency ?? ''
            if (cur === 'GBP') return 'EBAY_GB'
            if (cur === 'AUD') return 'EBAY_AU'
            if (cur === 'CAD') return 'EBAY_CA'
            if (cur === 'CHF') return 'EBAY_CH'
            if (cur === 'PLN') return 'EBAY_PL'
            // 3. Use the marketplace we successfully fetched with
            return marketplace
        })(),
    }

    // Log API call + update vault
    try {
        const { error: logError } = await supabase.from('api_usage_logs').insert({
            user_id: '977f3057-069a-4ff4-999b-5b2c0a17d72b',
            platform_name: 'ebay_browse_api',
            endpoint: '/buy/browse/v1/item',
            tool_name: 'Profit Calculator',
            call_name: 'getItem',
            success_count: 1,
            error_count: 0,
            response_time_ms: 0,
            logged_at: new Date().toISOString(),
        })
        if (logError) console.error('[API Usage Log Error]', logError)

        await supabase.from('api_fleet_config')
            .update({
                last_used_at: new Date().toISOString(),
                rate_limit_used: 1,
            })
            .eq('platform_name', 'ebay_browse_api')
    } catch (e) {
        console.error('[API Tracking Error]', e)
    }

    return NextResponse.json({ success: true, item: result })
}

// ── POST handler (accepts JSON body) ──────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const input = body.item ?? body.url ?? body.itemId ?? ''
        const url = new URL(req.url)
        url.searchParams.set('item', input)
        return GET(new NextRequest(url.toString(), { method: 'GET' }))
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
