'use client'
// components/ui/VisualEditor/LivePreview.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Live Preview
//
// Sandboxed iframe that renders the exact assembled HTML output.
// Replaces the canvas block cards when "Live Preview" toggle is active.
//
// Features:
//   • Sandboxed <iframe srcDoc={html}> — exact eBay rendering
//   • Device width toggle — Desktop 700px / Tablet 480px / Mobile 375px
//   • Test data panel — manually fill placeholder values
//   • eBay Item ID fetch — calls /api/ebay/import-listing, same as html-editor
//   • Placeholder substitution — replaces {{PLACEHOLDERS}} with real values
//   • Reset button — clears test data, shows raw template
//   • Fullscreen expand button
//
// Props:
//   html          — assembled HTML from VisualEditor
//   deviceWidth   — desktop | tablet | mobile (shared with canvas)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
    Monitor, Tablet, Smartphone, RefreshCw,
    Loader2, Maximize2, Minimize2, AlertCircle,
    Check, ChevronDown, ChevronUp,
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
    success: '#16a34a',
    successBg: '#dcfce7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    editorBg: '#0f0e1a',
}

// ── Device config ─────────────────────────────────────────────────────────────
const DEVICES = [
    { id: 'desktop' as const, label: 'Desktop', Icon: Monitor, width: 1000 },
    { id: 'tablet' as const, label: 'Tablet', Icon: Tablet, width: 768 },
    { id: 'mobile' as const, label: 'Mobile', Icon: Smartphone, width: 375 },
]

// ── All placeholders we can substitute ───────────────────────────────────────
interface TestField {
    key: string
    placeholder: string
    label: string
    defaultExample: string
}

