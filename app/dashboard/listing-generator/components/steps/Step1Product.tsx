'use client'
// app/dashboard/listing-generator/components/steps/Step1Product.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio — Step 1: Product & SEO
//
//   ✓ Seller type selector
//   ✓ Product title with character counter + Cassini score
//   ✓ Category picker
//   ✓ Condition selector
//   ✓ SKU / Custom Label
//   ✓ Item Specifics (key fields)
// ─────────────────────────────────────────────────────────────

import { useState, ReactNode } from 'react'
import {
    ChevronRight, ChevronDown, AlertCircle, CheckCircle2,
    Tag, Hash, Layers, Info,
} from 'lucide-react'
import type { DraftData } from '../LgStudio'
import Tooltip from '@/components/ui/Tooltip'
import ProDropdown from '@/components/ui/ProDropdown'
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentText: '#1e1535',
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

// ── Seller types ─────────────────────────────────────────────
const SELLER_TYPES = [
    {
        id: 'own_stock',
        label: 'Own Stock',
        desc: 'You own and store the item',
        color: C.secondary,
        bg: '#f8f7ff',
        border: C.border,
    },
    {
        id: 'wholesale',
        label: 'Wholesale',
        desc: 'Bought in bulk from supplier',
        color: '#0ea5e9',
        bg: '#e0f2fe',
        border: '#bae6fd',
    },
    {
        id: 'retail_arb',
        label: 'Retail Arb',
        desc: 'Sourced from retail stores',
        color: C.success,
        bg: C.successBg,
        border: '#86efac',
    },
    {
        id: 'dropship',
        label: 'Dropship',
        desc: 'Ships direct from supplier',
        color: C.primary,
        bg: C.primaryLight,
        border: C.border,
    },
    {
        id: 'reseller',
        label: 'Reseller',
        desc: 'Thrift, vintage or charity',
        color: C.warning,
        bg: C.warningBg,
        border: '#fcd34d',
    },
    {
        id: 'pod',
        label: 'Print on Demand',
        desc: 'Printed and shipped by POD',
        color: '#8b5cf6',
        bg: '#ede9fe',
        border: '#c4b5fd',
    },
]

// ── Conditions as ProDropdown options ────────────────────────
const CONDITION_OPTIONS = [
    'New',
    'New with tags',
    'New without tags',
    'New with defects',
    'Used - Like New',
    'Used - Good',
    'Used - Acceptable',
    'For parts or not working',
].map(c => ({ val: c, label: c, enabled: true }))

// ── Source platforms by seller type ──────────────────────────
const SOURCE_PLATFORMS: Record<string, { id: string; label: string }[]> = {
    dropship: [
        { id: 'aliexpress', label: 'AliExpress' },
        { id: 'cj_dropshipping', label: 'CJ Dropshipping' },
        { id: 'dhgate', label: 'DHgate' },
        { id: 'banggood', label: 'Banggood' },
        { id: 'alibaba', label: 'Alibaba' },
        { id: 'temu', label: 'Temu' },
    ],
    retail_arb: [
        { id: 'argos', label: 'Argos' },
        { id: 'amazon_uk', label: 'Amazon UK' },
        { id: 'amazon', label: 'Amazon US' },
        { id: 'walmart', label: 'Walmart' },
        { id: 'home_depot', label: 'Home Depot' },
        { id: 'costco', label: 'Costco' },
        { id: 'target', label: 'Target' },
    ],
    wholesale: [
        { id: 'wholesale_supplier', label: 'Wholesale Supplier' },
        { id: 'alibaba', label: 'Alibaba' },
        { id: 'dhgate', label: 'DHgate' },
    ],
    pod: [
        { id: 'printful', label: 'Printful' },
        { id: 'printify', label: 'Printify' },
        { id: 'redbubble', label: 'Redbubble' },
    ],
}

// ── Profit calculator category map ───────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
    consumer_electronics: 'Consumer Electronics',
    electronics_accessories: 'Electronics Accessories',
    computers: 'Computers/Tablets & Networking',
    video_games: 'Video Games & Consoles',
    clothing: 'Clothing, Shoes & Accessories',
    jewelry: 'Jewellery & Watches',
    home_garden: 'Home & Garden',
    furniture: 'Furniture',
    toys_hobbies: 'Toys & Hobbies',
    dolls: 'Dolls & Bears',
    sporting_goods: 'Sporting Goods',
    health_beauty: 'Health & Beauty',
    books_movies: 'Books, Movies & Music',
    music_instruments: 'Musical Instruments & Gear',
    collectibles: 'Collectibles',
    coins: 'Coins & Paper Money',
    stamps: 'Stamps',
    motors_parts: 'Motors Parts & Accessories',
    business: 'Business & Industrial',
    pet_supplies: 'Pet Supplies',
    default: 'Other',
}

