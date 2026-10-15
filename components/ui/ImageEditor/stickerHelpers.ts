// components/ui/ImageEditor/stickerHelpers.ts
// ─────────────────────────────────────────────────────────────
// Shared sticker presets, SVG generation, and canvas helpers.
// Imported by StickerTool, StickerLayer (modal), and ExportTool.
// ─────────────────────────────────────────────────────────────

import type { StickerItem, StickerColorScheme, StickerShape } from './types'

// ── Color schemes ─────────────────────────────────────────────
export const COLOR_SCHEMES: Record<StickerColorScheme, {
    bg: string; text: string; accent: string; shadow: string
}> = {
    red:    { bg: '#ef4444', text: '#ffffff', accent: '#991b1b', shadow: 'rgba(185,28,28,0.45)'  },
    green:  { bg: '#22c55e', text: '#ffffff', accent: '#166534', shadow: 'rgba(21,128,61,0.45)'  },
    blue:   { bg: '#3b82f6', text: '#ffffff', accent: '#1e3a8a', shadow: 'rgba(29,78,216,0.45)'  },
    yellow: { bg: '#fbbf24', text: '#1c1917', accent: '#92400e', shadow: 'rgba(146,64,14,0.35)'  },
    purple: { bg: '#a855f7', text: '#ffffff', accent: '#581c87', shadow: 'rgba(88,28,135,0.45)'  },
    orange: { bg: '#f97316', text: '#ffffff', accent: '#7c2d12', shadow: 'rgba(124,45,18,0.45)'  },
    black:  { bg: '#1f2937', text: '#ffffff', accent: '#030712', shadow: 'rgba(0,0,0,0.5)'       },
}

// ── Shape dimensions (viewBox w × h) ─────────────────────────
export const SHAPE_DIMS: Record<StickerShape, { w: number; h: number }> = {
    burst:  { w: 100, h: 100 },
    circle: { w: 100, h: 100 },
    badge:  { w: 110, h: 72  },
    pill:   { w: 140, h: 52  },
    ribbon: { w: 120, h: 58  },
}

// ── Pre-built sticker presets ─────────────────────────────────
export interface StickerPreset {
    key:          string
    label:        string
    subLabel:     string
    shape:        StickerShape
    defaultColor: StickerColorScheme
    category:     'badge' | 'discount'
}

export const STICKER_PRESETS: StickerPreset[] = [
    // ── Text badges ────────────────────────────────────────────
    { key: 'sale',       label: 'SALE',    subLabel: '',         shape: 'burst',  defaultColor: 'red',    category: 'badge'    },
    { key: 'new',        label: 'NEW',     subLabel: '',         shape: 'badge',  defaultColor: 'green',  category: 'badge'    },
    { key: 'hot',        label: '🔥 HOT',  subLabel: '',         shape: 'badge',  defaultColor: 'red',    category: 'badge'    },
    { key: 'freeship',   label: 'FREE',    subLabel: 'SHIPPING', shape: 'pill',   defaultColor: 'blue',   category: 'badge'    },
    { key: 'bestprice',  label: 'BEST',    subLabel: 'PRICE',    shape: 'ribbon', defaultColor: 'orange', category: 'badge'    },
    { key: 'limited',    label: 'LIMITED', subLabel: 'OFFER',    shape: 'ribbon', defaultColor: 'black',  category: 'badge'    },
    { key: 'fastship',   label: 'FAST',    subLabel: 'SHIPPING', shape: 'badge',  defaultColor: 'blue',   category: 'badge'    },
    { key: 'clearance',  label: 'CLEAR-',  subLabel: 'ANCE',     shape: 'burst',  defaultColor: 'purple', category: 'badge'    },
    // ── Discount badges ────────────────────────────────────────
    { key: '10off',  label: '10%',  subLabel: 'OFF', shape: 'circle', defaultColor: 'yellow', category: 'discount' },
    { key: '15off',  label: '15%',  subLabel: 'OFF', shape: 'circle', defaultColor: 'yellow', category: 'discount' },
    { key: '20off',  label: '20%',  subLabel: 'OFF', shape: 'circle', defaultColor: 'orange', category: 'discount' },
    { key: '25off',  label: '25%',  subLabel: 'OFF', shape: 'circle', defaultColor: 'orange', category: 'discount' },
    { key: '30off',  label: '30%',  subLabel: 'OFF', shape: 'burst',  defaultColor: 'red',    category: 'discount' },
    { key: '40off',  label: '40%',  subLabel: 'OFF', shape: 'burst',  defaultColor: 'red',    category: 'discount' },
    { key: '50off',  label: '50%',  subLabel: 'OFF', shape: 'burst',  defaultColor: 'red',    category: 'discount' },
    { key: '70off',  label: '70%',  subLabel: 'OFF', shape: 'burst',  defaultColor: 'purple', category: 'discount' },
]

// ── Starburst polygon points ──────────────────────────────────
function burstPoints(cx: number, cy: number, outerR: number, innerR: number, spikes: number): string {
    const pts: string[] = []
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        const r     = i % 2 === 0 ? outerR : innerR
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
    }
    return pts.join(' ')
}

const BURST12 = burstPoints(50, 50, 49, 33, 12)

