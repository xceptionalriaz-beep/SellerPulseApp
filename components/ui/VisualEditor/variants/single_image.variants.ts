// components/ui/VisualEditor/variants/single_image.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single Image — 6 layout variants (Full Width 100% Edition)
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
// Universal Slot Selection Helper (Integrates with slotSelection.ts)
// ─────────────────────────────────────────────────────────────────────────────
function slotImage(
  p: any,
  id: string,
  imgStyle: string = '',
  containerStyle: string = '',
  isRound: boolean = false
): string {
  const src = p.src ?? '{{MAIN_IMAGE_URL}}'
  const alt = p.alt ?? '{{PRODUCT_TITLE}}'
  const roundClass = isRound ? ' riazify-slot-round' : ''
  const roundStyle = isRound ? 'border-radius:50%;' : ''

  return `
<div data-slot="image" data-slot-id="${id}" data-slot-key="src" data-block-id="${id}" class="riazify-slot${roundClass}" style="display:inline-block;width:100%;position:relative;cursor:pointer;line-height:0;text-align:center;box-sizing:border-box;${roundStyle}${containerStyle}">
  <img src="${src}" alt="${alt}" data-slot="image" data-slot-id="${id}" data-slot-key="src" data-block-id="${id}"
    style="cursor:pointer;${roundStyle}${imgStyle}" />
</div>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — classic-frame
// Clean framed card: 1px border, soft bg, centered caption
// ─────────────────────────────────────────────────────────────────────────────
function classicFrame(p: any, id: string): string {
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background-color:#ffffff;margin:0 auto;">
        <tr>
          <td style="padding:12px;text-align:center;">
            ${slotImage(p, id, 'width:100%;height:auto;display:block;border-radius:4px;margin:0 auto;')}
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:block;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.08);margin:0 auto;">
        ${slotImage(p, id, 'width:100%;height:auto;display:block;margin:0 auto;')}
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"
        style="background-color:#ffffff;border-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,0.12),0 1px 4px rgba(0,0,0,0.06);width:100%;margin:0 auto;">
        <tr>
          <td style="padding:12px 12px 0;text-align:center;">
            ${slotImage(p, id, 'width:100%;height:auto;display:block;border-radius:2px;margin:0 auto;')}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 12px 20px;text-align:center;">
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="padding:0;text-align:center;position:relative;">
      <div style="position:relative;display:block;width:100%;line-height:0;margin:0 auto;">
        ${slotImage(p, id, 'width:100%;height:auto;display:block;margin:0 auto;')}
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0) 60%);padding:28px 20px 16px;text-align:center;pointer-events:none;">
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:#1e1535;margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"
        style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);border-radius:12px;padding:2px;width:100%;margin:0 auto;">
        <tr>
          <td style="background-color:#0f0b1e;border-radius:10px;padding:12px;text-align:center;">
            ${slotImage(p, id, 'width:100%;height:auto;display:block;border-radius:6px;margin:0 auto;')}
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
// Ultra-clean: heavy border-radius, inset shadow, full width
// ─────────────────────────────────────────────────────────────────────────────
function softMinimalist(p: any, id: string): string {
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:block;width:100%;border-radius:24px;overflow:hidden;border:1.5px solid #ede9fe;box-shadow:inset 0 1px 3px rgba(117,48,251,0.06),0 2px 12px rgba(0,0,0,0.06);margin:0 auto;">
        ${slotImage(p, id, 'width:100%;height:auto;display:block;margin:0 auto;')}
      </div>
      <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;">${caption(p)}</p>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — circular-ring-spotlight
// Perfectly concentric double rings with mathematically centered dashed orbit
// ─────────────────────────────────────────────────────────────────────────────
function circularRingSpotlight(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <!-- Outer Concentric Dashed Ring with 100% Equal Margins -->
      <div style="display:inline-flex;align-items:center;justify-content:center;width:330px;height:330px;max-width:85vw;max-height:85vw;aspect-ratio:1/1;border-radius:50%;border:2px dashed ${ac}60;padding:12px;box-sizing:border-box;margin:0 auto;">
        <!-- Middle Accent Glow Ring -->
        <div style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg, ${ac}25 0%, #ffffff 50%, ${ac}15 100%);padding:6px;box-sizing:border-box;box-shadow:0 12px 34px rgba(0,0,0,0.12);">
          <!-- Inner Circular Image Stage -->
          <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background-color:#ffffff;line-height:0;box-sizing:border-box;">
            ${slotImage(
    p,
    id,
    'width:100%;height:100%;object-fit:cover;display:block;margin:0 auto;border-radius:50%;',
    'border-radius:50%;width:100%;height:100%;',
    true
  )}
          </div>
        </div>
      </div>
      ${p.caption ? `
      <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#374151;letter-spacing:0.3px;">${p.caption}</p>` : ''}
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — arch-portal
// Architectural arched window with pure 220px semi-circular dome & framed showcase
// ─────────────────────────────────────────────────────────────────────────────
function archPortal(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:440px;margin:0 auto;">
        <!-- Pure Semi-Circular Arch Window (Radius 220px = Width 440px / 2) -->
        <div style="display:block;border-radius:220px 220px 18px 18px;overflow:hidden;border:2px solid #f3f4f6;background-color:#ffffff;box-shadow:0 12px 32px rgba(0,0,0,0.07);padding:28px 24px 24px;box-sizing:border-box;text-align:center;">
          <!-- Product Image: 100% visible, never cut off -->
          <div style="line-height:0;text-align:center;margin:0 auto;">
            ${slotImage(
    p,
    id,
    'max-width:100%;max-height:340px;width:auto;height:auto;object-fit:contain;display:inline-block;margin:0 auto;filter:drop-shadow(0 10px 24px rgba(0,0,0,0.12));',
    'display:inline-block;max-width:250px;margin:0 auto;'
  )}
          </div>
        </div>
        ${p.caption ? `
        <div style="margin-top:14px;display:inline-block;padding:5px 18px;border-radius:20px;background-color:${ac}15;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${ac};text-transform:uppercase;letter-spacing:0.8px;">${p.caption}</span>
        </div>` : ''}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — viewfinder-corners
// Precision studio styling with technical corner brackets and lens framing
// ─────────────────────────────────────────────────────────────────────────────
function viewfinderCorners(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;position:relative;padding:12px;box-sizing:border-box;">
        <div style="position:relative;padding:8px;border:1px solid #e5e7eb;border-radius:6px;background-color:#ffffff;">
          <!-- Corner Accents -->
          <div style="position:absolute;top:-2px;left:-2px;width:18px;height:18px;border-top:3px solid ${ac};border-left:3px solid ${ac};"></div>
          <div style="position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-top:3px solid ${ac};border-right:3px solid ${ac};"></div>
          <div style="position:absolute;bottom:-2px;left:-2px;width:18px;height:18px;border-bottom:3px solid ${ac};border-left:3px solid ${ac};"></div>
          <div style="position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;border-bottom:3px solid ${ac};border-right:3px solid ${ac};"></div>

          ${slotImage(p, id, 'width:100%;height:auto;display:block;border-radius:4px;margin:0 auto;')}
        </div>
        <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">${caption(p)}</p>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — diagonal-cut
// Modern dynamic cut with opposite rounded corners & layered accent underlay
// ─────────────────────────────────────────────────────────────────────────────
function diagonalCut(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;margin:0 auto;position:relative;">
        <div style="width:100%;border-radius:48px 4px 48px 4px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border-left:4px solid ${ac};border-right:4px solid ${ac};line-height:0;background-color:#ffffff;">
          ${slotImage(p, id, 'width:100%;height:auto;display:block;margin:0 auto;')}
        </div>
        <div style="margin-top:10px;text-align:center;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4b5563;">${caption(p)}</span>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 11 — trust-guarantee-badge
// Trust Badge & Authenticity Ribbon: corner guarantee badge with clean card
// ─────────────────────────────────────────────────────────────────────────────
function trustGuaranteeBadge(p: any, id: string): string {
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="position:relative;display:inline-block;width:100%;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;box-shadow:0 6px 20px rgba(0,0,0,0.06);margin:0 auto;">
        <!-- Top Trust Banner -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(90deg,#059669 0%,#10b981 100%);">
          <tr>
            <td style="padding:7px 14px;text-align:left;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
                ✓ 100% GENUINE &bull; VERIFIED AUTHENTIC
              </span>
            </td>
            <td style="padding:7px 14px;text-align:right;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.5px;text-transform:uppercase;">
                OFFICIAL STOCK
              </span>
            </td>
          </tr>
        </table>
        <!-- Main Image -->
        <div style="padding:16px;text-align:center;">
          ${slotImage(p, id, 'width:100%;height:auto;display:block;border-radius:6px;margin:0 auto;')}
        </div>
        <!-- Bottom Caption -->
        <div style="padding:8px 16px 14px;border-top:1px solid #f3f4f6;text-align:center;background-color:#fafafa;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#4b5563;font-weight:600;">${caption(p)}</span>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 12 — luxury-certified-seal
// Prestige Gold Certificate Showcase: Guilloche Inlay, Gold Corner Brackets & Certified Medallion Seal
// ─────────────────────────────────────────────────────────────────────────────
function luxuryCertifiedSeal(p: any, id: string): string {
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:580px;margin:0 auto;position:relative;box-sizing:border-box;">
        <!-- Luxury Outer Card -->
        <div style="position:relative;border-radius:12px;border:1.5px solid #e5e7eb;background:#ffffff;padding:14px;box-shadow:0 12px 36px -8px rgba(0,0,0,0.08), 0 4px 12px rgba(217,119,6,0.04);box-sizing:border-box;text-align:center;">

          <!-- Inner Certificate Inlay with Gold Dashed Rule -->
          <div style="position:relative;border-radius:8px;border:1px dashed #d97706;background:radial-gradient(ellipse at 50% 40%, rgba(254,243,199,0.35) 0%, #ffffff 70%);padding:28px 20px 22px;box-sizing:border-box;">

            <!-- 4 Corner Jeweler Accents (Brackets) -->
            <div style="position:absolute;top:6px;left:6px;width:10px;height:10px;border-top:2px solid #b45309;border-left:2px solid #b45309;"></div>
            <div style="position:absolute;top:6px;right:6px;width:10px;height:10px;border-top:2px solid #b45309;border-right:2px solid #b45309;"></div>
            <div style="position:absolute;bottom:6px;left:6px;width:10px;height:10px;border-bottom:2px solid #b45309;border-left:2px solid #b45309;"></div>
            <div style="position:absolute;bottom:6px;right:6px;width:10px;height:10px;border-bottom:2px solid #b45309;border-right:2px solid #b45309;"></div>

            <!-- Top Gold Certified Medallion Ribbon Seal -->
            <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 16px;border-radius:20px;background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);border:1px solid #d97706;box-shadow:0 2px 6px rgba(217,119,6,0.15);margin-bottom:16px;">
              <span style="color:#b45309;font-size:12px;line-height:1;">★</span>
              <span style="font-family:Georgia,serif;font-size:10.5px;font-weight:700;color:#92400e;letter-spacing:1.2px;text-transform:uppercase;">Verified Authentic &bull; Luxury Certified</span>
              <span style="color:#b45309;font-size:12px;line-height:1;">★</span>
            </div>

            <!-- Product Showcase Image Stage -->
            <div style="position:relative;z-index:2;line-height:0;text-align:center;min-height:200px;display:flex;align-items:center;justify-content:center;">
              ${slotImage(p, id, 'width:auto;max-width:88%;height:auto;max-height:360px;object-fit:contain;display:block;margin:0 auto;filter:drop-shadow(0 14px 22px rgba(0,0,0,0.12));')}
            </div>

            <!-- Engraved Gold Foil Hairline Divider -->
            <div style="margin:20px auto 14px;width:60%;max-width:240px;height:1px;background:linear-gradient(90deg, transparent, #d97706, transparent);"></div>

            <!-- Certificate Title & Seal Tag -->
            <div style="text-align:center;">
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#1c1917;letter-spacing:0.3px;">${caption(p)}</p>
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#92400e;letter-spacing:1.6px;text-transform:uppercase;opacity:0.85;">Archival Grade &bull; Premium Quality Seal</span>
            </div>

          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 13 — deal-flash-ribbon
// Deal & Promo Flash: high-urgency top ribbon banner for hot sales and deals
// ─────────────────────────────────────────────────────────────────────────────
function dealFlashRibbon(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;border-radius:12px;overflow:hidden;border:2px solid ${ac};box-shadow:0 8px 28px rgba(0,0,0,0.09);background-color:#ffffff;margin:0 auto;">
        <!-- Deal Header Ribbon -->
        <div style="background-color:${ac};padding:8px 16px;text-align:center;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;color:#ffffff;letter-spacing:1.2px;text-transform:uppercase;">
            ⚡ SPECIAL PROMOTION &bull; TOP-RATED SELLER
          </span>
        </div>
        <!-- Main Image -->
        <div style="padding:16px;text-align:center;">
          ${slotImage(p, id, 'width:100%;height:auto;display:block;border-radius:6px;margin:0 auto;')}
        </div>
        <!-- Caption Bar -->
        <div style="padding:10px 16px 14px;text-align:center;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1f2937;">${caption(p)}</span>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 14 — studio-pedestal
// 3D Studio Pedestal: 3D beveled display plinth with studio spotlight & reflection
// ─────────────────────────────────────────────────────────────────────────────
function studioPedestal(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:580px;margin:0 auto;position:relative;">
        <!-- Studio Showcase Card Container -->
        <div style="position:relative;border-radius:18px;border:1px solid #e5e7eb;background:radial-gradient(ellipse at 50% 35%, #ffffff 0%, #f9fafb 65%, #f1f5f9 100%);padding:36px 24px 28px;box-shadow:0 12px 30px -6px rgba(0,0,0,0.06);text-align:center;overflow:hidden;">

          <!-- Studio Overhead Soft Light Beam -->
          <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:75%;height:140px;background:radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.95) 0%, transparent 70%);pointer-events:none;"></div>

          <!-- Floating Product Image -->
          <div style="position:relative;z-index:2;line-height:0;text-align:center;padding-bottom:6px;min-height:220px;display:flex;align-items:center;justify-content:center;">
            ${slotImage(p, id, 'width:auto;max-width:85%;height:auto;max-height:360px;object-fit:contain;display:block;margin:0 auto;filter:drop-shadow(0 16px 24px rgba(0,0,0,0.13));')}
          </div>

          <!-- 3D Pedestal Stage Assembly -->
          <div style="position:relative;z-index:1;width:78%;max-width:380px;margin:0 auto;">
            <!-- Top Pedestal Disc (Surface) -->
            <div style="height:28px;border-radius:50%;background:linear-gradient(180deg, #ffffff 0%, #f3f4f6 60%, #e5e7eb 100%);border:1.5px solid #d1d5db;box-shadow:inset 0 2px 4px rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.04);position:relative;">
              <!-- Pedestal Inner Brand Accent Halo -->
              <div style="position:absolute;top:3px;left:5%;right:5%;height:18px;border-radius:50%;background:radial-gradient(ellipse at center, ${ac}18 0%, transparent 75%);"></div>
            </div>

            <!-- Pedestal Beveled Cylinder Edge -->
            <div style="height:10px;margin-top:-14px;border-radius:0 0 50% 50% / 0 0 100% 100%;background:linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%);border-left:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;border-bottom:1.5px solid #9ca3af;"></div>

            <!-- Deep Radial Ground Contact Shadow -->
            <div style="width:105%;margin:-3px auto 0;height:18px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.08) 55%, transparent 75%);border-radius:50%;"></div>
          </div>

          ${p.caption ? `
          <!-- Optional Clean Caption (Only if user explicitly enters one) -->
          <div style="position:relative;z-index:2;margin-top:16px;text-align:center;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#4b5563;letter-spacing:0.2px;">${p.caption}</p>
          </div>` : ''}

        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 17 — stadium-capsule-pod
// Pill/stadium vertical backdrop pod with auto-cut boundary for banner & PNG images
// ─────────────────────────────────────────────────────────────────────────────
function stadiumCapsulePod(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:480px;margin:0 auto;">
        <!-- Capsule Pod Backdrop with Strict Auto-Cut Boundary -->
        <div style="border-radius:180px;overflow:hidden;border:2px solid ${ac}33;background:linear-gradient(180deg, #ffffff 0%, #f9fafb 80%, ${ac}10 100%);box-shadow:0 12px 32px rgba(0,0,0,0.07);padding:36px 24px 28px;text-align:center;box-sizing:border-box;">
          <!-- Product Image Stage: Prevents Horizontal Bleed -->
          <div style="line-height:0;text-align:center;max-width:380px;margin:0 auto;box-sizing:border-box;">
            ${slotImage(
    p,
    id,
    'max-width:100%;max-height:340px;width:auto;height:auto;object-fit:contain;display:inline-block;margin:0 auto;border-radius:20px;filter:drop-shadow(0 10px 22px rgba(0,0,0,0.13));',
    'max-width:240px;display:inline-block;margin:0 auto;'
  )}
          </div>
          <!-- Ground Oval Shadow -->
          <div style="width:60%;height:12px;margin:12px auto 16px;background:radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0) 80%);border-radius:50%;"></div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 18 — geometric-prism-spotlight
// Modern faceted stage backdrop with geometric spotlight & grounded pedestal
// ─────────────────────────────────────────────────────────────────────────────
function geometricPrismSpotlight(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:580px;margin:0 auto;position:relative;">
        <!-- Prism Showcase Container -->
        <div style="position:relative;border-radius:18px;background:linear-gradient(165deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%);border:1px solid #e2e8f0;padding:36px 28px 24px;box-shadow:0 10px 30px -5px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.02);overflow:hidden;text-align:center;">

          <!-- Geometric Prism Accent Shapes (Subtle background facets) -->
          <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:24px;transform:rotate(45deg);background:linear-gradient(135deg, ${ac}15, ${ac}05);pointer-events:none;"></div>
          <div style="position:absolute;bottom:-30px;left:-30px;width:90px;height:90px;border-radius:18px;transform:rotate(30deg);background:linear-gradient(135deg, ${ac}12, transparent);pointer-events:none;"></div>

          <!-- Corner Minimalist Geometric Brackets -->
          <div style="position:absolute;top:14px;left:14px;width:12px;height:12px;border-top:2px solid ${ac};border-left:2px solid ${ac};"></div>
          <div style="position:absolute;top:14px;right:14px;width:12px;height:12px;border-top:2px solid ${ac};border-right:2px solid ${ac};"></div>
          <div style="position:absolute;bottom:14px;left:14px;width:12px;height:12px;border-bottom:2px solid ${ac};border-left:2px solid ${ac};"></div>
          <div style="position:absolute;bottom:14px;right:14px;width:12px;height:12px;border-bottom:2px solid ${ac};border-right:2px solid ${ac};"></div>

          <!-- Central Spotlight Glow -->
          <div style="position:absolute;top:45%;left:50%;transform:translate(-50%, -50%);width:70%;height:60%;background:radial-gradient(ellipse at center, #ffffff 0%, rgba(255,255,255,0.7) 45%, transparent 75%);pointer-events:none;z-index:1;"></div>

          <!-- Product Image (Smart Auto-Fit) -->
          <div style="position:relative;z-index:2;line-height:0;text-align:center;min-height:200px;display:flex;align-items:center;justify-content:center;">
            ${slotImage(p, id, 'width:auto;max-width:86%;height:auto;max-height:360px;object-fit:contain;display:block;margin:0 auto;filter:drop-shadow(0 14px 20px rgba(0,0,0,0.12));')}
          </div>

          <!-- Faceted Prism Stage Pedestal (Under the product) -->
          <div style="position:relative;z-index:2;margin:16px auto 0;width:80%;max-width:320px;text-align:center;">
            <!-- Hexagonal Facet Stage Line -->
            <div style="margin:4px auto 0;width:60px;height:3px;background:linear-gradient(90deg, transparent, ${ac}, transparent);border-radius:2px;"></div>
          </div>

        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 21 — diagonal-split-stage
// Crisp razor-sharp diagonal split stage: clean focus with no shadows or text box
// ─────────────────────────────────────────────────────────────────────────────
function diagonalSplitStage(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <div style="display:inline-block;width:100%;max-width:580px;margin:0 auto;position:relative;box-sizing:border-box;">
        <!-- Clean Crisp Diagonal Split Card with Fluid Mobile & Desktop Proportions -->
        <div style="border-radius:20px;overflow:hidden;border:1.5px solid ${ac}25;box-shadow:0 8px 26px rgba(0,0,0,0.06);background:linear-gradient(138deg, #ffffff 54%, ${ac}14 54%, ${ac}24 100%);padding:clamp(20px, 4vw, 30px) clamp(16px, 4vw, 24px);text-align:center;box-sizing:border-box;">
          <!-- Product Image Stage (Natural Scale for PNG Logos & High-Res Photos) -->
          <div style="line-height:0;text-align:center;display:flex;align-items:center;justify-content:center;margin:0 auto;">
            ${slotImage(
    p,
    id,
    'max-width:100%;max-height:380px;width:auto;height:auto;object-fit:contain;display:block;margin:0 auto;',
    'display:inline-flex;align-items:center;justify-content:center;max-width:100%;margin:0 auto;'
  )}
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:single_image:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 22 — sculpted-armor-shield
// Heavy-duty tapered shield silhouette with double outline & authentic seal
// ─────────────────────────────────────────────────────────────────────────────
function sculptedArmorShield(p: any, id: string): string {
  const ac = accent(p)
  return `
<!--[riazify:single_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;background-color:${bg(p)};margin:0 auto;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <!-- Responsive Sculpted Shield Container -->
      <div style="display:inline-block;width:100%;max-width:390px;position:relative;margin:0 auto;text-align:center;filter:drop-shadow(0 12px 28px rgba(0,0,0,0.10));box-sizing:border-box;">

        <!-- Vector Sculpted Armor Shield Frame -->
        <svg viewBox="0 0 400 490" width="100%" height="100%" preserveAspectRatio="none" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;">
          <!-- Outer Sculpted Shield Contour -->
          <path d="M 200 8 L 388 36 C 388 280 298 426 200 482 C 102 426 12 280 12 36 Z" fill="#ffffff" stroke="${ac}" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Inner Beveled Armor Ridge Contour -->
          <path d="M 200 20 L 374 46 C 374 270 290 410 200 464 C 110 410 26 270 26 46 Z" fill="${ac}" fill-opacity="0.04" stroke="${ac}" stroke-width="1.2" stroke-opacity="0.35"/>
        </svg>

        <!-- Shield Content Foreground (Responsive Padding) -->
        <div style="position:relative;z-index:1;padding:24px 18px 46px;box-sizing:border-box;text-align:center;">
          <!-- Top Shield Crest Badge -->
          <div style="margin-bottom:10px;display:inline-block;padding:4px 14px;border-radius:12px;background-color:${ac}15;border:1px solid ${ac}30;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;color:${ac};letter-spacing:1px;text-transform:uppercase;">
              ★ PREMIUM CERTIFIED BUILD ★
            </span>
          </div>

          <!-- Product Image Stage (Fluid Responsive Height & Auto-Cut) -->
          <div style="line-height:0;text-align:center;padding:6px 0 10px;max-width:220px;margin:0 auto;">
            ${slotImage(
    p,
    id,
    'width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;display:block;margin:0 auto;',
    'width:100%;max-width:210px;height:clamp(170px, 48vw, 215px);display:inline-flex;align-items:center;justify-content:center;margin:0 auto;overflow:hidden;border-radius:12px 12px 70px 70px;'
  )}
          </div>

          <!-- Bottom Shield Crest Accent Bar -->
          <div style="margin:2px auto 0;width:30px;height:3px;border-radius:2px;background-color:${ac};opacity:0.65;"></div>
        </div>
      </div>
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
  {
    id: 'circular-ring-spotlight',
    label: 'Circular Ring Spotlight',
    description: 'Concentric ring highlight with drop shadow showcase',
    toHtml(props, id) { return circularRingSpotlight(props, id) },
  },
  {
    id: 'arch-portal',
    label: 'Archway Portal',
    description: 'Modern dome arch editorial window with pill badge caption',
    toHtml(props, id) { return archPortal(props, id) },
  },
  {
    id: 'viewfinder-corners',
    label: 'Viewfinder Studio',
    description: 'Camera lens crosshairs and corner brackets for precision products',
    toHtml(props, id) { return viewfinderCorners(props, id) },
  },
  {
    id: 'diagonal-cut',
    label: 'Diagonal Geometric Cut',
    description: 'Dynamic opposite curved corners with side accent borders',
    toHtml(props, id) { return diagonalCut(props, id) },
  },
  {
    id: 'trust-guarantee-badge',
    label: 'Trust & Authenticity Banner',
    description: 'Verified authentic guarantee ribbon banner for top conversion',
    toHtml(props, id) { return trustGuaranteeBadge(props, id) },
  },
  {
    id: 'luxury-certified-seal',
    label: 'Luxury Certified Seal',
    description: 'Double hairline luxury border for jewelry, watches & collectibles',
    toHtml(props, id) { return luxuryCertifiedSeal(props, id) },
  },
  {
    id: 'deal-flash-ribbon',
    label: 'Promo Flash Deal',
    description: 'Bold promotional header bar with high-urgency accents',
    toHtml(props, id) { return dealFlashRibbon(props, id) },
  },
  {
    id: 'studio-pedestal',
    label: 'Studio Floating Pedestal',
    description: 'Showroom ground shadow for transparent cutout product photos',
    toHtml(props, id) { return studioPedestal(props, id) },
  },
  {
    id: 'stadium-capsule-pod',
    label: 'Stadium Capsule Pod',
    description: 'Smooth vertical stadium pod for bottles and upright products',
    toHtml(props, id) { return stadiumCapsulePod(props, id) },
  },
  {
    id: 'geometric-prism-spotlight',
    label: 'Geometric Prism Spotlight',
    description: 'Faceted contour panel with corner pins for tech & hardware',
    toHtml(props, id) { return geometricPrismSpotlight(props, id) },
  },
  {
    id: 'diagonal-split-stage',
    label: 'Dynamic Diagonal Split',
    description: 'Two-tone angled horizon wedge stage for high-energy products',
    toHtml(props, id) { return diagonalSplitStage(props, id) },
  },
  {
    id: 'sculpted-armor-shield',
    label: 'Sculpted Armor Shield',
    description: 'Authoritative tapered shield silhouette with certified seal header',
    toHtml(props, id) { return sculptedArmorShield(props, id) },
  },
]

export function getSingleImageVariant(id: string): BlockVariant {
  return singleImageVariants.find(v => v.id === id) ?? singleImageVariants[0]
}
