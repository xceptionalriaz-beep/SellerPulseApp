// components/ui/ImageEditor/types.ts
// ─────────────────────────────────────────────────────────────
// Shared types for the Image Editor modal and all tool panels.
// ─────────────────────────────────────────────────────────────

// ── Tool IDs ──────────────────────────────────────────────────
export type ToolId =
    | 'adjust'
    | 'filter'
    | 'crop'
    | 'resize'
    | 'rotate'
    | 'draw'
    | 'text'
    | 'frame'
    | 'background'
    | 'watermark'
    | 'export'

// ── Filter presets ────────────────────────────────────────────
export type FilterPreset =
    | 'none'
    | 'grayscale'
    | 'sepia'
    | 'invert'
    | 'vintage'
    | 'cool'
    | 'warm'
    | 'fade'
    | 'polaroid'
    | 'chrome'
    | 'kodachrome'
    | 'technicolor'
    | 'brownie'
    | 'noir'
    | 'vivid'
    | 'matte'
    | 'blueprint'
    | 'emboss'

// ── Crop state ────────────────────────────────────────────────
export interface CropRect {
    x: number   // 0–1 fraction of original width
    y: number   // 0–1 fraction of original height
    width: number   // 0–1 fraction
    height: number   // 0–1 fraction
}

// ── Draw tool ─────────────────────────────────────────────────
export type DrawMode = 'pen' | 'eraser'

export interface DrawSettings {
    mode: DrawMode
    color: string   // hex
    lineWidth: number   // px, 1–40
    opacity: number   // 0–1
}

// ── Text overlay ──────────────────────────────────────────────
export interface TextOverlay {
    id: string
    text: string
    x: number   // 0–1 fraction
    y: number   // 0–1 fraction
    fontSize: number   // px
    fontFamily: string
    color: string   // hex
    bold: boolean
    italic: boolean
    align: 'left' | 'center' | 'right'
}

// ── Frame/border ──────────────────────────────────────────────
export type FrameStyle =
    | 'none'
    | 'solid'
    | 'rounded'
    | 'shadow'
    | 'polaroid'
    | 'film'

export interface FrameSettings {
    style: FrameStyle
    color: string   // hex
    width: number   // px, 0–60
    borderRadius: number  // px, 0–40 (for 'rounded')
}

// ── Watermark ─────────────────────────────────────────────────
export type WatermarkPosition =
    | 'tl' | 'tc' | 'tr'
    | 'ml' | 'mc' | 'mr'
    | 'bl' | 'bc' | 'br'

export interface WatermarkSettings {
    enabled: boolean
    dataUrl: string | null    // uploaded logo as data URL
    position: WatermarkPosition
    opacity: number           // 0–1
    size: number           // 5–50, % of image width
    margin: number           // 4–40 px from edge
}

// ── Export ────────────────────────────────────────────────────
export type ExportPreset = 'ebay-standard' | 'ebay-minimum' | 'original' | 'custom'
export type ExportFormat = 'jpeg' | 'png'

export interface ExportSettings {
    preset: ExportPreset
    customWidth: number   // px, used when preset = 'custom'
    quality: number   // 0.6–1.0 (JPEG only)
    format: ExportFormat
}

// ── Background removal ────────────────────────────────────────
export interface BackgroundSettings {
    processedUrl: string | null  // data URL of transparent PNG after AI removal
    color: string         // CSS background-color for wrapper, default '#ffffff'
}

// ── Full editor state (all tools) ─────────────────────────────
export interface ImageEditorState {
    // ── Adjust ─────────────────────────────────────────────────
    brightness: number   // -100 → +100, default 0
    contrast: number   // -100 → +100, default 0
    saturation: number   // -100 → +100, default 0
    sharpness: number   //    0 → +100, default 0

    // ── Filter ─────────────────────────────────────────────────
    activeFilter: FilterPreset
    filterIntensity: number   // 0–100, how strongly preset applies

    // ── Filter adjustments ─────────────────────────────────────
    gamma: number   // 0.1–3.0, default 1
    vibrance: number   // -100–100, default 0
    hue: number   // -180–180, default 0
    blur: number   // 0–20px, default 0
    pixelate: number   // 0–50, default 0
    noise: number   // 0–100, default 0

    // ── Rotate / flip ──────────────────────────────────────────
    rotation: number    // 0 | 90 | 180 | 270
    flipH: boolean
    flipV: boolean

    // ── Crop ───────────────────────────────────────────────────
    crop: CropRect | null   // null = no crop applied
    aspectLock: string            // 'free'|'original'|'1:1'|'4:3'|'3:2'|'16:9'|'5:4'|'4:5'|'3:4'|'2:3'|'9:16'|'21:9'|'golden'|'custom'
    straighten: number            // -45 → +45 deg fine rotation, default 0
    cornerRadius: number            // 0 → 50px, default 0
    cropGrid: 'none' | 'thirds' | 'golden'  // overlay grid type

    // ── Resize ─────────────────────────────────────────────────
    resizeWidth: number | null    // px, null = original
    resizeHeight: number | null    // px, null = original
    resizeLockAR: boolean          // lock aspect ratio

    // ── Draw ───────────────────────────────────────────────────
    drawSettings: DrawSettings

    // ── Text overlays ──────────────────────────────────────────
    textOverlays: TextOverlay[]

    // ── Frame ──────────────────────────────────────────────────
    frame: FrameSettings

    // ── Background removal ─────────────────────────────────────
    background: BackgroundSettings

    // ── Watermark ──────────────────────────────────────────────
    watermark: WatermarkSettings

    // ── Export settings ────────────────────────────────────────
    exportSettings: ExportSettings
}

// ── Defaults ──────────────────────────────────────────────────
export const DEFAULT_STATE: ImageEditorState = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    activeFilter: 'none',
    filterIntensity: 100,
    gamma: 1,
    vibrance: 0,
    hue: 0,
    blur: 0,
    pixelate: 0,
    noise: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    crop: null,
    aspectLock: 'free',
    straighten: 0,
    cornerRadius: 0,
    cropGrid: 'none',
    resizeWidth: null,
    resizeHeight: null,
    resizeLockAR: true,
    drawSettings: {
        mode: 'pen',
        color: '#7530fb',
        lineWidth: 4,
        opacity: 1,
    },
    textOverlays: [],
    frame: {
        style: 'none',
        color: '#ffffff',
        width: 20,
        borderRadius: 12,
    },
    background: {
        processedUrl: null,
        color: '#ffffff',
    },
    watermark: {
        enabled: false,
        dataUrl: null,
        position: 'br',
        opacity: 0.75,
        size: 18,
        margin: 16,
    },
    exportSettings: {
        preset: 'ebay-standard',
        customWidth: 1600,
        quality: 0.92,
        format: 'jpeg',
    },
}

// ── Props every tool panel receives ───────────────────────────
export interface ToolPanelProps {
    state: ImageEditorState
    onChange: (patch: Partial<ImageEditorState>) => void
    imageUrl: string
}

// ── History entry (for undo/redo) ─────────────────────────────
export interface HistoryEntry {
    state: ImageEditorState
    timestamp: number
}
