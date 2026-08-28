'use client'
// components/ui/VisualEditor/ImagesTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Images Tab
//
// Two sub-tabs:
//   My Assets   — images uploaded to Supabase Storage (template-assets bucket)
//                 Upload, delete, copy URL, insert into selected block
//   Stock Photos — Unsplash free search (no API key needed for demo endpoint)
//                 Search, click to insert URL into selected block
//
// Props:
//   onInsert(url, alt) — called when user clicks an image to insert
//                        parent wires this to update the selected block's src
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { type Block } from './blocks'
import {
    Upload, Search, Image as ImageIcon, Trash2,
    Copy, Check, Loader2, AlertCircle,
    FolderOpen, RefreshCw, ExternalLink,
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
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    success: '#16a34a',
    successBg: '#dcfce7',
}

const BUCKET = 'template-assets'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

// Unsplash demo endpoint — no API key, rate limited but works for demos
const UNSPLASH_DEMO = 'https://source.unsplash.com'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AssetFile {
    name: string
    url: string
    size: number
    created_at: string
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ImagesTabProps {
    onInsert: (url: string, alt: string) => void
    selectedId: string | null
    blocks: Block[]
}

// ── Helper ────────────────────────────────────────────────────────────────────
function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ImagesTab({ onInsert, selectedId, blocks }: ImagesTabProps) {
    const [activeTab, setActiveTab] = useState<'assets' | 'stock'>('assets')

    // ── Work out what the selected block is and if it accepts images ──────────
    const selectedBlock = blocks.find(b => b.id === selectedId) ?? null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blockProps = selectedBlock?.props as any
    const blockHasImageProp = selectedBlock
        ? ['src', 'imageUrl', 'logoUrl', 'bgImage'].some(k => k in (blockProps ?? {}))
        : false

    // Label shown in the banner
    const blockLabel: Record<string, string> = {
        product_image: 'Product Image',
        image: 'Image',
        hero_header: 'Hero Header (logo)',
        banner: 'Banner',
        cta_banner: 'CTA Banner',
        gallery_row: 'Gallery Row',
    }
    const selectedLabel = selectedBlock
        ? (blockLabel[selectedBlock.type] ?? selectedBlock.type)
        : null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg }}>

            {/* ── Header ── */}
            <div style={{
                padding: '14px 14px 0',
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
                    Images
                </p>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: 2 }}>
                    {(['assets', 'stock'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1, padding: '7px 4px',
                                border: 'none',
                                borderBottom: `2px solid ${activeTab === tab ? C.primary : 'transparent'}`,
                                backgroundColor: 'transparent', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                fontWeight: activeTab === tab ? 700 : 500,
                                color: activeTab === tab ? C.primary : C.secondary,
                                transition: 'all 0.15s',
                                textTransform: 'capitalize',
                            }}
                        >
                            {tab === 'assets' ? 'My Assets' : 'Stock Photos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Smart insert banner ── */}
            <div style={{
                margin: '0 10px 6px',
                padding: '7px 10px',
                borderRadius: 8,
                backgroundColor: blockHasImageProp
                    ? 'rgba(184,250,51,0.15)'
                    : selectedBlock && !blockHasImageProp
                        ? 'rgba(239,68,68,0.08)'
                        : 'rgba(117,48,251,0.07)',
                border: `1px solid ${blockHasImageProp
                        ? 'rgba(184,250,51,0.4)'
                        : selectedBlock && !blockHasImageProp
                            ? 'rgba(239,68,68,0.2)'
                            : 'rgba(117,48,251,0.15)'
                    }`,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
            }}>
                <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: blockHasImageProp
                        ? '#16a34a'
                        : selectedBlock && !blockHasImageProp
                            ? '#ef4444'
                            : '#7530fb',
                }} />
                <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10,
                    color: blockHasImageProp ? '#15803d'
                        : selectedBlock && !blockHasImageProp ? '#dc2626'
                            : '#7530fb',
                    lineHeight: 1.4,
                }}>
                    {blockHasImageProp
                        ? `Inserting into: ${selectedLabel}`
                        : selectedBlock && !blockHasImageProp
                            ? `${selectedLabel} doesn't support images — will add new block`
                            : 'No block selected — image will be added as new block'
                    }
                </p>
            </div>

            {/* ── Tab content ── */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'assets'
                    ? <AssetsTab onInsert={onInsert} />
                    : <StockTab onInsert={onInsert} />
                }
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSETS TAB — Supabase Storage
// ─────────────────────────────────────────────────────────────────────────────
function AssetsTab({ onInsert }: { onInsert: (url: string, alt: string) => void }) {
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [assets, setAssets] = useState<AssetFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
    const [deletingName, setDeletingName] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [insertedUrl, setInsertedUrl] = useState<string | null>(null)

    // Load assets from Supabase Storage
    const loadAssets = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setError('Sign in to manage your images'); setLoading(false); return }

            const { data, error: listError } = await supabase.storage
                .from(BUCKET)
                .list(user.id, { sortBy: { column: 'created_at', order: 'desc' } })

            if (listError) throw listError

            const files: AssetFile[] = await Promise.all(
                (data || []).filter(f => f.name !== '.emptyFolderPlaceholder').map(async f => {
                    const { data: urlData } = supabase.storage
                        .from(BUCKET)
                        .getPublicUrl(`${user.id}/${f.name}`)
                    return {
                        name: f.name,
                        url: urlData.publicUrl,
                        size: f.metadata?.size ?? 0,
                        created_at: f.created_at ?? '',
                    }
                })
            )
            setAssets(files)
        } catch (err) {
            setError('Could not load images. Check your storage settings.')
            console.error('[ImagesTab] load:', err)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => { loadAssets() }, [loadAssets])

    // Upload handler
    const handleUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return
        setUploading(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            for (const file of Array.from(files)) {
                if (file.size > MAX_FILE_SIZE) {
                    setError(`${file.name} is too large (max 5MB)`)
                    continue
                }
                if (!ALLOWED_TYPES.includes(file.type)) {
                    setError(`${file.name} — unsupported type`)
                    continue
                }

                const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
                const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
                const path = `${user.id}/${safeName}`

                const { error: uploadError } = await supabase.storage
                    .from(BUCKET)
                    .upload(path, file, { upsert: false, contentType: file.type })

                if (uploadError) throw uploadError
            }
            await loadAssets()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [supabase, loadAssets])

    // Delete handler
    const handleDelete = useCallback(async (name: string) => {
        setDeletingName(name)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            await supabase.storage.from(BUCKET).remove([`${user.id}/${name}`])
            setAssets(prev => prev.filter(a => a.name !== name))
        } catch (err) {
            setError('Delete failed')
        } finally {
            setDeletingName(null)
        }
    }, [supabase])

    // Copy URL
    const handleCopy = useCallback(async (url: string) => {
        await navigator.clipboard.writeText(url)
        setCopiedUrl(url)
        setTimeout(() => setCopiedUrl(null), 2000)
    }, [])

    // Insert into block
    const handleInsert = useCallback((url: string, name: string) => {
        onInsert(url, name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
        setInsertedUrl(url)
        setTimeout(() => setInsertedUrl(null), 1500)
    }, [onInsert])

    // Drag over
    const [dragOver, setDragOver] = useState(false)

    const filtered = search
        ? assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
        : assets

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Upload zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                    e.preventDefault()
                    setDragOver(false)
                    handleUpload(e.dataTransfer.files)
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    margin: '10px 12px 0',
                    padding: '14px',
                    border: `2px dashed ${dragOver ? C.primary : C.border}`,
                    borderRadius: 10,
                    backgroundColor: dragOver ? C.primaryLight : C.bg,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                }}
            >
                {uploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Loader2 size={16} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.primary }}>Uploading...</span>
                    </div>
                ) : (
                    <>
                        <Upload size={18} style={{ color: C.primary, margin: '0 auto 6px', display: 'block' }} />
                        <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: C.primary }}>
                            Drop images or click to upload
                        </p>
                        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                            JPG, PNG, GIF, WebP, SVG · Max 5MB
                        </p>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => handleUpload(e.target.files)}
                />
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    margin: '6px 12px 0',
                    padding: '8px 10px',
                    backgroundColor: C.dangerBg,
                    border: `1px solid #fecaca50`,
                    borderRadius: 7,
                    display: 'flex', alignItems: 'center', gap: 6,
                    flexShrink: 0,
                }}>
                    <AlertCircle size={12} style={{ color: C.danger, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.danger }}>{error}</p>
                </div>
            )}

            {/* Search */}
            <div style={{ padding: '8px 12px 0', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search uploads..."
                        style={{
                            width: '100%', boxSizing: 'border-box' as const,
                            padding: '6px 8px 6px 26px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 7, backgroundColor: C.surface,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                            color: C.body, outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Image grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 12px' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, gap: 8 }}>
                        <Loader2 size={18} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>Loading...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <FolderOpen size={28} style={{ color: C.border, margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>
                            {search ? `No results for "${search}"` : 'No images uploaded yet'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                                {filtered.length} image{filtered.length !== 1 ? 's' : ''}
                            </span>
                            <button onClick={loadAssets} style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted,
                                padding: 0,
                            }}>
                                <RefreshCw size={10} /> Refresh
                            </button>
                        </div>

                        {/* 2-column grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {filtered.map(asset => (
                                <AssetCard
                                    key={asset.name}
                                    asset={asset}
                                    inserted={insertedUrl === asset.url}
                                    copied={copiedUrl === asset.url}
                                    deleting={deletingName === asset.name}
                                    onInsert={() => handleInsert(asset.url, asset.name)}
                                    onCopy={() => handleCopy(asset.url)}
                                    onDelete={() => handleDelete(asset.name)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

// ── Asset card ────────────────────────────────────────────────────────────────
function AssetCard({
    asset, inserted, copied, deleting, onInsert, onCopy, onDelete,
}: {
    asset: AssetFile
    inserted: boolean
    copied: boolean
    deleting: boolean
    onInsert: () => void
    onCopy: () => void
    onDelete: () => void
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 8,
                border: `1.5px solid ${inserted ? C.primary : hovered ? C.primaryBorder : C.border}`,
                overflow: 'hidden',
                backgroundColor: C.surface,
                transition: 'border-color 0.15s',
                cursor: 'pointer',
            }}
        >
            {/* Image */}
            <div
                onClick={onInsert}
                style={{
                    height: 80, position: 'relative',
                    backgroundColor: C.bg,
                    overflow: 'hidden',
                }}
            >
                <img
                    src={asset.url}
                    alt={asset.name}
                    style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block',
                    }}
                    loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />

                {/* Insert overlay */}
                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: inserted ? 'rgba(22,163,74,0.7)' : 'rgba(117,48,251,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{
                            fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                            fontWeight: 700, color: '#fff',
                        }}>
                            {inserted ? '✓ Inserted' : '+ Insert'}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '5px 6px',
                borderTop: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
            }}>
                <p style={{
                    margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 9,
                    color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const, flex: 1,
                }}>
                    {formatSize(asset.size)}
                </p>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    {/* Copy URL */}
                    <IconBtn onClick={onCopy} title="Copy URL">
                        {copied ? <Check size={10} style={{ color: C.success }} /> : <Copy size={10} />}
                    </IconBtn>
                    {/* Delete */}
                    <IconBtn onClick={onDelete} title="Delete" danger>
                        {deleting
                            ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Trash2 size={10} />
                        }
                    </IconBtn>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK TAB — Pixabay search (key from api_fleet_config)
