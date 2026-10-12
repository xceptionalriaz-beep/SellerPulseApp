'use client'
// components/ui/VariationBuilder.tsx
//
// Variation Builder for eBay multi-variation listings.
// Lets seller define dimensions (Size, Colour, etc.) with values,
// auto-generates all combinations, and lets them set price/qty/SKU per row.

import { useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Shuffle, Tag, Package, Hash, ToggleLeft, ToggleRight } from 'lucide-react'
import type { VariationConfig, VariationDimension, VariationRow } from '@/app/dashboard/listing-generator/types/listing.types'

// ── Color tokens — Riazify v2 ───────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryHover: '#6020e0',
    accent: '#b8fa33',
    dark: '#1e1535',
    border: '#ede9fe',
    borderInput: '#d1d5db',
    surface: '#ffffff',
    bg: '#f8f7ff',
    body: '#1e1535',
    muted: '#6b7280',
    txt3: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px',
    borderRadius: 8, border: `1.5px solid ${C.borderInput}`,
    fontSize: 12, color: C.body, backgroundColor: C.surface,
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    transition: 'border-color 0.15s',
}

// ── Helpers ────────────────────────────────────────────────────────────
function generateCombinations(dimensions: VariationDimension[]): Record<string, string>[] {
    if (dimensions.length === 0) return []
    const active = dimensions.filter(d => d.name.trim() && d.values.length > 0)
    if (active.length === 0) return []

    let combos: Record<string, string>[] = [{}]
    for (const dim of active) {
        const expanded: Record<string, string>[] = []
        for (const combo of combos) {
            for (const val of dim.values) {
                expanded.push({ ...combo, [dim.name]: val })
            }
        }
        combos = expanded
    }
    return combos
}

function comboKey(combo: Record<string, string>) {
    return Object.entries(combo).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|')
}

interface Props {
    value: VariationConfig | null
    onChange: (config: VariationConfig) => void
    basePrice?: number | null
}

