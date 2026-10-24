'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Wand2, Loader2, Sparkles, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getCreditCost, AI_ACTIONS, DEFAULT_CREDIT_COSTS } from '@/lib/ai/credit-actions'
import type { Block, BlockProps } from '@/components/ui/VisualEditor/blocks'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIQuickFillPopoverProps {
    /** 'single' = fill only the selectedBlock; 'all' = fill all blocks */
    mode: 'single' | 'all'
    /** The selected block (used in single mode; also first fallback in all mode) */
    block: Block
    /** All blocks on the canvas (for context + bulk fill) */
    allBlocks: Block[]
    templateCategory?: string
    creditBalance: number | null
    /** Live credit cost passed from parent (parent fetches once on open) */
    creditCost: number
    onUpdateBlocks: (updates: Array<{ id: string; props: BlockProps }>) => void
    onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Count changed fields between original props and flat AI result */
function countChanges(
    original: Record<string, unknown>,
    updated: Record<string, string>,
    prefix = ''
): number {
    let count = 0
    for (const [k, v] of Object.entries(updated)) {
        const key = prefix ? `${prefix}.${k}` : k
        const origVal = String((original as any)[key] ?? '')
        if (origVal !== v) count++
    }
    return count
}

/** Deep-apply flat { "a.b[0].c": "val" } AI results back into nested block props */
function applyFlatResult(
    props: Record<string, unknown>,
    flat: Record<string, string>
): BlockProps {
    const result = JSON.parse(JSON.stringify(props)) as Record<string, unknown>
    for (const [dotKey, value] of Object.entries(flat)) {
        const parts = dotKey.replace(/\[(\d+)\]/g, '.$1').split('.')
        let cur: any = result
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i]
            if (cur[p] == null) cur[p] = /^\d+$/.test(parts[i + 1]) ? [] : {}
            cur = cur[p]
        }
        cur[parts[parts.length - 1]] = value
    }
    return result as unknown as BlockProps
}

// ─── Chip selector helper ─────────────────────────────────────────────────────

