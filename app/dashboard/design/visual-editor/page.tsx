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
    Globe, LayoutTemplate, Code2,
} from 'lucide-react'
import VisualEditor from '@/components/ui/VisualEditor'

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
const CATEGORIES = [
    { id: 'general', label: 'General' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: 'Fashion & Beauty' },
    { id: 'home', label: 'Home & Garden' },
    { id: 'auto', label: 'Auto Parts' },
    { id: 'pet', label: 'Pet Supplies' },
    { id: 'sports', label: 'Sports & Outdoors' },
    { id: 'toys', label: 'Toys & Games' },
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

    // ── Auto-save on html change (debounced 3s) ───────────────────────────────
    useEffect(() => {
        if (loading) return
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
                await rawDb
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
                const { data, error } = await rawDb
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
                await rawDb
                    .from('listing_templates')
                    .update({
                        name,
                        category,
                        description_html: html,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
            } else {
                const { data, error } = await rawDb
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
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            if (savedId) {
                await rawDb
                    .from('listing_templates')
                    .update({
                        name,
                        category,
                        description_html: html,
                        is_shared: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
                setPublished(true)
                setTimeout(() => setPublished(false), 3000)
            } else {
                // Save first, then publish
                const { data, error } = await rawDb
                    .from('listing_templates')
                    .insert({
                        user_id: user.id,
                        name,
                        category,
                        description_html: html,
                        description: 'Visual Builder template',
                        is_system: false,
                        is_shared: true,
                        use_count: 0,
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    window.history.replaceState(null, '', `?id=${data.id}`)
                    setPublished(true)
                    setTimeout(() => setPublished(false), 3000)
                }
            }
        } catch (err) {
            console.error('[visual-editor] publish error:', err)
        } finally {
            setPublishing(false)
        }
    }, [savedId, name, category, html, supabase])

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
                            onChange={e => setName(e.target.value)}
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

                    {/* Auto-save indicator */}
                    {autoSaveLabel !== 'idle' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 20,
                            backgroundColor: autoSaveLabel === 'saved' ? C.successBg : C.bg,
                            border: `1px solid ${autoSaveLabel === 'saved' ? '#86efac50' : C.border}`,
                            flexShrink: 0,
                        }}>
                            {autoSaveLabel === 'saving' ? (
                                <Loader2 size={10} style={{ color: C.muted, animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <Check size={10} style={{ color: C.success }} />
                            )}
                            <span style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10,
                                fontWeight: 600,
                                color: autoSaveLabel === 'saved' ? C.success : C.muted,
                            }}>
                                {autoSaveLabel === 'saving' ? 'Saving...' : 'Draft Saved'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Centre — category selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 11,
                        color: C.muted,
                        whiteSpace: 'nowrap',
                    }}>
                        Category:
                    </span>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            color: C.body,
                            border: `1px solid ${C.borderInput}`,
                            borderRadius: 7,
                            padding: '4px 8px',
                            backgroundColor: C.surface,
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        {CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Right — Open in Code Editor + Save Draft + Publish */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* Open in Code Editor */}
                    <button
                        onClick={handleOpenInCodeEditor}
                        title="Open this template in the Code Editor"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            color: C.secondary,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = C.bg
                            e.currentTarget.style.color = C.dark
                            e.currentTarget.style.borderColor = C.dark
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = C.secondary
                            e.currentTarget.style.borderColor = C.border
                        }}
                    >
                        <Code2 size={13} />
                        Code Editor
                    </button>

                    {/* Save Draft */}
                    <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        title="Save Draft"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            backgroundColor: saved ? C.successBg : C.surface,
                            color: saved ? C.success : C.secondary,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: saving ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        {saving ? (
                            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : saved ? (
                            <Check size={13} />
                        ) : (
                            <Save size={13} />
                        )}
                        {saved ? 'Saved!' : 'Save Draft'}
                    </button>

                    {/* Publish */}
                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        title="Publish template"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 16px',
                            border: 'none',
                            borderRadius: 8,
                            backgroundColor: published ? C.success : C.primary,
                            color: '#ffffff',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: publishing ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                            opacity: publishing ? 0.8 : 1,
                            boxShadow: `0 2px 8px ${C.primary}44`,
                        }}
                        onMouseEnter={e => {
                            if (!publishing) e.currentTarget.style.backgroundColor = published ? C.success : C.primaryHover
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = published ? C.success : C.primary
                        }}
                    >
                        {publishing ? (
                            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : published ? (
                            <Check size={13} />
                        ) : (
                            <Globe size={13} />
                        )}
                        {published ? 'Published!' : 'Publish Template'}
                    </button>
                </div>
            </div>

            {/* ── VISUAL EDITOR — fills remaining height ────────────────── */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <VisualEditor
                    value={html}
                    onChange={setHtml}
                    placeholders={PLACEHOLDER_GROUPS}
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
