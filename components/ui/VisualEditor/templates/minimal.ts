// components/ui/VisualEditor/templates/minimal.ts
import { TemplateSection } from './types'

export const minimalTemplate: TemplateSection = {
    id: 'full-minimal',
    name: 'Clean Minimal',
    description: 'Crisp white · 12 blocks · Works for any category',
    category: 'full',
    blocks: [

        // ── 1. Store hero header — Riazify purple gradient ────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Quality Products · Fast Dispatch · Trusted UK Seller',
                bgGradient: true,
                gradientFrom: '#7530fb',
                gradientTo: '#4f46e5',
                textColor: '#ffffff',
                taglineColor: 'rgba(255,255,255,0.7)',
                height: 90,
                align: 'center',
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 2. Urgency bar ────────────────────────────────────────────────────
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

        // ── 3. Product title + condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                text: '{{PRODUCT_TITLE}}',
                conditionText: '{{ITEM_CONDITION}}',
                showCondition: true,
                color: '#111827',
                fontSize: 22,
                fontWeight: '800',
                align: 'left',
                bgColor: '#ffffff',
                paddingTop: 24,
                paddingBottom: 12,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 4. Product image ──────────────────────────────────────────────────
        {
            type: 'product_image', props: {
                src: 'https://source.unsplash.com/600x500/?product,item,white+background',
                alt: '{{PRODUCT_TITLE}}',
                maxWidth: 500,
                align: 'center',
                borderRadius: 10,
                showBorder: false,
                borderColor: '#e5e7eb',
                paddingTop: 16,
                paddingBottom: 16,
            }
        },

        // ── 5. Price block ────────────────────────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#7530fb',
                priceFontSize: 36,
                showBadge: false,
                badgeText: 'SALE',
                badgeBg: '#7530fb',
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

        // ── 6. Gradient divider ───────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'gradient',
                widthPercent: 80,
                thickness: 2,
                color: '#7530fb',
                paddingTop: 8,
                paddingBottom: 8,
            }
        },

        // ── 7. Product description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                color: '#6b7280',
                fontSize: 13,
                lineHeight: 1.8,
                showTitle: true,
                titleText: 'About This Item',
                titleColor: '#111827',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 8. Key features bullet list ───────────────────────────────────────
        {
            type: 'bullet_list', props: {
                bulletStyle: 'check',
                bulletColor: '#7530fb',
                color: '#374151',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 4,
                paddingBottom: 16,
                paddingLeft: 16,
                paddingRight: 16,
                items: [
                    '{{FEATURE_1}}',
                    '{{FEATURE_2}}',
                    '{{FEATURE_3}}',
                    '{{FEATURE_4}}',
                ],
            }
        },

        // ── 9. Solid divider ──────────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                widthPercent: 100,
                thickness: 1,
                color: '#e5e7eb',
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 10. Trust badges ──────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#7530fb',
                textColor: '#374151',
                badgeBg: '#fafafa',
                borderColor: '#e5e7eb',
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

        // ── 11. Policy tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#7530fb',
                activeText: '#ffffff',
                inactiveBg: '#fafafa',
                inactiveText: '#6b7280',
                borderColor: '#e5e7eb',
                borderRadius: 0,
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
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

        // ── 12. CTA footer banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Shop with Confidence',
                subText: 'Genuine Items · Fast UK Dispatch · 30-Day Returns · Top Rated Seller',
                bgColor: '#1e1535',
                bgGradient: true,
                gradientFrom: '#7530fb',
                gradientTo: '#1e1535',
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
