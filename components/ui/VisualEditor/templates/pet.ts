// components/ui/VisualEditor/templates/pet.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pet Supplies Template — 12 blocks, elite high-converting eBay layout with
// a distinct pet-focused visual personality (warm soft-violet tints, soft
// lime mint accents, rounded-2xl corners, pet-specific trust copy).
//
// Dedicated in-description image placement:
//   • Block 6 (image) — large lifestyle photo: pet in action / before & after
//   • Block 9 (raw_html) — "See It In Action" — 3 detailed use-case shots
//   • Block 7 (raw_html) — column of 4 feature bullet cards alongside the
//     lifestyle image (2-column rich feature block together with block 6).
//
// Policy info is consolidated into horizontal Policy Tabs (block 10) so there
// is no duplicate shipping_info / returns_policy card stacked above it.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

// Brand palette (v2.0, pet-specific surface tints added)
//   #7530fb  Electric Violet   — primary accent
//   #b8fa33  Soft Lime         — positive / mint accent
//   #1e1535  Deep Purple Dark  — heading text
//   #f5f0ff  Soft Violet Tint  — pet template container ground (warmer than
//                                the default #f8f7ff used in electronics etc.)
//   #ecfccb  Soft Lime Tint    — secondary mint ground
const PET_BG = '#f5f0ff'       // pet container ground (warm)
const PET_MINT = '#ecfccb'     // mint accent ground
const PET_MINT_DEEP = '#65a30d' // mint accent text/icon

