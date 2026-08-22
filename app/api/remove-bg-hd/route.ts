// app/api/remove-bg-hd/route.ts
// ─────────────────────────────────────────────────────────────
// Riazify — HD Background Removal (remove.bg API)
//
// User saves their remove.bg API key in api_fleet_config.
// This route fetches it, calls remove.bg, returns white-bg PNG.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    // ── Parse request ────────────────────────────────────────
    let imageUrl: string
    let userId: string
    try {
        const body = await req.json()
        imageUrl = body.imageUrl
        userId = body.userId
        if (!imageUrl || !userId) throw new Error('Missing imageUrl or userId')
    } catch {
        return NextResponse.json({ error: 'Send JSON: { imageUrl, userId }' }, { status: 400 })
    }

    // ── Fetch user's remove.bg API key from api_fleet_config ─
    const { data: config, error } = await supabaseAdmin
        .from('api_fleet_config')
        .select('primary_key_1, status')
        .eq('platform_name', 'remove_bg')
        .single()

    if (error || !config) {
        return NextResponse.json({ error: 'remove.bg not configured in API Vault' }, { status: 503 })
    }

    if (config.status === 'disconnected' || config.primary_key_1 === 'EMPTY' || !config.primary_key_1) {
        return NextResponse.json({
            error: 'remove.bg API key not set. Go to API Vault → remove.bg and add your key.',
            code: 'NO_API_KEY'
        }, { status: 402 })
    }

    const apiKey = config.primary_key_1

    // ── Call remove.bg API ───────────────────────────────────
    try {
        const formData = new FormData()
        formData.append('image_url', imageUrl)
        formData.append('size', 'auto')
        formData.append('bg_color', 'ffffff') // white background for eBay compliance
        formData.append('format', 'png')

        const res = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
            signal: AbortSignal.timeout(60_000),
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('[remove-bg-hd] remove.bg error:', res.status, errText)

            // Handle specific errors
            if (res.status === 402) {
                return NextResponse.json({
                    error: 'remove.bg credits exhausted. Top up at remove.bg/dashboard.',
                    code: 'NO_CREDITS'
                }, { status: 402 })
            }
            if (res.status === 403) {
                return NextResponse.json({
                    error: 'Invalid remove.bg API key. Check API Vault → remove.bg.',
                    code: 'INVALID_KEY'
                }, { status: 403 })
            }
            return NextResponse.json({ error: `remove.bg error: ${res.statusText}` }, { status: res.status })
        }

        // ── Update usage count in api_fleet_config ───────────
        await supabaseAdmin
            .from('api_fleet_config')
            .update({
                rate_limit_used: (config as any).rate_limit_used ? (config as any).rate_limit_used + 1 : 1,
                last_used_at: new Date().toISOString(),
                status: 'connected',
            })
            .eq('platform_name', 'remove_bg')

        // ── Return PNG ────────────────────────────────────────
        const pngBuffer = await res.arrayBuffer()
        const credits = res.headers.get('X-Credits-Charged')

        return new NextResponse(pngBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store',
                'X-Credits-Used': credits ?? '1',
            },
        })

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('[remove-bg-hd] Error:', message)
        if (message.includes('timeout') || message.includes('abort')) {
            return NextResponse.json({ error: 'remove.bg timed out. Try a smaller image.' }, { status: 504 })
        }
        return NextResponse.json({ error: 'HD background removal failed.' }, { status: 500 })
    }
}
