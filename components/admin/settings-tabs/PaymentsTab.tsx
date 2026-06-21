'use client'
// components/admin/settings-tabs/PaymentsTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  DollarSign, TrendingUp, Users, AlertTriangle,
  RefreshCw, Download, CheckCircle, XCircle,
  ChevronRight, ExternalLink, Zap, X,
  Search, RotateCcw,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  bg:       '#f7f9f5',
  surface:  '#ffffff',
  border:   '#e8ede2',
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  muted:    '#8a9e78',
  text:     '#1a2410',
  red:      '#b91c1c',
  amber:    '#d97706',
  blue:     '#1d4ed8',
  green:    '#16a34a',
  purple:   '#7c3aed',
}

// ── Helpers ────────────────────────────────────────────────────
function timeAgo(date: string) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0)  return `${d}d ago`
  if (h > 0)  return `${h}h ago`
  if (m > 0)  return `${m}m ago`
  return 'Just now'
}

function planColor(plan: string) {
  if (plan === 'growth')  return { bg: 'rgba(143,255,0,0.1)',  color: C.limeDeep }
  if (plan === 'starter') return { bg: 'rgba(29,78,216,0.08)', color: C.blue }
  if (plan === 'custom')  return { bg: 'rgba(124,58,237,0.08)',color: C.purple }
  return { bg: C.bg, color: C.muted }
}

function statusColor(status: string) {
  if (status === 'paid'     || status === 'active')    return { color: C.green,  bg: 'rgba(22,163,74,0.08)',  dot: C.green  }
  if (status === 'failed'   || status === 'cancelled') return { color: C.red,    bg: 'rgba(185,28,28,0.08)',  dot: C.red    }
  if (status === 'pending'  || status === 'trial')     return { color: C.amber,  bg: 'rgba(217,119,6,0.08)',  dot: C.amber  }
  if (status === 'refunded')                           return { color: C.purple, bg: 'rgba(124,58,237,0.08)', dot: C.purple }
  if (status === 'expired')                            return { color: C.muted,  bg: 'rgba(138,158,120,0.08)',dot: C.muted  }
  return { color: C.muted, bg: C.bg, dot: C.muted }
}

// ── Transaction interface ──────────────────────────────────────
interface Transaction {
  id:            string
  invoice:       string
  user:          string
  plan:          string
  amount:        number
  status:        string
  date:          string
  billing:       string
  country:       string
  renewsIn:      number
  nextBilling:   string
  paymentMethod: string
  subId:         string
  ltv:           number
  trialEnd:      string | null
  coupon:        string | null
  lsOrderId:     string | null
  userId:        string | null
}