function ChipGroup<T extends string>({
    label,
    options,
    value,
    onChange,
    disabled,
}: {
    label: string
    options: { value: T; label: string }[]
    value: T
    onChange: (v: T) => void
    disabled?: boolean
}) {
    return (
        <div style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {options.map(opt => {
                    const active = value === opt.value
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            disabled={disabled}
                            style={{
                                padding: '4px 10px',
                                borderRadius: 20,
                                border: active ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
                                background: active ? 'rgba(99,102,241,0.1)' : '#f9fafb',
                                color: active ? '#6366f1' : '#555',
                                fontSize: 11,
                                fontWeight: active ? 700 : 500,
                                cursor: disabled ? 'default' : 'pointer',
                                transition: 'all 0.12s',
                                opacity: disabled ? 0.6 : 1,
                            }}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIQuickFillPopover({
    mode,
    block,
    allBlocks,
    templateCategory = 'general',
    creditBalance,
    creditCost,
    onUpdateBlocks,
    onClose,
}: AIQuickFillPopoverProps) {
    const isSingle = mode === 'single'
    const targetBlocks = isSingle ? [block] : allBlocks

    const [description, setDescription] = useState('')
    const [condition, setCondition]     = useState<'new' | 'used' | 'refurbished'>('new')
    const [tone, setTone]               = useState<'professional' | 'friendly' | 'bargain'>('professional')
    const [targetBuyer, setTargetBuyer] = useState<'general' | 'collector' | 'gift' | 'business'>('general')
    const [keyPoints, setKeyPoints]     = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)
    const [result, setResult]   = useState<Array<{ id: string; props: BlockProps; changeCount: number }> | null>(null)
    const [applied, setApplied] = useState(false)

    const textareaRef  = useRef<HTMLTextAreaElement>(null)
    const popoverRef   = useRef<HTMLDivElement>(null)

    // Focus textarea on mount
    useEffect(() => { setTimeout(() => textareaRef.current?.focus(), 50) }, [])

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    // Close on outside click
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose()
        }
        const timer = setTimeout(() => document.addEventListener('mousedown', onClickOutside), 100)
        return () => { clearTimeout(timer); document.removeEventListener('mousedown', onClickOutside) }
    }, [onClose])

    const handleFill = useCallback(async () => {
        if (!description.trim()) return
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/ai/fill-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productDescription: description.trim(),
                    blocks: targetBlocks,
                    category: templateCategory,
                    mode,
                    // extra context (full template mode only)
                    ...(!isSingle && {
                        condition,
                        tone,
                        targetBuyer,
                        keyPoints: keyPoints.trim() || undefined,
                    }),
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'AI fill failed')

            const updates: Array<{ id: string; props: BlockProps; changeCount: number }> = []
            for (const b of targetBlocks) {
                const blockResult = data.result?.[b.id] as Record<string, string> | undefined
                if (!blockResult || Object.keys(blockResult).length === 0) continue
                const origProps = b.props as unknown as Record<string, unknown>
                const updatedProps = applyFlatResult(origProps, blockResult)
                const changeCount = countChanges(origProps, blockResult)
                if (changeCount > 0) updates.push({ id: b.id, props: updatedProps, changeCount })
            }

            setResult(updates)
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [description, targetBlocks, templateCategory, isSingle, condition, tone, targetBuyer, keyPoints])

    const handleApplyAll = useCallback(() => {
        if (!result) return
        onUpdateBlocks(result.map(({ id, props }) => ({ id, props })))
        setApplied(true)
        setTimeout(() => onClose(), 800)
    }, [result, onUpdateBlocks, onClose])

    const totalChanges = result?.reduce((acc, r) => acc + r.changeCount, 0) ?? 0
    const canFill = description.trim().length > 0 && !loading

    return (
        <div
            ref={popoverRef}
            onClick={e => e.stopPropagation()}
            style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 0,
                width: 320,
                background: '#fff',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(99,102,241,0.12)',
                zIndex: 100,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px 8px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
            }}>
                <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.01em', display: 'block' }}>
                        {isSingle
                            ? block.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                            : '🪄 Fill Full Template'
                        }
                    </span>
                    <span style={{ fontSize: 9, color: '#888', fontWeight: 500 }}>
                        {isSingle ? 'Fill this block only' : `${allBlocks.length} blocks · AI-powered`}
                    </span>
                </div>
                <span style={{
                    fontSize: 10, fontWeight: 600, color: '#6366f1',
                    background: 'rgba(99,102,241,0.1)', padding: '2px 7px', borderRadius: 20,
                }}>
                    {creditCost} cr
                </span>
            </div>

            {/* Body */}
            <div style={{ padding: 12, maxHeight: 480, overflowY: 'auto' }}>
                {!result ? (
                    <>
                        {/* Product description */}
                        <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Describe your product
                        </p>
                        <textarea
                            ref={textareaRef}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleFill() }}
                            placeholder={isSingle
                                ? 'e.g. Premium wireless headphones, 40h battery, noise cancellation...'
                                : 'e.g. iPhone 14 Pro 256GB Space Black, excellent condition, original box...'
                            }
                            disabled={loading}
                            style={{
                                width: '100%', minHeight: 68, padding: '8px 10px',
                                border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: 8,
                                fontSize: 11.5, lineHeight: 1.5, resize: 'vertical', outline: 'none',
                                fontFamily: 'inherit', color: '#1a1a2e', boxSizing: 'border-box',
                                background: loading ? '#f9f9f9' : '#fff', marginBottom: 12,
                            }}
                        />

                        {/* Full template extra fields */}
                        {!isSingle && (
                            <>
                                <ChipGroup
                                    label="Condition"
                                    value={condition}
                                    onChange={setCondition}
                                    disabled={loading}
                                    options={[
                                        { value: 'new',         label: 'New' },
                                        { value: 'used',        label: 'Used' },
                                        { value: 'refurbished', label: 'Refurbished' },
                                    ]}
                                />
                                <ChipGroup
                                    label="Tone"
                                    value={tone}
                                    onChange={setTone}
                                    disabled={loading}
                                    options={[
                                        { value: 'professional', label: 'Professional' },
                                        { value: 'friendly',     label: 'Friendly' },
                                        { value: 'bargain',      label: 'Bargain' },
                                    ]}
                                />
                                <ChipGroup
                                    label="Target Buyer"
                                    value={targetBuyer}
                                    onChange={setTargetBuyer}
                                    disabled={loading}
                                    options={[
                                        { value: 'general',   label: 'General' },
                                        { value: 'collector', label: 'Collector' },
                                        { value: 'gift',      label: 'Gift' },
                                        { value: 'business',  label: 'Business' },
                                    ]}
                                />

                                {/* Key points — optional */}
                                <div style={{ marginBottom: 10 }}>
                                    <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Key Points <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                                    </p>
                                    <textarea
                                        value={keyPoints}
                                        onChange={e => setKeyPoints(e.target.value)}
                                        disabled={loading}
                                        placeholder="e.g. Original box included, fast charger, minor scratch on back..."
                                        style={{
                                            width: '100%', minHeight: 52, padding: '7px 10px',
                                            border: '1.5px solid #e5e7eb', borderRadius: 8,
                                            fontSize: 11, lineHeight: 1.45, resize: 'vertical', outline: 'none',
                                            fontFamily: 'inherit', color: '#1a1a2e', boxSizing: 'border-box',
                                            background: loading ? '#f9f9f9' : '#fff',
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {error && (
                            <div style={{
                                marginBottom: 8, padding: '6px 8px',
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 6, fontSize: 11, color: '#dc2626',
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10, color: '#999' }}>
                                {creditBalance != null ? `${creditBalance} credits left` : ''}
                            </span>
                            <button
                                onClick={handleFill}
                                disabled={!canFill}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 14px',
                                    background: canFill
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : '#e5e7eb',
                                    color: canFill ? '#fff' : '#9ca3af',
                                    border: 'none', borderRadius: 8,
                                    fontSize: 12, fontWeight: 600,
                                    cursor: canFill ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {loading ? (
                                    <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Filling…</>
                                ) : (
                                    <><Sparkles size={12} />{isSingle ? 'Fill Block' : 'Fill Template'}</>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    /* Results view */
                    <>
                        {applied ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'rgba(34,197,94,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Check size={18} color="#16a34a" strokeWidth={2.5} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Applied!</span>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    marginBottom: 8, padding: '6px 8px',
                                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                                    borderRadius: 6, fontSize: 11, color: '#15803d',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}>
                                    <Sparkles size={11} />
                                    <span>
                                        Found <strong>{totalChanges}</strong> field{totalChanges !== 1 ? 's' : ''} to update across{' '}
                                        <strong>{result.length}</strong> block{result.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
                                    {result.map(({ id, changeCount }) => {
                                        const b = allBlocks.find(bl => bl.id === id)
                                        return (
                                            <div key={id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '5px 6px', borderRadius: 5, marginBottom: 2,
                                                background: 'rgba(0,0,0,0.02)',
                                            }}>
                                                <span style={{ fontSize: 11, color: '#444', fontWeight: 500, textTransform: 'capitalize' }}>
                                                    {b?.type?.replace(/_/g, ' ') ?? id}
                                                </span>
                                                <span style={{
                                                    fontSize: 10, color: '#6366f1',
                                                    background: 'rgba(99,102,241,0.08)',
                                                    padding: '1px 6px', borderRadius: 10, fontWeight: 600,
                                                }}>
                                                    {changeCount} change{changeCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={() => { setResult(null); setError(null) }}
                                        style={{
                                            flex: 1, padding: '7px 0',
                                            background: 'transparent', border: '1.5px solid #e5e7eb',
                                            borderRadius: 8, fontSize: 12, fontWeight: 600,
                                            color: '#666', cursor: 'pointer',
                                        }}
                                    >
                                        Retry
                                    </button>
                                    <button
                                        onClick={handleApplyAll}
                                        style={{
                                            flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                            padding: '7px 0',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            color: '#fff', border: 'none', borderRadius: 8,
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        }}
                                    >
                                        <Check size={12} />
                                        {isSingle ? 'Apply' : 'Apply All'}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

// ─── Canvas-level AI Button (bottom-right corner of the full canvas) ─────────

export interface AICanvasButtonProps {
    /** All blocks on canvas */
    allBlocks: Block[]
    /** Currently selected block — drives single vs full-template mode */
    selectedBlock?: Block | null
    templateCategory?: string
    onUpdateBlocks: (updates: Array<{ id: string; props: BlockProps }>) => void
}

export function AICanvasButton({
    allBlocks,
    selectedBlock,
    templateCategory,
    onUpdateBlocks,
}: AICanvasButtonProps) {
    const [open, setOpen] = useState(false)
    const [creditBalance, setCreditBalance] = useState<number | null>(null)
    const [liveCost, setLiveCost] = useState<number | null>(null)

    const mode: 'single' | 'all' = selectedBlock ? 'single' : 'all'
    // Fallback cost from defaults until live fetch completes
    const defaultCost = mode === 'single'
        ? DEFAULT_CREDIT_COSTS[AI_ACTIONS.FILL_TEMPLATE_SINGLE]
        : DEFAULT_CREDIT_COSTS[AI_ACTIONS.FILL_TEMPLATE_FULL]
    const creditCost = liveCost ?? defaultCost

    // Fetch balance + live credit cost when popover opens
    useEffect(() => {
        if (!open) return
        const fetchData = async () => {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data } = await (supabase.from('user_credits') as any)
                    .select('balance')
                    .eq('user_id', user.id)
                    .single()
                if (data?.balance != null) setCreditBalance(data.balance)
            } catch { /* ignore */ }

            // Fetch live cost from ai_action_costs table
            const actionKey = mode === 'single'
                ? AI_ACTIONS.FILL_TEMPLATE_SINGLE
                : AI_ACTIONS.FILL_TEMPLATE_FULL
            const cost = await getCreditCost(actionKey)
            setLiveCost(cost)
        }
        fetchData()
    }, [open, mode])

    // Only show when there is at least 1 block
    if (allBlocks.length < 1) return null

    // Use selected block in single mode; fall back to first block for full mode
    const activeBlock = selectedBlock ?? allBlocks[0]

    // Tooltip changes based on mode
    const tooltip = mode === 'single'
        ? `AI Fill: ${activeBlock.type.replace(/_/g, ' ')}`
        : 'AI Fill Template (all blocks)'

    return (
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            {/* Wand icon — no background, no border, just icon + drop shadow */}
            <button
                onClick={e => {
                    e.stopPropagation()
                    setOpen(prev => !prev)
                }}
                title={tooltip}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: open ? '#6366f1' : 'rgba(99,102,241,0.8)',
                    filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.30))',
                    transition: 'color 0.15s, transform 0.15s',
                    transform: open ? 'scale(1.2)' : 'scale(1)',
                }}
            >
                <Wand2 size={20} strokeWidth={2} />
            </button>

            {/* Popover anchors bottom-right */}
            {open && (
                <AIQuickFillPopover
                    mode={mode}
                    block={activeBlock}
                    allBlocks={allBlocks}
                    templateCategory={templateCategory}
                    creditBalance={creditBalance}
                    creditCost={creditCost}
                    onUpdateBlocks={(updates) => {
                        onUpdateBlocks(updates)
                        setCreditBalance(prev => prev != null ? Math.max(0, prev - creditCost) : null)
                    }}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    )
}
