'use client'
// app/dashboard/listing-generator/components/BulkUpload/BulkUploadModal.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Bulk Upload Modal
//
// Flow:
//   Step 1 — Drop zone  : drag/drop or click to upload CSV / XLSX
//   Step 2 — Preview    : table showing first 5 rows + validation errors
//   Step 3 — Generating : live progress bar, per-row status
//   Step 4 — Summary    : success / warning / error counts + CTA
//
// The modal never makes AI calls itself — it surfaces parsed rows
// upward via onConfirm(rows) and the parent drives the queue.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from 'react'
import {
    X, Upload, FileSpreadsheet, Download, AlertTriangle,
    CheckCircle2, XCircle, ArrowLeft,
    Info, Sparkles, Palette, ChevronDown,
} from 'lucide-react'
import {
    parseFile, generateCSVTemplate, COLUMN_META,
    applyPlanLimit,
} from './BulkUploadParser'
import { createClient } from '@/lib/supabase'

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
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    info: '#0ea5e9',
    infoBg: '#e0f2fe',
}

// ── Types ─────────────────────────────────────────────────────
export interface BulkRow {
    _rowIndex: number
    title?: string
    barcode?: string
    buy_price?: string
    sell_price?: string
    sku?: string
    condition?: string
    quantity?: string
    category_id?: string
    images?: string
}

export interface ParsedRow extends BulkRow {
    _errors: string[]
    _valid: boolean
}

export type RowStatus = 'pending' | 'generating' | 'done' | 'error'

export interface QueueRow extends ParsedRow {
    _status: RowStatus
    _message: string
}

// Minimal template shape for the picker
interface TemplateSummary {
    id: string
    name: string
    category: string | null
    is_ebay_compliant: boolean
}

interface BulkUploadModalProps {
    onClose: () => void
    onConfirm: (rows: ParsedRow[], templateId: string | null) => void
    planLimit: number   // max rows allowed by plan (0 = unlimited)
}

// ── Column labels sourced from parser metadata ─────────────────
const COLUMN_LABELS: Record<string, string> = Object.fromEntries(
    COLUMN_META.map(c => [c.key, c.label])
)
const TEMPLATE_HEADERS = COLUMN_META.map(c => c.key)

// ── Step type ─────────────────────────────────────────────────
type Step = 'drop' | 'preview' | 'generating' | 'summary'

