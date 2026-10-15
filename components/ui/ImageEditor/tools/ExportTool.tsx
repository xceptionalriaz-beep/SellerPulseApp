'use client'
// components/ui/ImageEditor/tools/ExportTool.tsx

import React, { useState } from 'react'
import { Download, CheckCircle2 } from 'lucide-react'
import type { ToolPanelProps, ExportPreset, ExportFormat, ImageEditorState } from '../types'
import { SHAPE_DIMS, drawStickerOnCanvas } from '../stickerHelpers'

// ── Tokens ─────────────────────────────────────────────────────
const C = {
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder:'#c4a8fd',
    primaryHov:   '#6020e0',
    border:       '#ede9fe',
    borderMid:    '#e5e7eb',
    label:        '#111827',
    sub:          '#6b7280',
    muted:        '#9ca3af',
    surface:      '#ffffff',
    sectionBg:    '#fafafa',
    hover:        '#f3f4f6',
    accent:       '#b8fa33',
    success:      '#16a34a',
    successLight: '#f0fdf4',
    successBorder:'#86efac',
}

// ── Preset definitions ─────────────────────────────────────────
interface PresetDef {
    id:          ExportPreset
    label:       string
    sub:         string
    badge:       string
    badgeColor:  string
    longestPx:   number | null   // null = original
}
const PRESETS: PresetDef[] = [
    {
        id: 'ebay-standard',
        label: 'eBay Standard',
        sub: 'Recommended — best zoom quality',
        badge: '1600 px',
        badgeColor: C.primary,
        longestPx: 1600,
    },
    {
        id: 'ebay-minimum',
        label: 'eBay Minimum',
        sub: 'Smallest eBay-compliant size',
        badge: '500 px',
        badgeColor: '#f59e0b',
        longestPx: 500,
    },
    {
        id: 'original',
        label: 'Original Size',
        sub: 'No dimension changes',
        badge: '100%',
        badgeColor: C.sub,
        longestPx: null,
    },
    {
        id: 'custom',
        label: 'Custom Width',
        sub: 'Set your own pixel width',
        badge: 'Custom',
        badgeColor: '#0ea5e9',
        longestPx: null,
    },
]

// ── Section ────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, overflow: 'hidden', marginBottom: 10,
        }}>
            <div style={{
                padding: '9px 14px', background: C.sectionBg,
                borderBottom: `1px solid ${C.border}`,
                fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em',
            }}>
                {title}
            </div>
            <div style={{ padding: '12px 14px' }}>{children}</div>
        </div>
    )
}