const TEST_FIELDS: TestField[] = [
    // ── Core product ──────────────────────────────────────────────────────────
    { key: 'title', placeholder: '{{PRODUCT_TITLE}}', label: 'Product Title', defaultExample: 'Sony WH-1000XM5 Wireless Headphones' },
    { key: 'price', placeholder: '{{ITEM_PRICE}}', label: 'Price', defaultExample: '£249.99' },
    { key: 'originalPrice', placeholder: '{{ORIGINAL_PRICE}}', label: 'Original Price', defaultExample: '£349.99' },
    { key: 'imageUrl', placeholder: '{{MAIN_IMAGE_URL}}', label: 'Main Image URL', defaultExample: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop&auto=format&q=80' },
    { key: 'description', placeholder: '{{ITEM_DESCRIPTION}}', label: 'Description', defaultExample: 'Premium wireless headphones with industry-leading noise cancellation.' },
    { key: 'condition', placeholder: '{{ITEM_CONDITION}}', label: 'Condition', defaultExample: 'Brand New' },
    { key: 'brand', placeholder: '{{BRAND}}', label: 'Brand', defaultExample: 'Sony' },
    { key: 'sku', placeholder: '{{ITEM_SKU}}', label: 'SKU', defaultExample: 'WH1000XM5-BLK' },
    { key: 'quantity', placeholder: '{{QUANTITY}}', label: 'Stock Quantity', defaultExample: '3' },
    // ── Seller & trust ────────────────────────────────────────────────────────
    { key: 'seller', placeholder: '{{SELLER_NAME}}', label: 'Seller Name', defaultExample: 'TechStore_UK' },
    { key: 'feedbackScore', placeholder: '{{FEEDBACK_SCORE}}', label: 'Feedback Score', defaultExample: '12,450' },
    { key: 'feedbackPct', placeholder: '{{FEEDBACK_PERCENT}}', label: 'Feedback %', defaultExample: '99.4' },
    { key: 'watchers', placeholder: '{{WATCHERS}}', label: 'Watchers', defaultExample: '24' },
    // ── Logistics ─────────────────────────────────────────────────────────────
    { key: 'shipping', placeholder: '{{SHIPPING_TIME}}', label: 'Shipping Time', defaultExample: '1-2 Business Days' },
    { key: 'returns', placeholder: '{{RETURN_POLICY}}', label: 'Returns', defaultExample: '30-Day Free Returns' },
    { key: 'warranty', placeholder: '{{WARRANTY}}', label: 'Warranty', defaultExample: '12-Month Manufacturer Warranty' },
    // ── Specs ─────────────────────────────────────────────────────────────────
    { key: 'category', placeholder: '{{DEPARTMENT}}', label: 'Category', defaultExample: 'Electronics' },
    { key: 'colour', placeholder: '{{COLOUR}}', label: 'Colour', defaultExample: 'Midnight Black' },
    { key: 'size', placeholder: '{{SIZE}}', label: 'Size', defaultExample: 'One Size' },
    { key: 'material', placeholder: '{{MATERIAL}}', label: 'Material', defaultExample: 'Premium Plastic & Metal' },
    // ── Gallery images ────────────────────────────────────────────────────────
    { key: 'lifestyleImage', placeholder: '{{LIFESTYLE_IMAGE_URL}}', label: 'Lifestyle Image URL', defaultExample: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format&q=80' },
    { key: 'gallery1', placeholder: '{{GALLERY_IMAGE_1}}', label: 'Gallery Image 1', defaultExample: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format&q=80' },
    { key: 'gallery2', placeholder: '{{GALLERY_IMAGE_2}}', label: 'Gallery Image 2', defaultExample: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format&q=80' },
    { key: 'gallery3', placeholder: '{{GALLERY_IMAGE_3}}', label: 'Gallery Image 3', defaultExample: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=500&fit=crop&auto=format&q=80' },
    // ── Related / cross-sell ──────────────────────────────────────────────────
    { key: 'relatedTitle1', placeholder: '{{RELATED_TITLE_1}}', label: 'Related Title 1', defaultExample: 'Sony WF-1000XM5 Earbuds' },
    { key: 'relatedPrice1', placeholder: '{{RELATED_PRICE_1}}', label: 'Related Price 1', defaultExample: '£199.99' },
    { key: 'relatedImage1', placeholder: '{{RELATED_IMAGE_1}}', label: 'Related Image 1', defaultExample: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop&auto=format&q=80' },
    { key: 'relatedTitle2', placeholder: '{{RELATED_TITLE_2}}', label: 'Related Title 2', defaultExample: 'Sony SRS-XB43 Speaker' },
    { key: 'relatedPrice2', placeholder: '{{RELATED_PRICE_2}}', label: 'Related Price 2', defaultExample: '£149.99' },
    { key: 'relatedImage2', placeholder: '{{RELATED_IMAGE_2}}', label: 'Related Image 2', defaultExample: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop&auto=format&q=80' },
    { key: 'relatedTitle3', placeholder: '{{RELATED_TITLE_3}}', label: 'Related Title 3', defaultExample: 'Sony MDR-7506 Headphones' },
    { key: 'relatedPrice3', placeholder: '{{RELATED_PRICE_3}}', label: 'Related Price 3', defaultExample: '£89.99' },
    { key: 'relatedImage3', placeholder: '{{RELATED_IMAGE_3}}', label: 'Related Image 3', defaultExample: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&h=200&fit=crop&auto=format&q=80' },
    { key: 'relatedTitle4', placeholder: '{{RELATED_TITLE_4}}', label: 'Related Title 4', defaultExample: 'Sony INZONE H9 Headset' },
    { key: 'relatedPrice4', placeholder: '{{RELATED_PRICE_4}}', label: 'Related Price 4', defaultExample: '£229.99' },
    { key: 'relatedImage4', placeholder: '{{RELATED_IMAGE_4}}', label: 'Related Image 4', defaultExample: 'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=200&h=200&fit=crop&auto=format&q=80' },
]

type TestValues = Record<string, string>

// ── Props ─────────────────────────────────────────────────────────────────────
interface LivePreviewProps {
    html: string
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void
    onClose?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER SUBSTITUTION
// ─────────────────────────────────────────────────────────────────────────────
function substituteAll(html: string, values: TestValues): string {
    let result = html
    TEST_FIELDS.forEach(field => {
        if (values[field.key]) {
            const re = new RegExp(field.placeholder.replace(/[{}]/g, '\\$&'), 'g')
            result = result.replace(re, values[field.key])
        }
    })
    return result
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LivePreview({ html, deviceWidth, onDeviceChange, onClose }: LivePreviewProps) {
    const [testValues, setTestValues] = useState<TestValues>({})
    const [ebayId, setEbayId] = useState('')
    const [testLoading, setTestLoading] = useState(false)
    const [testError, setTestError] = useState('')
    const [testSuccess, setTestSuccess] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const [showTestPanel, setShowTestPanel] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    // Current device config
    const device = DEVICES.find(d => d.id === deviceWidth) ?? DEVICES[0]

    // Build preview HTML — substitute test values, or default sample data so images/text don't show as broken tokens
    const previewHtml = React.useMemo(() => {
        const values: TestValues = { ...testValues }
        TEST_FIELDS.forEach(f => {
            if (!values[f.key]) {
                values[f.key] = f.defaultExample
            }
        })
        const substituted = substituteAll(html, values)
        const hideScrollbarStyle = `
            <style>
                html, body {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
                ::-webkit-scrollbar, *::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
            </style>
        `
        if (substituted.includes('</head>')) {
            return substituted.replace('</head>', `${hideScrollbarStyle}</head>`)
        }
        return hideScrollbarStyle + substituted
    }, [html, testValues])

    // ── Load from eBay Item ID ─────────────────────────────────────────────
    const handleEbayTest = useCallback(async () => {
        if (!ebayId.trim()) return
        setTestLoading(true)
        setTestError('')
        setTestSuccess(false)
        try {
            const res = await fetch(
                `/api/ebay/import-listing?item=${encodeURIComponent(ebayId.trim())}`
            )
            const data = await res.json()
            if (!res.ok || !data.item) {
                setTestError(data.error || 'Could not fetch listing')
                return
            }
            const item = data.item
            const currency = item.currency === 'GBP' ? '£'
                : item.currency === 'EUR' ? '€' : '$'

            setTestValues({
                title: item.title ?? '',
                price: `${currency}${parseFloat(item.price || '0').toFixed(2)}`,
                imageUrl: item.imageUrl ?? '',
                description: item.description ?? item.title ?? '',
                condition: item.condition ?? '',
                seller: item.seller ?? '',
                category: item.categoryName ?? '',
                sku: item.itemId ?? '',
                brand: item.brand ?? '',
                shipping: item.shippingTime ?? item.estimatedDelivery ?? '1-3 Business Days',
                returns: item.returnPolicy ?? '30-Day Returns',
            })
            setTestSuccess(true)
            setTimeout(() => setTestSuccess(false), 3000)
        } catch {
            setTestError('Network error — check your connection')
        } finally {
            setTestLoading(false)
        }
    }, [ebayId])

    // ── Reset test data ────────────────────────────────────────────────────
    const handleReset = () => {
        setTestValues({})
        setEbayId('')
        setTestError('')
    }

    // ── Load example data ──────────────────────────────────────────────────
    const handleLoadExample = () => {
        const example: TestValues = {}
        TEST_FIELDS.forEach(f => { example[f.key] = f.defaultExample })
        setTestValues(example)
    }

    // ── Update single field ────────────────────────────────────────────────
    const updateField = (key: string, value: string) => {
        setTestValues(prev => ({ ...prev, [key]: value }))
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    const iframeContent = (
        <div style={{
            flex: 1,
            minHeight: 0,
            backgroundColor: '#e8e6f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            padding: '12px 16px 0',
            boxSizing: 'border-box',
        }}>
            {/* Browser chrome */}
            <div style={{
                width: '100%',
                maxWidth: deviceWidth === 'desktop' ? '100%' : device.width,
                flex: 1,
                minHeight: 0,
                transition: 'max-width 0.3s ease',
                backgroundColor: C.surface,
                borderRadius: '10px 10px 0 0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Browser bar */}
                <div style={{
                    height: 36,
                    backgroundColor: '#f1f1f1',
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    gap: 6,
                    flexShrink: 0,
                }}>
                    {['#ff5f57', '#ffbd2e', '#28c840'].map((col, i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col }} />
                    ))}
                    <div style={{
                        flex: 1,
                        height: 22,
                        backgroundColor: '#fff',
                        borderRadius: 4,
                        marginLeft: 8,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 8,
                    }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                            eBay Listing Preview · {deviceWidth === 'desktop' ? 'Full Canvas Width' : `${device.width}px`}
                        </span>
                    </div>
                </div>

                {/* iframe */}
                <iframe
                    ref={iframeRef}
                    srcDoc={previewHtml}
                    title="eBay listing preview"
                    sandbox="allow-same-origin"
                    style={{
                        width: '100%',
                        flex: 1,
                        height: '100%',
                        border: 'none',
                        minHeight: 0,
                        display: 'block',
                        backgroundColor: '#ffffff',
                    }}
                />
            </div>
        </div>
    )

    // Fullscreen mode
    if (fullscreen) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: '#e8e6f0',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Fullscreen toolbar */}
                <div style={{
                    height: 44,
                    backgroundColor: C.dark,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    flexShrink: 0,
                }}>
                    <DeviceButtons deviceWidth={deviceWidth} onDeviceChange={onDeviceChange} />
                    <button
                        onClick={() => setFullscreen(false)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px',
                            border: `1px solid rgba(255,255,255,0.2)`,
                            borderRadius: 7,
                            backgroundColor: 'transparent',
                            color: '#ffffff',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12, cursor: 'pointer',
                        }}
                    >
                        <Minimize2 size={13} />
                        Exit
                    </button>
                </div>
                {iframeContent}
            </div>
        )
    }

    return (
        <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* ── Preview toolbar ── */}
            <div style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px',
                backgroundColor: C.surface,
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
                gap: 10,
            }}>
                {/* Left — device toggles */}
                <DeviceButtons deviceWidth={deviceWidth} onDeviceChange={onDeviceChange} />

                {/* Centre — eBay ID test input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, maxWidth: 320 }}>
                    <input
                        type="text"
                        value={ebayId}
                        onChange={e => setEbayId(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEbayTest() }}
                        placeholder="Enter eBay Item ID to test..."
                        style={{
                            flex: 1,
                            padding: '5px 10px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 7,
                            backgroundColor: C.bg,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, color: C.body,
                            outline: 'none',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
                        onBlur={e => { e.currentTarget.style.borderColor = C.inputBorder }}
                    />
                    <button
                        onClick={handleEbayTest}
                        disabled={!ebayId.trim() || testLoading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 12px',
                            border: 'none', borderRadius: 7,
                            backgroundColor: testSuccess ? C.success : C.primary,
                            color: '#fff',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, fontWeight: 700,
                            cursor: ebayId.trim() && !testLoading ? 'pointer' : 'default',
                            opacity: !ebayId.trim() || testLoading ? 0.6 : 1,
                            transition: 'background-color 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        {testLoading
                            ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                            : testSuccess
                                ? <Check size={11} />
                                : null
                        }
                        {testLoading ? 'Fetching...' : testSuccess ? 'Loaded!' : 'Test'}
                    </button>
                </div>

                {/* Right — test data panel toggle + fullscreen + exit eye button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button
                        onClick={() => setShowTestPanel(p => !p)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px',
                            border: `1px solid ${showTestPanel ? C.primary : C.border}`,
                            borderRadius: 7,
                            backgroundColor: showTestPanel ? C.primaryLight : 'transparent',
                            color: showTestPanel ? C.primary : C.secondary,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, fontWeight: showTestPanel ? 700 : 400,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        {showTestPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Test Data
                        {Object.keys(testValues).length > 0 && (
                            <span style={{
                                backgroundColor: C.success, color: '#fff',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 9, fontWeight: 700,
                                padding: '1px 5px', borderRadius: 10,
                            }}>
                                {Object.keys(testValues).length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setFullscreen(true)}
                        title="Fullscreen"
                        style={{
                            width: 30, height: 30,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${C.border}`, borderRadius: 7,
                            backgroundColor: 'transparent', cursor: 'pointer',
                            color: C.secondary, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.primaryLight; e.currentTarget.style.color = C.primary }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.secondary }}
                    >
                        <Maximize2 size={13} />
                    </button>
                    {onClose && (
                        <>
                            <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
                            <button
                                onClick={onClose}
                                title="Exit Live Preview"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 30, height: 30,
                                    border: `1px solid ${C.border}`, borderRadius: 7,
                                    backgroundColor: '#f3eeff',
                                    color: '#7530fb',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    flexShrink: 0,
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Test error ── */}
            {testError && (
                <div style={{
                    padding: '7px 14px', flexShrink: 0,
                    backgroundColor: C.dangerBg,
                    display: 'flex', alignItems: 'center', gap: 7,
                    borderBottom: `1px solid #fecaca50`,
                }}>
                    <AlertCircle size={12} style={{ color: C.danger, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.danger }}>
                        {testError}
                    </p>
                    <button onClick={() => setTestError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontSize: 14 }}>×</button>
                </div>
            )}

            {/* ── Test data panel (popup overlay) ── */}
            {showTestPanel && (
                <>
                    <div
                        onClick={() => setShowTestPanel(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 44,
                        right: 0,
                        zIndex: 100,
                        width: 520,
                        maxHeight: 'calc(100vh - 100px)',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        borderRadius: '0 0 10px 10px',
                        overflow: 'hidden',
                    }}>
                        <TestDataPanel
                            testValues={testValues}
                            onUpdateField={updateField}
                            onLoadExample={handleLoadExample}
                            onReset={handleReset}
                        />
                    </div>
                </>
            )}

            {/* ── iframe content ── */}
            {iframeContent}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
function DeviceButtons({
    deviceWidth,
    onDeviceChange,
}: {
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void
}) {
    return (
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {DEVICES.map(d => (
                <button
                    key={d.id}
                    onClick={() => onDeviceChange(d.id)}
                    title={`${d.label} (${d.width}px)`}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 8px',
                        border: `1px solid ${deviceWidth === d.id ? C.primary : C.border}`,
                        borderRadius: 7,
                        backgroundColor: deviceWidth === d.id ? C.primaryLight : 'transparent',
                        color: deviceWidth === d.id ? C.primary : C.secondary,
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 10, fontWeight: deviceWidth === d.id ? 700 : 400,
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                >
                    <d.Icon size={12} />
                    <span>{d.label}</span>
                    <span style={{ opacity: 0.6, fontSize: 9 }}>{d.width}px</span>
                </button>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST DATA PANEL
// Expandable panel showing all substitutable fields
// ─────────────────────────────────────────────────────────────────────────────
function TestDataPanel({
    testValues,
    onUpdateField,
    onLoadExample,
    onReset,
}: {
    testValues: TestValues
    onUpdateField: (key: string, value: string) => void
    onLoadExample: () => void
    onReset: () => void
}) {
    const hasValues = Object.keys(testValues).length > 0

    return (
        <div style={{
            backgroundColor: C.surface,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 14px',
                borderBottom: `1px solid ${C.border}`,
                position: 'sticky', top: 0,
                backgroundColor: C.surface, zIndex: 1,
            }}>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: C.dark }}>
                    Test Data Values
                </p>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button
                        onClick={onLoadExample}
                        style={{
                            padding: '3px 8px',
                            border: `1px solid ${C.primaryBorder}`,
                            borderRadius: 6, backgroundColor: C.primaryLight,
                            color: C.primary, fontFamily: 'DM Sans, sans-serif',
                            fontSize: 10, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Load example
                    </button>
                    {hasValues && (
                        <button
                            onClick={onReset}
                            style={{
                                padding: '3px 8px',
                                border: `1px solid #fecaca`,
                                borderRadius: 6, backgroundColor: C.dangerBg,
                                color: C.danger, fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Fields — 2 column grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1px',
                backgroundColor: C.border,
            }}>
                {TEST_FIELDS.map(field => (
                    <div key={field.key} style={{ backgroundColor: C.surface, padding: '7px 12px' }}>
                        <p style={{ margin: '0 0 3px', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 600, color: C.secondary }}>
                            {field.label}
                        </p>
                        <input
                            type="text"
                            value={testValues[field.key] ?? ''}
                            onChange={e => onUpdateField(field.key, e.target.value)}
                            placeholder={field.defaultExample}
                            style={{
                                width: '100%', boxSizing: 'border-box' as const,
                                padding: '4px 7px',
                                border: `1px solid ${testValues[field.key] ? C.primaryBorder : C.inputBorder}`,
                                borderRadius: 5,
                                backgroundColor: testValues[field.key] ? C.primaryLight : C.bg,
                                fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                color: C.body, outline: 'none',
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
