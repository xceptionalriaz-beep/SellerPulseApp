// hooks/useBrand.ts
'use client'
import { useState, useEffect } from 'react'

export interface Brand {
  logo_icon:       string
  logo_full_dark:  string
  logo_full_light: string
  og_image:        string
  brand_name:      string
  brand_color:     string
}

const DEFAULTS: Brand = {
  logo_icon:       '/brand/logo-icon.svg',
  logo_full_dark:  '/brand/logo-full-dark.svg',
  logo_full_light: '/brand/logo-full-light.svg',
  og_image:        '/brand/og-image.svg',
  brand_name:      'Riazify',
  brand_color:     '#8fff00',
}

// Cache brand settings in memory to avoid repeated fetches
let cachedBrand: Brand | null = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useBrand() {
  // Start with cached brand immediately to prevent flicker
  const [brand, setBrand]   = useState<Brand>(cachedBrand ?? DEFAULTS)
  const [loading, setLoading] = useState(!cachedBrand)

  useEffect(() => {
    // Use cache if fresh — no loading state needed
    if (cachedBrand && Date.now() - cacheTime < CACHE_TTL) {
      setBrand(cachedBrand)
      setLoading(false)
      return
    }

    fetch('/api/brand')
      .then(r => r.json())
      .then(d => {
        if (d.brand) {
          const merged: Brand = {
            logo_icon:       d.brand.logo_icon       || DEFAULTS.logo_icon,
            logo_full_dark:  d.brand.logo_full_dark  || DEFAULTS.logo_full_dark,
            logo_full_light: d.brand.logo_full_light || DEFAULTS.logo_full_light,
            og_image:        d.brand.og_image        || DEFAULTS.og_image,
            brand_name:      d.brand.brand_name      || DEFAULTS.brand_name,
            brand_color:     d.brand.brand_color     || DEFAULTS.brand_color,
          }
          cachedBrand = merged
          cacheTime   = Date.now()
          setBrand(merged)
        }
      })
      .catch(() => {
        // On error — use defaults silently, no flicker
        setBrand(DEFAULTS)
      })
      .finally(() => setLoading(false))
  }, [])

  return { brand, loading, defaults: DEFAULTS }
}