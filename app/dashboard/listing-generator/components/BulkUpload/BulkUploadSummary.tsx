'use client'
// app/dashboard/listing-generator/components/BulkUpload/BulkUploadSummary.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Bulk Upload: final results summary screen
//
// Shown after BulkUploadQueue reports all rows settled.
// Displays a clear breakdown of what succeeded, what needs
// attention, and what failed — with actionable CTAs.
//
// Layout:
//   ┌─────────────────────────────────────────────────┐
//   │  Hero: big icon + headline                      │
//   │  3 stat cards: Created / Warnings / Failed      │
//   │  Failed rows list (if any)                      │
//   │  Warning rows list (if any)                     │
//   │  Footer CTAs                                    │
//   └─────────────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────

import { CheckCircle2, AlertTriangle, XCircle, X, Sparkles, RefreshCw } from 'lucide-react'
import type { QueueRow } from './BulkUploadModal'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    successBorder: '#bbf7d0',
    warning: '#d97706',
    warningBg: '#fef3c7',
    warningBorder: '#fde68a',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    dangerBorder: '#fecaca',
}

// ── Props ─────────────────────────────────────────────────────
interface BulkUploadSummaryProps {
    rows: QueueRow[]
    onClose: () => void          // goes back to dashboard
    onRetry: (rows: QueueRow[]) => void  // re-queues failed rows
}

