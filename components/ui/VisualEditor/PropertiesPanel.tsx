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

import React, { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
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
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PropertiesPanel({
    block,
    placeholders,
    onChange,
    onDeselect,
    selectedSubSlot,
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
            <rect x="16" y="4" width="48" height="28" rx="4" fill={col} opacity="0.3" />
            <circle cx="30" cy="14" r="5" fill={col} opacity="0.4" />
            <path d="M16 28 Q32 20 48 24 Q60 20 64 28" stroke={col} strokeWidth="1.5" fill="none" opacity="0.5" />
        </svg>
    ),
    'gallery': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="4" width="72" height="18" rx="3" fill={col} opacity="0.3" />
            <circle cx="16" cy="11" r="4" fill={col} opacity="0.4" />
            <rect x="4" y="25" width="16" height="8" rx="2" fill={col} opacity="0.4" />
            <rect x="22" y="25" width="16" height="8" rx="2" fill={col} opacity="0.3" />
            <rect x="40" y="25" width="16" height="8" rx="2" fill={col} opacity="0.4" />
            <rect x="58" y="25" width="16" height="8" rx="2" fill={col} opacity="0.3" />
        </svg>
    ),
    'fullwidth': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.25" />
            <circle cx="20" cy="16" r="7" fill={col} opacity="0.3" />
            <path d="M0 28 Q20 18 40 22 Q60 16 80 24" stroke={col} strokeWidth="2" fill="none" opacity="0.4" />
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
            <rect x="8" y="4" width="64" height="28" rx="4" stroke={col} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <circle cx="40" cy="16" r="8" fill={col} opacity="0.2" />
            <circle cx="40" cy="16" r="4" fill={col} opacity="0.3" />
            <rect x="54" y="24" width="14" height="6" rx="3" fill={col} opacity="0.5" />
        </svg>
    ),
    // ── Product Image: Comparison / Front & Back ──────────────────────────────
    'comparison': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="3" y="4" width="34" height="28" rx="3" fill={col} opacity="0.25" />
            <circle cx="16" cy="14" r="5" fill={col} opacity="0.35" />
            <path d="M3 28 Q16 22 37 26" stroke={col} strokeWidth="1.5" fill="none" opacity="0.4" />
            <rect x="39" y="17" width="1" height="16" fill="#e2e8f0" />
            <rect x="43" y="4" width="34" height="28" rx="3" fill={col} opacity="0.15" />
            <circle cx="56" cy="14" r="5" fill={col} opacity="0.25" />
            <path d="M43 28 Q56 20 77 24" stroke={col} strokeWidth="1.5" fill="none" opacity="0.3" />
            <rect x="8" y="30" width="24" height="2" rx="1" fill={col} opacity="0.3" />
            <rect x="48" y="30" width="24" height="2" rx="1" fill={col} opacity="0.2" />
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
            <rect width="80" height="36" rx="3" fill={col} opacity="0.3" />
            <rect x="0" y="22" width="80" height="14" rx="0" fill={col} opacity="0.55" />
            <circle cx="22" cy="13" r="7" fill={col} opacity="0.3" />
            <rect x="6" y="25" width="40" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="6" y="31" width="28" height="2.5" rx="1.25" fill="white" opacity="0.6" />
        </svg>
    ),
    // ── Product Image: Polaroid ───────────────────────────────────────────────
    'polaroid': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="8" y="2" width="64" height="32" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="11" y="5" width="58" height="22" rx="1" fill={col} opacity="0.25" />
            <circle cx="26" cy="14" r="5" fill={col} opacity="0.35" />
            <path d="M11 24 Q25 17 40 20 Q55 16 69 22" stroke={col} strokeWidth="1.5" fill="none" opacity="0.4" />
            <rect x="20" y="29" width="40" height="2.5" rx="1.25" fill="#9ca3af" />
        </svg>
    ),
    // ── Product Image: Before/After ───────────────────────────────────────────
    'before-after': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="3" width="36" height="24" rx="3" fill={col} opacity="0.2" />
            <rect x="42" y="3" width="36" height="24" rx="3" fill={col} opacity="0.35" />
            <rect x="38" y="3" width="4" height="24" fill={col} opacity="0.6" />
            <rect x="6" y="29" width="28" height="4" rx="2" fill={col} opacity="0.5" />
            <rect x="46" y="29" width="28" height="4" rx="2" fill={col} opacity="0.7" />
        </svg>
    ),
    // ── Product Image: Magazine Grid ──────────────────────────────────────────
    'magazine': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="46" height="32" rx="3" fill={col} opacity="0.3" />
            <circle cx="18" cy="14" r="7" fill={col} opacity="0.35" />
            <rect x="52" y="2" width="26" height="15" rx="3" fill={col} opacity="0.4" />
            <rect x="52" y="19" width="26" height="15" rx="3" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── Product Image: Inverted Magazine Grid ─────────────────────────────
    'inverted-magazine-grid': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="26" height="15" rx="3" fill={col} opacity="0.4" />
            <rect x="2" y="19" width="26" height="15" rx="3" fill={col} opacity="0.25" />
            <rect x="32" y="2" width="46" height="32" rx="3" fill={col} opacity="0.3" />
            <circle cx="55" cy="14" r="7" fill={col} opacity="0.35" />
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
                    <ImageUploadInput
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
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
                padding: '10px 10px 4px',
            }}>
                {variants.map((variant: BlockVariant) => {
                    const isSelected = currentVariant === variant.id
                    return (
                        <button
                            key={variant.id}
                            onClick={() => onChange(variant.id)}
                            title={variant.description}
                            style={{
                                padding: '8px 6px',
                                border: `2px solid ${isSelected ? C.primary : C.border}`,
                                borderRadius: 8,
                                backgroundColor: isSelected ? C.primaryLight : C.surface,
                                cursor: 'pointer',
                                textAlign: 'center' as const,
                                transition: 'all 0.12s',
                            }}
                        >
                            {/* Mini visual thumbnail */}
                            <VariantThumbnail variantId={variant.id} isSelected={isSelected} />
                            <p style={{
                                margin: '5px 0 0',
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
                    currentVariant={(props as any).variant ?? 'gradient'}
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
                    <SliderInput label="Line height" value={props.lineHeight ?? 1.7} min={1} max={3} step={0.1} onChange={v => updateProps({ lineHeight: v })} />
                    <AlignButtons value={props.align ?? 'left'} onChange={v => updateProps({ align: v })} />
                </Section>
            )

        case 'bullet_list':
            return (
                <Section title="Typography">
                    <ColorRow label="Text colour" value={props.color ?? '#1f1d2e'} onChange={v => updateProps({ color: v })} />
                    <ColorRow label="Bullet colour" value={props.bulletColor ?? '#7530fb'} onChange={v => updateProps({ bulletColor: v })} />
                    <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v })} />
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
                </>
            )
        }

        case 'product_image': {
            const pv = props.variant ?? 'single'
            return (
                <>
                    {(pv === 'single' || pv === 'zoom') && (
                        <Section title="Image">
                            <SliderInput label="Max width" value={props.maxWidth ?? 500} min={100} max={800} suffix="px" onChange={v => updateProps({ maxWidth: v })} />
                            <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={60} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            <SelectInput label="Image fit" value={props.objectFit ?? 'contain'}
                                options={[{ v: 'contain', l: 'Contain' }, { v: 'cover', l: 'Cover' }, { v: 'fill', l: 'Fill' }]}
                                onChange={v => updateProps({ objectFit: v })} />
                            <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                            <ToggleRow label="Show border" value={props.showBorder ?? false} onChange={v => updateProps({ showBorder: v })} />
                            {props.showBorder && (
                                <>
                                    <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                                    <SliderInput label="Border width" value={props.borderWidth ?? 1} min={1} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                                </>
                            )}
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
                            <SliderInput label="Name size" value={props.nameFontSize ?? 20} min={14} max={36} suffix="px" onChange={v => updateProps({ nameFontSize: v })} />
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
                            <SliderInput label="Thumb radius" value={props.thumbBorderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ thumbBorderRadius: v })} />
                            <ToggleRow label="Thumb border" value={props.showThumbBorder ?? true} onChange={v => updateProps({ showThumbBorder: v })} />
                            {props.showThumbBorder && <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />}
                            <SelectInput label="Image fit" value={props.objectFit ?? 'contain'}
                                options={[{ v: 'contain', l: 'Contain' }, { v: 'cover', l: 'Cover' }]}
                                onChange={v => updateProps({ objectFit: v })} />
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

        case 'product_description':
            return (
                <>
                    <Section title="Title">
                        <ColorRow label="Title colour" value={props.titleColor ?? '#1e1535'} onChange={v => updateProps({ titleColor: v })} />
                        <SliderInput
                            label="Title font size"
                            value={props.titleFontSize ?? 16}
                            min={12} max={32} suffix="px"
                            onChange={v => updateProps({ titleFontSize: v })}
                        />
                    </Section>
                    <Section title="Body text">
                        <ColorRow label="Text colour" value={props.color ?? '#6b7280'} onChange={v => updateProps({ color: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 14} min={10} max={22} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput
                            label="Font weight"
                            value={props.fontWeight ?? '400'}
                            options={[
                                { v: '400', l: 'Regular' },
                                { v: '500', l: 'Medium' },
                                { v: '600', l: 'Semibold' },
                            ]}
                            onChange={v => updateProps({ fontWeight: v })}
                        />
                        <SliderInput label="Line height" value={props.lineHeight ?? 1.8} min={1} max={3} step={0.1} onChange={v => updateProps({ lineHeight: v })} />
                    </Section>
                </>
            )

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

        case 'banner':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Heading text" value={props.headingColor ?? '#ffffff'} onChange={v => updateProps({ headingColor: v })} />
                        <ColorRow label="Sub text" value={props.subColor ?? 'rgba(255,255,255,0.75)'} onChange={v => updateProps({ subColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Heading size" value={props.headingSize ?? 24} min={14} max={48} suffix="px" onChange={v => updateProps({ headingSize: v })} />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Min height" value={props.minHeight ?? 80} min={40} max={300} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                    {/* Badge customization */}
                    <Section title="Badge">
                        <TextInput label="Badge text" value={props.badgeText ?? ''} onChange={v => updateProps({ badgeText: v })} />
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#fff'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Badge colour" value={props.badgeColor ?? '#7530fb'} onChange={v => updateProps({ badgeColor: v })} />
                    </Section>
                    {/* Padding controls */}
                    <Section title="Padding">
                        <SliderInput label="Top" value={props.paddingTop ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                        <SliderInput label="Right" value={props.paddingRight ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingRight: v })} />
                        <SliderInput label="Bottom" value={props.paddingBottom ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                        <SliderInput label="Left" value={props.paddingLeft ?? 0} min={0} max={100} suffix="px" onChange={v => updateProps({ paddingLeft: v })} />
                    </Section>
                    {props.variant === 'split-image-text' && (
                        <>
                            <Section title="Image">
                                <ImageUploadInput label="Image URL" value={props.imageUrl ?? ''} onChange={v => updateProps({ imageUrl: v })} />
                                <SelectInput label="Image position" value={props.imagePosition ?? 'left'}
                                    options={[{ v: 'left', l: 'Image left, text right' }, { v: 'right', l: 'Image right, text left' }]} onChange={v => updateProps({ imagePosition: v })} />
                                <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                            </Section>
                        </>
                    )}
                </>
            )

        case 'cta_banner':
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Min height" value={props.minHeight ?? 80} min={40} max={300} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                    </Section>
                    <Section title="Typography">
                        <ColorRow label="Heading colour" value={props.textColor ?? (block.type === 'cta_banner' ? '#b8fa33' : '#ffffff')} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Subtext colour" value={props.subColor ?? props.subTextColor ?? 'rgba(255,255,255,0.75)'} onChange={v => updateProps({ subColor: v })} />
                        <SliderInput label="Heading size" value={props.headingSize ?? 26} min={14} max={48} suffix="px" onChange={v => updateProps({ headingSize: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                </>
            )

        case 'trust_badges': {
            const pv = props.variant ?? 'row'
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Subtext colour" value={props.subTextColor ?? '#6b7280'} onChange={v => updateProps({ subTextColor: v })} />
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#f0f9ff'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#bfdbfe'} onChange={v => updateProps({ borderColor: v })} />
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
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#ffffff'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
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
                        <SliderInput label="Font weight" value={parseInt(props.fontWeight ?? '600')} min={400} max={900} step={100} onChange={v => updateProps({ fontWeight: String(v) })} />
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
                            <TextInput label="Badge text" value={props.savingsText ?? ''} onChange={v => updateProps({ savingsText: v })} />
                            {phButton('savingsText', 'savings text')}
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
                        <ImageUploadInput label="Image URL" value={props.src ?? ''} onChange={v => updateProps({ src: v })} />
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
                            <ImageUploadInput label="Image 2 URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'image 2 URL')}
                            <ImageUploadInput label="Image 3 URL" value={props.image3Url ?? ''} onChange={v => updateProps({ image3Url: v })} />
                            {phButton('image3Url', 'image 3 URL')}
                            {(props.imageCount ?? 4) >= 4 && <>
                                <ImageUploadInput label="Image 4 URL" value={props.image4Url ?? ''} onChange={v => updateProps({ image4Url: v })} />
                                {phButton('image4Url', 'image 4 URL')}
                            </>}
                            {(props.imageCount ?? 4) >= 5 && <>
                                <ImageUploadInput label="Image 5 URL" value={props.image5Url ?? ''} onChange={v => updateProps({ image5Url: v })} />
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
                            <ImageUploadInput label="Second image URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'second image URL')}
                            <TextInput label="Left label" value={props.label1 ?? 'Front'} onChange={v => updateProps({ label1: v })} />
                            <TextInput label="Right label" value={props.label2 ?? 'Back'} onChange={v => updateProps({ label2: v })} />
                        </Section>
                    )}
                    {av === 'lifestyle' && (
                        <Section title="Overlay text">
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
                            <ImageUploadInput label="After image URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'after image URL')}
                        </Section>
                    )}
                    {av === 'magazine' && (
                        <Section title="Additional images">
                            <ImageUploadInput label="Image 2 URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'image 2 URL')}
                            <ImageUploadInput label="Image 3 URL" value={props.image3Url ?? ''} onChange={v => updateProps({ image3Url: v })} />
                            {phButton('image3Url', 'image 3 URL')}
                        </Section>
                    )}
                    {av === 'inverted-magazine-grid' && (
                        <Section title="Additional images">
                            <ImageUploadInput label="Image 2 URL" value={props.image2Url ?? ''} onChange={v => updateProps({ image2Url: v })} />
                            {phButton('image2Url', 'image 2 URL')}
                            <ImageUploadInput label="Image 3 URL" value={props.image3Url ?? ''} onChange={v => updateProps({ image3Url: v })} />
                            {phButton('image3Url', 'image 3 URL')}
                        </Section>
                    )}
                </>
            )
        }

        case 'banner':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput label="Heading" value={props.headingText ?? ''} rows={2} onChange={v => updateProps({ headingText: v })} />
                        {phButton('headingText', 'heading')}
                        <TextareaInput label="Subtext" value={props.subText ?? ''} rows={2} onChange={v => updateProps({ subText: v })} />
                        {phButton('subText', 'subtext')}
                    </Section>
                    {props.variant === 'full-width-hero' && (
                        <>
                            <Section title="Background Image">
                                <ImageUploadInput label="Image URL" value={props.imageUrl ?? ''} onChange={v => updateProps({ imageUrl: v })} />
                                {phButton('imageUrl', 'background image')}
                            </Section>
                            <Section title="Size">
                                <SliderInput label="Top padding" value={props.paddingTop ?? 120} min={20} max={300} suffix="px" onChange={v => updateProps({ paddingTop: v })} />
                                <SliderInput label="Bottom padding" value={props.paddingBottom ?? 120} min={20} max={300} suffix="px" onChange={v => updateProps({ paddingBottom: v })} />
                                <SliderInput label="Min height" value={props.minHeight ?? 400} min={200} max={800} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                            </Section>
                        </>
                    )}
                </>
            )

        case 'cta_banner':
            return (
                <>
                    <Section title="Content">
                        <TextareaInput label="Heading" value={props.headingText ?? ''} rows={2} onChange={v => updateProps({ headingText: v })} />
                        {phButton('headingText', 'heading')}
                        <TextareaInput label="Subtext" value={props.subText ?? ''} rows={2} onChange={v => updateProps({ subText: v })} />
                        {phButton('subText', 'subtext')}
                    </Section>
                    <Section title="Button">
                        <TextInput label="Button text" value={props.buttonText ?? 'Shop Now'} onChange={v => updateProps({ buttonText: v })} />
                        {phButton('buttonText', 'button text')}
                        <TextInput label="Button URL" value={props.buttonUrl ?? '#'} onChange={v => updateProps({ buttonUrl: v })} />
                    </Section>
                </>
            )

        case 'gallery_row':
            return (
                <>
                    <Section title="Main image">
                        <ImageUploadInput label="Main image URL" value={props.mainImageSrc ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ mainImageSrc: v })} />
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

        case 'button_block':
            return (
                <Section title="Button">
                    <TextInput label="Button label" value={props.label ?? 'Buy It Now'} onChange={v => updateProps({ label: v })} />
                    {phButton('label', 'button label')}
                    <TextInput label="Link URL" value={props.url ?? '#'} onChange={v => updateProps({ url: v })} />
                </Section>
            )

        case 'rectangle':
            return (
                <Section title="Content (optional)">
                    <TextareaInput label="Inner HTML" value={props.content ?? ''} rows={3} onChange={v => updateProps({ content: v })} />
                    <InfoBox>Leave empty for a plain colour block. Add HTML for a callout or notice.</InfoBox>
                </Section>
            )

        case 'hero_header':
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
                    </Section>
                    <Section title="Logo / Background image">
                        <ToggleRow
                            label="Show logo"
                            value={props.showLogo ?? false}
                            onChange={v => updateProps({ showLogo: v })}
                        />
                        {props.showLogo && (
                            <>
                                <ImageUploadInput
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
                        {(props.variant === 'image-bg') && !props.showLogo && (
                            <InfoBox>
                                Enable "Show logo" above to set a background image URL for the Image Background variant.
                            </InfoBox>
                        )}
                    </Section>
                </>
            )

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

        case 'product_variants':
            return (
                <Section title="Variants">
                    <InfoBox>Colour swatches and size options are rendered from fixed defaults. Styles tab controls background and spacing.</InfoBox>
                    <ColorRow label="Swatch border colour" value={props.borderColor ?? '#e5e7eb'} onChange={v => updateProps({ borderColor: v })} />
                    <ColorRow label="Size label colour" value={props.textColor ?? '#1f1d2e'} onChange={v => updateProps({ textColor: v })} />
                    <ColorRow label="Size border colour" value={props.sizeBorderColor ?? '#ede9fe'} onChange={v => updateProps({ sizeBorderColor: v })} />
                </Section>
            )

        case 'whats_in_the_box':
            return (
                <Section title="Box contents">
                    <InfoBox>One item per line.</InfoBox>
                    <TextareaInput
                        label="Items (one per line)"
                        value={Array.isArray(props.items) ? props.items.join('\n') : '1x Main Unit\n1x Power Cable\n1x User Manual'}
                        rows={5}
                        onChange={v => updateProps({ items: v.split('\n').filter((s: string) => s.trim()) })}
                    />
                    <TextInput label="Heading" value={props.heading ?? "📦 What's In The Box"} onChange={v => updateProps({ heading: v })} />
                    <ColorRow label="Heading colour" value={props.headingColor ?? '#1e1535'} onChange={v => updateProps({ headingColor: v })} />
                    <ColorRow label="Bullet colour" value={props.bulletColor ?? '#16a34a'} onChange={v => updateProps({ bulletColor: v })} />
                    <ColorRow label="Text colour" value={props.textColor ?? '#1f1d2e'} onChange={v => updateProps({ textColor: v })} />
                </Section>
            )

        case 'key_features_grid':
            return (
                <Section title="Feature grid">
                    <InfoBox>3 feature columns — edit icons, titles and descriptions via the Styles tab background control. Content is fixed in the HTML output.</InfoBox>
                    <ColorRow label="Title colour" value={props.titleColor ?? '#1e1535'} onChange={v => updateProps({ titleColor: v })} />
                    <ColorRow label="Text colour" value={props.textColor ?? '#6b7280'} onChange={v => updateProps({ textColor: v })} />
                </Section>
            )

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
                        <TextInput label="Feedback %" value={props.feedbackPercent ?? '{{SELLER_FEEDBACK}}'} onChange={v => updateProps({ feedbackPercent: v })} />
                        {phButton('feedbackPercent', 'feedback %')}
                        <TextInput label="Member since" value={props.memberSince ?? '{{MEMBER_SINCE}}'} onChange={v => updateProps({ memberSince: v })} />
                        {phButton('memberSince', 'member since')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#7530fb'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Star colour" value={props.starColor ?? '#f59e0b'} onChange={v => updateProps({ starColor: v })} />
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

        case 'data_table':
            return (
                <Section title="Table rows">
                    <InfoBox>One row per line in format: Label | Value</InfoBox>
                    <TextareaInput
                        label="Rows (Label | Value)"
                        value={Array.isArray(props.rows)
                            ? props.rows.map((r: string[]) => r.join(' | ')).join('\n')
                            : 'Brand | {{BRAND}}\nModel | {{MPN}}\nCondition | {{ITEM_CONDITION}}'
                        }
                        rows={6}
                        onChange={v => updateProps({
                            rows: v.split('\n')
                                .filter((s: string) => s.includes('|'))
                                .map((s: string) => s.split('|').map((p: string) => p.trim()))
                        })}
                    />
                    <ColorRow label="Alt row colour" value={props.altBg ?? '#f8f7ff'} onChange={v => updateProps({ altBg: v })} />
                    <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                </Section>
            )

        case 'compatibility_table':
            return (
                <Section title="Compatible models">
                    <InfoBox>One model per line.</InfoBox>
                    <TextareaInput
                        label="Models (one per line)"
                        value={Array.isArray(props.models) ? props.models.join('\n') : 'Model A 2019-2023\nModel B 2020-2024\nModel C Pro All years'}
                        rows={5}
                        onChange={v => updateProps({ models: v.split('\n').filter((s: string) => s.trim()) })}
                    />
                    <TextInput label="Heading" value={props.heading ?? '✅ Compatible With:'} onChange={v => updateProps({ heading: v })} />
                    <ColorRow label="Check colour" value={props.checkColor ?? '#166534'} onChange={v => updateProps({ checkColor: v })} />
                    <ColorRow label="Alt row colour" value={props.altBg ?? '#f0fdf4'} onChange={v => updateProps({ altBg: v })} />
                </Section>
            )

        case 'product_comparison':
            return (
                <Section title="Comparison table">
                    <InfoBox>Header row + data rows. Format: Feature | Our Product | Competitor (one per line)</InfoBox>
                    <TextareaInput
                        label="Rows (3 columns | separated)"
                        value={Array.isArray(props.rows)
                            ? props.rows.map((r: string[]) => r.join(' | ')).join('\n')
                            : 'Feature | Our Product | Competitor\nWarranty | 2 Years | 6 Months\nUK Stock | ✓ Yes | ✗ No'
                        }
                        rows={6}
                        onChange={v => updateProps({
                            rows: v.split('\n')
                                .filter((s: string) => s.includes('|'))
                                .map((s: string) => s.split('|').map((p: string) => p.trim()))
                        })}
                    />
                    <ColorRow label="Header background" value={props.headerBg ?? '#7530fb'} onChange={v => updateProps({ headerBg: v })} />
                    <ColorRow label="Our column colour" value={props.ourColor ?? '#7530fb'} onChange={v => updateProps({ ourColor: v })} />
                </Section>
            )

        case 'before_after':
            return (
                <>
                    <Section title="Images">
                        <ImageUploadInput label="Before image URL" value={props.beforeSrc ?? '{{IMAGE_BEFORE}}'} onChange={v => updateProps({ beforeSrc: v })} />
                        {phButton('beforeSrc', 'before image URL')}
                        <ImageUploadInput label="After image URL" value={props.afterSrc ?? '{{IMAGE_AFTER}}'} onChange={v => updateProps({ afterSrc: v })} />
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
                    </Section>
                </>
            )

        case 'bundle_deal':
            return (
                <>
                    <Section title="Heading">
                        <TextInput label="Heading" value={props.heading ?? '🎁 Bundle & Save'} onChange={v => updateProps({ heading: v })} />
                    </Section>
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
                    <Section title="Categories">
                        <InfoBox>One category per line.</InfoBox>
                        <TextareaInput
                            label="Categories (one per line)"
                            value={Array.isArray(props.categories) ? props.categories.join('\n') : 'Electronics\nClothing\nHome & Garden\nCollectibles\nAuto Parts'}
                            rows={5}
                            onChange={v => updateProps({ categories: v.split('\n').filter((s: string) => s.trim()) })}
                        />
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Link colour" value={props.linkColor ?? 'rgba(255,255,255,0.8)'} onChange={v => updateProps({ linkColor: v })} />
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
                        <ImageUploadInput label="Image URL" value={props.src ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ src: v })} />
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

        case 'free_shipping_banner':
            return (
                <>
                    <Section title="Message">
                        <TextInput label="Banner text" value={props.text ?? '🚚 FREE Shipping — Dispatched Within 24 Hours ✅'} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'banner text')}
                    </Section>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#16a34a'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
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
                    <ImageUploadInput
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

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
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
                    value={value.startsWith('#') && value.length >= 4 ? value : '#ffffff'}
                    onChange={e => onChange(e.target.value)}
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
    // Convert { v, l } → DropdownOption { val, label, enabled }
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

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ marginBottom: 8 }}>
            {label && <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</p>}
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={inputStyle}
            />
        </div>
    )
}

// ── Image Upload Input ─────────────────────────────────────────────────────────
// Wraps a URL text field with a file-picker upload button.
// Uploads to Supabase Storage bucket "template-assets" and writes back the public URL.
function ImageUploadInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file (JPG, PNG, GIF, WebP)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be under 5 MB')
            return
        }

        setUploading(true)
        setUploadError(null)

        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop() ?? 'jpg'
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const filePath = `uploads/${fileName}`

            const { error: uploadErr } = await supabase.storage
                .from('template-assets')
                .upload(filePath, file, { contentType: file.type, upsert: false })

            if (uploadErr) {
                // If bucket doesn't exist, give a helpful message
                if (uploadErr.message?.includes('Bucket not found') || uploadErr.message?.includes('bucket')) {
                    setUploadError('Storage bucket "template-assets" not found. Please create it in Supabase Storage.')
                } else {
                    setUploadError(uploadErr.message ?? 'Upload failed')
                }
                return
            }

            const { data: urlData } = supabase.storage
                .from('template-assets')
                .getPublicUrl(filePath)

            if (urlData?.publicUrl) {
                onChange(urlData.publicUrl)
            } else {
                setUploadError('Could not get public URL after upload')
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Upload failed'
            setUploadError(msg)
        } finally {
            setUploading(false)
            // Reset the file input so the same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [onChange])

    const isValidUrl = value.startsWith('http://') || value.startsWith('https://')

    return (
        <div style={{ marginBottom: 8 }}>
            {label && (
                <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>
                    {label}
                </p>
            )}

            {/* URL field + upload button row */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                    type="text"
                    value={value}
                    onChange={e => { setUploadError(null); onChange(e.target.value) }}
                    placeholder="Paste URL or upload ↑"
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload image"
                    style={{
                        flexShrink: 0,
                        width: 30,
                        height: 28,
                        border: `1px solid ${C.inputBorder}`,
                        borderRadius: 6,
                        backgroundColor: uploading ? C.bg : C.primaryLight,
                        color: C.primary,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        padding: 0,
                        transition: 'background 0.15s',
                    }}
                >
                    {uploading ? (
                        <span style={{
                            display: 'inline-block',
                            width: 12,
                            height: 12,
                            border: `2px solid ${C.primary}`,
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                        }} />
                    ) : '📁'}
                </button>
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            {/* Upload status */}
            {uploading && (
                <p style={{ margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.primary }}>
                    Uploading…
                </p>
            )}
            {uploadError && (
                <p style={{ margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.danger }}>
                    ⚠ {uploadError}
                </p>
            )}

            {/* Preview thumbnail — shown when value is a valid URL */}
            {isValidUrl && !uploading && (
                <div style={{ marginTop: 4, position: 'relative', display: 'inline-block' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Preview"
                        style={{
                            height: 48,
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: 4,
                            border: `1px solid ${C.border}`,
                            backgroundColor: C.bg,
                            display: 'block',
                        }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        onLoad={e => { (e.target as HTMLImageElement).style.display = 'block' }}
                    />
                </div>
            )}
        </div>
    )
}

function TextareaInput({ label, value, rows = 3, onChange }: { label: string; value: string; rows?: number; onChange: (v: string) => void }) {
    return (
        <div style={{ marginBottom: 8 }}>
            {label && <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.body }}>{label}</p>}
            <textarea
                value={value}
                rows={rows}
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
