'use client'
// components/ui/VisualEditor/TemplatesTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Templates Tab
//
// Pre-made composite section presets — each is a group of blocks dropped
// together at once onto the canvas. Shown as live HTML thumbnails.
//
// Categories:
//   Full Templates  — complete listing layouts (Hero + Product + Policy)
//   Conversion      — trust row, urgency + CTA combos
//   Product         — product info section variants
//   Policy          — shipping/returns/tabs sections
//   Branding        — store header + nav bar combos
//
// Props:
//   onInsert(blocks) — adds the template blocks to the canvas
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react'
import { Search, LayoutTemplate, Zap, Package, FileText, Store, ChevronDown } from 'lucide-react'
import { Block, createBlock, assembleDocument, BlockType } from './blocks'
import { FULL_TEMPLATES } from './templates'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    inputBorder: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#ddd6fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface TemplatesTabProps {
    onInsert: (blocks: Block[]) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE DEFINITIONS
// Each template is a named set of block types + optional prop overrides
// ─────────────────────────────────────────────────────────────────────────────
// Types imported from ./templates/types.ts
import type { TemplateSection, TemplateCategoryId } from './templates'

interface TemplateCategory {
    id: TemplateCategoryId
    label: string
    Icon: React.ElementType
    color: string
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    { id: 'full', label: 'Full Templates', Icon: LayoutTemplate, color: '#7530fb' },
    { id: 'conversion', label: 'Conversion', Icon: Zap, color: '#d97706' },
    { id: 'product', label: 'Product', Icon: Package, color: '#16a34a' },
    { id: 'policy', label: 'Policy', Icon: FileText, color: '#0ea5e9' },
    { id: 'branding', label: 'Branding', Icon: Store, color: '#7530fb' },
]

