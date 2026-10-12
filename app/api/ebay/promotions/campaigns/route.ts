// app/api/ebay/promotions/campaigns/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// GET  — list campaigns (local DB + optional eBay refresh)
// POST — create a new campaign on eBay + cache locally
// PATCH — update local-only fields (notes, auto_enroll, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEbayToken } from '@/lib/ebay-auth'

const MARKETING_BASE = 'https://api.ebay.com/sell/marketing/v1'

// ── helpers ──────────────────────────────────────────────────────────────────
function supabase() {
    const cookieStore = cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() } } }
    )
}

async function getUser() {
    const { data: { user }, error } = await supabase().auth.getUser()
    if (error || !user) throw new Error('Not authenticated')
    return user
}

// ── GET /api/ebay/promotions/campaigns ───────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const user = await getUser()
        const sb = supabase()
        const refresh = req.nextUrl.searchParams.get('refresh') === '1'

        if (refresh) {
            const token = await getEbayToken(user.id)
            let offset = 0
            const limit = 200
            let allCampaigns: any[] = []

            while (true) {
                const res = await fetch(
                    `${MARKETING_BASE}/ad_campaign?limit=${limit}&offset=${offset}`,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                )
                if (!res.ok) {
                    if (res.status === 403) break
                    throw new Error(`eBay campaigns list failed (${res.status}): ${await res.text()}`)
                }
                const json = await res.json()
                const campaigns = json.campaigns ?? []
                allCampaigns = allCampaigns.concat(campaigns)
                if (campaigns.length < limit) break
                offset += limit
            }

            if (allCampaigns.length > 0) {
                const rows = allCampaigns.map((c: any) => ({
                    user_id: user.id,
                    campaign_id: c.campaignId,
                    campaign_name: c.campaignName,
                    campaign_type: c.campaignType ?? 'PROMOTED_LISTINGS',
                    funding_model: c.fundingStrategy?.fundingModel ?? 'COST_PER_SALE',
                    status: c.campaignStatus ?? 'RUNNING',
                    bid_percentage: c.fundingStrategy?.bidPercentage ? parseFloat(c.fundingStrategy.bidPercentage) : null,
                    daily_budget: c.budget?.dailyBudget?.value ? parseFloat(c.budget.dailyBudget.value) : null,
                    marketplace_id: c.marketplaceId ?? 'EBAY_US',
                    start_date: c.startDate ?? null,
                    end_date: c.endDate ?? null,
                    synced_at: new Date().toISOString(),
                }))

                await (sb.from('promotion_campaigns') as any)
                    .upsert(rows, { onConflict: 'user_id,campaign_id' })
            }
        }

        const { data: campaigns, error } = await (sb.from('promotion_campaigns') as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ campaigns: campaigns ?? [] })
    } catch (e: any) {
        console.error('[promotions/campaigns GET]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// ── POST /api/ebay/promotions/campaigns ──────────────────────────────────────
// Body: { name, type, bidPercentage?, dailyBudget?, marketplaceId?,
//         endDate?, notes?, adRateStrategy?, bidAdjustmentPct?, maxAdRate?, autoEnroll? }
export async function POST(req: NextRequest) {
    try {
        const user = await getUser()
        const sb = supabase()
        const body = await req.json()

        const {
            name,
            type = 'PROMOTED_LISTINGS',
            bidPercentage,
            dailyBudget,
            marketplaceId = 'EBAY_US',
            endDate,
            notes,
            adRateStrategy = 'FIXED',
            bidAdjustmentPct,
            maxAdRate,
            autoEnroll = false,
        } = body

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
        }

        const token = await getEbayToken(user.id)

        const isCPS = type === 'PROMOTED_LISTINGS'
        const payload: any = {
            campaignName: name.trim(),
            campaignType: type,
            marketplaceId,
            startDate: new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z'),
        }

        if (endDate) payload.endDate = endDate

        if (isCPS) {
            if (!bidPercentage || isNaN(Number(bidPercentage))) {
                return NextResponse.json({ error: 'Bid percentage is required for Standard campaigns' }, { status: 400 })
            }
            payload.fundingStrategy = {
                bidPercentage: String(Number(bidPercentage).toFixed(1)),
                fundingModel: 'COST_PER_SALE',
            }
        } else {
            if (!dailyBudget || isNaN(Number(dailyBudget))) {
                return NextResponse.json({ error: 'Daily budget is required for Priority campaigns' }, { status: 400 })
            }
            payload.budget = {
                dailyBudget: {
                    value: String(Number(dailyBudget).toFixed(2)),
                    currency: marketplaceId === 'EBAY_GB' ? 'GBP' : marketplaceId === 'EBAY_AU' ? 'AUD' : 'USD',
                },
            }
        }

        const res = await fetch(`${MARKETING_BASE}/ad_campaign`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const err = await res.text()
            throw new Error(`eBay create campaign failed (${res.status}): ${err}`)
        }

        const location = res.headers.get('location') ?? ''
        const campaignId = location.split('/').pop() ?? ''

        const row = {
            user_id: user.id,
            campaign_id: campaignId,
            campaign_name: payload.campaignName,
            campaign_type: type,
            funding_model: isCPS ? 'COST_PER_SALE' : 'COST_PER_CLICK',
            status: 'RUNNING',
            bid_percentage: isCPS ? Number(bidPercentage) : null,
            daily_budget: !isCPS ? Number(dailyBudget) : null,
            marketplace_id: marketplaceId,
            start_date: payload.startDate,
            end_date: endDate ?? null,
            notes: notes?.trim() || null,
            ad_rate_strategy: adRateStrategy,
            bid_adjustment_pct: bidAdjustmentPct ? Number(bidAdjustmentPct) : null,
            max_ad_rate: maxAdRate ? Number(maxAdRate) : null,
            auto_enroll: Boolean(autoEnroll),
            impressions: 0,
            clicks: 0,
            items_sold: 0,
            sales_amount: 0,
            ad_fees_amount: 0,
            roas: null,
            synced_at: new Date().toISOString(),
        }

        const { data: inserted, error: dbErr } = await (sb.from('promotion_campaigns') as any)
            .upsert(row, { onConflict: 'user_id,campaign_id' })
            .select()
            .single()

        if (dbErr) throw dbErr

        return NextResponse.json({ campaign: inserted, campaignId })
    } catch (e: any) {
        console.error('[promotions/campaigns POST]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// ── PATCH /api/ebay/promotions/campaigns ─────────────────────────────────────
// Update local-only fields: notes, auto_enroll, max_ad_rate, bid_adjustment_pct
// Body: { campaignId, notes?, autoEnroll?, maxAdRate?, bidAdjustmentPct?, adRateStrategy? }
export async function PATCH(req: NextRequest) {
    try {
        const user = await getUser()
        const sb = supabase()
        const { campaignId, ...fields } = await req.json()

        if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })

        const updates: Record<string, any> = { updated_at: new Date().toISOString() }
        if (fields.notes !== undefined) updates.notes = fields.notes
        if (fields.autoEnroll !== undefined) updates.auto_enroll = fields.autoEnroll
        if (fields.maxAdRate !== undefined) updates.max_ad_rate = fields.maxAdRate
        if (fields.bidAdjustmentPct !== undefined) updates.bid_adjustment_pct = fields.bidAdjustmentPct
        if (fields.adRateStrategy !== undefined) updates.ad_rate_strategy = fields.adRateStrategy

        const { data, error } = await (sb.from('promotion_campaigns') as any)
            .update(updates)
            .eq('user_id', user.id)
            .eq('campaign_id', campaignId)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ campaign: data })
    } catch (e: any) {
        console.error('[promotions/campaigns PATCH]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
