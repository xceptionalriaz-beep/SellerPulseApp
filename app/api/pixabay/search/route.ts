// app/api/pixabay/search/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pixabay image search proxy
// Fetches the API key server-side from api_fleet_config — never exposed to client
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()
    const page = searchParams.get('page') ?? '1'

    if (!q) {
        return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    }

    // ── Fetch key from Supabase server-side ───────────────────────────────────
    const { data: row } = await supabase
        .from('api_fleet_config')
        .select('primary_key_1')
        .eq('platform_name', 'pixabay')
        .single() as { data: { primary_key_1: string } | null }

    const apiKey = row?.primary_key_1?.trim()

    if (!apiKey) {
        return NextResponse.json({ error: 'Pixabay API key not configured' }, { status: 503 })
    }

    // ── Proxy request to Pixabay ──────────────────────────────────────────────
    try {
        const url = new URL('https://pixabay.com/api/')
        url.searchParams.set('key', apiKey)
        url.searchParams.set('q', q)
        url.searchParams.set('page', page)
        url.searchParams.set('per_page', '200')
        url.searchParams.set('image_type', 'photo')
        url.searchParams.set('safesearch', 'true')
        url.searchParams.set('order', 'popular')
        url.searchParams.set('min_width', '640')
        url.searchParams.set('min_height', '400')

        const res = await fetch(url.toString())

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Pixabay search failed' },
                { status: res.status }
            )
        }

        const data = await res.json()

        return NextResponse.json({
            hits: data.hits ?? [],
            totalHits: data.totalHits ?? 0,
        })
    } catch {
        return NextResponse.json({ error: 'Search request failed' }, { status: 500 })
    }
}
