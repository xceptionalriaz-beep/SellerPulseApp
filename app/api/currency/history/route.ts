// app/api/currency/history/route.ts
// Server-side proxy for historical exchange rates
// Usage: GET /api/currency/history?from=USD&to=GBP&days=30

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get('from') ?? 'USD'
    const to = req.nextUrl.searchParams.get('to') ?? 'GBP'
    const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30')

    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    const fmt = (d: Date) => d.toISOString().split('T')[0]

    try {
        const res = await fetch(
            `https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=${from}&to=${to}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        )
        const data = await res.json()

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            }
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch historical rates' }, { status: 500 })
    }
}
