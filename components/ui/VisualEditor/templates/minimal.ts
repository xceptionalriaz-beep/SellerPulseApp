// components/ui/VisualEditor/templates/minimal.ts
// ─────────────────────────────────────────────────────────────────────────────
// Clean Minimal Template — 16 blocks, 2-column hero + refined policy cards.
// Category-consistent product theme: Riazify purple / white.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const minimalTemplate: TemplateSection = {
    id: 'full-minimal',
    name: 'Clean Minimal',
    description: 'Crisp white · 16 blocks · Pro 2-column hero + crisp policy cards',
    category: 'full',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Quality Products · Fast Dispatch · Trusted UK Seller',
                bgColor: '#7530fb',
                bgGradient: true,
                bgGradientFrom: '#7530fb',
                bgGradientTo: '#4f46e5',
                bgGradientDir: 135,
                nameFontSize: 22,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 12,
                taglineColor: 'rgba(255,255,255,0.7)',
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
                bgColor: '#1e1535',
                textColor: '#c4b5fd',
                hoverColor: '#ffffff',
                activeColor: '#b8fa33',
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
                    { label: 'All Items',   url: '{{STORE_URL}}' },
                    { label: 'New',         url: '#' },
                    { label: 'Bestsellers', url: '#' },
                    { label: 'Sale',        url: '#' },
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
                leftBg: '#ffffff',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'Premium quality — built to last',
                    'Fast UK dispatch with full tracking',
                    'Secure eBay checkout — Money Back Guarantee',
                    '30-day free returns on all orders',
                ],
                accentColor: '#7530fb',
                scarcityBg: '#fef2f2',
                scarcityColor: '#991b1b',
            }
        },

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '🔥 Only {{QUANTITY}} Left in Stock — Order Soon!',
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
                iconColor: '#7530fb',
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
                color: '#6b7280',
                fontSize: 14,
                lineHeight: 1.8,
                showTitle: true,
                titleText: 'About This Item',
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
                    { key: 'Brand',       value: '{{BRAND}}' },
                    { key: 'Model',       value: '{{MODEL}}' },
                    { key: 'MPN',         value: '{{MPN}}' },
                    { key: 'Condition',   value: '{{ITEM_CONDITION}}' },
                    { key: 'Colour',      value: '{{COLOUR}}' },
                    { key: 'Size',        value: '{{SIZE}}' },
                    { key: 'Material',    value: '{{MATERIAL}}' },
                    { key: 'EAN',         value: '{{EAN}}' },
                    { key: 'Warranty',    value: '{{WARRANTY}}' },
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
                accentColor: '#7530fb',
                iconColor: '#7530fb',
                iconBg: '#f5f3ff',
                borderRadius: 8,
                policyText: '{{RETURN_POLICY}}. Item must be in its original unused condition and packaging.',
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
                activeBg: '#7530fb',
                activeText: '#ffffff',
                inactiveBg: '#f9fafb',
                inactiveText: '#6b7280',
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
                        content: 'FREE UK delivery on all orders. Standard: 2-3 business days. Express next-day available at checkout. International shipping via the eBay Global Shipping Programme - duties and taxes may apply.',
                    },
                    {
                        label: 'Returns',
                        content: '30-day returns accepted. Item must be in its original unused condition and packaging. Contact us first and we will make it right - your satisfaction is guaranteed. Refunds processed within 2 business days.',
                    },
                    {
                        label: 'Payment',
                        content: 'PayPal and all major credit and debit cards accepted via eBay secure checkout. All transactions are fully protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All items come with at least 12 months warranty unless otherwise stated. Contact us within the warranty period for any issues and we will resolve them promptly.',
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
                tagline: 'Trusted UK Seller · Quality Products · Top Rated Service',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#7530fb',
                avatarBg: '#1e1535',
                avatarText: '#b8fa33',
                bgColor: '#ffffff',
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
                headingText: 'Shop with Confidence',
                subText: 'Genuine Items · Fast UK Dispatch · 30-Day Returns · Top Rated Seller',
                bgColor: '#1e1535',
                bgGradient: true,
                bgGradientFrom: '#7530fb',
                bgGradientTo: '#1e1535',
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
