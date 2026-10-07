// components/ui/VisualEditor/variants/product_variants.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Variants — 10 layout variants (Toolbar Alignment Supported, Curve-Free)
//
// Every variant shares the same ProductVariantsProps — sellers never
// re-type their content when switching layout.
//
// Variants solve specific eBay seller problems:
//   swatches-sizes    → Default stacked layout (colour circles + size pills)
//   inline-compact    → Space-saving single-row layout
//   labelled-swatches → Each swatch with colour name below (fashion/fabric)
//   pill-only         → All text pills, no circles (electronics/storage)
//   card-grid         → Each option in a bordered card (premium retail)
//   accent-selected   → Pre-selected highlight state (high-conversion)
//   dark-selector     → Dark background panel (luxury/streetwear)
//   side-by-side      → Colours + sizes in two columns
//   availability-grid → Size grid with stock status indicators
//   spec-badges       → Summary icon+value badges (variety signals)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 24}px;`
}

function getAlign(p: any): 'left' | 'center' | 'right' {
  const a = String(p.textAlign ?? p.align ?? p.alignment ?? p.titleAlign ?? 'left').toLowerCase().trim()
  if (a === 'center' || a === 'middle') return 'center'
  if (a === 'right') return 'right'
  return 'left'
}

function tableMargin(align: string): string {
  if (align === 'center') return 'margin:0 auto;'
  if (align === 'right') return 'margin:0 0 0 auto;'
  return 'margin:0 auto 0 0;'
}

function label(text: string, color: string, weight = '700', align: string = 'left'): string {
  return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:${weight};color:${color};text-align:${align};">${text}</p>`
}

function swatch(color: string, shape: string, size: number, border: string): string {
  const radius = shape === 'square' ? '0px' : '50%'
  const isLight = isLightColor(color)
  const borderCol = isLight ? '#9ca3af' : border
  return `<td style="padding:3px;"><span style="display:inline-block;width:${size}px;height:${size}px;background-color:${color};border-radius:${radius};border:2px solid ${borderCol};"></span></td>`
}

function sizePill(text: string, style: string, accentColor: string, textColor: string, selected = false): string {
  if (style === 'filled') {
    const bg = selected ? accentColor : '#f3f4f6'
    const col = selected ? '#ffffff' : textColor
    const border = selected ? accentColor : '#e5e7eb'
    return `<td style="padding:3px;"><span style="display:inline-block;padding:5px 12px;border:1px solid ${border};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:${selected ? '700' : '400'};color:${col};background-color:${bg};">${text}</span></td>`
  }
  // outlined (default) — border-radius removed
  const border = selected ? accentColor : '#ede9fe'
  const col = selected ? accentColor : textColor
  const bg = selected ? accentColor + '14' : 'transparent'
  return `<td style="padding:3px;"><span style="display:inline-block;padding:5px 12px;border:2px solid ${border};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:${selected ? '700' : '400'};color:${col};background-color:${bg};">${text}</span></td>`
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length < 6) return false
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 180
}

function getColors(p: any): string[] {
  return [
    p.color1 ?? '#ef4444',
    p.color2 ?? '#3b82f6',
    p.color3 ?? '#22c55e',
    p.color4 ?? '#f59e0b',
    p.color5 ?? '#000000',
    p.color6 ?? '#ffffff',
  ].filter((_, i) => i < (p.colorCount ?? 6))
}

function getColorNames(p: any): string[] {
  return [
    p.colorName1 ?? 'Red',
    p.colorName2 ?? 'Blue',
    p.colorName3 ?? 'Green',
    p.colorName4 ?? 'Amber',
    p.colorName5 ?? 'Black',
    p.colorName6 ?? 'White',
  ].filter((_, i) => i < (p.colorCount ?? 6))
}

function getSizes(p: any): string[] {
  const raw = p.sizesText ?? 'XS,S,M,L,XL,XXL'
  return raw.split(',').map((s: string) => s.trim()).filter(Boolean)
}

// ── Variant 1: swatches-sizes (default) ──────────────────────────────────────

