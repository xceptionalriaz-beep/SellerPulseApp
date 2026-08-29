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
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PropertiesPanel({
    block,
    placeholders,
    onChange,
    onDeselect,
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

                {/* eBay compliant badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: C.successLight,
                    border: `1px solid #86efac50`,
                    borderRadius: 20,
                    padding: '3px 10px',
                    marginBottom: 10,
                }}>
                    <CheckCircle2 size={11} style={{ color: C.success, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: C.success }}>
                        100% eBay Compliant
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
                    />
                )}
                {activeTab === 'ai' && (
                    <AITab block={block} />
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES TAB
// Visual styling — colours, spacing, typography, borders
// ─────────────────────────────────────────────────────────────────────────────
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
        <div style={{ padding: '14px 14px 24px' }}>

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

        case 'price_block':
            return (
                <>

                    <Section title="Price">
                        <ColorRow label="Price colour" value={props.priceColor ?? '#7530fb'} onChange={v => updateProps({ priceColor: v })} />
                        <SliderInput label="Font size" value={props.priceFontSize ?? 32} min={18} max={56} suffix="px" onChange={v => updateProps({ priceFontSize: v })} />
                        <SelectInput
                            label="Font weight"
                            value={props.priceFontWeight ?? '900'}
                            options={[
                                { v: '600', l: 'Semibold' },
                                { v: '700', l: 'Bold' },
                                { v: '800', l: 'Extrabold' },
                                { v: '900', l: 'Black' },
                            ]}
                            onChange={v => updateProps({ priceFontWeight: v })}
                        />
                        <AlignButtons value={props.priceAlign ?? 'left'} onChange={v => updateProps({ priceAlign: v })} />
                    </Section>
                    <Section title="Original price">
                        <ColorRow
                            label="Strike colour"
                            value={props.originalColor ?? '#9ca3af'}
                            onChange={v => updateProps({ originalColor: v })}
                        />
                        <SliderInput
                            label="Strike font size"
                            value={props.originalFontSize ?? 16}
                            min={10} max={32} suffix="px"
                            onChange={v => updateProps({ originalFontSize: v })}
                        />
                    </Section>
                    <Section title="Sale badge">
                        <ToggleRow label="Show badge" value={props.showBadge ?? false} onChange={v => updateProps({ showBadge: v })} />
                        {props.showBadge && (
                            <>
                                <ColorRow label="Badge background" value={props.badgeBg ?? '#b8fa33'} onChange={v => updateProps({ badgeBg: v })} />
                                <ColorRow label="Badge text colour" value={props.badgeColor ?? '#1e1535'} onChange={v => updateProps({ badgeColor: v })} />
                                <SliderInput
                                    label="Badge font size"
                                    value={props.badgeFontSize ?? 11}
                                    min={9} max={18} suffix="px"
                                    onChange={v => updateProps({ badgeFontSize: v })}
                                />
                                <SliderInput
                                    label="Badge border radius"
                                    value={props.badgeBorderRadius ?? 4}
                                    min={0} max={20} suffix="px"
                                    onChange={v => updateProps({ badgeBorderRadius: v })}
                                />
                            </>
                        )}
                    </Section>
                    <Section title="Layout">
                        <SliderInput
                            label="Border radius"
                            value={props.borderRadius ?? 10}
                            min={0} max={40} suffix="px"
                            onChange={v => updateProps({ borderRadius: v })}
                        />
                    </Section>
                </>
            )

        case 'product_image':
            return (
                <>

                    <Section title="Layout">
                        <SliderInput
                            label="Max width"
                            value={props.maxWidth ?? 500}
                            min={100} max={800} suffix="px"
                            onChange={v => updateProps({ maxWidth: v })}
                        />
                        <SelectInput
                            label="Object fit"
                            value={props.objectFit ?? 'contain'}
                            options={[
                                { v: 'contain', l: 'Contain — show full image' },
                                { v: 'cover', l: 'Cover — fill the frame' },
                                { v: 'fill', l: 'Fill — stretch to fit' },
                            ]}
                            onChange={v => updateProps({ objectFit: v })}
                        />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                    <Section title="Border">
                        <SliderInput
                            label="Border radius"
                            value={props.borderRadius ?? 8}
                            min={0} max={60} suffix="px"
                            onChange={v => updateProps({ borderRadius: v })}
                        />
                        <ToggleRow
                            label="Show border"
                            value={props.showBorder ?? false}
                            onChange={v => updateProps({ showBorder: v })}
                        />
                        {props.showBorder && (
                            <>
                                <ColorRow
                                    label="Border colour"
                                    value={props.borderColor ?? '#ede9fe'}
                                    onChange={v => updateProps({ borderColor: v })}
                                />
                                <SliderInput
                                    label="Border thickness"
                                    value={props.borderWidth ?? 1}
                                    min={1} max={8} suffix="px"
                                    onChange={v => updateProps({ borderWidth: v })}
                                />
                            </>
                        )}
                    </Section>
                </>
            )

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

        case 'specs_table':
            return (
                <>
                    <Section title="Header">
                        <ColorRow label="Header background" value={props.headerBg ?? '#1e1535'} onChange={v => updateProps({ headerBg: v })} />
                        <ColorRow label="Header text" value={props.headerText ?? '#ffffff'} onChange={v => updateProps({ headerText: v })} />
                    </Section>
                    <Section title="Rows">
                        <ColorRow label="Row background" value={props.rowBg ?? '#ffffff'} onChange={v => updateProps({ rowBg: v })} />
                        <ColorRow label="Alt row background" value={props.altRowBg ?? '#f8f7ff'} onChange={v => updateProps({ altRowBg: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                        <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                </>
            )

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
        case 'cta_banner':
            return (
                <>
                    <Section title="Layout">
                        <SliderInput label="Min height" value={props.minHeight ?? 80} min={40} max={300} suffix="px" onChange={v => updateProps({ minHeight: v })} />
                    </Section>
                    <Section title="Typography">
                        <ColorRow label="Heading colour" value={props.textColor ?? (block.type === 'cta_banner' ? '#b8fa33' : '#ffffff')} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Subtext colour" value={props.subColor ?? props.subTextColor ?? 'rgba(255,255,255,0.75)'} onChange={v => updateProps(block.type === 'banner' ? { subColor: v } : { subTextColor: v })} />
                        {block.type === 'banner' && (
                            <SliderInput label="Heading size" value={props.headingSize ?? 26} min={14} max={48} suffix="px" onChange={v => updateProps({ headingSize: v })} />
                        )}
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                </>
            )

        case 'trust_badges':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Badge background" value={props.badgeBg ?? '#ffffff'} onChange={v => updateProps({ badgeBg: v })} />
                        <ColorRow label="Icon colour" value={props.iconColor ?? '#7530fb'} onChange={v => updateProps({ iconColor: v })} />
                        <ColorRow label="Text colour" value={props.textColor ?? '#1e1535'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                </>
            )

        case 'shipping_info':
        case 'returns_policy':
            return (
                <Section title="Colours">
                    <ColorRow label="Background" value={props.bgColor ?? '#dcfce7'} onChange={v => updateProps({ bgColor: v })} />
                    <ColorRow label="Text colour" value={props.textColor ?? '#166534'} onChange={v => updateProps({ textColor: v })} />
                    <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                </Section>
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
                <Section title="Border">
                    <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                    <SliderInput label="Border width" value={props.borderWidth ?? 0} min={0} max={8} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                    <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                </Section>
            )

        case 'container':
            return (
                <Section title="Container">
                    <SliderInput label="Max width" value={props.maxWidth ?? 600} min={300} max={700} suffix="px" onChange={v => updateProps({ maxWidth: v })} />
                    <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                    <SliderInput label="Border width" value={props.borderWidth ?? 1} min={0} max={4} suffix="px" onChange={v => updateProps({ borderWidth: v })} />
                    <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                </Section>
            )

        case 'two_column':
            return (
                <Section title="Columns">
                    <SliderInput label="Left width" value={props.leftWidth ?? 50} min={20} max={80} suffix="%" onChange={v => updateProps({ leftWidth: v })} />
                    <SliderInput label="Gap" value={props.gap ?? 16} min={0} max={48} suffix="px" onChange={v => updateProps({ gap: v })} />
                </Section>
            )

        case 'three_column':
            return (
                <Section title="Columns">
                    <SliderInput label="Gap" value={props.gap ?? 12} min={0} max={48} suffix="px" onChange={v => updateProps({ gap: v })} />
                </Section>
            )

        case 'gallery_row':
            return (
                <Section title="Gallery">
                    <ToggleRow label="Show main image" value={props.showMain ?? true} onChange={v => updateProps({ showMain: v })} />
                    <SliderInput label="Gap" value={props.gap ?? 8} min={0} max={24} suffix="px" onChange={v => updateProps({ gap: v })} />
                    <SliderInput label="Border radius" value={props.borderRadius ?? 6} min={0} max={20} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                </Section>
            )

        case 'policy_tabs':
            return (
                <>
                    <Section title="Tab colours">
                        <ColorRow label="Active background" value={props.activeBg ?? '#7530fb'} onChange={v => updateProps({ activeBg: v })} />
                        <ColorRow label="Active text" value={props.activeText ?? '#ffffff'} onChange={v => updateProps({ activeText: v })} />
                        <ColorRow label="Inactive background" value={props.inactiveBg ?? '#f8f7ff'} onChange={v => updateProps({ inactiveBg: v })} />
                        <ColorRow label="Inactive text" value={props.inactiveText ?? '#6b7280'} onChange={v => updateProps({ inactiveText: v })} />
                        <ColorRow label="Border colour" value={props.borderColor ?? '#ede9fe'} onChange={v => updateProps({ borderColor: v })} />
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 13} min={10} max={18} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 8} min={0} max={20} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                </>
            )

        case 'nav_bar':
            return (
                <>
                    <Section title="Colours">
                        <ColorRow label="Background" value={props.bgColor ?? '#1e1535'} onChange={v => updateProps({ bgColor: v })} />
                        <ColorRow label="Link colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Hover colour" value={props.hoverColor ?? '#b8fa33'} onChange={v => updateProps({ hoverColor: v })} />
                        <InfoBox>
                            Hover colour shows in Live Preview only — eBay strips CSS hover states in listings.
                        </InfoBox>
                    </Section>
                    <Section title="Typography">
                        <SliderInput label="Font size" value={props.fontSize ?? 12} min={10} max={20} suffix="px" onChange={v => updateProps({ fontSize: v })} />
                        <SelectInput
                            label="Font weight"
                            value={props.fontWeight ?? '700'}
                            options={[
                                { v: '400', l: 'Regular' },
                                { v: '600', l: 'Semibold' },
                                { v: '700', l: 'Bold' },
                                { v: '800', l: 'Extrabold' },
                            ]}
                            onChange={v => updateProps({ fontWeight: v })}
                        />
                        <SliderInput
                            label="Letter spacing"
                            value={props.letterSpacing ?? 3}
                            min={0} max={10} suffix="px"
                            onChange={v => updateProps({ letterSpacing: v })}
                        />
                    </Section>
                    <Section title="Layout">
                        <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={20} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                        <AlignButtons value={props.align ?? 'center'} onChange={v => updateProps({ align: v })} />
                    </Section>
                </>
            )

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

        case 'hero_header':
            return (
                <>


                    {/* ── Typography ── */}
                    <Section title="Typography">
                        <ColorRow label="Name colour" value={props.textColor ?? '#ffffff'} onChange={v => updateProps({ textColor: v })} />
                        <ColorRow label="Tagline colour" value={props.taglineColor ?? 'rgba(255,255,255,0.7)'} onChange={v => updateProps({ taglineColor: v })} />
                        <SliderInput
                            label="Name font size"
                            value={props.nameFontSize ?? 26}
                            min={14} max={48} suffix="px"
                            onChange={v => updateProps({ nameFontSize: v })}
                        />
                        <SliderInput
                            label="Tagline font size"
                            value={props.taglineFontSize ?? 13}
                            min={10} max={22} suffix="px"
                            onChange={v => updateProps({ taglineFontSize: v })}
                        />
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
                        <SliderInput label="Height" value={props.height ?? 120} min={60} max={500} suffix="px" onChange={v => updateProps({ height: v })} />
                        <SliderInput label="Border radius" value={props.borderRadius ?? 0} min={0} max={40} suffix="px" onChange={v => updateProps({ borderRadius: v })} />
                    </Section>
                </>
            )

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
}: {
    block: Block
    props: any
    placeholders: PlaceholderGroup[]
    updateProps: (p: any) => void
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
            />
        </div>
    )
}

