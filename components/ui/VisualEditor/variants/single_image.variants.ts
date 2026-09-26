// components/ui/VisualEditor/variants/single_image.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single Image — 6 layout variants
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
    return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 24}px;`
}

function bg(p: any): string {
    return p.bgColor ?? '#ffffff'
}

function accent(p: any): string {
    return p.accentColor ?? '#7530fb'
}

function caption(p: any): string {
    return p.caption ?? '{{PRODUCT_TITLE}}'
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — classic-frame
// Clean framed card: 1px border, soft bg, centered caption
// ─────────────────────────────────────────────────────────────────────────────
function classicFrame(p: any, id: string): string {
    return `
<!--[riazify:single_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background-color:#ffffff;">
        <tr>
          <td style="padding:12px;text-align:center;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              style="width:100%;height:auto;display:block;border-radius:4px;" />
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 12px;text-align:center;border-top:1px solid #f3f4f6;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;font-style:italic;">${caption(p)}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — modern-elevated
// Floating shadow box: no border, deep shadow, smooth radius
// ─────────────────────────────────────────────────────────────────────────────
function modernElevated(p: any, id: string): string {
    return `
<!--[riazify:single_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.08);">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          style="width:100%;height:auto;display:block;" />
      </div>
      <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;font-style:italic;">${caption(p)}</p>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — polaroid-classic
// White card, extra bottom padding, badge caption in white space
// ─────────────────────────────────────────────────────────────────────────────
function polaroidClassic(p: any, id: string): string {
    return `
<!--[riazify:single_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"
        style="background-color:#ffffff;border-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.06);display:inline-table;max-width:560px;width:100%;">
        <tr>
          <td style="padding:10px 10px 0;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              style="width:100%;height:auto;display:block;border-radius:2px;" />
          </td>
        </tr>
        <tr>
          <td style="padding:16px 10px 20px;text-align:center;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#374151;">${caption(p)}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — edge-to-edge
// Full-width bleed: image stretches edge to edge, gradient overlay + text
// ─────────────────────────────────────────────────────────────────────────────
function edgeToEdge(p: any, id: string): string {
    return `
<!--[riazify:single_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="padding:0;text-align:center;position:relative;">
      <div style="position:relative;display:inline-block;width:100%;line-height:0;">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          style="width:100%;height:auto;display:block;" />
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 60%);padding:28px 20px 16px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-shadow:0 1px 3px rgba(0,0,0,0.4);">${caption(p)}</p>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — neon-accent-frame
// Dark bg, glowing accent gradient border, premium tech look
// ─────────────────────────────────────────────────────────────────────────────
function neonAccentFrame(p: any, id: string): string {
    const ac = accent(p)
    return `
<!--[riazify:single_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:#1e1535;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"
        style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);border-radius:12px;padding:2px;display:inline-table;max-width:600px;width:100%;">
        <tr>
          <td style="background-color:#0f0b1e;border-radius:10px;padding:10px;text-align:center;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              style="width:100%;height:auto;display:block;border-radius:6px;" />
          </td>
        </tr>
      </table>
      <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.5);font-style:italic;">${caption(p)}</p>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — soft-minimalist
// Ultra-clean: heavy border-radius, inset shadow, zero distraction
// ─────────────────────────────────────────────────────────────────────────────
function softMinimalist(p: any, id: string): string {
    return `
<!--[riazify:single_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:580px;border-radius:24px;overflow:hidden;border:1.5px solid #ede9fe;box-shadow:inset 0 1px 3px rgba(117,48,251,0.06),0 2px 12px rgba(0,0,0,0.06);">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          style="width:100%;height:auto;display:block;" />
      </div>
      <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;">${caption(p)}</p>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const singleImageVariants: BlockVariant[] = [
    {
        id: 'classic-frame',
        label: 'Classic Frame',
        description: 'Clean 1px border with centered caption below',
        toHtml(props, id) { return classicFrame(props, id) },
    },
    {
        id: 'modern-elevated',
        label: 'Modern Elevated',
        description: 'Floating shadow with no border — image pops off the page',
        toHtml(props, id) { return modernElevated(props, id) },
    },
    {
        id: 'polaroid-classic',
        label: 'Polaroid Classic',
        description: 'White card with extra bottom padding and styled caption',
        toHtml(props, id) { return polaroidClassic(props, id) },
    },
    {
        id: 'edge-to-edge',
        label: 'Edge-to-Edge Banner',
        description: 'Full-width bleed with gradient overlay and caption on image',
        toHtml(props, id) { return edgeToEdge(props, id) },
    },
    {
        id: 'neon-accent-frame',
        label: 'Neon Accent Frame',
        description: 'Dark background with glowing gradient border',
        toHtml(props, id) { return neonAccentFrame(props, id) },
    },
    {
        id: 'soft-minimalist',
        label: 'Soft Minimalist',
        description: 'Heavy rounded corners, inset shadow, clean focus on image',
        toHtml(props, id) { return softMinimalist(props, id) },
    },
]

export function getSingleImageVariant(id: string): BlockVariant {
    return singleImageVariants.find(v => v.id === id) ?? singleImageVariants[0]
}
