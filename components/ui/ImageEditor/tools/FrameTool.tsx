'use client'
// components/ui/ImageEditor/tools/FrameTool.tsx
// ─────────────────────────────────────────────────────────────
// Frame tool panel — options shown in the right panel when
// the Frame icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function FrameTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Frame tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Frame options coming soon.</p>
        </div>
    )
}
