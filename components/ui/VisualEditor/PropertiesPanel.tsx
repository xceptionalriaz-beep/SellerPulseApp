'use client'
// components/ui/VisualEditor/PropertiesPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Properties Panel (Right Panel)
//
// Shows editable properties for the currently selected block.
// Every change fires onChange(updatedBlock) immediately — live updates.
//
// Three tabs matching the Stitch UI design:
//   Styles     — block-specific visual props (colour, font, spacing)
//   Attributes — content props (text, src, items, rows, toggles)
//   AI         — AI Copy Optimizer + AI Photo Studio placeholders
//
// Props:
//   block           — the currently selected Block (or null = nothing selected)
//   placeholders    — PLACEHOLDER_GROUPS from page.tsx (for insertion buttons)
//   onChange        — called with updated Block on every prop change
//   onDeselect      — called when user clicks × to deselect
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import { getVariants, hasVariants } from './variants/index'
import type { BlockVariant } from './variants/hero_header.variants'
import {
    Layout, Columns2, Columns3, Square,
    Heading, Pilcrow, List, Minus,
    Tag, BadgeDollarSign, Image, FileText, Table2,
    Camera, Megaphone, LayoutGrid,
    ShieldCheck, Truck, RotateCcw, User, Bell, Info, Package, Grid, Play,
    Sparkles, Wand2, Zap,
    AlignLeft, AlignCenter, AlignRight,
    CheckCircle2, AlertTriangle,
    MousePointer2,
    PanelTop, Navigation, Flame, Grid2x2,
    MousePointerClick, LayoutPanelTop, Code2,
    Gift, Star, File, Globe, Shield, Store, Menu,
    Clock, Share2, ChevronRight, Type, Quote,
    Check, CreditCard, HelpCircle, LayoutTemplate,
    type LucideIcon,
    Layers,
} from 'lucide-react'
import {
    Block,
    BlockType,
    BlockProps,
    getDefinition,
    CommonProps,
    HeadingProps,
    ParagraphProps,
    BulletListProps,
    DividerProps,
    ProductTitleProps,
    PriceBlockProps,
    ProductImageProps,
    ProductDescriptionProps,
    SpecsTableProps,
    ImageProps,
    BannerProps,
    GalleryRowProps,
    TrustBadgesProps,
    ShippingInfoProps,
    ReturnsPolicyProps,
    SellerInfoProps,
    CtaBannerProps,
    FullWidthSectionProps,
    TwoColumnProps,
    ThreeColumnProps,
    ContainerProps,
    PolicyTabsProps,
    NavBarProps,
    UrgencyBarProps,
    CrossSellProps,
    ButtonBlockProps,
    RectangleProps,
    HeroHeaderProps,
    RawHtmlProps,
    ConditionBadgeProps,
    ItemSpecificsProps,
} from './blocks'
import ProDropdown, { type DropdownOption } from '@/components/ui/ProDropdown'
import { auditHtml } from './audit'
import { VariantThumbnail } from './variantThumbnails'

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
    danger: '#ef4444',
    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#d97706',
    warningLight: '#fef3c7',
}

// ── Lucide icon lookup — maps icon string keys from blocks.ts to components ────
const BLOCK_ICONS: Record<string, LucideIcon> = {
    'layout': Layout,
    'columns-2': Columns2,
    'columns-3': Columns3,
    'square': Square,
    'heading': Heading,
    'pilcrow': Pilcrow,
    'list': List,
    'minus': Minus,
    'tag': Tag,
    'badge-dollar-sign': BadgeDollarSign,
    'image': Image,
    'file-text': FileText,
    'table': Table2,
    'camera': Camera,
    'megaphone': Megaphone,
    'layout-grid': LayoutGrid,
    'shield-check': ShieldCheck,
    'truck': Truck,
    'rotate-ccw': RotateCcw,
    'user': User,
    'bell': Bell,
    'info': Info,
    'alert': AlertTriangle,
    'package': Package,
    'grid': Grid,
    'columns': Columns2,
    'play': Play,
    // Conversion block icons
    'panel-top': PanelTop,
    'navigation': Navigation,
    'flame': Flame,
    'grid-2x2': Grid2x2,
    'mouse-pointer-click': MousePointerClick,
    'layout-panel-top': LayoutPanelTop,
    'code-2': Code2,
    'gift': Gift,
    'star': Star,
    'file': File,
    'globe': Globe,
    'shield': Shield,
    'store': Store,
    'menu': Menu,
    'clock': Clock,
    'share': Share2,
    'chevron-right': ChevronRight,
    'type': Type,
    'quote': Quote,
    'check': Check,
    'credit-card': CreditCard,
    'help-circle': HelpCircle,
    'layout-template': LayoutTemplate,
}

// ── Placeholder group type (mirrors PLACEHOLDER_GROUPS in page.tsx) ───────────
interface PlaceholderItem {
    label: string
    value: string
    example?: string
}
interface PlaceholderGroup {
    group: string
    items: PlaceholderItem[]
}

// ── Tab type ──────────────────────────────────────────────────────────────────
type PanelTab = 'styles' | 'attributes' | 'ai'

// ── Props ─────────────────────────────────────────────────────────────────────
interface PropertiesPanelProps {
    block: Block | null
    placeholders: PlaceholderGroup[]
    onChange: (updated: Block) => void
    onDeselect: () => void
    selectedSubSlot?: string | null
    palette?: string[]
    onPaletteChange?: (palette: string[]) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
// ─── Inline Icon Picker (used inside key_features_grid feature cards) ──────────

import { ICON_LIBRARY, ICON_CATEGORIES, CATEGORY_LABELS, getIconSvg } from './IconLibrary'

function InlineIconPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat]).map(entry => {
                const isActive = value === entry.id
                return (
                    <button
                        key={entry.id}
                        title={`${entry.label} (${entry.id})`}
                        onClick={() => onChange(entry.id)}
                        style={{
                            padding: '5px',
                            borderRadius: 6,
                            border: `1.5px solid ${isActive ? '#7530fb' : '#ede9fe'}`,
                            background: isActive ? '#f3eeff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        dangerouslySetInnerHTML={{ __html: entry.svg(isActive ? '#7530fb' : '#94a3b8', 16) }}
                    />
                )
            })}
        </div>
    )
}

