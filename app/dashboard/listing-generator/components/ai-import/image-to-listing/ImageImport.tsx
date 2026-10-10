'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Camera,
    Tag,
    Link2,
    Upload,
    Trash2,
    AlertCircle,
    ArrowRight,
    ChevronRight,
} from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryMid: '#ede9fe',
    accent: '#b8fa33',
    accentDark: '#8fc420',
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderMid: '#ddd6fe',
    text: '#1e1535',
    textMid: '#4b3d6e',
    textLight: '#7c6fa0',
    textXLight: '#a89fcb',
    error: '#dc2626',
    errorLight: '#fef2f2',
    errorBorder: '#fecaca',
    success: '#16a34a',
    successLight: '#f0fdf4',
    successBorder: '#bbf7d0',
    warn: '#d97706',
    warnLight: '#fffbeb',
    warnBorder: '#fde68a',
} as const

const FONT_HEADING = 'Syne, sans-serif'
const FONT_BODY = 'DM Sans, sans-serif'
const FONT_MONO = 'DM Mono, monospace'

// ─── Keyframe injection ───────────────────────────────────────────────────────
const STYLE_ID = 'lg-image-import-styles'
function injectStyles() {
    if (typeof document === 'undefined') return
    if (document.getElementById(STYLE_ID)) return
    const el = document.createElement('style')
    el.id = STYLE_ID
    el.textContent = `
    @keyframes lgImportSlideUp {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes lgFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .lg-img-thumb:hover .lg-img-remove {
      opacity: 1;
    }
  `
    document.head.appendChild(el)
}

// ─── Exported type ────────────────────────────────────────────────────────────
export interface ImageImportData {
    images: File[]
    labelImageIndex: number | null // index in images[] that is the label photo
    condition: 'new' | 'used' | 'for_parts'
    subCondition: 'excellent' | 'good' | 'fair' | 'poor' | ''
    hint: string
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    onClose: () => void
    onImport: (data: ImageImportData) => void
    onSwitchToUrl?: () => void
    onSwitchToBarcode?: () => void
    onSwitchToTitle?: () => void
}

const MAX_PRODUCT_PHOTOS = 9

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AltMethodButtonProps {
    icon: React.ReactNode
    label: string
    onClick?: () => void
}

