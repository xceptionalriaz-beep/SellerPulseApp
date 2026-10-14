'use client'
// components/ui/ImageEditor/tools/FilterTool.tsx
// ─────────────────────────────────────────────────────────────
// Filter tool panel — options shown in the right panel when
// the Filter icon is selected in the left sidebar.
// ─────────────────────────────────────────────────────────────

import type { ToolPanelProps } from '../types'

export default function FilterTool({ state, onChange, imageUrl }: ToolPanelProps) {
    return (
        <div style={{ padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
            {/* TODO: build Filter tool options here */}
            <p style={{ fontSize: 12, color: '#9ca3af' }}>Filter options coming soon.</p>
        </div>
    )
}
