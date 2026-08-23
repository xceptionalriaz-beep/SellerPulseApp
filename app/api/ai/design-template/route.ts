// app/api/ai/design-template/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Design Template Generator
//
// Generates a full eBay-safe HTML listing template from a user prompt.
// Priority: Anthropic → Gemini → env fallback
// Reads keys from api_fleet_config table (API Vault)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Build the template generation prompt ─────────────────────────────────────
function buildPrompt(userPrompt: string): string {
    return `You are an eBay listing template designer for Riazify. Create a professional HTML email-safe listing description template.

Request: ${userPrompt}

STRICT RULES — follow every one:
- Table-based layout ONLY (no div, no flexbox, no grid)
- Inline CSS only — no <style> tags, no external stylesheets
- No JavaScript of any kind
- No external fonts or resources
- Include placeholder text: [PRODUCT_NAME], [DESCRIPTION], [PRICE], [FEATURE_1], [FEATURE_2], [FEATURE_3]
- Primary brand color: #7530fb (Electric Violet)
- Accent color: #b8fa33 (Soft Lime)
- Dark color: #1e1535 (Deep Purple)
- Use Arial, sans-serif for all fonts
- Mobile-friendly: max width 600px, single column on small screens
- Must include: header section, feature bullets, at least one trust badge row, footer
- eBay-safe HTML only: table, tr, td, p, h1, h2, h3, ul, li, strong, em, br, img, a
- Return ONLY the HTML — no explanation, no markdown, no backticks`
}

// ── Fetch AI key from API Vault ──────────────────────────────────────────────
async function getAiKey(platform: string): Promise<string | null> {
    const { data } = await supabaseAdmin
        .from('api_fleet_config')
        .select('primary_key_1, status')
        .eq('platform_name', platform)
        .single()

    if (!data || data.status === 'disconnected' || !data.primary_key_1 || data.primary_key_1 === 'EMPTY') {
        return null
    }
    return data.primary_key_1
}

// ── Track usage ──────────────────────────────────────────────────────────────
async function trackUsage(platform: string) {
    try {
        await supabaseAdmin
            .from('api_fleet_config')
            .update({ last_used_at: new Date().toISOString() })
            .eq('platform_name', platform)
    } catch { /* non-fatal */ }
}

// ── Anthropic Claude ─────────────────────────────────────────────────────────
async function generateWithAnthropic(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    return data.content?.[0]?.text?.trim() || ''
}

// ── Google Gemini ─────────────────────────────────────────────────────────────
async function generateWithGemini(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(30_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
}

// ── Sanitise output — strip dangerous tags ────────────────────────────────────
function sanitiseTemplate(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:[^"']*/gi, '')
        .trim()
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}))
    const { prompt } = body as { prompt?: string }

    if (!prompt || prompt.trim().length < 5) {
        return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const fullPrompt = buildPrompt(prompt.trim())

    // ── Try Anthropic first ──────────────────────────────────────────────────
    const anthropicKey = (await getAiKey('anthropic')) ?? process.env.ANTHROPIC_API_KEY

    if (anthropicKey) {
        try {
            const raw = await generateWithAnthropic(anthropicKey, fullPrompt)
            if (raw) {
                await trackUsage('anthropic')
                return NextResponse.json({ html: sanitiseTemplate(raw), provider: 'anthropic' })
            }
        } catch (e) {
            console.warn('[design-template] Anthropic failed, trying Gemini:', e)
        }
    }

    // ── Fallback to Gemini ───────────────────────────────────────────────────
    const geminiKey = (await getAiKey('gemini')) ?? process.env.GEMINI_API_KEY

    if (geminiKey) {
        try {
            const raw = await generateWithGemini(geminiKey, fullPrompt)
            if (raw) {
                await trackUsage('gemini')
                return NextResponse.json({ html: sanitiseTemplate(raw), provider: 'gemini' })
            }
        } catch (e) {
            console.warn('[design-template] Gemini failed:', e)
        }
    }

    return NextResponse.json(
        { error: 'No AI provider connected. Go to API Vault → Anthropic or Gemini and add your key.' },
        { status: 503 }
    )
}
