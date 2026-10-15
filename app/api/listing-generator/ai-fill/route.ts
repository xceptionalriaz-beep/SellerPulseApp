// app/api/listing-generator/ai-fill/route.ts
// ─────────────────────────────────────────────────────────────
// Riazify — AI Fill: one-shot content injection for Design Studio templates
//
// Given a draft ID, this route:
//   1. Authenticates the user via Supabase session cookie
//   2. Fetches listing draft data (title, condition, category, template_id)
//   3. Fetches the linked listing_template's description_html + slots
//   4. Calls AI (Anthropic Haiku → Gemini 1.5-flash fallback) with a
//      slot-aware prompt to generate one piece of content per slot role
//   5. Injects each generated piece into its tagged block in the HTML
//      using the <!-- BLOCK:type:id --> / <!-- /BLOCK:type:id --> markers
//   6. Returns { ok: true, filledHtml: string }
//
// AI priority: Anthropic (Haiku) → Gemini (1.5-flash) → error
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { createServerClient }        from '@supabase/ssr'
import { cookies }                   from 'next/headers'

export const maxDuration = 60

// ── Admin client (service-role) — for AI keys, draft reads ──────────────────
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type SlotRole = 'headline' | 'key_features' | 'description' | 'condition_note' | 'trust_statement'

interface TemplateSlot {
    role:    SlotRole
    blockId: string
    label:   string
}

// ─────────────────────────────────────────────────────────────
// Helper: fetch AI key from api_fleet_config
// ─────────────────────────────────────────────────────────────
async function getAiKey(platform: string): Promise<string | null> {
    try {
        const { data } = await supabaseAdmin
            .from('api_fleet_config')
            .select('primary_key_1, status')
            .eq('platform_name', platform)
            .single()
        if (!data || data.status === 'disconnected' || !data.primary_key_1 || data.primary_key_1 === 'EMPTY') {
            return null
        }
        return data.primary_key_1 as string
    } catch {
        return null
    }
}

async function trackUsage(platform: string) {
    try {
        await supabaseAdmin
            .from('api_fleet_config')
            .update({ last_used_at: new Date().toISOString() })
            .eq('platform_name', platform)
    } catch { /* non-fatal */ }
}

// ─────────────────────────────────────────────────────────────
// Helper: parse AI JSON (handles markdown fences)
// ─────────────────────────────────────────────────────────────
function parseAiJson(text: string): Record<string, string> | null {
    try {
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
        const obj = JSON.parse(cleaned)
        if (obj && typeof obj === 'object') return obj as Record<string, string>
    } catch { /* fall through */ }
    return null
}

// ─────────────────────────────────────────────────────────────
// Helper: build AI prompt for slot filling
// ─────────────────────────────────────────────────────────────
function buildAiFillPrompt(
    title: string,
    condition: string,
    conditionDescription: string | null,
    category: string | null,
    slots: TemplateSlot[]
): string {
    const roleDescriptions: Record<SlotRole, string> = {
        headline:        'A catchy 1-sentence listing headline (max 80 chars), keyword-rich for eBay Cassini SEO',
        key_features:    'Exactly 5 bullet points, each starting with "✓ ", separated by newline characters (\\n). No HTML.',
        description:     '2–3 short sentences of persuasive product copy. No HTML tags.',
        condition_note:  '1–2 sentences describing the item\'s condition naturally. No HTML.',
        trust_statement: '1 short buyer-confidence sentence (e.g. "Fast shipping · 30-day returns"). No HTML.',
    }

    const slotLines = slots
        .map(s => `  "${s.role}": "${roleDescriptions[s.role]}"`)
        .join(',\n')

    const condNote = conditionDescription ? `\nCondition details: ${conditionDescription}` : ''
    const catNote  = category ? `\nCategory: ${category}` : ''

    return `You are an expert eBay listing writer. Generate content for these template slots.

Product: ${title}
Condition: ${condition}${condNote}${catNote}

Fill ONLY these slots — return a single flat JSON object with exactly these keys:
{
${slotLines}
}

Rules:
- key_features: exactly 5 items, each on its own line separated by \\n, starting with "✓ "
- All other slots: plain text only, no HTML
- headline: max 80 characters
- Return ONLY the JSON object, no markdown, no commentary`
}

