'use client'
// components/ui/VisualEditor/TokensTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Tokens Tab
//
// Placeholder token picker for the icon rail sidebar.
// Shows all {{PLACEHOLDERS}} grouped by category.
//
// Features:
//   • Search across all tokens
//   • Click to copy to clipboard
//   • Click "Insert" to insert into the selected block's active text field
//   • Preview value shown per token (e.g. {{ITEM_PRICE}} → £49.99)
//   • Custom token creator — type any key, generates {{CUSTOM_KEY}}
//
// Props:
//   placeholders   — PLACEHOLDER_GROUPS from visual-editor/page.tsx
//   onInsert(val)  — inserts the placeholder string into the selected block
//                    (wired by VisualEditor.tsx to update selected block props)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useMemo } from 'react'
import {
    Search, Copy, Check, ChevronDown,
    Plus, Tag,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    inputBorder: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#ddd6fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
}

// ── Types — mirrors page.tsx PlaceholderGroup ─────────────────────────────────
interface PlaceholderItem {
    label: string
    value: string
    example?: string
}

interface PlaceholderGroup {
    group: string
    items: PlaceholderItem[]
}

// ── Category accent colours ───────────────────────────────────────────────────
const GROUP_COLORS: Record<string, string> = {
    'Product Info': '#7530fb',
    'Pricing': '#16a34a',
    'Media': '#d97706',
    'Shipping & Returns': '#0ea5e9',
    'Custom': '#9ca3af',
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface TokensTabProps {
    placeholders: PlaceholderGroup[]
    onInsert: (value: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TokensTab({ placeholders, onInsert }: TokensTabProps) {
    const [search, setSearch] = useState('')
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
    const [copied, setCopied] = useState<string | null>(null)
    const [inserted, setInserted] = useState<string | null>(null)
    const [customKey, setCustomKey] = useState('')
    const [customCreated, setCustomCreated] = useState(false)

    // Filter placeholders by search
    const query = search.trim().toLowerCase()
    const filtered: PlaceholderGroup[] = useMemo(() => {
        if (!query) return placeholders
        return placeholders
            .map(group => ({
                ...group,
                items: group.items.filter(item =>
                    item.label.toLowerCase().includes(query) ||
                    item.value.toLowerCase().includes(query)
                ),
            }))
            .filter(group => group.items.length > 0)
    }, [placeholders, query])

    // Total count
    const totalCount = placeholders.reduce((sum, g) => sum + g.items.length, 0)
    const filteredCount = filtered.reduce((sum, g) => sum + g.items.length, 0)

    // Copy to clipboard
    const handleCopy = useCallback(async (value: string) => {
        await navigator.clipboard.writeText(value)
        setCopied(value)
        setTimeout(() => setCopied(null), 2000)
    }, [])

    // Insert into selected block
    const handleInsert = useCallback((value: string) => {
        onInsert(value)
        setInserted(value)
        setTimeout(() => setInserted(null), 1500)
    }, [onInsert])

    // Toggle group collapse
    const toggleGroup = (group: string) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            next.has(group) ? next.delete(group) : next.add(group)
            return next
        })
    }

    // Create custom token
    const handleCreateCustom = () => {
        if (!customKey.trim()) return
        const formatted = customKey.trim()
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '')
        const token = `{{${formatted}}}`
        handleInsert(token)
        setCustomKey('')
        setCustomCreated(true)
        setTimeout(() => setCustomCreated(false), 2000)
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: C.bg,
        }}>
            {/* ── Header ── */}
            <div style={{
                padding: '14px 14px 10px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: '0 0 10px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700, fontSize: 13,
                    color: C.dark, letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                }}>
                    Dynamic Tokens
                </p>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={11} style={{
                        position: 'absolute', left: 9, top: '50%',
                        transform: 'translateY(-50%)',
                        color: C.muted, pointerEvents: 'none',
                    }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={`Search ${totalCount} tokens...`}
                        style={{
                            width: '100%', boxSizing: 'border-box' as const,
                            padding: '7px 10px 7px 27px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 8, backgroundColor: C.bg,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                            color: C.body, outline: 'none',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = C.primary
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22`
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = C.inputBorder
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute', right: 8, top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none', border: 'none',
                                cursor: 'pointer', color: C.muted,
                                fontSize: 14, lineHeight: 1, padding: 0,
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Result count when searching */}
                {query && (
                    <p style={{
                        margin: '5px 0 0',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                        color: C.muted,
                    }}>
                        {filteredCount} of {totalCount} tokens match
                    </p>
                )}
            </div>

            {/* ── Usage hint ── */}
            <div style={{
                padding: '8px 14px',
                backgroundColor: C.primaryLight,
                borderBottom: `1px solid ${C.primaryBorder}`,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                    color: C.primary, lineHeight: 1.5,
                }}>
                    <strong>Insert</strong> adds the token to the selected block's text field.{' '}
                    <strong>Copy</strong> copies to clipboard.
                </p>
            </div>

            {/* ── Token groups ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 8px' }}>

                {filtered.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <Tag size={24} style={{ color: C.border, margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>
                            No tokens match "{search}"
                        </p>
                    </div>
                ) : (
                    filtered.map(group => {
                        const accentColor = GROUP_COLORS[group.group] ?? C.primary
                        const isCollapsed = collapsed.has(group.group)

                        return (
                            <div key={group.group}>
                                {/* Group header */}
                                <button
                                    onClick={() => toggleGroup(group.group)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 14px 4px',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', textAlign: 'left' as const,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            backgroundColor: accentColor,
                                            display: 'inline-block', flexShrink: 0,
                                        }} />
                                        <span style={{
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 10, fontWeight: 700,
                                            color: C.secondary,
                                            textTransform: 'uppercase' as const,
                                            letterSpacing: '0.07em',
                                        }}>
                                            {group.group}
                                        </span>
                                        <span style={{
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 10, color: C.muted,
                                        }}>
                                            {group.items.length}
                                        </span>
                                    </div>
                                    <ChevronDown size={11} style={{
                                        color: C.muted,
                                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }} />
                                </button>

                                {/* Token items */}
                                {!isCollapsed && (
                                    <div style={{ padding: '0 10px 4px' }}>
                                        {group.items.map(item => (
                                            <TokenCard
                                                key={item.value}
                                                item={item}
                                                accentColor={accentColor}
                                                isCopied={copied === item.value}
                                                isInserted={inserted === item.value}
                                                onCopy={() => handleCopy(item.value)}
                                                onInsert={() => handleInsert(item.value)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── Custom token creator ── */}
            <div style={{
                padding: '10px 12px',
                borderTop: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: '0 0 7px',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                    fontWeight: 700, color: C.secondary,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                }}>
                    Custom Token
                </p>
                <div style={{ display: 'flex', gap: 5 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 8, top: '50%',
                            transform: 'translateY(-50%)',
                            fontFamily: 'monospace', fontSize: 11,
                            color: C.muted, pointerEvents: 'none',
                        }}>
                            {'{{'}
                        </span>
                        <input
                            type="text"
                            value={customKey}
                            onChange={e => setCustomKey(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateCustom() }}
                            placeholder="MY_FIELD"
                            maxLength={30}
                            style={{
                                width: '100%', boxSizing: 'border-box' as const,
                                padding: '6px 22px 6px 28px',
                                border: `1px solid ${C.inputBorder}`,
                                borderRadius: 7, backgroundColor: C.bg,
                                fontFamily: 'monospace', fontSize: 11,
                                color: C.primary, outline: 'none',
                                textTransform: 'uppercase',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = C.primary
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = C.inputBorder
                            }}
                        />
                        <span style={{
                            position: 'absolute', right: 8, top: '50%',
                            transform: 'translateY(-50%)',
                            fontFamily: 'monospace', fontSize: 11,
                            color: C.muted, pointerEvents: 'none',
                        }}>
                            {'}}'}
                        </span>
                    </div>
                    <button
                        onClick={handleCreateCustom}
                        disabled={!customKey.trim()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '6px 10px',
                            border: 'none', borderRadius: 7,
                            backgroundColor: customCreated ? '#16a34a' : C.primary,
                            color: '#ffffff',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, fontWeight: 700,
                            cursor: customKey.trim() ? 'pointer' : 'default',
                            opacity: customKey.trim() ? 1 : 0.5,
                            transition: 'background-color 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        {customCreated
                            ? <Check size={12} />
                            : <Plus size={12} />
                        }
                        {customCreated ? 'Added!' : 'Insert'}
                    </button>
                </div>
                <p style={{
                    margin: '5px 0 0',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                    color: C.muted, lineHeight: 1.4,
                }}>
                    {'Creates a custom {{TOKEN}} and inserts it into the selected field'}
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN CARD
// Individual placeholder token row
// ─────────────────────────────────────────────────────────────────────────────
function TokenCard({
    item, accentColor, isCopied, isInserted, onCopy, onInsert,
}: {
    item: PlaceholderItem
    accentColor: string
    isCopied: boolean
    isInserted: boolean
    onCopy: () => void
    onInsert: () => void
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 8px',
                marginBottom: 3,
                borderRadius: 7,
                border: `1px solid ${hovered ? accentColor + '44' : 'transparent'}`,
                backgroundColor: hovered ? accentColor + '0a' : 'transparent',
                transition: 'all 0.12s',
            }}
        >
            {/* Token value */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <code style={{
                    display: 'block',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    color: accentColor,
                    backgroundColor: accentColor + '15',
                    padding: '2px 6px',
                    borderRadius: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                    marginBottom: 1,
                }}>
                    {item.value}
                </code>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 10, color: C.secondary,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                        flex: 1,
                    }}>
                        {item.label}
                    </span>
                    {item.example && (
                        <span style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 9, color: C.muted,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                            maxWidth: 60,
                        }}>
                            e.g. {item.example}
                        </span>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            {hovered && (
                <div style={{
                    display: 'flex',
                    gap: 3,
                    flexShrink: 0,
                }}>
                    {/* Copy */}
                    <ActionBtn
                        onClick={onCopy}
                        title="Copy to clipboard"
                        active={isCopied}
                        activeColor="#16a34a"
                    >
                        {isCopied
                            ? <Check size={10} style={{ color: '#16a34a' }} />
                            : <Copy size={10} />
                        }
                    </ActionBtn>

                    {/* Insert */}
                    <ActionBtn
                        onClick={onInsert}
                        title="Insert into selected block"
                        active={isInserted}
                        activeColor={C.primary}
                        primary
                    >
                        {isInserted
                            ? <Check size={10} style={{ color: '#fff' }} />
                            : <Plus size={10} style={{ color: '#fff' }} />
                        }
                    </ActionBtn>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function ActionBtn({
    children, onClick, title, active, activeColor, primary = false,
}: {
    children: React.ReactNode
    onClick: () => void
    title: string
    active?: boolean
    activeColor?: string
    primary?: boolean
}) {
    return (
        <button
            onClick={e => { e.stopPropagation(); onClick() }}
            title={title}
            style={{
                width: 22, height: 22, borderRadius: 5,
                border: primary ? 'none' : `1px solid ${C.border}`,
                backgroundColor: active
                    ? (activeColor ?? C.primary) + '22'
                    : primary ? C.primary : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
                transition: 'all 0.12s',
                color: primary ? '#fff' : C.secondary,
            }}
        >
            {children}
        </button>
    )
}
