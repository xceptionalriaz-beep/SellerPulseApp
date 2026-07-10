'use client'
// app/dashboard/page.tsx
// Converted from: lib/pages/dashboard_home.dart
//
// What the Dart version had:
//   âœ… Greeting header (Good morning/afternoon/evening + name)
//   âœ… Alert banners (unprotected high-risk, stale orders, no tracking)
//   âœ… 4 stat cards (Revenue, Protection Rate, At-Risk, Est. Saved)
//   âœ… Revenue trend line chart (14 days, two lines)
//   âœ… Risk donut chart (HIGH/MEDIUM/LOW)
//   âœ… Recent activity feed (orders + messages)
//   âœ… Action Centre (urgent actions + protected value card)
//   âœ… Loading state
//   âœ… Refresh button
//   âœ… Responsive (mobile/tablet/desktop)

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  RefreshCw, DollarSign, Shield, ShieldOff, PiggyBank,
  AlertTriangle, Clock, Truck, MessageSquare, ArrowRight,
  BarChart2, CheckCircle,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase'
import { cn, timeAgo, formatCurrency } from '@/lib/utils'
import type { Profile } from '@/types/database'
import QuestWidget from '@/components/QuestWidget'

// â”€â”€ Design tokens (matches Dart _C class exactly) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  accent:       '#8FFF00',
  accentDeep:   '#4A8F00',
  accentDim:    '#F4FFE6',
  accentDark:   '#0A0D08',
  riskHigh:     '#B91C1C',
  riskHighBg:   '#FFF0F0',
  riskMed:      '#92400E',
  riskMedBg:    '#FFFBEA',
  riskLow:      '#2D6A00',
  riskLowBg:    '#F4FFE6',
  shipped:      '#1A5FA8',
  shippedBg:    '#E8F4FF',
  pending:      '#8A5F00',
  pendingBg:    '#FFF8E6',
  border:       '#E8EDE2',
  textSec:      '#4A5E38',
  textHint:     '#8A9E78',
}

// â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({ icon: Icon, label, value, sub, color, bg, bar, index }: {
  icon: React.ElementType; label: string; value: string; sub: string
  color: string; bg: string; bar?: number; index: number
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EDE2] p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
             style={{ backgroundColor: bg }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-[19px] font-extrabold text-[#1A2410] text-right leading-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          {value}
        </span>
      </div>
      <div>
        <p className="text-[12px] font-semibold text-[#4A5E38]">{label}</p>
        <p className="text-[10px] text-[#8A9E78] mt-0.5 line-clamp-2">{sub}</p>
      </div>
      {bar !== undefined && (
        <div className="h-[5px] bg-[#E8EDE2] rounded-full overflow-hidden">
          <div className="h-full bg-lime rounded-full transition-all duration-500"
               style={{ width: `${bar * 100}%` }} />
        </div>
      )}
    </div>
  )
}

// â”€â”€ Alert Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AlertBanner({ icon: Icon, color, bg, text, sub, action, onTap }: {
  icon: React.ElementType; color: string; bg: string
  text: string; sub: string; action?: string; onTap?: () => void
}) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border"
         style={{ backgroundColor: bg, borderColor: color + '59' }}>
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
           style={{ backgroundColor: color + '1F' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#1A2410] leading-snug">{text}</p>
        <p className="text-[11px] text-[#4A5E38] mt-0.5 leading-relaxed">{sub}</p>
      </div>
      {onTap && (
        <button onClick={onTap}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: color }}>
          {action ?? 'View'}
        </button>
      )}
    </div>
  )
}

