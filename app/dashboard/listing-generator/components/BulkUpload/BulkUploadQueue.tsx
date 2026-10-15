'use client'
// app/dashboard/listing-generator/components/BulkUpload/BulkUploadQueue.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Bulk Upload: live generation queue tracker
//
// Rendered by the parent (LgDashboard) after the user confirms rows
// from BulkUploadModal. The parent drives the AI calls; this component
// only displays state and exposes a cancel callback.
//
// Layout:
//   ┌─────────────────────────────────────────────────┐
//   │  Header: title + cancel button                  │
//   │  Progress bar (overall %)                       │
//   │  Stats strip: Done / Warnings / Failed          │
//   │  Row list (scrollable) — each row has:          │
//   │    [status icon]  [title/barcode]  [message]    │
//   └─────────────────────────────────────────────────┘
//
// Props:
//   rows         — QueueRow[] (live, mutated by parent)
//   onCancel     — stops the queue mid-run
//   onDone       — called when every row has settled
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react'
import {
    CheckCircle2, XCircle, Loader2, Clock,
    AlertTriangle, X, Sparkles, Download,
} from 'lucide-react'
import type { QueueRow } from './BulkUploadModal'

// ── CSV export helper ─────────────────────────────────────────
function exportQueueCSV(rows: QueueRow[]) {
    const header = ['Row', 'Title / Barcode', 'Status', 'VeRO', 'Draft ID', 'Message']
    const lines: string[] = [header.join(',')]
    for (const row of rows) {
        const label = row.title || (row.barcode ? `Barcode: ${row.barcode}` : `Row ${row._rowIndex}`)
        const cells = [
            String(row._rowIndex),
            `"${label.replace(/"/g, '""')}"`,
            row._status,
            row._veroStatus ?? (row._status === 'done' ? 'ok' : '—'),
            row._draftId ?? '—',
            `"${(row._message || '').replace(/"/g, '""')}"`,
        ]
        lines.push(cells.join(','))
    }
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `bulk-results-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg:           '#f8f7ff',
    surface:      '#ffffff',
    border:       '#ede9fe',
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    accent:       '#b8fa33',
    accentText:   '#1e1535',
    dark:         '#1e1535',
    secondary:    '#6b7280',
    muted:        '#9ca3af',
    success:      '#16a34a',
    successBg:    '#dcfce7',
    warning:      '#d97706',
    warningBg:    '#fef3c7',
    danger:       '#ef4444',
    dangerBg:     '#fee2e2',
    info:         '#0ea5e9',
    infoBg:       '#e0f2fe',
}

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
    pending: {
        icon:  <Clock size={15} style={{ color: '#9ca3af' }} />,
        color: '#9ca3af',
        bg:    'transparent',
        label: 'Waiting',
    },
    generating: {
        icon:  <Loader2 size={15} style={{ color: '#7530fb', animation: 'spin 1s linear infinite' }} />,
        color: C.primary,
        bg:    C.primaryLight,
        label: 'Generating…',
    },
    done: {
        icon:  <CheckCircle2 size={15} style={{ color: '#16a34a' }} />,
        color: C.success,
        bg:    C.successBg,
        label: 'Done',
    },
    error: {
        icon:  <XCircle size={15} style={{ color: '#ef4444' }} />,
        color: C.danger,
        bg:    C.dangerBg,
        label: 'Failed',
    },
} as const

// ── Props ─────────────────────────────────────────────────────
interface BulkUploadQueueProps {
    rows:     QueueRow[]
    onCancel: () => void
    onDone:   () => void
}

// ─────────────────────────────────────────────────────────────
export function BulkUploadQueue({ rows, onCancel, onDone }: BulkUploadQueueProps) {
    const listRef      = useRef<HTMLDivElement>(null)
    const prevDoneRef  = useRef(0)
    const doneFiredRef = useRef(false)   // guard: fire onDone exactly once

    // ── Derived stats ─────────────────────────────────────────
    const total      = rows.length
    const done       = rows.filter(r => r._status === 'done').length
    const failed     = rows.filter(r => r._status === 'error').length
    const generating = rows.filter(r => r._status === 'generating').length
    const pending    = rows.filter(r => r._status === 'pending').length
    const settled    = done + failed
    const pct        = total > 0 ? Math.round((settled / total) * 100) : 0
    const isFinished = settled === total && total > 0

    // ── Auto-scroll to the active row ─────────────────────────
    useEffect(() => {
        if (done !== prevDoneRef.current) {
            prevDoneRef.current = done
            const activeEl = listRef.current?.querySelector('[data-active="true"]')
            activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }, [done])

    // ── Notify parent when all rows have settled (fire exactly once) ──────────
    useEffect(() => {
        if (isFinished && !doneFiredRef.current) {
            doneFiredRef.current = true
            onDone()
        }
    }, [isFinished]) // intentionally omit onDone — guarded by ref above

    // ── Estimated time remaining ──────────────────────────────
    function etaLabel(): string {
        if (isFinished || pending + generating === 0) return ''
        const remaining = pending + generating
        // rough: ~8 seconds per listing
        const secs = remaining * 8
        if (secs < 60) return `~${secs}s remaining`
        return `~${Math.ceil(secs / 60)}m remaining`
    }

    // ── Row label ─────────────────────────────────────────────
    function rowLabel(row: QueueRow): string {
        if (row.title)   return row.title.length > 52 ? row.title.slice(0, 52) + '…' : row.title
        if (row.barcode) return `Barcode: ${row.barcode}`
        return `Row ${row._rowIndex}`
    }

    // ─────────────────────────────────────────────────────────
    return (
        <>
            {/* Backdrop */}
            <div style={{
                position:   'fixed', inset: 0,
                background: 'rgba(30,21,53,0.45)',
                backdropFilter: 'blur(4px)',
                zIndex:     1000,
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Panel */}
                <div style={{
                    width:        '100%',
                    maxWidth:     520,
                    maxHeight:    '88vh',
                    background:   C.surface,
                    borderRadius: 20,
                    boxShadow:    '0 24px 64px rgba(117,48,251,0.18)',
                    display:      'flex',
                    flexDirection:'column',
                    overflow:     'hidden',
                    margin:       '0 16px',
                }}>

                    {/* ── Header ──────────────────────────────── */}
                    <div style={{
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'space-between',
                        padding:        '18px 22px',
                        borderBottom:   `1px solid ${C.border}`,
                        flexShrink:     0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: isFinished ? C.successBg : C.primaryLight,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.3s',
                            }}>
                                {isFinished
                                    ? <CheckCircle2 size={18} style={{ color: C.success }} />
                                    : <Sparkles size={18} style={{ color: C.primary }} />
                                }
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                    {isFinished ? 'Generation Complete' : 'Generating Listings…'}
                                </div>
                                <div style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {isFinished
                                        ? `${done} created · ${failed} failed`
                                        : etaLabel() || `${settled} of ${total} done`
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Cancel / Close */}
                        {!isFinished ? (
                            <button
                                onClick={onCancel}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                                    border: `1px solid ${C.danger}44`, background: C.dangerBg,
                                    color: C.danger, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                <X size={12} /> Cancel
                            </button>
                        ) : (
                            <button
                                onClick={onCancel}
                                style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    border: `1px solid ${C.border}`, background: C.bg,
                                    color: C.muted, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* ── Progress bar ─────────────────────────── */}
                    <div style={{ padding: '16px 22px 0', flexShrink: 0 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: 6,
                        }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                Progress
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                {pct}%
                            </span>
                        </div>
                        {/* Track */}
                        <div style={{
                            height: 8, borderRadius: 99,
                            background: C.border, overflow: 'hidden',
                        }}>
                            {/* Fill */}
                            <div style={{
                                height:     '100%',
                                width:      `${pct}%`,
                                borderRadius: 99,
                                background:   isFinished && failed === 0
                                    ? `linear-gradient(90deg, ${C.success}, #4ade80)`
                                    : `linear-gradient(90deg, ${C.primary}, #a78bfa)`,
                                transition:   'width 0.4s ease',
                            }} />
                        </div>

                        {/* Stats strip */}
                        <div style={{
                            display: 'flex', gap: 8, marginTop: 12, marginBottom: 4,
                            flexWrap: 'wrap',
                        }}>
                            {[
                                { label: 'Done',       value: done,       color: C.success, bg: C.successBg,    show: true         },
                                { label: 'Generating', value: generating,  color: C.primary, bg: C.primaryLight, show: !isFinished  },
                                { label: 'Waiting',    value: pending,     color: C.muted,   bg: C.bg,           show: !isFinished  },
                                { label: 'Failed',     value: failed,      color: C.danger,  bg: C.dangerBg,     show: failed > 0   },
                            ].filter(s => s.show).map(stat => (
                                <div key={stat.label} style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '4px 10px', borderRadius: 20,
                                    background: stat.bg,
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: stat.color, fontFamily: 'Syne, sans-serif' }}>
                                        {stat.value}
                                    </span>
                                    <span style={{ fontSize: 11, color: stat.color, fontFamily: 'DM Sans, sans-serif' }}>
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Row list ──────────────────────────────── */}
                    <div
                        ref={listRef}
                        style={{
                            flex: 1, overflowY: 'auto',
                            padding: '8px 14px 16px',
                        }}
                    >
                        {rows.map((row, i) => {
                            const cfg    = STATUS_CFG[row._status]
                            const active = row._status === 'generating'
                            return (
                                <div
                                    key={row._rowIndex}
                                    data-active={active}
                                    style={{
                                        display:      'flex',
                                        alignItems:   'flex-start',
                                        gap:          10,
                                        padding:      '9px 10px',
                                        borderRadius: 10,
                                        marginBottom: 2,
                                        background:   active ? C.primaryLight : i % 2 === 0 ? C.bg : 'transparent',
                                        border:       active ? `1px solid ${C.primary}33` : '1px solid transparent',
                                        transition:   'background 0.2s, border 0.2s',
                                    }}
                                >
                                    {/* Status icon */}
                                    <div style={{
                                        width: 22, height: 22, borderRadius: 6,
                                        background: cfg.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, marginTop: 1,
                                    }}>
                                        {cfg.icon}
                                    </div>

                                    {/* Row info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize:     13,
                                            fontWeight:   active ? 600 : 400,
                                            color:        active ? C.primary : C.dark,
                                            overflow:     'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace:   'nowrap',
                                            fontFamily:   'DM Sans, sans-serif',
                                            transition:   'color 0.2s',
                                        }}>
                                            {rowLabel(row)}
                                        </div>
                                        {row._message && (
                                            <div style={{
                                                fontSize:   11,
                                                marginTop:  2,
                                                color:      row._status === 'error'
                                                    ? C.danger
                                                    : row._status === 'done'
                                                        ? C.success
                                                        : C.muted,
                                                fontFamily: 'DM Sans, sans-serif',
                                                display:    'flex',
                                                alignItems: 'center',
                                                gap:        4,
                                            }}>
                                                {row._status === 'error' && (
                                                    <AlertTriangle size={10} style={{ flexShrink: 0 }} />
                                                )}
                                                {row._message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Row number */}
                                    <span style={{
                                        fontSize:   11,
                                        color:      C.muted,
                                        fontFamily: 'DM Sans, sans-serif',
                                        flexShrink: 0,
                                        marginTop:  2,
                                    }}>
                                        #{row._rowIndex}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* ── Footer (only when finished) ───────────── */}
                    {isFinished && (
                        <div style={{
                            padding:      '14px 22px',
                            borderTop:    `1px solid ${C.border}`,
                            flexShrink:   0,
                            display:      'flex',
                            alignItems:   'center',
                            justifyContent: 'space-between',
                            gap:          10,
                            background:   C.surface,
                            flexWrap:     'wrap',
                        }}>
                            {/* Export CSV */}
                            <button
                                onClick={() => exportQueueCSV(rows)}
                                title="Download results as CSV"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 14px', borderRadius: 10,
                                    fontSize: 12, fontWeight: 600,
                                    border: `1px solid ${C.border}`,
                                    background: C.bg, color: C.secondary,
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                <Download size={12} />
                                Export CSV
                            </button>

                            <button
                                onClick={onCancel}
                                style={{
                                    padding: '8px 22px', borderRadius: 10,
                                    fontSize: 13, fontWeight: 700,
                                    border: 'none',
                                    background: C.accent,
                                    color:      C.accentText,
                                    cursor:     'pointer',
                                    fontFamily: 'Syne, sans-serif',
                                    boxShadow:  '0 4px 12px rgba(184,250,51,0.35)',
                                }}
                            >
                                View in Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Spin keyframe */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </>
    )
}
