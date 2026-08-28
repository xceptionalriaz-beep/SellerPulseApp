// components/ui/VisualEditor/templates/fashion.ts
import { TemplateSection } from './types'

export const fashionTemplate: TemplateSection = {
    id: 'full-fashion',
    name: 'Fashion & Clothing',
    description: 'Elegant pink theme · 13 blocks · Gallery + features + returns',
    category: 'full',
    blocks: [

        // ── 1. Store hero header — deep rose gradient ─────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Premium Fashion · Free UK Returns · Next Day Available',
                bgGradient: true,
                gradientFrom: '#be185d',
                gradientTo: '#831843',
                textColor: '#ffffff',
                taglineColor: 'rgba(255,255,255,0.7)',
                height: 100,
                align: 'center',
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 2. Navigation bar ─────────────────────────────────────────────────
        {
            type: 'nav_bar', props: {
                bgColor: '#500724',
                textColor: '#fce7f3',
                hoverColor: '#f9a8d4',
                separator: '·',
                align: 'center',
                fontSize: 12,
                borderRadius: 0,
                paddingTop: 10,
                paddingBottom: 10,
                links: [
                    { label: 'All Items', url: '#' },
                    { label: 'Dresses', url: '#' },
                    { label: 'Tops', url: '#' },
                    { label: 'Accessories', url: '#' },
                    { label: 'Sale', url: '#' },
                ],
            }
        },

        // ── 3. Product title + condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                text: '{{PRODUCT_TITLE}}',
                conditionText: '{{ITEM_CONDITION}}',
                showCondition: true,
                color: '#831843',
                fontSize: 22,
                fontWeight: '800',
                align: 'left',
                bgColor: '#fff7fb',
                paddingTop: 20,
                paddingBottom: 10,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 4. Product image — portrait fashion shot ───────────────────────────
        {
            type: 'product_image', props: {
                src: 'https://source.unsplash.com/600x700/?fashion,clothing,style',
                alt: '{{PRODUCT_TITLE}}',
                maxWidth: 480,
                align: 'center',
                borderRadius: 12,
                showBorder: false,
                borderColor: '#fbcfe8',
                bgColor: '#fff7fb',
                paddingTop: 16,
                paddingBottom: 16,
            }
        },

        // ── 5. Price block — with sale badge ──────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#be185d',
                priceFontSize: 34,
                showBadge: true,
                badgeText: 'SALE',
                badgeBg: '#be185d',
                badgeColor: '#ffffff',
                showOriginal: true,
                originalText: '{{ORIGINAL_PRICE}}',
                borderRadius: 8,
                bgColor: '#fff7fb',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 6. Urgency bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: 'Only {{QUANTITY}} Left — Order Before They Sell Out!',
                bgColor: '#fdf2f8',
                textColor: '#831843',
                iconColor: '#be185d',
                borderRadius: 0,
                showIcon: true,
                align: 'center',
                fontSize: 13,
                paddingTop: 10,
                paddingBottom: 10,
            }
        },

        // ── 7. Key features bullet list ───────────────────────────────────────
        {
            type: 'bullet_list', props: {
                items: [
                    'Premium quality material — built to last',
                    'True to size — check size guide before ordering',
                    'Machine washable at 30 degrees',
                    'Available in multiple colours — see our store',
                    'Free UK returns within 30 days',
                ],
                bulletStyle: 'check',
                bulletColor: '#be185d',
                color: '#500724',
                fontSize: 13,
                bgColor: '#fff7fb',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 8. Trust badges ───────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#be185d',
                textColor: '#831843',
                badgeBg: '#fdf2f8',
                borderColor: '#fbcfe8',
                borderRadius: 8,
                paddingTop: 16,
                paddingBottom: 16,
                badges: [
                    { icon: 'check', text: 'Genuine Item' },
                    { icon: 'package', text: 'Careful Packaging' },
                    { icon: 'refresh-ccw', text: 'Free Returns' },
                    { icon: 'star', text: 'Top Rated' },
                ],
            }
        },

        // ── 9. Product description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                color: '#6b7280',
                fontSize: 13,
                lineHeight: 1.8,
                showTitle: true,
                titleText: 'Product Details',
                titleColor: '#831843',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 10. Divider ───────────────────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                color: '#fbcfe8',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 0,
                paddingBottom: 0,
            }
        },

        // ── 11. Specs table — fashion specific ────────────────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                headerBg: '#be185d',
                headerText: '#ffffff',
                altRowBg: '#fdf2f8',
                rowBg: '#ffffff',
                borderColor: '#fbcfe8',
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                rows: [
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Size', value: '{{SIZE}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Material', value: '{{MATERIAL}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'Style', value: '{{STYLE}}' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                ],
            }
        },

        // ── 12. Policy tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#be185d',
                activeText: '#ffffff',
                inactiveBg: '#fdf2f8',
                inactiveText: '#6b7280',
                borderColor: '#fbcfe8',
                borderRadius: 0,
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'FREE standard UK delivery on all orders. Dispatched within 1 business day. Standard: 2-3 business days. Express next-day available at checkout. International shipping via the eBay Global Shipping Programme - duties and taxes may apply.',
                    },
                    {
                        label: 'Returns',
                        content: 'FREE 30-day returns on all items. Item must be unworn and in its original condition with all tags still attached. Contact us before returning and we will arrange collection at no additional cost to you. Refunds processed within 2 business days.',
                    },
                    {
                        label: 'Payment',
                        content: 'All major credit and debit cards and PayPal accepted via eBay secure checkout. All transactions are fully protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase.',
                    },
                    {
                        label: 'Warranty',
                        content: 'All items are individually quality checked before dispatch. If your item arrives damaged or not as described, please contact us immediately and we will arrange a full replacement or refund at no cost to you.',
                    },
                ],
            }
        },

        // ── 13. CTA footer banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Shop with Confidence',
                subText: 'Free UK Returns · Genuine Items · Top Rated Seller · Fast Dispatch',
                bgColor: '#831843',
                bgGradient: false,
                gradientFrom: '#be185d',
                gradientTo: '#831843',
                textColor: '#ffffff',
                subTextColor: 'rgba(255,255,255,0.7)',
                align: 'center',
                minHeight: 80,
                paddingTop: 24,
                paddingBottom: 24,
            }
        },

    ],
}
