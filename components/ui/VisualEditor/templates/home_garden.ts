// components/ui/VisualEditor/templates/home_garden.ts
// ─────────────────────────────────────────────────────────────────────────────
// Home & Garden Template — 16 blocks, 2-column hero + refined policy cards.
// Category-consistent product theme: sage green / terracotta.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const homeGardenTemplate: TemplateSection = {
    id: 'full-home-garden',
    name: 'Home & Garden',
    description: 'Sage & terracotta theme · 16 blocks · Pro 2-column hero + crisp cards',
    category: 'full',
    thumbnail: 'home_garden',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Quality Home & Garden · Free UK Delivery · Trusted Seller',
                bgColor: '#6b7c5a',
                bgGradient: true,
                bgGradientFrom: '#6b7c5a',
                bgGradientTo: '#c4703f',
                bgGradientDir: 135,
                nameFontSize: 22,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 12,
                taglineColor: 'rgba(255,255,255,0.85)',
                showLogo: false,
                height: 80,
                align: 'center',
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 24,
                paddingRight: 24,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 2. Navigation Bar ─────────────────────────────────────────────────
        {
            type: 'nav_bar', props: {
                bgColor: '#4a5c3a',
                textColor: '#d4ddc8',
                hoverColor: '#ffffff',
                activeColor: '#f0c080',
                separator: '|',
                align: 'center',
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 1,
                borderRadius: 0,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 24,
                paddingRight: 24,
                links: [
                    { label: 'All Items',     url: '{{STORE_URL}}' },
                    { label: 'Indoor Plants', url: '#' },
                    { label: 'Garden Tools',  url: '#' },
                    { label: 'Furniture',     url: '#' },
                    { label: 'Décor',         url: '#' },
                    { label: 'Contact Us',    url: '#' },
                ],
            }
        },

        // ── 3. 2-Column Hero Product ──────────────────────────────────────────
        {
            type: 'hero_product', props: {
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                leftImage: '{{MAIN_IMAGE_URL}}',
                thumb1: '{{IMAGE_2_URL}}',
                thumb2: '{{IMAGE_3_URL}}',
                thumb3: '{{IMAGE_4_URL}}',
                thumb4: '{{IMAGE_5_URL}}',
                leftBg: '#f7f5f0',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'Premium quality — built to last season after season',
                    'Weather-resistant and UV-stable finish',
                    'Easy to assemble — full instructions included',
                    'Suitable for indoor and outdoor use',
                ],
                accentColor: '#6b7c5a',
                scarcityBg: '#fef3e8',
                scarcityColor: '#92400e',
            }
        },

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '🌿 Only {{QUANTITY}} left in stock — Order soon to avoid disappointment!',
                bgColor: '#fef3e8',
                textColor: '#92400e',
                iconColor: '#c4703f',
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

        // ── 5. Trust Badges (white card grid) ────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#6b7c5a',
                textColor: '#1e1535',
                subTextColor: '#6b7280',
                borderColor: '#e5e7eb',
                borderRadius: 12,
                align: 'center',
                bgColor: '#ffffff',
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                variant: 'grid',
                badges: [
                    { icon: 'shield-check', text: 'Genuine Product',  subText: '100% Authentic' },
                    { icon: 'truck',         text: 'Free Delivery',     subText: 'UK Orders' },
                    { icon: 'rotate-ccw',    text: '30-Day Returns',    subText: 'Hassle Free' },
                    { icon: 'star',          text: 'Top Rated Seller',  subText: '5★ Reviews' },
                ],
            }
        },

        // ── 6. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#1e1535',
                titleFontSize: 18,
                color: '#4b5563',
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

        // ── 7. Specs Table (crisp 2-column alternating) ──────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                titleColor: '#1e1535',
                titleFontSize: 16,
                headerBg: '#1e1535',
                headerText: '#ffffff',
                altRowBg: '#f9fafb',
                rowBg: '#ffffff',
                borderColor: '#f3f4f6',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 0,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                variant: 'full',
                rows: [
                    { key: 'Brand',         value: '{{BRAND}}' },
                    { key: 'Material',      value: '{{MATERIAL}}' },
                    { key: 'Dimensions',    value: '{{DIMENSIONS}}' },
                    { key: 'Colour',        value: '{{COLOUR}}' },
                    { key: 'Weight',        value: '{{WEIGHT}}' },
                    { key: 'Room / Use',    value: '{{ROOM_TYPE}}' },
                    { key: 'Style',         value: '{{STYLE}}' },
                    { key: 'EAN / GTIN',    value: '{{EAN}}' },
                    { key: 'Warranty',      value: '{{WARRANTY}}' },
                ],
            }
        },

        // ── 8. Divider ───────────────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                color: '#e5e7eb',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 4,
                paddingBottom: 4,
            }
        },

        // ── 9. Shipping Info (white card with truck SVG) ─────────────────────
        {
            type: 'shipping_info', props: {
                bgColor: '#ffffff',
                textColor: '#1e1535',
                iconColor: '#16a34a',
                accentColor: '#16a34a',
                iconBg: '#f0fdf4',
                borderRadius: 8,
                shippingText: '{{SHIPPING_TIME}} — FREE Standard UK Delivery',
                dispatchText: 'Same-day dispatch on orders placed before 2pm Mon–Fri',
                locationText: 'Dispatched from: United Kingdom',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 10. Returns Policy (white card with rotate-ccw SVG) ──────────────
        {
            type: 'returns_policy', props: {
                bgColor: '#ffffff',
                textColor: '#1e1535',
                accentColor: '#c4703f',
                iconColor: '#c4703f',
                iconBg: '#fef3e8',
                borderRadius: 8,
                policyText: '{{RETURN_POLICY}}. Items must be unused and in original packaging.',
                showPeriod: true,
                periodText: '30-Day Free Returns on items not as described',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 11. Policy Tabs ──────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#6b7c5a',
                activeText: '#ffffff',
                inactiveBg: '#f9fafb',
                inactiveText: '#4b5563',
                borderColor: '#e5e7eb',
                contentBg: '#ffffff',
                fontSize: 13,
                borderRadius: 8,
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'We offer FREE standard UK delivery on all orders via Royal Mail 48 (2–3 business days). Express next-day delivery is available at checkout. Orders placed before 2pm Monday–Friday are dispatched the same day. Large or heavy items may be dispatched via a specialist courier — full tracking is always provided. International shipping is available via the eBay Global Shipping Programme — duties and taxes may apply for orders outside the UK.',
                    },
                    {
                        label: 'Returns',
                        content: 'We accept returns within 30 days of delivery. Items must be returned unused, in their original packaging and in the same condition as received. We offer FREE return postage on items that are faulty or not as described. For change-of-mind returns, the buyer is responsible for return postage costs. Refunds are processed within 1–2 business days of receiving the returned item.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, Visa, Mastercard, American Express, Apple Pay and Google Pay. All transactions are protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase. We do not accept bank transfers or cheques.',
                    },
                    {
                        label: 'Guarantee',
                        content: 'All items are quality checked before dispatch and come with a minimum 12-month warranty unless otherwise stated in the listing. If you experience any fault or issue with your item, please contact us directly before opening a case — we will resolve the matter promptly and professionally. Your satisfaction is our top priority.',
                    },
                ],
            }
        },

        // ── 12. Cross-Sell ───────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Like',
                titleColor: '#1e1535',
                titleFontSize: 16,
                bgColor: '#f9fafb',
                cardBg: '#ffffff',
                cardBorder: '#e5e7eb',
                borderRadius: 12,
                columns: 3,
                showPrice: true,
                gap: 12,
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                items: [
                    { imageUrl: '{{RELATED_IMAGE_1}}', title: '{{RELATED_TITLE_1}}', price: '{{RELATED_PRICE_1}}', url: '{{RELATED_URL_1}}' },
                    { imageUrl: '{{RELATED_IMAGE_2}}', title: '{{RELATED_TITLE_2}}', price: '{{RELATED_PRICE_2}}', url: '{{RELATED_URL_2}}' },
                    { imageUrl: '{{RELATED_IMAGE_3}}', title: '{{RELATED_TITLE_3}}', price: '{{RELATED_PRICE_3}}', url: '{{RELATED_URL_3}}' },
                ],
            }
        },

        // ── 13. Seller Info ──────────────────────────────────────────────────
        {
            type: 'seller_info', props: {
                sellerName: '{{SELLER_NAME}}',
                tagline: 'Specialist UK Home & Garden Retailer · Est. 2016 · 8,000+ Happy Customers',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#6b7c5a',
                avatarBg: '#6b7c5a',
                avatarText: '#ffffff',
                bgColor: '#f9fafb',
                textColor: '#1e1535',
                subTextColor: '#6b7280',
                borderRadius: 0,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 14. CTA Footer Banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Transform Your Home & Garden — Shop with Confidence',
                subText: 'Genuine products · Free UK delivery · 30-day returns · Top Rated Seller',
                bgColor: '#6b7c5a',
                bgGradient: true,
                gradientFrom: '#4a5c3a',
                gradientTo: '#c4703f',
                headingColor: '#ffffff',
                subColor: 'rgba(255,255,255,0.75)',
                textColor: '#ffffff',
                subTextColor: 'rgba(255,255,255,0.75)',
                align: 'center',
                minHeight: 90,
                paddingTop: 28,
                paddingBottom: 28,
                paddingLeft: 24,
                paddingRight: 24,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

    ],
}
