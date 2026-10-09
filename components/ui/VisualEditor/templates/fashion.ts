// components/ui/VisualEditor/templates/fashion.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fashion Template — 16 blocks, 2-column hero + refined policy cards.
// Category-consistent product theme: rose/pink, premium clothing.
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const fashionTemplate: TemplateSection = {
    id: 'full-fashion',
    name: 'Fashion & Clothing',
    description: 'Elegant pink theme · 16 blocks · Pro 2-column hero + crisp cards',
    category: 'full',
    blocks: [

        // ── 1. Store Hero Header (compact) ───────────────────────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Premium Fashion · Free UK Returns · Next Day Available',
                bgColor: '#be185d',
                bgGradient: true,
                bgGradientFrom: '#be185d',
                bgGradientTo: '#831843',
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
                bgColor: '#500724',
                textColor: '#fce7f3',
                hoverColor: '#f9a8d4',
                activeColor: '#f9a8d4',
                separator: '·',
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
                    { label: 'All Items',     url: '{{STORE_URL}}' },
                    { label: 'Dresses',       url: '#' },
                    { label: 'Tops',          url: '#' },
                    { label: 'Accessories',   url: '#' },
                    { label: 'Sale',          url: '#' },
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
                leftBg: '#fff7fb',
                rightTitle: '{{PRODUCT_TITLE}}',
                rightCondition: '{{ITEM_CONDITION}}',
                rightPrice: '{{ITEM_PRICE}}',
                rightOriginal: '{{ORIGINAL_PRICE}}',
                showOriginal: true,
                rightQuantity: '{{QUANTITY}}',
                showScarcity: true,
                rightBadgeText: 'Brand New',
                rightBullets: [
                    'Premium quality material — built to last',
                    'True to size — check size guide before ordering',
                    'Machine washable at 30 degrees',
                    'Free UK returns within 30 days',
                ],
                accentColor: '#be185d',
                scarcityBg: '#fdf2f8',
                scarcityColor: '#831843',
            }
        },

        // ── 4. Urgency Bar ────────────────────────────────────────────────────
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
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 5. Trust Badges (white card grid) ────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#be185d',
                textColor: '#831843',
                subTextColor: '#9ca3af',
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
                    { icon: 'shield-check', text: 'Genuine Item',     subText: '100% Authentic' },
                    { icon: 'truck',         text: 'Careful Packaging', subText: 'Arrives Safely' },
                    { icon: 'rotate-ccw',    text: 'Free Returns',      subText: '30-Day Policy' },
                    { icon: 'star',          text: 'Top Rated',         subText: '5★ Seller' },
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
                titleText: 'Product Details',
                titleColor: '#831843',
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
                titleColor: '#831843',
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
                    { key: 'Brand',      value: '{{BRAND}}' },
                    { key: 'Size',       value: '{{SIZE}}' },
                    { key: 'Colour',     value: '{{COLOUR}}' },
                    { key: 'Material',   value: '{{MATERIAL}}' },
                    { key: 'Style',      value: '{{STYLE}}' },
                    { key: 'Department', value: '{{DEPARTMENT}}' },
                    { key: 'Gender',     value: '{{GENDER}}' },
                    { key: 'Age Group',  value: '{{AGE_GROUP}}' },
                    { key: 'SKU',        value: '{{ITEM_SKU}}' },
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
                accentColor: '#be185d',
                iconColor: '#be185d',
                iconBg: '#fdf2f8',
                borderRadius: 8,
                policyText: '{{RETURN_POLICY}}. Items must be unworn with all tags attached.',
                showPeriod: true,
                periodText: '30-Day Free Returns — No Questions Asked',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 11. Policy Tabs ──────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#be185d',
                activeText: '#ffffff',
                inactiveBg: '#fdf2f8',
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

        // ── 12. Cross-Sell ───────────────────────────────────────────────────
        {
            type: 'cross_sell', props: {
                title: 'Complete the Look',
                titleColor: '#831843',
                titleFontSize: 16,
                bgColor: '#fdf2f8',
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
                headingText: 'Shop with Confidence — Premium UK Fashion',
                subText: 'Free UK Returns · Genuine Items · Top Rated Seller · Fast Dispatch',
                bgColor: '#831843',
                bgGradient: true,
                gradientFrom: '#be185d',
                gradientTo: '#831843',
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
