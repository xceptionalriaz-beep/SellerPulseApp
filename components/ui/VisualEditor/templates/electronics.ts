// components/ui/VisualEditor/templates/electronics.ts
import { TemplateSection } from './types'

export const electronicsTemplate: TemplateSection = {
    id: 'full-electronics',
    name: 'Electronics Listing',
    description: 'Dark tech theme · 12 blocks · Professional UK seller layout',
    category: 'full',
    blocks: [

        // ── 1. Store hero header — dark navy gradient ─────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Trusted eBay Seller · Fast Dispatch · Top Rated',
                bgGradient: true,
                gradientFrom: '#0f172a',
                gradientTo: '#1e3a5f',
                textColor: '#ffffff',
                taglineColor: 'rgba(255,255,255,0.65)',
                height: 110,
                align: 'center',
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 2. Navigation bar ─────────────────────────────────────────────────
        {
            type: 'nav_bar', props: {
                bgColor: '#0f172a',
                textColor: '#94a3b8',
                hoverColor: '#3b82f6',
                separator: '|',
                align: 'center',
                fontSize: 12,
                borderRadius: 0,
                paddingTop: 10,
                paddingBottom: 10,
                links: [
                    { label: 'All Items', url: '#' },
                    { label: 'Electronics', url: '#' },
                    { label: 'Accessories', url: '#' },
                    { label: 'Bundles', url: '#' },
                    { label: 'Contact Us', url: '#' },
                ],
            }
        },

        // ── 3. Product title + condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                text: '{{PRODUCT_TITLE}}',
                conditionText: '{{ITEM_CONDITION}}',
                showCondition: true,
                color: '#0f172a',
                fontSize: 22,
                fontWeight: '800',
                align: 'left',
                paddingTop: 20,
                paddingBottom: 10,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 4. Product image — large centred ──────────────────────────────────
        {
            type: 'product_image', props: {
                src: 'https://source.unsplash.com/600x450/?electronics,tech,product',
                alt: '{{PRODUCT_TITLE}}',
                maxWidth: 500,
                align: 'center',
                borderRadius: 10,
                showBorder: false,
                borderColor: '#e2e8f0',
                paddingTop: 16,
                paddingBottom: 16,
            }
        },

        // ── 5. Price block ────────────────────────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#1d4ed8',
                priceFontSize: 36,
                showBadge: false,
                badgeText: 'SALE',
                badgeBg: '#ef4444',
                badgeColor: '#ffffff',
                showOriginal: false,
                originalText: '{{ORIGINAL_PRICE}}',
                borderRadius: 10,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 6. Urgency bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: 'Only {{QUANTITY}} Left in Stock — Order Soon!',
                bgColor: '#fef2f2',
                textColor: '#991b1b',
                iconColor: '#ef4444',
                borderRadius: 0,
                showIcon: true,
                align: 'center',
                fontSize: 13,
                paddingTop: 10,
                paddingBottom: 10,
            }
        },

        // ── 7. Trust badges ───────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#1d4ed8',
                textColor: '#1e3a5f',
                badgeBg: '#f0f9ff',
                borderColor: '#bfdbfe',
                borderRadius: 8,
                paddingTop: 16,
                paddingBottom: 16,
                badges: [
                    { icon: 'check', text: 'Genuine Product' },
                    { icon: 'package', text: 'Fast Dispatch' },
                    { icon: 'refresh-ccw', text: '30-Day Returns' },
                    { icon: 'star', text: 'Top Rated Seller' },
                ],
            }
        },

        // ── 8. Product description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                color: '#475569',
                fontSize: 13,
                lineHeight: 1.8,
                showTitle: true,
                titleText: 'Product Description',
                titleColor: '#0f172a',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 9. Divider ────────────────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                color: '#e2e8f0',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 10. Specs table ───────────────────────────────────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                headerBg: '#1e3a5f',
                headerText: '#ffffff',
                altRowBg: '#f8fafc',
                rowBg: '#ffffff',
                borderColor: '#e2e8f0',
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                rows: [
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Model', value: '{{MODEL}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'MPN', value: '{{MPN}}' },
                    { key: 'EAN', value: '{{EAN}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Warranty', value: '12 Months Manufacturer Warranty' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                ],
            }
        },

        // ── 11. Policy tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#1d4ed8',
                activeText: '#ffffff',
                inactiveBg: '#f8fafc',
                inactiveText: '#475569',
                borderColor: '#e2e8f0',
                borderRadius: 0,
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'We offer FREE standard UK delivery on all orders. Standard delivery: 2-3 business days. Express next-day delivery available at checkout. Orders placed before 3pm Monday-Friday are dispatched the same day. International shipping available via the eBay Global Shipping Programme - duties and taxes may apply.',
                    },
                    {
                        label: 'Returns',
                        content: 'We accept returns within 30 days of delivery. Items must be returned in their original condition and packaging. We offer free return postage on items that are not as described. For change-of-mind returns, the buyer is responsible for return postage costs. Refunds are processed within 2 business days of receiving the return.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, credit cards and debit cards. All transactions are protected by eBay Money Back Guarantee. Payment must be completed within 4 days of purchase.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All items are covered by a 12-month manufacturer warranty unless otherwise stated. If you experience any issues with your item, please contact us before opening a case and we will resolve the matter promptly. Extended warranty options may be available - please message us for details.',
                    },
                ],
            }
        },

        // ── 12. Cross-sell ────────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'You May Also Like',
                titleColor: '#0f172a',
                bgColor: '#f8fafc',
                cardBg: '#ffffff',
                cardBorder: '#e2e8f0',
                borderRadius: 10,
                columns: 3,
                showPrice: true,
                gap: 12,
                paddingTop: 20,
                paddingBottom: 20,
                items: [
                    { imageUrl: 'https://source.unsplash.com/300x300/?electronics,headphones', title: '{{RELATED_TITLE_1}}', price: '{{RELATED_PRICE_1}}', url: '#' },
                    { imageUrl: 'https://source.unsplash.com/300x300/?gadget,tech', title: '{{RELATED_TITLE_2}}', price: '{{RELATED_PRICE_2}}', url: '#' },
                    { imageUrl: 'https://source.unsplash.com/300x300/?device,phone', title: '{{RELATED_TITLE_3}}', price: '{{RELATED_PRICE_3}}', url: '#' },
                ],
            }
        },

        // ── 13. CTA footer banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Buy with Confidence — Trusted eBay Seller',
                subText: 'All items are genuine · Secure payment via eBay · Fast same-day dispatch',
                bgColor: '#0f172a',
                bgGradient: false,
                gradientFrom: '#0f172a',
                gradientTo: '#1e3a5f',
                textColor: '#ffffff',
                subTextColor: 'rgba(255,255,255,0.65)',
                align: 'center',
                minHeight: 80,
                paddingTop: 24,
                paddingBottom: 24,
            }
        },

    ],
}
