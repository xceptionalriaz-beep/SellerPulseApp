// components/ui/VisualEditor/templates/home_garden.ts
// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE Home & Garden Template — 16 blocks, sage/terracotta theme
// Professional UK eBay seller layout — 100% ready to use
// ─────────────────────────────────────────────────────────────────────────────
import { TemplateSection } from './types'

export const homeGardenTemplate: TemplateSection = {
    id: 'full-home-garden',
    name: 'Home & Garden',
    description: 'Sage & terracotta theme · 16 blocks · Pro UK seller layout',
    category: 'full',
    thumbnail: 'home_garden',
    blocks: [

        // ── 1. Store Hero Header — sage to terracotta gradient ────────────────
        {
            type: 'hero_header', props: {
                storeName: '{{SELLER_NAME}}',
                tagline: 'Quality Home & Garden · Free UK Delivery · Trusted Seller',
                bgColor: '#6b7c5a',
                bgGradient: true,
                gradientFrom: '#6b7c5a',
                gradientTo: '#c4703f',
                textColor: '#ffffff',
                taglineColor: 'rgba(255,255,255,0.85)',
                showLogo: false,
                height: 120,
                align: 'center',
                borderRadius: 0,
                nameFontSize: 28,
                nameFontWeight: '800',
                taglineFontSize: 13,
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 24,
                paddingRight: 24,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 2. Navigation Bar — warm cream on sage ────────────────────────────
        {
            type: 'nav_bar', props: {
                bgColor: '#4a5c3a',
                textColor: '#d4ddc8',
                hoverColor: '#ffffff',
                activeColor: '#f0c080',
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
                    { label: 'Indoor Plants', url: '#' },
                    { label: 'Garden Tools', url: '#' },
                    { label: 'Furniture', url: '#' },
                    { label: 'Décor', url: '#' },
                    { label: 'Contact Us', url: '#' },
                ],
            }
        },

        // ── 3. Product Title + Condition ──────────────────────────────────────
        {
            type: 'product_title', props: {
                text: '{{PRODUCT_TITLE}}',
                conditionText: 'Condition: {{ITEM_CONDITION}}',
                showCondition: true,
                color: '#2d2416',
                conditionColor: '#c4703f',
                fontSize: 24,
                fontWeight: '800',
                align: 'left',
                bgColor: '#f7f5f0',
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
                borderRadius: 10,
                showBorder: true,
                borderColor: '#d6d8ce',
                borderWidth: 1,
                objectFit: 'contain',
                bgColor: '#f7f5f0',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 5. Price Block — terracotta badge ─────────────────────────────────
        {
            type: 'price_block', props: {
                priceText: '{{ITEM_PRICE}}',
                priceColor: '#c4703f',
                priceFontSize: 38,
                priceFontWeight: '900',
                priceAlign: 'left',
                showOriginal: true,
                originalText: '{{ORIGINAL_PRICE}}',
                originalColor: '#9ca3af',
                originalSize: 16,
                showBadge: true,
                badgeText: 'FREE DELIVERY',
                badgeBg: '#6b7c5a',
                badgeColor: '#ffffff',
                badgeFontSize: 11,
                badgeBorderRadius: 4,
                bgColor: '#eef0eb',
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
                text: '🌿 Only {{QUANTITY}} left in stock — Order soon to avoid disappointment!',
                bgColor: '#fef3e8',
                textColor: '#92400e',
                iconColor: '#c4703f',
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

        // ── 7. Key Features Bullet List ───────────────────────────────────────
        {
            type: 'bullet_list', props: {
                items: [
                    'Premium quality — built to last season after season',
                    'Weather-resistant and UV-stable finish',
                    'Easy to assemble — full instructions included',
                    'Suitable for indoor and outdoor use',
                    'Free UK delivery — dispatched within 1 business day',
                ],
                bulletStyle: 'check',
                bulletColor: '#6b7c5a',
                color: '#2d2416',
                fontSize: 13,
                bgColor: '#f7f5f0',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 8. Trust Badges ───────────────────────────────────────────────────
        {
            type: 'trust_badges', props: {
                iconColor: '#6b7c5a',
                textColor: '#2d2416',
                subTextColor: '#6b7280',
                badgeBg: '#eef0eb',
                borderColor: '#c8d0be',
                borderRadius: 10,
                align: 'center',
                bgColor: '#ffffff',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                badges: [
                    { icon: 'shield-check', text: 'Genuine Product', subText: '100% Authentic' },
                    { icon: 'truck', text: 'Free Delivery', subText: 'UK Orders' },
                    { icon: 'rotate-ccw', text: '30-Day Returns', subText: 'Hassle Free' },
                    { icon: 'star', text: 'Top Rated Seller', subText: '5★ Reviews' },
                ],
            }
        },

        // ── 9. Product Description ────────────────────────────────────────────
        {
            type: 'product_description', props: {
                text: '{{ITEM_DESCRIPTION}}',
                titleText: 'About This Item',
                showTitle: true,
                titleColor: '#2d2416',
                titleFontSize: 16,
                color: '#4b5563',
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

        // ── 10. Divider — sage green ──────────────────────────────────────────
        {
            type: 'divider', props: {
                lineStyle: 'solid',
                color: '#c8d0be',
                thickness: 1,
                widthPercent: 100,
                paddingTop: 4,
                paddingBottom: 4,
            }
        },

        // ── 11. Specs Table — garden/home specific ────────────────────────────
        {
            type: 'specs_table', props: {
                showTitle: true,
                titleText: 'Item Specifics',
                titleColor: '#2d2416',
                titleFontSize: 16,
                headerBg: '#6b7c5a',
                headerText: '#ffffff',
                altRowBg: '#f7f5f0',
                rowBg: '#ffffff',
                borderColor: '#d6d8ce',
                fontSize: 13,
                bgColor: '#ffffff',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                rows: [
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Material', value: '{{MATERIAL}}' },
                    { key: 'Dimensions', value: '{{DIMENSIONS}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Weight', value: '{{WEIGHT}}' },
                    { key: 'Room / Use', value: '{{ROOM_TYPE}}' },
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'EAN / GTIN', value: '{{EAN}}' },
                    { key: 'SKU', value: '{{ITEM_SKU}}' },
                    { key: 'Warranty', value: '12 Months' },
                    { key: 'Country of Origin', value: 'United Kingdom' },
                ],
            }
        },

        // ── 12. Shipping Info — sage green ────────────────────────────────────
        {
            type: 'shipping_info', props: {
                bgColor: '#eef0eb',
                textColor: '#3a4d2c',
                iconColor: '#6b7c5a',
                borderRadius: 0,
                shippingText: '✅ FREE Standard UK Delivery — Royal Mail 48 (2–3 business days)',
                dispatchText: '⚡ Same-day dispatch on orders placed before 2pm Mon–Fri',
                locationText: '📦 Dispatched from: United Kingdom',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 13. Returns Policy — terracotta accent ────────────────────────────
        {
            type: 'returns_policy', props: {
                bgColor: '#fef3e8',
                textColor: '#92400e',
                iconColor: '#c4703f',
                accentColor: '#c4703f',
                borderRadius: 0,
                policyText: '↩ 30-day hassle-free returns. Items must be unused and in original packaging.',
                showPeriod: true,
                periodText: '30-Day Free Returns on items not as described',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 20,
                paddingRight: 20,
            }
        },

        // ── 14. Policy Tabs ───────────────────────────────────────────────────
        {
            type: 'policy_tabs', props: {
                activeBg: '#6b7c5a',
                activeText: '#ffffff',
                inactiveBg: '#f7f5f0',
                inactiveText: '#4b5563',
                borderColor: '#d6d8ce',
                contentBg: '#ffffff',
                fontSize: 13,
                borderRadius: 0,
                paddingTop: 0,
                paddingBottom: 0,
                tabs: [
                    {
                        label: 'Shipping',
                        content: 'We offer FREE standard UK delivery on all orders via Royal Mail 48 (2–3 business days). Express next-day delivery is available at checkout. Orders placed before 2pm Monday–Friday are dispatched the same day. Large or heavy items may be dispatched via a specialist courier — full tracking is always provided. International shipping is available via the eBay Global Shipping Programme — duties and taxes may apply for orders outside the UK.',
                    },
                    {
                        label: 'Returns',
                        content: 'We accept returns within 30 days of delivery. Items must be returned unused, in their original packaging and in the same condition as received. We offer FREE return postage on items that are faulty or not as described. For change-of-mind returns, the buyer is responsible for return postage costs. Refunds are processed within 1–2 business days of receiving the returned item.',
                    },
                    {
                        label: 'Payment',
                        content: 'We accept all major payment methods through eBay secure checkout including PayPal, Visa, Mastercard, American Express, Apple Pay and Google Pay. All transactions are protected by the eBay Money Back Guarantee. Payment must be completed within 4 days of purchase. We do not accept bank transfers or cheques.',
                    },
                    {
                        label: 'Guarantee',
                        content: 'All items are quality checked before dispatch and come with a minimum 12-month warranty unless otherwise stated in the listing. If you experience any fault or issue with your item, please contact us directly before opening a case — we will resolve the matter promptly and professionally. Your satisfaction is our top priority.',
                    },
                ],
            }
        },

        // ── 15. Seller Info ───────────────────────────────────────────────────
        {
            type: 'seller_info', props: {
                sellerName: '{{SELLER_NAME}}',
                tagline: 'Specialist UK Home & Garden Retailer · Est. 2016 · 8,000+ Happy Customers',
                feedbackText: '{{FEEDBACK_SCORE}} positive feedback ({{FEEDBACK_PERCENT}}%)',
                showBadge: true,
                badgeText: 'Top Rated Seller',
                badgeColor: '#6b7c5a',
                avatarBg: '#6b7c5a',
                avatarText: '#ffffff',
                bgColor: '#eef0eb',
                textColor: '#2d2416',
                subTextColor: '#6b7280',
                accentColor: '#c4703f',
                borderRadius: 0,
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                fontFamily: 'Arial, Helvetica, sans-serif',
            }
        },

        // ── 16. CTA Footer Banner — sage/terracotta gradient ─────────────────
        {
            type: 'cta_banner', props: {
                headingText: 'Transform Your Home & Garden — Shop with Confidence',
                subText: 'Genuine products · Free UK delivery · 30-day returns · Top Rated Seller',
                bgColor: '#6b7c5a',
                bgGradient: true,
                gradientFrom: '#4a5c3a',
                gradientTo: '#c4703f',
                textColor: '#ffffff',
                subTextColor: 'rgba(255,255,255,0.75)',
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
