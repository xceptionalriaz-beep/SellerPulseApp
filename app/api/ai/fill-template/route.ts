// app/api/ai/fill-template/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Fill Template
//
// Takes a seller's product description + all blocks in the template.
// Returns filled text content for every block that has editable text fields.
// Priority: Anthropic → Gemini → 503.
//
// POST body:
//   productDescription — free-text product info from the seller
//   blocks             — array of { id, type, props } for all template blocks
//   category           — template category e.g. 'electronics' (optional)
//
// Response (200):
//   {
//     result: { [blockId]: { [fieldKey]: string } },
//     provider: 'anthropic' | 'gemini',
//     filledCount: number   — how many blocks got content
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUserId, deductCredits } from '@/lib/ai/credits'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Fetch AI key from vault ───────────────────────────────────────────────────
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

// ── Keys to skip when scanning block props ────────────────────────────────────
const SKIP_KEYS = new Set([
    'backgroundColor', 'textColor', 'borderColor', 'color', 'background',
    'borderRadius', 'padding', 'margin', 'fontSize', 'fontWeight', 'fontFamily',
    'textAlign', 'width', 'height', 'gap', 'layout', 'columns', 'variant',
    'src', 'href', 'url', 'imageSrc', 'backgroundImage', 'imageUrl',
    'isVisible', 'showDivider', 'sticky', 'enabled', 'fullWidth', 'centered',
    'id', 'type', 'blockId', 'icon', 'iconColor', 'iconSize',
    'borderStyle', 'borderWidth', 'opacity', 'zIndex', 'overflow', 'display',
    'flexDirection', 'alignItems', 'justifyContent', 'position',
])

const URL_PATTERN = /^https?:\/\//i
const COLOR_PATTERN = /^#[0-9a-f]{3,8}$/i
const PLACEHOLDER_PATTERN = /^\{\{[A-Z_]+\}\}$/

// ── Extract all text fields from all blocks ───────────────────────────────────
function extractBlockFields(blocks: Array<{ id: string; type: string; props: Record<string, unknown> }>) {
    const extracted: Array<{
        blockId: string
        blockType: string
        fields: Record<string, string>
    }> = []

    for (const block of blocks) {
        const fields: Record<string, string> = {}

        const scanProps = (obj: Record<string, unknown>, prefix = '') => {
            for (const [key, val] of Object.entries(obj)) {
                if (SKIP_KEYS.has(key)) continue
                const fullKey = prefix ? `${prefix}.${key}` : key

                if (typeof val === 'string') {
                    if (
                        val.trim().length === 0 ||
                        URL_PATTERN.test(val) ||
                        COLOR_PATTERN.test(val) ||
                        PLACEHOLDER_PATTERN.test(val) ||
                        val === 'EMPTY'
                    ) continue
                    if (val.length > 5) fields[fullKey] = val
                } else if (Array.isArray(val)) {
                    val.forEach((item, i) => {
                        if (typeof item === 'object' && item !== null) {
                            scanProps(item as Record<string, unknown>, `${fullKey}[${i}]`)
                        }
                    })
                } else if (typeof val === 'object' && val !== null) {
                    scanProps(val as Record<string, unknown>, fullKey)
                }
            }
        }

        scanProps(block.props)
        if (Object.keys(fields).length > 0) {
            extracted.push({ blockId: block.id, blockType: block.type, fields })
        }
    }

    return extracted
}

// ── Build prompt ──────────────────────────────────────────────────────────────
function buildPrompt(
    productDescription: string,
    category: string,
    blockFields: Array<{ blockId: string; blockType: string; fields: Record<string, string> }>
): string {
    const blockList = blockFields.map(b => {
        const fieldLines = Object.entries(b.fields)
            .map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`)
            .join(',\n')
        return `  // Block: ${b.blockType} (id: ${b.blockId})\n  "${b.blockId}": {\n${fieldLines}\n  }`
    }).join(',\n\n')

    return `You are an expert eBay listing copywriter. A seller has provided their product information and wants you to fill in all the text fields across their entire eBay listing template.

Product category: ${category || 'general'}

Seller's product description:
"""
${productDescription}
"""

Below is the current template content as JSON, grouped by block ID. Rewrite every text field to be accurate, compelling and eBay-compliant based on the seller's product description.

Rules:
- Write buyer-focused, benefit-driven copy that accurately reflects the product
- Keep each field concise — match the original length and purpose
- eBay compliant: no HTML, no markdown, no all-caps spam
- Preserve any template tokens like {{BRAND}}, {{PRODUCT_TITLE}}, {{PRICE}} EXACTLY as-is
- If a field is a heading, make it punchy; if a body text, make it informative
- For spec fields (like Brand, Model, Condition), extract exact values from the product description
- Return ONLY a valid JSON object with the SAME block IDs and field keys, just with improved values
- No explanation, no markdown fences — just the JSON object

Current template fields to fill:
{
${blockList}
}`
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
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(45_000),
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
                generationConfig: { maxOutputTokens: 4000, temperature: 0.6 },
            }),
            signal: AbortSignal.timeout(45_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

// ── Parse JSON from raw AI response ──────────────────────────────────────────
function parseJsonResult(raw: string): Record<string, Record<string, string>> {
    const clean = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON found in response')
    return JSON.parse(clean.slice(start, end + 1))
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    let body: {
        productDescription?: string
        blocks?: Array<{ id: string; type: string; props: Record<string, unknown> }>
        category?: string
    }
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { productDescription = '', blocks = [], category = 'general' } = body

    if (!productDescription.trim()) {
        return NextResponse.json({ error: 'Product description is required.' }, { status: 400 })
    }
    if (blocks.length === 0) {
        return NextResponse.json({ error: 'No blocks provided.' }, { status: 400 })
    }

    // Extract text fields from all blocks
    const blockFields = extractBlockFields(blocks)
    if (blockFields.length === 0) {
        return NextResponse.json({ error: 'No editable text fields found in this template.' }, { status: 400 })
    }

    // ── Credit check + deduction ──────────────────────────────────────────────
    const userId = await getAuthUserId()
    if (!userId) {
        return NextResponse.json({ error: 'Please sign in to use AI features.' }, { status: 401 })
    }
    const credit = await deductCredits(userId, 'ai_fill_template')
    if (!credit.ok) return credit.response

    const prompt = buildPrompt(productDescription, category, blockFields)

    // ── Try Anthropic ─────────────────────────────────────────────────────────
    const anthropicKey = (await getAiKey('anthropic')) ?? process.env.ANTHROPIC_API_KEY ?? null
    if (anthropicKey) {
        try {
            const raw = await callAnthropic(anthropicKey, prompt)
            if (raw) {
                const result = parseJsonResult(raw)
                await trackUsage('anthropic')
                return NextResponse.json({ result, provider: 'anthropic', filledCount: Object.keys(result).length })
            }
        } catch (e) {
            console.warn('[fill-template] Anthropic failed, trying Gemini:', e)
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
                return NextResponse.json({ result, provider: 'gemini', filledCount: Object.keys(result).length })
            }
        } catch (e) {
            console.warn('[fill-template] Gemini failed:', e)
        }
    }

    return NextResponse.json(
        { error: 'AI is temporarily unavailable. Check your API Vault keys.', code: 'NO_AI_KEY' },
        { status: 503 }
    )
}
