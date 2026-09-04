'use client'
import React, { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import {
    BLOCK_CATEGORIES,
    BLOCK_DEFINITIONS,
    BlockType,
    BlockCategory,
    BlockDefinition,
} from './blocks'

const C = {
    bg: '#f8f7ff', surface: '#ffffff', border: '#ede9fe',
    primary: '#7530fb', primaryLight: '#f3eeff',
    dark: '#1e1535', body: '#1f1d2e', secondary: '#6b7280',
    muted: '#9ca3af', inputBorder: '#e5e0f5',
}

const CATEGORY_COLORS: Record<string, string> = {
    'Layout': '#7530fb', 'Content': '#0ea5e9', 'Product': '#16a34a',
    'Media': '#d97706', 'eBay Specific': '#16a34a', 'Conversion': '#ef4444',
    'Header & Footer': '#7c3aed', 'Typography': '#db2877',
}

// ── SVG visual previews ───────────────────────────────────────────────────────
const P: Record<string, () => JSX.Element> = {
    full_width_section: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="14" y="14" width="72" height="5" rx="2" fill="#c4b5fd" /><rect x="20" y="23" width="60" height="3" rx="1.5" fill="#ddd6fe" /><rect x="26" y="30" width="48" height="3" rx="1.5" fill="#ddd6fe" /></svg>,

    two_column: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="43" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="53" y="4" width="43" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="10" y="12" width="31" height="4" rx="2" fill="#c4b5fd" /><rect x="10" y="20" width="25" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="10" y="26" width="28" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="59" y="12" width="31" height="4" rx="2" fill="#c4b5fd" /><rect x="59" y="20" width="25" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="59" y="26" width="28" height="2.5" rx="1.25" fill="#ddd6fe" /></svg>,

    three_column: () => <svg viewBox="0 0 100 44" fill="none"><rect x="3" y="4" width="28" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="36" y="4" width="28" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="69" y="4" width="28" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="7" y="12" width="20" height="3" rx="1.5" fill="#c4b5fd" /><rect x="7" y="19" width="16" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="40" y="12" width="20" height="3" rx="1.5" fill="#c4b5fd" /><rect x="40" y="19" width="16" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="73" y="12" width="20" height="3" rx="1.5" fill="#c4b5fd" /><rect x="73" y="19" width="16" height="2.5" rx="1.25" fill="#ddd6fe" /></svg>,

    container: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f8f7ff" stroke="#ddd6fe" strokeWidth="1" strokeDasharray="4 2" /><rect x="14" y="10" width="72" height="24" rx="3" fill="#f3eeff" stroke="#c4b5fd" strokeWidth="1" /><rect x="24" y="17" width="52" height="4" rx="2" fill="#c4b5fd" /><rect x="28" y="25" width="44" height="2.5" rx="1.25" fill="#ddd6fe" /></svg>,

    heading: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="10" y="13" width="80" height="8" rx="4" fill="#7530fb" opacity="0.85" /><rect x="22" y="27" width="56" height="3" rx="1.5" fill="#ddd6fe" /></svg>,

    paragraph: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="10" y="9" width="80" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="10" y="15" width="75" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="10" y="21" width="80" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="10" y="27" width="65" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="10" y="33" width="45" height="2.5" rx="1.25" fill="#ddd6fe" /></svg>,

    bullet_list: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><circle cx="14" cy="13" r="3" fill="#7530fb" opacity="0.7" /><rect x="21" y="11" width="60" height="3" rx="1.5" fill="#c4b5fd" /><circle cx="14" cy="22" r="3" fill="#7530fb" opacity="0.7" /><rect x="21" y="20" width="52" height="3" rx="1.5" fill="#c4b5fd" /><circle cx="14" cy="31" r="3" fill="#7530fb" opacity="0.7" /><rect x="21" y="29" width="58" height="3" rx="1.5" fill="#c4b5fd" /></svg>,

    divider: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="10" y="20" width="80" height="2" rx="1" fill="#7530fb" opacity="0.4" /><circle cx="50" cy="21" r="5" fill="#7530fb" opacity="0.25" /></svg>,

    product_title: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="10" y="9" width="80" height="8" rx="3" fill="#1e1535" opacity="0.85" /><rect x="10" y="21" width="36" height="3" rx="1.5" fill="#7530fb" opacity="0.5" /><rect x="10" y="29" width="55" height="3" rx="1.5" fill="#ddd6fe" /></svg>,

    price_block: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="10" y="10" width="50" height="11" rx="4" fill="#7530fb" opacity="0.9" /><rect x="66" y="12" width="22" height="7" rx="3" fill="#b8fa33" /><rect x="10" y="28" width="28" height="3" rx="1.5" fill="#ddd6fe" /><rect x="42" y="29" width="18" height="2" rx="1" fill="#c4b5fd" /></svg>,

    product_image: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="18" y="6" width="64" height="32" rx="4" fill="#ddd6fe" /><circle cx="50" cy="16" r="6" fill="#c4b5fd" /><path d="M18 33 Q50 20 82 33" stroke="#c4b5fd" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>,

    product_description: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="6" y="7" width="5" height="22" rx="2.5" fill="#7530fb" /><rect x="16" y="9" width="50" height="5" rx="2" fill="#1e1535" opacity="0.75" /><rect x="16" y="18" width="74" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="16" y="24" width="68" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="16" y="30" width="50" height="2.5" rx="1.25" fill="#ddd6fe" /></svg>,

    specs_table: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="10" rx="3" fill="#7530fb" opacity="0.85" /><rect x="4" y="14" width="92" height="8" fill="#f3eeff" /><rect x="4" y="22" width="92" height="8" fill="#faf8ff" /><rect x="4" y="30" width="92" height="8" fill="#f3eeff" /><rect x="8" y="16.5" width="26" height="2.5" rx="1.25" fill="#6b7280" opacity="0.5" /><rect x="52" y="16.5" width="36" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="8" y="24.5" width="26" height="2.5" rx="1.25" fill="#6b7280" opacity="0.5" /><rect x="52" y="24.5" width="30" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="8" y="32.5" width="26" height="2.5" rx="1.25" fill="#6b7280" opacity="0.5" /><rect x="52" y="32.5" width="36" height="2.5" rx="1.25" fill="#c4b5fd" /></svg>,

    image: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="10" y="7" width="80" height="30" rx="3" fill="#ddd6fe" /><circle cx="26" cy="17" r="5" fill="#c4b5fd" /><path d="M10 32 L30 20 L52 28 L68 16 L94 30" stroke="#c4b5fd" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>,

    banner: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#1e1535" /><rect x="14" y="11" width="72" height="7" rx="3" fill="white" opacity="0.9" /><rect x="24" y="22" width="52" height="3" rx="1.5" fill="white" opacity="0.45" /><rect x="34" y="29" width="32" height="7" rx="3.5" fill="#b8fa33" /></svg>,

    gallery_row: () => <svg viewBox="0 0 100 44" fill="none"><rect x="3" y="4" width="28" height="36" rx="3" fill="#ddd6fe" /><circle cx="12" cy="14" r="4" fill="#c4b5fd" /><path d="M3 34 Q17 24 31 34" stroke="#c4b5fd" strokeWidth="2" fill="none" /><rect x="36" y="4" width="28" height="36" rx="3" fill="#ddd6fe" /><circle cx="45" cy="14" r="4" fill="#c4b5fd" /><path d="M36 34 Q50 24 64 34" stroke="#c4b5fd" strokeWidth="2" fill="none" /><rect x="69" y="4" width="28" height="36" rx="3" fill="#ddd6fe" /><circle cx="78" cy="14" r="4" fill="#c4b5fd" /><path d="M69 34 Q83 24 97 34" stroke="#c4b5fd" strokeWidth="2" fill="none" /></svg>,

    trust_badges: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="7" y="7" width="28" height="30" rx="4" fill="white" stroke="#ddd6fe" strokeWidth="1" /><circle cx="21" cy="18" r="5" fill="#7530fb" opacity="0.3" /><rect x="11" y="26" width="20" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="36" y="7" width="28" height="30" rx="4" fill="white" stroke="#ddd6fe" strokeWidth="1" /><circle cx="50" cy="18" r="5" fill="#7530fb" opacity="0.3" /><rect x="40" y="26" width="20" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="65" y="7" width="28" height="30" rx="4" fill="white" stroke="#ddd6fe" strokeWidth="1" /><circle cx="79" cy="18" r="5" fill="#7530fb" opacity="0.3" /><rect x="69" y="26" width="20" height="2.5" rx="1.25" fill="#c4b5fd" /></svg>,

    shipping_info: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" /><rect x="8" y="8" width="14" height="14" rx="3" fill="#16a34a" opacity="0.25" /><path d="M12 15 L14 17 L18 12" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="26" y="10" width="50" height="4" rx="2" fill="#16a34a" opacity="0.6" /><rect x="26" y="18" width="64" height="2.5" rx="1.25" fill="#bbf7d0" /><rect x="26" y="24" width="56" height="2.5" rx="1.25" fill="#bbf7d0" /><rect x="26" y="30" width="44" height="2.5" rx="1.25" fill="#bbf7d0" /></svg>,

    returns_policy: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" /><rect x="8" y="8" width="14" height="14" rx="3" fill="#3b82f6" opacity="0.25" /><path d="M15 11 C13 11 11 13 11 15 L11 17 M11 17 L14 14 M11 17 L13.5 19.5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /><rect x="26" y="10" width="50" height="4" rx="2" fill="#3b82f6" opacity="0.6" /><rect x="26" y="18" width="64" height="2.5" rx="1.25" fill="#bfdbfe" /><rect x="26" y="24" width="56" height="2.5" rx="1.25" fill="#bfdbfe" /><rect x="26" y="30" width="44" height="2.5" rx="1.25" fill="#bfdbfe" /></svg>,

    seller_info: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><circle cx="20" cy="20" r="12" fill="#ddd6fe" /><circle cx="20" cy="16" r="5" fill="#c4b5fd" /><path d="M8 32 Q20 26 32 32" fill="#c4b5fd" /><rect x="36" y="11" width="40" height="5" rx="2" fill="#1e1535" opacity="0.7" /><rect x="36" y="20" width="56" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="36" y="26" width="48" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="36" y="33" width="32" height="5" rx="2.5" fill="#7530fb" opacity="0.4" /></svg>,

    cta_banner: () => <svg viewBox="0 0 100 44" fill="none"><defs><linearGradient id="g1" x1="0" y1="0" x2="100" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#7530fb" /><stop offset="1" stopColor="#1e1535" /></linearGradient></defs><rect x="4" y="4" width="92" height="36" rx="3" fill="url(#g1)" /><rect x="18" y="10" width="64" height="7" rx="3" fill="white" opacity="0.9" /><rect x="26" y="21" width="48" height="3" rx="1.5" fill="white" opacity="0.45" /><rect x="32" y="28" width="36" height="8" rx="4" fill="#b8fa33" /></svg>,

    policy_tabs: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="22" height="11" rx="3" fill="#7530fb" /><rect x="27" y="4" width="22" height="11" rx="3" fill="#e9d5ff" opacity="0.6" /><rect x="50" y="4" width="22" height="11" rx="3" fill="#e9d5ff" opacity="0.6" /><rect x="73" y="4" width="23" height="11" rx="3" fill="#e9d5ff" opacity="0.6" /><rect x="4" y="15" width="92" height="25" rx="0" fill="white" stroke="#ddd6fe" strokeWidth="0.5" /><rect x="8" y="20" width="84" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="8" y="26" width="70" height="2.5" rx="1.25" fill="#ddd6fe" /><rect x="8" y="32" width="60" height="2.5" rx="1.25" fill="#ddd6fe" /></svg>,

    nav_bar: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="14" width="92" height="16" rx="3" fill="#1e1535" /><rect x="10" y="19.5" width="13" height="3" rx="1.5" fill="white" opacity="0.8" /><rect x="27" y="19.5" width="13" height="3" rx="1.5" fill="white" opacity="0.8" /><rect x="44" y="19.5" width="13" height="3" rx="1.5" fill="white" opacity="0.8" /><rect x="61" y="19.5" width="13" height="3" rx="1.5" fill="white" opacity="0.8" /><rect x="78" y="17" width="14" height="8" rx="4" fill="#b8fa33" /></svg>,

    urgency_bar: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="14" width="92" height="16" rx="3" fill="#fee2e2" /><circle cx="14" cy="22" r="4" fill="#ef4444" opacity="0.75" /><rect x="22" y="19.5" width="60" height="3" rx="1.5" fill="#ef4444" opacity="0.65" /><rect x="22" y="25.5" width="42" height="2.5" rx="1.25" fill="#fca5a5" /></svg>,

    cross_sell: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="8" y="8" width="40" height="28" rx="3" fill="white" stroke="#ddd6fe" strokeWidth="1" /><rect x="52" y="8" width="40" height="28" rx="3" fill="white" stroke="#ddd6fe" strokeWidth="1" /><rect x="12" y="11" width="32" height="14" rx="2" fill="#ddd6fe" /><rect x="12" y="27" width="24" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="12" y="32" width="18" height="3" rx="1.5" fill="#7530fb" opacity="0.35" /><rect x="56" y="11" width="32" height="14" rx="2" fill="#ddd6fe" /><rect x="56" y="27" width="24" height="2.5" rx="1.25" fill="#c4b5fd" /><rect x="56" y="32" width="18" height="3" rx="1.5" fill="#7530fb" opacity="0.35" /></svg>,

    button_block: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="18" y="13" width="64" height="18" rx="9" fill="#7530fb" /><rect x="32" y="19.5" width="36" height="5" rx="2.5" fill="white" opacity="0.9" /></svg>,

    rectangle: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" /><rect x="12" y="10" width="76" height="24" rx="5" fill="#ddd6fe" stroke="#c4b5fd" strokeWidth="1" /></svg>,

    hero_header: () => <svg viewBox="0 0 100 44" fill="none"><defs><linearGradient id="g2" x1="0" y1="0" x2="100" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#7530fb" /><stop offset="1" stopColor="#1e1535" /></linearGradient></defs><rect x="4" y="4" width="92" height="36" rx="3" fill="url(#g2)" /><rect x="24" y="11" width="52" height="8" rx="4" fill="white" opacity="0.9" /><rect x="32" y="23" width="36" height="3" rx="1.5" fill="white" opacity="0.45" /><rect x="36" y="30" width="28" height="7" rx="3.5" fill="#b8fa33" /></svg>,

    raw_html: () => <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#1e1535" /><rect x="10" y="10" width="20" height="3.5" rx="1.75" fill="#7530fb" opacity="0.8" /><rect x="16" y="17" width="56" height="2.5" rx="1.25" fill="#c4b5fd" opacity="0.7" /><rect x="16" y="23" width="44" height="2.5" rx="1.25" fill="#b8fa33" opacity="0.6" /><rect x="16" y="29" width="36" height="2.5" rx="1.25" fill="#c4b5fd" opacity="0.5" /><rect x="10" y="33" width="14" height="3.5" rx="1.75" fill="#7530fb" opacity="0.8" /><rect x="32" y="9" width="3" height="26" rx="1.5" fill="#374151" /></svg>,
}

function Fallback({ color }: { color: string }) {
    return <svg viewBox="0 0 100 44" fill="none"><rect x="4" y="4" width="92" height="36" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" /><rect x="16" y="16" width="68" height="5" rx="2" fill={color} opacity="0.5" /><rect x="24" y="26" width="52" height="3" rx="1.5" fill="#ddd6fe" /></svg>
}

interface BlockLibraryProps {
    onAddBlock: (type: BlockType) => void
    onDragStart: (type: BlockType) => void
    onDragEnd: () => void
    draggedType: BlockType | null
}

export default function BlockLibrary({ onAddBlock, onDragStart, onDragEnd, draggedType }: BlockLibraryProps) {
    const [search, setSearch] = useState('')
    const [hoveredType, setHovered] = useState<BlockType | null>(null)
    const [collapsed, setCollapsed] = useState<Set<BlockCategory>>(new Set())

    const query = search.trim().toLowerCase()
    const filteredDefs = query
        ? BLOCK_DEFINITIONS.filter(d => d.label.toLowerCase().includes(query) || d.category.toLowerCase().includes(query))
        : BLOCK_DEFINITIONS

    const handleDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
        e.dataTransfer.setData('text/plain', type)
        e.dataTransfer.effectAllowed = 'copy'
        onDragStart(type)
    }, [onDragStart])

    const toggleCategory = (cat: BlockCategory) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            next.has(cat) ? next.delete(cat) : next.add(cat)
            return next
        })
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.bg, overflow: 'hidden' }}>

            {/* Search */}
            <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface, flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.muted, pointerEvents: 'none' }}>⌕</span>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blocks..."
                        style={{ width: '100%', boxSizing: 'border-box' as const, padding: '7px 10px 7px 28px', border: `1px solid ${C.inputBorder}`, borderRadius: 8, backgroundColor: C.bg, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.body, outline: 'none' }}
                        onFocus={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22` }}
                        onBlur={e => { e.currentTarget.style.borderColor = C.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 14, padding: 0 }}>×</button>}
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 16 }}>
                {query ? (
                    <div style={{ padding: '8px 10px 0' }}>
                        {filteredDefs.length === 0
                            ? <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>No blocks match "{search}"</div>
                            : <><p style={{ margin: '8px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>{filteredDefs.length} result{filteredDefs.length !== 1 ? 's' : ''}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                    {filteredDefs.map(def => <VisualCard key={def.type} def={def} hovered={hoveredType === def.type} dragging={draggedType === def.type} accentColor={CATEGORY_COLORS[def.category]} onHover={setHovered} onAdd={onAddBlock} onDragStart={handleDragStart} onDragEnd={onDragEnd} />)}
                                </div></>
                        }
                    </div>
                ) : (
                    BLOCK_CATEGORIES.map(cat => {
                        const defs = BLOCK_DEFINITIONS.filter(d => d.category === cat)
                        const isCollapsed = collapsed.has(cat)
                        return (
                            <div key={cat}>
                                <button onClick={() => toggleCategory(cat)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: CATEGORY_COLORS[cat], display: 'inline-block' }} />
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>{cat}</span>
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>{defs.length}</span>
                                    </div>
                                    <ChevronDown size={13} style={{ color: C.muted, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                                {!isCollapsed && (
                                    <div style={{ padding: '0 10px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                        {defs.map(def => <VisualCard key={def.type} def={def} hovered={hoveredType === def.type} dragging={draggedType === def.type} accentColor={CATEGORY_COLORS[def.category]} onHover={setHovered} onAdd={onAddBlock} onDragStart={handleDragStart} onDragEnd={onDragEnd} />)}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.border}`, backgroundColor: C.surface, flexShrink: 0 }}>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textAlign: 'center' }}>Click or drag to add</p>
            </div>
        </div>
    )
}