const swatchesSizes: BlockVariant = {
  id: 'swatches-sizes',
  label: 'Swatches + Sizes',
  description: 'Colour circles above, size pills below — centered or aligned with toolbar',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const sizes = getSizes(p)
    const shape = p.swatchShape ?? 'circle'
    const swatchSize = p.swatchSize ?? 24
    const pillStyle = p.pillStyle ?? 'outlined'
    const accent = p.accentColor ?? '#7530fb'
    const labelCol = p.labelColor ?? '#1e1535'
    const textCol = p.textColor ?? '#1f1d2e'
    const swatchCells = colors.map(c => swatch(c, shape, swatchSize, p.swatchBorderColor ?? '#e5e7eb')).join('')
    const sizeCells = sizes.map(s => sizePill(s, pillStyle, accent, textCol)).join('')

    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colours:', labelCol, '700', align) : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${swatchCells}</tr>
        </table>
      </div>
    </div>

    <!-- Size Section (Always on a new row under Colours) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      ${p.showSizeLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};text-align:${align};clear:both;">${p.sizeLabel ?? 'Sizes:'}</p>` : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${sizeCells}</tr>
        </table>
      </div>
    </div>
  </td></tr>
</table>`
  }
}
// ── Variant 2: inline-compact (Toolbar Align + Mobile Stacking) ───────────────

const inlineCompact: BlockVariant = {
  id: 'inline-compact',
  label: 'Inline Compact',
  description: 'Colours and sizes on one horizontal row — aligns with toolbar',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const sizes = getSizes(p)
    const shape = p.swatchShape ?? 'circle'
    const swatchSize = p.swatchSize ?? 20
    const accent = p.accentColor ?? '#7530fb'
    const labelCol = p.labelColor ?? '#1e1535'
    const textCol = p.textColor ?? '#1f1d2e'
    const swatchCells = colors.map(c => swatch(c, shape, swatchSize, p.swatchBorderColor ?? '#e5e7eb')).join('')
    const sizeCells = sizes.map(s => sizePill(s, p.pillStyle ?? 'outlined', accent, textCol)).join('')

    const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pv-ic-row-${id} { display: block !important; width: 100% !important; text-align: ${align} !important; }
  .pv-ic-col-${id} { display: block !important; width: 100% !important; margin-bottom: 8px !important; text-align: ${align} !important; }
  .pv-ic-div-${id} { display: none !important; }
}
</style>`

    return `<!--[riazify:product_variants:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:${align};">
    <table cellpadding="0" cellspacing="0" border="0" align="${align}" style="display:inline-table;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : ''}">
      <tr class="pv-ic-row-${id}">
        <td class="pv-ic-col-${id}" style="white-space:nowrap;vertical-align:middle;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${labelCol};margin-right:6px;">${p.colourLabel ?? 'Colour:'}</span>
          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;"><tr>${swatchCells}</tr></table>
        </td>
        <td class="pv-ic-div-${id}" style="width:20px;text-align:center;vertical-align:middle;color:#d1d5db;font-size:16px;">|</td>
        <td class="pv-ic-col-${id}" style="white-space:nowrap;vertical-align:middle;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${labelCol};margin-right:6px;">${p.sizeLabel ?? 'Size:'}</span>
          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;"><tr>${sizeCells}</tr></table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`
  }
}

// ── Variant 3: labelled-swatches ──────────────────────────────────────────────

