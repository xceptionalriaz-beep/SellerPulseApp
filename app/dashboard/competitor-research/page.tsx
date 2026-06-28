'use client'
// app/dashboard/competitor-research/page.tsx
// Converted 1:1 from lib/pages/competitor_research/competitor_research_main.dart
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import KillSwitchGate from '@/components/KillSwitchGate'
import {
  Radar, BookmarkPlus, Eye, Store, Search,
  Info, Zap, ScanSearch, Key, Bookmark,
  ArrowLeft, Star, TrendingUp, Package,
  DollarSign, List, CheckCircle, ChevronDown,
  ChevronUp, Copy, Calculator, RefreshCw,
  Bookmark as BookmarkIcon, BookmarkCheck,
  ShoppingBag, BarChart2,
} from 'lucide-react'

// ── Design tokens (matches Dart _C) ──────────────────────────
const C = {
  bg:       '#F8FAFC',
  white:    '#FFFFFF',
  surface:  '#F1F5F9',
  border:   '#E2E8F0',
  accent:   '#5CB800',
  accentDim:'#E8FFB0',
  navy:     '#0F172A',
  textPri:  '#0F172A',
  textSec:  '#64748B',
  textHint: '#94A3B8',
  error:    '#DC2626',
  success:  '#16A34A',
  warning:  '#D97706',
  blue:     '#2563EB',
  purple:   '#7C3AED',
  orange:   '#EA580C',
}

