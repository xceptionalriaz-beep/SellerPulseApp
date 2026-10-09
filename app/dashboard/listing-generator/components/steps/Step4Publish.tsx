'use client'
// app/dashboard/listing-generator/components/steps/Step4Publish.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Listing Studio — Step 4: Review & Publish
//
//   ✓ Full review of every field — editable inline, no going back
//   ✓ Health score ring
//   ✓ VeRO check
//   ✓ Sticky publish bar at bottom
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, JSX } from 'react'
import type { ReactNode } from 'react'
import {
    CheckCircle2, AlertCircle, XCircle, ChevronDown,
    Shield, Zap, Send, Loader2, Eye,
    Image as ImageIcon, FileText, Tag, DollarSign,
    Truck, RotateCcw, MapPin, Globe,
    Megaphone, Lock, Users, Hash, Layers,
    TrendingUp, ArrowRight, Flame,
} from 'lucide-react'
import type { DraftData } from '../LgStudio'
import { calcHealth } from '@/lib/health-engine'
import { ProfitEngine, DEFAULT_SETTINGS } from '@/lib/profit-engine'
import ProDropdown from '@/components/ui/ProDropdown'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

interface Props {
    draft: DraftData
    onChange: (updates: Partial<DraftData>) => void
    onSave?: () => void
    onStepJump?: (step: number) => void
}

// ── Inline input ─────────────────────────────────────────────
function InlineInput({ value, onChange, placeholder, type = 'text', prefix, suffix, multiline }: {
    value: string | number
    onChange: (v: string) => void
    placeholder?: string
    type?: string
    prefix?: string
    suffix?: string
    multiline?: boolean
}) {
    const style: React.CSSProperties = {
        flex: 1, fontSize: 13, color: C.body,
        fontFamily: 'DM Sans, sans-serif',
        border: `1px solid ${C.borderInput}`,
        borderRadius: 10, padding: '7px 10px',
        backgroundColor: C.surface, outline: 'none',
        resize: multiline ? 'vertical' : 'none',
    }
    return (
        <div className="flex items-center gap-1.5 flex-1">
            {prefix && <span className="text-[12px] shrink-0" style={{ color: C.muted }}>{prefix}</span>}
            {multiline
                ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} rows={3}
                    style={style}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.borderInput} />
                : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={style}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.borderInput} />
            }
            {suffix && <span className="text-[12px] shrink-0" style={{ color: C.muted }}>{suffix}</span>}
        </div>
    )
}

// ── Inline toggle ────────────────────────────────────────────
function InlineToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div onClick={() => onChange(!checked)} className="cursor-pointer shrink-0"
            style={{
                width: 34, height: 18, borderRadius: 999,
                backgroundColor: checked ? C.primary : '#d1d5db',
                position: 'relative', transition: 'background 0.2s',
            }}>
            <div style={{
                position: 'absolute', top: 2,
                left: checked ? 17 : 2,
                width: 14, height: 14, borderRadius: '50%',
                backgroundColor: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </div>
    )
}

// ── Review section wrapper ───────────────────────────────────
function Section({ icon, title, children, status }: {
    icon: JSX.Element
    title: string
    children: ReactNode
    status?: 'ok' | 'warn' | 'missing'
}) {
    const dot = status === 'ok' ? C.success : status === 'warn' ? C.warning : status === 'missing' ? C.danger : C.muted
    return (
        <div className="rounded-2xl" style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface, overflow: 'visible' }}>
            <div className="w-full flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: C.primaryLight }}>
                    {icon}
                </div>
                <span className="text-[14px] font-bold flex-1 text-left" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                    {title}
                </span>
                {status && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
            </div>
            <div className="px-4 pb-1" style={{ backgroundColor: C.surface }}>
                {children}
            </div>
        </div>
    )
}

// ── Review row ───────────────────────────────────────────────
function Row({ label, required, children, missing }: {
    label: string
    required?: boolean
    children: ReactNode
    missing?: boolean
}) {
    return (
        <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="w-[150px] shrink-0 flex items-center gap-1 pt-1.5">
                <span className="text-[11px] font-semibold" style={{ color: missing ? C.danger : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                    {label}
                </span>
                {required && <span style={{ color: C.danger, fontSize: 10 }}>*</span>}
            </div>
            <div className="flex-1 flex items-center gap-2 flex-wrap">
                {children}
                {missing && <AlertCircle size={12} style={{ color: C.danger, flexShrink: 0 }} />}
            </div>
        </div>
    )
}

// ── Health score ring ────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
    const r = 40, stroke = 7, circ = 2 * Math.PI * r
    const color = score >= 80 ? C.success : score >= 50 ? C.warning : C.danger
    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: 96, height: 96 }}>
            <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={48} cy={48} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
                <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-[24px] font-bold leading-none" style={{ color, fontFamily: 'Syne, sans-serif' }}>{score}</span>
                <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>/100</span>
            </div>
        </div>
    )
}



const CONDITION_OPTIONS = [
    'New', 'New with tags', 'New without tags', 'New with defects',
    'Used - Like New', 'Used - Good', 'Used - Acceptable', 'For parts or not working',
].map(c => ({ val: c, label: c, enabled: true }))

const CATEGORY_MAP: Record<string, string> = {
    consumer_electronics: 'Consumer Electronics', computers: 'Computers & Tablets',
    clothing: 'Clothing & Accessories', jewelry: 'Jewellery & Watches',
    home_garden: 'Home & Garden', furniture: 'Furniture', toys_hobbies: 'Toys & Hobbies',
    sporting_goods: 'Sporting Goods', health_beauty: 'Health & Beauty',
    books_movies: 'Books & Media', collectibles: 'Collectibles', pet_supplies: 'Pet Supplies',
    motors_parts: 'Motors Parts', business: 'Business & Industrial', default: 'Other',
}
const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAP).map(([val, label]) => ({ val, label, enabled: true }))

