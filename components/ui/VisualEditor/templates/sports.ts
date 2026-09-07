// components/ui/VisualEditor/templates/sports.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sports & Fitness Template — 16 blocks, 2-column hero + refined policy cards.
// Category-consistent product theme: bold navy / orange.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const sportsTemplate: TemplateSection = {
    id: 'full-sports',
    name: 'Sports & Fitness',
    description: 'Bold navy & orange theme · 16 blocks · Pro 2-column hero + crisp cards',
    category: 'full',
    thumbnail: 'sports',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Pro Sports Equipment · Fast UK Dispatch · Trusted Since 2015',
                bgColor: '#0f2040',
                bgGradient: true,
                bgGradientFrom: '#0f2040',
                bgGradientTo: '#c45000',
                bgGradientDir: 135,
                nameFontSize: 22,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 12,
                taglineColor: '#f97316',
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
                bgColor: '#f97316',
                textColor: '#0f2040',
                hoverColor: '#ffffff',
                activeColor: '#ffffff',
                separator: '|',
                align: 'center',
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 1,
                borderRadius: 0,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 24,
                paddingRight: 24,
                links: [
                    { label: 'All Items',     url: '{{STORE_URL}}' },
                    { label: 'Clothing',      url: '#' },
                    { label: 'Footwear',      url: '#' },
                    { label: 'Equipment',     url: '#' },
                    { label: 'Supplements',   url: '#' },
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
                leftBg: '#f0f4fa',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'Professional grade — trusted by athletes and coaches',
                    'Lightweight and durable — built for performance',
                    '{{SPORT}} specific design — optimised for your game',
                    'Official licensed product — 100% authentic',
                ],
                accentColor: '#f97316',
                scarcityBg: '#fff7ed',
                scarcityColor: '#9a3412',
            }
        },

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '⚡ Only {{QUANTITY}} left — {{WATCHERS}} athletes watching this right now!',
                bgColor: '#fff7ed',
                textColor: '#9a3412',
                iconColor: '#f97316',
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
                iconColor: '#f97316',
                textColor: '#0f2040',
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
                    { icon: 'shield-check', text: 'Official Product',  subText: '100% Authentic' },
                    { icon: 'truck',         text: 'Fast Dispatch',      subText: 'Same Day if before 3pm' },
                    { icon: 'rotate-ccw',    text: '30-Day Returns',     subText: 'Hassle Free' },
                    { icon: 'star',          text: 'Top Rated Seller',   subText: '5000+ Reviews' },
                ],
            }
        },

        // ── 6. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#0f2040',
                titleFontSize: 18,
                color: '#374151',
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
                titleColor: '#0f2040',
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
                    { key: 'Sport',         value: '{{SPORT}}' },
                    { key: 'Size',          value: '{{SIZE}}' },
                    { key: 'Colour',        value: '{{COLOUR}}' },
                    { key: 'Material',      value: '{{MATERIAL}}' },
                    { key: 'Gender',        value: '{{GENDER}}' },
                    { key: 'Age Group',     value: '{{AGE_GROUP}}' },
                    { key: 'Model Number',  value: '{{MPN}}' },
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
                dispatchText: 'Same-day dispatch on orders placed before 3pm Mon–Fri',
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
                accentColor: '#f97316',
                iconColor: '#f97316',
                iconBg: '#fff7ed',
                borderRadius: 8,
                policyText: '{{RETURN_POLICY}}. Items must be unused, unworn and in original packaging with all tags attached.',
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
                activeBg: '#0f2040',
                activeText: '#ffffff',
                inactiveBg: '#f0f4fa',
                inactiveText: '#374151',
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
                        content: 'We offer FREE standard UK delivery on all orders via Royal Mail 48 (2–3 business days). Express next-day delivery is available at checkout for £3.99. Orders placed before 3pm Monday–Friday are dispatched the same day. International shipping is available via the eBay Global Shipping Programme — duties and taxes may apply for orders outside the UK.',
                    },
                    {
                        label: 'Returns',
                        content: 'We accept returns within 30 days of delivery. Items must be returned unused, unworn and in their original packaging with all tags attached. We offer FREE return postage on items that are faulty or not as described. For change-of-mind returns, the buyer is responsible for return postage costs. Refunds are processed within 1–2 business days of receiving the returned item.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, Visa, Mastercard, American Express, Apple Pay and Google Pay. All transactions are protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase. We do not accept bank transfers or cheques.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All sports equipment and clothing comes with a minimum 12-month manufacturer warranty unless otherwise stated. If you experience any fault or quality issue with your item, please contact us directly before opening a case — we will resolve the matter promptly. Warranty does not cover normal wear and tear or damage caused by misuse.',
                    },
                ],
            }
        },

        // ── 12. Cross-Sell ───────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Like',
                titleColor: '#0f2040',
                titleFontSize: 16,
                bgColor: '#f0f4fa',
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
                tagline: 'Pro UK Sports Retailer · Est. 2015 · 12,000+ Happy Customers',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#f97316',
                avatarBg: '#0f2040',
                avatarText: '#f97316',
                bgColor: '#f0f4fa',
                textColor: '#0f2040',
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
                headingText: 'Gear Up & Perform — Trusted UK Sports Seller',
                subText: 'Official products · Free UK delivery · Same-day dispatch · 30-day returns',
                bgColor: '#0f2040',
                bgGradient: true,
                gradientFrom: '#0f2040',
                gradientTo: '#c45000',
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
