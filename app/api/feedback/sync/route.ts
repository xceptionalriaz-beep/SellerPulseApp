// app/api/feedback/sync/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/feedback/sync
// Calls eBay GetFeedback Trading API → upserts rows into feedback_items.
// Paginates through all pages (200/page) until no more results.
//
// GET /api/feedback/sync
// Returns the last 200 synced feedback rows for the current user.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient as createServerClient } from '@supabase/supabase-js'
import { createServerClient as createSsrClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getEbayToken } from '@/lib/ebay-auth'

const adminDb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const EBAY_TRADING_API = 'https://api.ebay.com/ws/api.dll'

// ── Get current user ──────────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const supabase = createSsrClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
}

// ── Build GetFeedback XML ─────────────────────────────────────
function buildGetFeedbackXml(token: string, page: number): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<GetFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${token}</eBayAuthToken>
  </RequesterCredentials>
  <FeedbackType>FeedbackReceived</FeedbackType>
  <DetailLevel>ReturnAll</DetailLevel>
  <Pagination>
    <EntriesPerPage>200</EntriesPerPage>
    <PageNumber>${page}</PageNumber>
  </Pagination>
</GetFeedbackRequest>`
}

// ── Parse XML field helper ────────────────────────────────────
function xmlVal(xml: string, tag: string): string {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    return m ? m[1].trim() : ''
}

function xmlAll(xml: string, tag: string): string[] {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
    const results: string[] = []
    let match
    while ((match = re.exec(xml)) !== null) results.push(match[1].trim())
    return results
}

// ── Parse a single FeedbackDetail block ──────────────────────
function parseFeedbackDetail(block: string) {
    const raw = (t: string) => xmlVal(block, t)
    const commentTimeStr = raw('CommentTime')
    return {
        feedback_id: raw('FeedbackID'),
        item_id: raw('ItemID') || null,
        item_title: raw('ItemTitle') || null,
        transaction_id: raw('TransactionID') || null,
        comment_type: raw('CommentType') || 'Neutral',
        commenting_user: raw('CommentingUser') || null,
        comment_text: raw('Comment') || null,
        role: raw('Role') || null,
        feedback_time: commentTimeStr ? new Date(commentTimeStr).toISOString() : null,
        feedback_response: raw('FeedbackResponse') || null,
    }
}

// ── POST — sync from eBay ─────────────────────────────────────
export async function POST(req: NextRequest) {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let accessToken: string
    try {
        accessToken = await getEbayToken(userId)
    } catch (err: any) {
        return NextResponse.json({ error: err.message, notConnected: true }, { status: 400 })
    }

    const allItems: ReturnType<typeof parseFeedbackDetail>[] = []
    let page = 1
    let totalPages = 1

    // Paginate through all feedback
    while (page <= totalPages) {
        const xml = buildGetFeedbackXml(accessToken, page)
        const res = await fetch(EBAY_TRADING_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'GetFeedback',
                'X-EBAY-API-SITEID': '0',
            },
            body: xml,
        })

        if (!res.ok) {
            return NextResponse.json({ error: `eBay API ${res.status}` }, { status: 502 })
        }

        const body = await res.text()

        // Check for API-level errors
        const ack = xmlVal(body, 'Ack')
        if (ack === 'Failure') {
            const errMsg = xmlVal(body, 'LongMessage') || xmlVal(body, 'ShortMessage') || 'eBay error'
            return NextResponse.json({ error: errMsg }, { status: 502 })
        }

        // Parse total pages on first call
        if (page === 1) {
            const tp = xmlVal(body, 'TotalNumberOfPages')
            totalPages = tp ? parseInt(tp) : 1
        }

        // Extract all FeedbackDetail blocks
        const blocks = xmlAll(body, 'FeedbackDetail')
        for (const block of blocks) {
            const item = parseFeedbackDetail(block)
            if (item.feedback_id) allItems.push(item)
        }

        page++
    }

    if (allItems.length === 0) {
        return NextResponse.json({ synced: 0, message: 'No feedback found' })
    }

    // Upsert into feedback_items
    const rows = allItems.map(item => ({
        ...item,
        user_id: userId,
        synced_at: new Date().toISOString(),
    }))

    const { error: upsertErr } = await adminDb
        .from('feedback_items')
        .upsert(rows, { onConflict: 'user_id,feedback_id', ignoreDuplicates: false })

    if (upsertErr) {
        console.error('[feedback/sync] upsert error:', upsertErr)
        return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }

    return NextResponse.json({ synced: allItems.length })
}

// ── GET — return stored feedback rows ─────────────────────────
export async function GET(req: NextRequest) {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await adminDb
        .from('feedback_items')
        .select('*')
        .eq('user_id', userId)
        .order('feedback_time', { ascending: false })
        .limit(500)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data ?? [] })
}