const labelledSwatches: BlockVariant = {
  id: 'labelled-swatches',
  label: 'Labelled Swatches',
  description: 'Each swatch has colour name below — aligns with toolbar',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const names = getColorNames(p)
    const shape = p.swatchShape ?? 'circle'
    const swatchSize = p.swatchSize ?? 28
    const labelCol = p.labelColor ?? '#1e1535'
    const textCol = p.textColor ?? '#6b7280'
    const swatchCells = colors.map((c, i) => `
      <td style="padding:4px 8px;text-align:center;vertical-align:top;">
        <span style="display:block;width:${swatchSize}px;height:${swatchSize}px;background-color:${c};border-radius:${shape === 'square' ? '0px' : '50%'};border:2px solid ${isLightColor(c) ? '#9ca3af' : '#e5e7eb'};margin:0 auto 4px;"></span>
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${textCol};white-space:nowrap;">${names[i] ?? ''}</span>
      </td>`).join('')
    const sizes = getSizes(p)
    const sizeCells = sizes.map(s => sizePill(s, p.pillStyle ?? 'outlined', p.accentColor ?? '#7530fb', textCol)).join('')
    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Choose Colour:', labelCol, '700', align) : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${swatchCells}</tr>
        </table>
      </div>
    </div>

    <!-- Size Section (Always on a new row under Colours) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      ${p.showSizeLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};text-align:${align};clear:both;">${p.sizeLabel ?? 'Select Size:'}</p>` : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${sizeCells}</tr>
        </table>
      </div>
    </div>
  </td></tr>
</table>`
  }
}

// ── Variant 4: pill-only ──────────────────────────────────────────────────────

const pillOnly: BlockVariant = {
  id: 'pill-only',
  label: 'Pills Only',
  description: 'All text pills — aligns with toolbar',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const names = getColorNames(p)
    const sizes = getSizes(p)
    const accent = p.accentColor ?? '#7530fb'
    const labelCol = p.labelColor ?? '#1e1535'
    const textCol = p.textColor ?? '#1f1d2e'
    const pillStyle = p.pillStyle ?? 'outlined'
    const colourPills = colors.map((_, i) => sizePill(names[i] ?? `Option ${i + 1}`, pillStyle, accent, textCol)).join('')
    const sizePills = sizes.map(s => sizePill(s, pillStyle, accent, textCol)).join('')
    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol, '700', align) : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${colourPills}</tr>
        </table>
      </div>
    </div>

    <!-- Size Section (Always on a new row under Colour) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      ${p.showSizeLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};text-align:${align};clear:both;">${p.sizeLabel ?? 'Size:'}</p>` : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${sizePills}</tr>
        </table>
      </div>
    </div>
  </td></tr>
</table>`
  }
}

// ── Variant 5: card-grid (New Structured Option Cards — Responsive Mobile Wrapping) ────────

const cardGrid: BlockVariant = {
  id: 'card-grid',
  label: 'Card Grid',
  description: 'Physical option cards for both colours and sizes with stock badges',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const names = getColorNames(p)
    const sizes = getSizes(p)
    const labelCol = p.labelColor ?? '#1e1535'

    // Structured Colour Option Cards (Inline-block auto-wraps cleanly on mobile)
    const colorCards = colors.map((c, i) => `
      <div style="display:inline-block;vertical-align:top;margin:3px;">
        <table cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1.5px solid #e5e7eb;padding:6px 10px;min-width:82px;border-collapse:collapse;">
          <tr>
            <td style="padding-right:7px;vertical-align:middle;line-height:0;">
              <span style="display:inline-block;width:16px;height:16px;background-color:${c};border:1.5px solid ${isLightColor(c) ? '#9ca3af' : '#e5e7eb'};vertical-align:middle;"></span>
            </td>
            <td style="vertical-align:middle;text-align:left;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${labelCol};line-height:1.2;">${names[i] ?? 'Color'}</p>
              <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:9px;color:#16a34a;font-weight:600;line-height:1;">Available</p>
            </td>
          </tr>
        </table>
      </div>`).join('')

    // Structured Size Cards (Inline-block auto-wraps cleanly on mobile)
    const sizeCards = sizes.map(s => `
      <div style="display:inline-block;vertical-align:top;margin:3px;">
        <div style="background:#ffffff;border:1.5px solid #e5e7eb;padding:7px 11px;text-align:center;min-width:48px;box-sizing:border-box;">
          <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:${labelCol};line-height:1.2;">${s}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:#16a34a;white-space:nowrap;line-height:1;">● In Stock</p>
        </div>
      </div>`).join('')

    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};border:1px solid #e5e7eb;">
  <tr><td style="${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${labelCol};letter-spacing:0.04em;text-transform:uppercase;text-align:${align};clear:both;">🎨 Colour Options (${colors.length})</p>
      <div style="display:block;width:100%;text-align:${align};">
        ${colorCards}
      </div>
    </div>

    <!-- Size Section (Always on a new row under Colour) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${labelCol};letter-spacing:0.04em;text-transform:uppercase;text-align:${align};clear:both;">📏 Size Options (${sizes.length})</p>
      <div style="display:block;width:100%;text-align:${align};">
        ${sizeCards}
      </div>
    </div>
  </td></tr>
</table>`
  }
}
// ── Variant 6: accent-selected (High-Conversion Active Showcase) ──────────────

