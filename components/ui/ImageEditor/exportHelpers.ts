// components/ui/ImageEditor/exportHelpers.ts
// Shared canvas-export logic used by both ExportTool and the Save button.

import type { ImageEditorState } from './types'
import { SHAPE_DIMS, drawStickerOnCanvas } from './stickerHelpers'

// ── CSS filter string ──────────────────────────────────────────
export function buildCssFilter(s: ImageEditorState): string {
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

// ── Load image safely (fetch → blob URL avoids canvas taint) ──
async function loadImageSafe(imageUrl: string): Promise<HTMLImageElement> {
    // Try fetch first → blob URL is same-origin, never taints canvas
    let src = imageUrl
    let blobUrl: string | null = null
    try {
        const resp = await fetch(imageUrl, { mode: 'cors', cache: 'force-cache' })
        if (resp.ok) {
            const blob = await resp.blob()
            blobUrl = URL.createObjectURL(blob)
            src = blobUrl
        }
    } catch {
        // fetch failed (network or CORS); fall back to direct load
    }

    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        if (!blobUrl) img.crossOrigin = 'anonymous'
        img.onload  = () => { resolve(img) }
        img.onerror = () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl)
            // Last resort: try without crossOrigin (canvas may be tainted,
            // but at least the image loads so we can still draw)
            if (!blobUrl && img.crossOrigin) {
                const img2 = new Image()
                img2.onload  = () => resolve(img2)
                img2.onerror = () => reject(new Error(`Image load failed: ${imageUrl}`))
                img2.src = imageUrl
            } else {
                reject(new Error(`Image load failed: ${imageUrl}`))
            }
        }
        img.src = src
    })
}

// ── Export to canvas (bakes crop, rotation, filters, watermark, stickers) ──
export async function exportToCanvas(
    imageUrl: string,
    state:    ImageEditorState,
    targetW:  number | null,   // null = keep natural width
): Promise<HTMLCanvasElement> {
    const img = await loadImageSafe(imageUrl)

    return new Promise((resolve, reject) => {
        const run = async () => {
            const natW = img.naturalWidth
            const natH = img.naturalHeight

            // ── Crop ──────────────────────────────────────────
            let sx = 0, sy = 0, sw = natW, sh = natH
            if (state.crop) {
                sx = state.crop.x      * natW
                sy = state.crop.y      * natH
                sw = state.crop.width  * natW
                sh = state.crop.height * natH
            }

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
                    const baseW    = canvasW * 0.15
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
                    const wmW = Math.round(canvasW * (wm.size / 100))
                    const wmH = Math.round(wmW * (wmImg.naturalHeight / wmImg.naturalWidth))
                    const mg  = wm.margin
                    const pos = wm.position ?? 'br'
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

        run().catch(reject)
    })
}

// ── Convenience: export to data URL ───────────────────────────
export async function exportToDataUrl(
    imageUrl: string,
    state:    ImageEditorState,
    targetW:  number | null = 1600,
    format:   'jpeg' | 'png' = 'jpeg',
    quality:  number = 0.92,
): Promise<string> {
    const canvas = await exportToCanvas(imageUrl, state, targetW)
    return new Promise((resolve, reject) => {
        const mime = format === 'png' ? 'image/png' : 'image/jpeg'
        const q    = format === 'jpeg' ? quality : undefined
        canvas.toBlob(blob => {
            if (!blob) { reject(new Error('toBlob returned null')); return }
            const reader = new FileReader()
            reader.onload  = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        }, mime, q)
    })
}
