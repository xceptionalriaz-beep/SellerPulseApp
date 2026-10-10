'use client'
// app/dashboard/listing-generator/components/segments/FilterRow.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Segment Builder: single filter condition row
//
// Renders:  [Field ▾]  [Operator ▾]  [Value input]  [✕]
// • Operator list is scoped to the chosen field
// • Value input adapts: select for enum fields, date for created_at,
//   number for numeric fields, text for strings,
//   hidden for is_empty / is_not_empty
// • For 'between': two value inputs separated by "and"
// ─────────────────────────────────────────────────────────────

import { X } from 'lucide-react'

import type { SegmentFilter, FilterField, FilterOperator } from '../../types/segments.types'
import {
    FILTER_FIELD_LABELS,
    FIELD_OPERATORS,
    OPERATOR_LABELS,
    FIELD_OPTIONS,
} from '../../types/segments.types'

import ProDropdown from '@/components/ui/ProDropdown'
import type { DropdownOption } from '@/components/ui/ProDropdown'

// ── Design tokens (mirrors LgDashboard) ──────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    muted: '#9ca3af',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

// ── Shared input/select style ─────────────────────────────────
const inputStyle: React.CSSProperties = {
    height: 32,
    padding: '0 10px',
    borderRadius: 8,
    border: `1.5px solid ${C.borderInput}`,
    background: C.surface,
    color: C.dark,
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
}

// ── Field types for deciding which value input to show ────────
type FieldKind = 'enum' | 'number' | 'date' | 'text'

function getFieldKind(field: FilterField): FieldKind {
    if (FIELD_OPTIONS[field]) return 'enum'
    if (['health_score', 'margin', 'sell_price', 'net_profit'].includes(field)) return 'number'
    if (field === 'created_at') return 'date'
    return 'text'
}

// ── Props ─────────────────────────────────────────────────────
interface FilterRowProps {
    filter: SegmentFilter
    index: number
    onChange: (index: number, updated: SegmentFilter) => void
    onRemove: (index: number) => void
}

// ─────────────────────────────────────────────────────────────
export function FilterRow({ filter, index, onChange, onRemove }: FilterRowProps) {

    const kind = getFieldKind(filter.field)
    const operators = FIELD_OPERATORS[filter.field]
    const options = FIELD_OPTIONS[filter.field]
    const noValue = filter.op === 'is_empty' || filter.op === 'is_not_empty'
    const isBetween = filter.op === 'between'

    // ── Handlers ─────────────────────────────────────────────

    function handleFieldChange(field: FilterField) {
        // Reset op + values when field changes
        const newOps = FIELD_OPERATORS[field]
        onChange(index, {
            field,
            op: newOps[0],
            value: undefined,
            value2: undefined,
        })
    }

    function handleOpChange(op: FilterOperator) {
        onChange(index, { ...filter, op, value2: undefined })
    }

    function handleValue(val: string) {
        const kind = getFieldKind(filter.field)
        const cast = kind === 'number' ? (val === '' ? undefined : Number(val)) : val
        onChange(index, { ...filter, value: cast as any })
    }

    function handleValue2(val: string) {
        const kind = getFieldKind(filter.field)
        const cast = kind === 'number' ? (val === '' ? undefined : Number(val)) : val
        onChange(index, { ...filter, value2: cast as any })
    }

    // ── Value input (single) ──────────────────────────────────
    function ValueInput({ val, onVal }: { val?: string | number; onVal: (v: string) => void }) {
        if (kind === 'enum' && options) {
            return (
                <select
                    value={String(val ?? '')}
                    onChange={e => onVal(e.target.value)}
                    style={inputStyle}
                >
                    <option value="" disabled>Select…</option>
                    {options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            )
        }
        if (kind === 'date') {
            return (
                <input
                    type="date"
                    value={val ? String(val).slice(0, 10) : ''}
                    onChange={e => onVal(e.target.value)}
                    style={inputStyle}
                />
            )
        }
        if (kind === 'number') {
            return (
                <input
                    type="number"
                    value={val ?? ''}
                    onChange={e => onVal(e.target.value)}
                    placeholder="0"
                    style={inputStyle}
                />
            )
        }
        return (
            <input
                type="text"
                value={String(val ?? '')}
                onChange={e => onVal(e.target.value)}
                placeholder="Value…"
                style={inputStyle}
            />
        )
    }

    // ─────────────────────────────────────────────────────────
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
                background: C.bg,
                border: `1.5px solid ${C.border}`,
            }}
        >
            {/* ── Field selector ──────────────────────────── */}
            <div style={{ flex: '0 0 auto', minWidth: 140 }}>
                <ProDropdown
                    prefix=""
                    currentValue={filter.field}
                    options={(Object.keys(FILTER_FIELD_LABELS) as FilterField[]).map(f => ({
                        val: f,
                        label: FILTER_FIELD_LABELS[f],
                        enabled: true,
                    } as DropdownOption))}
                    onChanged={v => handleFieldChange(v as FilterField)}
                    width="full"
                    maxItems={12}
                />
            </div>

            {/* ── Operator selector ────────────────────────── */}
            <div style={{ flex: '0 0 auto', minWidth: 120 }}>
                <ProDropdown
                    prefix=""
                    currentValue={filter.op}
                    options={operators.map(op => ({
                        val: op,
                        label: OPERATOR_LABELS[op],
                        enabled: true,
                    } as DropdownOption))}
                    onChanged={v => handleOpChange(v as FilterOperator)}
                    width="full"
                    maxItems={8}
                />
            </div>

            {/* ── Value input(s) ───────────────────────────── */}
            {!noValue && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <ValueInput val={filter.value as any} onVal={handleValue} />
                    </div>

                    {isBetween && (
                        <>
                            <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>and</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <ValueInput val={filter.value2 as any} onVal={handleValue2} />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Spacer when no value input */}
            {noValue && <div style={{ flex: 1 }} />}

            {/* ── Remove button ────────────────────────────── */}
            <button
                type="button"
                onClick={() => onRemove(index)}
                title="Remove filter"
                style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: C.muted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                    ; (e.currentTarget as HTMLButtonElement).style.background = C.dangerBg
                        ; (e.currentTarget as HTMLButtonElement).style.color = C.danger
                }}
                onMouseLeave={e => {
                    ; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                        ; (e.currentTarget as HTMLButtonElement).style.color = C.muted
                }}
            >
                <X size={13} />
            </button>
        </div>
    )
}
