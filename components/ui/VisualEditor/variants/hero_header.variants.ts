// components/ui/VisualEditor/variants/hero_header.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hero Header — 10 layout variants
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

function heroMobileStyle(): string {
  return `<style>
  @media only screen and (max-width: 680px) {
    .hero-table { width:100% !important; min-width:100% !important; }
    .hero-stack { display:block !important; width:100% !important; box-sizing:border-box !important; text-align:center !important; }
    .hero-pad-mobile { padding:18px 14px !important; }
    .hero-title-mobile { font-size:20px !important; line-height:1.25 !important; }
    .hero-sub-mobile { font-size:12px !important; line-height:1.4 !important; }

    /* Split layout mobile stacking */
    .hero-split-left { display:block !important; width:100% !important; text-align:center !important; padding:20px 16px !important; }
    .hero-split-right { display:block !important; width:100% !important; text-align:center !important; padding:14px 16px !important; border-top:1px solid rgba(255,255,255,0.15) !important; }

    /* Minimal bar mobile stacking */
    .hero-min-left { display:block !important; width:100% !important; text-align:center !important; padding-bottom:6px !important; }
    .hero-min-right { display:block !important; width:100% !important; text-align:center !important; }

    /* Credibility banner mobile centering */
    .hero-cred-left { display:block !important; width:100% !important; text-align:center !important; border-right:none !important; border-bottom:1px solid rgba(255,255,255,0.15) !important; padding-right:0 !important; padding-bottom:14px !important; margin-bottom:14px !important; }
    .hero-cred-right { display:block !important; width:100% !important; text-align:center !important; padding-left:0 !important; }
    .hero-cred-badge-table { margin:0 auto !important; display:table !important; }

    /* Category banner mobile stacking */
    .hero-cat-content { display:block !important; width:100% !important; text-align:center !important; }
    .hero-cat-badge-cell { display:block !important; width:100% !important; text-align:center !important; padding-top:10px !important; }
    .hero-cat-badge-table { margin:0 auto !important; display:table !important; }

    /* Seasonal banner mobile centering */
    .hero-sale-badge-cell { display:block !important; width:100% !important; text-align:center !important; padding-right:0 !important; padding-bottom:12px !important; }
    .hero-sale-badge-table { margin:0 auto !important; display:table !important; }
    .hero-sale-content { display:block !important; width:100% !important; text-align:center !important; }
  }
</style>`
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <td class="hero-pad-mobile" style="${bg}${pad(p)}min-height:${p.height ?? 120}px;text-align:${p.align ?? 'center'};border-radius:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${logoHtml}
        <tr><td style="text-align:${p.align ?? 'center'};">
          <h1 class="hero-title-mobile" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};letter-spacing:0.02em;">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
          <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};line-height:1.6;">${p.tagline ?? ''}</p>
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <!-- Left: store info -->
    <td width="65%" class="hero-split-left" style="${bg}${pad(p)}min-height:${p.height ?? 120}px;vertical-align:middle;border-radius:0;">
      ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="40" style="height:40px;width:auto;display:block;border:0;margin:0 auto 10px;" />`
          : ''}
      <h1 class="hero-title-mobile" style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};">${p.tagline ?? ''}</p>
    </td>
    <!-- Right: accent panel -->
    <td width="35%" class="hero-split-right" style="background-color:${rightBg};opacity:0.85;vertical-align:middle;text-align:center;padding:20px;border-radius:0;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:28px;color:${p.textColor ?? '#ffffff'};opacity:0.25;font-weight:900;">✦</p>
      <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:11px;color:${p.taglineColor ?? 'rgba(255,255,255,0.65)'};text-transform:uppercase;letter-spacing:2px;font-weight:700;">Official Store</p>
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;${bg}border-radius:0;margin:0;border-collapse:collapse;">
  <tr>
    <td style="padding:14px 24px;vertical-align:middle;border-radius:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="hero-min-left" style="vertical-align:middle;">
            ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="28" style="height:28px;width:auto;display:inline-block;border:0;vertical-align:middle;margin-right:10px;" />`
          : ''}
            <span class="hero-title-mobile" style="font-family:Arial,Helvetica,sans-serif;font-size:${Math.min(p.nameFontSize ?? 18, 20)}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</span>
          </td>
          <td class="hero-min-right" style="text-align:right;vertical-align:middle;">
            <span class="hero-sub-mobile" style="font-family:Arial,sans-serif;font-size:12px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};">${p.tagline ?? ''}</span>
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <td class="hero-pad-mobile" style="min-height:${p.height ?? 140}px;${pad(p)}text-align:${p.align ?? 'center'};background-color:${overlayColor};position:relative;border-radius:0;">
      ${imgUrl ? `<!--[if !mso]><!-->
      <div style="position:relative;background-image:url('${imgUrl}');background-size:cover;background-position:center;min-height:${p.height ?? 140}px;padding:${p.paddingTop ?? 28}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 28}px ${p.paddingLeft ?? 24}px;text-align:${p.align ?? 'center'};border-radius:0;">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:${overlayColor};opacity:0.72;"></div>
        <div style="position:relative;z-index:1;">
          <h1 class="hero-title-mobile" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
          <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.8)'};">${p.tagline ?? ''}</p>
        </div>
      </div>
      <!--<![endif]-->
      <!--[if mso]>` : ''}
      <h1 class="hero-title-mobile" style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 26}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.8)'};">${p.tagline ?? ''}</p>
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
      const textCol = p.textColor === '#ffffff' ? '#fdfdfd' : (p.textColor ?? '#1e1535')
      return `<!--[riazify:hero_header:${id}]-->
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;${bg}border-radius:0;margin:0;border-collapse:collapse;">
  <tr>
    <td class="hero-pad-mobile" style="${pad(p)}min-height:${p.height ?? 100}px;text-align:${p.align ?? 'center'};border-radius:0;">
      ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="36" style="height:36px;width:auto;display:block;border:0;margin:0 auto 12px;" />`
          : ''}
      <h1 class="hero-title-mobile" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${Math.max(p.nameFontSize ?? 32, 28)}px;font-weight:900;color:${textCol};letter-spacing:-0.02em;line-height:1.1;">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <!-- Accent underline (straight 0px edges) -->
      <div style="width:60px;height:4px;background-color:${accentColor};margin:10px auto 12px;border-radius:0;"></div>
      <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 13}px;color:${p.taglineColor !== 'rgba(255,255,255,0.7)' ? p.taglineColor : '#6b7280'};line-height:1.6;">${p.tagline ?? ''}</p>
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
      const accentColor = '#f59e0b'
      const stars = '★★★★★'
      return `<!--[riazify:hero_header:${id}]-->
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <td class="hero-pad-mobile" style="${bg}${pad(p)}min-height:${p.height ?? 100}px;vertical-align:middle;border-radius:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left: credibility signals (centered on mobile) -->
          <td width="38%" class="hero-cred-left" style="vertical-align:middle;padding-right:20px;border-right:1px solid rgba(255,255,255,0.12);border-radius:0;">
            <!-- Star rating -->
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:20px;color:${accentColor};letter-spacing:2px;">${stars}</p>
            <!-- Feedback score -->
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.9);font-weight:700;">
              {{FEEDBACK_SCORE}} Positive Reviews
            </p>
            <!-- Top Rated badge (centered on mobile, straight borders) -->
            <table cellpadding="0" cellspacing="0" border="0" class="hero-cred-badge-table">
              <tr>
                <td style="background-color:${accentColor};border-radius:0;padding:4px 10px;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#1e1535;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;">
                    ★ Top Rated Seller
                  </p>
                </td>
              </tr>
            </table>
          </td>
          <!-- Right: store name + tagline (centered on mobile) -->
          <td width="62%" class="hero-cred-right" style="vertical-align:middle;padding-left:20px;border-radius:0;">
            ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="32" style="height:32px;width:auto;display:inline-block;border:0;margin-bottom:8px;" />`
          : ''}
            <h1 class="hero-title-mobile" style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 22}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
            <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 12}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.65)'};line-height:1.5;">${p.tagline ?? ''}</p>
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <td style="${bg}padding:12px 20px;text-align:center;border-radius:0;">
      <p class="hero-sub-mobile" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.taglineFontSize ?? 12}px;font-weight:${p.nameFontWeight ?? '700'};color:${p.textColor ?? '#ffffff'};letter-spacing:0.04em;line-height:1.5;">
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;background-color:#000000;border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <td class="hero-pad-mobile" style="padding:${p.paddingTop ?? 28}px ${p.paddingRight ?? 40}px ${p.paddingBottom ?? 28}px ${p.paddingLeft ?? 40}px;text-align:${p.align ?? 'center'};border-radius:0;">
      ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="36" style="height:36px;width:auto;display:block;border:0;margin:0 auto 14px;" />`
          : ''}
      <!-- Gold top line -->
      <div style="width:40px;height:1px;background-color:${goldColor};margin:0 auto 16px;border-radius:0;"></div>
      <h1 class="hero-title-mobile" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:${p.nameFontSize ?? 26}px;font-weight:400;color:#ffffff;letter-spacing:0.12em;">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
      <!-- Gold bottom line -->
      <div style="width:40px;height:1px;background-color:${goldColor};margin:10px auto 12px;border-radius:0;"></div>
      <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 11}px;color:${goldColor};letter-spacing:0.18em;text-transform:uppercase;">${p.tagline ?? ''}</p>
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;${bg}border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <!-- Left accent stripe -->
    <td width="6" style="background-color:${accentColor};padding:0;width:6px;border-radius:0;"></td>
    <!-- Content -->
    <td class="hero-pad-mobile" style="padding:${p.paddingTop ?? 18}px 20px ${p.paddingBottom ?? 18}px 20px;vertical-align:middle;border-radius:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="hero-cat-content" style="vertical-align:middle;">
            ${p.showLogo && p.logoUrl
          ? `<img src="${p.logoUrl}" alt="${p.storeName}" height="32" style="height:32px;width:auto;display:inline-block;border:0;margin-bottom:6px;" />`
          : ''}
            <h1 class="hero-title-mobile" style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 22}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#1e1535'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
            <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 12}px;color:${p.taglineColor ?? '#6b7280'};">${p.tagline ?? ''}</p>
          </td>
          <td class="hero-cat-badge-cell" style="text-align:right;vertical-align:middle;white-space:nowrap;">
            <table cellpadding="0" cellspacing="0" border="0" class="hero-cat-badge-table" style="display:inline-table;">
              <tr>
                <td style="background-color:${accentColor};border-radius:0;padding:6px 14px;">
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
${heroMobileStyle()}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="hero-table" style="width:100% !important;max-width:100% !important;background-color:${saleBg};border-radius:0;margin:0;border-collapse:collapse;overflow:hidden;">
  <tr>
    <td class="hero-pad-mobile" style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 28}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 28}px;border-radius:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Sale badge left (stacks and centers on mobile) -->
          <td width="80" class="hero-sale-badge-cell" style="vertical-align:middle;padding-right:18px;">
            <table cellpadding="0" cellspacing="0" border="0" class="hero-sale-badge-table">
              <tr>
                <td style="background-color:${saleColor};border-radius:0;padding:10px 14px;text-align:center;min-width:64px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:0.04em;line-height:1;white-space:nowrap;">${badgeText}</p>
                </td>
              </tr>
            </table>
          </td>
          <!-- Store name + tagline -->
          <td class="hero-sale-content" style="vertical-align:middle;">
            <h1 class="hero-title-mobile" style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 22}px;font-weight:${p.nameFontWeight ?? '900'};color:${p.textColor ?? '#ffffff'};">${p.storeName ?? '{{SELLER_NAME}}'}</h1>
            <p class="hero-sub-mobile" style="margin:0;font-family:Arial,sans-serif;font-size:${p.taglineFontSize ?? 12}px;color:${p.taglineColor ?? 'rgba(255,255,255,0.7)'};">${p.tagline ?? ''}</p>
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
