'use client'

// app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeImport.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Barcode to Listing: main full-page component
// Scan queue UX: scan all barcodes → lookups run in parallel → bulk create drafts
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react'
import {
    ScanBarcode, PlusCircle, CheckSquare, Square, Trash2,
    ArrowLeft, ArrowRight, RefreshCcw,
} from 'lucide-react'
import {
    BarcodeQueueItem,
    BarcodeImportResponse,
    detectBarcodeType,
    validateCheckDigit,
} from '../../../types/barcode-import.types'
import BarcodeCamera from './BarcodeCamera'
import BarcodeImageScan from './BarcodeImageScan'
import BarcodeQueueRow from './BarcodeQueueRow'
import BarcodeImportPreview from './BarcodeImportPreview'
import BarcodeImportFailed from './BarcodeImportFailed'

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

// ── Props ─────────────────────────────────────────────────────────────────────
interface BarcodeImportProps {
    onBack?: () => void   // navigate back to listing-generator home
}

// ── Max concurrent lookups (avoid hammering free APIs) ────────────────────────
const MAX_CONCURRENT = 3

// ── Max queue size (prevents accidental bulk overflow) ────────────────────────
const MAX_QUEUE = 100

// ── Fetch timeout (ms) — items stuck in loading forever is bad UX ─────────────
const FETCH_TIMEOUT_MS = 30_000

// ── Session persistence key ───────────────────────────────────────────────────
const SESSION_KEY = 'riazify_barcode_session'

// ── Types for stored session ──────────────────────────────────────────────────
interface StoredSession {
    items: BarcodeQueueItem[]
    savedAt: number
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BarcodeImport({ onBack }: BarcodeImportProps) {
    const [queue, setQueue] = useState<BarcodeQueueItem[]>([])
    const [cameraActive, setCameraActive] = useState(false)
    const [manualInput, setManualInput] = useState('')
    const [inputError, setInputError] = useState<string | null>(null)
    const [previewItem, setPreviewItem] = useState<BarcodeQueueItem | null>(null)
    const [failedItem, setFailedItem] = useState<BarcodeQueueItem | null>(null)
    const [bulkDone, setBulkDone] = useState(false)
    const [bulkSavedCount, setBulkSavedCount] = useState(0)
    const [restoreSession, setRestoreSession] = useState<StoredSession | null>(null)
    // Camera scan feedback: 'added' (green flash) | 'duplicate' (amber) | 'invalid' (red)
    const [cameraScanFeedback, setCameraScanFeedback] = useState<'added' | 'duplicate' | 'invalid' | null>(null)
    const inFlightRef = useRef<Set<string>>(new Set())
    // Mirror of queue for synchronous reads (avoids stale closure in camera handler)
    const queueRef = useRef<BarcodeQueueItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    // ── Derived state ─────────────────────────────────────────────────────────
    const found = queue.filter(i => i.status === 'found' || i.status === 'vero_risk')
    const selected = found.filter(i => i.selected)
    const pending = queue.filter(i => i.status === 'pending' || i.status === 'loading')
    const allSelected = found.length > 0 && selected.length === found.length

    // ── Keep queueRef in sync (allows synchronous reads without stale closures) ──
    useEffect(() => { queueRef.current = queue }, [queue])

    // ── Lookup a single barcode via API ───────────────────────────────────────
    const lookupBarcode = useCallback(async (id: string, barcode: string) => {
        // Mark as loading
        setQueue(q => q.map(item => item.id === id ? { ...item, status: 'loading' } : item))
        inFlightRef.current.add(id)

        // Abort after FETCH_TIMEOUT_MS to prevent items stuck loading forever
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

        try {
            const res = await fetch('/api/listing/barcode-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode }),
                signal: controller.signal,
            })
            const data: BarcodeImportResponse = await res.json()
            if (data.success && data.result) {
                const status = data.result.product.vero_status === 'flagged' ? 'vero_risk' : 'found'
                setQueue(q => q.map(item =>
                    item.id === id
                        ? { ...item, status, result: data.result!, selected: status === 'found' }
                        : item
                ))
            } else {
                setQueue(q => q.map(item =>
                    item.id === id
                        ? { ...item, status: data.errorCode === 'not_found' ? 'not_found' : 'error', errorCode: data.errorCode }
                        : item
                ))
            }
        } catch (err) {
            const isTimeout = err instanceof Error && err.name === 'AbortError'
            setQueue(q => q.map(item =>
                item.id === id
                    ? { ...item, status: 'error', errorCode: isTimeout ? 'network_error' : 'network_error' }
                    : item
            ))
        } finally {
            clearTimeout(timeoutId)
            inFlightRef.current.delete(id)
        }
    }, [])

