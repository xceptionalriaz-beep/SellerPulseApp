// components/ui/VisualEditor/variants/cta_banner.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// CTA Banner — 10 layout variants  (all email-safe, mobile-responsive via @media)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './hero_header.variants'
import type { CtaBannerProps } from '../blocks'

// ── Shared helpers ────────────────────────────────────────────────────────────

function pad(p: CtaBannerProps): string {
  return `padding-top:${p.paddingTop ?? 16}px;padding-bottom:${p.paddingBottom ?? 16}px;padding-left:${p.paddingLeft ?? 24}px;padding-right:${p.paddingRight ?? 24}px;`
}

function accent(p: CtaBannerProps): string {
  // Use gradient start colour as accent when available, else fall back to purple
  return (p as any).accentColor ?? '#7530fb'
}

function bg(p: CtaBannerProps): string {
  return p.bgGradient
    ? `background:linear-gradient(${(p as any).bgGradientDir ?? 135}deg,${p.gradientFrom ?? '#7530fb'},${p.gradientTo ?? '#1e1535'});`
    : `background-color:${p.bgColor ?? '#1e1535'};`
}

function mobileStyle(): string {
  return `<style>
@media only screen and (max-width:600px){
  .ctab-col{display:block!important;width:100%!important;box-sizing:border-box!important;}
  .ctab-btn{width:100%!important;text-align:center!important;box-sizing:border-box!important;}
  .ctab-hide-mobile{display:none!important;}
  .ctab-pt{padding-top:14px!important;padding-left:0!important;text-align:center!important;}
  .ctab-full{width:100%!important;box-sizing:border-box!important;border-right:none!important;border-bottom:1px solid #e5e7eb!important;margin-bottom:10px!important;padding-bottom:12px!important;}
  .ctab-full:last-child{border-bottom:none!important;margin-bottom:0!important;}
  /* Social Proof mobile fix (Centered in middle on mobile) */
  .ctab-social-left{display:block!important;width:100%!important;border-right:none!important;border-bottom:1px solid rgba(150,150,150,0.25)!important;padding-right:0!important;padding-bottom:14px!important;box-sizing:border-box!important;text-align:center!important;}
  .ctab-social-right{display:block!important;width:100%!important;padding-left:0!important;padding-top:14px!important;box-sizing:border-box!important;text-align:center!important;}
  /* Announcement mobile fix */
  .ctab-ann-tag{display:block!important;width:100%!important;padding-right:0!important;margin-bottom:6px!important;}
  .ctab-ann-text{display:block!important;width:100%!important;padding-right:0!important;}
}
</style>`
}

