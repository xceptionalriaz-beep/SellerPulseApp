'use client'

// app/dashboard/listing-generator/components/ai-import/title-to-listing/TitleImport.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Title to Listing: main full-page component
// Type a product title → AI finds it, builds a full eBay listing draft
// Queue-based UX: add multiple titles → lookups run in parallel → bulk create
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
    Type, PlusCircle, CheckSquare, Square, Trash2,
    ArrowRight, RefreshCcw, AlertTriangle, History, X,
    Sparkles,
} from 'lucide-react'
import {
    BarcodeImportResult,
    BarcodeImportResponse,
    BarcodeImportErrorCode,
    QueueItemStatus,
    BarcodeQueueItem,
} from '../../../types/barcode-import.types'
import BarcodeImportPreview from '../barcode-import/BarcodeImportPreview'
import BarcodeImportFailed from '../barcode-import/BarcodeImportFailed'
import TitleQueueRow from './TitleQueueRow'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentDark: '#8abf1f',
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    text: '#1a1523',
    muted: '#6b7280',
    error: '#ef4444',
    errorLight: '#fef2f2',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    success: '#22c55e',
    successLight: '#f0fdf4',
} as const

// ── Queue item type ───────────────────────────────────────────────────────────
export interface TitleQueueItem {
    id: string
    searchTitle: string               // what the user typed
    condition: string               // condition at the time of adding
    status: QueueItemStatus
    result?: BarcodeImportResult  // same shape as barcode import
    errorCode?: BarcodeImportErrorCode
    selected: boolean
    addedAt: number               // Date.now()
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface TitleImportProps {
    onBack?: () => void
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_CONCURRENT = 3
const MAX_QUEUE = 100
const FETCH_TIMEOUT_MS = 30_000
const SESSION_KEY = 'riazify_title_session'
const RECENT_KEY = 'riazify_title_recent'
const MAX_RECENT = 10

// ── Condition options ─────────────────────────────────────────────────────────
const CONDITIONS = [
    { value: 'New', label: 'New', short: 'New' },
    { value: 'Used – Good', label: 'Used – Good', short: 'Good' },
    { value: 'Used – Acceptable', label: 'Used – Acceptable', short: 'Acceptable' },
    { value: 'For Parts', label: 'For Parts', short: 'Parts' },
] as const

// ── Condition colour map ──────────────────────────────────────────────────────
function conditionStyle(condition: string): { bg: string; border: string; fg: string } {
    if (condition === 'New') return { bg: '#dbeafe', border: '#3b82f6', fg: '#1d4ed8' }
    if (condition === 'Used – Good') return { bg: C.successLight, border: C.success, fg: '#16a34a' }
    if (condition === 'Used – Acceptable') return { bg: C.warningLight, border: C.warning, fg: '#b45309' }
    if (condition === 'For Parts') return { bg: C.errorLight, border: C.error, fg: C.error }
    return { bg: '#f3f4f6', border: C.border, fg: C.muted }
}

// ── Known VeRO brand keywords (client-side early warning) ─────────────────────
// This is just a hint — actual VeRO check happens server-side.
const VERO_KEYWORDS = new Set([
    'nike', 'adidas', 'gucci', 'louis vuitton', 'lv', 'prada', 'chanel',
    'burberry', 'rolex', 'cartier', 'hermes', 'hermès', 'bose', 'beats',
    'apple', 'airpods', 'iphone', 'ipad', 'macbook',
    'ugg', 'hunter', 'dyson', 'lego', 'disney', 'pokemon',
    'microsoft', 'xbox', 'sony', 'playstation', 'nintendo',
    'samsung', 'balenciaga', 'yeezy', 'supreme',
])

function detectVeROBrand(title: string): string | null {
    const lower = title.toLowerCase()
    for (const brand of VERO_KEYWORDS) {
        // Match whole words only (avoid "sonylux" matching "sony")
        const re = new RegExp(`(?:^|\\s)${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$|,|\\.)`)
        if (re.test(lower)) return brand
    }
    return null
}

// ── Session types ─────────────────────────────────────────────────────────────
interface StoredSession {
    items: TitleQueueItem[]
    savedAt: number
}

// ── Adapt TitleQueueItem → BarcodeQueueItem for shared preview panels ─────────
function adaptForPreview(item: TitleQueueItem): BarcodeQueueItem {
    return {
        id: item.id,
        barcode: item.searchTitle,
        barcodeType: 'unknown',
        status: item.status,
        result: item.result,
        errorCode: item.errorCode,
        selected: item.selected,
        scannedAt: item.addedAt,
    }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TitleImport({ onBack }: TitleImportProps) {
    const [queue, setQueue] = useState<TitleQueueItem[]>([])
    const [condition, setCondition] = useState<string>('New')
    const [titleInput, setTitleInput] = useState('')
    const [inputError, setInputError] = useState<string | null>(null)
    const [previewItem, setPreviewItem] = useState<TitleQueueItem | null>(null)
    const [failedItem, setFailedItem] = useState<TitleQueueItem | null>(null)
    const [bulkDone, setBulkDone] = useState(false)
    const [bulkSavedCount, setBulkSavedCount] = useState(0)
    const [restoreSession, setRestoreSession] = useState<StoredSession | null>(null)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [showRecent, setShowRecent] = useState(false)
    const [aiTitle, setAiTitle] = useState(true)
    const [aiPrice, setAiPrice] = useState(true)

    const inFlightRef = useRef<Set<string>>(new Set())
    const queueRef = useRef<TitleQueueItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // ── Keep refs in sync ─────────────────────────────────────────────────────
    useEffect(() => { queueRef.current = queue }, [queue])

    // ── Derived state ─────────────────────────────────────────────────────────
    const found = queue.filter(i => i.status === 'found' || i.status === 'vero_risk')
    const selected = found.filter(i => i.selected)
    const pending = queue.filter(i => i.status === 'pending' || i.status === 'loading')
    const allSelected = found.length > 0 && selected.length === found.length

    const stats = {
        total: queue.length,
        found: found.length,
        loading: queue.filter(i => i.status === 'loading').length,
        pending: queue.filter(i => i.status === 'pending').length,
        failed: queue.filter(i => i.status === 'not_found' || i.status === 'error').length,
    }

    const isEmpty = queue.length === 0

    // ── VeRO early warning for current input ─────────────────────────────────
    const veroWarningBrand = useMemo(
        () => (titleInput.trim().length >= 3 ? detectVeROBrand(titleInput) : null),
        [titleInput]
    )

    // ── Session persistence — load on mount ───────────────────────────────────
    useEffect(() => {
        // Restore previous session
        try {
            const raw = localStorage.getItem(SESSION_KEY)
            if (raw) {
                const session: StoredSession = JSON.parse(raw)
                const age = Date.now() - session.savedAt
                const hasTerminal = session.items.some(
                    i => i.status === 'found' || i.status === 'vero_risk' ||
                        i.status === 'not_found' || i.status === 'error'
                )
                if (age < 86_400_000 && hasTerminal) {
                    setRestoreSession(session)
                }
            }
        } catch { /* corrupt / unavailable */ }

        // Load recent searches
        try {
            const raw = localStorage.getItem(RECENT_KEY)
            if (raw) setRecentSearches(JSON.parse(raw))
        } catch { /* ignore */ }
    }, [])

    // ── Session persistence — save on queue change ────────────────────────────
    useEffect(() => {
        if (queue.length === 0) return
        const terminalItems = queue.filter(
            i => i.status === 'found' || i.status === 'vero_risk' ||
                i.status === 'not_found' || i.status === 'error'
        )
        if (terminalItems.length === 0) return
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                items: terminalItems, savedAt: Date.now(),
            } satisfies StoredSession))
        } catch { /* quota exceeded */ }
    }, [queue])

    // ── Close recent dropdown on outside click ────────────────────────────────
    useEffect(() => {
        if (!showRecent) return
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowRecent(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showRecent])

    // ── Save a search to recent ───────────────────────────────────────────────
    const saveToRecent = useCallback((title: string) => {
        setRecentSearches(prev => {
            const deduped = [title, ...prev.filter(r => r.toLowerCase() !== title.toLowerCase())]
                .slice(0, MAX_RECENT)
            try { localStorage.setItem(RECENT_KEY, JSON.stringify(deduped)) } catch { /* ignore */ }
            return deduped
        })
    }, [])

    // ── Lookup a single title via API ─────────────────────────────────────────
    const lookupTitle = useCallback(async (id: string, searchTitle: string, itemCondition: string) => {
        setQueue(q => q.map(i => i.id === id ? { ...i, status: 'loading' } : i))
        inFlightRef.current.add(id)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

        try {
            const res = await fetch('/api/listing/title-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: searchTitle,
                    condition: itemCondition,
                    useAiTitle: aiTitle,
                    useAiPrice: aiPrice,
                }),
                signal: controller.signal,
            })
            const data: BarcodeImportResponse = await res.json()
            if (data.success && data.result) {
                const status = data.result.product.vero_status === 'flagged' ? 'vero_risk' : 'found'
                setQueue(q => q.map(i =>
                    i.id === id
                        ? { ...i, status, result: data.result!, selected: status === 'found' }
                        : i
                ))
            } else {
                setQueue(q => q.map(i =>
                    i.id === id
                        ? { ...i, status: data.errorCode === 'not_found' ? 'not_found' : 'error', errorCode: data.errorCode }
                        : i
                ))
            }
        } catch (err) {
            const isTimeout = err instanceof Error && err.name === 'AbortError'
            setQueue(q => q.map(i =>
                i.id === id
                    ? { ...i, status: 'error', errorCode: isTimeout ? 'network_error' : 'network_error' }
                    : i
            ))
        } finally {
            clearTimeout(timeoutId)
            inFlightRef.current.delete(id)
        }
    }, [aiTitle, aiPrice])

    // ── Add title to queue ────────────────────────────────────────────────────
    const addTitle = useCallback((raw: string): 'added' | 'duplicate' | 'invalid' | 'full' => {
        const title = raw.trim()
        if (!title || title.length < 3) {
            setInputError('Enter at least 3 characters.')
            return 'invalid'
        }
        if (title.length > 200) {
            setInputError('Title too long — keep it under 200 characters.')
            return 'invalid'
        }
        if (queueRef.current.length >= MAX_QUEUE) {
            setInputError(`Queue is full (${MAX_QUEUE} items max). Remove some to add more.`)
            return 'full'
        }
        // Deduplicate by title + condition (same title in different condition = different listing)
        if (queueRef.current.some(i => i.searchTitle.toLowerCase() === title.toLowerCase() && i.condition === condition)) {
            setInputError(`"${title}" is already in the queue.`)
            return 'duplicate'
        }

        setInputError(null)
        const newItem: TitleQueueItem = {
            id: crypto.randomUUID().slice(0, 8),
            searchTitle: title,
            condition,
            status: 'pending',
            selected: false,
            addedAt: Date.now(),
        }

        setQueue(prev => {
            if (prev.some(i => i.searchTitle.toLowerCase() === title.toLowerCase() && i.condition === condition)) return prev
            if (prev.length >= MAX_QUEUE) return prev
            return [newItem, ...prev]
        })

        saveToRecent(title)

        if (inFlightRef.current.size < MAX_CONCURRENT) {
            void lookupTitle(newItem.id, title, condition)
        }

        return 'added'
    }, [condition, lookupTitle, saveToRecent])

    // ── Auto-process pending items when slots free up ─────────────────────────
    useEffect(() => {
        const slotsAvailable = MAX_CONCURRENT - inFlightRef.current.size
        if (slotsAvailable <= 0) return
        const pendingItems = queue.filter(i => i.status === 'pending')
        pendingItems.slice(0, slotsAvailable).forEach(item => {
            void lookupTitle(item.id, item.searchTitle, item.condition)
        })
    }, [queue, lookupTitle])

    // ── Manual retry ──────────────────────────────────────────────────────────
    const retryPending = useCallback(() => {
        const pendingItems = queueRef.current.filter(i => i.status === 'pending')
        let launched = inFlightRef.current.size
        pendingItems.forEach(item => {
            if (launched < MAX_CONCURRENT) {
                void lookupTitle(item.id, item.searchTitle, item.condition)
                launched++
            }
        })
    }, [lookupTitle])

    // ── Restore session ───────────────────────────────────────────────────────
    const handleRestore = () => {
        if (!restoreSession) return
        setQueue(restoreSession.items)
        setRestoreSession(null)
    }
    const handleDismissRestore = () => {
        setRestoreSession(null)
        try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
    }

    // ── Submit handler ────────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!titleInput.trim()) return
        const result = addTitle(titleInput)
        if (result === 'added') {
            setTitleInput('')
            setShowRecent(false)
            inputRef.current?.focus()
        }
    }

    // ── Queue actions ─────────────────────────────────────────────────────────
    const toggleSelectAll = () => {
        setQueue(q => q.map(item =>
            (item.status === 'found' || item.status === 'vero_risk')
                ? { ...item, selected: !allSelected }
                : item
        ))
    }
    const toggleSelect = (id: string) => {
        setQueue(q => q.map(i => i.id === id ? { ...i, selected: !i.selected } : i))
    }
    const removeItem = (id: string) => {
        setQueue(q => q.filter(i => i.id !== id))
    }
    const clearQueue = () => {
        setQueue([])
        setBulkDone(false)
        setBulkSavedCount(0)
        try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
    }

    // ── Create listings ───────────────────────────────────────────────────────
    // Drafts are auto-saved server-side at lookup time.
    // This button navigates the user to their saved drafts.
    const handleViewDrafts = () => {
        setBulkSavedCount(selected.length)
        setBulkDone(true)
        onBack?.()
    }

    return (
        <div style={{ backgroundColor: C.bg, fontFamily: 'DM Sans, sans-serif' }}>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 pt-2 pr-8">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: C.primary }}
                    >
                        <Type size={17} color={C.accent} />
                    </div>
                    <div>
                        <h1
                            className="text-base font-bold leading-none"
                            style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}
                        >
                            Title to Listing
                        </h1>
                        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                            Type any product name — AI finds it and builds a full eBay listing
                        </p>
                    </div>

                    {/* Stats chips */}
                    {!isEmpty && (
                        <div className="hidden sm:flex items-center gap-2 ml-auto">
                            {stats.loading > 0 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                                    {stats.loading} searching
                                </span>
                            )}
                            {stats.found > 0 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.successLight, color: C.success }}>
                                    {stats.found} found
                                </span>
                            )}
                            {stats.failed > 0 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: C.muted }}>
                                    {stats.failed} failed
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Restore session banner ────────────────────────────────── */}
                {restoreSession && (
                    <div
                        className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.primary}` }}
                    >
                        <div>
                            <p className="text-sm font-bold" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                                Restore previous session?
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                                {restoreSession.items.length} title{restoreSession.items.length !== 1 ? 's' : ''} from your last session
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRestore}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ backgroundColor: C.primary, color: '#fff' }}
                            >
                                Restore
                            </button>
                            <button
                                onClick={handleDismissRestore}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ backgroundColor: C.bg, color: C.muted }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Condition Selector ────────────────────────────────────── */}
                <div
                    className="rounded-xl px-4 py-3"
                    style={{ backgroundColor: C.surface, border: `1.5px solid ${C.border}` }}
                >
                    <p
                        className="text-[11px] font-semibold mb-2"
                        style={{ color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    >
                        Item Condition
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {CONDITIONS.map(opt => {
                            const active = condition === opt.value
                            const cs = conditionStyle(opt.value)
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setCondition(opt.value)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        backgroundColor: active ? cs.bg : C.bg,
                                        color: active ? cs.fg : C.muted,
                                        border: `1.5px solid ${active ? cs.border : C.border}`,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: C.muted }}>
                        Applied to each title you add — you can change it between entries
                    </p>
                </div>

                {/* ── Title Input ───────────────────────────────────────────── */}
                <div ref={wrapperRef} className="relative">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        <div className="relative flex items-center gap-2">
                            {/* Input */}
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={titleInput}
                                    onChange={e => {
                                        setTitleInput(e.target.value)
                                        setInputError(null)
                                        if (e.target.value.length >= 2) setShowRecent(false)
                                    }}
                                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                                    className="w-full rounded-xl px-4 py-3 pr-10 text-sm outline-none"
                                    style={{
                                        border: `1.5px solid ${inputError ? C.error : C.border}`,
                                        backgroundColor: C.surface,
                                        color: C.text,
                                        fontFamily: 'DM Sans, sans-serif',
                                        transition: 'border-color 150ms',
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = inputError ? C.error : C.primary
                                        if (!titleInput && recentSearches.length > 0) setShowRecent(true)
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = inputError ? C.error : C.border
                                    }}
                                    maxLength={200}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                {/* Clear button */}
                                {titleInput && (
                                    <button
                                        type="button"
                                        onClick={() => { setTitleInput(''); setInputError(null); inputRef.current?.focus() }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
                                        style={{ color: C.muted }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Add button */}
                            <button
                                type="submit"
                                disabled={!titleInput.trim()}
                                className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40 flex-shrink-0"
                                style={{
                                    backgroundColor: C.primary,
                                    color: '#fff',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                <PlusCircle size={15} />
                                Add
                            </button>
                        </div>

                        {/* Helper row */}
                        <div className="flex items-center justify-between gap-2 px-1">
                            <p className="text-[11px]" style={{ color: C.muted }}>
                                Be specific — brand + model + key features gets better results
                            </p>
                            {recentSearches.length > 0 && !titleInput && (
                                <button
                                    type="button"
                                    onClick={() => setShowRecent(s => !s)}
                                    className="flex items-center gap-1 text-[11px] font-semibold flex-shrink-0"
                                    style={{ color: C.primary }}
                                >
                                    <History size={11} />
                                    Recent
                                </button>
                            )}
                        </div>

                        {/* Error */}
                        {inputError && (
                            <p className="text-[11px] ml-1" style={{ color: C.error }}>
                                {inputError}
                            </p>
                        )}
                    </form>

                    {/* ── VeRO early warning ──────────────────────────────── */}
                    {veroWarningBrand && !inputError && (
                        <div
                            className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: C.warningLight, border: `1px solid ${C.warning}` }}
                        >
                            <AlertTriangle size={13} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
                            <p className="text-[11px]" style={{ color: '#92400e' }}>
                                <span className="font-bold capitalize">{veroWarningBrand}</span>{' '}
                                is a common VeRO brand — list only authentic items you own.
                                The AI will check VeRO status when it processes this title.
                            </p>
                        </div>
                    )}

                    {/* ── Recent searches dropdown ──────────────────────────── */}
                    {showRecent && recentSearches.length > 0 && (
                        <div
                            className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-hidden shadow-lg z-30"
                            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                        >
                            <div
                                className="px-3 py-2 flex items-center justify-between border-b"
                                style={{ borderColor: C.border, backgroundColor: C.bg }}
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                                    Recent Searches
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRecentSearches([])
                                        setShowRecent(false)
                                        try { localStorage.removeItem(RECENT_KEY) } catch { /* ignore */ }
                                    }}
                                    className="text-[10px] font-semibold"
                                    style={{ color: C.muted }}
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((search, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setTitleInput(search)
                                        setShowRecent(false)
                                        inputRef.current?.focus()
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
                                    style={{ borderColor: C.border }}
                                >
                                    <History size={12} style={{ color: C.muted, flexShrink: 0 }} />
                                    <span className="text-sm truncate" style={{ color: C.text }}>
                                        {search}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Bulk done banner ──────────────────────────────────────── */}
                {bulkDone && (
                    <div
                        className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                        style={{ backgroundColor: C.successLight, border: `1px solid ${C.success}` }}
                    >
                        <div>
                            <p className="text-sm font-bold" style={{ color: C.success }}>
                                ✓ {bulkSavedCount} draft{bulkSavedCount !== 1 ? 's' : ''} saved successfully
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: C.success, opacity: 0.75 }}>
                                Find them in your Listing Generator
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="/dashboard/listing-generator"
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                                style={{ backgroundColor: C.success, color: '#fff' }}
                            >
                                View Drafts <ArrowRight size={11} />
                            </a>
                            <button
                                onClick={clearQueue}
                                className="text-xs font-semibold underline"
                                style={{ color: C.success }}
                            >
                                Add more
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Queue ─────────────────────────────────────────────────── */}
                {!isEmpty && (
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                    >
                        {/* Queue toolbar */}
                        <div
                            className="flex items-center justify-between px-3 py-2 border-b"
                            style={{ borderColor: C.border, backgroundColor: C.bg }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Select all */}
                                <button
                                    onClick={toggleSelectAll}
                                    disabled={found.length === 0}
                                    className="flex items-center gap-1.5 text-[11px] font-semibold disabled:opacity-40"
                                    style={{ color: C.primary }}
                                >
                                    {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                                    {allSelected ? 'Deselect all' : 'Select all found'}
                                </button>

                                {/* Retry pending */}
                                {stats.pending > 0 && (
                                    <button
                                        onClick={retryPending}
                                        className="flex items-center gap-1 text-[11px] font-semibold"
                                        style={{ color: C.muted }}
                                    >
                                        <RefreshCcw size={11} />
                                        Retry {stats.pending} queued
                                    </button>
                                )}
                            </div>

                            {/* Clear */}
                            <button
                                onClick={clearQueue}
                                className="flex items-center gap-1 text-[11px] font-semibold"
                                style={{ color: C.muted }}
                            >
                                <Trash2 size={11} />
                                Clear all
                            </button>
                        </div>

                        {/* Queue rows */}
                        <div className="divide-y divide-[#ede9fe]">
                            {queue.map(item => (
                                <TitleQueueRow
                                    key={item.id}
                                    item={item}
                                    onView={i => {
                                        if (i.status === 'not_found' || i.status === 'error') {
                                            setFailedItem(i)
                                        } else {
                                            setPreviewItem(i)
                                        }
                                    }}
                                    onRemove={removeItem}
                                    onToggleSelect={toggleSelect}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Empty state ────────────────────────────────────────────── */}
                {isEmpty && (
                    <div
                        className="rounded-2xl flex flex-col items-center justify-center gap-4 py-14 text-center"
                        style={{ border: `1px dashed ${C.border}`, backgroundColor: C.surface }}
                    >
                        {/* Animated icon */}
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: C.primaryLight }}
                        >
                            <Sparkles size={28} style={{ color: C.primary }} />
                        </div>
                        <div className="max-w-xs">
                            <p className="font-bold text-sm" style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}>
                                No titles added yet
                            </p>
                            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: C.muted }}>
                                Type any product name above — AI searches databases,
                                generates optimised eBay titles, descriptions and pricing.
                            </p>
                        </div>
                        {/* Example chips */}
                        <div className="flex flex-wrap justify-center gap-2 px-4">
                            {[
                                'Sony WH-1000XM5',
                                'Apple AirPods Pro 2',
                                'Dyson V15 Detect',
                                'LEGO Technic 42156',
                            ].map(ex => (
                                <button
                                    key={ex}
                                    type="button"
                                    onClick={() => {
                                        setTitleInput(ex)
                                        inputRef.current?.focus()
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:border-purple-400"
                                    style={{
                                        borderColor: C.border,
                                        backgroundColor: C.bg,
                                        color: C.muted,
                                        fontFamily: 'DM Mono, monospace',
                                    }}
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── AI Options + Create panel ─────────────────────────────── */}
                {selected.length > 0 && !bulkDone && (
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: `1.5px solid ${C.primary}`, backgroundColor: C.surface }}
                    >
                        {/* Header */}
                        <div
                            className="px-4 py-2.5 border-b"
                            style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
                        >
                            <p
                                className="text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}
                            >
                                AI Options
                            </p>
                        </div>

                        {/* Toggles */}
                        <div className="px-4 py-3 space-y-3">
                            {/* AI title + description */}
                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: C.text }}>
                                        AI-optimised title &amp; description
                                    </p>
                                    <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                                        Rewrites the title for eBay Cassini and generates an HTML description
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={aiTitle}
                                    onClick={() => setAiTitle(v => !v)}
                                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                                    style={{ backgroundColor: aiTitle ? C.primary : '#d1d5db' }}
                                >
                                    <span
                                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                                        style={{ transform: aiTitle ? 'translateX(20px)' : 'translateX(0)' }}
                                    />
                                </button>
                            </label>

                            <div style={{ borderTop: `1px solid ${C.border}` }} />

                            {/* AI price */}
                            <label className="flex items-center justify-between gap-4 cursor-pointer">
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: C.text }}>
                                        AI suggested price
                                    </p>
                                    <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                                        Estimates a competitive UK eBay selling price from market data
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={aiPrice}
                                    onClick={() => setAiPrice(v => !v)}
                                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                                    style={{ backgroundColor: aiPrice ? C.primary : '#d1d5db' }}
                                >
                                    <span
                                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                                        style={{ transform: aiPrice ? 'translateX(20px)' : 'translateX(0)' }}
                                    />
                                </button>
                            </label>
                        </div>

                        {/* Create button */}
                        <div className="px-4 pb-4">
                            <button
                                onClick={handleViewDrafts}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-opacity hover:opacity-90 active:scale-[0.99]"
                                style={{
                                    backgroundColor: C.primary,
                                    color: '#fff',
                                    fontFamily: 'Syne, sans-serif',
                                    boxShadow: '0 4px 16px rgba(117,48,251,0.25)',
                                }}
                            >
                                <ArrowRight size={17} />
                                Create {selected.length} Listing{selected.length !== 1 ? 's' : ''}
                            </button>
                            {(!aiTitle || !aiPrice) && (
                                <p className="text-center text-[10px] mt-2" style={{ color: C.muted }}>
                                    {!aiTitle && !aiPrice
                                        ? 'AI title, description and price skipped — raw data only'
                                        : !aiTitle
                                            ? 'AI title & description skipped — raw product name will be used'
                                            : 'AI price skipped — price will not be set automatically'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

            </div>{/* ── /max-w-2xl ── */}

            {/* ── Preview panel (overlay) ───────────────────────────────────── */}
            {previewItem && (
                <BarcodeImportPreview
                    item={adaptForPreview(previewItem)}
                    onClose={() => setPreviewItem(null)}
                    onRemove={id => { removeItem(id); setPreviewItem(null) }}
                />
            )}

            {/* ── Failed panel (overlay) ────────────────────────────────────── */}
            {failedItem && (
                <BarcodeImportFailed
                    item={adaptForPreview(failedItem)}
                    onClose={() => setFailedItem(null)}
                    onRemove={id => { removeItem(id); setFailedItem(null) }}
                    onRetry={async id => {
                        setFailedItem(null)
                        const item = queue.find(i => i.id === id)
                        if (item) await lookupTitle(id, item.searchTitle, item.condition)
                    }}
                />
            )}
        </div>
    )
}