// ─────────────────────────────────────────────────────────────────────────────
interface PixabayPhoto {
    id: number
    webformatURL: string
    largeImageURL: string
    tags: string
    user: string
    webformatWidth: number
    webformatHeight: number
}

function StockTab({ onInsert }: { onInsert: (url: string, alt: string) => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<PixabayPhoto[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [insertedId, setInsertedId] = useState<number | null>(null)

    const SUGGESTIONS = [
        'product white background', 'electronics', 'clothing',
        'home decor', 'tools', 'car parts', 'jewellery',
        'sports equipment', 'books', 'packaging',
    ]

    // ── Search via proxy API route (key never exposed to client) ────────────────
    const searchPixabay = useCallback(async (q: string) => {
        if (!q.trim()) return
        setLoading(true)
        setError('')
        try {
            const res = await fetch(
                `/api/pixabay/search?q=${encodeURIComponent(q)}`
            )
            if (!res.ok) {
                setError('Search failed. Please try again.')
                return
            }
            const data = await res.json()
            const photos: PixabayPhoto[] = data.hits ?? []
            setResults(photos)
        } catch {
            setError('Network error — please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    const handleSearch = (q: string) => {
        setQuery(q)
        setResults([])
        searchPixabay(q)
    }

    const handleInsert = (photo: PixabayPhoto) => {
        onInsert(photo.largeImageURL, photo.tags.split(',')[0]?.trim() || query)
        // Show tick — insert either patched selected block or added new block
        // Both are valid outcomes so feedback is always accurate
        setInsertedId(photo.id)
        setTimeout(() => setInsertedId(null), 2000)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Search input */}
            <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSearch(query) }}
                        placeholder="Search Pixabay..."
                        style={{
                            width: '100%', boxSizing: 'border-box' as const,
                            padding: '7px 60px 7px 28px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 8, backgroundColor: C.surface,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                            color: C.body, outline: 'none',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22` }}
                        onBlur={e => { e.currentTarget.style.borderColor = C.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                    />
                    <button
                        onClick={() => handleSearch(query)}
                        disabled={!query.trim() || loading}
                        style={{
                            position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                            padding: '4px 8px', border: 'none', borderRadius: 6,
                            backgroundColor: C.primary, color: '#fff',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700,
                            cursor: query.trim() && !loading ? 'pointer' : 'default',
                            opacity: !query.trim() || loading ? 0.5 : 1,
                        }}
                    >
                        {loading ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : 'Go'}
                    </button>
                </div>
                <p style={{ margin: '5px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: C.muted }}>
                    Powered by Pixabay · Free for commercial use
                </p>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    margin: '0 12px 6px', padding: '8px 10px',
                    backgroundColor: '#fee2e2', borderRadius: 7,
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                }}>
                    <AlertCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#ef4444' }}>{error}</p>
                </div>
            )}

            {/* Suggestion pills */}
            {results.length === 0 && !loading && !error && (
                <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
                    <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                        Quick searches:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                        {SUGGESTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => handleSearch(s)}
                                style={{
                                    padding: '3px 8px',
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 20, backgroundColor: C.surface,
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                                    color: C.secondary, cursor: 'pointer',
                                    transition: 'all 0.12s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.secondary }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
                {loading && results.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, gap: 8 }}>
                        <Loader2 size={18} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>Searching...</span>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, alignItems: 'start' }}>
                            {results.map(photo => (
                                <StockPhotoCard
                                    key={photo.id}
                                    photo={photo}
                                    inserted={insertedId === photo.id}
                                    onInsert={() => handleInsert(photo)}
                                />
                            ))}
                        </div>

                    </>
                ) : null}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

// ── Stock photo card ──────────────────────────────────────────────────────────
function StockPhotoCard({
    photo, inserted, onInsert,
}: {
    photo: PixabayPhoto
    inserted: boolean
    onInsert: () => void
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onInsert}
            style={{
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `1.5px solid ${inserted ? C.primary : hovered ? C.primaryBorder : 'transparent'}`,
                transition: 'border-color 0.15s',
                backgroundColor: C.bg,
                // No fixed height — image shows at natural aspect ratio (Pinterest style)
            }}
        >
            <img
                src={photo.largeImageURL}
                alt={photo.tags.split(',')[0]?.trim() || 'Stock photo'}
                style={{
                    width: '100%',
                    height: 'auto',        // natural height — no cropping
                    display: 'block',
                }}
                loading="lazy"
            />

            {/* Hover overlay */}
            {(hovered || inserted) && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: inserted ? 'rgba(22,163,74,0.65)' : 'rgba(117,48,251,0.65)',
                    display: 'flex', flexDirection: 'column' as const,
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {inserted ? '✓ Inserted' : '+ Insert'}
                    </span>
                    {!inserted && (
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>
                            {photo.user}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON BUTTON HELPER
// ─────────────────────────────────────────────────────────────────────────────
function IconBtn({
    children, onClick, title, danger = false,
}: {
    children: React.ReactNode
    onClick: () => void
    title: string
    danger?: boolean
}) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={e => { e.stopPropagation(); onClick() }}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 22, height: 22, borderRadius: 5,
                border: `1px solid ${hovered && danger ? '#fecaca' : C.border}`,
                backgroundColor: hovered ? (danger ? C.dangerBg : C.primaryLight) : 'transparent',
                color: hovered ? (danger ? C.danger : C.primary) : C.muted,
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: 0, transition: 'all 0.12s',
            }}
        >
            {children}
        </button>
    )
}