const TEMPLATES: TemplateSection[] = [

    // ── FULL TEMPLATES — imported from ./templates/ ──────────────────────────
    ...FULL_TEMPLATES,

    // ── CONVERSION ────────────────────────────────────────────────────────────
    {
        id: 'conv-trust-row',
        name: 'Trust Row',
        description: 'Trust badges + seller info side by side',
        category: 'conversion',
        blocks: [
            { type: 'trust_badges' },
            { type: 'seller_info' },
        ],
    },
    {
        id: 'conv-urgency-cta',
        name: 'Urgency + CTA',
        description: 'Stock counter + buy now banner',
        category: 'conversion',
        blocks: [
            { type: 'urgency_bar' },
            { type: 'button_block', props: { label: 'Buy It Now — Limited Stock!', bgColor: '#7530fb', textColor: '#ffffff' } },
            { type: 'cta_banner' },
        ],
    },
    {
        id: 'conv-features-grid',
        name: 'Feature Grid',
        description: '3-column feature benefits with bullet points',
        category: 'conversion',
        blocks: [
            { type: 'heading', props: { text: 'Why Buy From Us?', level: 'h2' } },
            {
                type: 'three_column', props: {
                    col1Content: '<p style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;margin:0 0 6px;">Fast Dispatch</p><p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;margin:0;line-height:1.6;">Same day dispatch on orders placed before 3pm Monday–Friday.</p>',
                    col2Content: '<p style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;margin:0 0 6px;">Free Returns</p><p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;margin:0;line-height:1.6;">30-day free returns, no questions asked. Full refund guaranteed.</p>',
                    col3Content: '<p style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;margin:0 0 6px;">Authentic</p><p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;margin:0;line-height:1.6;">100% genuine products from authorised UK distributors.</p>',
                }
            },
            { type: 'trust_badges' },
        ],
    },
    {
        id: 'conv-cross-sell',
        name: 'Cross-Sell Row',
        description: 'Related items grid + CTA',
        category: 'conversion',
        blocks: [
            { type: 'divider' },
            { type: 'cross_sell' },
            { type: 'seller_info' },
        ],
    },

    // ── PRODUCT ───────────────────────────────────────────────────────────────
    {
        id: 'prod-hero-product',
        name: 'Hero Product Section',
        description: 'Large image + title + price + description',
        category: 'product',
        blocks: [
            { type: 'product_image', props: { maxWidth: 600, align: 'center', borderRadius: 8 } },
            { type: 'product_title' },
            { type: 'price_block' },
            { type: 'product_description' },
        ],
    },
    {
        id: 'prod-two-col',
        name: 'Product Two Column',
        description: 'Image left, details right',
        category: 'product',
        blocks: [
            {
                type: 'two_column', props: {
                    leftWidth: 45,
                    leftContent: '<img src="{{MAIN_IMAGE_URL}}" alt="{{PRODUCT_TITLE}}" style="width:100%;height:auto;border-radius:8px;" />',
                    rightContent: '<h2 style="font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:#1e1535;margin:0 0 10px;">{{PRODUCT_TITLE}}</h2><p style="font-family:Arial,sans-serif;font-size:22px;font-weight:900;color:#7530fb;margin:0 0 12px;">{{ITEM_PRICE}}</p><p style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;line-height:1.7;margin:0;">{{ITEM_DESCRIPTION}}</p>',
                }
            },
            { type: 'specs_table' },
        ],
    },
    {
        id: 'prod-specs-only',
        name: 'Specs & Details',
        description: 'Specifications table with description',
        category: 'product',
        blocks: [
            { type: 'heading', props: { text: 'Product Details', level: 'h2' } },
            { type: 'product_description' },
            { type: 'specs_table' },
            { type: 'bullet_list' },
        ],
    },

    // ── POLICY ────────────────────────────────────────────────────────────────
    {
        id: 'policy-full',
        name: 'Full Policy Section',
        description: 'Tabs + shipping bar + returns block',
        category: 'policy',
        blocks: [
            { type: 'policy_tabs' },
            { type: 'shipping_info' },
            { type: 'returns_policy' },
        ],
    },
    {
        id: 'policy-simple',
        name: 'Simple Policy Row',
        description: 'Shipping + returns side by side',
        category: 'policy',
        blocks: [
            {
                type: 'two_column', props: {
                    leftWidth: 50,
                    bgColor: '#f8f7ff',
                    leftContent: '<p style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#166534;margin:0 0 6px;">Shipping</p><p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;margin:0;line-height:1.6;">{{SHIPPING_TIME}} — tracked delivery. Free on all UK orders.</p>',
                    rightContent: '<p style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#075985;margin:0 0 6px;">Returns</p><p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;margin:0;line-height:1.6;">{{RETURN_POLICY}} — hassle-free returns guaranteed.</p>',
                }
            },
        ],
    },
    {
        id: 'policy-tabs-only',
        name: 'Policy Tabs',
        description: 'Tabbed Shipping / Returns / Payment / Warranty',
        category: 'policy',
        blocks: [
            { type: 'heading', props: { text: 'Buying Information', level: 'h2' } },
            { type: 'policy_tabs' },
        ],
    },

    // ── BRANDING ──────────────────────────────────────────────────────────────
    {
        id: 'brand-full-header',
        name: 'Store Header',
        description: 'Hero + nav bar + divider',
        category: 'branding',
        blocks: [
            { type: 'hero_header' },
            { type: 'nav_bar' },
            { type: 'divider', props: { lineStyle: 'gradient', widthPercent: 100, thickness: 2 } },
        ],
    },
    {
        id: 'brand-seller-cta',
        name: 'Seller CTA Footer',
        description: 'Seller info + CTA banner + trust badges',
        category: 'branding',
        blocks: [
            { type: 'divider' },
            { type: 'seller_info' },
            { type: 'cta_banner' },
            { type: 'trust_badges' },
        ],
    },
    {
        id: 'brand-nav-only',
        name: 'Navigation Bar',
        description: 'Store links row',
        category: 'branding',
        blocks: [
            { type: 'nav_bar' },
        ],
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// HTML THUMBNAIL GENERATOR
// Assembles the template blocks into HTML for the preview thumbnail
// ─────────────────────────────────────────────────────────────────────────────
function buildTemplateHtml(template: TemplateSection): string {
    const blocks = template.blocks.map(b => {
        const block = createBlock(b.type)
        if (b.props) {
            block.props = { ...block.props, ...b.props } as typeof block.props
        }
        return block
    })
    return assembleDocument(blocks)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TemplatesTab({ onInsert }: TemplatesTabProps) {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState<TemplateCategoryId | 'all'>('all')
    const [collapsed, setCollapsed] = useState<Set<TemplateCategoryId>>(new Set())
    const [inserting, setInserting] = useState<string | null>(null)

    // Filter templates
    const query = search.trim().toLowerCase()
    const filtered = useMemo(() => TEMPLATES.filter(t => {
        const matchCat = activeCategory === 'all' || t.category === activeCategory
        const matchSearch = !query ||
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query)
        return matchCat && matchSearch
    }), [query, activeCategory])

    // Group by category
    const grouped = useMemo(() => {
        const map = new Map<TemplateCategoryId, TemplateSection[]>()
        TEMPLATE_CATEGORIES.forEach(c => map.set(c.id, []))
        filtered.forEach(t => map.get(t.category)?.push(t))
        return map
    }, [filtered])

    // Handle insert
    const handleInsert = (template: TemplateSection) => {
        setInserting(template.id)
        const blocks = template.blocks.map(b => {
            const block = createBlock(b.type)
            if (b.props) {
                block.props = { ...block.props, ...b.props } as typeof block.props
            }
            return block
        })
        onInsert(blocks)
        setTimeout(() => setInserting(null), 800)
    }

    const toggleCategory = (id: TemplateCategoryId) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: C.bg,
        }}>
            {/* ── Header ── */}
            <div style={{
                padding: '14px 14px 10px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: '0 0 10px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.dark,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                }}>
                    Section Templates
                </p>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 8 }}>
                    <Search size={12} style={{
                        position: 'absolute', left: 9, top: '50%',
                        transform: 'translateY(-50%)', color: C.muted,
                        pointerEvents: 'none',
                    }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search templates..."
                        style={{
                            width: '100%', boxSizing: 'border-box' as const,
                            padding: '7px 10px 7px 28px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 8, backgroundColor: C.bg,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                            color: C.body, outline: 'none',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22` }}
                        onBlur={e => { e.currentTarget.style.borderColor = C.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                    />
                </div>

                {/* Category pills */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                    <CategoryPill
                        label="All"
                        active={activeCategory === 'all'}
                        color={C.primary}
                        onClick={() => setActiveCategory('all')}
                    />
                    {TEMPLATE_CATEGORIES.map(cat => (
                        <CategoryPill
                            key={cat.id}
                            label={cat.label}
                            active={activeCategory === cat.id}
                            color={cat.color}
                            onClick={() => setActiveCategory(cat.id)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Template list ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>

                {filtered.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <LayoutTemplate size={28} style={{ color: C.border, margin: '0 auto 10px', display: 'block' }} />
                        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>
                            No templates match "{search}"
                        </p>
                    </div>
                ) : activeCategory !== 'all' ? (
                    /* Flat list when category filter active */
                    <div style={{ padding: '4px 12px 0' }}>
                        {filtered.map(t => (
                            <TemplateCard
                                key={t.id}
                                template={t}
                                inserting={inserting === t.id}
                                onInsert={() => handleInsert(t)}
                            />
                        ))}
                    </div>
                ) : (
                    /* Grouped by category when "All" */
                    TEMPLATE_CATEGORIES.map(cat => {
                        const items = grouped.get(cat.id) || []
                        if (items.length === 0) return null
                        const isCollapsed = collapsed.has(cat.id)
                        return (
                            <div key={cat.id}>
                                {/* Category header */}
                                <button
                                    onClick={() => toggleCategory(cat.id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', padding: '8px 14px 4px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        textAlign: 'left' as const,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <cat.Icon size={12} style={{ color: cat.color }} />
                                        <span style={{
                                            fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                            fontWeight: 700, color: C.secondary,
                                            textTransform: 'uppercase' as const, letterSpacing: '0.07em',
                                        }}>
                                            {cat.label}
                                        </span>
                                        <span style={{
                                            fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                                            color: C.muted,
                                        }}>
                                            {items.length}
                                        </span>
                                    </div>
                                    <ChevronDown size={12} style={{
                                        color: C.muted,
                                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }} />
                                </button>

                                {!isCollapsed && (
                                    <div style={{ padding: '0 12px 4px' }}>
                                        {items.map(t => (
                                            <TemplateCard
                                                key={t.id}
                                                template={t}
                                                inserting={inserting === t.id}
                                                onInsert={() => handleInsert(t)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── Footer hint ── */}
            <div style={{
                padding: '10px 14px',
                borderTop: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                    color: C.muted, textAlign: 'center', lineHeight: 1.5,
                }}>
                    Templates add blocks to your canvas
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE CARD
// Shows HTML thumbnail + name + description + insert button
// ─────────────────────────────────────────────────────────────────────────────
function TemplateCard({
    template,
    inserting,
    onInsert,
}: {
    template: TemplateSection
    inserting: boolean
    onInsert: () => void
}) {
    const [hovered, setHovered] = useState(false)
    const [html] = useState(() => buildTemplateHtml(template))

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                marginBottom: 10,
                borderRadius: 10,
                border: `1.5px solid ${hovered ? C.primary : C.border}`,
                backgroundColor: C.surface,
                overflow: 'hidden',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: hovered ? `0 2px 12px ${C.primary}18` : 'none',
            }}
        >
            {/* HTML Thumbnail */}
            <div style={{
                position: 'relative', height: 120,
                overflow: 'hidden', backgroundColor: '#ffffff',
            }}>
                <div style={{
                    transform: 'scale(0.32)',
                    transformOrigin: 'top left',
                    width: '313%',
                    pointerEvents: 'none',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 14, lineHeight: 1.4, color: '#1f1d2e',
                }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* Hover overlay with insert button */}
                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(30,21,53,0.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <button
                            onClick={onInsert}
                            style={{
                                padding: '7px 18px',
                                backgroundColor: inserting ? '#16a34a' : C.primary,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 8,
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 12, fontWeight: 700,
                                cursor: inserting ? 'default' : 'pointer',
                                transition: 'background-color 0.2s',
                                boxShadow: `0 2px 8px ${C.primary}66`,
                            }}
                        >
                            {inserting ? '✓ Added!' : '+ Add to Canvas'}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '8px 10px',
                borderTop: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
            }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                        margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                        fontWeight: 700, color: hovered ? C.primary : C.dark,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        transition: 'color 0.15s',
                    }}>
                        {template.name}
                    </p>
                    <p style={{
                        margin: '1px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                        color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                    }}>
                        {template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''} · {template.description}
                    </p>
                </div>

                {/* Block count badge */}
                <span style={{
                    flexShrink: 0, padding: '2px 7px',
                    backgroundColor: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 20, fontFamily: 'DM Sans, sans-serif',
                    fontSize: 9, fontWeight: 700, color: C.muted,
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                }}>
                    {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label}
                </span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY PILL
// ─────────────────────────────────────────────────────────────────────────────
function CategoryPill({
    label, active, color, onClick,
}: {
    label: string
    active: boolean
    color: string
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '3px 9px',
                borderRadius: 20,
                border: `1px solid ${active ? color : C.border}`,
                backgroundColor: active ? color : 'transparent',
                color: active ? '#ffffff' : C.secondary,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 10, fontWeight: active ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.12s',
                whiteSpace: 'nowrap' as const,
            }}
        >
            {label}
        </button>
    )
}
