'use client'
// components/ui/ImageEditor/tools/DrawTool.tsx
// ─────────────────────────────────────────────────────────────
// Draw tool panel — options shown in the right panel when
// the Draw icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function DrawTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Draw tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Draw options coming soon.</p>
        </div>
    )
}
