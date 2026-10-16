// app/api/ai/policy-writer/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Policy Writer (streaming)
//
// Auto-generates an eBay-safe shipping & returns policy section.
// Streams the response token-by-token so the panel shows typewriter output.
// Priority: Anthropic → Gemini → 503.
//
// POST body:
//   blockType — e.g. 'shipping_info', 'paragraph' (optional, adds context)
//   category  — template category e.g. 'electronics' (optional)
//   context   — any extra context the seller wants to include (optional)
//
// Response: text/plain stream (or application/json on error)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

function buildPrompt(category: string, context: string): string {
    return `You are a professional eBay seller assistant writing clear, trust-building shipping and returns policy copy.

Product category: ${category || 'general'}
${context ? `Additional context: ${context}` : ''}

Write a concise, eBay-compliant shipping & returns policy section. Requirements:
- Plain text only — no HTML, no markdown, no bullet symbols
- Professional and reassuring tone
- Include: dispatch time (1-2 business days), estimated delivery (3-5 business days), returns window (30 days), condition for returns, and a brief quality promise
- Around 80-100 words
- Do not start with "I" or mention the seller's name
- Do not include pricing or specific carrier names`
}

// ── Anthropic streaming ───────────────────────────────────────────────────────
async function streamAnthropic(apiKey: string, prompt: string): Promise<ReadableStream<Uint8Array>> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 300,
            stream: true,
            messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(25_000),
    })

    if (!res.ok || !res.body) throw new Error(`Anthropic ${res.status}`)

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            const reader = res.body!.getReader()
            try {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    // Anthropic SSE: lines starting with "data: "
                    for (const line of chunk.split('\n')) {
                        if (!line.startsWith('data: ')) continue
                        const payload = line.slice(6).trim()
                        if (payload === '[DONE]') break
                        try {
                            const parsed = JSON.parse(payload)
                            // content_block_delta → text delta
                            const text = parsed?.delta?.text ?? ''
                            if (text) controller.enqueue(encoder.encode(text))
                        } catch { /* skip malformed */ }
                    }
                }
            } finally {
                reader.releaseLock()
                controller.close()
            }
        },
    })
}

// ── Gemini non-streaming fallback (Gemini streaming is more complex) ──────────
async function callGemini(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
            }),
            signal: AbortSignal.timeout(25_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    let body: { blockType?: string; category?: string; context?: string }
    try { body = await req.json() } catch { body = {} }

    const { category = 'general', context = '' } = body
    const prompt = buildPrompt(category, context)

    // ── Try Anthropic with streaming ──────────────────────────────────────────
    const anthropicKey = (await getAiKey('anthropic')) ?? process.env.ANTHROPIC_API_KEY ?? null
    if (anthropicKey) {
        try {
            const stream = await streamAnthropic(anthropicKey, prompt)
            await trackUsage('anthropic')
            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Provider': 'anthropic',
                    'Cache-Control': 'no-cache',
                },
            })
        } catch (e) {
            console.warn('[policy-writer] Anthropic streaming failed, trying Gemini:', e)
        }
    }

    // ── Gemini fallback (buffered) ────────────────────────────────────────────
    const geminiKey = (await getAiKey('gemini')) ?? process.env.GEMINI_API_KEY ?? null
    if (geminiKey) {
        try {
            const text = await callGemini(geminiKey, prompt)
            if (text) {
                await trackUsage('gemini')
                return new Response(text, {
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'X-Provider': 'gemini',
                    },
                })
            }
        } catch (e) {
            console.warn('[policy-writer] Gemini failed:', e)
        }
    }

    return new Response(
        JSON.stringify({ error: 'AI Policy Writer is temporarily unavailable. Check your API Vault keys.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
}