// ── Category options as ProDropdown options ───────────────────
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([id, label]) => ({
    val: id,
    label,
    enabled: true,
}))

const KEYWORD_CATEGORY_MAP: Record<string, string[]> = {
    'phone|mobile|iphone|android|samsung|pixel': ['consumer_electronics', 'electronics_accessories'],
    'laptop|computer|pc|mac|tablet|ipad': ['computers', 'consumer_electronics'],
    'headphone|earphone|earbud|speaker|audio': ['consumer_electronics', 'electronics_accessories'],
    'camera|lens|gopro|drone': ['consumer_electronics'],
    'tv|television|monitor|screen': ['consumer_electronics', 'furniture'],
    'cable|charger|case|cover|screen protector': ['electronics_accessories'],
    'game|playstation|xbox|nintendo|ps5|ps4': ['video_games'],
    'controller|joystick|gaming': ['video_games', 'consumer_electronics'],
    'shirt|tshirt|hoodie|jacket|coat|dress|skirt': ['clothing'],
    'shoes|sneakers|boots|sandals|heels': ['clothing'],
    'watch|bracelet|necklace|ring|earring': ['jewelry'],
    'bag|purse|handbag|wallet|backpack': ['clothing'],
    'sunglasses|glasses|cap|hat|beanie': ['clothing'],
    'furniture|sofa|chair|table|desk|bed|shelf': ['furniture', 'home_garden'],
    'garden|plant|tools|lawn|outdoor': ['home_garden'],
    'kitchen|cookware|pan|pot|utensil': ['home_garden'],
    'lamp|light|lighting|bulb': ['home_garden'],
    'toy|lego|doll|action figure|puzzle': ['toys_hobbies', 'dolls'],
    'coin|silver|gold|currency|medal': ['coins', 'collectibles'],
    'stamp|postal': ['stamps', 'collectibles'],
    'card|trading card|pokemon|yugioh|sports card': ['collectibles', 'toys_hobbies'],
    'antique|vintage|rare|signed|autograph': ['collectibles'],
    'bike|bicycle|cycling|gym|fitness|yoga': ['sporting_goods'],
    'football|basketball|baseball|soccer|tennis': ['sporting_goods'],
    'golf|ski|snowboard|surfboard': ['sporting_goods'],
    'book|novel|textbook|manga|comic': ['books_movies'],
    'dvd|blu-ray|movie|cd|vinyl|record': ['books_movies'],
    'instrument|guitar|piano|drum|violin': ['music_instruments'],
    'makeup|lipstick|foundation|mascara|skincare': ['health_beauty'],
    'vitamin|supplement|protein': ['health_beauty', 'sporting_goods'],
    'perfume|cologne|fragrance': ['health_beauty'],
    'car part|brake|exhaust|bumper|mirror|auto': ['motors_parts'],
    'motorcycle|atv|boat|marine': ['motors_parts'],
    'printer|scanner|office|industrial|machine': ['business', 'computers'],
    'dog|cat|pet|animal|aquarium|fish': ['pet_supplies'],
}

function suggestCategories(productName: string): string[] {
    if (!productName || productName.length < 3) return []
    const suggestions = new Set<string>()
    for (const [keywords, categories] of Object.entries(KEYWORD_CATEGORY_MAP)) {
        if (new RegExp(keywords, 'i').test(productName)) {
            categories.forEach(c => suggestions.add(c))
        }
    }
    return [...suggestions].slice(0, 3)
}


// ── Title score helper ─────────────────────────────────────────
function getTitleScore(title: string): { score: number; label: string; color: string; bg: string } {
    const len = title.length
    if (len === 0) return { score: 0, label: 'No title', color: C.muted, bg: C.bg }
    if (len < 20) return { score: 20, label: 'Too short', color: C.danger, bg: C.dangerBg }
    if (len < 40) return { score: 50, label: 'Needs more keywords', color: C.warning, bg: C.warningBg }
    if (len < 60) return { score: 75, label: 'Good', color: C.primary, bg: C.primaryLight }
    if (len <= 80) return { score: 100, label: 'Excellent', color: C.success, bg: C.successBg }
    return { score: 40, label: 'Too long — over 80 chars', color: C.danger, bg: C.dangerBg }
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    draft: DraftData
    onChange: (updates: Partial<DraftData>) => void
    onNext: () => void
    onSave?: () => void
}

