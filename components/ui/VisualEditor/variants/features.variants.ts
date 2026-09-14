// components/ui/VisualEditor/variants/features.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Features / Trust Badges Bar — Variant Registry
// ─────────────────────────────────────────────────────────────────────────────

export interface FeatureVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

export const featureVariants: FeatureVariant[] = [
    // ── Variant 1: Simple Centered ────────────────────────────────────────────
    {
        id: 'simple-centered',
        label: 'Simple Centered',
        description: 'Centered icon and text features, elegant look.',
        toHtml(p: any, id: string): string {
            const iconColor = p.iconColor || '#7530fb';
            const features = (p.features || []).map((f: any) => `
                <td width="${100 / Math.max(p.features.length, 1)}%" style="text-align:center;padding:10px;">
                    <div style="font-size:24px;color:${iconColor};margin-bottom:8px;">${f.icon || '✓'}</div>
                    <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:${p.textColor || '#1e1535'};">${f.label}</div>
                </td>
            `).join('');

            return `<!--[riazify:features:${id}]-->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.bgColor || '#ffffff'};">
                <tr><td style="padding:${p.paddingTop || 20}px ${p.paddingLeft || 20}px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>${features}</tr>
                    </table>
                </td></tr>
            </table>
            <!--[/riazify:features:${id}]-->`;
        },
    },
    // ── Variant 2: Left + Badge (just to mirror the requested banner styles) ──
    {
        id: 'left-badge',
        label: 'Left + Badge',
        description: 'Left-aligned content with badge.',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:features:${id}]-->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.bgColor || '#ffffff'};">
                <tr><td style="padding:${p.paddingTop || 20}px ${p.paddingLeft || 20}px;">
                    <div style="font-weight:bold;">Left + Badge Feature style pending implementation</div>
                </td></tr>
            </table>
            <!--[/riazify:features:${id}]-->`;
        }
    }
];

export function getFeatureVariant(variantId: string): FeatureVariant {
    return featureVariants.find(v => v.id === variantId) ?? featureVariants[0];
}