// ── Mock transaction data (until LemonSqueezy connected) ──────
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn_001', invoice: 'INV-2026-001', user: 'james.seller@gmail.com',  plan: 'growth',  amount: 49.00,  status: 'paid',     date: new Date(Date.now() - 2*3600000).toISOString(),   billing: 'monthly', country: 'US', renewsIn: 28,  nextBilling: 'Jul 18, 2026', paymentMethod: 'Visa •••• 4242',       subId: 'LS-SUB-0012', ltv: 147.00, trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_002', invoice: 'INV-2026-002', user: 'sarah.ebay@outlook.com',  plan: 'starter', amount: 19.00,  status: 'paid',     date: new Date(Date.now() - 5*3600000).toISOString(),   billing: 'monthly', country: 'GB', renewsIn: 15,  nextBilling: 'Jul 05, 2026', paymentMethod: 'Mastercard •••• 1234', subId: 'LS-SUB-0013', ltv: 57.00,  trialEnd: null,            coupon: 'LAUNCH20',  lsOrderId: null, userId: null },
  { id: 'txn_003', invoice: 'INV-2026-003', user: 'mike.trades@yahoo.com',   plan: 'growth',  amount: 470.00, status: 'paid',     date: new Date(Date.now() - 24*3600000).toISOString(),  billing: 'annual',  country: 'AU', renewsIn: 340, nextBilling: 'Jun 20, 2027', paymentMethod: 'Visa •••• 9876',       subId: 'LS-SUB-0014', ltv: 470.00, trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_004', invoice: 'INV-2026-004', user: 'anna.shop@gmail.com',     plan: 'starter', amount: 19.00,  status: 'failed',   date: new Date(Date.now() - 36*3600000).toISOString(),  billing: 'monthly', country: 'US', renewsIn: 0,   nextBilling: '—',            paymentMethod: 'Visa •••• 0000',       subId: 'LS-SUB-0015', ltv: 19.00,  trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_005', invoice: 'INV-2026-005', user: 'david.sell@gmail.com',    plan: 'growth',  amount: 49.00,  status: 'paid',     date: new Date(Date.now() - 48*3600000).toISOString(),  billing: 'monthly', country: 'CA', renewsIn: 22,  nextBilling: 'Jul 12, 2026', paymentMethod: 'PayPal',               subId: 'LS-SUB-0016', ltv: 245.00, trialEnd: null,            coupon: 'SAVE10',    lsOrderId: null, userId: null },
  { id: 'txn_006', invoice: 'INV-2026-006', user: 'lisa.market@hotmail.com', plan: 'custom',  amount: 149.00, status: 'active',   date: new Date(Date.now() - 72*3600000).toISOString(),  billing: 'monthly', country: 'US', renewsIn: 8,   nextBilling: 'Jun 28, 2026', paymentMethod: 'Mastercard •••• 5555', subId: 'LS-SUB-0017', ltv: 596.00, trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_007', invoice: 'INV-2026-007', user: 'tom.ebay@gmail.com',      plan: 'starter', amount: 19.00,  status: 'trial',    date: new Date(Date.now() - 4*86400000).toISOString(),  billing: 'monthly', country: 'DE', renewsIn: 10,  nextBilling: 'Jun 30, 2026', paymentMethod: 'Visa •••• 7890',       subId: 'LS-SUB-0018', ltv: 0.00,   trialEnd: 'Jun 30, 2026',  coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_008', invoice: 'INV-2026-008', user: 'kate.sells@gmail.com',    plan: 'growth',  amount: 49.00,  status: 'refunded',  date: new Date(Date.now() - 5*86400000).toISOString(),  billing: 'monthly', country: 'FR', renewsIn: 0,   nextBilling: '—',            paymentMethod: 'Visa •••• 3333',       subId: 'LS-SUB-0019', ltv: 0.00,   trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_009', invoice: 'INV-2026-009', user: 'paul.trade@yahoo.com',    plan: 'growth',  amount: 470.00, status: 'paid',      date: new Date(Date.now() - 7*86400000).toISOString(),  billing: 'annual',  country: 'US', renewsIn: 355, nextBilling: 'Jun 13, 2027', paymentMethod: 'Mastercard •••• 8888', subId: 'LS-SUB-0020', ltv: 940.00, trialEnd: null,            coupon: 'ANNUAL20',  lsOrderId: null, userId: null },
  { id: 'txn_010', invoice: 'INV-2026-010', user: 'nina.shop@gmail.com',     plan: 'starter', amount: 182.00, status: 'paid',      date: new Date(Date.now() - 10*86400000).toISOString(), billing: 'annual',  country: 'SG', renewsIn: 320, nextBilling: 'Jun 10, 2027', paymentMethod: 'PayPal',               subId: 'LS-SUB-0021', ltv: 182.00, trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_011', invoice: 'INV-2026-011', user: 'alex.trades@gmail.com',   plan: 'starter', amount: 19.00,  status: 'cancelled', date: new Date(Date.now() - 12*86400000).toISOString(), billing: 'monthly', country: 'CA', renewsIn: 0,   nextBilling: '—',            paymentMethod: 'Visa •••• 1111',       subId: 'LS-SUB-0022', ltv: 38.00,  trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
  { id: 'txn_012', invoice: 'INV-2026-012', user: 'emma.shop@outlook.com',   plan: 'growth',  amount: 49.00,  status: 'expired',   date: new Date(Date.now() - 15*86400000).toISOString(), billing: 'monthly', country: 'AU', renewsIn: 0,   nextBilling: '—',            paymentMethod: 'Mastercard •••• 2222', subId: 'LS-SUB-0023', ltv: 98.00,  trialEnd: null,            coupon: null,        lsOrderId: null, userId: null },
]

// ── Monthly chart data ─────────────────────────────────────────
const REVENUE_CHART = [
  { month: 'Jan', mrr: 120  },
  { month: 'Feb', mrr: 240  },
  { month: 'Mar', mrr: 180  },
  { month: 'Apr', mrr: 390  },
  { month: 'May', mrr: 520  },
  { month: 'Jun', mrr: 360  },
  { month: 'Jul', mrr: 410  },
  { month: 'Aug', mrr: 480  },
  { month: 'Sep', mrr: 390  },
  { month: 'Oct', mrr: 560  },
  { month: 'Nov', mrr: 620  },
  { month: 'Dec', mrr: 700  },
]

// ── Daily data for 1M view (last 30 days) ─────────────────────
const DAILY_CHART = Array.from({ length: 30 }, (_, i) => {
  const d    = new Date()
  d.setDate(d.getDate() - (29 - i))
  const label = `${d.getMonth() + 1}/${d.getDate()}`
  const base  = 350
  const noise = Math.sin(i * 0.8) * 80 + Math.cos(i * 0.3) * 50 + (Math.random() * 40 - 20)
  return { month: label, mrr: Math.max(50, Math.round(base + noise)) }
})

// ══════════════════════════════════════════════════════════════
// PAYMENTS TAB
// ══════════════════════════════════════════════════════════════
export default function PaymentsTab({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const supabase = createClient()
  const router   = useRouter()

  const [loading,      setLoading]      = useState(true)
  const [userPlans,    setUserPlans]    = useState<Record<string, number>>({})
  const [totalUsers,   setTotalUsers]   = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery,  setSearchQuery]  = useState<string>('')
  const [currentPage,  setCurrentPage]  = useState(1)
  const [perPage,      setPerPage]      = useState(10)
  const [showPerPage,  setShowPerPage]  = useState(false)
  const [isLSConnected, setIsLSConnected] = useState(false)
  const [retryTxn,      setRetryTxn]      = useState<Transaction | null>(null)
  const [refundTxn,     setRefundTxn]     = useState<Transaction | null>(null)
  const [subTxn,        setSubTxn]        = useState<Transaction | null>(null)
  const [subAction,     setSubAction]     = useState<'cancel' | 'change_plan' | 'resume' | null>(null)
  const [subNewPlan,    setSubNewPlan]    = useState<string>('')
  const [subNewBilling, setSubNewBilling] = useState<'monthly' | 'annual'>('monthly')
  const [subLoading,    setSubLoading]    = useState(false)
  const [subError,      setSubError]      = useState<string | null>(null)
  const [subSuccess,    setSubSuccess]    = useState<string | null>(null)
  const [cancelMode,    setCancelMode]    = useState<'now' | 'end'>('end')
  const [refundLoading, setRefundLoading] = useState(false)
  const [refundError,   setRefundError]   = useState<string | null>(null)
  const [refundReason,  setRefundReason]  = useState<string>('')
  const [refundType,    setRefundType]    = useState<'full' | 'partial'>('full')
  const [refundAmount,  setRefundAmount]  = useState<string>('')
  const [refundNote,    setRefundNote]    = useState<string>('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [showReasonDropdown, setShowReasonDropdown] = useState(false)
  const [copied,       setCopied]       = useState(false)
  const [flagged,      setFlagged]      = useState<string[]>([])
  const [chartFilter,  setChartFilter]  = useState<'1M' | '3M' | '6M' | '1Y'>('6M')

  // Load real data from DB
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Get plan distribution
      const { data: profiles } = await supabase
        .from('profiles')
        .select('plan_name')
      if (profiles) {
        const counts: Record<string, number> = {}
        profiles.forEach((p: any) => {
          const plan = p.plan_name ?? 'free'
          counts[plan] = (counts[plan] ?? 0) + 1
        })
        setUserPlans(counts)
        setTotalUsers(profiles.length)
      }

      // Check if LemonSqueezy is connected
      const { data: ls } = await (supabase.from('api_fleet_config') as any)
        .select('status, primary_key_1')
        .eq('platform_name', 'lemonsqueezy')
        .single()
      const connected = (ls as any)?.status === 'connected' && (ls as any)?.primary_key_1 !== 'EMPTY'
      setIsLSConnected(connected)

      // Load real transactions if LS connected
      if (connected) {
        const { data: txnData } = await (supabase.from('transactions') as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (txnData && txnData.length > 0) {
          const mapped = txnData.map((t: any, i: number) => ({
            id:            t.id,
            invoice:       t.invoice ?? `INV-${String(i+1).padStart(3,'0')}`,
            user:          t.user_email ?? '—',
            plan:          t.plan ?? 'free',
            amount:        parseFloat(t.amount ?? 0),
            status:        t.status ?? 'paid',
            date:          t.created_at,
            billing:       t.billing ?? 'monthly',
            country:       t.country ?? '—',
            renewsIn:      0,
            nextBilling:   t.next_billing ?? '—',
            paymentMethod: t.payment_method ?? '—',
            subId:         t.sub_id ?? '—',
            ltv:           parseFloat(t.ltv ?? 0),
            trialEnd:      t.trial_end ?? null,
            coupon:        t.coupon ?? null,
            lsOrderId:     t.ls_order_id ?? null,
            userId:        t.user_id ?? null,
          }))
          setTransactions(mapped)
        }
      }

    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Initialize MRR Chart.js after data loads
  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = document.getElementById('mrrChart') as HTMLCanvasElement
    if (!canvas) return

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => {
      const Chart = (window as any).Chart
      if (!Chart) return

      const existing = Chart.getChart(canvas)
      if (existing) existing.destroy()

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const allData  = REVENUE_CHART
      const filtered = chartFilter === '1M' ? DAILY_CHART :
                       chartFilter === '3M' ? allData.slice(-3) :
                       chartFilter === '6M' ? allData.slice(-6) :
                       allData

      const values  = filtered.map(r => r.mrr)
      const minVal  = Math.max(0, Math.min(...values) - 50)
      const maxVal  = Math.max(...values) + 50

      const grad = ctx.createLinearGradient(0, 0, 0, 160)
      grad.addColorStop(0, 'rgba(143,255,0,0.25)')
      grad.addColorStop(1, 'rgba(143,255,0,0.01)')

      new Chart(canvas, {
        type: 'line',
        data: {
          labels: filtered.map(r => r.month),
          datasets: [{
            data:                 values,
            borderColor:          '#4a8f00',
            backgroundColor:      grad,
            fill:                 true,
            tension:              0,
            pointBackgroundColor: '#4a8f00',
            pointBorderColor:     '#ffffff',
            pointBorderWidth:     2,
            pointRadius:          chartFilter === '1M' ? 0 : 4,
            pointHoverRadius:     6,
            pointHoverBackgroundColor: '#8fff00',
            borderWidth:          2,
          }]
        },
        options: {
          responsive:          true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0a0d08',
              titleColor:      '#8a9e78',
              bodyColor:       '#ffffff',
              padding:         10,
              cornerRadius:    8,
              displayColors:   false,
              callbacks: {
                title: (items: any) => items[0].label + ' 2026',
                label: (ctx: any)   => ' MRR: $' + ctx.raw.toLocaleString(),
              }
            }
          },
          scales: {
            x: {
              grid:   { color: '#e8ede2', drawBorder: false },
              ticks:  {
                color:     '#8a9e78',
                font:      { size: 10 },
                maxTicksLimit: chartFilter === '1M' ? 8 : 12,
              },
              border: { display: false },
            },
            y: {
              min:    minVal,
              max:    maxVal,
              grid:   { color: '#e8ede2', drawBorder: false },
              ticks:  {
                color:    '#8a9e78',
                font:     { size: 10 },
                count:    4,
                callback: (v: any) => '$' + v.toLocaleString(),
              },
              border: { display: false },
            }
          }
        }
      })
    }
    if (!document.querySelector('script[src*="Chart.js"]')) {
      document.head.appendChild(script)
    } else {
      script.onload?.(new Event('load'))
    }
  }, [loading, chartFilter])

  // Calculate metrics from mock data (will use real data when LS connected)
  const paidTxns    = transactions.filter(t => t.status === 'paid' || t.status === 'active')
  const failedTxns  = transactions.filter(t => t.status === 'failed')
  const mrr         = paidTxns.filter(t => t.billing === 'monthly').reduce((s, t) => s + t.amount, 0)
               + paidTxns.filter(t => t.billing === 'annual').reduce((s, t) => s + t.amount / 12, 0)
  const arr         = mrr * 12

  // MRR % change — current vs previous month from REVENUE_CHART
  const currentMonthMrr  = REVENUE_CHART[REVENUE_CHART.length - 1]?.mrr ?? 0
  const previousMonthMrr = REVENUE_CHART[REVENUE_CHART.length - 2]?.mrr ?? 0
  const mrrChange = previousMonthMrr === 0
    ? 0
    : ((currentMonthMrr - previousMonthMrr) / previousMonthMrr) * 100
  const mrrChangeStr = mrrChange === 0
    ? '+0%'
    : mrrChange > 0
      ? `+${mrrChange.toFixed(1)}%`
      : `${mrrChange.toFixed(1)}%`
  const mrrChangePositive = mrrChange >= 0

  function fmtMoney(n: number) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Fix 1: Count paid accounts from mock ledger (not DB) when LS not connected
  const dbPaidUsers    = (userPlans.starter ?? 0) + (userPlans.growth ?? 0) + (userPlans.custom ?? 0)
  const mockPaidCount  = isLSConnected ? dbPaidUsers : paidTxns.length
  const mockTotalCount = isLSConnected ? totalUsers  : transactions.length
  const convRate       = mockTotalCount > 0 ? Math.round((mockPaidCount / mockTotalCount) * 100) : 0

  // Fix 2: Build plan distribution from mock ledger when LS not connected
  const mockPlanCounts = isLSConnected ? userPlans : transactions.reduce((acc, t) => {
    acc[t.plan] = (acc[t.plan] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mockTotalForDist = isLSConnected ? totalUsers : transactions.length

  const filteredTxns = transactions
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        t.user.toLowerCase().includes(q)     ||
        t.invoice.toLowerCase().includes(q)  ||
        t.plan.toLowerCase().includes(q)     ||
        t.subId.toLowerCase().includes(q)    ||
        t.paymentMethod.toLowerCase().includes(q)
      )
    })

  const totalPages  = Math.max(1, Math.ceil(filteredTxns.length / perPage))
  const paginatedTxns = filteredTxns.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Reset to page 1 when filter/search changes
  const handleFilterChange = (status: string) => { setFilterStatus(status); setCurrentPage(1) }
  const handleSearchChange = (q: string)      => { setSearchQuery(q);       setCurrentPage(1) }

  const maxMRR = Math.max(...REVENUE_CHART.map(r => r.mrr), ...DAILY_CHART.map(r => r.mrr), 1)

  function exportCSV() {
    const csv = [
      ['#', 'INVOICE', 'USER', 'PLAN', 'AMOUNT', 'STATUS', 'BILLING', 'RENEWS IN', 'NEXT BILLING', 'PAYMENT METHOD', 'SUB ID', 'LTV', 'TRIAL END', 'COUPON', 'COUNTRY', 'DATE'],
      ...transactions.map((t, i) => [
        `#${String(i+1).padStart(3,'0')}`,
        t.invoice, t.user, t.plan,
        `$${t.amount.toFixed(2)}`,
        t.status, t.billing,
        t.renewsIn === 0 ? '—' : `${t.renewsIn}d`,
        t.nextBilling, t.paymentMethod, t.subId,
        `$${t.ltv.toFixed(2)}`,
        t.trialEnd ?? '—',
        t.coupon ?? '—',
        t.country,
        new Date(t.date).toLocaleDateString()
      ])
    ].map(r => r.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `riazify-transactions-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex flex-col gap-6 p-6" style={{ backgroundColor: C.bg, minHeight: '100%' }}>

      {/* ── LemonSqueezy connection banner ── */}
      {!isLSConnected && (
        <div className="flex items-center justify-between p-4 rounded-2xl border"
             style={{ backgroundColor: 'rgba(217,119,6,0.06)', borderColor: 'rgba(217,119,6,0.2)' }}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} style={{ color: C.amber }} />
            <div>
              <p className="text-[13px] font-bold" style={{ color: C.amber }}>
                LemonSqueezy not connected
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                Connect your LemonSqueezy API key to see real transaction data
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate ? onNavigate(9) : router.push('/dashboard/admin?settings=api-vault')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: C.amber, color: '#fff' }}>
            Connect <ExternalLink size={11} />
          </button>
        </div>
      )}

      {/* ── HUD Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'MRR',
            value: fmtMoney(mrr),
            sub:   'Monthly recurring revenue',
            icon:  DollarSign,
            color: mrrChangePositive ? C.limeDeep : C.red,
            bg:    mrrChangePositive ? C.limeTint  : 'rgba(185,28,28,0.08)',
            trend: `${mrrChangeStr} this month`,
          },
          {
            title: 'ARR',
            value: fmtMoney(arr),
            sub:   'Annual run rate',
            icon:  TrendingUp,
            color: C.blue,
            bg:    'rgba(29,78,216,0.08)',
            trend: 'Projected',
          },
          {
            title: 'PAID ACCOUNTS',
            value: String(mockPaidCount),
            sub:   `${mockTotalCount} total users`,
            icon:  Users,
            color: C.purple,
            bg:    'rgba(124,58,237,0.08)',
            trend: `${convRate}% conversion`,
          },
          {
            title: 'FAILED PAYMENTS',
            value: String(failedTxns.length),
            sub:   'Needs attention',
            icon:  AlertTriangle,
            color: failedTxns.length > 0 ? C.red : C.green,
            bg:    failedTxns.length > 0 ? 'rgba(185,28,28,0.08)' : 'rgba(22,163,74,0.08)',
            trend: failedTxns.length > 0 ? 'Retry recommended' : 'All clear',
          },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
                  {card.title}
                </p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: card.bg }}>
                  <Icon size={15} style={{ color: card.color }} />
                </div>
              </div>
              {loading
                ? <div className="h-10 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
                : <p className="text-[36px] font-black leading-none tracking-tight"
                     style={{ color: C.dark }}>
                    {card.value}
                  </p>}
              <div>
                <p className="text-[11px]" style={{ color: C.muted }}>{card.sub}</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: card.color }}>{card.trend}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Plan distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Plan breakdown */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[11px] font-black tracking-wider mb-4" style={{ color: C.muted }}>
            PLAN DISTRIBUTION
          </p>
          <div className="flex flex-col gap-3">
            {[
              { tier: 'free',    label: 'Free',    price: '$0'      },
              { tier: 'starter', label: 'Starter', price: '$19/mo'  },
              { tier: 'growth',  label: 'Growth',  price: '$49/mo'  },
              { tier: 'custom',  label: 'Custom',  price: '$149/mo' },
            ].map(p => {
              // Use transactions as single source of truth
              const planTxns  = p.tier === 'free'
                ? []
                : paidTxns.filter(t => t.plan === p.tier)
              const count     = p.tier === 'free'
                ? (mockTotalForDist - paidTxns.length)
                : planTxns.length
              const revenue   = planTxns.reduce((sum, t) =>
                sum + (t.billing === 'annual' ? t.amount / 12 : t.amount), 0)
              const total     = mockTotalForDist > 0 ? mockTotalForDist : 1
              const pct       = Math.round((Math.max(0, count) / total) * 100)
              const pc        = planColor(p.tier)
              return (
                <div key={p.tier}>
                  <div className="flex items-center justify-between mb-1.5">
                    {/* Left: badge + price */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-lg font-black"
                            style={{ backgroundColor: pc.bg, color: pc.color }}>
                        {p.label}
                      </span>
                      <span className="text-[11px]" style={{ color: C.muted }}>{p.price}</span>
                    </div>
                    {/* Right: revenue + users + pct all inline */}
                    <div className="flex items-center gap-3">
                      {revenue > 0 && (
                        <span className="text-[11px] font-black" style={{ color: C.limeDeep }}>
                          ${revenue.toFixed(0)}/mo
                        </span>
                      )}
                      <span className="text-[11px] font-bold" style={{ color: C.muted }}>
                        {Math.max(0, count)} {Math.max(0, count) === 1 ? 'user' : 'users'}
                      </span>
                      <span className="text-[10px] font-bold w-7 text-right" style={{ color: C.muted }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{ width: `${pct}%`, backgroundColor: pc.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total revenue summary */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between"
               style={{ borderColor: C.border }}>
            <span className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
              TOTAL MRR
            </span>
            <span className="text-[13px] font-black" style={{ color: C.dark }}>
              {fmtMoney(mrr)}
            </span>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
                MRR TREND — 2026
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: mrrChangePositive ? C.limeTint : 'rgba(185,28,28,0.08)',
                      color:           mrrChangePositive ? C.limeDeep : C.red,
                    }}>
                {mrrChangeStr} this month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                    style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                {isLSConnected ? 'LIVE' : 'PREVIEW'}
              </span>
              {/* Segmented control */}
              <div className="flex items-center rounded-lg p-0.5"
                   style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                {(['1M', '3M', '6M', '1Y'] as const).map(f => (
                  <button key={f}
                    onClick={() => setChartFilter(f)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                    style={{
                      backgroundColor: chartFilter === f ? C.dark  : 'transparent',
                      color:           chartFilter === f ? C.lime  : C.muted,
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Line chart — Chart.js */}
          <div style={{ position: 'relative', width: '100%', height: 180 }}>
            <canvas id="mrrChart" role="img"
              aria-label="MRR trend line chart 2026">
              MRR trend 2026
            </canvas>
          </div>
          {!isLSConnected && (
            <p className="text-[11px] text-center mt-2" style={{ color: C.muted }}>
              Connect LemonSqueezy to see real revenue data
            </p>
          )}
        </div>
      </div>

      {/* ── Transaction ledger ── */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <div className="flex items-center gap-3">
            <p className="text-[13px] font-black" style={{ color: C.dark }}>
              Transaction Ledger
            </p>
            {!isLSConnected && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: C.amber }}>
                PREVIEW DATA
              </span>
            )}
            {/* Search bar inline */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: C.muted }} />
              <input
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search email, invoice, plan..."
                className="h-8 pl-7 pr-7 rounded-lg border text-[11px] outline-none"
                style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text, width: 220 }}
              />
              {searchQuery && (
                <button onClick={() => handleSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
                  <X size={11} style={{ color: C.muted }} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'paid', 'active', 'failed', 'trial', 'refunded', 'cancelled', 'expired'].map(s => (
              <button key={s} onClick={() => handleFilterChange(s)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all"
                style={{
                  backgroundColor: filterStatus === s ? C.dark  : C.surface,
                  color:           filterStatus === s ? C.lime  : C.muted,
                  border:          `1px solid ${filterStatus === s ? C.dark : C.border}`,
                }}>
                {s}
              </button>
            ))}
            <button onClick={() => loadData()}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
              style={{ border: `1px solid ${C.border}` }}>
              <RefreshCw size={12} style={{ color: C.muted }} />
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-80"
              style={{ backgroundColor: C.dark, color: C.lime }}>
              <Download size={11} /> Export
            </button>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto w-full">
          <table style={{ minWidth: 1500, width: '100%', borderCollapse: 'collapse' }}>

            {/* Column widths */}
            <colgroup>
              <col style={{ width: 44  }} /> {/* # */}
              <col style={{ width: 180 }} /> {/* USER */}
              <col style={{ width: 80  }} /> {/* PLAN */}
              <col style={{ width: 85  }} /> {/* AMOUNT */}
              <col style={{ width: 85  }} /> {/* STATUS */}
              <col style={{ width: 75  }} /> {/* BILLING */}
              <col style={{ width: 70  }} /> {/* RENEWS */}
              <col style={{ width: 110 }} /> {/* NEXT BILLING */}
              <col style={{ width: 155 }} /> {/* PAYMENT METHOD */}
              <col style={{ width: 105 }} /> {/* SUB ID */}
              <col style={{ width: 75  }} /> {/* LTV */}
              <col style={{ width: 105 }} /> {/* TRIAL END */}
              <col style={{ width: 90  }} /> {/* COUPON */}
              <col style={{ width: 55  }} /> {/* CTRY */}
              <col style={{ width: 65  }} /> {/* DATE */}
              <col style={{ width: 65  }} /> {/* ACTION */}
            </colgroup>

            {/* Header */}
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {[
                  { label: '#',              align: 'left'   },
                  { label: 'USER',           align: 'left'   },
                  { label: 'PLAN',           align: 'left'   },
                  { label: 'AMOUNT',         align: 'left'   },
                  { label: 'STATUS',         align: 'left'   },
                  { label: 'BILLING',        align: 'left'   },
                  { label: 'RENEWS',         align: 'left'   },
                  { label: 'NEXT BILLING',   align: 'left'   },
                  { label: 'PAYMENT METHOD', align: 'left'   },
                  { label: 'SUB ID',         align: 'left'   },
                  { label: 'LTV',            align: 'left'   },
                  { label: 'TRIAL END',      align: 'left'   },
                  { label: 'COUPON',         align: 'left'   },
                  { label: 'CTRY',           align: 'center' },
                  { label: 'DATE',           align: 'center' },
                  { label: '',               align: 'right'  },
                ].map((h, i) => (
                  <th key={i}
                    className="text-[9px] font-black tracking-wider px-3 py-3"
                    style={{ color: C.muted, textAlign: h.align as any, fontWeight: 900 }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign size={28} style={{ color: C.border }} />
                      <p className="text-[13px] font-bold" style={{ color: C.muted }}>No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTxns.map((txn, i) => {
                  const sc = statusColor(txn.status)
                  const pc = planColor(txn.plan)
                  return (
                    <tr key={txn.id}
                        className="hover:opacity-80 transition-colors"
                        style={{ borderBottom: `1px solid ${C.border}` }}>

                      {/* # */}
                      <td className="px-3 py-4 text-[11px] font-mono" style={{ color: C.muted }}>
                        #{String((currentPage - 1) * perPage + i + 1).padStart(3, '0')}
                      </td>

                      {/* User */}
                      <td className="px-3 py-4">
                        <p className="text-[12px] font-semibold truncate" style={{ color: C.text, maxWidth: 165 }}>{txn.user}</p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: C.muted }}>{txn.invoice}</p>
                      </td>

                      {/* Plan */}
                      <td className="px-3 py-4">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg capitalize"
                              style={{ backgroundColor: pc.bg, color: pc.color }}>{txn.plan}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-4 text-[13px] font-black" style={{ color: C.dark }}>
                        ${txn.amount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                          <span className="text-[11px] font-bold capitalize" style={{ color: sc.color }}>{txn.status}</span>
                        </div>
                      </td>

                      {/* Billing */}
                      <td className="px-3 py-4 text-[11px] font-semibold capitalize" style={{ color: C.muted }}>
                        {txn.billing}
                      </td>

                      {/* Renews */}
                      <td className="px-3 py-4 text-[11px] font-semibold"
                          style={{ color: txn.renewsIn === 0 ? C.red : txn.renewsIn <= 7 ? C.amber : C.muted }}>
                        {txn.renewsIn === 0 ? '—' : txn.renewsIn <= 30 ? `${txn.renewsIn}d` : `${Math.round(txn.renewsIn / 30)}mo`}
                      </td>

                      {/* Next Billing */}
                      <td className="px-3 py-4 text-[11px] font-semibold" style={{ color: C.text }}>
                        {txn.nextBilling}
                      </td>

                      {/* Payment Method */}
                      <td className="px-3 py-4 text-[11px] font-mono" style={{ color: C.muted }}>
                        {txn.paymentMethod}
                      </td>

                      {/* Sub ID */}
                      <td className="px-3 py-4 text-[10px] font-mono" style={{ color: C.muted }}>
                        {txn.subId}
                      </td>

                      {/* LTV */}
                      <td className="px-3 py-4 text-[12px] font-black"
                          style={{ color: txn.ltv > 0 ? C.limeDeep : C.muted }}>
                        ${txn.ltv.toFixed(2)}
                      </td>

                      {/* Trial End */}
                      <td className="px-3 py-4 text-[11px] font-semibold"
                          style={{ color: txn.trialEnd ? C.amber : C.muted }}>
                        {txn.trialEnd ?? '—'}
                      </td>

                      {/* Coupon */}
                      <td className="px-3 py-4">
                        {txn.coupon
                          ? <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                                  style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}40` }}>
                              {txn.coupon}
                            </span>
                          : <span style={{ color: C.muted }}>—</span>}
                      </td>

                      {/* Country */}
                      <td className="px-3 py-4 text-[11px] font-mono font-bold text-center" style={{ color: C.muted }}>
                        {txn.country}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-4 text-[11px] text-center" style={{ color: C.muted }}>
                        {timeAgo(txn.date)}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-4 text-right">
                        {txn.status === 'failed' ? (
                          <button onClick={() => setRetryTxn(txn)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg hover:opacity-80 ml-auto"
                            style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                            <Zap size={9} /> Retry
                          </button>
                        ) : txn.status === 'paid' || txn.status === 'active' ? (
                          <button onClick={() => setRefundTxn(txn)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg hover:opacity-80 ml-auto"
                            style={{ backgroundColor: 'rgba(217,119,6,0.08)', color: C.amber }}>
                            <RotateCcw size={9} /> Refund
                          </button>
                        ) : (
                        <button
                          onClick={() => { setSubTxn(txn); setSubAction(null); setSubError(null); setSubSuccess(null) }}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 ml-auto"
                          style={{ border: `1px solid ${C.border}` }}>
                          <ChevronRight size={12} style={{ color: C.muted }} />
                        </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>

          {/* Left — showing info + per page selector */}
          <div className="flex items-center gap-3">
            <p className="text-[11px]" style={{ color: C.muted }}>
              Showing{' '}
              <span className="font-bold" style={{ color: C.text }}>
                {Math.min((currentPage - 1) * perPage + 1, filteredTxns.length)}–{Math.min(currentPage * perPage, filteredTxns.length)}
              </span>
              {' '}of{' '}
              <span className="font-bold" style={{ color: C.text }}>{filteredTxns.length}</span>
              {' '}transactions
            </p>

            {/* Per page selector */}
            <div className="relative">
              <button onClick={() => setShowPerPage(s => !s)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
                style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.muted }}>
                {perPage} / page
                <ChevronRight size={10} style={{ transform: showPerPage ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }} />
              </button>
              {showPerPage && (
                <div className="absolute left-0 bottom-9 z-50 rounded-xl border overflow-hidden shadow-lg"
                     style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 110 }}>
                  <div className="px-3 py-2 border-b"
                       style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>ROWS PER PAGE</p>
                  </div>
                  {[10, 25, 50].map(n => (
                    <button key={n}
                      onClick={() => { setPerPage(n); setCurrentPage(1); setShowPerPage(false) }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:opacity-80 transition-all"
                      style={{ backgroundColor: perPage === n ? C.limeTint : 'transparent' }}>
                      <span className="text-[12px] font-semibold"
                            style={{ color: perPage === n ? C.limeDeep : C.text }}>{n} rows</span>
                      {perPage === n && <CheckCircle size={11} style={{ color: C.limeDeep }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — page controls */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 hover:opacity-70"
              style={{ border: `1px solid ${C.border}` }}>
              <ChevronRight size={12} style={{ color: C.muted, transform: 'rotate(180deg) scaleX(2)' }} />
            </button>

            {/* Prev */}
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 hover:opacity-70"
              style={{ border: `1px solid ${C.border}` }}>
              <ChevronRight size={12} style={{ color: C.muted, transform: 'rotate(180deg)' }} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) => (
                typeof p === 'string' ? (
                  <span key={`dot-${i}`} className="text-[11px] px-1" style={{ color: C.muted }}>…</span>
                ) : (
                  <button key={p} onClick={() => setCurrentPage(p as number)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: currentPage === p ? C.dark  : C.surface,
                      color:           currentPage === p ? C.lime  : C.muted,
                      border:          `1px solid ${currentPage === p ? C.dark : C.border}`,
                    }}>
                    {p}
                  </button>
                )
              ))
            }

            {/* Next */}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 hover:opacity-70"
              style={{ border: `1px solid ${C.border}` }}>
              <ChevronRight size={12} style={{ color: C.muted }} />
            </button>

            {/* Last page */}
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 hover:opacity-70"
              style={{ border: `1px solid ${C.border}` }}>
              <ChevronRight size={12} style={{ color: C.muted, transform: 'scaleX(2)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'Connect LemonSqueezy',
            desc:  'Add your API key to start accepting payments',
            color: C.amber,
            bg:    'rgba(217,119,6,0.08)',
            action: () => onNavigate ? onNavigate(9) : router.push('/dashboard/admin?settings=api-vault'),
            cta:   'Go to API Vault',
          },
          {
            title: 'View Pricing Page',
            desc:  'See how your plans look to potential customers',
            color: C.limeDeep,
            bg:    C.limeTint,
            action: () => window.open('/pricing', '_blank'),
            cta:   'Open Pricing Page',
          },
          {
            title: 'Manage Plan Limits',
            desc:  'Edit what each plan tier can access',
            color: C.blue,
            bg:    'rgba(29,78,216,0.08)',
            action: () => onNavigate ? onNavigate(5) : router.push('/dashboard/admin?settings=plan-limits'),
            cta:   'Edit Plan Limits',
          },
        ].map((action, i) => {
          const arrow = React.createElement(ChevronRight, { size: 11, style: { color: action.color } })
          return (
            <button key={i} onClick={action.action}
               className="flex items-center justify-between p-4 rounded-2xl border hover:opacity-80 transition-all text-left"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div>
                <p className="text-[13px] font-bold mb-0.5" style={{ color: C.dark }}>
                  {action.title}
                </p>
                <p className="text-[11px]" style={{ color: C.muted }}>{action.desc}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 ml-3"
                   style={{ backgroundColor: action.bg, color: action.color }}>
                {action.cta} {arrow}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Billing Management Drawer ── */}
      {retryTxn !== null && (
        <div className="fixed inset-0 z-[10500] flex items-end sm:items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={() => setRetryTxn(null)}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
               style={{ backgroundColor: C.surface }}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div>
                <p className="text-[15px] font-black" style={{ color: C.dark }}>
                  Failed Payment
                </p>
                <p className="text-[11px]" style={{ color: C.muted }}>
                  {retryTxn!.user}
                </p>
              </div>
              <button onClick={() => setRetryTxn(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
                style={{ border: `1px solid ${C.border}` }}>
                <X size={14} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 flex flex-col gap-4">
              <div className="p-4 rounded-2xl border" style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.04)' }}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Transaction ID', value: retryTxn!.id },
                    { label: 'Plan',           value: retryTxn!.plan.charAt(0).toUpperCase() + retryTxn!.plan.slice(1) },
                    { label: 'Amount',         value: `$${retryTxn!.amount.toFixed(2)}` },
                    { label: 'Billing',        value: retryTxn!.billing.charAt(0).toUpperCase() + retryTxn!.billing.slice(1) },
                    { label: 'Failed',         value: timeAgo(retryTxn!.date) },
                    { label: 'Status',         value: 'Payment Failed' },
                  ].map((row, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: C.muted }}>{row.label}</p>
                      <p className="text-[12px] font-semibold" style={{ color: C.text }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice link */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                  INVOICE LINK
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-xl border text-[11px] font-mono truncate"
                       style={{ backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
                    https://app.lemonsqueezy.com/orders/{retryTxn!.id}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://app.lemonsqueezy.com/orders/${retryTxn!.id}`)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold hover:opacity-80 shrink-0"
                    style={{ backgroundColor: C.dark, color: C.lime }}>
                    {copied ? <CheckCircle size={11} /> : <Download size={11} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setTransactions(prev => prev.map(t =>
                      t.id === retryTxn!.id ? { ...t, status: 'paid' } : t
                    ))
                    setRetryTxn(null)
                  }}
                  className="w-full py-3 rounded-2xl font-black text-[13px] hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: C.dark, color: C.lime }}>
                  <Zap size={14} /> Retry Payment Now
                </button>
                <button
                  onClick={() => {
                    setFlagged(prev => [...prev, retryTxn!.id])
                    setTransactions(prev => prev.map(t =>
                      t.id === retryTxn!.id ? { ...t, status: 'failed' } : t
                    ))
                    setRetryTxn(null)
                  }}
                  className="w-full py-3 rounded-2xl font-black text-[13px] hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
                  <AlertTriangle size={14} /> Flag for Manual Review
                </button>
                <button onClick={() => setRetryTxn(null)}
                  className="w-full py-2.5 rounded-2xl text-[12px] font-semibold hover:opacity-70"
                  style={{ color: C.muted }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Refund Drawer ── */}
      {refundTxn !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-end"
             style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
             onClick={() => { setRefundTxn(null); setRefundError(null) }}>
          <div className="h-full w-full max-w-sm flex flex-col shadow-2xl"
               style={{ backgroundColor: C.surface }}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: C.border }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(217,119,6,0.1)' }}>
                  <RotateCcw size={16} style={{ color: C.amber }} />
                </div>
                <div>
                  <p className="text-[15px] font-black" style={{ color: C.dark }}>Issue Refund</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>{refundTxn!.user}</p>
                </div>
              </div>
              <button onClick={() => { setRefundTxn(null); setRefundError(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
                style={{ border: `1px solid ${C.border}` }}>
                <X size={14} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">

              {/* Preview warning */}
              {!refundTxn!.lsOrderId && (
                <div className="flex items-start gap-3 p-3 rounded-xl border"
                     style={{ backgroundColor: 'rgba(217,119,6,0.06)', borderColor: 'rgba(217,119,6,0.2)' }}>
                  <AlertTriangle size={14} style={{ color: C.amber, marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: C.amber }}>Preview data only</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                      This is mock data with no real LemonSqueezy order ID. Refunds only work with real transactions.
                    </p>
                  </div>
                </div>
              )}

              {/* Real warning */}
              {refundTxn!.lsOrderId && (
                <div className="flex items-start gap-3 p-3 rounded-xl border"
                     style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.15)' }}>
                  <AlertTriangle size={14} style={{ color: C.red, marginTop: 1, flexShrink: 0 }} />
                  <p className="text-[11px]" style={{ color: C.red }}>
                    This will issue a refund via LemonSqueezy. This action cannot be undone and the user's plan will be downgraded to Free.
                  </p>
                </div>
              )}

              {/* Transaction details */}
              <div className="p-4 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Invoice',  value: refundTxn!.invoice },
                    { label: 'Plan',     value: refundTxn!.plan.charAt(0).toUpperCase() + refundTxn!.plan.slice(1) },
                    { label: 'Amount',   value: `$${refundTxn!.amount.toFixed(2)}` },
                    { label: 'Billing',  value: refundTxn!.billing.charAt(0).toUpperCase() + refundTxn!.billing.slice(1) },
                    { label: 'Paid',     value: timeAgo(refundTxn!.date) },
                    { label: 'LS Order', value: refundTxn!.lsOrderId ?? '—' },
                  ].map((row, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: C.muted }}>{row.label}</p>
                      <p className="text-[12px] font-semibold font-mono truncate" style={{ color: C.text }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund type */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                  REFUND TYPE
                </p>
                <div className="flex items-center rounded-lg p-0.5"
                     style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  {(['full', 'partial'] as const).map(t => (
                    <button key={t} onClick={() => setRefundType(t)}
                      className="flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize transition-all"
                      style={{
                        backgroundColor: refundType === t ? C.dark  : 'transparent',
                        color:           refundType === t ? C.lime  : C.muted,
                      }}>
                      {t === 'full' ? `Full — $${refundTxn!.amount.toFixed(2)}` : 'Partial'}
                    </button>
                  ))}
                </div>

                {/* Partial amount input */}
                {refundType === 'partial' && (
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold"
                          style={{ color: C.muted }}>$</span>
                    <input
                      type="number"
                      min="0.01"
                      max={refundTxn!.amount}
                      step="0.01"
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      placeholder={`Max $${refundTxn!.amount.toFixed(2)}`}
                      className="w-full h-9 pl-6 pr-3 rounded-xl border text-[12px] font-mono outline-none"
                      style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }}
                    />
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                  REASON <span style={{ color: C.red }}>*</span>
                </p>
                <div className="relative">
                  <button
                    onClick={() => setShowReasonDropdown(s => !s)}
                    className="w-full flex items-center justify-between px-3 h-9 rounded-xl border text-[12px] transition-all"
                    style={{
                      backgroundColor: C.surface,
                      borderColor:     refundReason ? C.border : 'rgba(185,28,28,0.3)',
                      color:           refundReason ? C.text   : C.muted,
                    }}>
                    <span>
                      {refundReason === 'customer_request'        ? 'Customer request'          :
                       refundReason === 'duplicate_charge'        ? 'Duplicate charge'          :
                       refundReason === 'product_not_as_described'? 'Product not as described'  :
                       refundReason === 'fraud'                   ? 'Fraud / Unauthorized'      :
                       refundReason === 'technical_issue'         ? 'Technical issue'           :
                       refundReason === 'other'                   ? 'Other'                     :
                       'Select a reason...'}
                    </span>
                    <ChevronRight size={12} style={{ color: C.muted, transform: showReasonDropdown ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
                  </button>

                  {showReasonDropdown && (
                    <div className="absolute left-0 right-0 top-10 z-50 rounded-xl border overflow-hidden"
                         style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <div className="px-3 py-2 border-b"
                           style={{ borderColor: C.border, backgroundColor: C.bg }}>
                        <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>SELECT REASON</p>
                      </div>
                      {[
                        { value: 'customer_request',         label: 'Customer request'         },
                        { value: 'duplicate_charge',         label: 'Duplicate charge'         },
                        { value: 'product_not_as_described', label: 'Product not as described' },
                        { value: 'fraud',                    label: 'Fraud / Unauthorized'     },
                        { value: 'technical_issue',          label: 'Technical issue'          },
                        { value: 'other',                    label: 'Other'                    },
                      ].map(opt => (
                        <button key={opt.value}
                          onClick={() => { setRefundReason(opt.value); setShowReasonDropdown(false) }}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:opacity-80 transition-all text-left"
                          style={{ backgroundColor: refundReason === opt.value ? C.limeTint : 'transparent' }}>
                          <span className="text-[12px] font-semibold"
                                style={{ color: refundReason === opt.value ? C.limeDeep : C.text }}>
                            {opt.label}
                          </span>
                          {refundReason === opt.value && (
                            <CheckCircle size={11} style={{ color: C.limeDeep }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Internal note */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                  INTERNAL NOTE
                </p>
                <textarea
                  value={refundNote}
                  onChange={e => setRefundNote(e.target.value)}
                  placeholder="Add a note for your records (not shown to customer)..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
                  style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }}
                />
              </div>

              {/* Notify customer toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border"
                   style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>Notify customer</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>Send refund confirmation email</p>
                </div>
                <button onClick={() => setNotifyCustomer(s => !s)}
                  className="relative w-11 h-6 rounded-full transition-all"
                  style={{ backgroundColor: notifyCustomer ? C.dark : C.border }}>
                  <div style={{
                    position:        'absolute',
                    top:             2, left: 2,
                    width:           20, height: 20,
                    borderRadius:    '50%',
                    backgroundColor: notifyCustomer ? C.lime : C.surface,
                    transform:       notifyCustomer ? 'translateX(20px)' : 'translateX(0)',
                    transition:      'transform 0.2s ease',
                  }} />
                </button>
              </div>

              {/* Error */}
              {refundError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border"
                     style={{ backgroundColor: 'rgba(185,28,28,0.06)', borderColor: 'rgba(185,28,28,0.2)' }}>
                  <XCircle size={13} style={{ color: C.red }} />
                  <p className="text-[11px] font-semibold" style={{ color: C.red }}>{refundError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  disabled={refundLoading || !refundTxn!.lsOrderId || !refundReason || (refundType === 'partial' && !refundAmount)}
                  onClick={async () => {
                    if (!refundReason) { setRefundError('Please select a reason'); return }
                    const finalAmount = refundType === 'full'
                      ? refundTxn!.amount
                      : parseFloat(refundAmount)
                    if (refundType === 'partial' && (isNaN(finalAmount) || finalAmount <= 0 || finalAmount > refundTxn!.amount)) {
                      setRefundError(`Partial amount must be between $0.01 and $${refundTxn!.amount.toFixed(2)}`)
                      return
                    }
                    setRefundLoading(true)
                    setRefundError(null)
                    try {
                      const res = await fetch('/api/admin/refund', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({
                          transactionId:  refundTxn!.id,
                          lsOrderId:      refundTxn!.lsOrderId,
                          userId:         refundTxn!.userId,
                          amount:         finalAmount,
                          refundReason,
                          refundNote,
                          notifyCustomer,
                        }),
                      })
                      const data = await res.json()
                      if (data.success) {
                        setTransactions(prev => prev.map(t =>
                          t.id === refundTxn!.id ? { ...t, status: 'refunded', ltv: 0 } : t
                        ))
                        setRefundTxn(null)
                        setRefundError(null)
                        setRefundReason('')
                        setRefundNote('')
                        setRefundType('full')
                        setRefundAmount('')
                        setNotifyCustomer(true)
                      } else {
                        setRefundError(data.error ?? 'Refund failed')
                      }
                    } catch {
                      setRefundError('Network error — please try again')
                    }
                    setRefundLoading(false)
                  }}
                  className="w-full py-3 rounded-2xl font-black text-[13px] hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: refundTxn!.lsOrderId ? C.amber : C.border,
                    color:           refundTxn!.lsOrderId ? '#fff'   : C.muted,
                  }}>
                  {refundLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                           style={{ borderTopColor: '#fff' }} />
                      Processing...
                    </>
                  ) : (
                    <><RotateCcw size={14} />
                      {refundTxn!.lsOrderId
                        ? `Confirm ${refundType === 'full' ? 'Full' : 'Partial'} Refund`
                        : 'No Order ID — Preview Only'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setRefundTxn(null); setRefundError(null)
                    setRefundReason(''); setRefundNote('')
                    setRefundType('full'); setRefundAmount('')
                    setNotifyCustomer(true); setShowReasonDropdown(false)
                  }}
                  className="w-full py-2.5 rounded-2xl text-[12px] font-semibold hover:opacity-70"
                  style={{ color: C.muted }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscription Management Drawer ── */}
      {subTxn !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-end"
             style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
             onClick={() => { setSubTxn(null); setSubAction(null); setSubError(null); setSubSuccess(null) }}>
          <div className="h-full w-full max-w-sm flex flex-col shadow-2xl"
               style={{ backgroundColor: C.surface }}
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: C.border }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: C.limeTint }}>
                  <Users size={16} style={{ color: C.limeDeep }} />
                </div>
                <div>
                  <p className="text-[15px] font-black" style={{ color: C.dark }}>Subscription</p>
                  <p className="text-[11px] truncate" style={{ color: C.muted, maxWidth: 200 }}>{subTxn!.user}</p>
                </div>
              </div>
              <button onClick={() => { setSubTxn(null); setSubAction(null); setSubError(null); setSubSuccess(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
                style={{ border: `1px solid ${C.border}` }}>
                <X size={14} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">

              {/* Subscription details */}
              <div className="p-4 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Plan',    value: subTxn!.plan.charAt(0).toUpperCase() + subTxn!.plan.slice(1) },
                    { label: 'Status',  value: subTxn!.status.charAt(0).toUpperCase() + subTxn!.status.slice(1) },
                    { label: 'Billing', value: subTxn!.billing.charAt(0).toUpperCase() + subTxn!.billing.slice(1) },
                    { label: 'Amount',  value: `$${subTxn!.amount.toFixed(2)}` },
                    { label: 'Sub ID',  value: subTxn!.subId },
                    { label: 'Renews',  value: subTxn!.nextBilling },
                  ].map((row, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: C.muted }}>{row.label}</p>
                      <p className="text-[12px] font-semibold truncate" style={{ color: C.text }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success */}
              {subSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl border"
                     style={{ backgroundColor: C.limeTint, borderColor: C.limeDeep + '40' }}>
                  <CheckCircle size={13} style={{ color: C.limeDeep }} />
                  <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>{subSuccess}</p>
                </div>
              )}

              {/* Error */}
              {subError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border"
                     style={{ backgroundColor: 'rgba(185,28,28,0.06)', borderColor: 'rgba(185,28,28,0.2)' }}>
                  <XCircle size={13} style={{ color: C.red }} />
                  <p className="text-[11px] font-semibold" style={{ color: C.red }}>{subError}</p>
                </div>
              )}

              {/* Action menu */}
              {!subAction && !subSuccess && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SUBSCRIPTION ACTIONS</p>

                  <button onClick={() => { setSubAction('change_plan'); setSubNewPlan(subTxn!.plan); setSubNewBilling(subTxn!.billing as any) }}
                    className="flex items-center justify-between p-3.5 rounded-2xl border hover:opacity-80 transition-all"
                    style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.limeTint }}>
                        <TrendingUp size={14} style={{ color: C.limeDeep }} />
                      </div>
                      <div className="text-left">
                        <p className="text-[12px] font-bold" style={{ color: C.dark }}>Change Plan</p>
                        <p className="text-[10px]" style={{ color: C.muted }}>Upgrade or downgrade</p>
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: C.muted }} />
                  </button>

                  {subTxn!.status === 'cancelled' && (
                    <button onClick={() => setSubAction('resume')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border hover:opacity-80 transition-all"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}>
                          <RefreshCw size={14} style={{ color: C.green }} />
                        </div>
                        <div className="text-left">
                          <p className="text-[12px] font-bold" style={{ color: C.dark }}>Resume Subscription</p>
                          <p className="text-[10px]" style={{ color: C.muted }}>Reactivate cancelled plan</p>
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ color: C.muted }} />
                    </button>
                  )}

                  {subTxn!.status !== 'cancelled' && subTxn!.status !== 'expired' && (
                    <button onClick={() => setSubAction('cancel')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border hover:opacity-80 transition-all"
                      style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.03)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                          <XCircle size={14} style={{ color: C.red }} />
                        </div>
                        <div className="text-left">
                          <p className="text-[12px] font-bold" style={{ color: C.red }}>Cancel Subscription</p>
                          <p className="text-[10px]" style={{ color: C.muted }}>Stop recurring payments</p>
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ color: C.muted }} />
                    </button>
                  )}
                </div>
              )}

              {/* Change Plan */}
              {subAction === 'change_plan' && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setSubAction(null)} className="flex items-center gap-1.5 text-[11px] font-bold hover:opacity-70" style={{ color: C.muted }}>
                    <ChevronRight size={11} style={{ transform: 'rotate(180deg)' }} /> Back
                  </button>
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SELECT NEW PLAN</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { plan: 'starter', label: 'Starter', monthly: '$19/mo', annual: '$182/yr' },
                      { plan: 'growth',  label: 'Growth',  monthly: '$49/mo', annual: '$470/yr' },
                      { plan: 'custom',  label: 'Custom',  monthly: '$149/mo', annual: '$1,430/yr' },
                    ].map(p => (
                      <button key={p.plan} onClick={() => setSubNewPlan(p.plan)}
                        className="flex items-center justify-between p-3 rounded-xl border transition-all"
                        style={{ borderColor: subNewPlan === p.plan ? C.limeDeep : C.border, backgroundColor: subNewPlan === p.plan ? C.limeTint : C.bg }}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: subNewPlan === p.plan ? C.limeDeep : C.border }}>
                            {subNewPlan === p.plan && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.limeDeep }} />}
                          </div>
                          <span className="text-[12px] font-bold" style={{ color: C.dark }}>{p.label}</span>
                        </div>
                        <span className="text-[11px]" style={{ color: C.muted }}>{subNewBilling === 'monthly' ? p.monthly : p.annual}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center rounded-lg p-0.5" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    {(['monthly', 'annual'] as const).map(b => (
                      <button key={b} onClick={() => setSubNewBilling(b)}
                        className="flex-1 py-1.5 rounded-md text-[11px] font-bold capitalize transition-all"
                        style={{ backgroundColor: subNewBilling === b ? C.dark : 'transparent', color: subNewBilling === b ? C.lime : C.muted }}>
                        {b}
                      </button>
                    ))}
                  </div>
                  <button disabled={subLoading || !subNewPlan || subNewPlan === subTxn!.plan}
                    onClick={async () => {
                      setSubLoading(true); setSubError(null)
                      try {
                        const res = await fetch('/api/admin/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'change_plan', lsSubId: subTxn!.subId, userId: subTxn!.userId, plan: subNewPlan, billing: subNewBilling }) })
                        const data = await res.json()
                        if (data.success) { setTransactions(prev => prev.map(t => t.id === subTxn!.id ? { ...t, plan: subNewPlan } : t)); setSubSuccess(`Plan changed to ${subNewPlan.charAt(0).toUpperCase() + subNewPlan.slice(1)}!`); setSubAction(null) }
                        else { setSubError(data.error ?? 'Failed') }
                      } catch { setSubError('Network error') }
                      setSubLoading(false)
                    }}
                    className="w-full py-3 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: C.dark, color: C.lime }}>
                    {subLoading ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> Updating...</> : 'Confirm Plan Change'}
                  </button>
                </div>
              )}

              {/* Cancel */}
              {subAction === 'cancel' && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setSubAction(null)} className="flex items-center gap-1.5 text-[11px] font-bold hover:opacity-70" style={{ color: C.muted }}>
                    <ChevronRight size={11} style={{ transform: 'rotate(180deg)' }} /> Back
                  </button>
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>CANCEL MODE</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { mode: 'end' as const, label: 'At period end', desc: `Access until ${subTxn!.nextBilling}` },
                      { mode: 'now' as const, label: 'Immediately',   desc: 'Access ends right now' },
                    ].map(m => (
                      <button key={m.mode} onClick={() => setCancelMode(m.mode)}
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                        style={{ borderColor: cancelMode === m.mode ? (m.mode === 'now' ? C.red : C.limeDeep) : C.border, backgroundColor: cancelMode === m.mode ? (m.mode === 'now' ? 'rgba(185,28,28,0.04)' : C.limeTint) : C.bg }}>
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: cancelMode === m.mode ? (m.mode === 'now' ? C.red : C.limeDeep) : C.border }}>
                          {cancelMode === m.mode && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.mode === 'now' ? C.red : C.limeDeep }} />}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold" style={{ color: C.dark }}>{m.label}</p>
                          <p className="text-[10px]" style={{ color: C.muted }}>{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button disabled={subLoading}
                    onClick={async () => {
                      setSubLoading(true); setSubError(null)
                      try {
                        const res = await fetch('/api/admin/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', lsSubId: subTxn!.subId, userId: subTxn!.userId, cancelAtPeriodEnd: cancelMode === 'end' }) })
                        const data = await res.json()
                        if (data.success) { setTransactions(prev => prev.map(t => t.id === subTxn!.id ? { ...t, status: 'cancelled' } : t)); setSubSuccess('Subscription cancelled successfully'); setSubAction(null) }
                        else { setSubError(data.error ?? 'Failed') }
                      } catch { setSubError('Network error') }
                      setSubLoading(false)
                    }}
                    className="w-full py-3 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>
                    {subLoading ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.red }} /> Cancelling...</> : <><XCircle size={14} /> Confirm Cancel</>}
                  </button>
                </div>
              )}

              {/* Resume */}
              {subAction === 'resume' && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setSubAction(null)} className="flex items-center gap-1.5 text-[11px] font-bold hover:opacity-70" style={{ color: C.muted }}>
                    <ChevronRight size={11} style={{ transform: 'rotate(180deg)' }} /> Back
                  </button>
                  <div className="p-4 rounded-xl border" style={{ backgroundColor: C.limeTint, borderColor: C.limeDeep + '40' }}>
                    <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>Resume subscription</p>
                    <p className="text-[11px] mt-1" style={{ color: C.muted }}>This will reactivate the subscription and resume billing on the next cycle.</p>
                  </div>
                  <button disabled={subLoading}
                    onClick={async () => {
                      setSubLoading(true); setSubError(null)
                      try {
                        const res = await fetch('/api/admin/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resume', lsSubId: subTxn!.subId, userId: subTxn!.userId }) })
                        const data = await res.json()
                        if (data.success) { setTransactions(prev => prev.map(t => t.id === subTxn!.id ? { ...t, status: 'active' } : t)); setSubSuccess('Subscription resumed successfully!'); setSubAction(null) }
                        else { setSubError(data.error ?? 'Failed') }
                      } catch { setSubError('Network error') }
                      setSubLoading(false)
                    }}
                    className="w-full py-3 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: C.dark, color: C.lime }}>
                    {subLoading ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> Resuming...</> : <><RefreshCw size={14} /> Confirm Resume</>}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}