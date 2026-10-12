// app/api/ebay/promotions/campaigns/end/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// PATCH — end (or pause) a campaign on eBay + update local status
// Body: { campaignId, action: 'end' | 'pause' | 'resume' }
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

export async function PATCH(req: NextRequest) {
    try {
        const user = await getUser()
        const sb = supabase()
        const { campaignId, action } = await req.json()

        if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })

        const token = await getEbayToken(user.id)

        // Map action → eBay endpoint segment + new local status
        const actionMap: Record<string, { endpoint: string; status: string }> = {
            end: { endpoint: 'end', status: 'ENDED' },
            pause: { endpoint: 'pause', status: 'PAUSED' },
            resume: { endpoint: 'resume', status: 'RUNNING' },
        }

        const mapped = actionMap[action]
        if (!mapped) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

        const res = await fetch(
            `${MARKETING_BASE}/ad_campaign/${campaignId}/${mapped.endpoint}`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Length': '0' },
            }
        )

        if (!res.ok) {
            const err = await res.text()
            throw new Error(`eBay campaign ${action} failed (${res.status}): ${err}`)
        }

        // Update local status
        await (sb.from('promotion_campaigns') as any)
            .update({ status: mapped.status, synced_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('campaign_id', campaignId)

        return NextResponse.json({ ok: true, status: mapped.status })
    } catch (e: any) {
        console.error('[promotions/campaigns/end PATCH]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
