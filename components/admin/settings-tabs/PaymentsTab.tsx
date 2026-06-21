'use client'
// components/admin/settings-tabs/PaymentsTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  DollarSign, TrendingUp, Users, AlertTriangle,
  RefreshCw, Download, CheckCircle, XCircle,
  Clock, ChevronRight, ExternalLink, Zap, X,
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
}

// ── Mock transaction data (until LemonSqueezy connected) ──────
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'txn_001', invoice: 'INV-2026-001', user: 'james.seller@gmail.com',  plan: 'growth',  amount: 49.00,  status: 'paid',     date: new Date(Date.now() - 2*3600000).toISOString(),   billing: 'monthly', country: 'US', renewsIn: 28,  nextBilling: 'Jul 18, 2026', paymentMethod: 'Visa •••• 4242',       subId: 'LS-SUB-0012', ltv: 147.00, trialEnd: null,            coupon: null        },
  { id: 'txn_002', invoice: 'INV-2026-002', user: 'sarah.ebay@outlook.com',  plan: 'starter', amount: 19.00,  status: 'paid',     date: new Date(Date.now() - 5*3600000).toISOString(),   billing: 'monthly', country: 'GB', renewsIn: 15,  nextBilling: 'Jul 05, 2026', paymentMethod: 'Mastercard •••• 1234', subId: 'LS-SUB-0013', ltv: 57.00,  trialEnd: null,            coupon: 'LAUNCH20'  },
  { id: 'txn_003', invoice: 'INV-2026-003', user: 'mike.trades@yahoo.com',   plan: 'growth',  amount: 470.00, status: 'paid',     date: new Date(Date.now() - 24*3600000).toISOString(),  billing: 'annual',  country: 'AU', renewsIn: 340, nextBilling: 'Jun 20, 2027', paymentMethod: 'Visa •••• 9876',       subId: 'LS-SUB-0014', ltv: 470.00, trialEnd: null,            coupon: null        },
  { id: 'txn_004', invoice: 'INV-2026-004', user: 'anna.shop@gmail.com',     plan: 'starter', amount: 19.00,  status: 'failed',   date: new Date(Date.now() - 36*3600000).toISOString(),  billing: 'monthly', country: 'US', renewsIn: 0,   nextBilling: '—',            paymentMethod: 'Visa •••• 0000',       subId: 'LS-SUB-0015', ltv: 19.00,  trialEnd: null,            coupon: null        },
  { id: 'txn_005', invoice: 'INV-2026-005', user: 'david.sell@gmail.com',    plan: 'growth',  amount: 49.00,  status: 'paid',     date: new Date(Date.now() - 48*3600000).toISOString(),  billing: 'monthly', country: 'CA', renewsIn: 22,  nextBilling: 'Jul 12, 2026', paymentMethod: 'PayPal',               subId: 'LS-SUB-0016', ltv: 245.00, trialEnd: null,            coupon: 'SAVE10'    },
  { id: 'txn_006', invoice: 'INV-2026-006', user: 'lisa.market@hotmail.com', plan: 'custom',  amount: 149.00, status: 'active',   date: new Date(Date.now() - 72*3600000).toISOString(),  billing: 'monthly', country: 'US', renewsIn: 8,   nextBilling: 'Jun 28, 2026', paymentMethod: 'Mastercard •••• 5555', subId: 'LS-SUB-0017', ltv: 596.00, trialEnd: null,            coupon: null        },
  { id: 'txn_007', invoice: 'INV-2026-007', user: 'tom.ebay@gmail.com',      plan: 'starter', amount: 19.00,  status: 'trial',    date: new Date(Date.now() - 4*86400000).toISOString(),  billing: 'monthly', country: 'DE', renewsIn: 10,  nextBilling: 'Jun 30, 2026', paymentMethod: 'Visa •••• 7890',       subId: 'LS-SUB-0018', ltv: 0.00,   trialEnd: 'Jun 30, 2026',  coupon: null        },
  { id: 'txn_008', invoice: 'INV-2026-008', user: 'kate.sells@gmail.com',    plan: 'growth',  amount: 49.00,  status: 'refunded', date: new Date(Date.now() - 5*86400000).toISOString(),  billing: 'monthly', country: 'FR', renewsIn: 0,   nextBilling: '—',            paymentMethod: 'Visa •••• 3333',       subId: 'LS-SUB-0019', ltv: 0.00,   trialEnd: null,            coupon: null        },
  { id: 'txn_009', invoice: 'INV-2026-009', user: 'paul.trade@yahoo.com',    plan: 'growth',  amount: 470.00, status: 'paid',     date: new Date(Date.now() - 7*86400000).toISOString(),  billing: 'annual',  country: 'US', renewsIn: 355, nextBilling: 'Jun 13, 2027', paymentMethod: 'Mastercard •••• 8888', subId: 'LS-SUB-0020', ltv: 940.00, trialEnd: null,            coupon: 'ANNUAL20'  },
  { id: 'txn_010', invoice: 'INV-2026-010', user: 'nina.shop@gmail.com',     plan: 'starter', amount: 182.00, status: 'paid',     date: new Date(Date.now() - 10*86400000).toISOString(), billing: 'annual',  country: 'SG', renewsIn: 320, nextBilling: 'Jun 10, 2027', paymentMethod: 'PayPal',               subId: 'LS-SUB-0021', ltv: 182.00, trialEnd: null,            coupon: null        },
]

