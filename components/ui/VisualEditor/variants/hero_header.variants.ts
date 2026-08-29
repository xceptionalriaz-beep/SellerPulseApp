// components/ui/VisualEditor/variants/hero_header.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hero Header — 5 layout variants
// All use the same HeroHeaderProps — seller never re-types content
// ─────────────────────────────────────────────────────────────────────────────

// Inline type to avoid module resolution issues before files are pushed
export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 28}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 28}px ${p.paddingLeft ?? 24}px;`
}

export const heroHeaderVariants: BlockVariant[] = [

  // ── Variant 1: Gradient Banner ────────────────────────────────────────────
  {
    id: 'gradient',
    label: 'Gradient Banner',
    description: 'Full-width gradient background with centred text',
    toHtml(props: any, id: string): string {
      const p = props
      const bg = p.bgGradient
        ? `background:linear-gradient(${p.bgGradientDir ?? 135}deg,${p.bgGradientFrom ?? p.gradientFrom ?? '#7530fb'},${p.bgGradientTo ?? p.gradientTo ?? '#1e1535'});`
        : `background-color:${p.bgColor ?? '#1e1535'};`
      const logoHtml = p.showLogo && p.logoUrl
        ? `<tr><td style="text-align:${p.align ?? 'center'};padding-bottom:12px;"><img src="${p.logoUrl}" alt="${p.storeName}" height="50" style="height:50px;width:auto;display:inline-block;border:0;" /></td></tr>`
        : ''
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="${bg}${pad(p)}min-height:${p.height ?? 120}px;text-align:${p.align ?? 'center'};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${logoHtml}
        <tr><td style="text-align:${p.align ?? 'center'};">
          <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};letter-spacing:0.02em;">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};line-height:1.6;">${p.tagline ?? ''}</p>
        </td></tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 2: Split Layout ───────────────────────────────────────────────
  {
    id: 'split',
    label: 'Split Layout',
    description: 'Store name left, logo or accent panel right',
    toHtml(props: any, id: string): string {
      const p = props
      const bg = p.bgGradient
        ? `background:linear-gradient(135deg,${p.bgGradientFrom ?? p.gradientFrom ?? '#7530fb'},${p.bgGradientTo ?? p.gradientTo ?? '#1e1535'});`
        : `background-color:${p.bgColor ?? '#1e1535'};`
      const rightBg = p.bgGradientTo ?? p.gradientTo ?? '#1e1535'
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;overflow:hidden;border-radius:${p.borderRadius ?? 0}px;">
  <tr>
    <!-- Left: store info -->
    <td width="65%" style="${bg}${pad(p)}min-height:${p.height ?? 120}px;vertical-align:middle;">
      ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="40" style="height:40px;width:auto;display:block;border:0;margin-bottom:10px;" />`
          : ''}
      <h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};">${p.tagline ?? ''}</p>
    </td>
    <!-- Right: accent panel -->
    <td width="35%" style="background-color:${rightBg};opacity:0.85;vertical-align:middle;text-align:center;padding:20px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:28px;color:${p.textColor ?? '#ffffff'};opacity:0.15;font-weight:900;">✦</p>
      <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;color:${p.taglineColor ?? 'rgba(255,255,255,0.5)'};text-transform:uppercase;letter-spacing:2px;">Official Store</p>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 3: Minimal Bar ────────────────────────────────────────────────
  {
    id: 'minimal',
    label: 'Minimal Bar',
    description: 'Slim bar — store name left, tagline right',
    toHtml(props: any, id: string): string {
      const p = props
      const bg = `background-color:${p.bgColor ?? '#1e1535'};`
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;${bg}border-radius:${p.borderRadius ?? 0}px;">
  <tr>
    <td style="padding:14px 24px;vertical-align:middle;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="28" style="height:28px;width:auto;display:inline-block;border:0;vertical-align:middle;margin-right:10px;" />`
          : ''}
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:${Math.min(p.nameFontSize ?? 18, 20)}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</span>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="font-family:Arial,sans-serif;font-size:11px;color:${p.taglineColor ?? 'rgba(255,255,255,0.6)'};">${p.tagline ?? ''}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 4: Image Background ───────────────────────────────────────────
  {
    id: 'image-bg',
    label: 'Image Background',
    description: 'Background image with dark overlay and text on top',
    toHtml(props: any, id: string): string {
      const p = props
      const imgUrl = p.logoUrl || ''
      const overlayColor = p.bgColor ?? '#1e1535'
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="min-height:${p.height ?? 140}px;${pad(p)}text-align:${p.align ?? 'center'};background-color:${overlayColor};position:relative;">
      ${imgUrl ? `<!--[if !mso]><!-->
      <div style="position:relative;background-image:url('${imgUrl}');background-size:cover;background-position:center;min-height:${p.height ?? 140}px;padding:${p.paddingTop ?? 28}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 28}px ${p.paddingLeft ?? 24}px;text-align:${p.align ?? 'center'};">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:${overlayColor};opacity:0.72;"></div>
        <div style="position:relative;z-index:1;">
          <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.8)'};">${p.tagline ?? ''}</p>
        </div>
      </div>
      <!--<![endif]-->
      <!--[if mso]>` : ''}
      <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.8)'};">${p.tagline ?? ''}</p>
      ${imgUrl ? `<!--<![endif]-->` : ''}
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 5: Bold Typographic ───────────────────────────────────────────
  {
    id: 'typographic',
    label: 'Bold Typographic',
    description: 'Giant store name, accent underline — clean & minimal',
    toHtml(props: any, id: string): string {
      const p = props
      const bg = `background-color:${p.bgColor ?? '#ffffff'};`
      const accentColor = p.bgGradientFrom ?? p.gradientFrom ?? '#7530fb'
      const textCol = p.textColor === '#ffffff' ? '#1e1535' : (p.textColor ?? '#1e1535')
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;${bg}border-radius:${p.borderRadius ?? 0}px;">
  <tr>
    <td style="${pad(p)}min-height:${p.height ?? 100}px;text-align:${p.align ?? 'center'};">
      ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="36" style="height:36px;width:auto;display:block;border:0;margin:0 auto 12px;" />`
          : ''}
      <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${Math.max(p.nameFontSize ?? 32, 28)}px;font-weight:900;color:${textCol};letter-spacing:-0.02em;line-height:1.1;">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <!-- Accent underline -->
      <div style="width:60px;height:4px;background-color:${accentColor};margin:10px auto 12px;border-radius:2px;"></div>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor !== 'rgba(255,255,255,0.7)' ? p.taglineColor : '#6b7280'};line-height:1.6;">${p.tagline ?? ''}</p>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 6: Credibility Banner ────────────────────────────────────────
  {
    id: 'credibility',
    label: 'Credibility Banner',
    description: 'Lead with trust — feedback score, rating and Top Rated badge',
    toHtml(props: any, id: string): string {
      const p = props
      const bg = p.bgGradient
        ? `background:linear-gradient(135deg,${p.bgGradientFrom ?? p.gradientFrom ?? '#1e1535'},${p.bgGradientTo ?? p.gradientTo ?? '#0f172a'});`
        : `background-color:${p.bgColor ?? '#1e1535'};`
      const accentColor = '#f59e0b'   // amber — trust/credibility colour
      const stars = '★★★★★'
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="${bg}${pad(p)}min-height:${p.height ?? 100}px;vertical-align:middle;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left: credibility signals -->
          <td width="38%" style="vertical-align:middle;padding-right:20px;border-right:1px solid rgba(255,255,255,0.12);">
            <!-- Star rating -->
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:20px;color:${accentColor};letter-spacing:2px;">${stars}</p>
            <!-- Feedback score -->
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.9);font-weight:700;">
              {{FEEDBACK_SCORE}} Positive Reviews
            </p>
            <!-- Top Rated badge -->
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${accentColor};border-radius:4px;padding:3px 10px;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#1e1535;text-transform:uppercase;letter-spacing:0.08em;">
                    ★ Top Rated Seller
                  </p>
                </td>
              </tr>
            </table>
          </td>
          <!-- Right: store name + tagline -->
          <td width="62%" style="vertical-align:middle;padding-left:20px;">
            ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="32" style="height:32px;width:auto;display:block;border:0;margin-bottom:8px;" />`
          : ''}
            <h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 22}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 12}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.65)'};line-height:1.5;">${p.tagline ?? ''}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 7: Announcement Strip ────────────────────────────────────────
  {
    id: 'announcement',
    label: 'Announcement Strip',
    description: 'Slim single-line bar — minimal branding with key selling points',
    toHtml(props: any, id: string): string {
      const p = props
      const bg = `background-color:${p.bgColor ?? '#1e1535'};`
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="${bg}padding:10px 24px;text-align:center;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.taglineFontSize ?? 12}px;font-weight:${p.nameFontWeight ?? '700'};color:${p.textColor ?? '#ffffff'};letter-spacing:0.06em;">
        ${p.storeName ?? '{{SELLER_NAME}}'} &nbsp;·&nbsp; ${p.tagline ?? 'Free Delivery · Same Day Dispatch · 5 Star Rated'}
      </p>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 8: Dark Luxury ────────────────────────────────────────────────
  {
    id: 'luxury',
    label: 'Dark Luxury',
    description: 'Pure black with gold accent — premium jewellery and watches',
    toHtml(props: any, id: string): string {
      const p = props
      const goldColor = '#c9a84c'
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:#000000;border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="padding:${p.paddingTop ?? 28}px ${p.paddingRight ?? 40}px ${p.paddingBottom ?? 28}px ${p.paddingLeft ?? 40}px;text-align:${p.align ?? 'center'};">
      ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="36" style="height:36px;width:auto;display:block;border:0;margin:0 auto 14px;" />`
          : ''}
      <!-- Gold top line -->
      <div style="width:40px;height:1px;background-color:${goldColor};margin:0 auto 16px;"></div>
      <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:${p.nameFontSize ?? 26}px;font-weight:400;color:#ffffff;letter-spacing:0.12em;">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <!-- Gold bottom line -->
      <div style="width:40px;height:1px;background-color:${goldColor};margin:10px auto 12px;"></div>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 11}px;color:${goldColor};letter-spacing:0.18em;text-transform:uppercase;">${p.tagline ?? ''}</p>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 9: Category Banner ────────────────────────────────────────────
  {
    id: 'category',
    label: 'Category Banner',
    description: 'Coloured accent stripe with category specialist badge',
    toHtml(props: any, id: string): string {
      const p = props
      const accentColor = p.bgGradientFrom ?? p.gradientFrom ?? '#7530fb'
      const bg = `background-color:${p.bgColor ?? '#ffffff'};`
      const badgeText = p.categoryBadge ?? 'Specialist Seller'
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;${bg}border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <!-- Left accent stripe -->
    <td width="6" style="background-color:${accentColor};padding:0;width:6px;"></td>
    <!-- Content -->
    <td style="padding:${p.paddingTop ?? 18}px 20px ${p.paddingBottom ?? 18}px 20px;vertical-align:middle;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="32" style="height:32px;width:auto;display:block;border:0;margin-bottom:6px;" />`
          : ''}
            <h1 style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 22}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#1e1535'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 12}px;color:${p.taglineColor ?? '#6b7280'};">${p.tagline ?? ''}</p>
          </td>
          <td style="text-align:right;vertical-align:middle;white-space:nowrap;">
            <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
              <tr>
                <td style="background-color:${accentColor};border-radius:6px;padding:6px 14px;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;white-space:nowrap;">${badgeText}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

  // ── Variant 10: Seasonal / Sale ───────────────────────────────────────────
  {
    id: 'seasonal',
    label: 'Seasonal / Sale',
    description: 'Bold sale banner with prominent badge — great for promotions',
    toHtml(props: any, id: string): string {
      const p = props
      const saleColor = p.bgGradientFrom ?? p.gradientFrom ?? '#dc2626'
      const saleBg = p.bgColor ?? '#1e1535'
      const badgeText = p.saleBadgeText ?? 'SALE'
      return `<!--[riazify:hero_header:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${saleBg};border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 28}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 28}px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Sale badge left -->
          <td width="80" style="vertical-align:middle;padding-right:18px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${saleColor};border-radius:8px;padding:10px 8px;text-align:center;min-width:64px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:0.04em;line-height:1;">${badgeText}</p>
                </td>
              </tr>
            </table>
          </td>
          <!-- Store name + tagline -->
          <td style="vertical-align:middle;">
            <h1 style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 22}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 12}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};">${p.tagline ?? ''}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:hero_header:${id}]-->`
    },
  },

]

// Helper — get variant by id, fallback to gradient
export function getHeroVariant(variantId: string): BlockVariant {
  return heroHeaderVariants.find(v => v.id === variantId) ?? heroHeaderVariants[0]
}
