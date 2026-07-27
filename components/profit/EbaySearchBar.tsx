'use client'
// components/profit/EbaySearchBar.tsx
// Calls /api/ebay/fetch-item — returns full item data

import { useState } from 'react'
import { Link, CheckCircle, AlertTriangle, X } from 'lucide-react'

const C = {
  lime: '#8fff00',
  dark: '#1a2410',
  border: '#e8ede2',
  muted: '#8a9e78',
  surface: '#ffffff',
  bg: '#f7f9f5',
  text: '#1a2410',
  red: '#b91c1c',
  green: '#16a34a',
  amber: '#d97706',
}

interface FetchedItem {
  itemId: string
  title: string
  price: number
  currency: string
  shippingCost: number
  freeShipping: boolean
  condition: string
  categoryId: string
  categoryName: string
  imageUrl: string
  itemUrl: string
  seller: string
  sellerFeedback: string
  location: string
  quantity: number
  sold: number
  returns: boolean
  returnPeriod: number
  brand: string
  site: string
  sellerCountry: string
}

interface EbaySearchBarProps {
  currentCountry: string
  onFetch: (
    price: number,
    shipping: number,
    categoryId: string,
    title: string,
    imageUrl: string,
    soldCount: string,
    currency: string,
    itemUrl: string,
    condition: string,
    seller: string,
    sellerFeedback: string,
    returns: boolean,
    returnPeriod: number,
    site: string,
    sellerCountry: string,
  ) => void
}

export default function EbaySearchBar({ currentCountry, onFetch }: EbaySearchBarProps) {
  const [url, setUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [focused, setFocused] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFetch() {
    if (!url.trim()) return
    setIsFetching(true)
    setStatus('idle')
    setErrorMsg('')


    try {
      // For bare Item IDs, use currently selected country as marketplace
      const isBareId = /^\d{9,13}$/.test(url.trim())
      const countryToMarketplace: Record<string, string> = {
        'UK': 'EBAY_GB', 'DE': 'EBAY_DE', 'FR': 'EBAY_FR', 'IT': 'EBAY_IT',
        'ES': 'EBAY_ES', 'AU': 'EBAY_AU', 'CA': 'EBAY_CA', 'AT': 'EBAY_AT',
        'BE': 'EBAY_BE', 'IE': 'EBAY_IE', 'NL': 'EBAY_NL', 'PL': 'EBAY_PL',
        'CH': 'EBAY_CH', 'US': 'EBAY_US',
      }
      const marketplaceParam = isBareId ? (countryToMarketplace[currentCountry] ?? 'EBAY_US') : ''
      const fetchUrl = marketplaceParam
        ? `/api/ebay/fetch-item?item=${encodeURIComponent(url.trim())}&marketplace=${marketplaceParam}`
        : `/api/ebay/fetch-item?item=${encodeURIComponent(url.trim())}`
      const res = await fetch(fetchUrl)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Item not found — check the URL or Item ID')
        setIsFetching(false)
        return
      }

      const fetched: FetchedItem = data.item
      setStatus('success')

      onFetch(
        fetched.price ?? 0,
        fetched.shippingCost ?? 0,
        fetched.categoryName ?? fetched.categoryId ?? '',
        fetched.title ?? '',
        fetched.imageUrl ?? '',
        fetched.sold?.toString() ?? '0',
        fetched.currency ?? 'USD',
        (fetched.itemUrl ?? '') + '|' + url.trim(),
        (() => {
          const map: Record<string, string> = {
            'Gebraucht': 'Used', 'Neu': 'New', 'Generalüberholt': 'Refurbished',
            'Sehr gut': 'Very Good', 'Gut': 'Good', 'Akzeptabel': 'Acceptable',
            'Neuf': 'New', 'Occasion': 'Used', 'Reconditionné': 'Refurbished',
            'Nuovo': 'New', 'Usato': 'Used', 'Ricondizionato': 'Refurbished',
            'Nuevo': 'New', 'Usado': 'Used', 'Reacondicionado': 'Refurbished',
            'Nieuw': 'New', 'Gebruikt': 'Used', 'Gereviseerd': 'Refurbished',
            'Nowy': 'New', 'Używany': 'Used', 'Odnowiony': 'Refurbished',
          }
          const c = fetched.condition ?? ''
          return map[c] ?? c
        })(),
        fetched.seller ?? '',
        fetched.sellerFeedback ?? '',
        fetched.returns ?? false,
        fetched.returnPeriod ?? 0,
        fetched.site ?? 'EBAY_US',
        fetched.sellerCountry ?? '',
      )

    } catch (_) {
      setStatus('error')
      setErrorMsg('Failed to fetch — check your connection')
    }

    setIsFetching(false)
  }

  function handleClear() {
    setUrl('')
    setStatus('idle')
    setErrorMsg('')
  }

  const borderColor =
    status === 'error' ? C.red :
      status === 'success' ? C.green :
        focused ? C.lime : C.border

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

      {/* Search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Input */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 12px',
          borderRadius: 8, border: `1.5px solid ${borderColor}`,
          background: C.surface,
          boxShadow: focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}>
          <Link size={14} color={C.muted} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); setStatus('idle'); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            placeholder="Paste eBay URL or Item ID..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 13, color: C.text, background: 'transparent',
            }}
          />
          {status === 'success' && <CheckCircle size={14} color={C.green} style={{ flexShrink: 0 }} />}
          {status === 'error' && <AlertTriangle size={14} color={C.red} style={{ flexShrink: 0 }} />}
          {url && (
            <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: C.muted }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Fetch button */}
        <button
          onClick={handleFetch}
          disabled={isFetching || !url.trim()}
          style={{
            height: 36, padding: '0 16px', borderRadius: 8,
            border: 'none', background: C.lime, color: C.dark,
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 70, flexShrink: 0,
            cursor: isFetching || !url.trim() ? 'not-allowed' : 'pointer',
            opacity: isFetching || !url.trim() ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}>
          {isFetching ? (
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: C.dark,
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : 'Fetch'}
        </button>
      </div>

      {/* Loading state */}
      {isFetching && (
        <p style={{ fontSize: 11, color: C.muted, margin: 0, fontWeight: 600 }}>
          Fetching item from eBay...
        </p>
      )}

      {/* Error */}
      {status === 'error' && errorMsg && (
        <p style={{ fontSize: 11, fontWeight: 600, color: C.red, margin: 0 }}>
          {errorMsg}
        </p>
      )}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
