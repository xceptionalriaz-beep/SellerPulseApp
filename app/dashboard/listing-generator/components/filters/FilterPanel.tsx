'use client'
// app/dashboard/listing-generator/components/filters/FilterPanel.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Main Filter Panel
//
// Opened via the "Filter" toolbar button.
// Two-column layout:
//   Left  — category list with field counts
//   Right — fields in the selected category; clicking a field
//            opens its operator + value UI in-panel.
//
// Props:
//   open          — whether panel is visible
//   onClose       — hide it
//   activeFilters — current active filters array
//   onApply       — add/update a filter
//   onClear       — remove one filter by colId
//   onClearAll    — remove all filters
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { X, SlidersHorizontal, Check, ChevronLeft } from 'lucide-react'
import {
    FILTER_FIELD_DEFS,
    OPERATORS,
    defaultOperator,
    type ActiveFilter,
    type FilterFieldDef,
} from '../../data/filter-definitions'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg:          '#f8f7ff',
    surface:     '#ffffff',
    border:      '#ede9fe',
    borderInput: '#e5e0f5',
    primary:     '#7530fb',
    primaryLight:'#f3eeff',
    dark:        '#1e1535',
    muted:       '#9ca3af',
    secondary:   '#6b7280',
    danger:      '#ef4444',
    dangerBg:    '#fee2e2',
    success:     '#16a34a',
}

// ── Field groups (left column) ────────────────────────────────
const FILTER_GROUPS: { id: string; label: string; colIds: string[] }[] = [
    {
        id: 'product',
        label: 'Product',
        colIds: ['product', 'condition', 'category', 'source', 'seller_type'],
    },
    {
        id: 'pricing',
        label: 'Pricing',
        colIds: ['price', 'margin', 'net_profit'],
    },
    {
        id: 'performance',
        label: 'Performance',
        colIds: ['health', 'vero', 'stock'],
    },
    {
        id: 'status',
        label: 'Status & Dates',
        colIds: ['status', 'date', 'updated'],
    },
    {
        id: 'identifiers',
        label: 'Identifiers',
        colIds: ['ids'],
    },
]

interface FilterPanelProps {
    open:          boolean
    onClose:       () => void
    activeFilters: ActiveFilter[]
    onApply:       (filter: Omit<ActiveFilter, 'id'>) => void
    onClear:       (colId: string) => void
    onClearAll:    () => void
}

