// app/api/ai/photo-studio/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Photo Studio
//
// Generates a product image with DALL-E 3 and stores it permanently in
// Supabase storage. The file path is deterministic (keyed by blockId) so
// re-generating for the same block REPLACES the old image rather than
// creating a new one — no storage bloat.
//
// POST body:
//   prompt    — user's image description
//   style     — 'product' | 'white-bg' | 'lifestyle' | 'infographic'
//   blockId   — used to build the deterministic storage path
//   blockType — e.g. 'image_block', 'hero' (adds context to prompt)
//   category  — template category e.g. 'electronics'
//
// Response (200):
//   { url: string, revisedPrompt: string, provider: 'openai' }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUserId, deductCredits } from '@/lib/ai/credits'

const BUCKET = 'ai-photos'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── API Vault ─────────────────────────────────────────────────────────────────
async function getAiKey(platform: string): Promise<string | null> {
    const { data } = await supabaseAdmin
        .from('api_fleet_config')
        .select('primary_key_1, status')
        .eq('platform_name', platform)
        .single()
    if (!data || data.status === 'disconnected' || !data.primary_key_1 || data.primary_key_1 === 'EMPTY') return null
    return data.primary_key_1
}

async function trackUsage(platform: string) {
    try {
        await supabaseAdmin
            .from('api_fleet_config')
            .update({ last_used_at: new Date().toISOString() })
            .eq('platform_name', platform)
    } catch { /* non-fatal */ }
}

// ── Style modifiers ───────────────────────────────────────────────────────────
const STYLE_SUFFIX: Record<string, string> = {
    'product': 'professional product photography, studio lighting, clean background, sharp focus, high resolution, commercial quality',
    'white-bg': 'isolated on pure white background, professional product photography, no shadows, clean and minimal',
    'lifestyle': 'lifestyle photography, natural light, in-use setting, warm and aspirational, editorial style',
    'infographic': 'clean flat-design infographic, bold icons, minimal color palette, professional layout, white background',
    'detail': 'extreme close-up macro photography, razor-sharp focus on texture and material detail, soft studio lighting, shallow depth of field, high resolution',
    'dark-studio': 'dramatic dark background, professional studio lighting with rim light and edge highlights, sleek and premium feel, high contrast, luxury product photography',
    'in-box': 'product displayed inside its open retail packaging box, clean studio background, professional product photography, trust-building presentation, sharp focus',
}

// ── Build enhanced DALL-E prompt ──────────────────────────────────────────────
function buildDallePrompt(userPrompt: string, style: string, category: string): string {
    const styleSuffix = STYLE_SUFFIX[style] ?? STYLE_SUFFIX['product']
    const catHint = category && category !== 'general' ? ` for ${category} product` : ''
    return `${userPrompt}${catHint}. ${styleSuffix}. eBay product listing image. No text overlays, no watermarks.`
}

// ── Ensure bucket exists (idempotent) ─────────────────────────────────────────
async function ensureBucket() {
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10 MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    })
    // Ignore "already exists" error
    if (error && !error.message.includes('already exists')) {
        console.warn('[photo-studio] bucket create warning:', error.message)
    }
}

// ── Sanitize block ID for use as a filename ───────────────────────────────────
function safeFilename(blockId: string): string {
    return blockId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    let body: {
        prompt?: string
        style?: string
        blockId?: string
        blockType?: string
        category?: string
    }
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
        prompt = '',
        style = 'product',
        blockId = 'block',
        category = 'general',
    } = body

    if (!prompt.trim()) {
        return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 })
    }

    // ── Credit check + deduction ──────────────────────────────────────────────
    const userId = await getAuthUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Please sign in to use AI features.' }, { status: 401 })
    }
    const credit = await deductCredits(userId, 'ai_photo_studio', blockId)
    if (!credit.ok) return credit.response

    // ── Get OpenAI key ────────────────────────────────────────────────────────
    const openaiKey = (await getAiKey('openai')) ?? process.env.OPENAI_API_KEY ?? null
    if (!openaiKey) {
        return NextResponse.json(
            { error: 'AI Photo Studio is currently unavailable. Please try again later.', code: 'NO_AI_KEY' },
            { status: 503 }
        )
    }

    const dallePrompt = buildDallePrompt(prompt.trim(), style, category)

    // ── Call DALL-E 3 ─────────────────────────────────────────────────────────
    let tempImageUrl: string
    let revisedPrompt: string

    try {
        const genRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: dallePrompt,
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                response_format: 'url',
            }),
            signal: AbortSignal.timeout(45_000),
        })

        if (!genRes.ok) {
            const err = await genRes.json().catch(() => ({}))
            console.error('[photo-studio] DALL-E error:', err)
            const msg = err?.error?.message ?? `DALL-E returned ${genRes.status}`
            return NextResponse.json(
                { error: 'Image generation failed. ' + (genRes.status === 400 ? 'Try rephrasing your prompt.' : 'Please try again.') },
                { status: 502 }
            )
        }

        const genData = await genRes.json()
        tempImageUrl = genData.data?.[0]?.url
        revisedPrompt = genData.data?.[0]?.revised_prompt ?? dallePrompt

        if (!tempImageUrl) throw new Error('No image URL in DALL-E response')

    } catch (e) {
        console.error('[photo-studio] Generation error:', e)
        return NextResponse.json(
            { error: 'Image generation failed. Please try again.' },
            { status: 502 }
        )
    }

    // ── Fetch the image bytes ─────────────────────────────────────────────────
    let imageBuffer: ArrayBuffer
    try {
        const imgRes = await fetch(tempImageUrl, { signal: AbortSignal.timeout(30_000) })
        if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}`)
        imageBuffer = await imgRes.arrayBuffer()
    } catch (e) {
        console.error('[photo-studio] Image fetch error:', e)
        return NextResponse.json(
            { error: 'Could not retrieve the generated image. Please try again.' },
            { status: 502 }
        )
    }

    // ── Upload to Supabase storage (upsert = replace same block's image) ──────
    await ensureBucket()

    const filename = `${safeFilename(blockId)}.png`
    const filePath = `blocks/${filename}`

    const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, imageBuffer, {
            contentType: 'image/png',
            upsert: true,   // ← replaces existing file for this block
            cacheControl: '3600',
        })

    if (uploadError) {
        console.error('[photo-studio] Upload error:', uploadError)
        return NextResponse.json(
            { error: 'Could not save the generated image. Please try again.' },
            { status: 500 }
        )
    }

    // ── Get permanent public URL ──────────────────────────────────────────────
    const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filePath)

    await trackUsage('openai')

    // Return the clean URL (no cache-buster — that's added client-side for preview)
    return NextResponse.json({
        url: publicUrl,
        revisedPrompt,
        provider: 'openai',
    })
}
