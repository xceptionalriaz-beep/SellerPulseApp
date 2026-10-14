'use client'
// components/ui/ImageEditor/tools/ResizeTool.tsx
// ─────────────────────────────────────────────────────────────
// Resize tool panel — options shown in the right panel when
// the Resize icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function ResizeTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Resize tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Resize options coming soon.</p>
        </div>
    )
}