// ─────────────────────────────────────────────────────────────
export function BulkUploadSummary({ rows, onClose, onRetry }: BulkUploadSummaryProps) {

    // ── Derived ───────────────────────────────────────────────
    const created = rows.filter(r => r._status === 'done')
    const failed = rows.filter(r => r._status === 'error')
    const warnings = created.filter(r => r._message.toLowerCase().includes('warn') || r._message.toLowerCase().includes('vero'))
    const clean = created.filter(r => !warnings.some(w => w._rowIndex === r._rowIndex))

    const allGood = failed.length === 0 && warnings.length === 0
    const allFailed = created.length === 0 && failed.length > 0
    const partialFail = failed.length > 0

    // ── Hero config ───────────────────────────────────────────
    const hero = allGood ? {
        icon: <CheckCircle2 size={32} style={{ color: C.success }} />,
        bg: C.successBg,
        border: C.successBorder,
        title: `${created.length} listing${created.length !== 1 ? 's' : ''} created!`,
        sub: 'All rows generated successfully. Your drafts are ready to review.',
    } : allFailed ? {
        icon: <XCircle size={32} style={{ color: C.danger }} />,
        bg: C.dangerBg,
        border: C.dangerBorder,
        title: 'Generation failed',
        sub: 'None of the rows could be processed. Check the errors below and try again.',
    } : {
        icon: <AlertTriangle size={32} style={{ color: C.warning }} />,
        bg: C.warningBg,
        border: C.warningBorder,
        title: `${created.length} created${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
        sub: failed.length > 0
            ? 'Some rows need attention. Review the errors and retry if needed.'
            : 'All created — some listings have warnings that need your review.',
    }

    // ── Row label helper ──────────────────────────────────────
    function label(row: QueueRow, maxLen = 56): string {
        const text = row.title || (row.barcode ? `Barcode: ${row.barcode}` : `Row ${row._rowIndex}`)
        return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
    }

    // ─────────────────────────────────────────────────────────
    return (
        <>
            {/* Backdrop */}
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(30,21,53,0.45)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Panel */}
                <div style={{
                    width: '100%',
                    maxWidth: 520,
                    maxHeight: '90vh',
                    background: C.surface,
                    borderRadius: 20,
                    boxShadow: '0 24px 64px rgba(117,48,251,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    margin: '0 16px',
                }}>

                    {/* ── Header ──────────────────────────────── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 22px',
                        borderBottom: `1px solid ${C.border}`,
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Bulk Upload Results
                        </span>
                        <button
                            onClick={onClose}
                            style={{
                                width: 30, height: 30, borderRadius: 8,
                                border: `1px solid ${C.border}`, background: C.bg,
                                color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* ── Scrollable body ──────────────────────── */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>

                        {/* ── Hero card ──────────────────────── */}
                        <div style={{
                            padding: '20px',
                            borderRadius: 14,
                            background: hero.bg,
                            border: `1px solid ${hero.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            marginBottom: 18,
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 14,
                                background: C.surface,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}>
                                {hero.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: C.dark, fontFamily: 'Syne, sans-serif', marginBottom: 3 }}>
                                    {hero.title}
                                </div>
                                <div style={{ fontSize: 13, color: C.secondary, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>
                                    {hero.sub}
                                </div>
                            </div>
                        </div>

                        {/* ── Stat cards ─────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                            {[
                                {
                                    value: clean.length,
                                    label: 'Created',
                                    icon: <CheckCircle2 size={16} style={{ color: C.success }} />,
                                    color: C.success, bg: C.successBg, border: C.successBorder,
                                    show: true,
                                },
                                {
                                    value: warnings.length,
                                    label: 'Warnings',
                                    icon: <AlertTriangle size={16} style={{ color: C.warning }} />,
                                    color: C.warning, bg: C.warningBg, border: C.warningBorder,
                                    show: true,
                                },
                                {
                                    value: failed.length,
                                    label: 'Failed',
                                    icon: <XCircle size={16} style={{ color: C.danger }} />,
                                    color: C.danger, bg: C.dangerBg, border: C.dangerBorder,
                                    show: true,
                                },
                            ].map(s => (
                                <div key={s.label} style={{
                                    padding: '12px',
                                    borderRadius: 12,
                                    background: s.value > 0 ? s.bg : C.bg,
                                    border: `1px solid ${s.value > 0 ? s.border : C.border}`,
                                    textAlign: 'center',
                                }}>
                                    <div style={{
                                        fontSize: 26, fontWeight: 800,
                                        color: s.value > 0 ? s.color : C.muted,
                                        fontFamily: 'Syne, sans-serif',
                                        lineHeight: 1,
                                        marginBottom: 4,
                                    }}>
                                        {s.value}
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 4,
                                    }}>
                                        {s.value > 0 && s.icon}
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            color: s.value > 0 ? s.color : C.muted,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                            {s.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Failed rows ─────────────────────── */}
                        {failed.length > 0 && (
                            <Section
                                title={`Failed (${failed.length})`}
                                color={C.danger}
                                bg={C.dangerBg}
                                border={C.dangerBorder}
                                icon={<XCircle size={13} style={{ color: C.danger }} />}
                                note="These rows were not saved. Fix the errors and re-upload."
                                mb={14}
                            >
                                {failed.map(row => (
                                    <RowLine
                                        key={row._rowIndex}
                                        index={row._rowIndex}
                                        label={label(row)}
                                        message={row._message}
                                        color={C.danger}
                                    />
                                ))}
                            </Section>
                        )}

                        {/* ── Warning rows ─────────────────────── */}
                        {warnings.length > 0 && (
                            <Section
                                title={`Needs Review (${warnings.length})`}
                                color={C.warning}
                                bg={C.warningBg}
                                border={C.warningBorder}
                                icon={<AlertTriangle size={13} style={{ color: C.warning }} />}
                                note="These listings were created but may need manual review before publishing."
                                mb={0}
                            >
                                {warnings.map(row => (
                                    <RowLine
                                        key={row._rowIndex}
                                        index={row._rowIndex}
                                        label={label(row)}
                                        message={row._message}
                                        color={C.warning}
                                    />
                                ))}
                            </Section>
                        )}
                    </div>

                    {/* ── Footer ───────────────────────────────── */}
                    <div style={{
                        padding: '14px 22px',
                        borderTop: `1px solid ${C.border}`,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        background: C.surface,
                        flexWrap: 'wrap',
                    }}>
                        {/* Retry failed */}
                        {partialFail ? (
                            <button
                                onClick={() => onRetry(failed)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 10,
                                    fontSize: 13, fontWeight: 600,
                                    border: `1px solid ${C.danger}44`,
                                    background: C.dangerBg, color: C.danger,
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                <RefreshCw size={13} />
                                Retry {failed.length} failed
                            </button>
                        ) : (
                            <div style={{ fontSize: 13, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                {created.length > 0
                                    ? `${created.length} draft${created.length !== 1 ? 's' : ''} ready to publish`
                                    : 'No listings were created'
                                }
                            </div>
                        )}

                        {/* View dashboard */}
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 20px', borderRadius: 10,
                                fontSize: 13, fontWeight: 700,
                                border: 'none',
                                background: created.length > 0 ? C.accent : C.border,
                                color: created.length > 0 ? C.accentText : C.muted,
                                cursor: 'pointer',
                                fontFamily: 'Syne, sans-serif',
                                boxShadow: created.length > 0 ? '0 4px 12px rgba(184,250,51,0.35)' : 'none',
                            }}
                        >
                            <Sparkles size={13} />
                            View in Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({
    title, color, bg, border, icon, note, children, mb,
}: {
    title: string
    color: string
    bg: string
    border: string
    icon: React.ReactNode
    note: string
    children: React.ReactNode
    mb: number
}) {
    return (
        <div style={{
            borderRadius: 12,
            border: `1px solid ${border}`,
            overflow: 'hidden',
            marginBottom: mb,
        }}>
            {/* Section header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 12px',
                background: bg,
                borderBottom: `1px solid ${border}`,
            }}>
                {icon}
                <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'DM Sans, sans-serif' }}>
                    {title}
                </span>
                <span style={{ fontSize: 11, color, opacity: 0.7, fontFamily: 'DM Sans, sans-serif', marginLeft: 2 }}>
                    — {note}
                </span>
            </div>
            {/* Rows */}
            <div style={{ background: '#fff' }}>
                {children}
            </div>
        </div>
    )
}

// ── Single row line ───────────────────────────────────────────
function RowLine({ index, label, message, color }: {
    index: number
    label: string
    message: string
    color: string
}) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '8px 12px',
            borderBottom: `1px solid #f5f3ff`,
        }}>
            <span style={{
                fontSize: 10, fontWeight: 700, color: '#9ca3af',
                background: '#f8f7ff', borderRadius: 4,
                padding: '2px 5px', marginTop: 1,
                fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
            }}>
                #{index}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 12, fontWeight: 500, color: '#1e1535',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontFamily: 'DM Sans, sans-serif',
                }}>
                    {label}
                </div>
                {message && (
                    <div style={{ fontSize: 11, color, marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
