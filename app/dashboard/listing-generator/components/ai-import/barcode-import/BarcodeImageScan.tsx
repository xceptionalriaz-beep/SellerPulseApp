'use client'

// app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeImageScan.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Scan barcode from a photo / image file
// Uses @zxing/browser BrowserMultiFormatReader.decodeFromImageUrl() so it
// works on any browser without camera permission.
// ──────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    text: '#1a1523',
    muted: '#6b7280',
    error: '#ef4444',
    errorLight: '#fef2f2',
    warning: '#f59e0b',
    success: '#22c55e',
    successLight: '#f0fdf4',
} as const

// ── Types ─────────────────────────────────────────────────────────────────────
type ScanState = 'idle' | 'scanning' | 'found' | 'not_found' | 'error'

interface BarcodeImageScanProps {
    /** Called with the barcode string when successfully decoded */
    onDetected: (barcode: string) => void
    /** Disable the button (e.g. queue is full) */
    disabled?: boolean
    className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BarcodeImageScan({
    onDetected,
    disabled = false,
    className = '',
}: BarcodeImageScanProps) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [state, setState] = useState<ScanState>('idle')
    const [lastBarcode, setLastBarcode] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        // Reset so the same file can be re-selected next time
        e.target.value = ''

        setState('scanning')
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        try {
            const reader = new BrowserMultiFormatReader()
            const result = await reader.decodeFromImageUrl(objectUrl)
            const barcode = result.getText().trim()
            setLastBarcode(barcode)
            setState('found')
            onDetected(barcode)
            // Auto-reset after showing success
            setTimeout(() => {
                setState('idle')
                setPreview(null)
                URL.revokeObjectURL(objectUrl)
            }, 2_200)
        } catch (err) {
            URL.revokeObjectURL(objectUrl)
            if (err instanceof NotFoundException) {
                setState('not_found')
            } else {
                console.error('[BarcodeImageScan]', err)
                setState('error')
            }
            setTimeout(() => {
                setState('idle')
                setPreview(null)
            }, 2_800)
        }
    }

    // ── Button label & style based on state ───────────────────────────────────
    const label = {
        idle: 'Scan from Image',
        scanning: 'Reading image…',
        found: `✓ ${lastBarcode ?? 'Found'}`,
        not_found: 'No barcode found — try another photo',
        error: 'Could not read image',
    }[state]

    const buttonBg = {
        idle: C.surface,
        scanning: C.surface,
        found: C.successLight,
        not_found: '#fffbeb',
        error: '#fef2f2',
    }[state]

    const buttonBorder = {
        idle: C.border,
        scanning: C.primary,
        found: C.success,
        not_found: C.warning,
        error: C.error,
    }[state]

    const labelColor = {
        idle: C.primary,
        scanning: C.primary,
        found: C.success,
        not_found: C.warning,
        error: C.error,
    }[state]

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {/* Hidden file input */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled || state === 'scanning'}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
                style={{
                    backgroundColor: buttonBg,
                    border: `1.5px dashed ${buttonBorder}`,
                    color: labelColor,
                    fontFamily: 'DM Sans, sans-serif',
                }}
                title="Upload a photo of a barcode to scan it"
            >
                {state === 'scanning'
                    ? <Loader2 size={15} className="animate-spin flex-shrink-0" style={{ color: C.primary }} />
                    : <ImagePlus size={15} className="flex-shrink-0" style={{ color: labelColor }} />
                }
                <span>{label}</span>
            </button>

            {/* Image preview strip — only shown while scanning or result is fresh */}
            {preview && state !== 'idle' && (
                <div
                    className="relative rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                        height: 100,
                        backgroundColor: '#000',
                        border: `1px solid ${buttonBorder}`,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Barcode image preview"
                        className="max-h-full max-w-full object-contain"
                        style={{ opacity: state === 'scanning' ? 0.6 : 1, transition: 'opacity 0.2s' }}
                    />

                    {/* Scanning overlay */}
                    {state === 'scanning' && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                            <Loader2 size={24} className="animate-spin" style={{ color: C.accent }} />
                        </div>
                    )}

                    {/* Result overlay badge */}
                    {(state === 'found' || state === 'not_found' || state === 'error') && (
                        <div
                            className="absolute bottom-2 left-0 right-0 flex justify-center"
                        >
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{
                                    backgroundColor: labelColor,
                                    color: state === 'not_found' ? C.text : '#fff',
                                    fontFamily: 'DM Mono, monospace',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                }}
                            >
                                {state === 'found'
                                    ? `✓ ${lastBarcode}`
                                    : state === 'not_found'
                                        ? '⚠ No barcode detected'
                                        : '✕ Read error'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Tip text — only in idle state */}
            {state === 'idle' && (
                <p className="text-center text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                    Upload a product photo or screenshot — we&apos;ll extract the barcode
                </p>
            )}
        </div>
    )
}
