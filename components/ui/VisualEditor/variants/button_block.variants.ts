// components/ui/VisualEditor/variants/button_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Button Block — 10 layout variants (eBay Compliant)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

function wrap(id: string, inner: string, p: any): string {
    const align = p.align ?? 'center'
    const alignAttr = align === 'left' ? 'align="left"' : align === 'right' ? 'align="right"' : 'align="center"'
    const wrapperAlign = align === 'left' ? 'text-align:left;' : align === 'right' ? 'text-align:right;' : 'text-align:center;'
    const widthStyle = p.fullWidth ? 'width:100%;' : 'display:inline-block;'

    return `<!--[riazify:button_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.containerBg ?? 'transparent'};padding:12px 0;">
  <tr>
    <td style="${wrapperAlign}">
      <table cellpadding="0" cellspacing="0" border="0" ${alignAttr} style="${widthStyle}">
        <tr>
          <td>
            ${inner}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:button_block:${id}]-->`
}

export const buttonBlockVariants: BlockVariant[] = [

    // ── 1. Solid Primary ──────────────────────────────────────────────────────
    {
        id: 'button-solid',
        label: 'Solid Primary',
        description: 'Standard high-contrast button with solid background',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:${p.bgColor ?? '#7530fb'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 14}px ${p.paddingH ?? 28}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${p.label ?? 'Buy Now'}</a>`
            return wrap(id, inner, p)
        },
    },

    // ── 2. Outline / Ghost ────────────────────────────────────────────────────
    {
        id: 'button-outline',
        label: 'Outline / Ghost',
        description: 'Clean transparent button with a colored border',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:transparent;color:${p.bgColor ?? '#7530fb'};border:2px solid ${p.bgColor ?? '#7530fb'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${(p.paddingV ?? 14) - 2}px ${(p.paddingH ?? 28) - 2}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;">${p.label ?? 'View Details'}</a>`
            return wrap(id, inner, p)
        },
    },

    // ── 3. Rounded Pill ───────────────────────────────────────────────────────
    {
        id: 'button-rounded',
        label: 'Rounded Pill',
        description: 'Maximum border-radius for a soft, modern look',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:${p.bgColor ?? '#7530fb'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 14}px ${((p.paddingH ?? 28) + 10)}px;border-radius:50px;text-align:center;box-shadow:0 4px 12px rgba(117,48,251,0.25);">${p.label ?? 'Shop Collection'}</a>`
            return wrap(id, inner, p)
        },
    },

    // ── 4. Lifted Shadow ──────────────────────────────────────────────────────
    {
        id: 'button-shadow',
        label: 'Lifted Shadow',
        description: 'Solid button with prominent drop shadow for depth',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:${p.bgColor ?? '#7530fb'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 14}px ${p.paddingH ?? 28}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,0.18);">${p.label ?? 'Add to Cart'}</a>`
            return wrap(id, inner, p)
        },
    },

    // ── 5. Subtle Gradient ────────────────────────────────────────────────────
    {
        id: 'button-gradient',
        label: 'Subtle Gradient',
        description: 'Modern button with linear gradient background',
        toHtml(p: any, id: string): string {
            const bg1 = p.bgColor ?? '#7530fb'
            const bg2 = p.gradientTo ?? '#a855f7'
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background:linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%);background-color:${bg1};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 14}px ${p.paddingH ?? 28}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;box-shadow:0 4px 15px rgba(117,48,251,0.3);">${p.label ?? 'Special Offer'}</a>`
            return wrap(id, inner, p)
        },
    },

    // ── 6. Icon Left ──────────────────────────────────────────────────────────
    {
        id: 'button-icon-left',
        label: 'Icon + Text',
        description: 'Button featuring a leading icon for better engagement',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:${p.bgColor ?? '#7530fb'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 14}px ${p.paddingH ?? 28}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;vertical-align:middle;">
                    <span style="display:inline-block;margin-right:8px;font-size:${(p.fontSize ?? 16) + 2}px;vertical-align:middle;">🛒</span>
                    <span style="display:inline-block;vertical-align:middle;">${p.label ?? 'Buy It Now'}</span>
                  </td>
                </tr>
              </table>
            </a>`
            return wrap(id, inner, p)
        },
    },

    // ── 7. Icon Right ─────────────────────────────────────────────────────────
    {
        id: 'button-icon-right',
        label: 'Text + Icon',
        description: 'Button featuring a trailing arrow/icon',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:${p.bgColor ?? '#7530fb'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 14}px ${p.paddingH ?? 28}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;vertical-align:middle;">
                    <span style="display:inline-block;vertical-align:middle;margin-right:8px;">${p.label ?? 'Explore Store'}</span>
                    <span style="display:inline-block;font-size:${(p.fontSize ?? 16) + 2}px;vertical-align:middle;">➔</span>
                  </td>
                </tr>
              </table>
            </a>`
            return wrap(id, inner, p)
        },
    },

    // ── 8. Full-Width Fluid ───────────────────────────────────────────────────
    {
        id: 'button-full-width',
        label: 'Full-Width Fluid',
        description: 'Stretches across the full container width for mobile conversion',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;width:100%;background-color:${p.bgColor ?? '#7530fb'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '700'};text-decoration:none;padding:${p.paddingV ?? 16}px 0;border-radius:${p.borderRadius ?? 8}px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.12);">${p.label ?? 'Proceed to Checkout'}</a>`
            // Force fullWidth to true for this variant
            return wrap(id, inner, { ...p, fullWidth: true })
        },
    },

    // ── 9. Minimal Text Link ──────────────────────────────────────────────────
    {
        id: 'button-minimal',
        label: 'Minimal Text Link',
        description: 'Clean underlined text link functioning as a CTA',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:inline-block;color:${p.bgColor ?? '#7530fb'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 15}px;font-weight:${p.fontWeight ?? '700'};text-decoration:underline;padding:4px 8px;text-align:center;">${p.label ?? 'Learn More &rarr;'}</a>`
            return wrap(id, inner, p)
        },
    },

    // ── 10. Pulsing Alert ─────────────────────────────────────────────────────
    {
        id: 'button-pulse',
        label: 'Pulsing Alert',
        description: 'High-urgency solid button with subtle attention border',
        toHtml(p: any, id: string): string {
            const inner = `<a href="${p.url ?? '#'}" target="_blank" style="display:block;background-color:${p.bgColor ?? '#dc2626'};color:${p.textColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 16}px;font-weight:${p.fontWeight ?? '800'};text-decoration:none;padding:${p.paddingV ?? 14}px ${p.paddingH ?? 28}px;border-radius:${p.borderRadius ?? 8}px;text-align:center;border:2px solid #b91c1c;box-shadow:0 0 0 4px rgba(220,38,38,0.25);">${p.label ?? '⚡ Claim Deal Now'}</a>`
            return wrap(id, inner, p)
        },
    },
]

export function getButtonVariant(id: string): BlockVariant {
    return buttonBlockVariants.find(v => v.id === id) ?? buttonBlockVariants[0]
}
