// components/ui/VisualEditor/variants/whats_in_the_box.variants.ts
import { IMAGE_PLACEHOLDER_SVG } from '../blocks'
// ─────────────────────────────────────────────────────────────────────────────
// What's In The Box — 8 layout variants
//
// Every variant shares the same WhatsInTheBoxProps — sellers never
// re-type their content when switching layout.
//
// Variants solve specific eBay seller display problems:
//   simple-list    → Classic green bullet checklist (default)
//   tick-cards     → Each item in its own card with ✓ circle
//   two-column     → Items split into 2 columns (6+ item lists)
//   numbered       → Purple numbered circles instead of bullets
//   dark-panel     → Dark luxury background, white text
//   icon-row       → Horizontal icon-above banner row
//   table-qty      → Two-column Item | Qty table
//   badge-count    → Item left, quantity pill badge right
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

export interface WhatsInTheBoxProps {
    variant: string
    heading: string
    items: string[]
    // Colors
    headingColor: string
    bulletColor: string
    textColor: string
    accentColor: string
    // Dark panel
    darkBg: string
    darkText: string
    darkAccent: string
    // Spacing (from CommonProps)
    bgColor: string
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function pad(p: any): string {
    return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 24}px;`
}

function getItems(p: any): string[] {
    if (Array.isArray(p.items) && p.items.length > 0) return p.items
    return ['1x Main Unit', '1x Power Cable', '1x User Manual', '1x Warranty Card', '2x AAA Batteries']
}

function getHeading(p: any): string {
    return p.heading ?? "&#128230; What's In The Box"
}

// Split "2x Main Unit" into qty "2x" and name "Main Unit"
function splitQty(item: string): { qty: string; name: string } {
    const match = item.match(/^(\d+x?\s*)/i)
    if (match) {
        return { qty: match[1].trim(), name: item.slice(match[1].length).trim() }
    }
    return { qty: '1x', name: item }
}

// ── Variants ──────────────────────────────────────────────────────────────────

export const whatsInTheBoxVariants: BlockVariant[] = [

    // ── 1. Simple List (default) ──────────────────────────────────────────────
    {
        id: 'simple-list',
        label: 'Simple List',
        description: 'Classic green bullet checklist — clean and universally compatible',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const bulletColor = p.bulletColor ?? '#16a34a'
            const textColor = p.textColor ?? '#1f1d2e'
            const rows = items.map(item =>
                `<tr>
                    <td width="24" valign="top" style="padding-right:8px;padding-bottom:8px;font-size:15px;color:${bulletColor};">&#9632;</td>
                    <td valign="top" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.5;">${item}</td>
                </tr>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 2. Tick Cards ─────────────────────────────────────────────────────────
    {
        id: 'tick-cards',
        label: 'Tick Cards',
        description: 'Each item in its own bordered card with a green tick circle',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const bulletColor = p.bulletColor ?? '#16a34a'
            const textColor = p.textColor ?? '#1f1d2e'
            const cards = items.map(item =>
                `<tr>
                    <td style="padding-bottom:8px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
                            <tr>
                                <td width="40" style="padding:10px 6px 10px 12px;text-align:center;vertical-align:middle;">
                                    <div style="display:inline-block;width:24px;height:24px;background-color:${bulletColor};border-radius:50%;text-align:center;line-height:24px;">
                                        <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#ffffff;font-weight:700;">&#10003;</span>
                                    </div>
                                </td>
                                <td style="padding:10px 12px 10px 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.4;vertical-align:middle;">${item}</td>
                            </tr>
                        </table>
                    </td>
                </tr>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${cards}</table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 3. Two Column ─────────────────────────────────────────────────────────
    {
        id: 'witb-two-column',
        label: 'Two Column',
        description: 'Items split into two equal columns — ideal for 6+ items',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const bulletColor = p.bulletColor ?? '#16a34a'
            const textColor = p.textColor ?? '#1f1d2e'
            const half = Math.ceil(items.length / 2)
            const left = items.slice(0, half)
            const right = items.slice(half)
            const makeRows = (list: string[]) =>
                list.map(item =>
                    `<tr>
                        <td width="20" valign="top" style="padding-right:6px;padding-bottom:8px;font-size:14px;color:${bulletColor};">&#10003;</td>
                        <td valign="top" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.4;">${item}</td>
                    </tr>`
                ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="48%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">${makeRows(left)}</table>
                </td>
                <td width="4%"></td>
                <td width="48%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">${makeRows(right)}</table>
                </td>
            </tr>
        </table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 4. Numbered ───────────────────────────────────────────────────────────
    {
        id: 'numbered',
        label: 'Numbered',
        description: 'Items numbered with purple circles — reads like an unboxing sequence',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const accentColor = p.accentColor ?? '#7530fb'
            const textColor = p.textColor ?? '#1f1d2e'
            const rows = items.map((item, i) =>
                `<tr>
                    <td width="32" valign="middle" style="padding-right:10px;padding-bottom:10px;">
                        <div style="display:inline-block;width:26px;height:26px;background-color:${accentColor};border-radius:50%;text-align:center;line-height:26px;">
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;">${i + 1}</span>
                        </div>
                    </td>
                    <td valign="middle" style="padding-bottom:10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.5;">${item}</td>
                </tr>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 5. Dark Panel ─────────────────────────────────────────────────────────
    {
        id: 'dark-panel',
        label: 'Dark Panel',
        description: 'Dark background with lime accent bullets — luxury and streetwear feel',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const darkBg = p.darkBg ?? '#1e1535'
            const darkText = p.darkText ?? '#ffffff'
            const darkAccent = p.darkAccent ?? '#b8fa33'
            const rows = items.map(item =>
                `<tr>
                    <td width="24" valign="top" style="padding-right:8px;padding-bottom:8px;font-size:15px;color:${darkAccent};">&#9632;</td>
                    <td valign="top" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${darkText};line-height:1.5;">${item}</td>
                </tr>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${darkBg};${pad(p)}">
        <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${darkAccent};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 6. Icon Row ───────────────────────────────────────────────────────────
    {
        id: 'icon-row',
        label: 'Icon Row',
        description: 'Horizontal row of items each with a box icon above — compact banner style',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const bulletColor = p.bulletColor ?? '#16a34a'
            const textColor = p.textColor ?? '#1f1d2e'
            // Limit to 5 items for horizontal layout
            const visibleItems = items.slice(0, 5)
            const pct = Math.floor(100 / visibleItems.length)
            const cells = visibleItems.map(item =>
                `<td width="${pct}%" style="text-align:center;vertical-align:top;padding:8px 4px;">
                    <p style="margin:0 0 6px;font-size:22px;color:${bulletColor};">&#128230;</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textColor};line-height:1.4;">${item}</p>
                </td>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};text-align:center;">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 7. Quantity Table ─────────────────────────────────────────────────────
    {
        id: 'table-qty',
        label: 'Quantity Table',
        description: 'Two-column table — Item name and Qty — great for multi-part bundles',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const accentColor = p.accentColor ?? '#7530fb'
            const textColor = p.textColor ?? '#1f1d2e'
            const rows = items.map((item, i) => {
                const { qty, name } = splitQty(item)
                const rowBg = i % 2 === 0 ? '#f9fafb' : '#ffffff'
                return `<tr style="background-color:${rowBg};">
                    <td style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};border-bottom:1px solid #f3f4f6;">${name}</td>
                    <td width="60" style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${accentColor};text-align:center;border-bottom:1px solid #f3f4f6;">${qty}</td>
                </tr>`
            }).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
            <tr style="background-color:${accentColor};">
                <th style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;text-align:left;">Item</th>
                <th width="60" style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;text-align:center;">Qty</th>
            </tr>
            ${rows}
        </table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 8. Badge Count ────────────────────────────────────────────────────────
    {
        id: 'badge-count',
        label: 'Badge Count',
        description: 'Item name left, quantity badge pill right — looks like a receipt or packing slip',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const accentColor = p.accentColor ?? '#7530fb'
            const textColor = p.textColor ?? '#1f1d2e'
            const rows = items.map(item => {
                const { qty, name } = splitQty(item)
                return `<tr>
                    <td style="padding-bottom:8px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #f3f4f6;">
                            <tr>
                                <td valign="middle" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.4;">${name}</td>
                                <td width="40" valign="middle" align="right" style="padding-bottom:8px;">
                                    <span style="display:inline-block;padding:3px 10px;background-color:${accentColor};border-radius:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">${qty}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`
            }).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 9. Split — Image Left, List Right ────────────────────────────────────
    {
        id: 'split-image-list',
        label: 'Image + List',
        description: 'Photo of box contents on the left, checklist on the right',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const bulletColor = p.bulletColor ?? '#16a34a'
            const textColor = p.textColor ?? '#1f1d2e'
            const imageUrl = (p as any).splitImageUrl ?? ''
            const imageHtml = imageUrl
                ? `<img src="${imageUrl}" alt="What's In The Box" border="0" width="100%" style="width:100%;height:auto;display:block;border-radius:6px;" />`
                : `<div style="width:100%;cursor:pointer;">${IMAGE_PLACEHOLDER_SVG}</div>`
            const rows = items.map(item =>
                `<tr>
                    <td width="20" valign="top" style="padding-right:6px;padding-bottom:8px;font-size:14px;color:${bulletColor};">&#10003;</td>
                    <td valign="top" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.4;">${item}</td>
                </tr>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="45%" valign="top" style="padding-right:16px;">${imageHtml}</td>
                <td width="55%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
                </td>
            </tr>
        </table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

    // ── 10. Split — List Left, Image Right ───────────────────────────────────
    {
        id: 'split-list-image',
        label: 'List + Image',
        description: 'Checklist on the left, photo of box contents on the right',
        toHtml(props, id) {
            const p = props as WhatsInTheBoxProps
            const items = getItems(p)
            const headingColor = p.headingColor ?? '#1e1535'
            const bulletColor = p.bulletColor ?? '#16a34a'
            const textColor = p.textColor ?? '#1f1d2e'
            const imageUrl = (p as any).splitImageUrl ?? ''
            const imageHtml = imageUrl
                ? `<img src="${imageUrl}" alt="What's In The Box" border="0" width="100%" style="width:100%;height:auto;display:block;border-radius:6px;" />`
                : `<div style="width:100%;cursor:pointer;">${IMAGE_PLACEHOLDER_SVG}</div>`
            const rows = items.map(item =>
                `<tr>
                    <td width="20" valign="top" style="padding-right:6px;padding-bottom:8px;font-size:14px;color:${bulletColor};">&#10003;</td>
                    <td valign="top" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.4;">${item}</td>
                </tr>`
            ).join('')
            return `<!-- BLOCK:whats_in_the_box:${id} -->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
    <tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingColor};">${getHeading(p)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="55%" valign="top" style="padding-right:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
                </td>
                <td width="45%" valign="top">${imageHtml}</td>
            </tr>
        </table>
    </td></tr>
</table>
<!-- /BLOCK:whats_in_the_box:${id} -->`
        },
    },

]

export function getWhatsInTheBoxVariant(variantId: string) {
    return whatsInTheBoxVariants.find(v => v.id === variantId) ?? whatsInTheBoxVariants[0]
}
