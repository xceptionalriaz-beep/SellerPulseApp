// app/api/generate-description/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Description Generator
//
// Priority: Anthropic → Gemini → env fallback
// Reads keys from api_fleet_config table (API Vault)
// Smart prompt — minimal tokens, maximum eBay-optimised output
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Smart eBay prompt — tight and output-focused ─────────────────────────────
// Key insight: less instruction = less token waste. Tell it FORMAT not process.
function buildPrompt(title: string, category: string, condition: string, sellerType: string, specifics: string) {
    const conditionNote = condition.toLowerCase().includes('used')
        ? `Condition is ${condition} — mention this naturally once.`
        : ''

    return `Write an eBay product description. Return ONLY valid HTML, nothing else.

Product: ${title}
Category: ${category}${specifics ? `\nSpecifics: ${specifics}` : ''}${conditionNote ? `\n${conditionNote}` : ''}

Rules:
- Hook line first (1 sentence, benefit-led)
- 3-5 bullet points with <ul><li> tags covering key features
- 1 short closing trust line
- Tags allowed: <p><ul><li><strong>
- No price, no shipping, no inline styles
- Under 250 words`
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

// ── Update usage stats ───────────────────────────────────────────────────────
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
            model: 'claude-haiku-4-5-20251001', // Haiku — fast + cheap for descriptions
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(20_000),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    return data.content?.[0]?.text?.trim() || ''
}

// ── Google Gemini ────────────────────────────────────────────────────────────
async function generateWithGemini(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(20_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const { title, category, condition, sellerType, specifics } = await req.json().catch(() => ({}))

    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

    const prompt = buildPrompt(title, category || '', condition || '', sellerType || '', specifics || '')

    // ── Try Anthropic first ──────────────────────────────────────────────────
    const anthropicKey = await getAiKey('anthropic')
        ?? process.env.ANTHROPIC_API_KEY  // fallback to env var

    if (anthropicKey) {
        try {
            const html = await generateWithAnthropic(anthropicKey, prompt)
            if (html) {
                await trackUsage('anthropic')
                return NextResponse.json({ html, provider: 'anthropic' })
            }
        } catch (e) {
            console.warn('[generate-description] Anthropic failed, trying Gemini:', e)
        }
    }

    // ── Fallback to Gemini ───────────────────────────────────────────────────
    const geminiKey = await getAiKey('gemini')
        ?? process.env.GEMINI_API_KEY

    if (geminiKey) {
        try {
            const html = await generateWithGemini(geminiKey, prompt)
            if (html) {
                await trackUsage('gemini')
                return NextResponse.json({ html, provider: 'gemini' })
            }
        } catch (e) {
            console.warn('[generate-description] Gemini failed:', e)
        }
    }

    // ── No AI configured ─────────────────────────────────────────────────────
    return NextResponse.json(
        { error: 'No AI provider connected. Go to API Vault → Anthropic or Gemini and add your API key.' },
        { status: 503 }
    )
}