export default function PropertiesPanel({
    block,
    placeholders,
    onChange,
    onDeselect,
    selectedSubSlot,
    palette = [],
    onPaletteChange,
}: PropertiesPanelProps) {
    const [activeTab, setActiveTab] = useState<PanelTab>('styles')

    // Helper — update one or more props on the current block
    const updateProps = useCallback((patch: Partial<BlockProps>) => {
        if (!block) return
        onChange({
            ...block,
            props: { ...block.props, ...patch } as BlockProps,
        })
    }, [block, onChange])

    // ─────────────────────────────────────────────────────────────────────────
    // NOTHING SELECTED
    // ─────────────────────────────────────────────────────────────────────────
    if (!block) {
        return (
            <div style={{
                width: 280,
                minWidth: 280,
                height: '100%',
                backgroundColor: C.surface,
                borderLeft: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                flexShrink: 0,
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 14,
                }}>
                    ↖
                </div>
                <p style={{
                    margin: '0 0 6px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    color: C.dark,
                    textAlign: 'center',
                }}>
                    No block selected
                </p>
                <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12,
                    color: C.muted,
                    textAlign: 'center',
                    lineHeight: 1.6,
                }}>
                    Click any block on the canvas to edit its properties here.
                </p>
            </div>
        )
    }

    const def = getDefinition(block.type)
    const props = block.props as any

    // ── Per-block compliance audit ────────────────────────────────────────────
    // Runs the same audit as the status bar, but on the rendered HTML of THIS
    // block only. Drives the badge below — the badge used to be a hard-coded
    // "100% eBay Compliant" which lied to the user whenever the block contained
    // a script tag or a http:// image.
    const blockHtml = def ? def.toHtml(props, block.id) : ''
    const blockAudit = auditHtml(blockHtml)

    // ─────────────────────────────────────────────────────────────────────────
    // PANEL WITH SELECTED BLOCK
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <PaletteContext.Provider value={{ palette, onPaletteChange }}>
            <div style={{
                width: 280,
                minWidth: 280,
                height: '100%',
                backgroundColor: C.surface,
                borderLeft: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflow: 'hidden',
            }}>
                {/* ── Header ── */}
                <div style={{
                    padding: '12px 14px 0',
                    borderBottom: `1px solid ${C.border}`,
                    backgroundColor: C.surface,
                    flexShrink: 0,
                }}>
                    {/* Block identity */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                backgroundColor: C.primaryLight,
                                border: `1px solid ${C.primaryBorder}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 15,
                                flexShrink: 0,
                            }}>
                                {(() => {
                                    const I = def?.icon ? BLOCK_ICONS[def.icon] : null
                                    return I ? <I size={16} style={{ color: C.primary }} /> : null
                                })()}
                            </div>
                            <div>
                                <p style={{
                                    margin: 0,
                                    fontFamily: 'Syne, sans-serif',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    color: C.dark,
                                }}>
                                    {def?.label}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 10,
                                    color: C.muted,
                                }}>
                                    {def?.category}
                                </p>
                            </div>
                        </div>
                        {/* Deselect */}
                        <button
                            onClick={onDeselect}
                            title="Deselect block"
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                border: `1px solid ${C.border}`,
                                backgroundColor: 'transparent',
                                cursor: 'pointer',
                                color: C.muted,
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* eBay compliant badge — reflects THIS block's actual HTML */}
                    <div
                        title={blockAudit.count === 0
                            ? 'This block passes every eBay compliance check'
                            : `Issues: ${blockAudit.issues.join(', ')}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: blockAudit.count === 0 ? C.successLight : C.warningLight,
                            border: `1px solid ${blockAudit.count === 0 ? '#86efac50' : '#fcd34d80'}`,
                            borderRadius: 20,
                            padding: '3px 10px',
                            marginBottom: 10,
                        }}>
                        {blockAudit.count === 0 ? (
                            <CheckCircle2 size={11} style={{ color: C.success, flexShrink: 0 }} />
                        ) : (
                            <AlertTriangle size={11} style={{ color: C.warning, flexShrink: 0 }} />
                        )}
                        <span style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 10,
                            fontWeight: 700,
                            color: blockAudit.count === 0 ? C.success : C.warning,
                        }}>
                            {blockAudit.count === 0
                                ? '100% eBay Compliant'
                                : `${blockAudit.count} issue${blockAudit.count > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 2 }}>
                        {(['styles', 'attributes', 'ai'] as PanelTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    padding: '6px 4px',
                                    border: 'none',
                                    borderBottom: `2px solid ${activeTab === tab ? C.primary : 'transparent'}`,
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 11,
                                    fontWeight: activeTab === tab ? 700 : 500,
                                    color: activeTab === tab ? C.primary : C.secondary,
                                    transition: 'color 0.15s, border-color 0.15s',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {tab === 'ai' ? 'AI' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab content ── */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {activeTab === 'styles' && (
                        <StylesTab block={block} props={props} updateProps={updateProps} />
                    )}
                    {activeTab === 'attributes' && (
                        <AttributesTab
                            block={block}
                            props={props}
                            placeholders={placeholders}
                            updateProps={updateProps}
                            selectedSubSlot={selectedSubSlot}
                        />
                    )}
                    {activeTab === 'ai' && (
                        <AITab block={block} onChange={onChange} />
                    )}
                </div>
            </div>
        </PaletteContext.Provider>
    )
}

function AlignButtons({ value, onChange }: { value: string; onChange: (v: 'left' | 'center' | 'right') => void }) {
    return (
        <div style={{ marginBottom: 8, width: '100%' }}>
            <p style={{ margin: '0 0 5px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>Alignment</p>
            <div style={{ display: 'flex', gap: 4, width: '100%' }}>
                {(['left', 'center', 'right'] as const).map(align => (
                    <button
                        key={align}
                        onClick={() => onChange(align)}
                        title={align.charAt(0).toUpperCase() + align.slice(1)}
                        style={{
                            flex: 1,
                            padding: '7px 0',
                            border: `1px solid ${value === align ? C.primary : C.inputBorder}`,
                            borderRadius: 6,
                            backgroundColor: value === align ? C.primaryLight : C.surface,
                            color: value === align ? C.primary : C.secondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.12s',
                        }}
                    >
                        {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                    </button>
                ))}
            </div>
        </div>
    )
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            padding: '10px 12px',
            backgroundColor: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            color: C.secondary,
            lineHeight: 1.6,
        }}>
            {children}
        </div>
    )
}

function AIToolButton({
    Icon, label, description, color, bg, border, comingSoon
}: {
    Icon: LucideIcon; label: string; description: string; color: string; bg: string; border: string; comingSoon?: boolean
}) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={comingSoon}
            title={comingSoon ? 'Coming soon' : label}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                marginBottom: 8,
                border: `1px solid ${hovered && !comingSoon ? color : border}`,
                borderRadius: 10,
                backgroundColor: hovered && !comingSoon ? bg : C.surface,
                cursor: comingSoon ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                opacity: comingSoon ? 0.65 : 1,
            }}
        >
            <div style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                backgroundColor: bg,
                border: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
            }}>
                <Icon size={18} style={{ color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color }}>
                        {label}
                    </p>
                    {comingSoon && (
                        <span style={{
                            backgroundColor: '#f3f4f6',
                            color: C.muted,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 9,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Soon
                        </span>
                    )}
                </div>
                <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, lineHeight: 1.4 }}>
                    {description}
                </p>
            </div>
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW COMPOUND EDITORS — for conversion blocks
// ─────────────────────────────────────────────────────────────────────────────

function PolicyTabsEditor({
    tabs,
    onChange,
}: {
    tabs: Array<{ label: string; content: string }>
    onChange: (tabs: Array<{ label: string; content: string }>) => void
}) {
    return (
        <div>
            {tabs.map((tab, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 10, backgroundColor: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <input
                            value={tab.label}
                            onChange={e => {
                                const next = [...tabs]
                                next[i] = { ...next[i], label: e.target.value }
                                onChange(next)
                            }}
                            placeholder="Tab label"
                            style={{ ...inputStyle, fontWeight: 600, width: '60%' }}
                        />
                        {tabs.length > 1 && (
                            <button onClick={() => onChange(tabs.filter((_, j) => j !== i))}
                                style={{ ...smallBtnStyle, color: C.danger }}>×</button>
                        )}
                    </div>
                    <textarea
                        value={tab.content}
                        rows={3}
                        onChange={e => {
                            const next = [...tabs]
                            next[i] = { ...next[i], content: e.target.value }
                            onChange(next)
                        }}
                        placeholder="Tab content..."
                        style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
                    />
                </div>
            ))}
            {tabs.length < 6 && (
                <button onClick={() => onChange([...tabs, { label: 'New Tab', content: 'Tab content here...' }])}
                    style={addBtnStyle}>
                    + Add tab
                </button>
            )}
        </div>
    )
}

function NavLinksEditor({
    links,
    onChange,
}: {
    links: Array<{ label: string; url: string }>
    onChange: (links: Array<{ label: string; url: string }>) => void
}) {
    return (
        <div>
            {links.map((link, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 4, marginBottom: 5, alignItems: 'center' }}>
                    <input
                        value={link.label}
                        placeholder="Label"
                        onChange={e => {
                            const next = [...links]
                            next[i] = { ...next[i], label: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, fontSize: 11 }}
                    />
                    <input
                        value={link.url}
                        placeholder="URL"
                        onChange={e => {
                            const next = [...links]
                            next[i] = { ...next[i], url: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, fontSize: 11 }}
                    />
                    <button onClick={() => onChange(links.filter((_, j) => j !== i))}
                        style={{ ...smallBtnStyle, color: C.danger }}>×</button>
                </div>
            ))}
            {links.length < 8 && (
                <button onClick={() => onChange([...links, { label: 'New Link', url: '#' }])}
                    style={addBtnStyle}>
                    + Add link
                </button>
            )}
        </div>
    )
}

function CrossSellItemsEditor({
    items,
    onChange,
}: {
    items: Array<{ imageUrl: string; title: string; price: string; url: string }>
    onChange: (items: Array<{ imageUrl: string; title: string; price: string; url: string }>) => void
}) {
    return (
        <div>
            {items.map((item, i) => (
                <div key={i} style={{ marginBottom: 10, padding: 8, backgroundColor: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: C.muted }}>
                            PRODUCT {i + 1}
                        </span>
                        <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                            style={{ ...smallBtnStyle, color: C.danger }}>×</button>
                    </div>
                    <TextInput
                        label=""
                        value={item.imageUrl}
                        onChange={v => { const n = [...items]; n[i] = { ...n[i], imageUrl: v }; onChange(n) }}
                    />
                    <input value={item.title} placeholder="Product title / placeholder"
                        onChange={e => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; onChange(n) }}
                        style={{ ...inputStyle, marginBottom: 4, fontSize: 11 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <input value={item.price} placeholder="Price"
                            onChange={e => { const n = [...items]; n[i] = { ...n[i], price: e.target.value }; onChange(n) }}
                            style={{ ...inputStyle, fontSize: 11 }} />
                        <input value={item.url} placeholder="Link URL"
                            onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; onChange(n) }}
                            style={{ ...inputStyle, fontSize: 11 }} />
                    </div>
                </div>
            ))}
            {items.length < 4 && (
                <button onClick={() => onChange([...items, {
                    imageUrl: `{{IMAGE_${items.length + 2}_URL}}`,
                    title: `{{RELATED_TITLE_${items.length + 1}}}`,
                    price: `{{RELATED_PRICE_${items.length + 1}}}`,
                    url: '#',
                }])} style={addBtnStyle}>
                    + Add product
                </button>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLE OBJECTS
// ─────────────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '5px 8px',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 6,
    backgroundColor: C.surface,
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 12,
    color: C.body,
    outline: 'none',
}

const smallBtnStyle: React.CSSProperties = {
    width: 22,
    height: 22,
    border: `1px solid ${C.border}`,
    borderRadius: 5,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    padding: 0,
    flexShrink: 0,
    color: C.secondary,
}

const addBtnStyle: React.CSSProperties = {
    marginTop: 4,
    padding: '5px 10px',
    border: `1px dashed ${C.primaryBorder}`,
    borderRadius: 7,
    backgroundColor: 'transparent',
    color: C.primary,
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
}
// ─────────────────────────────────────────────────────────────────────────────
function VariantPicker({
    blockType,
    currentVariant,
    onChange,
}: {
    blockType: string
    currentVariant: string
    onChange: (variantId: string) => void
}) {
    const variants = getVariants(blockType)
    if (!variants) return null

    return (
        <div style={{ marginBottom: 4 }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 14px 8px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.primaryLight,
            }}>
                <Layers size={14} style={{ color: C.primary, flexShrink: 0 }} />
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: C.primary }}>
                    Layout Style
                </p>
            </div>

            {/* Variant cards grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 6,
                padding: '10px 10px 4px',
                width: '100%',
                boxSizing: 'border-box',
            }}>
                {variants.map((variant: BlockVariant) => {
                    const isSelected = currentVariant === variant.id
                    return (
                        <button
                            key={variant.id}
                            onClick={() => onChange(variant.id)}
                            title={variant.description}
                            style={{
                                width: '100%',
                                minWidth: 0,
                                boxSizing: 'border-box',
                                padding: '8px 6px',
                                border: `2px solid ${isSelected ? C.primary : C.border}`,
                                borderRadius: 8,
                                backgroundColor: isSelected ? C.primaryLight : C.surface,
                                cursor: 'pointer',
                                textAlign: 'center' as const,
                                transition: 'all 0.12s',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Mini visual thumbnail */}
                            <VariantThumbnail variantId={variant.id} isSelected={isSelected} />
                            <p style={{
                                margin: '5px 0 0',
                                width: '100%',
                                display: 'block',
                                boxSizing: 'border-box',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10,
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? C.primary : C.secondary,
                                whiteSpace: 'nowrap' as const,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {variant.label}
                            </p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// Mini SVG thumbnails for each Hero Header variant
// ── Variant thumbnail SVGs — add a new entry here when adding a new variant ──
// The picker itself is fully dynamic — thumbnails fall back to auto-generated
function StylesTab({
    block,
    props,
    updateProps,
}: {
    block: Block
    props: any
    updateProps: (patch: Partial<BlockProps>) => void
}) {
    return (
        <div style={{ padding: '0 0 24px' }}>

            {/* ── Variant Picker — shown at very top when block has variants ── */}
            {hasVariants(block.type) && (
                <VariantPicker
                    blockType={block.type}
                    currentVariant={(props as any).variant ?? (props as any).layoutStyle ?? (block.type === 'features' || (block.type as string) === 'features_bar' ? 'feat-simple-centered' : block.type === 'trust_badge_block' || (block.type as string) === 'trust_badge' || (block.type as string) === 'trust_satisfaction' ? 'trust-banner-soft' : block.type === 'rectangle' || (block.type as string) === 'shape' ? 'rect-solid-fill' : block.type === 'urgency_bar' || (block.type as string) === 'urgency' ? 'urgency-classic-pulse' : block.type === 'why_buy_from_us' || (block.type as string) === 'why_buy' ? 'why-classic-centered' : block.type === 'faq_block' || (block.type as string) === 'faq' || (block.type as string) === 'faq_section' ? 'faq-classic-stacked' : block.type === 'bullet_list' ? 'bl-classic-check' : block.type === 'paragraph' ? 'para-classic-plain' : block.type === 'heading' ? 'hd-classic-accent-bar' : block.type === 'product_title' || (block.type as string) === 'title' ? 'pt-classic-baseline' : block.type === 'highlight_text' || (block.type as string) === 'highlight' ? 'ht-classic-neon-strip' : block.type === 'international_shipping' || (block.type as string) === 'international' ? 'is-classic-amber-notice' : block.type === 'breadcrumb_bar' || (block.type as string) === 'breadcrumb' ? 'bb-classic-inline' : block.type === 'hero_header' ? 'gradient' : block.type === 'product_description' ? 'plain' : block.type === 'product_variants' ? 'swatches-sizes' : block.type === 'whats_in_the_box' ? 'simple-list' : block.type === 'hero_product' ? 'hp-default' : block.type === 'cta_banner' ? 'ctab-trust-bar' : block.type === 'seller_info' ? 'authority-split' : block.type === 'logo_bar' ? 'flat-row' : block.type === 'bundle_deal' ? 'tri-tier-columns' : block.type === 'price_tag' ? 'classic-strike' : block.type === 'store_footer' ? 'classic-dark-band' : block.type === 'category_nav' ? 'cat-classic-dark' : (block.type as string) === 'free_shipping_banner' || (block.type as string) === 'free_shipping' ? 'ship-express-courier-strip' : block.type === 'item_specifics' || (block.type as string) === 'specifics_table' ? 'is-dual-column-zebra-card' : block.type === 'authenticity_guarantee' || (block.type as string) === 'authenticity' ? 'auth-ebay-blue-official-shield' : block.type === 'condition_details' || (block.type as string) === 'condition' ? 'cd-cosmetic-grade-split' : block.type === 'compatibility_table' || (block.type as string) === 'compatibility' ? 'compat-classic-zebra-table' : block.type === 'product_comparison' || (block.type as string) === 'comparison' ? 'comp-classic-header-table' : block.type === 'key_features_grid' ? 'feat-classic-cards-grid' : block.type === 'vat_notice' || (block.type as string) === 'vat' ? 'vat-classic-card' : block.type === 'feedback_score' || (block.type as string) === 'feedback' ? 'fb-classic-split-card' : block.type === 'pull_quote' || (block.type as string) === 'quote' ? 'pq-classic-serif-centered' : block.type === 'section_label' || (block.type as string) === 'label' ? 'sl-classic-pill-capsule' : block.type === 'testimonial_block' || (block.type as string) === 'testimonials' || (block.type as string) === 'testimonial' ? 'test-classic-grid' : block.type === 'info_box' || (block.type as string) === 'infobox' || (block.type as string) === 'info' ? 'info-classic-banner' : block.type === 'shipping_info' || (block.type as string) === 'shipping_info_bar' ? 'ship-classic-card' : block.type === 'store_header' || (block.type as string) === 'storeheader' ? 'sh-classic-banner' : block.type === 'divider' || (block.type as string) === 'separator' ? 'minimal_diamond' : 'default')}
                    onChange={v => updateProps({ variant: v } as any)}
                />
            )}

            <div style={{ padding: '14px 14px 0' }}>
                {/* ── Universal: Background ── */}
                <UniversalBackground props={props as any} updateProps={p => updateProps(p as any)} />

                {/* ── Common: Spacing ── */}
                <Section title="Spacing">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <NumberInput label="Top" value={props.paddingTop ?? 16} min={0} max={120}
                            onChange={v => updateProps({ paddingTop: v } as any)} suffix="px" />
                        <NumberInput label="Bottom" value={props.paddingBottom ?? 16} min={0} max={120}
                            onChange={v => updateProps({ paddingBottom: v } as any)} suffix="px" />
                        <NumberInput label="Left" value={props.paddingLeft ?? 24} min={0} max={120}
                            onChange={v => updateProps({ paddingLeft: v } as any)} suffix="px" />
                        <NumberInput label="Right" value={props.paddingRight ?? 24} min={0} max={120}
                            onChange={v => updateProps({ paddingRight: v } as any)} suffix="px" />
                    </div>
                </Section>

                {/* ── Block-specific style props ── */}
                <BlockStyleProps block={block} props={props} updateProps={updateProps} />

                {/* ── Universal: Border + Shadow + Typography ── */}
                <UniversalBorder props={props as any} updateProps={p => updateProps(p as any)} />
                <UniversalShadow props={props as any} updateProps={p => updateProps(p as any)} />
                <UniversalTypography props={props as any} updateProps={p => updateProps(p as any)} />
            </div>
        </div>
    )
}

// Block-specific style controls dispatched by type
function BlockStyleProps({ block, props, updateProps }: {
    block: Block, props: any, updateProps: (p: any) => void
}) {
    switch (block.type) {

        case 'heading':
            return (
                <>
                    <Section title="Typography">
                        <ColorRow label="Text colour" value={props.color ?? '#1e1535'} onChange={v => updateProps({ color: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 22} min={12} max={48} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput label="Weight" value={props.fontWeight ?? '700'}
                            options={[{ v: '400', l: 'Regular' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }, { v: '900', l: 'Black' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                        <SliderInput label="Line height" value={props.lineHeight ?? 1.2} min={1} max={2.5} step={0.05} onChange={v => updateProps({ lineHeight: v })} />
                        <SliderInput label="Letter spacing" value={props.letterSpacing ?? 0} min={0} max={5} step={0.5} suffix="px" onChange={v => updateProps({ letterSpacing: v })} />
                        <AlignButtons value={props.align ?? 'left'} onChange={v => updateProps({ align: v })} />
                    </Section>
                    <Section title="Accent border">
                        <ToggleRow label="Show left border" value={props.borderBottom ?? true} onChange={v => updateProps({ borderBottom: v })} />
                        {props.borderBottom && (
                            <ColorRow label="Border colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        )}
                    </Section>
                </>
            )

        case 'paragraph':
            return (
                <Section title="Typography">
                    <ColorRow label="Text colour" value={props.color ?? '#6b7280'} onChange={v => updateProps({ color: v })} />
                    <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={28} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    <SelectInput label="Weight" value={props.fontWeight ?? '400'}
                        options={[{ v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }]}
                        onChange={v => updateProps({ fontWeight: v })} />
                    <SliderInput label="Line height" value={props.lineHeight ?? 1.7} min={1} max={3} step={0.05} onChange={v => updateProps({ lineHeight: v })} />
                    <SliderInput label="Letter spacing" value={props.letterSpacing ?? 0} min={0} max={5} step={0.5} suffix="px" onChange={v => updateProps({ letterSpacing: v })} />
                    <AlignButtons value={props.align ?? 'left'} onChange={v => updateProps({ align: v })} />
                </Section>
            )

        case 'bullet_list':
            return (
                <Section title="Typography">
                    <ColorRow label="Text colour" value={props.color ?? '#1f1d2e'} onChange={v => updateProps({ color: v })} />
                    <ColorRow label="Bullet colour" value={props.bulletColor ?? '#7530fb'} onChange={v => updateProps({ bulletColor: v })} />
                    <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    <SelectInput label="Weight" value={props.fontWeight ?? '400'}
                        options={[{ v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }]}
                        onChange={v => updateProps({ fontWeight: v })} />
                    <SliderInput label="Line height" value={props.lineHeight ?? 1.6} min={1} max={3} step={0.05} onChange={v => updateProps({ lineHeight: v })} />
                    <SliderInput label="Letter spacing" value={props.letterSpacing ?? 0} min={0} max={5} step={0.5} suffix="px" onChange={v => updateProps({ letterSpacing: v })} />
                    <SelectInput label="Bullet style" value={props.bulletStyle ?? 'check'}
                        options={[{ v: 'disc', l: 'Disc' }, { v: 'check', l: 'Check' }, { v: 'arrow', l: 'Arrow' }, { v: 'star', l: 'Star' }]}
                        onChange={v => updateProps({ bulletStyle: v })} />
                </Section>
            )

        case 'divider':
            return (
                <Section title="Divider style">
                    <ColorRow label="Colour" value={props.color ?? '#ede9fe'} onChange={v => updateProps({ color: v })} />
                    <SelectInput label="Style" value={props.lineStyle ?? 'solid'}
                        options={[{ v: 'solid', l: 'Solid' }, { v: 'dashed', l: 'Dashed' }, { v: 'dotted', l: 'Dotted' }, { v: 'gradient', l: 'Gradient' }]}
                        onChange={v => updateProps({ lineStyle: v })} />
                    <SliderInput label="Thickness" value={props.thickness ?? 1} min={1} max={8} suffix="px" onChange={v => updateProps({ thickness: v })} />
                    <SliderInput label="Width" value={props.widthPercent ?? 100} min={20} max={100} suffix="%" onChange={v => updateProps({ widthPercent: v })} />
                </Section>
            )

        case 'product_title':
            return (
                <>

                    <Section title="Title">
                        <ColorRow label="Title colour" value={props.color ?? '#1e1535'} onChange={v => updateProps({ color: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 24} min={14} max={56} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput
                            label="Weight"
                            value={props.fontWeight ?? '800'}
                            options={[
                                { v: '600', l: 'Semibold' },
                                { v: '700', l: 'Bold' },
                                { v: '800', l: 'Extrabold' },
                                { v: '900', l: 'Black' },
                            ]}
                            onChange={v => updateProps({ fontWeight: v })}
                        />
                        <SliderInput label="Line height" value={props.lineHeight ?? 1.3} min={1} max={2.5} step={0.05} onChange={v => updateProps({ lineHeight: v })} />
                        <SliderInput label="Letter spacing" value={props.letterSpacing ?? 0} min={0} max={5} step={0.5} suffix="px" onChange={v => updateProps({ letterSpacing: v })} />
                        <AlignButtons value={props.align ?? 'left'} onChange={v => updateProps({ align: v })} />
                    </Section>
                    <Section title="Condition text">
                        <ColorRow
                            label="Condition colour"
                            value={props.conditionColor ?? '#6b7280'}
                            onChange={v => updateProps({ conditionColor: v })}
                        />
                        <SliderInput
                            label="Condition font size"
                            value={props.conditionFontSize ?? 13}
                            min={10} max={20} suffix="px"
                            onChange={v => updateProps({ conditionFontSize: v })}
                        />
                    </Section>
                </>
            )

        case 'price_block': {
            const pv = props.variant ?? 'simple'
            return (
                <>
                    <Section title="Price">
                        <ColorRow label="Price colour" value={props.priceColor ?? '#7530fb'} onChange={v => updateProps({ priceColor: v })} />
                        <SliderInput label="Price size" value={props.priceFontSize ?? 32} min={18} max={56} suffix="px" onChange={v => updateProps({ priceFontSize: v })} />
                        <SelectInput label="Weight" value={props.priceFontWeight ?? '900'}
                            options={[{ v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }, { v: '900', l: 'Black' }]}
                            onChange={v => updateProps({ priceFontWeight: v })} />
                        <AlignButtons value={props.priceAlign ?? 'left'} onChange={v => updateProps({ priceAlign: v })} />
                    </Section>
                    {pv === 'sale' && (
                        <>
                            <Section title="Original price">
                                <ColorRow label="Strikethrough colour" value={props.originalColor ?? '#9ca3af'} onChange={v => updateProps({ originalColor: v })} />
                                <SliderInput label="Size" value={props.originalFontSize ?? 18} min={10} max={28} suffix="px" onChange={v => updateProps({ originalFontSize: v })} />
                            </Section>
                            <Section title="Savings badge">
                                <ColorRow label="Badge background" value={props.badgeBg ?? '#b8fa33'} onChange={v => updateProps({ badgeBg: v })} />
                                <ColorRow label="Badge text" value={props.badgeColor ?? '#1e1535'} onChange={v => updateProps({ badgeColor: v })} />
                                <SliderInput label="Badge radius" value={props.badgeBorderRadius ?? 4} min={0} max={24} suffix="px" onChange={v => updateProps({ badgeBorderRadius: v })} />
                            </Section>
                        </>
                    )}
                    {pv === 'urgency' && (
                        <Section title="Urgency bar">
                            <ColorRow label="Urgency text" value={props.urgencyColor ?? '#991b1b'} onChange={v => updateProps({ urgencyColor: v })} />
                            <ColorRow label="Urgency background" value={props.urgencyBg ?? '#fef2f2'} onChange={v => updateProps({ urgencyBg: v })} />
                            <ToggleRow label="Show badge" value={props.showBadge ?? false} onChange={v => updateProps({ showBadge: v })} />
                            {props.showBadge && (
                                <>
                                    <ColorRow label="Badge bg" value={props.badgeBg ?? '#b8fa33'} onChange={v => updateProps({ badgeBg: v })} />
                                    <ColorRow label="Badge text" value={props.badgeColor ?? '#1e1535'} onChange={v => updateProps({ badgeColor: v })} />
                                </>
                            )}
                        </Section>
                    )}
                    {pv === 'auction' && (
                        <Section title="Auction">
                            <ToggleRow label="Reserve met" value={props.reserveMet ?? true} onChange={v => updateProps({ reserveMet: v })} />
                        </Section>
                    )}
                    {pv === 'bundle' && (
                        <Section title="Bundle tiers">
                            <SliderInput label="Tier 1 qty" value={props.bundleTier1Qty ?? 2} min={2} max={10} onChange={v => updateProps({ bundleTier1Qty: v })} />
                            <SliderInput label="Tier 2 qty" value={props.bundleTier2Qty ?? 3} min={2} max={10} onChange={v => updateProps({ bundleTier2Qty: v })} />
                            <SliderInput label="Tier 3 qty" value={props.bundleTier3Qty ?? 5} min={2} max={20} onChange={v => updateProps({ bundleTier3Qty: v })} />
                        </Section>
                    )}
                    {pv === 'finance' && (
                        <Section title="Finance">
                            <InfoBox>Set the monthly price in the Attributes tab.</InfoBox>
                        </Section>
                    )}
                    {pv === 'trade' && (
                        <Section title="Trade">
                            <InfoBox>Trade variant uses a dark slate background. Edit prices in the Attributes tab.</InfoBox>
                        </Section>
                    )}
                    {pv === 'free-shipping' && (
                        <Section title="Delivery badge">
                            <ColorRow label="Badge colour" value={props.deliveryColor ?? '#16a34a'} onChange={v => updateProps({ deliveryColor: v })} />
                            <ToggleRow label="Show original price" value={props.showOriginal ?? false} onChange={v => updateProps({ showOriginal: v })} />
                            {props.showOriginal && (
                                <ColorRow label="Original colour" value={props.originalColor ?? '#9ca3af'} onChange={v => updateProps({ originalColor: v })} />
                            )}
                        </Section>
                    )}
                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'product_image': {
            const pv = props.variant ?? 'single'
            return (
                <>
                    {(pv === 'single' || pv === 'zoom') && (
                        <Section title="Image">
                            <SliderInput label="Max width" value={props.maxWidth ?? 600} min={100} max={700} suffix="px" onChange={v => updateProps({ maxWidth: v })} />
                            <SliderInput label="Border radius" value={props.borderRadius ?? 12} min={0} max={60} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            <SelectInput label="Image fit" value={props.objectFit ?? 'contain'}
                                options={[{ v: 'contain', l: 'Contain' }, { v: 'cover', l: 'Cover' }, { v: 'fill', l: 'Fill' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                            {pv === 'single' && <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />}
                            <SelectInput label="Shadow" value={props.shadowPreset ?? 'none'}
                                options={[{ v: 'none', l: 'None' }, { v: 'soft', l: 'Soft' }, { v: 'medium', l: 'Medium' }, { v: 'hard', l: 'Hard' }, { v: 'card', l: 'Card' }]}
                                onChange={v => updateProps({ shadowPreset: v })} />
                            <ToggleRow label="Show border" value={props.showBorder ?? false} onChange={v => updateProps({ showBorder: v })} />
                            {props.showBorder && (
                                <>
                                    <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                                    <SliderInput label="Border width" value={props.borderWidth ?? 1} min={1} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                                </>
                            )}
                            <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        </Section>
                    )}
                    {pv === 'zoom' && (
                        <Section title="Zoom Style">
                            <ToggleRow label="Show zoom hint" value={props.showZoomHint ?? true} onChange={v => updateProps({ showZoomHint: v })} />
                        </Section>
                    )}
                    {pv === 'comparison' && (
                        <Section title="Comparison">
                            <SelectInput label="Image fit" value={props.objectFit ?? 'contain'}
                                options={[{ v: 'contain', l: 'Contain' }, { v: 'cover', l: 'Cover' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                            <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            <ToggleRow label="Show border" value={props.showBorder ?? false} onChange={v => updateProps({ showBorder: v })} />
                            {props.showBorder && <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />}
                        </Section>
                    )}
                    {pv === 'lifestyle' && (
                        <Section title="Lifestyle Shot">
                            <SliderInput label="Min height" value={props.minHeight ?? 320} min={200} max={600} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                            <SliderInput label="Name font size" value={props.nameFontSize ?? 14} min={10} max={36} suffix="px" onChange={v => updateProps({ nameFontSize: v })} />
                            <ColorRow label="Name colour" value={props.lifestyleNameColor ?? '#ffffff'} onChange={v => updateProps({ lifestyleNameColor: v })} />
                            <ColorRow label="Overlay tint" value={props.overlayColor ?? 'rgba(0,0,0,0.45)'} onChange={v => updateProps({ overlayColor: v })} />
                            <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        </Section>
                    )}
                    {pv === 'polaroid' && (
                        <Section title="Polaroid">
                            <SliderInput label="Max width" value={props.maxWidth ?? 440} min={200} max={600} suffix="px" onChange={v => updateProps({ maxWidth: v })} />
                            <SelectInput label="Image fit" value={props.objectFit ?? 'cover'}
                                options={[{ v: 'cover', l: 'Cover' }, { v: 'contain', l: 'Contain' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                            <ColorRow label="Caption colour" value={props.captionColor ?? '#4b5563'} onChange={v => updateProps({ captionColor: v })} />
                            <SliderInput label="Caption size" value={props.captionFontSize ?? 13} min={10} max={20} suffix="px" onChange={v => updateProps({ captionFontSize: v })} />
                            <TextInput label="Suffix (blank to hide)" value={props.polaroidSuffix ?? 'Premium Edition'} onChange={v => updateProps({ polaroidSuffix: v })} />
                            <ColorRow label="Background" value={props.bgColor ?? '#f5f0e8'} onChange={v => updateProps({ bgColor: v })} />
                        </Section>
                    )}
                    {pv === 'before-after' && (
                        <Section title="Before / After">
                            <ColorRow label="Accent colour" value={props.accentColor ?? '#1d4ed8'} onChange={v => updateProps({ accentColor: v })} />
                            <SliderInput label="Border radius" value={props.borderRadius ?? 6} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        </Section>
                    )}
                    {pv === 'magazine' && (
                        <Section title="Magazine Grid">
                            <SliderInput label="Border radius" value={props.borderRadius ?? 6} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            <SelectInput label="Image fit" value={props.objectFit ?? 'cover'}
                                options={[{ v: 'cover', l: 'Cover' }, { v: 'contain', l: 'Contain' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                        </Section>
                    )}
                    {pv === 'inverted-magazine-grid' && (
                        <Section title="Inverted Magazine Grid">
                            <SliderInput label="Border radius" value={props.borderRadius ?? 6} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            <SelectInput label="Image fit" value={props.objectFit ?? 'cover'}
                                options={[{ v: 'cover', l: 'Cover' }, { v: 'contain', l: 'Contain' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                        </Section>
                    )}
                    {(pv === 'split' || pv === 'split-right') && (
                        <>
                            <Section title="Layout">
                                <SelectInput label="Image position" value={props.imagePosition ?? 'left'}
                                    options={[{ v: 'left', l: 'Image left, text right' }, { v: 'right', l: 'Image right, text left' }]}
                                    onChange={v => updateProps({ imagePosition: v })} />
                                <SliderInput label="Image width" value={props.imageWidthPercent ?? 45} min={30} max={60} suffix="%" onChange={v => updateProps({ imageWidthPercent: v })} />
                                <SelectInput label="Vertical align" value={props.verticalAlign ?? 'middle'}
                                    options={[{ v: 'top', l: 'Top' }, { v: 'middle', l: 'Middle' }, { v: 'bottom', l: 'Bottom' }]}
                                    onChange={v => updateProps({ verticalAlign: v })} />
                                <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            </Section>
                            <Section title="Description text">
                                <ColorRow label="Text colour" value={props.descriptionColor ?? '#475569'} onChange={v => updateProps({ descriptionColor: v })} />
                                <SliderInput label="Font size" value={props.descriptionFontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ descriptionFontSize: v })} />
                            </Section>
                        </>
                    )}
                    {pv === 'gallery' && (
                        <Section title="Gallery">
                            <InfoBox>Thumbnails render as uniform 1:1 squares — first thumb is highlighted as the active image.</InfoBox>
                            <SliderInput label="Thumbnail count" value={props.imageCount ?? 4} min={2} max={5} onChange={v => updateProps({ imageCount: v })} />
                            <SliderInput label="Main image max height" value={props.mainImageMaxHeight ?? 420} min={200} max={700} suffix="px" onChange={v => updateProps({ mainImageMaxHeight: v })} />
                            <SliderInput label="Thumb radius" value={props.thumbBorderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ thumbBorderRadius: v })} />
                            <ToggleRow label="Thumb border" value={props.showThumbBorder ?? true} onChange={v => updateProps({ showThumbBorder: v })} />
                            {props.showThumbBorder && <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />}
                            <SelectInput label="Image fit" value={props.objectFit ?? 'contain'}
                                options={[{ v: 'contain', l: 'Contain' }, { v: 'cover', l: 'Cover' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                            <ToggleRow label="Show scroll hint" value={props.showScrollHint ?? true} onChange={v => updateProps({ showScrollHint: v })} />
                            <ColorRow label="Background" value={props.bgColor ?? '#f8fafc'} onChange={v => updateProps({ bgColor: v })} />
                        </Section>
                    )}
                    {pv === 'fullwidth' && (
                        <Section title="Full Width">
                            <SliderInput label="Min height" value={props.minHeight ?? 300} min={100} max={600} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                            <ColorRow label="Overlay tint" value={props.overlayColor ?? 'rgba(0,0,0,0)'} onChange={v => updateProps({ overlayColor: v })} />
                            <InfoBox>Use overlay tint to darken the image. Add overlay text in the Attributes tab.</InfoBox>
                        </Section>
                    )}
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={(props as any).paddingTop ?? 12} onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={(props as any).paddingBottom ?? 12} onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={(props as any).paddingLeft ?? 24} onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={(props as any).paddingRight ?? 24} onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'product_description': {
            const pdv = props.variant ?? 'plain'
            const showAccent = ['accent-bar', 'feature-box', 'split-story', 'card-elevated'].includes(pdv)
            const isFeatureBox = pdv === 'feature-box'
            const isDarkLuxury = pdv === 'dark-luxury'
            const isSplitStory = pdv === 'split-story'
            return (
                <>
                    {/* ── Title section ── */}
                    <Section title="Title">
                        <ToggleRow
                            label="Show title"
                            value={props.showTitle ?? true}
                            onChange={v => updateProps({ showTitle: v })}
                        />
                        {(props.showTitle ?? true) && (
                            <>
                                <TextInput
                                    label="Title text"
                                    value={props.titleText ?? 'Product Description'}
                                    onChange={v => updateProps({ titleText: v })}
                                />
                                <ColorRow
                                    label="Title colour"
                                    value={props.titleColor ?? '#1e1535'}
                                    onChange={v => updateProps({ titleColor: v })}
                                />
                                <SliderInput
                                    label="Title font size"
                                    value={props.titleFontSize ?? 16}
                                    min={12} max={32} suffix="px"
                                    onChange={v => updateProps({ titleFontSize: v })}
                                />
                                <SelectInput
                                    label="Title font weight"
                                    value={props.titleFontWeight ?? '700'}
                                    options={[
                                        { v: '400', l: 'Regular' },
                                        { v: '500', l: 'Medium' },
                                        { v: '600', l: 'Semibold' },
                                        { v: '700', l: 'Bold' },
                                        { v: '800', l: 'Extrabold' },
                                    ]}
                                    onChange={v => updateProps({ titleFontWeight: v })}
                                />
                                <SliderInput
                                    label="Title letter spacing"
                                    value={props.titleLetterSpacing ?? 0}
                                    min={0} max={8} step={0.5} suffix="px"
                                    onChange={v => updateProps({ titleLetterSpacing: v })}
                                />
                                <AlignButtons
                                    value={props.titleAlign ?? 'left'}
                                    onChange={v => updateProps({ titleAlign: v })}
                                />
                            </>
                        )}
                    </Section>

                    {/* ── Body Text ── */}
                    <Section title="Body Text">
                        <ColorRow
                            label="Text colour"
                            value={props.color ?? '#6b7280'}
                            onChange={v => updateProps({ color: v })}
                        />
                        <SliderInput
                            label="Font size"
                            value={props.fontSize ?? 14}
                            min={10} max={22} suffix="px"
                            onChange={v => updateProps({ fontSize: v })}
                        />
                        <SelectInput
                            label="Font weight"
                            value={props.fontWeight ?? '400'}
                            options={[
                                { v: '300', l: 'Light' },
                                { v: '400', l: 'Regular' },
                                { v: '500', l: 'Medium' },
                                { v: '600', l: 'Semibold' },
                                { v: '700', l: 'Bold' },
                            ]}
                            onChange={v => updateProps({ fontWeight: v })}
                        />
                        <SliderInput
                            label="Line height"
                            value={props.lineHeight ?? 1.8}
                            min={1} max={3} step={0.1}
                            onChange={v => updateProps({ lineHeight: v })}
                        />
                        <SliderInput
                            label="Letter spacing"
                            value={props.letterSpacing ?? 0}
                            min={0} max={6} step={0.5} suffix="px"
                            onChange={v => updateProps({ letterSpacing: v })}
                        />
                        <AlignButtons
                            value={props.textAlign ?? 'left'}
                            onChange={v => updateProps({ textAlign: v })}
                        />
                    </Section>

                    {/* ── Accent colour — shown for accent-bar, feature-box, split-story, card-elevated ── */}
                    {showAccent && (
                        <Section title="Accent Colour">
                            <ColorRow
                                label="Accent colour"
                                value={props.accentColor ?? '#7530fb'}
                                onChange={v => updateProps({ accentColor: v })}
                            />
                            <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#9ca3af' }}>
                                Pulls from your brand colour automatically
                            </p>
                        </Section>
                    )}

                    {/* ── Feature pills — feature-box only ── */}
                    {isFeatureBox && (
                        <Section title="Feature Pills">
                            <TextInput
                                label="Pill 1"
                                value={props.feature1 ?? '✓ Premium Quality'}
                                onChange={v => updateProps({ feature1: v })}
                            />
                            <TextInput
                                label="Pill 2"
                                value={props.feature2 ?? '✓ Fast Dispatch'}
                                onChange={v => updateProps({ feature2: v })}
                            />
                            <TextInput
                                label="Pill 3"
                                value={props.feature3 ?? '✓ 30-Day Returns'}
                                onChange={v => updateProps({ feature3: v })}
                            />
                        </Section>
                    )}

                    {/* ── Dark luxury controls ── */}
                    {isDarkLuxury && (
                        <Section title="Dark Background">
                            <ColorRow
                                label="Background colour"
                                value={props.darkBg ?? '#1e1535'}
                                onChange={v => updateProps({ darkBg: v })}
                            />
                            <SliderInput
                                label="Border radius"
                                value={props.borderRadius ?? 0}
                                min={0} max={24} suffix="px"
                                onChange={v => updateProps({ borderRadius: v })}
                            />
                        </Section>
                    )}

                    {/* ── Split story controls ── */}
                    {isSplitStory && (
                        <Section title="Split Story">
                            <ToggleRow
                                label="Left column italic"
                                value={props.splitItalic ?? true}
                                onChange={v => updateProps({ splitItalic: v })}
                            />
                            <p style={{ margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#9ca3af', lineHeight: 1.6 }}>
                                Text splits at the midpoint sentence — story left, detail right.
                            </p>
                        </Section>
                    )}

                    {/* ── Dark luxury background note ── */}
                    {isDarkLuxury && (
                        <Section title="Background">
                            <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#9ca3af' }}>
                                Dark Luxury uses its own background colour above — the universal background is ignored for this variant.
                            </p>
                        </Section>
                    )}

                    {/* ── Card note ── */}
                    {pdv === 'card-elevated' && (
                        <Section title="Background Note">
                            <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#9ca3af' }}>
                                The card itself is always white. The background colour (above) shows as the outer area behind the card.
                            </p>
                        </Section>
                    )}

                    {/* ── Background colour — plain, accent-bar, card-elevated, split-story ── */}
                    {!isDarkLuxury && (
                        <Section title="Background">
                            <ColorRow
                                label="Background colour"
                                value={props.bgColor ?? '#ffffff'}
                                onChange={v => updateProps({ bgColor: v })}
                            />
                        </Section>
                    )}

                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 20} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 20} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 24} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 24} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )
        }

        case 'specs_table': {
            const pv = props.variant ?? 'full'
            return (
                <>
                    <Section title="Header">
                        <ColorRow label="Header background" value={props.headerBg ?? '#1e1535'} onChange={v => updateProps({ headerBg: v })} />
                        <ColorRow label="Header text" value={props.headerText ?? '#ffffff'} onChange={v => updateProps({ headerText: v })} />
                        <ToggleRow label="Show title" value={props.showTitle ?? true} onChange={v => updateProps({ showTitle: v })} />
                    </Section>
                    {(pv === 'full' || pv === 'two-column' || pv === 'highlighted') && (
                        <Section title="Rows">
                            <ColorRow label="Row background" value={props.rowBg ?? '#ffffff'} onChange={v => updateProps({ rowBg: v })} />
                            <ColorRow label="Alt row background" value={props.altRowBg ?? '#f8fafc'} onChange={v => updateProps({ altRowBg: v })} />
                            <ColorRow label="Border colour" value={props.borderColor ?? '#e5e7eb'} onChange={v => updateProps({ borderColor: v })} />
                            <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={16} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        </Section>
                    )}
                    {pv === 'zebra' && (
                        <Section title="Zebra colours">
                            <ColorRow label="Accent colour" value={props.headerBg ?? '#7530fb'} onChange={v => updateProps({ headerBg: v })} />
                        </Section>
                    )}
                    {/* ── Page background ── */}
                    <Section title="Background">
                        <ColorRow label="Block background" value={(props as any).bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v } as any)} />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'image':
            return (
                <>

                    <Section title="Layout">
                        <SliderInput label="Width" value={props.width ?? 100} min={10} max={props.widthUnit === 'px' ? 700 : 100} suffix={props.widthUnit ?? '%'} onChange={v => updateProps({ width: v })} />
                        <SelectInput
                            label="Width unit"
                            value={props.widthUnit ?? '%'}
                            options={[{ v: '%', l: 'Percent (%)' }, { v: 'px', l: 'Pixels (px)' }]}
                            onChange={v => updateProps({ widthUnit: v })}
                        />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={60} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                </>
            )

        case 'banner': {
            const bv = (props as any).variant ?? 'simple'
            return (
                <>
                    {/* ── Background ── */}
                    <Section title="Background">
                        {bv !== 'minimal-bordered' && bv !== 'floating-card' && (
                            <>
                                <ToggleRow label="Use gradient" value={props.bgGradient ?? false} onChange={v => updateProps({ bgGradient: v })} />
                                {props.bgGradient ? (
                                    <>
                                        <ColorRow label="Gradient from" value={(props as any).bgGradientFrom ?? '#7530fb'} onChange={v => updateProps({ bgGradientFrom: v } as any)} />
                                        <ColorRow label="Gradient to" value={(props as any).bgGradientTo ?? '#1e1535'} onChange={v => updateProps({ bgGradientTo: v } as any)} />
                                    </>
                                ) : (
                                    <ColorRow label="Background colour" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                                )}
                            </>
                        )}
                        {(bv === 'minimal-bordered' || bv === 'floating-card') && (
                            <InfoBox>Background is fixed white for this style.</InfoBox>
                        )}
                    </Section>

                    {/* ── Text colours ── */}
                    <Section title="Text Colours">
                        <ColorRow label="Heading colour" value={props.headingColor ?? '#ffffff'} onChange={v => updateProps({ headingColor: v })} />
                        <ColorRow label="Sub text colour" value={props.subColor ?? 'rgba(255,255,255,0.75)'} onChange={v => updateProps({ subColor: v })} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                    </Section>

                    {/* ── CTA Button ── */}
                    {bv !== 'minimal-bordered' && bv !== 'floating-card' && bv !== 'diagonal-accent-hero' && (
                        <Section title="CTA Button">
                            <ColorRow label="Button background" value={(props as any).ctaBgColor ?? '#b8fa33'} onChange={v => updateProps({ ctaBgColor: v } as any)} />
                            <ColorRow label="Button text" value={(props as any).ctaTextColor ?? '#1e1535'} onChange={v => updateProps({ ctaTextColor: v } as any)} />
                        </Section>
                    )}

                    {/* ── Badge ── */}
                    <Section title="Badge">
                        <TextInput label="Badge text" value={props.badgeText ?? ''} onChange={v => updateProps({ badgeText: v })} />
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#fff'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Badge colour" value={props.badgeColor ?? '#7530fb'} onChange={v => updateProps({ badgeColor: v })} />
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SliderInput label="Heading size" value={props.headingSize ?? 24} min={14} max={48} suffix="px" onChange={v => updateProps({ headingSize: v })} />
                        <SelectInput label="Heading weight" value={props.fontWeight ?? '700'}
                            options={[{ v: '400', l: 'Regular' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }, { v: '900', l: 'Black' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                    </Section>

                    {/* ── Layout ── */}
                    <Section title="Layout">
                        <SliderInput label="Min height" value={props.minHeight ?? 80} min={40} max={300} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>

                    {/* ── Padding ── */}
                    <Section title="Padding">
                        <SliderInput label="Top" value={props.paddingTop ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                        <SliderInput label="Right" value={props.paddingRight ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingRight: v })} />
                        <SliderInput label="Bottom" value={props.paddingBottom ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                        <SliderInput label="Left" value={props.paddingLeft ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingLeft: v })} />
                    </Section>

                    {/* ── Split Image ── */}
                    {bv === 'split-image-text' && (
                        <>
                            <Section title="Image">
                                <TextInput label="Image URL" value={props.imageUrl ?? ''} onChange={v => updateProps({ imageUrl: v })} />
                                <SelectInput label="Image position" value={props.imagePosition ?? 'left'}
                                    options={[{ v: 'left', l: 'Image left, text right' }, { v: 'right', l: 'Image right, text left' }]} onChange={v => updateProps({ imagePosition: v })} />
                                <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            </Section>
                        </>
                    )}
                </>
            )
        }

        case 'cta_banner': {
            const cv = (props as any).variant ?? 'ctab-trust-bar'
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Min height" value={props.minHeight ?? 80} min={40} max={300} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                    </Section>

                    {/* ── Colours: shown for all variants ── */}
                    <Section title="Colours">
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                        {cv !== 'ctab-flash-deal' && cv !== 'ctab-dark-premium' && (
                            <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        )}
                        <ColorRow label="Heading colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Subtext colour" value={props.subTextColor ?? '#6b7280'} onChange={v => updateProps({ subTextColor: v })} />
                    </Section>

                    {/* ── Flash Deal Urgency ── */}
                    {cv === 'ctab-flash-deal' && (
                        <Section title="Flash Deal">
                            <InfoBox>Gradient is fixed red-to-orange for urgency. Accent colour controls the button tint.</InfoBox>
                        </Section>
                    )}

                    {/* ── Gradient Hero ── */}
                    {cv === 'ctab-gradient-hero' && (
                        <Section title="Gradient">
                            <ColorRow label="Gradient from" value={(props as any).gradientFrom ?? '#7530fb'} onChange={v => updateProps({ gradientFrom: v } as any)} />
                            <ColorRow label="Gradient to" value={(props as any).gradientTo ?? '#0a0a0f'} onChange={v => updateProps({ gradientTo: v } as any)} />
                            <SliderInput label="Gradient angle" value={(props as any).bgGradientDir ?? 135} min={0} max={360} suffix="°" onChange={v => updateProps({ bgGradientDir: v } as any)} />
                        </Section>
                    )}

                    {/* ── Split Action ── */}
                    {cv === 'ctab-split-action' && (
                        <Section title="Background">
                            <ToggleRow label="Use gradient" value={props.bgGradient ?? false} onChange={v => updateProps({ bgGradient: v })} />
                            {props.bgGradient && (
                                <>
                                    <ColorRow label="Gradient from" value={(props as any).gradientFrom ?? '#7530fb'} onChange={v => updateProps({ gradientFrom: v } as any)} />
                                    <ColorRow label="Gradient to" value={(props as any).gradientTo ?? '#1e1535'} onChange={v => updateProps({ gradientTo: v } as any)} />
                                    <SliderInput label="Gradient angle" value={(props as any).bgGradientDir ?? 135} min={0} max={360} suffix="°" onChange={v => updateProps({ bgGradientDir: v } as any)} />
                                </>
                            )}
                        </Section>
                    )}

                    {/* ── Dark Premium ── */}
                    {cv === 'ctab-dark-premium' && (
                        <Section title="Dark Premium">
                            <InfoBox>Gold outer border and purple inner border are fixed for the premium look. Accent colour controls the purple border.</InfoBox>
                        </Section>
                    )}

                    {/* ── Social Proof ── */}
                    {cv === 'ctab-social-proof' && (
                        <Section title="Social Proof">
                            <InfoBox>Stars are fixed gold. Accent colour controls the rating number and store link.</InfoBox>
                        </Section>
                    )}

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SliderInput label="Heading size" value={props.headingSize ?? 26} min={14} max={48} suffix="px" onChange={v => updateProps({ headingSize: v })} />
                        <SelectInput label="Heading weight" value={props.fontWeight ?? '700'}
                            options={[{ v: '400', l: 'Regular' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }, { v: '900', l: 'Black' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                        {cv !== 'ctab-ribbon' && cv !== 'ctab-announcement' && (
                            <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                        )}
                    </Section>
                </>
            )
        }

        case 'trust_badges': {
            const pv = props.variant ?? 'row'
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Subtext colour" value={props.subTextColor ?? '#6b7280'} onChange={v => updateProps({ subTextColor: v })} />
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#f0f9ff'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#bfdbfe'} onChange={v => updateProps({ borderColor: v })} />
                        {(pv === 'row' || pv === 'grid') && (
                            <>
                                <ColorRow label="Icon colour" value={props.iconColor ?? '#7530fb'} onChange={v => updateProps({ iconColor: v })} />
                                <ColorRow label="Icon background" value={props.iconBg ?? '#f5f3ff'} onChange={v => updateProps({ iconBg: v })} />
                            </>
                        )}
                    </Section>
                    {(pv === 'row' || pv === 'grid') && (
                        <Section title="Layout">
                            <SliderInput label="Border radius" value={props.borderRadius ?? 10} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                        </Section>
                    )}
                    {pv === 'credibility' && (
                        <Section title="Credibility">
                            <ColorRow label="Accent (stars/badge)" value={props.iconColor ?? '#f59e0b'} onChange={v => updateProps({ iconColor: v })} />
                        </Section>
                    )}
                    <Section title="Background">
                        <ColorRow label="Block background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )
        }

        case 'shipping_info':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f0fdf4'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#166534'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Icon colour" value={props.iconColor ?? '#16a34a'} onChange={v => updateProps({ iconColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#16a34a'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput label="Font family" value={(props as any).fontFamily ?? 'inherit'} options={[{ v: 'inherit', l: 'Theme default' }, { v: 'Arial, Helvetica, sans-serif', l: 'Arial' }, { v: 'Georgia, serif', l: 'Georgia' }, { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' }, { v: 'Verdana, sans-serif', l: 'Verdana' }]} onChange={v => updateProps({ fontFamily: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'returns_policy':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#eff6ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e40af'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Icon colour" value={props.iconColor ?? '#3b82f6'} onChange={v => updateProps({ iconColor: v })} />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                </>
            )

        case 'seller_info':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )

        case 'full_width_section':
            return (
                <>
                    <Section title="Background">
                        <ColorRow label="Background colour" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                    </Section>
                    <Section title="Border">
                        <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                        <SliderInput label="Border width" value={props.borderWidth ?? 0} min={0} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                    <AdvancedSection>
                        <Section title="Inner padding">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <SliderInput label="Top" value={props.innerPaddingTop ?? 0} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingTop: v })} />
                                <SliderInput label="Bottom" value={props.innerPaddingBottom ?? 0} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingBottom: v })} />
                                <SliderInput label="Left" value={props.innerPaddingLeft ?? 0} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingLeft: v })} />
                                <SliderInput label="Right" value={props.innerPaddingRight ?? 0} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingRight: v })} />
                            </div>
                        </Section>
                        <Section title="Content alignment">
                            <SelectInput
                                label="Horizontal align"
                                value={props.contentAlign ?? 'left'}
                                options={[{ v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' }]}
                                onChange={v => updateProps({ contentAlign: v })}
                            />
                        </Section>
                        <Section title="Width cap">
                            <ToggleRow label="Cap inner content width" value={props.capWidth ?? false} onChange={v => updateProps({ capWidth: v })} />
                            {props.capWidth && (
                                <SliderInput label="Max inner width" value={props.innerMaxWidth ?? 600} min={400} max={700} suffix="px" onChange={v => updateProps({ innerMaxWidth: v })} />
                            )}
                        </Section>
                    </AdvancedSection>
                </>
            )

        case 'container':
            return (
                <>
                    <Section title="Container">
                        <SliderInput label="Max width" value={props.maxWidth ?? 600} min={300} max={700} suffix="px" onChange={v => updateProps({ maxWidth: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                        <SliderInput label="Border width" value={props.borderWidth ?? 1} min={0} max={4} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                    </Section>
                    <AdvancedSection>
                        <Section title="Inner padding">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <SliderInput label="Top" value={props.innerPaddingTop ?? 20} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingTop: v })} />
                                <SliderInput label="Bottom" value={props.innerPaddingBottom ?? 20} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingBottom: v })} />
                                <SliderInput label="Left" value={props.innerPaddingLeft ?? 24} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingLeft: v })} />
                                <SliderInput label="Right" value={props.innerPaddingRight ?? 24} min={0} max={80} suffix="px" onChange={v => updateProps({ innerPaddingRight: v })} />
                            </div>
                        </Section>
                        <Section title="Colours">
                            <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                            <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        </Section>
                        <Section title="Content alignment">
                            <SelectInput
                                label="Text align"
                                value={props.textAlign ?? 'left'}
                                options={[{ v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' }]}
                                onChange={v => updateProps({ textAlign: v })}
                            />
                        </Section>
                        <Section title="Overflow">
                            <ToggleRow label="Clip overflow content" value={props.overflowHidden ?? false} onChange={v => updateProps({ overflowHidden: v })} />
                        </Section>
                    </AdvancedSection>
                </>
            )

        case 'two_column':
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Left column width" value={props.leftWidth ?? 50} min={20} max={80} suffix="%" onChange={v => updateProps({ leftWidth: v })} />
                        <SliderInput label="Column gap" value={props.gap ?? 16} min={0} max={48} suffix="px" onChange={v => updateProps({ gap: v })} />
                    </Section>
                    <Section title="Column colours">
                        <ColorRow label="Left background" value={props.leftBg ?? '#ffffff'} onChange={v => updateProps({ leftBg: v })} />
                        <ColorRow label="Right background" value={props.rightBg ?? '#ffffff'} onChange={v => updateProps({ rightBg: v })} />
                    </Section>
                    <AdvancedSection>
                        <Section title="Vertical alignment">
                            <SelectInput
                                label="Align columns"
                                value={props.colAlign ?? 'top'}
                                options={[{ v: 'top', l: 'Top' }, { v: 'middle', l: 'Middle' }, { v: 'bottom', l: 'Bottom' }]}
                                onChange={v => updateProps({ colAlign: v })}
                            />
                        </Section>
                        <Section title="Column padding">
                            <SliderInput label="Left col padding" value={props.leftPadding ?? 0} min={0} max={48} suffix="px" onChange={v => updateProps({ leftPadding: v })} />
                            <SliderInput label="Right col padding" value={props.rightPadding ?? 0} min={0} max={48} suffix="px" onChange={v => updateProps({ rightPadding: v })} />
                        </Section>
                        <Section title="Column border radius">
                            <SliderInput label="Left col radius" value={props.leftRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ leftRadius: v })} />
                            <SliderInput label="Right col radius" value={props.rightRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ rightRadius: v })} />
                        </Section>
                        <Section title="Divider">
                            <ToggleRow label="Show column divider" value={props.showDivider ?? false} onChange={v => updateProps({ showDivider: v })} />
                            {props.showDivider && (
                                <>
                                    <ColorRow label="Divider colour" value={props.dividerColor ?? '#ede9fe'} onChange={v => updateProps({ dividerColor: v })} />
                                    <SliderInput label="Divider width" value={props.dividerWidth ?? 1} min={1} max={8} suffix="px" onChange={v => updateProps({ dividerWidth: v })} />
                                </>
                            )}
                        </Section>
                        <Section title="Mobile">
                            <ToggleRow label="Stack columns on mobile" value={props.stackMobile ?? true} onChange={v => updateProps({ stackMobile: v })} />
                            {props.stackMobile && (
                                <SelectInput
                                    label="Stack order"
                                    value={props.stackOrder ?? 'left-first'}
                                    options={[{ v: 'left-first', l: 'Left column first' }, { v: 'right-first', l: 'Right column first' }]}
                                    onChange={v => updateProps({ stackOrder: v })}
                                />
                            )}
                        </Section>
                    </AdvancedSection>
                </>
            )

        case 'three_column':
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Column gap" value={props.gap ?? 12} min={0} max={48} suffix="px" onChange={v => updateProps({ gap: v })} />
                    </Section>
                    <Section title="Column colours">
                        <ColorRow label="Col 1 background" value={props.col1Bg ?? '#ffffff'} onChange={v => updateProps({ col1Bg: v })} />
                        <ColorRow label="Col 2 background" value={props.col2Bg ?? '#ffffff'} onChange={v => updateProps({ col2Bg: v })} />
                        <ColorRow label="Col 3 background" value={props.col3Bg ?? '#ffffff'} onChange={v => updateProps({ col3Bg: v })} />
                    </Section>
                    <AdvancedSection>
                        <Section title="Custom column widths">
                            <ToggleRow label="Use custom widths" value={props.customWidths ?? false} onChange={v => updateProps({ customWidths: v })} />
                            {props.customWidths && (
                                <>
                                    <SliderInput label="Col 1 width" value={props.col1Width ?? 33} min={10} max={80} suffix="%" onChange={v => updateProps({ col1Width: v })} />
                                    <SliderInput label="Col 2 width" value={props.col2Width ?? 34} min={10} max={80} suffix="%" onChange={v => updateProps({ col2Width: v })} />
                                    <SliderInput label="Col 3 width" value={props.col3Width ?? 33} min={10} max={80} suffix="%" onChange={v => updateProps({ col3Width: v })} />
                                    <InfoBox>Widths should add up to 100%.</InfoBox>
                                </>
                            )}
                        </Section>
                        <Section title="Vertical alignment">
                            <SelectInput
                                label="Align columns"
                                value={props.colAlign ?? 'top'}
                                options={[{ v: 'top', l: 'Top' }, { v: 'middle', l: 'Middle' }, { v: 'bottom', l: 'Bottom' }]}
                                onChange={v => updateProps({ colAlign: v })}
                            />
                        </Section>
                        <Section title="Column padding">
                            <SliderInput label="Inner padding (all cols)" value={props.colPadding ?? 0} min={0} max={48} suffix="px" onChange={v => updateProps({ colPadding: v })} />
                        </Section>
                        <Section title="Column border radius">
                            <SliderInput label="Border radius (all cols)" value={props.colRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ colRadius: v })} />
                        </Section>
                        <Section title="Dividers">
                            <ToggleRow label="Show column dividers" value={props.showDivider ?? false} onChange={v => updateProps({ showDivider: v })} />
                            {props.showDivider && (
                                <>
                                    <ColorRow label="Divider colour" value={props.dividerColor ?? '#ede9fe'} onChange={v => updateProps({ dividerColor: v })} />
                                    <SliderInput label="Divider width" value={props.dividerWidth ?? 1} min={1} max={8} suffix="px" onChange={v => updateProps({ dividerWidth: v })} />
                                </>
                            )}
                        </Section>
                        <Section title="Mobile">
                            <ToggleRow label="Stack columns on mobile" value={props.stackMobile ?? true} onChange={v => updateProps({ stackMobile: v })} />
                        </Section>
                    </AdvancedSection>
                </>
            )

        case 'four_column':
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Column gap" value={props.gap ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ gap: v })} />
                    </Section>
                    <Section title="Column backgrounds">
                        <ColorRow label="Col 1 background" value={props.col1Bg ?? '#ffffff'} onChange={v => updateProps({ col1Bg: v })} />
                        <ColorRow label="Col 2 background" value={props.col2Bg ?? '#ffffff'} onChange={v => updateProps({ col2Bg: v })} />
                        <ColorRow label="Col 3 background" value={props.col3Bg ?? '#ffffff'} onChange={v => updateProps({ col3Bg: v })} />
                        <ColorRow label="Col 4 background" value={props.col4Bg ?? '#ffffff'} onChange={v => updateProps({ col4Bg: v })} />
                    </Section>
                    <AdvancedSection>
                        <Section title="Custom column widths">
                            <ToggleRow label="Use custom widths" value={props.customWidths ?? false} onChange={v => updateProps({ customWidths: v })} />
                            {props.customWidths && (
                                <>
                                    <SliderInput label="Col 1 width" value={props.col1Width ?? 25} min={10} max={60} suffix="%" onChange={v => updateProps({ col1Width: v })} />
                                    <SliderInput label="Col 2 width" value={props.col2Width ?? 25} min={10} max={60} suffix="%" onChange={v => updateProps({ col2Width: v })} />
                                    <SliderInput label="Col 3 width" value={props.col3Width ?? 25} min={10} max={60} suffix="%" onChange={v => updateProps({ col3Width: v })} />
                                    <SliderInput label="Col 4 width" value={props.col4Width ?? 25} min={10} max={60} suffix="%" onChange={v => updateProps({ col4Width: v })} />
                                    <InfoBox>Widths should add up to 100%.</InfoBox>
                                </>
                            )}
                        </Section>
                        <Section title="Vertical alignment">
                            <SelectInput
                                label="Align columns"
                                value={props.colAlign ?? 'top'}
                                options={[{ v: 'top', l: 'Top' }, { v: 'middle', l: 'Middle' }, { v: 'bottom', l: 'Bottom' }]}
                                onChange={v => updateProps({ colAlign: v })}
                            />
                        </Section>
                        <Section title="Column padding">
                            <SliderInput label="Inner padding (all cols)" value={props.colPadding ?? 0} min={0} max={40} suffix="px" onChange={v => updateProps({ colPadding: v })} />
                        </Section>
                        <Section title="Column border radius">
                            <SliderInput label="Border radius (all cols)" value={props.colRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ colRadius: v })} />
                        </Section>
                        <Section title="Mobile">
                            <ToggleRow label="Stack to 2 cols on mobile" value={props.stackTo2 ?? true} onChange={v => updateProps({ stackTo2: v })} />
                            <ToggleRow label="Stack to 1 col on mobile" value={props.stackTo1 ?? false} onChange={v => updateProps({ stackTo1: v })} />
                        </Section>
                    </AdvancedSection>
                </>
            )

        case 'spacer':
            return (
                <>
                    <Section title="Height">
                        <SliderInput label="Top spacing" value={props.paddingTop ?? 24} min={4} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                        <SliderInput label="Bottom spacing" value={props.paddingBottom ?? 24} min={4} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                    </Section>
                </>
            )

        case 'border_box':
            return (
                <>
                    <Section title="Border">
                        <ColorRow label="Border colour" value={props.borderColor ?? '#7530fb'} onChange={v => updateProps({ borderColor: v })} />
                        <SliderInput label="Border width" value={props.borderWidth ?? 2} min={1} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                        <SelectInput label="Border style" value={props.borderStyle ?? 'solid'}
                            options={[{ v: 'solid', l: 'Solid' }, { v: 'dashed', l: 'Dashed' }, { v: 'dotted', l: 'Dotted' }, { v: 'double', l: 'Double' }]}
                            onChange={v => updateProps({ borderStyle: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                    <Section title="Inner padding">
                        <SliderInput label="Padding top" value={props.innerPaddingTop ?? 20} min={0} max={60} suffix="px" onChange={v => updateProps({ innerPaddingTop: v })} />
                        <SliderInput label="Padding bottom" value={props.innerPaddingBottom ?? 20} min={0} max={60} suffix="px" onChange={v => updateProps({ innerPaddingBottom: v })} />
                        <SliderInput label="Padding left" value={props.innerPaddingLeft ?? 24} min={0} max={60} suffix="px" onChange={v => updateProps({ innerPaddingLeft: v })} />
                        <SliderInput label="Padding right" value={props.innerPaddingRight ?? 24} min={0} max={60} suffix="px" onChange={v => updateProps({ innerPaddingRight: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput label="Font weight" value={props.fontWeight ?? '400'}
                            options={[{ v: '300', l: 'Light' }, { v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                        <SliderInput label="Line height" value={props.lineHeight ?? 1.7} min={1} max={3} step={0.1} onChange={v => updateProps({ lineHeight: v })} />
                    </Section>
                    <Section title="Shadow">
                        <ToggleRow label="Show shadow" value={props.showShadow ?? false} onChange={v => updateProps({ showShadow: v })} />
                        {props.showShadow && (
                            <SelectInput label="Shadow intensity" value={props.shadowPreset ?? 'soft'}
                                options={[{ v: 'soft', l: 'Soft' }, { v: 'medium', l: 'Medium' }, { v: 'hard', l: 'Hard' }]}
                                onChange={v => updateProps({ shadowPreset: v })} />
                        )}
                    </Section>
                </>
            )

        case 'sidebar_layout':
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Image column width" value={props.imageWidth ?? 70} min={30} max={75} suffix="%" onChange={v => updateProps({ imageWidth: v })} />
                        <SliderInput label="Column gap" value={props.gap ?? 0} min={0} max={32} suffix="px" onChange={v => updateProps({ gap: v })} />
                        <SelectInput
                            label="Image side"
                            value={props.imageSide ?? 'left'}
                            options={[{ v: 'left', l: 'Image left' }, { v: 'right', l: 'Image right' }]}
                            onChange={v => updateProps({ imageSide: v })}
                        />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                    <AdvancedSection>
                        <Section title="Vertical alignment">
                            <SelectInput
                                label="Align columns"
                                value={props.colAlign ?? 'top'}
                                options={[{ v: 'top', l: 'Top' }, { v: 'middle', l: 'Middle' }, { v: 'bottom', l: 'Bottom' }]}
                                onChange={v => updateProps({ colAlign: v })}
                            />
                        </Section>
                        <Section title="Content padding">
                            <SliderInput label="Content col padding" value={props.contentPadding ?? 16} min={0} max={60} suffix="px" onChange={v => updateProps({ contentPadding: v })} />
                        </Section>
                        <Section title="Image">
                            <SliderInput label="Image border radius" value={props.imageRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ imageRadius: v })} />
                            <ColorRow label="Image background" value={props.imageBg ?? '#f3f4f6'} onChange={v => updateProps({ imageBg: v })} />
                        </Section>
                        <Section title="Mobile">
                            <ToggleRow label="Stack on mobile" value={props.stackMobile ?? true} onChange={v => updateProps({ stackMobile: v })} />
                            {props.stackMobile && (
                                <SelectInput
                                    label="Stack order"
                                    value={props.mobileOrder ?? 'image-first'}
                                    options={[{ v: 'image-first', l: 'Image first' }, { v: 'content-first', l: 'Content first' }]}
                                    onChange={v => updateProps({ mobileOrder: v })}
                                />
                            )}
                        </Section>
                    </AdvancedSection>
                </>
            )

        case 'gallery_row':
            return (
                <>
                    <Section title="Layout">
                        <ToggleRow label="Show main image" value={props.showMain ?? true} onChange={v => updateProps({ showMain: v })} />
                        <SliderInput label="Gap" value={props.gap ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ gap: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 6} min={0} max={30} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                    <Section title="Image style">
                        <SelectInput
                            label="Image fit"
                            value={props.objectFit ?? 'cover'}
                            options={[
                                { v: 'cover', l: 'Cover — fill frame' },
                                { v: 'contain', l: 'Contain — show full' },
                            ]}
                            onChange={v => updateProps({ objectFit: v })}
                        />
                        <SliderInput label="Thumbnail height" value={props.thumbHeight ?? 80} min={40} max={200} suffix="px" onChange={v => updateProps({ thumbHeight: v })} />
                    </Section>
                </>
            )

        case 'policy_tabs': {
            const pv = props.variant ?? 'tabbed'
            return (
                <>
                    <Section title="Active tab">
                        <ColorRow label="Active background" value={props.activeBg ?? '#7530fb'} onChange={v => updateProps({ activeBg: v })} />
                        <ColorRow label="Active text" value={props.activeText ?? '#ffffff'} onChange={v => updateProps({ activeText: v })} />
                    </Section>
                    <Section title="Inactive tab">
                        <ColorRow label="Inactive background" value={props.inactiveBg ?? '#f3f4f6'} onChange={v => updateProps({ inactiveBg: v })} />
                        <ColorRow label="Inactive text" value={props.inactiveText ?? '#6b7280'} onChange={v => updateProps({ inactiveText: v })} />
                    </Section>
                    <Section title="Content">
                        <ColorRow label="Content background" value={props.contentBg ?? '#ffffff'} onChange={v => updateProps({ contentBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e5e7eb'} onChange={v => updateProps({ borderColor: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={16} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                </>
            )
        }

        case 'nav_bar': {
            const pv = props.variant ?? 'dark'
            return (
                <>
                    <Section title="Links">
                        <ColorRow label="Text colour" value={props.textColor ?? '#94a3b8'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Hover colour" value={props.hoverColor ?? '#7530fb'} onChange={v => updateProps({ hoverColor: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 12} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput label="Weight" value={props.fontWeight ?? '600'}
                            options={[{ v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                        <SliderInput label="Letter spacing" value={props.letterSpacing ?? 3} min={0} max={10} step={0.5} suffix="px" onChange={v => updateProps({ letterSpacing: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                    {(pv === 'dark' || pv === 'centered' || pv === 'left-aligned') && (
                        <Section title="Background">
                            <ColorRow label="Background" value={props.bgColor ?? '#1e293b'} onChange={v => updateProps({ bgColor: v })} />
                        </Section>
                    )}
                    {pv === 'pills' && (
                        <Section title="Pills">
                            <ColorRow label="Active pill colour" value={props.hoverColor ?? '#7530fb'} onChange={v => updateProps({ hoverColor: v })} />
                        </Section>
                    )}
                    {pv === 'underline' && (
                        <Section title="Underline">
                            <ColorRow label="Accent colour" value={props.hoverColor ?? '#7530fb'} onChange={v => updateProps({ hoverColor: v })} />
                        </Section>
                    )}
                </>
            )
        }

        case 'category_nav': {
            const cnv = (props as any).variant ?? 'cat-classic-dark'
            return (
                <>
                    {/* ── Background ── */}
                    <Section title="Background">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                    </Section>

                    {/* ── Colours ── */}
                    <Section title="Colours">
                        <ColorRow label="Link colour" value={props.linkColor ?? 'rgba(255,255,255,0.8)'} onChange={v => updateProps({ linkColor: v })} />
                        <ColorRow label="Active colour" value={props.activeColor ?? '#b8fa33'} onChange={v => updateProps({ activeColor: v })} />
                        {cnv === 'cat-minimalist-divider' && (
                            <ColorRow label="Separator colour" value={props.borderColor ?? '#cbd5e1'} onChange={v => updateProps({ borderColor: v })} />
                        )}
                        {cnv === 'cat-elite-luxury' && (
                            <ColorRow label="Gold accent" value={(props as any).accentColor ?? '#d97706'} onChange={v => updateProps({ accentColor: v } as any)} />
                        )}
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput label="Font weight" value={props.fontWeight ?? '600'}
                            options={[{ v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                        <SliderInput label="Letter spacing" value={props.letterSpacing ?? 0} min={0} max={10} step={0.5} suffix="px" onChange={v => updateProps({ letterSpacing: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                        <SelectInput label="Font family" value={(props as any).fontFamily ?? ''}
                            options={[{ v: '', l: 'Default (Arial)' }, { v: 'Georgia, serif', l: 'Georgia' }, { v: 'Verdana, sans-serif', l: 'Verdana' }, { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' }, { v: 'monospace', l: 'Monospace' }]}
                            onChange={v => updateProps({ fontFamily: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 10} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 10} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )
        }

        case 'urgency_bar':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#fee2e2'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#991b1b'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Dot colour" value={props.iconColor ?? '#ef4444'} onChange={v => updateProps({ iconColor: v })} />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput label="Font weight" value={props.fontWeight ?? '700'}
                            options={[{ v: '400', l: 'Regular' }, { v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={20} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <ToggleRow label="Show pulse dot" value={props.showIcon ?? true} onChange={v => updateProps({ showIcon: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                </>
            )

        case 'cross_sell':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Card background" value={props.cardBg ?? '#ffffff'} onChange={v => updateProps({ cardBg: v })} />
                        <ColorRow label="Card border" value={props.cardBorder ?? '#ede9fe'} onChange={v => updateProps({ cardBorder: v })} />
                        <ColorRow label="Title colour" value={props.titleColor ?? '#1e1535'} onChange={v => updateProps({ titleColor: v })} />
                    </Section>
                    <Section title="Layout">
                        <SelectInput label="Columns" value={String(props.columns ?? 4)}
                            options={[{ v: '2', l: '2 Columns' }, { v: '3', l: '3 Columns' }, { v: '4', l: '4 Columns' }]}
                            onChange={v => updateProps({ columns: Number(v) as 2 | 3 | 4 })} />
                        <SliderInput label="Gap" value={props.gap ?? 10} min={0} max={24} suffix="px" onChange={v => updateProps({ gap: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={20} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <ToggleRow label="Show price" value={props.showPrice ?? true} onChange={v => updateProps({ showPrice: v })} />
                    </Section>
                </>
            )

        case 'button_block':
            return (
                <>
                    <Section title="Button style">
                        <SelectInput label="Preset" value={props.variant ?? 'primary'}
                            options={[
                                { v: 'primary', l: 'Primary — Purple' },
                                { v: 'secondary', l: 'Secondary — Light' },
                                { v: 'outline', l: 'Outline — Ghost' },
                                { v: 'dark', l: 'Dark — Black' },
                                { v: 'accent', l: 'Accent — Lime' },
                            ]}
                            onChange={v => {
                                const presets: Record<string, Partial<ButtonBlockProps>> = {
                                    primary: { bgColor: '#7530fb', textColor: '#ffffff', borderColor: '#7530fb' },
                                    secondary: { bgColor: '#f3eeff', textColor: '#7530fb', borderColor: '#f3eeff' },
                                    outline: { bgColor: 'transparent', textColor: '#7530fb', borderColor: '#7530fb' },
                                    dark: { bgColor: '#1e1535', textColor: '#ffffff', borderColor: '#1e1535' },
                                    accent: { bgColor: '#b8fa33', textColor: '#1e1535', borderColor: '#b8fa33' },
                                }
                                updateProps({ variant: v, ...presets[v] })
                            }} />
                        <ColorRow label="Background" value={props.bgColor ?? '#7530fb'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#7530fb'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    <Section title="Shape">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 10} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <SliderInput label="Padding V" value={props.paddingV ?? 14} min={6} max={30} suffix="px" onChange={v => updateProps({ paddingV: v })} />
                        <SliderInput label="Padding H" value={props.paddingH ?? 40} min={12} max={80} suffix="px" onChange={v => updateProps({ paddingH: v })} />
                        <ToggleRow label="Full width" value={props.fullWidth ?? false} onChange={v => updateProps({ fullWidth: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput label="Weight" value={props.fontWeight ?? '700'}
                            options={[{ v: '600', l: 'Semibold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'Extrabold' }]}
                            onChange={v => updateProps({ fontWeight: v })} />
                    </Section>
                </>
            )

        case 'rectangle':
            return (
                <Section title="Rectangle">
                    <ColorRow label="Fill colour" value={props.fillColor ?? '#f3eeff'} onChange={v => updateProps({ fillColor: v })} />
                    <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                    <SliderInput label="Height" value={props.height ?? 60} min={4} max={400} suffix="px" onChange={v => updateProps({ height: v })} />
                    <SliderInput label="Border width" value={props.borderWidth ?? 1} min={0} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                    <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                </Section>
            )

        case 'hero_header': {
            const currentVariant = props.variant ?? 'gradient'
            const isDark = currentVariant !== 'typographic'
            return (
                <>
                    {/* ── Background — variant aware ── */}
                    <Section title="Background">
                        {currentVariant === 'typographic' ? (
                            // Light bg for typographic variant
                            <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        ) : currentVariant === 'image-bg' ? (
                            // Image bg variant — show overlay colour
                            <>
                                <ColorRow label="Overlay colour" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                                <InfoBox>Set your background image in the Attributes tab → Logo URL field. The overlay colour darkens the image for text readability.</InfoBox>
                            </>
                        ) : (
                            // Gradient variants
                            <>
                                <ToggleRow label="Use gradient" value={props.bgGradient ?? true} onChange={v => updateProps({ bgGradient: v })} />
                                {(props.bgGradient ?? true) ? (
                                    <>
                                        <ColorRow label="Gradient from" value={props.gradientFrom ?? '#7530fb'} onChange={v => updateProps({ gradientFrom: v })} />
                                        <ColorRow label="Gradient to" value={props.gradientTo ?? '#1e1535'} onChange={v => updateProps({ gradientTo: v })} />
                                    </>
                                ) : (
                                    <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                                )}
                            </>
                        )}
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <ColorRow
                            label="Name colour"
                            value={props.textColor ?? (isDark ? '#ffffff' : '#1e1535')}
                            onChange={v => updateProps({ textColor: v })}
                        />
                        <ColorRow
                            label="Tagline colour"
                            value={props.taglineColor ?? (isDark ? 'rgba(255,255,255,0.7)' : '#6b7280')}
                            onChange={v => updateProps({ taglineColor: v })}
                        />
                        <SliderInput label="Name size" value={props.nameFontSize ?? 26} min={14} max={52} suffix="px" onChange={v => updateProps({ nameFontSize: v })} />
                        <SliderInput label="Tagline size" value={props.taglineFontSize ?? 13} min={10} max={22} suffix="px" onChange={v => updateProps({ taglineFontSize: v })} />
                        <SelectInput
                            label="Name weight"
                            value={props.nameFontWeight ?? '900'}
                            options={[
                                { v: '400', l: 'Regular' },
                                { v: '600', l: 'Semibold' },
                                { v: '700', l: 'Bold' },
                                { v: '800', l: 'Extrabold' },
                                { v: '900', l: 'Black' },
                            ]}
                            onChange={v => updateProps({ nameFontWeight: v })}
                        />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>

                    {/* ── Layout ── */}
                    <Section title="Layout">
                        <SliderInput label="Height" value={props.height ?? 120} min={40} max={500} suffix="px" onChange={v => updateProps({ height: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>

                    {/* ── Variant-specific extras ── */}
                    {currentVariant === 'credibility' && (
                        <Section title="Credibility">
                            <InfoBox>Add the token {'{{FEEDBACK_SCORE}}'} to your Tagline in the Attributes tab to show your feedback count.</InfoBox>
                        </Section>
                    )}
                    {currentVariant === 'category' && (
                        <Section title="Category Badge">
                            <TextInput label="Badge text" value={props.categoryBadge ?? 'Specialist Seller'} onChange={v => updateProps({ categoryBadge: v })} />
                        </Section>
                    )}
                    {currentVariant === 'seasonal' && (
                        <Section title="Sale Badge">
                            <TextInput label="Badge text" value={props.saleBadgeText ?? 'SALE'} onChange={v => updateProps({ saleBadgeText: v })} />
                            <ColorRow label="Badge colour" value={props.bgGradientFrom ?? '#dc2626'} onChange={v => updateProps({ bgGradientFrom: v, gradientFrom: v })} />
                        </Section>
                    )}
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 0} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 0} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 0} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 0} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )
        }

        case 'raw_html':
            return (
                <Section title="Block label">
                    <TextInput
                        label="Internal label"
                        value={props.label ?? 'Custom HTML Block'}
                        onChange={v => updateProps({ label: v })}
                    />
                    <InfoBox>
                        HTML content is edited in the Attributes tab. Style this block using the raw HTML code directly.
                    </InfoBox>
                </Section>
            )

        case 'condition_badge': {
            const cbv = (props as any).variant ?? 'cond-inspected-grade-pill'
            return (
                <>
                    {/* ── Background ── */}
                    <Section title="Background">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                    </Section>

                    {/* ── Colours ── */}
                    <Section title="Colours">
                        <ColorRow label="Text colour" value={props.textColor ?? '#0f172a'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#16a34a'} onChange={v => updateProps({ accentColor: v } as any)} />
                        {(cbv === 'cond-inspected-grade-pill' || cbv === 'cond-cosmetic-score-meter' || cbv === 'cond-open-box-complete-strip' || cbv === 'cond-minimal-nordic-pill') && (
                            <ColorRow label="Border colour" value={(props as any).borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v } as any)} />
                        )}
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? ''}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'monospace', l: 'Monospace' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>

                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <NumberInput label="Top (px)" value={(props as any).paddingTop ?? 14} min={0} max={80} onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Bottom (px)" value={(props as any).paddingBottom ?? 14} min={0} max={80} onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Left (px)" value={(props as any).paddingLeft ?? 20} min={0} max={80} onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Right (px)" value={(props as any).paddingRight ?? 20} min={0} max={80} onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>

                    {/* ── Badge ── */}
                    <Section title="Badge">
                        <SliderInput label="Border radius" value={props.badgeRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ badgeRadius: v })} />
                    </Section>

                    {/* ── Border ── */}
                    <Section title="Border">
                        <ToggleRow label="Show border" value={(props as any).showBorder ?? false} onChange={v => updateProps({ showBorder: v } as any)} />
                        {(props as any).showBorder && (
                            <>
                                <ColorRow label="Border colour" value={(props as any).borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v } as any)} />
                                <SliderInput label="Border width" value={(props as any).borderWidth ?? 1} min={1} max={6} suffix="px" onChange={v => updateProps({ borderWidth: v } as any)} />
                            </>
                        )}
                    </Section>
                </>
            )
        }

        case 'item_specifics':
            return (
                <>
                    <Section title="Header">
                        <ColorRow label="Header background" value={props.headerBg ?? '#7530fb'} onChange={v => updateProps({ headerBg: v })} />
                        <ColorRow label="Header text" value={props.headerText ?? '#ffffff'} onChange={v => updateProps({ headerText: v })} />
                        <ToggleRow label="Show title" value={props.showTitle ?? true} onChange={v => updateProps({ showTitle: v })} />
                    </Section>
                    <Section title="Rows">
                        <ColorRow label="Even row" value={props.evenRowBg ?? '#ffffff'} onChange={v => updateProps({ evenRowBg: v })} />
                        <ColorRow label="Odd row" value={props.oddRowBg ?? '#f8f7ff'} onChange={v => updateProps({ oddRowBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Key colour" value={props.keyColor ?? '#1e1535'} onChange={v => updateProps({ keyColor: v })} />
                        <ColorRow label="Value colour" value={props.valueColor ?? '#374151'} onChange={v => updateProps({ valueColor: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={props.fontFamily ?? 'Arial, Helvetica, sans-serif'}
                            options={[
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, Geneva, sans-serif', l: 'Verdana' },
                                { v: 'Tahoma, Geneva, sans-serif', l: 'Tahoma' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v })}
                        />
                    </Section>

                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <NumberInput label="Pad top" value={props.paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                            <NumberInput label="Pad bottom" value={props.paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                            <NumberInput label="Pad left" value={props.paddingLeft ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v })} />
                            <NumberInput label="Pad right" value={props.paddingRight ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v })} />
                        </div>
                    </Section>
                </>
            )

        case 'price_tag': {
            const pv = (props as any).variant ?? 'classic-strike'
            return (
                <>
                    {/* ── Colours — all variants ── */}
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Price colour" value={(props as any).priceColor ?? '#1e1535'} onChange={v => updateProps({ priceColor: v } as any)} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#6b7280'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Strike colour" value={(props as any).strikeColor ?? '#94a3b8'} onChange={v => updateProps({ strikeColor: v } as any)} />
                        <ColorRow label="Original price colour" value={(props as any).originalColor ?? '#94a3b8'} onChange={v => updateProps({ originalColor: v } as any)} />
                    </Section>

                    {/* ── Badge colours — shown for variants that use a badge ── */}
                    {(pv === 'classic-strike' || pv === 'minimalist-inline' || pv === 'stacked-deal-card' || pv === 'discount-badge-pill' || pv === 'high-contrast-flash') && (
                        <Section title="Badge">
                            <ColorRow label="Badge background" value={(props as any).badgeBg ?? '#dc2626'} onChange={v => updateProps({ badgeBg: v } as any)} />
                            <ColorRow label="Badge text" value={(props as any).badgeTextColor ?? '#ffffff'} onChange={v => updateProps({ badgeTextColor: v } as any)} />
                        </Section>
                    )}

                    {/* ── Accent — dual-tone-split, elite-luxury, wholesale-b2b ── */}
                    {(pv === 'dual-tone-split' || pv === 'elite-luxury' || pv === 'wholesale-b2b' || pv === 'modern-glassmorphism') && (
                        <Section title="Accent">
                            <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#1e1535'} onChange={v => updateProps({ accentColor: v } as any)} />
                        </Section>
                    )}

                    {/* ── Urgency banner background — urgency-banner only ── */}
                    {pv === 'urgency-banner' && (
                        <Section title="Banner">
                            <ColorRow label="Banner background" value={(props as any).bannerBg ?? '#dc2626'} onChange={v => updateProps({ bannerBg: v } as any)} />
                        </Section>
                    )}

                    {/* ── Border — classic-strike, stacked-deal-card ── */}
                    {(pv === 'classic-strike' || pv === 'stacked-deal-card') && (
                        <Section title="Border">
                            <ColorRow label="Border colour" value={(props as any).borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v } as any)} />
                        </Section>
                    )}

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <AlignButtons value={props.align ?? 'left'} onChange={v => updateProps({ align: v })} />
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 22} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 22} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'hero_product': {
            const hv = (props as any).variant ?? 'hp-default'
            const isDark = hv === 'hp-dark-hero' || hv === 'hp-dark-premium'
            return (
                <>
                    {/* ── Colours — all variants ── */}
                    <Section title="Colours">
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                        <ColorRow label="Image panel background" value={(props as any).leftBg ?? '#f9fafb'} onChange={v => updateProps({ leftBg: v } as any)} />
                    </Section>

                    {/* ── Scarcity bar ── */}
                    <Section title="Scarcity Bar">
                        <ToggleRow label="Show scarcity bar" value={(props as any).showScarcity ?? false} onChange={v => updateProps({ showScarcity: v } as any)} />
                        {(props as any).showScarcity && (
                            <>
                                <ColorRow label="Bar background" value={(props as any).scarcityBg ?? '#fef2f2'} onChange={v => updateProps({ scarcityBg: v } as any)} />
                                <ColorRow label="Bar text colour" value={(props as any).scarcityColor ?? '#991b1b'} onChange={v => updateProps({ scarcityColor: v } as any)} />
                            </>
                        )}
                    </Section>

                    {/* ── Guarantee tag ── */}
                    <Section title="Guarantee Tag">
                        <ToggleRow label="Show guarantee tag" value={(props as any).showGuaranteeTag ?? true} onChange={v => updateProps({ showGuaranteeTag: v } as any)} />
                        {(props as any).showGuaranteeTag !== false && (
                            <>
                                <ColorRow label="Tag background" value={(props as any).guaranteeTagBg ?? (isDark ? '#1e3a2f' : '#f0fdf4')} onChange={v => updateProps({ guaranteeTagBg: v } as any)} />
                                <ColorRow label="Tag text colour" value={(props as any).guaranteeTagColor ?? (isDark ? '#6ee7b7' : '#166534')} onChange={v => updateProps({ guaranteeTagColor: v } as any)} />
                            </>
                        )}
                    </Section>

                    {/* ── Stock badge ── */}
                    <Section title="Stock Badge">
                        <ToggleRow label="Show stock badge" value={(props as any).showStockBadge ?? true} onChange={v => updateProps({ showStockBadge: v } as any)} />
                    </Section>

                    {/* ── Original price ── */}
                    <Section title="Pricing">
                        <ToggleRow label="Show original price" value={(props as any).showOriginal ?? true} onChange={v => updateProps({ showOriginal: v } as any)} />
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'Arial, Helvetica, sans-serif'}
                            options={[
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, Geneva, sans-serif', l: 'Verdana' },
                                { v: 'Tahoma, Geneva, sans-serif', l: 'Tahoma' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>

                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <NumberInput label="Pad top" value={(props as any).paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Pad bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Pad left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Pad right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>
                </>
            )
        }

        case 'breadcrumb_bar':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Separator colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                </>
            )

        case 'international_shipping':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#fff7ed'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Heading colour" value={props.headingColor ?? '#c2410c'} onChange={v => updateProps({ headingColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#9a3412'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#ea580c'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )

        case 'dispatch_timer':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f0fdf4'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#166534'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Timer countdown colour" value={props.accentColor ?? '#10b981'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                </>
            )

        case 'feedback_score':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                        <ColorRow label="Star colour" value={(props as any).starColor ?? '#f59e0b'} onChange={v => updateProps({ starColor: v } as any)} />
                        <ColorRow label="Border colour" value={(props as any).borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? ''}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'monospace', l: 'Monospace' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <NumberInput label="Top (px)" value={(props as any).paddingTop ?? 16} min={0} max={80} onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Bottom (px)" value={(props as any).paddingBottom ?? 16} min={0} max={80} onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Left (px)" value={(props as any).paddingLeft ?? 24} min={0} max={80} onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Right (px)" value={(props as any).paddingRight ?? 24} min={0} max={80} onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>
                </>
            )

        case 'highlight_text':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Highlight background" value={props.bgColor ?? '#b8fa33'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 15} min={10} max={24} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                </>
            )

        case 'info_box':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#eff6ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Heading colour" value={(props as any).headingColor ?? '#1e40af'} onChange={v => updateProps({ headingColor: v } as any)} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e40af'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#bfdbfe'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Icon colour" value={props.accentColor ?? '#3b82f6'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput label="Font family" value={(props as any).fontFamily ?? 'inherit'} options={[{ v: 'inherit', l: 'Theme default' }, { v: 'Arial, Helvetica, sans-serif', l: 'Arial' }, { v: 'Georgia, serif', l: 'Georgia' }, { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' }, { v: 'Verdana, sans-serif', l: 'Verdana' }]} onChange={v => updateProps({ fontFamily: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'page_title':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Underline colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                </>
            )

        case 'payment_methods':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'pull_quote':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f3eeff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Quote mark colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#7530fb'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'quote_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f3eeff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Quote line colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#7530fb'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'section_label':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Label chip colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Label text colour" value={(props as any).labelColor ?? '#ffffff'} onChange={v => updateProps({ labelColor: v } as any)} />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 12} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 12} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'vat_notice':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8fafc'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#64748b'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                        <ColorRow label="Border colour" value={(props as any).borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v } as any)} />
                    </Section>
                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 12} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 12} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'warning_box':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#fffbeb'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#92400e'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#fcd34d'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Icon colour" value={props.accentColor ?? '#f59e0b'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                </>
            )

        case 'why_buy_from_us':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Icon / bullet colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                </>
            )

        case 'numbered_list':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Number circle colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 15} min={12} max={24} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SliderInput label="Line height" value={props.lineHeight ?? 1.6} min={1} max={2.5} step={0.05} onChange={v => updateProps({ lineHeight: v })} />
                    </Section>
                </>
            )

        case 'store_header':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#7530fb'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent / logo border" value={props.accentColor ?? '#b8fa33'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 20} min={12} max={36} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'badge_row':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#7530fb'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Badge text" value={props.badgeText ?? '#ffffff'} onChange={v => updateProps({ badgeText: v })} />
                        <ColorRow label="Badge border" value={props.badgeBorder ?? '#7530fb'} onChange={v => updateProps({ badgeBorder: v })} />
                    </Section>
                </>
            )

        case 'before_after':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Label background" value={props.labelBg ?? '#1e1535'} onChange={v => updateProps({ labelBg: v })} />
                        <ColorRow label="Label text" value={props.labelText ?? '#ffffff'} onChange={v => updateProps({ labelText: v })} />
                    </Section>
                </>
            )

        case 'bundle_deal':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Price colour" value={props.priceColor ?? '#ffffff'} onChange={v => updateProps({ priceColor: v })} />
                        <ColorRow label="Badge background" value={props.badgeColor ?? '#b8fa33'} onChange={v => updateProps({ badgeColor: v })} />
                        <ColorRow label="Badge text" value={props.badgeText ?? '#1e1535'} onChange={v => updateProps({ badgeText: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#3b2a6e'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 20} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 20} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )

        case 'bundle_discount_banner':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#b8fa33'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#3b2a6e'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'compatibility_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Title colour" value={props.titleColor ?? '#1e1535'} onChange={v => updateProps({ titleColor: v })} />
                        <ColorRow label="Compatible colour" value={props.compatibleColor ?? '#10b981'} onChange={v => updateProps({ compatibleColor: v })} />
                        <ColorRow label="Incompatible colour" value={props.incompatibleColor ?? '#ef4444'} onChange={v => updateProps({ incompatibleColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'compatibility_table':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Header background" value={props.headerBg ?? '#1e1535'} onChange={v => updateProps({ headerBg: v })} />
                        <ColorRow label="Header text" value={props.headerText ?? '#ffffff'} onChange={v => updateProps({ headerText: v })} />
                        <ColorRow label="Alt row background" value={props.rowAltBg ?? '#f8f7ff'} onChange={v => updateProps({ rowAltBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput label="Font family" value={(props as any).fontFamily ?? ''}
                            options={[{ v: '', l: 'Default (Arial)' }, { v: 'Georgia, serif', l: 'Georgia' }, { v: 'Verdana, sans-serif', l: 'Verdana' }, { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' }, { v: 'monospace', l: 'Monospace' }]}
                            onChange={v => updateProps({ fontFamily: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 24} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 24} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )

        case 'data_table':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Header background" value={props.headerBg ?? '#1e1535'} onChange={v => updateProps({ headerBg: v })} />
                        <ColorRow label="Header text" value={props.headerText ?? '#ffffff'} onChange={v => updateProps({ headerText: v })} />
                        <ColorRow label="Alt row background" value={props.rowAltBg ?? '#f8f7ff'} onChange={v => updateProps({ rowAltBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                </>
            )

        case 'faq_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Question background" value={props.questionBg ?? '#f8f7ff'} onChange={v => updateProps({ questionBg: v })} />
                        <ColorRow label="Question text" value={props.questionText ?? '#1e1535'} onChange={v => updateProps({ questionText: v })} />
                        <ColorRow label="Answer text" value={props.answerText ?? '#374151'} onChange={v => updateProps({ answerText: v })} />
                        <ColorRow label="Chevron colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e9e3ff'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'features':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Icon background" value={props.iconBg ?? '#f3eeff'} onChange={v => updateProps({ iconBg: v })} />
                        <ColorRow label="Icon colour" value={props.iconColor ?? '#7530fb'} onChange={v => updateProps({ iconColor: v })} />
                        <ColorRow label="Label colour" value={props.labelColor ?? '#1e1535'} onChange={v => updateProps({ labelColor: v })} />
                        <ColorRow label="Sub-text colour" value={props.subTextColor ?? '#6b7280'} onChange={v => updateProps({ subTextColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'free_shipping':
        case 'free_shipping_banner':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#0f172a'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#f59e0b'} onChange={v => updateProps({ accentColor: v } as any)} />
                        <ColorRow label="Border colour" value={(props as any).borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? ''}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'monospace', l: 'Monospace' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <NumberInput label="Top (px)" value={(props as any).paddingTop ?? 16} min={0} max={80} onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Bottom (px)" value={(props as any).paddingBottom ?? 16} min={0} max={80} onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Left (px)" value={(props as any).paddingLeft ?? 24} min={0} max={80} onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Right (px)" value={(props as any).paddingRight ?? 24} min={0} max={80} onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>
                </>
            )

        case 'key_features_grid':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#0f172a'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent / icon colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Icon background" value={props.iconBg ?? '#eff6ff'} onChange={v => updateProps({ iconBg: v })} />
                        <ColorRow label="Icon border colour" value={props.iconBorderColor ?? '#bfdbfe'} onChange={v => updateProps({ iconBorderColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Card / tile background" value={props.cardBg ?? '#f8fafc'} onChange={v => updateProps({ cardBg: v })} />
                        <ColorRow label="Description text" value={props.descriptionColor ?? '#64748b'} onChange={v => updateProps({ descriptionColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={props.fontFamily ?? ''}
                            onChange={v => updateProps({ fontFamily: v })}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                            ]}
                        />
                    </Section>

                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <NumberInput label="Pad top" value={props.paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                            <NumberInput label="Pad bottom" value={props.paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                            <NumberInput label="Pad left" value={props.paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v })} />
                            <NumberInput label="Pad right" value={props.paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v })} />
                        </div>
                    </Section>
                </>
            )

        case 'logo_bar':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Logo border / accent" value={props.accentColor ?? '#e2e8f0'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )

        case 'money_back':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f0fdf4'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#166534'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#bbf7d0'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#10b981'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>

                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={props.fontFamily ?? 'Arial, Helvetica, sans-serif'}
                            options={[
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, Geneva, sans-serif', l: 'Verdana' },
                                { v: 'Tahoma, Geneva, sans-serif', l: 'Tahoma' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v })}
                        />
                    </Section>

                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <NumberInput label="Pad top" value={props.paddingTop ?? 18} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                            <NumberInput label="Pad bottom" value={props.paddingBottom ?? 18} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                            <NumberInput label="Pad left" value={props.paddingLeft ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v })} />
                            <NumberInput label="Pad right" value={props.paddingRight ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v })} />
                        </div>
                    </Section>
                </>
            )

        case 'payment_methods_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent / checkmark" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e9e3ff'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'product_comparison':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Header background" value={props.headerBg ?? '#1e1535'} onChange={v => updateProps({ headerBg: v, headerBackground: v } as any)} />
                        <ColorRow label="Header text" value={props.headerText ?? '#ffffff'} onChange={v => updateProps({ headerText: v, headerTextColor: v } as any)} />
                        <ColorRow label="Alt row background" value={props.rowAltBg ?? '#f8f7ff'} onChange={v => updateProps({ rowAltBg: v, altRowBg: v } as any)} />
                        <ColorRow label="Checkmark colour" value={props.accentColor ?? '#10b981'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v, borderColour: v } as any)} />
                        <ColorRow label="Our column colour" value={(props as any).ourColor ?? '#7530fb'} onChange={v => updateProps({ ourColor: v } as any)} />
                        <ColorRow label="Text colour" value={(props as any).textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v } as any)} />
                    </Section>
                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'product_variants':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Selected swatch border" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Label colour" value={props.labelColor ?? '#1e1535'} onChange={v => updateProps({ labelColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#374151'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'satisfaction_guarantee':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f0fdf4'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#166534'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#10b981'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 18} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 18} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'seasonal_banner': {
            const sv = (props as any).variant ?? 'seasonal-festive-ribbon'

            // Per-variant accent label + default — only shown for variants that use it
            const accentMeta: Record<string, { label: string; default: string }> = {
                'seasonal-neon-cyber': { label: 'Neon glow colour', default: '#22d3ee' },
                'seasonal-dualtone-split': { label: 'Right panel colour', default: '#ec4899' },
                'seasonal-countdown-urgency': { label: 'Timer accent', default: '#ef4444' },
                'seasonal-minimalist-elegance': { label: 'Gold accent', default: '#b45309' },
                'seasonal-elite-luxury': { label: 'Gold accent', default: '#d4af37' },
            }
            const accent = accentMeta[sv]

            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#dc2626'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        {accent && (
                            <ColorRow
                                label={accent.label}
                                value={props.accentColor ?? accent.default}
                                onChange={v => updateProps({ accentColor: v })}
                            />
                        )}
                    </Section>
                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'shipping_policy_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e9e3ff'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'single_image':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    <Section title="Border">
                        <SliderInput label="Border width" value={props.borderWidth ?? 0} min={0} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                    <Section title="Accent">
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#2563eb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 16} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'store_footer':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Link colour" value={props.linkColor ?? '#a78bfa'} onChange={v => updateProps({ linkColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#b8fa33'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#3b2a6e'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Button text colour" value={(props as any).buttonTextColor ?? '#1e1535'} onChange={v => updateProps({ buttonTextColor: v } as any)} />
                    </Section>
                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    {/* ── Spacing ── */}
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'store_nav_bar':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Link colour" value={props.linkColor ?? '#ffffff'} onChange={v => updateProps({ linkColor: v })} />
                        <ColorRow label="Accent / active colour" value={props.accentColor ?? '#b8fa33'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 14} min={11} max={20} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                </>
            )

        case 'testimonial_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Card background" value={props.cardBg ?? '#f8f7ff'} onChange={v => updateProps({ cardBg: v })} />
                        <ColorRow label="Card border" value={props.cardBorder ?? '#e9e3ff'} onChange={v => updateProps({ cardBorder: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e9e3ff'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Star colour" value={props.starColor ?? '#f59e0b'} onChange={v => updateProps({ starColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#374151'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Author colour" value={props.authorColor ?? '#6b7280'} onChange={v => updateProps({ authorColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput label="Font family" value={(props as any).fontFamily ?? 'inherit'} options={[{ v: 'inherit', l: 'Theme default' }, { v: 'Arial, Helvetica, sans-serif', l: 'Arial' }, { v: 'Georgia, serif', l: 'Georgia' }, { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' }, { v: 'Verdana, sans-serif', l: 'Verdana' }]} onChange={v => updateProps({ fontFamily: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'trust_badge_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f3eeff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e9e3ff'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'urgency_timer_block':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#fff7ed'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#92400e'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Timer colour" value={props.timerColor ?? '#dc2626'} onChange={v => updateProps({ timerColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#fed7aa'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                </>
            )

        case 'whats_in_the_box':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e9e3ff'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={props.paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v })} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={props.paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v })} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={props.paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v })} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={props.paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v })} />
                    </Section>
                </>
            )

        case 'limited_time_offer': {
            const ltov = ((props as any).variant ?? 'lto-flash-sale-ticker') as string

            // Per-variant signature colours
            const ltoSig: Record<string, { bg: string; text: string; accent: string }> = {
                'lto-flash-sale-ticker': { bg: '#dc2626', text: '#ffffff', accent: '#fef08a' },
                'lto-clearance-stamped-tag': { bg: '#fffdfa', text: '#1c1917', accent: '#b91c1c' },
                'lto-midnight-vip-exclusive': { bg: '#09090b', text: '#fafafa', accent: '#d4af37' },
                'lto-industrial-hazard-alert': { bg: '#18181b', text: '#f4f4f5', accent: '#f59e0b' },
                'lto-circular-coupon-clip': { bg: '#ffffff', text: '#0f172a', accent: '#0284c7' },
                'lto-live-scarcity-meter': { bg: '#0f172a', text: '#ffffff', accent: '#f97316' },
                'lto-multibuy-volume-matrix': { bg: '#ffffff', text: '#0f172a', accent: '#2563eb' },
                'lto-scandinavian-editorial': { bg: '#ffffff', text: '#18181b', accent: '#71717a' },
                'lto-cyber-terminal-deal': { bg: '#090d16', text: '#f1f5f9', accent: '#06b6d4' },
                'lto-holiday-gift-ribbon': { bg: '#064e3b', text: '#ffffff', accent: '#fbbf24' },
            }
            const ltoSigVal = ltoSig[ltov] ?? { bg: '#dc2626', text: '#ffffff', accent: '#fef08a' }

            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={(props as any).bgColor ?? ltoSigVal.bg} onChange={v => updateProps({ bgColor: v } as any)} />
                        <ColorRow label="Text colour" value={(props as any).textColor ?? ltoSigVal.text} onChange={v => updateProps({ textColor: v } as any)} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? ltoSigVal.accent} onChange={v => updateProps({ accentColor: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? ''}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'monospace', l: 'Monospace' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <NumberInput label="Top (px)" value={(props as any).paddingTop ?? 16} min={0} max={120} onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Bottom (px)" value={(props as any).paddingBottom ?? 16} min={0} max={120} onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Left (px)" value={(props as any).paddingLeft ?? 24} min={0} max={120} onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Right (px)" value={(props as any).paddingRight ?? 24} min={0} max={120} onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>
                </>
            )
        }

        case 'condition_details': {
            const cdv = ((props as any).variant ?? 'cd-cosmetic-grade-split') as string

            // Per-variant RENDERED colours — matches signature values in condition_details.variants.ts
            const cdSig: Record<string, { bg: string; text: string; accent: string }> = {
                'cd-cosmetic-grade-split': { bg: '#f8f7ff', text: '#1e1535', accent: '#7530fb' },
                'cd-certified-refurb-diagnostic': { bg: '#f8fafc', text: '#0f172a', accent: '#2563eb' },
                'cd-archival-vintage-tier': { bg: '#f0fdf4', text: '#064e3b', accent: '#059669' },
                'cd-open-box-inventory-audit': { bg: '#faf5ff', text: '#1e1535', accent: '#9333ea' },
                'cd-honest-wear-transparency': { bg: '#fffbeb', text: '#1c1917', accent: '#f59e0b' },
                'cd-parts-repair-warning': { bg: '#1e293b', text: '#f8fafc', accent: '#f59e0b' },
                'cd-jeweler-curator-provenance': { bg: '#09090b', text: '#f4f4f5', accent: '#d4af37' },
                'cd-automotive-core-fitment': { bg: '#0f172a', text: '#f8fafc', accent: '#f59e0b' },
                'cd-scandinavian-minimal-ledger': { bg: '#ffffff', text: '#18181b', accent: '#71717a' },
                'cd-mobile-compact-badge-strip': { bg: '#ffffff', text: '#18181b', accent: '#2563eb' },
            }
            const sig = cdSig[cdv] ?? { bg: '#ffffff', text: '#1e1535', accent: '#7530fb' }

            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? sig.bg} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? sig.text} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? sig.accent} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={props.fontFamily ?? ''}
                            onChange={v => updateProps({ fontFamily: v })}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                            ]}
                        />
                    </Section>
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <NumberInput label="Top" value={props.paddingTop ?? 16} min={0} max={120} onChange={v => updateProps({ paddingTop: v } as any)} suffix="px" />
                            <NumberInput label="Bottom" value={props.paddingBottom ?? 16} min={0} max={120} onChange={v => updateProps({ paddingBottom: v } as any)} suffix="px" />
                            <NumberInput label="Left" value={props.paddingLeft ?? 20} min={0} max={120} onChange={v => updateProps({ paddingLeft: v } as any)} suffix="px" />
                            <NumberInput label="Right" value={props.paddingRight ?? 20} min={0} max={120} onChange={v => updateProps({ paddingRight: v } as any)} suffix="px" />
                        </div>
                    </Section>
                </>
            )
        }

        default:
            return null
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTRIBUTES TAB
// Content properties — text, src, items, rows, toggles + placeholder picker
// ─────────────────────────────────────────────────────────────────────────────

function AttributesTab({
    block,
    props,
    placeholders,
    updateProps,
    selectedSubSlot,
}: {
    block: Block
    props: any
    placeholders: PlaceholderGroup[]
    updateProps: (p: any) => void
    selectedSubSlot?: string | null
}) {
    const [showPh, setShowPh] = useState(false)
    const [phTarget, setPhTarget] = useState<string | null>(null)

    // Insert placeholder into a specific text field
    const insertPlaceholder = (fieldKey: string, value: string) => {
        const current = props[fieldKey] ?? ''
        updateProps({ [fieldKey]: current + value })
        setShowPh(false)
        setPhTarget(null)
    }

    const phButton = (fieldKey: string, label: string) => (
        <button
            onClick={() => { setPhTarget(fieldKey); setShowPh(true) }}
            title={`Insert placeholder into ${label}`}
            style={{
                marginTop: 3,
                marginBottom: 8,
                padding: '3px 8px',
                border: `1px solid ${C.primaryBorder}`,
                borderRadius: 6,
                backgroundColor: C.primaryLight,
                color: C.primary,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
            }}
        >
            + Placeholder
        </button>
    )

    return (
        <div style={{ padding: '14px 14px 24px', position: 'relative' }}>

            {/* Placeholder picker overlay */}
            {showPh && (
                <PlaceholderPicker
                    groups={placeholders}
                    onInsert={val => phTarget && insertPlaceholder(phTarget, val)}
                    onClose={() => { setShowPh(false); setPhTarget(null) }}
                />
            )}

            <BlockAttributeProps
                block={block}
                props={props}
                updateProps={updateProps}
                phButton={phButton}
                selectedSubSlot={selectedSubSlot}
            />
        </div>
    )
}

// Block-specific attribute controls
function BlockAttributeProps({ block, props, updateProps, phButton, selectedSubSlot }: {
    block: Block, props: any, updateProps: (p: any) => void,
    phButton: (key: string, label: string) => React.ReactNode
    selectedSubSlot?: string | null
}) {
    switch (block.type) {

        case 'divider':
            return (
                <Section title="Divider">
                    <InfoBox>Divider has no text content — all controls are in the Styles tab.</InfoBox>
                </Section>
            )

        case 'heading':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput label="Heading text" value={props.text ?? ''} rows={2} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'heading')}
                        <SelectInput label="Level" value={props.level ?? 'h2'}
                            options={[{ v: 'h1', l: 'H1 — Page Title' }, { v: 'h2', l: 'H2 — Section' }, { v: 'h3', l: 'H3 — Subsection' }, { v: 'h4', l: 'H4 — Minor' }]}
                            onChange={v => updateProps({ level: v })} />
                    </Section>
                </>
            )

        case 'paragraph':
            return (
                <Section title="Content">
                    <TextareaInput label="Text" value={props.text ?? ''} rows={5} onChange={v => updateProps({ text: v })} />
                    {phButton('text', 'paragraph')}
                </Section>
            )

        case 'bullet_list':
            return (
                <Section title="List items">
                    <BulletItemsEditor
                        items={props.items ?? []}
                        onChange={items => updateProps({ items })}
                    />
                </Section>
            )

        case 'product_title':
            return (
                <>
                    <Section title="Title text">
                        <TextInput label="Title" value={props.text ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'title')}
                    </Section>
                    <Section title="Condition">
                        <ToggleRow label="Show condition" value={props.showCondition ?? true} onChange={v => updateProps({ showCondition: v })} />
                        {props.showCondition && (
                            <>
                                <TextInput label="Condition text" value={props.conditionText ?? '{{ITEM_CONDITION}}'} onChange={v => updateProps({ conditionText: v })} />
                                {phButton('conditionText', 'condition')}
                            </>
                        )}
                    </Section>
                </>
            )

        case 'price_block': {
            const av = props.variant ?? 'simple'
            return (
                <>
                    <Section title="Price">
                        <TextInput label="Price" value={props.priceText ?? ''} onChange={v => updateProps({ priceText: v })} />
                        {phButton('priceText', 'price')}
                    </Section>
                    {(av === 'sale' || av === 'urgency' || av === 'free-shipping') && (
                        <Section title="Original price">
                            <TextInput label="Original price" value={props.originalText ?? ''} onChange={v => updateProps({ originalText: v })} />
                            {phButton('originalText', 'original price')}
                        </Section>
                    )}
                    {av === 'sale' && (
                        <Section title="Savings badge">
                            <TextInput label="Savings text" value={props.savingsText ?? ''} onChange={v => updateProps({ savingsText: v })} />
                            {phButton('savingsText', 'savings text')}
                            <TextInput label="Badge label" value={props.badgeText ?? ''} onChange={v => updateProps({ badgeText: v })} />
                            {phButton('badgeText', 'badge label')}
                        </Section>
                    )}
                    {av === 'urgency' && (
                        <Section title="Urgency message">
                            <TextInput label="Urgency text" value={props.urgencyText ?? ''} onChange={v => updateProps({ urgencyText: v })} />
                            {phButton('urgencyText', 'urgency text')}
                        </Section>
                    )}
                    {av === 'range' && (
                        <Section title="Price range">
                            <TextInput label="Max price" value={props.priceRangeMax ?? ''} onChange={v => updateProps({ priceRangeMax: v })} />
                            {phButton('priceRangeMax', 'max price')}
                        </Section>
                    )}
                    {av === 'auction' && (
                        <Section title="Auction details">
                            <TextInput label="Bid count" value={props.bidCount ?? ''} onChange={v => updateProps({ bidCount: v })} />
                            {phButton('bidCount', 'bid count')}
                            <TextInput label="Time left" value={props.timeLeft ?? ''} onChange={v => updateProps({ timeLeft: v })} />
                            {phButton('timeLeft', 'time left')}
                        </Section>
                    )}
                    {av === 'bundle' && (
                        <Section title="Bundle prices">
                            <TextInput label="Tier 1 price" value={props.bundleTier1Price ?? ''} onChange={v => updateProps({ bundleTier1Price: v })} />
                            {phButton('bundleTier1Price', 'tier 1 price')}
                            <TextInput label="Tier 2 price" value={props.bundleTier2Price ?? ''} onChange={v => updateProps({ bundleTier2Price: v })} />
                            {phButton('bundleTier2Price', 'tier 2 price')}
                            <TextInput label="Tier 3 price" value={props.bundleTier3Price ?? ''} onChange={v => updateProps({ bundleTier3Price: v })} />
                            {phButton('bundleTier3Price', 'tier 3 price')}
                        </Section>
                    )}
                    {av === 'finance' && (
                        <Section title="Finance details">
                            <TextInput label="Monthly price" value={props.monthlyPrice ?? ''} onChange={v => updateProps({ monthlyPrice: v })} />
                            {phButton('monthlyPrice', 'monthly price')}
                            <TextInput label="Finance note" value={props.financeText ?? ''} onChange={v => updateProps({ financeText: v })} />
                        </Section>
                    )}
                    {av === 'trade' && (
                        <Section title="Trade details">
                            <TextInput label="Trade price" value={props.tradePrice ?? ''} onChange={v => updateProps({ tradePrice: v })} />
                            {phButton('tradePrice', 'trade price')}
                            <TextInput label="RRP" value={props.rrpText ?? ''} onChange={v => updateProps({ rrpText: v })} />
                            {phButton('rrpText', 'RRP')}
                            <TextInput label="CTA text" value={props.tradeCta ?? ''} onChange={v => updateProps({ tradeCta: v })} />
                        </Section>
                    )}
                    {av === 'free-shipping' && (
                        <Section title="Delivery">
                            <TextInput label="Delivery text" value={props.deliveryText ?? ''} onChange={v => updateProps({ deliveryText: v })} />
                            <TextInput label="Est. delivery date" value={props.deliveryDate ?? ''} onChange={v => updateProps({ deliveryDate: v })} />
                            {phButton('deliveryDate', 'delivery date')}
                        </Section>
                    )}
                </>
            )
        }

        case 'product_image': {
            const av = props.variant ?? 'single'
            return (
                <>
                    <Section title="Main image">
                        <TextInput label="Image URL" value={props.src ?? ''} onChange={v => updateProps({ src: v })} />
                        {phButton('src', 'main image URL')}
                        <TextInput label="Alt text" value={props.alt ?? ''} onChange={v => updateProps({ alt: v })} />
                        {phButton('alt', 'alt text')}
                    </Section>
                    {av === 'single' && (
                        <Section title="Caption">
                            <InfoBox>Optional centered text rendered directly below the image (e.g. item title or feature note).</InfoBox>
                            <TextInput label="Caption" value={props.caption ?? ''} onChange={v => updateProps({ caption: v })} />
                            {phButton('caption', 'caption')}
                            <ColorRow label="Caption colour" value={props.captionColor ?? '#475569'} onChange={v => updateProps({ captionColor: v })} />
                            <SliderInput label="Caption size" value={props.captionFontSize ?? 13} min={10} max={20} suffix="px" onChange={v => updateProps({ captionFontSize: v })} />
                        </Section>
                    )}
                    {av === 'gallery' && (
                        <Section title="Gallery images">
                            <InfoBox>Add extra images for the thumbnail strip.</InfoBox>
                            <TextInput label="Image 2 URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'image 2 URL')}
                            <TextInput label="Image 3 URL" value={props.image3Url ?? ''} onChange={v => updateProps({ image3Url: v })} />
                            {phButton('image3Url', 'image 3 URL')}
                            {(props.imageCount ?? 4) >= 4 && <>
                                <TextInput label="Image 4 URL" value={props.image4Url ?? ''} onChange={v => updateProps({ image4Url: v })} />
                                {phButton('image4Url', 'image 4 URL')}
                            </>}
                            {(props.imageCount ?? 4) >= 5 && <>
                                <TextInput label="Image 5 URL" value={props.image5Url ?? ''} onChange={v => updateProps({ image5Url: v })} />
                                {phButton('image5Url', 'image 5 URL')}
                            </>}
                        </Section>
                    )}
                    {(av === 'split' || av === 'split-right') && (
                        <Section title="Description content">
                            <TextInput label="Title" value={props.descriptionTitle ?? ''} onChange={v => updateProps({ descriptionTitle: v })} />
                            {phButton('descriptionTitle', 'title')}
                            <TextareaInput label="Description" value={props.descriptionText ?? ''} rows={4} onChange={v => updateProps({ descriptionText: v })} />
                            {phButton('descriptionText', 'description')}
                        </Section>
                    )}
                    {av === 'fullwidth' && (
                        <Section title="Overlay text">
                            <TextInput label="Overlay text (optional)" value={props.overlayText ?? ''} onChange={v => updateProps({ overlayText: v })} />
                            {phButton('overlayText', 'overlay text')}
                        </Section>
                    )}
                    {av === 'comparison' && (
                        <Section title="Second image">
                            <TextInput label="Second image URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'second image URL')}
                            <TextInput label="Left label" value={props.label1 ?? 'Front'} onChange={v => updateProps({ label1: v })} />
                            <TextInput label="Right label" value={props.label2 ?? 'Back'} onChange={v => updateProps({ label2: v })} />
                        </Section>
                    )}
                    {av === 'lifestyle' && (
                        <Section title="Overlay text">
                            <TextInput label="Product name" value={props.lifestyleName ?? ''} onChange={v => updateProps({ lifestyleName: v })} />
                            {phButton('lifestyleName', 'product name')}
                            <TextInput label="Subtext (optional)" value={props.lifestyleSubtext ?? ''} onChange={v => updateProps({ lifestyleSubtext: v })} />
                            {phButton('lifestyleSubtext', 'subtext')}
                        </Section>
                    )}
                    {av === 'polaroid' && (
                        <Section title="Caption">
                            <TextInput label="Caption text" value={props.polaroidCaption ?? ''} onChange={v => updateProps({ polaroidCaption: v })} />
                            {phButton('polaroidCaption', 'caption')}
                        </Section>
                    )}
                    {av === 'before-after' && (
                        <Section title="Before / After images">
                            <TextInput label="Before label" value={props.beforeLabel ?? 'Before'} onChange={v => updateProps({ beforeLabel: v })} />
                            <TextInput label="After label" value={props.afterLabel ?? 'After'} onChange={v => updateProps({ afterLabel: v })} />
                            <TextInput label="After image URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'after image URL')}
                        </Section>
                    )}
                    {av === 'magazine' && (
                        <Section title="Additional images">
                            <TextInput label="Image 2 URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'image 2 URL')}
                            <TextInput label="Image 3 URL" value={props.image3Url ?? ''} onChange={v => updateProps({ image3Url: v })} />
                            {phButton('image3Url', 'image 3 URL')}
                        </Section>
                    )}
                    {av === 'inverted-magazine-grid' && (
                        <Section title="Additional images">
                            <TextInput label="Image 2 URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'image 2 URL')}
                            <TextInput label="Image 3 URL" value={props.image3Url ?? ''} onChange={v => updateProps({ image3Url: v })} />
                            {phButton('image3Url', 'image 3 URL')}
                        </Section>
                    )}
                    {av === 'zoom' && (
                        <Section title="Zoom options">
                            <ToggleRow label="Show zoom hint" value={(props as any).showZoomHint ?? true} onChange={v => updateProps({ showZoomHint: v } as any)} />
                        </Section>
                    )}
                    {av === 'polaroid' && (
                        <Section title="Polaroid options">
                            <TextInput label="Badge suffix" value={(props as any).polaroidSuffix ?? 'Premium Edition'} onChange={v => updateProps({ polaroidSuffix: v } as any)} />
                        </Section>
                    )}
                    {(av === 'split' || av === 'split-right') && (
                        <Section title="Layout">
                            <SelectInput label="Image side" value={(props as any).imagePosition ?? 'left'}
                                options={[{ v: 'left', l: 'Image left, text right' }, { v: 'right', l: 'Image right, text left' }]}
                                onChange={v => updateProps({ imagePosition: v } as any)} />
                            <SliderInput label="Image width" value={(props as any).imageWidthPercent ?? 45} min={30} max={60} suffix="%" onChange={v => updateProps({ imageWidthPercent: v } as any)} />
                            <SelectInput label="Vertical align" value={(props as any).verticalAlign ?? 'middle'}
                                options={[{ v: 'top', l: 'Top' }, { v: 'middle', l: 'Middle' }, { v: 'bottom', l: 'Bottom' }]}
                                onChange={v => updateProps({ verticalAlign: v } as any)} />
                        </Section>
                    )}
                    {av === 'gallery' && (
                        <Section title="Gallery options">
                            <SliderInput label="Thumbnail count" value={(props as any).imageCount ?? 4} min={2} max={5} suffix="" onChange={v => updateProps({ imageCount: v } as any)} />
                            <ToggleRow label="Show scroll hint" value={(props as any).showScrollHint ?? true} onChange={v => updateProps({ showScrollHint: v } as any)} />
                            <ToggleRow label="Thumb border" value={(props as any).showThumbBorder ?? true} onChange={v => updateProps({ showThumbBorder: v } as any)} />
                        </Section>
                    )}
                    {av === 'single' && (
                        <Section title="Alignment">
                            <SelectInput label="Image align" value={(props as any).align ?? 'center'}
                                options={[{ v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' }]}
                                onChange={v => updateProps({ align: v } as any)} />
                        </Section>
                    )}
                    {(av === 'lifestyle' || av === 'before_after') && (
                        <Section title="Use Cases">
                            <TextInput label="Use case 1" value={(props as any).useCase1 ?? ''} onChange={v => updateProps({ useCase1: v } as any)} />
                            <TextInput label="Use case 2" value={(props as any).useCase2 ?? ''} onChange={v => updateProps({ useCase2: v } as any)} />
                            <TextInput label="Use case 3" value={(props as any).useCase3 ?? ''} onChange={v => updateProps({ useCase3: v } as any)} />
                        </Section>
                    )}
                    <Section title="Shadow">
                        <SelectInput label="Shadow preset" value={(props as any).shadow ?? (props as any).shadowPreset ?? 'none'}
                            options={[{ v: 'none', l: 'None' }, { v: 'sm', l: 'Small' }, { v: 'md', l: 'Medium' }, { v: 'lg', l: 'Large' }, { v: 'xl', l: 'Extra large' }]}
                            onChange={v => updateProps({ shadow: v, shadowPreset: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'product_description':
            return (
                <>
                    <Section title="Description text">
                        <TextareaInput
                            label="Body text"
                            value={props.text ?? '{{ITEM_DESCRIPTION}}'}
                            rows={6}
                            onChange={v => updateProps({ text: v })}
                        />
                        {phButton('text', 'description body')}
                    </Section>
                    {(props.showTitle ?? true) && (
                        <Section title="Section title">
                            <TextInput
                                label="Title text"
                                value={props.titleText ?? 'Product Description'}
                                onChange={v => updateProps({ titleText: v })}
                            />
                            {phButton('titleText', 'section title')}
                        </Section>
                    )}
                    {((props as any).variant ?? 'plain') === 'feature-box' && (
                        <Section title="Feature Pills">
                            <TextInput label="Pill 1" value={(props as any).feature1 ?? '✓ Premium Quality'} onChange={v => updateProps({ feature1: v } as any)} />
                            <TextInput label="Pill 2" value={(props as any).feature2 ?? '✓ Fast Dispatch'} onChange={v => updateProps({ feature2: v } as any)} />
                            <TextInput label="Pill 3" value={(props as any).feature3 ?? '✓ 30-Day Returns'} onChange={v => updateProps({ feature3: v } as any)} />
                        </Section>
                    )}
                    {((props as any).variant ?? 'plain') === 'dark-luxury' && (
                        <Section title="Dark Background">
                            <ColorRow label="Dark background colour" value={(props as any).darkBg ?? '#1e1535'} onChange={v => updateProps({ darkBg: v } as any)} />
                        </Section>
                    )}
                    {((props as any).variant ?? 'plain') === 'split-story' && (
                        <Section title="Split Story">
                            <ToggleRow label="Left column italic" value={(props as any).splitItalic ?? true} onChange={v => updateProps({ splitItalic: v } as any)} />
                        </Section>
                    )}
                </>
            )

        case 'banner': {
            const bv = (props as any).variant ?? 'simple'
            return (
                <>
                    {/* ── Core Content ── */}
                    <Section title="Content">
                        <TextareaInput label="Heading" value={props.headingText ?? ''} rows={2} onChange={v => updateProps({ headingText: v })} />
                        {phButton('headingText', 'heading')}
                        <TextareaInput label="Subtext" value={props.subText ?? ''} rows={2} onChange={v => updateProps({ subText: v })} />
                        {phButton('subText', 'subtext')}
                        <AlignButtons value={(props as any).align ?? 'center'} onChange={v => updateProps({ align: v } as any)} />
                    </Section>

                    {/* ── Badge (simple, left-badge, full-width-hero, diagonal-accent-hero) ── */}
                    {(bv === 'simple' || bv === 'left-badge' || bv === 'full-width-hero' || bv === 'diagonal-accent-hero') && (
                        <Section title="Badge">
                            <TextInput label="Badge text" value={(props as any).badgeText ?? ''} placeholder="e.g. NEW ARRIVAL" onChange={v => updateProps({ badgeText: v } as any)} />
                        </Section>
                    )}

                    {/* ── CTA Button (simple, full-width-hero) ── */}
                    {(bv === 'simple' || bv === 'full-width-hero') && (
                        <Section title="CTA Button">
                            <TextInput label="Button label" value={(props as any).ctaText ?? ''} placeholder="e.g. Shop Now" onChange={v => updateProps({ ctaText: v } as any)} />
                            <TextInput label="Button URL" value={(props as any).ctaUrl ?? '#'} placeholder="https://" onChange={v => updateProps({ ctaUrl: v } as any)} />
                        </Section>
                    )}

                    {/* ── Background Image (split-image-text, full-width-hero) ── */}
                    {(bv === 'split-image-text' || bv === 'full-width-hero') && (
                        <Section title="Background Image">
                            <TextInput label="Image URL" value={(props as any).imageUrl ?? ''} placeholder="https://...jpg" onChange={v => updateProps({ imageUrl: v } as any)} />
                            {phButton('imageUrl', 'background image')}
                            {bv === 'split-image-text' && (
                                <SelectInput
                                    label="Image position"
                                    value={(props as any).imagePosition ?? 'left'}
                                    options={[{ v: 'left', l: 'Image left, text right' }, { v: 'right', l: 'Image right, text left' }]}
                                    onChange={v => updateProps({ imagePosition: v } as any)}
                                />
                            )}
                        </Section>
                    )}

                    {/* ── Size ── */}
                    <Section title="Size">
                        <SliderInput label="Min height" value={(props as any).minHeight ?? 80} min={40} max={600} suffix="px" onChange={v => updateProps({ minHeight: v } as any)} />
                        <SliderInput label="Top padding" value={(props as any).paddingTop ?? 0} min={0} max={200} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <SliderInput label="Bottom padding" value={(props as any).paddingBottom ?? 0} min={0} max={200} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <SliderInput label="Left padding" value={(props as any).paddingLeft ?? 0} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <SliderInput label="Right padding" value={(props as any).paddingRight ?? 0} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'cta_banner': {
            const av = (props as any).variant ?? 'ctab-trust-bar'
            const noButton = av === 'ctab-trust-bar' || av === 'ctab-announcement'
            const hasButton = !noButton
            const hasGradient = av === 'ctab-gradient-hero' || av === 'ctab-split-action'
            return (
                <>
                    <Section title="Content">
                        <TextareaInput label="Heading" value={props.headingText ?? ''} rows={2} onChange={v => updateProps({ headingText: v })} />
                        {phButton('headingText', 'heading')}
                        <TextareaInput label="Subtext" value={props.subText ?? ''} rows={2} onChange={v => updateProps({ subText: v })} />
                        {phButton('subText', 'subtext')}
                    </Section>
                    {av === 'ctab-flash-deal' && (
                        <Section title="Urgency Ribbon">
                            <TextInput label="Ribbon text" value={(props as any).ribbonText ?? 'LIMITED TIME — ENDS MIDNIGHT'} onChange={v => updateProps({ ribbonText: v } as any)} />
                        </Section>
                    )}
                    {hasButton && (
                        <Section title="Button">
                            <TextInput label="Button text" value={props.buttonText ?? 'Shop Now'} onChange={v => updateProps({ buttonText: v })} />
                            {phButton('buttonText', 'button text')}
                            <TextInput label="Button URL" value={(props as any).linkUrl ?? '#'} onChange={v => updateProps({ linkUrl: v } as any)} />
                        </Section>
                    )}
                    {hasGradient && (
                        <Section title="Gradient Background">
                            <ToggleRow label="Use gradient" value={(props as any).bgGradient ?? false} onChange={v => updateProps({ bgGradient: v } as any)} />
                            {(props as any).bgGradient && (
                                <>
                                    <ColorRow label="Gradient from" value={(props as any).gradientFrom ?? '#7530fb'} onChange={v => updateProps({ gradientFrom: v } as any)} />
                                    <ColorRow label="Gradient to" value={(props as any).gradientTo ?? '#1e1535'} onChange={v => updateProps({ gradientTo: v } as any)} />
                                </>
                            )}
                        </Section>
                    )}
                    <Section title="Text Colours">
                        <ColorRow label="Subtext colour" value={(props as any).subTextColor ?? '#6b7280'} onChange={v => updateProps({ subTextColor: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <NumberInput label="Top (px)" value={(props as any).paddingTop ?? 0} min={0} max={80} onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Bottom (px)" value={(props as any).paddingBottom ?? 0} min={0} max={80} onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Left (px)" value={(props as any).paddingLeft ?? 0} min={0} max={80} onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Right (px)" value={(props as any).paddingRight ?? 0} min={0} max={80} onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>
                </>
            )
        }

        case 'gallery_row':
            return (
                <>
                    <Section title="Main image">
                        <TextInput label="Main image URL" value={props.mainImageSrc ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ mainImageSrc: v })} />
                        {phButton('mainImageSrc', 'main image')}
                    </Section>
                    <Section title="Thumbnail images">
                        <GalleryImagesEditor
                            images={props.images ?? []}
                            onChange={images => updateProps({ images })}
                        />
                    </Section>
                </>
            )

        case 'trust_badges':
            return (
                <Section title="Badges">
                    <BadgesEditor
                        badges={props.badges ?? []}
                        onChange={badges => updateProps({ badges })}
                    />
                </Section>
            )

        case 'shipping_info':
            return (
                <Section title="Content">
                    <TextInput label="Shipping time" value={props.shippingText ?? '{{SHIPPING_TIME}}'} onChange={v => updateProps({ shippingText: v })} />
                    {phButton('shippingText', 'shipping time')}
                    <TextInput label="Dispatch text" value={props.dispatchText ?? ''} onChange={v => updateProps({ dispatchText: v })} />
                    <TextInput label="Location text" value={props.locationText ?? ''} onChange={v => updateProps({ locationText: v })} />
                </Section>
            )

        case 'returns_policy':
            return (
                <>
                    <Section title="Policy">
                        <TextareaInput label="Policy text" value={props.policyText ?? '{{RETURN_POLICY}}'} rows={3} onChange={v => updateProps({ policyText: v })} />
                        {phButton('policyText', 'policy')}
                    </Section>
                    <Section title="Period">
                        <ToggleRow label="Show return period" value={props.showPeriod ?? true} onChange={v => updateProps({ showPeriod: v })} />
                        {props.showPeriod && (
                            <TextInput label="Period text" value={props.periodText ?? '30-Day Free Returns'} onChange={v => updateProps({ periodText: v })} />
                        )}
                    </Section>
                </>
            )

        case 'seller_info':
            return (
                <>
                    <Section title="Seller">
                        <TextInput label="Seller name" value={props.sellerName ?? '{{SELLER_NAME}}'} onChange={v => updateProps({ sellerName: v })} />
                        {phButton('sellerName', 'seller name')}
                        <TextInput label="Tagline" value={props.tagline ?? ''} onChange={v => updateProps({ tagline: v })} />
                        <TextInput label="Feedback text" value={props.feedbackText ?? ''} onChange={v => updateProps({ feedbackText: v })} />
                    </Section>
                    <Section title="Badge">
                        <ToggleRow label="Show badge" value={props.showBadge ?? true} onChange={v => updateProps({ showBadge: v })} />
                        {props.showBadge && (
                            <TextInput label="Badge text" value={props.badgeText ?? 'Top Rated Seller'} onChange={v => updateProps({ badgeText: v })} />
                        )}
                    </Section>
                </>
            )

        case 'full_width_section':
            if (selectedSubSlot === 'content') {
                return (
                    <Section title="Content">
                        <TextareaInput
                            label="Content (HTML)"
                            value={props['content'] ?? ''}
                            rows={8}
                            onChange={v => updateProps({ content: v })}
                        />
                        {phButton('content', 'Content')}
                    </Section>
                )
            }
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        Layout block content is edited directly in the code editor. Switch to <strong>HTML Code Editor</strong> to edit inner content.
                    </InfoBox>
                </div>
            )

        case 'two_column':
            if (block.type === 'two_column' && (selectedSubSlot === 'leftContent' || selectedSubSlot === 'rightContent')) {
                return (
                    <Section title={`Column: ${selectedSubSlot === 'leftContent' ? 'Left' : 'Right'}`}>
                        <TextareaInput
                            label="Content (HTML)"
                            value={props[selectedSubSlot] ?? ''}
                            rows={8}
                            onChange={v => updateProps({ [selectedSubSlot]: v })}
                        />
                        {phButton(selectedSubSlot, selectedSubSlot === 'leftContent' ? 'Left Column' : 'Right Column')}
                    </Section>
                )
            }
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        Layout block content is edited directly in the code editor. Switch to <strong>HTML Code Editor</strong> to edit inner content.
                    </InfoBox>
                </div>
            )

        case 'three_column':
            if (selectedSubSlot === 'col1Content' || selectedSubSlot === 'col2Content' || selectedSubSlot === 'col3Content') {
                const label = selectedSubSlot === 'col1Content' ? 'Column 1' : selectedSubSlot === 'col2Content' ? 'Column 2' : 'Column 3';
                return (
                    <Section title={label}>
                        <TextareaInput
                            label="Content (HTML)"
                            value={props[selectedSubSlot] ?? ''}
                            rows={8}
                            onChange={v => updateProps({ [selectedSubSlot]: v })}
                        />
                        {phButton(selectedSubSlot, label)}
                    </Section>
                )
            }
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        Layout block content is edited directly in the code editor. Switch to <strong>HTML Code Editor</strong> to edit inner content.
                    </InfoBox>
                </div>
            )

        case 'four_column':
            if (selectedSubSlot === 'col1Content' || selectedSubSlot === 'col2Content' || selectedSubSlot === 'col3Content' || selectedSubSlot === 'col4Content') {
                const label = selectedSubSlot === 'col1Content' ? 'Column 1' : selectedSubSlot === 'col2Content' ? 'Column 2' : selectedSubSlot === 'col3Content' ? 'Column 3' : 'Column 4';
                return (
                    <Section title={label}>
                        <TextareaInput
                            label="Content (HTML)"
                            value={props[selectedSubSlot] ?? ''}
                            rows={8}
                            onChange={v => updateProps({ [selectedSubSlot]: v })}
                        />
                        {phButton(selectedSubSlot, label)}
                    </Section>
                )
            }
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        Layout block content is edited directly in the code editor. Switch to <strong>HTML Code Editor</strong> to edit inner content.
                    </InfoBox>
                </div>
            )

        case 'sidebar_layout':
            if (selectedSubSlot === 'leftImage' || selectedSubSlot === null) {
                const isImageSlot = selectedSubSlot === 'leftImage';
                return (
                    <>
                        <Section title={isImageSlot ? 'Left Image' : 'Sidebar Layout — Image Slot'}>
                            <TextareaInput
                                label="Left Image HTML (drop image here)"
                                value={(props as any).leftImage ?? ''}
                                rows={4}
                                onChange={v => updateProps({ leftImage: v })}
                            />
                        </Section>
                        <Section title={isImageSlot ? 'Left Content' : 'Sidebar Layout — Content Slot'}>
                            <TextareaInput
                                label="Right Content HTML (drop content here)"
                                value={(props as any).rightContent ?? ''}
                                rows={6}
                                onChange={v => updateProps({ rightContent: v })}
                            />
                            {phButton('rightContent', 'Right Content')}
                        </Section>
                    </>
                )
            }
            if (selectedSubSlot === 'leftContent' || selectedSubSlot === 'rightContent') {
                const label = selectedSubSlot === 'leftContent' ? 'Left Column' : 'Right Column';
                return (
                    <Section title={label}>
                        <TextareaInput
                            label="Content (HTML)"
                            value={props[selectedSubSlot] ?? ''}
                            rows={8}
                            onChange={v => updateProps({ [selectedSubSlot]: v })}
                        />
                        {phButton(selectedSubSlot, label)}
                    </Section>
                )
            }
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        Layout block content is edited directly in the code editor. Switch to <strong>HTML Code Editor</strong> to edit inner content.
                    </InfoBox>
                </div>
            )

        case 'policy_tabs':
            return (
                <Section title="Tab content">
                    <PolicyTabsEditor
                        tabs={props.tabs ?? []}
                        onChange={tabs => updateProps({ tabs })}
                    />
                </Section>
            )

        case 'nav_bar':
            return (
                <>
                    <Section title={`Links (${(props.links ?? []).length}/8)`}>
                        <NavLinksEditor
                            links={props.links ?? []}
                            onChange={links => updateProps({ links })}
                        />
                        <InfoBox>
                            Click a link label or URL to edit. Add up to 8 links.
                        </InfoBox>
                    </Section>
                    <Section title="Separator">
                        <SelectInput
                            label="Separator style"
                            value={props.separator ?? '•'}
                            options={[
                                { v: '•', l: '•  Bullet' },
                                { v: '|', l: '|  Pipe' },
                                { v: '·', l: '·  Middle dot' },
                                { v: '/', l: '/  Slash' },
                                { v: '-', l: '-  Hyphen' },
                                { v: '', l: '   None' },
                            ]}
                            onChange={v => updateProps({ separator: v })}
                        />
                        <div style={{
                            marginTop: 8,
                            padding: '8px 12px',
                            backgroundColor: props.bgColor ?? '#1e1535',
                            borderRadius: 6,
                            textAlign: 'center' as const,
                        }}>
                            {(props.links ?? []).slice(0, 3).map((link: { label: string; url: string }, i: number) => (
                                <span key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: props.textColor ?? '#ffffff' }}>
                                    {i > 0 && (
                                        <span style={{ margin: '0 6px', opacity: 0.5 }}>
                                            {props.separator ?? '•'}
                                        </span>
                                    )}
                                    {link.label}
                                </span>
                            ))}
                            {(props.links ?? []).length > 3 && (
                                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
                                    +{(props.links ?? []).length - 3} more
                                </span>
                            )}
                        </div>
                    </Section>
                </>
            )

        case 'urgency_bar':
            return (
                <Section title="Content">
                    <TextInput label="Urgency text" value={props.text ?? 'Only {{QUANTITY}} Left — Order Soon!'} onChange={v => updateProps({ text: v })} />
                    {phButton('text', 'urgency text')}
                    <ToggleRow label="Show pulse dot" value={props.showIcon ?? true} onChange={v => updateProps({ showIcon: v })} />
                </Section>
            )

        case 'cross_sell':
            return (
                <>
                    <Section title="Section title">
                        <TextInput label="Title" value={props.title ?? 'You May Also Like'} onChange={v => updateProps({ title: v })} />
                        {phButton('title', 'title')}
                    </Section>
                    <Section title="Products">
                        <InfoBox>Add up to 3 cross-sell products with image URL, title and price.</InfoBox>
                        <CrossSellItemsEditor
                            items={props.items ?? []}
                            onChange={items => updateProps({ items })}
                        />
                    </Section>
                </>
            )

        case 'button_block': {
            const bbv = (props as any).variant ?? 'button-solid'
            return (
                <>
                    <Section title="Button">
                        <TextInput label="Button label" value={(props as any).label ?? 'Buy It Now'} onChange={v => updateProps({ label: v } as any)} />
                        {phButton('label', 'button label')}
                        <TextInput label="Link URL" value={(props as any).url ?? '#'} placeholder="https://" onChange={v => updateProps({ url: v } as any)} />
                    </Section>

                    <Section title="Layout">
                        <AlignButtons value={(props as any).align ?? 'center'} onChange={v => updateProps({ align: v } as any)} />
                        <ToggleRow label="Full width" value={(props as any).fullWidth ?? false} onChange={v => updateProps({ fullWidth: v } as any)} />
                    </Section>

                    <Section title="Size">
                        <SliderInput label="Font size" value={(props as any).fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v } as any)} />
                        <SliderInput label="Padding V" value={(props as any).paddingV ?? 14} min={4} max={30} suffix="px" onChange={v => updateProps({ paddingV: v } as any)} />
                        <SliderInput label="Padding H" value={(props as any).paddingH ?? 40} min={8} max={80} suffix="px" onChange={v => updateProps({ paddingH: v } as any)} />
                        <SliderInput label="Border radius" value={(props as any).borderRadius ?? 10} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v } as any)} />
                    </Section>

                    <Section title="Font Weight">
                        <SelectInput
                            label="Weight"
                            value={(props as any).fontWeight ?? '700'}
                            options={[
                                { v: '400', l: 'Regular' },
                                { v: '600', l: 'Semibold' },
                                { v: '700', l: 'Bold' },
                                { v: '800', l: 'Extrabold' },
                            ]}
                            onChange={v => updateProps({ fontWeight: v } as any)}
                        />
                    </Section>

                    {/* Gradient end colour — only for gradient variant */}
                    {bbv === 'button-gradient' && (
                        <Section title="Gradient">
                            <ColorRow label="Gradient end colour" value={(props as any).gradientTo ?? '#b8fa33'} onChange={v => updateProps({ gradientTo: v } as any)} />
                        </Section>
                    )}

                    {/* Container background — wraps the button */}
                    <Section title="Container">
                        <ColorRow label="Container background" value={(props as any).containerBg ?? 'transparent'} onChange={v => updateProps({ containerBg: v } as any)} />
                    </Section>
                </>
            )
        }

        case 'rectangle':
            return (
                <Section title="Content (optional)">
                    <TextareaInput label="Inner HTML" value={props.content ?? ''} rows={3} onChange={v => updateProps({ content: v })} />
                    <InfoBox>Leave empty for a plain colour block. Add HTML for a callout or notice.</InfoBox>
                </Section>
            )

        case 'hero_header': {
            const hhv = (props as any).variant ?? 'gradient'
            const isImageBg = hhv === 'image-bg'
            const isSeasonal = hhv === 'seasonal'
            const isCategory = hhv === 'category'
            const hasGrad = !isImageBg && hhv !== 'typographic'
            return (
                <>
                    <Section title="Store details">
                        <TextInput
                            label="Store name"
                            value={props.storeName ?? '{{SELLER_NAME}}'}
                            onChange={v => updateProps({ storeName: v })}
                        />
                        {phButton('storeName', 'store name')}
                        <TextareaInput
                            label="Tagline"
                            value={props.tagline ?? ''}
                            rows={3}
                            onChange={v => updateProps({ tagline: v })}
                        />
                        {phButton('tagline', 'tagline')}
                        <AlignButtons value={(props as any).align ?? 'center'} onChange={v => updateProps({ align: v } as any)} />
                    </Section>
                    <Section title="Logo / Background image">
                        <ToggleRow
                            label="Show logo"
                            value={props.showLogo ?? false}
                            onChange={v => updateProps({ showLogo: v })}
                        />
                        {props.showLogo && (
                            <>
                                <TextInput
                                    label="Logo URL"
                                    value={props.logoUrl ?? ''}
                                    onChange={v => updateProps({ logoUrl: v })}
                                />
                                {phButton('logoUrl', 'logo URL')}
                                <InfoBox>
                                    Use an HTTPS image URL. Recommended height: 50px. Transparent PNG works best on dark backgrounds.
                                    For the Image Background variant, this URL is used as the banner background image.
                                </InfoBox>
                            </>
                        )}
                        {isImageBg && !props.showLogo && (
                            <InfoBox>
                                Enable "Show logo" above to set a background image URL for the Image Background variant.
                            </InfoBox>
                        )}
                    </Section>
                    {hasGrad && (
                        <Section title="Gradient Background">
                            <ToggleRow label="Use gradient" value={(props as any).bgGradient ?? true} onChange={v => updateProps({ bgGradient: v } as any)} />
                            {((props as any).bgGradient ?? true) && (
                                <>
                                    <ColorRow label="Gradient from" value={(props as any).bgGradientFrom ?? props.gradientFrom ?? '#7530fb'} onChange={v => updateProps({ bgGradientFrom: v, gradientFrom: v } as any)} />
                                    <ColorRow label="Gradient to" value={(props as any).bgGradientTo ?? props.gradientTo ?? '#1e1535'} onChange={v => updateProps({ bgGradientTo: v, gradientTo: v } as any)} />
                                    <SliderInput label="Gradient angle" value={(props as any).bgGradientDir ?? 135} min={0} max={360} suffix="°" onChange={v => updateProps({ bgGradientDir: v } as any)} />
                                </>
                            )}
                        </Section>
                    )}
                    {isSeasonal && (
                        <Section title="Sale Badge">
                            <TextInput label="Badge text" value={(props as any).saleBadgeText ?? 'SALE'} onChange={v => updateProps({ saleBadgeText: v } as any)} />
                        </Section>
                    )}
                    {isCategory && (
                        <Section title="Category Badge">
                            <TextInput label="Badge text" value={(props as any).categoryBadge ?? 'Specialist Seller'} onChange={v => updateProps({ categoryBadge: v } as any)} />
                        </Section>
                    )}
                </>
            )
        }

        case 'raw_html':
            return (
                <Section title="HTML code">
                    <TextareaInput
                        label="Custom HTML"
                        value={props.code ?? '<!-- Paste your HTML here -->'}
                        rows={10}
                        onChange={v => updateProps({ code: v })}
                    />
                    <InfoBox>
                        eBay-safe HTML only. No &lt;script&gt;, no external CSS, no event handlers. Table-based layout recommended.
                    </InfoBox>
                    <TextInput label="Internal label" value={props.label ?? 'Custom HTML Block'} onChange={v => updateProps({ label: v })} />
                </Section>
            )

        // ── MEDIUM PRIORITY BLOCKS ───────────────────────────────────────────

        case 'product_variants': {
            const pvVariant = props.variant ?? 'swatches-sizes'
            const isDark = pvVariant === 'dark-selector'
            const showSwatches = !['pill-only', 'spec-badges'].includes(pvVariant)
            const showSizes = !['spec-badges'].includes(pvVariant)
            const showAccentSelected = pvVariant === 'accent-selected'
            const showAvailability = pvVariant === 'availability-grid'
            const showSpecBadges = pvVariant === 'spec-badges'
            const showLabelledNames = pvVariant === 'labelled-swatches'
            return (
                <>
                    {/* ── Labels ── */}
                    <Section title="Labels">
                        <ToggleRow label="Show colour label" value={props.showColourLabel ?? true} onChange={v => updateProps({ showColourLabel: v })} />
                        {(props.showColourLabel ?? true) && (
                            <TextInput label="Colour label text" value={props.colourLabel ?? 'Colours:'} onChange={v => updateProps({ colourLabel: v })} />
                        )}
                        <ToggleRow label="Show size label" value={props.showSizeLabel ?? true} onChange={v => updateProps({ showSizeLabel: v })} />
                        {(props.showSizeLabel ?? true) && (
                            <TextInput label="Size label text" value={props.sizeLabel ?? 'Sizes:'} onChange={v => updateProps({ sizeLabel: v })} />
                        )}
                        <ColorRow label="Label colour" value={props.labelColor ?? '#1e1535'} onChange={v => updateProps({ labelColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1f1d2e'} onChange={v => updateProps({ textColor: v })} />
                    </Section>

                    {/* ── Colours ── */}
                    {showSwatches && (
                        <Section title="Colours">
                            <SliderInput label="Number of colours" value={props.colorCount ?? 6} min={1} max={6} step={1} onChange={v => updateProps({ colorCount: v })} />
                            {Array.from({ length: props.colorCount ?? 6 }, (_, i) => {
                                const key = `color${i + 1}` as keyof typeof props
                                const nameKey = `colorName${i + 1}` as keyof typeof props
                                const defaults = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#000000', '#ffffff']
                                const nameDefaults = ['Red', 'Blue', 'Green', 'Amber', 'Black', 'White']
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <ColorRow
                                            label={`Colour ${i + 1}`}
                                            value={(props[key] as string) ?? defaults[i]}
                                            onChange={v => updateProps({ [key]: v })}
                                        />
                                        {showLabelledNames && (
                                            <TextInput
                                                label="Name"
                                                value={(props[nameKey] as string) ?? nameDefaults[i]}
                                                onChange={v => updateProps({ [nameKey]: v })}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                            <SelectInput
                                label="Swatch shape"
                                value={props.swatchShape ?? 'circle'}
                                options={[{ v: 'circle', l: 'Circle' }, { v: 'square', l: 'Square' }]}
                                onChange={v => updateProps({ swatchShape: v })}
                            />
                            <SliderInput label="Swatch size" value={props.swatchSize ?? 24} min={16} max={36} suffix="px" onChange={v => updateProps({ swatchSize: v })} />
                            {!isDark && (
                                <ColorRow label="Swatch border" value={props.swatchBorderColor ?? '#e5e7eb'} onChange={v => updateProps({ swatchBorderColor: v })} />
                            )}
                        </Section>
                    )}

                    {/* ── Sizes ── */}
                    {showSizes && (
                        <Section title="Sizes">
                            <TextInput label="Sizes (comma-separated)" value={props.sizesText ?? 'XS,S,M,L,XL,XXL'} onChange={v => updateProps({ sizesText: v })} />
                            <SelectInput
                                label="Pill style"
                                value={props.pillStyle ?? 'outlined'}
                                options={[{ v: 'outlined', l: 'Outlined' }, { v: 'filled', l: 'Filled' }]}
                                onChange={v => updateProps({ pillStyle: v })}
                            />
                            <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        </Section>
                    )}

                    {/* ── Accent Selected ── */}
                    {showAccentSelected && (
                        <Section title="Selected State">
                            <SliderInput label="Selected colour index" value={props.selectedColorIndex ?? 0} min={0} max={5} step={1} onChange={v => updateProps({ selectedColorIndex: v })} />
                            <SliderInput label="Selected size index" value={props.selectedSizeIndex ?? 2} min={0} max={9} step={1} onChange={v => updateProps({ selectedSizeIndex: v })} />
                        </Section>
                    )}

                    {/* ── Availability Grid ── */}
                    {showAvailability && (
                        <Section title="Availability">
                            <TextInput label="Out-of-stock sizes (comma-separated)" value={props.unavailableSizes ?? 'L'} onChange={v => updateProps({ unavailableSizes: v })} />
                            <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#9ca3af' }}>e.g. L,XL</p>
                        </Section>
                    )}

                    {/* ── Dark Selector ── */}
                    {isDark && (
                        <Section title="Dark Panel">
                            <ColorRow label="Panel background" value={props.darkPanelBg ?? '#1e1535'} onChange={v => updateProps({ darkPanelBg: v })} />
                            <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        </Section>
                    )}

                    {/* ── Spec Badges ── */}
                    {showSpecBadges && (
                        <Section title="Spec Badges">
                            <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                                    <TextInput label={`Badge ${n} icon`} value={props[`badge${n}Icon`] ?? ['🎨', '📏', '🔄', '📦'][n - 1]} onChange={v => updateProps({ [`badge${n}Icon`]: v })} />
                                    <TextInput label={`Badge ${n} text`} value={props[`badge${n}Text`] ?? ['6 Colours', '6 Sizes', 'Easy Returns', 'Fast Dispatch'][n - 1]} onChange={v => updateProps({ [`badge${n}Text`]: v })} />
                                </div>
                            ))}
                        </Section>
                    )}
                </>
            )
        }

        case 'whats_in_the_box': {
            const witbVariant = props.variant ?? 'simple-list'
            const isDark = witbVariant === 'dark-panel'
            const showAccent = ['numbered', 'table-qty', 'badge-count'].includes(witbVariant)
            const isSplit = ['split-image-list', 'split-list-image'].includes(witbVariant)
            return (
                <>
                    <Section title="Box contents">
                        <TextareaInput
                            label="Items (one per line)"
                            value={Array.isArray(props.items) ? props.items.join('\n') : '1x Main Unit\n1x Power Cable\n1x User Manual\n1x Warranty Card\n2x AAA Batteries'}
                            rows={6}
                            onChange={v => updateProps({ items: v.split('\n').filter((s: string) => s.trim()) })}
                        />
                        <InfoBox>Start each item with quantity e.g. "2x AAA Batteries" — used by Badge Count and Quantity Table variants.</InfoBox>
                        <TextInput label="Heading" value={props.heading ?? "📦 What's In The Box"} onChange={v => updateProps({ heading: v })} />
                    </Section>

                    {isSplit && (
                        <Section title="Image">
                            <TextInput
                                label="Image URL"
                                value={props.splitImageUrl ?? ''}
                                onChange={v => updateProps({ splitImageUrl: v })}
                            />
                            <InfoBox>Paste a direct image URL. Leave blank to show a click-to-add placeholder on the canvas.</InfoBox>
                        </Section>
                    )}

                    <Section title="Colours">
                        {isDark ? (
                            <>
                                <ColorRow label="Panel background" value={props.darkBg ?? '#1e1535'} onChange={v => updateProps({ darkBg: v })} />
                                <ColorRow label="Text colour" value={props.darkText ?? '#ffffff'} onChange={v => updateProps({ darkText: v })} />
                                <ColorRow label="Accent / bullet" value={props.darkAccent ?? '#b8fa33'} onChange={v => updateProps({ darkAccent: v })} />
                            </>
                        ) : (
                            <>
                                <ColorRow label="Heading colour" value={props.headingColor ?? '#1e1535'} onChange={v => updateProps({ headingColor: v })} />
                                {!showAccent && (
                                    <ColorRow label="Bullet colour" value={props.bulletColor ?? '#16a34a'} onChange={v => updateProps({ bulletColor: v })} />
                                )}
                                <ColorRow label="Text colour" value={props.textColor ?? '#1f1d2e'} onChange={v => updateProps({ textColor: v })} />
                                {showAccent && (
                                    <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                                )}
                            </>
                        )}
                    </Section>
                </>
            )
        }

        case 'key_features_grid': {
            const kfFeatures: Array<{ title: string; description: string; icon?: string; badge?: string; metric?: string }> =
                props.features ?? props.items ?? [
                    { title: 'High Performance', description: 'Engineered for maximum efficiency', icon: 'shield', badge: 'FLAGSHIP', metric: 'Grade A+' },
                    { title: 'Secure & Reliable', description: 'Built to last with premium materials', icon: 'check', badge: '02', metric: '' },
                    { title: 'Premium Quality', description: 'Rigorously tested before dispatch', icon: 'check', badge: '03', metric: '' },
                ]
            const updateFeature = (i: number, field: string, val: string) => {
                const next = kfFeatures.map((f, j) => j === i ? { ...f, [field]: val } : f)
                updateProps({ features: next })
            }
            return (
                <>
                    <Section title="Section header">
                        <TextInput
                            label="Eyebrow label"
                            value={props.eyebrowText ?? ''}
                            onChange={v => updateProps({ eyebrowText: v })}
                        />
                        <TextInput
                            label="Heading"
                            value={props.heading ?? props.title ?? 'Key Product Features'}
                            onChange={v => updateProps({ heading: v })}
                        />
                        <TextareaInput
                            label="Subtitle"
                            value={props.subtitle ?? props.subheading ?? ''}
                            rows={2}
                            onChange={v => updateProps({ subtitle: v })}
                        />
                    </Section>
                    <Section title="Feature items">
                        <InfoBox>24 icons across 4 categories — click any icon card to assign it to a feature.</InfoBox>
                        {kfFeatures.map((feat, i) => (
                            <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                                <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 700, color: C.secondary }}>Feature {i + 1}</p>
                                <TextInput label="Title" value={feat.title ?? ''} onChange={v => updateFeature(i, 'title', v)} />
                                <TextareaInput label="Description" value={feat.description ?? ''} rows={2} onChange={v => updateFeature(i, 'description', v)} />
                                {/* ── Inline icon picker ── */}
                                <div style={{ marginBottom: 8 }}>
                                    <p style={{ margin: '0 0 5px', fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.secondary }}>Icon</p>
                                    <InlineIconPicker
                                        value={feat.icon ?? 'check'}
                                        onChange={v => updateFeature(i, 'icon', v)}
                                    />
                                </div>
                                <TextInput label="Badge label" value={feat.badge ?? ''} onChange={v => updateFeature(i, 'badge', v)} />
                                <TextInput label="Metric" value={feat.metric ?? ''} onChange={v => updateFeature(i, 'metric', v)} />
                            </div>
                        ))}
                        <button
                            onClick={() => updateProps({ features: [...kfFeatures, { title: 'New Feature', description: 'Description here', icon: 'check', badge: '', metric: '' }] })}
                            style={{ marginTop: 4, padding: '7px 0', borderRadius: 7, width: '100%', border: `1.5px dashed ${C.primary}`, background: C.primaryLight, color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                        >+ Add feature</button>
                        <InfoBox>ℹ️ The Circular Badge variant displays only the first 4 features.</InfoBox>
                    </Section>
                    {((props as any).variant === 'feat-split-hero-benefit-rail') && (
                        <Section title="Pledge column (Split Hero variant)">
                            <TextareaInput
                                label="Pledge description"
                                value={props.pledgeText ?? ''}
                                rows={3}
                                onChange={v => updateProps({ pledgeText: v })}
                            />
                            <TextInput
                                label="Guarantee title"
                                value={props.guaranteeTitle ?? ''}
                                onChange={v => updateProps({ guaranteeTitle: v })}
                            />
                            <TextInput
                                label="Guarantee subtitle"
                                value={props.guaranteeSubtitle ?? ''}
                                onChange={v => updateProps({ guaranteeSubtitle: v })}
                            />
                        </Section>
                    )}
                </>
            )
        }

        case 'payment_methods':
            return (
                <Section title="Payment methods">
                    <InfoBox>Displays PayPal, Visa, Mastercard, Amex and Apple Pay. Background and spacing controlled in Styles tab.</InfoBox>
                    <TextInput label="Section label" value={props.label ?? 'Secure Payment Methods'} onChange={v => updateProps({ label: v })} />
                    <ColorRow label="Badge background" value={props.badgeBg ?? '#ffffff'} onChange={v => updateProps({ badgeBg: v })} />
                    <ColorRow label="Badge text" value={props.badgeText ?? '#1f1d2e'} onChange={v => updateProps({ badgeText: v })} />
                </Section>
            )

        case 'feedback_score':
            return (
                <>
                    <Section title="Seller details">
                        <TextInput label="Feedback score" value={(props as any).feedbackScore ?? props.feedbackPercent ?? '{{SELLER_FEEDBACK}}'} onChange={v => updateProps({ feedbackScore: v, feedbackPercent: v, feedbackText: v } as any)} />
                        {phButton('feedbackScore', 'feedback score')}
                        <TextInput label="Member since" value={(props as any).memberSince ?? '{{MEMBER_SINCE}}'} onChange={v => updateProps({ memberSince: v } as any)} />
                        {phButton('memberSince', 'member since')}
                        <TextInput label="Review count" value={(props as any).reviewCount ?? ''} placeholder="e.g. 10,000+" onChange={v => updateProps({ reviewCount: v, ratingsCount: v, totalReviews: v } as any)} />
                        {phButton('reviewCount', 'review count')}
                    </Section>
                    <Section title="Heading">
                        <TextInput label="Heading text" value={(props as any).heading ?? ''} placeholder="e.g. Top Rated eBay Seller" onChange={v => updateProps({ heading: v, tagline: v } as any)} />
                        {phButton('heading', 'heading')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Badge background" value={(props as any).badgeBg ?? '#7530fb'} onChange={v => updateProps({ badgeBg: v } as any)} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                        <ColorRow label="Star colour" value={(props as any).starColor ?? '#f59e0b'} onChange={v => updateProps({ starColor: v } as any)} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'vat_notice':
            return (
                <>
                    <Section title="VAT details">
                        <TextInput label="VAT number" value={props.vatNumber ?? '{{VAT_NUMBER}}'} onChange={v => updateProps({ vatNumber: v })} />
                        {phButton('vatNumber', 'VAT number')}
                        <TextInput label="Notice text" value={props.text ?? 'Full VAT invoice included with your order.'} onChange={v => updateProps({ text: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8fafc'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#e2e8f0'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#6b7280'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                    <Section title="Company Details">
                        <TextInput label="Heading" value={(props as any).heading ?? (props as any).headingText ?? (props as any).title ?? ''} onChange={v => updateProps({ heading: v, headingText: v, title: v } as any)} />
                        <TextInput label="Company number" value={(props as any).companyNo ?? (props as any).companyNumber ?? (props as any).crn ?? (props as any).registrationNumber ?? ''} onChange={v => updateProps({ companyNo: v, companyNumber: v, crn: v } as any)} />
                        <TextInput label="VAT ID (alias)" value={(props as any).vatId ?? (props as any).vatNo ?? (props as any).taxNumber ?? ''} onChange={v => updateProps({ vatId: v, vatNo: v, taxNumber: v } as any)} />
                        <TextareaInput label="Notice text" value={(props as any).noticeText ?? (props as any).description ?? ''} rows={2} onChange={v => updateProps({ noticeText: v, description: v } as any)} />
                        <TextInput label="Sub text" value={(props as any).subText ?? ''} onChange={v => updateProps({ subText: v } as any)} />
                        <ColorRow label="Title colour" value={(props as any).titleColor ?? '#1e1535'} onChange={v => updateProps({ titleColor: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                </>
            )

        case 'store_footer':
            return (
                <>
                    <Section title="Copyright">
                        <TextInput label="Copyright text" value={props.copyrightText ?? '© {{SELLER_NAME}} · All rights reserved'} onChange={v => updateProps({ copyrightText: v })} />
                        {phButton('copyrightText', 'copyright text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Link colour" value={props.linkColor ?? 'rgba(255,255,255,0.6)'} onChange={v => updateProps({ linkColor: v })} />
                        <ColorRow label="Copyright colour" value={props.mutedColor ?? 'rgba(255,255,255,0.3)'} onChange={v => updateProps({ mutedColor: v })} />
                    </Section>
                    <Section title="Brand">
                        <TextInput label="Brand name" value={(props as any).brandName ?? (props as any).storeName ?? (props as any).sellerName ?? ''} onChange={v => updateProps({ brandName: v, storeName: v } as any)} />
                    </Section>
                    <Section title="Footer Links">
                        <TextInput label="Link 1 text" value={(props as any).link1Text ?? ''} onChange={v => updateProps({ link1Text: v } as any)} />
                        <TextInput label="Link 1 URL" value={(props as any).link1Url ?? ''} onChange={v => updateProps({ link1Url: v } as any)} />
                        <TextInput label="Link 2 text" value={(props as any).link2Text ?? ''} onChange={v => updateProps({ link2Text: v } as any)} />
                        <TextInput label="Link 2 URL" value={(props as any).link2Url ?? ''} onChange={v => updateProps({ link2Url: v } as any)} />
                        <TextInput label="Link 3 text" value={(props as any).link3Text ?? ''} onChange={v => updateProps({ link3Text: v } as any)} />
                        <TextInput label="Link 3 URL" value={(props as any).link3Url ?? ''} onChange={v => updateProps({ link3Url: v } as any)} />
                        <TextInput label="Link 4 text" value={(props as any).link4Text ?? ''} onChange={v => updateProps({ link4Text: v } as any)} />
                        <TextInput label="Link 4 URL" value={(props as any).link4Url ?? ''} onChange={v => updateProps({ link4Url: v } as any)} />
                        <TextInput label="Link 5 text" value={(props as any).link5Text ?? ''} onChange={v => updateProps({ link5Text: v } as any)} />
                        <TextInput label="Link 5 URL" value={(props as any).link5Url ?? ''} onChange={v => updateProps({ link5Url: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                </>
            )


        // ── LOWER PRIORITY BLOCKS ────────────────────────────────────────────

        case 'specs_table': {
            const rows: Array<{ key: string; value: string }> = props.rows ?? []
            const rowPhButton = (indexStr: string, _label: string) => (
                <button
                    onClick={() => {
                        const i = parseInt(indexStr)
                        // cycle through common eBay placeholders
                        const phs = ['{{BRAND}}', '{{MPN}}', '{{EAN}}', '{{ITEM_CONDITION}}', '{{MODEL}}', '{{WEIGHT}}', '{{COLOUR}}', '{{SIZE}}', '{{MATERIAL}}']
                        const cur = rows[i]?.value ?? ''
                        const next = phs.find(p => !cur.includes(p)) ?? phs[0]
                        const updated = rows.map((r, j) => j === i ? { ...r, value: cur ? cur + ', ' + next : next } : r)
                        updateProps({ rows: updated })
                    }}
                    style={{
                        marginTop: 3, padding: '2px 8px', border: `1px solid ${C.primaryBorder}`,
                        borderRadius: 5, background: C.primaryLight, color: C.primary,
                        fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                >+ Placeholder</button>
            )
            return (
                <>
                    <Section title="Title">
                        <ToggleRow label="Show section title" value={props.showTitle ?? true} onChange={v => updateProps({ showTitle: v })} />
                        {(props.showTitle ?? true) && (
                            <TextInput label="Title text" value={props.titleText ?? 'Item Specifics'} onChange={v => updateProps({ titleText: v })} />
                        )}
                    </Section>
                    <Section title={`Rows (${rows.length})`}>
                        <TableRowEditor
                            rows={rows}
                            onChange={r => updateProps({ rows: r })}
                            keyLabel="Specification"
                            valueLabel="Value"
                            phButton={rowPhButton}
                        />
                        <InfoBox>Use eBay tokens like {`{{BRAND}}`}, {`{{MPN}}`}, {`{{EAN}}`} as values — replaced at listing time.</InfoBox>
                    </Section>
                </>
            )
        }

        case 'data_table': {
            const rows: Array<{ key: string; value: string }> = Array.isArray(props.rows)
                ? props.rows.map((r: any) => Array.isArray(r) ? { key: r[0] ?? '', value: r[1] ?? '' } : r)
                : [
                    { key: 'Brand', value: '{{ BRAND }}' },
                    { key: 'Model', value: '{{ MPN }}' },
                    { key: 'Condition', value: '{{ ITEM_CONDITION }}' },
                ]
            const rowPhButton = (indexStr: string, _label: string) => (
                <button
                    onClick={() => {
                        const i = parseInt(indexStr)
                        const phs = ['{{BRAND}}', '{{MPN}}', '{{EAN}}', '{{ITEM_CONDITION}}', '{{MODEL}}', '{{SELLER_NAME}}']
                        const cur = rows[i]?.value ?? ''
                        const next = phs.find(p => !cur.includes(p)) ?? phs[0]
                        const updated = rows.map((r, j) => j === i ? { ...r, value: cur ? cur + ', ' + next : next } : r)
                        updateProps({ rows: updated.map(r => [r.key, r.value]) })
                    }}
                    style={{
                        marginTop: 3, padding: '2px 8px', border: `1px solid ${C.primaryBorder}`,
                        borderRadius: 5, background: C.primaryLight, color: C.primary,
                        fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                >+ Placeholder</button>
            )
            return (
                <Section title={`Table rows (${rows.length})`}>
                    <TableRowEditor
                        rows={rows}
                        onChange={r => updateProps({ rows: r.map(row => [row.key, row.value]) })}
                        keyLabel="Label"
                        valueLabel="Value"
                        phButton={rowPhButton}
                    />
                </Section>
            )
        }

        case 'compatibility_table': {
            const currentModelsText = Array.isArray(props.items) && props.items.length > 0
                ? props.items.map((it: any) => typeof it === 'string' ? it : `${it.model ?? ''}${it.years ? ` ${it.years}` : ''}`).filter(Boolean).join('\n')
                : Array.isArray(props.models) && props.models.length > 0
                    ? props.models.join('\n')
                    : 'Model A 2019-2023\nModel B 2020-2024\nModel C Pro All years\nModel D Mini 2021+'

            return (
                <>
                    <Section title="Heading">
                        <TextInput
                            label="Title text"
                            value={props.titleText ?? props.heading ?? 'Compatible With:'}
                            onChange={v => updateProps({ titleText: v, heading: v })}
                        />
                    </Section>
                    <Section title="Compatible models">
                        <InfoBox>Enter one model per line (e.g. "Model A 2019–2023").</InfoBox>
                        <TextareaInput
                            label="Models (one per line)"
                            value={currentModelsText}
                            rows={6}
                            onChange={v => {
                                const lines = v.split('\n').filter((s: string) => s.trim())
                                const items = lines.map((line: string) => {
                                    const match = line.match(/^(.+?)\s+(\d{4}[–\-+].*|All.*)$/i)
                                    if (match) {
                                        return { model: match[1].trim(), years: match[2].trim(), status: true }
                                    }
                                    return { model: line.trim(), years: '', status: true }
                                })
                                updateProps({ items, models: lines, compatibilityList: lines })
                            }}
                        />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? ''}
                            options={[
                                { v: '', l: 'Default (Arial)' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' },
                                { v: 'monospace', l: 'Monospace' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                    <Section title="Spacing">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <NumberInput label="Top (px)" value={(props as any).paddingTop ?? 16} min={0} max={80} onChange={v => updateProps({ paddingTop: v } as any)} />
                            <NumberInput label="Bottom (px)" value={(props as any).paddingBottom ?? 16} min={0} max={80} onChange={v => updateProps({ paddingBottom: v } as any)} />
                            <NumberInput label="Left (px)" value={(props as any).paddingLeft ?? 24} min={0} max={80} onChange={v => updateProps({ paddingLeft: v } as any)} />
                            <NumberInput label="Right (px)" value={(props as any).paddingRight ?? 24} min={0} max={80} onChange={v => updateProps({ paddingRight: v } as any)} />
                        </div>
                    </Section>
                </>
            )
        }

        case 'product_comparison':
            return (
                <Section title="Comparison table">
                    <InfoBox>Header row + data rows. Format: Feature | Our Product | Competitor (one per line)</InfoBox>
                    <TextareaInput
                        label="Rows (3 columns | separated)"
                        value={
                            Array.isArray(props.rows) && props.rows.length > 0
                                ? props.rows.map((r: any) =>
                                    Array.isArray(r)
                                        ? r.join(' | ')
                                        : `${r.feature ?? ''} | ${r.ourValue ?? ''} | ${r.competitorValue ?? ''}`
                                ).join('\n')
                                : typeof (props as any).content === 'string' && (props as any).content.includes('|')
                                    ? (props as any).content
                                    : 'Feature | Our Product | Competitor\nWarranty | 2 Years | 6 Months\nUK Stock | ✓ Yes | ✗ No'
                        }
                        rows={6}
                        onChange={v => {
                            const parsed = v.split('\n')
                                .filter((s: string) => s.includes('|'))
                                .map((s: string) => s.split('|').map((p: string) => p.trim()))
                            updateProps({ rows: parsed, content: v } as any)
                        }}
                    />
                </Section>
            )

        case 'before_after':
            return (
                <>
                    <Section title="Images">
                        <TextInput label="Before image URL" value={props.beforeSrc ?? '{{IMAGE_BEFORE}}'} onChange={v => updateProps({ beforeSrc: v })} />
                        {phButton('beforeSrc', 'before image URL')}
                        <TextInput label="After image URL" value={props.afterSrc ?? '{{IMAGE_AFTER}}'} onChange={v => updateProps({ afterSrc: v })} />
                        {phButton('afterSrc', 'after image URL')}
                    </Section>
                    <Section title="Labels">
                        <TextInput label="Before label" value={props.beforeLabel ?? 'Before'} onChange={v => updateProps({ beforeLabel: v })} />
                        <TextInput label="After label" value={props.afterLabel ?? 'After'} onChange={v => updateProps({ afterLabel: v })} />
                    </Section>
                </>
            )

        case 'logo_bar':
            return (
                <>
                    <Section title="Label">
                        <TextInput label="Caption text" value={props.caption ?? 'Trusted Brands & Certifications'} onChange={v => updateProps({ caption: v })} />
                        <ColorRow label="Caption colour" value={props.captionColor ?? '#9ca3af'} onChange={v => updateProps({ captionColor: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                    </Section>
                    <Section title="Custom Logo URLs">
                        <InfoBox>Leave blank to use built-in payment/trust logos. Paste an HTTPS image URL to replace any slot.</InfoBox>
                        <TextInput label="Logo 1 URL (PayPal)" value={props.logo1Url ?? ''} onChange={v => updateProps({ logo1Url: v })} />
                        {phButton('logo1Url', 'Logo 1 URL')}
                        <TextInput label="Logo 2 URL (Visa)" value={props.logo2Url ?? ''} onChange={v => updateProps({ logo2Url: v })} />
                        {phButton('logo2Url', 'Logo 2 URL')}
                        <TextInput label="Logo 3 URL (Mastercard)" value={props.logo3Url ?? ''} onChange={v => updateProps({ logo3Url: v })} />
                        {phButton('logo3Url', 'Logo 3 URL')}
                        <TextInput label="Logo 4 URL (eBay)" value={props.logo4Url ?? ''} onChange={v => updateProps({ logo4Url: v })} />
                        {phButton('logo4Url', 'Logo 4 URL')}
                        <TextInput label="Logo 5 URL (SSL)" value={props.logo5Url ?? ''} onChange={v => updateProps({ logo5Url: v })} />
                        {phButton('logo5Url', 'Logo 5 URL')}
                    </Section>
                </>
            )

        case 'bundle_deal':
            return (
                <>
                    <Section title="Heading">
                        <TextInput label="Heading" value={props.heading ?? '🎁 Bundle & Save'} onChange={v => updateProps({ heading: v })} />
                    </Section>
                    <Section title="Tier Labels">
                        <TextInput label="Tier 1 label" value={props.qty1Label ?? 'Buy 1'} onChange={v => updateProps({ qty1Label: v })} />
                        <TextInput label="Tier 2 label" value={props.qty2Label ?? 'Buy 2'} onChange={v => updateProps({ qty2Label: v })} />
                        <TextInput label="Tier 3 label" value={props.qty3Label ?? 'Buy 3+'} onChange={v => updateProps({ qty3Label: v })} />
                    </Section>
                    <Section title="Discount Badges">
                        <TextInput label="Tier 2 saving" value={props.save2Label ?? 'Save 10%'} onChange={v => updateProps({ save2Label: v })} />
                        <TextInput label="Tier 3 saving" value={props.save3Label ?? 'Save 20%'} onChange={v => updateProps({ save3Label: v })} />
                    </Section>
                    <Section title="Price Tokens">
                        <InfoBox>{'{{ITEM_PRICE}}'}, {'{{PRICE_2}}'} and {'{{PRICE_3}}'} are already built into the block — replace them with real prices when pasting into eBay.</InfoBox>
                    </Section>
                    {(props.variant === 'countdown-strip') && (
                        <Section title="Countdown Strip">
                            <TextInput label="Offer ends text" value={props.offerEnds ?? 'Midnight Tonight'} onChange={v => updateProps({ offerEnds: v })} />
                            <InfoBox>Replaces {'{{OFFER_ENDS}}'} in the red urgency bar.</InfoBox>
                        </Section>
                    )}
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Price colour" value={props.priceColor ?? '#ffffff'} onChange={v => updateProps({ priceColor: v })} />
                        <ColorRow label="Badge colour" value={props.badgeColor ?? '#b8fa33'} onChange={v => updateProps({ badgeColor: v })} />
                        <ColorRow label="Badge text" value={props.badgeText ?? '#1e1535'} onChange={v => updateProps({ badgeText: v })} />
                    </Section>
                </>
            )

        case 'store_header':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Store name" value={props.storeName ?? '{{SELLER_NAME}}'} onChange={v => updateProps({ storeName: v })} />
                        {phButton('storeName', 'store name')}
                        <TextInput label="Tagline" value={props.tagline ?? 'Quality products · Fast dispatch · Trusted eBay seller'} onChange={v => updateProps({ tagline: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#7530fb'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Name colour" value={props.nameColor ?? '#ffffff'} onChange={v => updateProps({ nameColor: v })} />
                        <ColorRow label="Tagline colour" value={props.taglineColor ?? 'rgba(255,255,255,0.7)'} onChange={v => updateProps({ taglineColor: v })} />
                        <ColorRow label="Accent colour" value={props.accentColor ?? '#b8fa33'} onChange={v => updateProps({ accentColor: v })} />
                    </Section >
                    <Section title="Spacing">
                        <NumberInput label="Padding top" value={(props as any).paddingTop ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Padding bottom" value={(props as any).paddingBottom ?? 24} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Padding left" value={(props as any).paddingLeft ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Padding right" value={(props as any).paddingRight ?? 20} min={0} max={120} suffix="px" onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'category_nav':
            return (
                <>
                    <Section title={`Links (${(props.links ?? []).length}/8)`}>
                        <NavLinksEditor
                            links={props.links ?? [
                                { label: 'Electronics', url: '#' },
                                { label: 'Clothing', url: '#' },
                                { label: 'Home & Garden', url: '#' },
                                { label: 'Collectibles', url: '#' },
                                { label: 'Auto Parts', url: '#' },
                            ]}
                            onChange={links => updateProps({ links })}
                        />
                        <InfoBox>
                            Paste your eBay Store category URL into each link.
                            Example: https://www.ebay.com/str/yourstore/Clothing/_i.html
                        </InfoBox>
                    </Section>
                    <Section title="Separator">
                        <SelectInput
                            label="Separator style"
                            value={props.separator ?? '|'}
                            options={[
                                { v: '|', l: '|  Pipe' },
                                { v: '•', l: '•  Bullet' },
                                { v: '·', l: '·  Middle dot' },
                                { v: '/', l: '/  Slash' },
                                { v: '-', l: '-  Hyphen' },
                                { v: '', l: '   None' },
                            ]}
                            onChange={v => updateProps({ separator: v })}
                        />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={(props as any).fontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v } as any)} />
                    </Section>
                    <Section title="Behaviour">
                        <ToggleRow label="Sticky on scroll" value={props.sticky ?? false} onChange={v => updateProps({ sticky: v })} />
                    </Section>
                </>
            )

        case 'seasonal_banner':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Heading" value={props.heading ?? 'Seasonal Sale — Up To 50% Off!'} onChange={v => updateProps({ heading: v })} />
                        <TextInput label="Sub text" value={props.subText ?? 'Limited time only · While stocks last'} onChange={v => updateProps({ subText: v })} />
                        <TextInput label="Emoji row" value={props.emoji ?? '🎁 🎄 🎁'} onChange={v => updateProps({ emoji: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#dc2626'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                    <Section title="Banner Content">
                        <TextInput label="Banner title" value={(props as any).bannerTitle ?? (props as any).title ?? ''} onChange={v => updateProps({ bannerTitle: v, title: v } as any)} />
                        <TextInput label="Banner subtitle" value={(props as any).bannerSubtitle ?? (props as any).subtitle ?? ''} onChange={v => updateProps({ bannerSubtitle: v, subtitle: v } as any)} />
                        <TextInput label="Badge text" value={(props as any).badgeText ?? ''} onChange={v => updateProps({ badgeText: v } as any)} />
                        <TextInput label="Discount text" value={(props as any).discountText ?? ''} onChange={v => updateProps({ discountText: v } as any)} />
                        <TextInput label="Discount sub" value={(props as any).discountSub ?? ''} onChange={v => updateProps({ discountSub: v } as any)} />
                        <TextInput label="Icon" value={(props as any).icon ?? ''} onChange={v => updateProps({ icon: v } as any)} />
                    </Section>
                    <Section title="Countdown Timer">
                        <NumberInput label="Hours" value={(props as any).hours ?? 0} min={0} max={99} suffix="hr" onChange={v => updateProps({ hours: v } as any)} />
                        <NumberInput label="Minutes" value={(props as any).minutes ?? 0} min={0} max={59} suffix="min" onChange={v => updateProps({ minutes: v } as any)} />
                        <NumberInput label="Seconds" value={(props as any).seconds ?? 0} min={0} max={59} suffix="sec" onChange={v => updateProps({ seconds: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                </>
            )

        case 'breadcrumb_bar':
            return (
                <>
                    <Section title="Links">
                        <TextInput label="Store name" value={props.storeName ?? '{{SELLER_NAME}}'} onChange={v => updateProps({ storeName: v })} />
                        {phButton('storeName', 'store name')}
                        <TextInput label="Category" value={props.category ?? '{{ITEM_CATEGORY}}'} onChange={v => updateProps({ category: v })} />
                        {phButton('category', 'category')}
                        <TextInput label="Product title" value={props.productTitle ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ productTitle: v })} />
                        {phButton('productTitle', 'product title')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Link colour" value={props.linkColor ?? '#7530fb'} onChange={v => updateProps({ linkColor: v })} />
                        <ColorRow label="Current page colour" value={props.activeColor ?? '#1f1d2e'} onChange={v => updateProps({ activeColor: v })} />
                    </Section>
                </>
            )

        // ── HIGH PRIORITY BLOCKS ─────────────────────────────────────────────

        case 'spacer':
            return (
                <Section title="Spacer">
                    <InfoBox>Adjust height using the Top and Bottom padding controls in the Styles tab.</InfoBox>
                </Section>
            )

        case 'single_image':
            return (
                <>
                    <Section title="Image">
                        <TextInput label="Image URL" value={props.src ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ src: v })} />
                        {phButton('src', 'image URL')}
                        <TextInput label="Alt text" value={props.alt ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ alt: v })} />
                        {phButton('alt', 'alt text')}
                    </Section>
                    <Section title="Layout">
                        <SelectInput label="Image fit" value={(props as any).objectFit ?? 'cover'} options={[{ v: 'cover', l: 'Cover' }, { v: 'contain', l: 'Contain' }, { v: 'fill', l: 'Fill' }, { v: 'none', l: 'None' }]} onChange={v => updateProps({ objectFit: v } as any)} />
                        <SelectInput label="Alignment" value={(props as any).align ?? 'center'} options={[{ v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' }]} onChange={v => updateProps({ align: v } as any)} />
                        <NumberInput label="Max width" value={(props as any).maxWidth ?? 800} min={0} max={1600} suffix="px" onChange={v => updateProps({ maxWidth: v } as any)} />
                    </Section>
                    <Section title="Caption">
                        <ToggleRow label="Show caption" value={(props as any).showCaption ?? true} onChange={v => updateProps({ showCaption: v } as any)} />
                        <TextInput label="Caption text" value={props.caption ?? ''} onChange={v => updateProps({ caption: v })} />
                        {phButton('caption', 'caption')}
                        <ColorRow label="Caption colour" value={(props as any).captionColor ?? '#6b7280'} onChange={v => updateProps({ captionColor: v } as any)} />
                    </Section>
                </>
            )

        case 'numbered_list':
            return (
                <Section title="List items">
                    <InfoBox>One item per line. Use tokens for dynamic content.</InfoBox>
                    <TextareaInput
                        label="Items (one per line)"
                        value={Array.isArray(props.items) ? props.items.join('\n') : 'Step one\nStep two\nStep three'}
                        rows={5}
                        onChange={v => updateProps({ items: v.split('\n').filter((s: string) => s.trim()) })}
                    />
                    <ColorRow label="Number bubble colour" value={props.bulletColor ?? '#7530fb'} onChange={v => updateProps({ bulletColor: v })} />
                    <ColorRow label="Text colour" value={props.color ?? '#1f1d2e'} onChange={v => updateProps({ color: v })} />
                </Section>
            )

        case 'quote_block':
            return (
                <>
                    <Section title="Quote">
                        <TextareaInput label="Quote text" value={props.quoteText ?? 'Excellent product, exactly as described.'} rows={3} onChange={v => updateProps({ quoteText: v })} />
                        {phButton('quoteText', 'quote text')}
                        <TextInput label="Attribution" value={props.attribution ?? '— Verified Buyer ★★★★★'} onChange={v => updateProps({ attribution: v })} />
                        {phButton('attribution', 'attribution')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Quote mark colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Text colour" value={props.color ?? '#1f1d2e'} onChange={v => updateProps({ color: v })} />
                        <ColorRow label="Attribution colour" value={props.mutedColor ?? '#6b7280'} onChange={v => updateProps({ mutedColor: v })} />
                    </Section>
                </>
            )

        case 'warning_box':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Heading" value={props.heading ?? 'Please Read Before Buying'} onChange={v => updateProps({ heading: v })} />
                        <TextareaInput label="Body text" value={props.text ?? 'Please check compatibility before purchasing.'} rows={3} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'body text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#fef9c3'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Heading colour" value={props.headingColor ?? '#92400e'} onChange={v => updateProps({ headingColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#78350f'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'info_box':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Heading" value={props.heading ?? 'Important Information'} onChange={v => updateProps({ heading: v })} />
                        <TextareaInput label="Body text" value={props.text ?? 'This item ships from a UK warehouse.'} rows={3} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'body text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#eff6ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Heading colour" value={props.headingColor ?? '#1e40af'} onChange={v => updateProps({ headingColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1d4ed8'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'badge_row':
            return (
                <Section title="Badges">
                    <InfoBox>One badge per line. Use emoji + text e.g. ✓ Genuine</InfoBox>
                    <TextareaInput
                        label="Badges (one per line)"
                        value={Array.isArray(props.badges) ? props.badges.join('\n') : '✓ Genuine\n📦 UK Stock\n★ Top Rated\n🔄 Easy Returns'}
                        rows={4}
                        onChange={v => updateProps({ badges: v.split('\n').filter((s: string) => s.trim()) })}
                    />
                    <ColorRow label="Badge background" value={props.badgeBg ?? '#f3eeff'} onChange={v => updateProps({ badgeBg: v })} />
                    <ColorRow label="Badge text" value={props.badgeColor ?? '#7530fb'} onChange={v => updateProps({ badgeColor: v })} />
                </Section>
            )

        case 'dispatch_timer':
            return (
                <>
                    <Section title="Message">
                        <TextInput label="Main text" value={props.text ?? 'Order in the next {{HOURS_LEFT}} hours for Same Day Dispatch'} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'main text')}
                        <TextInput label="Sub text" value={props.subText ?? 'Dispatched same working day if ordered by 2pm'} onChange={v => updateProps({ subText: v })} />
                        {phButton('subText', 'sub text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f0fdf4'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#166534'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Highlight colour" value={props.highlightColor ?? '#dc2626'} onChange={v => updateProps({ highlightColor: v })} />
                    </Section>
                </>
            )

        case 'free_shipping':
        case 'free_shipping_banner':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Heading" value={(props as any).heading ?? (props as any).bannerTitle ?? (props as any).shippingTitle ?? 'Fast & Free Domestic Shipping'} onChange={v => updateProps({ heading: v, bannerTitle: v, shippingTitle: v } as any)} />
                        {phButton('heading', 'heading')}
                        <TextInput label="Sub text" value={(props as any).subText ?? (props as any).bannerSubtitle ?? (props as any).shippingSubtext ?? ''} placeholder="e.g. Orders placed before 2 PM dispatch same day" onChange={v => updateProps({ subText: v, bannerSubtitle: v, shippingSubtext: v } as any)} />
                        {phButton('subText', 'sub text')}
                    </Section>
                    <Section title="Badge">
                        <TextInput label="Badge text" value={(props as any).badge ?? (props as any).badgeText ?? (props as any).tag ?? 'SAME-DAY DISPATCH'} onChange={v => updateProps({ badge: v, badgeText: v, tag: v } as any)} />
                    </Section>
                    <Section title="Carrier & Dispatch">
                        <TextInput label="Carrier name" value={(props as any).carrier ?? (props as any).carrierName ?? (props as any).courier ?? ''} placeholder="e.g. FedEx Tracked / Royal Mail" onChange={v => updateProps({ carrier: v, carrierName: v, courier: v } as any)} />
                        {phButton('carrier', 'carrier')}
                        <TextInput label="Dispatch time" value={(props as any).dispatchTime ?? (props as any).handlingTime ?? (props as any).cutoff ?? ''} placeholder="e.g. Within 24 Hours" onChange={v => updateProps({ dispatchTime: v, handlingTime: v, cutoff: v } as any)} />
                        {phButton('dispatchTime', 'dispatch time')}
                    </Section>
                </>
            )

        case 'why_buy_from_us':
            return (
                <>
                    <Section title="Heading">
                        <TextInput label="Section heading" value={props.heading ?? 'Why Shop With Us?'} onChange={v => updateProps({ heading: v })} />
                        <ColorRow label="Heading colour" value={props.headingColor ?? '#1e1535'} onChange={v => updateProps({ headingColor: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Title colour" value={props.titleColor ?? '#1e1535'} onChange={v => updateProps({ titleColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#6b7280'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'satisfaction_guarantee':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Heading" value={props.heading ?? '100% Satisfaction Guaranteed'} onChange={v => updateProps({ heading: v })} />
                        <TextareaInput label="Sub text" value={props.text ?? 'Trusted by thousands of eBay buyers. Your satisfaction is our priority.'} rows={2} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'sub text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Heading colour" value={props.headingColor ?? '#7530fb'} onChange={v => updateProps({ headingColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#6b7280'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Star colour" value={props.starColor ?? '#f59e0b'} onChange={v => updateProps({ starColor: v })} />
                    </Section>
                    <Section title="Content">
                        <TextInput label="Guarantee title" value={(props as any).guaranteeTitle ?? (props as any).bannerTitle ?? ''} onChange={v => updateProps({ guaranteeTitle: v, bannerTitle: v } as any)} />
                        <TextareaInput label="Guarantee subtext" value={(props as any).guaranteeSubtext ?? (props as any).bannerSubtitle ?? ''} rows={3} onChange={v => updateProps({ guaranteeSubtext: v, bannerSubtitle: v } as any)} />
                        <TextInput label="Badge text" value={(props as any).badgeText ?? (props as any).badge ?? (props as any).tag ?? ''} onChange={v => updateProps({ badgeText: v, badge: v, tag: v } as any)} />
                        <TextInput label="Sub title" value={(props as any).subtitle ?? (props as any).subText ?? ''} onChange={v => updateProps({ subtitle: v, subText: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput
                            label="Font family"
                            value={(props as any).fontFamily ?? 'inherit'}
                            options={[
                                { v: 'inherit', l: 'Theme default' },
                                { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                                { v: 'Georgia, serif', l: 'Georgia' },
                                { v: '"Trebuchet MS", sans-serif', l: 'Trebuchet MS' },
                                { v: 'Verdana, sans-serif', l: 'Verdana' },
                                { v: '"Courier New", monospace', l: 'Courier New' },
                            ]}
                            onChange={v => updateProps({ fontFamily: v } as any)}
                        />
                    </Section>
                </>
            )

        case 'page_title':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title text" value={props.text ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'title text')}
                    </Section>
                    <Section title="Style">
                        <ColorRow label="Text colour" value={props.color ?? '#1e1535'} onChange={v => updateProps({ color: v })} />
                        <ColorRow label="Underline colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 28} min={16} max={60} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                </>
            )

        case 'section_label':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Label text" value={props.text ?? '{{SECTION_LABEL}}'} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'label text')}
                    </Section>
                    <Section title="Style">
                        <ColorRow label="Text colour" value={props.color ?? '#7530fb'} onChange={v => updateProps({ color: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 11} min={8} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                    <Section title="Content">
                        <TextInput label="Heading" value={(props as any).heading ?? ''} onChange={v => updateProps({ heading: v } as any)} />
                        <TextInput label="Label text" value={(props as any).labelText ?? (props as any).label ?? ''} onChange={v => updateProps({ labelText: v, label: v } as any)} />
                    </Section>
                    <Section title="Alignment">
                        <SelectInput
                            label="Align"
                            value={(props as any).align ?? 'left'}
                            options={[
                                { v: 'left', l: 'Left' },
                                { v: 'center', l: 'Center' },
                                { v: 'right', l: 'Right' },
                            ]}
                            onChange={v => updateProps({ align: v } as any)}
                        />
                        <SelectInput
                            label="Text align"
                            value={(props as any).textAlign ?? 'left'}
                            options={[
                                { v: 'left', l: 'Left' },
                                { v: 'center', l: 'Center' },
                                { v: 'right', l: 'Right' },
                            ]}
                            onChange={v => updateProps({ textAlign: v } as any)}
                        />
                    </Section>
                </>
            )

        case 'pull_quote':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput label="Quote text" value={props.text ?? 'Quality is not an act, it is a habit.'} rows={3} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'quote text')}
                        <TextInput label="Attribution" value={props.attribution ?? '— {{SELLER_NAME}}'} onChange={v => updateProps({ attribution: v })} />
                        {phButton('attribution', 'attribution')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Quote text colour" value={props.color ?? '#1e1535'} onChange={v => updateProps({ color: v })} />
                        <ColorRow label="Quote mark colour" value={props.accentColor ?? '#ede9fe'} onChange={v => updateProps({ accentColor: v })} />
                        <ColorRow label="Attribution colour" value={props.attributionColor ?? '#7530fb'} onChange={v => updateProps({ attributionColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <NumberInput label="Font size" value={(props as any).fontSize ?? 18} min={10} max={48} suffix="px" onChange={v => updateProps({ fontSize: v } as any)} />
                        <ColorRow label="Quote mark colour" value={(props as any).markColor ?? '#7530fb'} onChange={v => updateProps({ markColor: v } as any)} />
                        <ColorRow label="Quote text colour" value={(props as any).quoteColor ?? '#1e1535'} onChange={v => updateProps({ quoteColor: v } as any)} />
                    </Section>
                    <Section title="Content (aliases)">
                        <TextareaInput label="Quote content" value={(props as any).content ?? (props as any).quote ?? ''} rows={3} onChange={v => updateProps({ content: v, quote: v } as any)} />
                        <TextInput label="Author" value={(props as any).author ?? (props as any).authorText ?? ''} onChange={v => updateProps({ author: v, authorText: v } as any)} />
                    </Section>
                </>
            )

        case 'highlight_text':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Highlight text" value={props.text ?? '{{HIGHLIGHT_TEXT}}'} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'highlight text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#b8fa33'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    </Section>
                </>
            )

        case 'condition_badge':
            return (
                <>
                    <Section title="Condition">
                        <SelectInput
                            label="Condition"
                            value={props.condition ?? 'new'}
                            options={[
                                { v: 'new', l: '✦ New' },
                                { v: 'used', l: '↺ Used' },
                                { v: 'refurbished', l: '⟳ Refurbished' },
                                { v: 'open_box', l: '📦 Open Box' },
                                { v: 'for_parts', l: '⚙ For Parts / Not Working' },
                            ]}
                            onChange={v => updateProps({ condition: v })}
                        />
                        <TextInput
                            label="Custom condition label"
                            value={(props as any).conditionLabel ?? ''}
                            placeholder="e.g. Certified Pre-Owned"
                            onChange={v => updateProps({ conditionLabel: v } as any)}
                        />
                        <InfoBox>Leave blank to use the default label for the selected condition above.</InfoBox>
                        <ToggleRow label="Show icon" value={props.showIcon ?? true} onChange={v => updateProps({ showIcon: v })} />
                    </Section>
                    <Section title="Heading">
                        <TextInput
                            label="Heading text"
                            value={(props as any).heading ?? ''}
                            placeholder="e.g. Item Condition"
                            onChange={v => updateProps({ heading: v } as any)}
                        />
                    </Section>
                    <Section title="Description">
                        <TextareaInput
                            label="Condition description"
                            value={props.subText ?? (props as any).conditionNotes ?? (props as any).notes ?? ''}
                            rows={3}
                            placeholder="Describe the item's exact condition — scratches, testing status, accessories included, etc."
                            onChange={v => updateProps({ subText: v, conditionNotes: v, notes: v } as any)}
                        />
                    </Section>
                    <Section title="Block Title">
                        <TextInput
                            label="Title text"
                            value={(props as any).title ?? ''}
                            placeholder="e.g. Item Condition"
                            onChange={v => updateProps({ title: v } as any)}
                        />
                    </Section>
                </>
            )

        case 'item_specifics': {
            const rows: Array<{ key: string; value: string }> = props.rows ?? []
            const rowPhButton = (indexStr: string, _label: string) => (
                <button
                    onClick={() => {
                        const i = parseInt(indexStr)
                        const phs = ['{{BRAND}}', '{{MPN}}', '{{EAN}}', '{{ITEM_CONDITION}}', '{{MODEL}}', '{{COLOUR}}', '{{SIZE}}', '{{MATERIAL}}', '{{WEIGHT}}']
                        const cur = rows[i]?.value ?? ''
                        const next = phs.find(p => !cur.includes(p)) ?? phs[0]
                        const updated = rows.map((r, j) => j === i ? { ...r, value: cur ? cur + ', ' + next : next } : r)
                        updateProps({ rows: updated })
                    }}
                    style={{
                        marginTop: 3, padding: '2px 8px', border: `1px solid ${C.primaryBorder}`,
                        borderRadius: 5, background: C.primaryLight, color: C.primary,
                        fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                >+ Placeholder</button>
            )
            return (
                <>
                    <Section title="Title">
                        <ToggleRow label="Show section title" value={props.showTitle ?? true} onChange={v => updateProps({ showTitle: v })} />
                        {(props.showTitle ?? true) && (
                            <TextInput label="Title text" value={props.titleText ?? 'Item Specifics'} onChange={v => updateProps({ titleText: v })} />
                        )}
                    </Section>
                    <Section title={`Rows (${rows.length})`}>
                        <TableRowEditor
                            rows={rows}
                            onChange={r => updateProps({ rows: r })}
                            keyLabel="Field name"
                            valueLabel="Value"
                            phButton={rowPhButton}
                        />
                        <InfoBox>Use eBay tokens like {`{{BRAND}}`}, {`{{MPN}}`}, {`{{EAN}}`} as values — replaced at listing time.</InfoBox>
                    </Section>
                </>
            )
        }

        case 'border_box':
            return (
                <Section title="Content">
                    <TextareaInput
                        label="Box content"
                        value={props.content ?? 'Your content goes here inside this decorative border box.'}
                        rows={5}
                        onChange={v => updateProps({ content: v })}
                    />
                    {phButton('content', 'content')}
                </Section>
            )

        case 'price_tag': {
            const ptVariant = props.variant ?? 'classic-strike'
            const hasBadge = ['classic-strike', 'minimalist-inline', 'stacked-deal-card', 'discount-badge-pill', 'high-contrast-flash'].includes(ptVariant)
            return (
                <>
                    <Section title="Pricing">
                        <TextInput
                            label="Current price"
                            value={props.itemPrice ?? props.price ?? '£19.99'}
                            onChange={v => updateProps({ itemPrice: v, price: v })}
                        />
                        <TextInput
                            label="Original / was price"
                            value={props.originalPrice ?? props.wasPrice ?? props.msrp ?? '£34.99'}
                            onChange={v => updateProps({ originalPrice: v, wasPrice: v })}
                        />
                        <TextInput
                            label="Saving amount (e.g. Save £15)"
                            value={props.discountAmount ?? props.savingsAmount ?? 'Save £15'}
                            onChange={v => updateProps({ discountAmount: v, savingsAmount: v })}
                        />
                        <TextInput
                            label="Saving percent (e.g. 43% OFF)"
                            value={props.discountPercent ?? props.savingsPercent ?? '43% OFF'}
                            onChange={v => updateProps({ discountPercent: v, savingsPercent: v })}
                        />
                    </Section>
                    {hasBadge && (
                        <Section title="Badge">
                            <TextInput
                                label="Badge label"
                                value={props.badgeText ?? 'BEST PRICE'}
                                onChange={v => updateProps({ badgeText: v })}
                            />
                        </Section>
                    )}
                    <Section title="Options">
                        <ToggleRow
                            label="Preserve placeholder tokens"
                            value={props.preserveTokens ?? false}
                            onChange={v => updateProps({ preserveTokens: v })}
                        />
                    </Section>
                </>
            )
        }

        case 'hero_product': {
            const bullets: string[] = props.rightBullets ?? ['Feature one', 'Feature two', 'Feature three']
            return (
                <>
                    <Section title="Product info">
                        <TextInput
                            label="Product title"
                            value={props.rightTitle ?? 'Premium Product Title'}
                            onChange={v => updateProps({ rightTitle: v })}
                        />
                        <TextInput
                            label="Current price"
                            value={props.rightPrice ?? '£19.99'}
                            onChange={v => updateProps({ rightPrice: v })}
                        />
                        <TextInput
                            label="Original / was price"
                            value={props.rightOriginal ?? '£34.99'}
                            onChange={v => updateProps({ rightOriginal: v })}
                        />
                        <TextInput
                            label="Stock quantity"
                            value={String(props.rightQuantity ?? '12')}
                            onChange={v => updateProps({ rightQuantity: v })}
                        />
                    </Section>
                    <Section title="Badges">
                        <TextInput
                            label="Product badge text"
                            value={props.rightBadgeText ?? 'TOP PICK'}
                            onChange={v => updateProps({ rightBadgeText: v })}
                        />
                        <TextInput
                            label="Stock badge text"
                            value={props.stockBadgeText ?? 'In Stock'}
                            onChange={v => updateProps({ stockBadgeText: v })}
                        />
                        <TextInput
                            label="Guarantee tag text"
                            value={props.guaranteeTagText ?? '30-Day Money Back'}
                            onChange={v => updateProps({ guaranteeTagText: v })}
                        />
                    </Section>
                    <Section title={`Bullet points (${bullets.length})`}>
                        {bullets.map((b, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <input
                                    style={{
                                        flex: 1,
                                        background: 'var(--pp-input-bg)',
                                        border: '1px solid var(--pp-border)',
                                        borderRadius: 4,
                                        color: 'var(--pp-text)',
                                        fontSize: 12,
                                        padding: '4px 8px',
                                    }}
                                    value={b}
                                    onChange={e => {
                                        const next = [...bullets]
                                        next[i] = e.target.value
                                        updateProps({ rightBullets: next })
                                    }}
                                />
                                <button
                                    style={{
                                        background: 'var(--pp-danger, #dc2626)',
                                        border: 'none',
                                        borderRadius: 4,
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        padding: '0 8px',
                                    }}
                                    onClick={() => {
                                        const next = bullets.filter((_, j) => j !== i)
                                        updateProps({ rightBullets: next })
                                    }}
                                >✕</button>
                            </div>
                        ))}
                        {bullets.length < 8 && (
                            <button
                                style={{
                                    background: 'var(--pp-accent, #7530fb)',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    marginTop: 4,
                                    padding: '4px 12px',
                                }}
                                onClick={() => updateProps({ rightBullets: [...bullets, 'New feature'] })}
                            >+ Add bullet</button>
                        )}
                    </Section>
                    <Section title="Images">
                        <TextInput
                            label="Main product image URL"
                            value={props.leftImage ?? ''}
                            onChange={v => updateProps({ leftImage: v })}
                        />
                        <TextInput
                            label="Thumbnail 1 URL"
                            value={props.thumb1 ?? ''}
                            onChange={v => updateProps({ thumb1: v })}
                        />
                        <TextInput
                            label="Thumbnail 2 URL"
                            value={props.thumb2 ?? ''}
                            onChange={v => updateProps({ thumb2: v })}
                        />
                        <TextInput
                            label="Thumbnail 3 URL"
                            value={props.thumb3 ?? ''}
                            onChange={v => updateProps({ thumb3: v })}
                        />
                        <TextInput
                            label="Thumbnail 4 URL"
                            value={props.thumb4 ?? ''}
                            onChange={v => updateProps({ thumb4: v })}
                        />
                    </Section>

                    {/* ── Behaviour ── */}
                    <Section title="Behaviour">
                        <ToggleRow label="Show original / was price" value={(props as any).showOriginal ?? true} onChange={v => updateProps({ showOriginal: v } as any)} />
                        <ToggleRow label="Show scarcity bar" value={(props as any).showScarcity ?? false} onChange={v => updateProps({ showScarcity: v } as any)} />
                        <ToggleRow label="Show stock badge" value={(props as any).showStockBadge ?? true} onChange={v => updateProps({ showStockBadge: v } as any)} />
                        <ToggleRow label="Show guarantee tag" value={(props as any).showGuaranteeTag ?? true} onChange={v => updateProps({ showGuaranteeTag: v } as any)} />
                        <TextInput
                            label="Condition"
                            value={(props as any).rightCondition ?? ''}
                            onChange={v => updateProps({ rightCondition: v } as any)}
                        />
                    </Section>
                </>
            )
        }

        case 'heading': {
            const hv = props.variant ?? 'hd-classic-accent-bar'
            const isIconBadge = hv === 'hd-icon-badge-prefix' || hv === 'icon-badge-prefix'
            const isEditorial = hv === 'hd-editorial-pill-tag' || hv === 'editorial-pill-tag'
            const isStepCounter = hv === 'hd-step-counter-header' || hv === 'step-counter-header'

            return (
                <>
                    <Section title="Heading Content">
                        <TextareaInput
                            label="Heading text"
                            value={props.text ?? 'Section Heading'}
                            rows={2}
                            onChange={v => updateProps({ text: v })}
                        />
                        {phButton('text', 'heading')}
                        <SelectInput
                            label="Heading level"
                            value={props.level ?? 'h2'}
                            options={[
                                { v: 'h1', l: 'H1 — Page title' },
                                { v: 'h2', l: 'H2 — Section heading' },
                                { v: 'h3', l: 'H3 — Sub heading' },
                                { v: 'h4', l: 'H4 — Small heading' },
                            ]}
                            onChange={v => updateProps({ level: v })}
                        />
                    </Section>

                    {/* Subtitle (Shown for Icon Badge style) */}
                    {isIconBadge && (
                        <Section title="Subtitle">
                            <TextareaInput
                                label="Subtitle text"
                                value={props.subtitle ?? 'Verified product specifications & technical details'}
                                rows={2}
                                onChange={v => updateProps({ subtitle: v })}
                            />
                            {phButton('subtitle', 'subtitle')}
                        </Section>
                    )}

                    {/* Badge / Step Text */}
                    {(isEditorial || isStepCounter) && (
                        <Section title={isStepCounter ? 'Step Number' : 'Badge Tag'}>
                            <TextInput
                                label={isStepCounter ? 'Step number (e.g. 01)' : 'Pill tag text'}
                                value={props.badgeText ?? (isStepCounter ? '01' : 'SECTION OVERVIEW')}
                                onChange={v => updateProps({ badgeText: v })}
                            />
                        </Section>
                    )}

                    {/* Icon Selection UI with Inline Picker & Slot Highlight */}
                    {isIconBadge && (
                        <Section title="Badge Icon">
                            <div style={{
                                padding: '10px',
                                background: selectedSubSlot === 'icon' ? C.primaryLight : '#fafafa',
                                border: `1.5px solid ${selectedSubSlot === 'icon' ? C.primary : '#ede9fe'}`,
                                borderRadius: 8,
                                marginBottom: 6,
                            }}>
                                <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: C.secondary }}>
                                    Select Icon or click icon on canvas:
                                </p>
                                <InlineIconPicker
                                    value={props.icon ?? 'layers'}
                                    onChange={v => updateProps({ icon: v, iconName: v })}
                                />
                            </div>
                        </Section>
                    )}
                </>
            )
        }

        case 'paragraph':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput
                            label="Text"
                            value={props.text ?? 'Enter your paragraph text here.'}
                            rows={5}
                            onChange={v => updateProps({ text: v })}
                        />
                        {phButton('text', 'text')}
                    </Section>
                </>
            )

        case 'image':
            return (
                <>
                    <Section title="Image">
                        <TextInput label="Image URL" value={props.src ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ src: v })} />
                        {phButton('src', 'image URL')}
                        <TextInput label="Alt text" value={props.alt ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ alt: v })} />
                        <TextInput label="Link URL (optional)" value={props.linkUrl ?? ''} onChange={v => updateProps({ linkUrl: v })} />
                    </Section>
                    <Section title="Layout">
                        <TextInput label="Width" value={String(props.width ?? 100)} onChange={v => updateProps({ width: Number(v) || 100 })} />
                        <SelectInput
                            label="Width unit"
                            value={props.widthUnit ?? '%'}
                            options={[
                                { v: '%', l: '% — Percentage' },
                                { v: 'px', l: 'px — Fixed pixels' },
                            ]}
                            onChange={v => updateProps({ widthUnit: v })}
                        />
                        <SelectInput
                            label="Alignment"
                            value={props.align ?? 'center'}
                            options={[
                                { v: 'left', l: 'Left' },
                                { v: 'center', l: 'Center' },
                                { v: 'right', l: 'Right' },
                            ]}
                            onChange={v => updateProps({ align: v })}
                        />
                    </Section>
                </>
            )

        case 'bullet_list': {
            const blItems: string[] = props.items ?? ['Feature one — describe your product benefit', 'Feature two — another key selling point', 'Feature three — quality guarantee']
            return (
                <>
                    <Section title={`Items (${blItems.length})`}>
                        {blItems.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <input
                                    style={{ flex: 1, background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '4px 8px' }}
                                    value={item}
                                    onChange={e => {
                                        const next = [...blItems]
                                        next[i] = e.target.value
                                        updateProps({ items: next })
                                    }}
                                />
                                <button
                                    style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '0 8px' }}
                                    onClick={() => updateProps({ items: blItems.filter((_, j) => j !== i) })}
                                >✕</button>
                            </div>
                        ))}
                        {blItems.length < 12 && (
                            <button
                                style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }}
                                onClick={() => updateProps({ items: [...blItems, 'New feature'] })}
                            >+ Add item</button>
                        )}
                    </Section>
                    <Section title="Style">
                        <SelectInput
                            label="Bullet style"
                            value={props.bulletStyle ?? 'check'}
                            options={[
                                { v: 'check', l: '✔ Check' },
                                { v: 'dot', l: '• Dot' },
                                { v: 'arrow', l: '→ Arrow' },
                                { v: 'star', l: '★ Star' },
                                { v: 'none', l: 'None' },
                            ]}
                            onChange={v => updateProps({ bulletStyle: v })}
                        />
                    </Section>
                </>
            )
        }

        case 'features': {
            const feats: { icon: string; label: string; subText: string }[] = props.features ?? [
                { icon: '⭐', label: 'Top Quality', subText: 'Premium Materials' },
                { icon: '🚚', label: 'Fast Shipping', subText: 'Tracked Delivery' },
                { icon: '↩️', label: 'Easy Returns', subText: '30-Day Policy' },
            ]
            return (
                <>
                    <Section title={`Features (${feats.length})`}>
                        {feats.map((f, i) => (
                            <div key={i} style={{ background: 'var(--pp-section-bg, rgba(255,255,255,0.04))', border: '1px solid var(--pp-border)', borderRadius: 6, marginBottom: 6, padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--pp-text-muted)', fontSize: 11 }}>Feature {i + 1}</span>
                                    <button
                                        style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}
                                        onClick={() => updateProps({ features: feats.filter((_, j) => j !== i) })}
                                    >✕</button>
                                </div>
                                <input placeholder="Icon (emoji)" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={f.icon} onChange={e => { const next = [...feats]; next[i] = { ...next[i], icon: e.target.value }; updateProps({ features: next }) }} />
                                <input placeholder="Label" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={f.label} onChange={e => { const next = [...feats]; next[i] = { ...next[i], label: e.target.value }; updateProps({ features: next }) }} />
                                <input placeholder="Sub text" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', boxSizing: 'border-box' }} value={f.subText} onChange={e => { const next = [...feats]; next[i] = { ...next[i], subText: e.target.value }; updateProps({ features: next }) }} />
                            </div>
                        ))}
                        {feats.length < 6 && (
                            <button
                                style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }}
                                onClick={() => updateProps({ features: [...feats, { icon: '✅', label: 'New Feature', subText: 'Description here' }] })}
                            >+ Add feature</button>
                        )}
                    </Section>
                </>
            )
        }

        case 'faq_block': {
            const faqs: { question: string; answer: string }[] = props.faqs ?? [
                { question: 'What is the warranty?', answer: 'All items come with a 30-day money back guarantee.' },
                { question: 'How long does shipping take?', answer: 'Most orders ship within 24 hours of payment clearance.' },
            ]
            return (
                <>
                    <Section title={`FAQs (${faqs.length})`}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{ background: 'var(--pp-section-bg, rgba(255,255,255,0.04))', border: '1px solid var(--pp-border)', borderRadius: 6, marginBottom: 6, padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--pp-text-muted)', fontSize: 11 }}>FAQ {i + 1}</span>
                                    <button
                                        style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}
                                        onClick={() => updateProps({ faqs: faqs.filter((_, j) => j !== i) })}
                                    >✕</button>
                                </div>
                                <input placeholder="Question" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={faq.question} onChange={e => { const next = [...faqs]; next[i] = { ...next[i], question: e.target.value }; updateProps({ faqs: next }) }} />
                                <textarea placeholder="Answer" rows={2} style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', resize: 'vertical', boxSizing: 'border-box' }} value={faq.answer} onChange={e => { const next = [...faqs]; next[i] = { ...next[i], answer: e.target.value }; updateProps({ faqs: next }) }} />
                            </div>
                        ))}
                        {faqs.length < 10 && (
                            <button
                                style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }}
                                onClick={() => updateProps({ faqs: [...faqs, { question: 'New question?', answer: 'Answer here.' }] })}
                            >+ Add FAQ</button>
                        )}
                    </Section>
                </>
            )
        }

        case 'testimonial_block': {
            const testimonials: { text: string; author: string; rating: number }[] = props.testimonials ?? [
                { text: 'Amazing product! Exactly as described.', author: 'John D.', rating: 5 },
                { text: 'Fast shipping and great quality.', author: 'Sarah M.', rating: 4 },
            ]
            return (
                <>
                    <Section title={`Testimonials (${testimonials.length})`}>
                        {testimonials.map((t, i) => (
                            <div key={i} style={{ background: 'var(--pp-section-bg, rgba(255,255,255,0.04))', border: '1px solid var(--pp-border)', borderRadius: 6, marginBottom: 6, padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--pp-text-muted)', fontSize: 11 }}>Review {i + 1}</span>
                                    <button
                                        style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }}
                                        onClick={() => updateProps({ testimonials: testimonials.filter((_, j) => j !== i) })}
                                    >✕</button>
                                </div>
                                <textarea placeholder="Review text" rows={2} style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, resize: 'vertical', boxSizing: 'border-box' }} value={t.text} onChange={e => { const next = [...testimonials]; next[i] = { ...next[i], text: e.target.value }; updateProps({ testimonials: next }) }} />
                                <input placeholder="Author name" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={t.author} onChange={e => { const next = [...testimonials]; next[i] = { ...next[i], author: e.target.value }; updateProps({ testimonials: next }) }} />
                                <SelectInput
                                    label="Rating"
                                    value={String(t.rating ?? 5)}
                                    options={[
                                        { v: '5', l: '★★★★★ 5 stars' },
                                        { v: '4', l: '★★★★☆ 4 stars' },
                                        { v: '3', l: '★★★☆☆ 3 stars' },
                                    ]}
                                    onChange={v => { const next = [...testimonials]; next[i] = { ...next[i], rating: Number(v) }; updateProps({ testimonials: next }) }}
                                />
                            </div>
                        ))}
                        {testimonials.length < 6 && (
                            <button
                                style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }}
                                onClick={() => updateProps({ testimonials: [...testimonials, { text: 'Great product!', author: 'Happy Customer', rating: 5 }] })}
                            >+ Add review</button>
                        )}
                    </Section>
                </>
            )
        }

        case 'compatibility_block': {
            const compatModels: string[] = props.compatibleModels ?? ['Model A 2020+', 'Model B Pro', 'Model C']
            const incompatModels: string[] = props.incompatibleModels ?? ['Old Model X', 'Legacy Series']
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={props.title ?? 'Check Compatibility'} onChange={v => updateProps({ title: v })} />
                    </Section>
                    <Section title={`Compatible models (${compatModels.length})`}>
                        {compatModels.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <input style={{ flex: 1, background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '4px 8px' }} value={m} onChange={e => { const next = [...compatModels]; next[i] = e.target.value; updateProps({ compatibleModels: next }) }} />
                                <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '0 8px' }} onClick={() => updateProps({ compatibleModels: compatModels.filter((_, j) => j !== i) })}>✕</button>
                            </div>
                        ))}
                        <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ compatibleModels: [...compatModels, 'New Model'] })}>+ Add model</button>
                    </Section>
                    <Section title={`Incompatible models (${incompatModels.length})`}>
                        {incompatModels.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <input style={{ flex: 1, background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '4px 8px' }} value={m} onChange={e => { const next = [...incompatModels]; next[i] = e.target.value; updateProps({ incompatibleModels: next }) }} />
                                <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '0 8px' }} onClick={() => updateProps({ incompatibleModels: incompatModels.filter((_, j) => j !== i) })}>✕</button>
                            </div>
                        ))}
                        <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ incompatibleModels: [...incompatModels, 'Incompatible Model'] })}>+ Add model</button>
                    </Section>
                </>
            )
        }

        case 'container':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput
                            label="Content"
                            value={props.content ?? 'Your content goes here.'}
                            rows={4}
                            onChange={v => updateProps({ content: v })}
                        />
                        {phButton('content', 'content')}
                    </Section>
                    <Section title="Layout">
                        <TextInput label="Max width (px)" value={String(props.maxWidth ?? 600)} onChange={v => updateProps({ maxWidth: Number(v) || 600 })} />
                    </Section>
                </>
            )

        case 'store_nav_bar':
            return (
                <>
                    <Section title={`Links (${(props.links ?? []).length}/8)`}>
                        <NavLinksEditor
                            links={props.links ?? [
                                { label: 'Electronics', url: '#' },
                                { label: 'Home & Garden', url: '#' },
                                { label: 'Fashion', url: '#' },
                            ]}
                            onChange={links => updateProps({ links })}
                        />
                        <InfoBox>
                            Paste your eBay Store category URL into each link.
                            Example: https://www.ebay.com/str/yourstore/Clothing/_i.html
                        </InfoBox>
                    </Section>
                </>
            )

        case 'money_back':
            return (
                <>
                    <Section title="Content">
                        <TextInput
                            label="Guarantee title"
                            value={props.heading ?? props.guaranteeTitle ?? '30-Day Money Back Guarantee'}
                            onChange={v => updateProps({ heading: v, guaranteeTitle: v } as any)}
                        />
                        <TextInput
                            label="Sub text"
                            value={props.subText ?? props.guaranteeSubtext ?? props.subtitle ?? 'Not satisfied? Return it — no questions asked.'}
                            onChange={v => updateProps({ subText: v, guaranteeSubtext: v, subtitle: v } as any)}
                        />
                        <TextInput
                            label="Badge text"
                            value={(props as any).badgeText ?? 'Money Back Guaranteed'}
                            onChange={v => updateProps({ badgeText: v } as any)}
                        />
                    </Section>
                    <Section title="Period">
                        <TextInput
                            label="Days (e.g. 30)"
                            value={String((props as any).days ?? (props as any).periodDays ?? '30')}
                            onChange={v => updateProps({ days: v, periodDays: v } as any)}
                        />
                    </Section>
                </>
            )

        case 'trust_badge_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Badge text" value={props.badgeText ?? '100% Satisfaction Guaranteed or Your Money Back'} onChange={v => updateProps({ badgeText: v })} />
                    </Section>
                </>
            )

        case 'urgency_timer_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Banner text" value={props.text ?? 'Limited Time Promotional Price — Order Soon!'} onChange={v => updateProps({ text: v })} />
                    </Section>
                </>
            )

        case 'payment_methods_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={props.title ?? 'Secure Checkout via eBay Managed Payments'} onChange={v => updateProps({ title: v })} />
                    </Section>
                    <Section title="Options">
                        <ToggleRow label="Show PayPal" value={props.showPayPal ?? true} onChange={v => updateProps({ showPayPal: v })} />
                        <ToggleRow label="Show credit cards" value={props.showCreditCards ?? true} onChange={v => updateProps({ showCreditCards: v })} />
                    </Section>
                </>
            )

        case 'shipping_policy_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={props.title ?? 'Fast & Reliable Shipping'} onChange={v => updateProps({ title: v })} />
                        <TextareaInput
                            label="Policy text"
                            value={props.policyText ?? 'We ship all orders within 24 hours of payment clearance via tracked carrier services.'}
                            rows={3}
                            onChange={v => updateProps({ policyText: v })}
                        />
                        <TextInput label="Delivery time" value={props.deliveryTime ?? 'Estimated delivery: 2-5 business days'} onChange={v => updateProps({ deliveryTime: v })} />
                    </Section>
                </>
            )

        case 'bundle_discount_banner':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Banner text" value={props.bannerText ?? 'Buy {{QUANTITY}} or more and save!'} onChange={v => updateProps({ bannerText: v })} />
                        {phButton('bannerText', 'banner text')}
                    </Section>
                    <Section title="Discount">
                        <TextInput label="Discount %" value={String(props.discountPercentage ?? 15)} onChange={v => updateProps({ discountPercentage: Number(v) || 15 })} />
                        <TextInput label="Minimum quantity" value={String(props.minimumQty ?? 2)} onChange={v => updateProps({ minimumQty: Number(v) || 2 })} />
                    </Section>
                </>
            )

        case 'image':
            return (
                <>
                    <Section title="Image">
                        <TextInput label="Image URL" value={props.src ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ src: v })} />
                        {phButton('src', 'image URL')}
                        <TextInput label="Alt text" value={props.alt ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ alt: v })} />
                        <TextInput label="Link URL (optional)" value={props.linkUrl ?? ''} onChange={v => updateProps({ linkUrl: v })} />
                    </Section>
                    <Section title="Layout">
                        <TextInput label="Width" value={String(props.width ?? 100)} onChange={v => updateProps({ width: Number(v) || 100 })} />
                        <SelectInput
                            label="Width unit"
                            value={props.widthUnit ?? '%'}
                            options={[{ v: '%', l: '% — Percentage' }, { v: 'px', l: 'px — Fixed pixels' }]}
                            onChange={v => updateProps({ widthUnit: v })}
                        />
                        <SelectInput
                            label="Alignment"
                            value={props.align ?? 'center'}
                            options={[{ v: 'left', l: 'Left' }, { v: 'center', l: 'Center' }, { v: 'right', l: 'Right' }]}
                            onChange={v => updateProps({ align: v })}
                        />
                    </Section>
                </>
            )

        case 'container':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput label="Content" value={props.content ?? 'Your content goes here.'} rows={4} onChange={v => updateProps({ content: v })} />
                        {phButton('content', 'content')}
                    </Section>
                    <Section title="Layout">
                        <TextInput label="Max width (px)" value={String(props.maxWidth ?? 600)} onChange={v => updateProps({ maxWidth: Number(v) || 600 })} />
                    </Section>
                </>
            )

        case 'features': {
            const feats: { icon: string; label: string; subText: string }[] = props.features ?? [
                { icon: '⭐', label: 'Top Quality', subText: 'Premium Materials' },
                { icon: '🚚', label: 'Fast Shipping', subText: 'Tracked Delivery' },
                { icon: '↩️', label: 'Easy Returns', subText: '30-Day Policy' },
            ]
            return (
                <>
                    <Section title={`Features (${feats.length})`}>
                        {feats.map((f, i) => (
                            <div key={i} style={{ background: 'var(--pp-section-bg, rgba(255,255,255,0.04))', border: '1px solid var(--pp-border)', borderRadius: 6, marginBottom: 6, padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--pp-text-muted)', fontSize: 11 }}>Feature {i + 1}</span>
                                    <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }} onClick={() => updateProps({ features: feats.filter((_, j) => j !== i) })}>✕</button>
                                </div>
                                <input placeholder="Icon (emoji)" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={f.icon} onChange={e => { const next = [...feats]; next[i] = { ...next[i], icon: e.target.value }; updateProps({ features: next }) }} />
                                <input placeholder="Label" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={f.label} onChange={e => { const next = [...feats]; next[i] = { ...next[i], label: e.target.value }; updateProps({ features: next }) }} />
                                <input placeholder="Sub text" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', boxSizing: 'border-box' }} value={f.subText} onChange={e => { const next = [...feats]; next[i] = { ...next[i], subText: e.target.value }; updateProps({ features: next }) }} />
                            </div>
                        ))}
                        {feats.length < 6 && (
                            <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ features: [...feats, { icon: '✅', label: 'New Feature', subText: 'Description here' }] })}>+ Add feature</button>
                        )}
                    </Section>
                </>
            )
        }

        case 'faq_block': {
            const faqs: { question: string; answer: string }[] = props.faqs ?? [
                { question: 'What is the warranty?', answer: 'All items come with a 30-day money back guarantee.' },
                { question: 'How long does shipping take?', answer: 'Most orders ship within 24 hours of payment clearance.' },
            ]
            return (
                <>
                    <Section title={`FAQs (${faqs.length})`}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{ background: 'var(--pp-section-bg, rgba(255,255,255,0.04))', border: '1px solid var(--pp-border)', borderRadius: 6, marginBottom: 6, padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--pp-text-muted)', fontSize: 11 }}>FAQ {i + 1}</span>
                                    <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }} onClick={() => updateProps({ faqs: faqs.filter((_, j) => j !== i) })}>✕</button>
                                </div>
                                <input placeholder="Question" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={faq.question} onChange={e => { const next = [...faqs]; next[i] = { ...next[i], question: e.target.value }; updateProps({ faqs: next }) }} />
                                <textarea placeholder="Answer" rows={2} style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', resize: 'vertical', boxSizing: 'border-box' }} value={faq.answer} onChange={e => { const next = [...faqs]; next[i] = { ...next[i], answer: e.target.value }; updateProps({ faqs: next }) }} />
                            </div>
                        ))}
                        {faqs.length < 10 && (
                            <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ faqs: [...faqs, { question: 'New question?', answer: 'Answer here.' }] })}>+ Add FAQ</button>
                        )}
                    </Section>
                </>
            )
        }

        case 'testimonial_block': {
            const testimonials: { text: string; author: string; rating: number }[] = props.testimonials ?? [
                { text: 'Amazing product! Exactly as described.', author: 'John D.', rating: 5 },
                { text: 'Fast shipping and great quality.', author: 'Sarah M.', rating: 4 },
            ]
            return (
                <>
                    <Section title={`Testimonials (${testimonials.length})`}>
                        {testimonials.map((t, i) => (
                            <div key={i} style={{ background: 'var(--pp-section-bg, rgba(255,255,255,0.04))', border: '1px solid var(--pp-border)', borderRadius: 6, marginBottom: 6, padding: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--pp-text-muted)', fontSize: 11 }}>Review {i + 1}</span>
                                    <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '1px 6px' }} onClick={() => updateProps({ testimonials: testimonials.filter((_, j) => j !== i) })}>✕</button>
                                </div>
                                <textarea placeholder="Review text" rows={2} style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, resize: 'vertical', boxSizing: 'border-box' }} value={t.text} onChange={e => { const next = [...testimonials]; next[i] = { ...next[i], text: e.target.value }; updateProps({ testimonials: next }) }} />
                                <input placeholder="Author name" style={{ width: '100%', background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '3px 6px', marginBottom: 3, boxSizing: 'border-box' }} value={t.author} onChange={e => { const next = [...testimonials]; next[i] = { ...next[i], author: e.target.value }; updateProps({ testimonials: next }) }} />
                                <SelectInput
                                    label="Rating"
                                    value={String(t.rating ?? 5)}
                                    options={[{ v: '5', l: '★★★★★ 5 stars' }, { v: '4', l: '★★★★☆ 4 stars' }, { v: '3', l: '★★★☆☆ 3 stars' }]}
                                    onChange={v => { const next = [...testimonials]; next[i] = { ...next[i], rating: Number(v) }; updateProps({ testimonials: next }) }}
                                />
                            </div>
                        ))}
                        {testimonials.length < 6 && (
                            <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ testimonials: [...testimonials, { text: 'Great product!', author: 'Happy Customer', rating: 5 }] })}>+ Add review</button>
                        )}
                    </Section>
                </>
            )
        }

        case 'compatibility_block': {
            const compatModels: string[] = props.compatibleModels ?? ['Model A 2020+', 'Model B Pro', 'Model C']
            const incompatModels: string[] = props.incompatibleModels ?? ['Old Model X', 'Legacy Series']
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={props.title ?? 'Check Compatibility'} onChange={v => updateProps({ title: v })} />
                    </Section>
                    <Section title={`Compatible models (${compatModels.length})`}>
                        {compatModels.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <input style={{ flex: 1, background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '4px 8px' }} value={m} onChange={e => { const next = [...compatModels]; next[i] = e.target.value; updateProps({ compatibleModels: next }) }} />
                                <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '0 8px' }} onClick={() => updateProps({ compatibleModels: compatModels.filter((_, j) => j !== i) })}>✕</button>
                            </div>
                        ))}
                        <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ compatibleModels: [...compatModels, 'New Model'] })}>+ Add model</button>
                    </Section>
                    <Section title={`Incompatible models (${incompatModels.length})`}>
                        {incompatModels.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                <input style={{ flex: 1, background: 'var(--pp-input-bg)', border: '1px solid var(--pp-border)', borderRadius: 4, color: 'var(--pp-text)', fontSize: 12, padding: '4px 8px' }} value={m} onChange={e => { const next = [...incompatModels]; next[i] = e.target.value; updateProps({ incompatibleModels: next }) }} />
                                <button style={{ background: 'var(--pp-danger, #dc2626)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '0 8px' }} onClick={() => updateProps({ incompatibleModels: incompatModels.filter((_, j) => j !== i) })}>✕</button>
                            </div>
                        ))}
                        <button style={{ background: 'var(--pp-accent, #7530fb)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: '4px 12px' }} onClick={() => updateProps({ incompatibleModels: [...incompatModels, 'Incompatible Model'] })}>+ Add model</button>
                    </Section>
                </>
            )
        }

        case 'store_nav_bar':
            return (
                <>
                    <Section title={`Links (${(props.links ?? []).length}/8)`}>
                        <NavLinksEditor
                            links={props.links ?? [
                                { label: 'Electronics', url: '#' },
                                { label: 'Home & Garden', url: '#' },
                                { label: 'Fashion', url: '#' },
                            ]}
                            onChange={links => updateProps({ links })}
                        />
                        <InfoBox>Paste your eBay Store category URL into each link. Example: https://www.ebay.com/str/yourstore/Clothing/_i.html</InfoBox>
                    </Section>
                </>
            )

        case 'money_back':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Heading" value={props.heading ?? '30-Day Money Back Guarantee'} onChange={v => updateProps({ heading: v })} />
                        <TextInput label="Sub text" value={props.subText ?? 'Not satisfied? Return it — no questions asked.'} onChange={v => updateProps({ subText: v })} />
                    </Section>
                </>
            )

        case 'trust_badge_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Badge text" value={props.badgeText ?? '100% Satisfaction Guaranteed or Your Money Back'} onChange={v => updateProps({ badgeText: v })} />
                    </Section>
                </>
            )

        case 'urgency_timer_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Banner text" value={props.text ?? 'Limited Time Promotional Price — Order Soon!'} onChange={v => updateProps({ text: v })} />
                    </Section>
                </>
            )

        case 'payment_methods_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={props.title ?? 'Secure Checkout via eBay Managed Payments'} onChange={v => updateProps({ title: v })} />
                    </Section>
                    <Section title="Options">
                        <ToggleRow label="Show PayPal" value={props.showPayPal ?? true} onChange={v => updateProps({ showPayPal: v })} />
                        <ToggleRow label="Show credit cards" value={props.showCreditCards ?? true} onChange={v => updateProps({ showCreditCards: v })} />
                    </Section>
                </>
            )

        case 'shipping_policy_block':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={props.title ?? 'Fast & Reliable Shipping'} onChange={v => updateProps({ title: v })} />
                        <TextareaInput label="Policy text" value={props.policyText ?? 'We ship all orders within 24 hours of payment clearance via tracked carrier services.'} rows={3} onChange={v => updateProps({ policyText: v })} />
                        <TextInput label="Delivery time" value={props.deliveryTime ?? 'Estimated delivery: 2-5 business days'} onChange={v => updateProps({ deliveryTime: v })} />
                    </Section>
                </>
            )

        case 'bundle_discount_banner':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Banner text" value={props.bannerText ?? 'Buy {{QUANTITY}} or more and save!'} onChange={v => updateProps({ bannerText: v })} />
                        {phButton('bannerText', 'banner text')}
                    </Section>
                    <Section title="Discount">
                        <TextInput label="Discount %" value={String(props.discountPercentage ?? 15)} onChange={v => updateProps({ discountPercentage: Number(v) || 15 })} />
                        <TextInput label="Minimum quantity" value={String(props.minimumQty ?? 2)} onChange={v => updateProps({ minimumQty: Number(v) || 2 })} />
                    </Section>
                </>
            )

        case 'authenticity_guarantee':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={(props as any).bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v } as any)} />
                        <ColorRow label="Text colour" value={(props as any).textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v } as any)} />
                        <ColorRow label="Accent colour" value={(props as any).accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v } as any)} />
                    </Section>
                    <Section title="Typography">
                        <SelectInput label="Font family" value={(props as any).fontFamily ?? ''}
                            options={[{ v: '', l: 'Default (Arial)' }, { v: 'Georgia, serif', l: 'Georgia' }, { v: 'Verdana, sans-serif', l: 'Verdana' }, { v: 'Trebuchet MS, sans-serif', l: 'Trebuchet MS' }, { v: 'monospace', l: 'Monospace' }]}
                            onChange={v => updateProps({ fontFamily: v } as any)} />
                    </Section>
                    <Section title="Spacing">
                        <NumberInput label="Top" min={0} max={120} suffix="px" value={(props as any).paddingTop ?? 16} onChange={v => updateProps({ paddingTop: v } as any)} />
                        <NumberInput label="Bottom" min={0} max={120} suffix="px" value={(props as any).paddingBottom ?? 16} onChange={v => updateProps({ paddingBottom: v } as any)} />
                        <NumberInput label="Left" min={0} max={120} suffix="px" value={(props as any).paddingLeft ?? 20} onChange={v => updateProps({ paddingLeft: v } as any)} />
                        <NumberInput label="Right" min={0} max={120} suffix="px" value={(props as any).paddingRight ?? 20} onChange={v => updateProps({ paddingRight: v } as any)} />
                    </Section>
                </>
            )

        case 'condition_details': {
            const cdv = (props as any).variant ?? 'cd-cosmetic-grade-split'
            return (
                <>
                    <Section title="Condition Text">
                        <TextInput
                            label="Condition title"
                            value={props.conditionText ?? ''}
                            placeholder={({
                                'cd-cosmetic-grade-split': 'Brand New',
                                'cd-certified-refurb-diagnostic': 'Certified Refurbished (Grade A+)',
                                'cd-archival-vintage-tier': 'Near Mint (NM 9.0)',
                                'cd-open-box-inventory-audit': 'Open Box — 100% Complete & Tested',
                                'cd-honest-wear-transparency': 'Excellent Pre-Owned Condition',
                                'cd-parts-repair-warning': 'For Parts or Not Working',
                                'cd-jeweler-curator-provenance': 'Near Mint Collector Grade',
                                'cd-automotive-core-fitment': 'Tested OEM Used — Excellent Functionality',
                                'cd-scandinavian-minimal-ledger': 'Pristine Studio Condition',
                                'cd-mobile-compact-badge-strip': 'Brand New & Sealed',
                            } as Record<string, string>)[cdv] ?? 'e.g. Brand New'}
                            onChange={v => updateProps({ conditionText: v })}
                        />
                        <TextareaInput
                            label="Condition notes"
                            value={props.conditionNotes ?? ''}
                            placeholder={({
                                'cd-cosmetic-grade-split': '{{CONDITION_NOTES}}',
                                'cd-certified-refurb-diagnostic': 'Unit in pristine mechanical condition. Thoroughly sanitized, factory reset, and tested across all hardware modules.',
                                'cd-archival-vintage-tier': 'Carefully preserved in collector sleeve. Minor edge handling consistent with gentle storage. Spine completely tight with zero splits.',
                                'cd-open-box-inventory-audit': 'Customer return in flawless working order. Verified complete with original retail packaging, cables, documentation, and all factory accessories.',
                                'cd-honest-wear-transparency': 'Gently worn 2-3 times with excellent fabric integrity. No stains, pulls, tears, or loose stitching. Stored in a smoke-free, pet-free home environment.',
                                'cd-parts-repair-warning': 'Device powers on but displays blinking error code E-04. Sold strictly as-is for spare components, teardown, or repair projects. No returns accepted for stated defects.',
                                'cd-jeweler-curator-provenance': 'Case and bezel retain sharp factory bevels with no deep scratches or dings. Dial and indices 100% original. Movement tested on timegrapher keeping accurate timing.',
                                'cd-automotive-core-fitment': 'Removed from low-mileage donor vehicle. Thoroughly inspected for structural integrity with zero cracks, stripped threads, or fluid leaks.',
                                'cd-scandinavian-minimal-ledger': 'Exhibition display piece with virtually zero signs of handling. Materials retain original matte texture and finish.',
                                'cd-mobile-compact-badge-strip': 'Unopened retail package with intact factory seals. 100% manufacturer warranty included.',
                            } as Record<string, string>)[cdv] ?? 'Describe the condition of this item...'}
                            rows={5}
                            onChange={v => updateProps({ conditionNotes: v })}
                        />
                    </Section>

                    {cdv === 'cd-cosmetic-grade-split' && (
                        <Section title="Badge">
                            <TextInput label="Grade badge label" value={(props as any).badgeLabel ?? ''} placeholder="COSMETIC GRADE" onChange={v => updateProps({ badgeLabel: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-certified-refurb-diagnostic' && (
                        <Section title="Header & Checks">
                            <TextInput label="Header badge" value={(props as any).headerBadge ?? ''} placeholder="30-POINT DIAGNOSTIC AUDIT" onChange={v => updateProps({ headerBadge: v } as any)} />
                            <TextInput label="Status badge" value={(props as any).statusBadge ?? ''} placeholder="[100% OPERATIONAL]" onChange={v => updateProps({ statusBadge: v } as any)} />
                            <TextInput label="Check 1" value={(props as any).check1 ?? ''} placeholder="✓ Battery • 85%+ Capacity Tested" onChange={v => updateProps({ check1: v } as any)} />
                            <TextInput label="Check 2" value={(props as any).check2 ?? ''} placeholder="✓ Screen • Zero Dead Pixels" onChange={v => updateProps({ check2: v } as any)} />
                            <TextInput label="Check 3" value={(props as any).check3 ?? ''} placeholder="✓ Reset • Sanitized & Ready" onChange={v => updateProps({ check3: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-open-box-inventory-audit' && (
                        <Section title="Audit Checklist">
                            <TextInput label="Check 1" value={(props as any).check1 ?? ''} placeholder="✓ Retail Packaging Present" onChange={v => updateProps({ check1: v } as any)} />
                            <TextInput label="Check 2" value={(props as any).check2 ?? ''} placeholder="✓ All Cables Included" onChange={v => updateProps({ check2: v } as any)} />
                            <TextInput label="Check 3" value={(props as any).check3 ?? ''} placeholder="✓ Manuals & Inserts Present" onChange={v => updateProps({ check3: v } as any)} />
                            <TextInput label="Check 4" value={(props as any).check4 ?? ''} placeholder="✓ No Cosmetic Imperfections" onChange={v => updateProps({ check4: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-honest-wear-transparency' && (
                        <Section title="Wear Labels">
                            <TextInput label="Rating badge" value={(props as any).ratingBadge ?? ''} placeholder="RATING: 9 / 10" onChange={v => updateProps({ ratingBadge: v } as any)} />
                            <TextInput label="Laundry / care note" value={(props as any).laundryNote ?? ''} placeholder="✓ Fully laundered and sanitized according to manufacturer garment standards." onChange={v => updateProps({ laundryNote: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-parts-repair-warning' && (
                        <Section title="Warning Labels">
                            <TextInput label="Warning banner" value={(props as any).warningBanner ?? ''} placeholder="⚠ AS-IS SALVAGE NOTICE • FOR PARTS / REPAIR ONLY" onChange={v => updateProps({ warningBanner: v } as any)} />
                            <TextInput label="Status badge" value={(props as any).statusBadge ?? ''} placeholder="NON-FUNCTIONING" onChange={v => updateProps({ statusBadge: v } as any)} />
                            <TextInput label="Disclaimer" value={(props as any).disclaimer ?? ''} placeholder="* By bidding or purchasing, you acknowledge this unit requires technical repair or parts harvesting." onChange={v => updateProps({ disclaimer: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-jeweler-curator-provenance' && (
                        <Section title="Audit Note">
                            <TextInput label="Audit note" value={(props as any).auditNote ?? ''} placeholder="Audited under 10x binocular magnification by certified specialist." onChange={v => updateProps({ auditNote: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-automotive-core-fitment' && (
                        <Section title="Inspection Metrics">
                            <TextInput label="Bench status" value={(props as any).benchStatus ?? ''} placeholder="BENCH TESTED: 100% OK" onChange={v => updateProps({ benchStatus: v } as any)} />
                            <TextInput label="Metric 1" value={(props as any).metric1 ?? ''} placeholder="[1] HOUSING: INTACT" onChange={v => updateProps({ metric1: v } as any)} />
                            <TextInput label="Metric 2" value={(props as any).metric2 ?? ''} placeholder="[2] MOUNTS: ZERO CRACKS" onChange={v => updateProps({ metric2: v } as any)} />
                            <TextInput label="Metric 3" value={(props as any).metric3 ?? ''} placeholder="[3] OEM FIT: DIRECT BOLT-ON" onChange={v => updateProps({ metric3: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-scandinavian-minimal-ledger' && (
                        <Section title="Footer Badge">
                            <TextInput label="Audit badge" value={(props as any).auditBadge ?? ''} placeholder="✓ AUDITED • SMOKE-FREE ENVIRONMENT" onChange={v => updateProps({ auditBadge: v } as any)} />
                        </Section>
                    )}

                    {cdv === 'cd-mobile-compact-badge-strip' && (
                        <Section title="Inspection Chips">
                            <TextInput label="Chip 1 label" value={(props as any).chip1Label ?? ''} placeholder="PHYSICAL HOUSING" onChange={v => updateProps({ chip1Label: v } as any)} />
                            <TextInput label="Chip 1 value" value={(props as any).chip1Value ?? ''} placeholder="Pristine Condition" onChange={v => updateProps({ chip1Value: v } as any)} />
                            <TextInput label="Chip 2 label" value={(props as any).chip2Label ?? ''} placeholder="FUNCTIONAL CHECK" onChange={v => updateProps({ chip2Label: v } as any)} />
                            <TextInput label="Chip 2 value" value={(props as any).chip2Value ?? ''} placeholder="100% Tested Working" onChange={v => updateProps({ chip2Value: v } as any)} />
                            <TextInput label="Chip 3 label" value={(props as any).chip3Label ?? ''} placeholder="ACCESSORIES" onChange={v => updateProps({ chip3Label: v } as any)} />
                            <TextInput label="Chip 3 value" value={(props as any).chip3Value ?? ''} placeholder="Complete Retail Set" onChange={v => updateProps({ chip3Value: v } as any)} />
                        </Section>
                    )}
                </>
            )
        }

        case 'authenticity_guarantee':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Title" value={(props as any).heading ?? (props as any).bannerTitle ?? '100% Authenticity Guaranteed'} onChange={v => updateProps({ heading: v, bannerTitle: v } as any)} />
                        <TextareaInput label="Description" value={(props as any).subText ?? (props as any).description ?? ''} rows={3} placeholder="Every item verified genuine. Sourced directly from authorised distributors." onChange={v => updateProps({ subText: v, description: v } as any)} />
                    </Section>
                </>
            )

        case 'international_shipping':
            return (
                <>
                    <Section title="Notice Content">
                        <TextInput
                            label="Heading"
                            value={props.heading ?? 'International Buyers — Import Duties Notice'}
                            onChange={v => updateProps({ heading: v })}
                        />
                        {phButton('heading', 'heading')}
                        <TextareaInput
                            label="Notice text"
                            value={props.text ?? "Import duties and taxes are not included in the price. These are the buyer's responsibility. Please check your country's customs rules before purchasing."}
                            rows={4}
                            onChange={v => updateProps({ text: v })}
                        />
                        {phButton('text', 'notice text')}
                    </Section>
                </>
            )

        case 'limited_time_offer': {
            const ltov = ((props as any).variant ?? 'lto-flash-sale-ticker') as string
            return (
                <>
                    {/* ── Core Deal Text ── */}
                    <Section title="Deal Text">
                        <TextInput
                            label="Deal title"
                            value={(props as any).dealTitle ?? ''}
                            placeholder={
                                ltov === 'lto-flash-sale-ticker' ? '⚡ FLASH SALE — SPECIAL PROMOTIONAL EVENT' :
                                    ltov === 'lto-clearance-stamped-tag' ? 'INVENTORY CLEARANCE SALE — FINAL MARKDOWN' :
                                        ltov === 'lto-midnight-vip-exclusive' ? 'VIP ALLOCATION — EXCLUSIVE PROMOTIONAL INVITATION' :
                                            ltov === 'lto-industrial-hazard-alert' ? '⚠️ SURPLUS LOT NOTICE — CONTRACTOR BULK RATE ACTIVE' :
                                                ltov === 'lto-circular-coupon-clip' ? 'OFFICIAL STORE COUPON · SAVE INSTANTLY AT CHECKOUT' :
                                                    ltov === 'lto-live-scarcity-meter' ? '🔥 HIGH DEMAND — LIMITED REMAINING UNITS AT THIS PRICE' :
                                                        ltov === 'lto-multibuy-volume-matrix' ? 'MULTI-BUY VOLUME SAVINGS — BUY MORE & SAVE BIG' :
                                                            ltov === 'lto-scandinavian-editorial' ? 'SEASONAL ARCHIVE PROMOTION' :
                                                                ltov === 'lto-cyber-terminal-deal' ? 'SYS.PROMO: HARDWARE FLASH EVENT ACTIVE' :
                                                                    'HOLIDAY GIFT EVENT — EXTENDED 60-DAY RETURNS INCLUDED'
                            }
                            onChange={v => updateProps({ dealTitle: v } as any)}
                        />
                        <TextareaInput
                            label="Deal subtitle"
                            value={(props as any).dealSubtext ?? ''}
                            placeholder="Promotional pricing is active for a limited time. While supplies last."
                            onChange={v => updateProps({ dealSubtext: v } as any)}
                        />
                    </Section>

                    {/* ── Badge & Discount ── */}
                    <Section title="Badge & Discount">
                        <TextInput
                            label="Badge / tag"
                            value={(props as any).badgeText ?? ''}
                            placeholder={
                                ltov === 'lto-flash-sale-ticker' ? 'ENDS SOON' :
                                    ltov === 'lto-clearance-stamped-tag' ? 'CLEARANCE LOT' :
                                        ltov === 'lto-midnight-vip-exclusive' ? '◆ VIP EXCLUSIVE ◆' :
                                            ltov === 'lto-industrial-hazard-alert' ? 'CAUTION: OVERSTOCK' :
                                                ltov === 'lto-circular-coupon-clip' ? '✂ CLIP & SAVE' :
                                                    ltov === 'lto-live-scarcity-meter' ? '⚡ LIVE VELOCITY ALERT' :
                                                        ltov === 'lto-multibuy-volume-matrix' ? 'TIERED VOLUME PRICING' :
                                                            ltov === 'lto-scandinavian-editorial' ? 'CURATED ALLOCATION' :
                                                                ltov === 'lto-cyber-terminal-deal' ? '[SYS_ACTIVE // CYCLE_2026]' :
                                                                    '🎁 HOLIDAY PROMOTION'
                            }
                            onChange={v => updateProps({ badgeText: v } as any)}
                        />
                        <TextInput
                            label="Discount / savings callout"
                            value={(props as any).discountText ?? ''}
                            placeholder={
                                ltov === 'lto-flash-sale-ticker' ? 'UP TO 50% OFF' :
                                    ltov === 'lto-clearance-stamped-tag' ? 'MASSIVE SAVINGS' :
                                        ltov === 'lto-midnight-vip-exclusive' ? 'PREMIUM CONCIERGE BENEFIT' :
                                            ltov === 'lto-industrial-hazard-alert' ? 'HEAVY DISCOUNT LOT' :
                                                ltov === 'lto-circular-coupon-clip' ? 'SPECIAL SAVINGS APPLIED' :
                                                    ltov === 'lto-live-scarcity-meter' ? '88% CLAIMED' :
                                                        ltov === 'lto-scandinavian-editorial' ? 'SPECIAL INVITATION SAVINGS' :
                                                            ltov === 'lto-cyber-terminal-deal' ? 'SPECIAL HARDWARE RATE' :
                                                                ltov === 'lto-holiday-gift-ribbon' ? 'PEACE-OF-MIND GUARANTEE' :
                                                                    'SAVE BIG'
                            }
                            onChange={v => updateProps({ discountText: v } as any)}
                        />
                        <TextInput
                            label="Expiry / timer text"
                            value={(props as any).expiryText ?? ''}
                            placeholder={
                                ltov === 'lto-clearance-stamped-tag' ? 'While Surplus Allocation Lasts' :
                                    'Ends Sunday at Midnight EST'
                            }
                            onChange={v => updateProps({ expiryText: v } as any)}
                        />
                    </Section>

                    {/* ── Flash Sale: Countdown Labels ── */}
                    {ltov === 'lto-flash-sale-ticker' && (
                        <Section title="Countdown Labels">
                            <TextInput label="Label 1" value={(props as any).label1 ?? ''} placeholder="DAYS" onChange={v => updateProps({ label1: v } as any)} />
                            <TextInput label="Label 2" value={(props as any).label2 ?? ''} placeholder="HOURS" onChange={v => updateProps({ label2: v } as any)} />
                            <TextInput label="Label 3" value={(props as any).label3 ?? ''} placeholder="MINS" onChange={v => updateProps({ label3: v } as any)} />
                            <TextInput label="Label 4" value={(props as any).label4 ?? ''} placeholder="SECS" onChange={v => updateProps({ label4: v } as any)} />
                        </Section>
                    )}

                    {/* ── Clearance Stamped Tag: Stamp & Status ── */}
                    {ltov === 'lto-clearance-stamped-tag' && (
                        <Section title="Stamp & Status Labels">
                            <TextInput label="Stamp line 1" value={(props as any).stampLine1 ?? ''} placeholder="OFFICIAL" onChange={v => updateProps({ stampLine1: v } as any)} />
                            <TextInput label="Stamp line 2" value={(props as any).stampLine2 ?? ''} placeholder="CLEAR" onChange={v => updateProps({ stampLine2: v } as any)} />
                            <TextInput label="Stamp line 3" value={(props as any).stampLine3 ?? ''} placeholder="MARKED" onChange={v => updateProps({ stampLine3: v } as any)} />
                            <TextInput label="Lot label" value={(props as any).clearanceLot ?? ''} placeholder="CLEARANCE LOT" onChange={v => updateProps({ clearanceLot: v } as any)} />
                            <TextInput label="Status label" value={(props as any).specialStatus ?? ''} placeholder="SPECIAL STATUS" onChange={v => updateProps({ specialStatus: v } as any)} />
                        </Section>
                    )}

                    {/* ── Midnight VIP: Availability & Seller Notes ── */}
                    {ltov === 'lto-midnight-vip-exclusive' && (
                        <Section title="VIP Badge Labels">
                            <TextInput label="Availability note" value={(props as any).availabilityNote ?? ''} placeholder="LIMITED AVAILABILITY" onChange={v => updateProps({ availabilityNote: v } as any)} />
                            <TextInput label="Seller note" value={(props as any).sellerNote ?? ''} placeholder="Direct From Verified Seller" onChange={v => updateProps({ sellerNote: v } as any)} />
                        </Section>
                    )}

                    {/* ── Industrial Hazard: Grade & Dispatch ── */}
                    {ltov === 'lto-industrial-hazard-alert' && (
                        <Section title="Status Labels">
                            <TextInput label="Grade note" value={(props as any).gradeNote ?? ''} placeholder="Commercial &amp; Industrial Grade" onChange={v => updateProps({ gradeNote: v } as any)} />
                            <TextInput label="Dispatch note" value={(props as any).dispatchNote ?? ''} placeholder="IMMEDIATE DISPATCH" onChange={v => updateProps({ dispatchNote: v } as any)} />
                        </Section>
                    )}

                    {/* ── Circular Coupon: Scope & Cart Note ── */}
                    {ltov === 'lto-circular-coupon-clip' && (
                        <Section title="Coupon Labels">
                            <TextInput label="Coupon scope" value={(props as any).couponScope ?? ''} placeholder="Valid For This eBay Item Only" onChange={v => updateProps({ couponScope: v } as any)} />
                            <TextInput label="Cart note" value={(props as any).cartNote ?? ''} placeholder="AUTO-APPLIED IN CART" onChange={v => updateProps({ cartNote: v } as any)} />
                        </Section>
                    )}

                    {/* ── Live Scarcity: Scarcity Label ── */}
                    {ltov === 'lto-live-scarcity-meter' && (
                        <Section title="Scarcity Label">
                            <TextInput label="Scarcity label" value={(props as any).scarcityLabel ?? ''} placeholder="ALMOST SOLD OUT" onChange={v => updateProps({ scarcityLabel: v } as any)} />
                        </Section>
                    )}

                    {/* ── Multi-Buy Volume Matrix: Tier Labels ── */}
                    {ltov === 'lto-multibuy-volume-matrix' && (
                        <Section title="Volume Tier Labels">
                            <TextInput label="Tier 1 label" value={(props as any).tier1Label ?? ''} placeholder="BUY 1 ITEM" onChange={v => updateProps({ tier1Label: v } as any)} />
                            <TextInput label="Tier 1 price" value={(props as any).tier1Price ?? ''} placeholder="STANDARD PRICE" onChange={v => updateProps({ tier1Price: v } as any)} />
                            <TextInput label="Tier 1 note" value={(props as any).tier1Note ?? ''} placeholder="Standard Value" onChange={v => updateProps({ tier1Note: v } as any)} />
                            <TextInput label="Tier 2 label" value={(props as any).tier2Label ?? ''} placeholder="★ BUY 2 ITEMS ★" onChange={v => updateProps({ tier2Label: v } as any)} />
                            <TextInput label="Tier 2 price" value={(props as any).tier2Price ?? ''} placeholder="EXTRA 10% OFF" onChange={v => updateProps({ tier2Price: v } as any)} />
                            <TextInput label="Tier 2 note" value={(props as any).tier2Note ?? ''} placeholder="Most Popular Choice" onChange={v => updateProps({ tier2Note: v } as any)} />
                            <TextInput label="Tier 3 label" value={(props as any).tier3Label ?? ''} placeholder="BUY 3 OR MORE" onChange={v => updateProps({ tier3Label: v } as any)} />
                            <TextInput label="Tier 3 price" value={(props as any).tier3Price ?? ''} placeholder="EXTRA 20% OFF" onChange={v => updateProps({ tier3Price: v } as any)} />
                            <TextInput label="Tier 3 note" value={(props as any).tier3Note ?? ''} placeholder="Maximum Bulk Savings" onChange={v => updateProps({ tier3Note: v } as any)} />
                        </Section>
                    )}

                    {/* ── Scandinavian Editorial: Apply Note ── */}
                    {ltov === 'lto-scandinavian-editorial' && (
                        <Section title="Apply Note">
                            <TextInput label="Apply note" value={(props as any).applyNote ?? ''} placeholder="Applied at eBay purchase" onChange={v => updateProps({ applyNote: v } as any)} />
                        </Section>
                    )}

                    {/* ── Cyber Terminal: Activation Note ── */}
                    {ltov === 'lto-cyber-terminal-deal' && (
                        <Section title="Status Note">
                            <TextInput label="Activation note" value={(props as any).activationNote ?? ''} placeholder="Instant Activation" onChange={v => updateProps({ activationNote: v } as any)} />
                        </Section>
                    )}

                    {/* ── Holiday Gift Ribbon: Dispatch Guarantee ── */}
                    {ltov === 'lto-holiday-gift-ribbon' && (
                        <Section title="Dispatch Label">
                            <TextInput label="Dispatch guarantee" value={(props as any).dispatchGuarantee ?? ''} placeholder="Guaranteed Pre-Holiday Dispatch" onChange={v => updateProps({ dispatchGuarantee: v } as any)} />
                        </Section>
                    )}
                </>
            )
        }

        case 'video_placeholder':
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        🎬 This block shows a fixed video placeholder — no editable attributes.
                        Use the Styles tab to adjust colours and spacing.
                    </InfoBox>
                </div>
            )

        default:
            return (
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>No editable attributes for this block type.</InfoBox>
                </div>
            )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI TAB
// ─────────────────────────────────────────────────────────────────────────────
function AITab({ block, onChange }: { block: Block; onChange: (updated: Block) => void }) {
    const [copyLoading, setCopyLoading] = useState(false)
    const [policyLoading, setPolicyLoading] = useState(false)
    const [copyResult, setCopyResult] = useState<string | null>(null)
    const [policyResult, setPolicyResult] = useState<string | null>(null)
    const [copyError, setCopyError] = useState<string | null>(null)
    const [policyError, setPolicyError] = useState<string | null>(null)

    // Extract text fields from the block props to send to Claude
    const extractTextFields = () => {
        const props = block.props as unknown as Record<string, unknown>
        const textKeys = ['text', 'heading', 'subheading', 'body', 'label', 'title', 'description', 'subtitle', 'content', 'caption']
        const found: Record<string, string> = {}
        for (const key of textKeys) {
            if (typeof props[key] === 'string' && (props[key] as string).trim()) {
                found[key] = props[key] as string
            }
        }
        return found
    }

    const handleCopyOptimizer = async () => {
        const fields = extractTextFields()
        if (Object.keys(fields).length === 0) {
            setCopyError('No text fields found on this block to optimize.')
            return
        }
        setCopyLoading(true)
        setCopyResult(null)
        setCopyError(null)
        try {
            const fieldList = Object.entries(fields).map(([k, v]) => `${k}: "${v}"`).join('\n')
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `You are an eBay listing copywriter. Rewrite the following block text fields to maximize eBay conversion. Keep each field concise, benefit-focused, and eBay-compliant (no HTML, no all-caps spam). Return ONLY a JSON object with the same keys and improved values, no explanation.\n\nFields:\n${fieldList}`,
                    }],
                }),
            })
            const data = await res.json()
            const raw = data?.content?.[0]?.text ?? ''
            // Strip markdown code fences if present
            const clean = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim()
            const parsed: Record<string, string> = JSON.parse(clean)
            // Show preview, don't auto-apply
            setCopyResult(JSON.stringify(parsed, null, 2))
        } catch (err) {
            setCopyError('AI request failed. Check your connection and try again.')
        } finally {
            setCopyLoading(false)
        }
    }

    const applyCopyResult = () => {
        if (!copyResult) return
        try {
            const parsed: Record<string, string> = JSON.parse(copyResult)
            onChange({
                ...block,
                props: { ...block.props, ...parsed } as BlockProps,
            })
            setCopyResult(null)
        } catch { /* ignore */ }
    }

    const handlePolicyWriter = async () => {
        setPolicyLoading(true)
        setPolicyResult(null)
        setPolicyError(null)
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `Write an eBay-safe shipping and returns policy section for a product listing. It should be professional, clear, and trust-building. Include: shipping time estimate (3-5 business days), free returns within 30 days, and a brief quality guarantee. Return ONLY the plain text (no HTML, no markdown), around 80-100 words.`,
                    }],
                }),
            })
            const data = await res.json()
            const text = data?.content?.[0]?.text ?? ''
            setPolicyResult(text.trim())
        } catch (err) {
            setPolicyError('AI request failed. Check your connection and try again.')
        } finally {
            setPolicyLoading(false)
        }
    }

    const applyPolicyResult = () => {
        if (!policyResult) return
        // Try to apply to a 'body', 'text', or 'content' prop
        const props = block.props as unknown as Record<string, unknown>
        const targetKey = ['body', 'text', 'content', 'description'].find(k => typeof props[k] === 'string') ?? 'text'
        onChange({
            ...block,
            props: { ...block.props, [targetKey]: policyResult } as BlockProps,
        })
        setPolicyResult(null)
    }

    const spinnerStyle: React.CSSProperties = {
        display: 'inline-block',
        width: 13,
        height: 13,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        marginRight: 6,
        verticalAlign: 'middle',
    }

    return (
        <div style={{ padding: '14px 14px 24px' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* ── AI Copy Optimizer ── */}
            <Section title="AI Tools">
                <div style={{ marginBottom: 10 }}>
                    <button
                        onClick={handleCopyOptimizer}
                        disabled={copyLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            border: `1px solid ${C.primaryBorder}`,
                            borderRadius: 10,
                            backgroundColor: C.primaryLight,
                            cursor: copyLoading ? 'default' : 'pointer',
                            textAlign: 'left',
                            opacity: copyLoading ? 0.7 : 1,
                        }}
                    >
                        <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            backgroundColor: C.primaryLight,
                            border: `1px solid ${C.primaryBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Sparkles size={18} style={{ color: C.primary }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: C.primary }}>
                                {copyLoading && <span style={spinnerStyle} />}
                                {copyLoading ? 'Optimizing…' : 'AI Copy Optimizer'}
                            </p>
                            <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, lineHeight: 1.4 }}>
                                Rewrite this block's text for higher eBay conversion
                            </p>
                        </div>
                    </button>
                    {copyError && (
                        <p style={{ margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.danger }}>{copyError}</p>
                    )}
                    {copyResult && (
                        <div style={{ marginTop: 8, padding: '10px 12px', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                            <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                AI Suggestion — review before applying
                            </p>
                            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 10, color: C.body, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>{copyResult}</pre>
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <button
                                    onClick={applyCopyResult}
                                    style={{ flex: 1, padding: '6px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff', backgroundColor: C.primary, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                >
                                    ✓ Apply
                                </button>
                                <button
                                    onClick={() => setCopyResult(null)}
                                    style={{ flex: 1, padding: '6px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: C.secondary, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer' }}
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── AI Photo Studio — still coming soon ── */}
                <AIToolButton
                    Icon={Wand2}
                    label="AI Photo Studio"
                    description="Generate or enhance product images for this block"
                    color="#d97706"
                    bg="#fef3c7"
                    border="#fde68a"
                    comingSoon
                />

                {/* ── AI Policy Writer ── */}
                <div style={{ marginBottom: 8 }}>
                    <button
                        onClick={handlePolicyWriter}
                        disabled={policyLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            border: `1px solid #86efac`,
                            borderRadius: 10,
                            backgroundColor: C.successLight,
                            cursor: policyLoading ? 'default' : 'pointer',
                            textAlign: 'left',
                            opacity: policyLoading ? 0.7 : 1,
                        }}
                    >
                        <div style={{
                            width: 34, height: 34, borderRadius: 9,
                            backgroundColor: C.successLight,
                            border: `1px solid #86efac`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Zap size={18} style={{ color: C.success }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: C.success }}>
                                {policyLoading && <span style={spinnerStyle} />}
                                {policyLoading ? 'Writing policy…' : 'AI Policy Writer'}
                            </p>
                            <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, lineHeight: 1.4 }}>
                                Auto-generate eBay-safe shipping &amp; returns copy
                            </p>
                        </div>
                    </button>
                    {policyError && (
                        <p style={{ margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.danger }}>{policyError}</p>
                    )}
                    {policyResult && (
                        <div style={{ marginTop: 8, padding: '10px 12px', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                            <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: C.secondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                AI Policy Draft — review before applying
                            </p>
                            <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body, lineHeight: 1.6 }}>{policyResult}</p>
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <button
                                    onClick={applyPolicyResult}
                                    style={{ flex: 1, padding: '6px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff', backgroundColor: C.success, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                >
                                    ✓ Apply
                                </button>
                                <button
                                    onClick={() => setPolicyResult(null)}
                                    style={{ flex: 1, padding: '6px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: C.secondary, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer' }}
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="eBay Compliance">
                <div style={{
                    padding: '10px 12px',
                    backgroundColor: C.successLight,
                    border: `1px solid #86efac50`,
                    borderRadius: 8,
                }}>
                    <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: C.success, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={13} /> This block is eBay safe
                    </p>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.success + 'cc', lineHeight: 1.5 }}>
                        No JavaScript · No external CSS · Table-based layout · HTTPS images only
                    </p>
                </div>
            </Section>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOUND EDITORS
// Used in the Attributes tab for complex array-type props
// ─────────────────────────────────────────────────────────────────────────────

function BulletItemsEditor({ items, onChange }: { items: string[], onChange: (items: string[]) => void }) {
    return (
        <div>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <input
                        value={item}
                        onChange={e => {
                            const next = [...items]
                            next[i] = e.target.value
                            onChange(next)
                        }}
                        style={inputStyle}
                    />
                    <button
                        onClick={() => onChange(items.filter((_, j) => j !== i))}
                        style={{ ...smallBtnStyle, color: C.danger, borderColor: '#fecaca' }}
                        title="Remove item"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                onClick={() => onChange([...items, 'New list item'])}
                style={addBtnStyle}
            >
                + Add item
            </button>
        </div>
    )
}

function SpecsRowsEditor({ rows, onChange }: { rows: Array<{ key: string; value: string }>, onChange: (rows: Array<{ key: string; value: string }>) => void }) {
    return (
        <div>
            {rows.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 4, marginBottom: 5, alignItems: 'center' }}>
                    <input
                        value={row.key}
                        placeholder="Label"
                        onChange={e => {
                            const next = [...rows]
                            next[i] = { ...next[i], key: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, fontSize: 11 }}
                    />
                    <input
                        value={row.value}
                        placeholder="Value"
                        onChange={e => {
                            const next = [...rows]
                            next[i] = { ...next[i], value: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, fontSize: 11 }}
                    />
                    <button
                        onClick={() => onChange(rows.filter((_, j) => j !== i))}
                        style={{ ...smallBtnStyle, color: C.danger, borderColor: '#fecaca' }}
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                onClick={() => onChange([...rows, { key: 'Property', value: '{{VALUE}}' }])}
                style={addBtnStyle}
            >
                + Add row
            </button>
        </div>
    )
}

function GalleryImagesEditor({ images, onChange }: { images: Array<{ src: string; alt: string }>, onChange: (images: Array<{ src: string; alt: string }>) => void }) {
    return (
        <div>
            {images.map((img, i) => (
                <div key={i} style={{ marginBottom: 8, padding: '8px', backgroundColor: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, fontWeight: 600 }}>Image {i + 1}</span>
                        <button onClick={() => onChange(images.filter((_, j) => j !== i))} style={{ ...smallBtnStyle, color: C.danger }}>×</button>
                    </div>
                    <TextInput
                        label=""
                        value={img.src}
                        onChange={v => {
                            const next = [...images]
                            next[i] = { ...next[i], src: v }
                            onChange(next)
                        }}
                    />
                    <input
                        value={img.alt}
                        placeholder="Alt text"
                        onChange={e => {
                            const next = [...images]
                            next[i] = { ...next[i], alt: e.target.value }
                            onChange(next)
                        }}
                        style={inputStyle}
                    />
                </div>
            ))}
            {images.length < 5 && (
                <button
                    onClick={() => onChange([...images, { src: `{{IMAGE_${images.length + 2}_URL}}`, alt: `Product view ${images.length + 2}` }])}
                    style={addBtnStyle}
                >
                    + Add image
                </button>
            )}
        </div>
    )
}

function BadgesEditor({ badges, onChange }: { badges: Array<{ icon: string; text: string }>, onChange: (badges: Array<{ icon: string; text: string }>) => void }) {
    return (
        <div>
            {badges.map((badge, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 4, marginBottom: 5, alignItems: 'center' }}>
                    <input
                        value={badge.icon}
                        placeholder="Icon"
                        onChange={e => {
                            const next = [...badges]
                            next[i] = { ...next[i], icon: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, textAlign: 'center', fontSize: 16, padding: '4px 6px' }}
                    />
                    <input
                        value={badge.text}
                        placeholder="Badge text"
                        onChange={e => {
                            const next = [...badges]
                            next[i] = { ...next[i], text: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, fontSize: 11 }}
                    />
                    <button
                        onClick={() => onChange(badges.filter((_, j) => j !== i))}
                        style={{ ...smallBtnStyle, color: C.danger }}
                    >
                        ×
                    </button>
                </div>
            ))}
            {badges.length < 6 && (
                <button onClick={() => onChange([...badges, { icon: 'check', text: 'New badge' }])} style={addBtnStyle}>
                    + Add badge
                </button>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER PICKER
// Floating overlay showing all placeholder groups + items
// ─────────────────────────────────────────────────────────────────────────────
function PlaceholderPicker({
    groups,
    onInsert,
    onClose,
}: {
    groups: PlaceholderGroup[]
    onInsert: (value: string) => void
    onClose: () => void
}) {
    const [search, setSearch] = useState('')
    const q = search.toLowerCase().trim()

    return (
        <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            zIndex: 100,
            backgroundColor: C.surface,
            border: `1px solid ${C.primaryBorder}`,
            borderRadius: 10,
            boxShadow: `0 8px 24px ${C.primary}22`,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px 8px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.primaryLight,
            }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: C.primary }}>
                    Insert Placeholder
                </span>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, padding: 0 }}
                >
                    ×
                </button>
            </div>
            {/* Search */}
            <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}` }}>
                <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search placeholders..."
                    style={{ ...inputStyle, fontSize: 11 }}
                />
            </div>
            {/* List */}
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {groups.map(group => {
                    const filtered = q
                        ? group.items.filter(i => i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q))
                        : group.items
                    if (filtered.length === 0) return null
                    return (
                        <div key={group.group}>
                            <p style={{
                                margin: 0,
                                padding: '6px 12px 2px',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 9,
                                fontWeight: 700,
                                color: C.muted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                backgroundColor: C.bg,
                            }}>
                                {group.group}
                            </p>
                            {filtered.map(item => (
                                <button
                                    key={item.value}
                                    onClick={() => onInsert(item.value)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '7px 12px',
                                        border: 'none',
                                        borderBottom: `1px solid ${C.border}`,
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.primaryLight)}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.body }}>{item.label}</span>
                                    <code style={{ fontFamily: 'monospace', fontSize: 10, color: C.primary, backgroundColor: C.primaryLight, padding: '1px 5px', borderRadius: 4 }}>
                                        {item.value}
                                    </code>
                                </button>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE PRIMITIVE CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

function AdvancedSection({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    return (
        <div style={{ marginTop: 4, marginBottom: 8 }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(117,48,251,0.08)',
                    border: '1px solid rgba(117,48,251,0.2)',
                    borderRadius: 6,
                    color: '#7530fb',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '6px 10px',
                    textTransform: 'uppercase',
                }}
            >
                <span>⚙ Advanced options</span>
                <span style={{ fontSize: 9 }}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div style={{
                    border: '1px solid rgba(117,48,251,0.15)',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    padding: '12px 10px 4px',
                    marginBottom: 8,
                }}>
                    {children}
                </div>
            )}
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <p style={{
                margin: '0 0 10px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: C.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                borderBottom: `1px solid ${C.border}`,
                paddingBottom: 6,
            }}>
                {title}
            </p>
            {children}
        </div>
    )
}

// ── Color palette context — set once at panel level, read by every ColorRow ──
const PaletteContext = React.createContext<{
    palette: string[]
    onPaletteChange?: (p: string[]) => void
}>({ palette: [] })

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const { palette, onPaletteChange } = React.useContext(PaletteContext)
    const [open, setOpen] = React.useState(false)
    const safeHex = value.startsWith('#') && value.length >= 4 ? value : '#ffffff'

    const addToPalette = () => {
        if (!onPaletteChange) return
        if (palette.includes(value)) return
        if (palette.length >= 10) {
            onPaletteChange([...palette.slice(1), value])
        } else {
            onPaletteChange([...palette, value])
        }
    }

    const removeFromPalette = (color: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!onPaletteChange) return
        onPaletteChange(palette.filter(c => c !== color))
    }

    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                        type="text"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        style={{
                            width: 70,
                            padding: '3px 6px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 5,
                            fontFamily: 'monospace',
                            fontSize: 10,
                            color: C.body,
                            backgroundColor: C.surface,
                            outline: 'none',
                        }}
                    />
                    <input
                        type="color"
                        value={safeHex}
                        onChange={e => { onChange(e.target.value); setOpen(false) }}
                        style={{
                            width: 26,
                            height: 26,
                            padding: 2,
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                        }}
                    />
                </div>
            </div>
            {/* ── Palette swatches ── */}
            {palette.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                    {palette.map(color => (
                        <div
                            key={color}
                            title={color}
                            onClick={() => onChange(color)}
                            style={{
                                position: 'relative',
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                backgroundColor: color,
                                border: value === color ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                onClick={e => removeFromPalette(color, e)}
                                title="Remove"
                                style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    backgroundColor: C.muted,
                                    color: '#fff',
                                    fontSize: 7,
                                    lineHeight: '10px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    display: 'none',
                                }}
                                className="palette-remove"
                            >✕</span>
                        </div>
                    ))}
                    {/* + Add current colour button */}
                    {onPaletteChange && !palette.includes(value) && value.startsWith('#') && (
                        <div
                            onClick={addToPalette}
                            title={`Save ${value} to palette`}
                            style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: `1.5px dashed ${C.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: 12,
                                color: C.muted,
                                flexShrink: 0,
                            }}
                        >+</div>
                    )}
                </div>
            )}
        </div>
    )
}

