'use client'
// app/dashboard/listing-generator/components/filters/ColumnFilterPopover.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Per-column filter popover
//
// Appears anchored below a column header filter icon.
// Shows operator radio list + value input appropriate for the
// column's type (text, number, enum, date).
//
// Props:
//   colId       — which column this is for
//   activeFilter— current ActiveFilter for this column (if any)
//   onApply     — save a new/updated filter
//   onClear     — remove the filter for this column
//   onClose     — close without saving
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { X, Check } from 'lucide-react'
import {
    FILTER_FIELD_DEFS,
    OPERATORS,
    defaultOperator,
    type ActiveFilter,
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
}

interface ColumnFilterPopoverProps {
    colId:        string
    activeFilter: ActiveFilter | null
    onApply:      (filter: Omit<ActiveFilter, 'id'>) => void
    onClear:      () => void
    onClose:      () => void
}

export function ColumnFilterPopover({
    colId,
    activeFilter,
    onApply,
    onClear,
    onClose,
}: ColumnFilterPopoverProps) {
    const fieldDef = FILTER_FIELD_DEFS[colId]
    if (!fieldDef) return null

    const operators = OPERATORS[fieldDef.type]

    // ── Local state ───────────────────────────────────────────
    const [operator, setOperator] = useState(
        activeFilter?.operator ?? defaultOperator(fieldDef.type)
    )
    const [value,  setValue]  = useState<string | string[]>(
        activeFilter ? String(activeFilter.value ?? '') : ''
    )
    const [value2, setValue2] = useState<string>(
        activeFilter?.value2 != null ? String(activeFilter.value2) : ''
    )

    const containerRef = useRef<HTMLDivElement>(null)
    const currentOp    = operators.find(o => o.value === operator)

    // Reset value when operator changes to a no-input one
    useEffect(() => {
        if (currentOp && !currentOp.needsInput) {
            setValue('')
            setValue2('')
        }
    }, [operator, currentOp])

    // Close on outside click
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [onClose])

    function handleApply() {
        const finalVal = fieldDef.type === 'number'
            ? (value === '' ? null : Number(value))
            : (Array.isArray(value) ? value : (value || null))
        const finalVal2 = value2 ? (fieldDef.type === 'number' ? Number(value2) : value2) : null
        onApply({ colId, operator, value: finalVal, value2: finalVal2 ?? undefined })
    }

    function handleEnumToggle(optVal: string) {
        setValue(prev => {
            const arr = Array.isArray(prev) ? prev : (prev ? [prev] : [])
            return arr.includes(optVal) ? arr.filter(v => v !== optVal) : [...arr, optVal]
        })
    }

    // ── Shared input style ────────────────────────────────────
    const inputSt: React.CSSProperties = {
        width:        '100%',
        height:       32,
        padding:      '0 10px',
        borderRadius: 7,
        border:       `1.5px solid ${C.borderInput}`,
        background:   C.surface,
        color:        C.dark,
        fontSize:     13,
        outline:      'none',
        boxSizing:    'border-box',
        fontFamily:   'DM Sans, sans-serif',
    }

    // ─────────────────────────────────────────────────────────
    return (
        <div
            ref={containerRef}
            style={{
                position:     'absolute',
                top:          '100%',
                left:         0,
                zIndex:       200,
                width:        220,
                marginTop:    4,
                background:   C.surface,
                borderRadius: 12,
                border:       `1.5px solid ${C.border}`,
                boxShadow:    '0 8px 32px rgba(117,48,251,0.14)',
                overflow:     'hidden',
            }}
        >
            {/* Header */}
            <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '10px 12px 8px',
                borderBottom:   `1px solid ${C.border}`,
            }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                    Filter: {fieldDef.label}
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: 20, height: 20, borderRadius: 5,
                        border: 'none', background: 'transparent',
                        color: C.muted, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                ><X size={12} /></button>
            </div>

            {/* Operator list */}
            <div style={{ padding: '8px 0' }}>
                {operators.map(op => (
                    <button
                        key={op.value}
                        type="button"
                        onClick={() => setOperator(op.value)}
                        style={{
                            width:      '100%',
                            display:    'flex',
                            alignItems: 'center',
                            gap:        8,
                            padding:    '6px 12px',
                            background: 'transparent',
                            border:     'none',
                            cursor:     'pointer',
                            textAlign:  'left',
                        }}
                    >
                        {/* Radio dot */}
                        <span style={{
                            width:       14,
                            height:      14,
                            borderRadius:'50%',
                            border:      `2px solid ${operator === op.value ? C.primary : C.borderInput}`,
                            background:  operator === op.value ? C.primary : 'transparent',
                            flexShrink:  0,
                            display:     'flex',
                            alignItems:  'center',
                            justifyContent: 'center',
                        }}>
                            {operator === op.value && (
                                <span style={{
                                    width: 5, height: 5,
                                    borderRadius: '50%',
                                    background: '#fff',
                                }} />
                            )}
                        </span>
                        <span style={{ fontSize: 13, color: operator === op.value ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif', fontWeight: operator === op.value ? 600 : 400 }}>
                            {op.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Value input area */}
            {currentOp?.needsInput && (
                <div style={{ padding: '8px 12px', borderTop: `1px solid ${C.border}` }}>
                    {/* Enum: multi-select checkboxes */}
                    {fieldDef.type === 'enum' && fieldDef.options ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {fieldDef.options.map(opt => {
                                const arr = Array.isArray(value) ? value : (value ? [value] : [])
                                const checked = arr.includes(opt.value)
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleEnumToggle(opt.value)}
                                        style={{
                                            display:    'flex',
                                            alignItems: 'center',
                                            gap:        8,
                                            padding:    '4px 6px',
                                            background: checked ? C.primaryLight : 'transparent',
                                            borderRadius: 6,
                                            border:     'none',
                                            cursor:     'pointer',
                                            textAlign:  'left',
                                        }}
                                    >
                                        <span style={{
                                            width: 14, height: 14, borderRadius: 3,
                                            border: `2px solid ${checked ? C.primary : C.borderInput}`,
                                            background: checked ? C.primary : 'transparent',
                                            flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {checked && <Check size={9} style={{ color: '#fff', strokeWidth: 3 }} />}
                                        </span>
                                        <span style={{ fontSize: 12, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                            {opt.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    ) : fieldDef.type === 'date' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <input
                                type="date"
                                value={String(value)}
                                onChange={e => setValue(e.target.value)}
                                style={inputSt}
                            />
                            {currentOp.needsTwo && (
                                <>
                                    <span style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>and</span>
                                    <input
                                        type="date"
                                        value={value2}
                                        onChange={e => setValue2(e.target.value)}
                                        style={inputSt}
                                    />
                                </>
                            )}
                        </div>
                    ) : fieldDef.type === 'number' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <input
                                type="number"
                                value={String(value)}
                                onChange={e => setValue(e.target.value)}
                                placeholder="Value"
                                style={inputSt}
                            />
                            {currentOp.needsTwo && (
                                <>
                                    <span style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>and</span>
                                    <input
                                        type="number"
                                        value={value2}
                                        onChange={e => setValue2(e.target.value)}
                                        placeholder="Max"
                                        style={inputSt}
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={String(value)}
                            onChange={e => setValue(e.target.value)}
                            placeholder="Type to filter…"
                            autoFocus
                            style={inputSt}
                            onKeyDown={e => { if (e.key === 'Enter') handleApply() }}
                        />
                    )}
                </div>
            )}

            {/* Footer: Back / Add */}
            <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                padding:        '8px 12px',
                borderTop:      `1px solid ${C.border}`,
                gap:            8,
            }}>
                <button
                    type="button"
                    onClick={() => { onClear(); onClose() }}
                    style={{
                        flex:         1,
                        height:       30,
                        borderRadius: 7,
                        border:       `1.5px solid ${C.border}`,
                        background:   C.bg,
                        color:        C.secondary,
                        fontSize:     12,
                        fontWeight:   600,
                        cursor:       'pointer',
                        fontFamily:   'DM Sans, sans-serif',
                    }}
                >
                    {activeFilter ? 'Clear' : 'Back'}
                </button>
                <button
                    type="button"
                    onClick={() => { handleApply(); onClose() }}
                    style={{
                        flex:         1,
                        height:       30,
                        borderRadius: 7,
                        border:       'none',
                        background:   C.primary,
                        color:        '#fff',
                        fontSize:     12,
                        fontWeight:   700,
                        cursor:       'pointer',
                        fontFamily:   'DM Sans, sans-serif',
                    }}
                >
                    Add
                </button>
            </div>
        </div>
    )
}
