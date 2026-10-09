'use client'
// components/AffiliateTracker.tsx
// Add to root layout: <AffiliateTracker />
// Silently fires click tracking when riazify_click cookie is detected

import { useEffect } from 'react'

export default function AffiliateTracker() {
  useEffect(() => {
    // Read riazify_click cookie (set by middleware, lives 10 min)
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=')
      acc[k] = v
      return acc
    }, {} as Record<string, string>)

    const clickCode = cookies['riazify_click']

    if (clickCode) {
      // Fire-and-forget click tracking
      fetch('/api/affiliate/click', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: clickCode }),
      })
        .then(() => {
          // Clear the click cookie so we don't double count
          // (riazify_ref stays â€” needed for signup attribution)
          document.cookie = 'riazify_click=; max-age=0; path=/'
        })
        .catch(err => console.error('[AffiliateTracker]', err))
    }
  }, [])

  // Renders nothing â€” invisible tracker
  return null
}
