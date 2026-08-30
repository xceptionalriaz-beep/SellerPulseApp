// components/ui/VisualEditor/templates/fashion.ts
import { TemplateSection } from './types'

export const fashionTemplate: TemplateSection = {
    id: 'full-fashion',
    name: 'Fashion & Clothing',
    description: 'Elegant pink theme · 17 blocks · Gallery + features + returns',
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
                    { label: 'All Items', url: '{{STORE_URL}}' },
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

        // ── 4. Product image — portrait fashion shot ──────────────────────────
        {
            type: 'product_image', props: {
                src: '{{MAIN_IMAGE_URL}}',
                alt: '{{PRODUCT_TITLE}}',
                maxWidth: 480,
                align: 'center',
                borderRadius: 12,
                showBorder: false,
                borderColor: '#fbcfe8',
                bgColor: '#fff7fb',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 5. Price block — with sale badge ──────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#be185d',
                priceFontSize: 34,
                priceFontWeight: '900',
                priceAlign: 'left',
                showBadge: true,
                badgeText: 'SALE',
                badgeBg: '#be185d',
                badgeColor: '#ffffff',
                badgeFontSize: 11,
                badgeBorderRadius: 4,
                showOriginal: true,
                originalText: '{{ORIGINAL_PRICE}}',
                originalColor: '#9ca3af',
                originalSize: 15,
                borderRadius: 0,
                bgColor: '#fff7fb',
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 16,
                paddingRight: 16,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 6. Urgency bar ────────────────────────────────────────────────────
        {
            type: 'urgency_bar', props: {
                text: '🩷 Only {{QUANTITY}} Left — Order Before They Sell Out!',
                bgColor: '#fdf2f8',
                textColor: '#831843',
                iconColor: '#be185d',
                borderRadius: 0,
                showIcon: true,
                align: 'center',
                fontSize: 13,
                fontWeight: '700',
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 16,
                paddingRight: 16,
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
                subTextColor: '#9ca3af',
                badgeBg: '#fdf2f8',
                borderColor: '#fbcfe8',
                borderRadius: 8,
                align: 'center',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 16,
                paddingRight: 16,
                badges: [
                    { icon: 'check', text: 'Genuine Item', subText: '100% Authentic' },
                    { icon: 'package', text: 'Careful Packaging', subText: 'Arrives Safely' },
                    { icon: 'refresh-ccw', text: 'Free Returns', subText: '30-Day Policy' },
                    { icon: 'star', text: 'Top Rated', subText: '5★ Seller' },
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
                titleFontSize: 16,
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 16,
                paddingRight: 16,
                fontFamily: 'Arial, Helvetica, sans-serif',
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
                titleColor: '#831843',
                titleFontSize: 16,
                headerBg: '#be185d',
                headerText: '#ffffff',
                altRowBg: '#fdf2f8',
                rowBg: '#ffffff',
                borderColor: '#fbcfe8',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                rows: [
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Size', value: '{{SIZE}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Material', value: '{{MATERIAL}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'Style', value: '{{STYLE}}' },
                    { key: 'Department', value: '{{DEPARTMENT}}' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                ],
            }
        },

        // ── 12. Shipping info — rose green accent ─────────────────────────────
        {
            type: 'shipping_info', props: {
                bgColor: '#fdf2f8',
                textColor: '#831843',
                iconColor: '#be185d',
                borderRadius: 0,
                shippingText: '🚚 FREE Standard UK Delivery — Royal Mail 48 (2–3 business days)',
                dispatchText: '⚡ Dispatched within 1 business day — Express next-day available',
                locationText: '📦 Dispatched from: United Kingdom',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 13. Returns policy ────────────────────────────────────────────────
        {
            type: 'returns_policy', props: {
                bgColor: '#fff7fb',
                textColor: '#831843',
                iconColor: '#be185d',
                accentColor: '#be185d',
                borderRadius: 0,
                policyText: '↩ FREE 30-day returns. Item must be unworn, in original condition with all tags attached.',
                showPeriod: true,
                periodText: '30-Day Free Returns — No Questions Asked',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 16,
                paddingRight: 16,
            }
        },

        // ── 14. Policy tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#be185d',
                activeText: '#ffffff',
                inactiveBg: '#fdf2f8',
                inactiveText: '#6b7280',
                borderColor: '#fbcfe8',
                contentBg: '#ffffff',
                borderRadius: 0,
                fontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'FREE standard UK delivery on all orders. Dispatched within 1 business day. Standard: 2–3 business days via Royal Mail. Express next-day delivery available at checkout. International shipping via the eBay Global Shipping Programme — duties and taxes may apply.',
                    },
                    {
                        label: 'Returns',
                        content: 'FREE 30-day returns on all items. Item must be unworn and in its original condition with all tags still attached. Contact us before returning and we will arrange collection at no additional cost to you. Refunds processed within 2 business days of receiving the item.',
                    },
                    {
                        label: 'Payment',
                        content: 'All major credit and debit cards and PayPal accepted via eBay secure checkout. All transactions are fully protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase.',
                    },
                    {
                        label: 'Care Guide',
                        content: 'All items are individually quality checked before dispatch. Please refer to the care label inside the garment for washing instructions. Most items are machine washable at 30 degrees. If your item arrives damaged or not as described, contact us immediately and we will arrange a full replacement or refund.',
                    },
                ],
            }
        },

        // ── 15. Cross-sell — complementary fashion items ──────────────────────
        {
            type: 'cross_sell', props: {
                title: 'Complete the Look',
                titleColor: '#831843',
                titleFontSize: 16,
                bgColor: '#fdf2f8',
                cardBg: '#ffffff',
                cardBorder: '#fbcfe8',
                borderRadius: 10,
                columns: 3,
                showPrice: true,
                gap: 12,
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: 16,
                paddingRight: 16,
                items: [
                    { imageUrl: '{{RELATED_IMAGE_1}}', title: '{{RELATED_TITLE_1}}', price: '{{RELATED_PRICE_1}}', url: '{{RELATED_URL_1}}' },
                    { imageUrl: '{{RELATED_IMAGE_2}}', title: '{{RELATED_TITLE_2}}', price: '{{RELATED_PRICE_2}}', url: '{{RELATED_URL_2}}' },
                    { imageUrl: '{{RELATED_IMAGE_3}}', title: '{{RELATED_TITLE_3}}', price: '{{RELATED_PRICE_3}}', url: '{{RELATED_URL_3}}' },
                ],
            }
        },

        // ── 16. Seller info ───────────────────────────────────────────────────
        {
            type: 'seller_info', props: {
                sellerName: '{{SELLER_NAME}}',
                tagline: 'Premium UK Fashion Seller · Est. 2018 · 10,000+ Happy Customers',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#be185d',
                avatarBg: '#be185d',
                avatarText: '#ffffff',
                bgColor: '#fff7fb',
                textColor: '#831843',
                subTextColor: '#9ca3af',
                accentColor: '#be185d',
                borderRadius: 0,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 16,
                paddingRight: 16,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 17. CTA footer banner ─────────────────────────────────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Shop with Confidence — Premium UK Fashion',
                subText: 'Free UK Returns · Genuine Items · Top Rated Seller · Fast Dispatch',
                bgColor: '#831843',
                bgGradient: true,
                gradientFrom: '#be185d',
                gradientTo: '#831843',
                textColor: '#ffffff',
                subTextColor: 'rgba(255,255,255,0.7)',
                align: 'center',
                minHeight: 90,
                paddingTop: 28,
                paddingBottom: 28,
                paddingLeft: 16,
                paddingRight: 16,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

    ],
}
