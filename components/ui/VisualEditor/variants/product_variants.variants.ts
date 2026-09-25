// components/ui/VisualEditor/variants/product_variants.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Variants — 10 layout variants
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

function label(text: string, color: string, weight = '700'): string {
    return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:${weight};color:${color};">${text}</p>`
}

function swatch(color: string, shape: string, size: number, border: string): string {
    const radius = shape === 'square' ? '4px' : '50%'
    const isLight = isLightColor(color)
    const borderCol = isLight ? '#9ca3af' : border
    return `<td style="padding:3px;"><span style="display:inline-block;width:${size}px;height:${size}px;background-color:${color};border-radius:${radius};border:2px solid ${borderCol};"></span></td>`
}

function sizePill(text: string, style: string, accentColor: string, textColor: string, selected = false): string {
    if (style === 'filled') {
        const bg = selected ? accentColor : '#f3f4f6'
        const col = selected ? '#ffffff' : textColor
        const border = selected ? accentColor : '#e5e7eb'
        return `<td style="padding:3px;"><span style="display:inline-block;padding:5px 12px;border:1px solid ${border};border-radius:4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:${selected ? '700' : '400'};color:${col};background-color:${bg};">${text}</span></td>`
    }
    // outlined (default)
    const border = selected ? accentColor : '#ede9fe'
    const col = selected ? accentColor : textColor
    const bg = selected ? accentColor + '14' : 'transparent'
    return `<td style="padding:3px;"><span style="display:inline-block;padding:5px 12px;border:2px solid ${border};border-radius:4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:${selected ? '700' : '400'};color:${col};background-color:${bg};">${text}</span></td>`
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
    description: 'Colour circles above, size pills below — clean default layout',
    toHtml(p, id) {
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colours:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
    ${p.showSizeLabel !== false ? `<p style="margin:12px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};">${p.sizeLabel ?? 'Sizes:'}</p>` : '<div style="height:12px;"></div>'}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table>
  </td></tr>
</table>`
    }
}

// ── Variant 2: inline-compact ─────────────────────────────────────────────────

const inlineCompact: BlockVariant = {
    id: 'inline-compact',
    label: 'Inline Compact',
    description: 'Colours and sizes on one horizontal row — saves vertical space',
    toHtml(p, id) {
        const colors = getColors(p)
        const sizes = getSizes(p)
        const shape = p.swatchShape ?? 'circle'
        const swatchSize = p.swatchSize ?? 20
        const accent = p.accentColor ?? '#7530fb'
        const labelCol = p.labelColor ?? '#1e1535'
        const textCol = p.textColor ?? '#1f1d2e'
        const swatchCells = colors.map(c => swatch(c, shape, swatchSize, p.swatchBorderColor ?? '#e5e7eb')).join('')
        const sizeCells = sizes.map(s => sizePill(s, p.pillStyle ?? 'outlined', accent, textCol)).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="white-space:nowrap;vertical-align:middle;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${labelCol};margin-right:6px;">${p.colourLabel ?? 'Colour:'}</span>
          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;"><tr>${swatchCells}</tr></table>
        </td>
        <td style="width:20px;text-align:center;vertical-align:middle;color:#d1d5db;font-size:16px;">|</td>
        <td style="white-space:nowrap;vertical-align:middle;">
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
    description: 'Each swatch has its colour name below — great for fashion & fabric',
    toHtml(p, id) {
        const colors = getColors(p)
        const names = getColorNames(p)
        const shape = p.swatchShape ?? 'circle'
        const swatchSize = p.swatchSize ?? 28
        const labelCol = p.labelColor ?? '#1e1535'
        const textCol = p.textColor ?? '#6b7280'
        const swatchCells = colors.map((c, i) => `
      <td style="padding:4px 8px;text-align:center;vertical-align:top;">
        <span style="display:block;width:${swatchSize}px;height:${swatchSize}px;background-color:${c};border-radius:${shape === 'square' ? '4px' : '50%'};border:2px solid ${isLightColor(c) ? '#9ca3af' : '#e5e7eb'};margin:0 auto 4px;"></span>
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${textCol};white-space:nowrap;">${names[i] ?? ''}</span>
      </td>`).join('')
        const sizes = getSizes(p)
        const sizeCells = sizes.map(s => sizePill(s, p.pillStyle ?? 'outlined', p.accentColor ?? '#7530fb', textCol)).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Choose Colour:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
    ${p.showSizeLabel !== false ? `<p style="margin:14px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};">${p.sizeLabel ?? 'Select Size:'}</p>` : '<div style="height:14px;"></div>'}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table>
  </td></tr>
</table>`
    }
}