// ── PresetCard ─────────────────────────────────────────────────
function PresetCard({ def, active, onClick }: {
    def: PresetDef; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '10px 12px', borderRadius: 9, marginBottom: 6,
                border: `1.5px solid ${active ? C.primary : hov ? C.borderMid : C.border}`,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.12s',
            }}
        >
            {/* Radio dot */}
            <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${active ? C.primary : C.borderMid}`,
                background: active ? C.primary : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
            </div>
            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: active ? C.primary : C.label }}>{def.label}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{def.sub}</div>
            </div>
            {/* Badge */}
            <div style={{
                fontSize: 10, fontWeight: 700, color: '#fff',
                background: def.badgeColor, padding: '2px 7px', borderRadius: 5, flexShrink: 0,
            }}>
                {def.badge}
            </div>
        </button>
    )
}

// ── Slider ─────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, display, onChange }: {
    label: string; value: number; min: number; max: number; step: number
    display: string; onChange: (v: number) => void
}) {
    const pct = ((value - min) / (max - min)) * 100
    return (
        <>
            <style>{`
                .exp-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block;}
                .exp-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;}
                .exp-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;cursor:pointer;}
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
                <span style={{
                    fontSize: 12, fontWeight: 700, color: C.primary,
                    background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                    fontVariantNumeric: 'tabular-nums',
                }}>{display}</span>
            </div>
            <input
                type="range" className="exp-slider"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{
                    background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${pct}%, ${C.borderMid} ${pct}%, ${C.borderMid} 100%)`,
                }}
            />
        </>
    )
}

// ── CSS filter string (mirrors modal logic) ────────────────────
function buildCssFilter(s: ImageEditorState): string {
    const PRESET_CSS: Record<string, string> = {
        none: '',
        grayscale:   'grayscale(100%)',
        sepia:       'sepia(90%)',
        vintage:     'sepia(50%) contrast(110%) brightness(88%) saturate(75%)',
        polaroid:    'contrast(115%) brightness(108%) saturate(75%) sepia(15%)',
        chrome:      'contrast(125%) saturate(160%) brightness(95%)',
        fade:        'contrast(88%) brightness(112%) saturate(70%)',
        kodachrome:  'contrast(120%) saturate(115%) hue-rotate(12deg) brightness(88%)',
        technicolor: 'saturate(155%) hue-rotate(-28deg) contrast(118%)',
        brownie:     'sepia(55%) saturate(45%) contrast(108%) brightness(92%)',
        noir:        'grayscale(100%) contrast(135%) brightness(75%)',
        vivid:       'saturate(185%) contrast(112%) brightness(102%)',
        matte:       'contrast(82%) brightness(115%) saturate(65%)',
        blueprint:   'sepia(100%) hue-rotate(185deg) saturate(210%)',
        cool:        'hue-rotate(195deg) saturate(125%) brightness(106%)',
        warm:        'hue-rotate(-22deg) saturate(135%) brightness(106%)',
        emboss:      'grayscale(100%) contrast(210%) brightness(108%)',
        invert:      'invert(100%)',
    }
    const parts: string[] = []
    const presetCss = PRESET_CSS[s.activeFilter] || ''
    if (presetCss) parts.push(presetCss)
    if (s.brightness !== 0) parts.push(`brightness(${(1 + s.brightness / 100).toFixed(3)})`)
    if (s.contrast   !== 0) parts.push(`contrast(${(1 + s.contrast   / 100).toFixed(3)})`)
    if (s.saturation !== 0) parts.push(`saturate(${Math.max(0, 1 + s.saturation / 100).toFixed(3)})`)
    if (s.sharpness && s.sharpness > 0) parts.push(`contrast(${(1 + s.sharpness * 0.004).toFixed(3)})`)
    const gamma    = s.gamma    ?? 1
    const vibrance = s.vibrance ?? 0
    const hue      = s.hue      ?? 0
    const blur     = s.blur     ?? 0
    if (gamma    !== 1) parts.push(`brightness(${(gamma * 0.7 + 0.3).toFixed(3)})`)
    if (vibrance !== 0) parts.push(`saturate(${Math.max(0, 1 + vibrance / 80).toFixed(3)})`)
    if (hue      !== 0) parts.push(`hue-rotate(${hue}deg)`)
    if (blur      > 0)  parts.push(`blur(${blur}px)`)
    return parts.length ? parts.join(' ') : 'none'
}

// ── Export canvas helper ───────────────────────────────────────
async function exportToCanvas(
    imageUrl: string,
    state:    ImageEditorState,
    targetW:  number | null,   // null = keep natural width
): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = async () => {
            const natW = img.naturalWidth
            const natH = img.naturalHeight
            const natAR = natW / natH

            // ── Crop ──────────────────────────────────────────
            let sx = 0, sy = 0, sw = natW, sh = natH
            if (state.crop) {
                sx = state.crop.x      * natW
                sy = state.crop.y      * natH
                sw = state.crop.width  * natW
                sh = state.crop.height * natH
            }

            // Aspect ratio of cropped region
            const croppedAR = sw / sh

            // ── Output dimensions ──────────────────────────────
            let outW: number, outH: number
            if (targetW) {
                outW = targetW
                outH = Math.round(targetW / croppedAR)
            } else {
                outW = sw
                outH = sh
            }

            // ── Rotation — swap dimensions if 90/270 ──────────
            const rot = state.rotation % 360
            const isRotated90 = rot === 90 || rot === 270
            const canvasW = isRotated90 ? outH : outW
            const canvasH = isRotated90 ? outW : outH

            const canvas = document.createElement('canvas')
            canvas.width  = canvasW
            canvas.height = canvasH
            const ctx = canvas.getContext('2d')!

            // ── Background color (if BG was removed) ──────────
            if (state.background?.processedUrl) {
                ctx.fillStyle = state.background.color ?? '#ffffff'
                ctx.fillRect(0, 0, canvasW, canvasH)
            }

            // ── Apply CSS filter ───────────────────────────────
            const filterStr = buildCssFilter(state)
            if (filterStr !== 'none') ctx.filter = filterStr

            // ── Rotation + flip transform ──────────────────────
            const straight = state.straighten ?? 0
            const totalRot = rot + straight
            ctx.save()
            ctx.translate(canvasW / 2, canvasH / 2)
            if (totalRot) ctx.rotate(totalRot * Math.PI / 180)
            if (state.flipH) ctx.scale(-1, 1)
            if (state.flipV) ctx.scale(1, -1)

            // Draw image (crop applied via sx/sy/sw/sh)
            ctx.drawImage(img, sx, sy, sw, sh, -outW / 2, -outH / 2, outW, outH)
            ctx.restore()

            // ── Watermark then stickers (sequential async) ─────
            const drawStickers = async () => {
                const stickers = state.stickers ?? []
                for (const s of stickers) {
                    const dims     = SHAPE_DIMS[s.shape]
                    const baseW    = canvasW * 0.15   // 15% of canvas width at scale=1
                    const displayW = baseW * s.scale
                    const displayH = displayW * (dims.h / dims.w)
                    const cx       = s.x * canvasW
                    const cy       = s.y * canvasH
                    await drawStickerOnCanvas(ctx, s, cx, cy, displayW, displayH)
                }
                resolve(canvas)
            }

            const wm = state.watermark
            if (wm?.enabled && wm.dataUrl) {
                const wmImg = new Image()
                wmImg.onload = async () => {
                    const wmW   = Math.round(canvasW * (wm.size / 100))
                    const wmH   = Math.round(wmW * (wmImg.naturalHeight / wmImg.naturalWidth))
                    const mg    = wm.margin
                    const pos   = wm.position ?? 'br'

                    // Position lookup
                    const col = pos[1] === 'l' ? mg : pos[1] === 'r' ? canvasW - wmW - mg : (canvasW - wmW) / 2
                    const row = pos[0] === 't' ? mg : pos[0] === 'b' ? canvasH - wmH - mg : (canvasH - wmH) / 2

                    ctx.globalAlpha = wm.opacity
                    ctx.drawImage(wmImg, col, row, wmW, wmH)
                    ctx.globalAlpha = 1
                    await drawStickers()
                }
                wmImg.onerror = async () => { await drawStickers() }
                wmImg.src = wm.dataUrl
            } else {
                await drawStickers()
            }
        }

        img.onerror = reject
        img.src = imageUrl
    })
}

// ── ExportTool ─────────────────────────────────────────────────
export default function ExportTool({ state, onChange, imageUrl }: ToolPanelProps) {
    const [exporting, setExporting] = useState(false)
    const [done, setDone]           = useState(false)
    const [hovBtn, setHovBtn]       = useState(false)

    const xs = state.exportSettings ?? {
        preset: 'ebay-standard' as ExportPreset,
        customWidth: 1600,
        quality: 0.92,
        format: 'jpeg' as ExportFormat,
    }
    const { preset, customWidth, quality, format } = xs

    function patch(p: Partial<typeof xs>) {
        onChange({ exportSettings: { ...xs, ...p } })
    }

    function targetWidth(): number | null {
        const def = PRESETS.find(p => p.id === preset)!
        if (def.longestPx !== null) return def.longestPx
        if (preset === 'custom')   return customWidth
        return null  // original
    }

    async function handleDownload() {
        setExporting(true)
        setDone(false)
        try {
            const src    = state.background?.processedUrl ?? imageUrl
            const tw     = targetWidth()
            const canvas = await exportToCanvas(src, state, tw)
            const mime   = format === 'png' ? 'image/png' : 'image/jpeg'
            const q      = format === 'jpeg' ? quality : undefined

            canvas.toBlob(blob => {
                if (!blob) { setExporting(false); return }
                const url  = URL.createObjectURL(blob)
                const a    = document.createElement('a')
                a.href     = url
                a.download = `edited-${preset}-${Date.now()}.${format}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                setTimeout(() => URL.revokeObjectURL(url), 5000)
                setExporting(false)
                setDone(true)
                setTimeout(() => setDone(false), 3000)
            }, mime, q)
        } catch (err) {
            console.error('[ExportTool]', err)
            setExporting(false)
        }
    }

    return (
        <div style={{ padding: '16px 14px' }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Export / Download</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>
                    Download your edited image with watermark baked in.
                </div>
            </div>

            {/* eBay info */}
            <div style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 14,
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                fontSize: 11, color: C.sub, lineHeight: 1.6,
            }}>
                <strong style={{ color: C.primary }}>eBay rules:</strong> min 500px, recommended
                1600px on longest side. JPEG preferred, under 12 MB.
            </div>

            {/* Presets */}
            <Section title="SIZE PRESET">
                {PRESETS.map(def => (
                    <PresetCard
                        key={def.id}
                        def={def}
                        active={preset === def.id}
                        onClick={() => patch({ preset: def.id })}
                    />
                ))}

                {/* Custom width input */}
                {preset === 'custom' && (
                    <div style={{
                        marginTop: 8, padding: '10px 12px', borderRadius: 8,
                        background: C.sectionBg, border: `1px solid ${C.borderMid}`,
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Width (pixels)</div>
                            <input
                                type="number" min={100} max={8000} step={50}
                                value={customWidth}
                                onChange={e => {
                                    const v = parseInt(e.target.value) || 1600
                                    patch({ customWidth: Math.min(8000, Math.max(100, v)) })
                                }}
                                style={{
                                    width: '100%', padding: '6px 8px',
                                    border: `1px solid ${C.borderMid}`, borderRadius: 6,
                                    fontSize: 13, fontWeight: 600, color: C.label,
                                    background: C.surface, outline: 'none',
                                    fontVariantNumeric: 'tabular-nums',
                                    boxSizing: 'border-box' as const,
                                }}
                            />
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>px wide</div>
                    </div>
                )}
            </Section>

            {/* Format */}
            <Section title="FORMAT">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['jpeg', 'png'] as ExportFormat[]).map(f => {
                        const active = format === f
                        return (
                            <button
                                key={f}
                                onClick={() => patch({ format: f })}
                                style={{
                                    padding: '8px 10px', cursor: 'pointer',
                                    border: `1.5px solid ${active ? C.primary : C.borderMid}`,
                                    borderRadius: 8, background: active ? C.primaryLight : C.surface,
                                    color: active ? C.primary : C.sub,
                                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                                    transition: 'all 0.12s',
                                }}
                            >
                                {f.toUpperCase()}
                                <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, textTransform: 'none', color: C.muted }}>
                                    {f === 'jpeg' ? 'Smaller file, eBay-preferred' : 'Transparency support'}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </Section>

            {/* Quality (JPEG only) */}
            {format === 'jpeg' && (
                <Section title="JPEG QUALITY">
                    <Slider
                        label="Compression quality"
                        value={Math.round(quality * 100)} min={60} max={100} step={1}
                        display={`${Math.round(quality * 100)}%`}
                        onChange={v => patch({ quality: v / 100 })}
                    />
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                        92% is the sweet spot — sharp image, small file.
                        Above 95% gives diminishing returns for eBay.
                    </div>
                </Section>
            )}

            {/* Summary card */}
            <div style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 14,
                background: C.sectionBg, border: `1px solid ${C.borderMid}`,
                display: 'flex', alignItems: 'center', gap: 10,
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Export summary</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.label }}>
                        {preset === 'custom'
                            ? `${customWidth}px wide`
                            : PRESETS.find(p => p.id === preset)?.badge + ' longest side'}
                        {' · '}
                        {format.toUpperCase()}
                        {format === 'jpeg' ? ` @ ${Math.round(quality * 100)}%` : ''}
                    </div>
                </div>
                {(state.watermark?.enabled && state.watermark?.dataUrl) && (
                    <div style={{
                        fontSize: 9, fontWeight: 700, color: '#fff',
                        background: '#7530fb', padding: '2px 6px', borderRadius: 4,
                        flexShrink: 0,
                    }}>WATERMARK</div>
                )}
                {(state.stickers ?? []).length > 0 && (
                    <div style={{
                        fontSize: 9, fontWeight: 700, color: '#1c1917',
                        background: '#b8fa33', padding: '2px 6px', borderRadius: 4,
                        flexShrink: 0,
                    }}>{(state.stickers ?? []).length} STICKER{(state.stickers ?? []).length > 1 ? 'S' : ''}</div>
                )}
            </div>

            {/* Download button */}
            {done ? (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 16px', borderRadius: 10,
                    background: C.successLight, border: `1px solid ${C.successBorder}`,
                    fontSize: 13, fontWeight: 700, color: C.success,
                }}>
                    <CheckCircle2 size={17} />
                    Download complete!
                </div>
            ) : (
                <button
                    onClick={handleDownload}
                    disabled={exporting}
                    onMouseEnter={() => setHovBtn(true)}
                    onMouseLeave={() => setHovBtn(false)}
                    style={{
                        width: '100%', padding: '13px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        border: 'none', borderRadius: 10,
                        cursor: exporting ? 'not-allowed' : 'pointer',
                        background: exporting ? C.muted : hovBtn ? C.primaryHov : C.primary,
                        color: '#ffffff',
                        fontSize: 14, fontWeight: 700,
                        transition: 'background 0.15s',
                        boxShadow: !exporting ? '0 4px 16px rgba(117,48,251,0.3)' : 'none',
                    }}
                >
                    {exporting ? (
                        <>
                            <SpinnerIcon />
                            Preparing download…
                        </>
                    ) : (
                        <>
                            <Download size={16} strokeWidth={2.5} />
                            Download Image
                        </>
                    )}
                </button>
            )}

            {/* eBay tip */}
            <div style={{
                padding: '10px 12px', borderRadius: 8, marginTop: 10,
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                fontSize: 11, color: C.sub, lineHeight: 1.5,
            }}>
                <strong style={{ color: C.primary }}>Tip:</strong> All edits — filters, crop,
                rotation, and watermark — are baked into the downloaded file. The original
                is never modified.
            </div>
        </div>
    )
}

// ── Spinner ────────────────────────────────────────────────────
function SpinnerIcon() {
    return (
        <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'exp-spin 0.8s linear infinite' }}
        >
            <style>{`@keyframes exp-spin { to { transform: rotate(360deg) } }`}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
