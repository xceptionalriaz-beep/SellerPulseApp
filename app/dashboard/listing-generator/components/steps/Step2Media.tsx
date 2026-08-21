'use client'
// app/dashboard/listing-generator/components/steps/Step2Media.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio — Step 2: Photos & Description
//
//   ✓ 12-slot photo grid (1 main cover + 11 secondary)
//   ✓ Upload to Supabase Storage
//   ✓ Hover actions: Set as Cover, Remove
//   ✓ AI Background Remove (UI ready, Phase 2)
//   ✓ Condition description (used items only)
//   ✓ Rich text description editor
//   ✓ AI Write Description (uses Step 1 data)
//   ✓ Plain text / HTML toggle
//   ✓ 500k char counter
//   ✓ Step validation
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect, JSX, MouseEvent as ReactMouseEvent } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Upload, X, Star, AlertCircle, CheckCircle2,
    ChevronRight, ChevronLeft, FileText,
    Trash2, Loader2, Info, ImagePlus, Wand2, Video,
    Copy, Image as ImageIcon, Zap,
} from 'lucide-react'
import type { DraftData } from '../LgStudio'
import { AIButton, SecondaryButton } from '@/components/ui/Buttons'
import Tooltip from '@/components/ui/Tooltip'
import {
    EditorToolbar, sanitiseHtml, DESCRIPTION_TEMPLATES,
} from '@/components/ui/EditorToolbar'
import DescriptionLibrary from '@/components/ui/DescriptionLibrary'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    info: '#0ea5e9',
    infoBg: '#e0f2fe',
}

// ── Constants ─────────────────────────────────────────────────
const MAX_PHOTOS = 12 // eBay real limit
const MAX_FILE_SIZE_MB = 12
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const USED_CONDITIONS = [
    'Used - Like New',
    'Used - Good',
    'Used - Acceptable',
    'For parts or not working',
    'New with defects',
    'New without tags',
]

// ── Description templates ─────────────────────────────────────
const TEMPLATES: { label: string; icon: string; html: string }[] = [
    {
        label: 'Electronics',
        icon: '💻',
        html: `<p><strong>Product Overview</strong></p><p>High-quality item in excellent condition. Please read full description before purchasing.</p><ul><li>Brand new / excellent condition</li><li>All accessories included</li><li>Fully tested and working</li><li>Fast dispatch within 1 business day</li></ul><p><strong>What's in the Box:</strong></p><ul><li>Main unit</li><li>Original accessories</li><li>Packaging</li></ul><p>Any questions? Please message before buying. 100% positive feedback guaranteed.</p>`,
    },
    {
        label: 'Clothing',
        icon: '👗',
        html: `<p><strong>Item Description</strong></p><p>Great condition item from a smoke-free, pet-free home.</p><ul><li>Size: Please check measurements below</li><li>Material: As labelled</li><li>Condition: See photos for full detail</li><li>Washing instructions: As per label</li></ul><p><strong>Measurements (approx):</strong></p><ul><li>Chest: </li><li>Length: </li><li>Waist: </li></ul><p>Please check all photos carefully. Happy to answer any questions!</p>`,
    },
    {
        label: 'Used Item',
        icon: '🔄',
        html: `<p><strong>Used Item — Please Read</strong></p><p>This item is used and shows normal signs of wear as described and shown in photos. All faults are disclosed.</p><ul><li>Item has been tested and is fully functional</li><li>Photos show actual item — please review carefully</li><li>All accessories listed are included</li><li>No returns unless item significantly not as described</li></ul><p>Please ask any questions before purchasing. I aim to respond within a few hours.</p>`,
    },
    {
        label: 'General',
        icon: '📦',
        html: `<p><strong>About This Item</strong></p><p>Thank you for viewing my listing. Please see below for full details.</p><ul><li>Item as described and photographed</li><li>Fast and secure dispatch</li><li>Combined postage available</li><li>Please check my other listings</li></ul><p>Feel free to message with any questions. Positive feedback always left for prompt payment.</p>`,
    },
]
interface Props {
    draft: DraftData
    onChange: (updates: Partial<DraftData>) => void
    onNext: () => void
    onPrev: () => void
    onSave?: () => void
}

// ── Photo type ────────────────────────────────────────────────
interface Photo {
    id: string
    url: string
    file?: File
    uploading?: boolean
    path?: string
}

