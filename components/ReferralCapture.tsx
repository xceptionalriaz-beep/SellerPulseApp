// ─────────────────────────────────────────────────────────────
// PATCH for app/layout.tsx
//
// Add this component anywhere inside your RootLayout's <body>
// It captures UTM params + referral codes on EVERY page visit
// and stores them in localStorage for use during signup
// ─────────────────────────────────────────────────────────────

'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function ReferralCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only capture once — don't overwrite existing referral
    if (typeof window === 'undefined') return
    if (localStorage.getItem('riazify_referral')) return

    const utmSource   = searchParams.get('utm_source')
    const utmMedium   = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const refCode     = searchParams.get('ref')

    // Only store if there's something meaningful
    if (!utmSource && !refCode) return

    const referral = {
      source:   utmSource ?? (refCode ? 'affiliate' : 'direct'),
      medium:   utmMedium ?? null,
      campaign: utmCampaign ?? null,
      ref:      refCode ?? null,
      captured_at: new Date().toISOString(),
      url: window.location.href,
    }

    localStorage.setItem('riazify_referral', JSON.stringify(referral))
  }, [searchParams])

  return null // renders nothing
}

// ─────────────────────────────────────────────────────────────
// In your RootLayout, add:
//
// import { ReferralCapture } from './ReferralCapture'  ← create file
// import { Suspense } from 'react'
//
// <body>
//   <Suspense fallback={null}>
//     <ReferralCapture />
//   </Suspense>
//   {children}
// </body>
// ─────────────────────────────────────────────────────────────