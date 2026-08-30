// components/ui/VisualEditor/templates/sports.ts
// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE Sports Template — 16 blocks, bold navy/orange theme
// Professional UK eBay seller layout — 100% ready to use
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const sportsTemplate: TemplateSection = {
    id: 'full-sports',
    name: 'Sports & Fitness',
    description: 'Bold navy & orange theme · 16 blocks · Pro UK seller layout',
    category: 'full',
    thumbnail: 'sports',
    blocks: [

        // ── 1. Store Hero Header — navy to orange gradient ────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Pro Sports Equipment · Fast UK Dispatch · Trusted Since 2015',
                bgColor: '#0f2040',
                bgGradient: true,
                gradientFrom: '#0f2040',
                gradientTo: '#c45000',
                textColor: '#ffffff',
                taglineColor: '#f97316',
                showLogo: false,
                height: 120,
                align: 'center',
                borderRadius: 0,
                nameFontSize: 28,
                nameFontWeight: '800',
                taglineFontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 24,
                paddingRight: 24,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 2. Navigation Bar — orange on navy ────────────────────────────────
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
                    { label: 'All Items', url: '{{STORE_URL}}' },
                    { label: 'Clothing', url: '#' },
                    { label: 'Footwear', url: '#' },
                    { label: 'Equipment', url: '#' },
                    { label: 'Supplements', url: '#' },
                    { label: 'Contact Us', url: '#' },
                ],
            }
        },

        // ── 3. Product Title + Condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                text: '{{PRODUCT_TITLE}}',
                conditionText: 'Condition: {{ITEM_CONDITION}}',
                showCondition: true,
                color: '#0f2040',
                conditionColor: '#f97316',
                fontSize: 24,
                fontWeight: '800',
                align: 'left',
                bgColor: '#f0f4fa',
                paddingTop: 20,
                paddingBottom: 8,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 4. Product Image ──────────────────────────────────────────────────
        {
            type: 'product_image', props: {
                src: '{{MAIN_IMAGE_URL}}',
                alt: '{{PRODUCT_TITLE}}',
                maxWidth: 520,
                align: 'center',
                borderRadius: 10,
                showBorder: true,
                borderColor: '#c8d4e8',
                borderWidth: 1,
                objectFit: 'contain',
                bgColor: '#f0f4fa',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 5. Price Block — orange badge ─────────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#0f2040',
                priceFontSize: 38,
                priceFontWeight: '900',
                priceAlign: 'left',
                showOriginal: true,
                originalText: '{{ORIGINAL_PRICE}}',
                originalColor: '#9ca3af',
                originalSize: 16,
                showBadge: true,
                badgeText: 'FREE DELIVERY',
                badgeBg: '#f97316',
                badgeColor: '#ffffff',
                badgeFontSize: 11,
                badgeBorderRadius: 4,
                bgColor: '#e8f0fc',
                borderRadius: 0,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 6. Urgency Bar ────────────────────────────────────────────────────
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

        // ── 7. Key Features Bullet List ───────────────────────────────────────
        {
            type: 'bullet_list', props: {
                items: [
                    'Professional grade — trusted by athletes and coaches',
                    'Lightweight and durable — built for performance',
                    '{{SPORT}} specific design — optimised for your game',
                    'Official licensed product — 100% authentic',
                    'Free UK returns within 30 days',
                ],
                bulletStyle: 'check',
                bulletColor: '#f97316',
                color: '#0f2040',
                fontSize: 13,
                bgColor: '#f0f4fa',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 8. Trust Badges ───────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#f97316',
                textColor: '#0f2040',
                subTextColor: '#6b7280',
                badgeBg: '#f0f4fa',
                borderColor: '#c8d4e8',
                borderRadius: 10,
                align: 'center',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                badges: [
                    { icon: 'shield-check', text: 'Official Product', subText: '100% Authentic' },
                    { icon: 'truck', text: 'Fast Dispatch', subText: 'Same Day if before 3pm' },
                    { icon: 'rotate-ccw', text: '30-Day Returns', subText: 'Hassle Free' },
                    { icon: 'star', text: 'Top Rated Seller', subText: '5000+ Reviews' },
                ],
            }
        },

        // ── 9. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#0f2040',
                titleFontSize: 16,
                color: '#374151',
                fontSize: 13,
                lineHeight: 1.8,
                bgColor: '#ffffff',
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 10. Divider — navy ────────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                color: '#c8d4e8',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 4,
                paddingBottom: 4,
            }
        },

        // ── 11. Specs Table — sports specific ─────────────────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                titleColor: '#0f2040',
                titleFontSize: 16,
                headerBg: '#0f2040',
                headerText: '#f97316',
                altRowBg: '#f0f4fa',
                rowBg: '#ffffff',
                borderColor: '#c8d4e8',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                rows: [
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Sport', value: '{{SPORT}}' },
                    { key: 'Size', value: '{{SIZE}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Material', value: '{{MATERIAL}}' },
                    { key: 'Gender', value: '{{GENDER}}' },
                    { key: 'Age Group', value: '{{AGE_GROUP}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'Model Number', value: '{{MPN}}' },
                    { key: 'EAN / GTIN', value: '{{EAN}}' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                    { key: 'Warranty', value: '12 Months' },
                ],
            }
        },

        // ── 12. Shipping Info — navy green ────────────────────────────────────
        {
            type: 'shipping_info', props: {
                bgColor: '#e8f0fc',
                textColor: '#0f2040',
                iconColor: '#2563eb',
                borderRadius: 0,
                shippingText: '✅ FREE Standard UK Delivery — Royal Mail 48 (2–3 business days)',
                dispatchText: '⚡ Same-day dispatch on orders placed before 3pm Mon–Fri',
                locationText: '📦 Dispatched from: United Kingdom',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 13. Returns Policy — orange accent ────────────────────────────────
        {
            type: 'returns_policy', props: {
                bgColor: '#fff7ed',
                textColor: '#9a3412',
                iconColor: '#f97316',
                accentColor: '#f97316',
                borderRadius: 0,
                policyText: '↩ 30-day hassle-free returns. Items must be unused and in original packaging.',
                showPeriod: true,
                periodText: '30-Day Free Returns on items not as described',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 14. Policy Tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#0f2040',
                activeText: '#f97316',
                inactiveBg: '#f0f4fa',
                inactiveText: '#374151',
                borderColor: '#c8d4e8',
                contentBg: '#ffffff',
                fontSize: 13,
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
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

        // ── 15. Seller Info ───────────────────────────────────────────────────
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
                bgColor: '#e8f0fc',
                textColor: '#0f2040',
                subTextColor: '#6b7280',
                accentColor: '#f97316',
                borderRadius: 0,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 16. CTA Footer Banner — navy/orange gradient ──────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Gear Up & Perform — Trusted UK Sports Seller',
                subText: 'Official products · Free UK delivery · Same-day dispatch · 30-day returns',
                bgColor: '#0f2040',
                bgGradient: true,
                gradientFrom: '#0f2040',
                gradientTo: '#c45000',
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
