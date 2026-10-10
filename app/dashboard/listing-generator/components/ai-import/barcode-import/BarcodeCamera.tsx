'use client'

// app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeCamera.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Barcode camera overlay component
// Uses the native BarcodeDetector API (Chrome 88+, Edge 88+, Android Chrome)
// Falls back gracefully to manual-entry-only mode on unsupported browsers
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, CameraOff, Loader2, ZoomIn, ZoomOut, SwitchCamera } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentDark: '#8abf1f',
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    text: '#1a1523',
    muted: '#6b7280',
    error: '#ef4444',
    errorLight: '#fef2f2',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    success: '#22c55e',
    successLight: '#f0fdf4',
} as const

// ── Types ─────────────────────────────────────────────────────────────────────
interface BarcodeCameraProps {
    onDetected: (barcode: string) => void   // called when a new barcode is scanned
    isActive: boolean                        // parent controls camera on/off
    onToggle: () => void                     // request parent to flip isActive
    className?: string
}

// BarcodeDetector is not yet in TypeScript lib — declare minimal types
declare global {
    interface Window {
        BarcodeDetector?: {
            new(options?: { formats?: string[] }): BarcodeDetectorInstance
            getSupportedFormats(): Promise<string[]>
        }
    }
}
interface BarcodeDetectorInstance {
    detect(source: HTMLVideoElement | ImageBitmap): Promise<Array<{
        rawValue: string
        format: string
        boundingBox: DOMRectReadOnly
    }>>
}

// EAN/UPC format strings recognised by BarcodeDetector
const BARCODE_FORMATS = [
    'ean_13', 'ean_8', 'upc_a', 'upc_e',
    'code_128', 'code_39', 'qr_code', 'itf', 'codabar',
]

// How long to suppress re-detection of the same barcode (ms)
const DEDUPE_MS = 2_500

