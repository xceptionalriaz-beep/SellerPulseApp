'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Wand2, X, Loader2, Sparkles, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIQuickFillPopover({
    mode,
    block,
    allBlocks,
    templateCategory = 'general',
    creditBalance,
    onUpdateBlocks,
    onClose,
}: AIQuickFillPopoverProps) {
    const isSingle = mode === 'single'
    const targetBlocks = isSingle ? [block] : allBlocks
    const creditCost = isSingle ? 10 : 20
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<Array<{ id: string; props: BlockProps; changeCount: number }> | null>(null)
    const [applied, setApplied] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    // Focus textarea on mount
    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 50)
    }, [])

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    // Close on outside click
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        // Small delay to prevent immediate close from the wand button click
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', onClickOutside)
        }, 100)
        return () => {
            clearTimeout(timer)
            document.removeEventListener('mousedown', onClickOutside)
        }
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
                    description: description.trim(),
                    blocks: targetBlocks,
                    templateCategory,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'AI fill failed')

            // Build per-block results
            const updates: Array<{ id: string; props: BlockProps; changeCount: number }> = []
            for (const b of targetBlocks) {
                const blockResult = data.result?.[b.id] as Record<string, string> | undefined
                if (!blockResult || Object.keys(blockResult).length === 0) continue
                const origProps = b.props as unknown as Record<string, unknown>
                const updatedProps = applyFlatResult(origProps, blockResult)
                const changeCount = countChanges(origProps, blockResult)
                if (changeCount > 0) {
                    updates.push({ id: b.id, props: updatedProps, changeCount })
                }
            }

            setResult(updates)
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [description, targetBlocks, templateCategory])

    const handleApplyAll = useCallback(() => {
        if (!result) return
        onUpdateBlocks(result.map(({ id, props }) => ({ id, props })))
        setApplied(true)
        setTimeout(() => onClose(), 800)
    }, [result, onUpdateBlocks, onClose])

    const totalChanges = result?.reduce((acc, r) => acc + r.changeCount, 0) ?? 0

    return (
        <div
            ref={popoverRef}
            onClick={e => e.stopPropagation()}
            style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 0,
                width: 300,
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
                            : 'AI Fill Template'
                        }
                    </span>
                    {isSingle && (
                        <span style={{ fontSize: 9, color: '#888', fontWeight: 500 }}>Fill this block only</span>
                    )}
                </div>
                <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#6366f1',
                    background: 'rgba(99,102,241,0.1)',
                    padding: '2px 6px',
                    borderRadius: 20,
                }}>
                    {creditCost} credits
                </span>
            </div>

            {/* Body */}
            <div style={{ padding: 12 }}>
                {!result ? (
                    <>
                        <p style={{ margin: '0 0 8px', fontSize: 11, color: '#555', lineHeight: 1.4 }}>
                            {isSingle
                                ? 'Describe your product and AI will fill this block instantly.'
                                : `Describe your product and AI will fill all ${allBlocks.length} blocks instantly.`
                            }
                        </p>
                        <textarea
                            ref={textareaRef}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleFill()
                            }}
                            placeholder="e.g. Premium wireless headphones with 40h battery, noise cancellation, foldable design, in black..."
                            disabled={loading}
                            style={{
                                width: '100%',
                                minHeight: 72,
                                padding: '8px 10px',
                                border: '1.5px solid rgba(99,102,241,0.2)',
                                borderRadius: 8,
                                fontSize: 11.5,
                                lineHeight: 1.5,
                                resize: 'vertical',
                                outline: 'none',
                                fontFamily: 'inherit',
                                color: '#1a1a2e',
                                boxSizing: 'border-box',
                                background: loading ? '#f9f9f9' : '#fff',
                            }}
                        />

                        {error && (
                            <div style={{
                                marginTop: 6,
                                padding: '6px 8px',
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 6,
                                fontSize: 11,
                                color: '#dc2626',
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontSize: 10, color: '#999' }}>
                                {creditBalance != null ? `${creditBalance} credits left` : ''}
                            </span>
                            <button
                                onClick={handleFill}
                                disabled={loading || !description.trim()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '7px 14px',
                                    background: loading || !description.trim()
                                        ? '#e5e7eb'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: loading || !description.trim() ? '#9ca3af' : '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                        Filling...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={12} />
                                        {isSingle ? 'Fill Block' : 'Fill All'}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    /* Results view */
                    <>
                        {applied ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                padding: '12px 0',
                            }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'rgba(34,197,94,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Check size={18} color="#16a34a" strokeWidth={2.5} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Applied!</span>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    marginBottom: 8,
                                    padding: '6px 8px',
                                    background: 'rgba(34,197,94,0.06)',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: '#15803d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                }}>
                                    <Sparkles size={11} />
                                    <span>
                                        Found <strong>{totalChanges}</strong> field
                                        {totalChanges !== 1 ? 's' : ''} to update across{' '}
                                        <strong>{result.length}</strong> block
                                        {result.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Block list */}
                                <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
                                    {result.map(({ id, changeCount }) => {
                                        const b = allBlocks.find(bl => bl.id === id)
                                        return (
                                            <div key={id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '5px 6px',
                                                borderRadius: 5,
                                                marginBottom: 2,
                                                background: 'rgba(0,0,0,0.02)',
                                            }}>
                                                <span style={{ fontSize: 11, color: '#444', fontWeight: 500, textTransform: 'capitalize' }}>
                                                    {b?.type?.replace(/_/g, ' ') ?? id}
                                                </span>
                                                <span style={{
                                                    fontSize: 10,
                                                    color: '#6366f1',
                                                    background: 'rgba(99,102,241,0.08)',
                                                    padding: '1px 6px',
                                                    borderRadius: 10,
                                                    fontWeight: 600,
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
                                            flex: 1,
                                            padding: '7px 0',
                                            background: 'transparent',
                                            border: '1.5px solid #e5e7eb',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#666',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Retry
                                    </button>
                                    <button
                                        onClick={handleApplyAll}
                                        style={{
                                            flex: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                            padding: '7px 0',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
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

    const mode: 'single' | 'all' = selectedBlock ? 'single' : 'all'
    const creditCost = mode === 'single' ? 10 : 20

    // Fetch balance when popover opens
    useEffect(() => {
        if (!open) return
        const fetchBalance = async () => {
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
        }
        fetchBalance()
    }, [open])

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