// ── Reusable field wrapper ────────────────────────────────────
function Field({
    label,
    required,
    hint,
    children,
}: {
    label: string
    required?: boolean
    hint?: string
    children?: ReactNode
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
                <label className="text-[13px] font-semibold"
                    style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                    {label}
                </label>
                {required && (
                    <span className="text-[11px] font-bold" style={{ color: C.danger }}>*</span>
                )}
                {hint && (
                    <Tooltip text={hint} position="top">
                        <span>
                            <Info size={12} style={{ color: C.muted }} />
                        </span>
                    </Tooltip>
                )}
            </div>
            {children}
        </div>
    )
}

// ── Input styles ──────────────────────────────────────────────
const inputStyle = {
    backgroundColor: C.surface,
    border: `1px solid ${C.borderInput}`,
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 14,
    color: C.body,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    width: '100%',
}

// ── Main Step 1 Component ─────────────────────────────────────
export default function Step1Product({ draft, onChange, onNext, onSave }: Props) {
    const [showSpecifics, setShowSpecifics] = useState(false)
    const [newSpecKey, setNewSpecKey] = useState('')
    const [newSpecVal, setNewSpecVal] = useState('')
    const [parentCategory, setParentCategory] = useState('')

    const categorySuggestions = suggestCategories(draft.product_name || draft.title)

    const titleScore = getTitleScore(draft.title)
    const titleLen = draft.title.length

    const sourcePlatforms = SOURCE_PLATFORMS[draft.seller_type] || []

    const canProceed = !!(
        draft.seller_type &&
        draft.title.length >= 20 &&
        draft.category &&
        draft.condition
    )

    // ── Add item specific ────────────────────────────────────
    function addSpecific() {
        if (!newSpecKey.trim() || !newSpecVal.trim()) return
        onChange({
            item_specifics: {
                ...draft.item_specifics,
                [newSpecKey.trim()]: newSpecVal.trim(),
            }
        })
        setNewSpecKey('')
        setNewSpecVal('')
    }

    function removeSpecific(key: string) {
        const updated = { ...draft.item_specifics }
        delete updated[key]
        onChange({ item_specifics: updated })
    }

    return (
        <div className="flex flex-col xl:h-full overflow-y-auto xl:overflow-hidden scrollbar-hide">

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 md:gap-7">

                    {/* ── SECTION: Seller Type ─────────────────── */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: C.primaryLight }}>
                                <Layers size={13} style={{ color: C.primary }} />
                            </div>
                            <h2 className="text-[15px] font-bold"
                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                How are you selling this?
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {SELLER_TYPES.map(type => {
                                const isSelected = draft.seller_type === type.id
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => onChange({ seller_type: type.id })}
                                        className="flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all"
                                        style={{
                                            backgroundColor: isSelected ? type.bg : C.surface,
                                            border: `2px solid ${isSelected ? type.color : C.border}`,
                                            boxShadow: isSelected ? `0 0 0 3px ${type.bg}` : 'none',
                                        }}>
                                        <span className="text-[13px] font-bold"
                                            style={{ color: isSelected ? type.color : C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                            {type.label}
                                        </span>
                                        <span className="text-[11px]"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            {type.desc}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* ── SECTION: Source Platform (conditional) ── */}
                    {sourcePlatforms.length > 0 && (
                        <Field label="Source Platform" required
                            hint="Where are you sourcing this product from?">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {sourcePlatforms.map(p => (
                                    <button key={p.id}
                                        onClick={() => onChange({ source_platform: p.id } as any)}
                                        className="px-3 py-2 rounded-xl text-[12px] font-semibold transition-all text-center"
                                        style={{
                                            backgroundColor: (draft as any).source_platform === p.id ? C.primaryLight : C.surface,
                                            border: `2px solid ${(draft as any).source_platform === p.id ? C.primary : C.border}`,
                                            color: (draft as any).source_platform === p.id ? C.primary : C.secondary,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    )}

                    {/* ── SECTION: Product Name ────────────────── */}
                    <Field label="Product Name"
                        hint="Your internal name for this product. Not shown to buyers.">
                        <input
                            type="text"
                            value={draft.product_name}
                            onChange={e => onChange({ product_name: e.target.value })}
                            placeholder="e.g. iPhone 14 Pro Max 256GB"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = C.primary}
                            onBlur={e => e.target.style.borderColor = C.borderInput}
                        />
                    </Field>

                    {/* ── SECTION: Title ───────────────────────── */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: C.primaryLight }}>
                                <Tag size={13} style={{ color: C.primary }} />
                            </div>
                            <h2 className="text-[15px] font-bold"
                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                eBay Listing Title
                            </h2>
                        </div>

                        <Field label="Title" required
                            hint="eBay allows 80 characters. Include brand, model, size, colour and condition for best Cassini ranking.">
                            <div className="relative">
                                <textarea
                                    value={draft.title}
                                    onChange={e => onChange({ title: e.target.value, product_name: e.target.value })}
                                    placeholder="e.g. Apple iPhone 14 Pro Max 256GB Space Black Unlocked Smartphone 48MP Camera"
                                    rows={2}
                                    maxLength={80}
                                    style={{
                                        ...inputStyle,
                                        resize: 'none',
                                        paddingRight: 60,
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                                {/* Char counter */}
                                <span className="absolute bottom-3 right-3 text-[11px] font-bold"
                                    style={{
                                        color: titleLen > 80 ? C.danger : titleLen >= 60 ? C.success : C.muted,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {titleLen}/80
                                </span>
                            </div>

                            {/* Title score bar — always visible, animates with typing */}
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            borderRadius: 999,
                                            width: draft.title.length === 0 ? '0%' : `${titleScore.score}%`,
                                            backgroundColor: titleScore.color,
                                            transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), background-color 0.25s ease',
                                        }}
                                    />
                                </div>
                                {draft.title.length > 0 && (
                                    <span className="text-[11px] font-semibold shrink-0"
                                        style={{ color: titleScore.color, fontFamily: 'DM Sans, sans-serif' }}>
                                        {titleScore.label}
                                    </span>
                                )}
                            </div>

                            {/* Cassini tips */}
                            {draft.title.length > 0 && draft.title.length < 60 && (
                                <div className="flex items-start gap-2 p-2.5 rounded-xl mt-1"
                                    style={{ backgroundColor: C.warningBg }}>
                                    <AlertCircle size={13} style={{ color: C.warning, marginTop: 1 }} />
                                    <p className="text-[11px]"
                                        style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                        Add more keywords — brand, model number, colour, size and condition to reach 60-80 characters for best Cassini ranking.
                                    </p>
                                </div>
                            )}
                            {draft.title.length >= 60 && draft.title.length <= 80 && (
                                <div className="flex items-start gap-2 p-2.5 rounded-xl mt-1"
                                    style={{ backgroundColor: C.successBg }}>
                                    <CheckCircle2 size={13} style={{ color: C.success, marginTop: 1 }} />
                                    <p className="text-[11px]"
                                        style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                        Great title length — this will rank well in Cassini search.
                                    </p>
                                </div>
                            )}
                        </Field>
                    </div>

                    {/* ── SECTION: Category + Condition ────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="eBay Category" required>
                            <div className="flex flex-col gap-2">
                                {/* Suggested category pills */}
                                {categorySuggestions.length > 0 && (
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Suggested
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {categorySuggestions.map(cat => (
                                                <button key={cat}
                                                    onClick={() => {
                                                        setParentCategory(cat)
                                                        onChange({ category: cat })
                                                    }}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                                                    style={{
                                                        backgroundColor: draft.category === cat ? C.primary : C.primaryLight,
                                                        color: draft.category === cat ? '#ffffff' : C.primary,
                                                        border: `1px solid ${draft.category === cat ? C.primary : C.border}`,
                                                        fontFamily: 'DM Sans, sans-serif',
                                                    }}>
                                                    {draft.category === cat && <CheckCircle2 size={10} />}
                                                    {CATEGORY_LABELS[cat]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* ProDropdown for manual selection */}
                                <ProDropdown
                                    prefix=""
                                    currentValue={parentCategory}
                                    options={CATEGORY_OPTIONS}
                                    onChanged={val => {
                                        setParentCategory(val)
                                        onChange({ category: val })
                                    }}
                                    width="full"
                                />
                            </div>
                        </Field>

                        <Field label="Item Condition" required>
                            <ProDropdown
                                prefix=""
                                currentValue={draft.condition}
                                options={CONDITION_OPTIONS}
                                onChanged={val => onChange({ condition: val })}
                                width="full"
                            />
                        </Field>
                    </div>

                    {/* ── SECTION: SKU + Quantity ──────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="SKU / Custom Label"
                            hint="Your internal reference number. Buyers don't see this.">
                            <div className="relative">
                                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: C.muted }} />
                                <input
                                    type="text"
                                    value={draft.sku}
                                    onChange={e => onChange({ sku: e.target.value })}
                                    placeholder="e.g. SP-4421"
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                            </div>
                        </Field>

                        <Field label="Quantity" required
                            hint="How many do you have in stock?">
                            <input
                                type="number"
                                min={1}
                                max={9999}
                                value={draft.quantity}
                                onChange={e => onChange({ quantity: parseInt(e.target.value) || 1 })}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = C.primary}
                                onBlur={e => e.target.style.borderColor = C.borderInput}
                            />
                        </Field>
                    </div>

                    {/* ── SECTION: Item Specifics ───────────────── */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowSpecifics(s => !s)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all"
                            style={{
                                backgroundColor: C.surface,
                                border: `1px solid ${C.border}`,
                            }}>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: C.primaryLight }}>
                                    <Layers size={13} style={{ color: C.primary }} />
                                </div>
                                <span className="text-[14px] font-semibold"
                                    style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    Item Specifics
                                </span>
                                {Object.keys(draft.item_specifics).length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        {Object.keys(draft.item_specifics).length} added
                                    </span>
                                )}
                            </div>
                            <ChevronDown size={14}
                                style={{
                                    color: C.muted,
                                    transform: showSpecifics ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                }} />
                        </button>

                        {showSpecifics && (
                            <div className="flex flex-col gap-3 p-4 rounded-xl"
                                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>

                                <p className="text-[12px]"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Add key details like Brand, Model, Colour, Size, MPN, EAN. These help buyers find your listing.
                                </p>

                                {/* Existing specifics */}
                                {Object.entries(draft.item_specifics).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={key}
                                            readOnly
                                            style={{ ...inputStyle, flex: 1, backgroundColor: C.bg }}
                                        />
                                        <input
                                            type="text"
                                            value={value}
                                            onChange={e => onChange({
                                                item_specifics: { ...draft.item_specifics, [key]: e.target.value }
                                            })}
                                            style={{ ...inputStyle, flex: 2 }}
                                            onFocus={e => e.target.style.borderColor = C.primary}
                                            onBlur={e => e.target.style.borderColor = C.borderInput}
                                        />
                                        <button
                                            onClick={() => removeSpecific(key)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: C.dangerBg, color: C.danger }}>
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {/* Add new specific */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newSpecKey}
                                        onChange={e => setNewSpecKey(e.target.value)}
                                        placeholder="Name (e.g. Brand)"
                                        style={{ ...inputStyle, flex: 1 }}
                                        onFocus={e => e.target.style.borderColor = C.primary}
                                        onBlur={e => e.target.style.borderColor = C.borderInput}
                                    />
                                    <input
                                        type="text"
                                        value={newSpecVal}
                                        onChange={e => setNewSpecVal(e.target.value)}
                                        placeholder="Value (e.g. Apple)"
                                        style={{ ...inputStyle, flex: 2 }}
                                        onKeyDown={e => e.key === 'Enter' && addSpecific()}
                                        onFocus={e => e.target.style.borderColor = C.primary}
                                        onBlur={e => e.target.style.borderColor = C.borderInput}
                                    />
                                    <button
                                        onClick={addSpecific}
                                        disabled={!newSpecKey.trim() || !newSpecVal.trim()}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-[16px] transition-all disabled:opacity-40"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                                        +
                                    </button>
                                </div>

                                {/* Quick add suggestions */}
                                <div className="flex flex-wrap gap-1.5">
                                    {['Brand', 'Model', 'Colour', 'Size', 'MPN', 'EAN', 'Material', 'Country of Manufacture']
                                        .filter(k => !draft.item_specifics[k])
                                        .map(suggestion => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setNewSpecKey(suggestion)}
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                                                style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                                + {suggestion}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>


        </div>
    )
}