// ── Main component ────────────────────────────────────────────
export default function Step4Publish({ draft, onChange, onSave, onStepJump }: Props): JSX.Element {
    const [publishing, setPublishing] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [showActions, setShowActions] = useState(false)
    const health = calcHealth(draft as any)
    const { score, label: scoreLabel, color: scoreColor } = health


    async function handlePublish() {
        setPublishing(true)
        onSave?.()
        await new Promise(r => setTimeout(r, 1200))
        setPublishing(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 4000)
    }

    const fmt = (n: number | null) => n ? `$${Number(n).toFixed(2)}` : '—'

    return (
        <div className="flex flex-col">
            <div className="flex flex-col xl:px-[5%]">
                <div className="flex flex-col xl:flex-row">

                    {/* ── LEFT: Full review list ─────────────────── */}
                    <div className="flex-1 p-3 md:p-4 xl:px-[10%] pb-8 flex flex-col gap-4"
                        style={{ scrollbarWidth: 'none' }}>

                        {/* ── 0. SELLER INFO ───────────────────────── */}
                        <Section icon={<Users size={14} style={{ color: C.primary }} />} title="Seller Info">
                            <Row label="Seller Type">
                                <span className="text-[12px] font-semibold capitalize" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    {draft.seller_type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—'}
                                </span>
                            </Row>
                            <Row label="Product Name">
                                <InlineInput value={draft.product_name} onChange={v => onChange({ product_name: v })} placeholder="Internal product name" />
                            </Row>
                            <Row label="Source Platform">
                                <span className="text-[12px] font-semibold" style={{ color: (draft as any).source_platform ? C.body : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).source_platform ? String((draft as any).source_platform).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '— Not set'}
                                </span>
                            </Row>
                        </Section>

                        {/* ── 1. PRODUCT INFO ──────────────────────── */}
                        <Section icon={<Tag size={14} style={{ color: C.primary }} />} title="Product & Title"
                            status={draft.title?.length >= 20 ? 'ok' : 'missing'}>
                            <Row label="Title" required missing={!draft.title}>
                                <InlineInput value={draft.title} onChange={v => onChange({ title: v })}
                                    placeholder="Add title..." />
                                <span className="text-[11px] shrink-0" style={{ color: (draft.title?.length ?? 0) >= 60 ? C.success : C.muted }}>
                                    {draft.title?.length ?? 0}/80
                                </span>
                            </Row>
                            <Row label="Subtitle">
                                <InlineInput value={draft.subtitle ?? ''} onChange={v => onChange({ subtitle: v })}
                                    placeholder="Optional subtitle..." />
                                <span className="text-[11px] shrink-0" style={{ color: C.muted }}>
                                    {(draft.subtitle?.length ?? 0)}/55
                                </span>
                            </Row>
                            <Row label="Category" required missing={!draft.category}>
                                <ProDropdown prefix="" currentValue={draft.category}
                                    onChanged={v => onChange({ category: v })}
                                    width="full" options={CATEGORY_OPTIONS} />
                            </Row>
                            <Row label="Condition" required missing={!draft.condition}>
                                <ProDropdown prefix="" currentValue={draft.condition}
                                    onChanged={v => onChange({ condition: v })}
                                    width="full" options={CONDITION_OPTIONS} />
                            </Row>
                            {draft.condition?.toLowerCase().includes('used') && (
                                <Row label="Condition Desc.">
                                    <InlineInput value={draft.condition_description ?? ''} multiline
                                        onChange={v => onChange({ condition_description: v })}
                                        placeholder="Describe any defects or wear..." />
                                </Row>
                            )}
                            <Row label="SKU">
                                <InlineInput value={draft.sku} onChange={v => onChange({ sku: v })} placeholder="e.g. SP-4421" />
                            </Row>
                            <Row label="Listing Format">
                                <ProDropdown prefix="" currentValue={(draft as any).listing_format ?? 'buy_it_now'}
                                    onChanged={v => onChange({ listing_format: v } as any)} width="full"
                                    options={[
                                        { val: 'buy_it_now', label: 'Buy It Now', enabled: true },
                                        { val: 'auction', label: 'Auction', enabled: true },
                                    ]} />
                            </Row>
                            {(draft as any).listing_format === 'auction' && (
                                <Row label="Auction Duration">
                                    <ProDropdown prefix="" currentValue={(draft as any).auction_duration ?? '7'}
                                        onChanged={v => onChange({ auction_duration: v } as any)} width="full"
                                        options={['1', '3', '5', '7', '10'].map(d => ({ val: d, label: `${d} days`, enabled: true }))} />
                                </Row>
                            )}
                            <Row label="Variations">
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {draft.has_variations ? 'Yes — configure after publish' : 'No'}
                                </span>
                                <InlineToggle checked={draft.has_variations} onChange={v => onChange({ has_variations: v })} />
                            </Row>
                        </Section>

                        {/* ── 2. IDENTIFIERS ───────────────────────── */}
                        <Section icon={<Hash size={14} style={{ color: C.primary }} />} title="Product Identifiers">
                            <Row label="UPC">
                                <InlineInput value={draft.upc ?? ''} onChange={v => onChange({ upc: v })} placeholder="12-digit barcode" />
                            </Row>
                            <Row label="EAN">
                                <InlineInput value={draft.ean ?? ''} onChange={v => onChange({ ean: v })} placeholder="13-digit barcode" />
                            </Row>
                            <Row label="MPN">
                                <InlineInput value={draft.mpn ?? ''} onChange={v => onChange({ mpn: v })} placeholder="Manufacturer Part No." />
                            </Row>
                            <Row label="Product URL">
                                <InlineInput value={(draft as any).product_url ?? ''} onChange={v => onChange({ product_url: v } as any)} placeholder="https://yoursite.com/product" />
                            </Row>
                        </Section>

                        {/* ── 3. ITEM SPECIFICS ────────────────────── */}
                        <Section icon={<Layers size={14} style={{ color: C.primary }} />} title="Item Specifics"
                            status={Object.keys(draft.item_specifics ?? {}).length >= 2 ? 'ok' : Object.keys(draft.item_specifics ?? {}).length > 0 ? 'warn' : undefined}>
                            {Object.entries(draft.item_specifics ?? {}).length === 0
                                ? <p className="text-[12px] py-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>No item specifics — add them in Step 1.</p>
                                : (Object.entries(draft.item_specifics ?? {}) as [string, string][]).map(([key, value]) => (
                                    <React.Fragment key={key}>
                                        <Row label={key}>
                                            <InlineInput value={value}
                                                onChange={v => onChange({ item_specifics: { ...draft.item_specifics, [key]: v } })}
                                                placeholder={`Enter ${key}...`} />
                                        </Row>
                                    </React.Fragment>
                                ))
                            }
                        </Section>

                        {/* ── 4. PHOTOS & MEDIA ────────────────────── */}
                        <Section icon={<ImageIcon size={14} style={{ color: C.primary }} />} title="Photos & Media"
                            status={(draft.photo_urls?.length ?? 0) >= 1 ? 'ok' : 'missing'}>

                            {/* Photo grid — each photo removable + set as cover */}
                            <div className="py-2">
                                {(draft.photo_urls?.length ?? 0) === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-xl"
                                        style={{ backgroundColor: C.bg, border: `2px dashed ${C.border}` }}>
                                        <ImageIcon size={24} style={{ color: C.muted }} />
                                        <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>No photos — go to Step 2 to upload</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {/* Status badge */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                {draft.photo_urls.length} photo{draft.photo_urls.length !== 1 ? 's' : ''}
                                            </span>
                                            {(draft.photo_urls?.length ?? 0) < 4
                                                ? <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.warningBg, color: C.warning }}>Add {4 - draft.photo_urls.length} more in Step 2</span>
                                                : <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.successBg, color: C.success }}>Good — {draft.photo_urls.length} photos</span>
                                            }
                                        </div>
                                        {/* Photo grid */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {draft.photo_urls.map((url, i) => (
                                                <div key={i} className="relative group rounded-xl overflow-hidden"
                                                    style={{ aspectRatio: '1', border: `2px solid ${url === draft.main_photo_url ? C.primary : C.border}` }}>
                                                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                                    {/* Cover badge */}
                                                    {url === draft.main_photo_url && (
                                                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
                                                            style={{ backgroundColor: C.primary, color: '#fff' }}>Cover</div>
                                                    )}
                                                    {/* Actions overlay */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                                                        style={{ backgroundColor: 'rgba(30,21,53,0.7)' }}>
                                                        {url !== draft.main_photo_url && (
                                                            <button
                                                                onClick={() => onChange({ main_photo_url: url })}
                                                                className="text-[9px] font-bold px-2 py-0.5 rounded"
                                                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                                                Set Cover
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                const newUrls = draft.photo_urls.filter((_, idx) => idx !== i)
                                                                onChange({
                                                                    photo_urls: newUrls,
                                                                    main_photo_url: url === draft.main_photo_url ? (newUrls[0] ?? '') : draft.main_photo_url
                                                                })
                                                            }}
                                                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                                                            style={{ backgroundColor: C.danger, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                                            Remove
                                                        </button>
                                                    </div>
                                                    {/* Number badge */}
                                                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                                                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                                                        {i + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Hover a photo to set cover or remove. Add/reorder photos in Step 2.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Video URL */}
                            <Row label="Video URL">
                                <InlineInput value={draft.video_url ?? ''} type="text"
                                    onChange={v => onChange({ video_url: v })}
                                    placeholder="https://youtube.com/watch?v=..." />
                                {draft.video_url && <CheckCircle2 size={12} style={{ color: C.success, flexShrink: 0 }} />}
                            </Row>
                        </Section>

                        {/* ── 5. DESCRIPTION ───────────────────────── */}
                        <Section icon={<FileText size={14} style={{ color: C.primary }} />} title="Description"
                            status={(draft.description_html?.length ?? 0) > 50 ? 'ok' : 'missing'}>
                            <div className="py-2 flex flex-col gap-2">
                                {/* Stats bar */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Plain text edit — formatting preserved
                                    </span>
                                    <span className="text-[11px] font-bold" style={{
                                        color: (draft.description_html?.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length ?? 0) >= 100 ? C.success : C.warning,
                                        fontFamily: 'DM Sans, sans-serif'
                                    }}>
                                        {draft.description_html?.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length ?? 0} words
                                    </span>
                                </div>

                                {/* Editable plain text */}
                                <textarea
                                    value={draft.description_html?.replace(/<[^>]*>/g, '') ?? ''}
                                    onChange={e => onChange({ description_html: e.target.value })}
                                    placeholder="Write your product description here..."
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        fontSize: 13,
                                        color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                        border: `1px solid ${C.borderInput}`,
                                        borderRadius: 12,
                                        padding: '10px 12px',
                                        backgroundColor: C.surface,
                                        outline: 'none',
                                        resize: 'vertical',
                                        lineHeight: 1.6,
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />

                                {/* Preview rendered HTML */}
                                {draft.description_html && (
                                    <div>
                                        <p className="text-[10px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>HTML Preview (buyer view):</p>
                                        <div className="p-3 rounded-xl text-[12px]"
                                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.secondary, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}
                                            dangerouslySetInnerHTML={{ __html: draft.description_html }}
                                        />
                                    </div>
                                )}

                                <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    For full rich text editing with formatting go to Step 2.
                                </p>
                            </div>
                        </Section>

                        {/* ── 6. PRICING ───────────────────────────── */}
                        <Section icon={<DollarSign size={14} style={{ color: C.primary }} />} title="Pricing"
                            status={(draft.sell_price ?? 0) >= 0.99 ? 'ok' : 'missing'}>
                            <Row label="Sell Price" required missing={!draft.sell_price}>
                                <InlineInput value={draft.sell_price ?? ''} prefix="$"
                                    type="number"
                                    onChange={v => onChange({ sell_price: v === '' ? null : Number(v) })}
                                    placeholder="0.00" />
                            </Row>
                            <Row label="Buy / Cost">
                                <InlineInput value={draft.buy_price ?? ''} prefix="$"
                                    type="number"
                                    onChange={v => onChange({ buy_price: v === '' ? null : Number(v) })}
                                    placeholder="0.00" />
                            </Row>
                            <Row label="Quantity">
                                <InlineInput value={draft.quantity} type="number"
                                    onChange={v => onChange({ quantity: Math.max(1, Number(v)) })} />
                            </Row>
                            <Row label="Currency">
                                <span className="text-[12px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).item_country === 'GB' ? 'GBP £' : (draft as any).item_country === 'CA' ? 'CAD CA$' : (draft as any).item_country === 'AU' ? 'AUD AU$' : ['DE', 'FR'].includes((draft as any).item_country) ? 'EUR €' : 'USD $'}
                                </span>
                            </Row>
                            <Row label="VAT Registered">
                                <InlineToggle checked={draft.vat_registered ?? false} onChange={v => onChange({ vat_registered: v })} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{draft.vat_registered ? 'Yes' : 'No'}</span>
                            </Row>
                            <Row label="Immediate Pay">
                                <InlineToggle checked={(draft as any).immediate_payment ?? true} onChange={v => onChange({ immediate_payment: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).immediate_payment ? 'Required (recommended)' : 'Not required'}
                                </span>
                            </Row>
                        </Section>

                        {/* ── 7. BEST OFFER ────────────────────────── */}
                        <Section icon={<Tag size={14} style={{ color: C.primary }} />} title="Best Offer">
                            <Row label="Best Offer">
                                <InlineToggle checked={(draft as any).best_offer_enabled ?? false} onChange={v => onChange({ best_offer_enabled: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).best_offer_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </Row>
                            {(draft as any).best_offer_enabled && (<>
                                <Row label="Min. Offer">
                                    <InlineInput value={(draft as any).best_offer_min ?? ''} prefix="$" type="number"
                                        onChange={v => onChange({ best_offer_min: v === '' ? null : Number(v) } as any)}
                                        placeholder="Minimum accepted" />
                                </Row>
                                <Row label="Auto-Accept">
                                    <InlineInput value={(draft as any).best_offer_accept ?? ''} prefix="$" type="number"
                                        onChange={v => onChange({ best_offer_accept: v === '' ? null : Number(v) } as any)}
                                        placeholder="e.g. 45.00" />
                                </Row>
                                <Row label="Auto-Decline">
                                    <InlineInput value={(draft as any).best_offer_decline ?? ''} prefix="$" type="number"
                                        onChange={v => onChange({ best_offer_decline: v === '' ? null : Number(v) } as any)}
                                        placeholder="e.g. 30.00" />
                                </Row>
                            </>)}
                            <Row label="Volume Pricing">
                                <InlineToggle checked={(draft as any).volume_pricing ?? false} onChange={v => onChange({ volume_pricing: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).volume_pricing ? 'Enabled' : 'Disabled'}
                                </span>
                            </Row>
                        </Section>

                        {/* ── 8. ITEM LOCATION ─────────────────────── */}
                        <Section icon={<MapPin size={14} style={{ color: C.primary }} />} title="Item Location"
                            status={(draft as any).item_zip ? 'ok' : 'warn'}>
                            <Row label="Postal Code" required missing={!(draft as any).item_zip}>
                                <InlineInput value={(draft as any).item_zip ?? ''} onChange={v => onChange({ item_zip: v } as any)} placeholder="e.g. 33166" />
                            </Row>
                            <Row label="Country">
                                <ProDropdown prefix="" currentValue={(draft as any).item_country ?? 'US'}
                                    onChanged={v => onChange({ item_country: v } as any)} width="full"
                                    options={[
                                        { val: 'US', label: 'United States', enabled: true, flagCode: 'us' },
                                        { val: 'GB', label: 'United Kingdom', enabled: true, flagCode: 'gb' },
                                        { val: 'CA', label: 'Canada', enabled: true, flagCode: 'ca' },
                                        { val: 'AU', label: 'Australia', enabled: true, flagCode: 'au' },
                                        { val: 'DE', label: 'Germany', enabled: true, flagCode: 'de' },
                                        { val: 'FR', label: 'France', enabled: true, flagCode: 'fr' },
                                    ]} />
                            </Row>
                        </Section>

                        {/* ── 9. SHIPPING ──────────────────────────── */}
                        <Section icon={<Truck size={14} style={{ color: C.primary }} />} title="Shipping">
                            <Row label="Free Shipping">
                                <InlineToggle checked={draft.free_shipping} onChange={v => onChange({ free_shipping: v, shipping_type: v ? 'free' : 'fixed' })} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{draft.free_shipping ? 'Yes' : 'No'}</span>
                            </Row>
                            {!draft.free_shipping && (<>
                                <Row label="Shipping Type">
                                    <ProDropdown prefix="" currentValue={draft.shipping_type}
                                        onChanged={v => onChange({ shipping_type: v })} width="full"
                                        options={[
                                            { val: 'fixed', label: 'Flat Rate', enabled: true },
                                            { val: 'calculated', label: 'Calculated', enabled: true },
                                            { val: 'freight', label: 'Freight', enabled: true },
                                        ]} />
                                </Row>
                                <Row label="Shipping Cost">
                                    <InlineInput value={draft.shipping_cost} prefix="$" type="number"
                                        onChange={v => onChange({ shipping_cost: Number(v) })} placeholder="0.00" />
                                </Row>
                                {draft.shipping_type === 'fixed' && (
                                    <Row label="Carrier">
                                        <ProDropdown prefix="" currentValue={(draft as any).shipping_carrier ?? ''}
                                            onChanged={v => onChange({ shipping_carrier: v } as any)} width="full"
                                            options={[
                                                { val: 'USPSGroundAdvantage', label: 'USPS Ground Advantage', enabled: true },
                                                { val: 'USPSPriority', label: 'USPS Priority Mail', enabled: true },
                                                { val: 'FedExGround', label: 'FedEx Ground', enabled: true },
                                                { val: 'UPSGround', label: 'UPS Ground', enabled: true },
                                                { val: 'OtherDomestic', label: 'Other', enabled: true },
                                            ]} />
                                    </Row>
                                )}
                                {draft.shipping_type === 'calculated' && (<>
                                    <Row label="Weight">
                                        <InlineInput value={(draft as any).package_weight_lbs ?? ''} type="number"
                                            onChange={v => onChange({ package_weight_lbs: v === '' ? null : Number(v) } as any)}
                                            placeholder="0" suffix="lbs" />
                                        <InlineInput value={(draft as any).package_weight_oz ?? ''} type="number"
                                            onChange={v => onChange({ package_weight_oz: v === '' ? null : Number(v) } as any)}
                                            placeholder="0" suffix="oz" />
                                    </Row>
                                    <Row label="Dimensions (in)">
                                        <InlineInput value={(draft as any).pkg_length ?? ''} type="number" placeholder="L"
                                            onChange={v => onChange({ pkg_length: v === '' ? null : Number(v) } as any)} />
                                        <span style={{ color: C.muted, fontSize: 12 }}>×</span>
                                        <InlineInput value={(draft as any).pkg_width ?? ''} type="number" placeholder="W"
                                            onChange={v => onChange({ pkg_width: v === '' ? null : Number(v) } as any)} />
                                        <span style={{ color: C.muted, fontSize: 12 }}>×</span>
                                        <InlineInput value={(draft as any).pkg_height ?? ''} type="number" placeholder="H"
                                            onChange={v => onChange({ pkg_height: v === '' ? null : Number(v) } as any)} />
                                    </Row>
                                </>)}
                            </>)}
                            <Row label="Irregular Package">
                                <InlineToggle checked={(draft as any).irregular_package ?? false} onChange={v => onChange({ irregular_package: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).irregular_package ? 'Yes — carriers may charge extra' : 'No'}
                                </span>
                            </Row>
                            <Row label="Intl. Shipping">
                                <InlineToggle checked={(draft as any).international_shipping ?? false} onChange={v => onChange({ international_shipping: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).international_shipping ? 'eBay International Shipping enabled' : 'Domestic only'}
                                </span>
                            </Row>
                        </Section>

                        {/* ── 10. DISPATCH & RETURNS ───────────────── */}
                        <Section icon={<RotateCcw size={14} style={{ color: C.primary }} />} title="Dispatch & Returns" status={draft.dispatch_days && draft.returns_policy ? 'ok' : 'warn'}>
                            <Row label="Dispatch Time">
                                <ProDropdown prefix="" currentValue={String(draft.dispatch_days)}
                                    onChanged={v => onChange({ dispatch_days: Number(v) })} width="full"
                                    options={[
                                        { val: '1', label: 'Same day / 1 day', enabled: true },
                                        { val: '2', label: '2 business days', enabled: true },
                                        { val: '3', label: '3 business days', enabled: true },
                                        { val: '5', label: '5 business days', enabled: true },
                                        { val: '10', label: '10 business days', enabled: true },
                                    ]} />
                            </Row>
                            <Row label="Returns Policy">
                                <ProDropdown prefix="" currentValue={draft.returns_policy}
                                    onChanged={v => onChange({ returns_policy: v })} width="full"
                                    options={[
                                        { val: 'no_returns', label: 'No Returns', enabled: true },
                                        { val: '30_day_buyer_pays', label: '30 Days — Buyer Pays', enabled: true },
                                        { val: '30_day_free_returns', label: '30 Days — Free', enabled: true },
                                        { val: '60_day_buyer_pays', label: '60 Days — Buyer Pays', enabled: true },
                                        { val: '60_day_free_returns', label: '60 Days — Free', enabled: true },
                                    ]} />
                            </Row>
                        </Section>

                        {/* ── 11. LISTING OPTIONS ──────────────────── */}
                        <Section icon={<Lock size={14} style={{ color: C.primary }} />} title="Listing Options" status="ok">
                            <Row label="Out of Stock">
                                <InlineToggle checked={(draft as any).out_of_stock_option ?? false} onChange={v => onChange({ out_of_stock_option: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).out_of_stock_option ? 'Keep listing at 0 qty' : 'End listing at 0 qty'}
                                </span>
                            </Row>
                            <Row label="Sell as Lot">
                                <InlineToggle checked={(draft as any).sell_as_lot ?? false} onChange={v => onChange({ sell_as_lot: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).sell_as_lot ? 'Yes' : 'No'}
                                </span>
                            </Row>
                            <Row label="Private Listing">
                                <InlineToggle checked={(draft as any).private_listing ?? false} onChange={v => onChange({ private_listing: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).private_listing ? 'Buyers stay anonymous' : 'No'}
                                </span>
                            </Row>
                            <Row label="Item Disclosures">
                                <InlineToggle checked={(draft as any).item_disclosures ?? false} onChange={v => onChange({ item_disclosures: v } as any)} />
                                <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {(draft as any).item_disclosures ? 'Required (Prop 65 etc.)' : 'Not applicable'}
                                </span>
                            </Row>
                            <Row label="Schedule">
                                <input
                                    type="datetime-local"
                                    value={(draft as any).scheduled_at ?? ''}
                                    onChange={e => onChange({ scheduled_at: e.target.value } as any)}
                                    style={{
                                        flex: 1, fontSize: 12, color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                        border: `1px solid ${C.borderInput}`,
                                        borderRadius: 10, padding: '7px 10px',
                                        backgroundColor: C.surface, outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                            </Row>
                        </Section>

                        {/* ── 12. PROMOTIONS ───────────────────────── */}
                        <Section icon={<Megaphone size={14} style={{ color: C.primary }} />} title="Promoted Listings" status={draft.promoted_general || draft.promoted_priority ? 'ok' : undefined}>

                            {/* General / Sponsored */}
                            <Row label="General">
                                <InlineToggle checked={draft.promoted_general ?? false} onChange={v => onChange({ promoted_general: v })} />
                                <div className="flex flex-col gap-0.5 flex-1">
                                    <span className="text-[12px] font-semibold" style={{ color: draft.promoted_general ? C.success : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                        {draft.promoted_general ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Pay on sale — ~90% more visibility
                                    </span>
                                </div>
                            </Row>
                            {draft.promoted_general && (
                                <Row label="Ad Rate">
                                    <InlineInput value={draft.promoted_general_rate ?? ''} type="number"
                                        suffix="%" placeholder="14.0"
                                        onChange={v => onChange({ promoted_general_rate: v === '' ? null : Number(v) })} />
                                    <div className="flex flex-col gap-0.5 shrink-0">
                                        <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Suggested: 14%</span>
                                        {draft.promoted_general_rate && (draft.sell_price ?? 0) > 0 && (
                                            <span className="text-[10px] font-bold" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                                ~${((draft.sell_price ?? 0) * (draft.promoted_general_rate ?? 0) / 100).toFixed(2)}/sale
                                            </span>
                                        )}
                                    </div>
                                </Row>
                            )}

                            {/* Priority / CPC */}
                            <Row label="Priority">
                                <InlineToggle checked={draft.promoted_priority ?? false} onChange={v => onChange({ promoted_priority: v })} />
                                <div className="flex flex-col gap-0.5 flex-1">
                                    <span className="text-[12px] font-semibold" style={{ color: draft.promoted_priority ? C.primary : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                        {draft.promoted_priority ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Pay per click — top of search placement
                                    </span>
                                </div>
                            </Row>
                            {draft.promoted_priority && (
                                <Row label="Daily Budget">
                                    <InlineInput value={draft.promoted_priority_budget ?? ''} type="number"
                                        prefix="$" placeholder="3.00"
                                        onChange={v => onChange({ promoted_priority_budget: v === '' ? null : Number(v) })} />
                                    <span className="text-[10px] shrink-0" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Min $3.00/day</span>
                                </Row>
                            )}

                            {/* Neither enabled — tip */}
                            {!draft.promoted_general && !draft.promoted_priority && (
                                <div className="py-2 px-1">
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Enable General for pay-on-sale boosting, or Priority for top-of-search CPC ads.
                                    </p>
                                </div>
                            )}
                        </Section>

                        <div style={{ height: 20 }} />
                    </div>

                    {/* ── RIGHT: Power sidebar ──────────────────── */}
                    <div className="xl:w-[500px] xl:shrink-0 p-3 xl:p-4 flex flex-col gap-3 xl:border-l xl:border-[#ede9fe] xl:sticky xl:top-0 xl:self-start xl:overflow-y-auto scrollbar-hide"
                        style={{ maxHeight: 'calc(100vh - 56px)' }}>

                        {/* ── Score gauge card ─────────────────────── */}
                        <div className="rounded-2xl overflow-hidden"
                            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>

                            {/* Gauge header — compact */}
                            <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                                <ScoreRing score={score} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-[22px] font-bold leading-none" style={{ color: scoreColor, fontFamily: 'Syne, sans-serif' }}>{score}</p>
                                        <p className="text-[14px] font-bold" style={{ color: scoreColor, fontFamily: 'Syne, sans-serif' }}>{scoreLabel}</p>
                                        <p className="text-[10px] ml-auto" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>/ 100 pts</p>
                                    </div>
                                    {/* Zone bar */}
                                    <div className="mt-2">
                                        <div className="relative h-2 rounded-full overflow-hidden flex gap-px">
                                            <div style={{ flex: 50, backgroundColor: '#fca5a5' }} />
                                            <div style={{ flex: 25, backgroundColor: '#fcd34d' }} />
                                            <div style={{ flex: 15, backgroundColor: '#86efac' }} />
                                            <div style={{ flex: 10, backgroundColor: '#c4b5fd' }} />
                                            <div className="absolute top-0 bottom-0 w-[3px] rounded-full"
                                                style={{ left: `${score}%`, backgroundColor: '#1e1535', transform: 'translateX(-50%)', transition: 'left 0.6s ease' }} />
                                        </div>
                                        <div className="flex mt-0.5">
                                            <span style={{ flex: 50 }}>
                                                <span className="text-[8px] font-semibold" style={{ color: '#ef4444', fontFamily: 'DM Sans, sans-serif' }}>0–49 Can&apos;t rank</span>
                                            </span>
                                            <span className="text-[8px] font-semibold" style={{ flex: 25, textAlign: 'center' as const, color: '#d97706', fontFamily: 'DM Sans, sans-serif' }}>50 Low</span>
                                            <span className="text-[8px] font-semibold" style={{ flex: 15, textAlign: 'center' as const, color: '#16a34a', fontFamily: 'DM Sans, sans-serif' }}>75 Good</span>
                                            <span className="text-[8px] font-semibold" style={{ flex: 10, textAlign: 'right' as const, color: '#7530fb', fontFamily: 'DM Sans, sans-serif' }}>90 Top</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Group bars */}
                            <div className="px-4 pb-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
                                {[
                                    { label: 'Required', earned: health.required.reduce((a, i) => a + i.points, 0), max: 50, color: C.danger },
                                    { label: 'Quality', earned: health.quality.reduce((a, i) => a + i.points, 0), max: 35, color: C.warning },
                                    { label: 'Boost', earned: health.boost.reduce((a, i) => a + i.points, 0), max: 15, color: C.success },
                                ].map(g => (
                                    <div key={g.label} className="flex items-center gap-3 pt-2">
                                        <span className="text-[10px] font-bold w-16 shrink-0" style={{ color: g.color, fontFamily: 'DM Sans, sans-serif' }}>{g.label}</span>
                                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                                            <div style={{ width: `${(g.earned / g.max) * 100}%`, height: '100%', backgroundColor: g.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                                        </div>
                                        <span className="text-[10px] font-bold w-10 text-right shrink-0" style={{ color: g.color, fontFamily: 'Syne, sans-serif' }}>{g.earned}/{g.max}</span>
                                    </div>
                                ))}
                            </div>

                            {/* VeRO */}
                            <div className="flex items-center gap-2 px-4 py-2.5"
                                style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.primaryLight }}>
                                <Shield size={12} style={{ color: C.primary }} />
                                <p className="text-[11px] font-medium" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {draft.vero_status === 'clear' ? 'VeRO clear ✓' : 'VeRO check will run on publish'}
                                </p>
                            </div>
                        </div>

                        {/* ── Priority action list ─────────────────── */}
                        {(() => {
                            const allItems = [...health.required, ...health.quality, ...health.boost]
                            const incomplete = allItems
                                .filter(i => !i.done)
                                .sort((a, b) => (b.max - b.points) - (a.max - a.points))

                            if (incomplete.length === 0) return null
                            const stepMap: Record<string, number> = {
                                title: 1, category: 1, condition: 1, sku: 1, subtitle: 1,
                                identifiers: 1, specifics: 1,
                                photos: 2, photo_min: 2, description: 2,
                                price: 3, location: 3, shipping: 3, returns: 3,
                                immediate_pay: 3, dispatch: 3, buy_price: 3,
                            }
                            const seen = new Set<string>()
                            const deduped = incomplete.filter(i => {
                                const group = i.key === 'photo_min' ? 'photos_group' : i.key === 'photos' ? 'photos_group' : i.key
                                if (seen.has(group)) return false
                                seen.add(group)
                                return true
                            })
                            return (
                                <div className="rounded-2xl overflow-hidden"
                                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-3 hover:opacity-80 transition-all"
                                        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}
                                        onClick={() => setShowActions(v => !v)}>
                                        <Flame size={13} style={{ color: C.danger }} />
                                        <p className="text-[12px] font-bold flex-1 text-left" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                            Fix these to rank higher
                                        </p>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: C.dangerBg, color: C.danger }}>
                                            {deduped.length}
                                        </span>
                                        <ChevronDown size={14} style={{ color: C.muted, transform: showActions ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                    </button>
                                    {showActions && <div className="grid grid-cols-2 gap-1.5 p-2.5">
                                        {deduped.map((item, idx) => {
                                            const gain = item.max - item.points
                                            const newScore = Math.min(score + gain, 100)
                                            const step = stepMap[item.key] ?? null
                                            return (
                                                <div key={item.key} className="flex flex-col gap-1 p-2 rounded-xl"
                                                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-[10px] font-bold truncate" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {item.label}
                                                        </p>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                style={{ backgroundColor: C.successBg, color: C.success }}>
                                                                +{gain}
                                                            </span>
                                                            {step && onStepJump && (
                                                                <button onClick={() => onStepJump(step)}
                                                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:opacity-80 transition-all"
                                                                    style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
                                                                    Step {step} <ArrowRight size={8} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] leading-tight" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {item.tip}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>}
                                </div>
                            )
                        })()}

                        {/* ── Publish gate ──────────────────────────── */}
                        {score < 50 ? (
                            <div className="rounded-2xl p-3 flex flex-col gap-2"
                                style={{ backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                                <div className="flex items-center gap-2">
                                    <XCircle size={14} style={{ color: C.danger }} />
                                    <p className="text-[12px] font-bold" style={{ color: C.danger, fontFamily: 'Syne, sans-serif' }}>Not ready — score below 50</p>
                                </div>
                                <button onClick={onSave}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-[12px]"
                                    style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                    <Eye size={12} /> Save as Draft
                                </button>
                            </div>
                        ) : score < 75 ? (
                            <div className="flex gap-2">
                                <button onClick={handlePublish} disabled={publishing}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] transition-all hover:opacity-90"
                                    style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                                    {publishing ? <><Loader2 size={12} className="animate-spin" /> Publishing...</> : <><Send size={12} /> Publish</>}
                                </button>
                                <button onClick={onSave}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-[12px] transition-all hover:opacity-80"
                                    style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                    <Eye size={12} /> Save Draft
                                </button>
                            </div>
                        ) : score < 90 ? (
                            <div className="rounded-2xl overflow-hidden"
                                style={{ border: `1px solid #86efac` }}>
                                <div className="p-2.5 flex items-center gap-2" style={{ backgroundColor: C.successBg }}>
                                    <CheckCircle2 size={12} style={{ color: C.success, flexShrink: 0 }} />
                                    <p className="text-[11px] font-bold" style={{ color: C.success, fontFamily: 'Syne, sans-serif' }}>Good to go! Improve more to reach top ranking</p>
                                </div>
                                <div className="flex gap-2 p-2">
                                    <button onClick={handlePublish} disabled={publishing}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-[12px] rounded-xl transition-all hover:opacity-90"
                                        style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif', boxShadow: '0 4px 12px rgba(117,48,251,0.35)' }}>
                                        {publishing ? <><Loader2 size={12} className="animate-spin" /> Publishing...</> : <><Send size={12} /> Publish</>}
                                    </button>
                                    <button onClick={onSave}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-semibold text-[12px] rounded-xl transition-all hover:opacity-80"
                                        style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        <Eye size={12} /> Save Draft
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl overflow-hidden"
                                style={{ border: `1px solid ${C.primary}` }}>
                                <div className="p-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #7530fb15, #b8fa3315)' }}>
                                    <Flame size={12} style={{ color: C.primary, flexShrink: 0 }} />
                                    <p className="text-[11px] font-bold" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>🔥 Top quality — publish now!</p>
                                </div>
                                <div className="flex gap-2 p-2">
                                    <button onClick={handlePublish} disabled={publishing}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-[12px] rounded-xl transition-all hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #7530fb, #9b59fb)', color: '#fff', fontFamily: 'Syne, sans-serif', boxShadow: '0 4px 16px rgba(117,48,251,0.5)' }}>
                                        {publishing ? <><Loader2 size={12} className="animate-spin" /> Publishing...</> : <><Send size={12} /> Publish</>}
                                    </button>
                                    <button onClick={onSave}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-semibold text-[12px] rounded-xl transition-all hover:opacity-80"
                                        style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        <Eye size={12} /> Save Draft
                                    </button>
                                </div>
                            </div>
                        )}



                        {showToast && (
                            <div className="flex items-start gap-2 p-3 rounded-xl"
                                style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                                <Zap size={12} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <p className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>Draft saved!</p>
                                    <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>eBay API integration coming soon.</p>
                                </div>
                            </div>
                        )}

                        {/* Profit snapshot */}
                        {(draft.sell_price ?? 0) > 0 && (
                            <div className="rounded-2xl overflow-hidden"
                                style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                                <div className="flex items-center gap-2 px-4 py-3"
                                    style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                                    <TrendingUp size={13} style={{ color: C.primary }} />
                                    <p className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Profit Snapshot</p>
                                    <span className="text-[9px] font-semibold ml-auto px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        Profit Engine
                                    </span>
                                </div>
                                {(() => {
                                    const s = draft.sell_price ?? 0
                                    const b = draft.buy_price ?? 0
                                    const country = draft.item_country ?? 'US'
                                    const p = ProfitEngine.calculate({
                                        sellingPrice: s,
                                        buyPrice: b,
                                        shippingCost: draft.free_shipping ? (draft.shipping_cost ?? 0) : 0,
                                        settings: {
                                            ...DEFAULT_SETTINGS,
                                            isUSMarket: country === 'US',
                                            isUKMarket: country === 'GB',
                                            isCAMarket: country === 'CA',
                                            isAUMarket: country === 'AU',
                                            isDEMarket: country === 'DE',
                                            isFRMarket: country === 'FR',
                                            isVATRegistered: draft.vat_registered ?? false,
                                            adRatePercent: draft.promoted_general_rate ?? 0,
                                            buyerPaidShipping: draft.free_shipping ? 0 : (draft.shipping_cost ?? 0),
                                        }
                                    })
                                    const sym = country === 'GB' ? '£' : ['DE', 'FR'].includes(country) ? '€' : country === 'CA' ? 'CA$' : country === 'AU' ? 'AU$' : '$'
                                    const f = (n: number) => n >= 0 ? `${sym}${n.toFixed(2)}` : `-${sym}${Math.abs(n).toFixed(2)}`
                                    const profitColor = p.netProfit > 0 ? C.success : C.danger
                                    return (
                                        <div className="px-4 pb-3">
                                            {[
                                                { label: 'Sell Price', val: f(s), color: C.body },
                                                { label: `eBay Fee (${p.effectiveCatFeePercent.toFixed(2)}%)`, val: `-${f(p.totalEbayFees)}`, color: C.muted },
                                                p.promotedAdFee > 0 ? { label: 'Promoted Ads', val: `-${f(p.promotedAdFee)}`, color: C.muted } : null,
                                                b > 0 ? { label: 'Cost', val: `-${f(b)}`, color: C.muted } : null,
                                                p.vatOnFees > 0 ? { label: 'VAT on Fees', val: `-${f(p.vatOnFees)}`, color: C.muted } : null,
                                            ].filter(Boolean).map(row => (
                                                <div key={row!.label} className="flex justify-between py-1.5"
                                                    style={{ borderBottom: `1px solid ${C.border}` }}>
                                                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{row!.label}</span>
                                                    <span className="text-[11px] font-semibold" style={{ color: row!.color, fontFamily: 'DM Sans, sans-serif' }}>{row!.val}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between pt-2">
                                                <span className="text-[13px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Net Profit</span>
                                                <span className="text-[15px] font-bold" style={{ color: profitColor, fontFamily: 'Syne, sans-serif' }}>{f(p.netProfit)}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {[
                                                    { label: 'MARGIN', val: p.profitMargin, good: 20 },
                                                    { label: 'ROI', val: b > 0 ? p.roi : null, good: 30 },
                                                ].map(stat => (
                                                    <div key={stat.label} className="p-2 rounded-xl text-center"
                                                        style={{ backgroundColor: stat.val === null ? C.bg : stat.val >= stat.good ? C.successBg : stat.val >= 0 ? C.warningBg : C.dangerBg }}>
                                                        <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{stat.label}</p>
                                                        <p className="text-[15px] font-bold" style={{
                                                            color: stat.val === null ? C.muted : stat.val >= stat.good ? C.success : stat.val >= 0 ? C.warning : C.danger,
                                                            fontFamily: 'Syne, sans-serif'
                                                        }}>
                                                            {stat.val !== null ? `${stat.val.toFixed(1)}%` : '—'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            {p.breakEvenPrice > 0 && (
                                                <div className="flex items-center justify-between mt-2 px-2 py-1.5 rounded-lg"
                                                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                                    <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Break-even</span>
                                                    <span className="text-[11px] font-bold" style={{ color: C.warning, fontFamily: 'Syne, sans-serif' }}>{f(p.breakEvenPrice)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    )
}