// ── SVG string builder ────────────────────────────────────────
export function buildStickerSvg(sticker: Pick<StickerItem, 'label' | 'subLabel' | 'shape' | 'colorScheme'>): string {
    const c    = COLOR_SCHEMES[sticker.colorScheme]
    const dims = SHAPE_DIMS[sticker.shape]
    const { label, subLabel, shape } = sticker
    const twoLine = subLabel.length > 0

    // font sizes based on label length
    const mainFs  = (s: string, base: number) => s.length > 5 ? base - 4 : s.length > 3 ? base - 2 : base
    const shd     = `<filter id="s"><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="${c.shadow}"/></filter>`

    const hdr = `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.w}" height="${dims.h}" viewBox="0 0 ${dims.w} ${dims.h}">`

    switch (shape) {
        case 'burst': return `${hdr}
  <defs>${shd}</defs>
  <polygon points="${BURST12}" fill="${c.bg}" stroke="${c.accent}" stroke-width="2.5" filter="url(#s)"/>
  <text x="50" y="${twoLine ? '41' : '52'}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="${mainFs(label, 22)}" font-weight="900" fill="${c.text}">${label}</text>
  ${twoLine ? `<text x="50" y="61" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="14" font-weight="800" fill="${c.text}" opacity="0.92">${subLabel}</text>` : ''}
</svg>`

        case 'circle': return `${hdr}
  <defs>${shd}</defs>
  <circle cx="50" cy="50" r="46" fill="${c.bg}" filter="url(#s)"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="${c.accent}" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="${c.accent}" stroke-width="1.5" opacity="0.4"/>
  <text x="50" y="${twoLine ? '42' : '52'}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="${mainFs(label, 28)}" font-weight="900" fill="${c.text}">${label}</text>
  ${twoLine ? `<text x="50" y="63" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="16" font-weight="800" fill="${c.text}" opacity="0.9">${subLabel}</text>` : ''}
</svg>`

        case 'badge': return `${hdr}
  <defs>${shd}</defs>
  <rect x="4" y="4" width="102" height="64" rx="13" fill="${c.bg}" filter="url(#s)"/>
  <rect x="4" y="4" width="102" height="64" rx="13" fill="none" stroke="${c.accent}" stroke-width="2.5"/>
  <rect x="4" y="4" width="102" height="20" rx="13" fill="${c.accent}" opacity="0.35"/>
  <rect x="4" y="16" width="102" height="8" fill="${c.accent}" opacity="0.35"/>
  <text x="55" y="${twoLine ? '36' : '40'}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="${mainFs(label, 22)}" font-weight="900" fill="${c.text}">${label}</text>
  ${twoLine ? `<text x="55" y="55" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="14" font-weight="700" fill="${c.text}" opacity="0.9">${subLabel}</text>` : ''}
</svg>`

        case 'pill': return `${hdr}
  <defs>${shd}</defs>
  <rect x="4" y="4" width="132" height="44" rx="22" fill="${c.bg}" filter="url(#s)"/>
  <rect x="4" y="4" width="132" height="44" rx="22" fill="none" stroke="${c.accent}" stroke-width="2.5"/>
  <rect x="4" y="4" width="132" height="16" rx="22" fill="${c.accent}" opacity="0.3"/>
  <rect x="4" y="13" width="132" height="7" fill="${c.accent}" opacity="0.3"/>
  <text x="70" y="${twoLine ? '23' : '27'}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="${mainFs(label, 17)}" font-weight="900" fill="${c.text}">${label}</text>
  ${twoLine ? `<text x="70" y="37" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="13" font-weight="700" fill="${c.text}" opacity="0.9">${subLabel}</text>` : ''}
</svg>`

        case 'ribbon': return `${hdr}
  <defs>${shd}</defs>
  <polygon points="0,14 12,2 108,2 120,14 120,44 108,56 12,56 0,44" fill="${c.bg}" filter="url(#s)"/>
  <polygon points="0,14 12,2 108,2 120,14 120,44 108,56 12,56 0,44" fill="none" stroke="${c.accent}" stroke-width="2.5"/>
  <line x1="0" y1="14" x2="120" y2="14" stroke="${c.accent}" stroke-width="1.5" opacity="0.5"/>
  <line x1="0" y1="44" x2="120" y2="44" stroke="${c.accent}" stroke-width="1.5" opacity="0.5"/>
  <text x="60" y="${twoLine ? '27' : '31'}" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="${mainFs(label, 17)}" font-weight="900" fill="${c.text}">${label}</text>
  ${twoLine ? `<text x="60" y="45" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="13" font-weight="700" fill="${c.text}" opacity="0.9">${subLabel}</text>` : ''}
</svg>`

        default: return `${hdr}
  <circle cx="50" cy="50" r="46" fill="${c.bg}"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black,Arial,sans-serif" font-size="20" font-weight="900" fill="${c.text}">${label}</text>
</svg>`
    }
}

// ── Data URL for use in <img> src and canvas drawImage ─────────
export function stickerToDataUrl(sticker: Pick<StickerItem, 'label' | 'subLabel' | 'shape' | 'colorScheme'>): string {
    return `data:image/svg+xml,${encodeURIComponent(buildStickerSvg(sticker))}`
}

// ── Canvas draw helper ────────────────────────────────────────
// Loads sticker as an Image and draws it on ctx, centered at (cx, cy), rotated.
export function drawStickerOnCanvas(
    ctx:     CanvasRenderingContext2D,
    sticker: StickerItem,
    cx:      number,  // center x on canvas
    cy:      number,  // center y on canvas
    w:       number,  // display width
    h:       number,  // display height
): Promise<void> {
    return new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
            ctx.save()
            ctx.translate(cx, cy)
            if (sticker.rotation) ctx.rotate(sticker.rotation * Math.PI / 180)
            ctx.drawImage(img, -w / 2, -h / 2, w, h)
            ctx.restore()
            resolve()
        }
        img.onerror = () => resolve()
        img.src = stickerToDataUrl(sticker)
    })
}
