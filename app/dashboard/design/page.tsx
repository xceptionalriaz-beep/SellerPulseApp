'use client'
// app/dashboard/design/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Design Studio · Listing Template Gallery
//
//   ✓ Browse pre-made system templates (is_system = true)
//   ✓ My Templates (user_id = auth.uid())
//   ✓ Category filter pills
//   ✓ Search bar
//   ✓ Sort: Popular / Newest
//   ✓ Live HTML preview thumbnails (scaled like DescriptionLibrary)
//   ✓ AI Template Generator modal
//   ✓ Custom HTML Builder modal
//   ✓ Save template to listing_templates
//   ✓ Delete own templates
//   ✓ Copy template HTML to clipboard
//   ✓ Full-screen preview modal
//   ✓ Fully mobile responsive
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createClient as createRawClient } from '@supabase/supabase-js'
import {
    Plus, Search, X, Copy, Trash2,
    Eye, Check, Loader2, Code2, Zap,
    Save, RefreshCw, LayoutTemplate,
} from 'lucide-react'
import { sanitiseHtml } from '@/components/ui/EditorToolbar'
import { AIButton, PrimaryButton, SecondaryButton, GhostButton, IconButton } from '@/components/ui/Buttons'
import ProDropdown from '@/components/ui/ProDropdown'
import type { DropdownOption } from '@/components/ui/ProDropdown'

// ── Design tokens ──────────────────────────────────────────────────────────
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
    dangerBg: '#fee2e2',
    warning: '#d97706',
    warningBg: '#fef3c7',
}

// ── Types ──────────────────────────────────────────────────────────────────
interface ListingTemplate {
    id: string
    user_id: string | null
    name: string
    description: string | null
    category: string | null
    description_html: string | null
    is_system: boolean | null
    is_shared: boolean | null
    thumbnail_url: string | null
    use_count: number | null
    created_at: string | null
    updated_at: string | null
}

// ── Category definitions ───────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'all', label: 'All Templates' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: 'Fashion & Beauty' },
    { id: 'home', label: 'Home & Garden' },
    { id: 'auto', label: 'Auto Parts' },
    { id: 'pet', label: 'Pet Supplies' },
    { id: 'sports', label: 'Sports & Outdoors' },
    { id: 'toys', label: 'Toys & Games' },
    { id: 'general', label: 'General' },
]

// ── Sort options for ProDropdown ───────────────────────────────────────────
const SORT_OPTIONS: DropdownOption[] = [
    { val: 'popular', label: 'Popular', enabled: true },
    { val: 'newest', label: 'Newest', enabled: true },
]