    // ── Add barcode to queue ──────────────────────────────────────────────────
    // Returns 'added' | 'duplicate' | 'invalid' | 'full' for caller feedback.
    // Uses queueRef for synchronous duplicate check (no stale closure).
    const addBarcode = useCallback((raw: string): 'added' | 'duplicate' | 'invalid' | 'full' => {
        const barcode = raw.trim().replace(/[^0-9Xx]/g, '')
        const barcodeType = detectBarcodeType(barcode)

        if (!barcode) return 'invalid'

        // Check digit validation
        if (!validateCheckDigit(barcode, barcodeType)) {
            setInputError(`Invalid barcode: check digit mismatch — is it typed correctly?`)
            return 'invalid'
        }

        // Queue size cap
        if (queueRef.current.length >= MAX_QUEUE) {
            setInputError(`Queue is full (${MAX_QUEUE} items max). Remove some items to add more.`)
            return 'full'
        }

        // Deduplicate: synchronous check via queueRef, confirmed inside setQueue
        if (queueRef.current.some(i => i.barcode === barcode)) {
            setInputError(`${barcode} is already in the queue.`)
            return 'duplicate'
        }

        setInputError(null)
        const newItem: BarcodeQueueItem = {
            id: crypto.randomUUID().slice(0, 8),
            barcode,
            barcodeType,
            status: 'pending',
            selected: false,
            scannedAt: Date.now(),
        }

        setQueue(prev => {
            // Double-check inside setQueue to guard against race conditions
            if (prev.some(i => i.barcode === barcode)) return prev
            if (prev.length >= MAX_QUEUE) return prev
            return [newItem, ...prev]
        })

        // Fire lookup if slot available (otherwise auto-retry effect picks it up)
        if (inFlightRef.current.size < MAX_CONCURRENT) {
            void lookupBarcode(newItem.id, barcode)
        }

        return 'added'
    }, [lookupBarcode])

    // ── Auto-process pending items when concurrent slots free up ─────────────
    // Fires whenever queue changes (e.g. a lookup finishes). Checks inFlightRef
    // synchronously so we never double-start the same item.
    useEffect(() => {
        const slotsAvailable = MAX_CONCURRENT - inFlightRef.current.size
        if (slotsAvailable <= 0) return
        const pendingItems = queue.filter(i => i.status === 'pending')
        pendingItems.slice(0, slotsAvailable).forEach(item => {
            void lookupBarcode(item.id, item.barcode)
        })
    }, [queue, lookupBarcode])

    // ── Manual retry button (still available for failed/stuck items) ──────────
    const retryPending = useCallback(() => {
        setQueue(q => {
            const pendingItems = q.filter(i => i.status === 'pending')
            let launched = inFlightRef.current.size
            pendingItems.forEach(item => {
                if (launched < MAX_CONCURRENT) {
                    void lookupBarcode(item.id, item.barcode)
                    launched++
                }
            })
            return q
        })
    }, [lookupBarcode])

