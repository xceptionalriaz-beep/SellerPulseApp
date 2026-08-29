// components/ui/VisualEditor/variants/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Variant system — shared types
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string                    // unique variant id e.g. 'gradient'
    label: string                 // shown in picker e.g. 'Gradient Banner'
    description: string           // tooltip
    toHtml: (props: any, id: string) => string  // renders this variant's HTML
}

export interface BlockVariantGroup {
    blockType: string
    variants: BlockVariant[]
}