interface VisualCardProps {
    def: BlockDefinition; hovered: boolean; dragging: boolean; accentColor: string
    onHover: (t: BlockType | null) => void; onAdd: (t: BlockType) => void
    onDragStart: (e: React.DragEvent, t: BlockType) => void; onDragEnd: () => void
}

function VisualCard({ def, hovered, dragging, accentColor, onHover, onAdd, onDragStart, onDragEnd }: VisualCardProps) {
    const Preview = P[def.type]
    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, def.type)}
            onDragEnd={onDragEnd}
            onMouseEnter={() => onHover(def.type)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onAdd(def.type)}
            title={def.description}
            style={{
                borderRadius: 10,
                border: `1.5px solid ${hovered ? accentColor : C.border}`,
                backgroundColor: hovered ? C.primaryLight : C.surface,
                cursor: 'grab',
                opacity: dragging ? 0.4 : 1,
                transition: 'border-color 0.12s, background-color 0.12s, transform 0.1s, box-shadow 0.12s',
                transform: hovered ? 'translateY(-2px)' : 'none',
                boxShadow: hovered ? `0 4px 12px ${accentColor}22` : '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                userSelect: 'none' as const,
            }}
        >
            {/* Preview thumbnail */}
            <div style={{ backgroundColor: hovered ? `${accentColor}08` : '#fafafa', borderBottom: `1px solid ${hovered ? accentColor + '22' : C.border}`, padding: 4 }}>
                {Preview ? <Preview /> : <Fallback color={accentColor} />}
            </div>
            {/* Label */}
            <div style={{ padding: '5px 6px 6px' }}>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: hovered ? C.primary : C.body, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, transition: 'color 0.12s' }}>
                    {def.label}
                </p>
            </div>
        </div>
    )
}