export const petTemplate: TemplateSection = {
    id: 'full-pet',
    name: 'Pet Supplies',
    description: 'Pet theme · 12 blocks · Lifestyle image + feature card column + "See It In Action" gallery + horizontal policy tabs',
    category: 'full',
    thumbnail: 'pet',
    blocks: [

        // ── 1. Navigation Bar (template starts at the top of the canvas) ─────
        // Pills variant gives every link equal 3px outer padding + 14px inner
        // pill padding, and the inner table is align="center" so the row sits
        // horizontally centered with even spacing across the bar width.
        {
            type: 'nav_bar', props: {
                bgColor: '#ffffff',
                textColor: '#374151',
                hoverColor: '#7530fb',
                activeColor: '#7530fb',
                separator: '',
                align: 'center',
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 1,
                borderRadius: 0,
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 24,
                paddingRight: 24,
                variant: 'pills',
                links: [
                    { label: 'All Items',  url: '{{STORE_URL}}' },
                    { label: 'Dogs',       url: '#' },
                    { label: 'Cats',       url: '#' },
                    { label: 'Grooming',   url: '#' },
                    { label: 'Feeding',    url: '#' },
                    { label: 'Toys',       url: '#' },
                    { label: 'Contact',    url: '#' },
                ],
            }
        },

        // ── 2. 2-Column Hero Product ─────────────────────────────────────────
        // Right column shows 4 evenly-spaced thumbnails under the main image.
        // Left column stays clean below the gallery — no extra badge strip —
        // so the thumbnails sit on a quiet ground with no text overflow.
        {
            type: 'hero_product', props: {
                paddingTop: 24,
                paddingBottom: 12,
                paddingLeft: 20,
                paddingRight: 20,
                leftImage: '{{MAIN_IMAGE_URL}}',
                thumb1: '{{IMAGE_2_URL}}',
                thumb2: '{{IMAGE_3_URL}}',
                thumb3: '{{IMAGE_4_URL}}',
                thumb4: '{{IMAGE_5_URL}}',
                leftBg: '#f9fafb',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'Veterinarian-recommended deshedding tool',
                    'Self-cleaning retractable stainless-steel bristles',
                    'Reduces shedding by up to 95% — all coat types',
                    'Ergonomic non-slip handle — gentle on skin',
                ],
                accentColor: '#7530fb',
                scarcityBg: '#fef2f2',
                scarcityColor: '#991b1b',
            }
        },

        // ── 3. Urgency Bar ───────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '🔥 Only {{QUANTITY}} left in stock — {{WATCHERS}} pet parents are watching this right now',
                bgColor: '#fef2f2',
                textColor: '#991b1b',
                iconColor: '#ef4444',
                align: 'center',
                fontSize: 13,
                fontWeight: '700',
                borderRadius: 0,
                showIcon: true,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 4. Trust Badges (pet-specific copy, warm container, rounded-2xl) ─
        // Rebadged with pet-specific callouts and a warm soft-violet ground so
        // the row immediately reads as a pet listing rather than electronics.
        {
            type: 'trust_badges', props: {
                iconColor: '#7530fb',
                textColor: '#1e1535',
                subTextColor: '#6b7280',
                borderColor: '#e9ddfd',
                borderRadius: 16,
                align: 'center',
                bgColor: PET_BG,
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                variant: 'grid',
                badges: [
                    { icon: 'shield-check', text: '100% Pet-Safe Materials',      subText: 'Non-toxic & BPA-free' },
                    { icon: 'heart-pulse',  text: 'Veterinarian Approved Design', subText: 'Vet-reviewed & tested' },
                    { icon: 'paw-print',    text: '30-Day Happy Tail Guarantee',  subText: 'Full refund, no fuss' },
                    { icon: 'star',         text: 'Loved by 5,000+ Pet Parents',  subText: '4.9★ across 2,400 reviews' },
                ],
            }
        },

        // ── 5. Product Description (About This Item) ─────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#1e1535',
                titleFontSize: 18,
                color: '#475569',
                fontSize: 14,
                lineHeight: 1.8,
                bgColor: '#ffffff',
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 6. Lifestyle image (left half of the rich 2-column feature block) ─
        // Pet in action / before & after fur removal — large framed photo with
        // a soft rounded-2xl corner and a subtle brand-tinted shadow so the
        // photo reads as a premium lifestyle banner rather than a hard-edged
        // product shot. The previous bright mint background was swapped for a
        // soft off-white frame so the image itself is the focal point.
        // Uses the dedicated `product_image` block (variant: 'single') so the
        // Layout Style picker appears in the right sidebar — the plain `image`
        // type is not in the variant registry and would hide the preset grid.
        {
            type: 'product_image',
            props: {
                variant: 'single',
                src: '{{LIFESTYLE_IMAGE_URL}}',
                alt: '{{PRODUCT_TITLE}} — pet in action',
                maxWidth: 700,
                align: 'center',
                borderRadius: 16,
                bgColor: '#faf7ff',
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
                // Premium banner look: rounded-2xl + a soft brand-tinted shadow
                // (violet @ 8% — almost imperceptible but adds depth). Email
                // clients strip box-shadow so the actual email falls back to
                // the rounded corner alone; the canvas preview shows the full
                // treatment. `shadow` is a top-level prop on ProductImageProps
                // so it survives every Layout Style preset switch.
                shadow: '0 4px 14px rgba(117, 48, 251, 0.08)',
            }
        },

        // ── 7. "Why Pet Parents Love This" — 4 stacked feature bullet cards ───
        // Raw HTML so we can render the 4 bullet cards in a single right-hand
        // column. Soft-violet ground matches the lifestyle image frame to read
        // as one rich 2-column block. Each card uses rounded-2xl (16px) corners
        // and alternates soft-lime / soft-violet icon tiles for personality.
        {
            type: 'raw_html', props: {
                code: `<!--[riazify:why_love_features]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${PET_BG};">
  <tr><td style="padding:8px 12px 8px;">
    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:800;color:#1e1535;letter-spacing:-0.01em;">Why Pet Parents Love This</p>

    <!-- Card 1: 1-Click Self-Cleaning (Sparkles — soft-lime tile) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ede9fe;border-radius:16px;margin:0 0 10px;">
      <tr><td style="padding:14px 14px;border-radius:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="44" valign="top" style="padding-right:12px;">
            <div style="width:40px;height:40px;line-height:40px;text-align:center;background-color:${PET_MINT};color:${PET_MINT_DEEP};border-radius:50%;font-size:20px;">✨</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:#1e1535;line-height:1.3;">1-Click Self-Cleaning</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;line-height:1.5;">Press the button to eject hair — no mess, no fuss.</p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Card 2: Gentle Stainless Steel Safety Pins (Shield — soft-violet tile) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ede9fe;border-radius:16px;margin:0 0 10px;">
      <tr><td style="padding:14px 14px;border-radius:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="44" valign="top" style="padding-right:12px;">
            <div style="width:40px;height:40px;line-height:40px;text-align:center;background-color:#ede9fe;color:#7530fb;border-radius:50%;font-size:20px;">🛡️</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:#1e1535;line-height:1.3;">Gentle Stainless Steel</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;line-height:1.5;">Rounded safety pins glide through coats without scratching skin.</p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Card 3: Reduces Shedding by up to 95% (Heart — soft-lime tile) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ede9fe;border-radius:16px;margin:0 0 10px;">
      <tr><td style="padding:14px 14px;border-radius:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="44" valign="top" style="padding-right:12px;">
            <div style="width:40px;height:40px;line-height:40px;text-align:center;background-color:${PET_MINT};color:${PET_MINT_DEEP};border-radius:50%;font-size:20px;">♥</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:#1e1535;line-height:1.3;">Up to 95% Less Shedding</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;line-height:1.5;">Clinically shown to dramatically cut loose fur around your home.</p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Card 4: Ergonomic Anti-Slip Rubber Grip (Hand — soft-violet tile) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ede9fe;border-radius:16px;margin:0 0 2px;">
      <tr><td style="padding:14px 14px;border-radius:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="44" valign="top" style="padding-right:12px;">
            <div style="width:40px;height:40px;line-height:40px;text-align:center;background-color:#ede9fe;color:#7530fb;border-radius:50%;font-size:20px;">✋</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:#1e1535;line-height:1.3;">Anti-Slip Rubber Grip</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;line-height:1.5;">Ergonomic handle stays secure — even on the wiggliest bath-time pup.</p>
          </td>
        </tr></table>
      </td></tr>
    </table>

  </td></tr>
</table>
<!--[/riazify:why_love_features]-->`,
                label: 'Why Pet Parents Love This — 4 stacked feature cards',
            }
        },

        // ── 8. Specs Table — 'highlighted' variant respects headerBg/headerText
        //      for the title bar, so the header is branded in the main violet
        //      (#7530fb) with bold white text. Border radius bumped to 16 so
        //      the whole table matches the rounded-2xl feel of the template. ─
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                titleColor: '#1e1535',
                titleFontSize: 16,
                headerBg: '#7530fb',
                headerText: '#ffffff',
                altRowBg: '#faf7ff',
                rowBg: '#ffffff',
                borderColor: '#f3f4f6',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 0,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                variant: 'highlighted',
                rows: [
                    { key: 'Brand',         value: '{{BRAND}}' },
                    { key: 'MPN',           value: '{{MPN}}' },
                    { key: 'Type',          value: '{{TYPE}}' },
                    { key: 'Material',      value: '{{MATERIAL}}' },
                    { key: 'Features',      value: '{{FEATURES}}' },
                    { key: 'Suitable For',  value: '{{SUITABLE_FOR}}' },
                    { key: 'EAN',           value: '{{EAN}}' },
                    { key: 'Warranty',      value: '{{WARRANTY}}' },
                ],
            }
        },

        // ── 9. "See It In Action" — full-width middle gallery banner ─────────
        // 3 detailed product / use-case images shown in a 3-up row above a
        // short mint accent strip. Lives between Specs and Policy Tabs so the
        // buyer sees a visual proof point just before they read the policy
        // copy.
        //
        // Styling: each card is borderless (no harsh 1px lavender outline) and
        // rests on a soft brand-tinted shadow instead — gives the row a
        // premium "floating tile" feel that matches the rounded-2xl family of
        // the rest of the template. Canvas-only effect; email clients strip
        // box-shadow so the email falls back to the rounded white card alone.
        {
            type: 'raw_html', props: {
                code: `<!--[riazify:see_it_in_action]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${PET_BG};">
  <tr><td style="padding:24px 16px 20px;">
    <p style="margin:0 0 16px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#1e1535;letter-spacing:-0.01em;">Real results from real pet parents</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <!-- Image 1: before & after fur removal -->
        <td width="33.33%" valign="top" style="padding:0 6px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 6px 18px rgba(117, 48, 251, 0.10);">
            <tr><td style="padding:8px;border-radius:16px;">
              <img src="{{GALLERY_IMAGE_1}}" alt="Before &amp; after fur removal" border="0" width="100%" style="width:100%;height:140px;object-fit:cover;display:block;border-radius:12px;" />
              <p style="margin:10px 4px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;color:#1e1535;line-height:1.3;">Before &amp; After</p>
              <p style="margin:0 4px 6px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;line-height:1.4;">Loose fur removed in minutes.</p>
            </td></tr>
          </table>
        </td>
        <!-- Image 2: in use on a long-haired dog -->
        <td width="33.33%" valign="top" style="padding:0 6px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 6px 18px rgba(117, 48, 251, 0.10);">
            <tr><td style="padding:8px;border-radius:16px;">
              <img src="{{GALLERY_IMAGE_2}}" alt="In use on a long-haired dog" border="0" width="100%" style="width:100%;height:140px;object-fit:cover;display:block;border-radius:12px;" />
              <p style="margin:10px 4px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;color:#1e1535;line-height:1.3;">Bath-Time Friendly</p>
              <p style="margin:0 4px 6px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;line-height:1.4;">Gentle enough for wiggly pups.</p>
            </td></tr>
          </table>
        </td>
        <!-- Image 3: detail of the eject button -->
        <td width="33.33%" valign="top" style="padding:0 6px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 6px 18px rgba(117, 48, 251, 0.10);">
            <tr><td style="padding:8px;border-radius:16px;">
              <img src="{{GALLERY_IMAGE_3}}" alt="1-click eject button detail" border="0" width="100%" style="width:100%;height:140px;object-fit:cover;display:block;border-radius:12px;" />
              <p style="margin:10px 4px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;color:#1e1535;line-height:1.3;">1-Click Eject</p>
              <p style="margin:0 4px 6px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;line-height:1.4;">Hair releases in one press.</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Soft-lime mint accent strip — friendly visual closer.
         py-3 px-4 (12px vertical, 16px horizontal) gives the trust copy clean
         breathing room; text-sm + font-semibold (14px / 600) keeps the line
         weight matched to the brand body copy without overpowering the strip. -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
      <tr><td style="background-color:${PET_MINT};border-radius:12px;padding:12px 16px;text-align:center;">
        <p style="margin:0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;line-height:1.5;color:${PET_MINT_DEEP};">🐾 Recommended by veterinarians · Loved by 5,000+ pet parents</p>
      </td></tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:see_it_in_action]-->`,
                label: 'See It In Action — 3 use-case gallery + mint accent',
            }
        },

        // ── 10. Policy Tabs (consolidated: Shipping / Returns / Payment / Warranty) ─
        // Horizontal tabs across the top — Shipping is the active tab, others
        // share the same violet accent so the active state is unmistakable.
        // Every tab has rich, formatted copy on file; the renderer renders the
        // active tab's panel below the tab row and keeps the other three
        // panels in the DOM (display:none) for interactive switching.
        //
        // The outer container is set to bgColor:'#ffffff' so it blends with the
        // tab content box — otherwise the variant's default #f9fafb outer
        // shows as a light-gray strip around the white content panel, which
        // reads as "empty whitespace under the tab titles". The active tab's
        // bottom edge is already flush with the content box (tabbed variant
        // uses 16px vertical padding on both, and content has border-top:none),
        // so the only visible gap was the outer container's gray halo.
        {
            type: 'policy_tabs', props: {
                activeBg: '#7530fb',
                activeText: '#ffffff',
                inactiveBg: '#ffffff',
                inactiveText: '#6b7280',
                borderColor: '#ede9fe',
                contentBg: '#ffffff',
                // Match the content box so the policy block has no visible
                // outer halo — the tabs and the content panel read as one
                // seamless card.
                bgColor: '#ffffff',
                fontSize: 13,
                borderRadius: 12,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 20,
                paddingRight: 20,
                variant: 'tabbed',
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'We offer FREE standard US delivery on all orders (1–2 business days via USPS / UPS Ground). Same-day dispatch on orders placed before 3pm Mon–Fri (PST). Express next-day and Saturday delivery are available at checkout. International buyers are welcome — we ship worldwide via the eBay Global Shipping Programme with full tracking to every country.',
                    },
                    {
                        label: 'Returns',
                        content: 'We accept returns within 30 days of delivery — what we call our 30-Day Happy Tail Guarantee. Items must be returned in their original condition and original packaging with all accessories included. We cover return postage on items that are faulty, damaged in transit, or not as described — simply contact us first and we will provide a prepaid label. For change-of-mind returns, the buyer is responsible for return postage. Refunds are processed within 1–2 business days of receiving the returned item.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, Visa, Mastercard, American Express, Discover, Apple Pay and Google Pay. All transactions are protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase. For business or bulk orders please contact us directly for invoicing options.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All products are covered by a minimum 12-month manufacturer warranty against defects in materials and workmanship. If you experience any fault or issue with your item, please contact us directly before opening an eBay case — our team will resolve the matter promptly and professionally, usually within 24 hours. Replacement parts and repair services are also available after the warranty period.',
                    },
                ],
            }
        },

        // ── 11. Cross-Sell (warm soft-violet ground + rounded-2xl cards) ─────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Like',
                titleColor: '#1e1535',
                titleFontSize: 16,
                bgColor: PET_BG,
                cardBg: '#ffffff',
                cardBorder: '#ede9fe',
                borderRadius: 16,
                columns: 4,
                showPrice: true,
                gap: 14,
                paddingTop: 24,
                paddingBottom: 8,
                paddingLeft: 20,
                paddingRight: 20,
                items: [
                    { imageUrl: '{{RELATED_IMAGE_1}}', title: '{{RELATED_TITLE_1}}', price: '{{RELATED_PRICE_1}}', url: '#' },
                    { imageUrl: '{{RELATED_IMAGE_2}}', title: '{{RELATED_TITLE_2}}', price: '{{RELATED_PRICE_2}}', url: '#' },
                    { imageUrl: '{{RELATED_IMAGE_3}}', title: '{{RELATED_TITLE_3}}', price: '{{RELATED_PRICE_3}}', url: '#' },
                    { imageUrl: '{{RELATED_IMAGE_4}}', title: '{{RELATED_TITLE_4}}', price: '{{RELATED_PRICE_4}}', url: '#' },
                ],
            }
        },

        // ── 12. Seller Info (final footer-equivalent block, warm ground) ─────
        {
            type: 'seller_info', props: {
                sellerName: '{{SELLER_NAME}}',
                tagline: 'Trusted Pet Supplies · Est. 2018 · 5,000+ Happy Pet Parents',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Pet Seller',
                badgeColor: '#7530fb',
                avatarBg: '#ede9fe',
                avatarText: '#7530fb',
                bgColor: '#ffffff',
                textColor: '#1e1535',
                subTextColor: '#6b7280',
                borderRadius: 16,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

    ],
}
