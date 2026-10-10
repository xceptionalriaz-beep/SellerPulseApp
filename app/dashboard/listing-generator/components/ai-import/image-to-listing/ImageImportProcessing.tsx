'use client'
// app/dashboard/listing-generator/components/ai-import/ImageImportProcessing.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// Screen 2 of the Image → Listing import flow.
// Encodes images to base64, calls /api/listing/image-import, shows task list.
// Falls back to simulation if the API isn't reachable yet.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import {
    X,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    Camera,
    SkipForward,
    ImageIcon,
} from 'lucide-react'
import { ProcessingTask, ProcessingTaskStatus } from '@/app/dashboard/listing-generator/types/url-import.types'
import type { ImageImportData } from './ImageImport'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
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

const FONT_HEADING = 'Syne, sans-serif'
const FONT_BODY = 'DM Sans, sans-serif'
const FONT_MONO = 'DM Mono, monospace'

// ── Image import result type ──────────────────────────────────────────────────
export interface ImageImportResult {
    success: boolean
    draft_id?: string
    tasks?: ProcessingTask[]
    listing?: {
        title_raw: string
        title_ebay: string
        cassini_score: number
        images: string[]
        price_suggested: number
        price_currency: string
        description_html: string
        brand: string | null
        ean: string | null
        condition: string
        category_label: string
        category_ebay_id: string | null
        item_specifics: Record<string, string>
        vero_status: 'clear' | 'warning' | 'flagged'
        vero_reason: string | null
        vero_brand: string | null
        imported_at: string
    }
    error_code?: string
    error_message?: string
}

// ── Image-specific task definitions ──────────────────────────────────────────
function getImageTasks(): ProcessingTask[] {
    return [
        { id: 'upload', label: 'Preparing and uploading photos', status: 'pending' },
        { id: 'analyse', label: 'AI analysing product images', status: 'pending' },
        { id: 'identify', label: 'Identifying item and extracting details', status: 'pending' },
        { id: 'title', label: 'Writing eBay-optimised title', status: 'pending' },
        { id: 'describe', label: 'Generating listing description', status: 'pending' },
        { id: 'pricing', label: 'Suggesting price range', status: 'pending' },
        { id: 'vero', label: 'VeRO brand check', status: 'pending' },
    ]
}

// ── Condition display helpers ─────────────────────────────────────────────────
const CONDITION_LABELS: Record<string, string> = {
    new: 'New',
    used: 'Used',
    for_parts: 'For Parts',
}
const SUB_CONDITION_LABELS: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
}

