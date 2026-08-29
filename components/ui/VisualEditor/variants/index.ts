// components/ui/VisualEditor/variants/index.ts
// Central export for all block variant groups

export type { BlockVariant } from './hero_header.variants'
export { heroHeaderVariants, getHeroVariant } from './hero_header.variants'
export { productImageVariants, getProductImageVariant } from './product_image.variants'
export { priceBlockVariants, getPriceVariant } from './price_block.variants'

// Registry — maps block type to its variants
import { heroHeaderVariants } from './hero_header.variants'
import { productImageVariants } from './product_image.variants'
import { priceBlockVariants } from './price_block.variants'
import type { BlockVariant } from './hero_header.variants'

const VARIANT_REGISTRY: Record<string, BlockVariant[]> = {
    'hero_header': heroHeaderVariants,
    'product_image': productImageVariants,
    'price_block': priceBlockVariants,
    // future: 'trust_badges': trustBadgesVariants,
}

export function getVariants(blockType: string): BlockVariant[] | null {
    return VARIANT_REGISTRY[blockType] ?? null
}

export function hasVariants(blockType: string): boolean {
    return blockType in VARIANT_REGISTRY
}
