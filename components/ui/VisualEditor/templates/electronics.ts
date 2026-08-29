// components/ui/VisualEditor/templates/electronics.ts
// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE Electronics Template — 16 blocks, dark tech theme
// Professional UK eBay seller layout — 100% ready to use
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const electronicsTemplate: TemplateSection = {
    id: 'full-electronics',
    name: 'Electronics',
    description: 'Dark tech theme · 16 blocks · Pro UK seller layout',
    category: 'full',
    thumbnail: 'electronics',
    blocks: [

        // ── 1. Store Hero Header ──────────────────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Authorised UK Reseller · Same-Day Dispatch · 5-Star Rated',
                bgColor: '#0f172a',
                bgGradient: true,
                bgGradientFrom: '#0f172a',
                bgGradientTo: '#1e3a5f',
                bgGradientDir: 135,
                nameFontSize: 28,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 13,
                taglineColor: '#93c5fd',
                showLogo: false,
                height: 120,
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
                bgColor: '#1e293b',
                textColor: '#94a3b8',
                hoverColor: '#3b82f6',
                activeColor: '#60a5fa',
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
                    { label: 'All Items', url: '{{STORE_URL}}' },
                    { label: 'Smartphones', url: '#' },
                    { label: 'Laptops', url: '#' },
                    { label: 'Accessories', url: '#' },
                    { label: 'Bundles', url: '#' },
                    { label: 'Contact Us', url: '#' },
                ],
            }
        },

        // ── 3. Product Title + Condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                title: '{{PRODUCT_TITLE}}',
                conditionText: 'Condition: {{ITEM_CONDITION}}',
                showCondition: true,
                color: '#0f172a',
                conditionColor: '#3b82f6',
                fontSize: 24,
                fontWeight: '800',
                align: 'left',
                bgColor: '#ffffff',
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
                borderRadius: 12,
                showBorder: true,
                borderColor: '#e2e8f0',
                borderWidth: 1,
                objectFit: 'contain',
                bgColor: '#f8fafc',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 5. Price Block ────────────────────────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#1d4ed8',
                priceFontSize: 38,
                priceFontWeight: '900',
                priceAlign: 'left',
                showOriginal: true,
                originalText: '{{ORIGINAL_PRICE}}',
                originalColor: '#94a3b8',
                originalSize: 16,
                showBadge: true,
                badgeText: 'FREE DELIVERY',
                badgeBg: '#1d4ed8',
                badgeColor: '#ffffff',
                badgeFontSize: 11,
                badgeBorderRadius: 4,
                bgColor: '#f0f7ff',
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
                message: '🔥 Only {{QUANTITY}} units left — {{WATCHERS}} people watching this item',
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

        // ── 7. Trust Badges ───────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#1d4ed8',
                textColor: '#1e3a5f',
                subTextColor: '#64748b',
                badgeBg: '#f0f9ff',
                borderColor: '#bfdbfe',
                borderRadius: 10,
                align: 'center',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                badges: [
                    { icon: 'shield-check', text: 'Genuine Product', subText: '100% Authentic' },
                    { icon: 'truck', text: 'Fast Dispatch', subText: 'Same Day if before 3pm' },
                    { icon: 'rotate-ccw', text: '30-Day Returns', subText: 'Hassle Free' },
                    { icon: 'star', text: 'Top Rated Seller', subText: '5000+ Positive Reviews' },
                ],
            }
        },

        // ── 8. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                description: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#0f172a',
                titleFontSize: 16,
                color: '#475569',
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

        // ── 9. Specs Table ────────────────────────────────────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                titleColor: '#0f172a',
                titleFontSize: 16,
                headerBg: '#1e3a5f',
                headerText: '#ffffff',
                altRowBg: '#f8fafc',
                rowBg: '#ffffff',
                borderColor: '#e2e8f0',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                rows: [
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Model', value: '{{MODEL}}' },
                    { key: 'Model Number', value: '{{MPN}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Storage', value: '{{STORAGE}}' },
                    { key: 'Network', value: '{{NETWORK}}' },
                    { key: 'Connectivity', value: '{{CONNECTIVITY}}' },
                    { key: 'EAN / GTIN', value: '{{EAN}}' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                    { key: 'Warranty', value: '12 Months Manufacturer Warranty' },
                    { key: 'Country of Origin', value: 'United Kingdom' },
                ],
            }
        },

        // ── 10. Divider ───────────────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                color: '#e2e8f0',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 4,
                paddingBottom: 4,
            }
        },

        // ── 11. Shipping Info ─────────────────────────────────────────────────
        {
            type: 'shipping_info', props: {
                bgColor: '#f0fdf4',
                textColor: '#166534',
                iconColor: '#16a34a',
                borderRadius: 0,
                title: 'Delivery Information',
                shippingText: '✅ FREE Standard UK Delivery — Royal Mail 48 (2–3 business days)',
                dispatchText: '⚡ Same-day dispatch on orders placed before 3pm Mon–Fri',
                locationText: '📦 Dispatched from: United Kingdom',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 12. Returns Policy ────────────────────────────────────────────────
        {
            type: 'returns_policy', props: {
                bgColor: '#eff6ff',
                textColor: '#1e40af',
                iconColor: '#3b82f6',
                borderRadius: 0,
                policyText: '↩ 30-day hassle-free returns. Items must be unused and in original packaging.',
                showPeriod: true,
                periodText: '30-Day Free Returns on items not as described',
                accentColor: '#3b82f6',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 13. Policy Tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#1d4ed8',
                activeText: '#ffffff',
                inactiveBg: '#f8fafc',
                inactiveText: '#475569',
                borderColor: '#e2e8f0',
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
                        content: 'We accept returns within 30 days of delivery. Items must be returned in their original condition and original packaging with all accessories included. We offer FREE return postage on items that are faulty or not as described. For change-of-mind returns, the buyer is responsible for return postage costs. Refunds are processed within 1–2 business days of receiving the returned item.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, Visa, Mastercard, American Express, Apple Pay and Google Pay. All transactions are protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase. We do not accept bank transfers or cheques.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All electronics are covered by a minimum 12-month manufacturer warranty unless otherwise stated in the listing. If you experience any fault or issue with your item, please contact us directly before opening a case — we will resolve the matter promptly and professionally. Extended warranty options are available on selected products — please message us for details.',
                    },
                ],
            }
        },

        // ── 14. Cross-Sell ────────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Like',
                titleColor: '#0f172a',
                titleFontSize: 16,
                bgColor: '#f8fafc',
                cardBg: '#ffffff',
                cardBorder: '#e2e8f0',
                borderRadius: 10,
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

        // ── 15. Seller Info ───────────────────────────────────────────────────
        {
            type: 'seller_info', props: {
                sellerName: '{{SELLER_NAME}}',
                tagline: 'Authorised UK Reseller · Est. 2015 · 5,000+ Happy Customers',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#1d4ed8',
                avatarBg: '#1e3a5f',
                avatarText: '#ffffff',
                bgColor: '#f0f7ff',
                textColor: '#0f172a',
                subTextColor: '#475569',
                borderRadius: 0,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 16. CTA Footer Banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Buy with Confidence — Trusted eBay Electronics Seller',
                subText: 'Genuine products · Secure eBay checkout · Fast same-day dispatch · 30-day returns',
                bgColor: '#0f172a',
                bgGradient: true,
                bgGradientFrom: '#0f172a',
                bgGradientTo: '#1e3a5f',
                bgGradientDir: 135,
                headingColor: '#ffffff',
                subColor: 'rgba(255,255,255,0.65)',
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
