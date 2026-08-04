'use client'
// components/profit/CalculatorProfiles.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Settings, X, Trash2, Download, Upload, Check, Copy,
    Package, ShoppingBag, Store, Briefcase, Tag, Smartphone,
    Shirt, Wrench, BookOpen, Gamepad2, Inbox, Globe, Star,
    BadgePercent, CreditCard, Coins, ShoppingCart, Megaphone,
    BarChart2, SlidersHorizontal, Receipt, Lightbulb, Layers
} from 'lucide-react'

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
    lime: '#8fff00',
    limeDeep: '#4a7c00',
    limeBg: '#f0fdf4',
    dark: '#1a2410',
    border: '#e8ede2',
    muted: '#8a9e78',
    surface: '#ffffff',
    bg: '#f7f9f5',
    text: '#1a2410',
    red: '#b91c1c',
    redBg: '#fef2f2',
    amber: '#d97706',
    green: '#16a34a',
}

// ── Profile icons ────────────────────────────────────────────────────────────
const ICONS = [
    { key: 'Package', Icon: Package },
    { key: 'ShoppingBag', Icon: ShoppingBag },
    { key: 'Store', Icon: Store },
    { key: 'Briefcase', Icon: Briefcase },
    { key: 'Tag', Icon: Tag },
    { key: 'Smartphone', Icon: Smartphone },
    { key: 'Shirt', Icon: Shirt },
    { key: 'Wrench', Icon: Wrench },
    { key: 'BookOpen', Icon: BookOpen },
    { key: 'Gamepad2', Icon: Gamepad2 },
]

