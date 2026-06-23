'use client'
// components/admin/tabs/RevenueAnalyticsTab.tsx
// Full rebuild — Option 2 design with real Supabase data

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { UserDetailDrawer } from '@/components/admin/settings-tabs/UserDetailDrawer'
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign,
  Users, RefreshCw, ArrowUpRight, ArrowDownRight, Shield,
  Pencil, Check, Copy, Trophy, Download,
  ChevronsUpDown, ChevronUp, ChevronDown, CheckCircle,
  FileText, Zap, BarChart2,
} from 'lucide-react'

const C = {
  lime:    '#8FFF00',
  dark:    '#0F172A',
  border:  '#E2E8F0',
  bg:      '#F8FAFC',
  text:    '#0F172A',
  muted:   '#64748B',
  hint:    '#94A3B8',
  green:   '#16A34A',
  red:     '#F87171',
  blue:    '#378ADD',
  orange:  '#FB923C',
  purple:  '#8B5CF6',
}

const PLAN_COLORS: Record<string, string> = {
  'Free': C.blue,
  'Starter':   C.lime,
  'Growth': C.orange,
  'trial':      C.blue,
  'active':     C.lime,
  'cancelled':  C.red,
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface Props {
  isDesktop?:           boolean
  isInvestorMode?:      boolean
  startChartAnimation?: boolean
}

interface Stats {
  mrr:           number
  revToday:      number
  activeSubs:    number
  totalUsers:    number
  convRate:      number
  churnRate:     number
  arpu:           number
  paidUserCount:  number
  arpuLastMonth:  number
  arpuDiff:       number
  newSubsMonth:   number
  arrProjected:   number
  arr:           number
  mrrLastMonth:  number
  peakMrr:       number
  peakMonth:     string
  forecastRev:   number
  forecastCount: number
  mrrGrowth:     { month: string; mrr: number; subs: number; conv: number; churn: number; projected: boolean }[]
  planDist:      { name: string; value: number; revenue: number; color: string }[]
  transactions:  any[]
  sparkline:     { day: string; rev: number }[]
  ltvMap:        Record<string, number>
  goals:         { monthly: number; quarterly: number; annual: number }
  loading:       boolean
}

const DEFAULT: Stats = {
  mrr: 0, revToday: 0, activeSubs: 0, totalUsers: 0,
  convRate: 0, churnRate: 0, arpu: 0, paidUserCount: 0,
  arpuLastMonth: 0, arpuDiff: 0, newSubsMonth: 0, arrProjected: 0, arr: 0,
  mrrLastMonth: 0, forecastRev: 0, forecastCount: 0, peakMrr: 0, peakMonth: '',
  mrrGrowth: [], planDist: [], transactions: [], sparkline: [], ltvMap: {},
  goals: { monthly: 500, quarterly: 1500, annual: 6000 },
  loading: true,
}

// ── Custom multi-line tooltip ─────────────────────────────────
function MultiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const items = [
    { key: 'mrr',   label: 'MRR',         color: '#8FFF00', format: (v: any) => `$${v}`  },
    { key: 'subs',  label: 'Active subs',  color: '#60A5FA', format: (v: any) => `${v}`   },
    { key: 'conv',  label: 'Conversion',   color: '#A78BFA', format: (v: any) => `${v}%`  },
    { key: 'churn', label: 'Churn',        color: '#FB923C', format: (v: any) => `${v}%`  },
  ]
  return (
    <div style={{
      backgroundColor: '#0F172A',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '8px 12px',
      fontSize: 11,
      minWidth: 130,
    }}>
      <p style={{ color: '#fff', fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {items.map(item => {
        const found = payload.find((p: any) => p.dataKey === item.key)
        if (!found) return null
        return (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '1px 0' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: 700 }}>{item.format(found.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Custom donut label ─────────────────────────────────────────
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function RevenueAnalyticsTab({
  isDesktop = true,
  isInvestorMode = false,
}: Props) {
  const supabase = createClient()
  const [stats,       setStats]      = useState<Stats>(DEFAULT)
  const [txFilter,      setTxFilter]    = useState<'all' | 'active' | 'trial' | 'cancelled' | 'refunded'>('all')
  const [txPage,        setTxPage]      = useState(1)
  const [txSearch,      setTxSearch]    = useState('')
  const [txSort,        setTxSort]      = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'paid_at', dir: 'desc' })
  const [txDateRange,   setTxDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'last_month' | 'year'>('all')
  const [planTooltip,    setPlanTooltip]   = useState<{ x: number; y: number; name: string; users: number; revenue: number; pct: number; color: string } | null>(null)
  const [serverCostEdit, setServerCostEdit] = useState(false)
  const [serverCostVal,  setServerCostVal]  = useState(45)
  const [drawerUser,     setDrawerUser]     = useState<any | null>(null)
  const [toastMsg,       setToastMsg]       = useState<{ msg: string; type: 'success'|'error'|'info' } | null>(null)

  function showToast(msg: string, type: 'success'|'error'|'info' = 'success') {
    setToastMsg({ msg, type })
    setTimeout(() => setToastMsg(null), 3000)
  }
  const [goalsEdit,      setGoalsEdit]     = useState(false)
  const [goalTargets,    setGoalTargets]   = useState({ monthly: 500, quarterly: 1500, annual: 6000 })
  const [hoveredRow,   setHoveredRow]  = useState<number | null>(null)
  const [copiedEmail,  setCopiedEmail] = useState<string | null>(null)
  const [actionRow,    setActionRow]   = useState<number | null>(null)
  const TX_PER_PAGE = 6

  const load = useCallback(async () => {
    try {
      // ── Fetch transactions (real payment data) ────────────────
      const { data: txns } = await (supabase.from('transactions') as any)
        .select('*')
        .order('created_at', { ascending: false })

      // Map transactions to subscriptions format for compatibility
      const allSubs = (txns ?? []).map((t: any) => ({
        ...t,
        amount:          parseFloat(t.amount ?? 0),
        status:          t.status === 'paid' ? 'active' : t.status,
        plan_name:       t.plan,
        paid_at:         t.created_at,
        next_billing_at: t.next_billing ?? null,
        user_email:      t.user_email,
        user_id:         t.user_id,
      })) as any[]

      // ── Fetch profiles ───────────────────────────────────────
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, plan_name, account_status, subscription_status, country')

      const allProfiles = (profiles ?? []) as any[]
      const totalUsers  = allProfiles.length

      // ── MRR ──────────────────────────────────────────────────
      const mrr = allSubs
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)

      // ── Rev today ────────────────────────────────────────────
      const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0)
      const revToday = allSubs
        .filter(s => s.paid_at && new Date(s.paid_at) >= todayMidnight)
        .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)

      // ── Active subs — from profiles (more accurate) ───────────
      const activeSubs = allProfiles.filter((p: any) =>
        ['starter', 'growth', 'custom'].includes((p.plan_name ?? '').toLowerCase()) &&
        p.subscription_status === 'active'
      ).length

      // ── Conversion + Churn — from profiles (accurate) ─────────
      const everPaid  = allProfiles.filter((p: any) =>
        ['starter', 'growth', 'custom'].includes((p.plan_name ?? '').toLowerCase())
      ).length
      const churned   = allProfiles.filter((p: any) =>
        p.subscription_status === 'cancelled' || p.subscription_status === 'past_due'
      ).length
      const convRate  = totalUsers > 0 ? (everPaid  / totalUsers) * 100 : 0
      const churnRate = totalUsers > 0 ? (churned   / totalUsers) * 100 : 0

      // ── ARPU + ARR ────────────────────────────────────────────
      const paidUserCount = activeSubs
      const arpu = paidUserCount > 0 ? mrr / paidUserCount : 0
      const arr  = mrr * 12

      // ── New subs this month ───────────────────────────────────
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0)
      const newSubsThisMonth = allProfiles.filter((p: any) =>
        ['starter', 'growth', 'custom'].includes((p.plan_name ?? '').toLowerCase()) &&
        p.created_at && new Date(p.created_at) >= thisMonthStart
      ).length

      // ── ARPU last month ───────────────────────────────────────
      const lmStart = new Date()
      lmStart.setMonth(lmStart.getMonth() - 1)
      lmStart.setDate(1); lmStart.setHours(0,0,0,0)
      const lmEnd = new Date()
      lmEnd.setDate(0); lmEnd.setHours(23,59,59,999)
      const lmMrr  = allSubs
        .filter(s => s.paid_at && new Date(s.paid_at) >= lmStart && new Date(s.paid_at) <= lmEnd)
        .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)
      const lmPaid = allSubs.filter(s =>
        Number(s.amount) > 0 &&
        s.paid_at &&
        new Date(s.paid_at) >= lmStart &&
        new Date(s.paid_at) <= lmEnd
      ).length
      const arpuLastMonth = lmPaid > 0 ? lmMrr / lmPaid : 0
      const arpuDiff      = arpu - arpuLastMonth

      // ── ARR end of year projection ────────────────────────────
      const monthsLeft   = 12 - new Date().getMonth()  // months remaining incl. current
      const arrProjected = mrr * monthsLeft             // revenue left this year at current MRR

      // ── MRR last month ────────────────────────────────────────
      const lastMonthStart = new Date()
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
      lastMonthStart.setDate(1); lastMonthStart.setHours(0,0,0,0)
      const lastMonthEnd = new Date()
      lastMonthEnd.setDate(0); lastMonthEnd.setHours(23,59,59,999)
      const mrrLastMonth = allSubs
        .filter(s =>
          s.status === 'active' &&
          s.paid_at &&
          new Date(s.paid_at) >= lastMonthStart &&
          new Date(s.paid_at) <= lastMonthEnd
        )
        .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)

      // ── MRR Forecast (next 30 days) ───────────────────────────
      const now30 = new Date(Date.now() + 30 * 86400000)
      const upcoming = allSubs.filter(s =>
        s.status === 'active' &&
        s.next_billing_at &&
        new Date(s.next_billing_at) <= now30 &&
        new Date(s.next_billing_at) >= new Date()
      )
      const forecastRev   = upcoming.reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)
      const forecastCount = upcoming.length
      // ── MRR Growth — actual payments per month (fixed) ───────
      const now = new Date()
      const mrrGrowth = []
      let   peakMrr   = 0
      let   peakMonth = ''

      for (let i = 5; i >= 0; i--) {
        const d          = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0)
        const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

        // Actual payments this month
        const monthMrr = allSubs
          .filter(s =>
            s.paid_at &&
            new Date(s.paid_at) >= monthStart &&
            new Date(s.paid_at) <= monthEnd
          )
          .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)

        // Active subs up to this month
        const monthSubs = allSubs.filter(s =>
          s.status === 'active' &&
          s.paid_at &&
          new Date(s.paid_at) <= monthEnd
        ).length

        // Conversion rate — cumulative paid users up to this month
        const monthPaid  = allSubs.filter(s =>
          Number(s.amount) > 0 &&
          s.paid_at &&
          new Date(s.paid_at) <= monthEnd
        ).length
        const monthConv  = allProfiles.length > 0 ? Math.round((monthPaid / allProfiles.length) * 100 * 10) / 10 : 0

        // Churn rate up to this month
        const monthChurn = allSubs.filter(s =>
          (s.status === 'cancelled' || s.status === 'past_due') &&
          s.updated_at &&
          new Date(s.updated_at) <= monthEnd
        ).length
        const monthChurnRate = allProfiles.length > 0 ? Math.round((monthChurn / allProfiles.length) * 100 * 10) / 10 : 0

        const label = MONTHS[d.getMonth()]
        mrrGrowth.push({
          month: label, mrr: monthMrr,
          subs: monthSubs, conv: monthConv, churn: monthChurnRate,
          projected: false,
        })
        if (monthMrr > peakMrr) { peakMrr = monthMrr; peakMonth = label }
      }

      // Projected next month
      const nextMonth    = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59)
      const projectedMrr = allSubs
        .filter(s =>
          s.status === 'active' &&
          s.next_billing_at &&
          new Date(s.next_billing_at) >= nextMonth &&
          new Date(s.next_billing_at) <= nextMonthEnd
        )
        .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)

      mrrGrowth.push({
        month:     MONTHS[nextMonth.getMonth()] + ' (est)',
        mrr:       projectedMrr > 0 ? projectedMrr : mrr,
        subs:      activeSubs,
        conv:      convRate,
        churn:     churnRate,
        projected: true,
      })

      // ── Plan distribution — from profiles (most accurate) ──────
      const PLAN_DEFS = [
        { name: 'Free',    color: '#111c0a', key: 'free'    },
        { name: 'Starter', color: '#8fff00', key: 'starter' },
        { name: 'Growth',  color: '#6bcc00', key: 'growth'  },
        { name: 'Custom',  color: '#4a8f00', key: 'custom'  },
      ]
      const planMap: Record<string, { count: number; revenue: number; color: string }> = {}
      for (const def of PLAN_DEFS) {
        planMap[def.name] = { count: 0, revenue: 0, color: def.color }
      }
      // Count users per plan from profiles
      for (const p of allProfiles) {
        const planKey = (p.plan_name ?? 'free').toLowerCase()
        const def = PLAN_DEFS.find(d => d.key === planKey || planKey.includes(d.key))
        const key = def?.name ?? 'Free'
        if (!planMap[key]) planMap[key] = { count: 0, revenue: 0, color: '#8a9e78' }
        planMap[key].count += 1
      }
      // Add revenue from transactions
      for (const s of allSubs) {
        const planKey = (s.plan_name ?? 'free').toLowerCase()
        const def = PLAN_DEFS.find(d => d.key === planKey || planKey.includes(d.key))
        const key = def?.name ?? 'Free'
        if (!planMap[key]) planMap[key] = { count: 0, revenue: 0, color: '#8a9e78' }
        planMap[key].revenue += Number(s.amount) ?? 0
      }
      const planDist = Object.entries(planMap).map(([name, data]) => ({
        name,
        value:   data.count,
        revenue: data.revenue,
        color:   data.color,
      }))

      // ── Transactions with user info ───────────────────────────
      const { data: txData } = await (supabase.from('transactions') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Build user lookup from already-fetched profiles
      const profileMap: Record<string, any> = {}
      for (const p of allProfiles) {
        profileMap[p.id] = p
      }

      // Also fetch emails from auth if needed
      const transactions = ((txData ?? []) as any[]).map(tx => {
        const profile = profileMap[tx.user_id]
        return {
          ...tx,
          userLabel: profile?.email
            ?? profile?.name
            ?? ((tx.user_id?.slice(0, 8) ?? 'Unknown') + '...'),
        }
      })

      // ── Revenue Goals from Supabase ───────────────────────────
      const { data: goalsData } = await supabase
        .from('revenue_goals')
        .select('period, target')

      const goalsMap: Record<string, number> = {}
      for (const g of (goalsData ?? []) as any[]) {
        goalsMap[g.period] = Number(g.target)
      }
      const goals = {
        monthly:   goalsMap['monthly']   ?? 500,
        quarterly: goalsMap['quarterly'] ?? 1500,
        annual:    goalsMap['annual']    ?? 6000,
      }

      // ── Sparkline — daily revenue last 30 days ───────────────
      const sparkline = []
      for (let i = 29; i >= 0; i--) {
        const d     = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
        const dEnd  = new Date(d); dEnd.setHours(23,59,59,999)
        const rev   = allSubs
          .filter(s => s.paid_at && new Date(s.paid_at) >= d && new Date(s.paid_at) <= dEnd)
          .reduce((sum, s) => sum + (Number(s.amount) ?? 0), 0)
        sparkline.push({ day: `${d.getMonth()+1}/${d.getDate()}`, rev })
      }

      // ── LTV per user ──────────────────────────────────────────
      const ltvMap: Record<string, number> = {}
      for (const s of allSubs) {
        if (s.user_id && Number(s.amount) > 0) {
          ltvMap[s.user_id] = (ltvMap[s.user_id] ?? 0) + Number(s.amount)
        }
      }

      setStats({
        mrr, revToday, activeSubs, totalUsers,
        convRate, churnRate, arpu, paidUserCount,
        arpuLastMonth, arpuDiff, newSubsMonth: newSubsThisMonth,
        arrProjected, arr,
        mrrLastMonth, forecastRev, forecastCount,
        peakMrr, peakMonth,
        mrrGrowth, planDist, transactions, sparkline, ltvMap, goals,
        loading: false,
      })
    } catch (e) {
      console.error('Revenue analytics error:', e)
      setStats(s => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => { load() }, [load])

  function obscure(text: string) {
    if (!isInvestorMode) return text
    return text ? `${text[0]}***` : '***'
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr)
      return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    } catch { return dateStr }
  }

  // ── Export CSV — exports current filtered view ───────────────
  function exportCSV(filtered?: any[]) {
    const data = filtered ?? stats.transactions
    const rows = [
      ['User', 'Plan', 'Provider', 'Status', 'Date', 'Amount'],
      ...data.map(tx => [
        tx.userLabel ?? '',
        tx.plan_name ?? '',
        tx.provider ?? 'manual',
        tx.status ?? '',
        tx.paid_at ? formatDate(tx.paid_at) : '',
        Number(tx.amount) > 0 ? `$${Number(tx.amount).toFixed(2)}` : '$0.00',
      ])
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Date range filter ────────────────────────────────────────
  function getDateRangeStart(range: typeof txDateRange): Date | null {
    const now = new Date()
    switch (range) {
      case 'today':      { const d = new Date(); d.setHours(0,0,0,0); return d }
      case 'week':       { const d = new Date(); d.setDate(d.getDate() - 7); return d }
      case 'month':      { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d }
      case 'last_month': { const d = new Date(); d.setMonth(d.getMonth()-1); d.setDate(1); d.setHours(0,0,0,0); return d }
      case 'year':       { const d = new Date(); d.setMonth(0); d.setDate(1); d.setHours(0,0,0,0); return d }
      default: return null
    }
  }

  if (stats.loading) return (
    <div className="flex flex-col gap-4 p-6">
      {[1,2,3].map(i => (
        <div key={i} className="h-24 rounded-2xl animate-pulse"
             style={{ backgroundColor: C.border }} />
      ))}
    </div>
  )

  // ── P&L ─────────────────────────────────────────────────────
  const txCount      = stats.transactions.filter(tx => Number(tx.amount) > 0).length
  const lsFee        = txCount === 0 ? 0 : stats.mrr * 0.05 + (0.50 * txCount)
  const serverCosts  = serverCostVal
  const totalCosts   = lsFee + serverCosts
  const netProfit    = stats.mrr - totalCosts
  const marginPct    = stats.mrr > 0 ? (netProfit / stats.mrr) * 100 : 0

  return (
    <div className="flex flex-col gap-4">

      {/* ── Row 1: Dark MRR Hero + Line Chart ── */}
      <div className={`grid gap-4 ${isDesktop ? 'grid-cols-[280px_1fr]' : 'grid-cols-1'}`}>

        {/* Dark MRR Hero */}
        <div className="flex flex-col justify-between p-5 rounded-2xl"
             style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.2)' }}>
          <div>
            <p className="text-[11px] font-bold tracking-wider mb-2"
               style={{ color: 'rgba(143,255,0,0.7)' }}>MONTHLY REVENUE</p>
            <p className="text-[42px] font-extrabold tracking-tight text-white mb-1">
              ${stats.mrr.toLocaleString()}
            </p>
            {/* MRR trend vs last month */}
            <div className="flex items-center gap-2 mb-5">
              {stats.mrrLastMonth > 0 ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                     style={{ backgroundColor: stats.mrr >= stats.mrrLastMonth ? 'rgba(143,255,0,0.15)' : 'rgba(248,113,113,0.15)' }}>
                  {stats.mrr >= stats.mrrLastMonth
                    ? <TrendingUp size={11} style={{ color: C.lime }} />
                    : <TrendingDown size={11} style={{ color: C.red }} />}
                  <span className="text-[10px] font-bold"
                        style={{ color: stats.mrr >= stats.mrrLastMonth ? C.lime : C.red }}>
                    {stats.mrrLastMonth > 0
                      ? `${((stats.mrr - stats.mrrLastMonth) / stats.mrrLastMonth * 100).toFixed(1)}% vs last month`
                      : 'First month!'}
                  </span>
                </div>
              ) : (
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {stats.activeSubs} active subscription{stats.activeSubs !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 pt-4"
               style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
            {[
              { label: 'Rev today',        value: `$${stats.revToday.toLocaleString()}`,                             color: C.lime    },
              { label: 'Trial conv.',       value: `${stats.convRate.toFixed(1)}%`,                                   color: '#fff'    },
              { label: 'Churn rate',        value: `${stats.churnRate.toFixed(1)}%`,                                  color: stats.churnRate < 5 ? C.lime : C.red },
              { label: 'Run rate',          value: `$${stats.arr.toLocaleString()}/yr`,                              color: '#fff'    },
              { label: '30-day forecast',   value: stats.forecastRev > 0 ? `$${stats.forecastRev.toLocaleString()} (${stats.forecastCount} renewal${stats.forecastCount !== 1 ? 's' : ''})` : 'No renewals due', color: stats.forecastRev > 0 ? '#FBBF24' : 'rgba(255,255,255,0.3)' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {row.label}
                </span>
                <span className="text-[12px] font-bold" style={{ color: row.color }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-line Chart */}
        <div className="p-5 rounded-2xl border"
             style={{ backgroundColor: '#fff', borderColor: C.border }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[14px] font-bold" style={{ color: C.text }}>Revenue Overview</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Last 6 months — all metrics</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Legend — top right */}
              {[
                { color: C.lime,    label: 'MRR ($)',      dash: false },
                { color: '#60A5FA', label: 'Active subs',  dash: true  },
                { color: '#A78BFA', label: 'Conversion %', dash: true  },
                { color: '#FB923C', label: 'Churn %',      dash: true  },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div style={{
                    width: 16, height: 2.5,
                    backgroundColor: l.dash ? 'transparent' : l.color,
                    borderTop: l.dash ? `2px dashed ${l.color}` : 'none',
                    borderRadius: 2,
                  }} />
                  <span className="text-[10px]" style={{ color: C.hint }}>{l.label}</span>
                </div>
              ))}
              {/* Peak badge */}
              {stats.peakMrr > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
                     style={{ backgroundColor: 'rgba(143,255,0,0.08)', borderColor: 'rgba(143,255,0,0.3)' }}>
                  <span className="text-[10px]">🏆</span>
                  <span className="text-[10px] font-bold" style={{ color: '#4A8F00' }}>
                    Peak ${stats.peakMrr} · {stats.peakMonth}
                  </span>
                </div>
              )}
              <button onClick={load}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>
                <RefreshCw size={11} />
              </button>
            </div>
          </div>

          {/* MoM badge */}
          <div className="mb-2">
            {(() => {
              const curr = stats.mrrGrowth[stats.mrrGrowth.length - 2]?.mrr ?? 0
              const prev = stats.mrrGrowth[stats.mrrGrowth.length - 3]?.mrr ?? 0
              const pct  = prev > 0 ? ((curr - prev) / prev * 100).toFixed(1) : null
              const up   = curr >= prev
              if (!pct) return (
                <span className="text-[11px]" style={{ color: C.hint }}>Not enough data for MoM comparison</span>
              )
              return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border"
                     style={{
                       backgroundColor: up ? 'rgba(22,163,74,0.08)' : 'rgba(248,113,113,0.08)',
                       borderColor:     up ? 'rgba(22,163,74,0.2)'  : 'rgba(248,113,113,0.2)',
                     }}>
                  {up ? <TrendingUp size={10} style={{ color: '#16A34A' }} /> : <TrendingDown size={10} style={{ color: C.red }} />}
                  <span className="text-[10px] font-bold" style={{ color: up ? '#16A34A' : C.red }}>
                    {up ? '+' : ''}{pct}% MoM
                  </span>
                </div>
              )
            })()}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.mrrGrowth} margin={{ top: 5, right: 30, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.hint }}
                     axisLine={false} tickLine={false} height={18} />
              {/* Left — MRR ($) */}
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: C.muted }}
                     axisLine={false} tickLine={false} width={32}
                     tickFormatter={v => `$${v}`} domain={[0, 'auto']} />
              {/* Right — % (conv + churn) */}
              <YAxis yAxisId="pct" orientation="right"
                     tick={{ fontSize: 10, fill: C.muted }}
                     axisLine={false} tickLine={false} width={28}
                     tickFormatter={v => `${v}%`}
                     domain={[0, 'auto']} />
              {/* Hidden — count (active subs — scales independently) */}
              <YAxis yAxisId="count" orientation="right"
                     hide={true} domain={[0, 'auto']} />
              <Tooltip content={<MultiTooltip />} />
              {/* MRR line */}
              <Line yAxisId="left" type="monotone" dataKey="mrr"
                    stroke={C.lime} strokeWidth={2.5}
                    dot={{ fill: C.lime, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }} connectNulls />
              {/* Active subs — own hidden axis */}
              <Line yAxisId="count" type="monotone" dataKey="subs"
                    stroke="#60A5FA" strokeWidth={2} strokeDasharray="5 3"
                    dot={{ fill: '#60A5FA', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }} connectNulls />
              {/* Conversion % */}
              <Line yAxisId="pct" type="monotone" dataKey="conv"
                    stroke="#A78BFA" strokeWidth={2} strokeDasharray="6 3"
                    dot={{ fill: '#A78BFA', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }} connectNulls />
              {/* Churn % */}
              <Line yAxisId="pct" type="monotone" dataKey="churn"
                    stroke="#FB923C" strokeWidth={2} strokeDasharray="3 3"
                    dot={{ fill: '#FB923C', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* ── Row 2: 3 Stat Cards ── */}
      <div className={`grid gap-4 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {[
          {
            label:    'Active Subscribers',
            value:    String(stats.activeSubs),
            sub:      `of ${stats.totalUsers} total accounts`,
            badge:    stats.newSubsMonth > 0 ? `+${stats.newSubsMonth} this month` : 'No new this month',
            badgeUp:  stats.newSubsMonth > 0,
            icon:     Users,
            up:       stats.activeSubs > 0,
            iconBg:   'rgba(143,255,0,0.1)',
            iconColor: '#4A8F00',
          },
          {
            label:    'Avg Revenue / User',
            value:    `$${stats.arpu.toFixed(2)}`,
            sub:      `across ${stats.paidUserCount} paying user${stats.paidUserCount !== 1 ? 's' : ''}`,
            badge:    stats.arpuLastMonth > 0
              ? `${stats.arpuDiff >= 0 ? '+' : ''}$${stats.arpuDiff.toFixed(2)} vs last month`
              : 'First month',
            badgeUp:  stats.arpuDiff >= 0,
            icon:     DollarSign,
            up:       stats.arpu > 0,
            iconBg:   'rgba(55,138,221,0.1)',
            iconColor: C.blue,
          },
          {
            label:    'Annual Run Rate',
            value:    `$${stats.arr.toLocaleString()}`,
            sub:      'MRR × 12 months',
            badge:    stats.arrProjected > 0
              ? `~$${stats.arrProjected.toLocaleString()} by Dec`
              : '$0 projected',
            badgeUp:  stats.arr > 0,
            icon:     TrendingUp,
            up:       stats.arr > 0,
            iconBg:   'rgba(139,92,246,0.1)',
            iconColor: C.purple,
          },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border"
                 style={{ backgroundColor: '#fff', borderColor: C.border }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: card.iconBg }}>
                <Icon size={20} style={{ color: card.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold mb-0.5" style={{ color: C.muted }}>
                  {card.label}
                </p>
                <p className="text-[22px] font-extrabold tracking-tight" style={{ color: C.text }}>
                  {card.value}
                </p>
                <p className="text-[11px] mb-1" style={{ color: C.muted }}>{card.sub}</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: card.badgeUp ? 'rgba(22,163,74,0.1)' : 'rgba(248,113,113,0.1)',
                        color:           card.badgeUp ? '#16A34A'              : C.red,
                      }}>
                  {card.badgeUp ? '↑' : '↓'} {card.badge}
                </span>
              </div>
              {card.up
                ? <ArrowUpRight   size={18} style={{ color: C.green, flexShrink: 0 }} />
                : <ArrowDownRight size={18} style={{ color: C.red,   flexShrink: 0 }} />}
            </div>
          )
        })}
      </div>

      {/* ── Row 3: Transactions + Donut + P&L ── */}
      <div className={`grid gap-4 ${isDesktop ? 'grid-cols-[1fr_240px]' : 'grid-cols-1'}`}>

        {/* Transaction Ledger */}
        <div className="p-5 rounded-2xl border"
             style={{ backgroundColor: '#fff', borderColor: C.border }}>

          {/* Row 1 — Title + Total + Export */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[14px] font-bold" style={{ color: C.text }}>Transaction Ledger</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Real payment history</p>
            </div>
            <div className="flex items-center gap-2">
              {stats.transactions.length > 0 && (
                <span className="text-[13px] font-extrabold" style={{ color: C.green }}>
                  +${stats.transactions.filter(tx => Number(tx.amount) > 0).reduce((s,tx)=>s+Number(tx.amount),0).toFixed(2)}
                </span>
              )}
              <button onClick={() => exportCSV(stats.transactions)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold"
                style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}>
                <Download size={12} /> Export
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-2" style={{ backgroundColor: C.border }} />

          {/* Row 2 — Status filters left + Plan breakdown right */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            {/* Status filter pills — left */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'active', 'trial', 'cancelled', 'refunded'] as const).map(f => (
                <button key={f} onClick={() => { setTxFilter(f); setTxPage(1) }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all border"
                  style={{
                    backgroundColor: txFilter === f ? C.dark  : '#fff',
                    borderColor:     txFilter === f ? C.dark  : C.border,
                    color:           txFilter === f ? C.lime  : C.muted,
                  }}>
                  {f === 'all'
                    ? `All (${stats.transactions.length})`
                    : `${f.charAt(0).toUpperCase()+f.slice(1)} (${stats.transactions.filter(tx => tx.status === f).length})`
                  }
                </button>
              ))}
            </div>

            {/* Plan breakdown — right */}
            {stats.transactions.length > 0 && (() => {
              const planBreakdown: Record<string, { users: number; revenue: number }> = {}
              for (const tx of stats.transactions) {
                const key = tx.plan_name ?? 'Unknown'
                if (!planBreakdown[key]) planBreakdown[key] = { users: 0, revenue: 0 }
                planBreakdown[key].users   += 1
                planBreakdown[key].revenue += Number(tx.amount) ?? 0
              }
              const totalRev = Object.values(planBreakdown).reduce((s, p) => s + p.revenue, 0)
              const colors   = [C.blue, C.lime, C.orange, C.purple]
              return (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.entries(planBreakdown).map(([plan, data], i) => {
                    const pct   = totalRev > 0 ? Math.round((data.revenue / totalRev) * 100) : 0
                    const color = colors[i % colors.length]
                    return (
                      <div key={plan} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
                           style={{ backgroundColor: C.bg, borderColor: C.border }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[10px] font-semibold" style={{ color: C.muted }}>{plan}</span>
                        <span className="text-[10px] font-bold" style={{ color: data.revenue > 0 ? C.green : C.muted }}>
                          ${data.revenue.toFixed(0)}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: pct === 0 ? '#F1F5F9' : `${color}25`,
                                color:           pct === 0 ? C.muted : color === C.lime ? '#4A8F00' : color,
                              }}>
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Search + Date Range */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <input
              value={txSearch} onChange={e => { setTxSearch(e.target.value); setTxPage(1) }}
              placeholder="Search by email or plan..."
              className="flex-1 h-8 px-3 rounded-lg border text-[11px] outline-none"
              style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg, minWidth: 160 }}
            />
            <select value={txDateRange}
              onChange={e => { setTxDateRange(e.target.value as any); setTxPage(1) }}
              className="h-8 px-2 rounded-lg border text-[10px] outline-none"
              style={{ borderColor: C.border, color: C.text, backgroundColor: C.bg }}>
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">This month</option>
              <option value="last_month">Last month</option>
              <option value="year">This year</option>
            </select>
          </div>

          {stats.transactions.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <DollarSign size={32} style={{ color: C.border }} />
              <p className="text-[13px] mt-3" style={{ color: C.muted }}>No transactions yet</p>
            </div>
          ) : (() => {
            // Feature 4 — Revenue sparkline
            const maxRev = Math.max(...stats.sparkline.map(s => s.rev), 1)

            // Apply all filters
            const dateStart      = getDateRangeStart(txDateRange)
            const thisMonthStart = new Date(); thisMonthStart.setDate(1); thisMonthStart.setHours(0,0,0,0)
            let filtered = stats.transactions
            if (txFilter !== 'all')  filtered = filtered.filter(tx => tx.status === txFilter)
            if (txSearch.trim())      filtered = filtered.filter(tx =>
              (tx.userLabel ?? '').toLowerCase().includes(txSearch.toLowerCase()) ||
              (tx.plan_name ?? '').toLowerCase().includes(txSearch.toLowerCase())
            )
            if (dateStart) filtered = filtered.filter(tx =>
              tx.paid_at && new Date(tx.paid_at) >= dateStart
            )

            // Sort
            filtered = [...filtered].sort((a, b) => {
              const dir = txSort.dir === 'asc' ? 1 : -1
              if (txSort.col === 'amount') return (Number(a.amount) - Number(b.amount)) * dir
              if (txSort.col === 'paid_at') {
                const da = a.paid_at ? new Date(a.paid_at).getTime() : 0
                const db = b.paid_at ? new Date(b.paid_at).getTime() : 0
                return (da - db) * dir
              }
              if (txSort.col === 'userLabel') return ((a.userLabel ?? '') > (b.userLabel ?? '') ? 1 : -1) * dir
              return 0
            })

            const totalPages = Math.ceil(filtered.length / TX_PER_PAGE)
            const paged      = filtered.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE)

            function SortIcon({ col }: { col: string }) {
              if (txSort.col !== col) return <span style={{ color: C.hint, fontSize: 9 }}>⇅</span>
              return <span style={{ color: C.lime, fontSize: 9 }}>{txSort.dir === 'asc' ? '↑' : '↓'}</span>
            }

            function toggleSort(col: string) {
              setTxSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'desc' })
              setTxPage(1)
            }

            return (
              <>
                {/* Feature 4 — Sparkline */}
                <div className="mb-4 p-3 rounded-xl border"
                     style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold" style={{ color: C.muted }}>Daily Revenue — Last 30 Days</p>
                    <p className="text-[10px]" style={{ color: C.hint }}>Peak: ${maxRev.toFixed(0)}</p>
                  </div>
                  <div className="flex items-end gap-0.5" style={{ height: 48 }}>
                    {stats.sparkline.map((d, idx) => (
                      <div key={idx} className="flex-1 rounded-sm transition-all"
                           title={`${d.day}: $${d.rev}`}
                           style={{
                             height: `${Math.max((d.rev / maxRev) * 100, d.rev > 0 ? 20 : 8)}%`,
                             backgroundColor: d.rev > 0 ? C.lime : '#CBD5E1',
                             opacity: d.rev > 0 ? 1 : 0.5,
                           }} />
                    ))}
                  </div>
                  {/* Date labels */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px]" style={{ color: C.hint }}>
                      {stats.sparkline[0]?.day ?? ''}
                    </span>
                    <span className="text-[9px]" style={{ color: C.hint }}>
                      {stats.sparkline[14]?.day ?? ''}
                    </span>
                    <span className="text-[9px]" style={{ color: C.hint }}>
                      {stats.sparkline[29]?.day ?? ''}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {[
                          { label: 'User',         col: 'userLabel', align: 'left'  },
                          { label: 'Plan',         col: 'plan_name', align: 'left'  },
                          { label: 'Provider',     col: '',          align: 'left'  },
                          { label: 'Status',       col: '',          align: 'left'  },
                          { label: 'Paid',         col: 'paid_at',   align: 'left'  },
                          { label: 'Next Billing', col: '',          align: 'left'  },
                          { label: 'LTV',          col: 'ltv',       align: 'right' },
                          { label: 'Amount',       col: 'amount',    align: 'right' },
                        ].map(h => (
                          <th key={h.label}
                              onClick={() => h.col && toggleSort(h.col)}
                              className="py-2 px-1"
                              style={{
                                fontSize: 11, fontWeight: 700, color: C.hint,
                                textAlign: h.align as any,
                                cursor: h.col ? 'pointer' : 'default',
                                userSelect: 'none',
                              }}>
                            {h.label} {h.col && <SortIcon col={h.col} />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr><td colSpan={8} className="py-8 text-center text-[12px]"
                                style={{ color: C.muted }}>No results found</td></tr>
                      ) : paged.map((tx: any, i: number) => {
                        const isActive    = tx.status === 'active' || tx.status === 'paid'
                        const isTrial     = tx.status === 'trial'
                        const isRefunded  = tx.status === 'refunded'
                        const isCancelled = tx.status === 'cancelled'
                        const statusColor = isActive ? C.green : isTrial ? '#60A5FA' : isRefunded ? '#F87171' : isCancelled ? C.muted : C.red
                        const statusBg    = isActive ? 'rgba(22,163,74,0.1)' : isTrial ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)'

                        // Feature 1 — Churn alert
                        const dueDate   = tx.next_billing_at ? new Date(tx.next_billing_at) : null
                        const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null
                        const isChurnRisk = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0

                        // Feature 2 — LTV
                        const ltv = stats.ltvMap[tx.user_id] ?? 0

                        // Feature 5 — Payment icon
                        const providerIcon = tx.provider === 'stripe' ? 'stripe' : tx.provider === 'paypal' ? 'paypal' : 'manual'

                        // Feature 6 — New vs Renewal
                        const isNew     = tx.paid_at && new Date(tx.paid_at) >= thisMonthStart
                        const badgeText = isNew ? 'New' : 'Renewal'

                        return (
                          <tr key={i}
                              onMouseEnter={() => { setHoveredRow(i); setActionRow(i) }}
                              onMouseLeave={() => { setHoveredRow(null); setActionRow(null) }}
                              style={{
                                borderBottom: `1px solid ${C.bg}`,
                                backgroundColor: isChurnRisk
                                  ? 'rgba(251,146,60,0.06)'
                                  : hoveredRow === i ? '#F8FAFC' : 'transparent',
                                borderLeft: isChurnRisk ? '3px solid #FB923C' : '3px solid transparent',
                                transition: 'all 0.15s ease',
                              }}>
                            {/* User + copy + LTV */}
                            <td className="py-2.5 px-1">
                              <div className="flex items-center gap-1 group">
                                <div>
                                  <p className="font-semibold truncate text-[12px]"
                                     style={{ color: C.text, maxWidth: 110 }}>
                                    {obscure(tx.userLabel ?? '—')}
                                  </p>
                                </div>
                                {!isInvestorMode && tx.userLabel && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(tx.userLabel)
                                      setCopiedEmail(tx.userLabel)
                                      setTimeout(() => setCopiedEmail(null), 2000)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    title="Copy email">
                                    <span style={{ fontSize: 10 }}>
                                      {copiedEmail === tx.userLabel ? <Check size={10} /> : <Copy size={10} />}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-1">
                              <span className="text-[11px]" style={{ color: C.muted }}>
                                {tx.plan ?? tx.plan_name ?? '—'}
                              </span>
                            </td>
                            {/* Feature 5 — Provider icon */}
                            <td className="py-2.5 px-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize"
                                    style={{ backgroundColor: 'rgba(143,255,0,0.1)', color: '#4a8f00', border: '1px solid rgba(143,255,0,0.2)' }}>
                                {tx.provider ?? 'manual'}
                              </span>
                            </td>
                            <td className="py-2.5 px-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                                    style={{ backgroundColor: statusBg, color: statusColor }}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-1">
                              <span style={{ color: C.muted, fontSize: 11 }}>
                                {tx.paid_at ? formatDate(tx.paid_at) : '—'}
                              </span>
                            </td>
                            {/* Feature 5 — Next billing + churn alert */}
                            <td className="py-2.5 px-1">
                              {dueDate ? (
                                <div>
                                  <span className="text-[11px] font-semibold"
                                        style={{ color: isChurnRisk ? '#FB923C' : daysUntil !== null && daysUntil <= 7 ? '#FB923C' : C.muted }}>
                                    {formatDate(dueDate.toISOString())}
                                  </span>
                                  {isChurnRisk && (
                                    <p className="text-[9px] font-bold" style={{ color: '#FB923C' }}>
                                      Due in {daysUntil}d
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: C.hint, fontSize: 11 }}>—</span>
                              )}
                            </td>
                            {/* LTV */}
                            <td className="py-2.5 px-1 text-right">
                              <span className="text-[11px] font-black"
                                    style={{ color: ltv > 0 ? '#4a8f00' : C.muted }}>
                                {ltv > 0 ? `$${ltv.toFixed(0)}` : '—'}
                              </span>
                            </td>
                            {/* Amount + badge + quick actions */}
                            <td className="py-2.5 px-1 text-right">
                              {actionRow === i ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setDrawerUser(tx)}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all hover:opacity-80"
                                    style={{ borderColor: C.lime, color: '#4A8F00', backgroundColor: 'rgba(143,255,0,0.08)' }}>
                                    View Profile
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <span title={isNew ? 'New customer' : 'Renewal'} style={{ fontSize: 10 }}>{badgeText}</span>
                                  <span className="font-bold text-[12px]"
                                        style={{ color: isRefunded ? C.red : Number(tx.amount) > 0 ? C.green : C.muted }}>
                                    {isRefunded
                                      ? `-$${Number(tx.amount).toFixed(2)}`
                                      : Number(tx.amount) > 0
                                      ? `+$${Number(tx.amount).toFixed(2)}`
                                      : '$0.00'}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `1px solid ${C.border}` }}>
                        <td colSpan={7} className="py-2 px-1">
                          <span className="text-[11px] font-bold" style={{ color: C.muted }}>
                            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-right">
                          <span className="text-[13px] font-extrabold" style={{ color: C.green }}>
                            +${filtered.filter(tx => Number(tx.amount) > 0 && tx.status !== 'refunded').reduce((s,tx)=>s+Number(tx.amount),0).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3"
                       style={{ borderTop: `1px solid ${C.border}` }}>
                    <button onClick={() => setTxPage(p => Math.max(1, p-1))} disabled={txPage===1}
                      className="px-3 py-1.5 rounded-lg border text-[11px] font-bold"
                      style={{ borderColor: C.border, color: txPage===1?C.hint:C.text, opacity: txPage===1?0.5:1 }}>
                      ← Prev
                    </button>
                    <span className="text-[11px]" style={{ color: C.muted }}>
                      Page {txPage} of {totalPages}
                    </span>
                    <button onClick={() => setTxPage(p => Math.min(totalPages, p+1))} disabled={txPage===totalPages}
                      className="px-3 py-1.5 rounded-lg border text-[11px] font-bold"
                      style={{ borderColor: C.border, color: txPage===totalPages?C.hint:C.text, opacity: txPage===totalPages?0.5:1 }}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        </div>


        {/* Right column: Donut + P&L */}
        <div className="flex flex-col gap-4">

          {/* Plan distribution donut */}
          <div className="p-5 rounded-2xl border"
               style={{ backgroundColor: '#fff', borderColor: C.border }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-bold" style={{ color: C.text }}>Plan Split</p>
              <p className="text-[10px]" style={{ color: C.hint }}>
                {stats.totalUsers} total users
              </p>
            </div>
            {stats.planDist.length === 0 ? (
              <p className="text-[12px] text-center py-4" style={{ color: C.muted }}>No data</p>
            ) : (
              <>
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onMouseMove={e => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                    setPlanTooltip(t => t ? {
                      ...t,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    } : null)
                  }}
                  onMouseLeave={() => setPlanTooltip(null)}>

                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={stats.planDist.filter(p => p.value > 0)}
                        cx="50%" cy="50%"
                        innerRadius={30} outerRadius={58}
                        dataKey="value" labelLine={false}
                        label={false}
                        startAngle={90} endAngle={-270}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        onMouseEnter={(data: any, index: number, e: any) => {
                          const entry  = stats.planDist.filter(p => p.value > 0)[index]
                          if (!entry) return
                          const total  = stats.totalUsers
                          const pct    = total > 0 ? Math.round((entry.value / total) * 100) : 0
                          const rect   = (e.currentTarget as SVGElement)
                            .closest('div')?.getBoundingClientRect()
                          const x = rect ? e.clientX - rect.left : 100
                          const y = rect ? e.clientY - rect.top  : 70
                          setPlanTooltip({
                            x, y,
                            name:    entry.name,
                            users:   entry.value,
                            revenue: entry.revenue ?? 0,
                            pct,
                            color:   entry.color,
                          })
                        }}
                        onMouseLeave={() => setPlanTooltip(null)}>
                        {stats.planDist.filter(p => p.value > 0).map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.color}
                            stroke={planTooltip?.name === entry.name ? '#fff' : 'transparent'}
                            strokeWidth={planTooltip?.name === entry.name ? 2 : 0}
                            opacity={planTooltip && planTooltip.name !== entry.name ? 0.6 : 1}
                            style={{ transition: 'opacity 0.2s ease' }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Floating tooltip */}
                  {planTooltip && (
                    <div style={{
                      position:        'absolute',
                      left:            planTooltip.x + 14,
                      top:             planTooltip.y - 10,
                      pointerEvents:   'none',
                      backgroundColor: '#0a0d08',
                      border:          `1px solid ${planTooltip.color}40`,
                      borderRadius:    10,
                      padding:         '7px 12px',
                      fontSize:        11,
                      whiteSpace:      'nowrap',
                      zIndex:          99,
                      boxShadow:       '0 4px 16px rgba(0,0,0,0.25)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: planTooltip.color, flexShrink: 0 }} />
                        <span style={{ color: planTooltip.color === '#8fff00' ? '#8fff00' : '#fff', fontWeight: 700, fontSize: 12 }}>
                          {planTooltip.name}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                        {planTooltip.users} user{planTooltip.users !== 1 ? 's' : ''} · ${planTooltip.revenue.toFixed(0)} · {planTooltip.pct}%
                      </div>
                    </div>
                  )}

                  {/* Center text */}
                  <div style={{
                    position:      'absolute',
                    top: '50%', left: '50%',
                    transform:     'translate(-50%, -50%)',
                    textAlign:     'center',
                    pointerEvents: 'none',
                  }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#1a2410', lineHeight: 1 }}>
                      {stats.totalUsers}
                    </p>
                    <p style={{ fontSize: 9, color: '#8a9e78' }}>users</p>
                  </div>
                </div>
                {/* Legend with revenue */}
                <div className="flex flex-col gap-2 mt-3">
                  {stats.planDist.map((p, i) => {
                    const pct = stats.totalUsers > 0
                      ? Math.round((p.value / stats.totalUsers) * 100)
                      : 0
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-sm shrink-0"
                               style={{ backgroundColor: p.value > 0 ? p.color : C.border }} />
                          <span className="text-[11px]"
                                style={{ color: p.value > 0 ? C.text : C.hint }}>
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]" style={{ color: C.hint }}>
                            {p.value}u
                          </span>
                          <span className="text-[10px] font-bold"
                                style={{ color: p.revenue > 0 ? C.green : C.hint }}>
                            ${p.revenue.toFixed(0)}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: pct === 0 ? '#F1F5F9'
                                    : p.color === '#8fff00' ? 'rgba(143,255,0,0.2)'
                                    : p.color === '#111c0a' ? 'rgba(17,28,10,0.08)'
                                    : 'rgba(107,204,0,0.15)',
                                  color: pct === 0 ? '#94A3B8'
                                    : p.color === '#8fff00' ? '#4a8f00'
                                    : p.color === '#111c0a' ? '#1a2410'
                                    : '#4a8f00',
                                }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* P&L Summary */}
          <div className="p-5 rounded-2xl flex-1"
               style={{ backgroundColor: C.dark, border: '1px solid rgba(143,255,0,0.15)' }}>
            <p className="text-[11px] font-bold tracking-wider mb-3"
               style={{ color: 'rgba(143,255,0,0.7)' }}>P&L SUMMARY</p>
            <div className="flex flex-col gap-2.5">

              {/* Gross Revenue */}
              <div className="flex justify-between text-[12px]">
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>Gross Revenue</span>
                <span className="font-bold" style={{ color: '#fff' }}>${stats.mrr.toFixed(2)}</span>
              </div>

              {/* LemonSqueezy Fees with tooltip */}
              <div className="flex justify-between text-[12px]">
                <div className="flex items-center gap-1">
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>LS Fees</span>
                  <div className="relative group">
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, cursor: 'help' }}>ⓘ</span>
                    <div className="absolute left-0 bottom-5 hidden group-hover:block z-50"
                         style={{
                           backgroundColor: '#1a2410',
                           border: '1px solid rgba(143,255,0,0.2)',
                           borderRadius: 8, padding: '6px 10px',
                           fontSize: 10, whiteSpace: 'nowrap',
                           color: 'rgba(255,255,255,0.7)',
                         }}>
                      5% of MRR + $0.50 × {txCount} transaction{txCount !== 1 ? 's' : ''}
                     </div>
                   </div>
                 </div>
                 <span className="font-bold" style={{ color: C.red }}>-${lsFee.toFixed(2)}</span>
              </div>

              {/* Server Costs — editable */}
              <div className="flex justify-between text-[12px]">
                <div className="flex items-center gap-1">
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>Server Costs</span>
                  <button
                    onClick={() => setServerCostEdit(e => !e)}
                    style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, cursor: 'pointer', background: 'none', border: 'none' }}
                    title="Edit server costs">
                    <Pencil size={10} />
                  </button>
                </div>
                {serverCostEdit ? (
                  <input
                    type="number"
                    value={serverCostVal}
                    onChange={e => setServerCostVal(Number(e.target.value))}
                    onBlur={() => setServerCostEdit(false)}
                    onKeyDown={e => e.key === 'Enter' && setServerCostEdit(false)}
                    autoFocus
                    style={{
                      width: 64, textAlign: 'right',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(143,255,0,0.3)',
                      borderRadius: 6, color: '#fff',
                      fontSize: 12, padding: '1px 6px', outline: 'none',
                    }}
                  />
                ) : (
                  <span className="font-bold" style={{ color: C.red }}>-${serverCostVal.toFixed(2)}</span>
                )}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', marginTop: 2 }} />

              {/* Net Profit — fixed $ sign */}
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Net Profit</span>
                <span className="font-extrabold"
                      style={{ color: netProfit >= 0 ? C.lime : C.red }}>
                  {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)}
                </span>
              </div>

              {/* Margin badge */}
              <div className="text-center">
                <span className="text-[11px] px-3 py-1 rounded-full font-bold"
                      style={{
                        backgroundColor: netProfit >= 0 ? 'rgba(143,255,0,0.15)' : 'rgba(248,113,113,0.15)',
                        color:           netProfit >= 0 ? C.lime : C.red,
                      }}>
                  {marginPct.toFixed(1)}% margin
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>


      {/* ── Row 4: Revenue Goals ── */}
      <div className="p-5 rounded-2xl border"
           style={{ backgroundColor: '#fff', borderColor: C.border }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.text }}>Revenue Goals</p>
            <p className="text-[11px]" style={{ color: C.muted }}>Track progress toward targets</p>
          </div>
          <button
            onClick={async () => {
              if (goalsEdit) {
                // Save to DB when clicking Done
                try {
                  const supabase = createClient()
                  await Promise.all([
                    (supabase.from('revenue_goals') as any)
                      .upsert({ period: 'monthly',   target: goalTargets.monthly,   updated_at: new Date().toISOString() }, { onConflict: 'period' }),
                    (supabase.from('revenue_goals') as any)
                      .upsert({ period: 'quarterly', target: goalTargets.quarterly, updated_at: new Date().toISOString() }, { onConflict: 'period' }),
                    (supabase.from('revenue_goals') as any)
                      .upsert({ period: 'annual',    target: goalTargets.annual,    updated_at: new Date().toISOString() }, { onConflict: 'period' }),
                  ])
                  showToast('Revenue goals saved!')
                } catch { showToast('Failed to save goals', 'error') }
              }
              setGoalsEdit(e => !e)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all"
            style={{
              borderColor: goalsEdit ? C.lime : C.border,
              color:       goalsEdit ? '#4A8F00' : C.muted,
              backgroundColor: goalsEdit ? 'rgba(143,255,0,0.08)' : 'transparent',
            }}>
            {goalsEdit ? <><Check size={12} /> Done</> : <><Pencil size={12} /> Edit Targets</>}
          </button>
        </div>

        {/* Edit targets inline */}
        {goalsEdit && (
          <div className="flex gap-3 mb-4 flex-wrap p-3 rounded-xl"
               style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
            {[
              { key: 'monthly',   label: 'Monthly Target'   },
              { key: 'quarterly', label: 'Quarterly Target' },
              { key: 'annual',    label: 'Annual Target'    },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1 flex-1" style={{ minWidth: 120 }}>
                <label className="text-[10px] font-bold" style={{ color: C.muted }}>{label}</label>
                <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border"
                     style={{ borderColor: C.lime, backgroundColor: '#fff' }}>
                  <span className="text-[12px]" style={{ color: C.muted }}>$</span>
                  <input
                    type="number"
                    value={goalTargets[key as keyof typeof goalTargets]}
                    onChange={e => setGoalTargets(g => ({ ...g, [key]: Number(e.target.value) }))}
                    className="flex-1 outline-none text-[12px] font-bold"
                    style={{ color: C.text, border: 'none', background: 'transparent', width: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`grid gap-4 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {(() => {
            // Fix 1 — actual quarterly revenue (last 3 months from mrrGrowth)
            const last3Months = stats.mrrGrowth
              .filter(m => !m.projected)
              .slice(-3)
              .reduce((sum, m) => sum + m.mrr, 0)

            // Reset dates
            const now          = new Date()
            const monthEnd     = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            const daysLeftMon  = Math.ceil((monthEnd.getTime() - now.getTime()) / 86400000)
            const quarterEnd   = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0)
            const daysLeftQ    = Math.ceil((quarterEnd.getTime() - now.getTime()) / 86400000)
            const yearEnd      = new Date(now.getFullYear(), 11, 31)
            const daysLeftY    = Math.ceil((yearEnd.getTime() - now.getTime()) / 86400000)

            return [
              {
                label:    'Monthly Goal',
                current:  stats.mrr,
                target:   goalTargets.monthly,
                color:    C.lime,
                textColor:'#4A8F00',
                period:   `Resets in ${daysLeftMon} day${daysLeftMon !== 1 ? 's' : ''}`,
              },
              {
                label:    'Quarterly Goal',
                current:  last3Months,
                target:   goalTargets.quarterly,
                color:    '#6bcc00',
                textColor:'#4A8F00',
                period:   `Resets in ${daysLeftQ} day${daysLeftQ !== 1 ? 's' : ''}`,
              },
              {
                label:    'Annual Goal',
                current:  stats.arr,
                target:   goalTargets.annual,
                color:    '#4a8f00',
                textColor:'#fff',
                period:   `Resets in ${daysLeftY} day${daysLeftY !== 1 ? 's' : ''}`,
              },
            ].map((goal, i) => {
              const pct  = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
              const done = pct >= 100
              return (
                <div key={i} className="p-4 rounded-xl border"
                     style={{
                       backgroundColor: done ? 'rgba(22,163,74,0.06)' : `${goal.color}12`,
                       borderColor:     done ? 'rgba(22,163,74,0.3)' : `${goal.color}33`,
                     }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-bold" style={{ color: C.text }}>{goal.label}</p>
                    {done ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                            style={{ backgroundColor: 'rgba(22,163,74,0.15)', color: '#16A34A' }}>
                        🎉 Reached!
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: C.hint }}>
                        ${(goal.target - goal.current).toLocaleString()} to go
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-[22px] font-extrabold" style={{ color: done ? '#16A34A' : C.text }}>
                      ${goal.current.toLocaleString()}
                    </span>
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      / ${goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-1.5"
                       style={{ backgroundColor: '#f4ffe6' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{
                           width: `${pct}%`,
                           background: done
                             ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                             : `linear-gradient(90deg, ${goal.color}cc, ${goal.color})`,
                           boxShadow: done ? '0 0 8px rgba(22,163,74,0.4)' : `0 0 8px ${goal.color}60`,
                         }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: C.hint }}>{goal.period}</span>
                    <span className="text-[11px] font-bold"
                          style={{ color: done ? '#16A34A' : C.text }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>

      {/* ── Row 5: Dispute Defense Center (placeholder) ── */}
      <div className="p-5 rounded-2xl"
           style={{ backgroundColor: C.dark, border: '1px solid rgba(248,113,113,0.2)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style={{ backgroundColor: 'rgba(248,113,113,0.15)' }}>
                <Shield size={16} style={{ color: '#F87171' }} />
              </div>
              <p className="text-[15px] font-bold text-white">Dispute Defense Center</p>
            </div>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '2.5rem' }}>
              Generate PDF evidence packages for Stripe disputes automatically
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
               style={{ backgroundColor: 'rgba(255,184,0,0.1)', borderColor: 'rgba(255,184,0,0.3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FFB800' }} />
            <span className="text-[11px] font-bold" style={{ color: '#FFB800' }}>Coming Soon</span>
          </div>
        </div>
        <div className={`grid gap-3 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {[
            { icon: FileText, title: 'Auto Evidence PDF',  desc: 'Generate dispute evidence from order data automatically' },
            { icon: Zap,      title: 'One-Click Submit',   desc: 'Submit directly to LemonSqueezy from your admin dashboard' },
            { icon: BarChart2, title: 'Win Rate Tracking', desc: 'Track dispute outcomes and identify patterns'            },
          ].map((f, i) => (
            <div key={i} className="p-3.5 rounded-xl"
                 style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                   style={{ backgroundColor: 'rgba(143,255,0,0.1)' }}>
                <f.icon size={16} style={{ color: '#8fff00' }} />
              </div>
              <p className="text-[12px] font-bold text-white mb-1">{f.title}</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-3 text-center"
           style={{ color: 'rgba(255,255,255,0.25)' }}>
          Available after LemonSqueezy integration is approved
        </p>
      </div>

    {/* User Detail Drawer */}
      {drawerUser && (
        <UserDetailDrawer
          user={drawerUser}
          onClose={() => setDrawerUser(null)}
          onUpdated={(id, field, val) => {
            setDrawerUser((u: any) => ({ ...u, [field]: val }))
          }}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg text-[13px] font-bold"
             style={{ backgroundColor: toastMsg.type === 'success' ? '#0a0d08' : '#b91c1c', color: toastMsg.type === 'success' ? '#8fff00' : '#fff' }}>
          {toastMsg.msg}
        </div>
      )}

    </div>
  )
}