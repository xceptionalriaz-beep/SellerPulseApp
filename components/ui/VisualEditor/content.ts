// components/ui/VisualEditor/content.ts
// ─────────────────────────────────────────────────────────────────────────────
// Content-tab block definitions — Customer Reviews and future content blocks.
//
// Import direction (no circular deps):
//   content.ts  →  imports types / helpers FROM blocks.ts
//   blocks.ts   →  imports block definitions FROM content.ts
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockType, BlockCategory, BlockProps, CommonProps } from './blocks'
import { wrapBlock, DEFAULT_COMMON } from './blocks'
import { getReviewsBlockVariant } from './variants/reviews_block.variants'

// ── Customer Reviews ─────────────────────────────────────────────────────────

export const customerReviewsBlock = {
    type: 'customer_reviews' as BlockType,
    label: 'Customer Reviews',
    category: 'Content' as BlockCategory,
    icon: 'star',
    description: 'Social proof buyer testimonials — 8 professional layouts',
    defaultProps: {
        ...DEFAULT_COMMON,
        variant: 'rev-star-cards',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        reviews: [
            {
                text: 'Exactly as described. Arrived two days early and packaging was excellent. Will definitely order again.',
                author: 'Sarah M.',
                rating: 5,
                date: 'Verified eBay Purchase',
            },
            {
                text: 'Great quality for the price. Seller answered my question within the hour. Highly recommend.',
                author: 'James T.',
                rating: 5,
                date: 'Verified eBay Purchase',
            },
            {
                text: 'Item was in perfect condition. Fast dispatch, well packaged. A+ seller — saved to favourites.',
                author: 'Linda R.',
                rating: 5,
                date: 'Verified eBay Purchase',
            },
        ],
        textColor: '#111827',
        authorColor: '#6b7280',
        starColor: '#f59e0b',
        accentColor: '#7530fb',
        borderColor: '#e5e7eb',
    } as unknown as BlockProps,
    toHtml(props: BlockProps, id: string) {
        const p = props as any
        const variantId = p.variant ?? 'rev-star-cards'
        return wrapBlock('customer_reviews' as BlockType, id, getReviewsBlockVariant(variantId).toHtml(p, id), p)
    },
}

// ── All content blocks — spread into blocks.ts BLOCK_DEFINITIONS ─────────────
export const CONTENT_BLOCKS = [
    customerReviewsBlock,
]
