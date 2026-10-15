// lib/ebay-marketplace.ts
// ─────────────────────────────────────────────────────────────
// Single source of truth for eBay marketplace metadata:
//   - Currency symbols & codes
//   - Country/flag codes
//   - eBay domain names
//   - eBay Trading API site IDs
//   - eBay RegistrationSite → marketplace ID mapping (for auto-detect)
//
// Used by: OAuth callback (auto-detect), LgDashboard (currency/badge),
//          publish route (site ID), profit engine (currency display)
// ─────────────────────────────────────────────────────────────

export interface MarketplaceConfig {
  id:               string   // 'EBAY_US'
  siteId:           number   // eBay site integer (0 = US, 3 = UK …)
  countryCode:      string   // ISO 2-letter lowercase, e.g. 'us'
  label:            string   // 'United States'
  currencyCode:     string   // 'USD'
  currencySymbol:   string   // '$'
  ebayDomain:       string   // 'ebay.com'
  registrationSite: string   // eBay API SiteCodeType value
}

export const MARKETPLACE_CONFIGS: MarketplaceConfig[] = [
  { id: 'EBAY_US', siteId: 0,   countryCode: 'us', label: 'United States',  currencyCode: 'USD', currencySymbol: '$',    ebayDomain: 'ebay.com',    registrationSite: 'US'             },
  { id: 'EBAY_GB', siteId: 3,   countryCode: 'gb', label: 'United Kingdom', currencyCode: 'GBP', currencySymbol: '£',    ebayDomain: 'ebay.co.uk',  registrationSite: 'UK'             },
  { id: 'EBAY_DE', siteId: 77,  countryCode: 'de', label: 'Germany',        currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.de',     registrationSite: 'Germany'        },
  { id: 'EBAY_AU', siteId: 15,  countryCode: 'au', label: 'Australia',      currencyCode: 'AUD', currencySymbol: 'A$',   ebayDomain: 'ebay.com.au', registrationSite: 'Australia'      },
  { id: 'EBAY_CA', siteId: 2,   countryCode: 'ca', label: 'Canada',         currencyCode: 'CAD', currencySymbol: 'C$',   ebayDomain: 'ebay.ca',     registrationSite: 'Canada'         },
  { id: 'EBAY_FR', siteId: 71,  countryCode: 'fr', label: 'France',         currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.fr',     registrationSite: 'France'         },
  { id: 'EBAY_IT', siteId: 101, countryCode: 'it', label: 'Italy',          currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.it',     registrationSite: 'Italy'          },
  { id: 'EBAY_ES', siteId: 186, countryCode: 'es', label: 'Spain',          currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.es',     registrationSite: 'Spain'          },
  { id: 'EBAY_IE', siteId: 205, countryCode: 'ie', label: 'Ireland',        currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.ie',     registrationSite: 'Ireland'        },
  { id: 'EBAY_NL', siteId: 146, countryCode: 'nl', label: 'Netherlands',    currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.nl',     registrationSite: 'Netherlands'    },
  { id: 'EBAY_AT', siteId: 16,  countryCode: 'at', label: 'Austria',        currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.at',     registrationSite: 'Austria'        },
  { id: 'EBAY_BE', siteId: 123, countryCode: 'be', label: 'Belgium',        currencyCode: 'EUR', currencySymbol: '€',    ebayDomain: 'ebay.be',     registrationSite: 'Belgium_French' },
  { id: 'EBAY_CH', siteId: 193, countryCode: 'ch', label: 'Switzerland',    currencyCode: 'CHF', currencySymbol: 'CHF',  ebayDomain: 'ebay.ch',     registrationSite: 'Switzerland'    },
  { id: 'EBAY_PL', siteId: 212, countryCode: 'pl', label: 'Poland',         currencyCode: 'PLN', currencySymbol: 'zł',   ebayDomain: 'ebay.pl',     registrationSite: 'Poland'         },
  { id: 'EBAY_HK', siteId: 201, countryCode: 'hk', label: 'Hong Kong',      currencyCode: 'HKD', currencySymbol: 'HK$',  ebayDomain: 'ebay.com.hk', registrationSite: 'HongKong'       },
  { id: 'EBAY_SG', siteId: 216, countryCode: 'sg', label: 'Singapore',      currencyCode: 'SGD', currencySymbol: 'S$',   ebayDomain: 'ebay.com.sg', registrationSite: 'Singapore'      },
  { id: 'EBAY_MY', siteId: 207, countryCode: 'my', label: 'Malaysia',       currencyCode: 'MYR', currencySymbol: 'RM',   ebayDomain: 'ebay.com.my', registrationSite: 'Malaysia'       },
  { id: 'EBAY_PH', siteId: 211, countryCode: 'ph', label: 'Philippines',    currencyCode: 'PHP', currencySymbol: '₱',    ebayDomain: 'ebay.ph',     registrationSite: 'Philippines'    },
  { id: 'EBAY_IN', siteId: 203, countryCode: 'in', label: 'India',          currencyCode: 'INR', currencySymbol: '₹',    ebayDomain: 'ebay.in',     registrationSite: 'India'          },
]

// ── Lookup by marketplace ID (e.g. 'EBAY_GB') ───────────────
// Falls back to US if not found
export function getMarketplace(marketplaceId: string | null | undefined): MarketplaceConfig {
  return MARKETPLACE_CONFIGS.find(m => m.id === marketplaceId) ?? MARKETPLACE_CONFIGS[0]
}

// ── Map eBay Trading API RegistrationSite → our marketplace ID ──
// e.g. 'UK' → 'EBAY_GB', 'Germany' → 'EBAY_DE'
export function registrationSiteToMarketplaceId(site: string | null | undefined): string {
  if (!site) return 'EBAY_US'
  const match = MARKETPLACE_CONFIGS.find(
    m => m.registrationSite.toLowerCase() === site.toLowerCase()
  )
  return match?.id ?? 'EBAY_US'
}

// ── Convenience getters ──────────────────────────────────────
export function getCurrencySymbol(marketplaceId: string | null | undefined): string {
  return getMarketplace(marketplaceId).currencySymbol
}

export function getCurrencyCode(marketplaceId: string | null | undefined): string {
  return getMarketplace(marketplaceId).currencyCode
}

export function getEbayDomain(marketplaceId: string | null | undefined): string {
  return getMarketplace(marketplaceId).ebayDomain
}

export function getFlagCode(marketplaceId: string | null | undefined): string {
  return getMarketplace(marketplaceId).countryCode
}

export function getMarketplaceLabel(marketplaceId: string | null | undefined): string {
  return getMarketplace(marketplaceId).label
}

export function getSiteId(marketplaceId: string | null | undefined): number {
  return getMarketplace(marketplaceId).siteId
}

// ── Format a price with the marketplace currency symbol ──────
// e.g. formatPrice(129.99, 'EBAY_GB') → '£129.99'
export function formatPrice(
  amount: number | null | undefined,
  marketplaceId: string | null | undefined
): string {
  if (amount == null) return '—'
  const sym = getCurrencySymbol(marketplaceId)
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  return `${sign}${sym}${abs.toFixed(2)}`
}
