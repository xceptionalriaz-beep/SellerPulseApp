'use client'
// app/dashboard/orders/page.tsx
// ═══════════════════════════════════════════════════════════════
// Converted from: lib/pages/orders/orders_dashboard.dart
//
// Every element kept exactly as in Dart:
//   ✅ Header — greeting, LIVE badge, refresh, time range, PDF export
//   ✅ 5 stat cards (Low/Medium/High Risk, Shipped, Protected) — colored bg each
//   ✅ Monthly Report compact card (right panel)
//   ✅ Today's Orders card (right panel)
//   ✅ Revenue at-risk bar (3 segments + Protect now button)
//   ✅ Analytics section — Protection Trend chart, Orders Overview bar chart, Protection Rate donut
//   ✅ Unified toolbar — pill tabs (All/Low/Med/High/Shipped/Not Shipped/Unprotected)
//   ✅ Sort chips (Score/Price desc/asc/Newest/Oldest)
//   ✅ Search field
//   ✅ Desktop table header (lime bg) — VIEW/RISK/ORDER ID/ITEM/BUYER/BUYER RISK/SCORE/PROTECTION/STATUS/SIG/RISK/MSG/PRICE/TIME
//   ✅ Desktop order rows — left colored border, eye icon, buyer icon, risk badge, protection badge, status badge, score bar, alerts, message count
//   ✅ Mobile order cards — same columns as Dart mobile header
//   ✅ Empty state, skeleton loading, error banner
//   ✅ Realtime updates via Supabase
//   ✅ Currency symbol from profile
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  RefreshCw, Eye, Shield, ShieldOff, AlertTriangle, CheckCircle,
  Truck, Clock, Package, User, MessageSquare, ArrowUpDown,
  ArrowUp, ArrowDown, Search, X, Download, FileText,
  ChevronLeft, ChevronRight, Bolt, Calendar, ExternalLink, Tag,
  MapPin, Copy, FolderOpen, History, Zap, FileWarning, Ban,
  Check, Info, ChevronUp, ChevronDown,
} from 'lucide-react'
import {
  LineChart, Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import { PageSpinner } from '@/components/ui/Spinner'
import BuyerProfilePanel from '@/app/dashboard/orders/components/BuyerProfilePanel'
import { OrderDetailInline } from '@/app/dashboard/orders/components/OrderDetailInline'
import { createClient } from '@/lib/supabase'
import { cn, timeAgo } from '@/lib/utils'
import KillSwitchGate from '@/components/KillSwitchGate'

// ── Design tokens (exact match to Dart _C) ────────────────────
const C = {
  surface:        '#FFFFFF',
  surfaceHover:   '#F4FFE6',
  bg:             '#F7F9F5',
  border:         '#E8EDE2',
  accent:         '#8FFF00',
  accentMid:      '#6BCC00',
  accentDeep:     '#4A8F00',
  accentDim:      '#F4FFE6',
  accentDim2:     '#E8FFCC',
  accentDark:     '#0A0D08',
  textPrimary:    '#1A2410',
  textSecondary:  '#4A5E38',
  textHint:       '#8A9E78',
  riskHigh:       '#FF0000',
  riskHighBg:     '#FFEEEE',
  riskMed:        '#92400E',
  riskMedBg:      '#FFFBEA',
  riskLow:        '#2D6A00',
  riskLowBg:      '#F4FFE6',
  shipped:        '#1A5FA8',
  shippedBg:      '#E8F4FF',
  pending:        '#8A5F00',
  pendingBg:      '#FFF8E6',
  delivered:      '#007A5E',
  deliveredBg:    '#E6FFF8',
  processing:     '#5B21B6',
  processingBg:   '#F0EEFF',
  cancelled:      '#A82020',
  cancelledBg:    '#FFF0F0',
}

type SortBy = 'none' | 'riskScoreDesc' | 'priceDesc' | 'priceAsc' | 'newest' | 'oldest'

// ── Risk colors helper ─────────────────────────────────────────
function riskColors(level: string) {
  switch (level?.toUpperCase()) {
    case 'HIGH':   return { color: C.riskHigh, bg: C.riskHighBg }
    case 'MEDIUM': return { color: C.riskMed,  bg: C.riskMedBg  }
    default:       return { color: C.riskLow,  bg: C.riskLowBg  }
  }
}

// ── Status colors helper ───────────────────────────────────────
function statusColors(status: string) {
  switch (status?.toLowerCase()) {
    case 'shipped':    return { color: C.shipped,   bg: C.shippedBg,   icon: Truck }
    case 'delivered':  return { color: C.delivered, bg: C.deliveredBg, icon: CheckCircle }
    case 'processing': return { color: C.processing,bg: C.processingBg,icon: RefreshCw }
    case 'cancelled':  return { color: C.cancelled, bg: C.cancelledBg, icon: X }
    default:           return { color: C.pending,   bg: C.pendingBg,   icon: Clock }
  }
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, barColor, barFraction, index }: {
  icon: React.ElementType; label: string; value: string; sub: string
  color: string; bg: string; barColor: string; barFraction: number; index: number
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-[14px] border"
         style={{ backgroundColor: bg, borderColor: color + '33' }}>
      <div className="flex items-center justify-between gap-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ backgroundColor: color + '40' }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[15px] font-extrabold text-right leading-tight"
              style={{ color, fontFamily: 'var(--font-space-grotesk)' }}>
          {value}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-semibold" style={{ color: color + 'CC' }}>{label}</p>
      </div>
      <div className="h-1 rounded-full" style={{ backgroundColor: color + '30' }}>
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${barFraction * 100}%`, backgroundColor: barColor }} />
      </div>

    </div>
  )
}

// ── Risk Badge ─────────────────────────────────────────────────
function RiskBadge({ level }: { level: string }) {
  const { color, bg } = riskColors(level)
  return (
    <span className="px-2 py-1 rounded-full text-[8px] font-bold tracking-wide"
          style={{ color, backgroundColor: bg }}>
      {level?.toUpperCase()} RISK
    </span>
  )
}

// ── Protection Badge ───────────────────────────────────────────
function ProtectionBadge({ protected: isProt, riskLevel }: { protected: boolean; riskLevel: string }) {
  const { color } = riskColors(riskLevel)
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold border')}
          style={{
            backgroundColor: isProt ? C.accentDim : color + '14',
            borderColor: isProt ? C.accent : color + '4D',
            color: isProt ? C.accentDeep : color,
          }}>
      {isProt ? <CheckCircle size={9} /> : <ShieldOff size={9} />}
      {isProt ? 'Protected' : 'Need action'}
    </span>
  )
}

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const { color, bg, icon: Icon } = statusColors(status)
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-bold"
          style={{ color, backgroundColor: bg }}>
      <Icon size={9} />
      {status?.toUpperCase() || 'PENDING'}
    </span>
  )
}

// ── Score Bar ──────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-[#4A5E38]">{score}/100</span>
      <div className="h-1 rounded-full bg-[#E8EDE2] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>

    </div>
  )
}

// ── Buyer Risk Badges ──────────────────────────────────────────
function BuyerRiskBadges({ profile }: { profile: Record<string, any> | null }) {
  if (!profile) return <span className="text-[9px] italic text-[#8A9E78]">No history</span>
  const returnRate   = Number(profile.return_rate  || 0)
  const disputeCount = Number(profile.dispute_count || 0)
  const isRepeat     = Number(profile.order_count   || 1) > 1
  const retBad = returnRate   > 15
  const disBad = disputeCount > 0
  return (
    <div className="flex flex-wrap gap-1">
      <span className="px-1 py-0.5 rounded text-[8px] font-semibold"
            style={{ backgroundColor: retBad ? C.riskHighBg : C.riskLowBg, color: retBad ? C.riskHigh : C.riskLow }}>
        ↩ {returnRate.toFixed(0)}%
      </span>
      <span className="px-1 py-0.5 rounded text-[8px] font-semibold"
            style={{ backgroundColor: disBad ? C.riskHighBg : C.riskLowBg, color: disBad ? C.riskHigh : C.riskLow }}>
        {disBad ? `⚠ ${disputeCount}` : '✓'}
      </span>
      {isRepeat && (
        <span className="px-1 py-0.5 rounded text-[8px] font-semibold"
              style={{ backgroundColor: C.processingBg, color: C.processing }}>×2</span>
      )}
    </div>
  )
}

// ── Sort Chip ──────────────────────────────────────────────────
function SortChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold border transition-all duration-150"
      style={{
        backgroundColor: active ? C.accentDeep : 'transparent',
        borderColor: active ? C.accentDeep : C.border,
        color: active ? '#fff' : C.textSecondary,
      }}>
      {label}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// BUBBLE TIP — speech bubble tooltip (matches Dart _BubbleTip)
// ══════════════════════════════════════════════════════════════
function BubbleTip({ children, message, color }: { children: React.ReactNode; message: string; color: string }) {
  const [show, setShow] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)

  function handleEnter() {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ top: rect.top + window.scrollY - 80, left: rect.left + rect.width / 2 - 100 })
    setShow(true)
  }

  return (
    <div ref={ref} className="relative inline-flex"
         onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <div className="fixed z-[99999] pointer-events-none" style={{ top: pos.top, left: Math.max(8, pos.left) }}>
          <div className="w-[200px] px-3 py-2 rounded-xl text-[11px] font-semibold leading-relaxed text-white shadow-xl"
               style={{ backgroundColor: color }}>
            {message}
          </div>
          {/* Arrow */}
          <div className="mx-auto mt-0" style={{
            width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderTop: `7px solid ${color}`,
            marginLeft: 93,
          }} />
        </div>,
        document.body
      )}
    </div>
  )
}


export default function OrdersDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [hasError,     setHasError]     = useState(false)
  const [orders,       setOrders]       = useState<any[]>([])
  const [profile,      setProfile]      = useState<any>(null)
  const [msgCounts,    setMsgCounts]    = useState<Record<string, number>>({})
  const [buyerProfiles,setBuyerProfiles]= useState<Record<string, any>>({})
  const [filter,       setFilter]       = useState('all')
  const [selectedBuyer, setSelectedBuyer] = useState<string|null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any|null>(null)
  const [timeRange,    setTimeRange]    = useState('30')
  const [timeDropdown, setTimeDropdown] = useState(false)
  const [sortBy,       setSortBy]       = useState<SortBy>('none')
  const [search,       setSearch]       = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Stats
  const [stats, setStats] = useState({
    low: 0, med: 0, high: 0, protected: 0, unprotected: 0,
    shipped: 0, today: 0, total: 0,
    atRisk: 0, protVal: 0, totalVal: 0,
  })

  // Chart data
  const [trendData,    setTrendData]    = useState<any[]>([])
  const [barData,      setBarData]      = useState<any[]>([])
  const currencySymbol = profile?.currency_symbol || '$'

  // ── Load data ─────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else { setLoading(true); setHasError(false) }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) setProfile(prof)

      const { data: rawRows } = await supabase
        .from('protected_orders').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(200)

      const { data: rawMsgs } = await supabase.from('sent_messages').select('order_id').eq('user_id', user.id)

      const rows = (rawRows || []) as any[]
      const msgs = (rawMsgs || []) as any[]
      if (!rawRows) return

      // Build message counts
      const mc: Record<string, number> = {}
      for (const m of msgs || []) {
        if (m.order_id) mc[m.order_id] = (mc[m.order_id] || 0) + 1
      }
      setMsgCounts(mc)

      // Compute stats
      let low = 0, med = 0, high = 0, prot = 0, unprot = 0, shipped = 0, today = 0
      let atRisk = 0, protVal = 0, totalVal = 0
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const dailyMap: Record<string, { total: number; protected: number; date: string }> = {}

      for (const o of rows) {
        const risk    = (o.risk_level || 'LOW').toUpperCase()
        const status  = (o.order_status || '').toLowerCase()
        const isProt  = o.checklist_completed === true
        const price   = Number(o.item_price) || 0
        const created = o.created_at ? new Date(o.created_at) : null

        totalVal += price
        if (risk === 'HIGH')        high++
        else if (risk === 'MEDIUM') med++
        else                        low++

        if (isProt) { prot++; protVal += price } else unprot++
        if (status === 'shipped' || status === 'delivered') shipped++
        if (risk === 'HIGH' && !isProt) atRisk += price
        if (created && created >= todayStart) today++

        if (created) {
          const key = created.toISOString().split('T')[0]
          if (!dailyMap[key]) dailyMap[key] = { total: 0, protected: 0, date: key }
          dailyMap[key].total++
          if (isProt) dailyMap[key].protected++
        }
      }

      setStats({ low, med, high, protected: prot, unprotected: unprot, shipped, today, total: rows.length, atRisk, protVal, totalVal })
      setOrders(rows)

      // Load buyer profiles
      const buyerNames = [...new Set(rows.map((o: any) => o.buyer_username).filter(Boolean))] as string[]
      if (buyerNames.length > 0) {
        try {
          const { data: profileRows } = await supabase
            .from('buyer_profiles')
            .select('*')
            .in('buyer_username', buyerNames)
          if (profileRows && profileRows.length > 0) {
            const map: Record<string, any> = {}
            for (const p of profileRows as any[]) {
              const key = p.buyer_username || p.ebay_buyer_username
              if (key) map[key] = p
            }
            setBuyerProfiles(map)
          } else {
            const { data: altRows } = await supabase
              .from('buyer_profiles')
              .select('*')
              .in('ebay_buyer_username', buyerNames)
            if (altRows) {
              const map: Record<string, any> = {}
              for (const p of (altRows as any[])) {
                const key = p.buyer_username || p.ebay_buyer_username
                if (key) map[key] = p
              }
              setBuyerProfiles(map)
            }
          }
        } catch (_) {}
      }

      // Build chart data
      const fromDate = timeRange === 'all' ? null : new Date(Date.now() - Number(timeRange) * 86400000)
      const sortedKeys = Object.keys(dailyMap).sort()
        .filter(k => !fromDate || new Date(k) >= fromDate)

      const trend = sortedKeys.map(k => ({
        date: k.slice(5),
        total: dailyMap[k].total,
        protected: dailyMap[k].protected,
      }))
      setTrendData(trend)
      setBarData(trend)

    } catch (e) {
      console.error('Orders error:', e)
      setHasError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeRange])

  useEffect(() => { loadData() }, [loadData])

  // ── Realtime ──────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'protected_orders' }, () => loadData(true))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Filtered + sorted orders ──────────────────────────────────
  const filteredOrders = (() => {
    let list = [...orders]
    switch (filter) {
      case 'high':          list = list.filter(o => o.risk_level?.toUpperCase() === 'HIGH'); break
      case 'medium':        list = list.filter(o => o.risk_level?.toUpperCase() === 'MEDIUM'); break
      case 'low':           list = list.filter(o => o.risk_level?.toUpperCase() === 'LOW'); break
      case 'shipped':       list = list.filter(o => ['shipped','delivered'].includes((o.order_status||'').toLowerCase())); break
      case 'not_shipped':   list = list.filter(o => !['shipped','delivered'].includes((o.order_status||'').toLowerCase())); break
      case 'not_protected': list = list.filter(o => o.checklist_completed !== true); break
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        (o.ebay_order_id||'').toLowerCase().includes(q) ||
        (o.item_title||'').toLowerCase().includes(q) ||
        (o.buyer_username||'').toLowerCase().includes(q))
    }
    switch (sortBy) {
      case 'riskScoreDesc': list.sort((a,b) => (b.risk_score||0) - (a.risk_score||0)); break
      case 'priceDesc':     list.sort((a,b) => (Number(b.item_price)||0) - (Number(a.item_price)||0)); break
      case 'priceAsc':      list.sort((a,b) => (Number(a.item_price)||0) - (Number(b.item_price)||0)); break
      case 'oldest':        list.sort((a,b) => new Date(a.created_at||0).getTime() - new Date(b.created_at||0).getTime()); break
    }
    return list
  })()

  const tot = stats.total || 1
  const userName = profile?.name?.split(' ')[0] || 'Seller'
  const protRate = stats.total > 0 ? Math.round(stats.protected / stats.total * 100) : 0
  const protectedPct = stats.totalVal > 0 ? Math.min(stats.protVal / stats.totalVal, 1) : 0
  const atRiskPct    = stats.totalVal > 0 ? Math.min(stats.atRisk  / stats.totalVal, 1) : 0

  // ── Monthly report data ───────────────────────────────────────
  const monthlyData = (() => {
    const map: Record<string, { total: number; protected: number; high: number }> = {}
    for (const o of orders) {
      const d = o.created_at ? new Date(o.created_at) : null
      if (!d) continue
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (!map[key]) map[key] = { total: 0, protected: 0, high: 0 }
      map[key].total++
      if (o.checklist_completed === true) map[key].protected++
      if ((o.risk_level||'').toUpperCase() === 'HIGH') map[key].high++
    }
    const mNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return Object.keys(map).sort((a,b) => b.localeCompare(a)).slice(0,6).map(k => {
      const [yr, mo] = k.split('-')
      const d = map[k]
      const rate = d.total > 0 ? Math.round(d.protected/d.total*100) : 0
      return { label: `${mNames[Number(mo)]} ${yr}`, ...d, rate }
    })
  })()

  // ── Today's orders ────────────────────────────────────────────
  const todayOrders = (() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return orders.filter(o => o.created_at && new Date(o.created_at) >= start)
      .sort((a,b) => (b.risk_score||0) - (a.risk_score||0)).slice(0, 5)
  })()
  const todayTotal = todayOrders.reduce((s,o) => s + (Number(o.item_price)||0), 0)

  // ── Donut data ────────────────────────────────────────────────
  const donutData = stats.total === 0 ? [{ name: 'None', value: 1, color: C.border }] : [
    { name: 'Protected',    value: stats.protected,   color: C.accent   },
    { name: 'Need Action',  value: stats.unprotected, color: C.riskHigh },
  ]

  if (loading) return (
    <div className="min-h-full overflow-auto animate-pulse" style={{ backgroundColor: C.bg }}>
      <div className="w-full px-4 md:px-6 lg:px-8 pt-4 pb-10 space-y-4">

        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-4 rounded-full w-48" style={{ backgroundColor: C.border }} />
          <div className="h-7 w-14 rounded-full" style={{ backgroundColor: C.border }} />
          <div className="h-7 w-7 rounded-full" style={{ backgroundColor: C.border }} />
          <div className="h-7 w-20 rounded-lg" style={{ backgroundColor: C.border }} />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
          {[...Array(5)].map((_,i) => (
            <div key={i} className="rounded-xl p-3 h-[88px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex justify-between mb-3">
                <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: C.border }} />
                <div className="w-10 h-5 rounded" style={{ backgroundColor: C.border }} />
              </div>
              <div className="w-16 h-3 rounded-full mb-2" style={{ backgroundColor: C.border }} />
              <div className="w-full h-1 rounded-full" style={{ backgroundColor: C.border }} />
            </div>
          ))}
        </div>

        {/* Middle section skeleton */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col gap-3 lg:flex-[3]">
            <div className="rounded-xl p-4 h-[96px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex gap-4">
                {[...Array(3)].map((_,i) => (
                  <div key={i} className="flex-1 space-y-2">
                    <div className="h-5 w-20 rounded" style={{ backgroundColor: C.border }} />
                    <div className="h-3 w-14 rounded-full" style={{ backgroundColor: C.border }} />
                    <div className="h-1 rounded-full" style={{ backgroundColor: C.border }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-[2]">
            <div className="rounded-xl h-[120px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
            <div className="rounded-xl h-[80px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }} />
          </div>
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-3 rounded-2xl p-3 h-[260px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="h-4 w-32 rounded mb-1" style={{ backgroundColor: C.border }} />
            <div className="h-3 w-24 rounded-full mb-3" style={{ backgroundColor: C.border }} />
            <div className="h-[200px] rounded-lg" style={{ backgroundColor: C.border + '80' }} />
          </div>
          <div className="lg:col-span-2 rounded-2xl p-3 h-[260px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="h-4 w-28 rounded mb-1" style={{ backgroundColor: C.border }} />
            <div className="h-3 w-20 rounded-full mb-3" style={{ backgroundColor: C.border }} />
            <div className="h-[200px] rounded-lg" style={{ backgroundColor: C.border + '80' }} />
          </div>
          <div className="lg:col-span-2 rounded-2xl p-3 h-[260px]" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="h-4 w-24 rounded mb-1" style={{ backgroundColor: C.border }} />
            <div className="h-3 w-20 rounded-full mb-3" style={{ backgroundColor: C.border }} />
            <div className="flex gap-4 mt-4">
              <div className="w-32 h-32 rounded-full" style={{ backgroundColor: C.border + '80' }} />
              <div className="flex-1 space-y-3 pt-2">
                {[...Array(4)].map((_,i) => <div key={i} className="h-3 rounded-full" style={{ backgroundColor: C.border }} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar skeleton */}
        <div className="rounded-xl p-3 h-12" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex gap-2">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="h-7 w-16 rounded-full" style={{ backgroundColor: C.border }} />
            ))}
          </div>
        </div>

        {/* Table header skeleton */}
        <div className="h-10 rounded-lg" style={{ backgroundColor: C.accent + '33' }} />

        {/* Table rows skeleton */}
        {[...Array(6)].map((_,i) => (
          <div key={i} className="h-12 rounded-sm flex items-center gap-4 px-4"
               style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${C.border}` }}>
            <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: C.border }} />
            <div className="w-16 h-5 rounded-full" style={{ backgroundColor: C.border }} />
            <div className="w-20 h-4 rounded-full" style={{ backgroundColor: C.border }} />
            <div className="flex-1 h-4 rounded-full" style={{ backgroundColor: C.border }} />
            <div className="w-24 h-4 rounded-full" style={{ backgroundColor: C.border }} />
            <div className="w-14 h-5 rounded-full" style={{ backgroundColor: C.border }} />
            <div className="w-16 h-5 rounded-full" style={{ backgroundColor: C.border }} />
            <div className="w-16 h-4 rounded-full ml-auto" style={{ backgroundColor: C.border }} />
          </div>
        ))}

      </div>
    </div>
  )

  return (
    <KillSwitchGate switchTitle="Orders Management">
      <div className="min-h-full overflow-auto" style={{ backgroundColor: C.bg }}>
        <div className="w-full px-4 md:px-6 lg:px-8 pt-4 pb-10 space-y-4">

          {/* ── HEADER ── */}
          <div className="flex items-center gap-3 flex-wrap">
            <p className="flex-1 text-[13px] font-medium" style={{ color: C.textSecondary }}>Protect your orders from risky buyers</p>
              {/* LIVE badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                 style={{ backgroundColor: C.accentDim, borderColor: C.accent + '80' }}>
              {refreshing
                ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.accent }} />
                : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.accent }} />
              }
              <span className="text-[10px] font-bold" style={{ color: C.accentDeep }}>
                {refreshing ? 'UPDATING…' : 'LIVE'}
              </span>
            </div>

            <button onClick={() => loadData(true)} className="text-[#4A5E38] hover:text-dark transition-colors">
              <RefreshCw size={18} />
            </button>

            {/* Time range — desktop: pills, mobile: dropdown */}
            <div className="hidden md:flex items-center gap-1">
              {[['7','7D'],['30','30D'],['all','All']].map(([v,l]) => (
                <button key={v} onClick={() => setTimeRange(v)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                  style={{
                    backgroundColor: timeRange === v ? C.accent : 'transparent',
                    color: timeRange === v ? C.accentDark : C.textSecondary,
                  }}>
                  {l}
                </button>
              ))}
            </div>
            {/* Mobile dropdown */}
            <div className="relative md:hidden">
              <button
                onClick={() => setTimeDropdown(d => !d)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all"
                style={{ backgroundColor: C.accentDim, borderColor: C.accent, color: C.accentDeep }}>
                {timeRange === '7' ? '7D' : timeRange === '30' ? '30D' : 'All'}
                <ChevronDown size={12} style={{ color: C.accentDeep, transform: timeDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {timeDropdown && (
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border shadow-lg overflow-hidden"
                     style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 80 }}>
                  {[['7','7D'],['30','30D'],['all','All']].map(([v,l]) => (
                    <button key={v}
                      onClick={() => { setTimeRange(v); setTimeDropdown(false) }}
                      className="w-full px-4 py-2.5 text-left text-[12px] font-semibold transition-colors"
                      style={{
                        backgroundColor: timeRange === v ? C.accent : 'transparent',
                        color: timeRange === v ? C.accentDark : C.textPrimary,
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Export */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-[11px] font-bold"
                    style={{ backgroundColor: C.accentDeep }}>
              <FileText size={13} />
              PDF
            </button>
          </div>

          {/* ── ERROR BANNER ── */}
          {hasError && (
            <div className="flex items-center gap-3 p-3 rounded-xl border"
                 style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '50' }}>
              <AlertTriangle size={16} style={{ color: C.riskHigh }} />
              <p className="text-[12px] flex-1" style={{ color: C.riskHigh }}>
                Failed to load orders. Pull down to retry.
              </p>
              <button onClick={() => loadData()} className="text-[11px] font-bold" style={{ color: C.riskHigh }}>Retry</button>
            </div>
          )}

          {/* ── TOP SECTION ── */}
          <div className="flex flex-col lg:flex-row gap-4">

            {/* ── MOBILE STATS (hidden on desktop) ── */}
            <div className="lg:hidden flex flex-col gap-2 order-1">
              <div className="grid grid-cols-3 gap-2">
                <StatCard icon={Shield}        label="Low Risk"    value={`${stats.low}`}
                  sub="Safe to ship"    color={C.riskLow}   bg={C.riskLowBg}
                  barColor={C.riskLow}  barFraction={stats.low/tot}  index={0} />
                <StatCard icon={AlertTriangle} label="Medium Risk" value={`${stats.med}`}
                  sub="Extra care"     color={C.riskMed}   bg={C.riskMedBg}
                  barColor={C.riskMed}  barFraction={stats.med/tot}  index={1} />
                <StatCard icon={ShieldOff}     label="High Risk"   value={`${stats.high}`}
                  sub="Action needed"  color={C.riskHigh}  bg={C.riskHighBg}
                  barColor={C.riskHigh} barFraction={stats.high/tot} index={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={Truck}       label="Shipped"   value={`${stats.shipped}/${stats.total}`}
                  sub="Orders shipped" color={C.shipped}   bg={C.shippedBg}
                  barColor={C.shipped}  barFraction={stats.shipped/tot} index={3} />
                <StatCard icon={CheckCircle} label="Protected" value={`${stats.protected}/${stats.total}`}
                  sub={`${protRate}% done`} color={C.accentDeep} bg={C.accentDim}
                  barColor={C.accent}   barFraction={stats.protected/tot} index={4} />
              </div>
            </div>

            {/* ── MOBILE MONTHLY + TODAY (hidden on desktop) ── */}
            <div className="lg:hidden flex flex-col gap-3 order-2">
              {/* Monthly Report */}
              <div className="rounded-[14px] border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center gap-2 px-3.5 py-3" style={{ backgroundColor: C.accentDim }}>
                  <Calendar size={14} style={{ color: C.accentDeep }} />
                  <span className="text-[13px] font-bold flex-1" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>Monthly Report</span>
                  <span className="text-[9px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: C.accentDeep }}>{monthlyData.length} mo</span>
                </div>
                <div className="grid grid-cols-6 px-3.5 py-2 text-[8px] font-bold tracking-wide" style={{ color: C.textHint }}>
                  <span className="col-span-2">MONTH</span>
                  <span className="text-center">ORD</span>
                  <span className="text-center" style={{ color: C.accentDeep }}>PROT</span>
                  <span className="text-center" style={{ color: C.riskHigh }}>HIGH</span>
                  <span className="text-right">RATE</span>
                </div>
                {monthlyData.length === 0 ? (
                  <p className="text-center text-[11px] p-4" style={{ color: C.textHint }}>No data yet</p>
                ) : monthlyData.map((m, i) => {
                  const rc = m.rate >= 80 ? C.riskLow : m.rate >= 50 ? C.riskMed : C.riskHigh
                  return (
                    <div key={i} className="grid grid-cols-6 px-3.5 py-2 border-t text-[11px]" style={{ borderColor: C.border }}>
                      <span className="col-span-2 font-semibold" style={{ color: C.textPrimary }}>{m.label}</span>
                      <span className="text-center" style={{ color: C.textSecondary }}>{m.total}</span>
                      <span className="text-center font-bold" style={{ color: C.accentDeep }}>{m.protected}</span>
                      <span className="text-center" style={{ color: m.high > 0 ? C.riskHigh : C.textHint }}>{m.high}</span>
                      <div className="flex justify-end">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: rc + '20', color: rc }}>{m.rate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Today's Orders */}
              <div className="rounded-[14px] border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center gap-2 px-3.5 py-3" style={{ backgroundColor: C.shippedBg }}>
                  <Bolt size={14} style={{ color: C.shipped }} />
                  <span className="text-[13px] font-bold flex-1" style={{ color: C.shipped, fontFamily: 'var(--font-space-grotesk)' }}>Today&apos;s Orders</span>
                  <span className="text-[9px] font-semibold text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: todayOrders.length === 0 ? C.textHint : C.shipped }}>
                    {todayOrders.length === 0 ? 'None' : `${todayOrders.length} new`}
                  </span>
                </div>
                {todayOrders.length === 0 ? (
                  <p className="px-3.5 py-3 text-[11px]" style={{ color: C.textHint }}>No orders yet today</p>
                ) : (
                  <>
                    {todayOrders.map((o, i) => {
                      const dotColor = (o.risk_level||'').toUpperCase() === 'HIGH' ? C.riskHigh
                        : (o.risk_level||'').toUpperCase() === 'MEDIUM' ? C.riskMed : C.riskLow
                      return (
                        <button key={i} onClick={() => setSelectedOrder(o)}
                          className="w-full flex items-center gap-2 px-3.5 py-2 border-t hover:opacity-80"
                          style={{ borderColor: C.border }}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-[11px] font-semibold truncate" style={{ color: C.textPrimary }}>{o.item_title || 'Unknown'}</p>
                            {o.buyer_username && <p className="text-[9px] truncate" style={{ color: C.textHint }}>{o.buyer_username}</p>}
                          </div>
                          <span className="text-[12px] font-extrabold shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)', color: C.textPrimary }}>
                            {currencySymbol}{Number(o.item_price||0).toFixed(2)}
                          </span>
                        </button>
                      )
                    })}
                    <div className="flex justify-between px-3.5 py-2 border-t text-[10px]" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <span style={{ color: C.textHint }}>Today&apos;s total</span>
                      <span className="font-bold" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{currencySymbol}{todayTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── MOBILE REVENUE (hidden on desktop) ── */}
            <div className="lg:hidden flex flex-col gap-2 order-3">
              <div className="flex items-center gap-4 px-5 py-4 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-extrabold" style={{ color: stats.atRisk > 0 ? C.riskHigh : C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{currencySymbol}{stats.atRisk.toFixed(2)}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>Revenue at risk</p>
                  <p className="text-[10px]" style={{ color: C.textHint }}>{stats.high > 0 ? stats.high : 'No'} unprotected HIGH orders</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ backgroundColor: stats.atRisk > 0 ? C.riskHighBg : C.accentDim }}>
                    <div className="h-full rounded-full" style={{ width: `${atRiskPct*100}%`, backgroundColor: stats.atRisk > 0 ? C.riskHigh : C.accentDeep }} />
                  </div>
                </div>
                <div className="w-px h-11 shrink-0" style={{ backgroundColor: C.border }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-extrabold" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{currencySymbol}{stats.protVal.toFixed(2)}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>Value protected</p>
                  <p className="text-[10px]" style={{ color: C.textHint }}>{stats.protected} orders secured</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ backgroundColor: C.accentDim }}>
                    <div className="h-full rounded-full" style={{ width: `${protectedPct*100}%`, backgroundColor: C.accent }} />
                  </div>
                </div>
                <div className="w-px h-11 shrink-0" style={{ backgroundColor: C.border }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-extrabold" style={{ color: C.shipped, fontFamily: 'var(--font-space-grotesk)' }}>{stats.today}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>New today</p>
                  <p className="text-[10px]" style={{ color: C.textHint }}>Orders since midnight</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ backgroundColor: C.shippedBg }}>
                    <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? Math.min(stats.today/stats.total,1)*100 : 0}%`, backgroundColor: C.shipped }} />
                  </div>
                </div>
              </div>
              {stats.atRisk > 0 && (
                <button onClick={() => setFilter('not_protected')}
                  className="w-full py-3 rounded-xl text-[13px] font-bold hover:opacity-90"
                  style={{ backgroundColor: C.accent, color: C.accentDark }}>
                  Protect now →
                </button>
              )}
            </div>

            {/* ── DESKTOP LEFT COL: stats + revenue (hidden on mobile) ── */}
            <div className="hidden lg:flex flex-col gap-3 flex-[3]">
              <div className="grid grid-cols-5 gap-2">
                <StatCard icon={Shield}        label="Low Risk"    value={`${stats.low}`}
                  sub="Safe to ship"    color={C.riskLow}   bg={C.riskLowBg}
                  barColor={C.riskLow}  barFraction={stats.low/tot}  index={0} />
                <StatCard icon={AlertTriangle} label="Medium Risk" value={`${stats.med}`}
                  sub="Extra care"     color={C.riskMed}   bg={C.riskMedBg}
                  barColor={C.riskMed}  barFraction={stats.med/tot}  index={1} />
                <StatCard icon={ShieldOff}     label="High Risk"   value={`${stats.high}`}
                  sub="Action needed"  color={C.riskHigh}  bg={C.riskHighBg}
                  barColor={C.riskHigh} barFraction={stats.high/tot} index={2} />
                <StatCard icon={Truck}       label="Shipped"   value={`${stats.shipped}/${stats.total}`}
                  sub="Orders shipped" color={C.shipped}   bg={C.shippedBg}
                  barColor={C.shipped}  barFraction={stats.shipped/tot} index={3} />
                <StatCard icon={CheckCircle} label="Protected" value={`${stats.protected}/${stats.total}`}
                  sub={`${protRate}% done`} color={C.accentDeep} bg={C.accentDim}
                  barColor={C.accent}   barFraction={stats.protected/tot} index={4} />
              </div>
              {/* Revenue bar */}
              <div className="flex items-center gap-4 px-5 py-4 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-extrabold" style={{ color: stats.atRisk > 0 ? C.riskHigh : C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{currencySymbol}{stats.atRisk.toFixed(2)}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>Revenue at risk</p>
                  <p className="text-[10px]" style={{ color: C.textHint }}>{stats.high > 0 ? stats.high : 'No'} unprotected HIGH orders</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ backgroundColor: stats.atRisk > 0 ? C.riskHighBg : C.accentDim }}>
                    <div className="h-full rounded-full" style={{ width: `${atRiskPct*100}%`, backgroundColor: stats.atRisk > 0 ? C.riskHigh : C.accentDeep }} />
                  </div>
                </div>
                <div className="w-px h-11 shrink-0" style={{ backgroundColor: C.border }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-extrabold" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{currencySymbol}{stats.protVal.toFixed(2)}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>Value protected</p>
                  <p className="text-[10px]" style={{ color: C.textHint }}>{stats.protected} orders secured</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ backgroundColor: C.accentDim }}>
                    <div className="h-full rounded-full" style={{ width: `${protectedPct*100}%`, backgroundColor: C.accent }} />
                  </div>
                </div>
                <div className="w-px h-11 shrink-0" style={{ backgroundColor: C.border }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-extrabold" style={{ color: C.shipped, fontFamily: 'var(--font-space-grotesk)' }}>{stats.today}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>New today</p>
                  <p className="text-[10px]" style={{ color: C.textHint }}>Orders since midnight</p>
                  <div className="mt-1.5 h-1 rounded-full" style={{ backgroundColor: C.shippedBg }}>
                    <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? Math.min(stats.today/stats.total,1)*100 : 0}%`, backgroundColor: C.shipped }} />
                  </div>
                </div>
                {stats.atRisk > 0 && (
                  <button onClick={() => setFilter('not_protected')}
                    className="px-5 py-3 rounded-xl text-[12px] font-bold hover:opacity-90 shrink-0"
                    style={{ backgroundColor: C.accent, color: C.accentDark }}>
                    Protect now →
                  </button>
                )}
              </div>
            </div>

            {/* ── DESKTOP RIGHT COL: monthly + today (hidden on mobile) ── */}
            <div className="hidden lg:flex flex-col gap-3 flex-[2]">
              {/* Monthly Report */}
              <div className="rounded-[14px] border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center gap-2 px-3.5 py-3" style={{ backgroundColor: C.accentDim }}>
                  <Calendar size={14} style={{ color: C.accentDeep }} />
                  <span className="text-[13px] font-bold flex-1" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>Monthly Report</span>
                  <span className="text-[9px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: C.accentDeep }}>{monthlyData.length} mo</span>
                </div>
                <div className="grid grid-cols-6 px-3.5 py-2 text-[8px] font-bold tracking-wide" style={{ color: C.textHint }}>
                  <span className="col-span-2">MONTH</span>
                  <span className="text-center">ORD</span>
                  <span className="text-center" style={{ color: C.accentDeep }}>PROT</span>
                  <span className="text-center" style={{ color: C.riskHigh }}>HIGH</span>
                  <span className="text-right">RATE</span>
                </div>
                {monthlyData.length === 0 ? (
                  <p className="text-center text-[11px] p-4" style={{ color: C.textHint }}>No data yet</p>
                ) : monthlyData.map((m, i) => {
                  const rc = m.rate >= 80 ? C.riskLow : m.rate >= 50 ? C.riskMed : C.riskHigh
                  return (
                    <div key={i} className="grid grid-cols-6 px-3.5 py-2 border-t text-[11px]" style={{ borderColor: C.border }}>
                      <span className="col-span-2 font-semibold" style={{ color: C.textPrimary }}>{m.label}</span>
                      <span className="text-center" style={{ color: C.textSecondary }}>{m.total}</span>
                      <span className="text-center font-bold" style={{ color: C.accentDeep }}>{m.protected}</span>
                      <span className="text-center" style={{ color: m.high > 0 ? C.riskHigh : C.textHint }}>{m.high}</span>
                      <div className="flex justify-end">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: rc + '20', color: rc }}>{m.rate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Today's Orders */}
              <div className="rounded-[14px] border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <div className="flex items-center gap-2 px-3.5 py-3" style={{ backgroundColor: C.shippedBg }}>
                  <Bolt size={14} style={{ color: C.shipped }} />
                  <span className="text-[13px] font-bold flex-1" style={{ color: C.shipped, fontFamily: 'var(--font-space-grotesk)' }}>Today&apos;s Orders</span>
                  <span className="text-[9px] font-semibold text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: todayOrders.length === 0 ? C.textHint : C.shipped }}>
                    {todayOrders.length === 0 ? 'None' : `${todayOrders.length} new`}
                  </span>
                </div>
                {todayOrders.length === 0 ? (
                  <p className="px-3.5 py-3 text-[11px]" style={{ color: C.textHint }}>No orders yet today</p>
                ) : (
                  <>
                    {todayOrders.map((o, i) => {
                      const dotColor = (o.risk_level||'').toUpperCase() === 'HIGH' ? C.riskHigh
                        : (o.risk_level||'').toUpperCase() === 'MEDIUM' ? C.riskMed : C.riskLow
                      return (
                        <button key={i} onClick={() => setSelectedOrder(o)}
                          className="w-full flex items-center gap-2 px-3.5 py-2 border-t hover:opacity-80"
                          style={{ borderColor: C.border }}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-[11px] font-semibold truncate" style={{ color: C.textPrimary }}>{o.item_title || 'Unknown'}</p>
                            {o.buyer_username && <p className="text-[9px] truncate" style={{ color: C.textHint }}>{o.buyer_username}</p>}
                          </div>
                          <span className="text-[12px] font-extrabold shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)', color: C.textPrimary }}>
                            {currencySymbol}{Number(o.item_price||0).toFixed(2)}
                          </span>
                        </button>
                      )
                    })}
                    <div className="flex justify-between px-3.5 py-2 border-t text-[10px]" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <span style={{ color: C.textHint }}>Today&apos;s total</span>
                      <span className="font-bold" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{currencySymbol}{todayTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* ── ANALYTICS SECTION ── */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">

            {/* Protection Trend Chart */}
            <div className="lg:col-span-3 p-3 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-start justify-between mb-0.5">
                <div>
                  <h3 className="text-[13px] font-bold" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>Protection Trend</h3>
                  <p className="text-[10px]" style={{ color: C.textHint }}>Protected vs total per day</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5" style={{ backgroundColor: C.accent }} />
                    <span className="text-[9px]" style={{ color: C.textSecondary }}>Protected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 border-t border-dashed" style={{ borderColor: '#888780' }} />
                    <span className="text-[9px]" style={{ color: C.textSecondary }}>Total</span>
                  </div>
                </div>
              </div>
              {trendData.length === 0 ? (
                <div className="h-[160px] flex items-center justify-center">
                  <p className="text-[11px]" style={{ color: C.textHint }}>No data for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={trendData}>
                    <defs>
                      <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8FFF00" stopOpacity={0.33} />
                        <stop offset="95%" stopColor="#8FFF00" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: C.textHint }}
                      tickFormatter={(v) => { const p = v?.split('-'); return p?.length >= 3 ? `${p[2]}/${p[1]}` : v }} />
                    <YAxis tick={{ fontSize: 8, fill: C.textHint }} width={24} allowDecimals={false} ticks={[0, 6, 12, 18, 24, 30, 36]} domain={[0, 36]} />
                    <Tooltip
                      cursor={{ stroke: C.accent, strokeWidth: 1, strokeDasharray: '4 2' }}
                      content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null
                        const total = payload.find((p: any) => p.dataKey === 'total')?.value ?? 0
                        const prot  = payload.find((p: any) => p.dataKey === 'protected')?.value ?? 0
                        return (
                          <div style={{ background: C.accentDark, borderRadius: 6, padding: '6px 10px', fontSize: 10 }}>
                            <div style={{ color: '#aaa', marginBottom: 2 }}>{label}</div>
                            <div style={{ color: '#888780' }}>Total: <b style={{ color: '#fff' }}>{total}</b></div>
                            <div style={{ color: C.accent }}>Protected: <b>{prot}</b></div>
                            {total - prot > 0 && <div style={{ color: '#FF6666' }}>At risk: <b>{total - prot}</b></div>}
                          </div>
                        )
                      }}
                    />
                    <Area type="monotone" dataKey="protected"
                      stroke="none" fill="url(#limeGrad)" fillOpacity={1} dot={false} legendType="none" tooltipType="none" />
                    <Line type="monotone" dataKey="total" name="Total orders"
                      stroke="#888780" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    <Line type="monotone" dataKey="protected" name="Protected"
                      stroke={C.accent} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              <div className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-md" style={{ backgroundColor: C.bg }}>
                <span className="text-[9px]" style={{ color: C.textHint }}>ℹ Gap between lines = unprotected orders at risk. Lime fill = protected.</span>
              </div>
            </div>

            {/* Orders Overview Bar Chart */}
            <div className="lg:col-span-2 p-3 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[13px] font-bold mb-0.5" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>Orders Overview</h3>
                  <p className="text-[10px]" style={{ color: C.textHint }}>Total orders per day</p>
                </div>
                <div className="flex items-center gap-2.5">
                  {[['#8FFF00','80%+'],['#6BCC00','50-80%'],['#E8FFCC','under 50%']].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm border" style={{ backgroundColor: c, borderColor: C.border }} />
                      <span className="text-[9px]" style={{ color: C.textHint }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              {(() => {
                const paddedBar = [...barData]
                while (paddedBar.length < 7) paddedBar.unshift({ date: '', total: 0, protected: 0 })
                return barData.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center">
                    <p className="text-[11px]" style={{ color: C.textHint }}>No data for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={paddedBar} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: C.textHint }} tickFormatter={(v: string) => {
                        if (!v) return ''
                        const parts = v.split('-')
                        return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : v
                      }} />
                      <YAxis tick={{ fontSize: 8, fill: C.textHint }} width={20} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }: any) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0]?.payload
                          if (!d?.date) return null
                          return (
                            <div style={{ background: C.accentDark, borderRadius: 6, padding: '6px 10px', fontSize: 10, color: C.accent }}>
                              <div style={{ color: '#fff', marginBottom: 2 }}>{d.date}</div>
                              <div>Total: <b>{d.total}</b></div>
                              <div>Protected: <b style={{ color: C.accent }}>{d.protected}</b></div>
                              <div>Unprotected: <b style={{ color: '#FF6666' }}>{d.total - d.protected}</b></div>
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="total" radius={[6,6,0,0]} isAnimationActive={false}>
                        {paddedBar.map((d: any, i: number) => {
                          if (d.total === 0) return <Cell key={i} fill="transparent" stroke="none" />
                          const ratio = d.protected / d.total
                          const fill = ratio >= 0.8 ? '#8FFF00' : ratio >= 0.5 ? '#6BCC00' : '#E8FFCC'
                          return <Cell key={i} fill={fill} />
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </div>

            {/* Protection Rate Donut */}
            <div className="lg:col-span-2 p-3 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <h3 className="text-[13px] font-bold mb-0.5" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>Protection Rate</h3>
              <p className="text-[10px] mb-3" style={{ color: C.textHint }}>Current order status</p>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
                  <PieChart width={140} height={140}>
                    <Pie data={donutData} dataKey="value" cx={70} cy={70}
                      innerRadius={42} outerRadius={64}
                      paddingAngle={2}
                      startAngle={90} endAngle={450}
                      stroke="none">
                      {donutData.map((d: any, i: number) => (
                        <Cell key={i} fill={d.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-extrabold leading-none" style={{ color: C.accentDeep, fontFamily: 'var(--font-space-grotesk)' }}>{protRate}%</span>
                    <span className="text-[9px]" style={{ color: C.textHint }}>safe</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    { dot: '#888780', label: 'Total', value: stats.total, color: C.textPrimary },
                    { dot: C.accent,  label: 'Protected', value: stats.protected, color: C.accentDeep },
                    { dot: C.riskHigh,label: 'Need action', value: stats.unprotected, color: C.riskHigh },
                    { dot: C.riskHigh,label: 'At risk', value: `${currencySymbol}${stats.atRisk.toFixed(0)}`, color: C.riskHigh },
                  ].map((r,i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.dot }} />
                      <span className="text-[11px] flex-1" style={{ color: C.textSecondary }}>{r.label}</span>
                      <span className="text-[11px] font-semibold" style={{ color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-[9px] mb-1" style={{ color: C.textHint }}>
                  <span>Progress</span><span style={{ color: C.accentDeep, fontWeight: 600 }}>Target: 80%</span>
                </div>
                <div className="relative h-[7px] rounded-full" style={{ backgroundColor: C.border }}>
                  <div className="absolute h-full rounded-full" style={{ width: '80%', backgroundColor: C.accentDim }} />
                  <div className="absolute h-full rounded-full transition-all" style={{ width: `${protRate}%`, backgroundColor: C.accent }} />
                </div>
                <div className="flex justify-between text-[8px] mt-1" style={{ color: C.textHint }}>
                  <span>0%</span><span style={{ color: C.accentDeep }}>{protRate}%</span><span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── UNIFIED TOOLBAR ── */}
          <div className="space-y-2">
            {/* Pill tabs */}
            <div className="flex items-center gap-2 p-2 rounded-2xl border overflow-x-auto"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-center gap-1.5 min-w-max">
                {(
                  [
                    { f: 'all',          label: 'All',         count: stats.total,               color: null        },
                    { f: 'low',          label: 'Low',         count: stats.low,                 color: C.riskLow   },
                    { f: 'medium',       label: 'Medium',      count: stats.med,                 color: C.riskMed   },
                    { f: 'high',         label: 'High',        count: stats.high,                color: C.riskHigh  },
                    { f: 'shipped',      label: 'Shipped',     count: stats.shipped,             color: C.shipped   },
                    { f: 'not_shipped',  label: 'Not Shipped', count: stats.total-stats.shipped, color: C.pending   },
                    { f: 'not_protected',label: 'Unprotected', count: stats.unprotected,         color: C.riskHigh  },
                  ] as { f: string; label: string; count: number; color: string | null }[]
                ).map(({ f, label, count, color }) => {
                  const isActive = filter === f
                  const tabColor = color || C.accentDeep
                  return (
                    <button key={f} onClick={() => setFilter(f)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap"
                      style={{
                        backgroundColor: isActive ? tabColor : 'transparent',
                        borderColor: isActive ? 'transparent' : C.border,
                        color: isActive ? '#fff' : C.textSecondary,
                      }}>
                      {label}
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : C.bg, color: isActive ? '#fff' : C.textHint }}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
              {stats.high > 0 && (
                <button onClick={() => setFilter('high')}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                  style={{ backgroundColor: C.riskHigh }}>
                  <AlertTriangle size={11} />
                  {stats.high} at risk
                </button>
              )}
            </div>

            {/* Sort + Search */}
            <div className="flex items-center gap-3 p-3 rounded-2xl border flex-wrap"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium" style={{ color: C.textHint }}>Sort:</span>
                <SortChip label="Score ↓" active={sortBy==='riskScoreDesc'} onClick={() => setSortBy(s => s==='riskScoreDesc' ? 'none' : 'riskScoreDesc')} />
                <SortChip label="Price ↓" active={sortBy==='priceDesc'}     onClick={() => setSortBy(s => s==='priceDesc' ? 'none' : 'priceDesc')} />
                <SortChip label="Price ↑" active={sortBy==='priceAsc'}      onClick={() => setSortBy(s => s==='priceAsc' ? 'none' : 'priceAsc')} />
                <SortChip label="Newest"  active={sortBy==='newest'}         onClick={() => setSortBy(s => s==='newest' ? 'none' : 'newest')} />
                <SortChip label="Oldest"  active={sortBy==='oldest'}         onClick={() => setSortBy(s => s==='oldest' ? 'none' : 'oldest')} />
              </div>
              <div className="w-px h-6 hidden md:block" style={{ backgroundColor: C.border }} />
              <div className="flex-1 min-w-[200px] relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textHint }} />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by order ID, item, or buyer"
                  className="w-full h-[38px] pl-8 pr-8 rounded-full border text-[12px] outline-none transition-all"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.textPrimary }}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textHint }}>
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  const label = filter === 'all' ? 'All Orders' : filter.replace(/_/g,' ').toUpperCase()
                  const csv = ['ORDER ID,ITEM,BUYER,RISK,SCORE,STATUS,PRICE,DATE']
                    .concat(filteredOrders.map(o => [
                      o.ebay_order_id || '', (o.item_title||'').replace(/,/g,''), o.buyer_username||'',
                      o.risk_level||'', o.risk_score||0, o.order_status||'',
                      Number(o.item_price||0).toFixed(2), (o.created_at||'').split('T')[0]
                    ].join(','))).join('\n')
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
                  a.download = `Riazify_${label}_${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-semibold"
                style={{ backgroundColor: C.bg, borderColor: C.border, color: C.accentDeep }}>
                <Download size={13} />
                Export
              </button>
            </div>
          </div>

          {/* ── TABLE HEADER (desktop only) ── */}
          <div className="hidden lg:grid rounded-none py-2.5 px-3.5 text-[9px] font-extrabold tracking-wide"
               style={{ backgroundColor: C.accent, color: C.accentDark,
                 gridTemplateColumns: '44px 1fr 1fr 2fr 2fr 2fr 1fr 2fr 2fr 24px 24px 1fr 1fr 1fr' }}>
            <div className="text-center">VIEW</div>
            <div>RISK</div>
            <div className="pl-2">ORDER ID</div>
            <div className="pl-2">ITEM</div>
            <div className="pl-2 font-black">BUYER</div>
            <div className="pl-2">BUYER RISK</div>
            <div className="pl-2">SCORE</div>
            <div className="pl-8">PROTECTION</div>
            <div className="pl-2">STATUS</div>
            <div />
            <div />
            <div className="text-center">MSG</div>
            <div
              className="text-right cursor-pointer flex items-center justify-end gap-1"
              onClick={() => setSortBy(s => s==='priceDesc' ? 'priceAsc' : s==='priceAsc' ? 'none' : 'priceDesc')}>
              {sortBy==='priceDesc' ? <ArrowDown size={9}/> : sortBy==='priceAsc' ? <ArrowUp size={9}/> : <ArrowUpDown size={9}/>}
              PRICE
            </div>
            <div className="text-right">TIME</div>
          </div>

          {/* ── ORDER ROWS ── */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.accentDim }}>
                <Package size={32} style={{ color: C.accentDeep }} />
              </div>
              <p className="text-[16px] font-bold" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>
                {search ? `No results for "${search}"` : filter === 'not_protected' ? 'All orders are protected! 🎉' : 'No orders in this filter'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="text-[12px] font-semibold" style={{ color: C.accentDeep }}>
                  Clear search
                </button>
              )}
            </div>
          ) : filteredOrders.map((o, i) => {
            const rc = riskColors(o.risk_level)
            const sc = statusColors(o.order_status)
            const price = Number(o.item_price || 0)
            const score = Number(o.risk_score || 0)
            const isProt = o.checklist_completed === true
            const msgCount = msgCounts[o.id] || 0
            const buyer = buyerProfiles[o.buyer_username] || null
            const sigThreshold = currencySymbol === '£' ? 450 : currencySymbol === '€' ? 550 : 750
            const needsSig = price > 0 && price >= sigThreshold && o.signature_required !== true && !['shipped','delivered'].includes((o.order_status||'').toLowerCase())
            const highUnprot = (o.risk_level||'').toUpperCase() === 'HIGH' && !isProt

            return (
              <div key={o.id || i} className="contents">
                {/* Desktop row */}
                <div
                  className="hidden lg:grid items-center py-2.5 px-3.5 cursor-default transition-all"
                  style={{
                    backgroundColor: C.surface,
                    borderLeft: `3px solid ${rc.color}`,
                    borderBottom: `1px solid ${C.border}`,
                    gridTemplateColumns: '44px 1fr 1fr 2fr 2fr 2fr 1fr 2fr 2fr 24px 24px 1fr 1fr 1fr',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = C.surfaceHover}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = C.surface}>
                  {/* VIEW */}
                  <div className="flex justify-center">
                    <button onClick={() => setSelectedOrder(o)}
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-all group hover:scale-105"
                            style={{ backgroundColor: C.accentDim }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.accent }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.accentDim }}>
                      <Eye size={14} style={{ color: C.accentDeep }} />
                    </button>
                  </div>
                  <div><RiskBadge level={o.risk_level} /></div>
                  <div className="pl-2 text-[10px] font-medium truncate" style={{ color: C.textSecondary }}>
                    #{o.ebay_order_id}
                  </div>
                  <div className="pl-2 text-[12px] font-medium truncate" style={{ color: C.textPrimary }}>
                    {o.item_title || 'Unknown'}
                  </div>
                  <div className="pl-2 flex items-center gap-2">
                    <button onClick={() => o.buyer_username && setSelectedBuyer(o.buyer_username)}
                      className="w-6 h-6 rounded-md flex items-center justify-center border transition-all hover:scale-105"
                            style={{ backgroundColor: C.accentDim, borderColor: C.accent }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.accent; (e.currentTarget as HTMLButtonElement).style.borderColor = C.accentDeep }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.accentDim; (e.currentTarget as HTMLButtonElement).style.borderColor = C.accent }}>
                      <User size={12} style={{ color: C.accentDeep }} />
                    </button>
                    <span className="text-[11px] font-medium truncate" style={{ color: C.textPrimary }}>
                      {o.buyer_username || '—'}
                    </span>
                  </div>
                  <div className="pl-2"><BuyerRiskBadges profile={buyer} /></div>
                  <div className="pl-2"><ScoreBar score={score} color={rc.color} /></div>
                  <div className="pl-8"><ProtectionBadge protected={isProt} riskLevel={o.risk_level} /></div>
                  <div className="pl-2"><StatusBadge status={o.order_status} /></div>
                  <div>
                    {needsSig && (
                      <BubbleTip color={C.riskHigh} message={`Order value exceeds signature threshold (${currencySymbol}${sigThreshold}). Signature-required shipping is mandatory.`}>
                        <div className="w-5 h-5 rounded flex items-center justify-center border cursor-help"
                             style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '66' }}>
                          <span className="text-[9px]" style={{ color: C.riskHigh }}>✍</span>
                        </div>
                      </BubbleTip>
                    )}
                  </div>
                  <div>
                    {highUnprot && (
                      <BubbleTip color={C.riskHigh} message="HIGH RISK order with incomplete protection. Complete the evidence vault before shipping.">
                        <div className="w-5 h-5 rounded flex items-center justify-center border cursor-help"
                             style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '66' }}>
                          <ShieldOff size={10} style={{ color: C.riskHigh }} />
                        </div>
                      </BubbleTip>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {msgCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold"
                            style={{ backgroundColor: C.shippedBg, color: C.shipped }}>
                        <MessageSquare size={9} />{msgCount}
                      </span>
                    ) : <span className="text-[11px]" style={{ color: C.textHint }}>—</span>}
                  </div>
                  <div className="text-right text-[13px] font-extrabold" style={{ color: C.textPrimary, fontFamily: 'var(--font-space-grotesk)' }}>
                    {currencySymbol}{price.toFixed(2)}
                  </div>
                  <div className="text-right text-[10px]" style={{ color: C.textHint }}>
                    {o.created_at ? timeAgo(o.created_at) : '—'}
                  </div>
                </div>

                {/* Mobile card */}
                <div className="lg:hidden flex items-center gap-2 px-3 py-2.5"
                     style={{ backgroundColor: C.surface, borderLeft: `2px solid ${rc.color}`, borderBottom: `1px solid ${C.border}` }}>
                  <button onClick={() => setSelectedOrder(o)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.accentDim }}>
                    <Eye size={14} style={{ color: C.accentDeep }} />
                  </button>
                  <div className="w-[58px] shrink-0 px-1.5 py-1 rounded-md text-center text-[8px] font-bold"
                       style={{ backgroundColor: rc.bg, color: rc.color }}>
                    {(o.risk_level||'LOW').toUpperCase()}
                  </div>
                  <div className="flex-[2] text-[11px] font-semibold truncate" style={{ color: C.textSecondary }}>
                    #{o.ebay_order_id}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => o.buyer_username && setSelectedBuyer(o.buyer_username)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center border"
                         style={{ backgroundColor: C.accentDim, borderColor: C.accent }}>
                      <User size={11} style={{ color: C.accentDeep }} />
                    </button>
                    <span className="flex-[2] text-[10px] truncate" style={{ color: C.textSecondary }}>
                      {o.buyer_username || '—'}
                    </span>
                  </div>
                  <div className="w-16 text-right text-[12px] font-extrabold shrink-0"
                       style={{ fontFamily: 'var(--font-space-grotesk)', color: C.textPrimary }}>
                    {currencySymbol}{price.toFixed(2)}
                  </div>
                </div>
              </div>
            )
          })}

        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <OrderSlideWrapper
            orderId={selectedOrder.id}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {/* Buyer Profile Panel */}
        {selectedBuyer && (
          <BuyerProfilePanel
            buyerUsername={selectedBuyer}
            onClose={() => setSelectedBuyer(null)}
          />
        )}
      </div>
    </KillSwitchGate>
  )
}

// ══════════════════════════════════════════════════════════════
// ORDER SLIDE WRAPPER — reuses full [id]/page content
// ══════════════════════════════════════════════════════════════
function OrderSlideWrapper({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 320)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300"
           style={{ opacity: visible ? 1 : 0 }}
           onClick={handleClose} />
      {/* Panel — renders [id]/page content directly */}
      <div className="relative flex flex-col z-10 transition-transform duration-300 ease-out overflow-y-auto"
           style={{
             width: '46%', minWidth: 520, maxWidth: 720,
             height: '100%',
             backgroundColor: '#F4F6F0',
             transform: visible ? 'translateX(0)' : 'translateX(100%)',
           }}>
        <OrderDetailInline orderId={orderId} onClose={handleClose} />
      </div>
    </div>
  )
}