// ── Monthly revenue chart data ─────────────────────────────────
const REVENUE_CHART = [
  { month: 'Jan', mrr: 0    },
  { month: 'Feb', mrr: 0    },
  { month: 'Mar', mrr: 0    },
  { month: 'Apr', mrr: 0    },
  { month: 'May', mrr: 0    },
  { month: 'Jun', mrr: 0    },
]

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
  const [isLSConnected, setIsLSConnected] = useState(false)
  const [retryTxn,     setRetryTxn]    = useState<Transaction | null>(null)
  const [copied,       setCopied]       = useState(false)
  const [flagged,      setFlagged]      = useState<string[]>([])

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
          }))
          setTransactions(mapped)
        }
      }

    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Calculate metrics from mock data (will use real data when LS connected)
  const paidTxns    = transactions.filter(t => t.status === 'paid' || t.status === 'active')
  const failedTxns  = transactions.filter(t => t.status === 'failed')
  const mrr         = paidTxns.filter(t => t.billing === 'monthly').reduce((s, t) => s + t.amount, 0)
               + paidTxns.filter(t => t.billing === 'annual').reduce((s, t) => s + t.amount / 12, 0)
  const arr         = mrr * 12

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

  const filteredTxns = filterStatus === 'all'
    ? transactions
    : transactions.filter(t => t.status === filterStatus)

  const maxMRR = Math.max(...REVENUE_CHART.map(r => r.mrr), 1)

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
            color: C.limeDeep,
            bg:    C.limeTint,
            trend: '+0% this month',
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
              { tier: 'free',    label: 'Free',    price: '$0' },
              { tier: 'starter', label: 'Starter', price: '$19/mo' },
              { tier: 'growth',  label: 'Growth',  price: '$49/mo' },
              { tier: 'custom',  label: 'Custom',  price: '$149/mo' },
            ].map(p => {
              const count = mockPlanCounts[p.tier] ?? 0
              const pct   = mockTotalForDist > 0 ? Math.round((count / mockTotalForDist) * 100) : 0
              const pc    = planColor(p.tier)
              return (
                <div key={p.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg font-bold"
                            style={{ backgroundColor: pc.bg, color: pc.color }}>
                        {p.label}
                      </span>
                      <span className="text-[11px]" style={{ color: C.muted }}>{p.price}</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: C.text }}>
                      {count} users
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${pct}%`, backgroundColor: pc.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
              MRR TREND — 2026
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                  style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              {isLSConnected ? 'LIVE' : 'PREVIEW'}
            </span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {REVENUE_CHART.map((r, i) => {
              const height = maxMRR > 0 ? Math.max((r.mrr / maxMRR) * 100, 4) : 4
              const isLast = i === REVENUE_CHART.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg transition-all"
                       style={{
                         height:          `${height}%`,
                         backgroundColor: isLast ? C.lime : C.border,
                         minHeight:       4,
                       }} />
                  <span className="text-[9px]" style={{ color: C.muted }}>{r.month}</span>
                </div>
              )
            })}
          </div>
          {!isLSConnected && (
            <p className="text-[11px] text-center mt-3" style={{ color: C.muted }}>
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
          </div>
          <div className="flex items-center gap-2">
            {['all', 'paid', 'failed', 'trial', 'refunded'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
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
                filteredTxns.map((txn, i) => {
                  const sc = statusColor(txn.status)
                  const pc = planColor(txn.plan)
                  return (
                    <tr key={txn.id}
                        className="hover:bg-[#fafcf8] transition-colors"
                        style={{ borderBottom: `1px solid ${C.border}` }}>

                      {/* # */}
                      <td className="px-3 py-4 text-[11px] font-mono" style={{ color: C.muted }}>
                        #{String(i + 1).padStart(3, '0')}
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
                        ) : (
                          <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 ml-auto"
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

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <p className="text-[11px]" style={{ color: C.muted }}>
            Showing {filteredTxns.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} style={{ color: C.green }} />
              <span className="text-[11px]" style={{ color: C.muted }}>
                {paidTxns.length} paid
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle size={12} style={{ color: C.red }} />
              <span className="text-[11px]" style={{ color: C.muted }}>
                {failedTxns.length} failed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} style={{ color: C.amber }} />
              <span className="text-[11px]" style={{ color: C.muted }}>
                {transactions.filter(t => t.status === 'trial').length} trial
              </span>
            </div>
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

    </div>
  )
}