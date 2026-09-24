'use client'
// app/dashboard/design/visual-editor/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Template Builder
//
// Standalone page for the drag-and-drop visual editor.
// Accessed from Design Studio → Visual Builder card.
// Saves to listing_templates (same table as html-editor).
//
// Features:
//   ✓ Full-height VisualEditor component
//   ✓ Template name inline editable in top bar
//   ✓ Category selector
//   ✓ Save Draft — saves/updates to listing_templates
//   ✓ Publish — marks template as shared
//   ✓ Auto-save indicator (Draft Auto-Saved)
//   ✓ Device width preview (desktop / tablet / mobile) — handled inside VisualEditor
//   ✓ Back to Design Studio
//   ✓ Bottom status bar — synced, block count, eBay compliant
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createClient as createRawClient } from '@supabase/supabase-js'
import {
    ChevronLeft, Save, Check, Loader2,
    Globe, LayoutTemplate, Code2, Download,
} from 'lucide-react'
import VisualEditor from '@/components/ui/VisualEditor'
import ProDropdown, { DropdownOption } from '@/components/ui/ProDropdown'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryHover: '#6020e0',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    darkHover: '#2d1f4e',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    danger: '#ef4444',
}

// ── Placeholder groups — passed to VisualEditor ───────────────────────────────
const PLACEHOLDER_GROUPS = [
    {
        group: 'Product Info',
        items: [
            { label: 'Product Title', value: '{{PRODUCT_TITLE}}', example: 'Apple iPhone 15 Pro' },
            { label: 'Item Condition', value: '{{ITEM_CONDITION}}', example: 'New' },
            { label: 'Item Description', value: '{{ITEM_DESCRIPTION}}', example: 'Full description here...' },
            { label: 'Item SKU', value: '{{ITEM_SKU}}', example: 'SKU-12345' },
            { label: 'Item Category', value: '{{ITEM_CATEGORY}}', example: 'Electronics' },
            { label: 'Brand', value: '{{BRAND}}', example: 'Apple' },
            { label: 'Model', value: '{{MODEL}}', example: 'iPhone 15 Pro' },
        ],
    },
    {
        group: 'Pricing',
        items: [
            { label: 'Item Price', value: '{{ITEM_PRICE}}', example: '£499.99' },
            { label: 'Original Price', value: '{{ORIGINAL_PRICE}}', example: '£699.99' },
        ],
    },
    {
        group: 'Media',
        items: [
            { label: 'Main Image URL', value: '{{MAIN_IMAGE_URL}}', example: 'https://...' },
            { label: 'Image 2 URL', value: '{{IMAGE_2_URL}}', example: 'https://...' },
            { label: 'Image 3 URL', value: '{{IMAGE_3_URL}}', example: 'https://...' },
        ],
    },
    {
        group: 'Shipping & Returns',
        items: [
            { label: 'Shipping Time', value: '{{SHIPPING_TIME}}', example: '1-2 Business Days' },
            { label: 'Return Policy', value: '{{RETURN_POLICY}}', example: '30 days free return' },
            { label: 'Seller Name', value: '{{SELLER_NAME}}', example: 'TechStore_UK' },
        ],
    },
]

// ── Category options ──────────────────────────────────────────────────────────
const CATEGORIES: DropdownOption[] = [
    { val: 'general', label: 'General', enabled: true },
    { val: 'electronics', label: 'Electronics', enabled: true },
    { val: 'fashion', label: 'Fashion & Beauty', enabled: true },
    { val: 'home', label: 'Home & Garden', enabled: true },
    { val: 'auto', label: 'Auto Parts', enabled: true },
    { val: 'pet', label: 'Pet Supplies', enabled: true },
    { val: 'sports', label: 'Sports & Outdoors', enabled: true },
    { val: 'toys', label: 'Toys & Games', enabled: true },
]

// ── Supabase raw client (listing_templates not yet typed) ─────────────────────
const rawDb = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Default blank HTML ────────────────────────────────────────────────────────
const BLANK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #f8f8f8; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; }
  </style>