const accentSelected: BlockVariant = {
  id: 'accent-selected',
  label: 'Accent Selected',
  description: 'Active selection banner + solid accent fill on the chosen size',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const names = getColorNames(p)
    const sizes = getSizes(p)
    const accent = p.accentColor ?? '#7530fb'
    const labelCol = p.labelColor ?? '#1e1535'
    const selectedColorIdx = p.selectedColorIndex ?? 0
    const selectedSizeIdx = p.selectedSizeIndex ?? 2

    const activeColorName = names[selectedColorIdx] ?? 'Red'
    const activeSizeName = sizes[selectedSizeIdx] ?? 'M'

    // Swatches with checkmark badge on selected swatch
    const swatchCells = colors.map((c, i) => {
      const isSelected = i === selectedColorIdx
      const border = isSelected ? `3px solid ${accent}` : `1.5px solid ${isLightColor(c) ? '#9ca3af' : '#e5e7eb'}`
      return `<td style="padding:4px;text-align:center;">
        <div style="display:inline-block;padding:2px;border:${isSelected ? `2px solid ${accent}` : '2px solid transparent'};">
          <span style="display:block;width:24px;height:24px;background-color:${c};border:${border};line-height:24px;color:#fff;font-size:11px;font-weight:900;text-align:center;">
            ${isSelected ? '✓' : ''}
          </span>
        </div>
      </td>`
    }).join('')

    // Sizes: Selected size is SOLID ACCENT FILL with white bold text & "✓ SELECTED"
    const sizeCells = sizes.map((s, i) => {
      const isSelected = i === selectedSizeIdx
      if (isSelected) {
        return `<td style="padding:4px;">
          <div style="background:${accent};border:2px solid ${accent};padding:6px 16px;text-align:center;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:900;color:#ffffff;line-height:1.2;">✓ ${s}</p>
            <p style="margin:1px 0 0;font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:rgba(255,255,255,0.85);text-transform:uppercase;line-height:1;">Active</p>
          </div>
        </td>`
      }
      return `<td style="padding:4px;">
        <div style="background:#ffffff;border:1.5px solid #d1d5db;padding:8px 14px;text-align:center;min-width:38px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#374151;">${s}</p>
        </div>
      </td>`
    }).join('')

    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};border:1.5px solid ${accent}40;">
  <!-- Active Selection Banner -->
  <tr>
    <td style="background-color:#faf5ff;border-bottom:1px solid ${accent}25;padding:10px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:${accent};letter-spacing:0.04em;text-transform:uppercase;">CURRENT SELECTION:</span>
            <strong style="font-family:Arial,sans-serif;font-size:12px;color:#1e1535;margin-left:6px;">${activeColorName} &nbsp;·&nbsp; Size ${activeSizeName}</strong>
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="display:inline-block;background:${accent};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:2px 8px;letter-spacing:0.04em;">✓ ACTIVE</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Content Body -->
  <tr><td style="${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${labelCol};text-align:${align};clear:both;">Colour: <strong>${activeColorName}</strong></p>
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${swatchCells}</tr>
        </table>
      </div>
    </div>

    <!-- Size Section (Always on a new row under Colour) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${labelCol};text-align:${align};clear:both;">Size: <strong>${activeSizeName}</strong></p>
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${sizeCells}</tr>
        </table>
      </div>
    </div>

    <!-- Reassurance Footer -->
    <p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#6b7280;text-align:${align};clear:both;">
      ⚡ In Stock & Ready to Dispatch &nbsp;·&nbsp; Choose your variation in the eBay dropdown above
    </p>
  </td></tr>