    // ── Session persistence — load on mount ───────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(SESSION_KEY)
            if (!raw) return
            const session: StoredSession = JSON.parse(raw)
            // Only offer restore if session is less than 24 hours old and has terminal items
            const age = Date.now() - session.savedAt
            const hasTerminal = session.items.some(
                i => i.status === 'found' || i.status === 'vero_risk' || i.status === 'not_found' || i.status === 'error'
            )
            if (age < 86_400_000 && hasTerminal) {
                setRestoreSession(session)
            }
        } catch { /* localStorage unavailable or corrupt */ }
    }, [])

    // ── Session persistence — save on queue change ────────────────────────────
    useEffect(() => {
        if (queue.length === 0) return
        const terminalItems = queue.filter(
            i => i.status === 'found' || i.status === 'vero_risk' || i.status === 'not_found' || i.status === 'error'
        )
        if (terminalItems.length === 0) return
        try {
            const session: StoredSession = { items: terminalItems, savedAt: Date.now() }
            localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        } catch { /* storage quota exceeded */ }
    }, [queue])

    // ── Restore previous session ──────────────────────────────────────────────
    const handleRestore = () => {
        if (!restoreSession) return
        setQueue(restoreSession.items)
        setRestoreSession(null)
    }

    const handleDismissRestore = () => {
        setRestoreSession(null)
        try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
    }

    // ── Camera scan handler — shows visual feedback on the camera itself ──────
    const handleCameraDetected = useCallback((barcode: string) => {
        const result = addBarcode(barcode)
        // Show feedback on the camera view (not the text input error)
        if (result === 'duplicate' || result === 'invalid') {
            setCameraScanFeedback(result)
        } else {
            setCameraScanFeedback('added')
        }
        setTimeout(() => setCameraScanFeedback(null), 1_500)
    }, [addBarcode])

    // ── Manual input submit ───────────────────────────────────────────────────
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualInput.trim()) return
        addBarcode(manualInput)
        setManualInput('')
        inputRef.current?.focus()
    }

    // ── Toggle select all found ────────────────────────────────────────────────
    const toggleSelectAll = () => {
        setQueue(q => q.map(item =>
            (item.status === 'found' || item.status === 'vero_risk')
                ? { ...item, selected: !allSelected }
                : item
        ))
    }

    // ── Toggle individual select ──────────────────────────────────────────────
    const toggleSelect = (id: string) => {
        setQueue(q => q.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ))
    }

    // ── Remove from queue ─────────────────────────────────────────────────────
    const removeItem = (id: string) => {
        setQueue(q => q.filter(item => item.id !== id))
    }

    // ── Clear all ─────────────────────────────────────────────────────────────
    const clearQueue = () => {
        setQueue([])
        setBulkDone(false)
        setBulkSavedCount(0)
        try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
    }

    // ── View drafts ───────────────────────────────────────────────────────────
    // Drafts are already auto-saved by the API route on each successful lookup.
    // This button simply navigates the user to their saved drafts.
    const handleViewDrafts = () => {
        setBulkSavedCount(selected.length)
        setBulkDone(true)
        onBack?.()   // goes to /dashboard/listing-generator where drafts live
    }

    // ── Stats bar ─────────────────────────────────────────────────────────────
    const stats = {
        total: queue.length,
        found: found.length,
        loading: queue.filter(i => i.status === 'loading').length,
        pending: queue.filter(i => i.status === 'pending').length,
        failed: queue.filter(i => i.status === 'not_found' || i.status === 'error').length,
    }

    // ── Empty state ───────────────────────────────────────────────────────────
    const isEmpty = queue.length === 0

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: C.bg, fontFamily: 'DM Sans, sans-serif' }}
        >
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-30 border-b px-4 sm:px-6 py-3 flex items-center gap-3"
                style={{ backgroundColor: C.surface, borderColor: C.border }}
            >
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                        style={{ backgroundColor: C.bg }}
                        title="Back"
                    >
                        <ArrowLeft size={16} style={{ color: C.text }} />
                    </button>
                )}

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: C.primary }}
                    >
                        <ScanBarcode size={16} color={C.accent} />
                    </div>
                    <div>
                        <h1
                            className="text-base font-bold leading-none"
                            style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}
                        >
                            Barcode to Listing
                        </h1>
                        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                            Scan or type barcodes — AI builds eBay listings
                        </p>
                    </div>
                </div>

                {/* Stats chips */}
                {!isEmpty && (
                    <div className="hidden sm:flex items-center gap-2">
                        {stats.loading > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                                {stats.loading} looking up
                            </span>
                        )}
                        {stats.found > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.successLight, color: C.success }}>
                                {stats.found} found
                            </span>
                        )}
                        {stats.failed > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#f3f4f6', color: C.muted }}>
                                {stats.failed} not found
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">

                {/* ── Restore session banner ───────────────────────────── */}
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
                                {restoreSession.items.length} barcode{restoreSession.items.length !== 1 ? 's' : ''} from your last scan session
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRestore}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Restore
                            </button>
                            <button
                                onClick={handleDismissRestore}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Camera ──────────────────────────────────────────────── */}
                <BarcodeCamera
                    isActive={cameraActive}
                    onToggle={() => setCameraActive(a => !a)}
                    onDetected={handleCameraDetected}
                    scanFeedback={cameraScanFeedback}
                    className="w-full"
                />

                {/* ── Scan from Image ───────────────────────────────────────── */}
                {!cameraActive && (
                    <BarcodeImageScan
                        onDetected={barcode => {
                            const result = addBarcode(barcode)
                            if (result === 'duplicate') setInputError(`${barcode} is already in the queue.`)
                            else if (result === 'full') setInputError(`Queue is full (${MAX_QUEUE} items max).`)
                            else setInputError(null)
                        }}
                        disabled={queue.length >= MAX_QUEUE}
                    />
                )}

                {/* ── Manual input ─────────────────────────────────────────── */}
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <div className="flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9Xx]*"
                            value={manualInput}
                            onChange={e => { setManualInput(e.target.value); setInputError(null) }}
                            placeholder="Type or paste a barcode (EAN, UPC, ISBN…)"
                            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-shadow"
                            style={{
                                border: `1.5px solid ${inputError ? C.error : C.border}`,
                                backgroundColor: C.surface,
                                color: C.text,
                                fontFamily: 'DM Mono, monospace',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = inputError ? C.error : C.primary)}
                            onBlur={e => (e.currentTarget.style.borderColor = inputError ? C.error : C.border)}
                        />
                        {inputError && (
                            <p className="text-[11px] mt-1 ml-1" style={{ color: C.error }}>
                                {inputError}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!manualInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40"
                        style={{
                            backgroundColor: C.primary,
                            color: '#fff',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        <PlusCircle size={15} />
                        Add
                    </button>
                </form>

                {/* ── Bulk done banner (shown if navigation didn't fire) ────── */}
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
                                Scan more
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Queue ────────────────────────────────────────────────── */}
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
                            <div className="flex items-center gap-2">
                                {/* Select all toggle */}
                                <button
                                    onClick={toggleSelectAll}
                                    disabled={found.length === 0}
                                    className="flex items-center gap-1.5 text-[11px] font-semibold disabled:opacity-40"
                                    style={{ color: C.primary }}
                                >
                                    {allSelected
                                        ? <CheckSquare size={13} />
                                        : <Square size={13} />
                                    }
                                    {allSelected ? 'Deselect all' : 'Select all found'}
                                </button>

                                {/* Retry pending button */}
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

                            {/* Clear queue */}
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
                                <BarcodeQueueRow
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

                {/* ── Empty state ───────────────────────────────────────────── */}
                {isEmpty && (
                    <div
                        className="rounded-2xl flex flex-col items-center justify-center gap-3 py-12 text-center"
                        style={{ border: `1px dashed ${C.border}`, backgroundColor: C.surface }}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: C.primaryLight }}
                        >
                            <ScanBarcode size={26} style={{ color: C.primary }} />
                        </div>
                        <div>
                            <p className="font-bold text-sm" style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}>
                                No barcodes scanned yet
                            </p>
                            <p className="text-xs mt-1" style={{ color: C.muted, maxWidth: 280 }}>
                                Start the camera or type a barcode above. Add as many as you like — lookups run in parallel while you keep scanning.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bulk action footer (sticky) ────────────────────────────────── */}
            {selected.length > 0 && !bulkDone && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-40 border-t px-4 py-3 flex items-center justify-between gap-3"
                    style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 -4px 24px rgba(117,48,251,0.08)' }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}
                        >
                            {selected.length}
                        </div>
                        <div>
                            <p className="text-xs font-semibold" style={{ color: C.text }}>
                                {selected.length} draft{selected.length !== 1 ? 's' : ''} ready
                            </p>
                            <p className="text-[10px]" style={{ color: C.success }}>
                                ✓ Saved automatically — view when ready
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleViewDrafts}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity"
                        style={{ backgroundColor: C.accent, color: C.text, fontFamily: 'Syne, sans-serif' }}
                    >
                        View {selected.length} Draft{selected.length !== 1 ? 's' : ''}
                        <ArrowRight size={15} />
                    </button>
                </div>
            )}

            {/* ── Preview panel ─────────────────────────────────────────────── */}
            {previewItem && (
                <BarcodeImportPreview
                    item={previewItem}
                    onClose={() => setPreviewItem(null)}
                    onRemove={id => { removeItem(id); setPreviewItem(null) }}
                />
            )}

            {/* ── Failed panel ───────────────────────────────────────────────── */}
            {failedItem && (
                <BarcodeImportFailed
                    item={failedItem}
                    onClose={() => setFailedItem(null)}
                    onRemove={id => { removeItem(id); setFailedItem(null) }}
                    onRetry={async id => {
                        setFailedItem(null)
                        const item = queue.find(i => i.id === id)
                        if (item) await lookupBarcode(id, item.barcode)
                    }}
                />
            )}
        </div>
    )
}
