// components/ui/VisualEditor/templates/auto.ts
import { TemplateSection } from './types'

export const autoTemplate: TemplateSection = {
    id: 'full-auto',
    name: 'Auto Parts',
    description: 'Dark industrial · 12 blocks · Compatibility table + warranty',
    category: 'full',
    blocks: [

        // ── 1. Store hero header — dark black + amber ─────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'OEM Quality Parts · UK Seller · Fast Dispatch · Fitment Guaranteed',
                bgGradient: false,
                bgColor: '#171717',
                gradientFrom: '#171717',
                gradientTo: '#292524',
                textColor: '#ffffff',
                taglineColor: '#f59e0b',
                height: 100,
                align: 'center',
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 2. Navigation bar — amber on black ────────────────────────────────
        {
            type: 'nav_bar', props: {
                bgColor: '#f59e0b',
                textColor: '#171717',
                hoverColor: '#ffffff',
                separator: '|',
                align: 'center',
                fontSize: 12,
                borderRadius: 0,
                paddingTop: 10,
                paddingBottom: 10,
                links: [
                    { label: 'All Parts', url: '#' },
                    { label: 'Engine', url: '#' },
                    { label: 'Body Parts', url: '#' },
                    { label: 'Electrical', url: '#' },
                    { label: 'Contact', url: '#' },
                ],
            }
        },

        // ── 3. Urgency bar ────────────────────────────────────────────────────
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
                paddingTop: 10,
                paddingBottom: 10,
            }
        },

        // ── 4. Product title + condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                text: '{{PRODUCT_TITLE}}',
                conditionText: '{{ITEM_CONDITION}}',
                showCondition: true,
                color: '#171717',
                fontSize: 20,
                fontWeight: '800',
                align: 'left',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 10,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 5. Product image ──────────────────────────────────────────────────
        {
            type: 'product_image', props: {
                src: 'https://source.unsplash.com/600x450/?car,auto,parts,engine',
                alt: '{{PRODUCT_TITLE}}',
                maxWidth: 520,
                align: 'center',
                borderRadius: 8,
                showBorder: false,
                borderColor: '#e5e5e5',
                paddingTop: 16,
                paddingBottom: 16,
            }
        },

        // ── 6. Price block ────────────────────────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#d97706',
                priceFontSize: 34,
                showBadge: false,
                badgeText: 'SALE',
                badgeBg: '#d97706',
                badgeColor: '#ffffff',
                showOriginal: false,
                originalText: '{{ORIGINAL_PRICE}}',
                borderRadius: 8,
                bgColor: '#ffffff',
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 7. Trust badges ───────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#d97706',
                textColor: '#171717',
                badgeBg: '#fafaf9',
                borderColor: '#e5e5e5',
                borderRadius: 6,
                paddingTop: 16,
                paddingBottom: 16,
                badges: [
                    { icon: 'check', text: 'OEM Quality' },
                    { icon: 'package', text: 'Same Day Dispatch' },
                    { icon: 'refresh-ccw', text: '30-Day Returns' },
                    { icon: 'star', text: 'Fitment Guaranteed' },
                ],
            }
        },

        // ── 8. Product description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                color: '#525252',
                fontSize: 13,
                lineHeight: 1.8,
                showTitle: true,
                titleText: 'Product Description',
                titleColor: '#171717',
                bgColor: '#ffffff',
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
                color: '#e5e5e5',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 10. Specs table — compatibility + full spec set ───────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Compatibility & Specifications',
                headerBg: '#171717',
                headerText: '#f59e0b',
                altRowBg: '#fafafa',
                rowBg: '#ffffff',
                borderColor: '#e5e5e5',
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                rows: [
                    { key: 'Compatible With', value: '{{COMPATIBLE_MODELS}}' },
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Part Number', value: '{{MPN}}' },
                    { key: 'EAN', value: '{{EAN}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'Placement', value: '{{PLACEMENT}}' },
                    { key: 'Warranty', value: '12 Months' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                ],
            }
        },

        // ── 11. Policy tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#171717',
                activeText: '#f59e0b',
                inactiveBg: '#fafaf9',
                inactiveText: '#525252',
                borderColor: '#e5e5e5',
                borderRadius: 0,
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
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

        // ── 12. CTA footer banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Guaranteed Fitment — UK Quality Parts',
                subText: 'Over 10,000 parts in stock · Same day dispatch · Expert support available',
                bgColor: '#171717',
                bgGradient: false,
                gradientFrom: '#171717',
                gradientTo: '#292524',
                textColor: '#f59e0b',
                subTextColor: 'rgba(255,255,255,0.65)',
                align: 'center',
                minHeight: 80,
                paddingTop: 24,
                paddingBottom: 24,
            }
        },

    ],
}