// ── Component ─────────────────────────────────────────────────────────────────
export default function BarcodeCamera({
    onDetected,
    isActive,
    onToggle,
    className = '',
}: BarcodeCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const detectorRef = useRef<BarcodeDetectorInstance | null>(null)
    const rafRef = useRef<number>(0)
    const lastRef = useRef<{ value: string; at: number } | null>(null)

    const [supported, setSupported] = useState<boolean | null>(null) // null = checking
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
    const [cameraIdx, setCameraIdx] = useState(0)
    const [loading, setLoading] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [lastScan, setLastScan] = useState<string | null>(null)
    const [flashActive, setFlashActive] = useState(false)

    // ── Check BarcodeDetector support once ────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return
        const has = typeof window.BarcodeDetector !== 'undefined'
        setSupported(has)
        if (has) {
            void window.BarcodeDetector!.getSupportedFormats().then(fmts => {
                const intersection = BARCODE_FORMATS.filter(f => fmts.includes(f))
                detectorRef.current = new window.BarcodeDetector!({
                    formats: intersection.length ? intersection : BARCODE_FORMATS,
                })
            }).catch(() => {
                detectorRef.current = new window.BarcodeDetector!({
                    formats: BARCODE_FORMATS,
                })
            })
        }
    }, [])

    // ── List available cameras ─────────────────────────────────────────────────
    useEffect(() => {
        if (!supported) return
        navigator.mediaDevices.enumerateDevices().then(devices => {
            setCameras(devices.filter(d => d.kind === 'videoinput'))
        }).catch(() => { })
    }, [supported])

    // ── Start / stop camera stream ─────────────────────────────────────────────
    const stopStream = useCallback(() => {
        cancelAnimationFrame(rafRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        if (videoRef.current) videoRef.current.srcObject = null
    }, [])

    const startStream = useCallback(async (idx: number) => {
        stopStream()
        setLoading(true)
        setCameraError(null)
        try {
            const deviceId = cameras[idx]?.deviceId
            const constraints: MediaStreamConstraints = {
                video: {
                    ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } }),
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Camera access denied'
            if (msg.toLowerCase().includes('notallowed') || msg.toLowerCase().includes('permission')) {
                setCameraError('Camera permission denied — allow access in browser settings.')
            } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('devicenotfound')) {
                setCameraError('No camera found on this device.')
            } else {
                setCameraError(`Camera error: ${msg}`)
            }
        } finally {
            setLoading(false)
        }
    }, [cameras, stopStream])

    useEffect(() => {
        if (isActive && supported) {
            void startStream(cameraIdx)
        } else {
            stopStream()
        }
        return stopStream
    }, [isActive, supported, cameraIdx, startStream, stopStream])

    // ── Scan loop using requestAnimationFrame ──────────────────────────────────
    const scan = useCallback(async () => {
        if (!videoRef.current || !detectorRef.current) return
        const video = videoRef.current
        if (video.readyState < 2 || video.paused) return

        try {
            const results = await detectorRef.current.detect(video)
            for (const r of results) {
                const now = Date.now()
                const raw = r.rawValue.trim()
                if (!raw) continue
                // Deduplicate — skip if same barcode scanned within DEDUPE_MS
                if (lastRef.current && lastRef.current.value === raw && now - lastRef.current.at < DEDUPE_MS) continue
                lastRef.current = { value: raw, at: now }
                setLastScan(raw)
                // Flash animation
                setFlashActive(true)
                setTimeout(() => setFlashActive(false), 300)
                onDetected(raw)
                break // only handle one per frame
            }
        } catch {
            // detector errors are non-fatal — keep scanning
        }
    }, [onDetected])

    useEffect(() => {
        if (!isActive || !supported) return
        let running = true
        const loop = async () => {
            if (!running) return
            await scan()
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
        return () => { running = false; cancelAnimationFrame(rafRef.current) }
    }, [isActive, supported, scan])

    // ── Zoom (where supported) ────────────────────────────────────────────────
    const applyZoom = useCallback((level: number) => {
        const track = streamRef.current?.getVideoTracks()[0]
        if (!track) return
        const caps = track.getCapabilities() as MediaTrackCapabilities & { zoom?: { min: number; max: number; step: number } }
        if (!caps.zoom) return
        const clamped = Math.max(caps.zoom.min, Math.min(caps.zoom.max, level))
        void track.applyConstraints({ advanced: [{ zoom: clamped } as MediaTrackConstraintSet] })
        setZoom(clamped)
    }, [])

    // ── Switch camera ─────────────────────────────────────────────────────────
    const switchCamera = () => {
        if (cameras.length < 2) return
        setCameraIdx(i => (i + 1) % cameras.length)
    }

    // ── Not supported ─────────────────────────────────────────────────────────
    if (supported === false) {
        return (
            <div
                className={`rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
                style={{ backgroundColor: C.warningLight, border: `1px dashed ${C.warning}` }}
            >
                <CameraOff size={28} style={{ color: C.warning }} />
                <div>
                    <p className="font-semibold text-sm" style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}>
                        Camera scanner unavailable
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        BarcodeDetector API is not supported in this browser.
                        Use <strong>Chrome</strong> or <strong>Edge</strong> for camera scanning,
                        or type barcodes manually below.
                    </p>
                </div>
            </div>
        )
    }

    // ── Camera inactive (button to start) ─────────────────────────────────────
    if (!isActive) {
        return (
            <button
                onClick={onToggle}
                className={`w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-8 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${className}`}
                style={{
                    backgroundColor: C.primaryLight,
                    border: `2px dashed ${C.primary}`,
                }}
            >
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: C.primary }}
                >
                    <Camera size={22} color={C.accent} />
                </div>
                <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                        Start Camera Scanner
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        Point at any barcode to scan instantly
                    </p>
                </div>
            </button>
        )
    }

    // ── Camera active ─────────────────────────────────────────────────────────
    return (
        <div className={`relative rounded-2xl overflow-hidden ${className}`} style={{ background: '#000' }}>
            {/* Video feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: 240, maxHeight: 360 }}
            />

            {/* Hidden canvas for future frame capture if needed */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 size={28} className="animate-spin" style={{ color: C.accent }} />
                        <p className="text-xs" style={{ color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                            Starting camera…
                        </p>
                    </div>
                </div>
            )}

            {/* Error overlay */}
            {cameraError && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center"
                    style={{ background: 'rgba(0,0,0,0.85)' }}
                >
                    <CameraOff size={24} style={{ color: C.error }} />
                    <p className="text-xs" style={{ color: '#fff', fontFamily: 'DM Sans, sans-serif', maxWidth: 240 }}>
                        {cameraError}
                    </p>
                    <button
                        onClick={() => void startStream(cameraIdx)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Flash on scan */}
            {flashActive && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'rgba(184,250,51,0.35)', transition: 'opacity 0.3s' }}
                />
            )}

            {/* Aim guide */}
            {!loading && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className="w-48 h-32 rounded-xl"
                        style={{
                            border: `2px solid ${C.accent}`,
                            boxShadow: `0 0 0 4000px rgba(0,0,0,0.35)`,
                        }}
                    >
                        {/* Corner marks */}
                        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
                            <span
                                key={pos}
                                className="absolute w-4 h-4"
                                style={{
                                    top: pos.startsWith('t') ? -2 : undefined,
                                    bottom: pos.startsWith('b') ? -2 : undefined,
                                    left: pos.endsWith('l') ? -2 : undefined,
                                    right: pos.endsWith('r') ? -2 : undefined,
                                    borderTop: pos.startsWith('t') ? `3px solid ${C.accent}` : undefined,
                                    borderBottom: pos.startsWith('b') ? `3px solid ${C.accent}` : undefined,
                                    borderLeft: pos.endsWith('l') ? `3px solid ${C.accent}` : undefined,
                                    borderRight: pos.endsWith('r') ? `3px solid ${C.accent}` : undefined,
                                    borderRadius: pos === 'tl' ? '4px 0 0 0' : pos === 'tr' ? '0 4px 0 0' : pos === 'bl' ? '0 0 0 4px' : '0 0 4px 0',
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Last scan badge */}
            {lastScan && (
                <div
                    className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none"
                >
                    <div
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                            backgroundColor: C.accent,
                            color: C.text,
                            fontFamily: 'DM Mono, monospace',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    >
                        ✓ {lastScan}
                    </div>
                </div>
            )}

            {/* Controls bar */}
            <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
            >
                {/* Zoom controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => applyZoom(zoom - 0.5)}
                        disabled={zoom <= 1}
                        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                        title="Zoom out"
                    >
                        <ZoomOut size={13} color="#fff" />
                    </button>
                    <span className="text-[10px] px-1" style={{ color: '#fff', fontFamily: 'DM Mono, monospace' }}>
                        {zoom.toFixed(1)}×
                    </span>
                    <button
                        onClick={() => applyZoom(zoom + 0.5)}
                        disabled={zoom >= 5}
                        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                        title="Zoom in"
                    >
                        <ZoomIn size={13} color="#fff" />
                    </button>
                </div>

                {/* Stop / switch camera */}
                <div className="flex items-center gap-2">
                    {cameras.length > 1 && (
                        <button
                            onClick={switchCamera}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                            title="Switch camera"
                        >
                            <SwitchCamera size={13} color="#fff" />
                        </button>
                    )}
                    <button
                        onClick={onToggle}
                        className="px-3 py-1 rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Stop
                    </button>
                </div>
            </div>
        </div>
    )
}
