// lib/banner-slots.ts
// Standardized slot components for eBay templates

export interface BannerSlots {
  hasImage?: boolean
  hasCta?: boolean
  hasBadge?: boolean
}

export const renderBadge = (p: any) => p.badgeText ? `
  <div style="display:inline-block;margin-bottom:12px;padding:6px 14px;border-radius:20px;background-color:${p.badgeBg || '#fff'};color:${p.badgeColor || '#7530fb'};font-family:Arial,sans-serif;font-size:12px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
    ${p.badgeText}
  </div>` : '';

export const renderCta = (p: any) => p.ctaText ? `
  <div style="margin-top:20px;text-align:${p.align || 'center'};">
    <a href="${p.ctaUrl || '#'}" style="display:inline-block;padding:12px 24px;background-color:${p.ctaBgColor || '#b8fa33'};color:${p.ctaTextColor || '#1e1535'};text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;">
      ${p.ctaText}
    </a>
  </div>` : '';
