'use client'
// components/admin/tabs/CompetitorXRayTab.tsx

import { useState, useRef, useEffect } from 'react'
import {
  Search, Store, DollarSign, Tag, TrendingUp,
  ExternalLink, RefreshCw, X, ChevronRight,
  Package, BarChart2, Lightbulb, ShoppingBag,
  AlertCircle, CheckCircle, Star,
} from 'lucide-react'

// ── Brand colours ──────────────────────────────────────────────
const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
  green:    '#16a34a',
  blue:     '#1d70f5',
  orange:   '#f97316',
}

interface Props {
  isMobile?:            boolean
  startChartAnimation?: boolean
  isInvestorMode?:      boolean
}

interface Product {
  title:      string
  price:      number
  category:   string
  imageUrl:   string | null
  listingUrl: string | null
  condition:  string
}

interface CategoryData {
  name:       string
  count:      number
  percentage: number
  avgPrice:   number
}

interface PriceRange {
  range:      string
  count:      number
  percentage: number
}

interface ScanResult {
  storeName:               string
  totalListings:           number
  estimatedMonthlyRevenue: number
  avgPrice:                number
  topCategory:             string
  sellThroughRate:         number
  soldCount:               number
  topProducts:             Product[]
  categories:              CategoryData[]
  priceDistribution:       PriceRange[]
  insights:                string[]
  scannedAt:               string
}

// ── Category colour palette ────────────────────────────────────
const CAT_COLORS = [
  C.lime, '#1d70f5', C.orange, '#8b5cf6', '#ec4899', '#14b8a6',
]