export default function VariationBuilder({ value, onChange, basePrice }: Props) {
    const [dimensions, setDimensions] = useState<VariationDimension[]>(
        value?.dimensions ?? [{ name: 'Size', values: [] }]
    )
    const [rows, setRows] = useState<VariationRow[]>(value?.rows ?? [])
    const [dimInput, setDimInput] = useState<Record<number, string>>({})  // raw value text per dimension
    const [collapsed, setCollapsed] = useState(false)

    // Sync from parent when value changes externally
    useEffect(() => {
        if (value) {
            setDimensions(value.dimensions)
            setRows(value.rows)
            // Rebuild dimInput from stored values
            const inputs: Record<number, string> = {}
            value.dimensions.forEach((d, i) => { inputs[i] = d.values.join(', ') })
            setDimInput(inputs)
        }
    }, []) // Only on mount — parent drives subsequent changes via onChange

    // ── Rebuild rows when dimensions change ───────────────────────────────
    const rebuildRows = useCallback((dims: VariationDimension[], existingRows: VariationRow[]) => {
        const combos = generateCombinations(dims)
        const existingMap = new Map(existingRows.map(r => [comboKey(r.combo), r]))

        const newRows: VariationRow[] = combos.map(combo => {
            const key = comboKey(combo)
            const existing = existingMap.get(key)
            return existing
                ? { ...existing, combo }
                : {
                    id: crypto.randomUUID(),
                    combo,
                    price: basePrice ?? null,
                    quantity: 0,
                    sku: '',
                    enabled: true,
                }
        })
        return newRows
    }, [basePrice])

    // ── Dimension: add / remove / update name ─────────────────────────────
    function addDimension() {
        const newDims = [...dimensions, { name: '', values: [] }]
        const newRows = rebuildRows(newDims, rows)
        setDimensions(newDims)
        setRows(newRows)
        notify(newDims, newRows)
    }

    function removeDimension(idx: number) {
        const newDims = dimensions.filter((_, i) => i !== idx)
        const newRows = rebuildRows(newDims, rows)
        setDimensions(newDims)
        setRows(newRows)
        setDimInput(prev => {
            const next = { ...prev }
            delete next[idx]
            return next
        })
        notify(newDims, newRows)
    }

    function updateDimName(idx: number, name: string) {
        const newDims = dimensions.map((d, i) => i === idx ? { ...d, name } : d)
        const newRows = rebuildRows(newDims, rows)
        setDimensions(newDims)
        setRows(newRows)
        notify(newDims, newRows)
    }

    function updateDimValues(idx: number, raw: string) {
        setDimInput(prev => ({ ...prev, [idx]: raw }))
        const values = raw.split(',').map(v => v.trim()).filter(Boolean)
        const newDims = dimensions.map((d, i) => i === idx ? { ...d, values } : d)
        const newRows = rebuildRows(newDims, rows)
        setDimensions(newDims)
        setRows(newRows)
        notify(newDims, newRows)
    }

    // ── Row updates ────────────────────────────────────────────────────────
    function updateRow(id: string, patch: Partial<VariationRow>) {
        const newRows = rows.map(r => r.id === id ? { ...r, ...patch } : r)
        setRows(newRows)
        notify(dimensions, newRows)
    }

    function notify(dims: VariationDimension[], rs: VariationRow[]) {
        onChange({ dimensions: dims, rows: rs })
    }

    // ── Quick actions ──────────────────────────────────────────────────────
    function enableAll() { const r = rows.map(r => ({ ...r, enabled: true })); setRows(r); notify(dimensions, r) }
    function disableAll() { const r = rows.map(r => ({ ...r, enabled: false })); setRows(r); notify(dimensions, r) }
    function applyBasePrice() {
        if (!basePrice) return
        const r = rows.map(r => ({ ...r, price: basePrice }))
        setRows(r); notify(dimensions, r)
    }

    const enabledCount = rows.filter(r => r.enabled).length
    const totalQty = rows.filter(r => r.enabled).reduce((s, r) => s + (r.quantity || 0), 0)

    // ── DIMENSION SUGGESTIONS ─────────────────────────────────────────────
    const DIM_PRESETS: Record<string, string[]> = {
        'Size': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        'Colour': ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Grey'],
        'Material': ['Cotton', 'Polyester', 'Leather', 'Wool', 'Silk', 'Denim'],
        'Style': ['Classic', 'Modern', 'Vintage', 'Casual', 'Formal'],
    }

    return (
        <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: `1.5px solid ${C.primary}30`,
            backgroundColor: C.surface,
            fontFamily: 'DM Sans, sans-serif',
        }}>
            {/* ── Header ──────────────────────────────────────────────── */}
            <div
                style={{
                    padding: '12px 16px',
                    backgroundColor: C.primaryLight,
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer',
                }}
                onClick={() => setCollapsed(c => !c)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shuffle size={15} style={{ color: C.primary }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
                        Variation Builder
                    </span>
                    {rows.length > 0 && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                            backgroundColor: C.primary, color: '#fff',
                        }}>
                            {enabledCount} combo{enabledCount !== 1 ? 's' : ''}
                        </span>
                    )}
                    {totalQty > 0 && (
                        <span style={{ fontSize: 11, color: C.muted }}>· {totalQty} total stock</span>
                    )}
                </div>
                {collapsed ? <ChevronDown size={15} style={{ color: C.primary }} /> : <ChevronUp size={15} style={{ color: C.primary }} />}
            </div>

            {!collapsed && (
                <div style={{ padding: '14px 16px' }}>
                    {/* ── Dimensions ────────────────────────────────────── */}
                    <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                            Dimensions
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {dimensions.map((dim, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {/* Dimension name */}
                                        <div style={{ position: 'relative', flex: '0 0 110px' }}>
                                            <select
                                                value={DIM_PRESETS[dim.name] ? dim.name : 'custom'}
                                                onChange={e => {
                                                    const selected = e.target.value
                                                    if (selected !== 'custom') {
                                                        updateDimName(idx, selected)
                                                        if (!dimInput[idx]) {
                                                            updateDimValues(idx, DIM_PRESETS[selected].join(', '))
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    ...inputStyle, width: '100%', paddingRight: 24, cursor: 'pointer',
                                                    appearance: 'none',
                                                }}
                                            >
                                                {Object.keys(DIM_PRESETS).map(p => <option key={p} value={p}>{p}</option>)}
                                                <option value="custom">Custom…</option>
                                            </select>
                                        </div>
                                        {/* Name input (for custom or to override) */}
                                        <input
                                            type="text"
                                            value={dim.name}
                                            onChange={e => updateDimName(idx, e.target.value)}
                                            placeholder="e.g. Size"
                                            style={{ ...inputStyle, flex: '0 0 90px' }}
                                            onFocus={e => e.target.style.borderColor = C.primary}
                                            onBlur={e => e.target.style.borderColor = C.borderInput}
                                        />
                                        {/* Values (comma-separated) */}
                                        <input
                                            type="text"
                                            value={dimInput[idx] ?? dim.values.join(', ')}
                                            onChange={e => updateDimValues(idx, e.target.value)}
                                            placeholder="S, M, L, XL (comma-separated)"
                                            style={{ ...inputStyle, flex: 1 }}
                                            onFocus={e => e.target.style.borderColor = C.primary}
                                            onBlur={e => e.target.style.borderColor = C.borderInput}
                                        />
                                        {/* Remove */}
                                        {dimensions.length > 1 && (
                                            <button
                                                onClick={() => removeDimension(idx)}
                                                style={{
                                                    width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.danger}40`,
                                                    backgroundColor: C.dangerBg, color: C.danger,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', flexShrink: 0,
                                                }}>
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                    {/* Preset chips for selected dimension */}
                                    {DIM_PRESETS[dim.name] && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 2 }}>
                                            {DIM_PRESETS[dim.name].map(preset => {
                                                const active = dim.values.includes(preset)
                                                return (
                                                    <button
                                                        key={preset}
                                                        onClick={() => {
                                                            const newVals = active
                                                                ? dim.values.filter(v => v !== preset)
                                                                : [...dim.values, preset]
                                                            const raw = newVals.join(', ')
                                                            updateDimValues(idx, raw)
                                                        }}
                                                        style={{
                                                            padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                                                            border: `1px solid ${active ? C.primary : C.border}`,
                                                            backgroundColor: active ? C.primary : C.bg,
                                                            color: active ? '#fff' : C.muted,
                                                            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                                            transition: 'all 0.1s',
                                                        }}>
                                                        {preset}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {dimensions.length < 3 && (
                            <button
                                onClick={addDimension}
                                style={{
                                    marginTop: 8, display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', borderRadius: 8,
                                    border: `1.5px dashed ${C.primary}60`,
                                    backgroundColor: 'transparent', color: C.primary,
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>
                                <Plus size={13} /> Add Dimension
                            </button>
                        )}
                    </div>

                    {/* ── Combinations matrix ────────────────────────────── */}
                    {rows.length > 0 && (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: 8,
                            }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: 0, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                    Combinations ({rows.length})
                                </p>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {basePrice && (
                                        <button onClick={applyBasePrice} style={{
                                            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                                            border: `1px solid ${C.border}`, backgroundColor: C.bg,
                                            color: C.muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                            <Tag size={9} style={{ display: 'inline', marginRight: 3 }} />Apply base price
                                        </button>
                                    )}
                                    <button onClick={enableAll} style={{
                                        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                                        border: `1px solid ${C.border}`, backgroundColor: C.bg,
                                        color: C.muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                    }}>Enable all</button>
                                    <button onClick={disableAll} style={{
                                        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                                        border: `1px solid ${C.border}`, backgroundColor: C.bg,
                                        color: C.muted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                    }}>Disable all</button>
                                </div>
                            </div>

                            {/* Table header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 80px 70px 90px 32px',
                                gap: 4, padding: '6px 8px',
                                backgroundColor: C.bg,
                                borderRadius: '8px 8px 0 0',
                                border: `1px solid ${C.border}`,
                                borderBottom: 'none',
                            }}>
                                {['Variation', 'Price', 'Stock', 'SKU', ''].map(h => (
                                    <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.4px' }}>
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {/* Rows */}
                            <div style={{
                                border: `1px solid ${C.border}`,
                                borderRadius: '0 0 8px 8px',
                                overflow: 'hidden',
                                maxHeight: 300, overflowY: 'auto',
                            }}>
                                {rows.map((row, rowIdx) => (
                                    <div
                                        key={row.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 80px 70px 90px 32px',
                                            gap: 4, padding: '6px 8px',
                                            backgroundColor: row.enabled ? C.surface : '#f9fafb',
                                            borderBottom: rowIdx < rows.length - 1 ? `1px solid ${C.border}` : 'none',
                                            opacity: row.enabled ? 1 : 0.5,
                                            transition: 'opacity 0.15s, background-color 0.15s',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {/* Combo label */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                                            <div style={{
                                                width: 6, height: 6, borderRadius: 2, flexShrink: 0,
                                                backgroundColor: row.enabled ? C.primary : C.txt3,
                                            }} />
                                            <span style={{
                                                fontSize: 12, fontWeight: 600, color: C.body,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {Object.values(row.combo).join(' / ')}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.muted }}>£</span>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={row.price ?? ''}
                                                onChange={e => updateRow(row.id, { price: e.target.value ? Number(e.target.value) : null })}
                                                placeholder={basePrice ? String(basePrice) : '0.00'}
                                                style={{ ...inputStyle, paddingLeft: 18, fontSize: 12 }}
                                                onFocus={e => e.target.style.borderColor = C.primary}
                                                onBlur={e => e.target.style.borderColor = C.borderInput}
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <input
                                            type="number"
                                            min={0}
                                            value={row.quantity}
                                            onChange={e => updateRow(row.id, { quantity: Math.max(0, Number(e.target.value)) })}
                                            style={{ ...inputStyle, fontSize: 12, textAlign: 'center' }}
                                            onFocus={e => e.target.style.borderColor = C.primary}
                                            onBlur={e => e.target.style.borderColor = C.borderInput}
                                        />

                                        {/* SKU */}
                                        <input
                                            type="text"
                                            value={row.sku}
                                            onChange={e => updateRow(row.id, { sku: e.target.value })}
                                            placeholder="SKU"
                                            style={{ ...inputStyle, fontSize: 11 }}
                                            onFocus={e => e.target.style.borderColor = C.primary}
                                            onBlur={e => e.target.style.borderColor = C.borderInput}
                                        />

                                        {/* Toggle enabled */}
                                        <button
                                            onClick={() => updateRow(row.id, { enabled: !row.enabled })}
                                            title={row.enabled ? 'Disable this variation' : 'Enable this variation'}
                                            style={{
                                                width: 28, height: 28, borderRadius: 7,
                                                border: `1px solid ${row.enabled ? C.primary + '50' : C.border}`,
                                                backgroundColor: row.enabled ? C.primaryLight : C.bg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', flexShrink: 0,
                                            }}>
                                            {row.enabled
                                                ? <ToggleRight size={14} style={{ color: C.primary }} />
                                                : <ToggleLeft size={14} style={{ color: C.txt3 }} />}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Summary row */}
                            <div style={{
                                marginTop: 8, padding: '8px 12px',
                                backgroundColor: C.bg, borderRadius: 8,
                                display: 'flex', gap: 16, flexWrap: 'wrap',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Shuffle size={11} style={{ color: C.primary }} />
                                    <span style={{ fontSize: 11, color: C.muted }}>
                                        <strong style={{ color: C.body }}>{enabledCount}</strong> / {rows.length} enabled
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Package size={11} style={{ color: C.primary }} />
                                    <span style={{ fontSize: 11, color: C.muted }}>
                                        <strong style={{ color: C.body }}>{totalQty}</strong> total stock
                                    </span>
                                </div>
                                {rows.some(r => r.price != null && r.price > 0) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Tag size={11} style={{ color: C.primary }} />
                                        <span style={{ fontSize: 11, color: C.muted }}>
                                            £{Math.min(...rows.filter(r => r.price).map(r => r.price!))} – £{Math.max(...rows.filter(r => r.price).map(r => r.price!))} range
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {rows.length === 0 && dimensions.some(d => d.name && d.values.length > 0) && (
                        <div style={{ padding: '12px', textAlign: 'center', color: C.muted, fontSize: 12 }}>
                            No combinations yet — add values to a dimension above.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