// ── Variant 4: pill-only ──────────────────────────────────────────────────────

const pillOnly: BlockVariant = {
    id: 'pill-only',
    label: 'Pills Only',
    description: 'All text pills — no circles. Great for electronics & storage variants',
    toHtml(p, id) {
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${colourPills}</tr></table>
    ${p.showSizeLabel !== false ? `<p style="margin:12px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};">${p.sizeLabel ?? 'Size:'}</p>` : '<div style="height:12px;"></div>'}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${sizePills}</tr></table>
  </td></tr>
</table>`
    }
}

// ── Variant 5: card-grid ──────────────────────────────────────────────────────

const cardGrid: BlockVariant = {
    id: 'card-grid',
    label: 'Card Grid',
    description: 'Each size in its own bordered card — premium retail feel',
    toHtml(p, id) {
        const colors = getColors(p)
        const sizes = getSizes(p)
        const accent = p.accentColor ?? '#7530fb'
        const labelCol = p.labelColor ?? '#1e1535'
        const textCol = p.textColor ?? '#1f1d2e'
        const shape = p.swatchShape ?? 'circle'
        const swatchSize = p.swatchSize ?? 24
        const swatchCells = colors.map(c => swatch(c, shape, swatchSize, p.swatchBorderColor ?? '#e5e7eb')).join('')
        const cardCells = sizes.map(s => `
      <td style="padding:4px;">
        <span style="display:inline-block;min-width:44px;padding:8px 10px;border:1.5px solid #e5e7eb;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:${textCol};text-align:center;background:#fff;">${s}</span>
      </td>`).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colours:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
    ${p.showSizeLabel !== false ? `<p style="margin:14px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};">${p.sizeLabel ?? 'Select Size:'}</p>` : '<div style="height:14px;"></div>'}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${cardCells}</tr></table>
  </td></tr>
</table>`
    }
}

// ── Variant 6: accent-selected ────────────────────────────────────────────────

