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
    ShieldCheck, Truck, RotateCcw, User, Bell,
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

// ─────────────────────────────────────────────────────────────────────────────
// STYLES TAB
// Visual styling — colours, spacing, typography, borders
// ─────────────────────────────────────────────────────────────────────────────
// VARIANT PICKER — visual style cards shown at top of Styles tab
type ThumbFn = (col: string, light: string) => JSX.Element
const VARIANT_THUMBNAILS: Record<string, ThumbFn> = {
    // ── Hero Header ───────────────────────────────────────────────────────────
    'gradient': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <defs><linearGradient id="vg1" x1="0" y1="0" x2="80" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor={col} stopOpacity="0.8" /><stop offset="1" stopColor={col} stopOpacity="0.3" />
            </linearGradient></defs>
            <rect width="80" height="36" rx="3" fill="url(#vg1)" />
            <rect x="20" y="11" width="40" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="24" y="20" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'minimal': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="6" y="14" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="50" y="15" width="24" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),
    'image-bg': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect width="80" height="36" rx="3" fill={col} opacity="0.55" />
            <circle cx="20" cy="14" r="5" fill="white" opacity="0.25" />
            <path d="M6 28 Q20 20 34 24 Q50 18 74 26" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
            <rect x="20" y="11" width="40" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="24" y="20" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'typographic': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="10" y="9" width="60" height="7" rx="2" fill={col} opacity="0.85" />
            <rect x="34" y="19" width="12" height="2" rx="1" fill={col} />
            <rect x="16" y="24" width="48" height="3" rx="1.5" fill="#e5e7eb" />
        </svg>
    ),
    // ── Banner: Minimal Bordered ──────────────────────────────────────────────
    'minimal-bordered': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="2" y="2" width="76" height="32" rx="4" fill="white" stroke={col} strokeWidth="1.5" />
            <rect x="12" y="10" width="56" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="20" y="20" width="40" height="3" rx="1.5" fill="#9ca3af" opacity="0.6" />
        </svg>
    ),
    // ── Banner: Floating Card ─────────────────────────────────────────────────
    'floating-card': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="6" y="4" width="68" height="28" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="14" y="10" width="52" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="22" y="20" width="36" height="3" rx="1.5" fill="#9ca3af" opacity="0.6" />
        </svg>
    ),
    // ── Banner: Diagonal Accent ───────────────────────────────────────────────
    'diagonal-accent-hero': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" />
            <path d="M0 36 L80 0 L80 36 Z" fill={col} opacity="0.3" />
            <rect x="8" y="10" width="40" height="6" rx="2" fill={col} opacity="0.9" />
            <rect x="8" y="20" width="30" height="3" rx="1.5" fill="#6b7280" opacity="0.7" />
        </svg>
    ),
    // ── Banner: Animated Gradient Wave ────────────────────────────────────────
    'gradient-wave': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.3" />
            <rect width="80" height="36" rx="3" fill="url(#wave-gradient)" />
            <defs>
                <linearGradient id="wave-gradient" x1="0" y1="0" x2="80" y2="0">
                    <stop offset="0%" stopColor={col} />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor={col} />
                </linearGradient>
            </defs>
        </svg>
    ),
    // ── Variant: Trust Ribbon ──────────────────────────────────────────
    'trust-ribbon': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="4" fill="white" stroke={col} strokeWidth="1" />
            <rect x="5" y="10" width="20" height="16" rx="2" fill={col} opacity="0.3" />
            <rect x="30" y="10" width="20" height="16" rx="2" fill={col} opacity="0.3" />
            <rect x="55" y="10" width="20" height="16" rx="2" fill={col} opacity="0.3" />
        </svg>
    ),
    // ── Variant: Flash Deal ──────────────────────────────────────────
    'flash-deal': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="4" fill="#1e1535" />
            <rect x="20" y="5" width="40" height="6" rx="3" fill={col} />
            <rect x="10" y="16" width="60" height="8" rx="2" fill="white" />
        </svg>
    ),
    // ── Variant: Dark Luxury ──────────────────────────────────────────
    'dark-luxury': (_, __) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="4" fill="#0f172a" stroke="#c9a84c" strokeWidth="2" />
            <rect x="10" y="10" width="60" height="16" rx="2" fill="none" stroke="#c9a84c" strokeWidth="1" />
        </svg>
    ),
    // ── Product Description variants ──────────────────────────────────────────
    // ── Product Variants ──────────────────────────────────────────────────────
    'swatches-sizes': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="12" cy="14" r="5" fill="#ef4444" />
            <circle cx="24" cy="14" r="5" fill="#3b82f6" />
            <circle cx="36" cy="14" r="5" fill="#22c55e" />
            <circle cx="48" cy="14" r="5" fill="#f59e0b" />
            <rect x="8" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
            <rect x="23" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
            <rect x="38" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
            <rect x="53" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),
    'inline-compact': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="10" cy="18" r="4" fill="#ef4444" />
            <circle cx="20" cy="18" r="4" fill="#3b82f6" />
            <circle cx="30" cy="18" r="4" fill="#22c55e" />
            <rect x="37" y="12" width="1" height="12" fill="#e5e7eb" />
            <rect x="42" y="13" width="10" height="10" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="55" y="13" width="10" height="10" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="68" y="13" width="10" height="10" rx="2" fill="none" stroke={col} strokeWidth="1" />
        </svg>
    ),
    'labelled-swatches': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="14" cy="14" r="6" fill="#ef4444" />
            <rect x="9" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
            <circle cx="34" cy="14" r="6" fill="#3b82f6" />
            <rect x="29" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
            <circle cx="54" cy="14" r="6" fill="#22c55e" />
            <rect x="49" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
            <circle cx="72" cy="14" r="6" fill="#f59e0b" />
            <rect x="67" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'pill-only': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="6" width="16" height="9" rx="4" fill="none" stroke={col} strokeWidth="1" />
            <rect x="23" y="6" width="16" height="9" rx="4" fill="none" stroke={col} strokeWidth="1" />
            <rect x="42" y="6" width="16" height="9" rx="4" fill="none" stroke={col} strokeWidth="1" />
            <rect x="4" y="21" width="14" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="21" y="21" width="10" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="34" y="21" width="12" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="49" y="21" width="10" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
    ),
    'card-grid': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="10" cy="10" r="4" fill="#ef4444" />
            <circle cx="20" cy="10" r="4" fill="#3b82f6" />
            <circle cx="30" cy="10" r="4" fill="#22c55e" />
            <rect x="4" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="23" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="42" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="61" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
        </svg>
    ),
    'accent-selected': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="12" cy="13" r="5" fill="#ef4444" stroke={col} strokeWidth="2" />
            <circle cx="24" cy="13" r="5" fill="#3b82f6" />
            <circle cx="36" cy="13" r="5" fill="#22c55e" />
            <circle cx="48" cy="13" r="5" fill="#f59e0b" />
            <rect x="4" y="23" width="12" height="8" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="19" y="23" width="12" height="8" rx="2" fill={col} opacity="0.15" stroke={col} strokeWidth="1.5" />
            <rect x="34" y="23" width="12" height="8" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="49" y="23" width="12" height="8" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
    ),
    'dark-selector': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e1535" />
            <circle cx="12" cy="13" r="5" fill="#ef4444" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="24" cy="13" r="5" fill="#3b82f6" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="36" cy="13" r="5" fill="#22c55e" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="4" y="23" width="12" height="8" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="19" y="23" width="12" height="8" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="34" y="23" width="12" height="8" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="0" y="33" width="50" height="2" rx="1" fill={col} opacity="0.6" />
        </svg>
    ),
    'side-by-side': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="12" cy="20" r="5" fill="#ef4444" />
            <circle cx="22" cy="20" r="5" fill="#3b82f6" />
            <circle cx="32" cy="20" r="5" fill="#22c55e" />
            <rect x="39" y="8" width="1" height="20" fill="#e5e7eb" />
            <rect x="44" y="14" width="10" height="9" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="57" y="14" width="10" height="9" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="69" y="14" width="9" height="9" rx="2" fill="none" stroke={col} strokeWidth="1" />
        </svg>
    ),
    'availability-grid': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="6" width="14" height="12" rx="3" fill="white" stroke={col} strokeWidth="1.5" />
            <circle cx="11" cy="9" r="2" fill="#22c55e" />
            <rect x="21" y="6" width="14" height="12" rx="3" fill="white" stroke={col} strokeWidth="1.5" />
            <circle cx="28" cy="9" r="2" fill="#22c55e" />
            <rect x="38" y="6" width="14" height="12" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="45" cy="9" r="2" fill="#ef4444" />
            <rect x="55" y="6" width="14" height="12" rx="3" fill="white" stroke={col} strokeWidth="1.5" />
            <circle cx="62" cy="9" r="2" fill="#22c55e" />
            <rect x="4" y="26" width="30" height="3" rx="1.5" fill="#d1d5db" />
        </svg>
    ),
    'spec-badges': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="10" width="32" height="12" rx="6" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.4" />
            <rect x="40" y="10" width="36" height="12" rx="6" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.4" />
            <rect x="4" y="26" width="28" height="5" rx="2.5" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.3" />
            <rect x="36" y="26" width="32" height="5" rx="2.5" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.3" />
        </svg>
    ),
    // ── What's In The Box variants ────────────────────────────────────────────
    'simple-list': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="8" width="36" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="8" y="15" width="6" height="5" rx="1" fill="#16a34a" opacity="0.8" />
            <rect x="18" y="16.5" width="44" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="8" y="22" width="6" height="5" rx="1" fill="#16a34a" opacity="0.8" />
            <rect x="18" y="23.5" width="38" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="8" y="29" width="6" height="5" rx="1" fill="#16a34a" opacity="0.8" />
            <rect x="18" y="30.5" width="42" height="2" rx="1" fill="#6b7280" opacity="0.6" />
        </svg>
    ),
    'tick-cards': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="7" width="68" height="7" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.75" />
            <circle cx="13" cy="10.5" r="3" fill="#16a34a" opacity="0.8" />
            <rect x="20" y="9" width="40" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
            <rect x="6" y="16" width="68" height="7" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.75" />
            <circle cx="13" cy="19.5" r="3" fill="#16a34a" opacity="0.8" />
            <rect x="20" y="18" width="34" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
            <rect x="6" y="25" width="68" height="7" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.75" />
            <circle cx="13" cy="28.5" r="3" fill="#16a34a" opacity="0.8" />
            <rect x="20" y="27" width="38" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
        </svg>
    ),
    'witb-two-column': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="6" width="30" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="8" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="16" y="14" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="8" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="16" y="21" width="16" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="8" y="27" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="16" y="28" width="18" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="42" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="14" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="42" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="21" width="16" height="2" rx="1" fill="#6b7280" opacity="0.5" />
        </svg>
    ),
    'numbered': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="6" width="32" height="3" rx="1.5" fill={col} opacity="0.85" />
            <circle cx="13" cy="15" r="4" fill={col} opacity="0.85" />
            <rect x="21" y="13.5" width="42" height="2.5" rx="1.25" fill="#6b7280" opacity="0.6" />
            <circle cx="13" cy="23" r="4" fill={col} opacity="0.6" />
            <rect x="21" y="21.5" width="36" height="2.5" rx="1.25" fill="#6b7280" opacity="0.5" />
            <circle cx="13" cy="31" r="4" fill={col} opacity="0.4" />
            <rect x="21" y="29.5" width="38" height="2.5" rx="1.25" fill="#6b7280" opacity="0.4" />
        </svg>
    ),
    'dark-panel': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e1535" />
            <rect x="8" y="6" width="36" height="3" rx="1.5" fill="#b8fa33" opacity="0.9" />
            <rect x="8" y="13" width="6" height="5" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="18" y="14.5" width="42" height="2" rx="1" fill="white" opacity="0.5" />
            <rect x="8" y="21" width="6" height="5" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="18" y="22.5" width="36" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="8" y="29" width="6" height="5" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="18" y="30.5" width="40" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    'icon-row': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="5" width="40" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="6" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="8" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="6" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="23" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="25" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="23" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="40" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="42" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="40" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="57" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="59" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="57" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
        </svg>
    ),
    'table-qty': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="6" width="68" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="6" y="12" width="68" height="6" fill="#f9fafb" />
            <rect x="9" y="14" width="36" height="2" rx="1" fill="#374151" opacity="0.6" />
            <rect x="57" y="14" width="14" height="2" rx="1" fill={col} opacity="0.7" />
            <rect x="6" y="18" width="68" height="6" fill="white" />
            <rect x="9" y="20" width="28" height="2" rx="1" fill="#374151" opacity="0.5" />
            <rect x="57" y="20" width="14" height="2" rx="1" fill={col} opacity="0.6" />
            <rect x="6" y="24" width="68" height="6" fill="#f9fafb" />
            <rect x="9" y="26" width="32" height="2" rx="1" fill="#374151" opacity="0.5" />
            <rect x="57" y="26" width="14" height="2" rx="1" fill={col} opacity="0.5" />
        </svg>
    ),
    'badge-count': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="6" width="32" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="8" y="13" width="34" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
            <rect x="57" y="11" width="15" height="6" rx="3" fill={col} opacity="0.85" />
            <rect x="8" y="20" width="28" height="2.5" rx="1.25" fill="#374151" opacity="0.5" />
            <rect x="57" y="18" width="15" height="6" rx="3" fill={col} opacity="0.7" />
            <rect x="8" y="27" width="32" height="2.5" rx="1.25" fill="#374151" opacity="0.4" />
            <rect x="57" y="25" width="15" height="6" rx="3" fill={col} opacity="0.5" />
        </svg>
    ),
    'split-image-list': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="4" width="33" height="28" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" />
            <circle cx="20" cy="13" r="5" fill="#c4b5fd" opacity="0.6" />
            <path d="M4 26 Q14 20 37 24" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
            <rect x="8" y="7" width="24" height="2" rx="1" fill={col} opacity="0.3" />
            <rect x="42" y="6" width="30" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="42" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="14.5" width="24" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="42" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="21.5" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="42" y="27" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="28.5" width="22" height="2" rx="1" fill="#6b7280" opacity="0.4" />
        </svg>
    ),
    'split-list-image': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="6" width="30" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="4" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="12" y="14.5" width="24" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="4" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="12" y="21.5" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="4" y="27" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="12" y="28.5" width="22" height="2" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="43" y="4" width="33" height="28" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" />
            <circle cx="59" cy="13" r="5" fill="#c4b5fd" opacity="0.6" />
            <path d="M43 26 Q53 20 76 24" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
            <rect x="48" y="7" width="24" height="2" rx="1" fill={col} opacity="0.3" />
        </svg>
    ),
    'plain': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="8" width="40" height="4" rx="2" fill={col} opacity="0.9" />
            <rect x="8" y="15" width="64" height="2" rx="1" fill="#e5e7eb" />
            <rect x="8" y="20" width="64" height="2" rx="1" fill="#d1d5db" />
            <rect x="8" y="25" width="48" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'accent-bar': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="0" y="0" width="4" height="36" rx="2" fill={col} />
            <rect x="10" y="8" width="36" height="4" rx="2" fill={col} opacity="0.9" />
            <rect x="10" y="17" width="58" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="22" width="58" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="27" width="40" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'feature-box': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="5" width="20" height="7" rx="3" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            <rect x="28" y="5" width="20" height="7" rx="3" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            <rect x="52" y="5" width="20" height="7" rx="3" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            <rect x="4" y="16" width="38" height="3" rx="1.5" fill={col} opacity="0.8" />
            <rect x="4" y="22" width="72" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="27" width="60" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'split-story': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="8" width="34" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="13" width="30" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="18" width="32" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="23" width="28" height="2" rx="1" fill="#d1d5db" />
            <rect x="40" y="8" width="1" height="22" fill="#e5e7eb" />
            <rect x="44" y="8" width="30" height="2" rx="1" fill="#d1d5db" />
            <rect x="44" y="13" width="28" height="2" rx="1" fill="#d1d5db" />
            <rect x="44" y="18" width="30" height="2" rx="1" fill="#d1d5db" />
            <rect x="44" y="23" width="22" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="4" width="72" height="2" rx="1" fill={col} opacity="0.8" />
        </svg>
    ),
    'card-elevated': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f3f4f6" />
            <rect x="4" y="4" width="72" height="28" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="10" y="9" width="36" height="4" rx="2" fill={col} opacity="0.85" />
            <rect x="10" y="15" width="2" height="12" rx="1" fill={col} />
            <rect x="10" y="17" width="56" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="22" width="50" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="27" width="40" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    // ── Banner: Split Image & Text ─────────────────────────────────────────────
    'split-image-text': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="32" height="36" rx="3" fill={col} opacity="0.3" />
            <rect x="36" y="8" width="38" height="6" rx="2" fill={col} opacity="0.9" />
            <rect x="36" y="18" width="30" height="3" rx="1.5" fill={col} opacity="0.6" />
        </svg>
    ),
    // ── Banner: Left + Badge ────────────────────────────────────────────────────
    'left-badge': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="52" height="36" rx="3" fill={col} opacity="0.7" />
            <rect x="52" width="28" height="36" fill={col} opacity="0.3" />
            <rect x="6" y="10" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="6" y="18" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="6" y="24" width="18" height="3" rx="1.5" fill="#b8fa33" opacity="0.8" />
        </svg>
    ),
    // ── Features: Simple Centered ──────────────────────────────────────────────
    'simple-centered': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.3" />
            <rect x="14" y="14" width="52" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="14" y="24" width="36" height="4" rx="1.5" fill="white" opacity="0.6" />
            <rect x="14" y="30" width="24" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── Features: Left + Badge ──────────────────────────────────────────────────
    'features-left-badge': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="60" height="36" rx="3" fill={col} opacity="0.5" />
            <rect x="60" width="20" height="36" fill={col} opacity="0.3" />
            <rect x="8" y="12" width="40" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="8" y="20" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="8" y="26" width="24" height="2.5" rx="1.25" fill="#b8fa33" opacity="0.7" />
        </svg>
    ),
    'split': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="52" height="36" rx="3" fill={col} opacity="0.7" />
            <rect x="52" width="28" height="36" fill={col} opacity="0.3" />
            <rect x="6" y="10" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="6" y="18" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="56" y="10" width="18" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="56" y="16" width="14" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="56" y="22" width="16" height="2.5" rx="1.25" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── Product Image — split-right (text left, image right) ──────────────────
    // Mirrors the split thumbnail: text column on the left, image on the right.
    'split-right': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="28" height="36" fill={col} opacity="0.3" />
            <rect x="28" width="52" height="36" rx="3" fill={col} opacity="0.7" />
            <rect x="6" y="10" width="18" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="6" y="16" width="14" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="6" y="22" width="16" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="44" y="10" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="50" y="18" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    // ── Product Image ─────────────────────────────────────────────────────────
    'single': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="20" y="3" width="40" height="30" rx="4" fill={col} opacity="0.18" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="34" cy="13" r="4" fill={col} opacity="0.35" />
            <path d="M20 28 L30 20 L38 25 L46 18 L60 28Z" fill={col} opacity="0.25" />
            <text x="40" y="36" textAnchor="middle" fontFamily="Arial" fontSize="5" fill={col} opacity="0.5">Single</text>
        </svg>
    ),
    'gallery': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            {/* Large main image left */}
            <rect x="2" y="2" width="44" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="16" cy="12" r="5" fill={col} opacity="0.3" />
            <path d="M2 28 L12 20 L22 24 L32 18 L46 28Z" fill={col} opacity="0.2" />
            {/* 4 thumbs right stacked 2x2 */}
            <rect x="48" y="2" width="14" height="14" rx="2" fill={col} opacity="0.28" stroke={col} strokeWidth="0.5" />
            <rect x="64" y="2" width="14" height="14" rx="2" fill={col} opacity="0.18" stroke={col} strokeWidth="0.5" />
            <rect x="48" y="18" width="14" height="16" rx="2" fill={col} opacity="0.18" stroke={col} strokeWidth="0.5" />
            <rect x="64" y="18" width="14" height="16" rx="2" fill={col} opacity="0.28" stroke={col} strokeWidth="0.5" />
        </svg>
    ),
    'fullwidth': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.12" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="28" cy="14" r="6" fill={col} opacity="0.3" />
            <path d="M0 28 L14 18 L28 24 L44 16 L60 22 L80 14 L80 36 L0 36Z" fill={col} opacity="0.2" />
        </svg>
    ),
    'full-width-hero': (col, _) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 48 }}>
            <rect width="80" height="48" rx="8" fill={col} opacity="0.3" />
            <rect x="5" y="10" width="70" height="28" rx="4" fill="white" opacity="0.2" />
        </svg>
    ),
    'zoom': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="8" y="3" width="64" height="30" rx="4" fill={col} opacity="0.15" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="30" cy="13" r="5" fill={col} opacity="0.3" />
            <path d="M8 28 L22 19 L32 24 L44 17 L72 28Z" fill={col} opacity="0.2" />
            {/* Zoom magnifier icon */}
            <circle cx="62" cy="11" r="5" stroke={col} strokeWidth="1.2" fill="none" opacity="0.6" />
            <line x1="66" y1="15" x2="70" y2="19" stroke={col} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
    ),
    // ── Product Image: Comparison / Front & Back ──────────────────────────────
    'comparison': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="36" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="14" cy="12" r="5" fill={col} opacity="0.3" />
            <path d="M2 28 L12 20 L22 25 L38 18 L38 32 L2 32Z" fill={col} opacity="0.2" />
            <rect x="39" y="2" width="1.5" height="32" fill={col} opacity="0.3" />
            <rect x="42" y="2" width="36" height="32" rx="3" fill={col} opacity="0.12" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="54" cy="12" r="5" fill={col} opacity="0.22" />
            <path d="M42 28 L52 21 L62 26 L78 19 L78 32 L42 32Z" fill={col} opacity="0.15" />
        </svg>
    ),
    // ── Hero Header: Credibility Banner ──────────────────────────────────────
    'credibility': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="0" y="0" width="30" height="36" fill="rgba(0,0,0,0.15)" />
            <rect x="4" y="9" width="22" height="4" rx="2" fill="#f59e0b" opacity="0.9" />
            <rect x="4" y="17" width="18" height="2.5" rx="1.25" fill="white" opacity="0.7" />
            <rect x="4" y="23" width="14" height="5" rx="2.5" fill="#f59e0b" opacity="0.8" />
            <rect x="36" y="10" width="36" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="36" y="19" width="28" height="2.5" rx="1.25" fill="white" opacity="0.5" />
            <rect x="36" y="25" width="22" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── Product Image: Lifestyle Shot ─────────────────────────────────────────
    'lifestyle': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.12" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="28" cy="13" r="7" fill={col} opacity="0.28" />
            <path d="M0 26 L16 17 L28 22 L44 14 L60 20 L80 12 L80 36 L0 36Z" fill={col} opacity="0.22" />
            <rect x="0" y="26" width="80" height="10" rx="0" fill={col} opacity="0.3" />
            <rect x="6" y="28" width="32" height="3" rx="1.5" fill="white" opacity="0.7" />
        </svg>
    ),
    // ── Product Image: Polaroid ───────────────────────────────────────────────
    'polaroid': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="10" y="1" width="60" height="34" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="13" y="4" width="54" height="22" rx="2" fill={col} opacity="0.18" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="26" cy="13" r="5" fill={col} opacity="0.3" />
            <path d="M13 22 L24 15 L34 19 L46 13 L67 22Z" fill={col} opacity="0.2" />
            <rect x="22" y="29" width="36" height="3" rx="1.5" fill="#9ca3af" opacity="0.7" />
        </svg>
    ),
    // ── Product Image: Before/After ───────────────────────────────────────────
    'before-after': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="35" height="28" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="13" cy="11" r="5" fill={col} opacity="0.28" />
            <path d="M2 24 L12 17 L22 21 L37 15 L37 28 L2 28Z" fill={col} opacity="0.18" />
            <rect x="3" y="31" width="20" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="38" y="2" width="1.5" height="28" fill={col} opacity="0.4" />
            <rect x="41" y="2" width="37" height="28" rx="3" fill={col} opacity="0.28" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="52" cy="11" r="5" fill={col} opacity="0.38" />
            <path d="M41 24 L52 16 L62 21 L78 14 L78 28 L41 28Z" fill={col} opacity="0.25" />
            <rect x="47" y="31" width="20" height="3" rx="1.5" fill={col} opacity="0.55" />
        </svg>
    ),
    // ── Product Image: Magazine Grid ──────────────────────────────────────────
    'magazine': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            {/* Large left hero */}
            <rect x="2" y="2" width="46" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="16" cy="13" r="6" fill={col} opacity="0.3" />
            <path d="M2 28 L14 20 L26 25 L38 17 L48 26 L48 32 L2 32Z" fill={col} opacity="0.2" />
            {/* Two stacked right thumbs */}
            <rect x="51" y="2" width="27" height="14" rx="3" fill={col} opacity="0.28" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="60" cy="8" r="3" fill={col} opacity="0.35" />
            <rect x="51" y="18" width="27" height="16" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="60" cy="25" r="3" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── Product Image: Inverted Magazine Grid ─────────────────────────────────
    'inverted-magazine-grid': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            {/* Two stacked left thumbs */}
            <rect x="2" y="2" width="27" height="14" rx="3" fill={col} opacity="0.28" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="11" cy="8" r="3" fill={col} opacity="0.35" />
            <rect x="2" y="18" width="27" height="16" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="11" cy="25" r="3" fill={col} opacity="0.25" />
            {/* Large right hero */}
            <rect x="32" y="2" width="46" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="54" cy="13" r="6" fill={col} opacity="0.3" />
            <path d="M32 28 L44 20 L56 25 L68 17 L78 24 L78 32 L32 32Z" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── Hero Header: Announcement Strip ──────────────────────────────────────
    'announcement': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="10" y="15" width="60" height="4" rx="2" fill="white" opacity="0.9" />
            <circle cx="36" cy="17" r="1.5" fill={col} opacity="0.6" />
            <circle cx="44" cy="17" r="1.5" fill={col} opacity="0.6" />
        </svg>
    ),
    // ── Hero Header: Dark Luxury ──────────────────────────────────────────────
    'luxury': (_, __) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#000000" />
            <rect x="32" y="7" width="16" height="1" fill="#c9a84c" />
            <rect x="14" y="13" width="52" height="6" rx="2" fill="white" opacity="0.9" />
            <rect x="32" y="22" width="16" height="1" fill="#c9a84c" />
            <rect x="20" y="26" width="40" height="2.5" rx="1.25" fill="#c9a84c" opacity="0.7" />
        </svg>
    ),
    // ── Hero Header: Category Banner ─────────────────────────────────────────
    'category': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} stroke="#e5e7eb" strokeWidth="1" />
            <rect x="0" y="0" width="5" height="36" rx="2" fill={col} />
            <rect x="10" y="10" width="35" height="5" rx="2" fill={col} opacity="0.8" />
            <rect x="10" y="19" width="26" height="3" rx="1.5" fill="#9ca3af" />
            <rect x="54" y="12" width="20" height="10" rx="4" fill={col} opacity="0.85" />
            <rect x="56" y="15" width="16" height="4" rx="2" fill="white" opacity="0.9" />
        </svg>
    ),
    // ── Hero Header: Seasonal / Sale ─────────────────────────────────────────
    'seasonal': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e1535" />
            <rect x="4" y="6" width="22" height="24" rx="5" fill="#dc2626" />
            <rect x="7" y="14" width="16" height="6" rx="2" fill="white" opacity="0.95" />
            <rect x="32" y="11" width="40" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="32" y="20" width="30" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),

    // ── Price Block ───────────────────────────────────────────────────────────
    'simple': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="12" width="44" height="12" rx="3" fill={col} opacity="0.85" />
        </svg>
    ),
    'sale': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="11" width="34" height="10" rx="3" fill="#dc2626" opacity="0.8" />
            <rect x="44" y="13" width="18" height="1" fill="#9ca3af" opacity="0.8" />
            <rect x="56" y="9" width="18" height="10" rx="4" fill="#b8fa33" />
            <rect x="58" y="12.5" width="14" height="3" rx="1.5" fill="#1e1535" opacity="0.7" />
        </svg>
    ),
    'urgency': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="7" width="44" height="14" rx="3" fill={col} opacity="0.8" />
            <rect x="0" y="25" width="80" height="11" fill="#fef2f2" />
            <circle cx="10" cy="30.5" r="2.5" fill="#ef4444" opacity="0.8" />
            <rect x="16" y="28.5" width="44" height="4" rx="2" fill="#ef4444" opacity="0.5" />
        </svg>
    ),
    'compact': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="14" width="28" height="8" rx="2" fill={col} opacity="0.85" />
            <rect x="50" y="14" width="24" height="3" rx="1.5" fill="#6b7280" opacity="0.5" />
            <rect x="50" y="20" width="18" height="2.5" rx="1.25" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'range': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="14" width="66" height="10" rx="3" fill={col} opacity="0.8" />
            <rect x="6" y="28" width="44" height="3" rx="1.5" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'auction': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="13" width="36" height="9" rx="3" fill={col} opacity="0.85" />
            <rect x="4" y="26" width="72" height="1" fill="#e5e7eb" />
            <rect x="6" y="29" width="28" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="54" y="29" width="20" height="3" rx="1.5" fill="#ef4444" opacity="0.5" />
        </svg>
    ),
    'bundle': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="4" width="72" height="7" rx="2" fill={col} opacity="0.8" />
            <rect x="4" y="13" width="72" height="6" fill="white" />
            <rect x="4" y="19" width="72" height="6" fill={light} />
            <rect x="4" y="25" width="72" height="6" fill="white" />
            <rect x="36" y="15" width="20" height="2.5" rx="1.25" fill={col} opacity="0.7" />
            <rect x="36" y="21" width="20" height="2.5" rx="1.25" fill={col} opacity="0.7" />
        </svg>
    ),
    'finance': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="14" width="38" height="10" rx="3" fill={col} opacity="0.85" />
            <rect x="56" y="9" width="18" height="18" rx="4" fill={col} opacity="0.7" />
            <rect x="58" y="14" width="14" height="4" rx="2" fill="white" opacity="0.9" />
        </svg>
    ),
    'trade': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="6" y="13" width="36" height="9" rx="3" fill="white" opacity="0.9" />
            <rect x="50" y="10" width="24" height="16" rx="4" fill="#1e3a5f" />
            <rect x="53" y="15" width="18" height="3" rx="1.5" fill="#94a3b8" opacity="0.7" />
        </svg>
    ),
    'free-shipping': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="10" width="36" height="12" rx="3" fill={col} opacity="0.85" />
            <rect x="50" y="7" width="25" height="22" rx="5" fill="#16a34a" />
            <rect x="52" y="13" width="21" height="4" rx="2" fill="white" opacity="0.95" />
            <rect x="54" y="19" width="17" height="3" rx="1.5" fill="white" opacity="0.7" />
        </svg>
    ),

    // ── Trust Badges ─────────────────────────────────────────────────────────
    'row': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <rect x="22" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <rect x="40" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <rect x="58" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <circle cx="12" cy="15" r="4" fill={col} opacity="0.6" />
            <circle cx="30" cy="15" r="4" fill={col} opacity="0.6" />
            <circle cx="48" cy="15" r="4" fill={col} opacity="0.6" />
            <circle cx="66" cy="15" r="4" fill={col} opacity="0.6" />
        </svg>
    ),
    'grid': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="3" y="3" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <rect x="42" y="3" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <rect x="3" y="19" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <rect x="42" y="19" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <circle cx="11" cy="10" r="3" fill={col} opacity="0.6" />
            <circle cx="50" cy="10" r="3" fill={col} opacity="0.6" />
            <circle cx="11" cy="26" r="3" fill={col} opacity="0.6" />
            <circle cx="50" cy="26" r="3" fill={col} opacity="0.6" />
        </svg>
    ),
    'strip': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="10" cy="18" r="3" fill={col} opacity="0.7" />
            <rect x="15" y="15.5" width="10" height="5" rx="2.5" fill={col} opacity="0.4" />
            <rect x="29" y="17" width="1" height="2" fill="#e5e7eb" />
            <circle cx="35" cy="18" r="3" fill={col} opacity="0.7" />
            <rect x="40" y="15.5" width="10" height="5" rx="2.5" fill={col} opacity="0.4" />
            <rect x="54" y="17" width="1" height="2" fill="#e5e7eb" />
            <circle cx="60" cy="18" r="3" fill={col} opacity="0.7" />
            <rect x="65" y="15.5" width="10" height="5" rx="2.5" fill={col} opacity="0.4" />
        </svg>
    ),
    'icon-only': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <circle cx="12" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="12" cy="15" r="3" fill={col} opacity="0.5" />
            <circle cx="32" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="32" cy="15" r="3" fill={col} opacity="0.5" />
            <circle cx="52" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="52" cy="15" r="3" fill={col} opacity="0.5" />
            <circle cx="70" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="70" cy="15" r="3" fill={col} opacity="0.5" />
        </svg>
    ),
    'text-only': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="3" y="12" width="16" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <rect x="22" y="12" width="20" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <rect x="45" y="12" width="14" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <rect x="62" y="12" width="15" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
        </svg>
    ),    // ── Nav Bar ───────────────────────────────────────────────────────────────
    'dark': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="8" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="22" y="15" width="14" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="40" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="54" y="15" width="12" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'light': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="15" width="10" height="3" rx="1.5" fill="#374151" opacity="0.7" />
            <rect x="22" y="15" width="14" height="3" rx="1.5" fill="#374151" opacity="0.7" />
            <rect x="40" y="15" width="10" height="3" rx="1.5" fill="#374151" opacity="0.7" />
            <rect x="54" y="15" width="12" height="3" rx="1.5" fill="#374151" opacity="0.7" />
        </svg>
    ),
    'underline': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="14" width="10" height="3" rx="1.5" fill={col} opacity="0.9" />
            <rect x="8" y="20" width="10" height="2" rx="1" fill={col} />
            <rect x="22" y="14" width="14" height="3" rx="1.5" fill="#374151" opacity="0.5" />
            <rect x="40" y="14" width="10" height="3" rx="1.5" fill="#374151" opacity="0.5" />
            <rect x="54" y="14" width="12" height="3" rx="1.5" fill="#374151" opacity="0.5" />
        </svg>
    ),
    'pills': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="12" width="16" height="12" rx="6" fill={col} opacity="0.85" />
            <rect x="23" y="12" width="20" height="12" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="46" y="12" width="14" height="12" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="63" y="12" width="14" height="12" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
    ),
    'centered': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="26" y="7" width="28" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="8" y="22" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="22" y="22" width="14" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="40" y="22" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="54" y="22" width="12" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),
    'left-aligned': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="6" y="14" width="20" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="42" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="55" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="68" y="15" width="8" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),
    // ── Specs Table ───────────────────────────────────────────────────────────
    'full': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="80" height="8" rx="3" fill={col} opacity="0.8" />
            <rect x="0" y="10" width="30" height="4" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="32" y="10" width="40" height="4" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="0" y="17" width="30" height="4" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="32" y="17" width="35" height="4" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="0" y="24" width="30" height="4" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="32" y="24" width="38" height="4" rx="1" fill="#6b7280" opacity="0.4" />
        </svg>
    ),
    'two-column': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="80" height="8" rx="3" fill={col} opacity="0.8" />
            <rect x="2" y="11" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="20" y="11" width="16" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="42" y="11" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="60" y="11" width="16" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="2" y="17" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="20" y="17" width="14" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="42" y="17" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="60" y="17" width="12" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="38" y="8" width="2" height="28" fill="#e5e7eb" />
        </svg>
    ), 'zebra': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" />
            <rect x="0" y="0" width="80" height="6" rx="3" fill="white" />
            <rect x="2" y="1" width="30" height="4" rx="1" fill={col} opacity="0.8" />
            <rect x="0" y="8" width="80" height="7" fill="#f5f3ff" />
            <rect x="0" y="15" width="80" height="7" fill="white" />
            <rect x="0" y="22" width="80" height="7" fill="#f5f3ff" />
            <rect x="0" y="29" width="80" height="7" fill="white" />
            <rect x="2" y="10" width="22" height="3" rx="1" fill={col} opacity="0.5" />
            <rect x="2" y="17" width="22" height="3" rx="1" fill={col} opacity="0.5" />
            <rect x="2" y="24" width="22" height="3" rx="1" fill={col} opacity="0.5" />
        </svg>
    ),
    'card': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="4" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="2" y="20" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="42" y="4" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="42" y="20" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="5" y="7" width="14" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="5" y="11" width="20" height="2.5" rx="1" fill="#374151" opacity="0.5" />
            <rect x="5" y="23" width="14" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="5" y="27" width="18" height="2.5" rx="1" fill="#374151" opacity="0.5" />
        </svg>
    ),
    'highlighted': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="80" height="9" rx="3" fill={col} opacity="0.9" />
            <rect x="6" y="2.5" width="20" height="4" rx="1" fill="white" opacity="0.9" />
            <rect x="0" y="11" width="30" height="5" rx="0" fill="#f9fafb" />
            <rect x="2" y="12.5" width="18" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="32" y="12.5" width="28" height="2" rx="1" fill="#4b5563" opacity="0.5" />
            <rect x="0" y="18" width="30" height="5" rx="0" fill="#f9fafb" />
            <rect x="2" y="19.5" width="18" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="32" y="19.5" width="24" height="2" rx="1" fill="#4b5563" opacity="0.5" />
            <rect x="0" y="25" width="30" height="5" rx="0" fill="#f9fafb" />
            <rect x="2" y="26.5" width="18" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="32" y="26.5" width="30" height="2" rx="1" fill="#4b5563" opacity="0.5" />
        </svg>
    ),
    // ── Policy Tabs ───────────────────────────────────────────────────────────
    'tabbed': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="20" height="10" rx="2" fill={col} opacity="0.85" />
            <rect x="22" y="0" width="20" height="10" rx="2" fill="#e5e7eb" />
            <rect x="44" y="0" width="20" height="10" rx="2" fill="#e5e7eb" />
            <rect x="0" y="10" width="80" height="26" rx="0" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="17" width="50" height="3" rx="1.5" fill="#9ca3af" opacity="0.6" />
            <rect x="6" y="23" width="40" height="3" rx="1.5" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'stacked': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="3" height="10" rx="1.5" fill={col} opacity="0.9" />
            <rect x="8" y="4" width="20" height="3" rx="1" fill={col} opacity="0.7" />
            <rect x="8" y="9" width="50" height="2" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="2" y="15" width="3" height="10" rx="1.5" fill={col} opacity="0.9" />
            <rect x="8" y="17" width="24" height="3" rx="1" fill={col} opacity="0.7" />
            <rect x="8" y="22" width="45" height="2" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="2" y="28" width="3" height="7" rx="1.5" fill={col} opacity="0.9" />
            <rect x="8" y="30" width="18" height="3" rx="1" fill={col} opacity="0.7" />
        </svg>
    ),
    'accordion': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="76" height="8" rx="3" fill={col} opacity="0.85" />
            <rect x="6" y="4.5" width="20" height="3" rx="1" fill="white" opacity="0.9" />
            <rect x="70" y="4.5" width="6" height="3" rx="1" fill="white" opacity="0.7" />
            <rect x="2" y="12" width="76" height="14" rx="0" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="16" width="50" height="2.5" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="6" y="20" width="40" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
            <rect x="2" y="28" width="76" height="7" rx="3" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="30" width="18" height="3" rx="1" fill="#6b7280" opacity="0.6" />
        </svg>
    ),
    'simple-thumb': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="20" y="8" width="40" height="6" rx="2" fill="white" opacity="0.9" />
            <rect x="24" y="18" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'side-nav': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="22" height="36" rx="3" fill="#f3f4f6" />
            <rect x="2" y="4" width="18" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="4" y="13" width="14" height="3" rx="1" fill="#9ca3af" opacity="0.6" />
            <rect x="4" y="19" width="14" height="3" rx="1" fill="#9ca3af" opacity="0.6" />
            <rect x="4" y="25" width="14" height="3" rx="1" fill="#9ca3af" opacity="0.6" />
            <rect x="26" y="4" width="40" height="3" rx="1" fill={col} opacity="0.7" />
            <rect x="26" y="10" width="48" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
            <rect x="26" y="15" width="44" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
            <rect x="26" y="20" width="46" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'pills-nav': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="3" width="16" height="8" rx="4" fill={col} opacity="0.85" />
            <rect x="23" y="3" width="20" height="8" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="46" y="3" width="14" height="8" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="63" y="3" width="14" height="8" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="2" y="14" width="76" height="20" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="19" width="48" height="2.5" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="6" y="24" width="38" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'icon-tabs': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="20" height="12" rx="2" fill={col} opacity="0.85" />
            <rect x="21" y="0" width="19" height="12" rx="2" fill="#e5e7eb" />
            <rect x="41" y="0" width="19" height="12" rx="2" fill="#e5e7eb" />
            <rect x="61" y="0" width="19" height="12" rx="2" fill="#e5e7eb" />
            <circle cx="10" cy="5" r="2.5" fill="white" opacity="0.8" />
            <rect x="4" y="9" width="12" height="2" rx="1" fill="white" opacity="0.6" />
            <rect x="0" y="12" width="80" height="24" rx="0" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="19" width="48" height="2.5" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="6" y="24" width="36" height="2.5" rx="1" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    // ── Button Block Variants ─────────────────────────────────────────────────
    'button-solid': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-outline': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill="white" stroke={col} strokeWidth="2" />
            <rect x="25" y="15" width="30" height="6" rx="3" fill={col} opacity="0.8" />
        </svg>
    ),
    'button-rounded': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="10" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-shadow': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="10" width="60" height="20" rx="4" fill="rgba(0,0,0,0.15)" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-gradient': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-icon-left': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <circle cx="20" cy="18" r="4" fill="white" opacity="0.9" />
            <rect x="30" y="15" width="25" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-icon-right': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="20" y="15" width="25" height="6" rx="3" fill="white" opacity="0.9" />
            <circle cx="60" cy="18" r="4" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-full-width': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="2" y="8" width="76" height="20" rx="4" fill={col} />
            <rect x="20" y="15" width="40" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-minimal': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="20" y="15" width="40" height="4" rx="2" fill={col} />
            <line x1="20" y1="22" x2="60" y2="22" stroke={col} strokeWidth="1.5" />
        </svg>
    ),
    'button-pulse': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="8" y="6" width="64" height="24" rx="6" fill="#dc2626" opacity="0.2" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill="#dc2626" />
            <rect x="20" y="15" width="40" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    // ── Hero Product ──────────────────────────────────────────────────────────
    'hp-default': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Left: image slot 48% */}
            <rect x="4" y="4" width="34" height="36" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <rect x="12" y="14" width="18" height="14" rx="2" fill={col} opacity="0.18" />
            <circle cx="21" cy="18" r="4" fill={col} opacity="0.3" />
            <path d="M13 26 l5-5 4 3 4-5 5 7H13z" fill={col} opacity="0.25" />
            {/* Thumbs strip */}
            {[0, 1, 2, 3].map(i => <rect key={i} x={4 + i * 9} y="41" width="7" height="4" rx="1" fill={col} opacity="0.2" />)}
            {/* Right: text lines 52% */}
            <rect x="42" y="6" width="20" height="3" rx="1.5" fill={col} opacity="0.3" />
            <rect x="42" y="12" width="34" height="4" rx="1.5" fill={col} opacity="0.7" />
            <rect x="42" y="18" width="22" height="4" rx="1.5" fill={col} opacity="0.9" />
            <rect x="42" y="24" width="34" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="42" y="28" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="42" y="32" width="28" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    'hp-image-right': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Left: text lines 52% */}
            <rect x="4" y="6" width="20" height="3" rx="1.5" fill={col} opacity="0.3" />
            <rect x="4" y="12" width="34" height="4" rx="1.5" fill={col} opacity="0.7" />
            <rect x="4" y="18" width="22" height="4" rx="1.5" fill={col} opacity="0.9" />
            <rect x="4" y="24" width="34" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="4" y="28" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="4" y="32" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Right: image slot 48% */}
            <rect x="42" y="4" width="34" height="36" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <rect x="49" y="14" width="18" height="14" rx="2" fill={col} opacity="0.18" />
            <circle cx="58" cy="18" r="4" fill={col} opacity="0.3" />
            <path d="M50 26 l5-5 4 3 4-5 4 7H50z" fill={col} opacity="0.25" />
        </svg>
    ),
    'hp-stacked': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Top: full-width image slot */}
            <rect x="4" y="4" width="72" height="20" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <rect x="25" y="9" width="30" height="10" rx="2" fill={col} opacity="0.18" />
            <circle cx="40" cy="12" r="3.5" fill={col} opacity="0.3" />
            <path d="M26 19 l6-5 5 3 5-5 6 7H26z" fill={col} opacity="0.25" />
            {/* Bottom: centered text */}
            <rect x="20" y="27" width="40" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="26" y="32" width="28" height="3" rx="1.5" fill={col} opacity="0.9" />
            <rect x="22" y="37" width="36" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    'hp-dark-hero': (col, _light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#1e1535" />
            {/* Left: dark image slot */}
            <rect x="4" y="4" width="34" height="36" rx="3" fill="#2d1f5e" stroke="#4c3a8a" strokeWidth="0.8" />
            <circle cx="21" cy="18" r="5" fill="#7530fb" opacity="0.4" />
            <path d="M8 36 l6-7 5 4 5-6 6 9H8z" fill="#7530fb" opacity="0.3" />
            {/* Right: white text on dark */}
            <rect x="42" y="6" width="14" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="42" y="12" width="34" height="4" rx="1.5" fill="white" opacity="0.85" />
            <rect x="42" y="18" width="22" height="4" rx="1.5" fill={col} opacity="1" />
            <rect x="42" y="24" width="32" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="42" y="28" width="28" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="42" y="32" width="30" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    'hp-with-gallery': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Vertical thumb strip ~10% — 4 stacked squares, first has active border */}
            <rect x="2" y="3" width="7" height="7" rx="1" fill={col} opacity="0.9" stroke={col} strokeWidth="0.8" />
            <rect x="2" y="12" width="7" height="7" rx="1" fill={light} stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="2" y="21" width="7" height="7" rx="1" fill={light} stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="2" y="30" width="7" height="7" rx="1" fill={light} stroke={col} strokeWidth="0.5" opacity="0.6" />
            {/* Main image ~50% — large, clean, no card border */}
            <rect x="12" y="3" width="30" height="38" rx="3" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2.5 1.2" />
            <circle cx="27" cy="17" r="5" fill={col} opacity="0.25" />
            <path d="M13 38 l6-7 5 4 6-6 6 9H13z" fill={col} opacity="0.2" />
            {/* Subtle divider */}
            <line x1="45" y1="3" x2="45" y2="41" stroke={col} strokeWidth="0.6" opacity="0.2" />
            {/* Details ~40% — badge + title + price + bullets */}
            <rect x="47" y="4" width="10" height="3" rx="1.5" fill={col} opacity="0.35" />
            <rect x="47" y="10" width="30" height="3.5" rx="1.5" fill={col} opacity="0.75" />
            <rect x="47" y="15" width="20" height="4" rx="1.5" fill={col} opacity="1" />
            <rect x="47" y="22" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="47" y="26" width="26" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="47" y="30" width="24" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="47" y="34" width="22" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    'hp-centered-hero': (col, light) => (
        <svg viewBox="0 0 80 50" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="50" rx="3" fill="#f9fafb" />
            {/* Top: centered image */}
            <rect x="20" y="3" width="40" height="22" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <circle cx="40" cy="13" r="5" fill={col} opacity="0.3" />
            <path d="M22 24 l6-6 5 4 6-5 5 7H22z" fill={col} opacity="0.2" />
            {/* Bottom: centered text */}
            <rect x="26" y="28" width="28" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="22" y="33" width="36" height="3" rx="1.5" fill={col} opacity="0.5" />
            <rect x="16" y="39" width="48" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="18" y="43" width="44" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="20" y="47" width="40" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── CTA Banner ────────────────────────────────────────────────────────────
    'ctab-trust-bar': (col, _light) => (
        <svg viewBox="0 0 80 28" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="28" rx="3" fill="#ffffff" />
            <rect x="0" y="25" width="80" height="3" fill={col} />
            <circle cx="10" cy="14" r="5" fill={col} opacity="0.9" />
            <rect x="18" y="11" width="18" height="3" rx="1.5" fill={col} opacity="0.8" />
            <rect x="40" y="10" width="12" height="5" rx="2.5" fill={col} opacity="0.15" />
            <rect x="54" y="10" width="12" height="5" rx="2.5" fill={col} opacity="0.15" />
            <rect x="68" y="10" width="9" height="5" rx="2.5" fill={col} opacity="0.15" />
        </svg>
    ),
    'ctab-split-action': (col, _light) => (
        <svg viewBox="0 0 80 32" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="32" rx="3" fill="#1e1535" />
            <rect x="4" y="9" width="32" height="4" rx="1.5" fill="white" opacity="0.85" />
            <rect x="4" y="16" width="24" height="2.5" rx="1" fill="white" opacity="0.4" />
            <line x1="44" y1="4" x2="44" y2="28" stroke="white" strokeWidth="0.6" opacity="0.3" />
            <rect x="50" y="11" width="24" height="10" rx="4" fill={col} />
            <rect x="56" y="14.5" width="12" height="3" rx="1.5" fill="white" opacity="0.9" />
        </svg>
    ),
    'ctab-flash-deal': (col, _light) => (
        <svg viewBox="0 0 80 34" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="34" rx="3" fill="#dc2626" />
            <rect width="80" height="7" rx="0" fill="#b91c1c" />
            <rect x="22" y="1.5" width="36" height="4" rx="1.5" fill="white" opacity="0.7" />
            <rect x="4" y="12" width="34" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="4" y="19" width="26" height="2.5" rx="1" fill="white" opacity="0.5" />
            <rect x="46" y="11" width="28" height="12" rx="4" fill="#ff6b00" opacity="0.9" />
            <rect x="50" y="15.5" width="20" height="3" rx="1.5" fill="white" opacity="0.9" />
        </svg>
    ),
    'ctab-dark-premium': (col, _light) => (
        <svg viewBox="0 0 80 34" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="34" rx="4" fill="#d4af37" />
            <rect x="1" y="1" width="78" height="32" rx="3.2" fill="#7530fb" />
            <rect x="2" y="2" width="76" height="30" rx="2.5" fill="#0a0a0f" />
            <rect x="18" y="8" width="44" height="5" rx="2" fill="white" opacity="0.85" />
            <rect x="24" y="16" width="32" height="3" rx="1.5" fill="#a0a0b0" opacity="0.7" />
            <rect x="28" y="22" width="24" height="5" rx="2.5" fill="none" stroke="#d4af37" strokeWidth="0.8" />
        </svg>
    ),
    'ctab-icon-value': (col, _light) => (
        <svg viewBox="0 0 80 34" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="34" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.6" opacity="0.4" />
            {/* 3 equal columns */}
            <line x1="27" y1="4" x2="27" y2="30" stroke={col} strokeWidth="0.6" opacity="0.3" />
            <line x1="54" y1="4" x2="54" y2="30" stroke={col} strokeWidth="0.6" opacity="0.3" />
            {/* Col 1 */}
            <circle cx="13" cy="10" r="4" fill={col} opacity="0.2" />
            <rect x="7" y="17" width="12" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="9" y="22" width="8" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Col 2 */}
            <circle cx="40" cy="10" r="4" fill={col} opacity="0.2" />
            <rect x="34" y="17" width="12" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="36" y="22" width="8" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Col 3 */}
            <circle cx="67" cy="10" r="4" fill={col} opacity="0.2" />
            <rect x="61" y="17" width="12" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="63" y="22" width="8" height="2" rx="1" fill={col} opacity="0.3" />
        </svg>
    ),
    'ctab-ribbon': (col, _light) => (
        <svg viewBox="0 0 80 22" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="22" fill="#0a0a0f" />
            <rect x="0" y="0" width="4" height="22" fill={col} />
            <rect x="8" y="8" width="30" height="3" rx="1.5" fill="white" opacity="0.85" />
            <rect x="54" y="6" width="22" height="10" rx="3" fill="none" stroke={col} strokeWidth="0.9" />
            <rect x="58" y="9.5" width="14" height="3" rx="1.5" fill={col} opacity="0.9" />
        </svg>
    ),
    'ctab-gradient-hero': (col, _light) => (
        <svg viewBox="0 0 80 38" fill="none" style={{ width: '100%', height: 32 }}>
            <defs>
                <linearGradient id="ctabGH" x1="0" y1="0" x2="80" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={col} />
                    <stop offset="100%" stopColor="#0a0a0f" />
                </linearGradient>
            </defs>
            <rect width="80" height="38" rx="4" fill="url(#ctabGH)" />
            <rect x="16" y="8" width="48" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="22" y="16" width="36" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="26" y="24" width="28" height="9" rx="4" fill="white" />
            <rect x="30" y="27" width="20" height="3" rx="1.5" fill={col} opacity="0.8" />
        </svg>
    ),
    'ctab-social-proof': (col, _light) => (
        <svg viewBox="0 0 80 32" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="32" rx="3" fill="#ffffff" />
            <rect x="0" y="0" width="80" height="1" fill={col} opacity="0.15" />
            <rect x="0" y="31" width="80" height="1" fill={col} opacity="0.15" />
            {/* Stars */}
            {[0, 1, 2, 3, 4].map(i => <rect key={i} x={4 + i * 5} y="6" width="4" height="4" rx="0.8" fill="#f59e0b" opacity="0.9" />)}
            <rect x="4" y="13" width="22" height="4" rx="1.5" fill={col} opacity="0.9" />
            <rect x="4" y="20" width="18" height="2.5" rx="1" fill={col} opacity="0.3" />
            <line x1="38" y1="4" x2="38" y2="28" stroke={col} strokeWidth="0.6" opacity="0.2" />
            <rect x="42" y="8" width="30" height="3.5" rx="1.5" fill={col} opacity="0.7" />
            <rect x="42" y="15" width="22" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="42" y="21" width="18" height="5" rx="2" fill="none" stroke={col} strokeWidth="0.8" />
        </svg>
    ),
    'ctab-announcement': (col, _light) => (
        <svg viewBox="0 0 80 26" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="26" rx="3" fill={col} opacity="0.08" />
            <rect x="3" y="8" width="20" height="10" rx="5" fill={col} opacity="0.9" />
            <rect x="6" y="11" width="14" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="27" y="10" width="26" height="3.5" rx="1.5" fill={col} opacity="0.75" />
            <rect x="57" y="8" width="18" height="10" rx="5" fill="#e5e7eb" />
            <rect x="60" y="11" width="12" height="4" rx="1.5" fill="#6b7280" opacity="0.8" />
        </svg>
    ),
    'ctab-two-tone': (col, _light) => (
        <svg viewBox="0 0 80 32" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="32" rx="3" fill="white" />
            {/* Left accent half */}
            <clipPath id="ctabTTL"><rect width="40" height="32" rx="3" /></clipPath>
            <rect width="40" height="32" fill={col} clipPath="url(#ctabTTL)" />
            <rect x="4" y="9" width="24" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="4" y="16" width="18" height="2.5" rx="1" fill="white" opacity="0.5" />
            {/* Right white half */}
            <rect x="44" y="8" width="28" height="4" rx="1.5" fill={col} opacity="0.8" />
            <rect x="44" y="15" width="20" height="2.5" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="44" y="21" width="20" height="7" rx="3" fill={col} opacity="0.9" />
            <rect x="48" y="23.5" width="12" height="2.5" rx="1" fill="white" opacity="0.9" />
        </svg>
    ),

    // ── Minimal Clean: main image top-left, 2×2 grid bottom-left, cream panel right
    'hp-minimal-clean': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Warm cream background */}
            <rect width="80" height="44" rx="3" fill="#f5f4f0" />
            {/* Left col: main image top */}
            <rect x="3" y="3" width="32" height="22" rx="2" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2 1" />
            <circle cx="19" cy="12" r="4" fill={col} opacity="0.25" />
            <path d="M4 24 l5-5 4 3 4-5 5 6H4z" fill={col} opacity="0.2" />
            {/* 2×2 thumb grid bottom-left */}
            <rect x="3" y="27" width="15" height="7" rx="1.5" fill={col} opacity="0.18" />
            <rect x="20" y="27" width="15" height="7" rx="1.5" fill={col} opacity="0.18" />
            <rect x="3" y="36" width="15" height="7" rx="1.5" fill={col} opacity="0.12" />
            <rect x="20" y="36" width="15" height="7" rx="1.5" fill={col} opacity="0.12" />
            {/* Right: cream panel */}
            <rect x="38" y="3" width="39" height="38" rx="3" fill="#faf9f6" />
            {/* Category label — tiny */}
            <rect x="42" y="7" width="14" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Serif title lines */}
            <rect x="42" y="12" width="31" height="3.5" rx="1" fill={col} opacity="0.75" />
            <rect x="42" y="17" width="22" height="3.5" rx="1" fill={col} opacity="0.55" />
            {/* Thin accent rule */}
            <rect x="42" y="22" width="10" height="1.5" rx="1" fill={col} opacity="1" />
            {/* Price */}
            <rect x="42" y="26" width="20" height="3.5" rx="1" fill={col} opacity="0.9" />
            {/* Em-dash bullets */}
            <rect x="42" y="32" width="30" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="42" y="36" width="26" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── Flash Sale: red urgency banner top, image+SAVE badge left, giant price right
    'hp-flash-sale': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#fff7ed" />
            {/* Red urgency banner */}
            <rect x="3" y="3" width="74" height="7" rx="2" fill="#dc2626" />
            <rect x="18" y="5" width="44" height="2.5" rx="1" fill="white" opacity="0.85" />
            {/* Left: image with red SAVE badge corner */}
            <rect x="3" y="13" width="32" height="26" rx="2" fill="#fee2e2" stroke="#dc2626" strokeWidth="0.7" />
            <circle cx="19" cy="22" r="5" fill="#dc2626" opacity="0.2" />
            <path d="M4 37 l5-5 5 3 4-5 5 7H4z" fill="#dc2626" opacity="0.2" />
            {/* SAVE badge top-right of image */}
            <rect x="26" y="14" width="8" height="8" rx="1.5" fill="#dc2626" />
            <rect x="27" y="15.5" width="6" height="1.5" rx="0.5" fill="white" opacity="0.9" />
            <rect x="27" y="18.5" width="6" height="1.5" rx="0.5" fill="white" opacity="0.9" />
            {/* Right: badge + giant price + strikethrough + progress bar */}
            <rect x="39" y="13" width="14" height="3" rx="1.5" fill="#dc2626" opacity="0.25" />
            <rect x="39" y="19" width="36" height="5" rx="1.5" fill="#dc2626" opacity="0.9" />
            <rect x="39" y="26" width="20" height="2.5" rx="1" fill={col} opacity="0.25" style={{ textDecoration: 'line-through' }} />
            {/* Progress bar */}
            <rect x="39" y="31" width="36" height="3" rx="1.5" fill="#fee2e2" />
            <rect x="39" y="31" width="12" height="3" rx="1.5" fill="#dc2626" opacity="0.8" />
            {/* Bullets */}
            <rect x="39" y="37" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="39" y="41" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="39" y="45" width="24" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── Dark Premium: near-black bg, text left, image right with glow halo
    'hp-dark-premium': (col, _light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Near-black background */}
            <rect width="80" height="44" rx="3" fill="#0f0f13" />
            {/* Left: badge + white title + accent price + pill bullets */}
            <rect x="4" y="5" width="12" height="3" rx="1.5" fill={col} opacity="0.9" />
            <rect x="4" y="11" width="32" height="3.5" rx="1" fill="white" opacity="0.85" />
            <rect x="4" y="16" width="24" height="3.5" rx="1" fill="white" opacity="0.6" />
            <rect x="4" y="22" width="18" height="4" rx="1.5" fill={col} opacity="1" />
            {/* Pill bullets */}
            <rect x="4" y="29" width="28" height="4" rx="2" fill={col} opacity="0.2" stroke={col} strokeWidth="0.5" />
            <rect x="4" y="35" width="24" height="4" rx="2" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            {/* Right: image with purple glow halo */}
            <ellipse cx="60" cy="22" rx="16" ry="16" fill={col} opacity="0.18" />
            <ellipse cx="60" cy="22" rx="11" ry="11" fill={col} opacity="0.15" />
            <rect x="48" y="9" width="24" height="26" rx="3" fill="#1a1025" stroke={col} strokeWidth="0.8" />
            <circle cx="60" cy="19" r="5" fill={col} opacity="0.3" />
            <path d="M49 34 l5-5 4 3 4-5 5 7H49z" fill={col} opacity="0.25" />
            {/* Thumb strip under image — dark */}
            <rect x="48" y="37" width="5" height="4" rx="1" fill={col} opacity="0.3" stroke={col} strokeWidth="0.4" />
            <rect x="55" y="37" width="5" height="4" rx="1" fill={col} opacity="0.2" stroke={col} strokeWidth="0.4" />
            <rect x="62" y="37" width="5" height="4" rx="1" fill={col} opacity="0.2" stroke={col} strokeWidth="0.4" />
            <rect x="69" y="37" width="5" height="4" rx="1" fill={col} opacity="0.2" stroke={col} strokeWidth="0.4" />
        </svg>
    ),

    // ── Wide Showcase: cinematic image full-width top, 3-col details row below
    'hp-wide-showcase': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            {/* Badge centred at top */}
            <rect x="28" y="3" width="24" height="3.5" rx="1.75" fill={col} opacity="0.7" />
            {/* Cinematic wide image — 16:7 ratio */}
            <rect x="3" y="9" width="74" height="18" rx="2.5" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2 1" />
            <circle cx="40" cy="17" r="5" fill={col} opacity="0.2" />
            <path d="M5 26 l8-6 6 4 7-5 7 7H5z" fill={col} opacity="0.18" />
            {/* Thumb row under wide image */}
            {[0, 1, 2, 3].map(i => (
                <rect key={i} x={3 + i * 19} y="29" width="16" height="5" rx="1" fill={col} opacity="0.15" />
            ))}
            {/* 3-col divider lines */}
            <line x1="28" y1="37" x2="28" y2="47" stroke={col} strokeWidth="0.5" opacity="0.25" />
            <line x1="54" y1="37" x2="54" y2="47" stroke={col} strokeWidth="0.5" opacity="0.25" />
            {/* Col 1: price */}
            <rect x="3" y="37" width="8" height="5" rx="1.5" fill={col} opacity="0.9" />
            <rect x="3" y="44" width="14" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Col 2: title + bullets */}
            <rect x="31" y="37" width="20" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="31" y="41" width="18" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="31" y="45" width="16" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Col 3: trust icons */}
            <rect x="57" y="37" width="18" height="2" rx="1" fill={col} opacity="0.25" />
            <rect x="57" y="41" width="16" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="57" y="45" width="14" height="2" rx="1" fill={col} opacity="0.18" />
        </svg>
    ),

    // ── single_image: classic-frame ──────────────────────────────────────────
    'classic-frame': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} stroke={col} strokeWidth="0.75" />
            <rect x="6" y="5" width="68" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="10" y="8" width="60" height="26" rx="2" fill={col} opacity="0.12" />
            <rect x="18" y="40" width="44" height="3" rx="1.5" fill={col} opacity="0.3" />
        </svg>
    ),
    // ── single_image: modern-elevated ────────────────────────────────────────
    'modern-elevated': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="4" width="64" height="34" rx="6" fill={col} opacity="0.15" />
            <rect x="6" y="2" width="64" height="34" rx="6" fill="#ffffff" />
            <rect x="6" y="2" width="64" height="34" rx="6" fill={col} opacity="0.1" />
            <rect x="18" y="40" width="44" height="3" rx="1.5" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── single_image: polaroid-classic ───────────────────────────────────────
    'polaroid-classic': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="14" y="2" width="52" height="44" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.75" />
            <rect x="18" y="5" width="44" height="28" rx="2" fill={col} opacity="0.15" />
            <rect x="20" y="36" width="40" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="28" y="41" width="24" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── single_image: edge-to-edge ───────────────────────────────────────────
    'edge-to-edge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={col} opacity="0.15" />
            <rect width="80" height="48" rx="5" fill={col} opacity="0.1" />
            <rect x="0" y="30" width="80" height="18" rx="0" fill={col} opacity="0.5" />
            <rect x="16" y="36" width="48" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="24" y="41" width="32" height="2" rx="1" fill="#ffffff" opacity="0.5" />
        </svg>
    ),
    // ── single_image: neon-accent-frame ──────────────────────────────────────
    'neon-accent-frame': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill="#1e1535" />
            <defs>
                <linearGradient id="neon-border" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect x="8" y="4" width="64" height="34" rx="6" stroke="url(#neon-border)" strokeWidth="1.5" fill="#0f0b1e" />
            <rect x="12" y="7" width="56" height="28" rx="4" fill={col} opacity="0.12" />
            <rect x="22" y="42" width="36" height="2.5" rx="1.25" fill={col} opacity="0.35" />
        </svg>
    ),
    // ── single_image: soft-minimalist ────────────────────────────────────────
    'soft-minimalist': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="6" y="3" width="68" height="34" rx="12" fill="#ffffff" stroke={col} strokeWidth="0.75" opacity="0.7" />
            <rect x="10" y="6" width="60" height="28" rx="10" fill={col} opacity="0.08" />
            <rect x="20" y="41" width="40" height="3" rx="1.5" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── logo_bar: flat-row ────────────────────────────────────────────────────
    'flat-row': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="72" height="4" rx="2" fill={col} opacity="0.2" />
            <rect x="4" y="14" width="72" height="26" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="20" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="36" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="52" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="66" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="8" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="24" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="40" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="56" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── logo_bar: pill-labels ─────────────────────────────────────────────────
    'pill-labels': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="72" height="3" rx="1.5" fill={col} opacity="0.2" />
            <rect x="3" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="22" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="41" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="60" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="6" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="6" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="25" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="25" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="44" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="44" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="63" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="63" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
        </svg>
    ),
    // ── logo_bar: divider-strip ───────────────────────────────────────────────
    'divider-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="30" height="4" rx="2" fill={col} opacity="0.5" />
            <rect x="4" y="14" width="72" height="24" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.7" />
            <rect x="22" y="14" width="1" height="24" fill={col} opacity="0.18" />
            <rect x="40" y="14" width="1" height="24" fill={col} opacity="0.18" />
            <rect x="58" y="14" width="1" height="24" fill={col} opacity="0.18" />
            <rect x="9" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="27" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="45" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="63" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── logo_bar: card-grid ───────────────────────────────────────────────────
    'lb-card-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="4" width="72" height="3" rx="1.5" fill={col} opacity="0.2" />
            <rect x="3" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="22" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="41" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="60" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="6" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="25" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="44" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="63" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="3" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="22" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="41" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="60" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="5" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
            <rect x="24" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
            <rect x="43" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
            <rect x="62" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
        </svg>
    ),
    // ── logo_bar: icon-label-column ───────────────────────────────────────────
    'icon-label-column': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="2" height="36" rx="1" fill={col} opacity="0.7" />
            <rect x="9" y="10" width="22" height="5" rx="2.5" fill={col} opacity="0.7" />
            <rect x="9" y="19" width="18" height="3" rx="1.5" fill={col} opacity="0.35" />
            <rect x="9" y="25" width="20" height="2.5" rx="1.25" fill={col} opacity="0.25" />
            <rect x="36" y="6" width="1" height="36" fill={col} opacity="0.15" />
            <rect x="40" y="8" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="54" y="8" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="68" y="8" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="40" y="22" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="54" y="22" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="68" y="22" width="10" height="10" rx="2" fill={col} opacity="0.18" />
        </svg>
    ),
    // ── logo_bar: dark-band ───────────────────────────────────────────────────
    'dark-band': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill="#1e1535" />
            <rect x="14" y="6" width="52" height="3" rx="1.5" fill="white" opacity="0.2" />
            <rect x="3" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="22" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="41" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="60" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="6" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="25" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="44" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="63" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="5" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="24" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="43" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="62" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
        </svg>
    ),
    // ── logo_bar: gradient-showcase ───────────────────────────────────────────
    'gradient-showcase': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="lgb-grad" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="5" fill="url(#lgb-grad)" />
            <rect x="12" y="6" width="56" height="3" rx="1.5" fill="#b8fa33" opacity="0.8" />
            <rect x="3" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="22" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="41" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="60" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="6" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            <rect x="25" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            <rect x="44" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            <rect x="63" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
        </svg>
    ),
    // ── logo_bar: trust-ticker ────────────────────────────────────────────────
    'trust-ticker': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="17" width="72" height="14" rx="4" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.7" />
            <rect x="4" y="17" width="16" height="14" rx="4" fill={col} opacity="0.85" />
            <rect x="6" y="21" width="12" height="6" rx="2" fill="white" opacity="0.85" />
            <rect x="24" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="35" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="46" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="57" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="33" y="23" width="1" height="2" rx="0.5" fill={col} opacity="0.3" />
            <rect x="44" y="23" width="1" height="2" rx="0.5" fill={col} opacity="0.3" />
            <rect x="55" y="23" width="1" height="2" rx="0.5" fill={col} opacity="0.3" />
        </svg>
    ),
    // ── logo_bar: spotlight-cards ─────────────────────────────────────────────
    'spotlight-cards': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="lgb-spot" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="72" height="3" rx="1.5" fill={col} opacity="0.3" />
            <rect x="3" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="22" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="41" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="60" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="3" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="22" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="41" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="60" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="4" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="23" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="42" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="61" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="5" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="24" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="43" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="62" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── logo_bar: glass-mosaic ────────────────────────────────────────────────
    'glass-mosaic': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="lgb-glass" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="5" fill="url(#lgb-glass)" />
            <rect x="0" y="0" width="80" height="48" rx="5" fill="white" opacity="0.06" />
            <rect x="14" y="5" width="52" height="4" rx="2" fill="white" opacity="0.7" />
            <rect x="20" y="11" width="40" height="2" rx="1" fill="white" opacity="0.25" />
            <circle cx="12" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="12" cy="32" r="7" fill="white" opacity="0.12" />
            <circle cx="30" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="30" cy="32" r="7" fill="white" opacity="0.12" />
            <circle cx="48" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="48" cy="32" r="7" fill="white" opacity="0.12" />
            <circle cx="66" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="66" cy="32" r="7" fill="white" opacity="0.12" />
            <rect x="5" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="23" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="41" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="59" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="10" y="44" width="60" height="2" rx="1" fill="white" opacity="0.2" />
        </svg>
    ),

    // ── seller_info: authority-split ─────────────────────────────────────────
    'authority-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect width="80" height="48" rx="3" stroke={col} strokeWidth="0.6" fill="none" />
            <circle cx="14" cy="20" r="9" fill={light} stroke={col} strokeWidth="0.8" />
            <rect x="6" y="31" width="16" height="3.5" rx="1.75" fill={col} opacity="0.7" />
            <rect x="28" y="11" width="30" height="3" rx="1" fill={col} opacity="0.85" />
            <rect x="28" y="17" width="22" height="2" rx="1" fill={col} opacity="0.25" />
            <rect x="28" y="23" width="26" height="2" rx="1" fill={col} opacity="0.4" />
            <rect x="28" y="29" width="18" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── seller_info: inline-ribbon ────────────────────────────────────────────
    'inline-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect x="0" y="17" width="3" height="14" rx="1.5" fill={col} />
            <rect x="7" y="21" width="10" height="2.5" rx="1" fill={col} opacity="0.85" />
            <rect x="21" y="21" width="2" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="27" y="21" width="16" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="47" y="21" width="2" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="53" y="21" width="20" height="2.5" rx="1" fill={col} opacity="0.6" />
        </svg>
    ),

    // ── seller_info: metrics-grid ─────────────────────────────────────────────
    'metrics-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect x="3" y="4" width="36" height="3" rx="1" fill={col} opacity="0.8" />
            <rect x="3" y="9" width="24" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="3" y="16" width="22" height="28" rx="2" fill={light} stroke={col} strokeWidth="0.5" />
            <rect x="3" y="16" width="22" height="3" rx="2" fill={col} opacity="0.6" />
            <rect x="29" y="16" width="22" height="28" rx="2" fill={light} stroke={col} strokeWidth="0.5" />
            <rect x="29" y="16" width="22" height="3" rx="2" fill="#b8fa33" opacity="0.8" />
            <rect x="55" y="16" width="22" height="28" rx="2" fill={light} stroke={col} strokeWidth="0.5" />
            <rect x="55" y="16" width="22" height="3" rx="2" fill="#10b981" opacity="0.7" />
        </svg>
    ),

    // ── seller_info: dark-executive ───────────────────────────────────────────
    'dark-executive': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect width="80" height="48" rx="3" stroke={col} strokeWidth="0.8" fill="none" />
            <circle cx="14" cy="24" r="8" fill={col} opacity="0.3" stroke={col} strokeWidth="0.8" />
            <rect x="27" y="17" width="24" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="27" y="23" width="18" height="2" rx="1" fill="#ffffff" opacity="0.3" />
            <rect x="27" y="28" width="22" height="3" rx="1.5" fill="none" stroke="#b8fa33" strokeWidth="0.6" />
            <rect x="58" y="20" width="18" height="8" rx="2" fill="none" stroke={col} strokeWidth="0.8" />
        </svg>
    ),

    // ── seller_info: storefront-split ─────────────────────────────────────────
    'storefront-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect width="80" height="48" rx="3" stroke={col} strokeWidth="0.5" fill="none" />
            <rect x="3" y="6" width="10" height="10" rx="2" fill={col} opacity="0.25" />
            <rect x="3" y="19" width="30" height="2.5" rx="1" fill={col} opacity="0.8" />
            <rect x="3" y="24" width="22" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="3" y="29" width="26" height="2" rx="1" fill={col} opacity="0.4" />
            <line x1="40" y1="6" x2="40" y2="42" stroke={col} strokeWidth="0.5" opacity="0.25" />
            <rect x="44" y="8" width="14" height="2" rx="1" fill={col} opacity="0.3" />
            <rect x="44" y="14" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="44" y="20" width="30" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="44" y="26" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="44" y="32" width="26" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── seller_info: glass-card ───────────────────────────────────────────────
    'glass-card': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="gc-grad" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            {/* Gradient border wrapper */}
            <rect width="80" height="48" rx="6" fill="url(#gc-grad)" />
            {/* Frosted inner card */}
            <rect x="2" y="2" width="76" height="44" rx="5" fill="rgba(255,255,255,0.88)" />
            {/* Centered avatar circle */}
            <circle cx="40" cy="14" r="7" fill={col} opacity="0.85" stroke="#ffffff" strokeWidth="1.5" />
            {/* Store name bar */}
            <rect x="22" y="24" width="36" height="3" rx="1" fill={col} opacity="0.8" />
            {/* Tagline bar */}
            <rect x="26" y="29" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Feedback pill */}
            <rect x="14" y="33" width="52" height="5" rx="2.5" fill={col} opacity="0.75" />
            {/* Trust footer strip */}
            <rect x="6" y="40" width="68" height="4" rx="2" fill={col} opacity="0.08" stroke={col} strokeWidth="0.4" />
        </svg>
    ),

    // ── seller_info: vertical-profile ─────────────────────────────────────────
    'vertical-profile': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <circle cx="40" cy="13" r="8" fill={light} stroke={col} strokeWidth="0.8" />
            <rect x="28" y="24" width="24" height="3" rx="1" fill={col} opacity="0.8" />
            <rect x="32" y="29" width="16" height="2" rx="1" fill={col} opacity="0.25" />
            <rect x="36" y="33" width="8" height="1.5" rx="0.75" fill={col} opacity="0.6" />
            <rect x="26" y="37" width="28" height="5" rx="2.5" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
        </svg>
    ),

    // ── seller_info: trust-ribbon-duo ─────────────────────────────────────────
    'trust-ribbon-duo': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect width="80" height="20" rx="3" fill={col} opacity="0.85" />
            <rect x="4" y="7" width="28" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="60" y="6.5" width="16" height="4" rx="2" fill="#b8fa33" opacity="0.9" />
            <rect x="4" y="26" width="16" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
            <rect x="23" y="26" width="14" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
            <rect x="40" y="26" width="16" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
            <rect x="59" y="26" width="17" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
        </svg>
    ),

    // ── seller_info: spotlight-banner ─────────────────────────────────────────
    'spotlight-banner': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="sb-bg" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} />
                    <stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="3" fill="url(#sb-bg)" />
            <rect x="4" y="13" width="32" height="4" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="4" y="21" width="22" height="2.5" rx="1" fill="#ffffff" opacity="0.35" />
            <rect x="4" y="27" width="20" height="2.5" rx="1" fill="#b8fa33" opacity="0.8" />
            <rect x="56" y="16" width="20" height="10" rx="3" fill="#ffffff" opacity="0.9" />
        </svg>
    ),

    // ── seller_info: compact-card-row ─────────────────────────────────────────
    'compact-card-row': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect x="2" y="6" width="23" height="36" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="2" y="39" width="23" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="5" y="12" width="8" height="8" rx="4" fill={light} />
            <rect x="5" y="23" width="16" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="5" y="28" width="12" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="29" y="6" width="23" height="36" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="29" y="39" width="23" height="3" rx="1.5" fill="#b8fa33" opacity="0.8" />
            <rect x="32" y="12" width="8" height="8" rx="4" fill={light} />
            <rect x="32" y="23" width="16" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="32" y="28" width="12" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="56" y="6" width="23" height="36" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="56" y="39" width="23" height="3" rx="1.5" fill="#10b981" opacity="0.7" />
            <rect x="59" y="12" width="8" height="8" rx="4" fill={light} />
            <rect x="59" y="23" width="16" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="59" y="28" width="12" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── bundle_deal: tri-tier-columns ─────────────────────────────────────────
    'tri-tier-columns': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="30" y="8" width="20" height="32" rx="2" fill="rgba(255,255,255,0.10)" />
            <rect x="30" y="8" width="20" height="3" rx="1" fill="#b8fa33" />
            <rect x="55" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="32" y="16" width="16" height="3" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="7" y="22" width="16" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
            <rect x="32" y="22" width="16" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
            <rect x="57" y="22" width="16" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
        </svg>
    ),

    // ── bundle_deal: horizontal-ribbon ────────────────────────────────────────
    'horizontal-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="16" width="70" height="16" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="8" y="21" width="14" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="30" y="21" width="12" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="46" y="20" width="10" height="5" rx="2.5" fill="#b8fa33" />
            <rect x="62" y="21" width="11" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <text x="25" y="27" fontFamily="Arial" fontSize="7" fill="rgba(255,255,255,0.2)">❯</text>
            <text x="58" y="27" fontFamily="Arial" fontSize="7" fill="rgba(255,255,255,0.2)">❯</text>
        </svg>
    ),

    // ── bundle_deal: stacked-rows ─────────────────────────────────────────────
    'stacked-rows': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="9" width="2" height="9" rx="1" fill="#b8fa33" opacity="0.3" />
            <rect x="5" y="21" width="4" height="9" rx="1" fill="#b8fa33" opacity="0.6" />
            <rect x="5" y="33" width="6" height="9" rx="1" fill="#b8fa33" />
            <rect x="12" y="11" width="42" height="5" rx="1.5" fill="rgba(255,255,255,0.15)" />
            <rect x="12" y="23" width="42" height="5" rx="1.5" fill="rgba(255,255,255,0.2)" />
            <rect x="12" y="35" width="42" height="5" rx="1.5" fill="rgba(255,255,255,0.28)" />
            <rect x="58" y="23" width="17" height="4" rx="2" fill="#b8fa33" />
            <rect x="58" y="35" width="17" height="4" rx="2" fill="#b8fa33" />
        </svg>
    ),

    // ── bundle_deal: floating-pill-grid ───────────────────────────────────────
    'floating-pill-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="11" width="20" height="28" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <rect x="30" y="11" width="20" height="28" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <rect x="56" y="11" width="20" height="28" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <rect x="31" y="15" width="18" height="5" rx="2.5" fill="#b8fa33" />
            <rect x="57" y="15" width="18" height="5" rx="2.5" fill="#b8fa33" />
            <rect x="6" y="26" width="16" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="32" y="26" width="16" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="58" y="26" width="16" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
        </svg>
    ),

    // ── bundle_deal: split-hero ───────────────────────────────────────────────
    'split-hero': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <line x1="32" y1="6" x2="32" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            <rect x="5" y="13" width="22" height="5" rx="1.5" fill="rgba(255,255,255,0.4)" />
            <rect x="5" y="21" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="5" y="27" width="20" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="36" y="9" width="39" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="36" y="20" width="39" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="36" y="31" width="39" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="57" y="23" width="14" height="3" rx="1.5" fill="#b8fa33" />
            <rect x="57" y="34" width="14" height="3" rx="1.5" fill="#b8fa33" />
        </svg>
    ),

    // ── bundle_deal: minimal-monochrome ───────────────────────────────────────
    'minimal-monochrome': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="6" y="12" width="68" height="26" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="30" y1="12" x2="30" y2="38" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="54" y1="12" x2="54" y2="38" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="9" y="21" width="16" height="4" rx="1.5" fill="#e5e7eb" />
            <rect x="33" y="21" width="14" height="4" rx="1.5" fill="#111827" />
            <rect x="57" y="21" width="14" height="4" rx="1.5" fill="#111827" />
            <rect x="32" y="29" width="16" height="4" rx="2" fill="#7530fb" />
            <rect x="56" y="29" width="16" height="4" rx="2" fill="#7530fb" />
        </svg>
    ),

    // ── bundle_deal: executive-highlight ─────────────────────────────────────
    'executive-highlight': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="12" width="20" height="26" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <rect x="30" y="12" width="20" height="26" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <rect x="56" y="8" width="20" height="30" rx="2" fill="rgba(255,255,255,0.08)" stroke="#b8fa33" strokeWidth="0.8" />
            <rect x="56" y="8" width="20" height="3" rx="1" fill="#b8fa33" />
            <rect x="58" y="16" width="16" height="4" rx="2" fill="#b8fa33" opacity="0.7" />
            <rect x="7" y="24" width="14" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="33" y="24" width="14" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="58" y="24" width="16" height="4" rx="1.5" fill="rgba(255,255,255,0.45)" />
            <rect x="58" y="32" width="14" height="3" rx="1" fill="#b8fa33" />
        </svg>
    ),

    // ── bundle_deal: dark-escalator ───────────────────────────────────────────
    'dark-escalator': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.04)" />
            <rect x="30" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.08)" />
            <rect x="56" y="11" width="20" height="26" rx="2" fill="#b8fa33" />
            <rect x="7" y="22" width="14" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="33" y="22" width="14" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="59" y="22" width="14" height="3" rx="1" fill="rgba(0,0,0,0.3)" />
        </svg>
    ),

    // ── bundle_deal: trophy-podium ────────────────────────────────────────────
    'trophy-podium': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="33" width="20" height="12" rx="2" fill="#6b7280" />
            <rect x="30" y="18" width="20" height="27" rx="2" fill="#f59e0b" />
            <rect x="56" y="27" width="20" height="18" rx="2" fill="#94a3b8" />
            <text x="14" y="30" fontFamily="Arial" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.5)">🥉</text>
            <text x="40" y="15" fontFamily="Arial" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.8)">🥇</text>
            <text x="66" y="24" fontFamily="Arial" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.6)">🥈</text>
        </svg>
    ),

    // ── bundle_deal: countdown-strip ──────────────────────────────────────────
    'countdown-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="0" y="0" width="80" height="10" rx="3" fill="#dc2626" />
            <rect x="6" y="2" width="68" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="5" y="15" width="70" height="26" rx="2" fill="rgba(255,255,255,0.05)" />
            <rect x="9" y="23" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="31" y="23" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="53" y="23" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="33" y="30" width="14" height="4" rx="2" fill="#b8fa33" />
            <rect x="55" y="30" width="14" height="4" rx="2" fill="#b8fa33" />
        </svg>
    ),

    // ── price_tag: classic-strike ─────────────────────────────────────────────
    'classic-strike': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="17" width="16" height="3" rx="1.5" fill="#94a3b8" />
            <line x1="6" y1="18.5" x2="24" y2="18.5" stroke="#64748b" strokeWidth="1" />
            <rect x="7" y="24" width="12" height="2" rx="1" fill="#cbd5e1" />
            <rect x="29" y="17" width="22" height="14" rx="2" fill="#1e1535" />
            <rect x="56" y="18" width="18" height="12" rx="2" fill="#dc2626" />
            <rect x="59" y="22" width="12" height="4" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: minimalist-inline ──────────────────────────────────────────
    'minimalist-inline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="6" y="20" width="7" height="8" rx="1" fill="#94a3b8" opacity="0.6" />
            <rect x="16" y="17" width="20" height="14" rx="2" fill="#1e1535" />
            <line x1="40" y1="24" x2="52" y2="24" stroke="#94a3b8" strokeWidth="1" />
            <rect x="40" y="22.5" width="12" height="3" rx="1" fill="#94a3b8" />
            <rect x="56" y="19" width="18" height="10" rx="5" fill="#16a34a" />
            <rect x="59" y="22.5" width="12" height="3" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: stacked-deal-card ──────────────────────────────────────────
    'stacked-deal-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="25" y="8" width="30" height="3" rx="1.5" fill="#94a3b8" />
            <line x1="38" y1="9.5" x2="55" y2="9.5" stroke="#64748b" strokeWidth="0.8" />
            <rect x="23" y="14" width="34" height="13" rx="2" fill="#1e1535" />
            <rect x="0" y="34" width="80" height="14" rx="0" fill="#1e1535" />
            <rect x="18" y="39" width="44" height="4" rx="2" fill="#b8fa33" />
        </svg>
    ),

    // ── price_tag: discount-badge-pill ────────────────────────────────────────
    'discount-badge-pill': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="12" width="18" height="3" rx="1.5" fill="#94a3b8" />
            <rect x="7" y="18" width="30" height="13" rx="2" fill="#1e1535" />
            <rect x="7" y="34" width="22" height="3" rx="1" fill="#16a34a" />
            <rect x="46" y="15" width="28" height="18" rx="9" fill="#8fff00" />
            <rect x="51" y="22" width="18" height="4" rx="2" fill="#0a0d08" />
        </svg>
    ),

    // ── price_tag: dual-tone-split ────────────────────────────────────────────
    'dual-tone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M50 0H77C78.6569 0 80 1.34315 80 3V45C80 46.6569 78.6569 48 77 48H50V0Z" fill="#1e1535" />
            <rect x="8" y="12" width="18" height="3" rx="1.5" fill="#94a3b8" />
            <rect x="8" y="18" width="28" height="12" rx="2" fill="#1e1535" />
            <rect x="8" y="33" width="24" height="3" rx="1" fill="#cbd5e1" />
            <rect x="56" y="14" width="18" height="3" rx="1" fill="rgba(255,255,255,0.6)" />
            <rect x="54" y="21" width="22" height="9" rx="2" fill="#b8fa33" />
            <rect x="57" y="34" width="16" height="3" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: urgency-banner ─────────────────────────────────────────────
    'urgency-banner': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#fecaca" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="11" rx="0" fill="#dc2626" />
            <rect x="14" y="4" width="52" height="3" rx="1.5" fill="#ffffff" />
            <rect x="7" y="18" width="14" height="3" rx="1" fill="#dc2626" />
            <rect x="7" y="24" width="28" height="12" rx="2" fill="#1e1535" />
            <rect x="50" y="22" width="24" height="14" rx="3" fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.8" />
            <rect x="54" y="27" width="16" height="4" rx="1" fill="#b91c1c" />
        </svg>
    ),

    // ── price_tag: wholesale-b2b ──────────────────────────────────────────────
    'wholesale-b2b': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="12" fill="#f1f5f9" />
            <line x1="20" y1="0" x2="20" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="44" y1="0" x2="44" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="62" y1="0" x2="62" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="24" width="12" height="3" rx="1" fill="#94a3b8" />
            <rect x="23" y="20" width="18" height="11" rx="2" fill="#0f172a" />
            <rect x="47" y="22" width="12" height="4" rx="1" fill="#16a34a" />
            <rect x="65" y="21" width="12" height="8" rx="2" fill="#e0f2fe" />
        </svg>
    ),

    // ── price_tag: modern-glassmorphism ───────────────────────────────────────
    'modern-glassmorphism': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
            <rect x="6" y="8" width="22" height="4" rx="2" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="0.5" />
            <rect x="6" y="16" width="32" height="13" rx="2" fill="#1e1b4b" />
            <rect x="6" y="33" width="24" height="3" rx="1.5" fill="#6366f1" />
            <rect x="48" y="16" width="26" height="16" rx="3" fill="#4338ca" />
            <rect x="52" y="22" width="18" height="4" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: high-contrast-flash ────────────────────────────────────────
    'high-contrast-flash': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#0f172a" />
            <rect x="0" y="0" width="3.5" height="48" rx="1.5" fill="#8fff00" />
            <rect x="8" y="8" width="24" height="4" rx="1" fill="#8fff00" />
            <rect x="8" y="16" width="34" height="13" rx="2" fill="#ffffff" />
            <rect x="8" y="33" width="26" height="3" rx="1" fill="#8fff00" />
            <rect x="52" y="15" width="22" height="17" rx="3" fill="none" stroke="#8fff00" strokeWidth="0.8" strokeDasharray="2 1" />
            <rect x="56" y="21" width="14" height="5" rx="1" fill="#8fff00" />
        </svg>
    ),

    // ── price_tag: elite-luxury ───────────────────────────────────────────────
    'elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#d1d5db" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="2.5" fill="#d97706" />
            <rect x="26" y="8" width="28" height="3" rx="1.5" fill="#d97706" />
            <rect x="22" y="15" width="36" height="12" rx="2" fill="#111827" />
            <rect x="18" y="31" width="44" height="2.5" rx="1" fill="#9ca3af" />
            <line x1="14" y1="38" x2="66" y2="38" stroke="#e5e7eb" strokeWidth="0.8" />
        </svg>
    ),

    // ── store_footer: classic-dark-band ───────────────────────────────────────
    'classic-dark-band': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="14" y="15" width="10" height="3" rx="1.5" fill="#ffffff" />
            <circle cx="28" cy="16.5" r="1" fill="rgba(255,255,255,0.4)" />
            <rect x="32" y="15" width="10" height="3" rx="1.5" fill="#ffffff" />
            <circle cx="46" cy="16.5" r="1" fill="rgba(255,255,255,0.4)" />
            <rect x="50" y="15" width="10" height="3" rx="1.5" fill="#ffffff" />
            <rect x="20" y="27" width="40" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
        </svg>
    ),

    // ── store_footer: footer-minimalist-inline ────────────────────────────────
    'footer-minimalist-inline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="22" width="22" height="3" rx="1" fill="#94a3b8" />
            <rect x="42" y="22" width="8" height="3" rx="1" fill="#475569" />
            <rect x="54" y="22" width="8" height="3" rx="1" fill="#475569" />
            <rect x="66" y="22" width="8" height="3" rx="1" fill="#475569" />
        </svg>
    ),

    // ── store_footer: two-column-brand-split ──────────────────────────────────
    'two-column-brand-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="8" y="14" width="16" height="5" rx="1.5" fill="#ffffff" />
            <rect x="26" y="15" width="10" height="3" rx="1.5" fill="#b8fa33" />
            <rect x="8" y="24" width="22" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="46" y="15" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
            <rect x="62" y="15" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
            <rect x="54" y="23" width="14" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
        </svg>
    ),

    // ── store_footer: trust-secure-payment-bar ────────────────────────────────
    'trust-secure-payment-bar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="18" y="10" width="12" height="3" rx="1" fill="#1e293b" />
            <rect x="34" y="10" width="12" height="3" rx="1" fill="#1e293b" />
            <rect x="50" y="10" width="12" height="3" rx="1" fill="#1e293b" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="0" y="20.5" width="80" height="27.5" fill="#ffffff" />
            <rect x="8" y="29" width="14" height="4" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.5" />
            <rect x="26" y="29" width="14" height="4" rx="1.5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="0.5" />
            <rect x="48" y="29" width="24" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── store_footer: multi-row-navigation-hub ────────────────────────────────
    'multi-row-navigation-hub': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="10" y="8" width="16" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
            <rect x="30" y="8" width="18" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
            <rect x="52" y="8" width="16" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
            <rect x="18" y="19" width="12" height="3" rx="1" fill="#b8fa33" />
            <rect x="34" y="19" width="12" height="3" rx="1" fill="#b8fa33" />
            <rect x="50" y="19" width="12" height="3" rx="1" fill="#b8fa33" />
            <line x1="16" y1="29" x2="64" y2="29" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <rect x="22" y="34" width="36" height="2.5" rx="1" fill="rgba(255,255,255,0.5)" />
        </svg>
    ),

    // ── store_footer: executive-dark-accent ───────────────────────────────────
    'executive-dark-accent': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="20" y="8" width="40" height="12" rx="3" fill="#b8fa33" />
            <rect x="28" y="12.5" width="24" height="3" rx="1" fill="#1e1535" />
            <rect x="16" y="26" width="12" height="3" rx="1" fill="#ffffff" />
            <rect x="34" y="26" width="12" height="3" rx="1" fill="#ffffff" />
            <rect x="52" y="26" width="12" height="3" rx="1" fill="#ffffff" />
            <rect x="24" y="36" width="32" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
        </svg>
    ),

    // ── store_footer: footer-modern-glass ─────────────────────────────────────
    'footer-modern-glass': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <circle cx="12" cy="18" r="2" fill="#4ade80" />
            <rect x="17" y="16" width="16" height="4" rx="1" fill="#ffffff" />
            <rect x="10" y="26" width="22" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
            <rect x="42" y="16" width="14" height="6" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="60" y="16" width="14" height="6" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </svg>
    ),

    // ── store_footer: wholesale-compliance ────────────────────────────────────
    'wholesale-compliance': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="18" fill="#f1f5f9" />
            <rect x="8" y="5" width="32" height="3" rx="1" fill="#0f172a" />
            <rect x="8" y="10" width="64" height="2" rx="1" fill="#94a3b8" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="8" y="27" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="24" y="27" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="46" y="27" width="26" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── store_footer: spotlight-policy ────────────────────────────────────────
    'spotlight-policy': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="10" y="8" width="14" height="8" rx="2" fill="#eff6ff" />
            <rect x="33" y="8" width="14" height="8" rx="2" fill="#eff6ff" />
            <rect x="56" y="8" width="14" height="8" rx="2" fill="#eff6ff" />
            <rect x="9" y="19" width="16" height="2" rx="1" fill="#1e1535" />
            <rect x="32" y="19" width="16" height="2" rx="1" fill="#1e1535" />
            <rect x="55" y="19" width="16" height="2" rx="1" fill="#1e1535" />
            <line x1="0" y1="26" x2="80" y2="26" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="0" y="26.5" width="80" height="21.5" fill="#f8fafc" />
            <rect x="12" y="34" width="12" height="3" rx="1" fill="#1e1535" />
            <rect x="28" y="34" width="12" height="3" rx="1" fill="#1e1535" />
            <rect x="48" y="34" width="22" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── store_footer: footer-elite-luxury ─────────────────────────────────────
    'footer-elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="2.5" fill="#d97706" />
            <rect x="26" y="8" width="28" height="2.5" rx="1" fill="#d97706" />
            <line x1="18" y1="16" x2="62" y2="16" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="22" y="21" width="10" height="3" rx="1" fill="#111827" />
            <rect x="36" y="21" width="8" height="3" rx="1" fill="#111827" />
            <rect x="48" y="21" width="10" height="3" rx="1" fill="#111827" />
            <line x1="18" y1="29" x2="62" y2="29" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="25" y="35" width="30" height="2" rx="1" fill="#9ca3af" />
        </svg>
    ),

    // ── category_nav: cat-classic-dark ────────────────────────────────────────
    'cat-classic-dark': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="6" y="21" width="12" height="6" rx="2" fill="#b8fa33" />
            <rect x="22" y="22.5" width="12" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="38" y="22.5" width="14" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="56" y="22.5" width="16" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
        </svg>
    ),

    // ── category_nav: cat-minimalist-divider ──────────────────────────────────
    'cat-minimalist-divider': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="14" x2="80" y2="14" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="34" x2="80" y2="34" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="22" width="12" height="3" rx="1.5" fill="#475569" />
            <line x1="24" y1="21" x2="24" y2="26" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="28" y="22" width="12" height="3" rx="1.5" fill="#475569" />
            <line x1="44" y1="21" x2="44" y2="26" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="48" y="22" width="12" height="3" rx="1.5" fill="#475569" />
            <line x1="64" y1="21" x2="64" y2="26" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="68" y="22" width="8" height="3" rx="1.5" fill="#475569" />
        </svg>
    ),

    // ── category_nav: cat-pill-badge ──────────────────────────────────────────
    'cat-pill-badge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="18" width="16" height="12" rx="6" fill="#b8fa33" />
            <rect x="24" y="18" width="16" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
            <rect x="43" y="18" width="16" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
            <rect x="62" y="18" width="14" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
        </svg>
    ),

    // ── category_nav: cat-subtle-underline ────────────────────────────────────
    'cat-subtle-underline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="20" width="14" height="4" rx="1" fill="#7530fb" />
            <rect x="8" y="28" width="14" height="2" rx="1" fill="#7530fb" />
            <rect x="28" y="20" width="14" height="4" rx="1" fill="#1e293b" opacity="0.6" />
            <rect x="48" y="20" width="14" height="4" rx="1" fill="#1e293b" opacity="0.6" />
            <rect x="68" y="20" width="8" height="4" rx="1" fill="#1e293b" opacity="0.6" />
        </svg>
    ),

    // ── category_nav: cat-two-tier-grid ───────────────────────────────────────
    'cat-two-tier-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="6" y="11" width="18" height="10" rx="3" fill="#b8fa33" />
            <rect x="28" y="11" width="22" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="54" y="11" width="20" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="10" y="26" width="20" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="34" y="26" width="20" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="58" y="26" width="16" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
        </svg>
    ),

    // ── category_nav: cat-icon-hybrid ─────────────────────────────────────────
    'cat-icon-hybrid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="16" width="22" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <circle cx="9" cy="24" r="2.5" fill="#3b82f6" />
            <rect x="14" y="22.5" width="9" height="3" rx="1" fill="#1e1535" />
            <rect x="29" y="16" width="22" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <circle cx="34" cy="24" r="2.5" fill="#10b981" />
            <rect x="39" y="22.5" width="9" height="3" rx="1" fill="#1e1535" />
            <rect x="54" y="16" width="22" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <circle cx="59" cy="24" r="2.5" fill="#f59e0b" />
            <rect x="64" y="22.5" width="9" height="3" rx="1" fill="#1e1535" />
        </svg>
    ),

    // ── category_nav: cat-modern-glass ────────────────────────────────────────
    'cat-modern-glass': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <rect x="6" y="18" width="16" height="12" rx="3" fill="#b8fa33" />
            <rect x="26" y="18" width="15" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="45" y="18" width="15" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="64" y="18" width="11" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </svg>
    ),

    // ── category_nav: cat-wholesale-jump ──────────────────────────────────────
    'cat-wholesale-jump': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="20" y1="10" x2="20" y2="38" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="40" y1="10" x2="40" y2="38" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="60" y1="10" x2="60" y2="38" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="0" y="10" width="20" height="28" fill="#e2e8f0" />
            <rect x="4" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="24" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="44" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="64" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
        </svg>
    ),

    // ── category_nav: cat-high-contrast-flash ─────────────────────────────────
    'cat-high-contrast-flash': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#dc2626" />
            <rect x="6" y="21" width="14" height="6" rx="2" fill="#ffffff" />
            <rect x="24" y="22.5" width="12" height="3" rx="1.5" fill="#ffffff" />
            <rect x="40" y="22.5" width="14" height="3" rx="1.5" fill="#ffffff" />
            <rect x="58" y="22.5" width="16" height="3" rx="1.5" fill="#ffffff" />
        </svg>
    ),

    // ── category_nav: cat-elite-luxury ────────────────────────────────────────
    'cat-elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#d97706" strokeWidth="1" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#d97706" strokeWidth="1" />
            <circle cx="40" cy="18" r="1.5" fill="#d97706" />
            <rect x="12" y="24" width="12" height="3" rx="1" fill="#111827" />
            <circle cx="30" cy="25.5" r="1" fill="#d97706" />
            <rect x="35" y="24" width="10" height="3" rx="1" fill="#111827" />
            <circle cx="50" cy="25.5" r="1" fill="#d97706" />
            <rect x="55" y="24" width="12" height="3" rx="1" fill="#111827" />
        </svg>
    ),

    // ── seasonal_banner: 10 Styles ──────────────────────────────────────────
    'seasonal-festive-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#dc2626" />
            <rect x="28" y="10" width="24" height="4" rx="2" fill="#fef08a" opacity="0.9" />
            <rect x="14" y="18" width="52" height="6" rx="2" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1.5" fill="#ffffff" opacity="0.8" />
        </svg>
    ),

    'seasonal-neon-cyber': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" />
            <rect x="2" y="2" width="76" height="44" rx="3" stroke="#22d3ee" strokeWidth="1.5" />
            <rect x="24" y="10" width="32" height="4" rx="1" fill="#22d3ee" opacity="0.85" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="22" y="28" width="36" height="4" rx="1" fill="#22d3ee" opacity="0.75" />
        </svg>
    ),

    'seasonal-dualtone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e1b4b" />
            <rect width="28" height="48" rx="4" fill="#ec4899" />
            <rect x="5" y="15" width="18" height="8" rx="2" fill="#ffffff" />
            <rect x="7" y="26" width="14" height="4" rx="1" fill="#ffffff" opacity="0.8" />
            <rect x="34" y="14" width="38" height="5" rx="1.5" fill="#f472b6" />
            <rect x="34" y="23" width="40" height="6" rx="1.5" fill="#ffffff" />
            <rect x="34" y="32" width="32" height="4" rx="1" fill="#ffffff" opacity="0.7" />
        </svg>
    ),

    'seasonal-countdown-urgency': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#111827" />
            <rect x="1" y="1" width="78" height="46" rx="3" stroke="#ef4444" strokeWidth="1" />
            <rect x="8" y="14" width="32" height="6" rx="1.5" fill="#ffffff" />
            <rect x="8" y="24" width="26" height="4" rx="1" fill="#9ca3af" />
            {/* 3 countdown boxes */}
            <rect x="44" y="16" width="9" height="15" rx="2" fill="#1f2937" stroke="#ef4444" strokeWidth="0.8" />
            <circle cx="55.5" cy="21" r="0.8" fill="#ef4444" />
            <circle cx="55.5" cy="26" r="0.8" fill="#ef4444" />
            <rect x="58" y="16" width="9" height="15" rx="2" fill="#1f2937" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="69.5" cy="21" r="0.8" fill="#ef4444" />
            <circle cx="69.5" cy="26" r="0.8" fill="#ef4444" />
            <rect x="71" y="16" width="7" height="15" rx="2" fill="#1f2937" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
    ),

    'seasonal-minimalist-elegance': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <rect x="8" y="8" width="64" height="32" rx="2" stroke="#b45309" strokeWidth="0.8" strokeOpacity="0.4" />
            <rect x="28" y="14" width="24" height="3" rx="1" fill="#b45309" />
            <rect x="18" y="21" width="44" height="5" rx="1" fill="#1c1917" />
            <rect x="24" y="29" width="32" height="3" rx="1" fill="#78716c" />
        </svg>
    ),

    'seasonal-glassmorphism-frost': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="6" width="68" height="36" rx="4" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.25" />
            <rect x="28" y="12" width="24" height="4" rx="2" fill="#93c5fd" />
            <rect x="14" y="20" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="29" width="40" height="4" rx="1" fill="#ffffff" fillOpacity="0.7" />
        </svg>
    ),

    'seasonal-gradient-burst': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="gb-thumb" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="0.5" stopColor="#ec4899" />
                    <stop offset="1" stopColor="#f97316" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="4" fill="url(#gb-thumb)" />
            <rect x="26" y="9" width="28" height="4" rx="2" fill="#000000" fillOpacity="0.3" stroke="#ffffff" strokeWidth="0.6" />
            <rect x="12" y="18" width="56" height="7" rx="1.5" fill="#ffffff" />
            <rect x="20" y="29" width="40" height="4" rx="1" fill="#ffffff" fillOpacity="0.85" />
        </svg>
    ),

    'seasonal-wholesale-strobe': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
            <path d="M12 28L18 16L24 28Z" fill="#78350f" />
            <rect x="28" y="13" width="30" height="4" rx="1" fill="#78350f" />
            <rect x="28" y="20" width="44" height="6" rx="1.5" fill="#0f172a" />
            <rect x="28" y="29" width="38" height="4" rx="1" fill="#451a03" />
        </svg>
    ),

    'seasonal-gift-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="6" fill="#065f46" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
            <rect x="26" y="9" width="28" height="4" rx="2" fill="#ffffff" fillOpacity="0.2" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#a7f3d0" />
        </svg>
    ),

    'seasonal-elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <line x1="0" y1="4" x2="80" y2="4" stroke="#d4af37" strokeWidth="1" />
            <line x1="0" y1="44" x2="80" y2="44" stroke="#d4af37" strokeWidth="1" />
            <circle cx="40" cy="12" r="1.5" fill="#d4af37" />
            <rect x="12" y="19" width="56" height="5" rx="1" fill="#f8fafc" />
            <rect x="22" y="28" width="36" height="3" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── money_back: 10 Styles ───────────────────────────────────────────────
    'mb-trust-shield-green': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <circle cx="40" cy="14" r="6" fill="#dcfce7" stroke="#86efac" strokeWidth="0.8" />
            <path d="M38 14L40 16L43 12" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" />
            <rect x="18" y="24" width="44" height="5" rx="1.5" fill="#166534" />
            <rect x="22" y="32" width="36" height="3" rx="1" fill="#15803d" opacity="0.8" />
        </svg>
    ),

    'mb-minimalist-outline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="8" y="14" width="16" height="20" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <path d="M13 24L15.5 26.5L19 21.5" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="30" y="14" width="22" height="3" rx="1" fill="#0284c7" />
            <rect x="30" y="21" width="42" height="5" rx="1.5" fill="#0f172a" />
            <rect x="30" y="29" width="36" height="3" rx="1" fill="#64748b" />
        </svg>
    ),

    'mb-bold-dark-trust': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="24" y="9" width="32" height="4" rx="2" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="0.8" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#94a3b8" />
        </svg>
    ),

    'mb-dualtone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e1b4b" />
            <rect width="28" height="48" rx="4" fill="#6366f1" />
            <rect x="5" y="16" width="18" height="7" rx="1.5" fill="#ffffff" />
            <rect x="7" y="26" width="14" height="3" rx="1" fill="#ffffff" opacity="0.8" />
            <rect x="34" y="14" width="28" height="3" rx="1" fill="#a5b4fc" />
            <rect x="34" y="21" width="40" height="5" rx="1.5" fill="#ffffff" />
            <rect x="34" y="30" width="34" height="3" rx="1" fill="#ffffff" opacity="0.75" />
        </svg>
    ),

    'mb-golden-elite': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <rect x="8" y="7" width="64" height="34" rx="2" stroke="#b45309" strokeWidth="0.8" strokeOpacity="0.4" />
            <rect x="26" y="13" width="28" height="3" rx="1" fill="#b45309" />
            <rect x="16" y="20" width="48" height="5" rx="1" fill="#1c1917" />
            <rect x="22" y="28" width="36" height="3" rx="1" fill="#78716c" />
        </svg>
    ),

    'mb-glassmorphism-trust': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="6" width="68" height="36" rx="4" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.25" />
            <rect x="26" y="11" width="28" height="4" rx="2" fill="#38bdf8" />
            <rect x="14" y="19" width="52" height="5" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="3" rx="1" fill="#ffffff" fillOpacity="0.7" />
        </svg>
    ),

    'mb-gradient-trust': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="gt-thumb" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0d9488" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="4" fill="url(#gt-thumb)" />
            <rect x="26" y="9" width="28" height="4" rx="2" fill="#000000" fillOpacity="0.25" stroke="#ffffff" strokeWidth="0.6" />
            <rect x="12" y="18" width="56" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#ffffff" fillOpacity="0.85" />
        </svg>
    ),

    'mb-risk-free-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="20" cy="24" r="8" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
            <path d="M17 24L19.5 26.5L23.5 21.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="34" y="14" width="22" height="3" rx="1" fill="#0f172a" />
            <rect x="34" y="21" width="38" height="5" rx="1.5" fill="#0f172a" />
            <rect x="34" y="29" width="30" height="3" rx="1" fill="#64748b" />
        </svg>
    ),

    'mb-neon-secure': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" />
            <rect x="2" y="2" width="76" height="44" rx="3" stroke="#10b981" strokeWidth="1.5" />
            <rect x="22" y="9" width="36" height="4" rx="1" fill="#10b981" opacity="0.85" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#10b981" opacity="0.75" />
        </svg>
    ),

    'mb-verified-banner': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="0" y1="2" x2="80" y2="2" stroke="#0284c7" strokeWidth="2.5" />
            <circle cx="16" cy="24" r="5" fill="#0284c7" />
            <path d="M14 24L15.5 25.5L18.5 22" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            <rect x="26" y="14" width="36" height="3" rx="1" fill="#0284c7" />
            <rect x="26" y="20" width="46" height="5" rx="1.5" fill="#0f172a" />
            <rect x="26" y="28" width="40" height="3" rx="1" fill="#475569" />
        </svg>
    ),

    // ── free_shipping: 10 Styles ─────────────────────────────────────────────
    'ship-express-courier-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="8" y="10" width="22" height="4" rx="1.5" fill="#f59e0b" />
            <rect x="8" y="18" width="36" height="5" rx="1" fill="#ffffff" />
            <rect x="8" y="27" width="28" height="3" rx="1" fill="#94a3b8" />
            <rect x="50" y="12" width="22" height="24" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="53" y="17" width="16" height="3" rx="0.5" fill="#f59e0b" />
            <rect x="54" y="23" width="14" height="2.5" rx="0.5" fill="#38bdf8" />
        </svg>
    ),

    'ship-two-tone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M 0 4 Q 0 0 4 0 L 26 0 L 26 48 L 4 48 Q 0 48 0 44 Z" fill="#2563eb" />
            <rect x="6" y="11" width="14" height="3" rx="0.8" fill="#bfdbfe" />
            <rect x="4" y="17" width="18" height="9" rx="1" fill="#ffffff" />
            <rect x="32" y="11" width="36" height="4" rx="1" fill="#1e3a8a" />
            <rect x="32" y="18" width="42" height="3" rx="0.5" fill="#64748b" />
            <circle cx="34" cy="26" r="1.5" fill="#16a34a" />
            <rect x="38" y="25" width="32" height="2" rx="0.5" fill="#334155" />
            <circle cx="34" cy="33" r="1.5" fill="#16a34a" />
            <rect x="38" y="32" width="28" height="2" rx="0.5" fill="#334155" />
        </svg>
    ),

    'ship-warehouse-direct-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="0" y="0" width="80" height="3" fill="#2563eb" />
            <rect x="6" y="7" width="26" height="3" rx="0.8" fill="#2563eb" />
            <rect x="52" y="6" width="22" height="4" rx="1.5" fill="#16a34a" />
            <rect x="5" y="14" width="21" height="26" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="15.5" cy="20" r="2.5" fill="#2563eb" />
            <rect x="8" y="26" width="15" height="3" rx="0.5" fill="#0f172a" />
            <rect x="29.5" y="14" width="21" height="26" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="40" cy="20" r="2.5" fill="#2563eb" />
            <rect x="32.5" y="26" width="15" height="3" rx="0.5" fill="#0f172a" />
            <rect x="54" y="14" width="21" height="26" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="64.5" cy="20" r="2.5" fill="#2563eb" />
            <rect x="57" y="26" width="15" height="3" rx="0.5" fill="#0f172a" />
        </svg>
    ),

    'ship-minimalist-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="16" y="18" width="48" height="4" rx="1" fill="#0f172a" />
            <rect x="12" y="26" width="56" height="2.5" rx="0.5" fill="#64748b" />
        </svg>
    ),

    'ship-parcel-post-ticket': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fefce8" stroke="#b45309" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="16" cy="24" r="8" fill="none" stroke="#b45309" strokeWidth="1" />
            <line x1="10" y1="24" x2="22" y2="24" stroke="#b45309" strokeWidth="0.8" />
            <line x1="28" y1="10" x2="28" y2="38" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2 1.5" />
            <rect x="32" y="12" width="22" height="3" rx="0.5" fill="#b45309" />
            <rect x="32" y="18" width="28" height="4" rx="1" fill="#451a03" />
            <rect x="32" y="27" width="20" height="4" rx="0.5" fill="#92400e" opacity="0.6" />
            <rect x="62" y="14" width="13" height="20" rx="2" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />
            <rect x="64" y="20" width="9" height="3" rx="0.5" fill="#b45309" />
        </svg>
    ),

    'ship-stepper-tracker-bar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="24" y="8" width="32" height="3.5" rx="1" fill="#0f172a" />
            <line x1="14" y1="22" x2="66" y2="22" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="15" cy="22" r="3.5" fill="#16a34a" />
            <circle cx="32" cy="22" r="3.5" fill="#16a34a" />
            <circle cx="48" cy="22" r="3.5" fill="#2563eb" />
            <circle cx="65" cy="22" r="3.5" fill="#0f172a" />
            <rect x="8" y="30" width="14" height="2.5" rx="0.5" fill="#334155" />
            <rect x="25" y="30" width="14" height="2.5" rx="0.5" fill="#334155" />
            <rect x="41" y="30" width="14" height="2.5" rx="0.5" fill="#334155" />
            <rect x="58" y="30" width="14" height="2.5" rx="0.5" fill="#16a34a" />
        </svg>
    ),

    'ship-heavy-duty-cargo': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#facc15" strokeWidth="1" />
            <rect x="0" y="0" width="80" height="4" fill="#facc15" />
            <rect x="8" y="14" width="42" height="6" rx="1" fill="#facc15" />
            <rect x="8" y="24" width="36" height="3" rx="0.5" fill="#d4d4d8" />
            <rect x="56" y="14" width="18" height="20" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
            <rect x="59" y="20" width="12" height="3" rx="0.5" fill="#facc15" />
        </svg>
    ),

    'ship-global-transit-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0c4a6e" />
            <rect x="24" y="8" width="32" height="3.5" rx="1" fill="#38bdf8" />
            <rect x="6" y="16" width="32" height="22" rx="2" fill="#075985" stroke="#0284c7" strokeWidth="0.6" />
            <rect x="9" y="20" width="16" height="3" rx="0.5" fill="#38bdf8" />
            <rect x="9" y="26" width="24" height="3.5" rx="0.5" fill="#ffffff" />
            <rect x="42" y="16" width="32" height="22" rx="2" fill="#075985" stroke="#0284c7" strokeWidth="0.6" />
            <rect x="45" y="20" width="18" height="3" rx="0.5" fill="#38bdf8" />
            <rect x="45" y="26" width="24" height="3.5" rx="0.5" fill="#ffffff" />
        </svg>
    ),

    'ship-urgent-cutoff-bar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#064e3b" stroke="#059669" strokeWidth="1" />
            <circle cx="8" cy="14" r="2.5" fill="#10b981" />
            <rect x="14" y="12" width="24" height="3.5" rx="0.5" fill="#34d399" />
            <rect x="7" y="19" width="38" height="5" rx="1" fill="#ffffff" />
            <rect x="7" y="28" width="30" height="3" rx="0.5" fill="#a7f3d0" />
            <rect x="49" y="11" width="25" height="25" rx="3" fill="#022c22" stroke="#047857" strokeWidth="0.8" />
            <rect x="52" y="16" width="19" height="2.5" rx="0.5" fill="#6ee7b7" />
            <rect x="52" y="22" width="19" height="6" rx="1" fill="#ffffff" />
        </svg>
    ),

    'ship-white-glove-guarantee': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#b45309" strokeWidth="1" />
            <rect x="5" y="5" width="70" height="38" rx="2" fill="none" stroke="#b45309" strokeWidth="0.7" />
            <circle cx="40" cy="12" r="2.5" fill="#b45309" />
            <rect x="26" y="17" width="28" height="3" rx="0.5" fill="#b45309" />
            <rect x="16" y="23" width="48" height="5" rx="1" fill="#1c1917" />
            <rect x="22" y="32" width="36" height="2.5" rx="0.5" fill="#78716c" />
        </svg>
    ),

    // ── Limited Time Offer Variants ─────────────────────────────────────
    'lto-flash-sale-ticker': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#dc2626" />
            <rect x="5" y="8" width="24" height="6" rx="2" fill="#991b1b" />
            <rect x="5" y="18" width="38" height="5" rx="1" fill="#ffffff" />
            <rect x="5" y="27" width="30" height="3" rx="1" fill="#fee2e2" />
            {/* 4 Digital Timer Boxes */}
            <rect x="47" y="15" width="6" height="12" rx="1" fill="#18181b" />
            <rect x="55" y="15" width="6" height="12" rx="1" fill="#18181b" />
            <rect x="63" y="15" width="6" height="12" rx="1" fill="#18181b" />
            <rect x="71" y="15" width="6" height="12" rx="1" fill="#18181b" />
        </svg>
    ),

    'lto-clearance-stamped-tag': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" />
            {/* Stamp Circle */}
            <circle cx="16" cy="24" r="10" stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="2 1" />
            <rect x="31" y="12" width="22" height="4" rx="1" fill="#fee2e2" />
            <rect x="31" y="20" width="28" height="4" rx="1" fill="#1c1917" />
            <rect x="31" y="27" width="20" height="3" rx="1" fill="#78716c" />
            {/* Right Tag Border */}
            <line x1="62" y1="6" x2="62" y2="42" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="65" y="18" width="11" height="8" rx="2" fill="#b91c1c" />
        </svg>
    ),

    'lto-midnight-vip-exclusive': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1.2" />
            {/* Gold Diamond Crest */}
            <polygon points="12,12 15,16 12,20 9,16" fill="#d4af37" />
            <rect x="18" y="13" width="25" height="4" rx="1" fill="#d4af37" />
            <rect x="9" y="22" width="44" height="4" rx="1" fill="#fafafa" />
            <rect x="9" y="29" width="34" height="3" rx="1" fill="#a1a1aa" />
            {/* Gold Badge */}
            <rect x="58" y="14" width="17" height="18" rx="2" fill="#18181b" stroke="#d4af37" strokeWidth="1" />
        </svg>
    ),

    'lto-industrial-hazard-alert': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            {/* Top Hazard Caution Stripe */}
            <rect width="80" height="6" fill="#f59e0b" />
            <line x1="10" y1="0" x2="16" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="25" y1="0" x2="31" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="40" y1="0" x2="46" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="55" y1="0" x2="61" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="70" y1="0" x2="76" y2="6" stroke="#000000" strokeWidth="1.5" />
            <rect x="6" y="14" width="20" height="5" rx="1" fill="#f59e0b" />
            <rect x="6" y="23" width="46" height="4" rx="1" fill="#f4f4f5" />
            <rect x="6" y="31" width="38" height="3" rx="1" fill="#a1a1aa" />
            <rect x="58" y="16" width="16" height="18" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
        </svg>
    ),

    'lto-circular-coupon-clip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Scissor Marker */}
            <text x="5" y="27" fontSize="11" fill="#0284c7">✂</text>
            <rect x="18" y="12" width="18" height="4" rx="1" fill="#e0f2fe" />
            <rect x="18" y="20" width="34" height="4" rx="1" fill="#0f172a" />
            <rect x="18" y="27" width="28" height="3" rx="1" fill="#64748b" />
            {/* Barcode lines */}
            <line x1="57" y1="8" x2="57" y2="40" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="62" y1="20" x2="62" y2="34" stroke="#334155" strokeWidth="1" />
            <line x1="65" y1="20" x2="65" y2="34" stroke="#334155" strokeWidth="1.5" />
            <line x1="68" y1="20" x2="68" y2="34" stroke="#334155" strokeWidth="1" />
            <line x1="71" y1="20" x2="71" y2="34" stroke="#334155" strokeWidth="2" />
            <line x1="75" y1="20" x2="75" y2="34" stroke="#334155" strokeWidth="1" />
        </svg>
    ),

    'lto-live-scarcity-meter': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <circle cx="9" cy="14" r="2.5" fill="#f97316" />
            <rect x="15" y="11" width="26" height="5" rx="1.5" fill="#f97316" />
            <rect x="6" y="21" width="42" height="4" rx="1" fill="#ffffff" />
            <rect x="6" y="28" width="36" height="3" rx="1" fill="#94a3b8" />
            {/* Scarcity meter card */}
            <rect x="52" y="12" width="23" height="23" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="55" y="18" width="17" height="4" rx="2" fill="#334155" />
            <rect x="55" y="18" width="14" height="4" rx="2" fill="#f97316" />
        </svg>
    ),

    'lto-multibuy-volume-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="12" fill="#f8fafc" />
            <rect x="6" y="4" width="30" height="4" rx="1" fill="#2563eb" />
            {/* 3 Tier Columns */}
            <rect x="5" y="16" width="21" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="15" width="22" height="28" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.2" />
            <rect x="54" y="16" width="21" height="26" rx="2" fill="#f0fdf4" stroke="#16a34a" strokeWidth="0.8" />
        </svg>
    ),

    'lto-scandinavian-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="8" y="13" width="26" height="3" rx="0.5" fill="#71717a" />
            <rect x="8" y="20" width="40" height="4" rx="0.5" fill="#18181b" />
            <rect x="8" y="28" width="34" height="2.5" rx="0.5" fill="#a1a1aa" />
            <line x1="56" y1="12" x2="56" y2="36" stroke="#d4d4d8" strokeWidth="0.8" />
            <rect x="60" y="21" width="14" height="4" rx="0.5" fill="#18181b" />
        </svg>
    ),

    'lto-cyber-terminal-deal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            {/* Top Terminal Bar */}
            <rect width="80" height="8" fill="#0f172a" />
            <circle cx="6" cy="4" r="1.5" fill="#ef4444" />
            <circle cx="11" cy="4" r="1.5" fill="#f59e0b" />
            <circle cx="16" cy="4" r="1.5" fill="#10b981" />
            <rect x="6" y="14" width="28" height="4" rx="1" fill="#06b6d4" />
            <rect x="6" y="22" width="46" height="4" rx="1" fill="#f1f5f9" />
            <rect x="6" y="30" width="34" height="3" rx="1" fill="#10b981" />
            <rect x="58" y="16" width="16" height="17" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
        </svg>
    ),

    'lto-holiday-gift-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#064e3b" stroke="#fbbf24" strokeWidth="1" />
            {/* Ribbon Icon */}
            <text x="6" y="28" fontSize="12">🎀</text>
            <rect x="22" y="11" width="22" height="4" rx="1" fill="#022c22" stroke="#fbbf24" strokeWidth="0.8" />
            <rect x="22" y="19" width="34" height="4" rx="1" fill="#ffffff" />
            <rect x="22" y="27" width="28" height="3" rx="1" fill="#d1fae5" />
            <rect x="58" y="15" width="16" height="18" rx="2" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />
        </svg>
    ),

    // ── Satisfaction Guarantee Variants ──────────────────────────────────
    'sg-golden-crest-emblem': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#d4af37" strokeWidth="1" />
            <circle cx="16" cy="24" r="10" stroke="#d4af37" strokeWidth="1.2" fill="#111827" />
            <text x="16" y="27" fontSize="10" textAnchor="middle" fill="#d4af37">★</text>
            <rect x="31" y="13" width="22" height="3.5" rx="1" fill="#d4af37" />
            <rect x="31" y="20" width="30" height="4.5" rx="1" fill="#ffffff" />
            <rect x="31" y="28" width="24" height="3" rx="1" fill="#94a3b8" />
            <line x1="64" y1="12" x2="64" y2="36" stroke="#1e293b" strokeWidth="1" />
            <line x1="68" y1="18" x2="76" y2="18" stroke="#d4af37" strokeWidth="1.5" />
            <line x1="68" y1="24" x2="76" y2="24" stroke="#10b981" strokeWidth="1.5" />
        </svg>
    ),

    'sg-five-star-authority-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Rating Box */}
            <rect x="5" y="10" width="18" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <text x="14" y="23" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0f172a">5.0</text>
            <text x="14" y="32" fontSize="5" textAnchor="middle" fill="#f59e0b">★★★★★</text>
            <rect x="27" y="12" width="20" height="4" rx="1" fill="#fef3c7" />
            <rect x="27" y="20" width="34" height="4.5" rx="1" fill="#0f172a" />
            <rect x="27" y="28" width="26" height="3" rx="1" fill="#64748b" />
            <rect x="65" y="15" width="11" height="18" rx="2" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="0.8" />
        </svg>
    ),

    'sg-split-contrast-promise': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Left 38% Dark Split */}
            <rect width="32" height="48" rx="4" fill="#0f172a" />
            <rect x="5" y="12" width="16" height="3" rx="1" fill="#10b981" />
            <rect x="5" y="19" width="22" height="4" rx="1" fill="#ffffff" />
            <rect x="5" y="27" width="18" height="3" rx="1" fill="#94a3b8" />
            {/* Right Checklist */}
            <circle cx="38" cy="16" r="2" fill="#10b981" />
            <line x1="43" y1="16" x2="72" y2="16" stroke="#0f172a" strokeWidth="2" />
            <circle cx="38" cy="24" r="2" fill="#10b981" />
            <line x1="43" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="2" />
            <circle cx="38" cy="32" r="2" fill="#10b981" />
            <line x1="43" y1="32" x2="70" y2="32" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'sg-engraved-warranty-ticket': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="4" y="4" width="72" height="40" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 1.5" />
            <rect x="8" y="12" width="22" height="3" rx="0.5" fill="#64748b" />
            <rect x="8" y="19" width="38" height="4.5" rx="1" fill="#1c1917" />
            <rect x="8" y="27" width="30" height="3" rx="1" fill="#475569" />
            <rect x="56" y="13" width="15" height="22" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="0.8" />
        </svg>
    ),

    'sg-handshake-seller-pledge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#e7e5e4" strokeWidth="1" />
            <text x="7" y="28" fontSize="13">🤝</text>
            <rect x="22" y="11" width="16" height="3" rx="1" fill="#7530fb" />
            <rect x="22" y="18" width="36" height="4" rx="1" fill="#1c1917" />
            <rect x="22" y="26" width="30" height="3" rx="1" fill="#57534e" />
            <line x1="22" y1="34" x2="40" y2="34" stroke="#78716c" strokeWidth="1.5" />
            <rect x="62" y="13" width="13" height="22" rx="2" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1" />
        </svg>
    ),

    'sg-three-pillar-shield-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="11" fill="#f8fafc" />
            <rect x="6" y="4" width="28" height="3.5" rx="1" fill="#2563eb" />
            {/* 3 Pillars */}
            <rect x="5" y="15" width="21" height="27" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="14" width="22" height="29" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.2" />
            <rect x="54" y="15" width="21" height="27" rx="2" fill="#f0fdf4" stroke="#86efac" strokeWidth="0.8" />
        </svg>
    ),

    'sg-minimalist-swiss-rule': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="8" y="13" width="24" height="3" rx="0.5" fill="#71717a" />
            <rect x="8" y="20" width="38" height="4" rx="0.5" fill="#18181b" />
            <rect x="8" y="28" width="32" height="2.5" rx="0.5" fill="#71717a" />
            <line x1="56" y1="12" x2="56" y2="36" stroke="#d4d4d8" strokeWidth="0.8" />
            <rect x="60" y="21" width="14" height="4" rx="0.5" fill="#18181b" />
        </svg>
    ),

    'sg-industrial-field-tested': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            <rect x="6" y="11" width="24" height="5" rx="1" fill="#f59e0b" />
            <rect x="6" y="20" width="46" height="4" rx="1" fill="#f4f4f5" />
            <rect x="6" y="28" width="38" height="3" rx="1" fill="#a1a1aa" />
            <rect x="58" y="13" width="16" height="22" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
            <line x1="62" y1="20" x2="70" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
    ),

    'sg-money-back-speed-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e1b4b" />
            <rect x="6" y="9" width="20" height="4.5" rx="1.5" fill="#312e81" stroke="#4338ca" strokeWidth="0.8" />
            <rect x="6" y="18" width="44" height="5" rx="1" fill="#ffffff" />
            <rect x="6" y="27" width="36" height="3.5" rx="1" fill="#c7d2fe" />
            <rect x="56" y="14" width="18" height="20" rx="3" fill="#ffffff" />
            <rect x="59" y="20" width="12" height="3" rx="1" fill="#1e1b4b" />
            <rect x="60" y="25" width="10" height="2" rx="0.5" fill="#4338ca" />
        </svg>
    ),

    'sg-white-glove-concierge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#161324" stroke="#fbbf24" strokeWidth="1" />
            <text x="6" y="27" fontSize="12" fill="#fbbf24">✦</text>
            <rect x="18" y="11" width="22" height="4" rx="1" fill="#231d38" stroke="#fbbf24" strokeWidth="0.8" />
            <rect x="18" y="19" width="36" height="4" rx="1" fill="#ffffff" />
            <rect x="18" y="27" width="28" height="3" rx="1" fill="#d8b4fe" />
            <rect x="58" y="14" width="16" height="20" rx="2" fill="#231d38" stroke="#fbbf24" strokeWidth="1" />
        </svg>
    ),

    // ── Condition Badge Variants ─────────────────────────────────────────
    'cond-inspected-grade-pill': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="11" width="26" height="6" rx="3" fill="#16a34a" />
            <rect x="6" y="20" width="38" height="4.5" rx="1" fill="#0f172a" />
            <rect x="6" y="28" width="30" height="3" rx="1" fill="#64748b" />
            {/* QC Stamp */}
            <circle cx="65" cy="24" r="10" stroke="#16a34a" strokeWidth="1.2" strokeDasharray="2 1" />
            <text x="65" y="26" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#16a34a">QC</text>
        </svg>
    ),

    'cond-cosmetic-score-meter': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="11" width="20" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <text x="15" y="21" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#2563eb">A+</text>
            <text x="15" y="29" fontSize="5" textAnchor="middle" fill="#f59e0b">★★★★★</text>
            <rect x="29" y="14" width="22" height="3" rx="1" fill="#2563eb" />
            <rect x="29" y="21" width="32" height="4" rx="1" fill="#0f172a" />
            <rect x="29" y="28" width="26" height="3" rx="1" fill="#64748b" />
            <rect x="65" y="14" width="10" height="20" rx="1.5" fill="#eff6ff" />
        </svg>
    ),

    'cond-factory-sealed-security': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect width="80" height="6" fill="#022c22" />
            <line x1="12" y1="3" x2="68" y2="3" stroke="#10b981" strokeWidth="1" strokeDasharray="3 1" />
            <rect x="6" y="13" width="24" height="4" rx="1" fill="#064e3b" stroke="#10b981" strokeWidth="0.6" />
            <rect x="6" y="21" width="40" height="4.5" rx="1" fill="#ffffff" />
            <rect x="6" y="29" width="34" height="3" rx="1" fill="#94a3b8" />
            <rect x="58" y="14" width="16" height="20" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
        </svg>
    ),

    'cond-collector-archive-tag': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 1.5" />
            <rect x="6" y="12" width="14" height="24" rx="2" fill="#ffffff" stroke="#b91c1c" strokeWidth="1" />
            <text x="13" y="24" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#b91c1c">9.4</text>
            <rect x="24" y="13" width="22" height="3" rx="0.5" fill="#78716c" />
            <rect x="24" y="20" width="32" height="4" rx="1" fill="#1c1917" />
            <rect x="24" y="28" width="26" height="3" rx="1" fill="#57534e" />
            <line x1="62" y1="8" x2="62" y2="40" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
    ),

    'cond-diagnostic-matrix-table': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="10" fill="#f8fafc" />
            <rect x="6" y="3.5" width="24" height="3" rx="1" fill="#0284c7" />
            {/* 4 Diagnostic Chips */}
            <rect x="4" y="15" width="16" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="22" y="15" width="16" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="40" y="15" width="16" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="58" y="15" width="18" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'cond-designer-luxury-report': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            <rect x="8" y="11" width="28" height="3" rx="0.5" fill="#d4af37" />
            <rect x="8" y="18" width="40" height="4" rx="0.5" fill="#fafafa" />
            <rect x="8" y="26" width="34" height="3" rx="0.5" fill="#a1a1aa" />
            <rect x="58" y="13" width="16" height="22" rx="2" fill="#18181b" stroke="#d4af37" strokeWidth="0.8" />
        </svg>
    ),

    'cond-mechanic-auto-tested': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            <text x="6" y="28" fontSize="12">⚙️</text>
            <rect x="22" y="10" width="22" height="4" rx="1" fill="#f59e0b" />
            <rect x="22" y="18" width="34" height="4" rx="1" fill="#f4f4f5" />
            <rect x="22" y="26" width="28" height="3" rx="1" fill="#a1a1aa" />
            <rect x="58" y="13" width="16" height="22" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
        </svg>
    ),

    'cond-open-box-complete-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e9d5ff" strokeWidth="1" />
            <text x="6" y="28" fontSize="12">📦</text>
            <rect x="22" y="10" width="22" height="4" rx="1" fill="#f3e8ff" />
            <rect x="22" y="18" width="34" height="4" rx="1" fill="#0f172a" />
            <rect x="22" y="26" width="28" height="3" rx="1" fill="#6b7280" />
            <line x1="58" y1="10" x2="58" y2="38" stroke="#f3e8ff" strokeWidth="1" />
            <rect x="62" y="16" width="12" height="16" rx="2" fill="#fdf4ff" />
        </svg>
    ),

    'cond-minimal-nordic-pill': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="8" y="12" width="26" height="3" rx="0.5" fill="#71717a" />
            <rect x="8" y="19" width="38" height="4" rx="0.5" fill="#18181b" />
            <rect x="8" y="27" width="32" height="2.5" rx="0.5" fill="#71717a" />
            <line x1="56" y1="10" x2="56" y2="38" stroke="#d4d4d8" strokeWidth="0.8" />
            <rect x="60" y="20" width="14" height="4" rx="0.5" fill="#18181b" />
        </svg>
    ),

    'cond-as-is-parts-honest': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffbeb" stroke="#fde68a" strokeWidth="1" />
            <text x="6" y="27" fontSize="11">⚠️</text>
            <rect x="20" y="10" width="24" height="4" rx="1" fill="#fee2e2" />
            <rect x="20" y="18" width="34" height="4" rx="1" fill="#78350f" />
            <rect x="20" y="26" width="28" height="3" rx="1" fill="#92400e" />
            <line x1="58" y1="8" x2="58" y2="40" stroke="#fcd34d" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="62" y="16" width="12" height="16" rx="2" fill="#fef2f2" />
        </svg>
    ),

    // ── Item Specifics Variants ──────────────────────────────────────────
    'is-dual-column-zebra-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="11" rx="4" fill="#0f172a" />
            <rect x="6" y="4" width="22" height="3.5" rx="1" fill="#2563eb" />
            {/* Zebra Rows */}
            <rect x="0" y="11" width="80" height="9" fill="#f8fafc" />
            <line x1="28" y1="11" x2="28" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="0" y="29" width="80" height="9" fill="#f8fafc" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="38" x2="80" y2="38" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="6" y1="15" x2="22" y2="15" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="15" x2="65" y2="15" stroke="#64748b" strokeWidth="1.5" />
            <line x1="6" y1="24" x2="20" y2="24" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="24" x2="58" y2="24" stroke="#64748b" strokeWidth="1.5" />
        </svg>
    ),

    'is-two-column-card-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="4" width="28" height="3" rx="1" fill="#2563eb" />
            {/* 4 Bento Micro Cards */}
            <rect x="4" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="4" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="8" y1="14" x2="20" y2="14" stroke="#64748b" strokeWidth="1" />
            <line x1="8" y1="20" x2="30" y2="20" stroke="#0f172a" strokeWidth="2" />
            <line x1="46" y1="14" x2="58" y2="14" stroke="#64748b" strokeWidth="1" />
            <line x1="46" y1="20" x2="68" y2="20" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'is-industrial-blueprint-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="9" fill="#1e293b" />
            <line x1="6" y1="4.5" x2="30" y2="4.5" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="0" y1="19" x2="80" y2="19" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="39" x2="80" y2="39" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="6" y1="14" x2="20" y2="14" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="14" x2="68" y2="14" stroke="#f8fafc" strokeWidth="1.5" />
            <line x1="6" y1="24" x2="18" y2="24" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="24" x2="60" y2="24" stroke="#f8fafc" strokeWidth="1.5" />
            <line x1="6" y1="34" x2="22" y2="34" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="34" x2="65" y2="34" stroke="#f8fafc" strokeWidth="1.5" />
        </svg>
    ),

    'is-boutique-hairline-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <line x1="8" y1="9" x2="36" y2="9" stroke="#18181b" strokeWidth="1.2" />
            <line x1="8" y1="19" x2="72" y2="19" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="8" y1="29" x2="72" y2="29" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="8" y1="39" x2="72" y2="39" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="8" y1="14" x2="24" y2="14" stroke="#71717a" strokeWidth="1" />
            <line x1="34" y1="14" x2="64" y2="14" stroke="#18181b" strokeWidth="1.5" />
            <line x1="8" y1="24" x2="20" y2="24" stroke="#71717a" strokeWidth="1" />
            <line x1="34" y1="24" x2="56" y2="24" stroke="#18181b" strokeWidth="1.5" />
            <line x1="8" y1="34" x2="26" y2="34" stroke="#71717a" strokeWidth="1" />
            <line x1="34" y1="34" x2="60" y2="34" stroke="#18181b" strokeWidth="1.5" />
        </svg>
    ),

    'is-stamped-manifest-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="5" y="4" width="70" height="8" fill="#f5f5f4" />
            <rect x="8" y="6.5" width="24" height="3" rx="0.5" fill="#b91c1c" />
            <line x1="8" y1="20" x2="72" y2="20" stroke="#d6d3d1" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="8" y1="30" x2="72" y2="30" stroke="#d6d3d1" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="8" y1="40" x2="72" y2="40" stroke="#d6d3d1" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="10" y1="16" x2="26" y2="16" stroke="#78716c" strokeWidth="1.2" />
            <line x1="36" y1="16" x2="68" y2="16" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="10" y1="26" x2="22" y2="26" stroke="#78716c" strokeWidth="1.2" />
            <line x1="36" y1="26" x2="60" y2="26" stroke="#1c1917" strokeWidth="1.5" />
        </svg>
    ),

    'is-pill-tag-cluster': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="6" y="4" width="22" height="3.5" rx="1" fill="#7530fb" />
            {/* Clustered Pill Badges */}
            <rect x="5" y="11" width="32" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="40" y="11" width="34" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="24" width="36" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="44" y="24" width="30" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="36" width="30" height="9" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="38" y="36" width="36" height="9" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'is-dark-terminal-console': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#070b12" stroke="#1e293b" strokeWidth="1" />
            {/* Terminal Window Header */}
            <rect width="80" height="7" fill="#0f172a" />
            <circle cx="5" cy="3.5" r="1.1" fill="#ef4444" />
            <circle cx="8" cy="3.5" r="1.1" fill="#f59e0b" />
            <circle cx="11" cy="3.5" r="1.1" fill="#10b981" />
            <line x1="16" y1="3.5" x2="38" y2="3.5" stroke="#64748b" strokeWidth="1" />
            <circle cx="74" cy="3.5" r="1" fill="#10b981" />
            {/* Command Subtitle */}
            <line x1="4" y1="10.5" x2="32" y2="10.5" stroke="#06b6d4" strokeWidth="1.5" />
            {/* 4 Modular HUD Telemetry Blocks */}
            <rect x="4" y="14" width="34" height="14" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="14" x2="38" y2="14" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="7" y1="18" x2="18" y2="18" stroke="#06b6d4" strokeWidth="1" />
            <line x1="7" y1="23" x2="28" y2="23" stroke="#f8fafc" strokeWidth="1.6" />
            <circle cx="34" cy="18" r="1" fill="#10b981" />

            <rect x="42" y="14" width="34" height="14" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="42" y1="14" x2="76" y2="14" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="45" y1="18" x2="56" y2="18" stroke="#06b6d4" strokeWidth="1" />
            <line x1="45" y1="23" x2="66" y2="23" stroke="#f8fafc" strokeWidth="1.6" />
            <circle cx="72" cy="18" r="1" fill="#10b981" />

            <rect x="4" y="30" width="34" height="13" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="30" x2="38" y2="30" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="7" y1="34" x2="16" y2="34" stroke="#06b6d4" strokeWidth="1" />
            <line x1="7" y1="38.5" x2="26" y2="38.5" stroke="#f8fafc" strokeWidth="1.6" />

            <rect x="42" y="30" width="34" height="13" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="42" y1="30" x2="76" y2="30" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="45" y1="34" x2="54" y2="34" stroke="#06b6d4" strokeWidth="1" />
            <line x1="45" y1="38.5" x2="64" y2="38.5" stroke="#f8fafc" strokeWidth="1.6" />
        </svg>
    ),

    'is-split-key-highlight-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* 2 Top Hero Spec Cards */}
            <rect x="5" y="5" width="33" height="15" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
            <rect x="42" y="5" width="33" height="15" rx="2" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1" />
            <line x1="8" y1="9" x2="18" y2="9" stroke="#2563eb" strokeWidth="1" />
            <line x1="8" y1="14" x2="30" y2="14" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="45" y1="9" x2="55" y2="9" stroke="#16a34a" strokeWidth="1" />
            <line x1="45" y1="14" x2="68" y2="14" stroke="#0f172a" strokeWidth="1.8" />
            {/* Table Below */}
            <rect x="5" y="24" width="70" height="19" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="5" y1="33" x2="75" y2="33" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'is-compact-three-column-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="8" fill="#f1f5f9" />
            <line x1="6" y1="4" x2="26" y2="4" stroke="#0284c7" strokeWidth="1.5" />
            {/* 3 Columns */}
            <line x1="27" y1="8" x2="27" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="54" y1="8" x2="54" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="21" x2="80" y2="21" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="34" x2="80" y2="34" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'is-luxury-gold-accent-band': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Outer Obsidian Frame with 18k Gold Border */}
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            {/* Inner Gold Hairline Inset */}
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Plaque Crest Header */}
            <rect x="2.5" y="2.5" width="75" height="9" fill="#141416" />
            <line x1="2.5" y1="11.5" x2="77.5" y2="11.5" stroke="#d4af37" strokeWidth="0.7" />
            <circle cx="40" cy="5.5" r="0.8" fill="#d4af37" />
            <line x1="26" y1="5.5" x2="36" y2="5.5" stroke="#d4af37" strokeWidth="0.7" />
            <line x1="44" y1="5.5" x2="54" y2="5.5" stroke="#d4af37" strokeWidth="0.7" />
            <line x1="22" y1="8.5" x2="58" y2="8.5" stroke="#ffffff" strokeWidth="1.2" />

            {/* 4 Luxury Dossier Cards (Roman Numerals I, II, III, IV) */}
            <rect x="5" y="14" width="33" height="14" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="5" y1="14" x2="5" y2="28" stroke="#d4af37" strokeWidth="1.5" />
            <text x="8" y="19" fontSize="4.5" fill="#d4af37" fontFamily="serif">I.</text>
            <line x1="14" y1="18" x2="26" y2="18" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="8" y1="23.5" x2="31" y2="23.5" stroke="#fafafa" strokeWidth="1.6" />

            <rect x="42" y="14" width="33" height="14" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="42" y1="14" x2="42" y2="28" stroke="#d4af37" strokeWidth="1.5" />
            <text x="45" y="19" fontSize="4.5" fill="#d4af37" fontFamily="serif">II.</text>
            <line x1="52" y1="18" x2="64" y2="18" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="45" y1="23.5" x2="68" y2="23.5" stroke="#fafafa" strokeWidth="1.6" />

            <rect x="5" y="30" width="33" height="13" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="5" y1="30" x2="5" y2="43" stroke="#d4af37" strokeWidth="1.5" />
            <text x="8" y="35" fontSize="4.5" fill="#d4af37" fontFamily="serif">III.</text>
            <line x1="16" y1="34" x2="26" y2="34" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="8" y1="39" x2="28" y2="39" stroke="#fafafa" strokeWidth="1.6" />

            <rect x="42" y="30" width="33" height="13" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="42" y1="30" x2="42" y2="43" stroke="#d4af37" strokeWidth="1.5" />
            <text x="45" y="35" fontSize="4.5" fill="#d4af37" fontFamily="serif">IV.</text>
            <line x1="54" y1="34" x2="64" y2="34" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="45" y1="39" x2="66" y2="39" stroke="#fafafa" strokeWidth="1.6" />
        </svg>
    ),

    // ── Authenticity Guarantee Variants ────────────────────────────────────
    'auth-ebay-blue-official-shield': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0053a0" stroke="#003d75" strokeWidth="1" />
            <circle cx="40" cy="11" r="5" fill="#ffffff" fillOpacity="0.2" />
            <path d="M40 7L43 10V14L40 16L37 14V10L40 7Z" fill="#38bdf8" />
            <rect x="18" y="19" width="44" height="4" rx="1" fill="#ffffff" />
            <rect x="22" y="25" width="36" height="2.5" rx="0.5" fill="#bae6fd" />
            <rect x="6" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.15" />
            <rect x="30" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.15" />
            <rect x="54" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.15" />
        </svg>
    ),

    'auth-luxury-atelier-wax-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
            <rect x="2.5" y="2.5" width="75" height="9" fill="#141416" />
            <line x1="2.5" y1="11.5" x2="77.5" y2="11.5" stroke="#d4af37" strokeWidth="0.7" />
            <circle cx="40" cy="5.5" r="1" fill="#d4af37" />
            <rect x="24" y="8" width="32" height="2" fill="#ffffff" />
            <rect x="4" y="16" width="22" height="18" fill="#121214" stroke="#27272a" strokeWidth="0.8" />
            <line x1="4" y1="16" x2="26" y2="16" stroke="#d4af37" strokeWidth="1.2" />
            <rect x="29" y="16" width="22" height="18" fill="#121214" stroke="#27272a" strokeWidth="0.8" />
            <line x1="29" y1="16" x2="51" y2="16" stroke="#d4af37" strokeWidth="1.2" />
            <rect x="54" y="16" width="22" height="18" fill="#121214" stroke="#27272a" strokeWidth="0.8" />
            <line x1="54" y1="16" x2="76" y2="16" stroke="#d4af37" strokeWidth="1.2" />
            <line x1="2" y1="38" x2="78" y2="38" stroke="#27272a" strokeWidth="0.6" />
            <rect x="6" y="41" width="30" height="2" fill="#d4af37" />
        </svg>
    ),

    'auth-sneaker-streetwear-pass': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0a0a0c" stroke="#27272a" strokeWidth="1" />
            <rect width="80" height="8" fill="#121216" />
            <line x1="0" y1="8" x2="80" y2="8" stroke="#b8fa33" strokeWidth="1" />
            <rect x="4" y="2.5" width="24" height="3" rx="0.5" fill="#b8fa33" />
            <rect x="4" y="12" width="46" height="4" rx="0.5" fill="#ffffff" />
            <g fill="#71717a">
                <rect x="64" y="11" width="1" height="5" />
                <rect x="66" y="11" width="1.5" height="5" />
                <rect x="69" y="11" width="1" height="5" />
                <rect x="71" y="11" width="2" height="5" />
                <rect x="74" y="11" width="1" height="5" />
            </g>
            <rect x="4" y="21" width="22" height="16" fill="#141419" stroke="#27272a" strokeWidth="0.8" />
            <line x1="4" y1="21" x2="4" y2="37" stroke="#b8fa33" strokeWidth="1.5" />
            <rect x="29" y="21" width="22" height="16" fill="#141419" stroke="#27272a" strokeWidth="0.8" />
            <line x1="29" y1="21" x2="29" y2="37" stroke="#b8fa33" strokeWidth="1.5" />
            <rect x="54" y="21" width="22" height="16" fill="#141419" stroke="#27272a" strokeWidth="0.8" />
            <line x1="54" y1="21" x2="54" y2="37" stroke="#b8fa33" strokeWidth="1.5" />
        </svg>
    ),

    'auth-security-tamper-evident': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="5" fill="#0284c7" />
            <rect x="20" y="8" width="40" height="3" fill="#06b6d4" />
            <rect x="14" y="13" width="52" height="4.5" rx="0.5" fill="#f8fafc" />
            <rect x="4" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <circle cx="15" cy="27" r="2" fill="#06b6d4" />
            <rect x="29" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <circle cx="40" cy="27" r="2" fill="#06b6d4" />
            <rect x="54" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <circle cx="65" cy="27" r="2" fill="#06b6d4" />
        </svg>
    ),

    'auth-psa-graded-slab-vault': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#b91c1c" />
            <rect x="4" y="3" width="30" height="3" fill="#ffffff" />
            <rect x="56" y="2.5" width="20" height="4" rx="1" fill="#ffffff" />
            <rect x="4" y="13" width="44" height="4" fill="#0f172a" />
            <g fill="#94a3b8">
                <rect x="62" y="12" width="1" height="5" />
                <rect x="64" y="12" width="1.5" height="5" />
                <rect x="67" y="12" width="1" height="5" />
                <rect x="69" y="12" width="2" height="5" />
                <rect x="72" y="12" width="1" height="5" />
            </g>
            <rect x="4" y="22" width="72" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="28" y1="22" x2="28" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="52" y1="22" x2="52" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'auth-manufacturer-oem-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="7" fill="#0f172a" />
            <rect x="4" y="2" width="24" height="3" fill="#f59e0b" />
            <rect x="4" y="11" width="50" height="4" fill="#f8fafc" />
            <rect x="4" y="17" width="60" height="2.5" fill="#94a3b8" />
            <rect x="4" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="4" y1="24" x2="26" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
            <rect x="29" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="29" y1="24" x2="51" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
            <rect x="54" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="54" y1="24" x2="76" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
        </svg>
    ),

    'auth-swiss-minimalist-dossier': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="4" y="6" width="16" height="2" fill="#71717a" />
            <rect x="4" y="11" width="22" height="5" fill="#18181b" />
            <line x1="4" y1="19" x2="14" y2="19" stroke="#18181b" strokeWidth="1" />
            <rect x="4" y="23" width="20" height="16" fill="#f4f4f5" />
            <line x1="28" y1="4" x2="28" y2="44" stroke="#e4e4e7" strokeWidth="0.8" />
            <rect x="34" y="8" width="40" height="8" rx="1" fill="#fafafa" />
            <rect x="34" y="20" width="40" height="8" rx="1" fill="#fafafa" />
            <rect x="34" y="32" width="40" height="8" rx="1" fill="#fafafa" />
        </svg>
    ),

    'auth-triple-badge-crest-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="26" y="4" width="28" height="3" rx="1" fill="#eff6ff" />
            <rect x="18" y="9" width="44" height="4" rx="0.5" fill="#0f172a" />
            <rect x="4" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="15" cy="24" r="3" fill="#2563eb" fillOpacity="0.2" />
            <rect x="7" y="30" width="16" height="3" fill="#0f172a" />
            <rect x="29" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="40" cy="24" r="3" fill="#2563eb" fillOpacity="0.2" />
            <rect x="32" y="30" width="16" height="3" fill="#0f172a" />
            <rect x="54" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="65" cy="24" r="3" fill="#2563eb" fillOpacity="0.2" />
            <rect x="57" y="30" width="16" height="3" fill="#0f172a" />
        </svg>
    ),

    'auth-vintage-notary-parchment': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffefb" stroke="#d6d3d1" strokeWidth="1.2" />
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="2 1" />
            <rect x="24" y="6" width="32" height="3" rx="0.5" fill="#b91c1c" />
            <rect x="14" y="11" width="52" height="4" fill="#1c1917" />
            <rect x="5" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <rect x="29.5" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <rect x="54" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <line x1="6" y1="39" x2="74" y2="39" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="2 1" />
            <rect x="6" y="42" width="24" height="2" fill="#78716c" />
            <rect x="52" y="42" width="22" height="2" fill="#b91c1c" />
        </svg>
    ),

    'auth-sports-memorabilia-holotag': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#070f1e" stroke="#1e3a5f" strokeWidth="1" />
            <rect width="80" height="8" fill="#0c1a2e" />
            <circle cx="6" cy="4" r="1.5" fill="#fbbf24" />
            <rect x="10" y="2.5" width="34" height="3" fill="#ffffff" />
            <rect x="4" y="12" width="52" height="4" fill="#f8fafc" />
            <rect x="4" y="18" width="60" height="2.5" fill="#94a3b8" />
            <rect x="4" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" strokeWidth="0.8" />
            <line x1="4" y1="24" x2="26" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
            <rect x="29" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" strokeWidth="0.8" />
            <line x1="29" y1="24" x2="51" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
            <rect x="54" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" strokeWidth="0.8" />
            <line x1="54" y1="24" x2="76" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
        </svg>
    ),

    // ── Condition Details Variants ─────────────────────────────────────────
    'cd-cosmetic-grade-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="4" width="28" height="3.5" rx="0.5" fill="#1e1535" />
            <rect x="36" y="4" width="20" height="3.5" rx="0.5" fill="#7530fb" />
            <rect x="5" y="12" width="22" height="30" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <rect x="8" y="16" width="16" height="2" fill="#166534" />
            <text x="16" y="27" fontSize="8" fill="#16a34a" textAnchor="middle">★★★★★</text>
            <rect x="30" y="12" width="45" height="30" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="34" y1="18" x2="71" y2="18" stroke="#1f1d2e" strokeWidth="1.2" />
            <line x1="34" y1="24" x2="68" y2="24" stroke="#64748b" strokeWidth="1.2" />
            <line x1="34" y1="30" x2="60" y2="30" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'cd-certified-refurb-diagnostic': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <rect x="4" y="2.5" width="26" height="4" rx="1" fill="#2563eb" />
            <rect x="33" y="3.5" width="30" height="2" fill="#ffffff" />
            <circle cx="75" cy="4.5" r="1.5" fill="#22c55e" />
            <rect x="0" y="9" width="80" height="7" fill="#f8fafc" />
            <line x1="0" y1="16" x2="80" y2="16" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="6" cy="12.5" r="1" fill="#166534" />
            <circle cx="32" cy="12.5" r="1" fill="#166534" />
            <circle cx="58" cy="12.5" r="1" fill="#166534" />
            <rect x="4" y="20" width="22" height="2" fill="#64748b" />
            <line x1="4" y1="26" x2="76" y2="26" stroke="#0f172a" strokeWidth="1.4" />
            <line x1="4" y1="32" x2="72" y2="32" stroke="#64748b" strokeWidth="1.4" />
            <line x1="4" y1="38" x2="58" y2="38" stroke="#64748b" strokeWidth="1.4" />
        </svg>
    ),

    'cd-archival-vintage-tier': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" />
            <rect x="4" y="3" width="24" height="3" fill="#78716c" />
            <rect x="30" y="3" width="28" height="3" fill="#1c1917" />
            <rect x="62" y="2.5" width="14" height="4" rx="1" fill="#059669" />
            <rect x="4" y="9" width="72" height="7" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="0.6" />
            <rect x="18" y="9" width="15" height="7" fill="#059669" />
            <line x1="18" y1="9" x2="18" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <line x1="33" y1="9" x2="33" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <line x1="48" y1="9" x2="48" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <line x1="63" y1="9" x2="63" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <rect x="4" y="19" width="72" height="24" rx="2" fill="#ffffff" stroke="#d6d3d1" strokeDasharray="2 1" strokeWidth="0.8" />
            <line x1="8" y1="25" x2="68" y2="25" stroke="#1c1917" strokeWidth="1.2" />
            <line x1="8" y1="31" x2="64" y2="31" stroke="#78716c" strokeWidth="1.2" />
            <line x1="8" y1="37" x2="52" y2="37" stroke="#78716c" strokeWidth="1.2" />
        </svg>
    ),

    'cd-open-box-inventory-audit': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="4" y="3" width="22" height="3.5" rx="1" fill="#9333ea" />
            <rect x="29" y="3" width="34" height="3.5" rx="0.5" fill="#0f172a" />
            <rect x="4" y="10" width="27" height="33" rx="2" fill="#faf5ff" stroke="#f3e8ff" strokeWidth="0.8" />
            <circle cx="8" cy="15" r="1.2" fill="#9333ea" />
            <line x1="12" y1="15" x2="26" y2="15" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="8" cy="22" r="1.2" fill="#9333ea" />
            <line x1="12" y1="22" x2="26" y2="22" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="8" cy="29" r="1.2" fill="#9333ea" />
            <line x1="12" y1="29" x2="26" y2="29" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="8" cy="36" r="1.2" fill="#9333ea" />
            <line x1="12" y1="36" x2="26" y2="36" stroke="#1e1b4b" strokeWidth="1" />
            <rect x="34" y="10" width="42" height="33" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="38" y1="16" x2="72" y2="16" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="38" y1="22" x2="70" y2="22" stroke="#64748b" strokeWidth="1.2" />
            <line x1="38" y1="28" x2="66" y2="28" stroke="#64748b" strokeWidth="1.2" />
            <line x1="38" y1="34" x2="56" y2="34" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'cd-honest-wear-transparency': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#fed7aa" strokeWidth="1" />
            <rect x="4" y="3" width="22" height="3" rx="1" fill="#ffedd5" />
            <rect x="28" y="3" width="30" height="3" fill="#0f172a" />
            <rect x="62" y="2.5" width="14" height="4" rx="1" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.6" />
            <rect x="4" y="10" width="72" height="33" rx="2" fill="#fffaf5" />
            <line x1="4" y1="10" x2="4" y2="43" stroke="#f59e0b" strokeWidth="2" />
            <rect x="8" y="14" width="28" height="2" fill="#c2410c" />
            <line x1="8" y1="20" x2="70" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="26" x2="68" y2="26" stroke="#475569" strokeWidth="1.2" />
            <line x1="8" y1="32" x2="58" y2="32" stroke="#475569" strokeWidth="1.2" />
            <line x1="8" y1="38" x2="44" y2="38" stroke="#166534" strokeWidth="1" />
        </svg>
    ),

    'cd-parts-repair-warning': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="8" fill="#b45309" />
            <path d="M4 6L6 2.5H2L4 6Z" fill="#ffffff" />
            <rect x="9" y="3" width="40" height="2.5" fill="#ffffff" />
            <rect x="4" y="12" width="32" height="3" fill="#f59e0b" />
            <rect x="4" y="18" width="72" height="22" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="4" y1="18" x2="4" y2="40" stroke="#dc2626" strokeWidth="2" />
            <rect x="8" y="21" width="26" height="2" fill="#f87171" />
            <line x1="8" y1="27" x2="70" y2="27" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="8" y1="33" x2="60" y2="33" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="4" y1="44" x2="54" y2="44" stroke="#94a3b8" strokeWidth="0.8" />
        </svg>
    ),

    'cd-jeweler-curator-provenance': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
            <rect x="22" y="5" width="36" height="2" fill="#d4af37" />
            <rect x="18" y="9" width="44" height="3.5" fill="#ffffff" />
            <circle cx="40" cy="15" r="1" fill="#d4af37" />
            <rect x="5" y="19" width="70" height="23" rx="2" fill="#141416" stroke="#27272a" strokeWidth="0.8" />
            <line x1="9" y1="24" x2="71" y2="24" stroke="#fafafa" strokeWidth="1.2" />
            <line x1="9" y1="30" x2="66" y2="30" stroke="#a1a1aa" strokeWidth="1.2" />
            <line x1="9" y1="36" x2="48" y2="36" stroke="#d4af37" strokeWidth="0.8" />
        </svg>
    ),

    'cd-automotive-core-fitment': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#1e3a5f" strokeWidth="1" />
            <rect width="80" height="8" fill="#1e293b" />
            <rect x="4" y="2.5" width="22" height="3" fill="#f59e0b" />
            <rect x="28" y="2.5" width="34" height="3" fill="#ffffff" />
            <circle cx="75" cy="4" r="1.2" fill="#22c55e" />
            <rect x="0" y="8" width="80" height="7" fill="#090d16" />
            <line x1="0" y1="15" x2="80" y2="15" stroke="#1e3a5f" strokeWidth="0.8" />
            <rect x="4" y="11" width="18" height="2" fill="#94a3b8" />
            <rect x="30" y="11" width="18" height="2" fill="#94a3b8" />
            <rect x="56" y="11" width="18" height="2" fill="#94a3b8" />
            <line x1="4" y1="22" x2="76" y2="22" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="4" y1="29" x2="70" y2="29" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="4" y1="36" x2="52" y2="36" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
    ),

    'cd-scandinavian-minimal-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="5" y="5" width="24" height="2.5" fill="#71717a" />
            <rect x="32" y="5" width="28" height="2.5" fill="#18181b" />
            <line x1="5" y1="11" x2="75" y2="11" stroke="#18181b" strokeWidth="1" />
            <line x1="5" y1="18" x2="75" y2="18" stroke="#18181b" strokeWidth="1.2" />
            <line x1="5" y1="25" x2="72" y2="25" stroke="#52525b" strokeWidth="1.2" />
            <line x1="5" y1="32" x2="60" y2="32" stroke="#52525b" strokeWidth="1.2" />
            <rect x="5" y="40" width="30" height="2" fill="#71717a" />
        </svg>
    ),

    'cd-mobile-compact-badge-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Top Header Capsule Line */}
            <rect x="4" y="4" width="28" height="5" rx="2.5" fill="#2563eb" />
            <rect x="35" y="4" width="41" height="5" rx="2.5" fill="#f1f5f9" />
            {/* 3 Inspection Metric Chips */}
            <rect x="4" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <rect x="7" y="14.5" width="16" height="2" fill="#64748b" />
            <rect x="7" y="18" width="12" height="2.5" fill="#0f172a" />
            <rect x="29" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <rect x="32" y="14.5" width="16" height="2" fill="#64748b" />
            <rect x="32" y="18" width="12" height="2.5" fill="#16a34a" />
            <rect x="54" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <rect x="57" y="14.5" width="16" height="2" fill="#64748b" />
            <rect x="57" y="18" width="12" height="2.5" fill="#0f172a" />
            {/* Full-Width Notes Card with Left Blue Accent Border */}
            <rect x="4" y="26" width="72" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="4" y1="26" x2="4" y2="44" stroke="#2563eb" strokeWidth="2" />
            <line x1="9" y1="31" x2="68" y2="31" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="36" x2="55" y2="36" stroke="#64748b" strokeWidth="1.2" />
            <line x1="9" y1="40.5" x2="35" y2="40.5" stroke="#94a3b8" strokeWidth="0.8" />
        </svg>
    ),

    // ── Compatibility Table Variants ────────────────────────────────────
    'compat-classic-zebra-table': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="5" y="4" width="7" height="7" rx="1.5" fill="#16a34a" />
            <rect x="15" y="5.5" width="30" height="4" fill="#1e1535" />
            <line x1="0" y1="13" x2="80" y2="13" stroke="#ede9fe" strokeWidth="0.8" />
            <rect x="0" y="13" width="80" height="8" fill="#f0fdf4" />
            <line x1="5" y1="17" x2="8" y2="17" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="17" x2="52" y2="17" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="0" y1="21" x2="80" y2="21" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="5" y1="25" x2="8" y2="25" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="25" x2="48" y2="25" stroke="#1e1535" strokeWidth="1.2" />
            <rect x="0" y="29" width="80" height="8" fill="#f0fdf4" />
            <line x1="5" y1="33" x2="8" y2="33" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="33" x2="55" y2="33" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="0" y1="37" x2="80" y2="37" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="5" y1="41" x2="8" y2="41" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="41" x2="45" y2="41" stroke="#1e1535" strokeWidth="1.2" />
        </svg>
    ),

    'compat-automotive-parts-fitment': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="10" fill="#0f172a" />
            <rect x="4" y="3.5" width="22" height="3" fill="#1d4ed8" />
            <rect x="30" y="3.5" width="34" height="3" fill="#ffffff" />
            <rect y="10" width="80" height="6" fill="#f1f5f9" />
            <line x1="4" y1="13" x2="16" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="24" y1="13" x2="36" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="44" y1="13" x2="56" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="64" y1="13" x2="76" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="4" y1="21" x2="20" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="24" y1="21" x2="34" y2="21" stroke="#64748b" strokeWidth="1.2" />
            <rect x="62" y="18" width="14" height="5" rx="1" fill="#ecfdf5" />
            <line x1="0" y1="25" x2="80" y2="25" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="4" y1="30" x2="22" y2="30" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="24" y1="30" x2="36" y2="30" stroke="#64748b" strokeWidth="1.2" />
            <rect x="62" y="27" width="14" height="5" rx="1" fill="#ecfdf5" />
            <rect y="37" width="80" height="11" fill="#eff6ff" />
            <line x1="4" y1="42.5" x2="70" y2="42.5" stroke="#1e40af" strokeWidth="1.2" />
        </svg>
    ),

    'compat-device-multi-gen-chips': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="3" width="24" height="4" rx="2" fill="#0284c7" />
            <rect x="32" y="3" width="30" height="4" fill="#0f172a" />
            <rect x="4" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="13" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="15" y1="14" x2="32" y2="14" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="15" y1="18" x2="28" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <rect x="42" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="45" y="13" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="53" y1="14" x2="70" y2="14" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="53" y1="18" x2="66" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <rect x="4" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="31" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="15" y1="32" x2="32" y2="32" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="42" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="45" y="31" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="53" y1="32" x2="70" y2="32" stroke="#0f172a" strokeWidth="1.2" />
        </svg>
    ),

    'compat-split-guarantee-sidebar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="28" height="48" fill="#0f172a" />
            <rect x="3" y="6" width="16" height="3" rx="0.5" fill="#16a34a" />
            <rect x="3" y="12" width="22" height="4" fill="#ffffff" />
            <line x1="3" y1="20" x2="23" y2="20" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="3" y1="24" x2="20" y2="24" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="3" y1="34" x2="24" y2="34" stroke="#334155" strokeWidth="0.8" />
            <rect x="33" y="6" width="32" height="3" fill="#0f172a" />
            <rect x="32" y="13" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="36" y1="17.5" x2="68" y2="17.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="32" y="24" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="36" y1="28.5" x2="65" y2="28.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="32" y="35" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="36" y1="39.5" x2="60" y2="39.5" stroke="#0f172a" strokeWidth="1.2" />
        </svg>
    ),

    'compat-stepped-compatibility-checklist': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="3" width="20" height="3.5" rx="1" fill="#7c3aed" />
            <rect x="28" y="3" width="30" height="3.5" fill="#1e1b4b" />
            <rect x="4" y="9" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="9" width="3" height="10" fill="#7c3aed" />
            <line x1="12" y1="14" x2="42" y2="14" stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="60" y="11" width="13" height="6" rx="2" fill="#ecfdf5" />
            <rect x="4" y="21" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="21" width="3" height="10" fill="#7c3aed" />
            <line x1="12" y1="26" x2="45" y2="26" stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="60" y="23" width="13" height="6" rx="2" fill="#ecfdf5" />
            <rect x="4" y="33" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="33" width="3" height="10" fill="#7c3aed" />
            <line x1="12" y1="38" x2="38" y2="38" stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="60" y="35" width="13" height="6" rx="2" fill="#ecfdf5" />
        </svg>
    ),

    'compat-industrial-schematic-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <line x1="4" y1="4" x2="26" y2="4" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="4" y1="8" x2="48" y2="8" stroke="#f8fafc" strokeWidth="1.5" />
            <line x1="0" y1="13" x2="80" y2="13" stroke="#1e293b" strokeWidth="0.8" />
            <rect y="13" width="80" height="5" fill="#0f172a" />
            <line x1="4" y1="15.5" x2="20" y2="15.5" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="30" y1="15.5" x2="50" y2="15.5" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="24" x2="24" y2="24" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="30" y1="24" x2="52" y2="24" stroke="#06b6d4" strokeWidth="1" />
            <line x1="68" y1="24" x2="76" y2="24" stroke="#10b981" strokeWidth="1.2" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="35" x2="22" y2="35" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="30" y1="35" x2="50" y2="35" stroke="#06b6d4" strokeWidth="1" />
            <line x1="68" y1="35" x2="76" y2="35" stroke="#10b981" strokeWidth="1.2" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="44" x2="26" y2="44" stroke="#f8fafc" strokeWidth="1.2" />
        </svg>
    ),

    'compat-minimal-hairline-directory': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <line x1="6" y1="6" x2="24" y2="6" stroke="#71717a" strokeWidth="1" />
            <line x1="6" y1="12" x2="42" y2="12" stroke="#18181b" strokeWidth="1.5" />
            <line x1="6" y1="16" x2="74" y2="16" stroke="#18181b" strokeWidth="1" />
            <line x1="6" y1="23" x2="30" y2="23" stroke="#18181b" strokeWidth="1.2" />
            <line x1="38" y1="23" x2="60" y2="23" stroke="#71717a" strokeWidth="1" />
            <circle cx="72" cy="23" r="1.5" fill="#18181b" />
            <line x1="6" y1="28" x2="74" y2="28" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="6" y1="35" x2="28" y2="35" stroke="#18181b" strokeWidth="1.2" />
            <line x1="38" y1="35" x2="56" y2="35" stroke="#71717a" strokeWidth="1" />
            <circle cx="72" cy="35" r="1.5" fill="#18181b" />
            <line x1="6" y1="40" x2="74" y2="40" stroke="#e4e4e7" strokeWidth="0.8" />
        </svg>
    ),

    'compat-console-gaming-platform-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0a0e17" stroke="#1e293b" strokeWidth="1" />
            <line x1="4" y1="5" x2="24" y2="5" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="4" y1="9" x2="48" y2="9" stroke="#ffffff" strokeWidth="1.5" />
            <rect y="13" width="80" height="9" fill="#0f172a" />
            <rect x="4" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="6" cy="17.5" r="1" fill="#0284c7" />
            <rect x="23" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="25" cy="17.5" r="1" fill="#2563eb" />
            <rect x="42" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="44" cy="17.5" r="1" fill="#16a34a" />
            <rect x="61" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="63" cy="17.5" r="1" fill="#dc2626" />
            <line x1="4" y1="28" x2="30" y2="28" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="36" y1="28" x2="60" y2="28" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="34" x2="80" y2="34" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="41" x2="28" y2="41" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="36" y1="41" x2="58" y2="41" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'compat-oem-cross-reference-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#f8fafc" />
            <line x1="4" y1="4" x2="20" y2="4" stroke="#b91c1c" strokeWidth="1" />
            <line x1="4" y1="7" x2="44" y2="7" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="0" y1="9" x2="80" y2="9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect y="9" width="80" height="6" fill="#f1f5f9" />
            <line x1="4" y1="12" x2="18" y2="12" stroke="#475569" strokeWidth="0.8" />
            <line x1="26" y1="12" x2="42" y2="12" stroke="#475569" strokeWidth="0.8" />
            <line x1="4" y1="21" x2="22" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="26" y1="21" x2="46" y2="21" stroke="#b91c1c" strokeWidth="1.2" />
            <rect x="58" y="18" width="18" height="5" rx="1" fill="#eff6ff" />
            <line x1="0" y1="26" x2="80" y2="26" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="4" y1="32" x2="20" y2="32" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="26" y1="32" x2="44" y2="32" stroke="#b91c1c" strokeWidth="1.2" />
            <rect x="58" y="29" width="18" height="5" rx="1" fill="#eff6ff" />
            <rect y="38" width="80" height="10" fill="#fffbeb" />
            <line x1="4" y1="43" x2="68" y2="43" stroke="#92400e" strokeWidth="1" />
        </svg>
    ),

    'compat-compact-horizontal-pill-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="4" width="22" height="4.5" rx="1.5" fill="#16a34a" />
            <rect x="30" y="4" width="28" height="4.5" rx="1" fill="#0f172a" />
            <rect x="4" y="13" width="34" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="8" y1="17.5" x2="11" y2="17.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="14" y1="17.5" x2="32" y2="17.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="42" y="13" width="34" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="46" y1="17.5" x2="49" y2="17.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="52" y1="17.5" x2="70" y2="17.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="4" y="26" width="36" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="8" y1="30.5" x2="11" y2="30.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="14" y1="30.5" x2="34" y2="30.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="44" y="26" width="32" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="48" y1="30.5" x2="51" y2="30.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="54" y1="30.5" x2="70" y2="30.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="4" y="38" width="40" height="6" rx="2" fill="#eff6ff" />
            <line x1="8" y1="41" x2="38" y2="41" stroke="#2563eb" strokeWidth="1" />
        </svg>
    ),

    // ── Product Comparison Variants ────────────────────────────────────
    'comp-classic-header-table': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect width="80" height="11" rx="4" fill="#7530fb" />
            <rect x="5" y="4" width="20" height="3.5" rx="0.5" fill="#ffffff" />
            <rect x="30" y="4" width="22" height="3.5" rx="0.5" fill="#ffffff" />
            <rect x="56" y="4" width="18" height="3.5" rx="0.5" fill="#ffffff" />
            <line x1="28" y1="11" x2="28" y2="48" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="54" y1="11" x2="54" y2="48" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="0" y1="38" x2="80" y2="38" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="6" y1="15.5" x2="20" y2="15.5" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="33" y1="15.5" x2="49" y2="15.5" stroke="#7530fb" strokeWidth="1.5" />
            <line x1="59" y1="15.5" x2="71" y2="15.5" stroke="#9ca3af" strokeWidth="1.2" />
            <line x1="6" y1="24.5" x2="22" y2="24.5" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="33" y1="24.5" x2="47" y2="24.5" stroke="#7530fb" strokeWidth="1.5" />
            <line x1="59" y1="24.5" x2="69" y2="24.5" stroke="#9ca3af" strokeWidth="1.2" />
        </svg>
    ),

    'comp-spotlight-winner-column': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="10" fill="#0f172a" />
            <rect x="28" y="0" width="26" height="48" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.2" />
            <rect x="28" y="0" width="26" height="11" fill="#16a34a" />
            <rect x="31" y="2" width="20" height="3" rx="1" fill="#ffffff" />
            <rect x="32" y="6" width="18" height="3" rx="0.5" fill="#ffffff" />
            <rect x="4" y="3.5" width="20" height="3" fill="#ffffff" />
            <rect x="57" y="3.5" width="18" height="3" fill="#94a3b8" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="30" x2="80" y2="30" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="41" cy="15.5" r="1.5" fill="#16a34a" />
            <circle cx="41" cy="25" r="1.5" fill="#16a34a" />
            <circle cx="41" cy="35" r="1.5" fill="#16a34a" />
        </svg>
    ),

    'comp-versus-head-to-head-cards': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="5" width="33" height="38" rx="3" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
            <rect x="7" y="8" width="16" height="3" rx="1" fill="#16a34a" />
            <line x1="7" y1="16" x2="33" y2="16" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="7" y1="23" x2="33" y2="23" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="7" y1="30" x2="33" y2="30" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="7" y1="37" x2="30" y2="37" stroke="#16a34a" strokeWidth="1.2" />
            <circle cx="40" cy="24" r="5" fill="#0f172a" />
            <text x="40" y="26.5" fontSize="4.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">VS</text>
            <rect x="43" y="5" width="33" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="46" y="8" width="16" height="3" rx="1" fill="#94a3b8" />
            <line x1="46" y1="16" x2="72" y2="16" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="46" y1="23" x2="72" y2="23" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="46" y1="30" x2="72" y2="30" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
    ),

    'comp-horizontal-metric-bars': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="4" width="22" height="3" rx="1" fill="#2563eb" />
            <line x1="5" y1="12" x2="26" y2="12" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="5" y="15" width="70" height="3.5" rx="1.5" fill="#e2e8f0" />
            <rect x="5" y="15" width="58" height="3.5" rx="1.5" fill="#2563eb" />
            <line x1="5" y1="24" x2="24" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="5" y="27" width="70" height="3.5" rx="1.5" fill="#e2e8f0" />
            <rect x="5" y="27" width="62" height="3.5" rx="1.5" fill="#2563eb" />
            <line x1="5" y1="36" x2="28" y2="36" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="5" y="39" width="70" height="3.5" rx="1.5" fill="#e2e8f0" />
            <rect x="5" y="39" width="52" height="3.5" rx="1.5" fill="#2563eb" />
        </svg>
    ),

    'comp-technical-spec-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <line x1="4" y1="4.5" x2="24" y2="4.5" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="32" y1="4.5" x2="52" y2="4.5" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="60" y1="4.5" x2="76" y2="4.5" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="27" x2="80" y2="27" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="33" y="12" width="16" height="4.5" rx="1" fill="#ecfdf5" />
            <rect x="33" y="21" width="16" height="4.5" rx="1" fill="#ecfdf5" />
            <rect x="33" y="30" width="16" height="4.5" rx="1" fill="#ecfdf5" />
        </svg>
    ),

    'comp-good-better-best-tiers': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <rect x="29" y="0" width="22" height="48" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.8" />
            <rect x="29" y="0" width="22" height="9" fill="#2563eb" />
            <line x1="32" y1="4.5" x2="48" y2="4.5" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="19" x2="80" y2="19" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="39" x2="80" y2="39" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="40" cy="14" r="1.5" fill="#2563eb" />
            <circle cx="40" cy="24" r="1.5" fill="#2563eb" />
            <circle cx="40" cy="34" r="1.5" fill="#2563eb" />
        </svg>
    ),

    'comp-minimalist-hairline-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <line x1="6" y1="8" x2="28" y2="8" stroke="#18181b" strokeWidth="1.5" />
            <line x1="6" y1="14" x2="74" y2="14" stroke="#18181b" strokeWidth="1" />
            <line x1="6" y1="22" x2="74" y2="22" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="6" y1="30" x2="74" y2="30" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="6" y1="38" x2="74" y2="38" stroke="#e4e4e7" strokeWidth="0.8" />
            <circle cx="45" cy="18" r="1.5" fill="#18181b" />
            <circle cx="45" cy="26" r="1.5" fill="#18181b" />
            <circle cx="45" cy="34" r="1.5" fill="#18181b" />
            <circle cx="65" cy="18" r="1.5" stroke="#a1a1aa" fill="none" />
            <circle cx="65" cy="26" r="1.5" stroke="#a1a1aa" fill="none" />
            <circle cx="65" cy="34" r="1.5" stroke="#a1a1aa" fill="none" />
        </svg>
    ),

    'comp-dark-terminal-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect width="80" height="8" fill="#0f172a" />
            <line x1="4" y1="4" x2="28" y2="4" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="62" y1="4" x2="76" y2="4" stroke="#10b981" strokeWidth="1" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="28" x2="80" y2="28" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="38" x2="80" y2="38" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="30" y="11" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" strokeWidth="0.7" />
            <rect x="30" y="21" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" strokeWidth="0.7" />
            <rect x="30" y="31" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" strokeWidth="0.7" />
        </svg>
    ),

    'comp-cross-reference-checklist': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <rect x="33" y="0" width="22" height="9" fill="#16a34a" />
            <rect x="58" y="0" width="22" height="9" fill="#dc2626" />
            <line x1="0" y1="19" x2="80" y2="19" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="39" x2="80" y2="39" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="44" cy="14" r="2.5" fill="#16a34a" />
            <circle cx="44" cy="24" r="2.5" fill="#16a34a" />
            <circle cx="44" cy="34" r="2.5" fill="#16a34a" />
            <circle cx="69" cy="14" r="2.5" fill="#ef4444" />
            <circle cx="69" cy="24" r="2.5" fill="#ef4444" />
            <circle cx="69" cy="34" r="2.5" fill="#ef4444" />
        </svg>
    ),

    'comp-compact-mobile-split-pills': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="3" width="20" height="4" rx="1" fill="#2563eb" />
            <rect x="4" y="10" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="14.5" x2="22" y2="14.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="34" y="11.5" width="18" height="6" rx="3" fill="#ecfdf5" />
            <rect x="56" y="11.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="4" y="22" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="26.5" x2="24" y2="26.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="34" y="23.5" width="18" height="6" rx="3" fill="#ecfdf5" />
            <rect x="56" y="23.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="4" y="34" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="38.5" x2="20" y2="38.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="34" y="35.5" width="18" height="6" rx="3" fill="#ecfdf5" />
            <rect x="56" y="35.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),

    // ── Key Features Grid (10 Distinct Retail Layouts) ──
    'feat-classic-cards-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="10" width="21" height="28" rx="3" fill="#f8f7ff" stroke="#e9e3ff" strokeWidth="0.8" />
            <circle cx="15.5" cy="18" r="3.5" fill="#ede9fe" />
            <line x1="8" y1="26" x2="23" y2="26" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="9" y1="31" x2="22" y2="31" stroke="#6b7280" strokeWidth="0.8" />

            <rect x="29.5" y="10" width="21" height="28" rx="3" fill="#f8f7ff" stroke="#e9e3ff" strokeWidth="0.8" />
            <circle cx="40" cy="18" r="3.5" fill="#ede9fe" />
            <line x1="32.5" y1="26" x2="47.5" y2="26" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="33.5" y1="31" x2="46.5" y2="31" stroke="#6b7280" strokeWidth="0.8" />

            <rect x="54" y="10" width="21" height="28" rx="3" fill="#f8f7ff" stroke="#e9e3ff" strokeWidth="0.8" />
            <circle cx="64.5" cy="18" r="3.5" fill="#ede9fe" />
            <line x1="57" y1="26" x2="72" y2="26" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="58" y1="31" x2="71" y2="31" stroke="#6b7280" strokeWidth="0.8" />
        </svg>
    ),

    'feat-tech-bento-flagship': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="6" width="68" height="20" rx="3" fill="#0f172a" />
            <line x1="11" y1="12" x2="38" y2="12" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="11" y1="17" x2="52" y2="17" stroke="#94a3b8" strokeWidth="1" />
            <rect x="58" y="10" width="12" height="10" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.6" />
            <rect x="6" y="29" width="21" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="29" width="22" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="53" y="29" width="21" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'feat-industrial-spec-bars': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="5" width="70" height="10" rx="1.5" fill="#0f172a" />
            <rect x="5" y="5" width="3" height="10" fill="#d97706" />
            <line x1="12" y1="10" x2="40" y2="10" stroke="#fcd34d" strokeWidth="1.2" />
            <rect x="5" y="18" width="70" height="7" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x="55" y="19" width="17" height="5" rx="1" fill="#fef3c7" />
            <rect x="5" y="28" width="70" height="7" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x="55" y="29" width="17" height="5" rx="1" fill="#fef3c7" />
            <rect x="5" y="37" width="70" height="7" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x="55" y="38" width="17" height="5" rx="1" fill="#fef3c7" />
        </svg>
    ),

    'feat-minimalist-hairline-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="8" x2="72" y2="8" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="28" x2="72" y2="28" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="40" y1="14" x2="40" y2="42" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="18" x2="16" y2="18" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="10" y1="22" x2="32" y2="22" stroke="#0f172a" strokeWidth="1" />
            <line x1="44" y1="18" x2="50" y2="18" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="44" y1="22" x2="66" y2="22" stroke="#0f172a" strokeWidth="1" />
            <line x1="10" y1="33" x2="16" y2="33" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="10" y1="37" x2="32" y2="37" stroke="#0f172a" strokeWidth="1" />
            <line x1="44" y1="33" x2="50" y2="33" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="44" y1="37" x2="66" y2="37" stroke="#0f172a" strokeWidth="1" />
        </svg>
    ),

    'feat-staggered-timeline-flow': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="14" y1="10" x2="14" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />
            <circle cx="14" cy="12" r="3" fill="#4f46e5" />
            <rect x="22" y="8" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx="14" cy="24" r="3" fill="#ffffff" stroke="#4f46e5" strokeWidth="1.2" />
            <rect x="22" y="20" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx="14" cy="36" r="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="22" y="32" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),

    'feat-split-hero-benefit-rail': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="5" width="70" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <path d="M5 8a3 3 0 0 1 3-3h18v38H8a3 3 0 0 1-3-3V8z" fill="#0f172a" />
            <rect x="9" y="10" width="12" height="3" rx="1" fill="#059669" />
            <line x1="9" y1="17" x2="21" y2="17" stroke="#ffffff" strokeWidth="1.2" />
            <rect x="30" y="8" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="30" y="19" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="30" y="30" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
        </svg>
    ),

    'feat-cyber-dark-telemetry': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <line x1="8" y1="8" x2="42" y2="8" stroke="#06b6d4" strokeWidth="1.5" />
            <rect x="8" y="15" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="42" y="15" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="8" y="30" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="42" y="30" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
        </svg>
    ),

    'feat-circular-badge-quadrant': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="3" fill="#faf5ff" stroke="#ede9fe" strokeWidth="0.8" />
            <circle cx="15" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="32" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="49" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="66" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
        </svg>
    ),

    'feat-accordion-style-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="7" y="13" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="56" y="15" width="14" height="5" rx="1" fill="#fff7ed" />
            <rect x="7" y="24" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="56" y="26" width="14" height="5" rx="1" fill="#fff7ed" />
            <rect x="7" y="35" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="56" y="37" width="14" height="5" rx="1" fill="#fff7ed" />
        </svg>
    ),

    'feat-compact-mobile-capsule-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="8" y1="8" x2="38" y2="8" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="6" y="14" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="42" y="14" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="6" y="24" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="42" y="24" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="6" y="34" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="42" y="34" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),

    // VAT Notice Variants (10 Styles)
    'vat-classic-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="10" width="68" height="28" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="11" y="18" width="8" height="12" rx="1" fill="#cbd5e1" />
            <line x1="24" y1="19" x2="55" y2="19" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="24" y1="26" x2="68" y2="26" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),
    'vat-official-certificate-badge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="70" height="7" fill="#0f172a" />
            <circle cx="15" cy="27" r="4" fill="#ecfdf5" stroke="#10b981" strokeWidth="0.8" />
            <line x1="23" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="23" y1="30" x2="44" y2="30" stroke="#64748b" strokeWidth="0.8" />
            <rect x="53" y="20" width="18" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'vat-tax-breakdown-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="6" width="70" height="36" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="6" width="70" height="8" fill="#f1f5f9" />
            <line x1="9" y1="10" x2="35" y2="10" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="9" y="19" width="18" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="31" y="19" width="18" height="18" rx="1.5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
            <rect x="53" y="19" width="18" height="18" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.6" />
        </svg>
    ),
    'vat-minimalist-hairline-rule': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="12" x2="72" y2="12" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="18" x2="32" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <line x1="48" y1="18" x2="72" y2="18" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="26" x2="42" y2="26" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="32" x2="68" y2="32" stroke="#64748b" strokeWidth="0.8" />
            <line x1="8" y1="38" x2="72" y2="38" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),
    'vat-split-guarantee-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="22" height="32" fill="#0f172a" />
            <line x1="8" y1="18" x2="23" y2="18" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="8" y1="24" x2="25" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="33" y1="20" x2="56" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="33" y1="28" x2="70" y2="28" stroke="#64748b" strokeWidth="0.8" />
        </svg>
    ),
    'vat-corporate-security-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="3" height="32" fill="#1e40af" />
            <line x1="12" y1="15" x2="36" y2="15" stroke="#1e40af" strokeWidth="1.2" />
            <line x1="12" y1="21" x2="48" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="12" y1="27" x2="68" y2="27" stroke="#64748b" strokeWidth="0.8" />
            <rect x="12" y="32" width="46" height="5" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
        </svg>
    ),
    'vat-compact-pill-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="13" cy="24" r="2.5" fill="#16a34a" />
            <line x1="19" y1="24" x2="46" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="56" y="20.5" width="14" height="7" rx="3.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'vat-b2b-contractor-stamp': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="2" fill="#fefce8" stroke="#b45309" strokeWidth="1" strokeDasharray="2 1.5" />
            <circle cx="18" cy="24" r="9" stroke="#b45309" strokeWidth="1.2" />
            <text x="18" y="26.5" fontSize="6" fontWeight="bold" fill="#78350f" textAnchor="middle">20%</text>
            <line x1="32" y1="19" x2="68" y2="19" stroke="#78350f" strokeWidth="1.2" />
            <line x1="32" y1="25" x2="58" y2="25" stroke="#b45309" strokeWidth="1" />
            <line x1="32" y1="31" x2="65" y2="31" stroke="#78350f" strokeWidth="0.8" />
        </svg>
    ),
    'vat-digital-download-vault': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <rect x="10" y="16" width="12" height="16" rx="2" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="0.8" />
            <line x1="28" y1="19" x2="52" y2="19" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="28" y1="27" x2="50" y2="27" stroke="#6b7280" strokeWidth="0.8" />
            <rect x="56" y="16" width="15" height="16" rx="2" fill="#ffffff" stroke="#ddd6fe" strokeWidth="0.6" />
        </svg>
    ),
    'vat-dual-jurisdiction-eu-uk': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="70" height="8" fill="#0f172a" />
            <line x1="9" y1="12" x2="38" y2="12" stroke="#38bdf8" strokeWidth="1" />
            <line x1="56" y1="12" x2="71" y2="12" stroke="#ffffff" strokeWidth="1" />
            <line x1="9" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="31" x2="68" y2="31" stroke="#475569" strokeWidth="0.8" />
        </svg>
    ),

    // Feedback Score Variants (10 Styles)
    'fb-classic-split-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="9" y1="16" x2="38" y2="16" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="9" y1="22" x2="32" y2="22" stroke="#6b7280" strokeWidth="0.8" />
            <circle cx="11" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="16" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="21" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="26" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="31" cy="29" r="1.5" fill="#f59e0b" />
            <rect x="46" y="14" width="24" height="20" rx="3" fill="#7530fb" />
            <line x1="49" y1="21" x2="67" y2="21" stroke="#ffffff" strokeWidth="1" />
            <line x1="51" y1="27" x2="65" y2="27" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
    ),
    'fb-ebay-top-rated-plus-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="70" height="7" fill="#0f172a" />
            <circle cx="15" cy="27" r="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.8" />
            <line x1="24" y1="23" x2="52" y2="23" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="24" y1="28" x2="48" y2="28" stroke="#64748b" strokeWidth="0.8" />
            <circle cx="26" cy="33" r="1.2" fill="#f59e0b" />
            <circle cx="30" cy="33" r="1.2" fill="#f59e0b" />
            <circle cx="34" cy="33" r="1.2" fill="#f59e0b" />
            <rect x="56" y="20" width="16" height="14" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'fb-power-seller-metric-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="7" width="70" height="34" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="7" width="70" height="7" fill="#f8fafc" />
            <rect x="8" y="18" width="19" height="19" rx="1.5" fill="#f8f7ff" stroke="#ddd6fe" strokeWidth="0.6" />
            <rect x="30" y="18" width="19" height="19" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.6" />
            <rect x="52" y="18" width="19" height="19" rx="1.5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
        </svg>
    ),
    'fb-minimalist-hairline-prestige': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="12" x2="72" y2="12" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="18" x2="38" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <line x1="52" y1="18" x2="72" y2="18" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="26" x2="48" y2="26" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="58" cy="26" r="1.5" fill="#d97706" />
            <circle cx="63" cy="26" r="1.5" fill="#d97706" />
            <circle cx="68" cy="26" r="1.5" fill="#d97706" />
            <line x1="8" y1="34" x2="68" y2="34" stroke="#64748b" strokeWidth="0.8" />
            <line x1="8" y1="39" x2="72" y2="39" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),
    'fb-satisfaction-gauge-ring': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="18" cy="24" r="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
            <line x1="31" y1="19" x2="56" y2="19" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="33" cy="25" r="1.2" fill="#f59e0b" />
            <circle cx="37" cy="25" r="1.2" fill="#f59e0b" />
            <circle cx="41" cy="25" r="1.2" fill="#f59e0b" />
            <line x1="31" y1="31" x2="68" y2="31" stroke="#64748b" strokeWidth="0.8" />
        </svg>
    ),
    'fb-veteran-timeline-pillar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="22" height="32" fill="#0f172a" />
            <line x1="8" y1="17" x2="23" y2="17" stroke="#f59e0b" strokeWidth="1" />
            <line x1="8" y1="23" x2="24" y2="23" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="32" y1="20" x2="56" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="60" cy="20" r="1.2" fill="#f59e0b" />
            <circle cx="64" cy="20" r="1.2" fill="#f59e0b" />
            <line x1="32" y1="28" x2="70" y2="28" stroke="#64748b" strokeWidth="0.8" />
        </svg>
    ),
    'fb-compact-pill-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="13" cy="24" r="2.5" fill="#f59e0b" />
            <line x1="19" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="56" y="20.5" width="14" height="7" rx="3.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'fb-recent-reviews-showcase': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="9" y1="18" x2="26" y2="18" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="11" cy="24" r="1.2" fill="#f59e0b" />
            <circle cx="15" cy="24" r="1.2" fill="#f59e0b" />
            <circle cx="19" cy="24" r="1.2" fill="#f59e0b" />
            <line x1="31" y1="10" x2="31" y2="38" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="36" y1="18" x2="70" y2="18" stroke="#475569" strokeWidth="0.8" />
            <line x1="36" y1="24" x2="64" y2="24" stroke="#475569" strokeWidth="0.8" />
            <line x1="36" y1="30" x2="55" y2="30" stroke="#059669" strokeWidth="0.8" />
        </svg>
    ),
    'fb-enterprise-trust-banner': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <line x1="9" y1="14" x2="38" y2="14" stroke="#38bdf8" strokeWidth="1" />
            <line x1="9" y1="22" x2="48" y2="22" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="11" cy="30" r="1.5" fill="#fbbf24" />
            <circle cx="16" cy="30" r="1.5" fill="#fbbf24" />
            <circle cx="21" cy="30" r="1.5" fill="#fbbf24" />
            <rect x="55" y="16" width="17" height="16" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
        </svg>
    ),
    'fb-performance-scorecard-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="7" width="70" height="34" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="7" width="70" height="7" fill="#f1f5f9" />
            <line x1="9" y1="11" x2="32" y2="11" stroke="#0f172a" strokeWidth="1" />
            <rect x="8" y="18" width="19" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="30" y="18" width="19" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="52" y="18" width="19" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
        </svg>
    ),

    // ── Pull Quote Thumbnails (10 Styles) ──────────────────────────────────
    'pq-classic-serif-centered': (col: string = '#7530fb', light: string = '#ede9fe') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="40" cy="12" r="2.5" fill={light || '#ede9fe'} />
            <line x1="12" y1="21" x2="68" y2="21" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="18" y1="27" x2="62" y2="27" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="28" y1="36" x2="52" y2="36" stroke={col || '#7530fb'} strokeWidth="1.5" />
        </svg>
    ),

    'pq-editorial-thick-accent-pillar': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="0" y="0" width="4" height="48" rx="1" fill={col || '#7530fb'} />
            <line x1="10" y1="12" x2="34" y2="12" stroke={col || '#7530fb'} strokeWidth="1" />
            <line x1="10" y1="19" x2="68" y2="19" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="10" y1="25" x2="60" y2="25" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="10" y1="34" x2="42" y2="34" stroke={light !== '#f8fafc' ? light : '#64748b'} strokeWidth="1" />
        </svg>
    ),

    'pq-customer-testimonial-stars': (col: string = '#7530fb', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="28" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="34" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="40" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="46" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="52" cy="11" r="1.5" fill="#f59e0b" />
            <line x1="12" y1="20" x2="68" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="16" y1="26" x2="64" y2="26" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="22" y="33" width="36" height="7" rx="3.5" fill={light || '#f1f5f9'} />
            <line x1="28" y1="36.5" x2="52" y2="36.5" stroke={col || '#16a34a'} strokeWidth="1" />
        </svg>
    ),

    'pq-minimalist-hairline-bracket': (_col: string = '#7530fb', _light: string = '#94a3b8') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="9" x2="72" y2="9" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="40" cy="15" r="1.5" fill={_light || '#94a3b8'} />
            <line x1="14" y1="23" x2="66" y2="23" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="20" y1="29" x2="60" y2="29" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="37" x2="72" y2="37" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="30" y1="42" x2="50" y2="42" stroke={_col || '#64748b'} strokeWidth="0.8" />
        </svg>
    ),

    'pq-merchant-founder-signature': (col: string = '#b45309', light: string = '#fffdfa') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill={light || '#fffdfa'} stroke="#e7e5e4" strokeWidth="1" />
            <line x1="10" y1="16" x2="16" y2="28" stroke={col || '#b45309'} strokeWidth="1.5" />
            <line x1="22" y1="16" x2="70" y2="16" stroke="#1c1917" strokeWidth="1.2" />
            <line x1="22" y1="23" x2="64" y2="23" stroke="#1c1917" strokeWidth="1.2" />
            <line x1="22" y1="32" x2="48" y2="32" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'pq-industrial-heavy-spec-box': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="6" width="70" height="36" rx="2" fill={light || '#f8fafc'} stroke="#0f172a" strokeWidth="1" />
            <rect x="5" y="6" width="70" height="8" fill="#0f172a" />
            <line x1="9" y1="10" x2="38" y2="10" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="9" y1="22" x2="66" y2="22" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="28" x2="54" y2="28" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="35" x2="40" y2="35" stroke={col || '#10b981'} strokeWidth="1" />
        </svg>
    ),

    'pq-modern-offset-speech-bubble': (col: string = '#7530fb', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="6" fill={light || '#f1f5f9'} stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="12" y1="17" x2="64" y2="17" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="12" y1="23" x2="52" y2="23" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="12" y1="31" x2="36" y2="31" stroke={col || '#7530fb'} strokeWidth="1.5" />
        </svg>
    ),

    'pq-dark-midnight-prestige': (col: string = '#f59e0b', light: string = '#0f172a') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill={light || '#0f172a'} stroke="#334155" strokeWidth="1" />
            <circle cx="40" cy="12" r="2.5" fill={col || '#f59e0b'} />
            <line x1="14" y1="21" x2="66" y2="21" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="18" y1="27" x2="62" y2="27" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="28" y1="36" x2="52" y2="36" stroke={col || '#f59e0b'} strokeWidth="1.5" />
        </svg>
    ),

    'pq-split-brand-flag': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill={light || '#f8fafc'} stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="18" height="32" fill={col || '#7530fb'} />
            <circle cx="14" cy="24" r="3.5" fill="#ffffff" />
            <line x1="28" y1="18" x2="68" y2="18" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="28" y1="24" x2="62" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="28" y1="31" x2="48" y2="31" stroke={col || '#7530fb'} strokeWidth="1.2" />
        </svg>
    ),

    'pq-compact-inline-callout': (col: string = '#7530fb', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="8" fill={light || '#f1f5f9'} stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="14" cy="24" r="2.5" fill={col || '#7530fb'} />
            <line x1="21" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="53" y1="24" x2="68" y2="24" stroke={col || '#7530fb'} strokeWidth="1" />
        </svg>
    ),

    // ── Section Label Thumbnails (10 Styles) ────────────────────────────────
    'sl-classic-pill-capsule': (col: string = '#7530fb', light: string = '#f3eeff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="18" width="60" height="12" rx="6" fill={light || '#f3eeff'} stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="20" y1="24" x2="60" y2="24" stroke={col || '#7530fb'} strokeWidth="2" />
        </svg>
    ),

    'sl-minimalist-hairline-accent': (col: string = '#7530fb', _light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="17" width="3" height="14" fill={col || '#7530fb'} />
            <circle cx="15" cy="24" r="1.5" fill={col || '#7530fb'} />
            <line x1="20" y1="24" x2="64" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'sl-editorial-serif-crest': (col: string = '#d4af37', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="8" y1="24" x2="26" y2="24" stroke={col || '#d4af37'} strokeWidth="0.8" />
            <circle cx="31" cy="24" r="1" fill={col || '#d4af37'} />
            <line x1="36" y1="24" x2="44" y2="24" stroke="#1c1917" strokeWidth="2" />
            <circle cx="49" cy="24" r="1" fill={col || '#d4af37'} />
            <line x1="54" y1="24" x2="72" y2="24" stroke={col || '#d4af37'} strokeWidth="0.8" />
        </svg>
    ),

    'sl-industrial-spec-badge': (col: string = '#f59e0b', light: string = '#0f172a') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill={light || '#0f172a'} />
            <rect x="8" y="17" width="3" height="14" fill={col || '#f59e0b'} />
            <circle cx="16" cy="24" r="1.5" fill={col || '#f59e0b'} />
            <line x1="22" y1="24" x2="64" y2="24" stroke="#f8fafc" strokeWidth="1.8" />
        </svg>
    ),

    'sl-segmented-dualtone-chip': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="17" width="60" height="14" rx="4" fill={light || '#f8fafc'} stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="10" y="17" width="14" height="14" fill={col || '#7530fb'} />
            <circle cx="17" cy="24" r="2" fill="#ffffff" />
            <line x1="30" y1="24" x2="62" y2="24" stroke="#1e1535" strokeWidth="1.8" />
        </svg>
    ),

    'sl-numbered-index-rule': (col: string = '#7530fb', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="22" width="6" height="4" rx="1" fill={col || '#7530fb'} />
            <line x1="18" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="52" y1="24" x2="72" y2="24" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
    ),

    'sl-official-verification-seal': (col: string = '#10b981', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
            <rect x="8" y="17" width="12" height="14" fill="#0f172a" />
            <circle cx="14" cy="24" r="1.5" fill={col || '#10b981'} />
            <line x1="24" y1="24" x2="52" y2="24" stroke="#0f172a" strokeWidth="1.8" />
            <rect x="58" y="17" width="14" height="14" fill={light || '#f1f5f9'} />
            <line x1="61" y1="24" x2="69" y2="24" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'sl-bold-contrast-banner': (col: string = '#7530fb', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="12" y="18" width="56" height="14" rx="2" fill="#0f172a" />
            <rect x="10" y="16" width="56" height="14" rx="2" fill={col || '#7530fb'} />
            <line x1="18" y1="23" x2="58" y2="23" stroke="#ffffff" strokeWidth="2" />
        </svg>
    ),

    'sl-tailor-stitched-parchment': (col: string = '#78716c', light: string = '#fffdfa') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill={light || '#fffdfa'} stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 1.5" />
            <rect x="8" y="17" width="16" height="14" fill="#f5f5f4" />
            <line x1="12" y1="24" x2="20" y2="24" stroke={col || '#78716c'} strokeWidth="1.2" />
            <line x1="28" y1="24" x2="66" y2="24" stroke="#1c1917" strokeWidth="1.8" />
        </svg>
    ),

    'sl-compact-dot-bullet': (col: string = '#7530fb', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="16" cy="24" r="3" fill={col || '#7530fb'} />
            <line x1="24" y1="24" x2="66" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    // ── Breadcrumb Bar Thumbnails (10 Styles) ────────────────────────────────
    'bb-classic-inline': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
            <line x1="12" y1="24" x2="26" y2="24" stroke="#64748b" strokeWidth="1.8" />
            <path d="M30 22l2 2-2 2" stroke={col} strokeWidth="1.5" />
            <line x1="36" y1="24" x2="50" y2="24" stroke="#64748b" strokeWidth="1.8" />
            <path d="M54 22l2 2-2 2" stroke={col} strokeWidth="1.5" />
            <line x1="60" y1="24" x2="68" y2="24" stroke="#1e1535" strokeWidth="2" />
        </svg>
    ),

    'bb-segmented-ribbon-pills': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="18" width="18" height="12" rx="3" fill={col} />
            <line x1="10" y1="24" x2="20" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M27 24h4m-2-2l2 2-2 2" stroke="#94a3b8" strokeWidth="1.2" />
            <rect x="34" y="18" width="18" height="12" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="38" y1="24" x2="48" y2="24" stroke="#334155" strokeWidth="1.5" />
            <path d="M55 24h4m-2-2l2 2-2 2" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="62" y1="24" x2="74" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'bb-boutique-luxury-slash': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="16" x2="74" y2="16" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="32" x2="74" y2="32" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="10" y1="24" x2="24" y2="24" stroke="#78716c" strokeWidth="1.5" />
            <line x1="28" y1="28" x2="32" y2="20" stroke={col} strokeWidth="1.2" />
            <line x1="36" y1="24" x2="48" y2="24" stroke="#78716c" strokeWidth="1.5" />
            <line x1="52" y1="28" x2="56" y2="20" stroke={col} strokeWidth="1.2" />
            <line x1="60" y1="24" x2="70" y2="24" stroke="#1c1917" strokeWidth="2" />
        </svg>
    ),

    'bb-industrial-technical-spec': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="16" width="3" height="16" fill="#f59e0b" />
            <line x1="13" y1="24" x2="26" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="30,22 34,24 30,26" fill="#f59e0b" />
            <line x1="38" y1="24" x2="50" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="54,22 58,24 54,26" fill="#f59e0b" />
            <line x1="62" y1="24" x2="74" y2="24" stroke="#f8fafc" strokeWidth="2" />
        </svg>
    ),

    'bb-minimalist-hairline-accent': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="3" height="16" fill={col} />
            <line x1="14" y1="24" x2="28" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <line x1="32" y1="27" x2="35" y2="21" stroke="#cbd5e1" strokeWidth="1.2" />
            <line x1="39" y1="24" x2="52" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <line x1="56" y1="27" x2="59" y2="21" stroke="#cbd5e1" strokeWidth="1.2" />
            <line x1="63" y1="24" x2="74" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'bb-trust-certified-channel': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="9" y="19" width="8" height="10" rx="1.5" fill="#10b981" />
            <line x1="21" y1="24" x2="34" y2="24" stroke="#064e3b" strokeWidth="1.5" />
            <path d="M38 22l2 2-2 2" stroke="#10b981" strokeWidth="1.5" />
            <line x1="44" y1="24" x2="56" y2="24" stroke="#047857" strokeWidth="1.5" />
            <path d="M60 22l2 2-2 2" stroke="#10b981" strokeWidth="1.5" />
            <line x1="65" y1="24" x2="71" y2="24" stroke="#064e3b" strokeWidth="2" />
        </svg>
    ),

    'bb-bold-contrast-banner': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <line x1="10" y1="24" x2="24" y2="24" stroke="#a1a1aa" strokeWidth="1.5" />
            <line x1="27" y1="28" x2="30" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="30" y1="28" x2="33" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="37" y1="24" x2="49" y2="24" stroke="#e4e4e7" strokeWidth="1.5" />
            <line x1="52" y1="28" x2="55" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="55" y1="28" x2="58" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="62" y1="24" x2="72" y2="24" stroke="#ffffff" strokeWidth="2" />
        </svg>
    ),

    'bb-catalog-index-tab': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="8" y="19" width="16" height="10" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="11" y1="24" x2="21" y2="24" stroke={col} strokeWidth="1.2" />
            <line x1="28" y1="24" x2="42" y2="24" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="46" cy="24" r="1" fill="#94a3b8" />
            <line x1="50" y1="24" x2="62" y2="24" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="66" cy="24" r="1" fill="#94a3b8" />
            <line x1="70" y1="24" x2="74" y2="24" stroke={col} strokeWidth="2" />
        </svg>
    ),

    'bb-stepper-progress-nav': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="12" cy="24" r="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="20" y1="24" x2="28" y2="24" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="34" cy="24" r="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="42" y1="24" x2="50" y2="24" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="56" cy="24" r="4" fill={col} />
            <line x1="64" y1="24" x2="74" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'bb-compact-dot-bullet': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="12" y1="24" x2="24" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="28" cy="24" r="1.5" fill={col} />
            <line x1="32" y1="24" x2="46" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="50" cy="24" r="1.5" fill={col} />
            <line x1="54" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    // ── International Shipping Thumbnails (10 Styles) ─────────────────────────
    'is-classic-amber-notice': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="4" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1" />
            <circle cx="15" cy="24" r="5" fill="#ea580c" fillOpacity="0.2" stroke="#ea580c" strokeWidth="0.8" />
            <line x1="24" y1="20" x2="66" y2="20" stroke="#c2410c" strokeWidth="1.8" />
            <line x1="24" y1="26" x2="58" y2="26" stroke="#9a3412" strokeWidth="1.2" />
        </svg>
    ),

    'is-global-courier-track': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="6" y="8" width="22" height="6" rx="2" fill="#0284c7" />
            <line x1="6" y1="19" x2="48" y2="19" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="6" y1="26" x2="68" y2="26" stroke="#64748b" strokeWidth="1.2" />
            <rect x="6" y="32" width="24" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="34" y="32" width="24" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'is-official-customs-declaration': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.5" strokeDasharray="2 1.5" />
            <rect x="6" y="8" width="68" height="8" rx="2" fill="#f5f5f4" />
            <line x1="10" y1="12" x2="38" y2="12" stroke="#44403c" strokeWidth="1.2" />
            <line x1="8" y1="22" x2="46" y2="22" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="8" y1="28" x2="68" y2="28" stroke="#78716c" strokeWidth="1.2" />
            <line x1="8" y1="36" x2="52" y2="36" stroke="#a8a29e" strokeWidth="1" />
        </svg>
    ),

    'is-ebay-eis-managed-hub': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
            <rect x="6" y="14" width="14" height="20" rx="3" fill="#eff6ff" stroke="#dbeafe" strokeWidth="0.8" />
            <rect x="25" y="12" width="20" height="5" rx="1.5" fill="#dbeafe" />
            <line x1="25" y1="22" x2="68" y2="22" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="25" y1="29" x2="62" y2="29" stroke="#334155" strokeWidth="1.2" />
        </svg>
    ),

    'is-minimalist-hairline-slate': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="12" width="3" height="24" rx="1" fill="#0284c7" />
            <line x1="14" y1="20" x2="56" y2="20" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="14" y1="27" x2="70" y2="27" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'is-duty-free-ioss-compliance': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <circle cx="15" cy="24" r="5" fill="#16a34a" />
            <line x1="24" y1="20" x2="68" y2="20" stroke="#166534" strokeWidth="1.8" />
            <line x1="24" y1="27" x2="60" y2="27" stroke="#15803d" strokeWidth="1.2" />
        </svg>
    ),

    'is-stepper-transit-timeline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="12" x2="38" y2="12" stroke="#0f172a" strokeWidth="1.8" />
            <rect x="6" y="18" width="20" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="30" y="18" width="20" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="54" y="18" width="20" height="18" rx="2" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
        </svg>
    ),

    'is-industrial-heavy-freight': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="10" width="3" height="28" rx="1" fill="#f59e0b" />
            <line x1="14" y1="15" x2="38" y2="15" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="14" y1="22" x2="66" y2="22" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="14" y1="29" x2="56" y2="29" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
    ),

    'is-luxury-concierge-dossier': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="8" x2="74" y2="8" stroke="#b45309" strokeWidth="1.5" />
            <line x1="26" y1="15" x2="54" y2="15" stroke="#b45309" strokeWidth="1" />
            <line x1="16" y1="23" x2="64" y2="23" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="20" y1="30" x2="60" y2="30" stroke="#78716c" strokeWidth="1.2" />
        </svg>
    ),

    'is-compact-pill-bullet': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="14" cy="24" r="2.5" fill="#0284c7" />
            <line x1="20" y1="24" x2="40" y2="24" stroke="#0284c7" strokeWidth="1.6" />
            <circle cx="44" cy="24" r="1" fill="#94a3b8" />
            <line x1="48" y1="24" x2="68" y2="24" stroke="#475569" strokeWidth="1.2" />
        </svg>
    ),

    // ── Highlight Text Thumbnails (10 Styles) ────────────────────────────────
    'ht-classic-neon-strip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="2" fill="#b8fa33" />
            <path d="M16 20l-2 4h3l-1 4 4-5h-3l1-3z" fill="#1e1535" />
            <line x1="24" y1="24" x2="68" y2="24" stroke="#1e1535" strokeWidth="2" />
        </svg>
    ),

    'ht-urgent-crimson-tape': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="2" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.8" />
            <rect x="6" y="15" width="3" height="18" fill="#dc2626" />
            <rect x="12" y="20" width="14" height="8" rx="1.5" fill="#fee2e2" />
            <line x1="30" y1="24" x2="68" y2="24" stroke="#991b1b" strokeWidth="1.8" />
        </svg>
    ),

    'ht-minimalist-hairline-capsule': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="17" width="60" height="14" rx="7" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <circle cx="17" cy="24" r="2" fill={col} />
            <line x1="23" y1="24" x2="62" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'ht-industrial-spec-ticker': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="15" width="3" height="18" fill="#f59e0b" />
            <line x1="13" y1="24" x2="28" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="32" y1="24" x2="70" y2="24" stroke="#f8fafc" strokeWidth="1.8" />
        </svg>
    ),

    'ht-luxury-gold-crest': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="15" x2="74" y2="15" stroke="#b45309" strokeWidth="1.2" />
            <line x1="12" y1="24" x2="26" y2="24" stroke="#b45309" strokeWidth="1" />
            <line x1="30" y1="24" x2="50" y2="24" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="54" y1="24" x2="68" y2="24" stroke="#b45309" strokeWidth="1" />
        </svg>
    ),

    'ht-pill-badge-duo': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="18" width="16" height="12" rx="3" fill={col} />
            <line x1="28" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'ht-stitched-coupon-voucher': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="3" fill="#fffdfa" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="2 1.5" />
            <circle cx="14" cy="24" r="2.5" fill="#0284c7" />
            <line x1="20" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'ht-verified-trust-emerald': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="14" cy="24" r="3.5" fill="#16a34a" />
            <line x1="22" y1="24" x2="68" y2="24" stroke="#166534" strokeWidth="1.8" />
        </svg>
    ),

    'ht-bold-dark-impact': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <line x1="12" y1="28" x2="16" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="15" y1="28" x2="19" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="24" y1="24" x2="56" y2="24" stroke="#ffffff" strokeWidth="2" />
            <line x1="61" y1="28" x2="65" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="64" y1="28" x2="68" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
        </svg>
    ),

    'ht-compact-bullet-pip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="11" y="22" width="4" height="4" fill={col} />
            <line x1="19" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    // ── Product Title Thumbnails (10 Styles) ─────────────────────────────────

    'pt-classic-baseline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="18" x2="68" y2="18" stroke="#1e1535" strokeWidth="2.5" />
            <line x1="8" y1="24" x2="48" y2="24" stroke="#1e1535" strokeWidth="2.5" />
            <line x1="8" y1="32" x2="38" y2="32" stroke="#6b7280" strokeWidth="1.2" />
        </svg>
    ),

    'pt-pill-badge-header': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="22" height="6" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="12" cy="13" r="1.5" fill="#16a34a" />
            <line x1="8" y1="23" x2="72" y2="23" stroke="#0f172a" strokeWidth="2.2" />
            <line x1="8" y1="30" x2="52" y2="30" stroke="#0f172a" strokeWidth="2.2" />
        </svg>
    ),

    'pt-accent-bar-left': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="12" width="3" height="24" rx="1" fill={col} />
            <line x1="16" y1="18" x2="70" y2="18" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="16" y1="25" x2="56" y2="25" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="16" y1="32" x2="42" y2="32" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'pt-luxury-serif-centered': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="26" y1="12" x2="54" y2="12" stroke="#b45309" strokeWidth="1" />
            <line x1="14" y1="21" x2="66" y2="21" stroke="#1c1917" strokeWidth="2" />
            <line x1="20" y1="28" x2="60" y2="28" stroke="#1c1917" strokeWidth="2" />
            <line x1="24" y1="35" x2="56" y2="35" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'pt-modern-split-card': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="20" x2="48" y2="20" stroke="#0f172a" strokeWidth="2" />
            <line x1="8" y1="27" x2="40" y2="27" stroke="#0f172a" strokeWidth="2" />
            <rect x="56" y="15" width="16" height="18" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'pt-industrial-part-spec': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="12" x2="36" y2="12" stroke="#0284c7" strokeWidth="1.2" />
            <line x1="8" y1="21" x2="72" y2="21" stroke="#0f172a" strokeWidth="2.2" />
            <rect x="8" y="28" width="16" height="6" rx="1.5" fill="#0f172a" />
            <line x1="28" y1="31" x2="54" y2="31" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'pt-underlined-accent-rule': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="17" x2="68" y2="17" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="8" y1="24" x2="50" y2="24" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="8" y1="29" x2="26" y2="29" stroke={col} strokeWidth="2" />
            <line x1="26" y1="29" x2="72" y2="29" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),

    'pt-dark-obsidian-badge': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" />
            <rect x="8" y="11" width="16" height="5" rx="1.5" fill="#b8fa33" />
            <line x1="8" y1="23" x2="72" y2="23" stroke="#ffffff" strokeWidth="2.2" />
            <line x1="8" y1="30" x2="52" y2="30" stroke="#ffffff" strokeWidth="2.2" />
        </svg>
    ),

    'pt-verified-shield-banner': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="15" width="12" height="14" rx="2" fill="#eff6ff" stroke="#dbeafe" strokeWidth="0.8" />
            <line x1="24" y1="16" x2="48" y2="16" stroke="#2563eb" strokeWidth="1" />
            <line x1="24" y1="23" x2="72" y2="23" stroke="#0f172a" strokeWidth="2" />
            <line x1="24" y1="29" x2="58" y2="29" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'pt-compact-inline-pip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="18" x2="72" y2="18" stroke="#1e1535" strokeWidth="2" />
            <circle cx="10" cy="28" r="1.5" fill={col} />
            <line x1="16" y1="28" x2="54" y2="28" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    // ── FAQ Block Thumbnails (10 Styles) ─────────────────────────────────────
    'faq-classic-stacked': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="9" rx="2" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="10" y1="12.5" x2="42" y2="12.5" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="10" y1="21" x2="62" y2="21" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="27" width="68" height="9" rx="2" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="10" y1="31.5" x2="46" y2="31.5" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="10" y1="40" x2="56" y2="40" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-boxed-cards-grid': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="7" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="9" y="10" width="5" height="5" rx="1" fill={col} />
            <line x1="17" y1="12.5" x2="48" y2="12.5" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="9" y1="18" x2="64" y2="18" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="9" y="29" width="5" height="5" rx="1" fill={col} />
            <line x1="17" y1="31.5" x2="52" y2="31.5" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="9" y1="37" x2="60" y2="37" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-accent-rail-left': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="9" width="2.5" height="13" rx="1" fill={col} />
            <line x1="12" y1="12" x2="54" y2="12" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="12" y1="18" x2="66" y2="18" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="26" width="2.5" height="13" rx="1" fill={col} />
            <line x1="12" y1="29" x2="48" y2="29" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="12" y1="35" x2="62" y2="35" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-numbered-circle-steps': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="12" cy="15" r="4.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="0.8" />
            <line x1="20" y1="13" x2="58" y2="13" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="20" y1="18" x2="68" y2="18" stroke="#64748b" strokeWidth="1" />
            <circle cx="12" cy="33" r="4.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="0.8" />
            <line x1="20" y1="31" x2="52" y2="31" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="20" y1="36" x2="64" y2="36" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-split-speech-bubbles': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="56" height="7" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="11.5" x2="46" y2="11.5" stroke={col} strokeWidth="1.2" />
            <line x1="16" y1="19" x2="66" y2="19" stroke="#059669" strokeWidth="1.2" />
            <rect x="6" y="27" width="56" height="7" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="30.5" x2="42" y2="30.5" stroke={col} strokeWidth="1.2" />
            <line x1="16" y1="38" x2="62" y2="38" stroke="#059669" strokeWidth="1.2" />
        </svg>
    ),

    'faq-minimalist-hairline-rule': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="10" x2="52" y2="10" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="16" x2="68" y2="16" stroke="#64748b" strokeWidth="1" />
            <line x1="8" y1="23" x2="72" y2="23" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="29" x2="48" y2="29" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="35" x2="64" y2="35" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-industrial-technical-ledger': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="8" width="68" height="14" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="6" y="8" width="2" height="14" fill="#f59e0b" />
            <line x1="12" y1="12" x2="28" y2="12" stroke="#f59e0b" strokeWidth="1" />
            <line x1="12" y1="17" x2="56" y2="17" stroke="#94a3b8" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="14" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="6" y="26" width="2" height="14" fill="#f59e0b" />
            <line x1="12" y1="30" x2="32" y2="30" stroke="#f59e0b" strokeWidth="1" />
            <line x1="12" y1="35" x2="60" y2="35" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'faq-luxury-serif-editorial': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="8" x2="74" y2="8" stroke="#b45309" strokeWidth="1.2" />
            <line x1="10" y1="15" x2="48" y2="15" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="14" y1="21" x2="66" y2="21" stroke="#78716c" strokeWidth="1" />
            <line x1="10" y1="28" x2="70" y2="28" stroke="#e7e5e4" strokeWidth="0.8" />
            <line x1="10" y1="34" x2="44" y2="34" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="14" y1="40" x2="62" y2="40" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'faq-verified-trust-shield': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="14" rx="2" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="12" cy="15" r="3" fill="#16a34a" />
            <line x1="18" y1="13" x2="48" y2="13" stroke="#166534" strokeWidth="1.5" />
            <line x1="18" y1="18" x2="64" y2="18" stroke="#334155" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="14" rx="2" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="12" cy="33" r="3" fill="#16a34a" />
            <line x1="18" y1="31" x2="44" y2="31" stroke="#166534" strokeWidth="1.5" />
            <line x1="18" y1="36" x2="60" y2="36" stroke="#334155" strokeWidth="1" />
        </svg>
    ),

    'faq-compact-mobile-accordion': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="12" x2="46" y2="12" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M68 10.5l2 1.5-2 1.5" stroke={col} strokeWidth="1" fill="none" />
            <line x1="10" y1="20" x2="62" y2="20" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="30" x2="42" y2="30" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M68 28.5l2 1.5-2 1.5" stroke={col} strokeWidth="1" fill="none" />
            <line x1="10" y1="38" x2="58" y2="38" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),
    'accent-ribbon': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill={col} />
            <circle cx="14" cy="24" r="3" fill="#ffffff" />
            <line x1="26" y1="16" x2="26" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="34" cy="24" r="3" fill="#ffffff" />
            <line x1="46" y1="16" x2="46" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="54" cy="24" r="3" fill="#ffffff" />
            <line x1="66" y1="16" x2="66" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="72" cy="24" r="3" fill="#ffffff" />
        </svg>
    ),

    'shield-crest': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.2" />
            <path d="M14 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
            <path d="M34 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
            <path d="M54 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
            <path d="M68 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
        </svg>
    ),

    'hairline-card': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="23" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="41" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="59" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
        </svg>
    ),

    'dark-obsidian': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <circle cx="14" cy="20" r="3" fill="#b8fa33" />
            <line x1="26" y1="14" x2="26" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="34" cy="20" r="3" fill="#b8fa33" />
            <line x1="46" y1="14" x2="46" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="54" cy="20" r="3" fill="#b8fa33" />
            <line x1="66" y1="14" x2="66" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="72" cy="20" r="3" fill="#b8fa33" />
        </svg>
    ),
    // ── Why Buy From Us (10 Variants) ──────────────────────────────────────────
    'why-classic-centered': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="28" y1="8" x2="52" y2="8" stroke="#1e1535" strokeWidth="2" />
            <circle cx="16" cy="18" r="3" fill={col} />
            <line x1="10" y1="26" x2="22" y2="26" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="12" y1="31" x2="20" y2="31" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="40" cy="18" r="3" fill={col} />
            <line x1="34" y1="26" x2="46" y2="26" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="36" y1="31" x2="44" y2="31" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="64" cy="18" r="3" fill={col} />
            <line x1="58" y1="26" x2="70" y2="26" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="60" y1="31" x2="68" y2="31" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'why-boxed-cards-grid': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="10" width="21" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="10" width="22" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="54" y="10" width="21" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="15.5" cy="18" r="3" fill={col} />
            <circle cx="40" cy="18" r="3" fill={col} />
            <circle cx="64.5" cy="18" r="3" fill={col} />
        </svg>
    ),

    'why-horizontal-feature-rows': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="11" cy="12.5" r="2" fill={col} />
            <line x1="17" y1="12.5" x2="68" y2="12.5" stroke="#1e1535" strokeWidth="1.2" />
            <rect x="6" y="20" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="11" cy="24.5" r="2" fill={col} />
            <line x1="17" y1="24.5" x2="68" y2="24.5" stroke="#1e1535" strokeWidth="1.2" />
            <rect x="6" y="32" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="11" cy="36.5" r="2" fill={col} />
            <line x1="17" y1="36.5" x2="68" y2="36.5" stroke="#1e1535" strokeWidth="1.2" />
        </svg>
    ),

    'why-split-hero-pledge': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="6" width="26" height="36" rx="3" fill={col} />
            <circle cx="17" cy="20" r="5" fill="#ffffff" />
            <line x1="36" y1="12" x2="74" y2="12" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="36" y1="16" x2="68" y2="16" stroke="#94a3b8" strokeWidth="1" />
            <line x1="36" y1="24" x2="74" y2="24" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="36" y1="28" x2="68" y2="28" stroke="#94a3b8" strokeWidth="1" />
            <line x1="36" y1="36" x2="74" y2="36" stroke="#1e1535" strokeWidth="1.5" />
        </svg>
    ),

    'why-numbered-editorial-ledger': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="10" x2="74" y2="10" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="30" y1="16" x2="30" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="54" y1="16" x2="54" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="18" x2="18" y2="18" stroke={col} strokeWidth="2" />
            <line x1="34" y1="18" x2="42" y2="18" stroke={col} strokeWidth="2" />
            <line x1="58" y1="18" x2="66" y2="18" stroke={col} strokeWidth="2" />
        </svg>
    ),

    'why-numbered-steps-timeline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="16" y1="20" x2="64" y2="20" stroke="#bbf7d0" strokeWidth="2" />
            <circle cx="16" cy="20" r="4.5" fill="#16a34a" />
            <circle cx="40" cy="20" r="4.5" fill="#16a34a" />
            <circle cx="64" cy="20" r="4.5" fill="#16a34a" />
            <line x1="11" y1="29" x2="21" y2="29" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="35" y1="29" x2="45" y2="29" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="59" y1="29" x2="69" y2="29" stroke="#1e1535" strokeWidth="1.2" />
        </svg>
    ),

    'why-compact-banner-strip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
            <circle cx="12" cy="24" r="3" fill={col} />
            <line x1="17" y1="24" x2="26" y2="24" stroke="#1e1535" strokeWidth="1.8" />
            <line x1="30" y1="18" x2="30" y2="30" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="36" cy="24" r="3" fill={col} />
            <line x1="41" y1="24" x2="50" y2="24" stroke="#1e1535" strokeWidth="1.8" />
            <line x1="54" y1="18" x2="54" y2="30" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="60" cy="24" r="3" fill={col} />
            <line x1="65" y1="24" x2="74" y2="24" stroke="#1e1535" strokeWidth="1.8" />
        </svg>
    ),

    'why-official-guarantee-shield': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.2" />
            <circle cx="16" cy="22" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
            <circle cx="40" cy="22" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
            <circle cx="64" cy="22" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
        </svg>
    ),

    'why-dark-merchant-flagship': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <circle cx="16" cy="20" r="3" fill="#b8fa33" />
            <line x1="30" y1="14" x2="30" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="40" cy="20" r="3" fill="#b8fa33" />
            <line x1="54" y1="14" x2="54" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="64" cy="20" r="3" fill="#b8fa33" />
        </svg>
    ),

    'why-two-column-checklist': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="6" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    // ── Urgency Stock Bar (10 Styles) ──────────────────────────────────────────
    'urgency-classic-pulse': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fee2e2" />
            <circle cx="16" cy="24" r="3.5" fill="#ef4444" />
            <line x1="24" y1="24" x2="68" y2="24" stroke="#991b1b" strokeWidth="2" />
        </svg>
    ),

    'urgency-inventory-progress-track': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#fed7aa" strokeWidth="1" />
            <rect x="6" y="10" width="18" height="5" rx="1.5" fill="#ffedd5" />
            <line x1="28" y1="12.5" x2="74" y2="12.5" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="6" y="22" width="68" height="5" rx="2" fill="#f1f5f9" />
            <rect x="6" y="22" width="54" height="5" rx="2" fill="#ea580c" />
            <line x1="6" y1="34" x2="48" y2="34" stroke="#64748b" strokeWidth="1" />
            <line x1="56" y1="34" x2="74" y2="34" stroke="#ea580c" strokeWidth="1.5" />
        </svg>
    ),

    'urgency-high-velocity-ticker': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
            <circle cx="14" cy="24" r="4.5" fill="#ede9fe" />
            <path d="M14 20l-1.5 3.5h3l-1.5 4.5 4-5h-3l1.5-3z" fill={col} />
            <line x1="22" y1="21" x2="52" y2="21" stroke="#1e1535" strokeWidth="1.8" />
            <line x1="22" y1="27" x2="46" y2="27" stroke="#6b7280" strokeWidth="1" />
            <rect x="56" y="18" width="18" height="12" rx="6" fill="#ffffff" stroke="#ddd6fe" strokeWidth="0.8" />
        </svg>
    ),

    'urgency-industrial-caution-stripe': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="0" y="0" width="4" height="48" fill="#f59e0b" />
            <rect x="8" y="10" width="26" height="5" rx="1.5" fill="#27272a" stroke="#f59e0b" strokeWidth="0.6" />
            <line x1="8" y1="22" x2="52" y2="22" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="8" y1="28" x2="44" y2="28" stroke="#a1a1aa" strokeWidth="1" />
            <rect x="58" y="16" width="16" height="16" rx="2" fill="#f59e0b" />
        </svg>
    ),

    'urgency-warehouse-clearance-dossier': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="15" cy="24" r="5" stroke="#b91c1c" strokeWidth="1" />
            <rect x="24" y="14" width="22" height="4" rx="1" fill="#fee2e2" />
            <line x1="24" y1="23" x2="54" y2="23" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="24" y1="29" x2="48" y2="29" stroke="#78716c" strokeWidth="1" />
            <rect x="58" y="19" width="16" height="10" rx="2" fill="#fee2e2" stroke="#fecaca" strokeWidth="0.8" />
        </svg>
    ),

    'urgency-minimalist-hairline-banner': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" />
            <line x1="6" y1="14" x2="74" y2="14" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="34" x2="74" y2="34" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="16" cy="24" r="2.5" fill="#0f172a" />
            <line x1="22" y1="24" x2="52" y2="24" stroke="#0f172a" strokeWidth="1.6" />
            <line x1="56" y1="20" x2="56" y2="28" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="60" y1="24" x2="70" y2="24" stroke={col} strokeWidth="1.8" />
        </svg>
    ),

    'urgency-split-hero-countdown-dispatch': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="40" y1="8" x2="40" y2="40" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="14" cy="24" r="3.5" fill="#fee2e2" />
            <line x1="20" y1="21" x2="35" y2="21" stroke="#dc2626" strokeWidth="1.5" />
            <line x1="20" y1="27" x2="33" y2="27" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="48" cy="24" r="3.5" fill="#dcfce7" />
            <line x1="54" y1="21" x2="70" y2="21" stroke="#16a34a" strokeWidth="1.5" />
            <line x1="54" y1="27" x2="68" y2="27" stroke="#475569" strokeWidth="1" />
        </svg>
    ),

    'urgency-bold-dark-midnight-alert': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect x="8" y="12" width="24" height="4" rx="1.5" fill="#1e293b" />
            <line x1="8" y1="23" x2="52" y2="23" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="8" y1="29" x2="42" y2="29" stroke="#94a3b8" strokeWidth="1" />
            <rect x="56" y="16" width="18" height="16" rx="3" fill="#b8fa33" />
        </svg>
    ),

    'urgency-collector-vault-numbered-batch': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fefce8" stroke="#fde68a" strokeWidth="1" />
            <circle cx="14" cy="24" r="4.5" fill="#ffffff" stroke="#fde68a" strokeWidth="0.8" />
            <line x1="22" y1="18" x2="48" y2="18" stroke="#b45309" strokeWidth="1" />
            <line x1="22" y1="25" x2="56" y2="25" stroke="#1e1535" strokeWidth="1.8" />
            <rect x="58" y="18" width="16" height="12" rx="2" fill="#ffffff" stroke="#fde68a" strokeWidth="0.8" />
        </svg>
    ),

    'urgency-compact-inline-capsule': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" />
            {/* Clean Rounded Capsule with Slate Border */}
            <rect x="5" y="16" width="70" height="16" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Left Red Badge */}
            <rect x="7" y="18" width="18" height="12" rx="6" fill="#dc2626" />
            <line x1="10" y1="24" x2="22" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            {/* White Center Text Line */}
            <line x1="28" y1="24" x2="52" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            {/* Cyan Right Status Pill */}
            <rect x="55" y="19" width="18" height="10" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
            <line x1="59" y1="24" x2="69" y2="24" stroke="#38bdf8" strokeWidth="1.2" />
        </svg>
    ),

    // ── Rectangle / Shape Container (10 Styles) ────────────────────────────────
    'rect-solid-fill': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#f3eeff" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),

    'rect-two-tone-split': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="14" width="46" height="20" rx="3" fill="#0f172a" />
            <rect x="56" y="14" width="16" height="20" rx="3" fill={col} />
        </svg>
    ),

    'rect-triple-accent-stripe': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="8" y="10" width="3" height="28" fill={col} />
            <rect x="12" y="10" width="3" height="28" fill="#38bdf8" />
            <rect x="16" y="10" width="3" height="28" fill="#b8fa33" />
        </svg>
    ),

    'rect-accent-left-rail': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="8" y="10" width="4" height="28" rx="1" fill={col} />
        </svg>
    ),

    'rect-gradient-horizon': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="rectGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={col} />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="14" width="64" height="20" rx="4" fill="url(#rectGrad)" />
        </svg>
    ),

    'rect-etched-luxury-hairline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="16" x2="72" y2="16" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="32" x2="72" y2="32" stroke="#0f172a" strokeWidth="1" />
        </svg>
    ),

    'rect-industrial-hazard': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="4" fill="#f59e0b" />
        </svg>
    ),

    'rect-dashed-coupon-frame': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.2" strokeDasharray="3 2" />
        </svg>
    ),

    'rect-pill-capsule-badge': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="16" width="64" height="16" rx="8" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),

    'rect-warning-amber-notice': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="10" width="68" height="28" rx="4" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1" />
            <rect x="6" y="10" width="4" height="28" fill="#f59e0b" />
        </svg>
    ),
}

