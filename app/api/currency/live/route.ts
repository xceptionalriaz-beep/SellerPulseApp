// app/api/currency/live/route.ts
// Server-side proxy for live exchange rates
// Usage: GET /api/currency/live?from=USD

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get('from') ?? 'USD'

    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })
        const data = await res.json()

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            }
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch live rates' }, { status: 500 })
    }
}