// ── 1. ctab-trust-bar ─────────────────────────────────────────────────────────
function trustBar(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const headClr = p.textColor ?? '#1e1535'
  const subClr = p.subTextColor ?? '#6b7280'
  return `${mobileStyle()}
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;background-color:${p.bgColor ?? '#ffffff'};border-bottom:3px solid ${ac};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left: icon + headline -->
          <td class="ctab-col" valign="middle" style="width:50%;padding-right:12px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:8px;">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="8.5" fill="${ac}" stroke="${ac}"/>
                    <path d="M5 9.5L7.5 12L13 6.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td valign="middle">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headClr};letter-spacing:0.01em;">${p.headingText ?? 'Buy with Confidence — Trusted eBay Seller'}</span>
                </td>
              </tr>
            </table>
          </td>
          <!-- Right: trust pills (Fluid Wrapping on Mobile) -->
          <td class="ctab-col ctab-pt" valign="middle" style="width:50%;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="display:inline-block;background-color:#f3f4f6;color:${subClr};font-family:Arial,sans-serif;font-size:11px;font-weight:600;padding:4px 9px;border-radius:0;margin:2px 3px;white-space:nowrap;">&#10003;&nbsp;Genuine Items</span>
              <span style="display:inline-block;background-color:#f3f4f6;color:${subClr};font-family:Arial,sans-serif;font-size:11px;font-weight:600;padding:4px 9px;border-radius:0;margin:2px 3px;white-space:nowrap;">&#128274;&nbsp;Secure Payment</span>
              <span style="display:inline-block;background-color:#f3f4f6;color:${subClr};font-family:Arial,sans-serif;font-size:11px;font-weight:600;padding:4px 9px;border-radius:0;margin:2px 3px;white-space:nowrap;">&#9889;&nbsp;Fast Dispatch</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 2. ctab-split-action ──────────────────────────────────────────────────────
function splitAction(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const headClr = p.textColor ?? '#ffffff'
  const subClr = p.subTextColor ?? 'rgba(255,255,255,0.7)'
  return `${mobileStyle()}
<style>
@media only screen and (max-width:600px){
  .ctab-split-content{text-align:center!important;padding:20px 16px 10px 16px!important;}
  .ctab-split-action{text-align:center!important;padding:10px 16px 20px 16px!important;}
}
</style>
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;${bg(p)}border-radius:0;overflow:hidden;">
  <tr>
    <!-- Left 60%: content (Centered on mobile) -->
    <td class="ctab-col ctab-split-content" valign="middle" style="width:60%;${pad(p)}padding-right:0;box-sizing:border-box;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:${headClr};line-height:1.3;">${p.headingText ?? 'Got Questions? We\'re Here to Help!'}</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${subClr};line-height:1.6;">${p.subText ?? 'Our expert team responds within 1 business hour'}</p>
    </td>
    <!-- Divider -->
    <td class="ctab-hide-mobile" width="1" style="background-color:rgba(255,255,255,0.2);padding:0;width:1px;">&nbsp;</td>
    <!-- Right 40%: button (Centered in middle on mobile) -->
    <td class="ctab-col ctab-split-action" valign="middle" style="width:40%;text-align:center;padding:${p.paddingTop ?? 16}px 24px;box-sizing:border-box;">
      <a href="${(p as any).linkUrl ?? '#'}" style="display:inline-block;padding:13px 28px;background-color:${ac};color:#ffffff;text-decoration:none;border-radius:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.02em;white-space:nowrap;">${(p as any).buttonText ?? 'Contact Seller'}</a>
    </td>
  </tr>
</table>`
}

// ── 3. ctab-flash-deal ────────────────────────────────────────────────────────
function flashDeal(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  return `${mobileStyle()}
<style>
@keyframes ctabGradSpin{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.ctab-flash-btn{background:linear-gradient(270deg,#ff6b00,#ff0040,#ff6b00);background-size:200% 200%;animation:ctabGradSpin 2.5s ease infinite;}
@media only screen and (max-width:600px){
  .ctab-flash-content{text-align:center!important;padding:20px 16px 12px 16px!important;}
  .ctab-flash-action{text-align:center!important;padding:4px 16px 20px 16px!important;}
}
</style>
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-radius:0;overflow:hidden;">
  <!-- Urgency ribbon row -->
  <tr>
    <td colspan="3" style="background-color:#b91c1c;padding:6px 20px;text-align:center;">
      <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:0.1em;text-transform:uppercase;">&#9889; ${(p as any).ribbonText ?? 'LIMITED TIME &mdash; ENDS MIDNIGHT'}</span>
    </td>
  </tr>
  <!-- Main content row -->
  <tr>
    <td style="background:linear-gradient(135deg,#dc2626,#ea580c);padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Content: Centered on mobile -->
          <td class="ctab-col ctab-flash-content" valign="middle" style="width:65%;padding:20px 16px 20px 24px;box-sizing:border-box;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:#ffffff;line-height:1.25;text-transform:uppercase;">${p.headingText ?? 'Exclusive Deal — Save Big Today!'}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.85);line-height:1.6;">${p.subText ?? 'Don\'t miss out — limited stock available at this price'}</p>
          </td>
          <!-- Button: Centered in middle on mobile -->
          <td class="ctab-col ctab-flash-action" valign="middle" style="width:35%;text-align:center;padding:20px 24px 20px 8px;box-sizing:border-box;">
            <a href="${(p as any).linkUrl ?? '#'}" class="ctab-flash-btn" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;border-radius:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;border:2px solid rgba(255,255,255,0.4);">${(p as any).buttonText ?? 'CLAIM OFFER NOW'}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 4. ctab-dark-premium ─────────────────────────────────────────────────────
function darkPremium(p: CtaBannerProps, id: string): string {
  const headClr = p.textColor ?? '#ffffff'
  const subClr = p.subTextColor ?? '#a0a0b0'
  const ctaLinkUrl = (p as any).linkUrl ?? '#'
  return `${mobileStyle()}
<!--[riazify:cta_banner:${id}]-->
<!-- Outer gold border wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;background-color:#d4af37;border-radius:0;">
  <tr>
    <td style="padding:1px;">
      <!-- Inner purple border wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#7530fb;border-radius:0;">
        <tr>
          <td style="padding:1px;">
            <!-- Inner dark bg -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#0a0a0f;border-radius:0;">
              <tr>
                <td style="${pad(p)}text-align:center;">
                  <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:900;color:${headClr};letter-spacing:0.04em;line-height:1.25;">${p.headingText ?? 'Premium Quality. Guaranteed.'}</p>
                  <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:14px;color:${subClr};letter-spacing:0.02em;line-height:1.7;">${p.subText ?? 'Authenticated &bull; Certified &bull; Trusted Since 2015'}</p>
                  <a href="${ctaLinkUrl}" style="display:inline-block;padding:11px 30px;border:1px solid #d4af37;color:#d4af37;text-decoration:none;border-radius:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${(p as any).buttonText ?? 'View Store'} &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 5. ctab-icon-value ────────────────────────────────────────────────────────
function iconValue(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const bgClr = p.bgColor ?? '#ffffff'
  const headClr = p.textColor ?? '#1e1535'
  const subClr = p.subTextColor ?? '#6b7280'
  return `${mobileStyle()}
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;background-color:${bgClr};border:1px solid #e5e7eb;border-radius:0;overflow:hidden;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Col 1 -->
          <td class="ctab-col ctab-full" valign="top" style="width:33.33%;text-align:center;padding:12px 16px;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;font-size:28px;line-height:1;">&#128737;</p>
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headClr};">Genuine Items</p>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:${subClr};line-height:1.5;">100% authentic products, verified before dispatch</p>
            <a href="${(p as any).linkUrl ?? '#'}" style="font-family:Arial,sans-serif;font-size:11px;color:${ac};font-weight:600;text-decoration:underline;">Learn more &rarr;</a>
          </td>
          <!-- Col 2 -->
          <td class="ctab-col ctab-full" valign="top" style="width:33.33%;text-align:center;padding:12px 16px;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;font-size:28px;line-height:1;">&#128666;</p>
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headClr};">Fast Dispatch</p>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:${subClr};line-height:1.5;">Same-day shipping on orders placed before 2pm</p>
            <a href="${(p as any).linkUrl ?? '#'}" style="font-family:Arial,sans-serif;font-size:11px;color:${ac};font-weight:600;text-decoration:underline;">Learn more &rarr;</a>
          </td>
          <!-- Col 3 -->
          <td class="ctab-col ctab-full" valign="top" style="width:33.33%;text-align:center;padding:12px 16px;">
            <p style="margin:0 0 8px;font-size:28px;line-height:1;">&#128260;</p>
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headClr};">Easy Returns</p>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:${subClr};line-height:1.5;">30-day hassle-free returns, no questions asked</p>
            <a href="${(p as any).linkUrl ?? '#'}" style="font-family:Arial,sans-serif;font-size:11px;color:${ac};font-weight:600;text-decoration:underline;">Learn more &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 6. ctab-ribbon ────────────────────────────────────────────────────────────
function ribbon(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const bgClr = p.bgColor ?? '#0a0a0f'
  const headClr = p.textColor ?? '#ffffff'
  return `${mobileStyle()}
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;background-color:${bgClr};border-left:4px solid ${ac};">
  <tr>
    <td style="padding:10px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" style="padding-right:12px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headClr};letter-spacing:0.05em;text-transform:uppercase;">${p.headingText ?? 'STORE-WIDE SALE &mdash; Extra 10% Off All Orders'}</span>
          </td>
          <td valign="middle" style="text-align:right;white-space:nowrap;">
            <a href="${(p as any).linkUrl ?? '#'}" style="display:inline-block;padding:6px 16px;border:1px solid ${ac};color:${ac};text-decoration:none;border-radius:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.03em;">${(p as any).buttonText ?? 'SHOP NOW'}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 7. ctab-gradient-hero ─────────────────────────────────────────────────────
function gradientHero(p: CtaBannerProps, id: string): string {
  const headClr = p.textColor ?? '#ffffff'
  const subClr = p.subTextColor ?? 'rgba(255,255,255,0.8)'
  const ac = accent(p)
  return `${mobileStyle()}
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-radius:0;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,${p.gradientFrom ?? '#7530fb'} 0%,#2d1b8e 50%,#0a0a0f 100%);${pad(p)}text-align:center;">
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:900;color:${headClr};letter-spacing:0.02em;line-height:1.25;">${p.headingText ?? 'Buy with Confidence Today'}</p>
      <p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:14px;color:${subClr};line-height:1.7;">${p.subText ?? 'Trusted eBay seller with 100% positive feedback &bull; Same-day dispatch'}</p>
      <a href="${(p as any).linkUrl ?? '#'}" style="display:inline-block;padding:14px 36px;background-color:#ffffff;color:${ac};text-decoration:none;border-radius:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;letter-spacing:0.03em;">${(p as any).buttonText ?? 'Shop Our Store'} &rarr;</a>
    </td>
  </tr>
</table>`
}

// ── 8. ctab-social-proof ─────────────────────────────────────────────────────
function socialProof(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const bgClr = p.bgColor ?? '#ffffff'
  const headClr = p.textColor ?? '#1e1535'
  const subClr = p.subTextColor ?? '#6b7280'
  return `${mobileStyle()}
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;background-color:${bgClr};border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Stars + Rating -->
          <td class="ctab-col ctab-social-left" valign="middle" style="width:55%;padding-right:20px;border-right:1px solid rgba(150,150,150,0.25);">
            <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:24px;color:#f59e0b;line-height:1;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
            <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:900;color:${ac};line-height:1.1;">4.9 <span style="font-size:16px;font-weight:600;color:${headClr};">/ 5</span></p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${subClr};">2,400+ Verified Sales &bull; 100% Positive Feedback</p>
          </td>
          <!-- Tagline + CTA -->
          <td class="ctab-col ctab-social-right" valign="middle" style="width:45%;padding-left:20px;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headClr};line-height:1.4;">${p.headingText ?? 'Trusted by thousands of happy buyers'}</p>
            <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;color:${subClr};">${p.subText ?? 'Authorised UK retailer since 2015'}</p>
            <a href="${(p as any).linkUrl ?? '#'}" style="display:inline-block;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${ac};text-decoration:none;border-bottom:1px solid ${ac};padding-bottom:1px;">${(p as any).buttonText ?? 'View Our Store'} &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 9. ctab-announcement ─────────────────────────────────────────────────────
function announcement(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const headClr = p.textColor ?? '#1e1535'
  const bgTint = (p as any).bgColor ?? '#f5f0ff'
  return `${mobileStyle()}
<style>
@media only screen and (max-width:600px){
  .ctab-ann-tag{display:block!important;width:100%!important;text-align:center!important;padding:0!important;margin-bottom:6px!important;}
  .ctab-ann-text{display:block!important;width:100%!important;text-align:center!important;padding:0!important;margin-bottom:6px!important;}
  .ctab-ann-date{display:block!important;width:100%!important;text-align:center!important;padding:0!important;}
}
</style>
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;background-color:${bgTint};border:1px solid ${ac}22;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Announcement pill (Centered on mobile) -->
          <td class="ctab-ann-tag" valign="middle" style="white-space:nowrap;padding-right:12px;width:1%;">
            <span style="display:inline-block;background-color:${ac};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:4px 10px;border-radius:0;letter-spacing:0.1em;text-transform:uppercase;">ANNOUNCEMENT</span>
          </td>
          <!-- Headline (Centered on mobile) -->
          <td class="ctab-ann-text" valign="middle" style="padding-right:12px;">
            <span style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headClr};letter-spacing:0.02em;line-height:1.4;">${p.headingText ?? 'New Returns Policy — Effective 1st November 2025'}</span>
          </td>
          <!-- Date pill (Centered on mobile) -->
          <td class="ctab-ann-date" valign="middle" style="white-space:nowrap;text-align:right;width:1%;">
            <span style="display:inline-block;background-color:#e5e7eb;color:#6b7280;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:4px 10px;border-radius:0;letter-spacing:0.05em;">TODAY ONLY</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ── 10. ctab-two-tone ─────────────────────────────────────────────────────────
function twoTone(p: CtaBannerProps, id: string): string {
  const ac = accent(p)
  const headClr = p.textColor ?? '#ffffff'
  const subClr = p.subTextColor ?? '#6b7280'
  return `${mobileStyle()}
<style>
@media only screen and (max-width:600px){
  .ctab-twotone-top{text-align:center!important;padding:20px 16px!important;}
  .ctab-twotone-bottom{text-align:center!important;padding:20px 16px!important;}
}
</style>
<!--[riazify:cta_banner:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-radius:0;overflow:hidden;">
  <tr>
    <!-- Top panel on mobile: accent bg, white text (Centered) -->
    <td class="ctab-col ctab-twotone-top" valign="middle" style="width:50%;background-color:${ac};padding:${p.paddingTop ?? 24}px 24px ${p.paddingBottom ?? 24}px 24px;box-sizing:border-box;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:900;color:${headClr};line-height:1.3;">${p.headingText ?? 'Unsure About Sizing?'}</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.85);line-height:1.6;">We measure every item before listing. No surprises.</p>
    </td>
    <!-- Bottom panel on mobile: white bg (Text & Button Centered in middle) -->
    <td class="ctab-col ctab-twotone-bottom" valign="middle" style="width:50%;background-color:#ffffff;padding:${p.paddingTop ?? 24}px 24px ${p.paddingBottom ?? 24}px 24px;box-sizing:border-box;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:#1e1535;line-height:1.3;">${p.subText ?? 'Our Experts Are Here.'}</p>
      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:13px;color:${subClr};line-height:1.6;">Message us — we respond within the hour.</p>
      <a href="${(p as any).linkUrl ?? '#'}" style="display:inline-block;padding:12px 28px;background-color:${ac};color:#ffffff;text-decoration:none;border-radius:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;">${(p as any).buttonText ?? 'Shop Now'} &rarr;</a>
    </td>
  </tr>
</table>`
}

// ── Variant registry ──────────────────────────────────────────────────────────

export const ctaBannerVariants: BlockVariant[] = [
  {
    id: 'ctab-trust-bar',
    label: 'Minimal Trust Bar',
    description: 'Single-line strip with icon, punchy headline, and 3 trust micro-pills. Clean newspaper-masthead style.',
    toHtml(props, id) { return trustBar(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-split-action',
    label: 'Split Action',
    description: '60/40 two-column split — value text left, high-contrast CTA button right with vertical divider.',
    toHtml(props, id) { return splitAction(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-flash-deal',
    label: 'Flash Deal Urgency',
    description: 'Red-to-orange gradient with top urgency ribbon, bold promo copy, and animated gradient CTA button.',
    toHtml(props, id) { return flashDeal(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-dark-premium',
    label: 'Dark Mode Premium',
    description: 'Near-black background with dual gold/purple border trick, silver subtext — pure typographic luxury.',
    toHtml(props, id) { return darkPremium(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-icon-value',
    label: 'Icon-Led Value Props',
    description: '3-column grid — each column has icon, bold label, subtext, and a Learn more link.',
    toHtml(props, id) { return iconValue(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-ribbon',
    label: 'Floating Sticky Ribbon',
    description: 'Ultra-compact 40px ribbon with left accent border, bold text left, ghost pill CTA right.',
    toHtml(props, id) { return ribbon(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-gradient-hero',
    label: 'Gradient Hero CTA',
    description: 'Immersive diagonal gradient — purple to near-black — with centred headline and white CTA button.',
    toHtml(props, id) { return gradientHero(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-social-proof',
    label: 'Social Proof Strip',
    description: 'Star rating display with sales count on the left, seller tagline and store link on the right.',
    toHtml(props, id) { return socialProof(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-announcement',
    label: 'Announcement Ticker',
    description: 'Single editorial line — ANNOUNCEMENT pill + headline + date pill — no button, pure clarity.',
    toHtml(props, id) { return announcement(props as CtaBannerProps, id) },
  },
  {
    id: 'ctab-two-tone',
    label: 'Two-Tone Split',
    description: 'Left half in accent colour with white text, right half white with dark text and CTA button.',
    toHtml(props, id) { return twoTone(props as CtaBannerProps, id) },
  },
]

export function getCtaBannerVariant(id: string): BlockVariant | undefined {
  return ctaBannerVariants.find(v => v.id === id)
}
