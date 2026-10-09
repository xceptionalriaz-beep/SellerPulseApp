'use client'
// components/ui/ImportUrl.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Import URL / AI Template Converter
//
// Fetches an eBay listing via URL or Item ID → generates a ready-to-use
// HTML template → loads it into the editor
//
// Reuses existing /api/ebay/fetch-item route — no new API needed
//
// Usage:
//   import ImportUrl from '@/components/ui/ImportUrl'
//   <ImportUrl
//     open={showImport}
//     onClose={() => setShowImport(false)}
//     onImport={(html, name) => { setHtml(html); setName(name) }}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import {
    X, Link2, Loader2, CheckCircle2,
    AlertCircle, ExternalLink, Tag,
    Package, Truck, RotateCcw, Store,
    ChevronRight, FileCode2,
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
    warning: '#d97706',
    warningBg: '#fef3c7',
}

// ── eBay item type (matches fetch-item response) ───────────────────────────
interface EbayItem {
    itemId: string
    title: string
    price: number
    currency: string
    condition: string
    categoryName: string
    imageUrl: string
    itemUrl: string
    seller: string
    sellerFeedback: string
    location: string
    freeShipping: boolean
    shippingCost: number
    returns: boolean
    returnPeriod: string
    brand: string
    mpn: string
    ean: string
    quantity: number
    sold: number
    site: string
}

// ── Props ──────────────────────────────────────────────────────────────────
interface ImportUrlProps {
    open: boolean
    onClose: () => void
    onImport: (html: string, name: string) => void
}