// ── Inline field editor ───────────────────────────────────────
function FieldEditor({
    fieldDef,
    existing,
    onApply,
    onBack,
}: {
    fieldDef:  FilterFieldDef
    existing:  ActiveFilter | null
    onApply:   (filter: Omit<ActiveFilter, 'id'>) => void
    onBack:    () => void
}) {
    const operators  = OPERATORS[fieldDef.type]
    const [operator, setOperator] = useState(existing?.operator ?? defaultOperator(fieldDef.type))
    const [value,  setValue]  = useState<string | string[]>(
        existing ? String(existing.value ?? '') : ''
    )
    const [value2, setValue2] = useState<string>(
        existing?.value2 != null ? String(existing.value2) : ''
    )

    const currentOp = operators.find(o => o.value === operator)

    function handleApply() {
        const finalVal = fieldDef.type === 'number'
            ? (value === '' ? null : Number(value))
            : (Array.isArray(value) ? value : (value || null))
        const finalVal2 = value2 ? (fieldDef.type === 'number' ? Number(value2) : value2) : null
        onApply({ colId: fieldDef.colId, operator, value: finalVal, value2: finalVal2 ?? undefined })
        onBack()
    }

    function handleEnumToggle(optVal: string) {
        setValue(prev => {
            const arr = Array.isArray(prev) ? prev : (prev ? [prev] : [])
            return arr.includes(optVal) ? arr.filter(v => v !== optVal) : [...arr, optVal]
        })
    }

    const inputSt: React.CSSProperties = {
        width: '100%', height: 34, padding: '0 10px',
        borderRadius: 8, border: `1.5px solid ${C.borderInput}`,
        background: C.surface, color: C.dark, fontSize: 13,
        outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif',
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Editor header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <button type="button" onClick={onBack}
                    style={{ width: 26, height: 26, borderRadius: 6, border: `1.5px solid ${C.border}`, background: C.bg, color: C.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ChevronLeft size={13} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                    {fieldDef.label}
                </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Operators */}
                <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Condition</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {operators.map(op => (
                            <button key={op.value} type="button" onClick={() => setOperator(op.value)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '6px 8px', borderRadius: 7,
                                    background: operator === op.value ? C.primaryLight : 'transparent',
                                    border: operator === op.value ? `1.5px solid ${C.primary}33` : '1.5px solid transparent',
                                    cursor: 'pointer', textAlign: 'left',
                                }}
                            >
                                <span style={{
                                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                                    border: `2px solid ${operator === op.value ? C.primary : C.borderInput}`,
                                    background: operator === op.value ? C.primary : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {operator === op.value && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                                </span>
                                <span style={{ fontSize: 13, color: operator === op.value ? C.primary : C.dark, fontWeight: operator === op.value ? 600 : 400, fontFamily: 'DM Sans, sans-serif' }}>
                                    {op.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Value input */}
                {currentOp?.needsInput && (
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Value</p>
                        {fieldDef.type === 'enum' && fieldDef.options ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {fieldDef.options.map(opt => {
                                    const arr = Array.isArray(value) ? value : (value ? [value] : [])
                                    const checked = arr.includes(opt.value)
                                    return (
                                        <button key={opt.value} type="button" onClick={() => handleEnumToggle(opt.value)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '6px 8px', borderRadius: 7,
                                                background: checked ? C.primaryLight : C.bg,
                                                border: `1.5px solid ${checked ? C.primary + '44' : C.border}`,
                                                cursor: 'pointer', textAlign: 'left',
                                            }}
                                        >
                                            <span style={{
                                                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                                                border: `2px solid ${checked ? C.primary : C.borderInput}`,
                                                background: checked ? C.primary : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {checked && <Check size={9} style={{ color: '#fff', strokeWidth: 3 }} />}
                                            </span>
                                            <span style={{ fontSize: 13, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{opt.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : fieldDef.type === 'date' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input type="date" value={String(value)} onChange={e => setValue(e.target.value)} style={inputSt} />
                                {currentOp.needsTwo && <>
                                    <span style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>and</span>
                                    <input type="date" value={value2} onChange={e => setValue2(e.target.value)} style={inputSt} />
                                </>}
                            </div>
                        ) : fieldDef.type === 'number' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input type="number" value={String(value)} onChange={e => setValue(e.target.value)} placeholder="Value" style={inputSt} />
                                {currentOp.needsTwo && <>
                                    <span style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>and</span>
                                    <input type="number" value={value2} onChange={e => setValue2(e.target.value)} placeholder="Max" style={inputSt} />
                                </>}
                            </div>
                        ) : (
                            <input type="text" value={String(value)} onChange={e => setValue(e.target.value)} placeholder="Type to filter…" autoFocus style={inputSt} onKeyDown={e => { if (e.key === 'Enter') handleApply() }} />
                        )}
                    </div>
                )}
            </div>

            {/* Apply button */}
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                <button type="button" onClick={handleApply}
                    style={{
                        width: '100%', height: 36, borderRadius: 8, border: 'none',
                        background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    Apply Filter
                </button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
export function FilterPanel({
    open,
    onClose,
    activeFilters,
    onApply,
    onClear,
    onClearAll,
}: FilterPanelProps) {
    const [activeGroup, setActiveGroup] = useState(FILTER_GROUPS[0].id)
    const [editingColId, setEditingColId] = useState<string | null>(null)

    if (!open) return null

    const group       = FILTER_GROUPS.find(g => g.id === activeGroup)!
    const editingField = editingColId ? FILTER_FIELD_DEFS[editingColId] : null
    const existingFilter = (colId: string) => activeFilters.find(f => f.colId === colId) ?? null

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(30,21,53,0.15)' }}
            />

            {/* Panel */}
            <div style={{
                position:  'fixed',
                top:       0,
                left:      200,   // sits next to the segment sidebar (approx 200px)
                bottom:    0,
                width:     460,
                zIndex:    41,
                background: C.surface,
                borderRight: `1px solid ${C.border}`,
                boxShadow:  '8px 0 32px rgba(117,48,251,0.10)',
                display:   'flex',
                flexDirection: 'column',
                overflow:  'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 16px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SlidersHorizontal size={15} style={{ color: C.primary }} />
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>Filters</p>
                        {activeFilters.length > 0 && (
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                                background: C.primary, color: '#fff',
                            }}>{activeFilters.length}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {activeFilters.length > 0 && (
                            <button type="button" onClick={onClearAll}
                                style={{
                                    height: 28, padding: '0 10px', borderRadius: 7,
                                    border: `1.5px solid ${C.border}`, background: C.bg,
                                    color: C.secondary, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                }}
                            >Clear all</button>
                        )}
                        <button type="button" onClick={onClose}
                            style={{
                                width: 28, height: 28, borderRadius: 7, border: 'none',
                                background: C.bg, color: C.muted, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        ><X size={14} /></button>
                    </div>
                </div>

                {/* Active filter chips */}
                {activeFilters.length > 0 && !editingColId && (
                    <div style={{ padding: '8px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
                        {activeFilters.map(f => {
                            const fd = FILTER_FIELD_DEFS[f.colId]
                            return (
                                <span key={f.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '3px 8px 3px 10px', borderRadius: 20,
                                    background: C.primaryLight, border: `1px solid ${C.primary}33`,
                                    fontSize: 11, color: C.primary, fontWeight: 600,
                                    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                                }}
                                    onClick={() => setEditingColId(f.colId)}
                                >
                                    {fd?.label}
                                    <button type="button" onClick={e => { e.stopPropagation(); onClear(f.colId) }}
                                        style={{ width: 14, height: 14, borderRadius: '50%', border: 'none', background: C.primary + '33', color: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                    ><X size={8} /></button>
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Body */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                    {editingField ? (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <FieldEditor
                                fieldDef={editingField}
                                existing={existingFilter(editingColId!)}
                                onApply={onApply}
                                onBack={() => setEditingColId(null)}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Left: category list */}
                            <div style={{
                                width: 160, flexShrink: 0, borderRight: `1px solid ${C.border}`,
                                overflowY: 'auto', padding: '8px 0',
                            }}>
                                {FILTER_GROUPS.map(g => {
                                    const activeCount = activeFilters.filter(f => g.colIds.includes(f.colId)).length
                                    const isActive    = activeGroup === g.id
                                    return (
                                        <button key={g.id} type="button" onClick={() => setActiveGroup(g.id)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between', gap: 6,
                                                padding: '9px 14px',
                                                background: isActive ? C.primaryLight : 'transparent',
                                                borderLeft: `3px solid ${isActive ? C.primary : 'transparent'}`,
                                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                            }}
                                        >
                                            <span style={{ fontSize: 13, color: isActive ? C.primary : C.dark, fontWeight: isActive ? 700 : 400, fontFamily: 'DM Sans, sans-serif' }}>
                                                {g.label}
                                            </span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, minWidth: 18, textAlign: 'center',
                                                padding: '1px 5px', borderRadius: 20,
                                                background: activeCount > 0 ? C.primary : C.bg,
                                                color:      activeCount > 0 ? '#fff'    : C.muted,
                                            }}>
                                                {activeCount > 0 ? activeCount : g.colIds.length}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Right: fields in selected group */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                                {group.colIds.map(colId => {
                                    const fd     = FILTER_FIELD_DEFS[colId]
                                    const active = existingFilter(colId)
                                    if (!fd) return null
                                    return (
                                        <button key={colId} type="button" onClick={() => setEditingColId(colId)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between', gap: 8,
                                                padding: '10px 16px',
                                                background: active ? C.primaryLight : 'transparent',
                                                border: 'none', borderBottom: `1px solid ${C.border}`,
                                                cursor: 'pointer', textAlign: 'left',
                                            }}
                                        >
                                            <span style={{ fontSize: 13, color: C.dark, fontFamily: 'DM Sans, sans-serif', fontWeight: active ? 600 : 400 }}>
                                                {fd.label}
                                            </span>
                                            {active ? (
                                                <span style={{
                                                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                                                    background: C.primary, color: '#fff', fontWeight: 700,
                                                }}>Active</span>
                                            ) : (
                                                <span style={{ fontSize: 11, color: C.muted }}>{OPERATORS[fd.type].length} ops</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
