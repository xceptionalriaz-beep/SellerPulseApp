// components/ui/ImageEditor/types.ts
// ─────────────────────────────────────────────────────────────
// Shared types for the Image Editor modal and all tool panels.
// ─────────────────────────────────────────────────────────────

export type ToolId =
    | 'adjust'
    | 'filter'
    | 'crop'
    | 'resize'
    | 'rotate'
    | 'draw'
    | 'text'
    | 'frame'

// State passed between tools and the modal
export interface ImageEditorState {
    // Adjust
    brightness: number    // -100 → +100, default 0
    contrast:   number    // -100 → +100, default 0
    saturation: number    // -100 → +100, default 0
    sharpness:  number    //    0 → +100, default 0

    // Filter
    activeFilter: string  // e.g. 'none' | 'grayscale' | 'sepia' | ...

    // Rotate / flip
    rotation: number      // 0 | 90 | 180 | 270
    flipH:    boolean
    flipV:    boolean
}

export const DEFAULT_STATE: ImageEditorState = {
    brightness:   0,
    contrast:     0,
    saturation:   0,
    sharpness:    0,
    activeFilter: 'none',
    rotation:     0,
    flipH:        false,
    flipV:        false,
}

// Props every tool panel receives
export interface ToolPanelProps {
    state:    ImageEditorState
    onChange: (patch: Partial<ImageEditorState>) => void
    imageUrl: string
}