// ── HTML template generator ────────────────────────────────────────────────
function generateTemplate(item: EbayItem): string {
    const price = `${item.currency === 'GBP' ? '£' : item.currency === 'EUR' ? '€' : '$'}${item.price.toFixed(2)}`
    const shipping = item.freeShipping ? 'Free Shipping' : item.shippingCost > 0 ? `${price} Shipping` : 'See listing'
    const returns = item.returns ? `${item.returnPeriod || '30'}-Day Returns` : 'No Returns'
    const feedback = item.sellerFeedback ? `${item.sellerFeedback}% Positive Feedback` : 'Top Rated Seller'
    const brand = item.brand || '{{BRAND}}'
    const condition = item.condition || '{{ITEM_CONDITION}}'
    const category = item.categoryName || '{{ITEM_CATEGORY}}'

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #f8f8f8; }
    .wrapper { max-width: 700px; margin: 0 auto; background: #ffffff; }

    /* Header */
    .header { background: linear-gradient(135deg, #7530fb 0%, #9d5cf7 100%); padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3; }
    .header .subtitle { margin: 0; font-size: 13px; color: rgba(255,255,255,0.8); }

    /* Trust badges */
    .badges { background: #f8f7ff; padding: 14px 24px; }
    .badges table { width: 100%; border-collapse: collapse; }
    .badge-cell { text-align: center; padding: 8px 4px; }
    .badge-icon { font-size: 16px; display: block; margin-bottom: 4px; }
    .badge-text { font-size: 11px; font-weight: 700; color: #7530fb; }

    /* Product section */
    .product { padding: 24px; }
    .product-img { width: 100%; max-width: 500px; height: auto; display: block; margin: 0 auto 20px; border-radius: 8px; }
    .price-block { background: #f8f7ff; border: 1px solid #ede9fe; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; }
    .price { font-size: 28px; font-weight: 900; color: #7530fb; margin: 0 0 4px; }
    .condition { font-size: 12px; color: #6b7280; margin: 0; }

    /* Description */
    .desc-title { font-size: 16px; font-weight: 700; color: #1e1535; border-left: 4px solid #7530fb; padding-left: 12px; margin: 0 0 12px; }
    .desc-body { font-size: 13px; color: #6b7280; line-height: 1.8; margin: 0 0 20px; }

    /* Specs table */
    .specs { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    .specs tr:nth-child(even) { background: #f8f7ff; }
    .specs td { padding: 10px 14px; border: 1px solid #ede9fe; }
    .specs td:first-child { font-weight: 700; color: #1e1535; width: 35%; }
    .specs td:last-child { color: #6b7280; }

    /* Shipping & returns */
    .shipping-row { background: #dcfce7; border: 1px solid #86efac50; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; }
    .shipping-row p { margin: 0; font-size: 12px; font-weight: 700; color: #166534; }

    /* CTA banner */
    .cta { background: #1e1535; padding: 20px 24px; text-align: center; }
    .cta p { margin: 0 0 4px; font-size: 14px; font-weight: 800; color: #b8fa33; }
    .cta small { font-size: 11px; color: rgba(255,255,255,0.5); }

    /* Footer */
    .footer { background: #7530fb; padding: 14px 24px; text-align: center; }
    .footer p { margin: 0; font-size: 11px; color: rgba(255,255,255,0.7); }
  </style>
</head>
<body>
<table class="wrapper" width="700" cellpadding="0" cellspacing="0" border="0" align="center">

  <!-- HEADER -->
  <tr><td class="header">
    <h1>{{PRODUCT_TITLE}}</h1>
    <p class="subtitle">Condition: ${condition} &bull; Category: ${category}</p>
  </td></tr>

  <!-- TRUST BADGES -->
  <tr><td class="badges">
    <table><tr>
      <td class="badge-cell"><span class="badge-icon">&#10003;</span><span class="badge-text">Authentic Product</span></td>
      <td class="badge-cell"><span class="badge-icon">&#128230;</span><span class="badge-text">${shipping}</span></td>
      <td class="badge-cell"><span class="badge-icon">&#128260;</span><span class="badge-text">${returns}</span></td>
      <td class="badge-cell"><span class="badge-icon">&#11088;</span><span class="badge-text">${feedback}</span></td>
    </tr></table>
  </td></tr>

  <!-- PRODUCT IMAGE + PRICE -->
  <tr><td class="product">
    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="{{PRODUCT_TITLE}}" class="product-img">` : '<img src="{{MAIN_IMAGE_URL}}" alt="{{PRODUCT_TITLE}}" class="product-img">'}
    <div class="price-block">
      <p class="price">{{ITEM_PRICE}}</p>
      <p class="condition">Condition: ${condition} &bull; Brand: ${brand}</p>
    </div>

    <!-- DESCRIPTION -->
    <p class="desc-title">Product Description</p>
    <p class="desc-body">{{ITEM_DESCRIPTION}}</p>

    <!-- SPECS TABLE -->
    <p class="desc-title">Item Specifics</p>
    <table class="specs">
      ${item.brand ? `<tr><td>Brand</td><td>${item.brand}</td></tr>` : '<tr><td>Brand</td><td>{{BRAND}}</td></tr>'}
      ${item.mpn ? `<tr><td>MPN</td><td>${item.mpn}</td></tr>` : ''}
      ${item.ean ? `<tr><td>EAN</td><td>${item.ean}</td></tr>` : ''}
      <tr><td>Condition</td><td>${condition}</td></tr>
      <tr><td>Category</td><td>${category}</td></tr>
      ${item.location ? `<tr><td>Location</td><td>${item.location}</td></tr>` : ''}
    </table>

    <!-- SHIPPING & RETURNS -->
    <div class="shipping-row">
      <p>&#128230; Shipping: ${shipping} &bull; &#128260; Returns: ${returns} &bull; &#128722; Seller: ${item.seller || '{{SELLER_NAME}}'}</p>
    </div>
  </td></tr>

  <!-- CTA BANNER -->
  <tr><td class="cta">
    <p>Buy with Confidence &mdash; Trusted eBay Seller</p>
    <small>All items are genuine &bull; Secure payment &bull; Fast dispatch</small>
  </td></tr>

  <!-- FOOTER -->
  <tr><td class="footer">
    <p>Listed by ${item.seller || '{{SELLER_NAME}}'} &bull; ${feedback} &bull; View our other listings</p>
  </td></tr>

</table>
</body>
</html>`
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ImportUrl({ open, onClose, onImport }: ImportUrlProps) {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [item, setItem] = useState<EbayItem | null>(null)
    const [step, setStep] = useState<'input' | 'preview'>('input')

    if (!open) return null

    // ── Fetch listing ────────────────────────────────────────────────────────
    async function fetchListing() {
        if (!input.trim()) return
        setLoading(true)
        setError('')
        setItem(null)
        try {
            const res = await fetch(`/api/ebay/import-listing?item=${encodeURIComponent(input.trim())}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch listing')
            setItem(data.item as EbayItem)
            setStep('preview')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    // ── Import into editor ───────────────────────────────────────────────────
    function handleImport() {
        if (!item) return
        const html = generateTemplate(item)
        onImport(html, item.title.slice(0, 50))
        onClose()
    }

    // ── Reset ────────────────────────────────────────────────────────────────
    function reset() {
        setStep('input')
        setItem(null)
        setError('')
    }

    const price = item
        ? `${item.currency === 'GBP' ? '£' : item.currency === 'EUR' ? '€' : '$'}${item.price.toFixed(2)}`
        : ''

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ backgroundColor: C.surface, maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0"
                    style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7530fb, #9d5cf7)' }}>
                            <Link2 size={15} style={{ color: '#fff' }} />
                        </div>
                        <div>
                            <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                Import eBay Listing
                            </p>
                            <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Paste a URL or Item ID to generate a template
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 transition-all"
                        style={{ backgroundColor: C.bg, border: 'none', cursor: 'pointer' }}>
                        <X size={14} style={{ color: C.muted }} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">

                    {/* Step 1: Input */}
                    {step === 'input' && (
                        <div className="p-5 flex flex-col gap-4">

                            {/* URL input */}
                            <div>
                                <label className="text-[12px] font-semibold block mb-1.5"
                                    style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                    eBay Listing URL or Item ID
                                </label>
                                <input
                                    autoFocus
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !loading && fetchListing()}
                                    placeholder="https://www.ebay.co.uk/itm/123456789  or  123456789"
                                    className="w-full text-[12px] px-3 py-2.5 rounded-xl outline-none transition-all"
                                    style={{
                                        border: `1px solid ${C.borderInput}`,
                                        backgroundColor: C.bg,
                                        color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                                />
                            </div>

                            {/* What to expect */}
                            <div className="rounded-xl p-4" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                <p className="text-[11px] font-bold mb-2" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                    WHAT GETS IMPORTED
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {[
                                        { icon: Tag, text: 'Product title, price & condition' },
                                        { icon: Package, text: 'Brand, MPN, EAN & item specifics' },
                                        { icon: Store, text: 'Seller name & feedback score' },
                                        { icon: Truck, text: 'Shipping cost & returns policy' },
                                        { icon: FileCode2, text: 'Full HTML template ready to edit' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-2">
                                            <Icon size={12} style={{ color: C.primary, flexShrink: 0 }} />
                                            <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex flex-col gap-1 p-3 rounded-xl"
                                    style={{ backgroundColor: C.dangerBg, border: `1px solid ${C.danger}30` }}>
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={13} style={{ color: C.danger, flexShrink: 0, marginTop: 1 }} />
                                        <p className="text-[12px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
                                    </div>
                                    {error.includes('ended') && (
                                        <p className="text-[11px] mt-1 ml-5" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                            Try copying the URL of any <strong>live, active</strong> eBay listing — search eBay and pick one that is currently for sale.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Tips */}
                            <div className="p-3 rounded-xl" style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warning}30` }}>
                                <p className="text-[11px]" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                    <strong>Tip:</strong> Works with active eBay listings only. Ended or sold listings may not be available.
                                    Supports eBay UK, US, AU, DE, FR and more.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preview fetched item */}
                    {step === 'preview' && item && (
                        <div className="p-5 flex flex-col gap-4">

                            {/* Success badge */}
                            <div className="flex items-center gap-2 p-3 rounded-xl"
                                style={{ backgroundColor: C.successBg, border: `1px solid ${C.success}30` }}>
                                <CheckCircle2 size={14} style={{ color: C.success, flexShrink: 0 }} />
                                <p className="text-[12px] font-semibold" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                    Listing fetched successfully — template ready to import
                                </p>
                            </div>

                            {/* Item preview card */}
                            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                                {/* Image */}
                                {item.imageUrl && (
                                    <div style={{ height: 180, backgroundColor: C.bg, overflow: 'hidden' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.imageUrl} alt={item.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                )}

                                <div className="p-4">
                                    {/* Title */}
                                    <p className="text-[13px] font-bold mb-2 leading-snug"
                                        style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                        {item.title}
                                    </p>

                                    {/* Price + condition */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[20px] font-black" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                                            {price}
                                        </span>
                                        {item.condition && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                                                style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                {item.condition}
                                            </span>
                                        )}
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {[
                                            { label: 'Item ID', value: item.itemId },
                                            { label: 'Seller', value: item.seller || '—' },
                                            { label: 'Feedback', value: item.sellerFeedback ? `${item.sellerFeedback}%` : '—' },
                                            { label: 'Shipping', value: item.freeShipping ? 'Free' : item.shippingCost ? `${price}` : '—' },
                                            { label: 'Returns', value: item.returns ? (item.returnPeriod || '30 days') : 'No returns' },
                                            { label: 'Brand', value: item.brand || '—' },
                                            { label: 'Location', value: item.location || '—' },
                                            { label: 'Category', value: item.categoryName?.split('|').pop()?.trim() || '—' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex flex-col p-2 rounded-lg"
                                                style={{ backgroundColor: C.bg }}>
                                                <span className="text-[9px] font-bold uppercase tracking-wide"
                                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                                                <span className="text-[11px] font-semibold truncate"
                                                    style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* eBay link */}
                                    <a href={item.itemUrl} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 mt-3 text-[11px] font-semibold hover:opacity-70 transition-all"
                                        style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}>
                                        <ExternalLink size={11} /> View on eBay
                                    </a>
                                </div>
                            </div>

                            {/* Template preview note */}
                            <div className="p-3 rounded-xl" style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                                <p className="text-[11px]" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                    <strong>Template includes:</strong> Header with title, trust badges, product image,
                                    price block, description placeholder, specs table, shipping info and CTA banner.
                                    All fields use <code style={{ backgroundColor: 'rgba(117,48,251,0.1)', padding: '1px 4px', borderRadius: 3 }}>{'{{PLACEHOLDERS}}'}</code> for dynamic data.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0"
                    style={{ borderTop: `1px solid ${C.border}` }}>
                    {step === 'preview' ? (
                        <>
                            <button onClick={reset}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                <RotateCcw size={12} /> Try another
                            </button>
                            <button onClick={handleImport}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                <FileCode2 size={14} /> Import Template
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onClose}
                                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                Cancel
                            </button>
                            <button
                                onClick={fetchListing}
                                disabled={loading || !input.trim()}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50"
                                style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                {loading
                                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching listing...</>
                                    : <><ChevronRight size={14} /> Fetch & Generate Template</>
                                }
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
