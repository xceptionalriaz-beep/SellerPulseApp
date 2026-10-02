// components/ui/VisualEditor/variants/index.ts
// Central export for all block variant groups

export type { BlockVariant } from './hero_header.variants'

// Exports
export { heroHeaderVariants, getHeroVariant } from './hero_header.variants'
export { productImageVariants, getProductImageVariant } from './product_image.variants'
export { priceBlockVariants, getPriceVariant } from './price_block.variants'
export { priceTagVariants, getPriceTagVariant } from './price_tag.variants'
export { storeFooterVariants, getStoreFooterVariant } from './store_footer.variants'
export { categoryNavVariants, getCategoryNavVariant } from './category_nav.variants'
export { seasonalBannerVariants, getSeasonalBannerVariant } from './seasonal_banner.variants'
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
export { bundleDealVariants, getBundleDealVariant } from './bundle_deal.variants'
export { moneyBackVariants, getMoneyBackVariant } from './money_back.variants'
export { freeShippingVariants, getFreeShippingVariant } from './free_shipping.variants'
export { limitedTimeOfferVariants, getLimitedTimeOfferVariant, limitedOfferVariants, dealBannerVariants } from './limited_time_offer.variants'
export { satisfactionGuaranteeVariants, getSatisfactionGuaranteeVariant, guaranteeVariants, buyerProtectionVariants } from './satisfaction_guarantee.variants'
export { conditionBadgeVariants, getConditionBadgeVariant, conditionVariants } from './condition_badge.variants'
export { itemSpecificsVariants, getItemSpecificsVariant, specificsVariants } from './item_specifics.variants'
export { authenticityGuaranteeVariants, getAuthenticityGuaranteeVariant, authenticityVariants, getAuthenticityVariant } from './authenticity_guarantee.variants'
export { conditionDetailsVariants, getConditionDetailsVariant, detailsVariants } from './condition_details.variants'
export { compatibilityTableVariants, getCompatibilityTableVariant, compatibilityVariants } from './compatibility_table.variants'
export { productComparisonVariants, getProductComparisonVariant, comparisonVariants } from './product_comparison.variants'
export { keyFeaturesVariants, getKeyFeaturesVariant, KEY_FEATURES_THUMBNAILS, featuresGridVariants, getKeyFeaturesGridVariant } from './key_features.variants'
export { vatNoticeVariants, getVatNoticeVariant, vatVariants, getVatVariant } from './vat_notice.variants'
export { feedbackScoreVariants, getFeedbackScoreVariant, feedbackVariants, getFeedbackVariant } from './feedback_score.variants'
export { pullQuoteVariants, getPullQuoteVariant, quoteVariants, getQuoteVariant } from './pull_quote.variants'
export { sectionLabelVariants, getSectionLabelVariant, SECTION_LABEL_THUMBNAILS } from './section_label.variants'

// Imports for registry
import { heroHeaderVariants } from './hero_header.variants'
import { productImageVariants } from './product_image.variants'
import { priceBlockVariants } from './price_block.variants'
import { priceTagVariants } from './price_tag.variants' // <── Added for Price Tag
import { storeFooterVariants } from './store_footer.variants'
import { categoryNavVariants } from './category_nav.variants'
import { seasonalBannerVariants } from './seasonal_banner.variants'
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
import { bundleDealVariants } from './bundle_deal.variants'
import type { BlockVariant } from './hero_header.variants'
import { moneyBackVariants } from './money_back.variants'
import { freeShippingVariants } from './free_shipping.variants'
import { limitedTimeOfferVariants } from './limited_time_offer.variants'
import { satisfactionGuaranteeVariants } from './satisfaction_guarantee.variants'
import { conditionBadgeVariants } from './condition_badge.variants'
import { itemSpecificsVariants } from './item_specifics.variants'
import { authenticityGuaranteeVariants } from './authenticity_guarantee.variants'
import { conditionDetailsVariants } from './condition_details.variants'
import { compatibilityTableVariants } from './compatibility_table.variants'
import { productComparisonVariants } from './product_comparison.variants'
import { keyFeaturesVariants } from './key_features.variants'
import { vatNoticeVariants } from './vat_notice.variants'
import { feedbackScoreVariants } from './feedback_score.variants'
import { pullQuoteVariants } from './pull_quote.variants'
import { sectionLabelVariants } from './section_label.variants'

// Registry — maps block type to its variant array
const VARIANT_REGISTRY: Record<string, BlockVariant[]> = {
    'hero_header': heroHeaderVariants,
    'product_image': productImageVariants,
    'price_block': priceBlockVariants,
    'price_tag': priceTagVariants, // <── Added for Price Tag
    'store_footer': storeFooterVariants,
    'category_nav': categoryNavVariants,
    'seasonal_banner': seasonalBannerVariants,
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
    'bundle_deal': bundleDealVariants,
    'money_back': moneyBackVariants,
    'free_shipping': freeShippingVariants,
    'shipping_banner': freeShippingVariants,
    'limited_time_offer': limitedTimeOfferVariants,
    'limited_offer': limitedTimeOfferVariants,
    'deal_banner': limitedTimeOfferVariants,
    'satisfaction_guarantee': satisfactionGuaranteeVariants,
    'guarantee': satisfactionGuaranteeVariants,
    'condition_badge': conditionBadgeVariants,
    'condition_details': conditionDetailsVariants,
    'condition_notes': conditionDetailsVariants,
    'condition': conditionBadgeVariants,
    'item_specifics': itemSpecificsVariants,
    'specs': itemSpecificsVariants,
    'authenticity_guarantee': authenticityGuaranteeVariants,
    'authenticity': authenticityGuaranteeVariants,
    'compatibility_table': compatibilityTableVariants,
    'compatibility': compatibilityTableVariants,
    'product_comparison': productComparisonVariants,
    'comparison': productComparisonVariants,
    'key_features_grid': keyFeaturesVariants,
    'key_features': keyFeaturesVariants,
    'features_grid': keyFeaturesVariants,
    'vat_notice': vatNoticeVariants,
    'vat': vatNoticeVariants,
    'feedback_score': feedbackScoreVariants,
    'feedback': feedbackScoreVariants,
    'pull_quote': pullQuoteVariants,
    'quote': pullQuoteVariants,
    'section_label': sectionLabelVariants,
    'label': sectionLabelVariants,
}

export function getVariants(blockType: string): BlockVariant[] | null {
    return VARIANT_REGISTRY[blockType] ?? null
}

export function hasVariants(blockType: string): boolean {
    return blockType in VARIANT_REGISTRY
}
