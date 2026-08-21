// app/api/remove-bg/route.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Background Removal Proxy
//
// Receives an image URL from the frontend, fetches it server-side,
// forwards to our self-hosted FastAPI service, and returns the
// transparent PNG back to the client.
//
// The BG service URL and secret never reach the browser.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

const BG_SERVICE_URL = process.env.BG_REMOVAL_SERVICE_URL
const BG_SERVICE_SECRET = process.env.BG_SERVICE_SECRET

export async function POST(req: NextRequest) {
    // ── Validate env vars ────────────────────────────────────
    if (!BG_SERVICE_URL || !BG_SERVICE_SECRET) {
        return NextResponse.json(
            { error: 'Background removal service not configured. Add BG_REMOVAL_SERVICE_URL and BG_SERVICE_SECRET to .env' },
            { status: 503 }
        )
    }

    // ── Parse request ────────────────────────────────────────
    let imageUrl: string
    try {
        const body = await req.json()
        imageUrl = body.imageUrl
        if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('Missing imageUrl')
        }
    } catch {
        return NextResponse.json({ error: 'Send JSON body: { imageUrl: "https://..." }' }, { status: 400 })
    }

    // ── Forward to BG removal service ───────────────────────
    try {
        // Build multipart form
        const formData = new FormData()
        formData.append('image_url', imageUrl)
        // Use white background — eBay requires white BG on cover photos
        formData.append('bg_color', '255,255,255')

        const serviceRes = await fetch(`${BG_SERVICE_URL}/remove-bg`, {
            method: 'POST',
            headers: {
                'x-api-secret': BG_SERVICE_SECRET,
            },
            body: formData,
            // 60 second timeout for large images
            signal: AbortSignal.timeout(60_000),
        })

        if (!serviceRes.ok) {
            const errText = await serviceRes.text()
            console.error('[remove-bg] Service error:', serviceRes.status, errText)
            return NextResponse.json(
                { error: `BG removal failed: ${serviceRes.statusText}` },
                { status: serviceRes.status }
            )
        }

        // ── Return the PNG to the client ─────────────────────
        const pngBuffer = await serviceRes.arrayBuffer()
        return new NextResponse(pngBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store',
            },
        })

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[remove-bg] Error:', message)

        if (message.includes('timeout') || message.includes('abort')) {
            return NextResponse.json({ error: 'Background removal timed out. Try a smaller image.' }, { status: 504 })
        }

        return NextResponse.json({ error: 'Background removal failed. Is the service running?' }, { status: 500 })
    }
}
