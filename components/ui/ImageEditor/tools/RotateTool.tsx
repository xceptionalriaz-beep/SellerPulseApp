'use client'
// components/ui/ImageEditor/tools/RotateTool.tsx
// ─────────────────────────────────────────────────────────────
// Rotate tool panel — options shown in the right panel when
// the Rotate icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function RotateTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Rotate tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Rotate options coming soon.</p>
        </div>
    )
}