// ─────────────────────────────────────────────────────────────
// Helper: call Anthropic Haiku
// ─────────────────────────────────────────────────────────────
async function callAnthropic(apiKey: string, prompt: string): Promise<Record<string, string> | null> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type':      'application/json',
            'x-api-key':         apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 800,
            messages:   [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() ?? ''
    return parseAiJson(text)
}

// ─────────────────────────────────────────────────────────────
// Helper: call Gemini 1.5-flash
// ─────────────────────────────────────────────────────────────
async function callGemini(apiKey: string, prompt: string): Promise<Record<string, string> | null> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents:         [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(25_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    return parseAiJson(text)
}

// ─────────────────────────────────────────────────────────────
// Helper: inject AI content into a block region in HTML
//
// Finds <!-- BLOCK:type:blockId --> ... <!-- /BLOCK:type:blockId -->
// and replaces the text content of the appropriate inner tag.
//
// Block type → inner tag strategy:
//   heading / product_title           → first <h1>–<h6> inner text
//   paragraph / description            → first <p> inner text
//   bullet_list / key_features_grid   → replace <li> items in <ul>
//   numbered_list                     → replace <li> items in <ol>
//   quote_block / info_box / warning_box → first <p> inner text
//   (any other)                       → first <p> or <h*> inner text
// ─────────────────────────────────────────────────────────────
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function injectIntoBlock(html: string, blockId: string, content: string): string {
    // Match the entire block region (type is part of marker but we use wildcard)
    const regionPattern = new RegExp(
        `(<!-- BLOCK:([^:]+):${escapeRegex(blockId)} -->)([\\s\\S]*?)(<!-- /BLOCK:[^:]+:${escapeRegex(blockId)} -->)`,
        'g'
    )

    return html.replace(regionPattern, (_, openComment, blockType, innerHtml, closeComment) => {
        let newInner = innerHtml

        const type = blockType.toLowerCase()

        if (type === 'bullet_list' || type === 'key_features_grid') {
            // content = "✓ Item1\n✓ Item2\n..."
            const items = content
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => `<li>${s}</li>`)
                .join('')
            // Replace entire <ul>...</ul>
            if (/<ul/i.test(innerHtml)) {
                newInner = innerHtml.replace(/<ul([^>]*)>[\s\S]*?<\/ul>/i, `<ul$1>${items}</ul>`)
            } else {
                // No <ul> found — append list
                newInner = innerHtml + `<ul>${items}</ul>`
            }

        } else if (type === 'numbered_list') {
            const items = content
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => `<li>${s}</li>`)
                .join('')
            if (/<ol/i.test(innerHtml)) {
                newInner = innerHtml.replace(/<ol([^>]*)>[\s\S]*?<\/ol>/i, `<ol$1>${items}</ol>`)
            } else {
                newInner = innerHtml + `<ol>${items}</ol>`
            }

        } else if (type === 'heading' || type === 'product_title') {
            // Replace innerText of first heading tag, preserve tag + attributes
            newInner = innerHtml.replace(
                /(<h[1-6]([^>]*)>)([\s\S]*?)(<\/h[1-6]>)/i,
                `$1${content}$4`
            )
            // Fallback: replace first <p> if no heading found
            if (newInner === innerHtml) {
                newInner = innerHtml.replace(
                    /(<p([^>]*)>)([\s\S]*?)(<\/p>)/i,
                    `$1${content}$4`
                )
            }

        } else {
            // paragraph, description, condition_note, trust_statement, product_description,
            // quote_block, info_box, warning_box — replace first <p> text
            newInner = innerHtml.replace(
                /(<p([^>]*)>)([\s\S]*?)(<\/p>)/i,
                `$1${content}$4`
            )
            // Fallback: try heading if no <p>
            if (newInner === innerHtml) {
                newInner = innerHtml.replace(
                    /(<h[1-6]([^>]*)>)([\s\S]*?)(<\/h[1-6]>)/i,
                    `$1${content}$4`
                )
            }
        }

        return `${openComment}${newInner}${closeComment}`
    })
}