</head>
<body>
</body>
</html>`

// ─────────────────────────────────────────────────────────────────────────────
// PAGE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export default function VisualEditorPage() {
    return (
        <Suspense fallback={
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', backgroundColor: C.bg, gap: 12,
            }}>
                <Loader2 size={20} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.secondary }}>
                    Loading Visual Builder...
                </span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <VisualEditorInner />
        </Suspense>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function VisualEditorInner() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isAdmin = searchParams.get('admin') === 'true'

    // templateId from query — if present, load existing template
    const templateId = searchParams.get('id')
    const initialName = searchParams.get('name') || 'New Visual Template'

    // ── State ─────────────────────────────────────────────────────────────────
    const [html, setHtml] = useState(BLANK_HTML)
    const [name, setName] = useState(initialName)
    const [category, setCategory] = useState('general')
    const [savedId, setSavedId] = useState<string | null>(templateId)
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [saved, setSaved] = useState(false)
    const [published, setPublished] = useState(false)
    const [autoSaveLabel, setAutoSaveLabel] = useState<'idle' | 'saving' | 'saved'>('idle')
    const [loading, setLoading] = useState(!!templateId)
    const [editingName, setEditingName] = useState(false)
    const nameInputRef = useRef<HTMLInputElement>(null)
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [actionMenuOpen, setActionMenuOpen] = useState(false)
    const actionMenuRef = useRef<HTMLDivElement>(null)
    const exportFnRef = useRef<(() => void) | null>(null)
    const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published'>('idle')

    // ── Close action menu on outside click ───────────────────────────────────
    useEffect(() => {
        if (!actionMenuOpen) return
        const handler = (e: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
                setActionMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [actionMenuOpen])

    // ── Dirty / baseline tracking ────────────────────────────────────────────
    // dirty = true only after a real user edit (VisualEditor onChange,
    // name typed, or category changed). Auto-save skips while dirty is false,
    // so opening a blank page and leaving won't write a blank template.
    const dirtyRef = useRef(false)
    const baselineRef = useRef<{ html: string; name: string; category: string } | null>(null)

    // ── Load existing template ────────────────────────────────────────────────
    useEffect(() => {
        if (!templateId) return
            ; (async () => {
                setLoading(true)
                try {
                    const { data } = await rawDb
                        .from('listing_templates')
                        .select('id, name, category, description_html')
                        .eq('id', templateId)
                        .single()
                    if (data) {
                        setName(data.name || initialName)
                        setCategory(data.category || 'general')
                        setHtml(data.description_html || BLANK_HTML)
                        setSavedId(data.id)
                    }
                } catch (err) {
                    console.error('[visual-editor] load error:', err)
                } finally {
                    setLoading(false)
                }
            })()
    }, [templateId]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Capture baseline once loading finishes ───────────────────────────────
    // Records the loaded state as the comparison point. dirty starts at false.
    useEffect(() => {
        if (loading) return
        baselineRef.current = { html, name, category }
        dirtyRef.current = false
    }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-save on real edit (debounced 3s, only when dirty) ───────────────
    useEffect(() => {
        if (loading) return
        if (!dirtyRef.current) return
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        setAutoSaveLabel('idle')
        autoSaveTimer.current = setTimeout(() => {
            handleAutoSave()
        }, 3000)
        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        }
    }, [html, name, category]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-save handler ─────────────────────────────────────────────────────
    const handleAutoSave = useCallback(async () => {
        setAutoSaveLabel('saving')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            if (savedId) {
                // Update existing
                await (supabase as any)
                    .from('listing_templates')
                    .update({
                        name,
                        category,
                        description_html: html,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
            } else {
                // Create new draft
                const { data, error } = await (supabase as any)
                    .from('listing_templates')
                    .insert({
                        user_id: user.id,
                        name,
                        category,
                        description_html: html,
                        description: 'Visual Builder template',
                        is_system: false,
                        is_shared: false,
                        use_count: 0,
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    // Update URL without reload
                    window.history.replaceState(null, '', `?id=${data.id}`)
                }
            }
            setAutoSaveLabel('saved')
            setTimeout(() => setAutoSaveLabel('idle'), 2000)
            // Reset dirty after successful save — next edit will re-trigger.
            dirtyRef.current = false
            // Update baseline so subsequent name/category diffs compare against
            // the just-saved values (not the originally-loaded ones).
            baselineRef.current = { html, name, category }
        } catch (err) {
            console.error('[visual-editor] auto-save error:', err)
            setAutoSaveLabel('idle')
        }
    }, [savedId, name, category, html, supabase])

    // ── Manual Save Draft ─────────────────────────────────────────────────────
    const handleSaveDraft = useCallback(async () => {
        setSaving(true)
        setSaved(false)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            if (savedId) {
                await (supabase as any)
                    .from('listing_templates')
                    .update({
                        name,
                        category,
                        description_html: html,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
            } else {
                const { data, error } = await (supabase as any)
                    .from('listing_templates')
                    .insert({
                        user_id: user.id,
                        name,
                        category,
                        description_html: html,
                        description: 'Visual Builder template',
                        is_system: false,
                        is_shared: false,
                        use_count: 0,
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    window.history.replaceState(null, '', `?id=${data.id}`)
                }
            }
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) {
            console.error('[visual-editor] save draft error:', err)
        } finally {
            setSaving(false)
        }
    }, [savedId, name, category, html, supabase])

    // ── Publish ───────────────────────────────────────────────────────────────
    const handlePublish = useCallback(async () => {
        setPublishing(true)
        setPublished(false)
        setPublishStatus('publishing')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const publishPayload = {
                name,
                category,
                description_html: html,
                is_shared: true,
                is_system: isAdmin,
                thumbnail_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=200&h=150&fit=crop',
            }

            if (savedId) {
                await (supabase as any)
                    .from('listing_templates')
                    .update({
                        ...publishPayload,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
                setPublished(true)
                setPublishStatus('published')
                setTimeout(() => { setPublished(false); setPublishStatus('idle') }, 3000)
                router.refresh()
            } else {
                const { data, error } = await (supabase as any)
                    .from('listing_templates')
                    .insert({
                        user_id: user.id,
                        ...publishPayload,
                        description: 'Visual Builder template',
                        use_count: 0,
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    window.history.replaceState(null, '', `?id=${data.id}`)
                    setPublished(true)
                    setPublishStatus('published')
                    setTimeout(() => { setPublished(false); setPublishStatus('idle') }, 3000)
                    router.push('/dashboard/design?tab=templates')
                }
            }
        } catch (err) {
            console.error('[visual-editor] publish error:', err)
            setPublishStatus('idle')
        } finally {
            setPublishing(false)
        }
    }, [savedId, name, category, html, supabase, isAdmin])

    // ── Name edit ─────────────────────────────────────────────────────────────
    const startEditingName = () => {
        setEditingName(true)
        setTimeout(() => nameInputRef.current?.select(), 0)
    }

    const commitName = () => {
        setEditingName(false)
        if (!name.trim()) setName('New Visual Template')
    }

    // ── Open in Code Editor ───────────────────────────────────────────────────
    // Passes the current compiled HTML to the html-editor page via sessionStorage
    // so the code editor opens with the visual template ready to fine-tune.
    const handleOpenInCodeEditor = () => {
        try {
            sessionStorage.setItem('riazify_visual_export_html', html)
            sessionStorage.setItem('riazify_visual_export_name', name)
        } catch {
            // sessionStorage unavailable — pass via URL (truncated, best effort)
        }
        router.push(
            `/dashboard/design/html-editor?source=visual&name=${encodeURIComponent(name)}`
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', backgroundColor: C.bg, flexDirection: 'column', gap: 14,
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: C.primaryLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <LayoutTemplate size={22} style={{ color: C.primary }} />
                </div>
                <Loader2 size={18} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.secondary }}>
                    Loading template...
                </p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: C.bg,
        }}>

            {/* ── TOP BAR ─────────────────────────────────────────────────── */}
            <div style={{
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                backgroundColor: C.surface,
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
                gap: 12,
                zIndex: 10,
            }}>
                {/* Left — back + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    {/* Back button */}
                    <button
                        onClick={() => router.push('/dashboard/design')}
                        title="Back to Design Studio"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 10px',
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            color: C.secondary,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = C.bg
                            e.currentTarget.style.color = C.dark
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = C.secondary
                        }}
                    >
                        <ChevronLeft size={13} />
                        Design Studio
                    </button>

                    {/* Divider */}
                    <div style={{ width: 1, height: 20, backgroundColor: C.border, flexShrink: 0 }} />

                    {/* Page title */}
                    <span style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.primary,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                    }}>
                        Visual Template Builder
                    </span>

                    {/* Divider */}
                    <div style={{ width: 1, height: 20, backgroundColor: C.border, flexShrink: 0 }} />

                    {/* Template name — click to edit */}
                    {editingName ? (
                        <input
                            ref={nameInputRef}
                            value={name}
                            onChange={e => {
                                dirtyRef.current = true
                                setName(e.target.value)
                            }}
                            onBlur={commitName}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === 'Escape') commitName()
                            }}
                            style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 13,
                                fontWeight: 500,
                                color: C.body,
                                border: `1px solid ${C.primary}`,
                                borderRadius: 6,
                                padding: '3px 8px',
                                outline: 'none',
                                backgroundColor: C.surface,
                                width: 220,
                                boxShadow: `0 0 0 3px ${C.primary}22`,
                            }}
                            autoFocus
                        />
                    ) : (
                        <button
                            onClick={startEditingName}
                            title="Click to rename"
                            style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 13,
                                fontWeight: 500,
                                color: C.body,
                                background: 'none',
                                border: `1px solid transparent`,
                                borderRadius: 6,
                                padding: '3px 8px',
                                cursor: 'text',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 200,
                                transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = C.border}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            {name}
                        </button>
                    )}

                </div>

                {/* Right — single action menu button */}
                <div style={{ position: 'relative', flexShrink: 0 }} ref={actionMenuRef}>

                    {/* Auto-save pill — only shows when active */}
                    {autoSaveLabel !== 'idle' && (
                        <span style={{
                            position: 'absolute', top: -8, left: -100,
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px', borderRadius: 20,
                            backgroundColor: autoSaveLabel === 'saved' ? C.successBg : C.bg,
                            border: `1px solid ${autoSaveLabel === 'saved' ? '#86efac50' : C.border}`,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 600,
                            color: autoSaveLabel === 'saved' ? C.success : C.muted,
                            whiteSpace: 'nowrap', pointerEvents: 'none',
                        }}>
                            {autoSaveLabel === 'saving'
                                ? <Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} />
                                : <Check size={9} />}
                            {autoSaveLabel === 'saving' ? 'Auto-saving…' : 'Draft saved'}
                        </span>
                    )}

                    {/* Trigger button */}
                    <button
                        onClick={() => setActionMenuOpen(o => !o)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 14px',
                            border: 'none', borderRadius: 8,
                            backgroundColor: published ? C.success : C.primary,
                            color: '#ffffff',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: `0 2px 8px ${C.primary}44`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = published ? C.success : C.primaryHover }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = published ? C.success : C.primary }}
                    >
                        {published ? <Check size={13} /> : <Globe size={13} />}
                        {published ? 'Published!' : 'Publish'}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.8, marginLeft: 2 }}>
                            <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Dropdown panel */}
                    {actionMenuOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            width: 260, backgroundColor: C.surface,
                            border: `1px solid ${C.border}`, borderRadius: 12,
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                            zIndex: 1000, overflow: 'hidden',
                        }}>
                            {/* Category section */}
                            {/* onMouseDown stopPropagation prevents the portal-rendered
                                ProDropdown menu clicks from reaching the document mousedown
                                outside-click handler and closing this panel (#bug) */}
                            <div
                                onMouseDown={e => e.stopPropagation()}
                                style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.border}` }}
                            >
                                <p style={{
                                    margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 10, fontWeight: 700, color: C.muted,
                                    textTransform: 'uppercase', letterSpacing: 0.8,
                                }}>
                                    Category
                                </p>
                                <ProDropdown
                                    prefix=""
                                    currentValue={category}
                                    options={CATEGORIES}
                                    onChanged={(v) => {
                                        dirtyRef.current = true
                                        setCategory(v)
                                    }}
                                    width={232}
                                />
                            </div>

                            {/* Action buttons */}
                            <div style={{ padding: '8px 8px' }}>
                                {/* Save Draft */}
                                <button
                                    onClick={() => { handleSaveDraft(); setActionMenuOpen(false) }}
                                    disabled={saving}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '9px 10px', border: 'none', borderRadius: 8,
                                        backgroundColor: saved ? C.successBg : 'transparent',
                                        color: saved ? C.success : C.body,
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                                        cursor: saving ? 'default' : 'pointer', textAlign: 'left',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => { if (!saving && !saved) e.currentTarget.style.backgroundColor = C.bg }}
                                    onMouseLeave={e => { if (!saved) e.currentTarget.style.backgroundColor = 'transparent' }}
                                >
                                    <span style={{
                                        width: 28, height: 28, borderRadius: 7,
                                        backgroundColor: saved ? '#dcfce7' : C.bg,
                                        border: `1px solid ${saved ? '#86efac' : C.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {saving
                                            ? <Loader2 size={13} style={{ color: C.muted, animation: 'spin 1s linear infinite' }} />
                                            : saved
                                                ? <Check size={13} style={{ color: C.success }} />
                                                : <Save size={13} style={{ color: C.secondary }} />}
                                    </span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>
                                            {saved ? 'Draft Saved!' : 'Save Draft'}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>
                                            Save without publishing
                                        </p>
                                    </div>
                                </button>

                                {/* Open in Code Editor */}
                                <button
                                    onClick={() => { handleOpenInCodeEditor(); setActionMenuOpen(false) }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '9px 10px', border: 'none', borderRadius: 8,
                                        backgroundColor: 'transparent', color: C.body,
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.bg }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                >
                                    <span style={{
                                        width: 28, height: 28, borderRadius: 7,
                                        backgroundColor: C.bg, border: `1px solid ${C.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Code2 size={13} style={{ color: C.secondary }} />
                                    </span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>Code Editor</p>
                                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>Fine-tune the raw HTML</p>
                                    </div>
                                </button>
                            </div>

                            {/* Publish — bottom section, highlighted */}
                            <div style={{ padding: '8px', borderTop: `1px solid ${C.border}` }}>
                                <button
                                    onClick={() => { handlePublish(); setActionMenuOpen(false) }}
                                    disabled={publishing}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 10px', border: 'none', borderRadius: 8,
                                        backgroundColor: published ? '#dcfce7' : C.primaryLight,
                                        color: published ? C.success : C.primary,
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700,
                                        cursor: publishing ? 'default' : 'pointer', textAlign: 'left',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => { if (!publishing) e.currentTarget.style.opacity = '0.85' }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                                >
                                    <span style={{
                                        width: 28, height: 28, borderRadius: 7,
                                        backgroundColor: published ? C.success : C.primary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {publishing
                                            ? <Loader2 size={13} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                                            : published
                                                ? <Check size={13} style={{ color: '#fff' }} />
                                                : <Globe size={13} style={{ color: '#fff' }} />}
                                    </span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 12 }}>
                                            {published ? 'Published!' : 'Publish Template'}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 10, opacity: 0.7, fontWeight: 400 }}>
                                            Make visible to all users
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── VISUAL EDITOR — fills remaining height ────────────────── */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <VisualEditor
                    value={html}
                    onChange={(next) => {
                        // VisualEditor only emits onChange from real user
                        // actions (add/move/edit/delete/undo/redo), so this
                        // is a safe signal that the user actually edited.
                        dirtyRef.current = true
                        setHtml(next)
                    }}
                    placeholders={PLACEHOLDER_GROUPS}
                    // Seed the canvas with the saved template's DB category so
                    // its previews use category-matched sample data
                    // (e.g. electronics → headphones, fashion → sneakers).
                    // Falls back to 'pet' if category is unknown.
                    initialCategory={
                        (['pet', 'electronics', 'fashion', 'home', 'sports', 'auto', 'general'] as const)
                            .includes(category as any)
                            ? (category as any)
                            : 'pet'
                    }
                    templateCategory={category}
                />
            </div>

            {/* Spin keyframe */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
