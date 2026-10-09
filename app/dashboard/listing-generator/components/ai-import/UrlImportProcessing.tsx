'use client'
// app/dashboard/listing-generator/components/ai-import/UrlImportProcessing.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// Screen 2 of the URL → Listing import flow.
// Full-screen overlay with animated task progress list.
// Tries the real API first; falls back to simulation until API is built.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, XCircle, Loader2, Clock, Link2, SkipForward } from 'lucide-react'
import {
    ProcessingTask,
    ProcessingTaskStatus,
    PlatformDetection,
    UrlImportResult,
    UrlImportErrorCode,
    getDefaultTasks,
} from '@/app/dashboard/listing-generator/types/url-import.types'

// ── Design tokens — matches LgDashboard exactly ───────────────
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

// ── Platform color map ────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
    amazon: '#FF9900',
    aliexpress: '#E62E04',
    argos: '#CC0000',
    wayfair: '#7B2FBE',
    bq: '#FF6600',
    ebay: '#E53238',
    banggood: '#E8321A',
    alibaba: '#FF6A00',
    temu: '#FF4D00',
    dhgate: '#C41E3A',
    walmart: '#0071CE',
    costco: '#005DAA',
}

function getPlatformColor(logoKey: string): string {
    return PLATFORM_COLORS[logoKey] ?? C.primary
}

// ── Task Row ──────────────────────────────────────────────────
function TaskRow({ task, index }: { task: ProcessingTask; index: number }) {
    const isRunning = task.status === 'running'
    const isDone = task.status === 'done'
    const isFailed = task.status === 'failed'
    const isSkipped = task.status === 'skipped'
    const isPending = task.status === 'pending'

    return (
        <div
            className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-400"
            style={{
                backgroundColor: isRunning
                    ? C.primaryLight
                    : isDone
                        ? C.successBg
                        : isFailed
                            ? C.dangerBg
                            : 'transparent',
                opacity: isPending ? 0.4 : 1,
                transform: isPending ? 'translateX(-4px)' : 'translateX(0)',
                transition: 'all 0.3s ease',
            }}
        >
            {/* Status icon */}
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isRunning && (
                    <Loader2 size={18} className="animate-spin" style={{ color: C.primary }} />
                )}
                {isDone && (
                    <CheckCircle2 size={18} style={{ color: C.success }} />
                )}
                {isFailed && (
                    <XCircle size={18} style={{ color: C.danger }} />
                )}
                {isSkipped && (
                    <SkipForward size={16} style={{ color: C.muted }} />
                )}
                {isPending && (
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: C.muted }}
                    />
                )}
            </div>

            {/* Task label */}
            <span
                className="flex-1 text-[14px] font-medium"
                style={{
                    color: isRunning ? C.primary
                        : isDone ? C.success
                            : isFailed ? C.danger
                                : isSkipped ? C.muted
                                    : C.body,
                    fontFamily: 'DM Sans, sans-serif',
                }}
            >
                {task.label}
                {isRunning && (
                    <span
                        className="ml-1 text-[13px] font-normal"
                        style={{ color: C.secondary }}
                    >
                        ...
                    </span>
                )}
            </span>

            {/* Detail badge — shown once task completes */}
            {task.detail && !isPending && (
                <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                        backgroundColor: isDone
                            ? 'rgba(22,163,74,0.12)'
                            : isFailed
                                ? C.dangerBg
                                : C.bg,
                        color: isDone ? C.success : isFailed ? C.danger : C.secondary,
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    {task.detail}
                </span>
            )}
        </div>
    )
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    url: string
    platform: PlatformDetection
    onComplete: (result: UrlImportResult) => void
    onFailed: (errorCode: UrlImportErrorCode, message: string) => void
    onCancel: () => void
}

