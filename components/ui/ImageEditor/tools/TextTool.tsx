'use client'
// components/ui/ImageEditor/tools/TextTool.tsx
// ─────────────────────────────────────────────────────────────
// Text tool panel — options shown in the right panel when
// the Text icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function TextTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Text tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Text options coming soon.</p>
        </div>
    )
}
