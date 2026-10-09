// app/api/ebay/import-listing/route.ts
// Uses same OAuth pattern as search/route.ts — env vars + api.ebay.com

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Extract Item ID ───────────────────────────────────────────────────────
function extractItemId(input: string): string | null {
    const trimmed = input.trim()
    if (/^\d{9,13}$/.test(trimmed)) return trimmed
    const match = trimmed.match(/\/itm\/(?:[^/?]+\/)?(\d{9,13})/)
    if (match) return match[1]
    return null
}

// ── Detect marketplace from URL ───────────────────────────────────────────
function getMarketplace(input: string): string {
    if (input.includes('ebay.co.uk')) return 'EBAY_GB'
    if (input.includes('ebay.com.au')) return 'EBAY_AU'
    if (input.includes('ebay.de')) return 'EBAY_DE'
    if (input.includes('ebay.fr')) return 'EBAY_FR'
    if (input.includes('ebay.it')) return 'EBAY_IT'
    if (input.includes('ebay.es')) return 'EBAY_ES'
    if (input.includes('ebay.ca')) return 'EBAY_CA'
    return 'EBAY_US'
}

// ── Get OAuth token — try stored token first, then generate fresh ─────────
async function getToken(): Promise<string | null> {
    // First try env vars (same as search route)
    const clientId = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID
    const clientSecret = process.env.EBAY_CLIENT_SECRET

    // Try generating fresh token from env vars
    if (clientId && clientSecret) {
        try {
            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
            const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
            })
            if (res.ok) {
                const data = await res.json()
                if (data.access_token) return data.access_token
            }
        } catch (e) {
            console.error('[import-listing] env token error:', e)
        }
    }

    // Fallback: use stored OAuth token from ebay_browse_api
    const { data: browseData } = await supabase
        .from('api_fleet_config')
        .select('primary_key_2')
        .eq('platform_name', 'ebay_browse_api')
        .eq('status', 'connected')
        .single()

    if (browseData?.primary_key_2 && browseData.primary_key_2 !== 'EMPTY') {
        return browseData.primary_key_2
    }

    // Last resort: generate from DB app ID + cert ID
    const { data: ebayData } = await supabase
        .from('api_fleet_config')
        .select('primary_key_1, primary_key_2')
        .eq('platform_name', 'ebay')
        .single()

    if (ebayData?.primary_key_1 && ebayData?.primary_key_2) {
        try {
            const credentials = Buffer.from(`${ebayData.primary_key_1}:${ebayData.primary_key_2}`).toString('base64')
            const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
            })
            if (res.ok) {
                const data = await res.json()
                if (data.access_token) return data.access_token
            }
        } catch (e) {
            console.error('[import-listing] db token error:', e)
        }
    }

    return null
}

