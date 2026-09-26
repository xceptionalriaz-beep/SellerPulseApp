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
export { bannerVariants, getBannerVariant } from './banner.variants'
export { buttonBlockVariants, getButtonVariant } from './button_block.variants'
export { productDescriptionVariants, getProductDescriptionVariant } from './product_description.variants'
export { productVariantsVariants, getProductVariantsVariant } from './product_variants.variants'
export { whatsInTheBoxVariants, getWhatsInTheBoxVariant } from './whats_in_the_box.variants'
export { heroProductVariants, getHeroProductVariant } from './hero_product.variants'
export { ctaBannerVariants, getCtaBannerVariant } from './cta_banner.variants'
export { sellerInfoVariants, getSellerInfoVariant } from './seller_info.variants'
export { logoBarVariants, getLogoBarVariant } from './logo_bar.variants'

// Imports for registry
import { heroHeaderVariants } from './hero_header.variants'
import { productImageVariants } from './product_image.variants'
import { priceBlockVariants } from './price_block.variants'
import { trustBadgesVariants } from './trust_badges.variants'
import { navBarVariants } from './nav_bar.variants'
import { specsTableVariants } from './specs_table.variants'
import { policyTabsVariants } from './policy_tabs.variants'
import { bannerVariants } from './banner.variants'
import { buttonBlockVariants } from './button_block.variants'
import { productDescriptionVariants } from './product_description.variants'
import { productVariantsVariants } from './product_variants.variants'
import { whatsInTheBoxVariants } from './whats_in_the_box.variants'
import { heroProductVariants } from './hero_product.variants'
import { ctaBannerVariants } from './cta_banner.variants'
import { sellerInfoVariants } from './seller_info.variants'
import { singleImageVariants } from './single_image.variants'
import { logoBarVariants } from './logo_bar.variants'
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
    'banner': bannerVariants,
    'button_block': buttonBlockVariants,
    'product_description': productDescriptionVariants,
    'product_variants': productVariantsVariants,
    'whats_in_the_box': whatsInTheBoxVariants,
    'hero_product': heroProductVariants,
    'cta_banner': ctaBannerVariants,
    'single_image': singleImageVariants,
    'seller_info': sellerInfoVariants,
    'logo_bar': logoBarVariants,
}

export function getVariants(blockType: string): BlockVariant[] | null {
    return VARIANT_REGISTRY[blockType] ?? null
}

export function hasVariants(blockType: string): boolean {
    return blockType in VARIANT_REGISTRY
}
