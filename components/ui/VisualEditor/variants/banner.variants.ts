// components/ui/VisualEditor/variants/banner.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Banner — Variant Registry
// ─────────────────────────────────────────────────────────────────────────────

export interface BannerVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

export const bannerVariants: BannerVariant[] = [
    // ── Variant 1: Simple Centered ────────────────────────────────────────────
    {
        id: 'simple',
        label: 'Simple Centered',
        description: 'Enhanced pet store banner with optional mini-badge, CTA button, and color presets',
        toHtml(p: any, id: string): string {
            const bg = p.bgGradient
                ? `background:linear-gradient(135deg,${p.bgGradientFrom},${p.bgGradientTo});`
                : `background-color:${p.bgColor || '#ffffff'};`

            // Optional mini-badge above title
            const badgeSection = p.badgeText
                ? `
      <div style="display:inline-block;margin-bottom:12px;padding:6px 14px;border-radius:20px;background-color:${p.badgeBg || 'rgba(255,255,255,0.9)'};color:${p.badgeColor || '#7530fb'};font-family:Arial,sans-serif;font-size:12px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        ${p.badgeText}
      </div>`
                : ''

            // Optional CTA button at bottom
            const ctaSection = p.ctaText
                ? `
      <div style="margin-top:20px;text-align:${p.align || 'center'};">
        <a href="${p.ctaUrl || '#'}" style="display:inline-block;padding:12px 24px;background-color:${p.ctaBgColor || '#b8fa33'};color:${p.ctaTextColor || '#1e1535'};text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.3s ease;${p.ctaHoverBgColor ? `&:hover{background-color:${p.ctaHoverBgColor};}` : ''}">
          ${p.ctaText}
        </a>
      </div>`
                : ''

            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;overflow:hidden;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
  <tr>
    <td style="${bg}padding:${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px;min-height:${p.minHeight || 100}px;text-align:${p.align || 'center'};position:relative;overflow:hidden;">

      <!-- Pet branding accent line at top -->
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg, #7530fb, #b8fa33, #7530fb);opacity:0.8;"></div>

      <!-- Mini-badge above title (pet-specific information) -->
      ${badgeSection}

      <!-- Main heading with pet store typography -->
      <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 28}px;font-weight:900;color:${p.headingColor || '#1e1535'};line-height:1.3;text-transform:uppercase;letter-spacing:0.03em;cursor:text;">
        ${p.headingText || ''}
      </h2>

      <!-- Subtitle with pet-friendly description -->
      <p data-editable="true" data-prop-key="subText" style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${p.subColor || '#6b7280'};line-height:1.7;font-weight:400;cursor:text;">
        ${p.subText || ''}
      </p>

      <!-- Optional CTA button at bottom -->
      ${ctaSection}

      <!-- Pet store decorative elements -->
      ${(p.badgeText || p.ctaText) && `
        <div style="position:absolute;bottom:12px;right:12px;opacity:0.1;pointer-events:none;">
          <div style="width:60px;height:60px;border-radius:50%;background:${p.badgeColor || '#7530fb'};filter:blur(20px);"></div>
        </div>
      `}
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        },
    },
    // ── Variant 2: Left Aligned with Badge ─────────────────────────────────────
    {
        id: 'left-badge',
        label: 'Left + Badge',
        description: 'Left‑aligned content with an optional badge above the heading',
        toHtml(p: any, id: string): string {
            const bg = p.bgGradient
                ? `background:linear-gradient(135deg,${p.bgGradientFrom},${p.bgGradientTo});`
                : `background-color:${p.bgColor || '#ffffff'};`

            const badgeSection = p.badgeText
                ? `
      <div style="display:inline-block;margin-bottom:12px;padding:4px 12px;border-radius:16px;background-color:${p.badgeBg || '#fff'};color:${p.badgeColor || '#7530fb'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;border:1px solid ${p.badgeColor || '#7530fb'};">
        ${p.badgeText}
      </div>`
                : ''

            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:12px;overflow:hidden;">
  <tr>
    <td style="${bg}padding:${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px;text-align:left;min-height:${p.minHeight || 100}px;position:relative;">
      ${badgeSection}
      <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 28}px;font-weight:900;color:${p.headingColor || '#1e1535'};line-height:1.2;cursor:text;">
        ${p.headingText || ''}
      </h2>
      <p data-editable="true" data-prop-key="subText" style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${p.subColor || '#6b7280'};line-height:1.5;cursor:text;">
        ${p.subText || ''}
      </p>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 3: Split Image & Text ──────────────────────────────────────────
    {
        id: 'split-image-text',
        label: 'Split Image',
        description: 'Two-column layout with image and text',
        toHtml(p: any, id: string): string {
            const bg = p.bgGradient
                ? `background:linear-gradient(135deg,${p.bgGradientFrom},${p.bgGradientTo});`
                : `background-color:${p.bgColor || '#ffffff'};`

            // Image cell – renders a clean placeholder with a gradient background and a shopping bag icon when imageUrl is missing.
            const imageContent = p.imageUrl
                ? `<img src="${p.imageUrl}" alt="${p.headingText || 'Banner Image'}" data-slot="imageUrl" class="riazify-active-slot" style="width:100%;height:auto;border-radius:${p.borderRadius || 8}px;display:block;cursor:pointer;" />`
                : `<div data-canvas-dropzone="imageUrl" style="width:100%;height:160px;background:linear-gradient(135deg, #f5f7ff, #e0e7ff);border-radius:${p.borderRadius || 8}px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
                    <svg viewBox="0 0 64 64" width="36" height="36" fill="#b0b0b0"><path d="M20 20h24v30a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V20zM32 8a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/></svg>
                    <div data-canvas-overlay="imageUrl" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(117,48,251,0.08);border-radius:${p.borderRadius || 8}px;opacity:0;">
                      <span style="background:#7530fb;color:white;padding:6px 12px;border-radius:6px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.15);">Select or Drop Image</span>
                    </div>
                  </div>`;
            const imageCell = `<td width="38%" style="padding:10px;vertical-align:middle;">${imageContent}</td>`;

            // Text cell
            const textCell = `<td width="62%" style="padding:10px;vertical-align:middle;text-align:${p.align || 'left'};">
                <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 28}px;font-weight:900;color:${p.headingColor || '#1e1535'};line-height:1.2;cursor:text;">${p.headingText || ''}</h2>
                <p data-editable="true" data-prop-key="subText" style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${p.subColor || '#6b7280'};line-height:1.5;cursor:text;">${p.subText || ''}</p>
            </td>`;

            const content = p.imagePosition === 'right' ? textCell + imageCell : imageCell + textCell

            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:12px;overflow:hidden;">
  <tr>
    <td style="${bg}padding:${p.paddingTop}px ${p.paddingRight}px ${p.paddingBottom}px ${p.paddingLeft}px;min-height:${p.minHeight}px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${content}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 4: Full-Width Hero ─────────────────────────────────────────────
    {
        id: 'full-width-hero',
        label: 'Full-Width Hero',
        description: 'Edge-to-edge hero banner with background image and dark overlay',
        toHtml(p: any, id: string): string {
            const defaultImg = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&h=600&fit=crop&auto=format&q=80'
            const bgImg = p.imageUrl || defaultImg
            const bgStyle = `background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${bgImg}'); background-size: cover; background-position: center;`

            const badgeSection = p.badgeText
                ? `
      <div style="display:inline-block;margin-bottom:12px;padding:6px 14px;border-radius:20px;background-color:${p.badgeBg || 'rgba(255,255,255,0.9)'};color:${p.badgeColor || '#7530fb'};font-family:Arial,sans-serif;font-size:12px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
        ${p.badgeText}
      </div>`
                : ''

            const ctaSection = p.ctaText
                ? `
      <div style="margin-top:20px;text-align:center;">
        <a href="${p.ctaUrl || '#'}" style="display:inline-block;padding:12px 24px;background-color:${p.ctaBgColor || '#b8fa33'};color:${p.ctaTextColor || '#1e1535'};text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
          ${p.ctaText}
        </a>
      </div>`
                : ''

            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;overflow:hidden;border-radius:${p.borderRadius || 12}px;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
  <tr>
    <td style="${bgStyle}padding:${p.paddingTop ?? 100}px ${p.paddingRight ?? 30}px ${p.paddingBottom ?? 100}px ${p.paddingLeft ?? 30}px;min-height:${p.minHeight ?? 300}px;text-align:center;position:relative;" data-slot="imageUrl" class="riazify-active-slot">
      ${badgeSection}
      <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 36}px;font-weight:900;color:${p.headingColor || '#ffffff'};line-height:1.2;text-transform:uppercase;letter-spacing:0.03em;text-shadow:0 2px 4px rgba(0,0,0,0.5);">
        ${p.headingText || 'Welcome to Our Store'}
      </h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.subFontSize || 16}px;color:${p.subColor || '#e2e8f0'};line-height:1.6;font-weight:400;text-shadow:0 1px 3px rgba(0,0,0,0.5);">
        ${p.subText || 'Explore our premium collection built for ultimate quality and reliability.'}
      </p>
      ${ctaSection}
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 5: Minimal Bordered ──────────────────────────────────────────
    {
        id: 'minimal-bordered',
        label: 'Minimal Bordered',
        description: 'Clean light theme with crisp border outline',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:8px;">
  <tr>
    <td style="background-color:#ffffff;border:1px solid #e5e7eb;padding:${p.paddingTop || 40}px ${p.paddingRight || 40}px ${p.paddingBottom || 40}px ${p.paddingLeft || 40}px;text-align:${p.align || 'center'};border-radius:8px;position:relative;">
      <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 28}px;font-weight:700;color:#1e1535;line-height:1.2;">
        ${p.headingText || 'Simple & Elegant'}
      </h2>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#475569;line-height:1.6;">
        ${p.subText || 'Clean design that highlights your product features.'}
      </p>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 6: Floating Card ─────────────────────────────────────────────
    {
        id: 'floating-card',
        label: 'Floating Card',
        description: 'Dimensional card style with soft shadow',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:transparent;">
  <tr>
    <td style="padding:${p.paddingTop || 20}px ${p.paddingRight || 20}px ${p.paddingBottom || 20}px ${p.paddingLeft || 20}px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <tr>
                <td style="padding:${p.paddingTop || 40}px ${p.paddingRight || 40}px ${p.paddingBottom || 40}px ${p.paddingLeft || 40}px;text-align:${p.align || 'center'};">
                    <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 28}px;font-weight:700;color:#1e1535;line-height:1.2;">
                        ${p.headingText || 'Floating Card Style'}
                    </h2>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#475569;line-height:1.6;">
                        ${p.subText || 'Add depth to your content with a floating design.'}
                    </p>
                </td>
            </tr>
        </table>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 7: Diagonal Accent Hero ──────────────────────────────────────
    {
        id: 'diagonal-accent-hero',
        label: 'Diagonal Accent',
        description: 'High-impact banner with a vibrant diagonal accent',
        toHtml(p: any, id: string): string {
            const from = p.bgGradientFrom || p.bgColor || '#ffffff';
            const to = p.bgGradientTo || p.accentColor || '#7530fb';
            const bg = `background:linear-gradient(135deg, ${from} 0%, ${from} 50%, ${to} 50%, ${to} 100%);`;

            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:12px;overflow:hidden;">
  <tr>
    <td style="${bg}padding:${p.paddingTop || 60}px ${p.paddingRight || 30}px ${p.paddingBottom || 60}px ${p.paddingLeft || 30}px;min-height:${p.minHeight || 200}px;text-align:${p.align || 'left'};position:relative;">
        <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 32}px;font-weight:900;color:${p.headingColor || '#1e1535'};cursor:text;">${p.headingText || 'Diagonal Impact'}</h2>
        <p data-editable="true" data-prop-key="subText" style="margin:0;font-family:Arial,sans-serif;font-size:16px;color:${p.subColor || '#475569'};cursor:text;">${p.subText || 'High-impact diagonal accent layout.'}</p>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 8: Animated Gradient Wave ──────────────────────────────────────────
    {
        id: 'gradient-wave',
        label: 'Animated Gradient Wave',
        description: 'Banner with animated 3-stop gradient',
        toHtml(p: any, id: string): string {
            const from = p.bgGradientFrom || '#7530fb';
            const mid = p.bgGradientMid || '#3b82f6';
            const to = p.bgGradientTo || '#1e1535';
            const speed = p.gradientSpeed || 6;

            const bg = `background:linear-gradient(270deg, ${from}, ${mid}, ${to}); background-size: 300% 300%; animation: riazifyWave ${speed}s ease infinite;`;

            return `<!--[riazify:banner:${id}]-->
<style>
@keyframes riazifyWave {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
</style>
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:12px;overflow:hidden;">
  <tr>
    <td style="${bg}padding:${p.paddingTop || 60}px ${p.paddingRight || 30}px ${p.paddingBottom || 60}px ${p.paddingLeft || 30}px;text-align:${p.align || 'center'};">
        <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize || 32}px;font-weight:900;color:${p.headingColor || '#ffffff'};cursor:text;">${p.headingText || 'Gradient Wave'}</h2>
        <p data-editable="true" data-prop-key="subText" style="margin:0;font-family:Arial,sans-serif;font-size:16px;color:${p.subColor || '#ffffff'};cursor:text;">${p.subText || 'Dynamic 3-stop animated gradient banner.'}</p>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 9: Trust Ribbon ──────────────────────────────────────────
    {
        id: 'trust-ribbon',
        label: 'Trust Ribbon',
        description: '3-column trust & guarantee benefits',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor || '#ffffff'};border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
  <tr>
    <td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="33%" style="text-align:center;font-family:Arial;font-size:12px;color:${p.color || '#475569'};">🛡️ Authentic</td>
                <td width="33%" style="text-align:center;font-family:Arial;font-size:12px;color:${p.color || '#475569'};">🚚 Fast Ship</td>
                <td width="33%" style="text-align:center;font-family:Arial;font-size:12px;color:${p.color || '#475569'};">⭐ Top Seller</td>
            </tr>
        </table>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 10: Flash Deal ──────────────────────────────────────────
    {
        id: 'flash-deal',
        label: 'Flash Deal',
        description: 'High-contrast urgency banner',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor || '#1e1535'};border-radius:12px;overflow:hidden;">
  <tr>
    <td style="padding:${p.paddingTop || 40}px ${p.paddingRight || 30}px ${p.paddingBottom || 40}px ${p.paddingLeft || 30}px;text-align:center;">
        <div style="display:inline-block;background-color:${p.accentColor || '#b8fa33'};color:#000;font-weight:bold;padding:4px 12px;border-radius:20px;font-family:Arial;font-size:12px;margin-bottom:12px;">LIMITED TIME OFFER</div>
        <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 12px;font-family:Arial;font-size:${p.headingSize || 32}px;font-weight:900;color:#ffffff;cursor:text;">${p.headingText || 'Flash Sale!'}</h2>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    },
    // ── Variant 11: Dark Luxury ──────────────────────────────────────────
    {
        id: 'dark-luxury',
        label: 'Dark Luxury',
        description: 'Premium dark slate and gold style',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:#0f172a;border-radius:12px;overflow:hidden;border:2px solid #c9a84c;">
  <tr>
    <td style="padding:${p.paddingTop || 60}px ${p.paddingRight || 30}px ${p.paddingBottom || 60}px ${p.paddingLeft || 30}px;text-align:center;">
        <h2 data-editable="true" data-prop-key="headingText" style="margin:0 0 12px;font-family:Times New Roman,serif;font-size:${p.headingSize || 36}px;font-weight:400;color:#c9a84c;letter-spacing:2px;cursor:text;">${p.headingText || 'PREMIUM COLLECTION'}</h2>
        <p data-editable="true" data-prop-key="subText" style="margin:0;font-family:Arial;font-size:14px;color:#ffffff;letter-spacing:1px;cursor:text;">${p.subText || 'Exquisite quality, delivered.'}</p>
    </td>
  </tr>
</table>
<!--[/riazify:banner:${id}]-->`
        }
    }
]

export function getBannerVariant(variantId: string): BannerVariant {
    return bannerVariants.find(v => v.id === variantId) ?? bannerVariants[0]
}