function SliderInput({
    label, value, min, max, step = 1, suffix, onChange
}: {
    label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void
}) {
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.primary, fontWeight: 600 }}>
                    {typeof value === 'number' ? (step < 1 ? value.toFixed(1) : value) : value}{suffix}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{
                    width: '100%',
                    accentColor: C.primary,
                    cursor: 'pointer',
                    height: 4,
                }}
            />
        </div>
    )
}

function NumberInput({
    label, value, min, max, suffix, onChange
}: {
    label: string; value: number; min: number; max: number; suffix?: string; onChange: (v: number) => void
}) {
    return (
        <div>
            <p style={{ margin: '0 0 3px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
                    style={{
                        ...inputStyle,
                        width: '100%',
                        textAlign: 'right',
                        fontFeatureSettings: '"tnum"',
                    }}
                />
                {suffix && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, flexShrink: 0 }}>{suffix}</span>
                )}
            </div>
        </div>
    )
}

function SelectInput({
    label, value, options, onChange
}: {
    label: string
    value: string
    options: Array<{ v: string; l: string }>
    onChange: (v: string) => void
}) {
    // Convert {v, l} → DropdownOption {val, label, enabled}
    const ddOptions: DropdownOption[] = options.map(o => ({
        val: o.v,
        label: o.l,
        enabled: true,
    }))

    return (
        <div style={{ marginBottom: 8 }}>
            {label && (
                <p style={{
                    margin: '0 0 4px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    color: C.body,
                }}>
                    {label}
                </p>
            )}
            <ProDropdown
                prefix=""
                currentValue={value}
                options={ddOptions}
                onChanged={onChange}
                width="full"
            />
        </div>
    )
}

