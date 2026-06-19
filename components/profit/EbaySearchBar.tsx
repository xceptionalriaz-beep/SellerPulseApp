'use client'
// components/profit/EbaySearchBar.tsx
// Updated: uses real eBay API via /api/ebay/item

import { useState } from 'react'
import { Link, CheckCircle, AlertTriangle } from 'lucide-react'

interface EbaySearchBarProps {
  onFetch: (
    price:      number,
    shipping:   number,
    categoryId: string,
    title:      string,
    imageUrl:   string,
    soldCount:  string,
  ) => void
}

// ── Extract item ID from URL or raw ID ────────────────────────
function extractItemId(input: string): string {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  const patterns = [
    /\/itm\/(?:[^\/]+\/)?(\d{10,13})/,
    /\/p\/(\d{10,13})/,
    /item=(\d{10,13})/,
    /(\d{12,13})/,
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  return trimmed
}

export default function EbaySearchBar({ onFetch }: EbaySearchBarProps) {
  const [url,        setUrl]        = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [focused,    setFocused]    = useState(false)
  const [status,     setStatus]     = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg,   setErrorMsg]   = useState('')

  async function handleFetch() {
    if (!url.trim()) return
    setIsFetching(true)
    setStatus('idle')
    setErrorMsg('')

    try {
      const itemId = extractItemId(url)

      if (!itemId || itemId.length < 6) {
        setStatus('error')
        setErrorMsg('Invalid eBay item ID or URL')
        setIsFetching(false)
        return
      }

      // ── Real eBay API call ─────────────────────────────────
      const res  = await fetch(`/api/ebay/item?id=${encodeURIComponent(itemId)}&purpose=profit`)
      const data = await res.json()

      if (!res.ok || data.error) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Item not found')
        setIsFetching(false)
        return
      }

      // ── Pass real data to profit calculator ────────────────
      onFetch(
        data.price      ?? 0,
        data.shipping   ?? 0,
        data.categoryId ?? '',
        data.title      ?? '',
        data.imageUrl   ?? '',
        data.soldCount?.toString() ?? '0',
      )

      setStatus('success')
      setUrl('')
      showToast(`Product fetched — ${data.title?.slice(0, 40)}...`)

    } catch (e: any) {
      setStatus('error')
      setErrorMsg('Failed to fetch — check your connection')
    }

    setIsFetching(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {/* Input */}
        <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-lg border bg-white transition-all"
             style={{
               borderColor: status === 'error'   ? '#FECACA'
                          : status === 'success' ? '#BBF7D0'
                          : focused              ? '#8FFF00'
                          : '#E2E8F0',
               boxShadow: focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
             }}>
          <Link size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); setStatus('idle') }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            placeholder="Paste eBay URL or Item ID..."
            className="flex-1 text-[13px] bg-transparent outline-none"
            style={{ color: '#0F172A' }}
          />
          {status === 'success' && <CheckCircle size={14} style={{ color: '#16a34a', flexShrink: 0 }} />}
          {status === 'error'   && <AlertTriangle size={14} style={{ color: '#b91c1c', flexShrink: 0 }} />}
        </div>

        {/* Fetch button */}
        <button
          onClick={handleFetch}
          disabled={isFetching || !url.trim()}
          className="h-10 px-4 rounded-lg text-[13px] font-bold flex items-center justify-center shrink-0 disabled:opacity-40 transition-all"
          style={{ backgroundColor: '#0F172A', color: '#8FFF00', minWidth: 70 }}>
          {isFetching
            ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#8FFF00' }} />
            : 'Fetch'}
        </button>
      </div>

      {/* Error message */}
      {status === 'error' && errorMsg && (
        <p className="text-[11px] font-semibold" style={{ color: '#b91c1c' }}>
          {errorMsg}
        </p>
      )}
    </div>
  )
}

// ── Toast notification ─────────────────────────────────────────
function showToast(message: string) {
  const el        = document.createElement('div')
  el.textContent  = message
  el.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #0a0d08; color: #8fff00; padding: 12px 20px; border-radius: 12px;
    font-size: 13px; font-weight: 600; z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}