function VariantThumbnail({ variantId, isSelected }: { variantId: string; isSelected: boolean }) {

    const col = isSelected ? C.primary : C.secondary
    const light = isSelected ? C.primaryLight : '#f3f4f6'
    const render = VARIANT_THUMBNAILS[variantId]
    if (render) return render(col, light)
    // ── Auto-generated fallback for any future variant not in the map ─────────
    // Shows a simple coloured bar with the first letter of the variant id
    return (
        <div style={{
            height: 32, backgroundColor: light, borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${isSelected ? col : '#e5e7eb'}`,
        }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: col, textTransform: 'uppercase' as const }}>
                {variantId.slice(0, 3)}
            </span>
        </div>
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
                    currentVariant={(props as any).variant ?? (block.type === 'rectangle' || (block.type as string) === 'shape' ? 'rect-solid-fill' : block.type === 'urgency_bar' || (block.type as string) === 'urgency' ? 'urgency-classic-pulse' : block.type === 'why_buy_from_us' || (block.type as string) === 'why_buy' ? 'why-classic-centered' : block.type === 'faq_block' || (block.type as string) === 'faq' || (block.type as string) === 'faq_section' ? 'faq-classic-stacked' : block.type === 'product_title' || (block.type as string) === 'title' ? 'pt-classic-baseline' : block.type === 'highlight_text' || (block.type as string) === 'highlight' ? 'ht-classic-neon-strip' : block.type === 'international_shipping' || (block.type as string) === 'international' ? 'is-classic-amber-notice' : block.type === 'breadcrumb_bar' || (block.type as string) === 'breadcrumb' ? 'bb-classic-inline' : block.type === 'hero_header' ? 'gradient' : block.type === 'product_description' ? 'plain' : block.type === 'product_variants' ? 'swatches-sizes' : block.type === 'whats_in_the_box' ? 'simple-list' : block.type === 'hero_product' ? 'hp-default' : block.type === 'cta_banner' ? 'ctab-trust-bar' : block.type === 'seller_info' ? 'authority-split' : block.type === 'logo_bar' ? 'flat-row' : block.type === 'bundle_deal' ? 'tri-tier-columns' : block.type === 'price_tag' ? 'classic-strike' : block.type === 'store_footer' ? 'classic-dark-band' : block.type === 'category_nav' ? 'cat-classic-dark' : (block.type as string) === 'free_shipping_banner' || (block.type as string) === 'free_shipping' ? 'ship-express-courier-strip' : block.type === 'item_specifics' || (block.type as string) === 'specifics_table' ? 'is-dual-column-zebra-card' : block.type === 'authenticity_guarantee' || (block.type as string) === 'authenticity' ? 'auth-ebay-blue-official-shield' : block.type === 'condition_details' || (block.type as string) === 'condition' ? 'cd-cosmetic-grade-split' : block.type === 'compatibility_table' || (block.type as string) === 'compatibility' ? 'compat-classic-zebra-table' : block.type === 'product_comparison' || (block.type as string) === 'comparison' ? 'comp-classic-header-table' : block.type === 'key_features_grid' ? 'feat-classic-cards-grid' : block.type === 'vat_notice' || (block.type as string) === 'vat' ? 'vat-classic-card' : block.type === 'feedback_score' || (block.type as string) === 'feedback' ? 'fb-classic-split-card' : block.type === 'pull_quote' || (block.type as string) === 'quote' ? 'pq-classic-serif-centered' : block.type === 'section_label' || (block.type as string) === 'label' ? 'sl-classic-pill-capsule' : 'default')}
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
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
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
                <Section title="Colours">
                    <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                    <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                    <ColorRow label="Accent colour" value={props.accentColor ?? '#7530fb'} onChange={v => updateProps({ accentColor: v })} />
                </Section>
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
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e40af'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#bfdbfe'} onChange={v => updateProps({ borderColor: v })} />
                        <ColorRow label="Icon colour" value={props.accentColor ?? '#3b82f6'} onChange={v => updateProps({ accentColor: v })} />
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
                    </Section>
                </>
            )

        case 'vat_notice':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8fafc'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#64748b'} onChange={v => updateProps({ textColor: v })} />
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

        case 'social_links':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Icon colour" value={props.iconColor ?? '#7530fb'} onChange={v => updateProps({ iconColor: v })} />
                        <ColorRow label="Label colour" value={props.labelColor ?? '#1e1535'} onChange={v => updateProps({ labelColor: v })} />
                    </Section>
                    <Section title="Size">
                        <SliderInput label="Icon size" value={props.iconSize ?? 28} min={16} max={48} suffix="px" onChange={v => updateProps({ iconSize: v })} />
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
                        <ColorRow label="Star colour" value={props.starColor ?? '#f59e0b'} onChange={v => updateProps({ starColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#374151'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Author colour" value={props.authorColor ?? '#6b7280'} onChange={v => updateProps({ authorColor: v })} />
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
                </>
            )

        case 'social_links':
            return (
                <>
                    <Section title="Label">
                        <TextInput label="Follow text" value={props.followText ?? 'Follow us for deals & updates'} onChange={v => updateProps({ followText: v })} />
                        <ColorRow label="Label colour" value={props.labelColor ?? '#6b7280'} onChange={v => updateProps({ labelColor: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#f8f7ff'} onChange={v => updateProps({ bgColor: v })} />
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
                    <Section title="Caption">
                        <TextInput label="Caption text" value={props.caption ?? ''} onChange={v => updateProps({ caption: v })} />
                        {phButton('caption', 'caption')}
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

        case 'heading':
            return (
                <>
                    <Section title="Content">
                        <TextInput label="Text" value={props.text ?? 'Section Heading'} onChange={v => updateProps({ text: v })} />
                        <SelectInput
                            label="Level"
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
                </>
            )

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
                <div style={{ padding: '8px 0' }}>
                    <InfoBox>
                        ✅ This block displays a fixed authenticity guarantee badge — no editable attributes.
                        Use the Styles tab to adjust colours and spacing.
                    </InfoBox>
                </div>
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