function TableRowEditor({
    rows, onChange, keyLabel = 'Label', valueLabel = 'Value', phButton, addLabel = '+ Add row', maxRows = 30,
}: {
    rows: Array<{ key: string; value: string }>
    onChange: (rows: Array<{ key: string; value: string }>) => void
    keyLabel?: string
    valueLabel?: string
    phButton?: (indexStr: string, label: string) => React.ReactNode
    addLabel?: string
    maxRows?: number
}) {
    const [dragIdx, setDragIdx] = useState<number | null>(null)
    const [overIdx, setOverIdx] = useState<number | null>(null)
    const upd = (i: number, f: 'key' | 'value', v: string) =>
        onChange(rows.map((r, j) => j === i ? { ...r, [f]: v } : r))
    const drop = (i: number) => {
        if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return }
        const next = [...rows]
        const [moved] = next.splice(dragIdx, 1)
        next.splice(i, 0, moved)
        onChange(next)
        setDragIdx(null); setOverIdx(null)
    }
    return (
        <div>
            {rows.map((row, i) => (
                <div key={i} draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={e => { e.preventDefault(); setOverIdx(i) }}
                    onDrop={() => drop(i)}
                    onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                    style={{
                        marginBottom: 6, borderRadius: 8, padding: '8px 8px 6px',
                        border: overIdx === i ? `2px solid ${C.primary}` : '1.5px solid #e5e7eb',
                        background: dragIdx === i ? '#f3eeff' : '#fafafa',
                        opacity: dragIdx === i ? 0.5 : 1,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: C.primaryLight, color: C.primary, fontSize: 10, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                        <span title="Drag to reorder" style={{ cursor: 'grab', color: '#9ca3af', fontSize: 14, userSelect: 'none' }}>⠿</span>
                        <span style={{ flex: 1 }} />
                        <button onClick={() => onChange(rows.filter((_, j) => j !== i))}
                            style={{ padding: '2px 7px', borderRadius: 4, border: '1px solid #fca5a5', background: '#fff1f1', color: '#dc2626', fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>✕</button>
                    </div>
                    <p style={{ margin: '0 0 3px', fontSize: 10, color: C.body, fontFamily: 'DM Sans,sans-serif' }}>{keyLabel}</p>
                    <input type="text" value={row.key} placeholder={keyLabel} onChange={e => upd(i, 'key', e.target.value)} style={{ ...inputStyle, fontWeight: 600, marginBottom: 4 }} />
                    <p style={{ margin: '0 0 3px', fontSize: 10, color: C.body, fontFamily: 'DM Sans,sans-serif' }}>{valueLabel}</p>
                    <input type="text" value={row.value} placeholder="{{PLACEHOLDER}} or text" onChange={e => upd(i, 'value', e.target.value)} style={inputStyle} />
                    {phButton?.(String(i), valueLabel)}
                </div>
            ))}
            {rows.length < maxRows && (
                <button onClick={() => onChange([...rows, { key: '', value: '' }])}
                    style={{ marginTop: 6, padding: '7px 0', borderRadius: 7, width: '100%', border: `1.5px dashed ${C.primary}`, background: C.primaryLight, color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                >{addLabel}</button>
            )}
            {rows.length === 0 && <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'DM Sans,sans-serif', textAlign: 'center', margin: '8px 0' }}>No rows yet</p>}
        </div>
    )
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div style={{ marginBottom: 8 }}>
            {label && <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</p>}
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                style={inputStyle}
            />
        </div>
    )
}

function TextareaInput({ label, value, rows = 3, onChange, placeholder }: { label: string; value: string; rows?: number; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div style={{ marginBottom: 8 }}>
            {label && <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</p>}
            <textarea
                value={value}
                rows={rows}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.5,
                    fontFamily: 'DM Sans, sans-serif',
                }}
            />
        </div>
    )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: value ? C.primary : C.inputBorder,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    padding: 0,
                    flexShrink: 0,
                }}
            >
                <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: value ? 19 : 3,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL SHARED SECTIONS — rendered in every block's Styles tab
