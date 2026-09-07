// components/ui/VisualEditor/templates/auto.ts
// ─────────────────────────────────────────────────────────────────────────────
// Auto Parts Template — 16 blocks, 2-column hero + refined policy cards.
// Category-consistent product theme: dark industrial / amber.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const autoTemplate: TemplateSection = {
    id: 'full-auto',
    name: 'Auto Parts',
    description: 'Dark industrial · 16 blocks · 2-column hero + crisp policy cards',
    category: 'full',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'OEM Quality Parts · UK Seller · Fast Dispatch · Fitment Guaranteed',
                bgColor: '#171717',
                bgGradient: true,
                bgGradientFrom: '#171717',
                bgGradientTo: '#292524',
                bgGradientDir: 135,
                nameFontSize: 22,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 12,
                taglineColor: '#f59e0b',
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
                bgColor: '#f59e0b',
                textColor: '#171717',
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
                    { label: 'All Parts',   url: '#' },
                    { label: 'Engine',      url: '#' },
                    { label: 'Body Parts',  url: '#' },
                    { label: 'Electrical',  url: '#' },
                    { label: 'Contact',     url: '#' },
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
                leftBg: '#fafafa',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'OEM-quality replacement part — direct fit',
                    'Manufactured to original-equipment specifications',
                    'Vehicle compatibility: {{COMPATIBLE_MODELS}}',
                    'Includes 12-month manufacturer warranty',
                ],
                accentColor: '#d97706',
                scarcityBg: '#fef2f2',
                scarcityColor: '#991b1b',
            }
        },

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: 'Only {{QUANTITY}} Left — Order Before 3pm for Same Day Dispatch!',
                bgColor: '#fef2f2',
                textColor: '#991b1b',
                iconColor: '#ef4444',
                borderRadius: 0,
                showIcon: true,
                align: 'center',
                fontSize: 13,
                fontWeight: '700',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 5. Trust Badges (white card grid) ────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#d97706',
                textColor: '#171717',
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
                    { icon: 'shield-check', text: 'OEM Quality',       subText: 'Direct Fit' },
                    { icon: 'truck',         text: 'Same Day Dispatch',  subText: 'Order before 3pm' },
                    { icon: 'rotate-ccw',    text: '30-Day Returns',     subText: 'Hassle Free' },
                    { icon: 'star',          text: 'Fitment Guaranteed', subText: 'Verified Compatibility' },
                ],
            }
        },

        // ── 6. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                color: '#525252',
                fontSize: 14,
                lineHeight: 1.8,
                showTitle: true,
                titleText: 'Product Description',
                titleColor: '#1e1535',
                titleFontSize: 18,
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
                titleText: 'Compatibility & Specifications',
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
                    { key: 'Compatible With', value: '{{COMPATIBLE_MODELS}}' },
                    { key: 'Brand',           value: '{{BRAND}}' },
                    { key: 'Part Number',     value: '{{MPN}}' },
                    { key: 'EAN',             value: '{{EAN}}' },
                    { key: 'Condition',       value: '{{ITEM_CONDITION}}' },
                    { key: 'Placement',       value: '{{PLACEMENT}}' },
                    { key: 'Material',        value: '{{MATERIAL}}' },
                    { key: 'Warranty',        value: '{{WARRANTY}}' },
                    { key: 'SKU',             value: '{{ITEM_SKU}}' },
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
                accentColor: '#d97706',
                iconColor: '#d97706',
                iconBg: '#fef3e8',
                borderRadius: 8,
                policyText: 'Please verify fitment before fitting. {{RETURN_POLICY}}. We cannot accept returns on fitted parts unless the item is faulty.',
                showPeriod: true,
                periodText: '30-Day Returns on Unused Parts',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 11. Policy Tabs ──────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#171717',
                activeText: '#ffffff',
                inactiveBg: '#f9fafb',
                inactiveText: '#525252',
                borderColor: '#e5e7eb',
                contentBg: '#ffffff',
                borderRadius: 8,
                fontSize: 13,
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 20,
                paddingRight: 20,
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'FREE UK delivery on all orders. Orders placed before 3pm Monday to Friday are dispatched same day. Standard delivery 1-2 business days. Express next-day available at checkout. Heavy items dispatched via specialist courier - full tracking provided on all orders.',
                    },
                    {
                        label: 'Returns',
                        content: '30-day returns accepted. Part must be in its original unused condition. Please verify fitment before fitting - we cannot accept returns on fitted parts unless the item is faulty. Contact us first and we will provide a prepaid return label for any faulty items.',
                    },
                    {
                        label: 'Payment',
                        content: 'PayPal, credit and debit cards accepted via eBay secure checkout. All transactions are fully covered by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase.',
                    },
                    {
                        label: 'Warranty',
                        content: '12-month warranty on all parts. Warranty covers manufacturing defects only and does not cover damage caused by incorrect fitting. Contact us within the warranty period and we will arrange a replacement or full refund promptly.',
                    },
                ],
            }
        },

        // ── 12. Cross-Sell ───────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Need',
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
                tagline: 'UK Auto Parts Specialist · Est. 2014 · 9,000+ Happy Customers',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#d97706',
                avatarBg: '#171717',
                avatarText: '#f59e0b',
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
                headingText: 'Guaranteed Fitment — UK Quality Parts',
                subText: 'Over 10,000 parts in stock · Same day dispatch · Expert support available',
                bgColor: '#171717',
                bgGradient: true,
                bgGradientFrom: '#171717',
                bgGradientTo: '#292524',
                headingColor: '#f59e0b',
                subColor: 'rgba(255,255,255,0.65)',
                textColor: '#f59e0b',
                subTextColor: 'rgba(255,255,255,0.65)',
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
