'use client'
// components/ui/VisualEditor/FillTemplatePanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — AI Fill Template Panel
//
// Seller types their product description → AI fills all text fields across
// the entire template at once. Shows a per-block preview before applying.
//
// Props:
//   blocks          — all Block objects in the current template
//   templateCategory — e.g. 'electronics', 'baby', 'clothing'
//   creditBalance   — current credit balance (null = loading)
//   onApplyBlock    — called when user applies one block's changes
//   onApplyAll      — called when user clicks Apply All
//   onClose         — called when user closes the panel
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import type { Block, BlockProps } from '@/components/ui/VisualEditor/blocks'
import { Wand2, ChevronDown, ChevronUp, Check, X, AlertTriangle, Loader2 } from 'lucide-react'

// ── Colour tokens (mirror PropertiesPanel's C object) ─────────────────────────
const C = {
    primary:       '#7530fb',
    primaryBorder: '#ede9fe',
    primaryLight:  '#f3eeff',
    success:       '#16a34a',
    successBg:     '#dcfce7',
    successBorder: '#86efac',
    danger:        '#dc2626',
    dangerBg:      '#fee2e2',
    border:        '#e2e8f0',
    muted:         '#94a3b8',
    label:         '#475569',
    bg:            '#f8fafc',
    text:          '#1e293b',
    white:         '#ffffff',
    amber:         '#d97706',
    amberBg:       '#fffbeb',
    amberBorder:   '#fde68a',
}

// ── Fonts ─────────────────────────────────────────────────────────────────────
const FONT = 'DM Sans, sans-serif'

// ── Block type → readable name ────────────────────────────────────────────────
const BLOCK_LABEL: Record<string, string> = {
    heading:              'Heading',
    paragraph:            'Paragraph',
    bullet_list:          'Bullet List',
    hero_header:          'Hero Header',
    hero_product:         'Hero Product',
    product_title:        'Product Title',
    product_description:  'Product Description',
    feature_highlights:   'Feature Highlights',
    key_features_grid:    'Features Grid',
    specs_table:          'Specs Table',
    trust_badges:         'Trust Badges',
    shipping_info:        'Shipping Info',
    returns_policy:       'Returns Policy',
    banner:               'Banner',
    cta_banner:           'CTA Banner',
    faq_section:          'FAQ',
    comparison_table:     'Comparison Table',
    testimonials:         'Testimonials',
    image:                'Image Block',
    gallery:              'Gallery',
    video_embed:          'Video',
}

function blockLabel(type: string): string {
    return BLOCK_LABEL[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Count changed fields between two props objects ────────────────────────────
function countChanges(
    original: Record<string, unknown>,
    updated: Record<string, string>,
    prefix = ''
): { key: string; from: string; to: string }[] {
    const changes: { key: string; from: string; to: string }[] = []
    for (const [k, newVal] of Object.entries(updated)) {
        const parts = k.split('.')
        let orig: unknown = original
        for (const part of parts) {
            const arrMatch = part.match(/^(.+)\[(\d+)\]$/)
            if (arrMatch) {
                orig = (orig as Record<string, unknown>)?.[arrMatch[1]]
                orig = (orig as unknown[])?.[parseInt(arrMatch[2])]
            } else {
                orig = (orig as Record<string, unknown>)?.[part]
            }
        }
        const oldVal = typeof orig === 'string' ? orig : ''
        if (oldVal !== newVal) {
            changes.push({ key: k, from: oldVal, to: newVal })
        }
    }
    return changes
}

// ── Deep-apply a flat { "a.b[0].c": "val" } result back into block props ─────
function applyFlatResult(
    props: Record<string, unknown>,
    flat: Record<string, string>
): BlockProps {
    const result = JSON.parse(JSON.stringify(props)) as Record<string, unknown>

    for (const [path, value] of Object.entries(flat)) {
        const parts = path.split('.')
        let cur: Record<string, unknown> = result
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]
            const arrMatch = part.match(/^(.+)\[(\d+)\]$/)
            if (arrMatch) {
                const arr = cur[arrMatch[1]] as unknown[]
                cur = arr[parseInt(arrMatch[2])] as Record<string, unknown>
            } else {
                cur = cur[part] as Record<string, unknown>
            }
        }
        const lastPart = parts[parts.length - 1]
        const arrMatch = lastPart.match(/^(.+)\[(\d+)\]$/)
        if (arrMatch) {
            const arr = cur[arrMatch[1]] as unknown[]
            arr[parseInt(arrMatch[2])] = value
        } else {
            cur[lastPart] = value
        }
    }

    return result as unknown as BlockProps
}