// ─────────────────────────────────────────────────────────────────────────────

function UniversalBackground({
    props, updateProps
}: {
    props: Record<string, unknown>
    updateProps: (p: Record<string, unknown>) => void
}) {
    const p = props as any
    return (
        <Section title="Background">
            <ToggleRow
                label="Use gradient"
                value={p.bgGradient ?? false}
                onChange={v => updateProps({ bgGradient: v })}
            />
            {p.bgGradient ? (
                <>
                    <ColorRow label="Gradient from" value={p.bgGradientFrom ?? '#7530fb'} onChange={v => updateProps({ bgGradientFrom: v })} />
                    <ColorRow label="Gradient to" value={p.bgGradientTo ?? '#1e1535'} onChange={v => updateProps({ bgGradientTo: v })} />
                    <SliderInput label="Direction" value={p.bgGradientDir ?? 135} min={0} max={360} suffix="°" onChange={v => updateProps({ bgGradientDir: v })} />
                </>
            ) : (
                <ColorRow label="Background" value={p.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
            )}
        </Section>
    )
}

function UniversalBorder({
    props, updateProps
}: {
    props: Record<string, unknown>
    updateProps: (p: Record<string, unknown>) => void
}) {
    const p = props as any
    return (
        <Section title="Border">
            <ToggleRow label="Show border" value={p.showBorder ?? false} onChange={v => updateProps({ showBorder: v })} />
            {p.showBorder && (
                <>
                    <ColorRow label="Border colour" value={p.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                    <SliderInput label="Width" value={p.borderWidth ?? 1} min={1} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                    <SliderInput label="Radius" value={p.borderRadius ?? 0} min={0} max={60} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    <SelectInput
                        label="Style"
                        value={p.borderStyle ?? 'solid'}
                        options={[
                            { v: 'solid', l: 'Solid' },
                            { v: 'dashed', l: 'Dashed' },
                            { v: 'dotted', l: 'Dotted' },
                        ]}
                        onChange={v => updateProps({ borderStyle: v })}
                    />
                </>
            )}
        </Section>
    )
}

function UniversalShadow({
    props, updateProps
}: {
    props: Record<string, unknown>
    updateProps: (p: Record<string, unknown>) => void
}) {
    const p = props as any
    return (
        <Section title="Shadow">
            <InfoBox>Shadow shows in canvas preview only — most email clients strip box-shadow.</InfoBox>
            <ToggleRow label="Show shadow" value={p.showShadow ?? false} onChange={v => updateProps({ showShadow: v })} />
            {p.showShadow && (
                <>
                    <ColorRow label="Shadow colour" value={p.shadowColor ?? 'rgba(0,0,0,0.10)'} onChange={v => updateProps({ shadowColor: v })} />
                    <SliderInput label="Blur" value={p.shadowBlur ?? 12} min={0} max={60} suffix="px" onChange={v => updateProps({ shadowBlur: v })} />
                    <SliderInput label="Spread" value={p.shadowSpread ?? 0} min={0} max={30} suffix="px" onChange={v => updateProps({ shadowSpread: v })} />
                    <SliderInput label="X offset" value={p.shadowX ?? 0} min={-30} max={30} suffix="px" onChange={v => updateProps({ shadowX: v })} />
                    <SliderInput label="Y offset" value={p.shadowY ?? 4} min={-30} max={30} suffix="px" onChange={v => updateProps({ shadowY: v })} />
                </>
            )}
        </Section>
    )
}

function UniversalTypography({
    props, updateProps
}: {
    props: Record<string, unknown>
    updateProps: (p: Record<string, unknown>) => void
}) {
    const p = props as any
    return (
        <Section title="Font family">
            <SelectInput
                label="Font"
                value={p.fontFamily ?? 'Arial, Helvetica, sans-serif'}
                options={[
                    { v: 'Arial, Helvetica, sans-serif', l: 'Arial' },
                    { v: 'Georgia, Times New Roman, serif', l: 'Georgia' },
                    { v: 'Verdana, Geneva, sans-serif', l: 'Verdana' },
                    { v: "'Trebuchet MS', Helvetica, sans-serif", l: 'Trebuchet' },
                    { v: "'Times New Roman', Times, serif", l: 'Times New Roman' },
                    { v: "'Courier New', Courier, monospace", l: 'Courier New' },
                ]}
                onChange={v => updateProps({ fontFamily: v })}
            />
        </Section>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
