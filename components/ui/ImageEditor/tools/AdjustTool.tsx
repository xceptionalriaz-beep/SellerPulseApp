'use client'
// components/ui/ImageEditor/tools/AdjustTool.tsx
// ─────────────────────────────────────────────────────────────
// Adjust tool panel — options shown in the right panel when
// the Adjust icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function AdjustTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Adjust tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Adjust options coming soon.</p>
        </div>
    )
}