// ── Built-in system templates (shown when DB has none) ─────────────────────
const BUILTIN_TEMPLATES: ListingTemplate[] = [
    {
        id: 'builtin-1',
        user_id: null,
        name: 'Dark Tech Minimal',
        description: 'Bold dark theme for electronics & tech',
        category: 'electronics',
        is_system: true,
        is_shared: true,
        thumbnail_url: null,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description_html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;font-family:Arial,sans-serif;">
  <tr><td style="padding:30px 25px;text-align:center;background:linear-gradient(135deg,#1e1535 0%,#2d1f4e 100%);">
    <p style="margin:0 0 8px 0;font-size:11px;font-weight:800;letter-spacing:3px;color:#b8fa33;text-transform:uppercase;">Premium Tech</p>
    <h1 style="margin:0 0 10px 0;font-size:26px;font-weight:800;color:#ffffff;">[PRODUCT_NAME]</h1>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);">Tested &bull; Verified &bull; Fast Dispatch</p>
  </td></tr>
  <tr><td style="padding:25px;background:#ffffff;">
    <h2 style="margin:0 0 14px 0;font-size:16px;font-weight:700;color:#1e1535;border-left:4px solid #7530fb;padding-left:12px;">Key Features</h2>
    <ul style="margin:0 0 20px 0;padding:0 0 0 18px;color:#1f1d2e;font-size:13px;line-height:2;">
      <li>[FEATURE_1]</li><li>[FEATURE_2]</li><li>[FEATURE_3]</li>
    </ul>
    <p style="margin:0 0 20px 0;font-size:13px;color:#6b7280;line-height:1.7;">[DESCRIPTION]</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7ff;border-radius:10px;border:1px solid #ede9fe;">
      <tr>
        <td style="padding:14px;text-align:center;border-right:1px solid #ede9fe;width:33%;">
          <p style="margin:0 0 4px 0;font-size:18px;font-weight:800;color:#7530fb;">[PRICE]</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;text-transform:uppercase;">Price</p>
        </td>
        <td style="padding:14px;text-align:center;border-right:1px solid #ede9fe;width:33%;">
          <p style="margin:0 0 4px 0;font-size:18px;">✅</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;text-transform:uppercase;">Fully Tested</p>
        </td>
        <td style="padding:14px;text-align:center;width:33%;">
          <p style="margin:0 0 4px 0;font-size:18px;">🚀</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;text-transform:uppercase;">Fast Dispatch</p>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 25px;background:#1e1535;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">Powered by Riazify &bull; 100% Positive Feedback Guaranteed</p>
  </td></tr>
</table>`,
    },
    {
        id: 'builtin-2',
        user_id: null,
        name: 'Clean White Pro',
        description: 'Bright minimal design for any category',
        category: 'general',
        is_system: true,
        is_shared: true,
        thumbnail_url: null,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description_html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;font-family:Arial,sans-serif;border:1px solid #ede9fe;border-radius:12px;overflow:hidden;">
  <tr><td style="padding:28px 24px;background:linear-gradient(135deg,#7530fb 0%,#9d5cf7 100%);text-align:center;">
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:800;color:#ffffff;">[PRODUCT_NAME]</h1>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);">Quality &bull; Value &bull; Service</p>
  </td></tr>
  <tr><td style="padding:24px;">
    <p style="margin:0 0 16px 0;font-size:14px;color:#1f1d2e;line-height:1.8;">[DESCRIPTION]</p>
    <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
      <tr style="background:#f8f7ff;">
        <td style="font-size:12px;font-weight:700;color:#7530fb;border:1px solid #ede9fe;">✓ [FEATURE_1]</td>
        <td style="font-size:12px;font-weight:700;color:#7530fb;border:1px solid #ede9fe;">✓ [FEATURE_2]</td>
      </tr>
      <tr>
        <td style="font-size:12px;font-weight:700;color:#7530fb;border:1px solid #ede9fe;">✓ [FEATURE_3]</td>
        <td style="font-size:12px;font-weight:700;color:#7530fb;border:1px solid #ede9fe;">✓ Fast UK Dispatch</td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#b8fa33;border-radius:8px;">
      <tr><td style="padding:14px 20px;text-align:center;">
        <p style="margin:0;font-size:15px;font-weight:800;color:#1e1535;">Price: [PRICE] &bull; Free Returns &bull; 30-Day Guarantee</p>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        id: 'builtin-3',
        user_id: null,
        name: 'Modern Jewellery',
        description: 'Elegant layout for fashion & accessories',
        category: 'fashion',
        is_system: true,
        is_shared: true,
        thumbnail_url: null,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description_html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,serif;background:#fff9f9;">
  <tr><td style="padding:32px 24px;text-align:center;background:linear-gradient(to bottom,#fff9f9,#ffffff);">
    <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:4px;color:#b8fa33;text-transform:uppercase;font-family:Arial,sans-serif;">Exclusive Collection</p>
    <h1 style="margin:0 0 10px 0;font-size:28px;font-weight:400;color:#1e1535;letter-spacing:1px;">[PRODUCT_NAME]</h1>
    <p style="margin:0 auto;max-width:400px;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;line-height:1.7;">[DESCRIPTION]</p>
  </td></tr>
  <tr><td style="padding:0 24px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:16px;background:#ffffff;border:1px solid #ede9fe;border-radius:10px;text-align:center;width:30%;">
          <p style="margin:0 0 4px 0;font-size:20px;">💎</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">[FEATURE_1]</p>
        </td>
        <td width="12">&nbsp;</td>
        <td style="padding:16px;background:#ffffff;border:1px solid #ede9fe;border-radius:10px;text-align:center;width:30%;">
          <p style="margin:0 0 4px 0;font-size:20px;">✨</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">[FEATURE_2]</p>
        </td>
        <td width="12">&nbsp;</td>
        <td style="padding:16px;background:#ffffff;border:1px solid #ede9fe;border-radius:10px;text-align:center;width:30%;">
          <p style="margin:0 0 4px 0;font-size:20px;">🎁</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">[FEATURE_3]</p>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 24px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:10px;">
      <tr><td style="padding:16px;text-align:center;">
        <p style="margin:0;font-size:16px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">[PRICE] &mdash; Free Gift Wrapping Available</p>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        id: 'builtin-4',
        user_id: null,
        name: 'Auto Parts Standard',
        description: 'Industrial look for auto & vehicle parts',
        category: 'auto',
        is_system: true,
        is_shared: true,
        thumbnail_url: null,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description_html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;background:#ffffff;">
  <tr><td style="background:#1e1535;padding:20px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td><h1 style="margin:0;font-size:20px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">[PRODUCT_NAME]</h1>
        <p style="margin:4px 0 0;font-size:12px;color:#b8fa33;font-weight:700;">OEM Quality &bull; Fast Dispatch &bull; UK Seller</p></td>
        <td style="text-align:right;"><p style="margin:0;font-size:22px;font-weight:900;color:#b8fa33;">[PRICE]</p></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    <table width="100%" cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:18px;font-size:13px;">
      <tr style="background:#f8f7ff;">
        <td style="font-weight:700;color:#1e1535;border:1px solid #ede9fe;width:40%;">Compatibility</td>
        <td style="color:#6b7280;border:1px solid #ede9fe;">[FEATURE_1]</td>
      </tr>
      <tr>
        <td style="font-weight:700;color:#1e1535;border:1px solid #ede9fe;">Condition</td>
        <td style="color:#6b7280;border:1px solid #ede9fe;">[FEATURE_2]</td>
      </tr>
      <tr style="background:#f8f7ff;">
        <td style="font-weight:700;color:#1e1535;border:1px solid #ede9fe;">Part Number</td>
        <td style="color:#6b7280;border:1px solid #ede9fe;">[FEATURE_3]</td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0;font-size:13px;color:#6b7280;line-height:1.7;">[DESCRIPTION]</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#dcfce7;border-radius:8px;border:1px solid #86efac50;">
      <tr><td style="padding:12px 16px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#166534;">✓ All parts tested &bull; ✓ Secure packaging &bull; ✓ 30-day returns</p>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        id: 'builtin-5',
        user_id: null,
        name: 'Pro Pet Grooming',
        description: 'Friendly & colourful for pet products',
        category: 'pet',
        is_system: true,
        is_shared: true,
        thumbnail_url: null,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description_html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;background:#ffffff;">
  <tr><td style="background:linear-gradient(135deg,#7530fb,#b8fa33);padding:28px 24px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:24px;">🐾</p>
    <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#ffffff;">[PRODUCT_NAME]</h1>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.9);">Your Pet Deserves the Best!</p>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 16px 0;font-size:13px;color:#1f1d2e;line-height:1.8;">[DESCRIPTION]</p>
    <ul style="margin:0 0 20px 0;padding:0 0 0 0;list-style:none;">
      <li style="padding:8px 12px;margin-bottom:8px;background:#f8f7ff;border-left:3px solid #7530fb;border-radius:4px;font-size:13px;color:#1e1535;">🐶 [FEATURE_1]</li>
      <li style="padding:8px 12px;margin-bottom:8px;background:#f8f7ff;border-left:3px solid #7530fb;border-radius:4px;font-size:13px;color:#1e1535;">🐱 [FEATURE_2]</li>
      <li style="padding:8px 12px;margin-bottom:8px;background:#f8f7ff;border-left:3px solid #7530fb;border-radius:4px;font-size:13px;color:#1e1535;">⭐ [FEATURE_3]</li>
    </ul>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:10px;">
      <tr><td style="padding:16px 20px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:18px;font-weight:800;color:#b8fa33;">[PRICE]</p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.6);">Free UK Shipping &bull; 30-Day Returns &bull; Pet-Safe Guarantee</p>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        id: 'builtin-6',
        user_id: null,
        name: 'Sports & Fitness',
        description: 'High-energy design for sports gear',
        category: 'sports',
        is_system: true,
        is_shared: true,
        thumbnail_url: null,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description_html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;background:#ffffff;">
  <tr><td style="padding:24px;background:#1e1535;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td><p style="margin:0 0 4px 0;font-size:10px;letter-spacing:3px;color:#b8fa33;text-transform:uppercase;font-weight:800;">Performance Gear</p>
        <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;">[PRODUCT_NAME]</h1></td>
        <td style="text-align:right;"><p style="margin:0;font-size:26px;font-weight:900;color:#b8fa33;">[PRICE]</p></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 16px 0;font-size:13px;color:#6b7280;line-height:1.7;">[DESCRIPTION]</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:12px;background:#f8f7ff;border:1px solid #ede9fe;border-radius:8px;text-align:center;width:30%;">
          <p style="margin:0 0 2px 0;font-size:18px;">💪</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#7530fb;">[FEATURE_1]</p>
        </td>
        <td width="10"></td>
        <td style="padding:12px;background:#f8f7ff;border:1px solid #ede9fe;border-radius:8px;text-align:center;width:30%;">
          <p style="margin:0 0 2px 0;font-size:18px;">🏃</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#7530fb;">[FEATURE_2]</p>
        </td>
        <td width="10"></td>
        <td style="padding:12px;background:#f8f7ff;border:1px solid #ede9fe;border-radius:8px;text-align:center;width:30%;">
          <p style="margin:0 0 2px 0;font-size:18px;">🏆</p>
          <p style="margin:0;font-size:11px;font-weight:700;color:#7530fb;">[FEATURE_3]</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:8px;">
      <tr><td style="padding:12px;text-align:center;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;">🚚 Free Next Day Delivery &bull; ✓ 30-Day Returns &bull; ⭐ Top Rated Seller</p>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
]

// ── Tiny HTML thumbnail preview ────────────────────────────────────────────
function TemplateThumbnail({ html }: { html: string }) {
    return (
        <div style={{ width: '100%', height: 160, overflow: 'hidden', backgroundColor: '#ffffff', position: 'relative' }}>
            <div style={{
                transform: 'scale(0.38)',
                transformOrigin: 'top left',
                width: '263%',
                pointerEvents: 'none',
                fontFamily: 'Arial, sans-serif',
                fontSize: 14,
                lineHeight: 1.4,
                color: '#1f1d2e',
            }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}

// ── Category badge colours ─────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string | null }) {
    const map: Record<string, { bg: string; text: string }> = {
        electronics: { bg: '#dbeafe', text: '#1d4ed8' },
        fashion: { bg: '#fce7f3', text: '#be185d' },
        home: { bg: '#dcfce7', text: '#15803d' },
        auto: { bg: '#fef3c7', text: '#b45309' },
        pet: { bg: '#f3e8ff', text: '#7e22ce' },
        sports: { bg: '#e0f2fe', text: '#0369a1' },
        toys: { bg: '#fef9c3', text: '#a16207' },
        general: { bg: '#f1f5f9', text: '#475569' },
    }
    const cat = (category || 'general').toLowerCase()
    const style = map[cat] || map.general
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, backgroundColor: style.bg, color: style.text,
            fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize',
        }}>
            {cat}
        </span>
    )
}

// ── Main Page ──────────────────────────────────────────────────────────────
// Untyped client — listing_templates is not yet in the Database type
const rawDb = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DesignStudioPage() {
    return (
        <Suspense fallback={null}>
            <DesignStudioInner />
        </Suspense>
    )
}

function DesignStudioInner() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const activeTab = (searchParams.get('tab') || 'templates') as 'templates' | 'library' | 'my-templates' | 'settings'

    // ── State ──────────────────────────────────────────────────────────────
    const [templates, setTemplates] = useState<ListingTemplate[]>([])
    const [myTemplates, setMyTemplates] = useState<ListingTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('all')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<'popular' | 'newest'>('popular')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Preview modal
    const [previewTemplate, setPreviewTemplate] = useState<ListingTemplate | null>(null)

    // AI Generator modal
    const [showAiModal, setShowAiModal] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiHtml, setAiHtml] = useState('')
    const [aiError, setAiError] = useState('')
    const [aiTemplateName, setAiTemplateName] = useState('')
    const [aiCategory, setAiCategory] = useState('general')
    const [aiSaving, setAiSaving] = useState(false)
    const [aiSaved, setAiSaved] = useState(false)

    // Custom HTML Builder modal
    const [showBuilderModal, setShowBuilderModal] = useState(false)
    const [builderHtml, setBuilderHtml] = useState('')
    const [builderName, setBuilderName] = useState('')
    const [builderCategory, setBuilderCategory] = useState('general')
    const [builderSaving, setBuilderSaving] = useState(false)
    const [builderSaved, setBuilderSaved] = useState(false)
    const [builderPreview, setBuilderPreview] = useState(false)

    const aiPromptRef = useRef<HTMLTextAreaElement>(null)

    // ── Load templates ─────────────────────────────────────────────────────
    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // System templates
            const { data: sys } = await rawDb
                .from('listing_templates')
                .select('id, user_id, name, description, category, description_html, is_system, is_shared, thumbnail_url, use_count, created_at, updated_at')
                .eq('is_system', true)
                .order('use_count', { ascending: false })

            // User's own templates
            let own: ListingTemplate[] = []
            if (user) {
                const { data: ownData } = await rawDb
                    .from('listing_templates')
                    .select('id, user_id, name, description, category, description_html, is_system, is_shared, thumbnail_url, use_count, created_at, updated_at')
                    .eq('user_id', user.id)
                    .eq('is_system', false)
                    .order('created_at', { ascending: false })
                own = (ownData as ListingTemplate[]) || []
            }

            const sysTemplates = (sys as ListingTemplate[]) || []
            // Merge DB system templates with builtins (builtins shown if DB has none)
            const allSystem = sysTemplates.length > 0 ? sysTemplates : BUILTIN_TEMPLATES
            setTemplates(allSystem)
            setMyTemplates(own)
        } catch (err) {
            console.error('[design] load error:', err)
            setTemplates(BUILTIN_TEMPLATES)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => { loadTemplates() }, [loadTemplates])

    // ── Filter + search ────────────────────────────────────────────────────
    const allVisible = [...templates, ...myTemplates]
    const filtered = allVisible.filter(t => {
        const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })
    const sorted = [...filtered].sort((a, b) => {
        if (sort === 'popular') return (b.use_count || 0) - (a.use_count || 0)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

    // ── Copy HTML ──────────────────────────────────────────────────────────
    async function copyHtml(t: ListingTemplate) {
        if (!t.description_html) return
        await navigator.clipboard.writeText(t.description_html)
        setCopiedId(t.id)
        setTimeout(() => setCopiedId(null), 2000)
        // bump use_count if it's a real DB template
        if (!t.id.startsWith('builtin-')) {
            await rawDb.from('listing_templates')
                .update({ use_count: (t.use_count || 0) + 1 })
                .eq('id', t.id)
        }
    }

    // ── Delete own template ────────────────────────────────────────────────
    async function deleteTemplate(id: string) {
        if (id.startsWith('builtin-')) return
        setDeletingId(id)
        await rawDb.from('listing_templates').delete().eq('id', id)
        setMyTemplates((prev: ListingTemplate[]) => prev.filter((t: ListingTemplate) => t.id !== id))
        setDeletingId(null)
    }

    // ── AI Generate ────────────────────────────────────────────────────────
    async function generateAiTemplate() {
        if (!aiPrompt.trim()) return
        setAiLoading(true)
        setAiError('')
        setAiHtml('')
        setAiSaved(false)
        try {
            const res = await fetch('/api/ai/design-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'AI generation failed')
            setAiHtml(sanitiseHtml(data.html || ''))
            setAiTemplateName(`AI Template — ${aiPrompt.slice(0, 40)}`)
        } catch (err: unknown) {
            setAiError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setAiLoading(false)
        }
    }

    // ── Save AI template ───────────────────────────────────────────────────
    async function saveAiTemplate() {
        if (!aiHtml || !aiTemplateName) return
        setAiSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')
            const { data, error } = await rawDb.from('listing_templates').insert({
                user_id: user.id,
                name: aiTemplateName,
                description: `AI generated: ${aiPrompt.slice(0, 100)}`,
                category: aiCategory,
                description_html: aiHtml,
                is_system: false,
                is_shared: false,
                use_count: 0,
            }).select().single()
            if (error) throw error
            setMyTemplates((prev: ListingTemplate[]) => [data as ListingTemplate, ...prev])
            setAiSaved(true)
        } catch (err) {
            console.error('[design] save AI template:', err)
        } finally {
            setAiSaving(false)
        }
    }

    // ── Save custom HTML template ──────────────────────────────────────────
    async function saveBuilderTemplate() {
        if (!builderHtml || !builderName) return
        setBuilderSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')
            const { data, error } = await rawDb.from('listing_templates').insert({
                user_id: user.id,
                name: builderName,
                description: 'Custom HTML template',
                category: builderCategory,
                description_html: sanitiseHtml(builderHtml),
                is_system: false,
                is_shared: false,
                use_count: 0,
            }).select().single()
            if (error) throw error
            setMyTemplates((prev: ListingTemplate[]) => [data as ListingTemplate, ...prev])
            setBuilderSaved(true)
            setTimeout(() => { setShowBuilderModal(false); setBuilderSaved(false); setBuilderHtml(''); setBuilderName('') }, 1200)
        } catch (err) {
            console.error('[design] save builder template:', err)
        } finally {
            setBuilderSaving(false)
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-full" style={{ backgroundColor: C.bg }}>

            {/* Templates Gallery */}

            {/* Header */}
            <div className="px-4 md:px-8 pt-6 pb-4" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[12px]" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Design Studio</span>
                    <span className="text-[12px]" style={{ color: C.muted }}>/</span>
                    <span className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        {activeTab === 'my-templates' ? 'My Templates' : activeTab === 'library' ? 'Block Library' : activeTab === 'settings' ? 'Studio Settings' : 'Listing Templates'}
                    </span>
                </div>

                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] md:text-[26px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            {activeTab === 'my-templates' ? 'My Templates' : 'Listing Template Gallery'}
                        </h1>
                        <p className="text-[13px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                            {activeTab === 'my-templates' ? 'Your saved custom templates — edit, copy or delete anytime.' : <span>Select a <span style={{ color: C.primary, fontWeight: 600 }}>high-converting</span>, mobile-responsive eBay template or start from scratch.</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <AIButton onClick={() => setShowAiModal(true)}>AI Generate</AIButton>
                        <PrimaryButton onClick={() => setShowBuilderModal(true)} icon={<Plus size={13} />}>New Template</PrimaryButton>
                    </div>
                </div>

                {/* Quick-action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                    {/* Custom HTML Builder card */}
                    <div className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                        onClick={() => setShowBuilderModal(true)}>
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                            style={{ backgroundColor: C.primaryLight }}>
                            <Code2 size={16} style={{ color: C.primary }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[14px] font-bold mb-0.5" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Custom HTML Builder</p>
                            <p className="text-[12px] leading-relaxed" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                Create, paste, or edit custom HTML/CSS code directly with live active content checks.
                            </p>
                            <button className="mt-2 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{ border: `1px solid ${C.primary}`, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                + Create Blank
                            </button>
                        </div>
                    </div>

                    {/* AI Template Converter card */}
                    <div className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                            style={{ backgroundColor: '#f3e8ff' }}>
                            <Zap size={16} style={{ color: '#7e22ce' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold mb-0.5" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>AI Template Generator</p>
                            <p className="text-[12px] leading-relaxed mb-2" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                Describe what you need. AI generates a full HTML template instantly.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    placeholder="e.g. Professional template for vintage electronics..."
                                    className="flex-1 text-[12px] px-3 py-1.5 rounded-lg outline-none transition-all"
                                    style={{
                                        border: `1px solid ${C.borderInput}`, backgroundColor: C.surface,
                                        color: C.body, fontFamily: 'DM Sans, sans-serif',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            setAiPrompt(e.currentTarget.value)
                                            setShowAiModal(true)
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setShowAiModal(true)}
                                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold shrink-0 transition-all hover:opacity-90"
                                    style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters bar */}
            <div className="px-4 md:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                {/* Category pills — scrollable on mobile */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-1" style={{ scrollbarWidth: 'none' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all"
                            style={{
                                backgroundColor: activeCategory === cat.id ? C.primary : C.bg,
                                color: activeCategory === cat.id ? '#fff' : C.secondary,
                                border: `1px solid ${activeCategory === cat.id ? C.primary : C.border}`,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                            {cat.label} {activeCategory === cat.id && cat.id !== 'all' && (
                                <span style={{ marginLeft: 4, opacity: 0.7 }}>
                                    ({sorted.length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search + Sort */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface }}>
                        <Search size={13} style={{ color: C.muted }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search templates..."
                            className="text-[12px] outline-none bg-transparent w-36"
                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                        />
                    </div>

                    {/* Sort dropdown */}
                    <ProDropdown
                        prefix="Sort:"
                        currentValue={sort}
                        options={SORT_OPTIONS}
                        onChanged={(v) => setSort(v as 'popular' | 'newest')}
                        width={140}
                    />
                </div>
            </div>

            {/* Template Grid */}
            <div className="flex-1 p-4 md:p-8">

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 size={24} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                        <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Loading templates...</p>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
                            <LayoutTemplate size={24} style={{ color: C.primary }} />
                        </div>
                        <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>No templates found</p>
                        <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {search ? `No results for "${search}"` : 'Try a different category or create your own'}
                        </p>
                        <AIButton onClick={() => setShowAiModal(true)}>Generate with AI</AIButton>
                    </div>
                ) : (
                    <>
                        {/* My Templates section */}
                        {myTemplates.filter(t => {
                            const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                            const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                            return matchCat && matchSearch
                        }).length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2"
                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        <span style={{ color: C.primary }}>My Templates</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                                            {myTemplates.length}
                                        </span>
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {myTemplates.filter(t => {
                                            const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                                            const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                                            return matchCat && matchSearch
                                        }).map(t => (
                                            <TemplateCard
                                                key={t.id}
                                                template={t}
                                                isOwn
                                                copiedId={copiedId}
                                                deletingId={deletingId}
                                                onPreview={() => setPreviewTemplate(t)}
                                                onCopy={() => copyHtml(t)}
                                                onDelete={() => deleteTemplate(t.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* All / System templates */}
                        {activeTab !== 'my-templates' && (
                            <div>
                                <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                    <span style={{ color: C.dark }}>
                                        {activeCategory === 'all' ? 'All Templates' : CATEGORIES.find(c => c.id === activeCategory)?.label}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{ backgroundColor: C.bg, color: C.muted }}>
                                        {templates.filter(t => {
                                            const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                                            const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                                            return matchCat && matchSearch
                                        }).length}
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {templates.filter(t => {
                                        const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                                        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                                        return matchCat && matchSearch
                                    }).map(t => (
                                        <TemplateCard
                                            key={t.id}
                                            template={t}
                                            isOwn={false}
                                            copiedId={copiedId}
                                            deletingId={deletingId}
                                            onPreview={() => setPreviewTemplate(t)}
                                            onCopy={() => copyHtml(t)}
                                            onDelete={() => deleteTemplate(t.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )} {/* end activeTab !== my-templates */}

                    </>
                )}
            </div>

            {/* Full-screen Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setPreviewTemplate(null)}>
                    <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ backgroundColor: C.surface }}
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div>
                                <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>{previewTemplate.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <CategoryBadge category={previewTemplate.category} />
                                    {previewTemplate.is_system && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: C.primaryLight, color: C.primary }}>System</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => copyHtml(previewTemplate)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                                    style={{ backgroundColor: copiedId === previewTemplate.id ? C.successBg : C.primaryLight, color: copiedId === previewTemplate.id ? C.success : C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {copiedId === previewTemplate.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy HTML</>}
                                </button>
                                <button onClick={() => setPreviewTemplate(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70 transition-all"
                                    style={{ backgroundColor: C.bg }}>
                                    <X size={14} style={{ color: C.muted }} />
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: '#f0f0f0' }}>
                            <div className="max-w-[600px] mx-auto rounded-xl overflow-hidden shadow-lg">
                                <div
                                    style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, lineHeight: 1.5 }}
                                    dangerouslySetInnerHTML={{ __html: previewTemplate.description_html || '' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generator Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={() => { if (!aiLoading) setShowAiModal(false) }}>
                    <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ backgroundColor: C.surface }}
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            <div className="flex items-center gap-2">
                                <Zap size={16} style={{ color: '#fff' }} />
                                <p className="text-[15px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>AI Template Generator</p>
                            </div>
                            <button onClick={() => { if (!aiLoading) setShowAiModal(false) }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                <X size={14} style={{ color: '#fff' }} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

                            {/* Prompt */}
                            <div>
                                <label className="text-[12px] font-semibold block mb-1.5"
                                    style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                    Describe the template you want
                                </label>
                                <textarea
                                    ref={aiPromptRef}
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    placeholder="e.g. Create a professional dark-themed template for selling vintage electronics with a specs table and trust badges..."
                                    rows={3}
                                    className="w-full text-[13px] p-3 rounded-xl outline-none resize-none transition-all"
                                    style={{
                                        border: `1px solid ${C.borderInput}`, backgroundColor: C.bg,
                                        color: C.body, fontFamily: 'DM Sans, sans-serif',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                                />
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {['Electronics', 'Fashion', 'Pet Supplies', 'Home & Garden', 'Auto Parts', 'Sports'].map(s => (
                                        <button key={s} onClick={() => setAiPrompt(`Create a professional eBay listing template for ${s}`)}
                                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all hover:opacity-80"
                                            style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate button */}
                            <div className="w-full flex">
                                <AIButton
                                    onClick={generateAiTemplate}
                                    disabled={!aiPrompt.trim()}
                                    loading={aiLoading}
                                    className="w-full justify-center"
                                >
                                    {aiLoading ? 'Generating...' : 'Generate Template'}
                                </AIButton>
                            </div>

                            {/* Error */}
                            {aiError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]" style={{ backgroundColor: C.dangerBg, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                    <X size={13} /><span>{aiError}</span>
                                </div>
                            )}

                            {/* Result */}
                            {aiHtml && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[13px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                            Generated Template
                                        </p>
                                        <SecondaryButton onClick={generateAiTemplate} icon={<RefreshCw size={11} />}>
                                            Regenerate
                                        </SecondaryButton>
                                    </div>

                                    {/* Preview */}
                                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}`, backgroundColor: '#f0f0f0', padding: 12 }}>
                                        <div className="rounded-xl overflow-hidden max-w-[560px] mx-auto"
                                            style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}
                                            dangerouslySetInnerHTML={{ __html: aiHtml }} />
                                    </div>

                                    {/* Save form */}
                                    <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                        <p className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>SAVE TEMPLATE</p>
                                        <div className="flex gap-2">
                                            <input
                                                value={aiTemplateName}
                                                onChange={e => setAiTemplateName(e.target.value)}
                                                placeholder="Template name..."
                                                className="flex-1 text-[12px] px-3 py-2 rounded-lg outline-none"
                                                style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                            />
                                            <select
                                                value={aiCategory}
                                                onChange={e => setAiCategory(e.target.value)}
                                                className="text-[12px] px-2 py-2 rounded-lg outline-none"
                                                style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface, color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                                    <option key={c.id} value={c.id}>{c.id}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {aiSaved
                                            ? <SecondaryButton icon={<Check size={13} />}>Saved to My Templates!</SecondaryButton>
                                            : <PrimaryButton onClick={saveAiTemplate} disabled={!aiTemplateName || aiSaved} loading={aiSaving} icon={<Save size={13} />}>
                                                Save Template
                                            </PrimaryButton>
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom HTML Builder Modal */}
            {showBuilderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={() => { if (!builderSaving) setShowBuilderModal(false) }}>
                    <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ backgroundColor: C.surface }}
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: C.primaryLight }}>
                                    <Code2 size={15} style={{ color: C.primary }} />
                                </div>
                                <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Custom HTML Builder</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <SecondaryButton
                                    onClick={() => setBuilderPreview(v => !v)}
                                    icon={<Eye size={12} />}>
                                    {builderPreview ? 'Edit' : 'Preview'}
                                </SecondaryButton>
                                <IconButton
                                    onClick={() => { if (!builderSaving) setShowBuilderModal(false) }}
                                    icon={<X size={14} />}
                                    tooltip="Close"
                                    variant="ghost"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {/* Name + category */}
                            <div className="flex gap-3 p-4 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
                                <input
                                    value={builderName}
                                    onChange={e => setBuilderName(e.target.value)}
                                    placeholder="Template name (required)..."
                                    className="flex-1 text-[13px] px-3 py-2 rounded-lg outline-none"
                                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                />
                                <select
                                    value={builderCategory}
                                    onChange={e => setBuilderCategory(e.target.value)}
                                    className="text-[13px] px-3 py-2 rounded-lg outline-none"
                                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                        <option key={c.id} value={c.id}>{c.id}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Editor / Preview */}
                            <div className="flex-1 p-4">
                                {builderPreview ? (
                                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#f0f0f0', padding: 16, minHeight: 300 }}>
                                        {builderHtml ? (
                                            <div className="max-w-[560px] mx-auto rounded-xl overflow-hidden"
                                                style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}
                                                dangerouslySetInnerHTML={{ __html: sanitiseHtml(builderHtml) }} />
                                        ) : (
                                            <div className="flex items-center justify-center h-48">
                                                <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Paste HTML to preview</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        value={builderHtml}
                                        onChange={e => setBuilderHtml(e.target.value)}
                                        placeholder={`Paste or write your eBay-safe HTML here...\n\nTips:\n• Use table-based layout\n• Inline CSS only\n• Use placeholders: [PRODUCT_NAME], [PRICE], [DESCRIPTION]`}
                                        className="w-full text-[12px] p-3 rounded-xl outline-none resize-none font-mono"
                                        style={{
                                            border: `1px solid ${C.borderInput}`, backgroundColor: C.bg,
                                            color: C.body, minHeight: 320,
                                            lineHeight: 1.6,
                                        }}
                                        rows={18}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 flex items-center justify-between shrink-0"
                            style={{ borderTop: `1px solid ${C.border}` }}>
                            <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                {builderHtml.length.toLocaleString()} characters
                            </p>
                            <div className="flex items-center gap-2">
                                <GhostButton onClick={() => setShowBuilderModal(false)}>
                                    Cancel
                                </GhostButton>
                                {builderSaved
                                    ? <SecondaryButton icon={<Check size={13} />}>Saved!</SecondaryButton>
                                    : <PrimaryButton
                                        onClick={saveBuilderTemplate}
                                        disabled={!builderHtml || !builderName || builderSaved}
                                        loading={builderSaving}
                                        icon={<Save size={13} />}>
                                        Save Template
                                    </PrimaryButton>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
        </div >
        </div >
        </div >
    )
}

// ── Template Card component ────────────────────────────────────────────────
interface CardProps {
    template: ListingTemplate
    isOwn: boolean
    copiedId: string | null
    deletingId: string | null
    onPreview: () => void
    onCopy: () => void
    onDelete: () => void
}

function TemplateCard({ template, isOwn, copiedId, deletingId, onPreview, onCopy, onDelete }: CardProps) {
    const [hovered, setHovered] = useState(false)
    const copied = copiedId === template.id
    const deleting = deletingId === template.id

    // Badge
    const getBadge = () => {
        if (template.id.startsWith('builtin-') || template.is_system) {
            if (template.category === 'electronics') return { label: 'HIGH CONVERTING', bg: '#7530fb', text: '#fff' }
            if (template.category === 'fashion') return { label: 'MOBILE READY', bg: '#1e1535', text: '#b8fa33' }
            if ((template.use_count || 0) > 10) return { label: 'POPULAR', bg: '#b8fa33', text: '#1e1535' }
            return { label: 'NEW', bg: '#16a34a', text: '#fff' }
        }
        return null
    }
    const badge = getBadge()

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="rounded-2xl overflow-hidden flex flex-col transition-all cursor-pointer"
            style={{
                border: `2px solid ${hovered ? C.primary : C.border}`,
                backgroundColor: C.surface,
                boxShadow: hovered ? `0 4px 20px rgba(117,48,251,0.15)` : '0 1px 4px rgba(117,48,251,0.05)',
            }}>

            {/* Thumbnail */}
            <div className="relative" onClick={onPreview}>
                {template.description_html ? (
                    <TemplateThumbnail html={template.description_html} />
                ) : (
                    <div className="w-full h-40 flex items-center justify-center"
                        style={{ backgroundColor: C.bg }}>
                        <LayoutTemplate size={28} style={{ color: C.border }} />
                    </div>
                )}

                {/* Badge */}
                {badge && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide"
                        style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: 'DM Sans, sans-serif' }}>
                        {badge.label}
                    </div>
                )}

                {/* System badge */}
                {isOwn && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                        Mine
                    </div>
                )}

                {/* Hover overlay */}
                {hovered && (
                    <div className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(30,21,53,0.55)' }}>
                        <GhostButton onClick={onPreview} icon={<Eye size={13} />}>
                            Preview
                        </GhostButton>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 flex items-start justify-between gap-2"
                style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold truncate" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                        {template.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            Pure HTML/CSS
                        </span>
                        <span style={{ color: C.border }}>·</span>
                        <CategoryBadge category={template.category} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <IconButton
                        onClick={onCopy}
                        icon={copied ? <Check size={12} /> : <Copy size={12} />}
                        tooltip="Copy HTML"
                        active={copied}
                        variant={copied ? 'success' : 'default'}
                        size={28}
                    />
                    {isOwn && (
                        <IconButton
                            onClick={onDelete}
                            icon={deleting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                            tooltip="Delete template"
                            size={28}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