// ── BlockPreview: shows changes for one block ─────────────────────────────────
function BlockPreview({
    block,
    fields,
    applied,
    onApply,
}: {
    block: Block
    fields: Record<string, string>
    applied: boolean
    onApply: () => void
}) {
    const [expanded, setExpanded] = useState(false)
    const changes = countChanges(block.props as unknown as Record<string, unknown>, fields)
    const label = blockLabel(block.type)

    return (
        <div style={{
            border: `1px solid ${applied ? C.successBorder : C.border}`,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: applied ? C.successBg : C.white,
            marginBottom: 6,
        }}>
            {/* Header row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 10px',
                cursor: 'pointer',
            }} onClick={() => setExpanded(e => !e)}>
                <span style={{
                    flex: 1,
                    fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.text,
                }}>
                    {label}
                </span>
                <span style={{
                    fontFamily: FONT, fontSize: 10, color: C.muted,
                    backgroundColor: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '1px 6px',
                }}>
                    {changes.length} field{changes.length !== 1 ? 's' : ''}
                </span>
                {applied ? (
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 3,
                        fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.success,
                    }}>
                        <Check size={11} /> Applied
                    </span>
                ) : (
                    <button
                        onClick={e => { e.stopPropagation(); onApply() }}
                        style={{
                            fontFamily: FONT, fontSize: 10, fontWeight: 700,
                            color: C.primary, backgroundColor: C.primaryLight,
                            border: `1px solid ${C.primaryBorder}`,
                            borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                        }}
                    >
                        Apply
                    </button>
                )}
                {expanded ? <ChevronUp size={12} color={C.muted} /> : <ChevronDown size={12} color={C.muted} />}
            </div>

            {/* Expanded diff */}
            {expanded && (
                <div style={{
                    borderTop: `1px solid ${C.border}`,
                    padding: '8px 10px',
                    display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                    {changes.slice(0, 8).map(({ key, from, to }) => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {key.split('.').pop()?.replace(/\[\d+\]/, '') ?? key}
                            </span>
                            {from && (
                                <span style={{
                                    fontFamily: FONT, fontSize: 11, color: '#9ca3af',
                                    textDecoration: 'line-through',
                                    padding: '3px 6px', borderRadius: 4,
                                    backgroundColor: '#fef2f2',
                                    display: 'block',
                                }}>
                                    {from.length > 80 ? from.slice(0, 80) + '…' : from}
                                </span>
                            )}
                            <span style={{
                                fontFamily: FONT, fontSize: 11, color: C.text,
                                padding: '3px 6px', borderRadius: 4,
                                backgroundColor: C.successBg,
                                display: 'block',
                            }}>
                                {to.length > 80 ? to.slice(0, 80) + '…' : to}
                            </span>
                        </div>
                    ))}
                    {changes.length > 8 && (
                        <span style={{ fontFamily: FONT, fontSize: 10, color: C.muted }}>
                            + {changes.length - 8} more fields…
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export interface FillTemplatePanelProps {
    blocks: Block[]
    templateCategory?: string
    creditBalance: number | null
    onApplyBlock: (blockId: string, updatedProps: BlockProps) => void
    onApplyAll: (updates: Array<{ id: string; props: BlockProps }>) => void
    onClose: () => void
}

export function FillTemplatePanel({
    blocks,
    templateCategory,
    creditBalance,
    onApplyBlock,
    onApplyAll,
    onClose,
}: FillTemplatePanelProps) {
    const COST = 20

    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<Record<string, Record<string, string>> | null>(null)
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
    const [allApplied, setAllApplied] = useState(false)
    const [creditError, setCreditError] = useState<{ balance: number; cost: number } | null>(null)

    const hasEnoughCredits = creditBalance === null || creditBalance >= COST

    const handleFill = useCallback(async () => {
        if (!description.trim()) return
        setLoading(true)
        setError(null)
        setResult(null)
        setAppliedIds(new Set())
        setAllApplied(false)
        setCreditError(null)

        try {
            const res = await fetch('/api/ai/fill-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productDescription: description,
                    blocks: blocks.map(b => ({ id: b.id, type: b.type, props: b.props })),
                    category: templateCategory ?? 'general',
                }),
            })

            if (res.status === 401) {
                setError('Please sign in to use AI features.')
                return
            }
            if (res.status === 402) {
                const data = await res.json().catch(() => ({}))
                setCreditError({ balance: data.balance ?? 0, cost: data.cost ?? COST })
                return
            }

            const data = await res.json()
            if (!res.ok || data.error) {
                setError(data.error ?? 'Something went wrong. Please try again.')
                return
            }

            setResult(data.result)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [description, blocks, templateCategory])

    const handleApplyBlock = useCallback((blockId: string) => {
        if (!result?.[blockId]) return
        const block = blocks.find(b => b.id === blockId)
        if (!block) return
        const updatedProps = applyFlatResult(block.props as unknown as Record<string, unknown>, result[blockId])
        onApplyBlock(blockId, updatedProps)
        setAppliedIds(prev => new Set([...prev, blockId]))
    }, [result, blocks, onApplyBlock])

    const handleApplyAll = useCallback(() => {
        if (!result) return
        const updates = Object.entries(result).map(([blockId, fields]) => {
            const block = blocks.find(b => b.id === blockId)
            if (!block) return null
            return { id: blockId, props: applyFlatResult(block.props as unknown as Record<string, unknown>, fields) }
        }).filter(Boolean) as Array<{ id: string; props: BlockProps }>

        onApplyAll(updates)
        setAppliedIds(new Set(Object.keys(result)))
        setAllApplied(true)
    }, [result, blocks, onApplyAll])

    const resultBlocks = result
        ? blocks.filter(b => result[b.id] && Object.keys(result[b.id]).length > 0)
        : []

    return (
        <div style={{
            backgroundColor: C.white,
            border: `1.5px solid ${C.primaryBorder}`,
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 12,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
                background: `linear-gradient(135deg, ${C.primaryLight} 0%, #faf5ff 100%)`,
                borderBottom: `1px solid ${C.primaryBorder}`,
            }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: C.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Wand2 size={14} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.text }}>
                        AI Fill Template
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: 10, color: C.muted }}>
                        Describe your product → fills all blocks at once
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        fontFamily: FONT, fontSize: 10, fontWeight: 600,
                        color: C.primary, backgroundColor: C.primaryLight,
                        border: `1px solid ${C.primaryBorder}`,
                        borderRadius: 20, padding: '2px 7px', whiteSpace: 'nowrap',
                    }}>
                        · {COST} credits
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 3, display: 'flex', alignItems: 'center',
                        color: C.muted,
                    }}>
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '12px' }}>

                {/* Credit warning */}
                {!hasEnoughCredits && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 7,
                        padding: '8px 10px', marginBottom: 10,
                        backgroundColor: C.amberBg, border: `1px solid ${C.amberBorder}`,
                        borderRadius: 7,
                    }}>
                        <AlertTriangle size={13} color={C.amber} style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ fontFamily: FONT, fontSize: 11, color: C.amber }}>
                            You need {COST} credits. You have {creditBalance ?? 0}.
                        </span>
                    </div>
                )}

                {/* Insufficient credits from API */}
                {creditError && (
                    <div style={{
                        padding: '8px 10px', marginBottom: 10,
                        backgroundColor: C.dangerBg, border: `1px solid #fca5a5`,
                        borderRadius: 7, fontFamily: FONT, fontSize: 11, color: C.danger,
                    }}>
                        Not enough credits. You have {creditError.balance}, need {creditError.cost}.
                    </div>
                )}

                {/* Input area (only show when no result yet) */}
                {!result && (
                    <>
                        <label style={{
                            display: 'block', fontFamily: FONT, fontSize: 11,
                            fontWeight: 600, color: C.label, marginBottom: 5,
                        }}>
                            Describe your product
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={`e.g. "Sony WH-1000XM5 noise cancelling headphones, black, used but like new, $180. Amazing sound quality, 30hr battery, comes with case and cable."`}
                            rows={4}
                            style={{
                                width: '100%',
                                fontFamily: FONT, fontSize: 12, color: C.text,
                                border: `1.5px solid ${C.border}`,
                                borderRadius: 8, padding: '8px 10px',
                                resize: 'vertical', outline: 'none',
                                backgroundColor: C.white,
                                boxSizing: 'border-box',
                                lineHeight: 1.5,
                            }}
                            onFocus={e => (e.target.style.borderColor = C.primary)}
                            onBlur={e => (e.target.style.borderColor = C.border)}
                        />

                        {error && (
                            <div style={{
                                marginTop: 8,
                                padding: '7px 10px',
                                backgroundColor: C.dangerBg,
                                border: `1px solid #fca5a5`,
                                borderRadius: 7, fontFamily: FONT, fontSize: 11, color: C.danger,
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleFill}
                            disabled={loading || !description.trim() || !hasEnoughCredits}
                            style={{
                                marginTop: 10, width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                padding: '9px 14px', borderRadius: 8,
                                fontFamily: FONT, fontSize: 12, fontWeight: 700,
                                cursor: loading || !description.trim() || !hasEnoughCredits ? 'not-allowed' : 'pointer',
                                border: 'none',
                                backgroundColor: loading || !description.trim() || !hasEnoughCredits
                                    ? '#e2e8f0' : C.primary,
                                color: loading || !description.trim() || !hasEnoughCredits ? C.muted : '#fff',
                                transition: 'background-color 0.15s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                    Filling template…
                                </>
                            ) : (
                                <>
                                    <Wand2 size={13} />
                                    Fill Entire Template
                                </>
                            )}
                        </button>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </>
                )}

                {/* Results */}
                {result && (
                    <>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: 10,
                        }}>
                            <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.text }}>
                                {resultBlocks.length} block{resultBlocks.length !== 1 ? 's' : ''} ready to apply
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                    onClick={() => { setResult(null); setDescription('') }}
                                    style={{
                                        fontFamily: FONT, fontSize: 10, fontWeight: 600,
                                        color: C.muted, backgroundColor: C.bg,
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                    }}
                                >
                                    Redo
                                </button>
                                {!allApplied && (
                                    <button
                                        onClick={handleApplyAll}
                                        style={{
                                            fontFamily: FONT, fontSize: 10, fontWeight: 700,
                                            color: '#fff', backgroundColor: C.primary,
                                            border: 'none',
                                            borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                                        }}
                                    >
                                        Apply All
                                    </button>
                                )}
                                {allApplied && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.success,
                                    }}>
                                        <Check size={11} /> All Applied!
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
                            {resultBlocks.map(block => (
                                <BlockPreview
                                    key={block.id}
                                    block={block}
                                    fields={result[block.id]}
                                    applied={appliedIds.has(block.id)}
                                    onApply={() => handleApplyBlock(block.id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
