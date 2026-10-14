'use client'
// components/ui/ImageEditor/tools/CropTool.tsx
// ─────────────────────────────────────────────────────────────
// Crop tool panel — options shown in the right panel when
// the Crop icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function CropTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Crop tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Crop options coming soon.</p>
        </div>
    )
}