// ── Fetch item via Browse API ─────────────────────────────────────────────
async function fetchItem(itemId: string, token: string, marketplace: string) {
    // Try v1|itemId|0 format first
    const res = await fetch(
        `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0?fieldgroups=PRODUCT`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-EBAY-C-MARKETPLACE-ID': marketplace,
                'Content-Type': 'application/json',
            },
        }
    )
    return res
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const input = searchParams.get('item') ?? searchParams.get('url') ?? ''

    if (!input.trim()) {
        return NextResponse.json({ error: 'Missing ?item= parameter' }, { status: 400 })
    }

    const itemId = extractItemId(input)
    if (!itemId) {
        return NextResponse.json(
            { error: 'Could not find a valid eBay Item ID. Paste a full eBay URL or numeric Item ID.' },
            { status: 400 }
        )
    }

    // Get OAuth token
    const token = await getToken()
    if (!token) {
        return NextResponse.json(
            { error: 'eBay API credentials not found. Check your API Vault or environment variables.' },
            { status: 503 }
        )
    }
    console.log('[import-listing] Token obtained, length:', token.length)

    // Try detected marketplace first, then all others
    const detected = getMarketplace(input)
    const allMarkets = ['EBAY_US', 'EBAY_GB', 'EBAY_AU', 'EBAY_DE', 'EBAY_FR', 'EBAY_IT', 'EBAY_ES', 'EBAY_CA']
    const toTry = [detected, ...allMarkets.filter(m => m !== detected)]

    let ebayRes: Response | null = null
    let usedMarket = detected

    for (const market of toTry) {
        try {
            console.log(`[import-listing] Trying ${market} for item ${itemId}`)
            const res = await fetchItem(itemId, token, market)
            console.log(`[import-listing] ${market} status: ${res.status}`)
            if (res.ok) {
                ebayRes = res
                usedMarket = market
                break
            }
            if (res.status !== 404) {
                const errText = await res.text()
                console.log(`[import-listing] Non-404 error on ${market}:`, errText.slice(0, 200))
                break
            }
        } catch (e) {
            console.error('[import-listing] fetch error:', e)
            return NextResponse.json(
                { error: 'Network error reaching eBay API. Make sure your server can reach api.ebay.com' },
                { status: 502 }
            )
        }
    }

    if (!ebayRes || !ebayRes.ok) {
        // Try legacy ID endpoint as last resort
        try {
            const legRes = await fetch(
                `https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${itemId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-EBAY-C-MARKETPLACE-ID': detected,
                    },
                }
            )
            if (legRes.ok) {
                ebayRes = legRes
            }
        } catch { /* ignore */ }
    }

    if (!ebayRes || !ebayRes.ok) {
        const status = ebayRes?.status ?? 404
        return NextResponse.json(
            { error: `Item ${itemId} could not be fetched (status ${status}). It may be ended or not available via eBay API.` },
            { status: 404 }
        )
    }

    const data = await ebayRes.json()

    // ── Normalise Browse API response ─────────────────────────────────────
    const price = parseFloat(data.price?.value ?? data.currentBidPrice?.value ?? '0')
    const currency = data.price?.currency ?? 'USD'
    const imageUrl = data.image?.imageUrl ?? data.additionalImages?.[0]?.imageUrl ?? ''
    const itemUrl = data.itemWebUrl ?? `https://www.ebay.com/itm/${itemId}`
    const seller = data.seller?.username ?? ''
    const feedback = data.seller?.feedbackPercentage ?? ''

    // Shipping
    const shipOption = data.shippingOptions?.[0]
    const shipCost = parseFloat(shipOption?.shippingCost?.value ?? '0')
    const freeShip = shipCost === 0 || shipOption?.shippingCostType === 'FREE'

    // Returns
    const returnTerms = data.returnTerms
    const returnsAccepted = returnTerms?.returnsAccepted === true
    const returnPeriod = returnTerms?.returnPeriod?.value
        ? `${returnTerms.returnPeriod.value} ${returnTerms.returnPeriod.unit}`
        : ''

    // Specs
    type Spec = { name: string; value: string }
    const specs: Spec[] = data.localizedAspects ?? []
    const getSpec = (name: string) =>
        specs.find(s => s.name?.toLowerCase() === name.toLowerCase())?.value ?? ''

    const result = {
        itemId,
        title: data.title ?? '',
        price,
        currency,
        condition: data.condition ?? '',
        conditionId: data.conditionId ?? '',
        categoryId: data.categoryId ?? '',
        categoryName: data.categoryPath ?? data.categoryName ?? '',
        imageUrl,
        itemUrl,
        seller,
        sellerFeedback: feedback,
        location: data.itemLocation?.country ?? '',
        quantity: data.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity ?? 1,
        sold: 0,
        freeShipping: freeShip,
        shippingCost: shipCost,
        returns: returnsAccepted,
        returnPeriod,
        brand: getSpec('Brand') || (data.brand ?? ''),
        mpn: getSpec('MPN'),
        ean: getSpec('EAN'),
        site: usedMarket,
        sellerCountry: data.itemLocation?.country ?? '',
        fetchedAt: new Date().toISOString(),
        source: 'browse_api',
    }

    return NextResponse.json({ success: true, item: result })
}

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
