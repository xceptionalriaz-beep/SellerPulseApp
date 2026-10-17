'use client'
// app/dashboard/listing-generator/components/TemplatePickerCard.tsx
// ─────────────────────────────────────────────────────────────────
// Lets a seller pick one of their Design Studio visual templates
// and attach it to the current listing draft.
// Shows a mini gallery of cards (thumbnail + name + category).
// Also shows an "Fill with AI" button when the selected template
// has AI slot roles configured and a draftId is supplied.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Palette, Check, X, ExternalLink, RefreshCw, ChevronDown, ChevronUp, Sparkles, Loader2, CheckCircle2, ShoppingCart } from 'lucide-react'
import { BuyCreditsModal } from '@/components/ui/BuyCreditsModal'

const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
}

interface VisualTemplate {
    id: string
    name: string
    category: string
    thumbnail_url: string | null
    use_count: number
    updated_at: string
    blocks_json: any
    canvas_settings_json: any
}

interface TemplateSlot {
    role: string
    blockId: string
    label: string
}

interface Props {
    templateId: string | null
    onChange: (id: string | null) => void
    /** ID of the current listing draft — enables the AI Fill button */
    draftId?: string
    /** Called with the AI-filled description_html on success */
    onFilled?: (html: string) => void
    /** Draft's category key (e.g. "consumer_electronics") — enables category match badge */
    draftCategory?: string
}

// ── Category match ─────────────────────────────────────────────
// Handles both new unified IDs (consumer_electronics) and
// legacy Design-Studio slugs (electronics, fashion, etc.)
const LEGACY_SLUGS: Record<string, string[]> = {
    consumer_electronics: ['electronics'],
    computers: ['electronics', 'computers'],
    clothing: ['fashion', 'clothing'],
    jewelry: ['fashion', 'jewelry', 'jewellery'],
    health_beauty: ['fashion', 'health_beauty', 'health'],
    home_garden: ['home', 'home_garden'],
    furniture: ['home', 'furniture'],
    toys_hobbies: ['toys', 'toys_hobbies'],
    sporting_goods: ['sports', 'sporting_goods'],
    pet_supplies: ['pets', 'pet_supplies'],
    motors_parts: ['auto', 'motors_parts'],
    books_movies: ['general', 'books_movies'],
    collectibles: ['general', 'collectibles'],
    business: ['general', 'business'],
    default: ['general'],
}

function categoryMatch(templateCat: string, draftCat?: string): boolean {
    if (!draftCat || !templateCat) return false
    const tc = templateCat.toLowerCase()
    const dc = draftCat.toLowerCase()
    if (tc === dc) return true                              // direct match (new IDs)
    return LEGACY_SLUGS[dc]?.includes(tc) ?? false         // old slug match
}

