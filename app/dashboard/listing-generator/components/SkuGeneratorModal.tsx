'use client'
// app/dashboard/listing-generator/components/SkuGeneratorModal.tsx
// ─────────────────────────────────────────────────────────────────
// Riazify — SKU Generator Modal
// Full formula builder with saved templates, live preview, Supabase persistence
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
    X, Plus, GripVertical, Lock, AlertTriangle,
    CheckCircle2, RefreshCw, Zap, ChevronDown, Save, Sparkles
} from 'lucide-react'
import type { DraftData } from './LgStudio'
import ProDropdown from '@/components/ui/ProDropdown'

// ── Design tokens ──────────────────────────────────────────────
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
    pillBg: '#ffffff',
    pillBorder: '#ede9fe',
}

// ── Segment types ──────────────────────────────────────────────
export type SegmentType = 'seller_type' | 'category' | 'condition' | 'random' | 'free_text'

export interface SkuSegment {
    id: string
    type: SegmentType
    value?: string       // for free_text — user typed value
    length?: number      // for random — how many chars
    locked?: boolean     // random segment is locked
}

export type CaseFormat = 'upper' | 'lower' | 'as_typed'

export interface SkuTemplate {
    id: string
    name: string
    segments: SkuSegment[]
    case_format: CaseFormat
    separator: string
}

// ── Maps matching Step1Product ────────────────────────────────
const SELLER_CODE_MAP: Record<string, string> = {
    own_stock: 'OWN',
    dropship: 'DROP',
    retail_arb: 'RA',
    wholesale: 'WHL',
    reseller: 'RES',
    pod: 'POD',
}

const CATEGORY_LABELS: Record<string, string> = {
    consumer_electronics: 'Consumer Electronics',
    electronics_accessories: 'Electronics Accessories',
    computers: 'Computers',
    video_games: 'Video Games',
    clothing: 'Clothing',
    jewelry: 'Jewellery',
    home_garden: 'Home Garden',
    furniture: 'Furniture',
    toys_hobbies: 'Toys Hobbies',
    dolls: 'Dolls Bears',
    sporting_goods: 'Sporting Goods',
    health_beauty: 'Health Beauty',
    books_movies: 'Books Movies',
    music_instruments: 'Music Instruments',
    collectibles: 'Collectibles',
    coins: 'Coins',
    stamps: 'Stamps',
    motors_parts: 'Motors Parts',
    business: 'Business',
    pet_supplies: 'Pet Supplies',
    default: 'Other',
}

