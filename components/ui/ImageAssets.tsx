'use client'
// components/ui/ImageAssets.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Image Assets Panel
//
// Reusable component for uploading + managing template images in Supabase Storage
// Can be used in:
//   - HTML Template Editor (html-editor/page.tsx)
//   - Listing Generator Step 2
//   - Any other page needing image management
//
// Usage:
//   import ImageAssets from '@/components/ui/ImageAssets'
//   <ImageAssets
//     open={showAssets}
//     onClose={() => setShowAssets(false)}
//     onInsert={(url) => insertImageAtCursor(url)}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
    X, Upload, Image as ImageIcon, Trash2,
    Copy, Check, Loader2, Search,
    AlertCircle, FolderOpen,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
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

// ── Types ──────────────────────────────────────────────────────────────────
interface AssetFile {
    name: string
    url: string
    size: number
    created_at: string
}

interface ImageAssetsProps {
    open: boolean
    onClose: () => void
    onInsert?: (url: string, htmlTag: string) => void  // called when user clicks "Insert"
    mode?: 'panel' | 'modal'                           // panel = slide in from right, modal = centered
}

// ── Helper ─────────────────────────────────────────────────────────────────
function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ImageAssets({
    open,
    onClose,
    onInsert,
    mode = 'panel',
}: ImageAssetsProps) {
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [assets, setAssets] = useState<AssetFile[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<AssetFile | null>(null)
    const [copiedUrl, setCopiedUrl] = useState('')
    const [deletingName, setDeletingName] = useState('')
    const [dragOver, setDragOver] = useState(false)

    // ── Load assets ─────────────────────────────────────────────────────────
    const loadAssets = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { data, error: listError } = await supabase.storage
                .from(BUCKET)
                .list(`${user.id}`, {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' },
                })

            if (listError) throw listError

            const files: AssetFile[] = (data || [])
                .filter(f => f.name !== '.emptyFolderPlaceholder')
                .map(f => ({
                    name: f.name,
                    size: f.metadata?.size ?? 0,
                    created_at: f.created_at ?? '',
                    url: supabase.storage
                        .from(BUCKET)
                        .getPublicUrl(`${user.id}/${f.name}`).data.publicUrl,
                }))

            setAssets(files)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load images')
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        if (open) loadAssets()
    }, [open, loadAssets])

    // ── Upload ───────────────────────────────────────────────────────────────
    async function uploadFiles(files: FileList | File[]) {
        const fileArr = Array.from(files)
        const invalid = fileArr.filter(f => !ALLOWED_TYPES.includes(f.type))
        const tooBig = fileArr.filter(f => f.size > MAX_FILE_SIZE)

        if (invalid.length) {
            setError(`Invalid file type: ${invalid.map(f => f.name).join(', ')}. Use JPG, PNG, GIF, WebP or SVG.`)
            return
        }
        if (tooBig.length) {
            setError(`File too large: ${tooBig.map(f => f.name).join(', ')}. Max 5MB per image.`)
            return
        }

        setUploading(true)
        setError('')
        setUploadProgress(0)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            for (let i = 0; i < fileArr.length; i++) {
                const file = fileArr[i]
                // Unique filename: timestamp + original name
                const ext = file.name.split('.').pop()
                const safeName = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
                const path = `${user.id}/${safeName}`

                const { error: upErr } = await supabase.storage
                    .from(BUCKET)
                    .upload(path, file, { upsert: false })

                if (upErr) throw upErr
                setUploadProgress(Math.round(((i + 1) / fileArr.length) * 100))
            }

            await loadAssets()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    // ── Delete ───────────────────────────────────────────────────────────────
    async function deleteAsset(asset: AssetFile) {
        setDeletingName(asset.name)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const { error: delErr } = await supabase.storage
                .from(BUCKET)
                .remove([`${user.id}/${asset.name}`])

            if (delErr) throw delErr

            setAssets(prev => prev.filter(a => a.name !== asset.name))
            if (selected?.name === asset.name) setSelected(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed')
        } finally {
            setDeletingName('')
        }
    }

    // ── Copy URL ─────────────────────────────────────────────────────────────
    async function copyUrl(url: string) {
        await navigator.clipboard.writeText(url)
        setCopiedUrl(url)
        setTimeout(() => setCopiedUrl(''), 2000)
    }

    // ── Insert into editor ───────────────────────────────────────────────────
    function handleInsert(asset: AssetFile) {
        if (!onInsert) return
        const tag = `<img src="${asset.url}" alt="Image" style="max-width:100%;height:auto;">`
        onInsert(asset.url, tag)
        onClose()
    }

    // ── Drag and drop ─────────────────────────────────────────────────────────
    function onDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
    }

    // ── Filtered assets ───────────────────────────────────────────────────────
    const filtered = assets.filter(a =>
        !search || a.name.toLowerCase().includes(search.toLowerCase())
    )

    if (!open) return null

    // ── Shared panel content ───────────────────────────────────────────────────
    const panelContent = (
        <div className="flex flex-col h-full" style={{ backgroundColor: C.surface }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
                style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: C.primaryLight }}>
                        <ImageIcon size={14} style={{ color: C.primary }} />
                    </div>
                    <div>
                        <p className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Image Assets
                        </p>
                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {assets.length} image{assets.length !== 1 ? 's' : ''} · Max 5MB each
                        </p>
                    </div>
                </div>
                <button onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 transition-all"
                    style={{ backgroundColor: C.bg, border: 'none', cursor: 'pointer' }}>
                    <X size={14} style={{ color: C.muted }} />
                </button>
            </div>

            {/* Upload zone */}
            <div className="px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div
                    className="rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{
                        border: `2px dashed ${dragOver ? C.primary : C.borderInput}`,
                        backgroundColor: dragOver ? C.primaryLight : C.bg,
                        padding: '16px 12px',
                    }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={20} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                            <p className="text-[12px] font-semibold" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                Uploading... {uploadProgress}%
                            </p>
                            <div className="w-full rounded-full overflow-hidden" style={{ height: 4, backgroundColor: C.border }}>
                                <div style={{ height: 4, width: `${uploadProgress}%`, backgroundColor: C.primary, transition: 'width 0.3s ease', borderRadius: 99 }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Upload size={20} style={{ color: dragOver ? C.primary : C.muted }} />
                            <p className="text-[12px] font-semibold text-center" style={{ color: dragOver ? C.primary : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                Drop images here or <span style={{ color: C.primary, textDecoration: 'underline' }}>browse</span>
                            </p>
                            <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                JPG, PNG, GIF, WebP, SVG · Max 5MB
                            </p>
                        </>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && uploadFiles(e.target.files)}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-3 flex items-start gap-2 p-3 rounded-xl shrink-0"
                    style={{ backgroundColor: C.dangerBg, border: `1px solid ${C.danger}20` }}>
                    <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0, marginTop: 1 }} />
                    <p className="text-[11px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
                </div>
            )}

            {/* Search */}
            {assets.length > 0 && (
                <div className="px-4 pt-3 shrink-0">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg }}>
                        <Search size={12} style={{ color: C.muted, flexShrink: 0 }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search images..."
                            className="flex-1 text-[12px] outline-none bg-transparent"
                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                        />
                    </div>
                </div>
            )}

            {/* Gallery grid */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <Loader2 size={18} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                        <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Loading images...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <FolderOpen size={24} style={{ color: C.border }} />
                        <p className="text-[12px] font-semibold" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                            {search ? `No images matching "${search}"` : 'No images uploaded yet'}
                        </p>
                        {!search && (
                            <p className="text-[11px] text-center" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Drop images above to get started
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {filtered.map(asset => {
                            const isSelected = selected?.name === asset.name
                            const isDeleting = deletingName === asset.name
                            return (
                                <div
                                    key={asset.name}
                                    onClick={() => setSelected(isSelected ? null : asset)}
                                    className="relative rounded-xl overflow-hidden cursor-pointer transition-all group"
                                    style={{
                                        border: `2px solid ${isSelected ? C.primary : C.border}`,
                                        boxShadow: isSelected ? `0 0 0 2px ${C.primaryLight}` : 'none',
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ aspectRatio: '1', backgroundColor: C.bg, overflow: 'hidden' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={asset.url}
                                            alt={asset.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all"
                                        style={{ backgroundColor: 'rgba(30,21,53,0.7)' }}>
                                        {onInsert && (
                                            <button
                                                onMouseDown={e => { e.stopPropagation(); handleInsert(asset) }}
                                                className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                                                style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                                Insert
                                            </button>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onMouseDown={e => { e.stopPropagation(); copyUrl(asset.url) }}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer' }}
                                                title="Copy URL">
                                                {copiedUrl === asset.url
                                                    ? <Check size={11} style={{ color: C.accent }} />
                                                    : <Copy size={11} style={{ color: '#fff' }} />
                                                }
                                            </button>
                                            <button
                                                onMouseDown={e => { e.stopPropagation(); deleteAsset(asset) }}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer' }}
                                                title="Delete">
                                                {isDeleting
                                                    ? <Loader2 size={11} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                                                    : <Trash2 size={11} style={{ color: '#fff' }} />
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* File name */}
                                    <div className="px-2 py-1.5" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                                        <p className="text-[10px] font-semibold truncate" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                            {asset.name.replace(/^\d+-/, '')}
                                        </p>
                                        <p className="text-[9px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            {formatSize(asset.size)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Selected image detail footer */}
            {selected && (
                <div className="px-4 py-3 shrink-0" style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                    <p className="text-[11px] font-semibold mb-1.5 truncate" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                        {selected.name.replace(/^\d+-/, '')}
                    </p>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={selected.url}
                            className="flex-1 text-[10px] px-2.5 py-1.5 rounded-lg outline-none truncate"
                            style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        />
                        <button onClick={() => copyUrl(selected.url)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                            style={{ backgroundColor: copiedUrl === selected.url ? C.successBg : C.primaryLight, color: copiedUrl === selected.url ? C.success : C.primary, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            {copiedUrl === selected.url ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy URL</>}
                        </button>
                        {onInsert && (
                            <button onClick={() => handleInsert(selected)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                                style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                Insert
                            </button>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    // ── Modal mode ─────────────────────────────────────────────────────────────
    if (mode === 'modal') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}>
                <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                    style={{ maxHeight: '85vh', backgroundColor: C.surface }}
                    onClick={e => e.stopPropagation()}>
                    {panelContent}
                </div>
            </div>
        )
    }

    // ── Panel mode (default) — slides in from right ────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex justify-end"
            style={{ pointerEvents: 'none' }}>
            {/* Backdrop */}
            <div className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', pointerEvents: 'auto' }}
                onClick={onClose}
            />
            {/* Panel */}
            <div className="relative flex flex-col shadow-2xl"
                style={{
                    width: 360,
                    height: '100vh',
                    backgroundColor: C.surface,
                    pointerEvents: 'auto',
                    animation: 'slideInRight 0.25s cubic-bezier(0.4,0,0.2,1)',
                }}>
                {panelContent}
            </div>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </div>
    )
}
