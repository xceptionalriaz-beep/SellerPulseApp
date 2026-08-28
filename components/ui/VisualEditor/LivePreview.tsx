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
    { id: 'desktop' as const, label: 'Desktop', Icon: Monitor, width: 700 },
    { id: 'tablet' as const, label: 'Tablet', Icon: Tablet, width: 480 },
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
    { key: 'title', placeholder: '{{PRODUCT_TITLE}}', label: 'Product Title', defaultExample: 'Sony WH-1000XM5 Wireless Headphones' },
    { key: 'price', placeholder: '{{ITEM_PRICE}}', label: 'Price', defaultExample: '£249.99' },
    { key: 'imageUrl', placeholder: '{{MAIN_IMAGE_URL}}', label: 'Main Image URL', defaultExample: 'https://via.placeholder.com/500x500/f3eeff/7530fb?text=Product+Image' },
    { key: 'description', placeholder: '{{ITEM_DESCRIPTION}}', label: 'Description', defaultExample: 'Premium wireless headphones with industry-leading noise cancellation.' },
    { key: 'condition', placeholder: '{{ITEM_CONDITION}}', label: 'Condition', defaultExample: 'Brand New' },
    { key: 'seller', placeholder: '{{SELLER_NAME}}', label: 'Seller Name', defaultExample: 'TechStore_UK' },
    { key: 'category', placeholder: '{{ITEM_CATEGORY}}', label: 'Category', defaultExample: 'Electronics' },
    { key: 'sku', placeholder: '{{ITEM_SKU}}', label: 'SKU', defaultExample: 'WH1000XM5-BLK' },
    { key: 'brand', placeholder: '{{BRAND}}', label: 'Brand', defaultExample: 'Sony' },
    { key: 'shipping', placeholder: '{{SHIPPING_TIME}}', label: 'Shipping Time', defaultExample: '1-2 Business Days' },
    { key: 'returns', placeholder: '{{RETURN_POLICY}}', label: 'Returns', defaultExample: '30-Day Free Returns' },
    { key: 'quantity', placeholder: '{{QUANTITY}}', label: 'Stock Quantity', defaultExample: '3' },
]

type TestValues = Record<string, string>

// ── Props ─────────────────────────────────────────────────────────────────────
interface LivePreviewProps {
    html: string
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void
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
export default function LivePreview({ html, deviceWidth, onDeviceChange }: LivePreviewProps) {
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

    // Build preview HTML — substitute test values into assembled HTML
    const previewHtml = Object.keys(testValues).length > 0
        ? substituteAll(html, testValues)
        : html

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
            overflowY: 'auto',
            padding: '16px 16px 32px',
        }}>
            {/* Browser chrome */}
            <div style={{
                width: '100%',
                maxWidth: device.width,
                transition: 'max-width 0.3s ease',
                backgroundColor: C.surface,
                borderRadius: 10,
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                minHeight: 400,
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
                            eBay Listing Preview · {device.width}px
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
                        border: 'none',
                        minHeight: 500,
                        display: 'block',
                        backgroundColor: '#ffffff',
                    }}
                />
            </div>

            {/* Size label */}
            <p style={{
                marginTop: 10, marginBottom: 0,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 11, color: C.muted,
                textAlign: 'center',
            }}>
                {device.label} · {device.width}px wide
                {Object.keys(testValues).length > 0 && (
                    <span style={{ color: C.success, marginLeft: 8, fontWeight: 600 }}>
                        · Test data active
                    </span>
                )}
            </p>
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

                {/* Right — test data panel toggle + fullscreen */}
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

            {/* ── Test data panel ── */}
            {showTestPanel && (
                <TestDataPanel
                    testValues={testValues}
                    onUpdateField={updateField}
                    onLoadExample={handleLoadExample}
                    onReset={handleReset}
                />
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
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
            maxHeight: 260,
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
