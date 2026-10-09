// components/ui/VisualEditor/templates/electronics.ts
// ─────────────────────────────────────────────────────────────────────────────
// Electronics Template — 16 blocks, 2-column hero + refined policy cards.
// Category-consistent product theme: TechVault headphones.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const electronicsTemplate: TemplateSection = {
    id: 'full-electronics',
    name: 'Electronics',
    description: 'Dark tech theme · 16 blocks · Pro 2-column hero + crisp policy cards',
    category: 'full',
    thumbnail: 'electronics',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Authorised UK Reseller · Same-Day Dispatch · 5-Star Rated',
                bgColor: '#0f172a',
                bgGradient: true,
                bgGradientFrom: '#0f172a',
                bgGradientTo: '#1e3a5f',
                bgGradientDir: 135,
                nameFontSize: 22,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 12,
                taglineColor: '#93c5fd',
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
                    { label: 'All Items',    url: '{{STORE_URL}}' },
                    { label: 'Smartphones',  url: '#' },
                    { label: 'Laptops',      url: '#' },
                    { label: 'Accessories',  url: '#' },
                    { label: 'Bundles',      url: '#' },
                    { label: 'Contact Us',   url: '#' },
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
                leftBg: '#f8fafc',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'Hi-Res certified 40mm dynamic drivers',
                    'Active Noise Cancellation with Transparency mode',
                    '40-hour battery life — USB-C fast charging',
                    'Bluetooth 5.3 multipoint pairing',
                ],
                accentColor: '#1d4ed8',
                scarcityBg: '#fef2f2',
                scarcityColor: '#991b1b',
            }
        },

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '🔥 Only {{QUANTITY}} units left — {{WATCHERS}} people watching this item',
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

        // ── 5. Trust Badges (white card grid) ────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#1d4ed8',
                textColor: '#0f172a',
                subTextColor: '#64748b',
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
                    { icon: 'truck',         text: 'Fast Dispatch',     subText: 'Same Day if before 3pm' },
                    { icon: 'rotate-ccw',    text: '30-Day Returns',    subText: 'Hassle Free' },
                    { icon: 'star',          text: 'Top Rated Seller',  subText: '5000+ Positive Reviews' },
                ],
            }
        },

        // ── 6. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#0f172a',
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

        // ── 7. Specs Table (crisp 2-column alternating) ──────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                titleColor: '#0f172a',
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
                    { key: 'Brand',             value: '{{BRAND}}' },
                    { key: 'Model',             value: '{{MODEL}}' },
                    { key: 'Model Number',      value: '{{MPN}}' },
                    { key: 'Condition',         value: '{{ITEM_CONDITION}}' },
                    { key: 'Connectivity',      value: '{{CONNECTIVITY}}' },
                    { key: 'Network',           value: '{{NETWORK}}' },
                    { key: 'Storage Capacity',  value: '{{STORAGE}}' },
                    { key: 'Colour',            value: '{{COLOUR}}' },
                    { key: 'EAN / GTIN',        value: '{{EAN}}' },
                    { key: 'Warranty',          value: '{{WARRANTY}}' },
                ],
            }
        },

        // ── 8. Divider ───────────────────────────────────────────────────────
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

        // ── 9. Shipping Info (white card with truck SVG) ─────────────────────
        {
            type: 'shipping_info', props: {
                bgColor: '#ffffff',
                textColor: '#0f172a',
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
                textColor: '#0f172a',
                accentColor: '#3b82f6',
                iconColor: '#3b82f6',
                iconBg: '#eff6ff',
                borderRadius: 8,
                policyText: '{{RETURN_POLICY}}. We cover return postage on items that are faulty or not as described.',
                showPeriod: true,
                periodText: '30-Day Free Returns',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 11. Policy Tabs ──────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#1d4ed8',
                activeText: '#ffffff',
                inactiveBg: '#f8fafc',
                inactiveText: '#475569',
                borderColor: '#e2e8f0',
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

        // ── 12. Cross-Sell ───────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Like',
                titleColor: '#0f172a',
                titleFontSize: 16,
                bgColor: '#f8fafc',
                cardBg: '#ffffff',
                cardBorder: '#e2e8f0',
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

        // ── 14. CTA Footer Banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Buy with Confidence — Trusted eBay Electronics Seller',
                subText: 'Genuine products · Secure eBay checkout · Fast same-day dispatch · 30-day returns',
                bgColor: '#0f172a',
                bgGradient: true,
                gradientFrom: '#0f172a',
                gradientTo: '#1e3a5f',
                headingColor: '#ffffff',
                subColor: 'rgba(255,255,255,0.65)',
                textColor: '#ffffff',
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