// ── Main Component ────────────────────────────────────────────
export default function UrlImportProcessing({
    url,
    platform,
    onComplete,
    onFailed,
    onCancel,
}: Props) {
    const [tasks, setTasks] = useState<ProcessingTask[]>(getDefaultTasks())
    const [elapsed, setElapsed] = useState(0)
    const startRef = useRef(Date.now())
    const cancelledRef = useRef(false)

    // ── Elapsed timer ─────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
        }, 1000)
        return () => clearInterval(id)
    }, [])

    // ── Helpers ───────────────────────────────────────────────
    function updateTask(id: string, status: ProcessingTaskStatus, detail?: string) {
        if (cancelledRef.current) return
        setTasks(prev =>
            prev.map(t => t.id === id ? { ...t, status, ...(detail ? { detail } : {}) } : t)
        )
    }

    function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // ── Start import on mount ─────────────────────────────────
    useEffect(() => {
        runImport()
        return () => { cancelledRef.current = true }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Real API attempt → simulation fallback ────────────────
    async function runImport() {
        // Try real API first
        try {
            updateTask('fetch', 'running')

            const res = await fetch('/api/listing/url-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, platform: platform.platform }),
                signal: AbortSignal.timeout(60_000),
            })

            if (res.ok) {
                const result: UrlImportResult = await res.json()

                // Sync tasks from API response
                if (result.tasks?.length) {
                    if (!cancelledRef.current) setTasks(result.tasks)
                }

                await sleep(500)
                if (cancelledRef.current) return

                if (result.success) {
                    onComplete(result)
                } else {
                    onFailed(result.error_code ?? 'unknown_error', result.error_message ?? 'Import failed')
                }
                return
            }
        } catch {
            // API not yet built — fall through to simulation
        }

        if (cancelledRef.current) return
        await runSimulation()
    }

    // ── Demo simulation (remove once real API is live) ────────
    async function runSimulation() {
        // Sequence: [ taskId, durationMs, completionDetail ]
        const steps: Array<[string, number, string]> = [
            ['fetch', 2600, 'Page loaded'],
            ['images', 1800, 'Found 8 images'],
            ['title', 2200, 'Cassini score: 87'],
            ['description', 2400, 'HTML ready'],
            ['pricing', 1300, '£12.40 margin est.'],
            ['vero', 1800, 'No issues found'],
            ['category', 1100, 'Category mapped'],
        ]

        for (const [id, duration, detail] of steps) {
            if (cancelledRef.current) return
            updateTask(id, 'running')
            await sleep(duration)
            if (cancelledRef.current) return
            updateTask(id, 'done', detail)
            await sleep(180)
        }

        if (cancelledRef.current) return

        // Build a placeholder result for Screen 3 (preview)
        const allDone = getDefaultTasks().map((t, i) => ({
            ...t,
            status: 'done' as ProcessingTaskStatus,
            detail: steps[i]?.[2],
        }))

        const mockResult: UrlImportResult = {
            success: true,
            platform,
            raw: null,
            tasks: allDone,
            listing: {
                title_raw: `Sample product from ${platform.displayName}`,
                title_ebay: 'Premium Quality Product | New | Fast UK Dispatch | Great Value',
                cassini_score: 87,
                images: [],
                price_supplier: 19.99,
                price_suggested: 29.99,
                price_currency: 'GBP',
                markup_pct: 50,
                margin_gbp: 8.40,
                margin_pct: 28,
                description_html: `<p>High-quality product imported from <strong>${platform.displayName}</strong>. Brand new and ready to ship.</p>`,
                brand: null,
                ean: null,
                condition: 'New',
                category_label: 'General Products',
                category_ebay_id: null,
                item_specifics: {},
                seller_type: 'dropship',
                source_platform: platform.platform,
                vero_status: 'clear',
                vero_reason: null,
                vero_brand: null,
                source_url: url,
                platform: platform.platform,
                imported_at: new Date().toISOString(),
            },
        }

        onComplete(mockResult)
    }

    // ── Derived display values ────────────────────────────────
    const doneCount = tasks.filter(t => t.status === 'done').length
    const totalCount = tasks.length
    const progress = Math.round((doneCount / totalCount) * 100)
    const allDone = doneCount === totalCount

    function formatElapsed(s: number) {
        return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
    }

    const displayUrl = url.length > 52 ? url.slice(0, 52) + '…' : url
    const platformColor = getPlatformColor(platform.logoKey)

    // ── Render ────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @keyframes lgProcessIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes lgPulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.4; }
        }
        .lg-process-in  { animation: lgProcessIn 0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
        .lg-pulse-text  { animation: lgPulse 2s ease-in-out infinite; }
      `}</style>

            {/* ── Backdrop ──────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(30,21,53,0.7)', backdropFilter: 'blur(8px)' }}
            >
                {/* ── Panel ─────────────────────────────────────── */}
                <div
                    className="lg-process-in relative w-full max-w-[520px] mx-4 rounded-3xl flex flex-col overflow-hidden"
                    style={{
                        backgroundColor: C.surface,
                        boxShadow: '0 24px 64px rgba(117,48,251,0.2), 0 4px 20px rgba(0,0,0,0.14)',
                        maxHeight: '92vh',
                    }}
                >

                    {/* Progress bar — very top edge */}
                    <div className="h-1 w-full shrink-0" style={{ backgroundColor: C.border }}>
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: allDone ? C.success : C.primary,
                            }}
                        />
                    </div>

                    {/* ── Header ──────────────────────────────────── */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Animated icon */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: allDone ? C.successBg : C.primaryLight }}
                            >
                                {allDone
                                    ? <CheckCircle2 size={20} style={{ color: C.success }} />
                                    : <Loader2 size={20} className="animate-spin" style={{ color: C.primary }} />
                                }
                            </div>

                            <div>
                                <p
                                    className="text-[15px] font-bold leading-tight"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}
                                >
                                    {allDone ? 'Import complete' : 'Importing product…'}
                                </p>
                                <p
                                    className="text-[12px]"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    {allDone
                                        ? 'Opening preview now'
                                        : 'AI is reading and rewriting for eBay'}
                                </p>
                            </div>
                        </div>

                        {/* Close / cancel */}
                        <button
                            onClick={onCancel}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ color: C.secondary }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            aria-label="Cancel import"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Source URL pill ──────────────────────────── */}
                    <div className="px-6 pb-4 shrink-0">
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                        >
                            {/* Platform badge */}
                            <span
                                className="px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0"
                                style={{
                                    backgroundColor: platformColor + '1a',
                                    color: platformColor,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                {platform.displayName}
                            </span>

                            <Link2 size={11} style={{ color: C.muted, flexShrink: 0 }} />

                            <span
                                className="text-[11px] truncate"
                                style={{ color: C.secondary, fontFamily: 'DM Mono, monospace' }}
                            >
                                {displayUrl}
                            </span>

                            {/* Elapsed timer */}
                            <div className="flex items-center gap-1 shrink-0 ml-auto">
                                <Clock size={10} style={{ color: C.muted }} />
                                <span
                                    className="text-[11px]"
                                    style={{ color: C.muted, fontFamily: 'DM Mono, monospace' }}
                                >
                                    {formatElapsed(elapsed)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Task list ────────────────────────────────── */}
                    <div className="px-3 pb-2 flex flex-col gap-0.5 overflow-y-auto">
                        {tasks.map((task, i) => (
                            <TaskRow key={task.id} task={task} index={i} />
                        ))}
                    </div>

                    {/* ── Footer ──────────────────────────────────── */}
                    <div
                        className="flex items-center justify-between gap-3 px-6 py-4 mt-1 shrink-0"
                        style={{ borderTop: `1px solid ${C.border}` }}
                    >
                        <p
                            className={`text-[12px] ${!allDone ? 'lg-pulse-text' : ''}`}
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            {allDone
                                ? '✓ All tasks complete — loading preview…'
                                : `${doneCount} of ${totalCount} tasks done · usually takes ~20 seconds`}
                        </p>

                        <button
                            onClick={onCancel}
                            className="shrink-0 px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-75"
                            style={{
                                backgroundColor: C.bg,
                                color: C.secondary,
                                border: `1px solid ${C.border}`,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