function AltMethodButton({ icon, label, onClick }: AltMethodButtonProps) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 10,
                border: `1.5px solid ${hovered ? C.borderMid : C.border}`,
                background: hovered ? C.primaryLight : C.surface,
                color: hovered ? C.primary : C.textMid,
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
            }}
        >
            {icon}
            {label}
            <ChevronRight size={13} style={{ opacity: 0.5, marginLeft: 'auto' }} />
        </button>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ImageImport({
    onClose,
    onImport,
    onSwitchToUrl,
    onSwitchToBarcode,
    onSwitchToTitle,
}: Props) {
    // Photos
    const [productPhotos, setProductPhotos] = useState<File[]>([])
    const [productPreviews, setProductPreviews] = useState<string[]>([])
    const [labelPhoto, setLabelPhoto] = useState<File | null>(null)
    const [labelPreview, setLabelPreview] = useState<string | null>(null)

    // Condition
    const [condition, setCondition] = useState<'new' | 'used' | 'for_parts' | ''>('')
    const [subCondition, setSubCondition] = useState<'excellent' | 'good' | 'fair' | 'poor' | ''>('')

    // Hint
    const [hint, setHint] = useState('')
    const [hintFocused, setHintFocused] = useState(false)

    // Drag state
    const [dragOverProduct, setDragOverProduct] = useState(false)
    const [dragOverLabel, setDragOverLabel] = useState(false)

    // UI state
    const [error, setError] = useState<string | null>(null)
    const [hoveredThumb, setHoveredThumb] = useState<number | null>(null)
    const [labelHovered, setLabelHovered] = useState(false)

    const productInputRef = useRef<HTMLInputElement>(null)
    const labelInputRef = useRef<HTMLInputElement>(null)

    // Inject styles once
    useEffect(() => { injectStyles() }, [])

    // Escape key to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    // Revoke object URLs on unmount (capture at mount time)
    const productPreviewsRef = useRef<string[]>([])
    const labelPreviewRef = useRef<string | null>(null)
    useEffect(() => {
        productPreviewsRef.current = productPreviews
    }, [productPreviews])
    useEffect(() => {
        labelPreviewRef.current = labelPreview
    }, [labelPreview])
    useEffect(() => {
        return () => {
            productPreviewsRef.current.forEach(URL.revokeObjectURL)
            if (labelPreviewRef.current) URL.revokeObjectURL(labelPreviewRef.current)
        }
    }, [])

    // ── File validation ──────────────────────────────────────────────────────
    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
    const MAX_SIZE_MB = 10

    function validateFile(file: File): string | null {
        if (!ACCEPTED.includes(file.type)) return `"${file.name}" is not a supported format (JPG, PNG or WEBP only)`
        if (file.size > MAX_SIZE_MB * 1024 * 1024) return `"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit`
        return null
    }

    // ── Add product photos ───────────────────────────────────────────────────
    const addProductFiles = useCallback((files: FileList | File[]) => {
        setError(null)
        const arr = Array.from(files)
        const remaining = MAX_PRODUCT_PHOTOS - productPhotos.length
        const toAdd = arr.slice(0, remaining)
        const skipped = arr.length - toAdd.length

        const valid: File[] = []
        for (const f of toAdd) {
            const err = validateFile(f)
            if (err) { setError(err); return }
            valid.push(f)
        }

        if (valid.length === 0) return

        const previews = valid.map(f => URL.createObjectURL(f))
        setProductPhotos(prev => [...prev, ...valid])
        setProductPreviews(prev => [...prev, ...previews])

        if (skipped > 0) {
            setError(`Maximum ${MAX_PRODUCT_PHOTOS} product photos allowed. ${skipped} file${skipped > 1 ? 's were' : ' was'} not added.`)
        }
    }, [productPhotos.length])

    // ── Remove product photo ─────────────────────────────────────────────────
    function removeProductPhoto(index: number) {
        URL.revokeObjectURL(productPreviews[index])
        setProductPhotos(prev => prev.filter((_, i) => i !== index))
        setProductPreviews(prev => prev.filter((_, i) => i !== index))
        setHoveredThumb(null)
        setError(null)
    }

    // ── Add label photo ──────────────────────────────────────────────────────
    function addLabelFile(file: File) {
        setError(null)
        const err = validateFile(file)
        if (err) { setError(err); return }
        if (labelPreview) URL.revokeObjectURL(labelPreview)
        setLabelPhoto(file)
        setLabelPreview(URL.createObjectURL(file))
    }

    function removeLabelPhoto() {
        if (labelPreview) URL.revokeObjectURL(labelPreview)
        setLabelPhoto(null)
        setLabelPreview(null)
        setLabelHovered(false)
    }

    // ── Drag handlers (product zone) ─────────────────────────────────────────
    function onProductDragOver(e: React.DragEvent) {
        e.preventDefault()
        setDragOverProduct(true)
    }
    function onProductDragLeave(e: React.DragEvent) {
        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverProduct(false)
        }
    }
    function onProductDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOverProduct(false)
        if (e.dataTransfer.files.length) addProductFiles(e.dataTransfer.files)
    }

    // ── Drag handlers (label zone) ───────────────────────────────────────────
    function onLabelDragOver(e: React.DragEvent) {
        e.preventDefault()
        setDragOverLabel(true)
    }
    function onLabelDragLeave(e: React.DragEvent) {
        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverLabel(false)
        }
    }
    function onLabelDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOverLabel(false)
        if (e.dataTransfer.files[0]) addLabelFile(e.dataTransfer.files[0])
    }

    // ── Submit ───────────────────────────────────────────────────────────────
    const totalPhotos = productPhotos.length + (labelPhoto ? 1 : 0)
    const canImport = productPhotos.length > 0 && condition !== ''

    function handleImport() {
        if (!canImport) return
        if (!condition) { setError('Please select the item condition before continuing.'); return }

        const allImages: File[] = labelPhoto
            ? [...productPhotos, labelPhoto]
            : [...productPhotos]
        const labelImageIndex = labelPhoto ? allImages.length - 1 : null

        onImport({
            images: allImages,
            labelImageIndex,
            condition: condition as 'new' | 'used' | 'for_parts',
            subCondition,
            hint: hint.trim(),
        })
    }

    // ── Button label ─────────────────────────────────────────────────────────
    const importLabel = (() => {
        const n = totalPhotos
        if (n === 0) return 'Analyse Photos'
        if (n === 1) return 'Analyse 1 Photo'
        return `Analyse ${n} Photos`
    })()

    // ── Condition sub-labels ─────────────────────────────────────────────────
    const SUB_CONDITIONS: { key: 'excellent' | 'good' | 'fair' | 'poor'; label: string; desc: string }[] = [
        { key: 'excellent', label: 'Excellent', desc: 'Like new, minimal signs of use' },
        { key: 'good', label: 'Good', desc: 'Light wear, fully functional' },
        { key: 'fair', label: 'Fair', desc: 'Visible marks, works correctly' },
        { key: 'poor', label: 'Poor', desc: 'Heavy wear or minor faults' },
    ]

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9998,
                    background: 'rgba(20,14,40,0.55)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    animation: 'lgFadeIn 0.2s ease',
                }}
            />

            {/* Scroll wrapper */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    overflowY: 'auto',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '48px 16px 48px',
                }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
            >
                {/* Modal */}
                <div
                    style={{
                        width: '100%',
                        maxWidth: 580,
                        background: C.surface,
                        borderRadius: 20,
                        boxShadow: '0 24px 64px rgba(117,48,251,0.14), 0 4px 16px rgba(0,0,0,0.10)',
                        animation: 'lgImportSlideUp 0.28s cubic-bezier(0.22,1,0.36,1)',
                        overflow: 'hidden',
                    }}
                >
                    {/* ── Header ─────────────────────────────────────────────────────── */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 14,
                            padding: '24px 24px 20px',
                            borderBottom: `1px solid ${C.border}`,
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: C.primaryLight,
                                border: `1.5px solid ${C.primaryMid}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: 1,
                            }}
                        >
                            <Camera size={20} color={C.primary} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: FONT_HEADING,
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: C.text,
                                    letterSpacing: '-0.3px',
                                    lineHeight: 1.2,
                                }}
                            >
                                Image to Listing
                            </h2>
                            <p
                                style={{
                                    margin: '4px 0 0',
                                    fontFamily: FONT_BODY,
                                    fontSize: 13.5,
                                    color: C.textLight,
                                    lineHeight: 1.4,
                                }}
                            >
                                Upload product photos — AI identifies the item and drafts your eBay listing.
                            </p>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: `1.5px solid ${C.border}`,
                                background: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0,
                                color: C.textLight,
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                ; (e.currentTarget as HTMLButtonElement).style.background = C.primaryLight
                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderMid
                                    ; (e.currentTarget as HTMLButtonElement).style.color = C.primary
                            }}
                            onMouseLeave={e => {
                                ; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border
                                    ; (e.currentTarget as HTMLButtonElement).style.color = C.textLight
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Body ───────────────────────────────────────────────────────── */}
                    <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* ── Product Photos Section ──────────────────────────────────── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <label
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: C.textMid,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase' as const,
                                    }}
                                >
                                    Product Photos
                                </label>
                                <span
                                    style={{
                                        fontFamily: FONT_MONO,
                                        fontSize: 12,
                                        color: productPhotos.length >= MAX_PRODUCT_PHOTOS ? C.warn : C.textXLight,
                                        fontWeight: 500,
                                    }}
                                >
                                    {productPhotos.length} / {MAX_PRODUCT_PHOTOS}
                                </span>
                            </div>

                            {/* Drop zone — shown when no photos yet */}
                            {productPhotos.length === 0 && (
                                <div
                                    onDragOver={onProductDragOver}
                                    onDragLeave={onProductDragLeave}
                                    onDrop={onProductDrop}
                                    onClick={() => productInputRef.current?.click()}
                                    style={{
                                        border: `2px dashed ${dragOverProduct ? C.primary : C.borderMid}`,
                                        borderRadius: 14,
                                        background: dragOverProduct ? C.primaryLight : C.bg,
                                        padding: '36px 24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 14,
                                            background: dragOverProduct ? C.primaryMid : C.primaryLight,
                                            border: `1.5px solid ${dragOverProduct ? C.primary : C.primaryMid}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.18s ease',
                                        }}
                                    >
                                        <Upload size={22} color={C.primary} />
                                    </div>
                                    <div style={{ textAlign: 'center' as const }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontFamily: FONT_BODY,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: C.text,
                                            }}
                                        >
                                            Drop photos here, or <span style={{ color: C.primary }}>browse files</span>
                                        </p>
                                        <p
                                            style={{
                                                margin: '4px 0 0',
                                                fontFamily: FONT_BODY,
                                                fontSize: 12.5,
                                                color: C.textLight,
                                            }}
                                        >
                                            JPG, PNG or WEBP · Up to {MAX_PRODUCT_PHOTOS} photos · Max 10 MB each
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Thumbnail grid — shown once photos are added */}
                            {productPhotos.length > 0 && (
                                <div
                                    onDragOver={productPhotos.length < MAX_PRODUCT_PHOTOS ? onProductDragOver : undefined}
                                    onDragLeave={productPhotos.length < MAX_PRODUCT_PHOTOS ? onProductDragLeave : undefined}
                                    onDrop={productPhotos.length < MAX_PRODUCT_PHOTOS ? onProductDrop : undefined}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: 8,
                                        padding: 12,
                                        background: dragOverProduct ? C.primaryLight : C.bg,
                                        borderRadius: 14,
                                        border: `1.5px ${dragOverProduct ? 'dashed' : 'solid'} ${dragOverProduct ? C.primary : C.border}`,
                                        transition: 'all 0.18s ease',
                                    }}
                                >
                                    {productPreviews.map((src, i) => (
                                        <div
                                            key={i}
                                            className="lg-img-thumb"
                                            onMouseEnter={() => setHoveredThumb(i)}
                                            onMouseLeave={() => setHoveredThumb(null)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '1',
                                                borderRadius: 10,
                                                overflow: 'hidden',
                                                border: `1.5px solid ${hoveredThumb === i ? C.borderMid : C.border}`,
                                                background: C.bg,
                                                cursor: 'default',
                                                transition: 'border-color 0.15s ease',
                                            }}
                                        >
                                            {/* Number badge */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 5,
                                                    left: 5,
                                                    zIndex: 2,
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 5,
                                                    background: 'rgba(20,14,40,0.65)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontFamily: FONT_MONO,
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: '#ffffff',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {i + 1}
                                            </div>

                                            {/* Image */}
                                            <img
                                                src={src}
                                                alt={`Product ${i + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                }}
                                            />

                                            {/* Remove overlay */}
                                            <div
                                                className="lg-img-remove"
                                                onClick={() => removeProductPhoto(i)}
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(220,38,38,0.82)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: 0,
                                                    cursor: 'pointer',
                                                    transition: 'opacity 0.15s ease',
                                                    zIndex: 3,
                                                }}
                                            >
                                                <Trash2 size={16} color="#ffffff" />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add-more slot */}
                                    {productPhotos.length < MAX_PRODUCT_PHOTOS && (
                                        <button
                                            onClick={() => productInputRef.current?.click()}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: 10,
                                                border: `1.5px dashed ${C.borderMid}`,
                                                background: 'transparent',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 4,
                                                cursor: 'pointer',
                                                color: C.textXLight,
                                                transition: 'all 0.15s ease',
                                                fontFamily: FONT_BODY,
                                                fontSize: 11,
                                                fontWeight: 500,
                                            }}
                                            onMouseEnter={e => {
                                                ; (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary
                                                    ; (e.currentTarget as HTMLButtonElement).style.color = C.primary
                                                    ; (e.currentTarget as HTMLButtonElement).style.background = C.primaryLight
                                            }}
                                            onMouseLeave={e => {
                                                ; (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderMid
                                                    ; (e.currentTarget as HTMLButtonElement).style.color = C.textXLight
                                                    ; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                            }}
                                        >
                                            <Upload size={14} />
                                            Add more
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={productInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                style={{ display: 'none' }}
                                onChange={e => {
                                    if (e.target.files?.length) {
                                        addProductFiles(e.target.files)
                                        e.target.value = ''
                                    }
                                }}
                            />
                        </div>

                        {/* ── Label / Barcode Section ─────────────────────────────────── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <label
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: C.textMid,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase' as const,
                                    }}
                                >
                                    Label / Barcode Photo
                                </label>
                                <span
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: C.warn,
                                        background: C.warnLight,
                                        border: `1px solid ${C.warnBorder}`,
                                        borderRadius: 5,
                                        padding: '1px 7px',
                                        letterSpacing: '0.03em',
                                    }}
                                >
                                    Recommended
                                </span>
                            </div>

                            {/* Label drop zone — empty state */}
                            {!labelPhoto && (
                                <div
                                    onDragOver={onLabelDragOver}
                                    onDragLeave={onLabelDragLeave}
                                    onDrop={onLabelDrop}
                                    onClick={() => labelInputRef.current?.click()}
                                    style={{
                                        border: `1.5px dashed ${dragOverLabel ? C.primary : C.borderMid}`,
                                        borderRadius: 12,
                                        background: dragOverLabel ? C.primaryLight : C.bg,
                                        padding: '14px 18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: dragOverLabel ? C.primaryMid : C.primaryLight,
                                            border: `1.5px solid ${dragOverLabel ? C.primary : C.primaryMid}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.18s ease',
                                        }}
                                    >
                                        <Tag size={17} color={C.primary} />
                                    </div>
                                    <div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontFamily: FONT_BODY,
                                                fontSize: 13.5,
                                                fontWeight: 600,
                                                color: C.text,
                                            }}
                                        >
                                            Add a label or packaging photo
                                        </p>
                                        <p
                                            style={{
                                                margin: '2px 0 0',
                                                fontFamily: FONT_BODY,
                                                fontSize: 12,
                                                color: C.textLight,
                                            }}
                                        >
                                            AI will scan for EAN / barcode, brand and model number
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Label — filled state */}
                            {labelPhoto && labelPreview && (
                                <div
                                    style={{
                                        border: `1.5px solid ${C.successBorder}`,
                                        borderRadius: 12,
                                        background: C.successLight,
                                        padding: '12px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        onMouseEnter={() => setLabelHovered(true)}
                                        onMouseLeave={() => setLabelHovered(false)}
                                        onClick={removeLabelPhoto}
                                        style={{
                                            position: 'relative',
                                            width: 52,
                                            height: 52,
                                            borderRadius: 9,
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            cursor: 'pointer',
                                            border: `1.5px solid ${C.successBorder}`,
                                        }}
                                    >
                                        <img
                                            src={labelPreview}
                                            alt="Label"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                        {labelHovered && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'rgba(220,38,38,0.82)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Trash2 size={15} color="#ffffff" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontFamily: FONT_BODY,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: C.success,
                                            }}
                                        >
                                            Label photo added
                                        </p>
                                        <p
                                            style={{
                                                margin: '2px 0 0',
                                                fontFamily: FONT_BODY,
                                                fontSize: 12,
                                                color: C.textLight,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap' as const,
                                            }}
                                        >
                                            {labelPhoto.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={removeLabelPhoto}
                                        title="Remove label photo"
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 7,
                                            border: `1px solid ${C.successBorder}`,
                                            background: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: C.textLight,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            <input
                                ref={labelInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={e => {
                                    if (e.target.files?.[0]) {
                                        addLabelFile(e.target.files[0])
                                        e.target.value = ''
                                    }
                                }}
                            />
                        </div>

                        {/* ── Error ───────────────────────────────────────────────────── */}
                        {error && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 9,
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    background: C.errorLight,
                                    border: `1px solid ${C.errorBorder}`,
                                }}
                            >
                                <AlertCircle size={15} color={C.error} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: FONT_BODY,
                                        fontSize: 13,
                                        color: C.error,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* ── Condition Selector ──────────────────────────────────────── */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontFamily: FONT_BODY,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: C.textMid,
                                    letterSpacing: '0.02em',
                                    textTransform: 'uppercase' as const,
                                    marginBottom: 10,
                                }}
                            >
                                Item Condition
                            </label>

                            {/* Main condition buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {(
                                    [
                                        { key: 'new', label: 'New' },
                                        { key: 'used', label: 'Used' },
                                        { key: 'for_parts', label: 'For Parts' },
                                    ] as const
                                ).map(({ key, label }) => {
                                    const active = condition === key
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setCondition(key)
                                                if (key !== 'used') setSubCondition('')
                                            }}
                                            style={{
                                                padding: '10px 8px',
                                                borderRadius: 10,
                                                border: `1.5px solid ${active ? C.primary : C.border}`,
                                                background: active ? C.primaryLight : C.surface,
                                                color: active ? C.primary : C.textMid,
                                                fontFamily: FONT_BODY,
                                                fontSize: 13.5,
                                                fontWeight: active ? 700 : 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                textAlign: 'center' as const,
                                                boxShadow: active ? `0 0 0 3px ${C.primaryMid}` : 'none',
                                            }}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Sub-condition (Used only) */}
                            {condition === 'used' && (
                                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                    {SUB_CONDITIONS.map(({ key, label }) => {
                                        const active = subCondition === key
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSubCondition(key)}
                                                title={SUB_CONDITIONS.find(s => s.key === key)?.desc}
                                                style={{
                                                    padding: '8px 4px',
                                                    borderRadius: 9,
                                                    border: `1.5px solid ${active ? C.primary : C.border}`,
                                                    background: active ? C.primaryLight : C.bg,
                                                    color: active ? C.primary : C.textLight,
                                                    fontFamily: FONT_BODY,
                                                    fontSize: 12.5,
                                                    fontWeight: active ? 700 : 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    textAlign: 'center' as const,
                                                }}
                                            >
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── Product Hint ────────────────────────────────────────────── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <label
                                    htmlFor="lg-hint-input"
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: C.textMid,
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase' as const,
                                    }}
                                >
                                    Product Hint
                                </label>
                                <span
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: C.textXLight,
                                        background: C.bg,
                                        border: `1px solid ${C.border}`,
                                        borderRadius: 5,
                                        padding: '1px 7px',
                                    }}
                                >
                                    Optional
                                </span>
                            </div>
                            <div
                                style={{
                                    position: 'relative',
                                    borderRadius: 11,
                                    border: `1.5px solid ${hintFocused ? C.primary : C.border}`,
                                    background: C.surface,
                                    boxShadow: hintFocused ? `0 0 0 3px ${C.primaryMid}` : 'none',
                                    transition: 'all 0.15s ease',
                                    overflow: 'hidden',
                                }}
                            >
                                <input
                                    id="lg-hint-input"
                                    type="text"
                                    value={hint}
                                    onChange={e => setHint(e.target.value)}
                                    onFocus={() => setHintFocused(true)}
                                    onBlur={() => setHintFocused(false)}
                                    placeholder='e.g. "Sony WH-1000XM5 noise cancelling headphones"'
                                    maxLength={200}
                                    style={{
                                        width: '100%',
                                        padding: hint ? '11px 40px 11px 14px' : '11px 14px',
                                        fontFamily: FONT_BODY,
                                        fontSize: 14,
                                        color: C.text,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        boxSizing: 'border-box' as const,
                                    }}
                                />
                                {hint && (
                                    <button
                                        onClick={() => setHint('')}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 22,
                                            height: 22,
                                            borderRadius: 6,
                                            border: 'none',
                                            background: C.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: C.textLight,
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <p
                                style={{
                                    margin: '6px 0 0 2px',
                                    fontFamily: FONT_BODY,
                                    fontSize: 12,
                                    color: C.textXLight,
                                }}
                            >
                                Help the AI identify the product faster — especially useful for generic or white-label items.
                            </p>
                        </div>

                        {/* ── Import Button ───────────────────────────────────────────── */}
                        <button
                            onClick={handleImport}
                            disabled={!canImport}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                borderRadius: 12,
                                border: 'none',
                                background: canImport ? C.primary : C.border,
                                color: canImport ? '#ffffff' : C.textXLight,
                                fontFamily: FONT_HEADING,
                                fontSize: 15,
                                fontWeight: 700,
                                letterSpacing: '-0.2px',
                                cursor: canImport ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all 0.18s ease',
                                boxShadow: canImport ? '0 4px 14px rgba(117,48,251,0.28)' : 'none',
                            }}
                            onMouseEnter={e => {
                                if (!canImport) return
                                    ; (e.currentTarget as HTMLButtonElement).style.background = '#6420e0'
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(117,48,251,0.38)'
                                    ; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={e => {
                                if (!canImport) return
                                    ; (e.currentTarget as HTMLButtonElement).style.background = C.primary
                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(117,48,251,0.28)'
                                    ; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                            }}
                        >
                            {importLabel}
                            <ArrowRight size={17} />
                        </button>

                        {/* ── Validation hint when disabled ───────────────────────────── */}
                        {!canImport && (
                            <p
                                style={{
                                    margin: '-12px 0 0',
                                    fontFamily: FONT_BODY,
                                    fontSize: 12.5,
                                    color: C.textXLight,
                                    textAlign: 'center' as const,
                                }}
                            >
                                {productPhotos.length === 0
                                    ? 'Add at least one product photo to continue'
                                    : 'Select the item condition to continue'}
                            </p>
                        )}

                        {/* ── Divider ─────────────────────────────────────────────────── */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <div style={{ flex: 1, height: 1, background: C.border }} />
                            <span
                                style={{
                                    fontFamily: FONT_BODY,
                                    fontSize: 12,
                                    color: C.textXLight,
                                    fontWeight: 500,
                                    flexShrink: 0,
                                }}
                            >
                                or list another way
                            </span>
                            <div style={{ flex: 1, height: 1, background: C.border }} />
                        </div>

                        {/* ── Alt Methods ─────────────────────────────────────────────── */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                            {onSwitchToUrl && (
                                <AltMethodButton
                                    icon={<Link2 size={14} />}
                                    label="Import from URL"
                                    onClick={onSwitchToUrl}
                                />
                            )}
                            {onSwitchToBarcode && (
                                <AltMethodButton
                                    icon={<Tag size={14} />}
                                    label="Scan Barcode"
                                    onClick={onSwitchToBarcode}
                                />
                            )}
                            {onSwitchToTitle && (
                                <AltMethodButton
                                    icon={<Camera size={14} />}
                                    label="Enter a Title"
                                    onClick={onSwitchToTitle}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
