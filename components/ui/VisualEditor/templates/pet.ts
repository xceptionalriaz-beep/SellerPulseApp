// components/ui/VisualEditor/templates/pet.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pet Supplies Template — 16 blocks, polished high-converting layout.
// Showcases the new 2-column hero + refined policy/specs/trust cards.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const petTemplate: TemplateSection = {
    id: 'full-pet',
    name: 'Pet Supplies',
    description: 'Pet theme · 16 blocks · Pro 2-column hero + crisp policy cards',
    category: 'full',
    thumbnail: 'pet',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Trusted Pet Supplies · UK Family-Run Store · 5-Star Rated',
                bgColor: '#1e1535',
                bgGradient: true,
                bgGradientFrom: '#1e1535',
                bgGradientTo: '#3b2563',
                bgGradientDir: 135,
                nameFontSize: 22,
                nameFontWeight: '800',
                nameColor: '#ffffff',
                taglineFontSize: 12,
                taglineColor: '#c4b5fd',
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
                bgColor: '#ffffff',
                textColor: '#374151',
                hoverColor: '#7530fb',
                activeColor: '#7530fb',
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

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '🔥 Only {{QUANTITY}} left in stock — {{WATCHERS}} people are watching this right now',
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

        // ── 5. Trust Badges (white card row) ─────────────────────────────────
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
                shippingText: '{{SHIPPING_TIME}} — FREE UK Delivery',
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
                activeBg: '#7530fb',
                activeText: '#ffffff',
                inactiveBg: '#f9fafb',
                inactiveText: '#6b7280',
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
                        content: 'We offer FREE standard UK delivery on all orders (2–3 business days via Royal Mail 48). Express next-day delivery is available at checkout for £3.99. Orders placed before 3pm Monday–Friday are dispatched the same day. International shipping is available via the eBay Global Shipping Programme.',
                    },
                    {
                        label: 'Returns',
                        content: 'We accept returns within 30 days of delivery. Items must be returned in their original condition and original packaging with all accessories included. We offer FREE return postage on items that are faulty or not as described. For change-of-mind returns, the buyer is responsible for return postage costs. Refunds are processed within 1–2 business days of receiving the returned item.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, Visa, Mastercard, American Express, Apple Pay and Google Pay. All transactions are protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All products are covered by a minimum 12-month manufacturer warranty. If you experience any fault or issue with your item, please contact us directly before opening a case — we will resolve the matter promptly and professionally.',
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
                columns: 4,
                showPrice: true,
                gap: 12,
                paddingTop: 24,
                paddingBottom: 24,
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

        // ── 13. Seller Info ──────────────────────────────────────────────────
        {
            type: 'seller_info', props: {
                sellerName: '{{SELLER_NAME}}',
                tagline: 'Trusted Pet Supplies UK · Est. 2018 · 5,000+ Happy Pet Parents',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#7530fb',
                avatarBg: '#f5f3ff',
                avatarText: '#7530fb',
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
                headingText: 'Buy with Confidence — Trusted UK Pet Supplies',
                subText: 'Genuine products · Secure eBay checkout · Fast same-day dispatch · 30-day returns',
                bgColor: '#1e1535',
                bgGradient: true,
                gradientFrom: '#1e1535',
                gradientTo: '#7530fb',
                headingColor: '#ffffff',
                subColor: 'rgba(255,255,255,0.7)',
                textColor: '#ffffff',
                subTextColor: 'rgba(255,255,255,0.7)',
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
