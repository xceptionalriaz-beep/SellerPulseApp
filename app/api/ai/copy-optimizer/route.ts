// app/api/ai/copy-optimizer/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Copy Optimizer
//
// Rewrites the text fields of a single visual-editor block for higher eBay
// conversion. Priority: Anthropic → Gemini → 503.
//
// POST body:
//   fields   — { [fieldName]: currentText }  (extracted from block props)
//   blockType — e.g. 'heading', 'paragraph', 'bullet_list'
//   category  — template category e.g. 'electronics' (optional, improves prompt)
//
// Response (200):
//   { result: { [fieldName]: optimizedText }, provider: 'anthropic' | 'gemini' }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Fetch AI key from API Vault ───────────────────────────────────────────────
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

// ── Build the optimization prompt ─────────────────────────────────────────────
function buildPrompt(
    fields: Record<string, string>,
    blockType: string,
    category: string
): string {
    const fieldList = Object.entries(fields)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n')

    return `You are an expert eBay listing copywriter specializing in high-conversion product descriptions.

Block type: ${blockType}
Product category: ${category || 'general'}

Rewrite the following text fields to maximize eBay conversion. Rules:
- Keep each field concise, benefit-focused, and buyer-reassuring
- eBay-compliant: no all-caps spam, no excessive punctuation, no HTML tags
- Preserve template tokens like {{BRAND}}, {{PRODUCT_TITLE}}, {{PRICE}} EXACTLY as-is
- Match the tone and intent of the original — don't invent facts
- Return ONLY a valid JSON object with the same keys and improved string values
- No explanation, no markdown fences, just the JSON object

Fields to optimize:
${fieldList}`
}

// ── Call Anthropic ────────────────────────────────────────────────────────────
async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    return data.content?.[0]?.text?.trim() ?? ''
}

// ── Call Gemini ───────────────────────────────────────────────────────────────
async function callGemini(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 1500, temperature: 0.6 },
            }),
            signal: AbortSignal.timeout(25_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

// ── Strip JSON out of a raw AI response (handles markdown fences) ─────────────
function parseJsonResult(raw: string): Record<string, string> {
    const clean = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

    // Find first { ... } block
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON object found in response')
    return JSON.parse(clean.slice(start, end + 1))
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    let body: { fields?: Record<string, string>; blockType?: string; category?: string }
    try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

    const { fields = {}, blockType = 'unknown', category = 'general' } = body

    const fieldEntries = Object.entries(fields).filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    if (fieldEntries.length === 0) {
        return NextResponse.json({ error: 'No text fields provided' }, { status: 400 })
    }

    const prompt = buildPrompt(Object.fromEntries(fieldEntries), blockType, category)

    // ── Try Anthropic ─────────────────────────────────────────────────────────
    const anthropicKey = (await getAiKey('anthropic')) ?? process.env.ANTHROPIC_API_KEY ?? null
    if (anthropicKey) {
        try {
            const raw = await callAnthropic(anthropicKey, prompt)
            if (raw) {
                const result = parseJsonResult(raw)
                await trackUsage('anthropic')
                return NextResponse.json({ result, provider: 'anthropic' })
            }
        } catch (e) {
            console.warn('[copy-optimizer] Anthropic failed, trying Gemini:', e)
        }
    }

    // ── Try Gemini ────────────────────────────────────────────────────────────
    const geminiKey = (await getAiKey('gemini')) ?? process.env.GEMINI_API_KEY ?? null
    if (geminiKey) {
        try {
            const raw = await callGemini(geminiKey, prompt)
            if (raw) {
                const result = parseJsonResult(raw)
                await trackUsage('gemini')
                return NextResponse.json({ result, provider: 'gemini' })
            }
        } catch (e) {
            console.warn('[copy-optimizer] Gemini failed:', e)
        }
    }

    return NextResponse.json(
        { error: 'AI Copy Optimizer is temporarily unavailable. Check your API Vault keys.', code: 'NO_AI_KEY' },
        { status: 503 }
    )
}