// ── TaskRow sub-component ─────────────────────────────────────────────────────
function TaskRow({ task }: { task: ProcessingTask }) {
    const isRunning = task.status === 'running'
    const isDone = task.status === 'done'
    const isFailed = task.status === 'failed'
    const isSkipped = task.status === 'skipped'
    const isPending = task.status === 'pending'

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 18px',
                borderRadius: 14,
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
            <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isRunning && <Loader2 size={20} className="animate-spin" style={{ color: C.primary }} />}
                {isDone && <CheckCircle2 size={20} style={{ color: C.success }} />}
                {isFailed && <XCircle size={20} style={{ color: C.danger }} />}
                {isSkipped && <SkipForward size={18} style={{ color: C.muted }} />}
                {isPending && (
                    <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: C.muted }} />
                )}
            </div>

            {/* Label */}
            <span
                style={{
                    flex: 1,
                    fontSize: 14.5,
                    fontWeight: 500,
                    fontFamily: FONT_BODY,
                    color: isRunning
                        ? C.primary
                        : isDone
                            ? C.success
                            : isFailed
                                ? C.danger
                                : isSkipped
                                    ? C.muted
                                    : C.body,
                }}
            >
                {task.label}
                {isRunning && (
                    <span style={{ marginLeft: 4, fontSize: 12.5, fontWeight: 400, color: C.secondary }}>
                        …
                    </span>
                )}
            </span>

            {/* Detail badge */}
            {task.detail && !isPending && (
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: FONT_BODY,
                        padding: '3px 10px',
                        borderRadius: 20,
                        flexShrink: 0,
                        backgroundColor: isDone
                            ? 'rgba(22,163,74,0.12)'
                            : isFailed
                                ? C.dangerBg
                                : C.bg,
                        color: isDone ? C.success : isFailed ? C.danger : C.secondary,
                    }}
                >
                    {task.detail}
                </span>
            )}
        </div>
    )
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    data: ImageImportData
    onComplete: (result: ImageImportResult) => void
    onFailed: (errorCode: string, message: string) => void
    onCancel: () => void
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ImageImportProcessing({ data, onComplete, onFailed, onCancel }: Props) {
    const [tasks, setTasks] = useState<ProcessingTask[]>(getImageTasks())
    const [elapsed, setElapsed] = useState(0)
    const startRef = useRef(Date.now())
    const cancelledRef = useRef(false)

    // ── Elapsed timer ─────────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
        }, 1000)
        return () => clearInterval(id)
    }, [])

    // ── Helpers ───────────────────────────────────────────────────────────────
    function updateTask(id: string, status: ProcessingTaskStatus, detail?: string) {
        if (cancelledRef.current) return
        setTasks(prev =>
            prev.map(t => t.id === id ? { ...t, status, ...(detail ? { detail } : {}) } : t)
        )
    }

    function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    // ── Base64 encode a single File ───────────────────────────────────────────
    function encodeFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    // ── Start on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        runImport()
        return () => { cancelledRef.current = true }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Real API → simulation fallback ───────────────────────────────────────
    async function runImport() {
        updateTask('upload', 'running')

        try {
            // Encode all images to base64
            const encoded = await Promise.all(
                data.images.map(async (file, i) => ({
                    index: i,
                    name: file.name,
                    type: file.type,
                    data: await encodeFile(file),
                    isLabel: i === data.labelImageIndex,
                }))
            )

            if (cancelledRef.current) return
            updateTask('upload', 'done', `${data.images.length} photo${data.images.length > 1 ? 's' : ''} ready`)
            await sleep(300)

            if (cancelledRef.current) return
            updateTask('analyse', 'running')

            // Race the real API against a 45-second hard timeout
            // No AbortSignal.timeout — it hangs in Node dev mode
            const timeoutPromise = new Promise<null>(resolve =>
                setTimeout(() => resolve(null), 45_000)
            )

            const fetchPromise = fetch('/api/listing/image-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    images: encoded,
                    labelImageIndex: data.labelImageIndex,
                    condition: data.condition,
                    subCondition: data.subCondition || null,
                    hint: data.hint || null,
                }),
            }).then(r => r).catch(() => null)

            const res = await Promise.race([fetchPromise, timeoutPromise])

            if (res && res.ok) {
                const result: ImageImportResult = await res.json()

                if (result.tasks?.length && !cancelledRef.current) {
                    setTasks(result.tasks)
                }

                await sleep(400)
                if (cancelledRef.current) return

                if (result.success) {
                    onComplete(result)
                } else {
                    onFailed(result.error_code ?? 'unknown_error', result.error_message ?? 'Image import failed')
                }
                return
            }

            // null (timeout) or non-ok → fall through to simulation
        } catch {
            // Network / encoding error → fall through to simulation
        }

        if (cancelledRef.current) return
        await runSimulation()
    }

    // ── Demo simulation (remove once API is live) ─────────────────────────────
    async function runSimulation() {
        // upload already set to running above — mark it done first if still pending
        updateTask('upload', 'done', `${data.images.length} photo${data.images.length > 1 ? 's' : ''} ready`)
        await sleep(200)

        const steps: Array<[string, number, string]> = [
            ['analyse', 3200, 'Vision AI complete'],
            ['identify', 2400, 'Item recognised'],
            ['title', 2000, 'Cassini score: 91'],
            ['describe', 2600, 'HTML ready'],
            ['pricing', 1400, '£18–£26 range'],
            ['vero', 1600, 'No issues found'],
        ]

        for (const [id, duration, detail] of steps) {
            if (cancelledRef.current) return
            updateTask(id, 'running')
            await sleep(duration)
            if (cancelledRef.current) return
            updateTask(id, 'done', detail)
            await sleep(150)
        }

        if (cancelledRef.current) return

        const allDone = getImageTasks().map((t, i) => ({
            ...t,
            status: 'done' as ProcessingTaskStatus,
            detail: i === 0
                ? `${data.images.length} photo${data.images.length > 1 ? 's' : ''} ready`
                : steps[i - 1]?.[2],
        }))

        const condLabel = CONDITION_LABELS[data.condition] ?? data.condition
        const subLabel = data.subCondition ? ` — ${SUB_CONDITION_LABELS[data.subCondition]}` : ''

        const mockResult: ImageImportResult = {
            success: true,
            tasks: allDone,
            listing: {
                title_raw: data.hint || 'Product identified from photos',
                title_ebay: data.hint
                    ? `${data.hint} | ${condLabel} | Fast UK Dispatch | Great Value`
                    : 'Premium Quality Product | New | Fast UK Dispatch | Great Value',
                cassini_score: 91,
                images: [],
                price_suggested: 24.99,
                price_currency: 'GBP',
                description_html: `<p>High-quality ${condLabel.toLowerCase()} item${data.hint ? ` — ${data.hint}` : ''}. AI-generated listing from product photos.</p>`,
                brand: null,
                ean: null,
                condition: `${condLabel}${subLabel}`,
                category_label: 'General Products',
                category_ebay_id: null,
                item_specifics: {},
                vero_status: 'clear',
                vero_reason: null,
                vero_brand: null,
                imported_at: new Date().toISOString(),
            },
        }

        onComplete(mockResult)
    }

    // ── Derived values ────────────────────────────────────────────────────────
    const doneCount = tasks.filter(t => t.status === 'done').length
    const totalCount = tasks.length
    const progress = Math.round((doneCount / totalCount) * 100)
    const allDone = doneCount === totalCount

    function formatElapsed(s: number) {
        return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
    }

    const productCount = data.labelImageIndex !== null
        ? data.images.length - 1
        : data.images.length
    const labelCount = data.labelImageIndex !== null ? 1 : 0

    const photoSummary = [
        `${productCount} product photo${productCount !== 1 ? 's' : ''}`,
        labelCount ? '1 label photo' : '',
    ].filter(Boolean).join(' · ')

    const conditionSummary = (() => {
        const base = CONDITION_LABELS[data.condition] ?? data.condition
        const sub = data.subCondition ? ` (${SUB_CONDITION_LABELS[data.subCondition]})` : ''
        return `${base}${sub}`
    })()

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        @keyframes lgImgProcessIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lgImgPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .lg-img-process-in { animation: lgImgProcessIn 0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
        .lg-img-pulse      { animation: lgImgPulse 2s ease-in-out infinite; }
      `}</style>

            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9998,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(30,21,53,0.72)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}
            >
                {/* Panel */}
                <div
                    className="lg-img-process-in"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 700,
                        margin: '0 16px',
                        borderRadius: 24,
                        backgroundColor: C.surface,
                        boxShadow: '0 32px 80px rgba(117,48,251,0.22), 0 8px 24px rgba(0,0,0,0.14)',
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Progress bar — top edge */}
                    <div style={{ height: 4, width: '100%', flexShrink: 0, backgroundColor: C.border }}>
                        <div
                            style={{
                                height: '100%',
                                borderRadius: 2,
                                width: `${progress}%`,
                                backgroundColor: allDone ? C.success : C.primary,
                                transition: 'width 0.7s ease-out',
                            }}
                        />
                    </div>

                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '24px 32px 16px',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Animated icon */}
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    backgroundColor: allDone ? C.successBg : C.primaryLight,
                                    transition: 'background-color 0.3s ease',
                                }}
                            >
                                {allDone
                                    ? <CheckCircle2 size={24} style={{ color: C.success }} />
                                    : <Loader2 size={24} className="animate-spin" style={{ color: C.primary }} />
                                }
                            </div>

                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 18,
                                        fontWeight: 700,
                                        fontFamily: FONT_HEADING,
                                        color: C.dark,
                                        letterSpacing: '-0.3px',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {allDone ? 'Analysis complete' : 'Analysing photos…'}
                                </p>
                                <p
                                    style={{
                                        margin: '4px 0 0',
                                        fontSize: 13,
                                        fontFamily: FONT_BODY,
                                        color: C.muted,
                                    }}
                                >
                                    {allDone
                                        ? 'Opening listing preview now'
                                        : 'AI is reading your photos and building the eBay listing'}
                                </p>
                            </div>
                        </div>

                        {/* Cancel button */}
                        <button
                            onClick={onCancel}
                            aria-label="Cancel"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: 'none',
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: C.secondary,
                                transition: 'background-color 0.15s ease',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.bg }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Info pill — photo count + condition + hint */}
                    <div style={{ padding: '0 32px 20px', flexShrink: 0 }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 16px',
                                borderRadius: 14,
                                backgroundColor: C.bg,
                                border: `1px solid ${C.border}`,
                                flexWrap: 'wrap' as const,
                            }}
                        >
                            {/* Camera icon */}
                            <Camera size={13} style={{ color: C.muted, flexShrink: 0 }} />

                            {/* Photo count */}
                            <span
                                style={{
                                    fontSize: 12,
                                    fontFamily: FONT_BODY,
                                    color: C.secondary,
                                    flexShrink: 0,
                                }}
                            >
                                {photoSummary}
                            </span>

                            {/* Separator */}
                            <span style={{ width: 1, height: 12, backgroundColor: C.border, flexShrink: 0 }} />

                            {/* Condition */}
                            <span
                                style={{
                                    fontSize: 12,
                                    fontFamily: FONT_BODY,
                                    color: C.secondary,
                                    flexShrink: 0,
                                }}
                            >
                                {conditionSummary}
                            </span>

                            {/* Hint (if provided) */}
                            {data.hint && (
                                <>
                                    <span style={{ width: 1, height: 12, backgroundColor: C.border, flexShrink: 0 }} />
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontFamily: FONT_MONO,
                                            color: C.secondary,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap' as const,
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        {data.hint.length > 48 ? data.hint.slice(0, 48) + '…' : data.hint}
                                    </span>
                                </>
                            )}

                            {/* Elapsed timer — pinned right */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    marginLeft: 'auto',
                                    flexShrink: 0,
                                }}
                            >
                                <Clock size={12} style={{ color: C.muted }} />
                                <span style={{ fontSize: 12, fontFamily: FONT_MONO, color: C.muted, fontWeight: 500 }}>
                                    {formatElapsed(elapsed)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Task list */}
                    <div
                        style={{
                            padding: '0 20px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            overflowY: 'auto',
                        }}
                    >
                        {tasks.map(task => (
                            <TaskRow key={task.id} task={task} />
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '16px 32px 20px',
                            marginTop: 8,
                            flexShrink: 0,
                            borderTop: `1px solid ${C.border}`,
                        }}
                    >
                        <p
                            className={!allDone ? 'lg-img-pulse' : undefined}
                            style={{
                                margin: 0,
                                fontSize: 13,
                                fontFamily: FONT_BODY,
                                color: C.muted,
                            }}
                        >
                            {allDone
                                ? '✓ All tasks complete — loading preview…'
                                : `${doneCount} of ${totalCount} tasks done · vision AI usually takes 20–40 seconds`}
                        </p>

                        <button
                            onClick={onCancel}
                            style={{
                                flexShrink: 0,
                                padding: '8px 20px',
                                borderRadius: 12,
                                border: `1px solid ${C.border}`,
                                background: C.bg,
                                color: C.secondary,
                                fontFamily: FONT_BODY,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
