'use client'
// components/admin/tabs/GlobalApiFleetTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/global_api_fleet_analytics_tab.dart

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ShoppingCart, ShoppingBag, Brain, Lock,
  Activity, Link, HeartPulse, Bell,
  BarChart2, PieChart, History, Zap,
  RefreshCw, RotateCcw, Wifi, ArrowRight,
  TrendingUp, CheckCircle, XCircle,
  ChevronRight,
} from 'lucide-react'

// ── Colour tokens (matches Dart _C) ──────────────────────────
const C = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#E2E8F0',
  navy:      '#131B2F',
  accent:    '#8FFF00',
  accentDim: '#E8FFB0',
  txt1:      '#0F172A',
  txt2:      '#64748B',
  txt3:      '#94A3B8',
  green:     '#00C48C',
  orange:    '#FFB800',
  red:       '#FF4D6A',
  blue:      '#1D70F5',
}

// Known platforms — hardcoded to exactly 4 (matches Dart _kPlatforms)
const PLATFORMS = [
  { id: 'ebay',             label: 'eBay Network',   icon: ShoppingCart },
  { id: 'aliexpress',       label: 'AliExpress',     icon: ShoppingBag  },
  { id: 'openai',           label: 'OpenAI Engine',  icon: Brain        },
  { id: 'amazon_affiliate', label: 'Amazon SP-API',  icon: Lock         },
]

const TOOL_COLORS: Record<string, string> = {
  orders:               C.blue,
  product_research:     C.green,
  competitor_research:  C.orange,
  title_builder:        '#8B5CF6',
  profit_calculator:    '#EC4899',
  other:                C.txt3,
}

// ── Data models (matches Dart _PlatformHealth, _DayUsage) ────
interface PlatformHealth {
  name:            string
  status:          string
  usagePercent:    number
  rateLimitUsed:   number
  rateLimitTotal:  number
  requestsToday:   number
  requestsMonth:   number
  healthScore:     number
  daysUntilExpiry: number
  lastRequestAt:   Date | null
}

interface DayUsage {
  date:         Date
  successCalls: number
  errorCalls:   number
}

interface Props {
  isInvestorMode?:      boolean
  isMobile?:            boolean
  startChartAnimation?: boolean
}

// ── Circle progress (matches Dart _CircleProgressPainter) ────
function CircleProgress({ progress, color, label }: { progress: number; color: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    const cx = size / 2, cy = size / 2, r = size / 2 - 6, sw = 7
    ctx.clearRect(0, 0, size, size)
    // Background
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.strokeStyle = C.border; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke()
    // Progress
    if (progress > 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * Math.min(progress, 1))
      ctx.strokeStyle = color; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke()
    }
  }, [progress, color])
  return (
    <div className="relative" style={{ width: 80, height: 80 }}>
      <canvas ref={canvasRef} width={80} height={80} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-bold" style={{ color }}>{label}</span>
        {progress > 0 && <span className="text-[8px]" style={{ color: C.txt3 }}>used</span>}
      </div>
    </div>
  )
}

