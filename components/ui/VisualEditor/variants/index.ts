// components/ui/VisualEditor/variants/index.ts
// Central export for all block variant groups

export type { BlockVariant } from './hero_header.variants'

// Exports
export { heroHeaderVariants, getHeroVariant } from './hero_header.variants'
export { productImageVariants, getProductImageVariant } from './product_image.variants'
export { priceBlockVariants, getPriceVariant } from './price_block.variants'
export { trustBadgesVariants, getTrustBadgesVariant } from './trust_badges.variants'
export { navBarVariants, getNavBarVariant } from './nav_bar.variants'
export { specsTableVariants, getSpecsTableVariant } from './specs_table.variants'
export { policyTabsVariants, getPolicyTabsVariant } from './policy_tabs.variants'

// Imports for registry
import { heroHeaderVariants } from './hero_header.variants'
import { productImageVariants } from './product_image.variants'
import { priceBlockVariants } from './price_block.variants'
import { trustBadgesVariants } from './trust_badges.variants'
import { navBarVariants } from './nav_bar.variants'
import { specsTableVariants } from './specs_table.variants'
import { policyTabsVariants } from './policy_tabs.variants'
import type { BlockVariant } from './hero_header.variants'

// Registry — maps block type to its variant array
const VARIANT_REGISTRY: Record<string, BlockVariant[]> = {
    'hero_header': heroHeaderVariants,
    'product_image': productImageVariants,
    'price_block': priceBlockVariants,
    'trust_badges': trustBadgesVariants,
    'nav_bar': navBarVariants,
    'specs_table': specsTableVariants,
    'policy_tabs': policyTabsVariants,
}

export function getVariants(blockType: string): BlockVariant[] | null {
    return VARIANT_REGISTRY[blockType] ?? null
}

export function hasVariants(blockType: string): boolean {
    return blockType in VARIANT_REGISTRY
}
