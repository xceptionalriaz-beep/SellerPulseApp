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
    Globe, LayoutTemplate, Code2, Download, History, EyeOff,
    Image, Upload, Tag, X, Eye, Copy,
} from 'lucide-react'
import VisualEditor from '@/components/ui/VisualEditor'
import TemplatePreviewModal from '@/components/ui/TemplatePreviewModal'
import ProDropdown, { DropdownOption } from '@/components/ui/ProDropdown'
import { auditHtml } from '@/components/ui/VisualEditor/audit'
import type { TemplateSlot } from '@/app/dashboard/listing-generator/types/listing.types'
import VersionHistoryPanel, { saveTemplateVersion } from '@/components/ui/VersionHistoryPanel'
import { getFreeVariantIds } from '@/components/ui/VisualEditor/PropertiesPanel'
import { getVariants } from '@/components/ui/VisualEditor/variants/index'
import { VariantThumbnail } from '@/components/ui/VisualEditor/variantThumbnails'
import type { Block } from '@/components/ui/VisualEditor/blocks'

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

// ── Category options — IDs match gallery page CATEGORIES for filter compatibility
const CATEGORIES: DropdownOption[] = [
    { val: 'general', label: 'General / Other', enabled: true },
    { val: 'consumer_electronics', label: 'Consumer Electronics', enabled: true },
    { val: 'computers', label: 'Computers & Tablets', enabled: true },
    { val: 'clothing', label: 'Clothing & Accessories', enabled: true },
    { val: 'jewelry', label: 'Jewellery & Watches', enabled: true },
    { val: 'health_beauty', label: 'Health & Beauty', enabled: true },
    { val: 'home_garden', label: 'Home & Garden', enabled: true },
    { val: 'furniture', label: 'Furniture', enabled: true },
    { val: 'toys_hobbies', label: 'Toys & Hobbies', enabled: true },
    { val: 'sporting_goods', label: 'Sporting Goods', enabled: true },
    { val: 'collectibles', label: 'Collectibles & Art', enabled: true },
    { val: 'books_movies', label: 'Books & Media', enabled: true },
    { val: 'pet_supplies', label: 'Pet Supplies', enabled: true },
    { val: 'motors_parts', label: 'Motors & Parts', enabled: true },
    { val: 'business', label: 'Business & Industrial', enabled: true },
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
    // isAdmin = true when opened from the admin panel (?admin=true).
    // UI-only flag — the real security gate is Supabase RLS on listing_templates.
    // A regular user who appends ?admin=true would still fail the DB write.
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
    const [saved, setSaved] = useState(false)
    const [autoSaveLabel, setAutoSaveLabel] = useState<'idle' | 'saving' | 'saved'>('idle')
    const [loading, setLoading] = useState(!!templateId)
    const [editingName, setEditingName] = useState(false)
    const nameInputRef = useRef<HTMLInputElement>(null)
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [actionMenuOpen, setActionMenuOpen] = useState(false)
    const actionMenuRef = useRef<HTMLDivElement>(null)
    const exportFnRef = useRef<(() => void) | null>(null)
    // Single source of truth for publish state — previously duplicated as
    // published/publishing booleans AND publishStatus string (bug #8)
    const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published'>('idle')
    const publishing = publishStatus === 'publishing'
    const published = publishStatus === 'published'
    /** Phase 1 AI bridge — slot role map for this template */
    const [slots, setSlots] = useState<TemplateSlot[]>([])
    const [showVersionHistory, setShowVersionHistory] = useState(false)
    // Admin-only state
    const [description, setDescription] = useState('')
    const [isLive, setIsLive] = useState(false) // true when is_system = true in DB
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [thumbnailStatus, setThumbnailStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
    const thumbnailInputRef = useRef<HTMLInputElement>(null)
    // Tags & sort order — admin only
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [sortOrder, setSortOrder] = useState<number>(0)
    // Featured / New badge toggles & usage stats — admin only
    const [isFeatured, setIsFeatured] = useState(false)
    const [isNewBadge, setIsNewBadge] = useState(false)
    const [useCount, setUseCount] = useState(0)
    // Preview as User modal
    const [showPreview, setShowPreview] = useState(false)
    const [previewCopied, setPreviewCopied] = useState(false)
    // Duplicate
    const [duplicating, setDuplicating] = useState(false)
    // Design Studio Pro gating
    const [designStudioPlan] = useState<'free' | 'pro'>('free') // TODO: derive from user subscription
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const blocksRef = useRef<Block[]>([]) // live blocks for Pro-style detection

    // Pro export gate popup
    const [showProExportGate, setShowProExportGate] = useState(false)
    const [proGateBlocks, setProGateBlocks] = useState<Array<{
        blockId: string; blockType: string; variantId: string; variantLabel: string
    }>>([])
    const [proGateShowAll, setProGateShowAll] = useState(false)
    const proGateRef = useRef<HTMLDivElement>(null)

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

    // ── Close Pro export gate on outside click ────────────────────────────────
    useEffect(() => {
        if (!showProExportGate) return
        const handler = (e: MouseEvent) => {
            if (proGateRef.current && !proGateRef.current.contains(e.target as Node)) {
                setShowProExportGate(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showProExportGate])

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
                        .select('id, name, category, description_html, slots, description, is_system, thumbnail_url, use_count, tags, sort_order, is_featured, is_new_badge')
                        .eq('id', templateId)
                        .single()
                    if (data) {
                        setName(data.name || initialName)
                        setCategory(data.category || 'general')
                        setHtml(data.description_html || BLANK_HTML)
                        setSavedId(data.id)
                        setSlots(Array.isArray(data.slots) ? data.slots : [])
                        if (isAdmin) {
                            setDescription(data.description || '')
                            setIsLive(!!data.is_system)
                            setThumbnailUrl(data.thumbnail_url || null)
                            setTags(Array.isArray(data.tags) ? data.tags : [])
                            setSortOrder(typeof data.sort_order === 'number' ? data.sort_order : 0)
                            setUseCount(data.use_count || 0)
                            setIsFeatured(!!data.is_featured)
                            setIsNewBadge(!!data.is_new_badge)
                        }
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

            const isEbayCompliant = auditHtml(html).count === 0

            if (savedId) {
                // Update existing
                await (supabase as any)
                    .from('listing_templates')
                    .update({
                        name,
                        category,
                        description_html: html,
                        is_ebay_compliant: isEbayCompliant,
                        slots,
                        ...(isAdmin ? { description, tags, sort_order: sortOrder, is_featured: isFeatured, is_new_badge: isNewBadge } : {}),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
            } else {
                // Create new draft
                const { data, error } = await (supabase as any)
                    .from('listing_templates')
                    .insert({
                        user_id: isAdmin ? null : user.id,
                        name,
                        category,
                        description_html: html,
                        is_ebay_compliant: isEbayCompliant,
                        slots,
                        description: isAdmin ? description : 'Visual Builder template',
                        is_system: false,
                        is_shared: false,
                        use_count: 0,
                        ...(isAdmin ? { tags, sort_order: sortOrder, is_featured: isFeatured, is_new_badge: isNewBadge } : {}),
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    // Update URL without reload, keep ?admin=true so isAdmin stays correct
                    window.history.replaceState(null, '', `?id=${data.id}${isAdmin ? '&admin=true' : ''}`)
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
    }, [savedId, name, category, html, slots, tags, sortOrder, isFeatured, isNewBadge, supabase])

    // ── Manual Save Draft ─────────────────────────────────────────────────────
    const handleSaveDraft = useCallback(async () => {
        setSaving(true)
        setSaved(false)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const isEbayCompliant = auditHtml(html).count === 0

            if (savedId) {
                await (supabase as any)
                    .from('listing_templates')
                    .update({
                        name,
                        category,
                        description_html: html,
                        is_ebay_compliant: isEbayCompliant,
                        slots,
                        ...(isAdmin ? { description, tags, sort_order: sortOrder, is_featured: isFeatured, is_new_badge: isNewBadge } : {}),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
                // Save version snapshot (non-blocking)
                saveTemplateVersion(savedId, user.id, html, name)
            } else {
                const { data, error } = await (supabase as any)
                    .from('listing_templates')
                    .insert({
                        user_id: isAdmin ? null : user.id,
                        name,
                        category,
                        description_html: html,
                        is_ebay_compliant: isEbayCompliant,
                        slots,
                        description: isAdmin ? description : 'Visual Builder template',
                        is_system: false,
                        is_shared: false,
                        use_count: 0,
                        ...(isAdmin ? { tags, sort_order: sortOrder, is_featured: isFeatured, is_new_badge: isNewBadge } : {}),
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    window.history.replaceState(null, '', `?id=${data.id}${isAdmin ? '&admin=true' : ''}`)
                    // Save initial version snapshot
                    saveTemplateVersion(data.id, user.id, html, name)
                }
            }
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) {
            console.error('[visual-editor] save draft error:', err)
        } finally {
            setSaving(false)
        }
    }, [savedId, name, category, html, slots, tags, sortOrder, isFeatured, isNewBadge, supabase])

    // ── Publish ───────────────────────────────────────────────────────────────
    // Check if any block uses a Pro-only style (first 2 variants are free for
    // blocks with ≥10 styles; divider has its own 5-free set).
    const hasProStyles = useCallback((blocks: Block[]) => {
        return blocks.some(b => {
            const freeIds = getFreeVariantIds(b.type)
            if (!freeIds) return false       // block has <10 variants → all free
            const variantId = (b.props as any).variant ?? (b.props as any).layoutStyle
            if (!variantId) return false
            return !freeIds.has(variantId)
        })
    }, [])

    // Collect all blocks using Pro styles (for the export gate popup)
    const collectProBlocks = useCallback((blocks: Block[]) => {
        return blocks
            .filter(b => {
                const freeIds = getFreeVariantIds(b.type)
                if (!freeIds) return false
                const variantId = (b.props as any).variant ?? (b.props as any).layoutStyle
                return variantId && !freeIds.has(variantId)
            })
            .map(b => {
                const variantId = (b.props as any).variant ?? (b.props as any).layoutStyle as string
                const variants = getVariants(b.type)
                const variantDef = variants?.find(v => v.id === variantId)
                return {
                    blockId: b.id,
                    blockType: b.type,
                    variantId,
                    variantLabel: variantDef?.label ?? variantId.replace(/_/g, ' '),
                }
            })
    }, [])

    // Try a gated action — if free + Pro styles, show the gate popup instead
    const tryGatedAction = useCallback((action: () => void) => {
        if (designStudioPlan === 'pro') { action(); return }
        const proBlocks = collectProBlocks(blocksRef.current)
        if (proBlocks.length === 0) { action(); return }
        setProGateBlocks(proBlocks)
        setProGateShowAll(false)
        setShowProExportGate(true)
    }, [designStudioPlan, collectProBlocks])

    const handlePublish = useCallback(async () => {
        // Gate: free users with Pro styles must upgrade before publishing
        if (designStudioPlan === 'free' && hasProStyles(blocksRef.current)) {
            setShowUpgradeModal(true)
            return
        }
        setPublishStatus('publishing')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const publishPayload = {
                name,
                category,
                description_html: html,
                is_ebay_compliant: auditHtml(html).count === 0,
                slots,
                is_shared: true,
                is_system: isAdmin,
                thumbnail_url: thumbnailUrl ?? null,
                ...(isAdmin ? { description, tags, sort_order: sortOrder, is_featured: isFeatured, is_new_badge: isNewBadge } : {}),
            }

            if (savedId) {
                await (supabase as any)
                    .from('listing_templates')
                    .update({
                        ...publishPayload,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', savedId)
                setPublishStatus('published')
                if (isAdmin) setIsLive(true)
                setTimeout(() => {
                    setPublishStatus('idle')
                    // Fix #4 — redirect to correct page after publish
                    if (isAdmin) router.push('/dashboard/admin')
                }, 1500)
            } else {
                const { data, error } = await (supabase as any)
                    .from('listing_templates')
                    .insert({
                        user_id: isAdmin ? null : user.id,
                        ...publishPayload,
                        description: 'Visual Builder template',
                        use_count: 0,
                    })
                    .select('id')
                    .single()
                if (!error && data) {
                    setSavedId(data.id)
                    window.history.replaceState(null, '', `?id=${data.id}${isAdmin ? '&admin=true' : ''}`)
                    setPublishStatus('published')
                    setTimeout(() => {
                        setPublishStatus('idle')
                        // Fix #4 — redirect to correct page after publish
                        router.push(isAdmin ? '/dashboard/admin' : '/dashboard/design?tab=templates')
                    }, 1500)
                }
            }
        } catch (err) {
            console.error('[visual-editor] publish error:', err)
            setPublishStatus('idle')
        }
    }, [savedId, name, category, html, slots, tags, sortOrder, isFeatured, isNewBadge, supabase, isAdmin, designStudioPlan, hasProStyles])

    // ── Unpublish (admin only) ────────────────────────────────────────────────
    const handleUnpublish = useCallback(async () => {
        if (!savedId) return
        try {
            await (supabase as any)
                .from('listing_templates')
                .update({ is_system: false, is_shared: false, updated_at: new Date().toISOString() })
                .eq('id', savedId)
            setIsLive(false)
        } catch (err) {
            console.error('[visual-editor] unpublish error:', err)
        }
    }, [savedId, supabase])

    // ── Duplicate template (admin only) ──────────────────────────────────────
    const handleDuplicate = useCallback(async () => {
        if (!savedId) { alert('Save the template first before duplicating.'); return }
        setDuplicating(true)
        try {
            const { data, error } = await (supabase as any)
                .from('listing_templates')
                .insert({
                    user_id: null,
                    name: `Copy of ${name}`,
                    category,
                    description_html: html,
                    is_ebay_compliant: auditHtml(html).count === 0,
                    slots,
                    description,
                    is_system: false,
                    is_shared: false,
                    use_count: 0,
                    thumbnail_url: thumbnailUrl,
                    tags,
                    sort_order: sortOrder,
                    is_featured: false,
                    is_new_badge: false,
                })
                .select('id')
                .single()
            if (!error && data) {
                router.push(`/dashboard/design/visual-editor?id=${data.id}&admin=true`)
            }
        } catch (err) {
            console.error('[visual-editor] duplicate error:', err)
        } finally {
            setDuplicating(false)
        }
    }, [savedId, name, category, html, slots, description, thumbnailUrl, tags, sortOrder, supabase, router])

    // ── Thumbnail helpers (admin only) ────────────────────────────────────────
    const uploadThumbnailBlob = useCallback(async (blob: Blob, ext: 'png' | 'jpg' = 'png') => {
        const id = savedId
        if (!id) throw new Error('Save the template first')
        const path = `thumbnails/${id}.${ext}`
        const { error: upErr } = await supabase.storage
            .from('template-assets')
            .upload(path, blob, { upsert: true, contentType: blob.type || `image/${ext}` })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage
            .from('template-assets').getPublicUrl(path)
        await (supabase as any)
            .from('listing_templates')
            .update({ thumbnail_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', id)
        setThumbnailUrl(publicUrl)
        return publicUrl
    }, [savedId, supabase])

    const handleUploadThumbnail = useCallback(async (file: File) => {
        if (!savedId) { alert('Save the template first before uploading a thumbnail.'); return }
        setThumbnailStatus('uploading')
        try {
            const ext = file.type === 'image/jpeg' ? 'jpg' : 'png'
            await uploadThumbnailBlob(file, ext)
            setThumbnailStatus('done')
            setTimeout(() => setThumbnailStatus('idle'), 2500)
        } catch (err) {
            console.error('[thumbnail] upload error:', err)
            setThumbnailStatus('error')
            setTimeout(() => setThumbnailStatus('idle'), 3000)
        }
    }, [savedId, uploadThumbnailBlob])

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
                    onExportReady={(fn) => { exportFnRef.current = fn }}
                    onPublish={handlePublish}
                    designStudioPlan={designStudioPlan}
                    onUpgradeClick={() => setShowUpgradeModal(true)}
                    onBlocksChange={(b) => { blocksRef.current = b }}
                    publishStatus={publishStatus}
                    onBack={() => router.push(isAdmin ? '/dashboard/admin' : '/dashboard/design')}
                    toolbarSlot={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Draft / Live status badge — admin only */}
                            {isAdmin && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '4px 10px', borderRadius: 20,
                                    backgroundColor: isLive ? '#dcfce7' : '#f3f4f6',
                                    border: `1px solid ${isLive ? '#86efac' : '#e5e7eb'}`,
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                                    color: isLive ? '#16a34a' : '#6b7280',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    flexShrink: 0,
                                }}>
                                    <div style={{
                                        width: 6, height: 6, borderRadius: '50%',
                                        backgroundColor: isLive ? '#16a34a' : '#9ca3af',
                                    }} />
                                    {isLive ? 'Live' : 'Draft'}
                                </div>
                            )}
                            {/* Usage count — admin only */}
                            {isAdmin && useCount > 0 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 10px', borderRadius: 20,
                                    backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb',
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                    color: '#6b7280', fontWeight: 600, flexShrink: 0,
                                }}>
                                    Used {useCount}×
                                </div>
                            )}
                            {/* History button — disabled until template has been saved at least once */}
                            <button
                                onClick={() => savedId ? setShowVersionHistory(v => !v) : undefined}
                                disabled={!savedId}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px',
                                    border: `1px solid ${showVersionHistory ? C.primary : C.border}`, borderRadius: 8,
                                    backgroundColor: showVersionHistory ? C.primaryLight : C.surface,
                                    color: showVersionHistory ? C.primary : (savedId ? C.secondary : C.muted),
                                    fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                                    cursor: savedId ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
                                    opacity: savedId ? 1 : 0.5,
                                }}
                                title={savedId ? 'View version history' : 'Save the template first to enable version history'}
                            >
                                <History size={13} />
                                History
                            </button>
                            <div style={{ position: 'relative' }} ref={actionMenuRef}>
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
                                {/* Dropdown panel — moved here from old top bar */}
                                {actionMenuOpen && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                        width: 260, backgroundColor: C.surface,
                                        border: `1px solid ${C.border}`, borderRadius: 12,
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                        zIndex: 1000, overflow: 'hidden',
                                    }}>
                                        {/* Category section */}
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
                                            {/* Gallery description — admin only */}
                                            {isAdmin && (
                                                <div style={{ marginTop: 10 }}>
                                                    <p style={{
                                                        margin: '0 0 5px', fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: 10, fontWeight: 700, color: C.muted,
                                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                                    }}>
                                                        Gallery Description
                                                    </p>
                                                    <textarea
                                                        value={description}
                                                        onChange={e => {
                                                            dirtyRef.current = true
                                                            setDescription(e.target.value)
                                                        }}
                                                        placeholder="Short description shown in the template gallery..."
                                                        rows={3}
                                                        style={{
                                                            width: '100%', boxSizing: 'border-box',
                                                            padding: '7px 9px', resize: 'vertical',
                                                            border: `1px solid ${C.borderInput}`, borderRadius: 8,
                                                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                                                            color: C.body, backgroundColor: C.bg,
                                                            outline: 'none', lineHeight: 1.5,
                                                        }}
                                                        onFocus={e => { e.target.style.borderColor = C.primary }}
                                                        onBlur={e => { e.target.style.borderColor = C.borderInput }}
                                                    />
                                                </div>
                                            )}
                                            {/* Thumbnail — admin only */}
                                            {isAdmin && (
                                                <div style={{ marginTop: 10 }}>
                                                    <p style={{
                                                        margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: 10, fontWeight: 700, color: C.muted,
                                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                                    }}>
                                                        Gallery Thumbnail
                                                    </p>
                                                    {/* Thumbnail preview */}
                                                    <div style={{
                                                        width: '100%', height: 110, borderRadius: 8,
                                                        border: `1px dashed ${thumbnailUrl ? C.primary : C.borderInput}`,
                                                        backgroundColor: thumbnailUrl ? 'transparent' : C.bg,
                                                        overflow: 'hidden', marginBottom: 6,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        position: 'relative',
                                                    }}>
                                                        {thumbnailUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={thumbnailUrl}
                                                                alt="Template thumbnail"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                                                color: C.muted,
                                                            }}>
                                                                <Image size={22} />
                                                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10 }}>
                                                                    No thumbnail yet
                                                                </span>
                                                            </div>
                                                        )}
                                                        {thumbnailStatus === 'uploading' && (
                                                            <div style={{
                                                                position: 'absolute', inset: 0,
                                                                backgroundColor: 'rgba(255,255,255,0.85)',
                                                                display: 'flex', flexDirection: 'column',
                                                                alignItems: 'center', justifyContent: 'center', gap: 6,
                                                            }}>
                                                                <Loader2 size={18} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                                                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.secondary }}>
                                                                    Uploading…
                                                                </span>
                                                            </div>
                                                        )}
                                                        {thumbnailStatus === 'done' && (
                                                            <div style={{
                                                                position: 'absolute', top: 6, right: 6,
                                                                backgroundColor: C.success, borderRadius: 20,
                                                                padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4,
                                                            }}>
                                                                <Check size={10} style={{ color: '#fff' }} />
                                                                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: '#fff', fontWeight: 700 }}>Saved</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Upload button */}
                                                    <button
                                                        onClick={() => thumbnailInputRef.current?.click()}
                                                        disabled={thumbnailStatus === 'uploading'}
                                                        style={{
                                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                            padding: '6px 8px', borderRadius: 7,
                                                            border: `1px solid ${C.border}`,
                                                            backgroundColor: 'transparent',
                                                            color: C.secondary, cursor: thumbnailStatus === 'uploading' ? 'default' : 'pointer',
                                                            fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600,
                                                            transition: 'all 0.12s',
                                                            opacity: thumbnailStatus === 'uploading' ? 0.6 : 1,
                                                        }}
                                                        title="Upload a thumbnail image"
                                                    >
                                                        <Upload size={11} />
                                                        Upload Image
                                                    </button>
                                                    {thumbnailStatus === 'error' && (
                                                        <p style={{ margin: '5px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.danger }}>
                                                            Upload failed — please try again.
                                                        </p>
                                                    )}
                                                    <input
                                                        ref={thumbnailInputRef}
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        style={{ display: 'none' }}
                                                        onChange={e => {
                                                            const file = e.target.files?.[0]
                                                            if (file) handleUploadThumbnail(file)
                                                            e.target.value = ''
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {/* Tags — admin only */}
                                            {isAdmin && (
                                                <div style={{ marginTop: 10 }}>
                                                    <p style={{
                                                        margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: 10, fontWeight: 700, color: C.muted,
                                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                                    }}>
                                                        Tags / Keywords
                                                    </p>
                                                    {/* Tag chips */}
                                                    {tags.length > 0 && (
                                                        <div style={{
                                                            display: 'flex', flexWrap: 'wrap', gap: 4,
                                                            marginBottom: 6,
                                                        }}>
                                                            {tags.map(tag => (
                                                                <span key={tag} style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                                                    padding: '2px 7px 2px 8px', borderRadius: 20,
                                                                    backgroundColor: C.primaryLight,
                                                                    border: `1px solid ${C.border}`,
                                                                    fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                                                                    fontWeight: 600, color: C.primary,
                                                                }}>
                                                                    {tag}
                                                                    <button
                                                                        onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                                                                        style={{
                                                                            display: 'flex', alignItems: 'center',
                                                                            background: 'none', border: 'none',
                                                                            padding: 0, cursor: 'pointer',
                                                                            color: C.primary, opacity: 0.7,
                                                                            lineHeight: 1,
                                                                        }}
                                                                    >
                                                                        <X size={9} />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* Tag input */}
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        <input
                                                            value={tagInput}
                                                            onChange={e => setTagInput(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' || e.key === ',') {
                                                                    e.preventDefault()
                                                                    const t = tagInput.trim().toLowerCase().replace(/,/g, '')
                                                                    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
                                                                    setTagInput('')
                                                                }
                                                            }}
                                                            placeholder="e.g. minimal, clean…"
                                                            style={{
                                                                flex: 1, padding: '6px 9px', borderRadius: 7,
                                                                border: `1px solid ${C.borderInput}`,
                                                                fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                                                color: C.body, backgroundColor: C.bg, outline: 'none',
                                                            }}
                                                            onFocus={e => { e.target.style.borderColor = C.primary }}
                                                            onBlur={e => {
                                                                e.target.style.borderColor = C.borderInput
                                                                const t = tagInput.trim().toLowerCase()
                                                                if (t && !tags.includes(t)) setTags(prev => [...prev, t])
                                                                setTagInput('')
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const t = tagInput.trim().toLowerCase()
                                                                if (t && !tags.includes(t)) setTags(prev => [...prev, t])
                                                                setTagInput('')
                                                            }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                width: 28, height: 28, flexShrink: 0,
                                                                border: `1px solid ${C.border}`, borderRadius: 7,
                                                                backgroundColor: 'transparent', cursor: 'pointer',
                                                                color: C.secondary,
                                                            }}
                                                            title="Add tag"
                                                        >
                                                            <Tag size={11} />
                                                        </button>
                                                    </div>
                                                    <p style={{
                                                        margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: 9, color: C.muted,
                                                    }}>
                                                        Press Enter or comma to add
                                                    </p>
                                                </div>
                                            )}
                                            {/* Sort Order — admin only */}
                                            {isAdmin && (
                                                <div style={{ marginTop: 10 }}>
                                                    <p style={{
                                                        margin: '0 0 5px', fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: 10, fontWeight: 700, color: C.muted,
                                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                                    }}>
                                                        Gallery Position
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={sortOrder}
                                                            onChange={e => setSortOrder(Math.max(0, parseInt(e.target.value) || 0))}
                                                            style={{
                                                                width: 70, padding: '6px 9px', borderRadius: 7,
                                                                border: `1px solid ${C.borderInput}`,
                                                                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                                                                color: C.body, backgroundColor: C.bg, outline: 'none',
                                                                textAlign: 'center',
                                                            }}
                                                            onFocus={e => { e.target.style.borderColor = C.primary }}
                                                            onBlur={e => { e.target.style.borderColor = C.borderInput }}
                                                        />
                                                        <p style={{
                                                            margin: 0, fontFamily: 'DM Sans, sans-serif',
                                                            fontSize: 10, color: C.muted, lineHeight: 1.4,
                                                        }}>
                                                            Lower = appears first<br />0 is top of gallery
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Featured / New badge toggles — admin only */}
                                            {isAdmin && (
                                                <div style={{ marginTop: 10 }}>
                                                    <p style={{
                                                        margin: '0 0 7px', fontFamily: 'DM Sans, sans-serif',
                                                        fontSize: 10, fontWeight: 700, color: C.muted,
                                                        textTransform: 'uppercase', letterSpacing: 0.8,
                                                    }}>
                                                        Gallery Badges
                                                    </p>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 7 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isFeatured}
                                                            onChange={e => setIsFeatured(e.target.checked)}
                                                            style={{ width: 14, height: 14, accentColor: C.primary, cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.body, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            Featured
                                                            <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 20, backgroundColor: '#fef3c7', color: '#92400e', letterSpacing: '0.04em' }}>
                                                                FEATURED
                                                            </span>
                                                        </span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isNewBadge}
                                                            onChange={e => setIsNewBadge(e.target.checked)}
                                                            style={{ width: 14, height: 14, accentColor: C.primary, cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.body, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            New badge
                                                            <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 20, backgroundColor: '#dcfce7', color: '#15803d', letterSpacing: '0.04em' }}>
                                                                NEW
                                                            </span>
                                                        </span>
                                                    </label>
                                                    <p style={{ margin: '5px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: C.muted }}>
                                                        Badges override the auto-computed POPULAR/NEW logic
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {/* Action buttons */}
                                        <div style={{ padding: '8px 8px' }}>
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
                                            {/* Preview as User — admin only */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => { setShowPreview(true); setActionMenuOpen(false) }}
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
                                                        <Eye size={13} style={{ color: C.secondary }} />
                                                    </span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>Preview as User</p>
                                                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>See exactly what users see</p>
                                                    </div>
                                                </button>
                                            )}
                                            {/* Duplicate — admin only */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => { handleDuplicate(); setActionMenuOpen(false) }}
                                                    disabled={duplicating}
                                                    style={{
                                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                                        padding: '9px 10px', border: 'none', borderRadius: 8,
                                                        backgroundColor: 'transparent', color: C.body,
                                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                                                        cursor: duplicating ? 'default' : 'pointer', textAlign: 'left', transition: 'background 0.12s',
                                                        opacity: duplicating ? 0.6 : 1,
                                                    }}
                                                    onMouseEnter={e => { if (!duplicating) e.currentTarget.style.backgroundColor = C.bg }}
                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                                >
                                                    <span style={{
                                                        width: 28, height: 28, borderRadius: 7,
                                                        backgroundColor: C.bg, border: `1px solid ${C.border}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                    }}>
                                                        {duplicating
                                                            ? <Loader2 size={13} style={{ color: C.muted, animation: 'spin 1s linear infinite' }} />
                                                            : <Copy size={13} style={{ color: C.secondary }} />}
                                                    </span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>
                                                            {duplicating ? 'Duplicating…' : 'Duplicate Template'}
                                                        </p>
                                                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>Create a copy to tweak</p>
                                                    </div>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setActionMenuOpen(false); tryGatedAction(() => handleOpenInCodeEditor()) }}
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
                                            {!isAdmin && (
                                                <button
                                                    onClick={() => { setActionMenuOpen(false); tryGatedAction(() => exportFnRef.current?.()) }}
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
                                                        <Download size={13} style={{ color: C.secondary }} />
                                                    </span>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>Export HTML</p>
                                                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>Download ready-to-use eBay HTML</p>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                        {/* Publish / Unpublish */}
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
                                                        {published
                                                            ? 'Published!'
                                                            : isAdmin ? 'Publish to Gallery' : 'Publish Template'}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: 10, color: C.muted }}>
                                                        {isAdmin
                                                            ? 'Adds to system gallery for all users'
                                                            : 'Make visible to all users'}
                                                    </p>
                                                </div>
                                            </button>
                                            {/* Unpublish — admin only, shown when template is currently live */}
                                            {isAdmin && isLive && !published && (
                                                <button
                                                    onClick={() => { handleUnpublish(); setActionMenuOpen(false) }}
                                                    style={{
                                                        marginTop: 4,
                                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                                        padding: '9px 10px', border: 'none', borderRadius: 8,
                                                        backgroundColor: 'transparent',
                                                        color: C.danger,
                                                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                                                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                                >
                                                    <span style={{
                                                        width: 28, height: 28, borderRadius: 7,
                                                        backgroundColor: '#fee2e2', border: '1px solid #fecaca',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                    }}>
                                                        <EyeOff size={13} style={{ color: C.danger }} />
                                                    </span>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: 12 }}>Unpublish</p>
                                                        <p style={{ margin: 0, fontSize: 10, color: C.muted }}>
                                                            Remove from gallery (keep as draft)
                                                        </p>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    placeholders={PLACEHOLDER_GROUPS}
                    // Seed the canvas with the saved template's DB category so
                    // its previews use category-matched sample data.
                    // Maps new category IDs → VisualEditor's internal category keys.
                    // Falls back to 'general' (not 'pet') so blank templates don't
                    // show pet-supply sample content to non-pet sellers.
                    initialCategory={(() => {
                        // Map new DB category IDs → VisualEditor's CategoryId type.
                        // 'toys' is NOT a CategoryId — toys_hobbies falls back to 'general'.
                        const catMap: Record<string, import('@/components/ui/VisualEditor/sampleData').CategoryId> = {
                            consumer_electronics: 'electronics', computers: 'electronics',
                            clothing: 'fashion', jewelry: 'fashion', health_beauty: 'fashion',
                            home_garden: 'home', furniture: 'home',
                            toys_hobbies: 'general', sporting_goods: 'sports',
                            pet_supplies: 'pet', motors_parts: 'auto',
                            collectibles: 'general', books_movies: 'general',
                            business: 'general', general: 'general',
                            // legacy slugs
                            electronics: 'electronics', fashion: 'fashion',
                            home: 'home', sports: 'sports', auto: 'auto', pet: 'pet',
                        }
                        return catMap[category] ?? 'general'
                    })()}
                    templateCategory={category}
                    slots={slots}
                    onSlotsChange={setSlots}
                    isAdmin={isAdmin}
                />
            </div>

            {/* Spin keyframe */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>

            {/* Version History panel */}
            {showVersionHistory && (
                <VersionHistoryPanel
                    templateId={savedId}
                    onRestore={(restoredHtml) => {
                        setHtml(restoredHtml)
                        dirtyRef.current = true
                        setShowVersionHistory(false)
                    }}
                    onClose={() => setShowVersionHistory(false)}
                />
            )}

            {/* Preview as User modal — renders template exactly as gallery users see it */}
            {isAdmin && showPreview && (
                <TemplatePreviewModal
                    template={{
                        id: savedId || 'preview',
                        user_id: null,
                        name,
                        description,
                        category,
                        description_html: html,
                        is_system: true,
                        is_shared: true,
                        thumbnail_url: thumbnailUrl,
                        use_count: useCount,
                        created_at: null,
                        updated_at: null,
                        tags,
                        sort_order: sortOrder,
                        is_featured: isFeatured,
                        is_new_badge: isNewBadge,
                    } as any}
                    templates={[]}
                    onClose={() => setShowPreview(false)}
                    onEdit={() => setShowPreview(false)}
                    onCopy={async (t: any) => {
                        try {
                            await navigator.clipboard.writeText(t.description_html || html)
                            setPreviewCopied(true)
                            setTimeout(() => setPreviewCopied(false), 2000)
                        } catch { /* clipboard blocked */ }
                    }}
                    copiedId={previewCopied ? (savedId || 'preview') : null}
                />
            )}
            {/* ── Pro Export Gate Popup (Canva-style) ── */}
            {showProExportGate && (
                <div
                    ref={proGateRef}
                    style={{
                        position: 'fixed', top: 56, right: 16,
                        width: 272,
                        backgroundColor: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 14,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        zIndex: 3000,
                        overflow: 'hidden',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    {/* Gold crown header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        padding: '10px 14px',
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <svg width={16} height={13} viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                                fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="8" cy="1.5" r="1.2" fill="#fff" opacity="0.9" />
                            <circle cx="0.5" cy="5.5" r="1" fill="#fff" opacity="0.9" />
                            <circle cx="15.5" cy="5.5" r="1" fill="#fff" opacity="0.9" />
                        </svg>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.3 }}>
                            Template uses Pro styles
                        </p>
                        <button
                            onClick={() => setShowProExportGate(false)}
                            style={{
                                marginLeft: 'auto', background: 'none', border: 'none',
                                cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                                display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0,
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '12px 14px 14px' }}>
                        <p style={{ margin: '0 0 10px', fontSize: 11, color: C.secondary, lineHeight: 1.5 }}>
                            Upgrade to export or open in Code Editor without&nbsp;restrictions.
                        </p>

                        {/* Pro block list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                            {(proGateShowAll ? proGateBlocks : proGateBlocks.slice(0, 2)).map(b => (
                                <div key={b.blockId} style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '5px 7px', backgroundColor: C.bg,
                                    borderRadius: 8, border: `1px solid ${C.border}`,
                                }}>
                                    {/* Mini SVG thumbnail */}
                                    <div style={{
                                        width: 60, height: 30, flexShrink: 0,
                                        borderRadius: 4, overflow: 'hidden',
                                        border: `1px solid ${C.border}`, backgroundColor: C.surface,
                                    }}>
                                        <VariantThumbnail variantId={b.variantId} isSelected={false} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={{
                                            margin: 0, fontSize: 11, fontWeight: 600,
                                            color: C.body, whiteSpace: 'nowrap',
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {b.variantLabel}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 9.5, color: C.muted }}>
                                            {b.blockType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                    </div>
                                    {/* Mini Pro badge */}
                                    <span style={{
                                        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 2,
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: '#fff', fontSize: 8, fontWeight: 700,
                                        padding: '2px 5px', borderRadius: 4, lineHeight: 1,
                                        letterSpacing: '0.04em',
                                    }}>
                                        <svg width={7} height={6} viewBox="0 0 16 14" fill="none">
                                            <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                                                fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                                        </svg>
                                        Pro
                                    </span>
                                </div>
                            ))}

                            {/* "See N more" link */}
                            {!proGateShowAll && proGateBlocks.length > 2 && (
                                <button
                                    onClick={() => setProGateShowAll(true)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 11, fontWeight: 600, color: C.primary,
                                        padding: '3px 2px', textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}
                                >
                                    + {proGateBlocks.length - 2} more&nbsp;→
                                </button>
                            )}
                        </div>

                        {/* Upgrade CTA — gold crown badge style */}
                        <button
                            onClick={() => { setShowProExportGate(false); setShowUpgradeModal(true) }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 7,
                                padding: '10px 0',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                border: 'none', borderRadius: 8,
                                cursor: 'pointer',
                                color: '#fff', fontFamily: 'DM Sans, sans-serif',
                                fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
                                boxShadow: '0 2px 10px rgba(217,119,6,0.4)',
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >
                            <svg width={13} height={11} viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
                                <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                                    fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                                <circle cx="8" cy="1.5" r="1.2" fill="#fff" opacity="0.9" />
                                <circle cx="0.5" cy="5.5" r="1" fill="#fff" opacity="0.9" />
                                <circle cx="15.5" cy="5.5" r="1" fill="#fff" opacity="0.9" />
                            </svg>
                            Upgrade to Pro — $9/mo
                        </button>

                        {/* Maybe later */}
                        <button
                            onClick={() => setShowProExportGate(false)}
                            style={{
                                width: '100%', marginTop: 7,
                                background: 'none', border: 'none',
                                fontSize: 11, color: C.muted, cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', padding: '3px 0',
                                transition: 'color 0.12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = C.secondary }}
                            onMouseLeave={e => { e.currentTarget.style.color = C.muted }}
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            )}

            {/* ── Pro Upgrade Modal ── */}
            {showUpgradeModal && (
                <div
                    onClick={() => setShowUpgradeModal(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 24,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 16,
                            padding: '32px 28px',
                            maxWidth: 420,
                            width: '100%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                            fontFamily: 'DM Sans, sans-serif',
                            textAlign: 'center',
                        }}
                    >
                        {/* Crown icon */}
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 4px 16px rgba(217,119,6,0.35)',
                        }}>
                            <svg width={26} height={22} viewBox="0 0 16 14" fill="none">
                                <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z" fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                                <circle cx="8" cy="1.5" r="1.2" fill="#fff" opacity="0.9" />
                                <circle cx="0.5" cy="5.5" r="1" fill="#fff" opacity="0.9" />
                                <circle cx="15.5" cy="5.5" r="1" fill="#fff" opacity="0.9" />
                            </svg>
                        </div>

                        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#1e1535' }}>
                            Upgrade to Design Studio Pro
                        </h2>
                        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                            Your template uses <strong>Pro divider styles</strong>. Upgrade to publish and share it with buyers.
                        </p>

                        {/* Benefit list */}
                        <div style={{ textAlign: 'left', marginBottom: 24 }}>
                            {[
                                'Unlock all 15 Pro divider styles',
                                'Publish templates with Pro styling',
                                'Priority support',
                            ].map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: 13, color: '#374151' }}>{item}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setShowUpgradeModal(false)
                                // TODO: route to Stripe checkout for Design Studio Pro
                                // router.push('/dashboard/upgrade?plan=design-studio-pro')
                            }}
                            style={{
                                width: '100%', padding: '12px 0',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: '#fff', fontSize: 15, fontWeight: 700,
                                border: 'none', borderRadius: 10, cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
                                marginBottom: 10,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            Upgrade to Pro — $9/month
                        </button>
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            style={{
                                width: '100%', padding: '10px 0',
                                backgroundColor: 'transparent', color: '#94a3b8',
                                fontSize: 13, fontWeight: 500, border: 'none',
                                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            Continue editing (publish disabled)
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
