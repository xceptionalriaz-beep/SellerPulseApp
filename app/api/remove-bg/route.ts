// app/api/remove-bg/route.ts
// ─────────────────────────────────────────────────────────────
// Riazify AI Studio — Background Removal Proxy v2.0
//
// Forwards to Railway FastAPI (BiRefNet-lite + full pipeline):
//   - BiRefNet-lite removes background
//   - Edge refinement removes halos
//   - Auto-crop + center with 5% padding
//   - Drop shadow
//   - 1600×1600px minimum (eBay standard)
//   - Unsharp mask sharpening
//   - Returns JPEG (smaller, eBay-compatible)
//
// Secret never reaches browser — all via server.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

const BG_SERVICE_URL = process.env.BG_REMOVAL_SERVICE_URL
const BG_SERVICE_SECRET = process.env.BG_SERVICE_SECRET

// Retry config for Railway cold starts
const MAX_RETRIES = 3
const RETRY_DELAYS = [3000, 6000, 9000] // ms between retries
const REQUEST_TIMEOUT = 120_000            // 2 min per attempt

export async function POST(req: NextRequest) {

    // ── Validate env ─────────────────────────────────────────
    if (!BG_SERVICE_URL || !BG_SERVICE_SECRET) {
        return NextResponse.json(
            { error: 'BG service not configured. Add BG_REMOVAL_SERVICE_URL + BG_SERVICE_SECRET to .env' },
            { status: 503 }
        )
    }

    // ── Parse body ───────────────────────────────────────────
    let imageUrl: string
    let skipPipeline = false
    try {
        const body = await req.json()
        imageUrl = body.imageUrl
        skipPipeline = body.pipeline === false
        if (!imageUrl || typeof imageUrl !== 'string') throw new Error('Missing imageUrl')
    } catch {
        return NextResponse.json({ error: 'Send JSON: { imageUrl: "https://..." }' }, { status: 400 })
    }

    // ── Warmup ping (non-blocking, wakes Railway if sleeping) ─
    fetch(`${BG_SERVICE_URL}/warmup`, {
        headers: { 'x-api-secret': BG_SERVICE_SECRET },
        signal: AbortSignal.timeout(5000),
    }).catch(() => { })

    // ── Call Railway service with retries ────────────────────
    let lastError = ''

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt - 1]))
            console.log(`[remove-bg] Retry ${attempt}/${MAX_RETRIES - 1}`)
        }

        try {
            const form = new FormData()
            form.append('image_url', imageUrl)
            // Pass pipeline=false to skip post-process (returns transparent PNG)
            if (skipPipeline) form.append('pipeline', 'false')

            const res = await fetch(`${BG_SERVICE_URL}/remove-bg`, {
                method: 'POST',
                headers: { 'x-api-secret': BG_SERVICE_SECRET },
                body: form,
                signal: AbortSignal.timeout(REQUEST_TIMEOUT),
            })

            // Retry on cold-start errors
            if (res.status === 502 || res.status === 503 || res.status === 504) {
                lastError = `Service unavailable (${res.status})`
                continue
            }

            if (!res.ok) {
                const errText = await res.text().catch(() => res.statusText)
                console.error('[remove-bg] Error:', res.status, errText)
                return NextResponse.json(
                    { error: `BG removal failed: ${res.statusText}` },
                    { status: res.status }
                )
            }

            // ── Return image ──────────────────────────────────
            const buffer = await res.arrayBuffer()
            const contentType = res.headers.get('content-type') ?? 'image/jpeg'
            const procTime = res.headers.get('x-processing-time') ?? ''
            const pipeline = res.headers.get('x-pipeline') ?? 'full'

            console.log(`[remove-bg] ✓ ${(buffer.byteLength / 1024).toFixed(0)}KB | ${procTime} | pipeline=${pipeline}`)

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-store',
                    'X-Processing-Time': procTime,
                    'X-Pipeline': pipeline,
                },
            })

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown'
            lastError = msg
            if (msg.includes('timeout') || msg.includes('abort')) {
                lastError = 'Timed out'
                break // don't retry timeouts
            }
            // Network error — retry
        }
    }

    console.error('[remove-bg] All attempts failed:', lastError)

    if (lastError.includes('Timed out')) {
        return NextResponse.json(
            { error: 'Background removal timed out. Try a smaller image.' },
            { status: 504 }
        )
    }
    return NextResponse.json(
        { error: 'Background removal service unavailable. Try again in a moment.' },
        { status: 503 }
    )
}