// ── FocusInput ─────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder, onKeyDown }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; onKeyDown?: (e: React.KeyboardEvent) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className="flex-1 text-[14px] outline-none bg-transparent"
      style={{ color: C.text }} />
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function CompetitorXRayTab(_props: Props) {
  const [input,       setInput]       = useState('')
  const [scanning,    setScanning]    = useState(false)
  const [result,      setResult]      = useState<ScanResult | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [history,     setHistory]     = useState<string[]>([])
  const [focused,     setFocused]     = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xray_history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {}
  }, [])

  function saveToHistory(store: string) {
    const updated = [store, ...history.filter(h => h !== store)].slice(0, 5)
    setHistory(updated)
    try { localStorage.setItem('xray_history', JSON.stringify(updated)) } catch {}
  }

  async function handleScan(url?: string) {
    const scanUrl = url ?? input.trim()
    if (!scanUrl) return
    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/competitor-xray', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ storeUrl: scanUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Scan failed. Please try again.')
        return
      }
      setResult(data)
      saveToHistory(scanUrl)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setError('Network error. Check your connection and try again.')
    } finally {
      setScanning(false)
    }
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  return (
    <div className="flex flex-col gap-6" style={{ color: C.text }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-[18px] font-bold" style={{ color: C.text }}>
          Competitor Store X-Ray
        </h2>
        <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>
          Paste any eBay store URL or username to reverse-engineer their strategy.
        </p>
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2.5 h-12 px-4 rounded-2xl border transition-all"
               style={{
                 backgroundColor: C.surface,
                 borderColor:     focused ? C.lime : C.border,
                 boxShadow:       focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
               }}>
            <Store size={16} style={{ color: C.muted, flexShrink: 0 }} />
            <FocusInput
              value={input}
              onChange={setInput}
              placeholder="https://www.ebay.com/str/storename  or  username"
              onKeyDown={e => e.key === 'Enter' && handleScan()}
            />
            {input && (
              <button onClick={() => setInput('')} className="shrink-0">
                <X size={14} style={{ color: C.muted }} />
              </button>
            )}
          </div>
          <button onClick={() => handleScan()} disabled={scanning || !input.trim()}
            className="flex items-center gap-2 px-6 rounded-2xl text-[13px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {scanning
              ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <Search size={15} />}
            {scanning ? 'Scanning...' : 'Scan Store'}
          </button>
        </div>

        {/* Recent searches */}
        {history.length > 0 && !scanning && !result && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold" style={{ color: C.muted }}>Recent:</span>
            {history.map(h => (
              <button key={h} onClick={() => { setInput(h); handleScan(h) }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all hover:opacity-80"
                style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
                <Store size={10} />
                {h.replace('https://www.ebay.com/str/', '').replace('https://www.ebay.com/usr/', '')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
             style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertCircle size={18} style={{ color: C.red }} />
          <p className="text-[13px] font-semibold" style={{ color: C.red }}>{error}</p>
        </div>
      )}

      {/* ── Scanning skeleton ─────────────────────────────────── */}
      {scanning && (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-28 rounded-2xl" style={{ backgroundColor: C.dark, opacity: 0.3 }} />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 rounded-2xl" style={{ backgroundColor: C.bg }} />
            <div className="h-40 rounded-2xl" style={{ backgroundColor: C.bg }} />
          </div>
          <div className="h-48 rounded-2xl" style={{ backgroundColor: C.bg }} />
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {result && !scanning && (
        <div ref={resultsRef} className="flex flex-col gap-5">

          {/* Store overview banner */}
          <div className="p-5 rounded-2xl" style={{ backgroundColor: C.dark }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: C.lime }}>
                  <Store size={15} color={C.dark} />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-white">{result.storeName}</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Scanned {timeAgo(result.scannedAt)}
                  </p>
                </div>
              </div>
              <a href={`https://www.ebay.com/str/${result.storeName}`}
                 target="_blank" rel="noreferrer"
                 className="flex items-center gap-1 text-[11px] font-semibold transition-all hover:opacity-70"
                 style={{ color: C.lime }}>
                <ExternalLink size={12} /> View Store
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Items Scanned',  value: `${result.totalListings > 0 ? result.totalListings : result.topProducts.length}+`, icon: Package, color: C.lime },
                { label: 'Avg Price',       value: `$${result.avgPrice.toFixed(2)}`,     icon: DollarSign, color: '#34d399' },
                { label: 'Top Category',    value: result.topCategory,                   icon: Tag,        color: '#60a5fa' },
                { label: 'Price Range',     value: result.priceDistribution.find(p => p.count === Math.max(...result.priceDistribution.map(x => x.count)))?.range ?? 'N/A',
                                                                                          icon: BarChart2,  color: '#f472b6' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-3 rounded-xl"
                     style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <Icon size={14} style={{ color, marginBottom: 6 }} />
                  <p className="text-[15px] font-bold text-white leading-tight truncate">{value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-4">

            {/* Category breakdown */}
            <div className="p-5 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[14px] font-bold mb-4" style={{ color: C.text }}>
                Category Breakdown
              </p>
              <div className="flex flex-col gap-3">
                {result.categories.slice(0, 5).map((cat, i) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold truncate" style={{ color: C.text, maxWidth: 140 }}>
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px]" style={{ color: C.muted }}>{cat.count} items</span>
                        <span className="text-[12px] font-bold" style={{ color: CAT_COLORS[i % CAT_COLORS.length] }}>
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden"
                         style={{ backgroundColor: C.bg }}>
                      <div className="h-full rounded-full transition-all"
                           style={{
                             width:           `${cat.percentage}%`,
                             backgroundColor: CAT_COLORS[i % CAT_COLORS.length],
                           }} />
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>
                      avg ${cat.avgPrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price distribution */}
            <div className="p-5 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <p className="text-[14px] font-bold mb-4" style={{ color: C.text }}>
                Price Distribution
              </p>
              <div className="flex flex-col gap-3">
                {result.priceDistribution.map((range, i) => (
                  <div key={range.range}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold" style={{ color: C.text }}>
                        {range.range}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px]" style={{ color: C.muted }}>{range.count} items</span>
                        <span className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
                          {range.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden"
                         style={{ backgroundColor: C.bg }}>
                      <div className="h-full rounded-full transition-all"
                           style={{ width: `${range.percentage}%`, backgroundColor: C.lime }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="p-5 rounded-2xl border"
                 style={{ backgroundColor: C.limeTint, borderColor: C.lime }}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} style={{ color: C.limeDeep }} />
                <p className="text-[14px] font-bold" style={{ color: C.limeDeep }}>Key Insights</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {result.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={13} style={{ color: C.limeDeep, marginTop: 1, flexShrink: 0 }} />
                    <p className="text-[12px]" style={{ color: C.text }}>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Products table */}
          <div className="rounded-2xl border overflow-hidden"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between px-5 py-4"
                 style={{ borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p className="text-[14px] font-bold" style={{ color: C.text }}>Top Products</p>
                <p className="text-[11px]" style={{ color: C.muted }}>
                  Top {result.topProducts.length} of {result.totalListings}+ listings · sorted by price
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                   style={{ backgroundColor: C.bg }}>
                <Star size={12} style={{ color: C.orange }} />
                <span className="text-[11px] font-bold" style={{ color: C.muted }}>
                  {result.topCategory}
                </span>
              </div>
            </div>

            {/* Column headers */}
            <div className="px-4 py-2.5 grid text-[10px] font-bold uppercase tracking-wide"
                 style={{ gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr', columnGap: 12,
                          backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`, color: C.muted }}>
              <span>Product</span>
              <span>Category</span>
              <span>Condition</span>
              <span className="text-right">Price</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y overflow-y-auto"
                 style={{ borderColor: C.border, maxHeight: 480 }}>
              {result.topProducts.map((product, i) => (
                <div key={i}
                     className="px-4 py-2.5 grid items-center"
                     style={{ gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr', columnGap: 12,
                              backgroundColor: i % 2 === 0 ? 'transparent' : C.bg }}>

                  {/* Product */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt=""
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                        style={{ border: `1px solid ${C.border}` }} />
                    ) : (
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                           style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                        <ShoppingBag size={14} style={{ color: C.muted }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      {product.listingUrl ? (
                        <a href={product.listingUrl} target="_blank" rel="noreferrer"
                           className="text-[12px] font-semibold truncate block hover:underline"
                           style={{ color: C.text }}>
                          {product.title}
                        </a>
                      ) : (
                        <p className="text-[12px] font-semibold truncate" style={{ color: C.text }}>
                          {product.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <span className="text-[11px] truncate" style={{ color: C.muted }}>{product.category}</span>

                  {/* Condition */}
                  <span className="text-[11px] truncate" style={{ color: C.muted }}>{product.condition}</span>

                  {/* Price */}
                  <p className="text-[13px] font-bold text-right" style={{ color: C.green }}>
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scan again */}
          <div className="flex items-center justify-between">
            <p className="text-[11px]" style={{ color: C.muted }}>
              Data from eBay Browse API · {result.totalListings}+ listings analysed · top {result.topProducts.length} shown
            </p>
            <button onClick={() => { setResult(null); setInput('') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all hover:opacity-70"
              style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
              <Search size={12} /> Scan Another Store
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !scanning && !error && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
               style={{ backgroundColor: C.limeTint }}>
            <TrendingUp size={24} style={{ color: C.limeDeep }} />
          </div>
          <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>
            Scan any eBay competitor
          </p>
          <p className="text-[13px] text-center max-w-sm" style={{ color: C.muted }}>
            Paste a store URL or username above to see their top products, categories, pricing strategy and more.
          </p>
          <div className="flex flex-col gap-2 mt-5 text-left">
            {[
              'ebay.com/str/storename',
              'ebay.com/usr/username',
              'Just the username',
            ].map(ex => (
              <div key={ex} className="flex items-center gap-2">
                <ChevronRight size={12} style={{ color: C.lime }} />
                <code className="text-[11px]" style={{ color: C.muted }}>{ex}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