// â”€â”€ Activity Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ActivityItem({ item, onGoToOrders }: {
  item: Record<string, any>; onGoToOrders?: () => void
}) {
  const type      = item.type
  const risk      = item.risk as string | undefined
  const isShipped = item.status === 'shipped'

  let iconColor = C.accentDeep, iconBg = C.accentDim
  let borderColor = C.accentDeep
  let Icon = CheckCircle

  if (type === 'message')   { iconColor = C.shipped;  iconBg = C.shippedBg;  borderColor = C.shipped;  Icon = MessageSquare }
  else if (isShipped)       { iconColor = C.shipped;  iconBg = C.shippedBg;  borderColor = C.shipped;  Icon = Truck }
  else if (risk === 'HIGH') { iconColor = C.riskHigh; iconBg = C.riskHighBg; borderColor = C.riskHigh; Icon = AlertTriangle }
  else if (risk === 'MEDIUM'){ iconColor = C.riskMed; iconBg = C.riskMedBg; borderColor = C.riskMed;  Icon = Shield }

  const time = item.time ? new Date(item.time) : null

  return (
    <div
      onClick={type === 'order' ? onGoToOrders : undefined}
      className={cn('flex items-center gap-2.5 p-2.5 rounded-[10px] border border-[#E8EDE2] bg-[#F7F9F5] overflow-hidden relative mb-2',
        type === 'order' && onGoToOrders ? 'cursor-pointer hover:bg-[#F4FFE6] transition-colors' : '')}
    >
      {/* Left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]"
           style={{ backgroundColor: borderColor }} />
      <div className="pl-1 flex items-center gap-2.5 w-full">
        <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
             style={{ backgroundColor: iconBg }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#1A2410] truncate">{item.title}</p>
          <p className="text-[10px] text-[#4A5E38] truncate">{item.subtitle}</p>
        </div>
        <span className="text-[10px] text-[#8A9E78] shrink-0">
          {time ? timeAgo(time.toISOString()) : '-'}
        </span>
        {type === 'order' && <ArrowRight size={10} className="text-[#8A9E78] shrink-0" />}
      </div>
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function DashboardHomePage() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,   setLoading]   = useState(true)
  const [profile,   setProfile]   = useState<Profile | null>(null)

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0, highRisk: 0, medRisk: 0, lowRisk: 0,
    protected: 0, shipped: 0, pending: 0, stale: 0,
    unprotHigh: 0, noTracking: 0,
    totalRevenue: 0, protectedValue: 0, atRisk: 0, saved: 0,
  })

  const [chartData,    setChartData]    = useState<any[]>([])
  const [activity,     setActivity]     = useState<any[]>([])

  // â”€â”€ Load all data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        const price     = Number(o.item_price) || 0
        const risk      = (o.risk_level || '').toUpperCase()
        const status    = (o.order_status || '').toLowerCase()
        const isProt    = o.checklist_completed === true
        const tracking  = o.tracking_number as string | null
        const created   = o.created_at ? new Date(o.created_at) : null

        revenue += price
        if (risk === 'HIGH')        high++
        else if (risk === 'MEDIUM') med++
        else                        low++

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
        date: key.slice(5),       // MM-DD
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
          subtitle: `${o.risk_level || 'LOW'} RISK â€¢ $${Number(o.item_price || 0).toFixed(2)}`,
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
    { name: 'High',   value: stats.highRisk, color: C.riskHigh   },
    { name: 'Medium', value: stats.medRisk,  color: C.riskMed    },
    { name: 'Low',    value: stats.lowRisk,  color: C.accentDeep },
  ].filter(d => d.value > 0)

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="w-14 h-14 bg-[#F4FFE6] rounded-2xl flex items-center justify-center">
        <svg className="animate-spin w-7 h-7 text-lime" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
      <p className="text-[14px] text-[#4A5E38]">Loading Riazifyâ€¦</p>
    </div>
  )

  return (
    <div className="bg-[#F7F9F5] min-h-full overflow-auto">
      <div className="w-full px-4 md:px-6 lg:px-8 pt-8 pb-10 space-y-6">

        {/* â”€â”€ HEADER â”€â”€ */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] md:text-[28px] font-extrabold text-[#1A2410] tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {greeting}, {firstName}! ðŸ‘‹
            </h1>
            <p className="text-[13px] text-[#4A5E38] mt-1">
              Here&apos;s your Riazify overview for today
            </p>
          </div>
          <button onClick={loadData}
            className="p-2 text-[#4A5E38] hover:text-dark transition-colors mt-1">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* â”€â”€ ALERT BANNERS â”€â”€ */}
        {(stats.unprotHigh > 0 || stats.stale > 0 || stats.noTracking > 0) && (
          <div className="space-y-2">
            {stats.unprotHigh > 0 && (
              <AlertBanner icon={AlertTriangle} color={C.riskHigh} bg={C.riskHighBg}
                text={`${stats.unprotHigh} high-risk ${stats.unprotHigh === 1 ? 'order needs' : 'orders need'} protection`}
                sub={`$${stats.atRisk.toFixed(2)} at risk â€” complete checklists before shipping`}
                action="View orders" onTap={goToOrders} />
            )}
            {stats.stale > 0 && (
              <AlertBanner icon={Clock} color={C.riskMed} bg={C.riskMedBg}
                text={`${stats.stale} ${stats.stale === 1 ? 'order has' : 'orders have'} been pending for 7+ days`}
                sub="Buyers may open a case â€” check these orders now"
                action="View orders" onTap={goToOrders} />
            )}
            {stats.noTracking > 0 && (
              <AlertBanner icon={Truck} color={C.shipped} bg={C.shippedBg}
                text={`${stats.noTracking} shipped ${stats.noTracking === 1 ? 'order has' : 'orders have'} no tracking number`}
                sub='Add tracking to protect against "item not received" disputes'
                action="View orders" onTap={goToOrders} />
            )}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {stats.totalOrders === 0 && !loading && (
          <div className="rounded-2xl border-2 border-dashed border-[#C8DDB8] bg-white p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#F4FFE6' }}>
              <Shield size={28} style={{ color: '#4A8F00' }}/>
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[#1A2410] mb-1">Welcome to Riazify, {firstName}!</h2>
              <p className="text-[13px] text-[#8A9E78]">Connect your eBay account to start protecting your orders and seeing your analytics here.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
              {[
                { step: '1', label: 'Connect eBay',    desc: 'Link your seller account',    href: '/dashboard/settings?tab=ebay' },
                { step: '2', label: 'Import orders',   desc: 'Sync your recent orders',     href: '/dashboard/orders' },
                { step: '3', label: 'Get protected',   desc: 'Complete order checklists',   href: '/dashboard/orders' },
              ].map(s => (
                <button key={s.step} onClick={() => router.push(s.href)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E8EDE2] hover:border-[#8FFF00] hover:bg-[#F4FFE6] transition-all">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black" style={{ backgroundColor: '#1A2410', color: '#8FFF00' }}>{s.step}</div>
                  <p className="text-[12px] font-bold text-[#1A2410]">{s.label}</p>
                  <p className="text-[10px] text-[#8A9E78]">{s.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => router.push('/dashboard/settings?tab=ebay')}
                    className="px-6 py-3 rounded-xl font-black text-[13px]" style={{ backgroundColor: '#8FFF00', color: '#1A2410' }}>
              Connect eBay now
            </button>
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard index={0} icon={DollarSign} label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            sub={`From ${stats.totalOrders} orders`}
            color={C.shipped} bg={C.shippedBg} />
          <StatCard index={1} icon={Shield} label="Protection Rate"
            value={`${protRate}%`}
            sub={`${stats.protected} of ${stats.totalOrders} orders protected`}
            color={C.accentDeep} bg={C.accentDim}
            bar={stats.totalOrders > 0 ? stats.protected / stats.totalOrders : 0} />
          <StatCard index={2} icon={ShieldOff} label="At-Risk Revenue"
            value={`$${stats.atRisk.toFixed(2)}`}
            sub={`${stats.unprotHigh} unprotected high-risk orders`}
            color={stats.unprotHigh > 0 ? C.riskHigh : C.riskLow}
            bg={stats.unprotHigh > 0 ? C.riskHighBg : C.riskLowBg} />
          <StatCard index={3} icon={PiggyBank} label="Est. Money Saved"
            value={`$${stats.saved.toFixed(2)}`}
            sub="From dispute prevention"
            color={C.riskLow} bg={C.riskLowBg} />
        </div>

        {/* â”€â”€ QUEST WIDGET â”€â”€ */}
        <QuestWidget />

        {/* â”€â”€ CHARTS â”€â”€ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Revenue Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8EDE2] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-[#1A2410]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Revenue Trend
              </h2>
              <span className="text-[10px] font-semibold text-[#4A8F00] bg-[#F4FFE6] px-2.5 py-1 rounded-full">
                Last 14 days
              </span>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-[3px] bg-[#1A5FA8] rounded-full" />
                <span className="text-[10px] text-[#4A5E38]">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-[3px] bg-[#4A8F00] rounded-full" style={{ borderStyle: 'dashed' }} />
                <span className="text-[10px] text-[#4A5E38]">Protected value</span>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="h-[170px] flex flex-col items-center justify-center gap-2 text-[#8A9E78]">
                <BarChart2 size={32} className="opacity-40" />
                <p className="text-[12px]">No revenue data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE2" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8A9E78' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#8A9E78' }} width={48} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`]} />
                  <Line type="monotone" dataKey="revenue" stroke={C.shipped} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="protected" stroke={C.accentDeep} strokeWidth={2}
                    strokeDasharray="5 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Risk Donut */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8EDE2] p-5">
            <h2 className="text-[15px] font-bold text-[#1A2410] mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Risk Overview
            </h2>
            {riskDonut.length === 0 ? (
              <div className="h-[140px] flex flex-col items-center justify-center gap-2 text-[#8A9E78]">
                <BarChart2 size={32} className="opacity-40" />
                <p className="text-[12px]">No orders yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={riskDonut} dataKey="value" cx="50%" cy="50%"
                    innerRadius={38} outerRadius={65} paddingAngle={3}>
                    {riskDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-3 mt-3">
              {riskDonut.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-[#4A5E38]">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-[#4A5E38]">Protection Rate</span>
                <span className="text-[13px] font-extrabold text-[#4A8F00]"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {protRate}%
                </span>
              </div>
              <div className="h-[7px] bg-[#E8EDE2] rounded-full overflow-hidden">
                <div className="h-full bg-lime rounded-full transition-all duration-500"
                     style={{ width: `${protRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ BOTTOM ROW â”€â”€ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8EDE2] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[#1A2410]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Recent Activity
              </h2>
              <button onClick={goToOrders}
                className="text-[12px] font-semibold text-[#4A8F00] hover:underline">
                View all â†’
              </button>
            </div>
            {activity.length === 0 ? (
              <p className="text-center text-[13px] text-[#8A9E78] py-8">No activity yet</p>
            ) : (
              activity.map((a, i) => (
                <ActivityItem key={i} item={a} onGoToOrders={goToOrders} />
              ))
            )}
          </div>

          {/* Action Centre */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8EDE2] p-5">
            <h2 className="text-[15px] font-bold text-[#1A2410] mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Action Centre
            </h2>

            <div className="space-y-2 mb-4">
              {stats.unprotHigh > 0 && (
                <button onClick={goToOrders}
                  className="w-full flex items-center gap-2.5 p-3 rounded-[10px] border-[1.5px] text-left hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: C.riskHighBg, borderColor: C.riskHigh + '59' }}>
                  <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.riskHighBg }}>
                    <Shield size={15} style={{ color: C.riskHigh }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1A2410]">
                      Protect {stats.unprotHigh} high-risk {stats.unprotHigh === 1 ? 'order' : 'orders'}
                    </p>
                    <p className="text-[10px] text-[#4A5E38]">${stats.atRisk.toFixed(2)} at risk right now</p>
                  </div>
                  <span className="text-[11px] font-bold text-white px-2.5 py-1.5 rounded-lg shrink-0"
                        style={{ backgroundColor: C.riskHigh }}>
                    Protect now
                  </span>
                </button>
              )}

              {stats.stale > 0 && (
                <button onClick={goToOrders}
                  className="w-full flex items-center gap-2.5 p-3 rounded-[10px] border text-left hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: C.riskMedBg, borderColor: C.riskMed + '59' }}>
                  <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.riskMedBg }}>
                    <Clock size={15} style={{ color: C.riskMed }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1A2410]">
                      {stats.stale} {stats.stale === 1 ? 'order' : 'orders'} pending 7+ days
                    </p>
                    <p className="text-[10px] text-[#4A5E38]">Buyers may open a case â€” act now</p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-[#8A9E78]" />
                </button>
              )}

              <button onClick={goToOrders}
                className="w-full flex items-center gap-2.5 p-3 rounded-[10px] border border-[#E8EDE2] bg-[#F7F9F5] text-left hover:bg-[#F4FFE6] transition-colors">
                <div className="w-8 h-8 rounded-[9px] bg-[#F4FFE6] flex items-center justify-center shrink-0">
                  <Shield size={15} className="text-[#4A8F00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1A2410]">
                    View all {stats.totalOrders} orders
                  </p>
                  <p className="text-[10px] text-[#4A5E38]">Open the orders dashboard</p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-[#8A9E78]" />
              </button>
            </div>

            {/* Protected Value Card */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: C.accentDark }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-lime/20 flex items-center justify-center">
                  <Shield size={14} className="text-lime" />
                </div>
                <span className="text-[11px] font-medium text-white/70">Total Value Protected</span>
              </div>
              <p className="text-[24px] font-extrabold text-lime leading-none mb-1"
                 style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                ${stats.protectedValue.toFixed(2)}
              </p>
              <p className="text-[10px] text-white/40">
                of ${stats.totalRevenue.toFixed(2)} total revenue
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
