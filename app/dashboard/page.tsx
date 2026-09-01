'use client'

// app/dashboard/page.tsx
// ─────────────────────────────────────────────────────────────
// Riazify Operator Dashboard
//   ✓ Greeting header (Good morning/afternoon/evening + name)
//   ✓ Alert banners (unprotected high-risk, stale orders, no tracking)
//   ✓ 4 stat cards (Revenue, Protection Rate, At-Risk, Est. Saved)
//   ✓ Revenue trend line chart (14 days, two lines)
//   ✓ Risk donut chart (HIGH / MEDIUM / LOW)
//   ✓ Recent activity feed (orders + messages)
//   ✓ Action Centre (urgent actions + protected value card)
//   ✓ Quest & Currency widgets
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  RefreshCw, DollarSign, Shield, ShieldOff, PiggyBank,
  AlertTriangle, Clock, Truck, MessageSquare, ArrowRight,
  BarChart2, CheckCircle2,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase'
import { cn, timeAgo, formatCurrency } from '@/lib/utils'
import type { Profile } from '@/types/database'
import QuestWidget from '@/components/QuestWidget'
import CurrencyWidget from '@/components/currency/CurrencyWidget'

// ── Riazify Color Role Tokens (v2.0) ──────────────────────────
const C = {
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',
  darkCard: '#271c42',
  border: '#ede9fe',
  borderDark: '#2d1f4e',
  borderInput: '#e5e0f5',
  bg: '#f8f7ff',
  surface: '#ffffff',
  text: '#1f1d2e',
  textDark: '#1e1535',
  muted: '#6b7280',
  textLight: '#a89cc8',
  riskHigh: '#dc2626',
  riskHighBg: '#fef2f2',
  riskHighBrd: '#fecaca',
  riskMed: '#d97706',
  riskMedBg: '#fffbeb',
  riskMedBrd: '#fde68a',
  riskLow: '#16a34a',
  riskLowBg: '#f0fdf4',
  riskLowBrd: '#bbf7d0',
  shipped: '#2563eb',
  shippedBg: '#eff6ff',
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, bar, index }: {
  icon: React.ElementType; label: string; value: string; sub: string
  color: string; bg: string; bar?: number; index: number
}) {
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-2.5 shadow-xs"
      style={{ backgroundColor: C.surface, borderColor: C.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ backgroundColor: bg, borderColor: C.border }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-[19px] font-black text-right leading-tight font-syne" style={{ color: C.textDark }}>
          {value}
        </span>
      </div>
      <div>
        <p className="text-[12px] font-bold font-syne" style={{ color: C.textDark }}>{label}</p>
        <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: C.muted }}>{sub}</p>
      </div>
      {bar !== undefined && (
        <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${bar * 100}%`, backgroundColor: C.primary }}
          />
        </div>
      )}
    </div>
  )
}

// ── Alert Banner ───────────────────────────────────────────────
function AlertBanner({ icon: Icon, color, bg, text, sub, action, onTap }: {
  icon: React.ElementType; color: string; bg: string
  text: string; sub: string; action?: string; onTap?: () => void
}) {
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xs"
      style={{ backgroundColor: bg, borderColor: color + '40' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '15' }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold font-syne leading-snug" style={{ color: C.textDark }}>{text}</p>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.muted }}>{sub}</p>
      </div>
      {onTap && (
        <button
          onClick={onTap}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black text-white transition-opacity hover:opacity-85 cursor-pointer shadow-xs"
          style={{ backgroundColor: color }}
        >
          {action ?? 'View'}
        </button>
      )}
    </div>
  )
}

// ── Activity Item ──────────────────────────────────────────────
function ActivityItem({ item, onGoToOrders }: {
  item: Record<string, any>; onGoToOrders?: () => void
}) {
  const type = item.type
  const risk = item.risk as string | undefined
  const isShipped = item.status === 'shipped'

  let iconColor = C.primary, iconBg = C.primaryLight
  let borderColor = C.primary
  let Icon = CheckCircle2

  if (type === 'message') {
    iconColor = C.shipped; iconBg = C.shippedBg; borderColor = C.shipped; Icon = MessageSquare
  } else if (isShipped) {
    iconColor = C.shipped; iconBg = C.shippedBg; borderColor = C.shipped; Icon = Truck
  } else if (risk === 'HIGH') {
    iconColor = C.riskHigh; iconBg = C.riskHighBg; borderColor = C.riskHigh; Icon = AlertTriangle
  } else if (risk === 'MEDIUM') {
    iconColor = C.riskMed; iconBg = C.riskMedBg; borderColor = C.riskMed; Icon = Shield
  }

  const time = item.time ? new Date(item.time) : null

  return (
    <div
      onClick={type === 'order' ? onGoToOrders : undefined}
      className={cn(
        'flex items-center gap-2.5 p-2.5 rounded-xl border overflow-hidden relative mb-2 shadow-2xs transition-colors',
        type === 'order' && onGoToOrders ? 'cursor-pointer hover:bg-[#f3eeff]' : ''
      )}
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      {/* Left accent indicator stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: borderColor }} />
      <div className="pl-1.5 flex items-center gap-2.5 w-full">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
          style={{ backgroundColor: iconBg, borderColor: C.border }}
        >
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold font-syne truncate" style={{ color: C.textDark }}>{item.title}</p>
          <p className="text-[10px] truncate" style={{ color: C.muted }}>{item.subtitle}</p>
        </div>
        <span className="text-[10px] shrink-0 font-medium" style={{ color: C.muted }}>
          {time ? timeAgo(time.toISOString()) : '—'}
        </span>
        {type === 'order' && <ArrowRight size={11} className="shrink-0" style={{ color: C.muted }} />}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════
export default function DashboardHomePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0, highRisk: 0, medRisk: 0, lowRisk: 0,
    protected: 0, shipped: 0, pending: 0, stale: 0,
    unprotHigh: 0, noTracking: 0,
    totalRevenue: 0, protectedValue: 0, atRisk: 0, saved: 0,
  })

  const [chartData, setChartData] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])

  // ── Load All Data ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) setProfile(prof as Profile)

      // Load orders
      const { data: rawOrders } = await supabase
        .from('protected_orders').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: true })

      // Load messages
      const { data: rawMessages } = await supabase
        .from('sent_messages').select('*').eq('user_id', user.id)
        .order('sent_at', { ascending: false }).limit(4)

      const orders = (rawOrders || []) as any[]
      const messages = (rawMessages || []) as any[]
      if (!rawOrders) return

      let high = 0, med = 0, low = 0, prot = 0, shipped = 0
      let pending = 0, stale = 0, unprotHigh = 0, noTracking = 0
      let revenue = 0, protVal = 0, atRisk = 0
      const dailyMap: Record<string, { revenue: number; protected: number; total: number; date: string }> = {}
      const now = new Date()

      for (const o of orders) {
        const price = Number(o.item_price) || 0
        const risk = (o.risk_level || '').toUpperCase()
        const status = (o.order_status || '').toLowerCase()
        const isProt = o.checklist_completed === true
        const tracking = o.tracking_number as string | null
        const created = o.created_at ? new Date(o.created_at) : null

        revenue += price
        if (risk === 'HIGH') high++
        else if (risk === 'MEDIUM') med++
        else low++

        if (isProt) { prot++; protVal += price }

        if (status === 'shipped' || status === 'delivered') {
          shipped++
          if (!tracking?.trim() && status === 'shipped') noTracking++
        } else if (status === 'pending') {
          pending++
          if (created && (now.getTime() - created.getTime()) / 86400000 >= 7) stale++
        }

        if (risk === 'HIGH' && !isProt) { unprotHigh++; atRisk += price }

        if (created) {
          const key = created.toISOString().split('T')[0]
          if (!dailyMap[key]) dailyMap[key] = { revenue: 0, protected: 0, total: 0, date: key }
          dailyMap[key].revenue += price
          dailyMap[key].total += 1
          if (isProt) dailyMap[key].protected += 1
        }
      }

      // Build chart data (last 14 days)
      const sortedKeys = Object.keys(dailyMap).sort()
      const last14 = sortedKeys.slice(-14)
      const chart = last14.map(key => ({
        date: key.slice(5), // MM-DD
        revenue: dailyMap[key].revenue,
        protected: dailyMap[key].protected * (revenue / Math.max(orders.length, 1)),
      }))

      setChartData(chart)
      setStats({
        totalOrders: orders.length, highRisk: high, medRisk: med, lowRisk: low,
        protected: prot, shipped, pending, stale, unprotHigh, noTracking,
        totalRevenue: revenue, protectedValue: protVal, atRisk, saved: protVal * 0.15,
      })

      // Build activity feed
      const acts: any[] = []
      for (const o of [...orders].reverse().slice(0, 6)) {
        acts.push({
          type: 'order', id: o.id,
          title: o.item_title || 'Unknown Item',
          subtitle: `${o.risk_level || 'LOW'} RISK • $${Number(o.item_price || 0).toFixed(2)}`,
          time: o.created_at, risk: o.risk_level,
          status: o.order_status, protected: o.checklist_completed,
        })
      }
      for (const m of (messages || [])) {
        acts.push({
          type: 'message',
          title: `Message sent to ${m.recipient || 'buyer'}`,
          subtitle: m.template_name || 'Custom message',
          time: m.sent_at,
        })
      }
      acts.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
      setActivity(acts.slice(0, 10))

    } catch (e) {
      console.error('Dashboard error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const goToOrders = () => router.push('/dashboard/orders')

  const firstName = profile?.name?.split(' ')[0] || 'Seller'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const protRate = stats.totalOrders > 0 ? Math.round(stats.protected / stats.totalOrders * 100) : 0

  const riskDonut = [
    { name: 'High', value: stats.highRisk, color: C.riskHigh },
    { name: 'Medium', value: stats.medRisk, color: C.riskMed },
    { name: 'Low', value: stats.lowRisk, color: C.riskLow },
  ].filter(d => d.value > 0)

  // ── Loading State ────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4" style={{ backgroundColor: C.bg }}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs"
        style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
      >
        <div className="w-6 h-6 rounded-full border-3 border-transparent animate-spin" style={{ borderTopColor: C.primary }} />
      </div>
      <p className="text-[14px] font-bold font-syne" style={{ color: C.textDark }}>Loading Riazify Dashboard…</p>
    </div>
  )

  return (
    <div className="min-h-full overflow-auto" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }}>
      <div className="w-full px-4 md:px-6 lg:px-8 pt-8 pb-12 space-y-6">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] md:text-[30px] font-black tracking-tight leading-tight font-syne" style={{ color: C.textDark }}>
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-[13px] mt-1 font-medium" style={{ color: C.muted }}>
              Here is your eBay intelligence and order protection overview for today
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border transition-all hover:bg-white cursor-pointer shadow-xs"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.primary }}
            title="Refresh dashboard metrics"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {/* ── EMPTY STATE ONBOARDING CALLOUT ── */}
        {stats.totalOrders === 0 && !loading && (
          <div
            className="rounded-3xl border-2 border-dashed p-7 flex flex-col items-center text-center gap-4 shadow-sm"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs"
              style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
            >
              <Shield size={28} style={{ color: C.primary }} />
            </div>
            <div>
              <h2 className="text-[20px] font-black font-syne mb-1" style={{ color: C.textDark }}>
                Welcome to Riazify, {firstName}!
              </h2>
              <p className="text-[13px] max-w-md mx-auto" style={{ color: C.muted }}>
                Connect your eBay seller account to activate real-time order protection, Cassini optimization, and live fee analytics.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
              {[
                { step: '1', label: 'Connect eBay', desc: 'Link seller OAuth credentials', href: '/dashboard/settings?tab=ebay' },
                { step: '2', label: 'Import Orders', desc: 'Sync current transaction log', href: '/dashboard/orders' },
                { step: '3', label: 'Get Protected', desc: 'Complete high-risk audits', href: '/dashboard/orders' },
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => router.push(s.href)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:border-[#7530fb] cursor-pointer shadow-2xs"
                  style={{ backgroundColor: C.bg, borderColor: C.border }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black font-syne"
                    style={{ backgroundColor: C.primary, color: '#ffffff' }}
                  >
                    {s.step}
                  </div>
                  <p className="text-[12px] font-bold font-syne" style={{ color: C.textDark }}>{s.label}</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>{s.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push('/dashboard/settings?tab=ebay')}
              className="px-8 py-3.5 rounded-xl font-black text-[13px] transition-all hover:scale-105 cursor-pointer shadow-md"
              style={{ backgroundColor: C.accent, color: C.dark }}
            >
              Connect eBay Store Now
            </button>
          </div>
        )}

        {/* ── STAT CARDS ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            index={0}
            icon={DollarSign}
            label="Total Store Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            sub={`Calculated from ${stats.totalOrders} active orders`}
            color={C.shipped}
            bg={C.shippedBg}
          />
          <StatCard
            index={1}
            icon={Shield}
            label="Protection Rate"
            value={`${protRate}%`}
            sub={`${stats.protected} of ${stats.totalOrders} orders verified`}
            color={C.primary}
            bg={C.primaryLight}
            bar={stats.totalOrders > 0 ? stats.protected / stats.totalOrders : 0}
          />
          <StatCard
            index={2}
            icon={ShieldOff}
            label="At-Risk Revenue"
            value={`$${stats.atRisk.toFixed(2)}`}
            sub={`${stats.unprotHigh} unprotected high-risk orders`}
            color={stats.unprotHigh > 0 ? C.riskHigh : C.riskLow}
            bg={stats.unprotHigh > 0 ? C.riskHighBg : C.riskLowBg}
          />
          <StatCard
            index={3}
            icon={PiggyBank}
            label="Est. Money Saved"
            value={`$${stats.saved.toFixed(2)}`}
            sub="From dispute and fraud mitigation"
            color={C.riskLow}
            bg={C.riskLowBg}
          />
        </div>

        {/* ── QUEST & CURRENCY WIDGETS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuestWidget />
          <CurrencyWidget />
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Revenue Trend Line Chart */}
          <div
            className="lg:col-span-3 rounded-2xl border p-5 shadow-xs"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-black font-syne" style={{ color: C.textDark }}>
                Revenue & Protection Velocity
              </h2>
              <span
                className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-syne border"
                style={{ backgroundColor: C.primaryLight, borderColor: C.border, color: C.primary }}
              >
                LAST 14 DAYS
              </span>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-[3px] rounded-full" style={{ backgroundColor: C.shipped }} />
                <span className="text-[11px] font-medium" style={{ color: C.muted }}>Gross Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-[3px] rounded-full" style={{ backgroundColor: C.primary }} />
                <span className="text-[11px] font-medium" style={{ color: C.muted }}>Protected Value</span>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="h-[170px] flex flex-col items-center justify-center gap-2" style={{ color: C.muted }}>
                <BarChart2 size={32} className="opacity-40" />
                <p className="text-[12px]">No revenue data recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3eeff" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.muted }} />
                  <YAxis tick={{ fontSize: 9, fill: C.muted }} width={48} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: C.dark, borderColor: C.borderDark, borderRadius: 12, color: '#fff', fontSize: 12 }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke={C.shipped} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="protected" stroke={C.primary} strokeWidth={2} strokeDasharray="5 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Risk Breakdown Donut Chart */}
          <div
            className="lg:col-span-2 rounded-2xl border p-5 shadow-xs"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <h2 className="text-[15px] font-black font-syne mb-4" style={{ color: C.textDark }}>
              Risk Distribution
            </h2>
            {riskDonut.length === 0 ? (
              <div className="h-[140px] flex flex-col items-center justify-center gap-2" style={{ color: C.muted }}>
                <BarChart2 size={32} className="opacity-40" />
                <p className="text-[12px]">No evaluated orders yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={riskDonut} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={3}>
                    {riskDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: C.dark, borderColor: C.borderDark, borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-3 mt-3">
              {riskDonut.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] font-medium" style={{ color: C.muted }}>{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t" style={{ borderColor: C.border }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold font-syne" style={{ color: C.textDark }}>Store Protection Index</span>
                <span className="text-[13px] font-black font-syne" style={{ color: C.primary }}>
                  {protRate}%
                </span>
              </div>
              <div className="h-[6px] rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${protRate}%`, backgroundColor: C.primary }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW (Activity Feed & Action Centre) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Recent Activity Feed */}
          <div
            className="lg:col-span-3 rounded-2xl border p-5 shadow-xs"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-black font-syne" style={{ color: C.textDark }}>
                Recent Operational Activity
              </h2>
              <button
                onClick={goToOrders}
                className="text-[12px] font-bold transition-colors hover:text-[#6020e0] cursor-pointer"
                style={{ color: C.primary }}
              >
                View all orders →
              </button>
            </div>
            {activity.length === 0 ? (
              <p className="text-center text-[13px] py-8" style={{ color: C.muted }}>No recorded activity yet</p>
            ) : (
              activity.map((a, i) => (
                <ActivityItem key={i} item={a} onGoToOrders={goToOrders} />
              ))
            )}
          </div>

          {/* Action Centre */}
          <div
            className="lg:col-span-2 rounded-2xl border p-5 shadow-xs flex flex-col justify-between"
            style={{ backgroundColor: C.surface, borderColor: C.border }}
          >
            <div>
              <h2 className="text-[15px] font-black font-syne mb-4" style={{ color: C.textDark }}>
                Action Centre
              </h2>

              <div className="space-y-2 mb-4">
                {stats.unprotHigh > 0 && (
                  <button
                    onClick={goToOrders}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-opacity hover:opacity-90 cursor-pointer shadow-2xs"
                    style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHighBrd }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#fee2e2' }}
                    >
                      <Shield size={15} style={{ color: C.riskHigh }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold font-syne" style={{ color: C.textDark }}>
                        Protect {stats.unprotHigh} high-risk {stats.unprotHigh === 1 ? 'order' : 'orders'}
                      </p>
                      <p className="text-[10px] font-medium" style={{ color: C.riskHigh }}>
                        ${stats.atRisk.toFixed(2)} exposure risk right now
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-black text-white px-2.5 py-1 rounded-lg shrink-0"
                      style={{ backgroundColor: C.riskHigh }}
                    >
                      Protect
                    </span>
                  </button>
                )}

                {stats.stale > 0 && (
                  <button
                    onClick={goToOrders}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-opacity hover:opacity-90 cursor-pointer shadow-2xs"
                    style={{ backgroundColor: C.riskMedBg, borderColor: C.riskMedBrd }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#fef3c7' }}
                    >
                      <Clock size={15} style={{ color: C.riskMed }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold font-syne" style={{ color: C.textDark }}>
                        {stats.stale} {stats.stale === 1 ? 'order' : 'orders'} pending 7+ days
                      </p>
                      <p className="text-[10px]" style={{ color: C.muted }}>Buyer dispute threshold approaching</p>
                    </div>
                    <ArrowRight size={14} className="shrink-0" style={{ color: C.muted }} />
                  </button>
                )}

                <button
                  onClick={goToOrders}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors hover:bg-[#f8f7ff] cursor-pointer shadow-2xs"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: C.primaryLight, borderColor: C.border }}
                  >
                    <Shield size={15} style={{ color: C.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold font-syne" style={{ color: C.textDark }}>
                      View all {stats.totalOrders} orders
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>Open dedicated orders manager</p>
                  </div>
                  <ArrowRight size={14} className="shrink-0" style={{ color: C.muted }} />
                </button>
              </div>
            </div>

            {/* Total Value Protected Card */}
            <div
              className="p-4 rounded-2xl relative overflow-hidden border shadow-sm"
              style={{ backgroundColor: C.dark, borderColor: C.borderDark }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: 'rgba(117,48,251,0.25)', borderColor: C.primary }}
                >
                  <Shield size={14} style={{ color: C.accent }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider font-syne" style={{ color: C.textLight }}>
                  Total Value Protected
                </span>
              </div>
              <p
                className="text-[26px] font-black leading-none mb-1 font-syne"
                style={{ color: C.accent }}
              >
                ${stats.protectedValue.toFixed(2)}
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                of ${stats.totalRevenue.toFixed(2)} gross sales volume
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