</table>`
  }
}
// ── Variant 7: dark-selector (Toolbar Align + Curve-Free) ─────────────────────

const darkSelector: BlockVariant = {
  id: 'dark-selector',
  label: 'Dark Selector',
  description: 'Dark panel — luxury, streetwear, electronics aesthetic',
  toHtml(p, id) {
    const align = getAlign(p)
    const colors = getColors(p)
    const sizes = getSizes(p)
    const darkBg = p.darkPanelBg ?? '#1e1535'
    const accent = p.accentColor ?? '#7530fb'
    const shape = p.swatchShape ?? 'circle'
    const swatchSize = p.swatchSize ?? 24
    const swatchCells = colors.map(c => {
      const radius = shape === 'square' ? '0px' : '50%'
      return `<td style="padding:3px;"><span style="display:inline-block;width:${swatchSize}px;height:${swatchSize}px;background-color:${c};border-radius:${radius};border:2px solid rgba(255,255,255,0.25);"></span></td>`
    }).join('')
    // border-radius removed from size pills
    const sizeCells = sizes.map(s => `<td style="padding:3px;"><span style="display:inline-block;padding:5px 12px;border:1.5px solid rgba(255,255,255,0.25);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.85);">${s}</span></td>`).join('')
    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;">
  <tr><td style="background-color:${darkBg};${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      ${p.showColourLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.04em;text-align:${align};">${p.colourLabel ?? 'COLOUR'}</p>` : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${swatchCells}</tr>
        </table>
      </div>
    </div>

    <!-- Size Section (Always on a new row under Colour) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      ${p.showSizeLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.04em;text-align:${align};clear:both;">${p.sizeLabel ?? 'SIZE'}</p>` : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${sizeCells}</tr>
        </table>
      </div>
    </div>
    <div style="margin-top:14px;height:2px;clear:both;background:${align === 'center' ? `linear-gradient(90deg,transparent,${accent},transparent)` : `linear-gradient(90deg,${accent},transparent)`};"></div>
  </td></tr>
</table>`
  }
}

// ── Variant 8: side-by-side ───────────────────────────────────────────────────

const sideBySide: BlockVariant = {
  id: 'side-by-side',
  label: 'Side by Side',
  description: 'Colours on the left, sizes on the right — compact two-column layout',
  toHtml(p, id) {
    const colors = getColors(p)
    const sizes = getSizes(p)
    const accent = p.accentColor ?? '#7530fb'
    const labelCol = p.labelColor ?? '#1e1535'
    const textCol = p.textColor ?? '#1f1d2e'
    const shape = p.swatchShape ?? 'circle'
    const swatchSize = p.swatchSize ?? 24
    const swatchCells = colors.map(c => swatch(c, shape, swatchSize, p.swatchBorderColor ?? '#e5e7eb')).join('')
    const sizeCells = sizes.map(s => sizePill(s, p.pillStyle ?? 'outlined', accent, textCol)).join('')

    const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pv-sbs-col-${id} { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
  .pv-sbs-div-${id} { display: none !important; }
}
</style>`

    return `<!--[riazify:product_variants:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td class="pv-sbs-col-${id}" style="width:50%;vertical-align:top;padding-right:16px;">
          ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol) : ''}
          <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
        </td>
        <td class="pv-sbs-div-${id}" style="width:1px;background-color:#e5e7eb;"></td>
        <td class="pv-sbs-col-${id}" style="width:50%;vertical-align:top;padding-left:16px;">
          ${p.showSizeLabel !== false ? label(p.sizeLabel ?? 'Size:', labelCol) : ''}
          <table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`
  }
}

// ── Variant 9: availability-grid (Toolbar Align + Curve-Free) ─────────────────