export default function TemplatePickerCard({ templateId, onChange, draftId, onFilled, draftCategory }: Props) {
    const supabase = createClient()

    const [templates, setTemplates] = useState<VisualTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [selected, setSelected] = useState<VisualTemplate | null>(null)
    const [hoverId, setHoverId] = useState<string | null>(null)

    // AI Fill state
    const [slots, setSlots] = useState<TemplateSlot[]>([])
    const [aiLoading, setAiLoading] = useState(false)
    const [aiFilled, setAiFilled] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [creditError, setCreditError] = useState<{ balance: number; cost: number } | null>(null)
    const [showBuyCredits, setShowBuyCredits] = useState(false)

    useEffect(() => { loadTemplates() }, [])

    // When templateId prop changes (e.g. loading existing draft), sync selection
    useEffect(() => {
        if (!templateId) { setSelected(null); setSlots([]); setAiFilled(false); setAiError(null); return }
        setSelected(prev => prev?.id === templateId ? prev : templates.find(t => t.id === templateId) ?? null)
    }, [templateId, templates])

    // When selected changes, load its slots from listing_templates
    const loadSlots = useCallback(async (id: string) => {
        setSlots([])
        setAiFilled(false)
        setAiError(null)
        try {
            const { data } = await (supabase.from('listing_templates') as any)
                .select('slots')
                .eq('id', id)
                .single()
            if (data && Array.isArray(data.slots)) {
                setSlots(data.slots as TemplateSlot[])
            }
        } catch { /* slots stay empty */ }
    }, [supabase])

    useEffect(() => {
        if (selected?.id) {
            loadSlots(selected.id)
        } else {
            setSlots([])
            setAiFilled(false)
            setAiError(null)
        }
    }, [selected?.id, loadSlots])

    async function loadTemplates() {
        setLoading(true)
        const { data } = await (supabase.from('visual_templates') as any)
            .select('id, name, category, thumbnail_url, use_count, updated_at, blocks_json, canvas_settings_json')
            .order('updated_at', { ascending: false })
        setTemplates((data as VisualTemplate[]) ?? [])
        setLoading(false)
    }

    function pick(t: VisualTemplate) {
        setSelected(t)
        onChange(t.id)
        setExpanded(false)
    }

    function clear() {
        setSelected(null)
        setSlots([])
        setAiFilled(false)
        setAiError(null)
        onChange(null)
    }

    async function handleAiFill() {
        if (!draftId || !selected || aiLoading) return
        setAiLoading(true)
        setAiError(null)
        setAiFilled(false)
        setCreditError(null)
        try {
            const res = await fetch('/api/listing-generator/ai-fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draftId }),
            })
            if (res.status === 401) {
                setAiError('Please sign in to use AI Fill')
                return
            }
            if (res.status === 402) {
                const errData = await res.json().catch(() => ({}))
                setCreditError({ balance: errData.balance ?? 0, cost: errData.cost ?? 3 })
                return
            }
            const data = await res.json()
            if (!res.ok || !data.ok) {
                setAiError(data.error ?? 'AI fill failed')
            } else {
                onFilled?.(data.filledHtml)
                setAiFilled(true)
                setTimeout(() => setAiFilled(false), 4000)
            }
        } catch {
            setAiError('Network error — please try again')
        } finally {
            setAiLoading(false)
        }
    }

    // ── Thumbnail: render first block preview or grey placeholder ──
    function Thumb({ t, size = 56 }: { t: VisualTemplate; size?: number }) {
        if (t.thumbnail_url) {
            return (
                <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
            )
        }
        // Generate a mini canvas preview from blocks_json colour
        const blocks: any[] = t.blocks_json?.blocks ?? t.blocks_json ?? []
        const bg = t.canvas_settings_json?.backgroundColor ?? '#f3eeff'
        return (
            <div style={{
                width: size, height: size, borderRadius: 8, flexShrink: 0,
                background: bg, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
            }}>
                {blocks.slice(0, 3).map((b: any, i: number) => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: `${15 + i * 22}%`,
                        left: '10%', right: '10%',
                        height: '14%',
                        background: b.style?.backgroundColor ?? b.style?.color ?? C.primary,
                        opacity: 0.35 - i * 0.08,
                        borderRadius: 3,
                    }} />
                ))}
                <Palette size={size * 0.28} color={C.primary} style={{ opacity: 0.5, zIndex: 1 }} />
            </div>
        )
    }

    // ── Empty state ───────────────────────────────────────────────
    if (!loading && templates.length === 0) {
        return (
            <div style={{
                border: `1px dashed ${C.border}`, borderRadius: 12,
                padding: '20px 24px', background: C.bg,
                display: 'flex', alignItems: 'center', gap: 16,
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: C.primaryLight, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Palette size={18} color={C.primary} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.body, margin: 0 }}>
                        No Design Studio templates yet
                    </p>
                    <p style={{ fontSize: 12, color: C.secondary, margin: '3px 0 0' }}>
                        Build a template in Design Studio and it will appear here.
                    </p>
                </div>
                <a
                    href="/dashboard/design"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600, color: C.primary,
                        textDecoration: 'none', flexShrink: 0,
                        padding: '7px 14px', borderRadius: 8,
                        background: C.primaryLight,
                    }}
                >
                    Open Design Studio
                    <ExternalLink size={12} />
                </a>
            </div>
        )
    }

    // Show AI fill button when: template selected + has slots + draftId supplied
    const canAiFill = !!selected && slots.length > 0 && !!draftId && !!onFilled

    // Category match — does selected template's category align with the draft's category?
    const isMatch = !!selected && categoryMatch(selected.category, draftCategory)

    // Sort gallery: matching templates first
    const sortedTemplates = draftCategory
        ? [...templates].sort((a, b) => {
            const aM = categoryMatch(a.category, draftCategory) ? 0 : 1
            const bM = categoryMatch(b.category, draftCategory) ? 0 : 1
            return aM - bM
        })
        : templates

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── Selected template chip / trigger ── */}
            <button
                onClick={() => setExpanded(e => !e)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    background: selected ? C.primaryLight : C.surface,
                    border: `1px solid ${selected ? C.primary : C.borderInput}`,
                    borderRadius: expanded ? '12px 12px 0 0' : 12,
                    padding: '10px 14px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}
            >
                {loading ? (
                    <RefreshCw size={14} color={C.muted} className="animate-spin" />
                ) : selected ? (
                    <Thumb t={selected} size={36} />
                ) : (
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: C.primaryLight, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Palette size={16} color={C.primary} />
                    </div>
                )}

                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    {selected ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: C.body, margin: 0 }}>
                                    {selected.name}
                                </p>
                                {isMatch && (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 3,
                                        fontSize: 9, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
                                        color: C.success,
                                        background: C.successBg,
                                        border: '1px solid #86efac',
                                        borderRadius: 99, padding: '2px 7px',
                                        flexShrink: 0,
                                    }}>
                                        <Check size={8} strokeWidth={3} />
                                        Category match
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: 11, color: C.secondary, margin: '2px 0 0' }}>
                                {selected.category} · Used {selected.use_count} {selected.use_count === 1 ? 'time' : 'times'}
                            </p>
                        </>
                    ) : (
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            {loading ? 'Loading templates…' : 'Pick a Design Studio template (optional)'}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {selected && (
                        <span
                            onClick={e => { e.stopPropagation(); clear() }}
                            style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: '#fee2e2', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={11} color="#ef4444" />
                        </span>
                    )}
                    {expanded
                        ? <ChevronUp size={16} color={C.muted} />
                        : <ChevronDown size={16} color={C.muted} />
                    }
                </div>
            </button>

            {/* ── Dropdown gallery ── */}
            {expanded && (
                <div style={{
                    border: `1px solid ${C.primary}`,
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    background: C.surface,
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 10,
                    maxHeight: 320,
                    overflowY: 'auto',
                }}>
                    {sortedTemplates.map(t => {
                        const isActive = templateId === t.id
                        const isHovered = hoverId === t.id
                        const tMatch = categoryMatch(t.category, draftCategory)
                        return (
                            <div
                                key={t.id}
                                onClick={() => pick(t)}
                                onMouseEnter={() => setHoverId(t.id)}
                                onMouseLeave={() => setHoverId(null)}
                                style={{
                                    border: `1.5px solid ${isActive ? C.primary : tMatch ? '#86efac' : isHovered ? C.primary + '80' : C.border}`,
                                    borderRadius: 10,
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: isActive ? C.primaryLight : tMatch ? '#f0fdf4' : isHovered ? C.bg : C.surface,
                                    transition: 'all 0.12s ease',
                                    display: 'flex', flexDirection: 'column', gap: 8,
                                    position: 'relative',
                                }}
                            >
                                {/* Active checkmark */}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', top: 6, right: 6,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: C.primary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Check size={10} color="#fff" strokeWidth={3} />
                                    </div>
                                )}

                                {/* Category match badge */}
                                {tMatch && !isActive && (
                                    <div style={{
                                        position: 'absolute', top: 6, left: 6,
                                        display: 'flex', alignItems: 'center', gap: 3,
                                        fontSize: 8, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
                                        color: C.success,
                                        background: C.successBg,
                                        border: '1px solid #86efac',
                                        borderRadius: 99, padding: '2px 5px',
                                    }}>
                                        <Check size={7} strokeWidth={3} />
                                        Best match
                                    </div>
                                )}

                                <Thumb t={t} size={40} />

                                <div>
                                    <p style={{
                                        fontSize: 12, fontWeight: 600, color: C.body,
                                        margin: 0, whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {t.name}
                                    </p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>
                                        {t.category}
                                    </p>
                                </div>

                                {/* Open in Design Studio */}
                                <a
                                    href={`/dashboard/design/visual-editor?id=${t.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 10, color: C.primary,
                                        textDecoration: 'none', marginTop: 'auto',
                                    }}
                                >
                                    Edit in Design Studio
                                    <ExternalLink size={9} />
                                </a>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── AI Fill panel — visible when template has slots + draftId supplied ── */}
            {canAiFill && (
                <div style={{
                    marginTop: 10,
                    border: `1px solid #c4b5fd`,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #f3eeff 0%, #faf8ff 100%)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: '#7530fb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Sparkles size={13} color="#b8fa33" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                fontSize: 12, fontWeight: 700, color: '#1e1535',
                                margin: 0, fontFamily: 'DM Sans, sans-serif',
                            }}>
                                AI Fill — {slots.length} slot{slots.length !== 1 ? 's' : ''} ready
                            </p>
                            <p style={{
                                fontSize: 10, color: '#6b7280',
                                margin: '1px 0 0', fontFamily: 'DM Sans, sans-serif',
                            }}>
                                {slots.map(s => s.label).join(' · ')}
                            </p>
                        </div>
                    </div>

                    {/* Fill button */}
                    <button
                        onClick={handleAiFill}
                        disabled={aiLoading}
                        style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 7, padding: '9px 16px', borderRadius: 10, border: 'none',
                            background: aiLoading
                                ? '#9b59fb'
                                : aiFilled
                                    ? '#16a34a'
                                    : 'linear-gradient(135deg, #7530fb 0%, #9b59fb 100%)',
                            color: '#fff',
                            fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
                            cursor: aiLoading ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: aiLoading ? 'none' : '0 3px 10px rgba(117,48,251,0.35)',
                        }}
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                Generating content…
                            </>
                        ) : aiFilled ? (
                            <>
                                <CheckCircle2 size={13} />
                                Filled! Check Description above ↑
                            </>
                        ) : (
                            <>
                                <Sparkles size={13} />
                                Fill template with AI
                            </>
                        )}
                    </button>

                    {/* Error */}
                    {aiError && (
                        <p style={{
                            fontSize: 10, color: '#ef4444',
                            margin: 0, fontFamily: 'DM Sans, sans-serif',
                            padding: '6px 8px', borderRadius: 6,
                            background: '#fee2e2', border: '1px solid #fca5a5',
                        }}>
                            {aiError}
                        </p>
                    )}

                    {/* Credit error banner */}
                    {creditError && (
                        <div style={{ padding: '10px 12px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <ShoppingCart size={11} /> Not enough credits
                            </p>
                            <p style={{ margin: '0 0 6px', fontSize: 10, color: C.secondary }}>
                                AI Fill costs {creditError.cost} credits. You have {creditError.balance}.
                            </p>
                            <div style={{ display: 'flex', gap: 5 }}>
                                <button
                                    onClick={() => setShowBuyCredits(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, backgroundColor: C.primary, color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    <ShoppingCart size={10} /> Buy Credits
                                </button>
                                <button
                                    onClick={() => setCreditError(null)}
                                    style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#f3f4f6', color: C.muted, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}
                    {showBuyCredits && <BuyCreditsModal onClose={() => setShowBuyCredits(false)} />}

                    {/* Helper tip */}
                    {!aiFilled && !aiError && (
                        <p style={{
                            fontSize: 10, color: '#9ca3af',
                            margin: 0, fontFamily: 'DM Sans, sans-serif',
                        }}>
                            AI writes content for each tagged block using your listing data.
                            The filled description will appear in the Description section above.
                        </p>
                    )}
                </div>
            )}

            {/* ── No-slots hint — shown when template selected but has no slots ── */}
            {selected && slots.length === 0 && draftId && (
                <div style={{
                    marginTop: 10,
                    padding: '8px 12px', borderRadius: 10,
                    border: `1px dashed #d4c8f5`,
                    background: '#faf8ff',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <Sparkles size={11} color="#9ca3af" />
                    <p style={{
                        fontSize: 10, color: '#9ca3af', margin: 0,
                        fontFamily: 'DM Sans, sans-serif',
                    }}>
                        This template has no AI roles set.{' '}
                        <a
                            href={`/dashboard/design/visual-editor?id=${selected.id}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#7530fb', textDecoration: 'underline' }}
                        >
                            Open in Design Studio
                        </a>
                        {' '}and tag text blocks with AI roles to enable AI fill.
                    </p>
                </div>
            )}
        </div>
    )
}