// ── Bar chart (matches Dart _BarChartPainter) ────────────────
function BarChart({ data }: { data: DayUsage[] }) {
  if (!data.length) return null
  const maxVal = Math.max(...data.map(d => d.successCalls + d.errorCalls), 1)
  return (
    <div className="flex items-end gap-1.5" style={{ height: 160 }}>
      {data.map((d, i) => {
        const totalH  = ((d.successCalls + d.errorCalls) / maxVal) * 140
        const succH   = (d.successCalls / maxVal) * 140
        const errH    = (d.errorCalls   / maxVal) * 140
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end" style={{ height: 140 }}>
              <div className="flex-1 flex flex-col justify-end">
                {d.errorCalls > 0 && (
                  <div style={{ height: errH, backgroundColor: C.red + 'BF', borderRadius: '3px 3px 0 0' }} />
                )}
                {d.successCalls > 0 && (
                  <div style={{ height: succH, backgroundColor: C.green + 'D9', borderRadius: d.errorCalls === 0 ? '3px 3px 0 0' : '0', }} />
                )}
                {totalH === 0 && (
                  <div className="w-full flex justify-center">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.border }} />
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px]" style={{ color: C.txt3 }}>
              {d.date.getDate()}/{d.date.getMonth() + 1}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Donut chart (matches Dart _DonutChartPainter) ─────────────
function DonutChart({ data, total }: { data: Record<string, number>; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || total === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvas.width
    const cx = size / 2, cy = size / 2, r = Math.min(size / 2) - 10
    ctx.clearRect(0, 0, size, size)
    let angle = -Math.PI / 2
    for (const [key, val] of Object.entries(data)) {
      const sweep = (val / total) * 2 * Math.PI
      ctx.beginPath()
      ctx.arc(cx, cy, r, angle, angle + sweep - 0.05)
      ctx.strokeStyle = TOOL_COLORS[key] ?? C.txt3
      ctx.lineWidth = 18; ctx.lineCap = 'butt'; ctx.stroke()
      angle += sweep
    }
  }, [data, total])
  return (
    <div className="relative mx-auto" style={{ width: 120, height: 120 }}>
      <canvas ref={canvasRef} width={120} height={120} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-bold" style={{ color: C.txt1 }}>{total}</span>
        <span className="text-[10px]" style={{ color: C.txt3 }}>calls</span>
      </div>
    </div>
  )
}

// ── Chart card (matches Dart _ChartCard) ─────────────────────
function ChartCard({ title, icon: Icon, children, trailing }: {
  title: string; icon: React.ElementType; children: React.ReactNode; trailing?: React.ReactNode
}) {
  return (
    <div className="p-6 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: C.txt3 }} />
          <span className="text-[13px] font-bold" style={{ color: C.txt1 }}>{title}</span>
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

// ── Summary card (matches Dart _SummaryCard) ──────────────────
function SummaryCard({ icon: Icon, iconColor, iconBg, label, value, subtitle }: {
  icon: React.ElementType; iconColor: string; iconBg: string
  label: string; value: string; subtitle: string
}) {
  return (
    <div className="flex-1 p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ backgroundColor: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <span className="text-[22px] font-bold" style={{ color: C.txt1 }}>{value}</span>
      </div>
      <p className="text-[12px] font-semibold mb-1" style={{ color: C.txt2 }}>{label}</p>
      <p className="text-[11px]" style={{ color: C.txt3 }}>{subtitle}</p>
    </div>
  )
}

// ── Platform card (matches Dart _PlatformCard) ────────────────
function PlatformCard({ label, icon: Icon, health }: {
  label: string; icon: React.ElementType; health: PlatformHealth
}) {
  const isLocked = health.name === 'amazon_affiliate' || health.name === 'amazon'
  const hColor = isLocked ? C.txt3
    : health.healthScore >= 80 ? C.green
    : health.healthScore >= 60 ? C.orange : C.red

  const statusLabel: Record<string, string> = {
    connected:      'Connected',
    error:          'Error',
    expired:        'Expired',
    not_configured: 'Not Set',
  }

  return (
    <div className="flex-1 p-5 rounded-2xl border"
         style={{
           backgroundColor: C.surface,
           borderColor: isLocked ? C.border : hColor + '4D',
           borderWidth: isLocked ? 1 : 1.5,
         }}>
      <div className="flex items-center justify-between mb-4">
        <Icon size={20} style={{ color: isLocked ? C.txt3 : C.txt1 }} />
        {!isLocked ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
               style={{ backgroundColor: hColor + '1A', borderColor: hColor + '4D' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hColor }} />
            <span className="text-[9px] font-bold" style={{ color: hColor }}>
              {statusLabel[health.status] ?? 'Standby'}
            </span>
          </div>
        ) : (
          <Lock size={13} style={{ color: C.txt3 }} />
        )}
      </div>

      {/* Circle progress */}
      <div className="flex justify-center mb-4">
        <CircleProgress
          progress={isLocked ? 0 : health.usagePercent / 100}
          color={isLocked ? C.border : hColor}
          label={isLocked ? '—' : `${health.usagePercent}%`}
        />
      </div>

      <p className="text-[12px] font-bold mb-1" style={{ color: C.txt1 }}>{label}</p>
      {!isLocked ? (
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px]" style={{ color: C.txt3 }}>
            {health.rateLimitUsed}/{health.rateLimitTotal} reqs
          </p>
          <p className="text-[10px]" style={{ color: C.txt3 }}>{health.requestsToday} today</p>
          {health.daysUntilExpiry < 30 && health.daysUntilExpiry > 0 && (
            <p className="text-[10px] font-semibold mt-1" style={{ color: C.orange }}>
              ⚠️ Expires in {health.daysUntilExpiry}d
            </p>
          )}
        </div>
      ) : (
        <p className="text-[10px]" style={{ color: C.txt3 }}>Enterprise plan required</p>
      )}
    </div>
  )
}

// ── Quick action button (matches Dart _QuickActionButton) ─────
function QuickActionButton({ icon: Icon, label, subtitle, color, onTap }: {
  icon: React.ElementType; label: string; subtitle: string; color: string; onTap: () => void
}) {
  return (
    <button onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:opacity-80"
      style={{ backgroundColor: color + '0F', borderColor: color + '33' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: color + '26' }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold" style={{ color: C.txt1 }}>{label}</p>
        <p className="text-[10px]" style={{ color: C.txt3 }}>{subtitle}</p>
      </div>
      <ChevronRight size={12} style={{ color: C.txt3 }} />
    </button>
  )
}

// ── Status pill (matches Dart _StatusPill) ────────────────────
function StatusPill({ dot, label, onRefresh }: { dot: string; label: string; onRefresh?: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border"
         style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot, boxShadow: `0 0 4px ${dot}66` }} />
      <span className="text-[11px] font-semibold" style={{ color: C.txt2 }}>{label}</span>
      {onRefresh && (
        <button onClick={onRefresh} className="ml-1">
          <RefreshCw size={14} style={{ color: C.txt3 }} />
        </button>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ icon: Icon, msg, sub }: { icon: React.ElementType; msg: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Icon size={40} style={{ color: C.txt3 }} />
      <p className="text-[13px] mt-3" style={{ color: C.txt3 }}>{msg}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: C.txt3 }}>{sub}</p>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function GlobalApiFleetTab({ isInvestorMode, isMobile }: Props) {
  const supabase = createClient()

  const [loading,             setLoading]            = useState(true)
  const [lastRefreshed,       setLastRefreshed]       = useState(new Date())
  const [platformMap,         setPlatformMap]         = useState<Record<string, PlatformHealth>>({})
  const [totalRequestsToday,  setTotalRequestsToday]  = useState(0)
  const [totalRequestsMonth,  setTotalRequestsMonth]  = useState(0)
  const [connectedCount,      setConnectedCount]      = useState(0)
  const [activeNotifications, setActiveNotifications] = useState(0)
  const [recentActivity,      setRecentActivity]      = useState<any[]>([])
  const [toolBreakdown,       setToolBreakdown]       = useState<Record<string, number>>({})
  const [dailyUsage,          setDailyUsage]          = useState<DayUsage[]>([])
  const [showResetDialog,     setShowResetDialog]     = useState(false)

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([
        loadPlatformConfigs(),
        loadRecentActivity(),
        loadToolBreakdown(),
        loadDailyUsage(),
        loadNotificationCount(),
      ])
    } catch (e) { console.error('Analytics load error:', e) }
    setLoading(false)
    setLastRefreshed(new Date())
  }, [])

  useEffect(() => {
    loadAll()
    const t = setInterval(loadAll, 30000) // 30s matches Dart Timer.periodic
    return () => clearInterval(t)
  }, [loadAll])

  async function loadPlatformConfigs() {
    const { data: rawConfigs } = await supabase
      .from('api_fleet_config')
      .select('*')
      .in('platform_name', ['ebay', 'aliexpress', 'openai', 'amazon_affiliate'])
    const configs = (rawConfigs ?? []) as any[]

    const map: Record<string, PlatformHealth> = {}
    let totalToday = 0, totalMonth = 0, connected = 0

    for (const c of configs) {
      const name   = c.platform_name ?? ''
      const used   = c.rate_limit_used    ?? 0
      const total  = c.rate_limit_total   ?? 5000
      const pct    = total > 0 ? Math.round(used / total * 100) : 0
      const today  = c.requests_today     ?? 0
      const month  = c.requests_this_month ?? 0
      const status = c.status             ?? 'disconnected'

      totalToday += today; totalMonth += month
      if (status === 'connected' && name !== 'amazon_affiliate') connected++

      let daysLeft = 999
      if (c.expires_at) {
        const exp = new Date(c.expires_at)
        daysLeft = Math.ceil((exp.getTime() - Date.now()) / 86400000)
      }

      let health = 100
      if (status === 'expired') health = 0
      else if (status === 'error') health = 25
      else if (pct > 95) health = 40
      else if (pct > 85) health = 60
      else if (daysLeft < 7 && daysLeft > 0) health = 50
      else if (daysLeft < 30 && daysLeft > 0) health = 75
      else if (status === 'connected') health = 100
      else health = 30

      map[name] = { name, status, usagePercent: pct, rateLimitUsed: used, rateLimitTotal: total, requestsToday: today, requestsMonth: month, healthScore: health, daysUntilExpiry: daysLeft, lastRequestAt: c.last_request_at ? new Date(c.last_request_at) : null }
    }

    // FIX: always show 4 cards even if DB row missing
    for (const p of PLATFORMS) {
      if (!map[p.id]) {
        map[p.id] = { name: p.id, status: 'not_configured', usagePercent: 0, rateLimitUsed: 0, rateLimitTotal: 5000, requestsToday: 0, requestsMonth: 0, healthScore: 0, daysUntilExpiry: 999, lastRequestAt: null }
      }
    }

    setPlatformMap(map)
    setTotalRequestsToday(totalToday)
    setTotalRequestsMonth(totalMonth)
    setConnectedCount(Math.min(connected, 3))
  }

  async function loadRecentActivity() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('api_usage_logs').select('*')
      .eq('user_id', user.id).order('logged_at', { ascending: false }).limit(10)
    setRecentActivity((data ?? []) as any[])
  }

  async function loadToolBreakdown() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const since = new Date(Date.now() - 7 * 86400000).toISOString()
    const { data } = await supabase.from('api_usage_logs').select('tool_name, success_count')
      .eq('user_id', user.id).gte('logged_at', since)
    const breakdown: Record<string, number> = {}
    for (const row of (data ?? []) as any[]) {
      const tool = row.tool_name ?? 'other'
      breakdown[tool] = (breakdown[tool] ?? 0) + (row.success_count ?? 0)
    }
    setToolBreakdown(breakdown)
  }

  async function loadDailyUsage() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const daily: DayUsage[] = []
    let hasData = false
    for (let i = 6; i >= 0; i--) {
      const day   = new Date(Date.now() - i * 86400000)
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const end   = new Date(start.getTime() + 86400000)
      const { data } = await supabase.from('api_usage_logs').select('success_count, error_count')
        .eq('user_id', user.id).gte('logged_at', start.toISOString()).lt('logged_at', end.toISOString())
      let success = 0, errors = 0
      for (const row of (data ?? []) as any[]) {
        success += row.success_count ?? 0; errors += row.error_count ?? 0
      }
      if (success + errors > 0) hasData = true
      daily.push({ date: start, successCalls: success, errorCalls: errors })
    }
    setDailyUsage(daily)
  }

  async function loadNotificationCount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('api_notifications').select('id')
      .eq('user_id', user.id).eq('is_read', false).eq('is_dismissed', false)
    setActiveNotifications(((data ?? []) as any[]).length)
  }

  async function testAllApis() {
    await new Promise(r => setTimeout(r, 1000))
    await loadAll()
  }

  async function resetCounters() {
    setShowResetDialog(false)
    try {
      await supabase.rpc('reset_daily_api_counters')
      await loadAll()
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div className="flex flex-col gap-4 p-8" style={{ backgroundColor: C.bg }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} className="h-20 rounded-xl border animate-pulse" style={{ backgroundColor: C.surface, borderColor: C.border }} />
      ))}
    </div>
  )

  const mins = Math.floor((Date.now() - lastRefreshed.getTime()) / 60000)
  const refreshText = mins < 1 ? 'Just now' : `${mins}m ago`

  const scorable = PLATFORMS.filter(p => p.id !== 'amazon_affiliate')
    .map(p => platformMap[p.id]?.healthScore ?? 0)
  const avgHealth = scorable.length ? Math.round(scorable.reduce((a, b) => a + b, 0) / scorable.length) : 0

  const toolTotal = Object.values(toolBreakdown).reduce((a, b) => a + b, 0)

  // Usage projections
  const projections = Object.entries(platformMap)
    .filter(([k, p]) => k !== 'amazon_affiliate' && p.requestsToday > 0)
    .map(([, p]) => ({
      name: p.name,
      daysLeft: p.requestsToday > 0 ? Math.floor((p.rateLimitTotal - p.rateLimitUsed) / p.requestsToday) : 999,
    }))
    .filter(p => p.daysLeft < 999)

  return (
    <div className="flex flex-col gap-7" style={{ backgroundColor: C.bg }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight" style={{ color: C.txt1 }}>
            Global API Fleet Analytics
          </h2>
          <p className="text-[14px] mt-1" style={{ color: C.txt2 }}>
            Real-time monitoring across all connected platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill dot={C.green} label={`Updated ${refreshText}`} onRefresh={loadAll} />
          {activeNotifications > 0 && (
            <StatusPill dot={C.red} label={`${activeNotifications} Alert${activeNotifications > 1 ? 's' : ''}`} />
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex gap-4">
        <SummaryCard icon={Activity}   iconColor={C.blue}   iconBg={C.blue + '1A'}   label="Total Requests Today" value={String(totalRequestsToday)} subtitle={`${totalRequestsMonth} this month`} />
        <SummaryCard icon={Link}       iconColor={connectedCount === 3 ? C.green : C.orange} iconBg={(connectedCount === 3 ? C.green : C.orange) + '1A'} label="Connected Platforms" value={`${connectedCount}/3`} subtitle="Active integrations" />
        <SummaryCard icon={HeartPulse} iconColor={avgHealth >= 80 ? C.green : avgHealth >= 60 ? C.orange : C.red} iconBg={(avgHealth >= 80 ? C.green : avgHealth >= 60 ? C.orange : C.red) + '1A'} label="Avg Health Score" value={`${avgHealth}/100`} subtitle={avgHealth >= 80 ? 'All systems healthy' : avgHealth >= 60 ? 'Needs attention' : 'Critical issues'} />
        <SummaryCard icon={Bell}       iconColor={activeNotifications > 0 ? C.red : C.green} iconBg={(activeNotifications > 0 ? C.red : C.green) + '1A'} label="Active Alerts" value={String(activeNotifications)} subtitle={activeNotifications > 0 ? 'Require attention' : 'All clear!'} />
      </div>

      {/* Platform health grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse size={17} style={{ color: C.txt2 }} />
          <span className="text-[16px] font-bold" style={{ color: C.txt1 }}>Platform Health Overview</span>
        </div>
        <div className="flex gap-4">
          {PLATFORMS.map(p => (
            <PlatformCard key={p.id} label={p.label} icon={p.icon}
              health={platformMap[p.id] ?? { name: p.id, status: 'not_configured', usagePercent: 0, rateLimitUsed: 0, rateLimitTotal: 5000, requestsToday: 0, requestsMonth: 0, healthScore: 0, daysUntilExpiry: 999, lastRequestAt: null }} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="flex gap-5">
        {/* Daily usage bar chart */}
        <div style={{ flex: 3 }}>
          <ChartCard title="API Calls — Last 7 Days" icon={BarChart2}
            trailing={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }} /><span className="text-[10px]" style={{ color: C.txt3 }}>Success</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.red }} /><span className="text-[10px]" style={{ color: C.txt3 }}>Errors</span></div>
              </div>
            }>
            {dailyUsage.length === 0
              ? <EmptyState icon={BarChart2} msg="No call data yet" />
              : <BarChart data={dailyUsage} />}
          </ChartCard>
        </div>

        {/* Tool breakdown donut */}
        <div style={{ flex: 2 }}>
          <ChartCard title="Usage by Tool (7 days)" icon={PieChart}>
            {toolTotal === 0
              ? <EmptyState icon={PieChart} msg="No tool data yet" />
              : (
                <div className="flex flex-col gap-4">
                  <DonutChart data={toolBreakdown} total={toolTotal} />
                  <div className="flex flex-col gap-2">
                    {Object.entries(toolBreakdown).map(([key, val]) => {
                      const pct = toolTotal > 0 ? Math.round(val / toolTotal * 100) : 0
                      const color = TOOL_COLORS[key] ?? C.txt3
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="flex-1 text-[11px] font-semibold truncate" style={{ color: C.txt2 }}>
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-[11px] font-bold" style={{ color: C.txt1 }}>{pct}%</span>
                          <span className="text-[10px]" style={{ color: C.txt3 }}>({val})</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
          </ChartCard>
        </div>
      </div>

      {/* Activity + Quick Actions row */}
      <div className="flex gap-5">
        {/* Recent activity */}
        <div style={{ flex: 3 }}>
          <ChartCard title="Recent API Activity" icon={History}>
            {recentActivity.length === 0
              ? <EmptyState icon={History} msg="No activity yet" sub="API calls appear here in real-time" />
              : (
                <div className="flex flex-col gap-2.5">
                  {recentActivity.map((log, i) => {
                    const success  = (log.success_count ?? 0) > 0
                    const endpoint = log.endpoint      ?? 'unknown'
                    const platform = log.platform_name ?? 'unknown'
                    const tool     = log.tool_name     ?? 'unknown'
                    const ms       = log.response_time_ms as number | null
                    const at       = log.logged_at ? new Date(log.logged_at) : null
                    const diff     = at ? Date.now() - at.getTime() : null
                    const timeAgo  = !diff ? '—'
                      : diff < 60000  ? 'just now'
                      : diff < 3600000? `${Math.floor(diff/60000)}m ago`
                      : diff < 86400000? `${Math.floor(diff/3600000)}h ago`
                      : `${Math.floor(diff/86400000)}d ago`
                    return (
                      <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border"
                           style={{ backgroundColor: success ? C.green + '0D' : C.red + '0D', borderColor: success ? C.green + '33' : C.red + '33' }}>
                        {success
                          ? <CheckCircle size={13} style={{ color: C.green }} />
                          : <XCircle    size={13} style={{ color: C.red   }} />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold truncate" style={{ color: C.txt1 }}>{endpoint}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: C.navy + '14', color: C.txt2 }}>{platform}</span>
                          </div>
                          <p className="text-[10px]" style={{ color: C.txt3 }}>
                            {tool.replace(/_/g, ' ')}{ms ? ` • ${ms}ms` : ''}
                          </p>
                        </div>
                        <span className="text-[10px] shrink-0" style={{ color: C.txt3 }}>{timeAgo}</span>
                      </div>
                    )
                  })}
                </div>
              )}
          </ChartCard>
        </div>

        {/* Quick actions */}
        <div style={{ flex: 2 }}>
          <ChartCard title="Quick Actions" icon={Zap}>
            <div className="flex flex-col gap-3">
              <QuickActionButton icon={Wifi}      label="Test All APIs"          subtitle="Ping all connected platforms"  color={C.blue}   onTap={testAllApis} />
              <QuickActionButton icon={RotateCcw} label="Reset Daily Counters"   subtitle="Clear today's request counts"  color={C.orange} onTap={() => setShowResetDialog(true)} />
              <QuickActionButton icon={RefreshCw} label="Refresh Dashboard"      subtitle="Reload all real-time data"     color={C.green}  onTap={loadAll} />

              {/* Usage projection */}
              {projections.length > 0 && (
                <div className="p-3.5 rounded-xl border mt-2"
                     style={{ backgroundColor: C.accentDim, borderColor: C.accent + '66' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={13} style={{ color: C.navy }} />
                    <span className="text-[11px] font-bold" style={{ color: C.navy }}>Usage Projection</span>
                  </div>
                  {projections.map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.daysLeft < 3 ? C.red : p.daysLeft < 7 ? C.orange : C.green }} />
                      <span className="text-[11px]" style={{ color: C.navy }}>
                        {p.name.toUpperCase()}: limit in ~{p.daysLeft} day{p.daysLeft === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Reset dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={e => e.target === e.currentTarget && setShowResetDialog(false)}>
          <div className="bg-white rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
            <h3 className="text-[16px] font-bold mb-2" style={{ color: C.txt1 }}>Reset Counters?</h3>
            <p className="text-[13px] mb-5" style={{ color: C.txt2 }}>
              This will reset today's request counters for all platforms.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetDialog(false)}
                className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
                style={{ borderColor: C.border, color: C.txt2 }}>Cancel</button>
              <button onClick={resetCounters}
                className="flex-1 py-2 rounded-lg text-[13px] font-bold text-white"
                style={{ backgroundColor: C.navy }}>Reset</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}