// ── Types ──────────────────────────────────────────────────────
interface ScannedProduct {
  itemId:           string
  title:            string
  price:            number
  soldCount:        number
  watchCount:       number
  revenue:          number
  imageUrl:         string | null
  category:         string | null
  condition:        string
  freeShipping:     boolean
  trend:            'rising' | 'stable' | 'fading'
  opportunityScore: number
  topKeywords:      string[]
}
interface GapProduct {
  title:             string
  reason:            string
  category:          string
  estimatedDemand:   number
}
interface StoreOverview {
  username:          string
  storeName:         string | null
  estimatedRevenue:  number
  totalSold:         number
  activeListings:    number
  avgPrice:          number
  sellThroughRate:   number
  feedbackScore:     number
  feedbackPercent:   number
}
interface StoreScanResult {
  overview:    StoreOverview
  products:    ScannedProduct[]
  gaps:        GapProduct[]
  topKeywords: string[]
  scannedAt:   Date
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n/1000).toFixed(1)}K`
  return n.toFixed(0)
}
function fmtInt(n: number): string {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 1000)    return `${(n/1000).toFixed(1)}K`
  return String(n)
}
function timeAgo(dt: Date): string {
  const diff = Date.now() - dt.getTime()
  const m = Math.floor(diff/60000)
  const h = Math.floor(diff/3600000)
  const d = Math.floor(diff/86400000)
  if (m < 1)  return 'Scanned just now'
  if (m < 60) return `Scanned ${m}m ago`
  if (h < 24) return `Scanned ${h}h ago`
  return `Scanned ${d}d ago`
}

// ── Sparkline ─────────────────────────────────────────────────
function Sparkline({ trend, itemId }: { trend: string; itemId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width, H = canvas.height
    let seed = 0
    for (let i = 0; i < itemId.length; i++) seed = (seed * 31 + itemId.charCodeAt(i)) >>> 0
    function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed >>> 0) / 4294967296 }
    const baseVelocity = trend === 'rising' ? 8.0 : trend === 'fading' ? 3.0 : 5.5
    const volatility   = 0.3 + rand() * 0.5
    const phaseShift   = Math.floor(rand() * 7)
    const dailyDrift   = trend === 'rising'
      ? 0.04 + rand() * 0.06
      : trend === 'fading'
      ? -(0.04 + rand() * 0.06)
      : (rand() - 0.5) * 0.04
    const rawY: number[] = []
    let minY = Infinity, maxY = -Infinity
    for (let day = 0; day < 14; day++) {
      const cycle = ((day + phaseShift) % 7 >= 5) ? 1.35 : 0.85
      const noise = 1.0 + ((rand() - 0.5) * volatility)
      const drift = 1.0 + (day * dailyDrift)
      let y = baseVelocity * cycle * noise * drift
      if (y < 0.5) y = 0.5 + rand()
      rawY.push(y)
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    minY *= 0.5; maxY *= 1.15
    const points: {x:number;y:number}[] = rawY.map((v, i) => ({
      x: (i / 13) * W,
      y: Math.max(2, Math.min(H-2, H - ((v - minY) / (maxY - minY)) * H))
    }))
    ctx.clearRect(0, 0, W, H)
    ctx.beginPath()
    ctx.moveTo(points[0].x, H)
    points.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length-1].x, H)
    ctx.closePath()
    ctx.fillStyle = 'rgba(143,255,0,0.08)'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i-1].x + points[i].x) / 2
      ctx.bezierCurveTo(cp1x, points[i-1].y, cp1x, points[i].y, points[i].x, points[i].y)
    }
    ctx.strokeStyle = 'rgba(143,255,0,0.9)'
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    ctx.stroke()
  }, [trend, itemId])
  const trendColor = trend === 'rising' ? '#5CB800' : trend === 'fading' ? '#DC2626' : '#D97706'
  const trendLabel = trend === 'rising' ? 'Rising' : trend === 'fading' ? 'Fading' : 'Stable'
  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={canvasRef} width={75} height={32} />
      <span className="text-[9px] font-semibold" style={{ color: trendColor }}>{trendLabel}</span>
    </div>
  )
}

// ── Gap card ──────────────────────────────────────────────────
function GapCard({ gap }: { gap: GapProduct }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border mb-2.5"
         style={{ backgroundColor: C.white, borderColor: C.border }}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
           style={{ backgroundColor: C.accentDim }}>
        <span className="text-[13px] font-extrabold" style={{ color: C.accent }}>
          {Math.round(gap.estimatedDemand)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold mb-1" style={{ color: C.textPri }}>{gap.title}</p>
        <p className="text-[11px] leading-snug" style={{ color: C.textSec }}>{gap.reason}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0" style={{ width: 80 }}>
        <p className="text-[9px]" style={{ color: C.textHint }}>Demand</p>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
          <div className="h-full rounded-full" style={{ width: `${gap.estimatedDemand}%`, backgroundColor: C.accent }} />
        </div>
        <p className="text-[9px]" style={{ color: C.textSec }}>{gap.category}</p>
      </div>
    </div>
  )
}

// ── Price calc sheet ──────────────────────────────────────────
function PriceCalcSheet({ product, onClose }: { product: ScannedProduct; onClose: () => void }) {
  const [cost,   setCost]   = useState('')
  const [sell,   setSell]   = useState<number|null>(null)
  const [profit, setProfit] = useState<number|null>(null)
  const [roi,    setRoi]    = useState<number|null>(null)

  function calc(val: string) {
    const c = parseFloat(val)
    if (isNaN(c)) { setSell(null); return }
    const s   = product.price * 0.94
    const fee = s * 0.1325 + 0.30
    const p   = s - c - fee
    const r   = c > 0 ? p / c * 100 : 0
    setSell(s); setProfit(p); setRoi(r)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8">
        <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: C.border }} />
        <p className="text-[15px] font-bold mb-0.5" style={{ color: C.textPri }}>Price Undercut Calculator</p>
        <p className="text-[12px] mb-4" style={{ color: C.textSec }}>
          Competitor sells at ${product.price.toFixed(2)}
        </p>
        <p className="text-[11px] mb-1.5" style={{ color: C.textSec }}>Your sourcing cost (USD)</p>
        <input value={cost} onChange={e => { setCost(e.target.value); calc(e.target.value) }}
          type="number" placeholder="0.00"
          className="w-full h-11 px-3 rounded-xl border text-[14px] font-bold outline-none mb-4"
          style={{ backgroundColor: C.bg, borderColor: C.border, color: C.textPri }} />
        {sell !== null && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: 'Sell price', value: `$${sell!.toFixed(2)}`,  color: C.accent },
                { label: 'Net profit', value: `$${profit!.toFixed(2)}`, color: profit! >= 0 ? C.success : C.error },
                { label: 'ROI',        value: `${roi!.toFixed(1)}%`,    color: roi! >= 20 ? C.success : roi! >= 0 ? C.warning : C.error },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-xl border"
                     style={{ backgroundColor: c.color + '14', borderColor: c.color + '33' }}>
                  <p className="text-[10px] mb-1" style={{ color: C.textSec }}>{c.label}</p>
                  <p className="text-[15px] font-extrabold" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px]" style={{ color: C.textHint }}>
              * Includes eBay final value fee (13.25%) + $0.30
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Product row ───────────────────────────────────────────────
function ProductRow({ product, isSaved, onSave, onCopyTitle, onCalculatePrice }: {
  product: ScannedProduct; isSaved: boolean
  onSave: () => void; onCopyTitle: () => void; onCalculatePrice: () => void
}) {
  const [hover,    setHover]    = useState(false)
  const [expanded, setExpanded] = useState(false)
  const scoreColor = product.opportunityScore >= 8 ? C.accent
    : product.opportunityScore >= 6 ? C.blue
    : product.opportunityScore >= 4 ? C.warning : C.error

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         style={{ backgroundColor: hover ? C.bg : C.white, borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <div className="w-9 shrink-0">
          <div onClick={onSave}
               className="rounded border-2 flex items-center justify-center cursor-pointer"
               style={{ width: 18, height: 18, backgroundColor: isSaved ? C.accent : C.white, borderColor: isSaved ? C.accent : C.border }}>
            {isSaved && <CheckCircle size={10} color="white" />}
          </div>
        </div>
        <div className="w-14 h-14 rounded-lg border shrink-0 overflow-hidden flex items-center justify-center"
             style={{ backgroundColor: C.bg, borderColor: C.border }}>
          {product.imageUrl
            ? <img src={product.imageUrl} className="w-full h-full object-cover" />
            : <Package size={18} style={{ color: C.textHint }} />}
        </div>
        <div className="flex-[5] min-w-0">
          <p className="text-[12px] font-medium leading-snug line-clamp-2 mb-1" style={{ color: C.textPri }}>
            {product.title}
          </p>
          {product.category && <p className="text-[10px] mb-1" style={{ color: C.textHint }}>{product.category}</p>}
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                  style={{ backgroundColor: C.bg, color: C.textSec }}>{product.condition}</span>
            {product.freeShipping && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                    style={{ backgroundColor: '#DCFCE7', color: C.success }}>Free Ship</span>
            )}
          </div>
        </div>
        <div className="flex-[2] flex justify-center">
          <Sparkline trend={product.trend} itemId={product.itemId} />
        </div>
        <div className="flex-[2] text-center">
          <p className="text-[13px] font-bold" style={{ color: C.textPri }}>{product.soldCount}</p>
          <p className="text-[9px]" style={{ color: C.textHint }}>sold</p>
        </div>
        <div className="flex-[1] flex items-center justify-center gap-1">
          <Eye size={11} style={{ color: C.textHint }} />
          <span className="text-[11px] font-semibold" style={{ color: C.textSec }}>{product.watchCount}</span>
        </div>
        <div className="flex-[2] text-center">
          <span className="text-[13px] font-bold" style={{ color: C.textPri }}>${product.price.toFixed(2)}</span>
        </div>
        <div className="flex-[1] flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
               style={{ backgroundColor: scoreColor + '1A', borderColor: scoreColor }}>
            <span className="text-[12px] font-bold" style={{ color: scoreColor }}>{product.opportunityScore}</span>
          </div>
        </div>
        <div className="flex-[3] flex items-center justify-center gap-1">
          {[
            { icon: Calculator, tip: 'Price calc', fn: onCalculatePrice },
            { icon: Copy,       tip: 'Copy title', fn: onCopyTitle      },
            { icon: expanded ? ChevronUp : ChevronDown, tip: 'Keywords', fn: () => setExpanded(s => !s) },
          ].map((a, i) => {
            const Icon = a.icon
            return (
              <button key={i} onClick={a.fn} title={a.tip}
                className="p-1.5 rounded border hover:opacity-70"
                style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <Icon size={12} style={{ color: C.textSec }} />
              </button>
            )
          })}
          <button onClick={onSave}
            className="flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-all"
            style={{
              backgroundColor: isSaved ? C.accentDim : C.white,
              borderColor:     isSaved ? C.accent    : C.border,
              color:           isSaved ? C.accent    : C.textSec,
            }}>
            {isSaved ? <BookmarkCheck size={11} /> : <BookmarkIcon size={11} />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2.5" style={{ paddingLeft: 122 }}>
          {product.topKeywords.map((kw, i) => (
            <span key={i} className="px-1.5 py-1 rounded text-[10px] font-medium"
                  style={{ backgroundColor: C.accentDim, color: C.accent }}>{kw}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Price Analysis Tab ────────────────────────────────────────
function PriceTab({ products }: { products: ScannedProduct[] }) {
  if (!products.length) return (
    <p className="text-center py-10 text-[14px]" style={{ color: C.textSec }}>No price data</p>
  )
  const prices = [...products].map(p => p.price).sort((a,b) => a-b)
  const avg    = prices.reduce((a,b) => a+b, 0) / prices.length
  const min    = prices[0]
  const max    = prices[prices.length-1]
  const buckets = [
    { label: '$0-25',    count: prices.filter(p => p < 25).length },
    { label: '$25-50',   count: prices.filter(p => p >= 25  && p < 50).length },
    { label: '$50-100',  count: prices.filter(p => p >= 50  && p < 100).length },
    { label: '$100-200', count: prices.filter(p => p >= 100 && p < 200).length },
    { label: '$200+',    count: prices.filter(p => p >= 200).length },
  ]
  const maxCount = Math.max(...buckets.map(b => b.count), 1)

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="flex gap-4">
        {[
          { label: 'Min Price', value: `$${min.toFixed(2)}`, color: C.success },
          { label: 'Avg Price', value: `$${avg.toFixed(2)}`, color: C.accent  },
          { label: 'Max Price', value: `$${max.toFixed(2)}`, color: C.error   },
        ].map((s, i) => (
          <div key={i} className="flex-1 p-4 rounded-xl border"
               style={{ backgroundColor: C.white, borderColor: C.border }}>
            <p className="text-[12px] mb-2" style={{ color: C.textSec }}>{s.label}</p>
            <p className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="p-5 rounded-xl border" style={{ backgroundColor: C.white, borderColor: C.border }}>
        <p className="text-[15px] font-bold mb-1" style={{ color: C.textPri }}>Price Distribution</p>
        <p className="text-[12px] mb-5" style={{ color: C.textSec }}>How many products fall into each price range</p>
        <div className="flex items-end gap-3" style={{ height: 180 }}>
          {buckets.map((b, i) => {
            const pct  = b.count / maxCount
            const barH = Math.round(pct * 140)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: b.count > 0 ? C.accent : 'transparent' }}>
                  {b.count}
                </span>
                <div className="w-full flex flex-col justify-end rounded-lg"
                     style={{ height: 140, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  {b.count > 0 && (
                    <div className="w-full rounded-lg" style={{ height: Math.max(barH, 8), backgroundColor: C.accent }} />
                  )}
                </div>
                <span className="text-[10px] font-medium text-center" style={{ color: C.textSec }}>{b.label}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-xl border"
           style={{ backgroundColor: C.accentDim, borderColor: `${C.accent}4D` }}>
        <Zap size={16} style={{ color: C.accent, flexShrink: 0, marginTop: 1 }} />
        <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>
          Sweet spot for entry:{' '}
          <span className="font-bold" style={{ color: C.accent }}>
            ${(avg * 0.85).toFixed(0)} - ${(avg * 1.15).toFixed(0)}
          </span>
          . Slightly undercuts the average while staying competitive.
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════
export default function CompetitorResearchPage() {
  const supabase = createClient()

  const [pageState,      setPageState]      = useState<'idle'|'scanning'|'results'>('idle')
  const [searchVal,      setSearchVal]      = useState('')
  const [isFocused,      setIsFocused]      = useState(false)
  const [errorMsg,       setErrorMsg]       = useState<string|null>(null)
  const [scanStage,      setScanStage]      = useState(0)
  const [result,         setResult]         = useState<StoreScanResult|null>(null)
  const [history,        setHistory]        = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeTab,      setActiveTab]      = useState(0)
  const [sortBy,         setSortBy]         = useState('opportunity')
  const [filterTrend,    setFilterTrend]    = useState('all')
  const [searchProd,     setSearchProd]     = useState('')
  const [savedIds,       setSavedIds]       = useState<Set<string>>(new Set())
  const [onWatchlist,    setOnWatchlist]    = useState(false)
  const [calcProduct,    setCalcProduct]    = useState<ScannedProduct|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const STAGES = [
    'Connecting to eBay...',
    'Fetching store listings...',
    'Analysing products...',
    'Running AI scoring...',
    'Finding gaps...',
    'Saving results...',
  ]

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const { data } = await (supabase.from('competitor_scan_history') as any)
        .select('*').order('scanned_at', { ascending: false }).limit(20)
      setHistory((data ?? []) as any[])
    } catch {}
    setHistoryLoading(false)
  }

  async function startScan(username?: string) {
    const name = username ?? searchVal.trim()
    if (!name) { setErrorMsg('Enter an eBay username to scan'); return }
    setSearchVal(name)
    inputRef.current?.blur()
    setPageState('scanning'); setErrorMsg(null); setScanStage(0); setResult(null)

    for (let i = 0; i < STAGES.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setScanStage(i)
    }

    try {
      let scanData: StoreScanResult | null = null
      try {
        const res = await supabase.functions.invoke('ebay-scan', { body: { username: name } })
        if (!res.error && res.data?.overview?.totalSold > 0) {
          const d = res.data as any
          scanData = {
            scannedAt: new Date(),
            overview: {
              username:         d.overview.username ?? name,
              storeName:        d.overview.storeName ?? `${name}'s eBay Store`,
              estimatedRevenue: d.overview.estimatedRevenue ?? 0,
              totalSold:        d.overview.totalSold ?? 0,
              activeListings:   d.overview.activeListings ?? 0,
              avgPrice:         d.overview.avgPrice ?? 0,
              sellThroughRate:  d.overview.sellThroughRate ?? 0,
              feedbackScore:    d.overview.feedbackScore ?? 0,
              feedbackPercent:  d.overview.feedbackPercent ?? 0,
            },
            products:    d.products ?? [],
            gaps:        d.gaps ?? [],
            topKeywords: d.topKeywords ?? [],
          }
        }
      } catch {}

      const mockResult: StoreScanResult = scanData ?? {
        scannedAt: new Date(),
        overview: {
          username:         name,
          storeName:        `${name}'s eBay Store`,
          estimatedRevenue: 45210,
          totalSold:        1842,
          activeListings:   312,
          avgPrice:         24.57,
          sellThroughRate:  48.2,
          feedbackScore:    4891,
          feedbackPercent:  99.1,
        },
        products: [
          { itemId: `${name}-1`, title: 'Apple AirPods Pro 2nd Gen Wireless Earbuds Noise Cancellation USB-C', price: 189.99, soldCount: 342, watchCount: 1204, revenue: 64976, imageUrl: null, category: 'Consumer Electronics', condition: 'New', freeShipping: true,  trend: 'rising', opportunityScore: 9, topKeywords: ['airpods', 'apple', 'wireless', 'noise cancelling', 'usb-c'] },
          { itemId: `${name}-2`, title: 'Bose QuietComfort 45 Bluetooth Wireless Headphones',                  price: 229.00, soldCount: 67,  watchCount: 312,  revenue: 15343, imageUrl: null, category: 'Headphones',           condition: 'New', freeShipping: true,  trend: 'rising', opportunityScore: 8, topKeywords: ['bose', 'quietcomfort', 'bluetooth', 'wireless', 'noise canceling'] },
          { itemId: `${name}-3`, title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',                price: 298.00, soldCount: 125, watchCount: 890,  revenue: 37250, imageUrl: null, category: 'Headphones',           condition: 'New', freeShipping: true,  trend: 'stable', opportunityScore: 7, topKeywords: ['sony', 'wireless', 'headphones', 'noise canceling', 'premium'] },
          { itemId: `${name}-4`, title: 'Samsung Galaxy Buds2 Pro True Wireless Earbuds',                      price: 149.99, soldCount: 89,  watchCount: 445,  revenue: 13349, imageUrl: null, category: 'Consumer Electronics', condition: 'New', freeShipping: false, trend: 'fading', opportunityScore: 5, topKeywords: ['samsung', 'galaxy', 'buds', 'wireless', 'earbuds'] },
          { itemId: `${name}-5`, title: 'JBL Tune 510BT Wireless On-Ear Headphones',                          price: 39.99,  soldCount: 210, watchCount: 780,  revenue: 8397,  imageUrl: null, category: 'Headphones',           condition: 'New', freeShipping: true,  trend: 'rising', opportunityScore: 8, topKeywords: ['jbl', 'wireless', 'headphones', 'budget', 'on-ear'] },
          { itemId: `${name}-6`, title: 'Anker Soundcore Life Q20 Hybrid Noise Cancelling',                   price: 59.99,  soldCount: 156, watchCount: 623,  revenue: 9358,  imageUrl: null, category: 'Headphones',           condition: 'New', freeShipping: true,  trend: 'stable', opportunityScore: 7, topKeywords: ['anker', 'soundcore', 'noise cancelling', 'wireless', 'budget'] },
          { itemId: `${name}-7`, title: 'Wired Earbuds USB-C In-Ear Headphones with Mic',                     price: 12.99,  soldCount: 445, watchCount: 234,  revenue: 5779,  imageUrl: null, category: 'Consumer Electronics', condition: 'New', freeShipping: true,  trend: 'stable', opportunityScore: 6, topKeywords: ['wired', 'earbuds', 'usb-c', 'budget', 'mic'] },
          { itemId: `${name}-8`, title: 'Kids Headphones Volume Limited 85dB Safe',                           price: 19.99,  soldCount: 320, watchCount: 412,  revenue: 6396,  imageUrl: null, category: 'Kids Electronics',     condition: 'New', freeShipping: true,  trend: 'rising', opportunityScore: 9, topKeywords: ['kids', 'headphones', 'safe', 'volume', 'school'] },
        ],
        gaps: [
          { title: 'Budget Wireless Earbuds Under $30', reason: 'High demand with no listings under $30 in this store', category: 'Consumer Electronics', estimatedDemand: 85 },
          { title: 'Wired Gaming Headsets',             reason: 'No wired gaming headsets despite high search volume', category: 'Gaming',               estimatedDemand: 72 },
          { title: 'Kids Headphones',                   reason: 'Zero child-safe headphone options in inventory',      category: 'Kids Electronics',      estimatedDemand: 61 },
        ],
        topKeywords: ['wireless', 'noise canceling', 'bluetooth', 'apple', 'sony', 'earbuds', 'headphones', 'premium', 'usb-c', 'true wireless', 'anc', 'over-ear', 'in-ear', 'portable'],
      }

      try {
        await (supabase.from('competitor_scan_history') as any).upsert({
          username:          name,
          estimated_revenue: mockResult.overview.estimatedRevenue,
          total_sold:        mockResult.overview.totalSold,
          scanned_at:        new Date().toISOString(),
        }, { onConflict: 'username' })
      } catch {}

      setResult(mockResult)
      setOnWatchlist(false)
      setPageState('results')
      setActiveTab(0)
      setSortBy('opportunity')
      setFilterTrend('all')
      setSearchProd('')
      setSavedIds(new Set())
      loadHistory()
    } catch (e) {
      setPageState('idle')
      setErrorMsg(`Could not scan "${name}". Check the username and try again.`)
    }
  }

  async function toggleWatchlist() {
    if (!result) return
    setOnWatchlist(w => !w)
  }

  async function toggleSave(p: ScannedProduct) {
    if (savedIds.has(p.itemId)) {
      setSavedIds(s => { const n = new Set(s); n.delete(p.itemId); return n })
    } else {
      setSavedIds(s => new Set(s).add(p.itemId))
      try {
        await (supabase.from('listing_ideas') as any).upsert({
          item_id: p.itemId, title: p.title, price: p.price,
          image_url: p.imageUrl, opportunity_score: p.opportunityScore,
        }, { onConflict: 'item_id' })
      } catch {}
    }
  }

  function copyToClipboard(text: string) { navigator.clipboard.writeText(text) }

  function getFilteredProducts(): ScannedProduct[] {
    let list = [...(result?.products ?? [])]
    if (searchProd) list = list.filter(p => p.title.toLowerCase().includes(searchProd.toLowerCase()))
    if (filterTrend !== 'all') list = list.filter(p => p.trend === filterTrend)
    switch (sortBy) {
      case 'opportunity': list.sort((a, b) => b.opportunityScore - a.opportunityScore); break
      case 'revenue':     list.sort((a, b) => b.revenue - a.revenue); break
      case 'sold':        list.sort((a, b) => b.soldCount - a.soldCount); break
      case 'price':       list.sort((a, b) => b.price - a.price); break
    }
    return list
  }

  function InlineTab({ value, label, current, onTap }: { value: string; label: string; current: string; onTap: (v: string) => void }) {
    const active = current === value
    return (
      <button onClick={() => onTap(value)}
        className="px-2.5 py-1.5 rounded-md border text-[12px] shrink-0 transition-all"
        style={{
          backgroundColor: active ? C.accentDim : C.white,
          borderColor:     active ? C.accent : C.border,
          borderWidth:     active ? 1.5 : 1,
          fontWeight:      active ? 700 : 500,
          color:           active ? C.accent : C.textSec,
        }}>
        {label}
      </button>
    )
  }

  // ── IDLE VIEW ─────────────────────────────────────────────────
  if (pageState === 'idle') return (
    <KillSwitchGate switchTitle="Competitor Research">
      <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: C.bg }}>
        <div className="px-8 pt-10 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.accentDim }}>
                <Radar size={21} style={{ color: C.accent }} />
              </div>
              <div>
                <h1 className="text-[22px] font-bold tracking-tight" style={{ color: C.textPri, fontFamily: 'var(--font-space-grotesk)' }}>
                  Competitor Research
                </h1>
                <p className="text-[13px]" style={{ color: C.textSec }}>
                  Scan any eBay store. Find winning products instantly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium"
                      style={{ backgroundColor: C.white, borderColor: C.border, color: C.textSec }}>
                <BookmarkPlus size={13} /> Listing Ideas
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium"
                      style={{ backgroundColor: C.white, borderColor: C.border, color: C.textSec }}>
                <Eye size={13} /> Watchlist
              </button>
            </div>
          </div>

          <div className="mb-2.5">
            <div className="flex items-center h-14 rounded-xl border transition-all"
                 style={{
                   backgroundColor: C.white,
                   borderColor: errorMsg ? C.error : isFocused ? C.accent : C.border,
                   borderWidth: isFocused ? 1.5 : 1,
                   boxShadow: isFocused ? `0 0 0 3px rgba(92,184,0,0.12)` : 'none',
                 }}>
              <div className="pl-4 pr-3 shrink-0">
                <Store size={17} style={{ color: isFocused ? C.accent : C.textSec }} />
              </div>
              <input ref={inputRef} value={searchVal}
                onChange={e => { setSearchVal(e.target.value); setErrorMsg(null) }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={e => e.key === 'Enter' && startScan()}
                placeholder="Enter eBay username (e.g. techdealsusa)"
                className="flex-1 text-[14px] font-medium outline-none bg-transparent"
                style={{ color: C.textPri }} />
              <button onClick={() => startScan()}
                className="flex items-center gap-1.5 m-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold"
                style={{ backgroundColor: C.accent, color: '#000' }}>
                <Radar size={14} /> Scan Store
              </button>
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Info size={11} style={{ color: C.error }} />
                <p className="text-[12px]" style={{ color: C.error }}>{errorMsg}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-8">
            <Info size={11} style={{ color: C.textHint }} />
            <p className="text-[11px]" style={{ color: C.textHint }}>
              Enter an eBay username (e.g. "techdealsusa") — not a store URL
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-9">
            {[
              { icon: Zap,        label: 'AI Score',      sub: 'Products scored 1-10' },
              { icon: ScanSearch, label: 'Gap Finder',    sub: 'Auto-detect'           },
              { icon: Key,        label: 'Keywords',      sub: 'From titles'           },
              { icon: Bookmark,   label: 'Listing Ideas', sub: 'One-tap save'          },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex items-center gap-2.5 p-3.5 rounded-xl border"
                     style={{ backgroundColor: C.white, borderColor: C.border }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.accentDim }}>
                    <Icon size={15} style={{ color: C.accent }} />
                  </div>
                  <div>
                    <p className="text-[12px]" style={{ color: C.textSec }}>{f.label}</p>
                    <p className="text-[13px] font-semibold" style={{ color: C.textPri }}>{f.sub}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-[16px] font-semibold" style={{ color: C.textPri, fontFamily: 'var(--font-space-grotesk)' }}>
              Recent Scans
            </p>
            {history.length > 0 && (
              <button onClick={loadHistory} className="text-[12px]" style={{ color: C.textSec }}>Refresh</button>
            )}
          </div>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.accent }} />
          </div>
        ) : history.length === 0 ? (
          <div className="mx-8 mb-10 p-9 rounded-2xl border flex flex-col items-center"
               style={{ backgroundColor: C.white, borderColor: C.border }}>
            <div className="w-13 h-13 rounded-full flex items-center justify-center mb-3.5"
                 style={{ width: 52, height: 52, backgroundColor: C.accentDim }}>
              <Radar size={23} style={{ color: C.accent }} />
            </div>
            <p className="text-[15px] font-semibold mb-1.5" style={{ color: C.textPri, fontFamily: 'var(--font-space-grotesk)' }}>
              No scans yet
            </p>
            <p className="text-[13px] text-center mb-4 leading-relaxed" style={{ color: C.textSec }}>
              Scan your first competitor store above to find winning products instantly.
            </p>
            <button onClick={() => inputRef.current?.focus()}
              className="px-4 py-2 rounded-lg border text-[13px] font-semibold"
              style={{ backgroundColor: C.accentDim, borderColor: `${C.accent}66`, color: C.accent }}>
              Start your first scan
            </button>
          </div>
        ) : (
          <div className="px-8 pb-10 flex flex-col gap-2">
            {history.map((scan, i) => (
              <button key={i} onClick={() => startScan(scan.username)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left hover:opacity-80 transition-all"
                style={{ backgroundColor: C.white, borderColor: C.border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: C.accentDim }}>
                  <span className="text-[16px] font-extrabold" style={{ color: C.accent }}>
                    {scan.username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold" style={{ color: C.textPri }}>{scan.username}</p>
                  <p className="text-[11px]" style={{ color: C.textSec }}>
                    {scan.scanned_at ? timeAgo(new Date(scan.scanned_at)) : 'Recently'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold" style={{ color: C.accent }}>${fmt(scan.estimated_revenue ?? 0)}</p>
                  <p className="text-[11px]" style={{ color: C.textSec }}>{scan.total_sold ?? 0} sold</p>
                </div>
                <Radar size={13} style={{ color: C.textHint }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </KillSwitchGate>
  )

  // ── SCANNING VIEW ─────────────────────────────────────────────
  if (pageState === 'scanning') return (
    <div className="flex flex-col items-center justify-center h-full" style={{ backgroundColor: C.bg }}>
      <div className="w-19 h-19 rounded-full flex items-center justify-center mb-6 animate-pulse"
           style={{ width: 76, height: 76, backgroundColor: C.accentDim, boxShadow: `0 0 28px 6px rgba(92,184,0,0.25)` }}>
        <Radar size={34} style={{ color: C.accent }} />
      </div>
      <p className="text-[19px] font-bold mb-2" style={{ color: C.textPri, fontFamily: 'var(--font-space-grotesk)' }}>
        Scanning "{searchVal}"
      </p>
      <p className="text-[13px] mb-7" style={{ color: C.textSec }}>{STAGES[scanStage]}</p>
      <div className="w-64 h-1 rounded-full overflow-hidden mb-2.5" style={{ backgroundColor: C.border }}>
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${((scanStage + 1) / STAGES.length) * 100}%`, backgroundColor: C.accent }} />
      </div>
      <p className="text-[12px] font-semibold mb-8" style={{ color: C.accent }}>
        {Math.round(((scanStage + 1) / STAGES.length) * 100)}%
      </p>
      <button onClick={() => setPageState('idle')} className="text-[13px]" style={{ color: C.textSec }}>Cancel</button>
    </div>
  )

  // ── RESULTS VIEW ──────────────────────────────────────────────
  if (pageState === 'results' && result) {
    const o        = result.overview
    const products = getFilteredProducts()

    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b"
             style={{ backgroundColor: C.white, borderColor: C.border }}>
          <button onClick={() => setPageState('idle')}
            className="p-2 rounded-lg border hover:opacity-70"
            style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <ArrowLeft size={14} style={{ color: C.textSec }} />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.accentDim }}>
            <span className="text-[16px] font-extrabold" style={{ color: C.accent }}>{o.username[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.textPri, fontFamily: 'var(--font-space-grotesk)' }}>
              {o.storeName ?? o.username}
            </p>
            <p className="text-[11px]" style={{ color: C.textSec }}>eBay - {o.feedbackPercent.toFixed(1)}% feedback</p>
          </div>
          <div className="flex-1" />
          <p className="text-[11px]" style={{ color: C.textHint }}>{timeAgo(result.scannedAt)}</p>
          <button onClick={toggleWatchlist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all"
            style={{
              backgroundColor: onWatchlist ? C.accentDim : C.white,
              borderColor:     onWatchlist ? C.accent : C.border,
              color:           onWatchlist ? C.accent : C.textSec,
            }}>
            <Eye size={13} />
            {onWatchlist ? 'Watching' : 'Watch'}
          </button>
          <button onClick={() => setPageState('idle')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold"
            style={{ backgroundColor: C.accent, color: '#000' }}>
            <Radar size={12} /> New Scan
          </button>
        </div>

        {/* Metrics strip */}
        <div className="flex gap-2 px-4 pb-3 pt-2 border-b w-full"
             style={{ backgroundColor: C.white, borderColor: C.border }}>
          {[
            { label: 'Est. Revenue',    value: `$${fmt(o.estimatedRevenue)}`,       icon: DollarSign, color: C.accent   },
            { label: 'Total Sold',      value: fmtInt(o.totalSold),                 icon: ShoppingBag,color: C.success  },
            { label: 'Active Listings', value: fmtInt(o.activeListings),            icon: List,       color: C.blue     },
            { label: 'Avg Price',       value: `$${o.avgPrice.toFixed(2)}`,         icon: DollarSign, color: C.purple   },
            { label: 'Sell-Through',    value: `${o.sellThroughRate.toFixed(1)}%`,  icon: TrendingUp, color: C.warning  },
            { label: 'Feedback',        value: String(o.feedbackScore),             icon: Star,       color: C.orange   },
            { label: 'Success Rate',    value: `${Math.round(result.products.filter(p => p.soldCount > 0).length / result.products.length * 100)}%`, icon: CheckCircle, color: C.success },
          ].map((m, i) => {
            const Icon = m.icon
            return (
              <div key={i} className="flex flex-col gap-1 p-3 rounded-xl border flex-1"
                   style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="flex items-center gap-1">
                  <Icon size={10} style={{ color: m.color }} />
                  <span className="text-[9px]" style={{ color: C.textSec }}>{m.label}</span>
                </div>
                <span className="text-[15px] font-extrabold" style={{ color: m.color }}>{m.value}</span>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b" style={{ backgroundColor: C.white, borderColor: C.border }}>
          {[
            { label: `Products (${result.products.length})`, icon: Package    },
            { label: `Gap Finder (${result.gaps.length})`,   icon: ScanSearch },
            { label: 'Keywords',                              icon: Key        },
            { label: 'Price Analysis',                        icon: BarChart2  },
          ].map((tab, i) => {
            const Icon = tab.icon; const active = activeTab === i
            return (
              <button key={i} onClick={() => setActiveTab(i)}
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-[13px] font-semibold border-b-2 transition-all"
                style={{ borderBottomColor: active ? C.accent : 'transparent', color: active ? C.accent : C.textSec }}>
                <Icon size={13} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 0 && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-2.5 border-b w-full" style={{ backgroundColor: C.white, borderColor: C.border }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 flex items-center gap-2 h-9 px-2.5 rounded-lg border"
                       style={{ backgroundColor: C.bg, borderColor: C.border }}>
                    <Search size={13} style={{ color: C.textHint }} />
                    <input value={searchProd} onChange={e => setSearchProd(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 text-[13px] outline-none bg-transparent" style={{ color: C.textPri }} />
                  </div>
                  <p className="text-[11px] shrink-0" style={{ color: C.textHint }}>{products.length} products</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                  <span className="text-[9px] font-bold tracking-[0.8px] shrink-0" style={{ color: C.textHint }}>SORT</span>
                  {[['opportunity','AI Score'],['revenue','Revenue'],['sold','Sold'],['price','Price']].map(([v,l]) => (
                    <InlineTab key={v} value={v} label={l} current={sortBy} onTap={setSortBy} />
                  ))}
                  <div className="h-5 w-px mx-1 shrink-0" style={{ backgroundColor: C.border }} />
                  <span className="text-[9px] font-bold tracking-[0.8px] shrink-0" style={{ color: C.textHint }}>TREND</span>
                  {[['all','All'],['rising','Rising'],['stable','Stable'],['fading','Fading']].map(([v,l]) => (
                    <InlineTab key={v} value={v} label={l} current={filterTrend} onTap={setFilterTrend} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="w-9 shrink-0" />
                <div className="w-14 shrink-0" />
                <div className="flex-[5]"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>PRODUCT</p></div>
                <div className="flex-[2] text-center"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>TREND</p></div>
                <div className="flex-[2] text-center"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>SOLD</p></div>
                <div className="flex-[1] text-center"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>WATCH</p></div>
                <div className="flex-[2] text-center"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>PRICE</p></div>
                <div className="flex-[1] text-center"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>SCORE</p></div>
                <div className="flex-[3] text-center"><p className="text-[9px] font-bold tracking-[0.7px]" style={{ color: C.textHint }}>ACTIONS</p></div>
              </div>
              <div className="overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-center py-10 text-[14px]" style={{ color: C.textSec }}>No products match</p>
                ) : products.map(p => (
                  <ProductRow key={p.itemId} product={p}
                    isSaved={savedIds.has(p.itemId)}
                    onSave={() => toggleSave(p)}
                    onCopyTitle={() => {
                      const kws  = p.topKeywords.slice(0,4).join(' ')
                      const full = `${p.title} ${kws}`.trim()
                      copyToClipboard(full.length > 80 ? full.slice(0,80) : full)
                    }}
                    onCalculatePrice={() => setCalcProduct(p)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="p-4">
              {result.gaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <CheckCircle size={44} style={{ color: C.success }} />
                  <p className="text-[15px] font-semibold mt-3 mb-1" style={{ color: C.textPri }}>No major gaps found</p>
                  <p className="text-[13px]" style={{ color: C.textSec }}>This seller covers most high-demand categories</p>
                </div>
              ) : result.gaps.map((g, i) => <GapCard key={i} gap={g} />)}
            </div>
          )}

          {activeTab === 2 && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: C.accentDim }}>
                  <Key size={17} style={{ color: C.accent }} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold" style={{ color: C.textPri, fontFamily: 'var(--font-space-grotesk)' }}>Keyword Radar</p>
                  <p className="text-[11px]" style={{ color: C.textSec }}>Top keywords from this seller's titles</p>
                </div>
                <button onClick={() => copyToClipboard(result.topKeywords.join(', '))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px]"
                  style={{ backgroundColor: C.white, borderColor: C.border, color: C.textSec }}>
                  <Copy size={12} /> Copy all
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5 mb-6">
                {result.topKeywords.map((kw, rank) => {
                  const total      = result.topKeywords.length
                  const opacity    = Math.max(0.1, Math.min(1, 1 - rank * 0.035))
                  const fontSize   = rank < 3 ? 15 : rank < 8 ? 13 : 12
                  const fontWeight = rank < 5 ? 600 : 500
                  const t          = rank / total
                  return (
                    <button key={rank} onClick={() => copyToClipboard(kw)}
                      title={`Copy "${kw}"`}
                      className="px-3.5 py-2 rounded-full border transition-all hover:opacity-80"
                      style={{
                        backgroundColor: `rgba(232,255,176,${1-t*0.8})`,
                        borderColor:     `rgba(92,184,0,${Math.max(0.1, opacity * 0.6)})`,
                        fontSize,
                        fontWeight,
                        color:           `rgba(15,23,42,${Math.max(0.5, opacity)})`,
                      }}>
                      {kw}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border"
                   style={{ backgroundColor: C.accentDim, borderColor: `${C.accent}33`, padding: 18 }}>
                <Zap size={19} style={{ color: C.accent, flexShrink: 0, marginTop: 1 }} />
                <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>
                  Use these keywords in your eBay listing titles to rank higher in search results.
                  The top keywords are what buyers are already searching for in this niche.
                </p>
              </div>
            </div>
          )}

          {activeTab === 3 && <PriceTab products={result.products} />}
        </div>

        {/* Price calc sheet */}
        {calcProduct && <PriceCalcSheet product={calcProduct} onClose={() => setCalcProduct(null)} />}
      </div>
    )
  }

  return null
}