const ACCENT_COLORS = ['#8fff00', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

function ProfileIcon({ iconKey, size = 14, color = C.muted }: { iconKey: string; size?: number; color?: string }) {
    const found = ICONS.find(i => i.key === iconKey)
    if (!found) return <Package size={size} color={color} />
    return <found.Icon size={size} color={color} />
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface CalcProfile {
    id: string
    name: string
    iconKey: string
    accent: string
    createdAt: number
    updatedAt: number
    country: string
    isTopRatedPlus: boolean
    isBelowStandard: boolean
    belowStandardMonths: number
    isVeryHighINAD: boolean
    inadMonths: number
    usStoreTier: string
    ukStoreTier: string
    caStoreTier: string
    deShopTier: string
    auProPlan: string
    categoryFeePercent: number
    usCategoryKey: string
    ukCategoryKey: string
    caCategoryKey: string
    deCategoryKey: string
    frCategoryKey: string
    itCategoryKey: string
    esCategoryKey: string
    atCategoryKey: string
    ieCategoryKey: string
    auCategoryTier: number
    isVATRegistered: boolean
    deIsVATRegistered: boolean
    frIsVATRegistered: boolean
    itIsVATRegistered: boolean
    esIsVATRegistered: boolean
    atIsVATRegistered: boolean
    ieIsVATRegistered: boolean
    nlIsVATRegistered: boolean
    beIsVATRegistered: boolean
    plIsVATRegistered: boolean
    chIsVATRegistered: boolean
    isGSTRegistered: boolean
    annualRevenue: number
    outputVATEnabled: boolean
    shippingCost: number
    sourcingTaxPercent: number
    payoutFeePercent: number
    cashbackPercent: number
    buyerTaxPercent: number
    adRatePercent: number
    defectRatePercent: number
    isAdvancedEnabled: boolean
}

const STORAGE_KEY = 'riazify_calc_profiles'
const ACTIVE_KEY = 'riazify_active_profile'
const MAX_PROFILES = 5

// ── Storage ──────────────────────────────────────────────────────────────────
function loadAll(): CalcProfile[] {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveAll(list: CalcProfile[]) {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
function loadActiveId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACTIVE_KEY) ?? null
}
function saveActiveId(id: string | null) {
    if (typeof window === 'undefined') return
    id ? localStorage.setItem(ACTIVE_KEY, id) : localStorage.removeItem(ACTIVE_KEY)
}

// ── Extract profile from state ────────────────────────────────────────────────
function extractProfile(country: string, s: any, base?: Partial<CalcProfile>): Omit<CalcProfile, 'id' | 'createdAt'> {
    return {
        name: base?.name ?? 'New Profile',
        iconKey: base?.iconKey ?? ICONS[0].key,
        accent: base?.accent ?? ACCENT_COLORS[0],
        updatedAt: Date.now(),
        country,
        isTopRatedPlus: s.isTopRatedPlus ?? false,
        isBelowStandard: s.isBelowStandard ?? false,
        belowStandardMonths: s.belowStandardMonths ?? 0,
        isVeryHighINAD: s.isVeryHighINAD ?? false,
        inadMonths: s.inadMonths ?? 0,
        usStoreTier: s.usStoreTier ?? 'none',
        ukStoreTier: s.ukStoreTier ?? 'none',
        caStoreTier: s.caStoreTier ?? 'none',
        deShopTier: s.deShopTier ?? 'none',
        auProPlan: s.auProPlan ?? 'starter',
        categoryFeePercent: s.categoryFeePercent ?? 13.25,
        usCategoryKey: s.usCategoryKey ?? 'default',
        ukCategoryKey: s.ukCategoryKey ?? 'default',
        caCategoryKey: s.caCategoryKey ?? 'default',
        deCategoryKey: s.deCategoryKey ?? 'default',
        frCategoryKey: s.frCategoryKey ?? 'default',
        itCategoryKey: s.itCategoryKey ?? 'default',
        esCategoryKey: s.esCategoryKey ?? 'default',
        atCategoryKey: s.atCategoryKey ?? 'default',
        ieCategoryKey: s.ieCategoryKey ?? 'default',
        auCategoryTier: s.auCategoryTier ?? 2,
        isVATRegistered: s.isVATRegistered ?? true,
        deIsVATRegistered: s.deIsVATRegistered ?? true,
        frIsVATRegistered: s.frIsVATRegistered ?? true,
        itIsVATRegistered: s.itIsVATRegistered ?? true,
        esIsVATRegistered: s.esIsVATRegistered ?? true,
        atIsVATRegistered: s.atIsVATRegistered ?? true,
        ieIsVATRegistered: s.ieIsVATRegistered ?? true,
        nlIsVATRegistered: s.nlIsVATRegistered ?? true,
        beIsVATRegistered: s.beIsVATRegistered ?? true,
        plIsVATRegistered: s.plIsVATRegistered ?? true,
        chIsVATRegistered: s.chIsVATRegistered ?? true,
        isGSTRegistered: s.isGSTRegistered ?? false,
        annualRevenue: s.annualRevenue ?? 0,
        outputVATEnabled: s.outputVATEnabled ?? false,
        shippingCost: s.shippingCost ?? 0,
        sourcingTaxPercent: s.sourcingTaxPercent ?? 0,
        payoutFeePercent: s.payoutFeePercent ?? 0,
        cashbackPercent: s.cashbackPercent ?? 0,
        buyerTaxPercent: s.buyerTaxPercent ?? 0,
        adRatePercent: s.adRatePercent ?? 0,
        defectRatePercent: s.defectRatePercent ?? 0,
        isAdvancedEnabled: s.isAdvancedEnabled ?? false,
    }
}

function profileToPatches(p: CalcProfile): Record<string, any> {
    const { id, name, iconKey, accent, createdAt, updatedAt, country, ...patches } = p
    return patches
}

function levelLabel(p: CalcProfile) {
    if (p.isTopRatedPlus) return 'Top Rated+'
    if (p.isBelowStandard) return 'Below Standard'
    return 'Above Standard'
}

const COUNTRY_FLAG: Record<string, string> = {
    US: 'us', UK: 'gb', CA: 'ca', AU: 'au', DE: 'de',
    FR: 'fr', IT: 'it', ES: 'es', AT: 'at', IE: 'ie',
    BE: 'be', NL: 'nl', PL: 'pl', CH: 'ch',
}

function storeLabel(p: CalcProfile) {
    if (p.country === 'US' && p.usStoreTier !== 'none') return `${p.usStoreTier} store`
    if (p.country === 'UK' && p.ukStoreTier !== 'none') return `${p.ukStoreTier} store`
    if (p.country === 'CA' && p.caStoreTier !== 'none') return `${p.caStoreTier} store`
    if (p.country === 'DE' && p.deShopTier !== 'none') return `${p.deShopTier} shop`
    if (p.country === 'AU') return `Pro ${p.auProPlan}`
    return 'No store'
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
    currentCountry: string
    currentState: any
    onApply: (country: string, patches: Record<string, any>) => void
}

// ═══════════════════════════════════════════════════════════════════════════ //
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ //
export function CalculatorProfiles({ currentCountry, currentState, onApply }: Props) {
    const [profiles, setProfiles] = useState<CalcProfile[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [tab, setTab] = useState<'profiles' | 'saved'>('profiles')
    const [editId, setEditId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editIcon, setEditIcon] = useState('Package')
    const [editAccent, setEditAccent] = useState<string>(ACCENT_COLORS[0])
    const [toast, setToast] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
    const nameRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const saved = loadAll()
        setProfiles(saved)
        const aid = loadActiveId()
        if (aid && saved.find(p => p.id === aid)) setActiveId(aid)
    }, [])

    const flash = useCallback((msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 2200)
    }, [])

    const apply = useCallback((p: CalcProfile) => {
        onApply(p.country, profileToPatches(p))
        setActiveId(p.id)
        saveActiveId(p.id)
        flash(`"${p.name}" loaded`)
        setIsOpen(false)
    }, [onApply, flash])

    const saveCurrent = () => {
        if (profiles.length >= MAX_PROFILES) { flash(`Maximum ${MAX_PROFILES} profiles reached`); return }
        const idx = profiles.length
        const profile: CalcProfile = {
            id: `p_${Date.now()}`,
            createdAt: Date.now(),
            ...extractProfile(currentCountry, currentState, {
                name: `My Profile ${idx + 1}`,
                iconKey: ICONS[idx % ICONS.length].key,
                accent: ACCENT_COLORS[idx % ACCENT_COLORS.length],
            }),
        }
        const next = [...profiles, profile]
        setProfiles(next)
        saveAll(next)
        setActiveId(profile.id)
        saveActiveId(profile.id)
        setEditId(profile.id)
        setEditName(profile.name)
        setEditIcon(profile.iconKey)
        setEditAccent(profile.accent)
        setTimeout(() => nameRef.current?.focus(), 100)
        flash('Profile saved — tap the name to rename')
    }

    const update = (id: string) => {
        const next = profiles.map(p => p.id !== id ? p : {
            ...p, ...extractProfile(currentCountry, currentState, p),
        })
        setProfiles(next)
        saveAll(next)
        flash('Profile updated')
    }

    const duplicate = (p: CalcProfile) => {
        if (profiles.length >= MAX_PROFILES) { flash(`Maximum ${MAX_PROFILES} profiles reached`); return }
        const idx = profiles.length
        const copy: CalcProfile = {
            ...p,
            id: `p_${Date.now()}`,
            name: `${p.name} (copy)`,
            accent: ACCENT_COLORS[idx % ACCENT_COLORS.length],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        const next = [...profiles, copy]
        setProfiles(next)
        saveAll(next)
        flash(`"${p.name}" duplicated`)
    }

    const commitRename = (id: string) => {
        if (!editName.trim()) return
        const next = profiles.map(p => p.id !== id ? p : {
            ...p, name: editName.trim(), iconKey: editIcon, accent: editAccent, updatedAt: Date.now(),
        })
        setProfiles(next)
        saveAll(next)
        setEditId(null)
    }

    const remove = (id: string) => {
        const next = profiles.filter(p => p.id !== id)
        setProfiles(next)
        saveAll(next)
        if (activeId === id) { setActiveId(null); saveActiveId(null) }
        setConfirmDelete(null)
        flash('Profile deleted')
    }

    const active = profiles.find(p => p.id === activeId)

    // ── What Gets Saved list ─────────────────────────────────────────────────
    const SAVED_ITEMS = [
        { Icon: Globe, label: 'Country', desc: 'Your default eBay marketplace' },
        { Icon: Star, label: 'Seller level', desc: 'Top Rated Plus / Above Standard / Below Standard + months' },
        { Icon: Store, label: 'Store tier', desc: 'US / UK / CA / DE / AU store tiers' },
        { Icon: Tag, label: 'Default category', desc: 'Your most-used category per country' },
        { Icon: BadgePercent, label: 'VAT status', desc: 'VAT registered for all 14 countries' },
        { Icon: Package, label: 'Shipping cost', desc: 'Your typical shipping cost per item' },
        { Icon: Receipt, label: 'Sourcing tax %', desc: 'Import duty or sourcing tax you typically pay' },
        { Icon: CreditCard, label: 'Payout fee %', desc: 'Your payment processor rate' },
        { Icon: Coins, label: 'Cashback %', desc: 'Cashback from credit cards or business accounts' },
        { Icon: ShoppingCart, label: 'Buyer tax %', desc: 'Default sales tax / VAT on the buyer side' },
        { Icon: Megaphone, label: 'Promoted ad rate', desc: 'Your default Promoted Listings Standard rate' },
        { Icon: BarChart2, label: 'Annual revenue', desc: 'For VAT threshold monitoring' },
        { Icon: SlidersHorizontal, label: 'Advanced panel', desc: 'Whether advanced pro factors are open by default' },
        { Icon: BadgePercent, label: 'Output VAT', desc: 'Whether output VAT is toggled on by default' },
    ]

    return (
        <>
            {/* ── Quick switch chips (2+ profiles) ──────────────────────── */}
            {profiles.length >= 2 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {profiles.map(p => (
                        <button
                            key={p.id}
                            onClick={() => apply(p)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '3px 10px', borderRadius: 999,
                                border: `1.5px solid ${activeId === p.id ? p.accent : C.border}`,
                                background: activeId === p.id ? C.dark : C.surface,
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            <span className={`fi fi-${COUNTRY_FLAG[p.country] ?? 'us'}`} style={{ width: 11, height: 11, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover', flexShrink: 0 }} />
                            <ProfileIcon iconKey={p.iconKey} size={10} color={activeId === p.id ? p.accent : C.muted} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: activeId === p.id ? p.accent : C.text, whiteSpace: 'nowrap' }}>
                                {p.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Trigger button ────────────────────────────────────────── */}
            <button
                onClick={() => { setIsOpen(true); setTab('profiles') }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: active ? C.dark : C.surface,
                    border: `1.5px solid ${active ? active.accent : C.border}`,
                    borderRadius: 999, padding: '5px 12px',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
            >
                <Settings size={12} color={active ? active.accent : C.muted} />
                {active && <ProfileIcon iconKey={active.iconKey} size={11} color={active.accent} />}
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? active.accent : C.text }}>
                    {active ? active.name : 'Profiles'}
                </span>
                {profiles.length > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: active ? active.accent : C.muted, background: active ? 'rgba(143,255,0,0.12)' : C.bg, borderRadius: 999, padding: '1px 6px' }}>
                        {profiles.length}/{MAX_PROFILES}
                    </span>
                )}
            </button>

            {/* ── Toast ─────────────────────────────────────────────────── */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                    background: C.dark, color: C.lime, fontSize: 12, fontWeight: 700,
                    padding: '8px 18px', borderRadius: 999, zIndex: 9999,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <Check size={13} color={C.lime} />
                    {toast}
                </div>
            )}

            {/* ── Modal ─────────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setIsOpen(false) }}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                        zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                    }}
                >
                    <div style={{
                        background: C.surface, borderRadius: 16, width: '100%', maxWidth: 480,
                        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }}>

                        {/* ── Modal header ── */}
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>Calculator Profiles</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>Save your seller setup and reload it anytime</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}
                            >
                                <X size={14} color={C.muted} />
                            </button>
                        </div>

                        {/* ── Tabs ── */}
                        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                            {[
                                { key: 'profiles', label: `My Profiles (${profiles.length})` },
                                { key: 'saved', label: 'What Gets Saved' },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key as 'profiles' | 'saved')}
                                    style={{
                                        flex: 1, padding: '10px 0',
                                        fontSize: 11, fontWeight: 700,
                                        color: tab === t.key ? C.text : C.muted,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        borderBottom: tab === t.key ? `2px solid ${C.lime}` : '2px solid transparent',
                                        textTransform: 'uppercase', letterSpacing: '0.4px',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Body ── */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                            {/* ════ MY PROFILES TAB ════ */}
                            {tab === 'profiles' && (
                                <>
                                    {/* Save button */}
                                    <button
                                        onClick={saveCurrent}
                                        disabled={profiles.length >= MAX_PROFILES}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            background: profiles.length >= MAX_PROFILES ? C.bg : C.dark,
                                            border: `1.5px solid ${profiles.length >= MAX_PROFILES ? C.border : C.lime}`,
                                            borderRadius: 10, padding: '10px 16px',
                                            cursor: profiles.length >= MAX_PROFILES ? 'not-allowed' : 'pointer',
                                            opacity: profiles.length >= MAX_PROFILES ? 0.5 : 1,
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <Download size={13} color={profiles.length >= MAX_PROFILES ? C.muted : C.lime} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: profiles.length >= MAX_PROFILES ? C.muted : C.lime }}>
                                            Save current settings as new profile
                                        </span>
                                    </button>

                                    {/* Empty state */}
                                    {profiles.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                                                <Inbox size={32} color={C.muted} />
                                            </div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>No profiles yet</p>
                                            <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                                                Set up your calculator the way you like it, then save it as a profile above.
                                            </p>
                                        </div>
                                    )}

                                    {/* Profile cards */}
                                    {profiles.map(profile => {
                                        const isActive = activeId === profile.id
                                        const isEditing = editId === profile.id
                                        const accent = profile.accent ?? C.lime

                                        return (
                                            <div
                                                key={profile.id}
                                                style={{
                                                    background: isActive ? C.limeBg : C.bg,
                                                    border: `1.5px solid ${isActive ? accent : C.border}`,
                                                    borderRadius: 12, padding: 14,
                                                    display: 'flex', flexDirection: 'column', gap: 10,
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {/* Row 1 — icon + name + actions */}
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                                    {/* Icon picker / display */}
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 110 }}>
                                                            {ICONS.map(({ key, Icon }) => (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => setEditIcon(key)}
                                                                    style={{
                                                                        padding: 4, borderRadius: 5, cursor: 'pointer', display: 'flex',
                                                                        border: `1.5px solid ${editIcon === key ? accent : C.border}`,
                                                                        background: editIcon === key ? C.limeBg : C.surface,
                                                                    }}
                                                                >
                                                                    <Icon size={12} color={editIcon === key ? C.limeDeep : C.muted} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <ProfileIcon iconKey={profile.iconKey} size={15} color={C.text} />
                                                        </div>
                                                    )}

                                                    {/* Name / input */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    ref={nameRef}
                                                                    value={editName}
                                                                    onChange={e => setEditName(e.target.value)}
                                                                    onKeyDown={e => { if (e.key === 'Enter') commitRename(profile.id); if (e.key === 'Escape') setEditId(null) }}
                                                                    style={{ width: '100%', fontSize: 13, fontWeight: 700, border: `1.5px solid ${accent}`, borderRadius: 7, padding: '5px 8px', background: C.surface, color: C.text, outline: 'none', marginBottom: 6 }}
                                                                />
                                                                {/* Accent color picker */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <span style={{ fontSize: 9, fontWeight: 600, color: C.muted, marginRight: 2 }}>Color</span>
                                                                    {ACCENT_COLORS.map(c => (
                                                                        <button
                                                                            key={c}
                                                                            onClick={() => setEditAccent(c)}
                                                                            style={{
                                                                                width: 16, height: 16, borderRadius: 999,
                                                                                background: c, cursor: 'pointer',
                                                                                border: `2px solid ${editAccent === c ? C.text : 'transparent'}`,
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div
                                                                onClick={() => { setEditId(profile.id); setEditName(profile.name); setEditIcon(profile.iconKey); setEditAccent(profile.accent) }}
                                                                style={{ cursor: 'text' }}
                                                            >
                                                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title="Click to rename">
                                                                    {profile.name}
                                                                </p>
                                                                <p style={{ fontSize: 9, color: C.muted, margin: '2px 0 0' }}>
                                                                    Updated {new Date(profile.updatedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                                        {isEditing ? (
                                                            <>
                                                                <SmBtn onClick={() => commitRename(profile.id)} bg={C.dark} bc={accent}>
                                                                    <Check size={11} color={accent} />
                                                                </SmBtn>
                                                                <SmBtn onClick={() => setEditId(null)}>
                                                                    <X size={11} color={C.muted} />
                                                                </SmBtn>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {isActive && (
                                                                    <SmBtn title="Update with current settings" onClick={() => update(profile.id)}>
                                                                        <Upload size={11} color={C.amber} />
                                                                    </SmBtn>
                                                                )}
                                                                <SmBtn title="Duplicate profile" onClick={() => duplicate(profile)}>
                                                                    <Copy size={11} color={C.muted} />
                                                                </SmBtn>
                                                                {confirmDelete === profile.id ? (
                                                                    <>
                                                                        <SmBtn onClick={() => remove(profile.id)} bg={C.redBg} bc={C.red}>
                                                                            <Trash2 size={11} color={C.red} />
                                                                        </SmBtn>
                                                                        <SmBtn onClick={() => setConfirmDelete(null)}>
                                                                            <X size={11} color={C.muted} />
                                                                        </SmBtn>
                                                                    </>
                                                                ) : (
                                                                    <SmBtn onClick={() => setConfirmDelete(profile.id)}>
                                                                        <Trash2 size={11} color={C.muted} />
                                                                    </SmBtn>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Row 2 — summary tags */}
                                                {!isEditing && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                        {/* Country tag with flag */}
                                                        <span style={{ fontSize: 9, fontWeight: 600, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span className={`fi fi-${COUNTRY_FLAG[profile.country] ?? 'us'}`} style={{ width: 12, height: 12, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover', flexShrink: 0 }} />
                                                            {profile.country}
                                                        </span>
                                                        {[
                                                            levelLabel(profile),
                                                            storeLabel(profile),
                                                            profile.shippingCost > 0 ? `Ship: ${profile.shippingCost}` : null,
                                                            profile.sourcingTaxPercent > 0 ? `Tax: ${profile.sourcingTaxPercent}%` : null,
                                                            profile.adRatePercent > 0 ? `Ads: ${profile.adRatePercent}%` : null,
                                                            profile.isAdvancedEnabled ? 'Advanced' : null,
                                                            profile.outputVATEnabled ? 'Output VAT' : null,
                                                        ].filter(Boolean).map((tag, i) => (
                                                            <span key={i} style={{ fontSize: 9, fontWeight: 600, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, padding: '2px 8px' }}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Row 3 — Load button */}
                                                {!isEditing && (
                                                    <button
                                                        onClick={() => apply(profile)}
                                                        style={{
                                                            width: '100%', height: 34, borderRadius: 8,
                                                            background: isActive ? C.dark : C.surface,
                                                            border: `1.5px solid ${isActive ? accent : C.border}`,
                                                            cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                                            color: isActive ? accent : C.text,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                            transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        {isActive
                                                            ? <><Check size={12} color={accent} /> Active profile</>
                                                            : <><Download size={12} color={C.text} /> Load this profile</>
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </>
                            )}

                            {/* ════ WHAT GETS SAVED TAB ════ */}
                            {tab === 'saved' && (
                                <>
                                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                                        When you save a profile, these settings are captured:
                                    </p>
                                    {SAVED_ITEMS.map(({ Icon, label, desc }) => (
                                        <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Icon size={13} color={C.muted} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>{label}</p>
                                                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
                                        <Lightbulb size={13} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                                            <strong>Not saved:</strong> selling price, buy price, category selection — these change per item so are always blank on load.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// ── Small button helper ───────────────────────────────────────────────────────
function SmBtn({ children, onClick, title, bg, bc }: { children: React.ReactNode; onClick: () => void; title?: string; bg?: string; bc?: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{ width: 26, height: 26, borderRadius: 6, background: bg ?? C.bg, border: `1px solid ${bc ?? C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {children}
        </button>
    )
}
