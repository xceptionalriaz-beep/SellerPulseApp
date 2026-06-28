// app/dashboard/product-research/models/searchFilters.ts
// Converted 1:1 from lib/pages/product_research/keyword_search/models/search_filters.dart

export interface SearchFilters {
  marketplace:  string
  shippingTo:   string
  minPrice:     number | null
  maxPrice:     number | null
  minFeedback:  number
  maxFeedback:  number
  minSales:     number
  condition:    string
  hideVero:     boolean
  shipFrom:     string
  listingType:  string
  salesRange:   string  // 'Total' | '7 Days' | '15 Days' | '30 Days'
}

// Default factory â€” matches Dart SearchFilters() constructor defaults
export function defaultFilters(): SearchFilters {
  return {
    marketplace:  'US',
    shippingTo:   'US',
    minPrice:     null,
    maxPrice:     null,
    minFeedback:  0,
    maxFeedback:  1000000,
    minSales:     0,
    condition:    'New',
    hideVero:     true,
    shipFrom:     'Any',
    listingType:  'Fixed',
    salesRange:   'Total',
  }
}

// Currency symbol getter â€” matches Dart get currencySymbol
export function getCurrencySymbol(marketplace: string): string {
  switch (marketplace) {
    case 'UK': return 'Â£'
    case 'DE':
    case 'IT':
    case 'FR': return 'â‚¬'
    default:   return '$'
  }
}