// ── Download template helper ──────────────────────────────────
// Tries the static public file first; falls back to client-side
// generation if the fetch fails (e.g. dev server without /public).
async function downloadTemplate() {
    try {
        const res = await fetch('/templates/bulk-upload-template.csv')
        if (res.ok) {
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'riazify-bulk-upload-template.csv'
            a.click()
            URL.revokeObjectURL(url)
            return
        }
    } catch { /* fall through to generated version */ }

    // Fallback: generate client-side from COLUMN_META
    const csv = generateCSVTemplate()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'riazify-bulk-upload-template.csv'
    a.click()
    URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────────────────────
export function BulkUploadModal({ onClose, onConfirm, planLimit }: BulkUploadModalProps) {
    const [step, setStep] = useState<Step>('drop')
    const [dragging, setDragging] = useState(false)
    const [fileName, setFileName] = useState('')
    const [rows, setRows] = useState<ParsedRow[]>([])
    const [parseError, setParseError] = useState('')
    const [templates, setTemplates] = useState<TemplateSummary[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [templateOpen, setTemplateOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    // Fetch seller's templates when modal opens
    useEffect(() => {
        async function fetchTemplates() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data } = await (supabase.from('listing_templates') as any)
                    .select('id, name, category, is_ebay_compliant')
                    .or(`user_id.eq.${user.id},is_system.eq.true`)
                    .order('use_count', { ascending: false })
                    .limit(50)
                if (data) setTemplates(data as TemplateSummary[])
            } catch { /* non-fatal */ }
        }
        fetchTemplates()
    }, [])

    const invalidRows = rows.filter(r => !r._valid)
    const { allowed: limitedRows, blocked } = applyPlanLimit(rows, planLimit)
    const validRows = [...limitedRows, ...blocked]
    const overLimit = blocked.length > 0

    // ── File processing ───────────────────────────────────────
    async function processFile(file: File) {
        setParseError('')
        const result = await parseFile(file)
        if (!result.ok) {
            setParseError(result.error ?? 'Unknown error parsing file.')
            return
        }
        if (result.rows.length === 0) {
            setParseError('No data rows found. Make sure your file has a header row and at least one data row.')
            return
        }
        setRows(result.rows)
        setFileName(file.name)
        setStep('preview')
    }

    // ── Drag events ───────────────────────────────────────────
    const onDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setDragging(true) }, [])
    const onDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setDragging(false) }, [])
    const onDrop = useCallback((e: DragEvent) => {
        e.preventDefault(); setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processFile(file)
    }, [])

    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) processFile(file)
        e.target.value = ''
    }

    function handleConfirm() {
        // Do NOT call onClose() here — the parent drives the view transition
        // to 'queue' inside onConfirm, so calling onClose() would race and
        // reset bulkView to null before the queue component mounts.
        onConfirm(limitedRows, selectedTemplateId)
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId) ?? null

    // ── Render ────────────────────────────────────────────────
    return (
        <>
            {/* ── Backdrop ──────────────────────────────────── */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(30,21,53,0.45)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* ── Modal panel ───────────────────────────── */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: step === 'preview' ? 780 : 560,
                        maxHeight: '90vh',
                        background: C.surface,
                        borderRadius: 20,
                        boxShadow: '0 24px 64px rgba(117,48,251,0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        margin: '0 16px',
                        transition: 'max-width 0.25s ease',
                    }}
                >
                    {/* ── Modal header ──────────────────────── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: `1px solid ${C.border}`,
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {step === 'preview' && (
                                <button
                                    onClick={() => { setStep('drop'); setRows([]); setFileName('') }}
                                    style={{
                                        width: 30, height: 30, borderRadius: 8,
                                        border: `1px solid ${C.border}`,
                                        background: C.bg, color: C.muted,
                                        cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <ArrowLeft size={14} />
                                </button>
                            )}
                            <div
                                style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: C.primaryLight,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Upload size={17} style={{ color: C.primary }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                    Bulk Upload
                                </div>
                                <div style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {step === 'drop' && 'Upload a CSV file to generate multiple listings at once'}
                                    {step === 'preview' && `${fileName} — ${rows.length} row${rows.length !== 1 ? 's' : ''} found`}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 30, height: 30, borderRadius: 8,
                                border: `1px solid ${C.border}`,
                                background: C.bg, color: C.muted,
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* ── Step 1: Drop zone ─────────────────── */}
                    {step === 'drop' && (
                        <div style={{ padding: '28px 28px 24px', overflowY: 'auto' }}>

                            {/* Drop area */}
                            <div
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragging ? C.primary : C.border}`,
                                    borderRadius: 16,
                                    padding: '40px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: dragging ? C.primaryLight : C.bg,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div style={{
                                    width: 56, height: 56, borderRadius: 14,
                                    background: dragging ? C.primary : C.primaryLight,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    transition: 'background 0.15s ease',
                                }}>
                                    <FileSpreadsheet size={26} style={{ color: dragging ? '#fff' : C.primary }} />
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>
                                    {dragging ? 'Drop your file here' : 'Drag & drop your CSV'}
                                </div>
                                <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
                                    or click to browse your files
                                </div>
                                <span style={{
                                    display: 'inline-block',
                                    fontSize: 11, fontWeight: 600,
                                    color: C.primary, background: C.primaryLight,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 20, padding: '3px 12px',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>
                                    CSV files only
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={onFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Parse error */}
                            {parseError && (
                                <div style={{
                                    marginTop: 14, padding: '10px 14px', borderRadius: 10,
                                    background: C.dangerBg, border: `1px solid ${C.danger}33`,
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                }}>
                                    <AlertTriangle size={15} style={{ color: C.danger, flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 13, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                        {parseError}
                                    </span>
                                </div>
                            )}

                            {/* Template download */}
                            <div style={{
                                marginTop: 20, padding: '14px 16px', borderRadius: 12,
                                background: C.bg, border: `1px solid ${C.border}`,
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 9,
                                    background: C.successBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Download size={16} style={{ color: C.success }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                        Download CSV Template
                                    </div>
                                    <div style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Pre-filled with the correct column headers and an example row
                                    </div>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    style={{
                                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                        border: `1px solid ${C.success}55`, background: C.successBg,
                                        color: C.success, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                        flexShrink: 0,
                                    }}
                                >
                                    Download
                                </button>
                            </div>

                            {/* Column guide */}
                            <div style={{ marginTop: 20 }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: C.muted,
                                    letterSpacing: '0.06em', marginBottom: 8,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>
                                    COLUMN REFERENCE
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {TEMPLATE_HEADERS.map((col, i) => {
                                        const isRequired = col === 'title' || col === 'barcode'
                                        return (
                                            <div key={col} style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '7px 10px',
                                                borderRadius: 8,
                                                background: i % 2 === 0 ? C.bg : 'transparent',
                                            }}>
                                                <code style={{
                                                    fontSize: 11, fontFamily: 'monospace',
                                                    color: C.primary, background: C.primaryLight,
                                                    padding: '2px 6px', borderRadius: 4,
                                                    minWidth: 100, display: 'inline-block',
                                                }}>
                                                    {col}
                                                </code>
                                                <span style={{ fontSize: 12, color: C.secondary, flex: 1, fontFamily: 'DM Sans, sans-serif' }}>
                                                    {COLUMN_LABELS[col]}
                                                </span>
                                                {isRequired && (
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700,
                                                        color: C.warning, background: C.warningBg,
                                                        borderRadius: 10, padding: '1px 7px',
                                                        fontFamily: 'DM Sans, sans-serif',
                                                    }}>
                                                        ONE REQUIRED
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div style={{
                                    marginTop: 10, padding: '8px 12px', borderRadius: 9,
                                    background: C.infoBg, border: `1px solid ${C.info}33`,
                                    display: 'flex', gap: 8, alignItems: 'flex-start',
                                }}>
                                    <Info size={13} style={{ color: C.info, flexShrink: 0, marginTop: 1 }} />
                                    <span style={{ fontSize: 12, color: C.info, fontFamily: 'DM Sans, sans-serif' }}>
                                        At least <strong>title</strong> or <strong>barcode</strong> is required per row. All other columns are optional.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Preview ───────────────────── */}
                    {step === 'preview' && (
                        <>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                                {/* Stats strip */}
                                <div style={{
                                    display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap',
                                }}>
                                    {[
                                        { label: 'Total rows', value: rows.length, color: C.primary, bg: C.primaryLight },
                                        { label: 'Valid', value: validRows.length, color: C.success, bg: C.successBg },
                                        { label: 'Errors', value: invalidRows.length, color: C.danger, bg: C.dangerBg },
                                        ...(overLimit ? [{ label: `Over limit (${planLimit})`, value: blocked.length, color: C.warning, bg: C.warningBg }] : []),
                                    ].map(stat => (
                                        <div key={stat.label} style={{
                                            padding: '8px 14px', borderRadius: 10,
                                            background: stat.bg,
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                            <span style={{ fontSize: 18, fontWeight: 800, color: stat.color, fontFamily: 'Syne, sans-serif' }}>
                                                {stat.value}
                                            </span>
                                            <span style={{ fontSize: 12, color: stat.color, fontFamily: 'DM Sans, sans-serif' }}>
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Over-limit notice */}
                                {overLimit && (
                                    <div style={{
                                        marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                                        background: C.warningBg, border: `1px solid ${C.warning}44`,
                                        display: 'flex', gap: 8, alignItems: 'flex-start',
                                    }}>
                                        <AlertTriangle size={14} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
                                        <span style={{ fontSize: 13, color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                            Your plan allows up to <strong>{planLimit} rows</strong> per upload.
                                            Only the first {planLimit} valid rows will be generated.
                                            Upgrade to remove this limit.
                                        </span>
                                    </div>
                                )}

                                {/* Preview table */}
                                <div style={{
                                    borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden',
                                }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                                            <thead>
                                                <tr style={{ background: C.bg }}>
                                                    <th style={thStyle}>#</th>
                                                    <th style={thStyle}>Title / Barcode</th>
                                                    <th style={thStyle}>Buy £</th>
                                                    <th style={thStyle}>Sell £</th>
                                                    <th style={thStyle}>SKU</th>
                                                    <th style={thStyle}>Condition</th>
                                                    <th style={thStyle}>Qty</th>
                                                    <th style={thStyle}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, i) => {
                                                    const overPlan = planLimit > 0 && row._valid &&
                                                        validRows.slice(planLimit).some(r => r._rowIndex === row._rowIndex)
                                                    return (
                                                        <tr
                                                            key={row._rowIndex}
                                                            style={{
                                                                borderTop: `1px solid ${C.border}`,
                                                                background: overPlan ? '#fffbeb' : !row._valid ? '#fff5f5' : i % 2 === 0 ? '#fff' : C.bg + '66',
                                                                opacity: overPlan ? 0.6 : 1,
                                                            }}
                                                        >
                                                            <td style={tdStyle}><span style={{ color: C.muted, fontSize: 11 }}>{row._rowIndex}</span></td>
                                                            <td style={{ ...tdStyle, maxWidth: 180 }}>
                                                                {row.title ? (
                                                                    <span style={{ fontSize: 12, color: C.dark, fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {row.title as string}
                                                                    </span>
                                                                ) : row.barcode ? (
                                                                    <span style={{ fontSize: 12, color: C.primary, fontFamily: 'monospace' }}>
                                                                        {row.barcode as string}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ fontSize: 11, color: C.danger, fontStyle: 'italic' }}>—</span>
                                                                )}
                                                            </td>
                                                            <td style={tdStyle}><span style={{ fontSize: 12, color: C.secondary }}>{row.buy_price || '—'}</span></td>
                                                            <td style={tdStyle}><span style={{ fontSize: 12, color: C.secondary }}>{row.sell_price || '—'}</span></td>
                                                            <td style={tdStyle}><span style={{ fontSize: 12, color: C.secondary, fontFamily: 'monospace' }}>{row.sku || '—'}</span></td>
                                                            <td style={tdStyle}><ConditionBadge value={row.condition as string | undefined} /></td>
                                                            <td style={tdStyle}><span style={{ fontSize: 12, color: C.secondary }}>{row.quantity || '—'}</span></td>
                                                            <td style={tdStyle}>
                                                                {overPlan ? (
                                                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.warning }}>Over limit</span>
                                                                ) : row._valid ? (
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                        <CheckCircle2 size={13} style={{ color: C.success }} />
                                                                        <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>Ready</span>
                                                                    </span>
                                                                ) : (
                                                                    <div>
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                            <XCircle size={13} style={{ color: C.danger }} />
                                                                            <span style={{ fontSize: 11, color: C.danger, fontWeight: 600 }}>Error</span>
                                                                        </span>
                                                                        {row._errors.map(err => (
                                                                            <div key={err} style={{ fontSize: 10, color: C.danger, marginTop: 2, paddingLeft: 17 }}>
                                                                                {err}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {validRows.length === 0 && (
                                    <div style={{
                                        marginTop: 14, padding: '12px 16px', borderRadius: 10,
                                        background: C.dangerBg, border: `1px solid ${C.danger}33`,
                                        textAlign: 'center',
                                    }}>
                                        <span style={{ fontSize: 13, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                            No valid rows to generate. Fix the errors and re-upload your file.
                                        </span>
                                    </div>
                                )}

                                {/* ── Template Picker ─────────────────────── */}
                                <div style={{ marginTop: 18 }}>
                                    <div style={{
                                        padding: '14px 16px', borderRadius: 12,
                                        border: `1px solid ${selectedTemplateId ? C.primary + '55' : C.border}`,
                                        background: selectedTemplateId ? C.primaryLight : C.bg,
                                        transition: 'all 0.15s ease',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: selectedTemplateId ? C.primary : C.border,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, transition: 'background 0.15s ease',
                                            }}>
                                                <Palette size={15} style={{ color: selectedTemplateId ? '#fff' : C.muted }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                                    Apply Design Template
                                                </div>
                                                <div style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                    Attach a template to all listings in this batch
                                                </div>
                                            </div>
                                            {selectedTemplateId && (
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700,
                                                    color: C.primary, background: '#fff',
                                                    border: `1px solid ${C.primary}44`,
                                                    borderRadius: 20, padding: '2px 8px',
                                                    fontFamily: 'DM Sans, sans-serif',
                                                }}>
                                                    APPLIED
                                                </span>
                                            )}
                                        </div>

                                        {/* Dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setTemplateOpen(o => !o)}
                                                style={{
                                                    width: '100%', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between', gap: 8,
                                                    padding: '9px 12px', borderRadius: 9,
                                                    border: `1px solid ${C.borderInput}`,
                                                    background: C.surface, cursor: 'pointer',
                                                    fontFamily: 'DM Sans, sans-serif',
                                                    transition: 'border-color 0.15s ease',
                                                }}
                                            >
                                                <span style={{ fontSize: 13, color: selectedTemplate ? C.dark : C.muted }}>
                                                    {selectedTemplate
                                                        ? selectedTemplate.name
                                                        : 'No template (optional)'}
                                                </span>
                                                <ChevronDown
                                                    size={14}
                                                    style={{
                                                        color: C.muted, flexShrink: 0,
                                                        transform: templateOpen ? 'rotate(180deg)' : 'none',
                                                        transition: 'transform 0.15s ease',
                                                    }}
                                                />
                                            </button>

                                            {templateOpen && (
                                                <div style={{
                                                    position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                                                    background: C.surface,
                                                    border: `1px solid ${C.border}`,
                                                    borderRadius: 10, boxShadow: '0 8px 24px rgba(117,48,251,0.12)',
                                                    zIndex: 50, overflow: 'hidden',
                                                    maxHeight: 200, overflowY: 'auto',
                                                }}>
                                                    {/* No template option */}
                                                    <button
                                                        onClick={() => { setSelectedTemplateId(null); setTemplateOpen(false) }}
                                                        style={{
                                                            width: '100%', textAlign: 'left',
                                                            padding: '9px 14px', border: 'none',
                                                            background: selectedTemplateId === null ? C.primaryLight : 'transparent',
                                                            cursor: 'pointer', borderBottom: `1px solid ${C.border}`,
                                                            fontFamily: 'DM Sans, sans-serif',
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>
                                                            No template
                                                        </span>
                                                    </button>

                                                    {templates.length === 0 && (
                                                        <div style={{ padding: '10px 14px', fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                            No templates found — create one in Design Studio
                                                        </div>
                                                    )}

                                                    {templates.map(t => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => { setSelectedTemplateId(t.id); setTemplateOpen(false) }}
                                                            style={{
                                                                width: '100%', textAlign: 'left',
                                                                padding: '9px 14px', border: 'none',
                                                                background: selectedTemplateId === t.id ? C.primaryLight : 'transparent',
                                                                cursor: 'pointer', borderBottom: `1px solid ${C.border}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                                                                fontFamily: 'DM Sans, sans-serif',
                                                            }}
                                                        >
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 13, color: C.dark, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {t.name}
                                                                </div>
                                                                {t.category && (
                                                                    <div style={{ fontSize: 11, color: C.muted }}>
                                                                        {t.category}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {t.is_ebay_compliant ? (
                                                                <span style={{
                                                                    fontSize: 10, fontWeight: 700,
                                                                    color: C.success, background: C.successBg,
                                                                    borderRadius: 10, padding: '2px 7px',
                                                                    flexShrink: 0,
                                                                }}>
                                                                    COMPLIANT
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    fontSize: 10, fontWeight: 600,
                                                                    color: C.warning, background: C.warningBg,
                                                                    borderRadius: 10, padding: '2px 7px',
                                                                    flexShrink: 0,
                                                                }}>
                                                                    REVIEW
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Compliance tip */}
                                        {selectedTemplate && !selectedTemplate.is_ebay_compliant && (
                                            <div style={{
                                                marginTop: 8, display: 'flex', gap: 6, alignItems: 'flex-start',
                                            }}>
                                                <AlertTriangle size={12} style={{ color: C.warning, flexShrink: 0, marginTop: 1 }} />
                                                <span style={{ fontSize: 11, color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                                    This template has compliance issues. Fix in Design Studio to earn full health-score points.
                                                </span>
                                            </div>
                                        )}
                                        {selectedTemplate?.is_ebay_compliant && (
                                            <div style={{
                                                marginTop: 8, display: 'flex', gap: 6, alignItems: 'center',
                                            }}>
                                                <CheckCircle2 size={12} style={{ color: C.success }} />
                                                <span style={{ fontSize: 11, color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                                    eBay-compliant — max health-score boost applied to all listings
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer CTA */}
                            <div style={{
                                padding: '14px 24px',
                                borderTop: `1px solid ${C.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                flexShrink: 0,
                                background: C.surface,
                            }}>
                                <div style={{ fontSize: 13, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {limitedRows.length} listing{limitedRows.length !== 1 ? 's' : ''} will be generated
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => { setStep('drop'); setRows([]); setFileName('') }}
                                        style={{
                                            padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                            border: `1px solid ${C.border}`, background: C.bg,
                                            color: C.secondary, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                        }}
                                    >
                                        Re-upload
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={limitedRows.length === 0}
                                        style={{
                                            padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                                            border: 'none',
                                            background: limitedRows.length > 0 ? C.accent : C.border,
                                            color: limitedRows.length > 0 ? C.accentText : C.muted,
                                            cursor: limitedRows.length > 0 ? 'pointer' : 'not-allowed',
                                            fontFamily: 'Syne, sans-serif',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            boxShadow: limitedRows.length > 0 ? '0 4px 12px rgba(184,250,51,0.35)' : 'none',
                                        }}
                                    >
                                        <Sparkles size={14} />
                                        Generate {limitedRows.length} Listing{limitedRows.length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

// ── Small helpers ─────────────────────────────────────────────
const thStyle: React.CSSProperties = {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    fontFamily: 'DM Sans, sans-serif',
}

const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
    verticalAlign: 'top',
    fontFamily: 'DM Sans, sans-serif',
}

function ConditionBadge({ value }: { value?: string }) {
    if (!value) return <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>
    const v = value.toLowerCase()
    const map: Record<string, { label: string; color: string; bg: string }> = {
        new: { label: 'New', color: '#16a34a', bg: '#dcfce7' },
        used: { label: 'Used', color: '#d97706', bg: '#fef3c7' },
        refurbished: { label: 'Refurbished', color: '#0ea5e9', bg: '#e0f2fe' },
    }
    const cfg = map[v]
    if (!cfg) return <span style={{ fontSize: 12, color: '#9ca3af' }}>{value}</span>
    return (
        <span style={{
            fontSize: 11, fontWeight: 600,
            color: cfg.color, background: cfg.bg,
            borderRadius: 10, padding: '2px 8px',
            fontFamily: 'DM Sans, sans-serif',
        }}>
            {cfg.label}
        </span>
    )
}