// ─────────────────────────────────────────────────────────────
// POST /api/listing-generator/ai-fill
// Body: { draftId: string }
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

    // ── 1. Auth ──────────────────────────────────────────────────────────────
    let userId: string
    try {
        const cookieStore = await cookies()
        const supabaseUser = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll() } } }
        )
        const { data: { user }, error } = await supabaseUser.auth.getUser()
        if (error || !user) {
            return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
        }
        userId = user.id
    } catch {
        return NextResponse.json({ ok: false, error: 'Auth failed' }, { status: 401 })
    }

    // ── 2. Parse body ────────────────────────────────────────────────────────
    let draftId: string
    try {
        const body = await req.json()
        draftId = body.draftId
        if (!draftId) throw new Error('missing draftId')
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
    }

    // ── 3. Fetch draft ───────────────────────────────────────────────────────
    const { data: draft, error: draftErr } = await (supabaseAdmin
        .from('listing_drafts') as any)
        .select('id, title, condition, condition_description, category, template_id, user_id')
        .eq('id', draftId)
        .single()

    if (draftErr || !draft) {
        return NextResponse.json({ ok: false, error: 'Draft not found' }, { status: 404 })
    }

    // Security: ensure the draft belongs to the authenticated user
    if (draft.user_id !== userId) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    if (!draft.template_id) {
        return NextResponse.json({ ok: false, error: 'No template attached to this draft' }, { status: 400 })
    }

    // ── 4. Fetch template ────────────────────────────────────────────────────
    const { data: template, error: tplErr } = await (supabaseAdmin
        .from('listing_templates') as any)
        .select('id, description_html, slots')
        .eq('id', draft.template_id)
        .single()

    if (tplErr || !template) {
        return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 })
    }

    const slots: TemplateSlot[] = Array.isArray(template.slots) ? template.slots : []

    if (slots.length === 0) {
        return NextResponse.json(
            { ok: false, error: 'This template has no AI slots configured. Open it in Design Studio and tag text blocks with AI roles.' },
            { status: 400 }
        )
    }

    const baseHtml: string = template.description_html ?? ''

    // ── 5. Build prompt ──────────────────────────────────────────────────────
    const prompt = buildAiFillPrompt(
        draft.title         ?? 'Untitled product',
        draft.condition     ?? 'New',
        draft.condition_description ?? null,
        draft.category      ?? null,
        slots
    )

    // ── 6. Call AI (Anthropic → Gemini fallback) ─────────────────────────────
    let aiContent: Record<string, string> | null = null
    let provider = 'none'

    const anthropicKey = await getAiKey('anthropic') ?? process.env.ANTHROPIC_API_KEY ?? null
    if (anthropicKey) {
        try {
            aiContent = await callAnthropic(anthropicKey, prompt)
            if (aiContent) {
                provider = 'anthropic'
                await trackUsage('anthropic')
            }
        } catch (e) {
            console.warn('[ai-fill] Anthropic failed:', e)
        }
    }

    if (!aiContent) {
        const geminiKey = await getAiKey('gemini') ?? process.env.GEMINI_API_KEY ?? null
        if (geminiKey) {
            try {
                aiContent = await callGemini(geminiKey, prompt)
                if (aiContent) {
                    provider = 'gemini'
                    await trackUsage('gemini')
                }
            } catch (e) {
                console.warn('[ai-fill] Gemini failed:', e)
            }
        }
    }

    if (!aiContent) {
        return NextResponse.json(
            { ok: false, error: 'AI generation failed. Check your API keys in Settings → API Vault.' },
            { status: 500 }
        )
    }

    // ── 7. Inject content into block HTML ────────────────────────────────────
    let filledHtml = baseHtml

    for (const slot of slots) {
        const content = aiContent[slot.role]
        if (!content || typeof content !== 'string') continue
        filledHtml = injectIntoBlock(filledHtml, slot.blockId, content.trim())
    }

    // ── 8. Return ────────────────────────────────────────────────────────────
    return NextResponse.json({
        ok:         true,
        filledHtml,
        provider,
        slotsApplied: slots.map(s => s.role),
    })
}