const accentSelected: BlockVariant = {
    id: 'accent-selected',
    label: 'Accent Selected',
    description: 'One swatch/size pre-highlighted — shows buyers the selection state',
    toHtml(p, id) {
        const colors = getColors(p)
        const sizes = getSizes(p)
        const accent = p.accentColor ?? '#7530fb'
        const labelCol = p.labelColor ?? '#1e1535'
        const textCol = p.textColor ?? '#1f1d2e'
        const selectedColorIdx = p.selectedColorIndex ?? 0
        const selectedSizeIdx = p.selectedSizeIndex ?? 2
        const shape = p.swatchShape ?? 'circle'
        const swatchSize = p.swatchSize ?? 26
        const radius = shape === 'square' ? '4px' : '50%'
        const swatchCells = colors.map((c, i) => {
            const isSelected = i === selectedColorIdx
            const ring = isSelected ? `box-shadow:0 0 0 2px #fff,0 0 0 4px ${accent};` : ''
            return `<td style="padding:4px;"><span style="display:inline-block;width:${swatchSize}px;height:${swatchSize}px;background-color:${c};border-radius:${radius};border:2px solid ${isLightColor(c) ? '#9ca3af' : '#e5e7eb'};${ring}"></span></td>`
        }).join('')
        const sizeCells = sizes.map((s, i) => sizePill(s, p.pillStyle ?? 'outlined', accent, textCol, i === selectedSizeIdx)).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
    ${p.showSizeLabel !== false ? `<p style="margin:12px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${labelCol};">${p.sizeLabel ?? 'Size:'}</p>` : '<div style="height:12px;"></div>'}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table>
  </td></tr>
</table>`
    }
}

// ── Variant 7: dark-selector ──────────────────────────────────────────────────

const darkSelector: BlockVariant = {
    id: 'dark-selector',
    label: 'Dark Selector',
    description: 'Dark panel — luxury, streetwear, electronics aesthetic',
    toHtml(p, id) {
        const colors = getColors(p)
        const sizes = getSizes(p)
        const darkBg = p.darkPanelBg ?? '#1e1535'
        const accent = p.accentColor ?? '#7530fb'
        const shape = p.swatchShape ?? 'circle'
        const swatchSize = p.swatchSize ?? 24
        const swatchCells = colors.map(c => {
            const radius = shape === 'square' ? '4px' : '50%'
            return `<td style="padding:3px;"><span style="display:inline-block;width:${swatchSize}px;height:${swatchSize}px;background-color:${c};border-radius:${radius};border:2px solid rgba(255,255,255,0.25);"></span></td>`
        }).join('')
        const sizeCells = sizes.map(s => `<td style="padding:3px;"><span style="display:inline-block;padding:5px 12px;border:1.5px solid rgba(255,255,255,0.25);border-radius:4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.85);">${s}</span></td>`).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr><td style="background-color:${darkBg};border-radius:6px;${pad(p)}">
    ${p.showColourLabel !== false ? `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.04em;">${p.colourLabel ?? 'COLOUR'}</p>` : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
    ${p.showSizeLabel !== false ? `<p style="margin:14px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.04em;">${p.sizeLabel ?? 'SIZE'}</p>` : '<div style="height:14px;"></div>'}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table>
    <div style="margin-top:10px;height:2px;background:linear-gradient(90deg,${accent},transparent);border-radius:1px;"></div>
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
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:16px;">
          ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol) : ''}
          <table cellpadding="0" cellspacing="0" border="0"><tr>${swatchCells}</tr></table>
        </td>
        <td style="width:1px;background-color:#e5e7eb;"></td>
        <td style="width:50%;vertical-align:top;padding-left:16px;">
          ${p.showSizeLabel !== false ? label(p.sizeLabel ?? 'Size:', labelCol) : ''}
          <table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`
    }
}

// ── Variant 9: availability-grid ──────────────────────────────────────────────

const availabilityGrid: BlockVariant = {
    id: 'availability-grid',
    label: 'Availability Grid',
    description: 'Size cells with in-stock / out-of-stock status — great for fashion sellers',
    toHtml(p, id) {
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
        <span style="display:inline-block;min-width:44px;padding:6px 8px;border:1.5px solid ${border};border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${col};text-align:center;background:${bg};${strike}">
          ${dot}${s}
        </span>
      </td>`
        }).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    ${p.showColourLabel !== false ? label(p.colourLabel ?? 'Colour:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr>${swatchCells}</tr></table>
    ${p.showSizeLabel !== false ? label(p.sizeLabel ?? 'Size Availability:', labelCol) : ''}
    <table cellpadding="0" cellspacing="0" border="0"><tr>${gridCells}</tr></table>
    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9ca3af;">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin-right:4px;vertical-align:middle;"></span>In stock &nbsp;
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;margin-right:4px;vertical-align:middle;"></span>Out of stock
    </p>
  </td></tr>
</table>`
    }
}

// ── Variant 10: spec-badges ───────────────────────────────────────────────────

const specBadges: BlockVariant = {
    id: 'spec-badges',
    label: 'Spec Badges',
    description: 'Icon + value badges signal variety at a glance — trust builder',
    toHtml(p, id) {
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
        const badgeCells = badges.map(b => `
      <td style="padding:4px;">
        <span style="display:inline-block;padding:7px 14px;border:1.5px solid ${accent}33;border-radius:20px;background:${accent}0d;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${labelCol};">
          ${b.icon}&nbsp;&nbsp;${b.text}
        </span>
      </td>`).join('')
        return `<!--[riazify:product_variants:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    <table cellpadding="0" cellspacing="0" border="0"><tr>${badgeCells}</tr></table>
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