const availabilityGrid: BlockVariant = {
  id: 'availability-grid',
  label: 'Availability Grid',
  description: 'Size cells with in-stock / out-of-stock status — aligns with toolbar',
  toHtml(p, id) {
    const align = getAlign(p)
    const sizes = getSizes(p)
    const unavailable = (p.unavailableSizes ?? '').split(',').map((s: string) => s.trim().toLowerCase())
    const labelCol = p.labelColor ?? '#1e1535'
    const textCol = p.textColor ?? '#1f1d2e'
    const accent = p.accentColor ?? '#7530fb'
    const colors = getColors(p)
    const shape = p.swatchShape ?? 'circle'
    const swatchSize = p.swatchSize ?? 24
    const swatchCells = colors.map(c => swatch(c, shape, swatchSize, p.swatchBorderColor ?? '#e5e7eb')).join('')
    const gridCells = sizes.map(s => {
      const isOut = unavailable.includes(s.toLowerCase())
      const bg = isOut ? '#f9fafb' : '#fff'
      const col = isOut ? '#9ca3af' : textCol
      const border = isOut ? '#e5e7eb' : accent + '55'
      const strike = isOut ? 'text-decoration:line-through;' : ''
      const dot = isOut
        ? `<span style="display:block;width:6px;height:6px;border-radius:50%;background:#ef4444;margin:0 auto 3px;"></span>`
        : `<span style="display:block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin:0 auto 3px;"></span>`
      return `<td style="padding:4px;">
        <span style="display:inline-block;min-width:44px;padding:6px 8px;border:1.5px solid ${border};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${col};text-align:center;background:${bg};${strike}">
          ${dot}${s}
        </span>
      </td>`
    }).join('')
    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:${align};">
    <!-- Colour Section -->
    <div style="display:block;width:100%;clear:both;text-align:${align};margin-bottom:14px;">
      ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol, '700', align) : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${swatchCells}</tr>
        </table>
      </div>
    </div>

    <!-- Size Availability Section (Always on a new row under Colour) -->
    <div style="display:block;width:100%;clear:both;text-align:${align};">
      ${p.showSizeLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};text-align:${align};clear:both;">${p.sizeLabel ?? 'Size Availability:'}</p>` : ''}
      <div style="display:block;width:100%;text-align:${align};">
        <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:collapse;vertical-align:top;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto 0 0;'}">
          <tr>${gridCells}</tr>
        </table>
      </div>
      <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9ca3af;text-align:${align};clear:both;">
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin-right:4px;vertical-align:middle;"></span>In stock &nbsp;
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;margin-right:4px;vertical-align:middle;"></span>Out of stock
      </p>
    </div>
  </td></tr>
</table>`
  }
}

// ── Variant 10: spec-badges (Toolbar Align + Curve-Free) ──────────────────────

const specBadges: BlockVariant = {
  id: 'spec-badges',
  label: 'Spec Badges',
  description: 'Icon + value badges signal variety at a glance — aligns with toolbar',
  toHtml(p, id) {
    const align = getAlign(p)
    const accent = p.accentColor ?? '#7530fb'
    const labelCol = p.labelColor ?? '#1e1535'
    const colors = getColors(p)
    const sizes = getSizes(p)
    const badge1Text = p.badge1Text ?? `${colors.length} Colours`
    const badge2Text = p.badge2Text ?? `${sizes.length} Sizes`
    const badge3Text = p.badge3Text ?? 'Easy Returns'
    const badge4Text = p.badge4Text ?? 'Fast Dispatch'
    const badge1Icon = p.badge1Icon ?? '🎨'
    const badge2Icon = p.badge2Icon ?? '📏'
    const badge3Icon = p.badge3Icon ?? '🔄'
    const badge4Icon = p.badge4Icon ?? '📦'
    const badges = [
      { icon: badge1Icon, text: badge1Text },
      { icon: badge2Icon, text: badge2Text },
      { icon: badge3Icon, text: badge3Text },
      { icon: badge4Icon, text: badge4Text },
    ]
    // border-radius removed from badges
    const badgeCells = badges.map(b => `
      <td style="padding:4px;">
        <span style="display:inline-block;padding:7px 14px;border:1.5px solid ${accent}33;background:${accent}0d;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${labelCol};">
          ${b.icon}&nbsp;&nbsp;${b.text}
        </span>
      </td>`).join('')
    return `<!--[riazify:product_variants:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:${align};">
    <div style="text-align:${align};">
      <table cellpadding="0" cellspacing="0" border="0" align="${align}" style="display:inline-table;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin:0 0 0 auto;' : ''}"><tr>${badgeCells}</tr></table>
    </div>
  </td></tr>
</table>`
  }
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const productVariantsVariants: BlockVariant[] = [
  swatchesSizes,
  inlineCompact,
  labelledSwatches,
  pillOnly,
  cardGrid,
  accentSelected,
  darkSelector,
  sideBySide,
  availabilityGrid,
  specBadges,
]

export function getProductVariantsVariant(id: string): BlockVariant {
  return productVariantsVariants.find(v => v.id === id) ?? swatchesSizes
}
