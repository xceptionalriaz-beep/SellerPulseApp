'use client'
// components/profit/EbaySearchBar.tsx
// Converted 1:1 from lib/widgets/ebay_search_bar.dart
// ✨ UPGRADED: Supports both full eBay URL and raw Item ID

import { useState } from 'react'
import { Link } from 'lucide-react'

interface EbaySearchBarProps {
  // ✨ Sends back categoryId (numeric string) instead of category string
  onFetch: (
    price:     number,
    shipping:  number,
    categoryId: string,
    title:     string,
    imageUrl:  string,
    soldCount: string,
  ) => void
}

// ✨ Extract item ID from full URL or raw ID
function extractItemId(input: string): string {
  const trimmed = input.trim()
  // If it's just a number — it's already an item ID
  if (/^\d+$/.test(trimmed)) return trimmed
  // Try to extract from eBay URL patterns:
  // https://www.ebay.com/itm/123456789
  // https://www.ebay.com/itm/title-here/123456789
  const match = trimmed.match(/\/itm\/(?:[^/]+\/)?(\d+)/)
  if (match) return match[1]
  // Fallback — return as-is
  return trimmed
}

export default function EbaySearchBar({ onFetch }: EbaySearchBarProps) {
  const [url,        setUrl]        = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [focused,    setFocused]    = useState(false)

  async function handleFetch() {
    if (!url.trim()) return
    setIsFetching(true)

    const itemId = extractItemId(url)

    // ✨ SIMULATE EBAY API DELAY — matches Dart Future.delayed(2s)
    await new Promise(r => setTimeout(r, 2000))

    // ✨ PASS SMART DUMMY DATA UP TO THE DASHBOARD — matches Dart _simulateFetch
    onFetch(
      189.99,
      0.00,
      '179697', // ✨ Numeric Category ID
      "Nike Air Force 1 '07 Premium Men's Casual Shoes White with Velcro Strap", // ✨ Contains Nike & Velcro
      'https://di2ponv0v5otw.cloudfront.net/posts/2021/11/04/6184501a3c64c8d5f3089456/m_61845037ef11cab328f52f36.jpg',
      '5,842',
    )

    setIsFetching(false)

    // ✨ Toast — matches Dart ScaffoldMessenger SnackBar
    showToast('✅ Product Fetched! Scanning for VeRO risks...')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Input — matches Dart TextField */}
      <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border bg-white transition-all"
           style={{ borderColor: '#E2E8F0', boxShadow: focused ? '0 0 0 3px rgba(143, 255, 0, 0.2)' : 'none', transition: 'box-shadow 0.2s' }}>
        <Link size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="Paste eBay URL or Item ID..."
          className="flex-1 text-[13px] bg-transparent" style={{ outline: 'none', color: '#0F172A' }}
          style={{ color: '#0F172A' }}
        />
      </div>

      {/* Fetch button — matches Dart ElevatedButton */}
      <button
        onClick={handleFetch}
        disabled={isFetching}
        className="h-10 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#0F172A', color: '#8FFF00', minWidth: 70 }}>
        {isFetching ? (
          <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
               style={{ borderTopColor: '#8FFF00' }} />
        ) : (
          'Fetch'
        )}
      </button>
    </div>
  )
}

// ✨ Simple toast — matches Dart SnackBar
function showToast(message: string) {
  const el = document.createElement('div')
  el.textContent = message
  el.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #16A34A; color: white; padding: 12px 20px; border-radius: 10px;
    font-size: 13px; font-weight: 600; z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: fadeIn 0.2s ease;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000) // matches Dart Duration(seconds: 3)
}