// Block-specific attribute controls
function BlockAttributeProps({ block, props, updateProps, phButton }: {
    block: Block, props: any, updateProps: (p: any) => void,
    phButton: (key: string, label: string) => React.ReactNode
}) {
    switch (block.type) {

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

        case 'price_block':
            return (
                <>
                    <Section title="Price">
                        <TextInput label="Price text" value={props.priceText ?? '{{ITEM_PRICE}}'} onChange={v => updateProps({ priceText: v })} />
                        {phButton('priceText', 'price')}
                    </Section>
                    <Section title="Original price">
                        <ToggleRow label="Show original price" value={props.showOriginal ?? false} onChange={v => updateProps({ showOriginal: v })} />
                        {props.showOriginal && (
                            <>
                                <TextInput label="Original price text" value={props.originalText ?? '{{ORIGINAL_PRICE}}'} onChange={v => updateProps({ originalText: v })} />
                                {phButton('originalText', 'original price')}
                            </>
                        )}
                    </Section>
                    <Section title="Badge">
                        <ToggleRow label="Show badge" value={props.showBadge ?? false} onChange={v => updateProps({ showBadge: v })} />
                        {props.showBadge && (
                            <TextInput label="Badge text" value={props.badgeText ?? 'SALE'} onChange={v => updateProps({ badgeText: v })} />
                        )}
                    </Section>
                </>
            )

        case 'product_image':
            return (
                <Section title="Image">
                    <TextInput label="Image URL" value={props.src ?? '{{MAIN_IMAGE_URL}}'} onChange={v => updateProps({ src: v })} />
                    {phButton('src', 'image URL')}
                    <TextInput label="Alt text" value={props.alt ?? '{{PRODUCT_TITLE}}'} onChange={v => updateProps({ alt: v })} />
                    {phButton('alt', 'alt text')}
                </Section>
            )

        case 'product_description':
            return (
                <>
                    <Section title="Title">
                        <ToggleRow label="Show section title" value={props.showTitle ?? true} onChange={v => updateProps({ showTitle: v })} />
                        {props.showTitle && (
                            <TextInput label="Title text" value={props.titleText ?? 'Product Description'} onChange={v => updateProps({ titleText: v })} />
                        )}
                    </Section>
                    <Section title="Description">
                        <TextareaInput label="Description" value={props.text ?? '{{ITEM_DESCRIPTION}}'} rows={4} onChange={v => updateProps({ text: v })} />
                        {phButton('text', 'description')}
                    </Section>
                </>
            )

        case 'specs_table':
            return (
                <>
                    <Section title="Title">
                        <ToggleRow label="Show title" value={props.showTitle ?? true} onChange={v => updateProps({ showTitle: v })} />
                        {props.showTitle && (
                            <TextInput label="Title text" value={props.titleText ?? 'Item Specifics'} onChange={v => updateProps({ titleText: v })} />
                        )}
                    </Section>
                    <Section title="Rows">
                        <SpecsRowsEditor
                            rows={props.rows ?? []}
                            onChange={rows => updateProps({ rows })}
                        />
                    </Section>
                </>
            )

        case 'image':
            return (
                <Section title="Image">
                    <TextInput label="Image URL" value={props.src ?? ''} onChange={v => updateProps({ src: v })} />
                    <TextInput label="Alt text" value={props.alt ?? ''} onChange={v => updateProps({ alt: v })} />
                    <TextInput label="Link URL (optional)" value={props.linkUrl ?? ''} onChange={v => updateProps({ linkUrl: v })} />
                </Section>
            )

        case 'banner':
            return (
                <Section title="Content">
                    <TextInput label="Heading" value={props.headingText ?? ''} onChange={v => updateProps({ headingText: v })} />
                    {phButton('headingText', 'heading')}
                    <TextareaInput label="Subtext" value={props.subText ?? ''} rows={2} onChange={v => updateProps({ subText: v })} />
                    {phButton('subText', 'subtext')}
                </Section>
            )

        case 'cta_banner':
            return (
                <Section title="Content">
                    <TextInput label="Heading" value={props.headingText ?? ''} onChange={v => updateProps({ headingText: v })} />
                    <TextareaInput label="Subtext" value={props.subText ?? ''} rows={2} onChange={v => updateProps({ subText: v })} />
                </Section>
            )

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
        case 'two_column':
        case 'three_column':
        case 'container':
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
                    </Section>
                    <Section title="Products">
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
                    <Section title="Logo">
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
                                <InfoBox>
                                    Use an HTTPS image URL. Recommended height: 50px. Transparent PNG works best on dark backgrounds.
                                </InfoBox>
                            </>
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
function AITab({ block }: { block: Block }) {
    return (
        <div style={{ padding: '14px 14px 24px' }}>
            <Section title="AI Tools">
                <AIToolButton
                    Icon={Sparkles}
                    label="AI Copy Optimizer"
                    description="Rewrite this block's text for higher eBay conversion"
                    color={C.primary}
                    bg={C.primaryLight}
                    border={C.primaryBorder}
                    comingSoon
                />
                <AIToolButton
                    Icon={Wand2}
                    label="AI Photo Studio"
                    description="Generate or enhance product images for this block"
                    color="#d97706"
                    bg="#fef3c7"
                    border="#fde68a"
                    comingSoon
                />
                <AIToolButton
                    Icon={Zap}
                    label="AI Policy Writer"
                    description="Auto-generate eBay-safe shipping & returns copy"
                    color={C.success}
                    bg={C.successLight}
                    border="#86efac"
                    comingSoon
                />
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
                    <input
                        value={img.src}
                        placeholder="Image URL"
                        onChange={e => {
                            const next = [...images]
                            next[i] = { ...next[i], src: e.target.value }
                            onChange(next)
                        }}
                        style={{ ...inputStyle, marginBottom: 4 }}
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
                    <input value={item.imageUrl} placeholder="Image URL"
                        onChange={e => { const n = [...items]; n[i] = { ...n[i], imageUrl: e.target.value }; onChange(n) }}
                        style={{ ...inputStyle, marginBottom: 4, fontSize: 11 }} />
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