// ── Main Component ────────────────────────────────────────────
export default function Step2Media({ draft, onChange, onNext, onPrev, onSave }: Props): JSX.Element {
    const supabase = createClient()
    const supabaseRef = useRef(supabase)
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const dragItemRef = useRef<number | null>(null)
    const dragOverRef = useRef<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [photos, setPhotos] = useState<Photo[]>(() => {
        if (draft.photo_urls?.length) {
            return draft.photo_urls.map((url, i) => ({ id: `saved-${i}`, url }))
        }
        if (draft.main_photo_url) {
            return [{ id: 'saved-0', url: draft.main_photo_url }]
        }
        return []
    })
    const [dragOver, setDragOver] = useState(false)
    const [fileError, setFileError] = useState<string | null>(null)
    const [aiDescLoading, setAiDescLoading] = useState(false)
    const [bgRemoving, setBgRemoving] = useState<Set<string>>(new Set())
    const [batchCleaning, setBatchCleaning] = useState(false)
    const [videoUploading, setVideoUploading] = useState(false)
    const videoInputRef = useRef<HTMLInputElement>(null)

    // ── Description editor state ──────────────────────────────
    const descRef = useRef<HTMLDivElement>(null)
    const codeTextareaRef = useRef<HTMLTextAreaElement>(null)
    const lineNumbersRef = useRef<HTMLDivElement>(null)
    const [htmlContent, setHtmlContent] = useState(draft.description_html || '')
    const [descMode, setDescMode] = useState<'rich' | 'html'>('rich')
    const [descTab, setDescTab] = useState<'templates' | 'library'>('templates')
    const [descPreview, setDescPreview] = useState<'edit' | 'mobile' | 'desktop'>('edit')
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
    const [copied, setCopied] = useState(false)
    const [autoSaved, setAutoSaved] = useState(false)

    function copyContent() {
        navigator.clipboard.writeText(htmlContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const isUsedCondition = USED_CONDITIONS.includes(draft.condition)
    const uploadedCount = photos.filter(p => !p.uploading).length

    // ── Editor effects ────────────────────────────────────────
    useEffect(() => {
        if (descRef.current && draft.description_html) {
            descRef.current.innerHTML = draft.description_html
            setHtmlContent(draft.description_html)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    useEffect(() => {
        const t = setTimeout(() => {
            if (htmlContent) onChange({ description_html: sanitiseHtml(htmlContent) })
        }, 500)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [htmlContent])

    useEffect(() => {
        function onSel() {
            if (!descRef.current?.contains(document.activeElement) &&
                document.activeElement !== descRef.current) return
            updateFormats()
        }
        document.addEventListener('selectionchange', onSel)
        return () => document.removeEventListener('selectionchange', onSel)
    }, [])

    function updateFormats() {
        const f = new Set<string>()
        try {
            if (document.queryCommandState('bold')) f.add('bold')
            if (document.queryCommandState('italic')) f.add('italic')
            if (document.queryCommandState('underline')) f.add('underline')
            if (document.queryCommandState('insertUnorderedList')) f.add('ul')
            if (document.queryCommandState('insertOrderedList')) f.add('ol')
            if (document.queryCommandState('justifyLeft')) f.add('left')
            if (document.queryCommandState('justifyCenter')) f.add('center')
            if (document.queryCommandState('justifyRight')) f.add('right')
            const block = document.queryCommandValue('formatBlock').toLowerCase().replace(/<|>/g, '')
            if (block && block !== 'div') f.add(block)
        } catch { }
        setActiveFormats(f)
    }

    function execCmd(cmd: string, val?: string) {
        if (!descRef.current) return
        descRef.current.focus()

        if (cmd === 'removeFormat') {
            const sel = window.getSelection()
            const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed

            if (!hasSelection) {
                // Nothing selected — select the current paragraph/block only
                document.execCommand('selectAll', false, undefined)
                const newSel = window.getSelection()
                if (newSel && newSel.rangeCount > 0) {
                    // Narrow to just current line by using formatBlock on paragraph
                    document.execCommand('removeFormat', false, undefined)
                    document.execCommand('formatBlock', false, '<p>')
                    if (document.queryCommandState('insertUnorderedList'))
                        document.execCommand('insertUnorderedList', false, undefined)
                    if (document.queryCommandState('insertOrderedList'))
                        document.execCommand('insertOrderedList', false, undefined)
                    newSel.collapseToEnd()
                }
            } else {
                // Has selection — clear formatting on selected text only
                document.execCommand('removeFormat', false, undefined)
                document.execCommand('formatBlock', false, '<p>')
                if (document.queryCommandState('insertUnorderedList'))
                    document.execCommand('insertUnorderedList', false, undefined)
                if (document.queryCommandState('insertOrderedList'))
                    document.execCommand('insertOrderedList', false, undefined)
            }
        } else if (cmd === 'formatBlock' && val) {
            const cur = document.queryCommandValue('formatBlock').toLowerCase().replace(/<|>/g, '')
            document.execCommand('formatBlock', false, cur === val.replace(/<|>/g, '') ? '<p>' : val)
        } else if (cmd === 'insertUnorderedList' || cmd === 'insertOrderedList') {
            const sel = window.getSelection()
            if (sel?.rangeCount && sel.getRangeAt(0).commonAncestorContainer === descRef.current)
                document.execCommand('formatBlock', false, '<p>')
            document.execCommand(cmd, false, val)
        } else {
            document.execCommand(cmd, false, val)
        }

        if (descRef.current) setHtmlContent(descRef.current.innerHTML)
        updateFormats()
    }

    function onInput() {
        if (!descRef.current) return
        const html = descRef.current.innerHTML
        setHtmlContent(html)
        onChange({ description_html: sanitiseHtml(html) })
        scheduleAutosave(html)
    }


    function clearContent() {
        setHtmlContent('')
        onChange({ description_html: '' })
        if (descRef.current) descRef.current.innerHTML = ''
    }

    function applyTemplate(html: string) {
        const clean = sanitiseHtml(html)
        setHtmlContent(clean)
        onChange({ description_html: clean })
        if (descRef.current) descRef.current.innerHTML = clean
        setDescPreview('edit')
    }

    const charCount = htmlContent.replace(/<[^>]*>/g, '').length
    const wordCount = htmlContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
    const CHAR_LIMIT = 500000

    // ── Debounced autosave — fires 1.5s after user stops typing ──
    function scheduleAutosave(newHtml: string) {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = setTimeout(() => {
            onSave?.()
            setAutoSaved(true)
            setTimeout(() => setAutoSaved(false), 2000)
        }, 1500)
    }

    const canProceed = !!(
        photos.length >= 1 &&
        draft.description_html &&
        draft.description_html.length > 10 &&
        (!isUsedCondition || draft.condition_description)
    )

    // ── Upload photo to Supabase ──────────────────────────────
    const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
        try {
            const { data: { user } } = await supabaseRef.current.auth.getUser()
            if (!user) return null
            const ext = file.name.split('.').pop()
            const path = `${user.id}/${draft.sku || 'draft'}/${Date.now()}.${ext}`
            const { error } = await supabaseRef.current.storage
                .from('listing-photos')
                .upload(path, file, { upsert: true })
            if (error) throw error
            const { data } = supabaseRef.current.storage
                .from('listing-photos')
                .getPublicUrl(path)
            return data.publicUrl
        } catch (e) {
            console.error('[Step2] Upload error:', e)
            return null
        }
    }, [draft.sku])

    // ── Save all photo URLs to draft ──────────────────────────
    function syncPhotosToDraft(updated: Photo[]) {
        const urls = updated.filter(p => !p.uploading).map(p => p.url)
        onChange({
            main_photo_url: urls[0] || '',
            photo_urls: urls,
        })
    }

    // ── Handle file selection with validation ─────────────────
    async function handleFiles(files: FileList | null) {
        if (!files) return
        setFileError(null)

        const remaining = MAX_PHOTOS - photos.length
        const toAdd = Array.from(files).slice(0, remaining)
        if (!toAdd.length) return

        // Validate each file
        for (const file of toAdd) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setFileError(`"${file.name}" is not supported. Use JPEG, PNG or WEBP.`)
                return
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                setFileError(`"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`)
                return
            }
        }

        // Add placeholders immediately for instant preview
        const placeholders: Photo[] = toAdd.map((file, i) => ({
            id: `upload-${Date.now()}-${i}`,
            url: URL.createObjectURL(file),
            file,
            uploading: true,
        }))

        setPhotos(prev => {
            const updated = [...prev, ...placeholders]
            return updated
        })

        // Upload each and update URL when done — use functional update to avoid stale state
        for (const placeholder of placeholders) {
            if (!placeholder.file) continue
            const url = await uploadPhoto(placeholder.file)
            setPhotos(prev => {
                const updated = prev.map(p =>
                    p.id === placeholder.id
                        ? { ...p, url: url || p.url, uploading: false }
                        : p
                )
                syncPhotosToDraft(updated)
                return updated
            })
        }
    }

    // ── Drag to reorder photos ───────────────────────────────
    function onDragStart(idx: number) {
        dragItemRef.current = idx
    }
    function onDragEnter(idx: number) {
        dragOverRef.current = idx
    }
    function onDragEnd() {
        if (dragItemRef.current === null || dragOverRef.current === null) return
        if (dragItemRef.current === dragOverRef.current) return
        setPhotos(prev => {
            const updated = [...prev]
            const [dragged] = updated.splice(dragItemRef.current!, 1)
            updated.splice(dragOverRef.current!, 0, dragged)
            dragItemRef.current = null
            dragOverRef.current = null
            syncPhotosToDraft(updated)
            return updated
        })
    }

    // ── Set photo as main cover ───────────────────────────────
    function setAsCover(id: string) {
        setPhotos(prev => {
            const idx = prev.findIndex(p => p.id === id)
            if (idx <= 0) return prev
            const updated = [...prev]
            const [photo] = updated.splice(idx, 1)
            updated.unshift(photo)
            syncPhotosToDraft(updated)
            return updated
        })
    }

    // ── Remove photo — from state AND Supabase Storage ──────────
    async function removePhoto(id: string) {
        setPhotos(prev => {
            const updated = prev.filter(p => p.id !== id)
            syncPhotosToDraft(updated)
            return updated
        })
        // Delete from Supabase Storage by extracting path from URL
        try {
            const photo = photos.find(p => p.id === id)
            if (!photo?.url || photo.uploading) return
            // Extract storage path from public URL
            // URL format: .../storage/v1/object/public/listing-photos/USER_ID/...
            const match = photo.url.match(/listing-photos\/(.+)$/)
            if (match) {
                await supabaseRef.current.storage
                    .from('listing-photos')
                    .remove([decodeURIComponent(match[1])])
            }
        } catch (e) {
            console.error('[Step2] Delete from storage error:', e)
        }
    }

    // ── Remove background — calls our self-hosted FastAPI service ──
    async function removeBg(id: string) {
        const photo = photos.find(p => p.id === id)
        if (!photo || photo.uploading) return

        setBgRemoving(prev => new Set(prev).add(id))
        try {
            // 1. Call our Next.js proxy → FastAPI service
            const res = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: photo.url }),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Failed' }))
                throw new Error(err.error || `HTTP ${res.status}`)
            }

            // 2. Get PNG blob from response
            const pngBlob = await res.blob()
            const pngFile = new File([pngBlob], `bg-removed-${Date.now()}.png`, { type: 'image/png' })

            // 3. Upload cleaned image to Supabase Storage
            const newUrl = await uploadPhoto(pngFile)
            if (!newUrl) throw new Error('Upload failed after BG removal')

            // 4. Delete old image from Supabase Storage
            try {
                const match = photo.url.match(/listing-photos\/(.+)$/)
                if (match) {
                    await supabaseRef.current.storage
                        .from('listing-photos')
                        .remove([decodeURIComponent(match[1])])
                }
            } catch { /* non-fatal */ }

            // 5. Update photo in state with new URL
            setPhotos(prev => {
                const updated = prev.map(p =>
                    p.id === id ? { ...p, url: newUrl } : p
                )
                syncPhotosToDraft(updated)
                return updated
            })
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error'
            console.error('[Step2] removeBg error:', msg)
            setFileError(`Background removal failed: ${msg}`)
        }
        setBgRemoving(prev => { const s = new Set(prev); s.delete(id); return s })
    }

    // ── Batch clean all backgrounds ───────────────────────────
    async function batchCleanAll() {
        setBatchCleaning(true)
        for (const photo of photos) {
            await removeBg(photo.id)
        }
        setBatchCleaning(false)
    }

    // ── Upload video to Supabase ──────────────────────────────
    async function handleVideo(files: FileList | null) {
        const file = files?.[0]
        if (!file) return

        // Validate
        if (file.type !== 'video/mp4') {
            setFileError('Only MP4 videos are supported by eBay.')
            return
        }
        if (file.size > 150 * 1024 * 1024) {
            setFileError('Video must be under 150MB (eBay limit).')
            return
        }

        setVideoUploading(true)
        setFileError(null)
        try {
            const { data: { user } } = await supabaseRef.current.auth.getUser()
            if (!user) return
            const path = `${user.id}/${draft.sku || 'draft'}/video-${Date.now()}.mp4`
            const { error } = await supabaseRef.current.storage
                .from('listing-photos')
                .upload(path, file, { upsert: true })
            if (error) throw error
            const { data } = supabaseRef.current.storage
                .from('listing-photos')
                .getPublicUrl(path)
            onChange({ video_url: data.publicUrl })
        } catch (e) {
            setFileError('Video upload failed. Please try again.')
            console.error('[Step2] Video upload error:', e)
        }
        setVideoUploading(false)
    }
    async function generateDescription() {
        setAiDescLoading(true)
        try {
            const specifics = Object.entries(draft.item_specifics || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `Write a professional eBay product description for this listing.

Product Title: ${draft.title || draft.product_name}
Category: ${draft.category}
Condition: ${draft.condition}
Seller Type: ${draft.seller_type}
Item Specifics: ${specifics || 'Not provided'}

Requirements:
- Mobile-optimized, short paragraphs
- Start with a strong 1-line hook about the product
- 3-5 bullet points of key features using the item specifics above
- Mention condition clearly
- End with a short trust/buyer confidence statement
- Use HTML tags only: <p>, <ul>, <li>, <strong>
- No inline styles, no price, no shipping info
- Keep under 400 words
- Return ONLY the HTML, nothing else`
                    }]
                })
            })
            const data = await response.json()
            const html = data.content?.[0]?.text?.trim() || ''
            if (html) {
                onChange({ description_html: html })
            }
        } catch (e) {
            console.error('[Step2] AI description error:', e)
        }
        setAiDescLoading(false)
    }


    // ── Render ────────────────────────────────────────────────
    return (
        <div className="flex flex-col xl:h-full">

            {/* Main content — side-by-side on xl+, stacked on mobile/tablet */}
            <div className="flex flex-col xl:flex-1 xl:min-h-0 xl:overflow-hidden xl:px-[5%]">
                <div className="flex flex-col xl:flex-1 xl:flex-row xl:min-h-0 xl:overflow-hidden">

                    {/* ── LEFT: Photos + Video ──────────────────────── */}
                    <div className="xl:w-[720px] xl:shrink-0 xl:overflow-y-auto p-3 md:p-4 xl:p-5 flex flex-col gap-3 md:gap-4 scrollbar-hide xl:border-r xl:border-[#ede9fe]"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                        {/* ── Photos ─────────────────────────────── */}
                        <div className="flex flex-col gap-3">

                            {/* Section header */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        <ImageIcon size={13} style={{ color: C.primary }} />
                                    </div>
                                    <h2 className="text-[14px] font-bold shrink-0"
                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        Product Photos
                                    </h2>
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                                        style={{
                                            backgroundColor: uploadedCount >= 1 ? C.successBg : C.warningBg,
                                            color: uploadedCount >= 1 ? C.success : C.warning,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        {uploadedCount}/{MAX_PHOTOS}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Batch Clean All */}
                                    {photos.length > 0 && (
                                        <button
                                            onClick={batchCleanAll}
                                            disabled={batchCleaning}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: C.primary,
                                                border: `1px solid ${C.primary}`,
                                                fontFamily: 'DM Sans, sans-serif',
                                            }}>
                                            {batchCleaning
                                                ? <Loader2 size={11} className="animate-spin" />
                                                : <Wand2 size={11} />
                                            }
                                            <span className="hidden md:inline">{batchCleaning ? 'Cleaning...' : 'Clean All'}</span>
                                        </button>
                                    )}
                                    {/* Upload more */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        <ImagePlus size={11} />
                                        <span className="hidden md:inline">Upload More</span>
                                        <span className="md:hidden">Upload</span>
                                    </button>
                                </div>
                            </div>

                            {/* Info banner */}
                            <div className="flex items-start gap-2 p-3 rounded-xl"
                                style={{ backgroundColor: C.infoBg, border: `1px solid #bae6fd` }}>
                                <Info size={13} style={{ color: C.info, flexShrink: 0, marginTop: 1 }} />
                                <p className="text-[12px]"
                                    style={{ color: '#0369a1', fontFamily: 'DM Sans, sans-serif' }}>
                                    Main photo needs a pure white background for eBay search compliance. Max {MAX_PHOTOS} photos, JPEG/PNG/WEBP only, up to {MAX_FILE_SIZE_MB}MB each.
                                </p>
                            </div>

                            {/* File error */}
                            {fileError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl"
                                    style={{ backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                                    <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0 }} />
                                    <p className="text-[12px] flex-1"
                                        style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                        {fileError}
                                    </p>
                                    <button onClick={() => setFileError(null)}>
                                        <X size={13} style={{ color: C.danger }} />
                                    </button>
                                </div>
                            )}

                            {/* Photo grid — main large + 11 secondary */}
                            <div
                                className="rounded-2xl p-2 md:p-3 xl:p-4 relative"
                                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}>

                                {dragOver && (
                                    <div className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(117,48,251,0.08)', border: `2px dashed ${C.primary}` }}>
                                        <p className="text-[14px] font-bold" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                                            Drop photos here
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">

                                    {/* LEFT — cover + 2 slots below it */}
                                    <div className="flex flex-col gap-2 shrink-0" style={{ width: "clamp(140px, 35vw, 220px)" }}>

                                        {/* Main cover */}
                                        {(() => {
                                            const photo = photos[0]
                                            if (photo) {
                                                return (
                                                    <div className="relative rounded-2xl overflow-hidden group"
                                                        draggable
                                                        onDragStart={() => onDragStart(0)}
                                                        onDragEnter={() => onDragEnter(0)}
                                                        onDragEnd={onDragEnd}
                                                        style={{ aspectRatio: '1', border: `2px solid ${C.primary}`, cursor: 'grab' }}>
                                                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                                                            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                                            MAIN COVER
                                                        </div>
                                                        {photo.uploading && (
                                                            <div className="absolute inset-0 flex items-center justify-center"
                                                                style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                                                <Loader2 size={28} className="animate-spin" style={{ color: C.primary }} />
                                                            </div>
                                                        )}
                                                        {!photo.uploading && (
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
                                                                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                                                                <button onClick={() => removeBg(photo.id)} disabled={bgRemoving.has(photo.id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                                                    style={{ backgroundColor: 'rgba(117,48,251,0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                                    {bgRemoving.has(photo.id) ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                                                                    {bgRemoving.has(photo.id) ? 'Removing...' : '✨ Remove BG'}
                                                                </button>
                                                                <button onClick={() => removePhoto(photo.id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                                                                    style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff' }}>
                                                                    <Trash2 size={11} /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }
                                            return (
                                                <button onClick={() => fileInputRef.current?.click()}
                                                    className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
                                                    style={{ aspectRatio: '1', border: `2px dashed ${C.primary}`, backgroundColor: C.primaryLight }}>
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.primary }}>
                                                        <Upload size={22} style={{ color: '#fff' }} />
                                                    </div>
                                                    <p className="text-[13px] font-bold" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>Add Cover Photo</p>
                                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Main eBay thumbnail</p>
                                                </button>
                                            )
                                        })()}

                                        {/* 2 slots directly under cover — hidden on tablet (those 2 move to right grid) */}
                                        <div className="hidden xl:grid grid-cols-2 gap-2">
                                            {Array.from({ length: 2 }).map((_, i) => {
                                                const photo = photos[i + 1]
                                                if (photo) {
                                                    return (
                                                        <div key={photo.id} className="relative rounded-xl overflow-hidden group"
                                                            draggable
                                                            onDragStart={() => onDragStart(i + 1)}
                                                            onDragEnter={() => onDragEnter(i + 1)}
                                                            onDragEnd={onDragEnd}
                                                            style={{ aspectRatio: '1', border: `1px solid ${C.border}`, cursor: 'grab' }}>
                                                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                                            {photo.uploading && (
                                                                <div className="absolute inset-0 flex items-center justify-center"
                                                                    style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                                                    <Loader2 size={14} className="animate-spin" style={{ color: C.primary }} />
                                                                </div>
                                                            )}
                                                            {!photo.uploading && (
                                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                                                                    style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                                                                    <button onClick={() => removeBg(photo.id)} disabled={bgRemoving.has(photo.id)}
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold"
                                                                        style={{ backgroundColor: 'rgba(117,48,251,0.85)', color: '#fff' }}>
                                                                        {bgRemoving.has(photo.id) ? <Loader2 size={8} className="animate-spin" /> : <Wand2 size={8} />} BG
                                                                    </button>
                                                                    <button onClick={() => setAsCover(photo.id)}
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold"
                                                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                                                        <Star size={8} /> Cover
                                                                    </button>
                                                                    <button onClick={() => removePhoto(photo.id)}
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold"
                                                                        style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff' }}>
                                                                        <Trash2 size={8} /> Del
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                }
                                                return (
                                                    <button key={`under-${i}`} onClick={() => fileInputRef.current?.click()}
                                                        className="rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                                                        style={{ aspectRatio: '1', border: `1.5px dashed ${C.border}`, backgroundColor: C.bg }}>
                                                        <span className="text-[18px]" style={{ color: C.border }}>+</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* RIGHT — remaining 9 slots in 3-col grid */}
                                    <div className="flex-1 grid grid-cols-4 md:grid-cols-6 xl:grid-cols-3 gap-1 xl:gap-2 content-start">
                                        {/* tablet: show all 11 from index 1; xl: show 9 from index 3 */}
                                        {Array.from({ length: 11 }).map((_, i) => {
                                            const photo = photos[i + 1]
                                            // On xl, slots 0 and 1 are shown under the cover — hide them here
                                            const hideOnXl = i < 2
                                            if (photo) {
                                                return (
                                                    <div key={photo.id}
                                                        className={`relative rounded-xl overflow-hidden group${hideOnXl ? ' xl:hidden' : ''}`}
                                                        draggable
                                                        onDragStart={() => onDragStart(i + 1)}
                                                        onDragEnter={() => onDragEnter(i + 1)}
                                                        onDragEnd={onDragEnd}
                                                        style={{ aspectRatio: '1', border: `1px solid ${C.border}`, cursor: 'grab' }}>
                                                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                                        {photo.uploading && (
                                                            <div className="absolute inset-0 flex items-center justify-center"
                                                                style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                                                <Loader2 size={14} className="animate-spin" style={{ color: C.primary }} />
                                                            </div>
                                                        )}
                                                        {!photo.uploading && (
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                                                                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                                                                <button onClick={() => removeBg(photo.id)} disabled={bgRemoving.has(photo.id)}
                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold"
                                                                    style={{ backgroundColor: 'rgba(117,48,251,0.85)', color: '#fff' }}>
                                                                    {bgRemoving.has(photo.id) ? <Loader2 size={8} className="animate-spin" /> : <Wand2 size={8} />} BG
                                                                </button>
                                                                <button onClick={() => setAsCover(photo.id)}
                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold"
                                                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                                                                    <Star size={8} /> Cover
                                                                </button>
                                                                <button onClick={() => removePhoto(photo.id)}
                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold"
                                                                    style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff' }}>
                                                                    <Trash2 size={8} /> Del
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }
                                            return (
                                                <button key={`empty-${i}`} onClick={() => fileInputRef.current?.click()}
                                                    className={`rounded-xl flex items-center justify-center transition-all hover:opacity-70${hideOnXl ? ' xl:hidden' : ''}`}
                                                    style={{ aspectRatio: '1', border: `1.5px dashed ${C.border}`, backgroundColor: C.bg }}>
                                                    <span className="text-[18px]" style={{ color: C.border }}>+</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Hidden file input */}
                            <input ref={fileInputRef} type="file" multiple accept="image/*"
                                className="hidden"
                                onChange={e => handleFiles(e.target.files)} />
                        </div>

                        {/* ── Video ──────────────────────────────── */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        <Video size={13} style={{ color: C.primary }} />
                                    </div>
                                    <h2 className="text-[15px] font-bold"
                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        Product Video
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                        style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        Optional
                                    </span>
                                </div>
                                {/* Rules */}
                                <p className="text-[11px]"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    MP4 · Max 150MB · 1 per listing
                                </p>
                            </div>

                            {/* Variations warning */}
                            {draft.has_variations ? (
                                <div className="flex items-center gap-2 p-3 rounded-xl"
                                    style={{ backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                                    <AlertCircle size={13} style={{ color: C.warning, flexShrink: 0 }} />
                                    <p className="text-[12px]"
                                        style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                        eBay does not support videos on listings with variations.
                                    </p>
                                </div>
                            ) : draft.video_url ? (
                                /* Video uploaded — show preview */
                                <div className="flex items-center gap-4 p-4 rounded-2xl"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        <Video size={24} style={{ color: C.primary }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold truncate"
                                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                            Video uploaded
                                        </p>
                                        <p className="text-[11px] mt-0.5"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            eBay reviews videos within 48 hours before going live
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onChange({ video_url: '' })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                                        style={{ backgroundColor: C.dangerBg, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                            ) : (
                                /* Upload area */
                                <button
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={videoUploading}
                                    className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:opacity-80 disabled:opacity-50"
                                    style={{ backgroundColor: C.surface, border: `2px dashed ${C.border}` }}>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        {videoUploading
                                            ? <Loader2 size={20} className="animate-spin" style={{ color: C.primary }} />
                                            : <Video size={20} style={{ color: C.primary }} />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold"
                                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                            {videoUploading ? 'Uploading video...' : 'Upload a product video'}
                                        </p>
                                        <p className="text-[11px] mt-0.5"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Show features, condition or unboxing · MP4 only · Under 150MB
                                        </p>
                                    </div>
                                </button>
                            )}

                            {/* Hidden video input */}
                            <input ref={videoInputRef} type="file" accept="video/mp4"
                                className="hidden"
                                onChange={e => handleVideo(e.target.files)} />
                        </div>

                    </div>

                    {/* ── RIGHT: Condition Description + Product Description ── */}
                    <div className="flex-1 xl:overflow-y-auto flex flex-col scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                        {/* ── Condition Description ──────────────────── */}
                        {isUsedCondition && (
                            <div className="flex flex-col gap-2 px-4 md:px-5 pt-5 pb-5">
                                <div className="flex items-center gap-1.5">
                                    <h2 className="text-[14px] font-bold"
                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        Condition Description
                                    </h2>
                                    <span className="text-[11px] font-bold" style={{ color: C.danger }}>*</span>
                                </div>
                                <p className="text-[11px]"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Visible because item condition is set to{' '}
                                    <strong style={{ color: C.warning }}>{draft.condition}</strong>
                                </p>
                                <textarea
                                    value={draft.condition_description || ''}
                                    onChange={e => onChange({ condition_description: e.target.value })}
                                    placeholder="Describe any minor wear, cosmetic flaws, or missing original packaging..."
                                    rows={3}
                                    style={{
                                        backgroundColor: C.surface,
                                        border: `1px solid ${C.borderInput}`,
                                        borderRadius: 12,
                                        padding: '10px 14px',
                                        fontSize: 13,
                                        color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                        outline: 'none',
                                        resize: 'none',
                                        width: '100%',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                            </div>
                        )}

                        {/* ── Product Description ───────────────────── */}
                        <div className="flex flex-col gap-3 xl:flex-1 px-3 md:px-4 xl:px-5 pb-3 md:pb-4 xl:pb-5 pt-3 md:pt-4 xl:pt-5">

                            {/* Header */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: C.primaryLight }}>
                                    <FileText size={13} style={{ color: C.primary }} />
                                </div>
                                <h2 className="text-[15px] font-bold"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                    Product Description
                                </h2>
                            </div>


                            {/* Design Library Modal */}
                            {descTab === 'library' && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                    style={{ backgroundColor: 'rgba(30,21,53,0.6)', backdropFilter: 'blur(4px)' }}>
                                    <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl"
                                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, maxHeight: '85vh' }}>

                                        {/* Modal header */}
                                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                                            style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: C.primaryLight }}>
                                                    <Zap size={13} style={{ color: C.primary }} />
                                                </div>
                                                <div>
                                                    <h2 className="text-[15px] font-bold"
                                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                                        Design Library
                                                    </h2>
                                                    <p className="text-[11px]"
                                                        style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                        37 eBay-safe blocks — click any to insert
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setDescTab('templates')}
                                                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
                                                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                                <X size={14} style={{ color: C.secondary }} />
                                            </button>
                                        </div>

                                        {/* Modal body — scrollable */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            <DescriptionLibrary
                                                onInsert={html => {
                                                    const newContent = (htmlContent || '') + '\n' + html
                                                    setHtmlContent(newContent)
                                                    onChange({ description_html: sanitiseHtml(newContent) })
                                                    if (descRef.current) descRef.current.innerHTML = sanitiseHtml(newContent)
                                                    setDescMode('rich')
                                                    setDescPreview('edit')
                                                    setDescTab('templates')
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Editor card — full width, sticky toolbar at column top */}
                            <div className="rounded-2xl -mx-4 md:-mx-5 flex flex-col xl:flex-1"
                                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>

                                {/* Toolbar — sticky at top of right column scroll container */}
                                {descMode === 'rich' && (
                                    <div className="sticky top-0 z-20 rounded-t-2xl overflow-hidden"
                                        style={{ backgroundColor: C.surface, boxShadow: '0 2px 8px rgba(117,48,251,0.08)' }}>
                                        <EditorToolbar
                                            activeFormats={activeFormats}
                                            onExec={execCmd}
                                            descPreview={descPreview}
                                            onPreview={setDescPreview}
                                            uploadedPhotos={draft.photo_urls?.filter(Boolean) || []}
                                            supabaseUpload={uploadPhoto}
                                            onLibrary={() => setDescTab('library')}
                                            onAiWrite={generateDescription}
                                            aiLoading={aiDescLoading}
                                        />
                                    </div>
                                )}

                                {/* Editor area — always mounted, hidden in preview */}
                                <div className="flex flex-col xl:flex-1" style={{ display: descPreview === 'edit' ? 'flex' : 'none' }}>
                                    {/* Rich text editor — hidden when in HTML mode */}
                                    <div className="xl:flex-1" style={{ display: descMode === 'rich' ? 'flex' : 'none', flexDirection: 'column' }}>
                                        <div
                                            ref={descRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            spellCheck
                                            onInput={onInput}
                                            className="p-4 outline-none scrollbar-hide xl:flex-1"
                                            style={{
                                                minHeight: 'calc(100svh - 320px)',
                                                fontSize: 13,
                                                color: C.body,
                                                fontFamily: 'DM Sans, sans-serif',
                                                lineHeight: 1.6,
                                                wordBreak: 'break-word',
                                            }}
                                            data-placeholder="Write your listing description here, or use AI to generate one..."
                                        />
                                    </div>

                                    {/* HTML editor — split view: code left, live preview right */}
                                    {descMode === 'html' && (() => {
                                        // eBay safety check
                                        const ebayWarnings: string[] = []
                                        if (/<script/i.test(htmlContent)) ebayWarnings.push('<script> tags blocked by eBay')
                                        if (/<form/i.test(htmlContent)) ebayWarnings.push('<form> tags blocked by eBay')
                                        if (/<iframe/i.test(htmlContent)) ebayWarnings.push('<iframe> tags blocked by eBay')
                                        if (/on\w+=/i.test(htmlContent)) ebayWarnings.push('onclick/onload events blocked by eBay')
                                        if (/javascript:/i.test(htmlContent)) ebayWarnings.push('javascript: URLs blocked by eBay')
                                        if (/<input/i.test(htmlContent)) ebayWarnings.push('<input> tags blocked by eBay')
                                        if (/http:\/\//i.test(htmlContent)) ebayWarnings.push('HTTP images will be blocked — use HTTPS')

                                        return (
                                            <div className="flex flex-col" style={{ minHeight: 420 }}>

                                                {/* eBay warnings banner */}
                                                {ebayWarnings.length > 0 && (
                                                    <div className="flex items-start gap-2 px-3 py-2 shrink-0"
                                                        style={{ backgroundColor: '#fef3c7', borderBottom: `1px solid #fde68a` }}>
                                                        <span className="text-[11px] shrink-0" style={{ color: '#d97706' }}>⚠</span>
                                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                            {ebayWarnings.map((w, i) => (
                                                                <span key={i} className="text-[11px]"
                                                                    style={{ color: '#d97706', fontFamily: 'DM Sans, sans-serif' }}>
                                                                    {w}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Split header */}
                                                <div className="flex shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
                                                    <div className="flex-1 flex items-center justify-between px-3 py-1.5"
                                                        style={{ backgroundColor: '#f3eeff', borderRight: `1px solid ${C.border}` }}>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                                                            <span className="text-[10px] font-bold tracking-widest uppercase"
                                                                style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>HTML Code</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {/* Snippet buttons */}
                                                            {[
                                                                { label: 'B', insert: '<strong></strong>', title: 'Bold' },
                                                                { label: 'BR', insert: '<br>', title: 'Line break' },
                                                                { label: 'HR', insert: '\n<hr style="border:none;border-top:1px solid #ede9fe;margin:16px 0;">\n', title: 'Divider' },
                                                                { label: 'UL', insert: '\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n', title: 'Bullet list' },
                                                                { label: 'IMG', insert: '<img src="https://" alt="" style="max-width:100%;height:auto;">', title: 'Image' },
                                                            ].map(s => (
                                                                <button key={s.label}
                                                                    onClick={() => {
                                                                        const ta = codeTextareaRef.current
                                                                        if (!ta) return
                                                                        const start = ta.selectionStart
                                                                        const newVal = htmlContent.substring(0, start) + s.insert + htmlContent.substring(ta.selectionEnd)
                                                                        setHtmlContent(newVal)
                                                                        onChange({ description_html: sanitiseHtml(newVal) })
                                                                        if (descRef.current) descRef.current.innerHTML = sanitiseHtml(newVal)
                                                                        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + s.insert.length }, 0)
                                                                    }}
                                                                    title={s.title}
                                                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold hover:opacity-80"
                                                                    style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'monospace' }}>
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                            <div className="w-px h-3 mx-0.5" style={{ backgroundColor: C.border }} />
                                                            {/* Format */}
                                                            <button
                                                                onClick={() => {
                                                                    const pretty = htmlContent
                                                                        .replace(/<\/([a-z][a-z0-9]*)[^>]*>/gi, '</$1>\n')
                                                                        .replace(/(<(?:br|hr|img|input)[^>]*\/?>)/gi, '$1\n')
                                                                        .replace(/(<(?!\/|br|strong|em|a|span|b|i|u)[a-z][a-z0-9]*[^>]*>)/gi, '\n$1')
                                                                        .split('\n').map(l => l.trimEnd())
                                                                        .filter((l, i, arr) => !(l === '' && arr[i - 1] === ''))
                                                                        .join('\n').trim()
                                                                    setHtmlContent(pretty)
                                                                    onChange({ description_html: sanitiseHtml(pretty) })
                                                                    if (descRef.current) descRef.current.innerHTML = sanitiseHtml(pretty)
                                                                }}
                                                                className="px-2 py-0.5 rounded text-[9px] font-semibold hover:opacity-80"
                                                                style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                                                                title="Format / Prettify HTML">
                                                                ✦ Format
                                                            </button>
                                                            {/* Copy */}
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(htmlContent)}
                                                                className="px-2 py-0.5 rounded text-[9px] font-semibold hover:opacity-80"
                                                                style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                                                                title="Copy HTML code">
                                                                Copy
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Preview header */}
                                                    <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5"
                                                        style={{ backgroundColor: C.bg }}>
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.success }} />
                                                        <span className="text-[10px] font-bold tracking-widest uppercase"
                                                            style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>Live Preview</span>
                                                    </div>
                                                </div>

                                                {/* Split panes */}
                                                <div className="flex flex-1 min-h-0">

                                                    {/* Left — VS Code style editor with line numbers */}
                                                    <div className="flex overflow-hidden"
                                                        style={{ width: '50%', borderRight: `1px solid ${C.border}`, backgroundColor: '#faf9ff' }}>

                                                        {/* Line numbers column — one number per \n only */}
                                                        <div
                                                            ref={lineNumbersRef}
                                                            className="select-none shrink-0"
                                                            style={{
                                                                width: 40,
                                                                backgroundColor: '#f3eeff',
                                                                borderRight: `1px solid ${C.border}`,
                                                                fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                                                                fontSize: 12,
                                                                color: C.muted,
                                                                textAlign: 'right',
                                                                paddingRight: 8,
                                                                paddingTop: 16,
                                                                paddingBottom: 16,
                                                                overflowY: 'scroll',
                                                                overflowX: 'hidden',
                                                                scrollbarWidth: 'none',
                                                            }}>
                                                            {(htmlContent || '\n').split('\n').map((_, i) => (
                                                                <div key={i} style={{ height: '21.6px', lineHeight: '21.6px' }}>{i + 1}</div>
                                                            ))}
                                                        </div>

                                                        {/* Code textarea */}
                                                        <textarea
                                                            ref={codeTextareaRef}
                                                            value={htmlContent}
                                                            onChange={e => {
                                                                const val = e.target.value
                                                                setHtmlContent(val)
                                                                onChange({ description_html: sanitiseHtml(val) })
                                                                if (descRef.current) descRef.current.innerHTML = sanitiseHtml(val)
                                                                scheduleAutosave(val)
                                                            }}
                                                            onScroll={e => {
                                                                if (lineNumbersRef.current) {
                                                                    lineNumbersRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop
                                                                }
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Tab') {
                                                                    e.preventDefault()
                                                                    const ta = e.target as HTMLTextAreaElement
                                                                    const start = ta.selectionStart
                                                                    const end = ta.selectionEnd
                                                                    const newVal = htmlContent.substring(0, start) + '  ' + htmlContent.substring(end)
                                                                    setHtmlContent(newVal)
                                                                    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
                                                                }
                                                            }}
                                                            spellCheck={false}
                                                            className="flex-1 outline-none pt-4 pb-4 pl-3 pr-4"
                                                            style={{
                                                                height: '100%',
                                                                fontSize: 12,
                                                                color: '#7530fb',
                                                                backgroundColor: '#faf9ff',
                                                                border: 'none',
                                                                resize: 'none',
                                                                lineHeight: '21.6px',
                                                                fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                                                                whiteSpace: 'pre',
                                                                overflowX: 'auto',
                                                                overflowWrap: 'normal',
                                                            }}
                                                            placeholder={'<p>Start typing HTML here...</p>'}
                                                        />
                                                    </div>

                                                    {/* Right — live preview */}
                                                    <div className="flex-1 overflow-auto p-4"
                                                        style={{ backgroundColor: C.surface }}>
                                                        <div style={{
                                                            fontSize: 13,
                                                            color: C.body,
                                                            fontFamily: 'DM Sans, sans-serif',
                                                            lineHeight: 1.6,
                                                        }}
                                                            dangerouslySetInnerHTML={{
                                                                __html: htmlContent ||
                                                                    '<p style="color:#9ca3af;font-size:12px;text-align:center;padding:40px 20px;font-family:DM Sans,sans-serif">✦ Live preview appears here as you type HTML on the left</p>'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Status bar */}
                                                <div className="flex items-center justify-between px-3 py-1 shrink-0"
                                                    style={{ backgroundColor: C.primary }}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
                                                            Lines: {(htmlContent || '').split('\n').length}
                                                        </span>
                                                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
                                                            Chars: {htmlContent.length.toLocaleString()}
                                                        </span>
                                                        {ebayWarnings.length > 0 && (
                                                            <span className="text-[10px]" style={{ color: '#fde68a', fontFamily: 'DM Sans, sans-serif' }}>
                                                                ⚠ {ebayWarnings.length} eBay warning{ebayWarnings.length > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
                                                        HTML · UTF-8
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>

                                {/* Mobile / Desktop preview */}
                                {(descPreview === 'mobile' || descPreview === 'desktop') && (
                                    <div className="flex justify-center p-6 overflow-auto"
                                        style={{ minHeight: 420, backgroundColor: '#f0f0f0' }}>
                                        <div style={{
                                            width: descPreview === 'mobile' ? 375 : '100%',
                                            maxWidth: descPreview === 'desktop' ? 860 : undefined,
                                            backgroundColor: '#fff',
                                            borderRadius: descPreview === 'mobile' ? 24 : 12,
                                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                            overflow: 'hidden',
                                        }}>
                                            <div className="flex items-center gap-1.5 px-4 py-2.5"
                                                style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e5e5e5' }}>
                                                {descPreview === 'desktop' && (
                                                    <div className="contents">
                                                        {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                                                            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                                                        ))}
                                                        <div className="flex-1 mx-3 py-1 px-3 rounded-md text-[11px]"
                                                            style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                                                            ebay.com/itm/listing
                                                        </div>
                                                    </div>
                                                )}
                                                {descPreview === 'mobile' && (
                                                    <div className="w-full text-center text-[11px]"
                                                        style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                                                        ebay.com
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 overflow-auto"
                                                style={{
                                                    fontSize: descPreview === 'mobile' ? 14 : 15,
                                                    color: C.body, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7,
                                                    maxHeight: 600,
                                                }}
                                                dangerouslySetInnerHTML={{ __html: htmlContent || '<p style="color:#9ca3af;text-align:center;padding:40px 0">No description yet</p>' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Bottom bar */}
                                <div className="flex items-center justify-between px-3 py-2"
                                    style={{ borderTop: `2px solid ${C.primary}`, backgroundColor: C.primaryLight }}>
                                    <div className="flex items-center gap-2">
                                        {/* Rich/HTML toggle */}
                                        <div className="flex items-center rounded-lg overflow-hidden"
                                            style={{ border: `1px solid ${C.border}` }}>
                                            {(['rich', 'html'] as const).map(mode => (
                                                <button key={mode} onClick={() => {
                                                    setDescMode(mode)
                                                    setDescPreview('edit')
                                                }}
                                                    className="px-2.5 py-1 text-[11px] font-semibold transition-all"
                                                    style={{
                                                        backgroundColor: descMode === mode ? C.primary : 'transparent',
                                                        color: descMode === mode ? '#fff' : C.muted,
                                                        fontFamily: 'DM Sans, sans-serif',
                                                    }}>
                                                    {mode === 'rich' ? 'Rich Text' : 'HTML'}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Copy */}
                                        <button onClick={copyContent}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80"
                                            style={{ color: copied ? C.success : C.muted, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                            <Copy size={10} />
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                        {/* Clear */}
                                        {htmlContent && (
                                            <button onClick={clearContent}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80"
                                                style={{ backgroundColor: C.dangerBg, color: C.danger, border: `1px solid #fca5a5`, fontFamily: 'DM Sans, sans-serif' }}>
                                                <Trash2 size={10} /> Clear
                                            </button>
                                        )}
                                        <div className="w-px h-3" style={{ backgroundColor: C.border }} />
                                        <span className="text-[11px]" style={{
                                            color: charCount > CHAR_LIMIT ? C.danger : charCount > CHAR_LIMIT * 0.9 ? C.warning : C.muted,
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontWeight: charCount > CHAR_LIMIT * 0.9 ? 700 : 400,
                                        }}>
                                            {wordCount}w · {charCount.toLocaleString()} / 500k
                                            {charCount > CHAR_LIMIT && ' ⚠ Limit reached!'}
                                            {charCount > CHAR_LIMIT * 0.9 && charCount <= CHAR_LIMIT && ' ⚠ Near limit'}
                                        </span>
                                        {autoSaved && (
                                            <span className="text-[10px] font-semibold"
                                                style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                                ✓ Saved
                                            </span>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>{/* end xl:px-[5%] wrapper */}

        </div>
    )
}
