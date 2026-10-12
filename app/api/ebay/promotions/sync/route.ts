// app/api/ebay/promotions/sync/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST — sync all campaigns + their ads from eBay into local DB
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEbayToken } from '@/lib/ebay-auth'

const MARKETING_BASE = 'https://api.ebay.com/sell/marketing/v1'

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

export async function POST(_req: NextRequest) {
    try {
        const user = await getUser()
        const sb = supabase()
        const token = await getEbayToken(user.id)

        // ── 1. Fetch all campaigns ──────────────────────────────────────────────
        let allCampaigns: any[] = []
        let offset = 0
        const limit = 200

        while (true) {
            const res = await fetch(
                `${MARKETING_BASE}/ad_campaign?limit=${limit}&offset=${offset}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (!res.ok) {
                if (res.status === 403) {
                    return NextResponse.json({
                        error: 'eBay Marketing scope not granted. Please reconnect your eBay account to enable Promoted Listings.',
                        scopeError: true,
                    }, { status: 403 })
                }
                const err = await res.text()
                throw new Error(`eBay campaigns list failed (${res.status}): ${err}`)
            }
            const json = await res.json()
            const batch = json.campaigns ?? []
            allCampaigns = allCampaigns.concat(batch)
            if (batch.length < limit) break
            offset += limit
        }

        // ── 2. Upsert campaigns ─────────────────────────────────────────────────
        if (allCampaigns.length > 0) {
            const campRows = allCampaigns.map((c: any) => ({
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
                .upsert(campRows, { onConflict: 'user_id,campaign_id' })
        }

        // ── 3. Fetch ads for active campaigns ───────────────────────────────────
        const activeCampaigns = allCampaigns.filter(
            (c: any) => ['RUNNING', 'PAUSED'].includes(c.campaignStatus)
        )

        let totalAds = 0
        for (const camp of activeCampaigns) {
            try {
                let adOffset = 0
                const adLimit = 200

                while (true) {
                    const res = await fetch(
                        `${MARKETING_BASE}/ad_campaign/${camp.campaignId}/ad?limit=${adLimit}&offset=${adOffset}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    if (!res.ok) break

                    const json = await res.json()
                    const ads: any[] = json.ads ?? []

                    if (ads.length > 0) {
                        const adRows = ads.map((a: any) => ({
                            user_id: user.id,
                            campaign_id: camp.campaignId,
                            ad_id: a.adId,
                            listing_id: a.listingId,
                            listing_title: a.listingTitle ?? null,
                            bid_percentage: a.bidPercentage ? parseFloat(a.bidPercentage) : null,
                            status: a.adStatus ?? 'ACTIVE',
                            synced_at: new Date().toISOString(),
                        }))
                        await (sb.from('promotion_ads') as any)
                            .upsert(adRows, { onConflict: 'user_id,campaign_id,listing_id' })
                        totalAds += ads.length
                    }

                    if (ads.length < adLimit) break
                    adOffset += adLimit
                }
            } catch { /* skip individual campaign ad-fetch errors */ }
        }

        // ── 4. Update ad_count on campaigns ────────────────────────────────────
        for (const camp of activeCampaigns) {
            const { count } = await (sb.from('promotion_ads') as any)
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('campaign_id', camp.campaignId)
            await (sb.from('promotion_campaigns') as any)
                .update({ ad_count: count ?? 0 })
                .eq('user_id', user.id)
                .eq('campaign_id', camp.campaignId)
        }

        return NextResponse.json({
            ok: true,
            campaigns: allCampaigns.length,
            ads: totalAds,
        })
    } catch (e: any) {
        console.error('[promotions/sync POST]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
