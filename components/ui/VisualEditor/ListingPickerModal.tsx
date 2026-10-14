'use client'
// components/ui/VisualEditor/ListingPickerModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Listing Picker Modal — lets the seller link a Listing Studio listing to the
// template they are designing. Fetches from listing_drafts, shows thumbnail +
// title + SKU + status badge, single-select, Confirm/Cancel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

// ── Design tokens (mirrors VisualEditor.tsx C object) ─────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#ddd6fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#d97706',
    warningLight: '#fef3c7',
    danger: '#ef4444',
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LinkedListing {
    id: string
    product_name: string | null
    title: string | null
    sku: string | null
    main_photo_url: string | null
    status: string | null
    sell_price: number | null
}

interface ListingPickerModalProps {
    /** Called with the selected listing, or null if user unlinks */
    onConfirm: (listing: LinkedListing) => void
    onClose: () => void
    /** Currently linked listing id (to pre-select it) */
    currentLinkedId?: string | null
}

// ── Status badge config ────────────────────────────────────────────────────────
function statusBadge(status: string | null) {
    switch (status) {
        case 'published': return { label: 'Live', bg: C.successLight, color: C.success }
        case 'draft': return { label: 'Draft', bg: C.primaryLight, color: C.primary }
        case 'scheduled': return { label: 'Scheduled', bg: '#fef3c7', color: C.warning }
        case 'ended': return { label: 'Ended', bg: '#f3f4f6', color: C.secondary }
        default: return { label: status ?? '—', bg: '#f3f4f6', color: C.secondary }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ListingPickerModal({
    onConfirm,
    onClose,
    currentLinkedId,
}: ListingPickerModalProps) {
    const [listings, setListings] = useState<LinkedListing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(currentLinkedId ?? null)
    const searchRef = useRef<HTMLInputElement>(null)

    // Focus search on mount
    useEffect(() => {
        setTimeout(() => searchRef.current?.focus(), 80)
    }, [])

    // Fetch listings
    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not logged in')

                const { data, error: fetchErr } = await (supabase.from('listing_drafts') as any)
                    .select('id, product_name, title, sku, main_photo_url, status, sell_price')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(200)

                if (fetchErr) throw fetchErr
                setListings((data ?? []) as LinkedListing[])
            } catch (e: any) {
                setError(e?.message ?? 'Failed to load listings')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Filter by search
    const filtered = listings.filter(l => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
            (l.product_name ?? '').toLowerCase().includes(q) ||
            (l.title ?? '').toLowerCase().includes(q) ||
            (l.sku ?? '').toLowerCase().includes(q)
        )
    })

    const selectedListing = listings.find(l => l.id === selectedId) ?? null

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        /* Backdrop */
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(30, 21, 53, 0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(3px)',
            }}
        >
            {/* Modal */}
            <div style={{
                width: 560, maxWidth: 'calc(100vw - 32px)',
                maxHeight: '80vh',
                backgroundColor: C.surface,
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                boxShadow: '0 24px 64px rgba(117, 48, 251, 0.18)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>

                {/* Header */}
                <div style={{
                    padding: '18px 20px 14px',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: 800,
                            fontSize: 16, color: C.dark, letterSpacing: '-0.3px',
                        }}>
                            Link to Listing
                        </div>
                        <div style={{
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                            color: C.secondary, marginTop: 2,
                        }}>
                            Select a listing — saving will push this template's HTML to it
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: `1px solid ${C.border}`,
                            backgroundColor: 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: C.secondary, fontSize: 16, lineHeight: 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.bg }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                        ×
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '12px 20px 8px', flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        >
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search title, SKU…"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                padding: '8px 12px 8px 32px',
                                border: `1px solid ${C.border}`, borderRadius: 8,
                                fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                                color: C.body, backgroundColor: C.bg,
                                outline: 'none',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                            onBlur={e => { e.currentTarget.style.borderColor = C.border }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                style={{
                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: C.muted, fontSize: 14, lineHeight: 1, padding: 2,
                                }}
                            >×</button>
                        )}
                    </div>
                </div>

                {/* Listing list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 8px' }}>
                    {loading && (
                        <div style={{
                            padding: 40, textAlign: 'center',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.muted,
                        }}>
                            Loading listings…
                        </div>
                    )}
                    {error && (
                        <div style={{
                            padding: 20, textAlign: 'center',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.danger,
                        }}>
                            {error}
                        </div>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                        <div style={{
                            padding: 40, textAlign: 'center',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.muted,
                        }}>
                            {search ? 'No listings match your search' : 'No listings found'}
                        </div>
                    )}
                    {!loading && !error && filtered.map(listing => {
                        const badge = statusBadge(listing.status)
                        const isSelected = listing.id === selectedId
                        const displayName = listing.product_name || listing.title || 'Untitled listing'
                        return (
                            <div
                                key={listing.id}
                                onClick={() => setSelectedId(isSelected ? null : listing.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 10px',
                                    borderRadius: 10,
                                    marginBottom: 2,
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? C.primaryLight : 'transparent',
                                    border: `1.5px solid ${isSelected ? C.primaryBorder : 'transparent'}`,
                                    transition: 'all 0.12s',
                                }}
                                onMouseEnter={e => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = C.bg
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                                    backgroundColor: '#f3f4f6',
                                    border: `1px solid ${C.border}`,
                                    overflow: 'hidden',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {listing.main_photo_url ? (
                                        <img
                                            src={listing.main_photo_url}
                                            alt={displayName}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                                        />
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                            stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                                        fontWeight: 600, color: C.dark,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {displayName}
                                    </div>
                                    <div style={{
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                        color: C.secondary, marginTop: 2,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        {listing.sku && <span>SKU: {listing.sku}</span>}
                                        {listing.sku && listing.sell_price != null && (
                                            <span style={{ color: C.border }}>·</span>
                                        )}
                                        {listing.sell_price != null && (
                                            <span>£{listing.sell_price.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div style={{
                                    padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                                    backgroundColor: badge.bg, color: badge.color,
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                                    fontWeight: 700, letterSpacing: '0.3px',
                                    textTransform: 'uppercase',
                                }}>
                                    {badge.label}
                                </div>

                                {/* Selected indicator */}
                                {isSelected && (
                                    <div style={{
                                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                        backgroundColor: C.primary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                            stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 20px',
                    borderTop: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                    backgroundColor: C.bg,
                }}>
                    <div style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.secondary,
                    }}>
                        {selectedListing
                            ? <span>
                                Selected: <strong style={{ color: C.dark }}>
                                    {selectedListing.product_name || selectedListing.title || 'Untitled'}
                                </strong>
                            </span>
                            : <span style={{ color: C.muted }}>No listing selected</span>
                        }
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '7px 16px', borderRadius: 8,
                                border: `1px solid ${C.border}`,
                                backgroundColor: 'transparent', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                                fontWeight: 500, color: C.secondary,
                                transition: 'all 0.12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (selectedListing) onConfirm(selectedListing)
                            }}
                            disabled={!selectedListing}
                            style={{
                                padding: '7px 18px', borderRadius: 8,
                                border: `1px solid ${selectedListing ? C.primary : C.border}`,
                                backgroundColor: selectedListing ? C.primary : 'transparent',
                                color: selectedListing ? '#fff' : C.muted,
                                cursor: selectedListing ? 'pointer' : 'default',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                                fontWeight: 600, transition: 'all 0.12s',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                            onMouseEnter={e => { if (selectedListing) e.currentTarget.style.backgroundColor = '#6020e0' }}
                            onMouseLeave={e => { if (selectedListing) e.currentTarget.style.backgroundColor = C.primary }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Confirm Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