// ── Helpers ───────────────────────────────────────────────────
function genRandomChars(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function sanitize(val: string): string {
    // eBay safe: A-Z, 0-9, hyphen, underscore only
    return val.replace(/[^A-Za-z0-9\-_]/g, '').toUpperCase()
}

function getSegmentValue(seg: SkuSegment, draft: DraftData): { value: string; isDefault: boolean } {
    switch (seg.type) {
        case 'seller_type': {
            const val = SELLER_CODE_MAP[draft.seller_type]
            return val ? { value: val, isDefault: false } : { value: 'OWN', isDefault: true }
        }
        case 'category': {
            const label = CATEGORY_LABELS[draft.category] ?? ''
            if (!label) return { value: 'GEN', isDefault: true }
            const code = label.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
            return { value: code || 'GEN', isDefault: false }
        }
        case 'condition': {
            const cond = (draft.condition ?? '').toLowerCase()
            if (!cond) return { value: 'NEW', isDefault: true }
            if (cond.includes('refurb')) return { value: 'REFURB', isDefault: false }
            if (cond.includes('used')) return { value: 'USED', isDefault: false }
            if (cond.includes('parts')) return { value: 'PARTS', isDefault: false }
            return { value: 'NEW', isDefault: false }
        }
        case 'random':
            return { value: genRandomChars(seg.length ?? 4), isDefault: false }
        case 'free_text':
            return { value: sanitize(seg.value ?? ''), isDefault: false }
        default:
            return { value: '', isDefault: false }
    }
}

function buildSku(segments: SkuSegment[], separator: string, caseFormat: CaseFormat, draft: DraftData): string {
    const parts = segments
        .map(seg => getSegmentValue(seg, draft).value)
        .filter(Boolean)
    let result = parts.join(separator)
    if (caseFormat === 'upper') result = result.toUpperCase()
    if (caseFormat === 'lower') result = result.toLowerCase()
    return result.slice(0, 50) // eBay max
}

function hasDefaultSegments(segments: SkuSegment[], draft: DraftData): { has: boolean; reasons: string[] } {
    const reasons: string[] = []
    segments.forEach(seg => {
        const { isDefault } = getSegmentValue(seg, draft)
        if (isDefault) {
            if (seg.type === 'category') reasons.push('Using default category (GEN) — complete Step 1 for auto-fill')
            if (seg.type === 'condition') reasons.push('Using default condition (NEW) — select condition in Step 1')
            if (seg.type === 'seller_type') reasons.push('Using default seller type (OWN) — select seller type in Step 1')
        }
    })
    return { has: reasons.length > 0, reasons }
}

function uniqueId(): string {
    return Math.random().toString(36).slice(2, 9)
}

// ── Default segments ──────────────────────────────────────────
const DEFAULT_SEGMENTS: SkuSegment[] = [
    { id: uniqueId(), type: 'seller_type' },
    { id: uniqueId(), type: 'category' },
    { id: uniqueId(), type: 'condition' },
    { id: uniqueId(), type: 'random', length: 4, locked: true },
]

// ── Segment type options for ADD dropdown ─────────────────────
const SEGMENT_TYPE_OPTIONS: { type: SegmentType; label: string; desc: string }[] = [
    { type: 'seller_type', label: 'Seller Type', desc: 'OWN / DROP / RA etc.' },
    { type: 'category', label: 'Category', desc: 'Auto from your category' },
    { type: 'condition', label: 'Condition', desc: 'NEW / USED / REFURB' },
    { type: 'random', label: 'Random Chars', desc: 'Unique random characters' },
    { type: 'free_text', label: 'Free Text', desc: 'Your own custom text' },
]

// ── Segment pill label ────────────────────────────────────────
function segmentLabel(seg: SkuSegment): { title: string; subtitle: string } {
    switch (seg.type) {
        case 'seller_type': return { title: 'Seller Type:', subtitle: '' }
        case 'category': return { title: 'Category:', subtitle: '' }
        case 'condition': return { title: 'Condition:', subtitle: '' }
        case 'random': return { title: 'Random', subtitle: `Chars: ${genRandomChars(seg.length ?? 4)}` }
        case 'free_text': return { title: 'Free Text:', subtitle: seg.value ?? '' }
    }
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    draft: DraftData
    onGenerate: (sku: string) => void
    onClose: () => void
}

// ── Main Modal ────────────────────────────────────────────────
export default function SkuGeneratorModal({ draft, onGenerate, onClose }: Props) {
    const supabase = createClient()

    const [segments, setSegments] = useState<SkuSegment[]>(DEFAULT_SEGMENTS)
    const [caseFormat, setCaseFormat] = useState<CaseFormat>('upper')
    const [separator, setSeparator] = useState('-')
    const [previewSku, setPreviewSku] = useState('')
    const [templates, setTemplates] = useState<SkuTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)
    const [showAddSegment, setShowAddSegment] = useState(false)
    const [savingTemplate, setSavingTemplate] = useState(false)
    const [templateName, setTemplateName] = useState('')
    const [showSaveInput, setShowSaveInput] = useState(false)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const [mounted, setMounted] = useState(false)

    // ── Mount animation ───────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10)
        return () => clearTimeout(t)
    }, [])

    function handleClose() {
        setMounted(false)
        setTimeout(onClose, 220)
    }

    // ── Load saved templates ──────────────────────────────────
    useEffect(() => {
        async function loadTemplates() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const sb = supabase as any
            const { data } = await sb
                .from('sku_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            if (data) setTemplates(data as SkuTemplate[])
        }
        loadTemplates()
    }, [])

    // ── Rebuild preview whenever segments/case/separator change ──
    const rebuildPreview = useCallback(() => {
        setPreviewSku(buildSku(segments, separator, caseFormat, draft))
    }, [segments, separator, caseFormat, draft])

    useEffect(() => {
        rebuildPreview()
    }, [rebuildPreview])

    // ── Warnings ─────────────────────────────────────────────
    const totalCount = previewSku.length
    const hasUniqueSegment = segments.some((s: SkuSegment) => s.type === 'random')

    // ── Apply template ────────────────────────────────────────
    function applyTemplate(tmpl: SkuTemplate) {
        setSegments(tmpl.segments)
        setCaseFormat(tmpl.case_format)
        setSeparator(tmpl.separator)
        setSelectedTemplate(tmpl.id)
        setShowTemplateDropdown(false)
    }

    // ── Add segment ───────────────────────────────────────────
    function addSegment(type: SegmentType) {
        const newSeg: SkuSegment = {
            id: uniqueId(),
            type,
            ...(type === 'random' ? { length: 4 } : {}),
            ...(type === 'free_text' ? { value: '' } : {}),
        }
        setSegments((prev: SkuSegment[]) => [...prev, newSeg])
        setShowAddSegment(false)
    }

    // ── Remove segment ────────────────────────────────────────
    function removeSegment(id: string) {
        const seg = segments.find((s: SkuSegment) => s.id === id)
        if (seg?.locked) return
        // Don't allow removing if it's the only unique segment
        const remaining = segments.filter((s: SkuSegment) => s.id !== id)
        const stillHasUnique = remaining.some((s: SkuSegment) => s.type === 'random')
        if (!stillHasUnique && seg?.type === 'random') return
        setSegments(remaining)
    }

    // ── Update free text segment ──────────────────────────────
    function updateFreeText(id: string, val: string) {
        const sanitized = val.replace(/[^A-Za-z0-9\-_]/g, '')
        setSegments((prev: SkuSegment[]) => prev.map((s: SkuSegment) => s.id === id ? { ...s, value: sanitized } : s))
    }

    // ── Update random length ──────────────────────────────────
    function updateRandomLength(id: string, len: number) {
        setSegments((prev: SkuSegment[]) => prev.map((s: SkuSegment) => s.id === id ? { ...s, length: Math.max(2, Math.min(8, len)) } : s))
    }

    // ── Regenerate random segments ────────────────────────────
    function regeneratePreview() {
        setPreviewSku(buildSku(segments, separator, caseFormat, draft))
    }

    // ── Drag & drop reorder ───────────────────────────────────
    function onDragStart(i: number) { setDragIndex(i) }
    function onDragOver(e: React.DragEvent<HTMLDivElement>, i: number) {
        e.preventDefault()
        setDragOverIndex(i)
    }
    function onDrop(i: number) {
        if (dragIndex === null || dragIndex === i) return
        const updated = [...segments]
        const [moved] = updated.splice(dragIndex, 1)
        updated.splice(i, 0, moved)
        setSegments(updated)
        setDragIndex(null)
        setDragOverIndex(null)
    }
    function onDragEnd() {
        setDragIndex(null)
        setDragOverIndex(null)
    }

    // ── Save template ─────────────────────────────────────────
    async function saveTemplate() {
        if (!templateName.trim()) return
        setSavingTemplate(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setSavingTemplate(false); return }

        // Cast to any to bypass missing generated types for sku_templates table
        const sb = supabase as any
        const { data, error } = await sb
            .from('sku_templates')
            .insert({
                user_id: user.id,
                name: templateName.trim(),
                segments: segments,
                case_format: caseFormat,
                separator,
            })
            .select()
            .single()

        if (!error && data) {
            const saved = data as SkuTemplate
            setTemplates((prev: SkuTemplate[]) => [saved, ...prev])
            setSelectedTemplate(saved.id)
            setTemplateName('')
            setShowSaveInput(false)
        }
        setSavingTemplate(false)
    }

    // ── Generate & close ──────────────────────────────────────
    function handleGenerate() {
        onGenerate(previewSku)
        handleClose()
    }

    // ── Segment pill background ───────────────────────────────
    function pillStyle(seg: SkuSegment, isDragging: boolean, isDragOver: boolean) {
        return {
            backgroundColor: isDragOver ? '#f3eeff' : '#ffffff',
            border: `1.5px solid ${isDragging ? C.primary : isDragOver ? C.primary : '#ede9fe'}`,
            borderRadius: 14,
            padding: '8px 14px 8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: seg.locked ? 'default' : 'grab',
            opacity: isDragging ? 0.5 : 1,
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 4px rgba(117,48,251,0.08)',
            minWidth: 80,
        }
    }

    const selectedTemplateName = templates.find((t: SkuTemplate) => t.id === selectedTemplate)?.name ?? 'Select Template'

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
                style={{
                    backgroundColor: mounted ? 'rgba(30,21,53,0.7)' : 'rgba(30,21,53,0)',
                    backdropFilter: 'blur(4px)',
                    transition: 'background-color 0.22s ease',
                }}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && handleClose()}
            >
                {/* Modal */}
                <div
                    className="w-full flex flex-col overflow-hidden"
                    style={{
                        maxWidth: 700,
                        backgroundColor: C.surface,
                        borderRadius: 20,
                        border: `1px solid ${C.border}`,
                        boxShadow: '0 24px 80px rgba(117,48,251,0.18)',
                        maxHeight: '95dvh',
                        width: '100%',
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
                        transition: 'opacity 0.22s ease, transform 0.22s ease',
                    }}
                >
                    {/* ── Header ─────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6 sm:py-4"
                        style={{ borderBottom: `1px solid ${C.border}` }}>
                        <h2 className="text-[15px] sm:text-[18px] font-bold flex items-center gap-2 shrink-0"
                            style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Configure SKU Generator <Sparkles size={18} style={{ color: C.primary }} /></span>
                        </h2>

                        {/* Saved Templates dropdown — in header */}
                        <div className="relative flex-1 min-w-0 max-w-[180px] sm:max-w-[220px] ml-auto">
                            <button
                                onClick={() => setShowTemplateDropdown((v: boolean) => !v)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all"
                                style={{
                                    backgroundColor: C.bg,
                                    border: `1px solid ${C.borderInput}`,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 13,
                                    color: selectedTemplate ? C.body : C.muted,
                                }}>
                                <span className="truncate">{selectedTemplateName}</span>
                                <ChevronDown size={13} style={{ color: C.muted, flexShrink: 0 }} />
                            </button>
                            {showTemplateDropdown && (
                                <div className="absolute top-full mt-1 left-0 right-0 z-10 rounded-xl overflow-hidden"
                                    style={{
                                        backgroundColor: C.surface,
                                        border: `1px solid ${C.border}`,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        minWidth: 200,
                                    }}>
                                    {templates.length === 0 ? (
                                        <div className="px-4 py-3 text-[13px]"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            No saved templates yet
                                        </div>
                                    ) : (
                                        templates.map((t: SkuTemplate) => (
                                            <button key={t.id}
                                                onClick={() => applyTemplate(t)}
                                                className="w-full px-4 py-3 text-left text-[13px] transition-all hover:opacity-80"
                                                style={{
                                                    backgroundColor: selectedTemplate === t.id ? C.primaryLight : C.surface,
                                                    color: selectedTemplate === t.id ? C.primary : C.body,
                                                    fontFamily: 'DM Sans, sans-serif',
                                                    borderBottom: `1px solid ${C.border}`,
                                                }}>
                                                {t.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={handleClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70 shrink-0"
                            style={{ backgroundColor: C.bg, color: C.secondary }}>
                            <X size={15} />
                        </button>
                    </div>

                    {/* ── Scrollable body ─────────────────────────────── */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-5">

                        {/* ── Formula Builder ─────────────────────────── */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-[14px] font-bold"
                                    style={{ color: C.body, fontFamily: 'Syne, sans-serif' }}>
                                    Formula Builder
                                </label>
                                <p className="text-[12px] mt-0.5"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Drag and organise segments to format your SKU code
                                </p>
                            </div>

                            {/* Segments container */}
                            <div className="p-4 rounded-2xl flex flex-col gap-4"
                                style={{
                                    backgroundColor: '#faf9ff',
                                    border: '1px solid #ede9fe',
                                    boxShadow: '0 2px 12px rgba(117,48,251,0.06)',
                                }}>

                                {/* Segment pills row */}
                                <div className="flex flex-nowrap gap-2 items-start overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                                    {segments.map((seg: SkuSegment, i: number) => {
                                        const isDragging = dragIndex === i
                                        const isDragOver = dragOverIndex === i
                                        const liveVal = getSegmentValue(seg, draft)
                                        const label = segmentLabel(seg)
                                        const isDefault = liveVal.isDefault

                                        return (
                                            <div key={seg.id} className="flex items-center gap-1">
                                                {/* Separator between pills */}
                                                {i > 0 && (
                                                    <span className="text-[13px] font-bold self-center mx-0.5"
                                                        style={{ color: C.muted, lineHeight: 1 }}>
                                                        —
                                                    </span>
                                                )}

                                                <div
                                                    draggable={!seg.locked}
                                                    onDragStart={() => onDragStart(i)}
                                                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => onDragOver(e, i)}
                                                    onDrop={() => onDrop(i)}
                                                    onDragEnd={onDragEnd}
                                                    style={pillStyle(seg, isDragging, isDragOver)}
                                                >
                                                    {/* Drag handle or lock */}
                                                    {seg.locked
                                                        ? <Lock size={10} style={{ color: C.primary, opacity: 0.5 }} />
                                                        : <GripVertical size={11} style={{ color: C.primary, opacity: 0.4 }} />
                                                    }

                                                    {/* Label + value */}
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-semibold leading-tight uppercase tracking-wide"
                                                            style={{ color: C.primary, opacity: 0.6, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {label.title}
                                                        </span>

                                                        {/* Free text has inline input */}
                                                        {seg.type === 'free_text' ? (
                                                            <input
                                                                type="text"
                                                                value={seg.value ?? ''}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFreeText(seg.id, e.target.value)}
                                                                placeholder="TEXT"
                                                                maxLength={10}
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    outline: 'none',
                                                                    color: C.body,
                                                                    fontFamily: 'DM Sans, sans-serif',
                                                                    fontSize: 13,
                                                                    fontWeight: 700,
                                                                    width: 64,
                                                                    padding: 0,
                                                                }}
                                                            />
                                                        ) : seg.type === 'random' ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[13px] font-bold"
                                                                    style={{ color: C.body, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>
                                                                    {genRandomChars(seg.length ?? 4)}
                                                                </span>
                                                                <select
                                                                    value={seg.length ?? 4}
                                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateRandomLength(seg.id, parseInt(e.target.value))}
                                                                    style={{
                                                                        backgroundColor: '#f3eeff',
                                                                        border: '1px solid #ede9fe',
                                                                        borderRadius: 6,
                                                                        color: C.primary,
                                                                        fontSize: 11,
                                                                        fontWeight: 700,
                                                                        fontFamily: 'DM Sans, sans-serif',
                                                                        padding: '2px 4px',
                                                                        cursor: 'pointer',
                                                                        outline: 'none',
                                                                        whiteSpace: 'nowrap',
                                                                        width: 'auto',
                                                                    }}>
                                                                    {[2, 3, 4, 5, 6, 8].map(n => (
                                                                        <option key={n} value={n}>{n}c</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[13px] font-bold"
                                                                style={{
                                                                    color: isDefault ? C.warning : C.body,
                                                                    fontFamily: 'DM Sans, sans-serif',
                                                                }}>
                                                                {liveVal.value}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Warning icon for defaults */}
                                                    {isDefault && (
                                                        <AlertTriangle size={10} style={{ color: C.warning, flexShrink: 0 }} />
                                                    )}

                                                    {/* Remove button — not for locked */}
                                                    {!seg.locked && (
                                                        <button
                                                            onClick={() => removeSegment(seg.id)}
                                                            className="ml-1 w-4 h-4 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                                                            style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                                                            <X size={8} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>



                                {/* Add Segment */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAddSegment((v: boolean) => !v)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                                        style={{
                                            backgroundColor: C.primaryLight,
                                            color: C.primary,
                                            border: `1px solid ${C.border}`,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        <Plus size={12} /> Add Segment
                                    </button>

                                    {showAddSegment && (
                                        <div className="absolute bottom-full mb-1 left-0 z-10 rounded-xl overflow-hidden"
                                            style={{
                                                backgroundColor: C.surface,
                                                border: `1px solid ${C.border}`,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                minWidth: 200,
                                            }}>
                                            {SEGMENT_TYPE_OPTIONS.map(opt => (
                                                <button key={opt.type}
                                                    onClick={() => addSegment(opt.type)}
                                                    className="w-full px-4 py-2.5 text-left transition-all hover:opacity-80"
                                                    style={{
                                                        borderBottom: `1px solid ${C.border}`,
                                                        backgroundColor: C.surface,
                                                    }}>
                                                    <p className="text-[13px] font-semibold"
                                                        style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {opt.label}
                                                    </p>
                                                    <p className="text-[11px]"
                                                        style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {opt.desc}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Separator ────────────────────────────────── */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-semibold uppercase tracking-wide"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Separator
                            </label>
                            <div className="flex gap-2">
                                {['-', '_'].map(sep => (
                                    <button key={sep}
                                        onClick={() => setSeparator(sep)}
                                        className="px-5 py-2 rounded-xl text-[14px] font-bold transition-all"
                                        style={{
                                            backgroundColor: separator === sep ? C.primaryLight : C.bg,
                                            border: `2px solid ${separator === sep ? C.primary : C.border}`,
                                            color: separator === sep ? C.primary : C.secondary,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        {sep}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Formatting Rules ─────────────────────────── */}
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-bold"
                                style={{ color: C.body, fontFamily: 'Syne, sans-serif' }}>
                                Formatting Rules
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {([
                                    { id: 'upper', label: 'ALL UPPERCASE', sub: 'Recommended for eBay' },
                                    { id: 'lower', label: 'All Lowercase', sub: null },
                                    { id: 'as_typed', label: 'As Typed', sub: null },
                                ] as { id: CaseFormat; label: string; sub: string | null }[]).map(opt => (
                                    <button key={opt.id}
                                        onClick={() => setCaseFormat(opt.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                                        style={{
                                            backgroundColor: caseFormat === opt.id ? C.primaryLight : C.bg,
                                            border: `2px solid ${caseFormat === opt.id ? C.primary : C.border}`,
                                        }}>
                                        {/* Radio dot */}
                                        <div style={{
                                            width: 14, height: 14, borderRadius: '50%',
                                            border: `2px solid ${caseFormat === opt.id ? C.primary : C.muted}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {caseFormat === opt.id && (
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.primary }} />
                                            )}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[12px] font-bold"
                                                style={{ color: caseFormat === opt.id ? C.primary : C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                {opt.label}
                                            </span>
                                            {opt.sub && (
                                                <span className="text-[10px]"
                                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                    {opt.sub}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Sanitization badge */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ backgroundColor: C.successBg }}>
                                <CheckCircle2 size={13} style={{ color: C.success }} />
                                <span className="text-[11px] font-semibold"
                                    style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                    Sanitized: Only A-Z, 0-9, &apos;-&apos;, and &apos;_&apos; permitted
                                </span>
                            </div>

                            {/* Unique segment warning */}
                            {!hasUniqueSegment && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                    style={{ backgroundColor: C.dangerBg }}>
                                    <AlertTriangle size={13} style={{ color: C.danger }} />
                                    <span className="text-[11px] font-semibold"
                                        style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                        Add a Random segment to avoid eBay inventory conflicts
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Live Preview ─────────────────────────────── */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-semibold uppercase tracking-wide"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Live Preview
                            </label>
                            <div className="flex items-center justify-between px-5 py-4 rounded-xl"
                                style={{ backgroundColor: C.accent }}>
                                <span className="text-[20px] font-black tracking-wider"
                                    style={{ color: C.accentText, fontFamily: 'Syne, sans-serif', letterSpacing: '0.06em' }}>
                                    {previewSku || '—'}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold"
                                        style={{ color: C.accentText, fontFamily: 'DM Sans, sans-serif', opacity: 0.7 }}>
                                        {totalCount} / 20 Chars
                                    </span>
                                    <button
                                        onClick={regeneratePreview}
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
                                        style={{ backgroundColor: 'rgba(30,21,53,0.15)' }}
                                        title="Regenerate random segments">
                                        <RefreshCw size={14} style={{ color: C.accentText }} />
                                    </button>
                                </div>
                            </div>

                            {/* Save template input */}
                            {showSaveInput && (
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
                                        placeholder="Template name e.g. My Electronics SKU"
                                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && saveTemplate()}
                                        style={{
                                            flex: 1,
                                            backgroundColor: C.surface,
                                            border: `1px solid ${C.primary}`,
                                            borderRadius: 10,
                                            padding: '8px 12px',
                                            fontSize: 13,
                                            color: C.body,
                                            fontFamily: 'DM Sans, sans-serif',
                                            outline: 'none',
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveTemplate}
                                        disabled={savingTemplate || !templateName.trim()}
                                        className="px-3 py-2 rounded-xl text-[12px] font-bold transition-all disabled:opacity-40"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        {savingTemplate ? '...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setShowSaveInput(false); setTemplateName('') }}
                                        className="px-3 py-2 rounded-xl text-[12px] font-bold transition-all"
                                        style={{ backgroundColor: C.bg, color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* ── Footer ──────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4"
                        style={{ borderTop: `1px solid ${C.border}` }}>

                        <button onClick={handleClose}
                            className="text-[13px] font-semibold transition-all hover:opacity-60"
                            style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                            Cancel
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Save as Template */}
                            <button
                                onClick={() => setShowSaveInput((v: boolean) => !v)}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                                style={{
                                    backgroundColor: C.surface,
                                    border: `1px solid ${C.border}`,
                                    color: C.body,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>
                                <Save size={13} />
                                <span className="hidden sm:inline">Save as </span>Template
                            </button>

                            {/* Generate SKU */}
                            <button
                                onClick={handleGenerate}
                                disabled={!previewSku || !hasUniqueSegment}
                                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40 hover:opacity-90"
                                style={{
                                    backgroundColor: C.primary,
                                    color: '#ffffff',
                                    fontFamily: 'DM Sans, sans-serif',
                                    boxShadow: '0 4px 14px rgba(117,48,251,0.35)',
                                }}>
                                <Zap size={14} />
                                Generate SKU
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
