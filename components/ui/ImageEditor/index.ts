// components/ui/ImageEditor/index.ts
// ─────────────────────────────────────────────────────────────
// Public surface of the ImageEditor feature.
// Import everything you need from this barrel — never import
// directly from the internal files (ImageEditorModal, types, tools).
// ─────────────────────────────────────────────────────────────

// ── Main shell ────────────────────────────────────────────────
export { default as ImageEditorModal } from './ImageEditorModal'
export type { ImageEditorModalProps } from './ImageEditorModal'

// ── State & defaults ──────────────────────────────────────────
export { DEFAULT_STATE } from './types'

// ── Types (all public) ────────────────────────────────────────
export type {
    // Core
    ToolId,
    ImageEditorState,
    ToolPanelProps,
    HistoryEntry,

    // Per-tool setting shapes
    DrawMode,
    DrawSettings,
    TextOverlay,
    FrameStyle,
    FrameSettings,
    FilterPreset,
    CropRect,
    BackgroundSettings,
    WatermarkPosition,
    WatermarkSettings,
    ExportPreset,
    ExportFormat,
    ExportSettings,
} from './types'
