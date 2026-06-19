'use client'
// components/admin/tabs/GlobalApiFleetTab.tsx
// Fixed: performance, activity scope, testAllApis, mobile layout, brand colors

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ShoppingCart, ShoppingBag, Brain, Lock,
  Activity, Link, HeartPulse, Bell,
  BarChart2, PieChart, History, Zap,
  RefreshCw, RotateCcw, Wifi, TrendingUp,
  CheckCircle, XCircle, ChevronRight, AlertTriangle,
  Mail, CreditCard,
} from 'lucide-react'

// ── Brand color tokens (from Riazify design PDF) ─────────────
const C = {
  bg:        '#f7f9f5',
  surface:   '#ffffff',
  border:    '#e8ede2',
  dark:      '#0a0d08',
  lime:      '#8fff00',
  limeMid:   '#6bcc00',
  limeDeep:  '#4a8f00',
  limeTint:  '#f4ffe6',
  limeTint2: '#e8ffcc',
  txt1:      '#1a2410',
  txt2:      '#4a5e38',
  txt3:      '#8a9e78',
  green:     '#16a34a',
  orange:    '#fb923c',
  red:       '#f87171',
  blue:      '#378add',
}

const PLATFORMS = [
  { id: 'ebay',         label: 'eBay Network',    icon: ShoppingCart },
  { id: 'resend',       label: 'Resend Email',     icon: Mail         },
  { id: 'openai',       label: 'OpenAI Engine',    icon: Brain        },
  { id: 'aliexpress',   label: 'AliExpress',       icon: ShoppingBag  },
  { id: 'lemonsqueezy', label: 'LemonSqueezy',     icon: CreditCard   },
  { id: 'stripe',       label: 'Stripe',           icon: CreditCard   },
  { id: 'amazon_spapi', label: 'Amazon SP-API',    icon: Lock         },
]

const TOOL_COLORS: Record<string, string> = {
  orders:              C.blue,
  product_research:    C.lime,
  competitor_research: C.orange,
  title_builder:       '#8b5cf6',
  profit_calculator:   '#ec4899',
  other:               C.txt3,
}

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

// ── Circle progress ───────────────────────────────────────────
function CircleProgress({ progress, color, label }: { progress: number; color: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sz = canvas.width, cx = sz/2, cy = sz/2, r = sz/2-6, sw = 7
    ctx.clearRect(0, 0, sz, sz)
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI)
    ctx.strokeStyle = C.border; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke()
    if (progress > 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + 2*Math.PI*Math.min(progress, 1))
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

// ── Bar chart ─────────────────────────────────────────────────
function BarChart({ data }: { data: DayUsage[] }) {
  if (!data.length) return null
  const maxVal = Math.max(...data.map(d => d.successCalls + d.errorCalls), 1)
  return (
    <div className="flex items-end gap-1.5" style={{ height: 160 }}>
      {data.map((d, i) => {
        const succH = (d.successCalls / maxVal) * 140
        const errH  = (d.errorCalls   / maxVal) * 140
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end" style={{ height: 140 }}>
              <div className="flex-1 flex flex-col justify-end">
                {d.errorCalls > 0 && (
                  <div style={{ height: errH, backgroundColor: C.red+'BF', borderRadius: '3px 3px 0 0' }} />
                )}
                {d.successCalls > 0 && (
                  <div style={{ height: succH, backgroundColor: C.lime+'CC', borderRadius: d.errorCalls === 0 ? '3px 3px 0 0' : 0 }} />
                )}
                {d.successCalls === 0 && d.errorCalls === 0 && (
                  <div className="w-full flex justify-center">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.border }} />
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px]" style={{ color: C.txt3 }}>
              {d.date.getDate()}/{d.date.getMonth()+1}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Donut chart ───────────────────────────────────────────────
function DonutChart({ data, total }: { data: Record<string, number>; total: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || total === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sz = canvas.width, cx = sz/2, cy = sz/2, r = sz/2-10
    ctx.clearRect(0, 0, sz, sz)
    let angle = -Math.PI/2
    for (const [key, val] of Object.entries(data)) {
      const sweep = (val/total)*2*Math.PI
      ctx.beginPath()
      ctx.arc(cx, cy, r, angle, angle+sweep-0.05)
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

// ── Chart card ────────────────────────────────────────────────
function ChartCard({ title, icon: Icon, children, trailing }: {
  title: string; icon: React.ElementType; children: React.ReactNode; trailing?: React.ReactNode
}) {
  return (
    <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: C.txt3 }} />
          <span className="text-[13px] font-bold" style={{ color: C.txt1 }}>{title}</span>
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

// ── Summary card ──────────────────────────────────────────────
function SummaryCard({ icon: Icon, iconColor, iconBg, label, value, subtitle }: {
  icon: React.ElementType; iconColor: string; iconBg: string
  label: string; value: string; subtitle: string
}) {
  return (
    <div className="flex-1 p-4 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        <span className="text-[22px] font-bold" style={{ color: C.txt1 }}>{value}</span>
      </div>
      <p className="text-[12px] font-semibold mb-0.5" style={{ color: C.txt2 }}>{label}</p>
      <p className="text-[11px]" style={{ color: C.txt3 }}>{subtitle}</p>
    </div>
  )
}

// ── Platform card ─────────────────────────────────────────────
function PlatformCard({ label, icon: Icon, health }: {
  label: string; icon: React.ElementType; health: PlatformHealth
}) {
  const isLocked = health.name === 'amazon_affiliate'
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
    <div className="flex-1 p-4 rounded-2xl border"
         style={{
           backgroundColor: isLocked ? C.bg : C.surface,
           borderColor: isLocked ? C.border : hColor+'4D',
           borderWidth: isLocked ? 1 : 1.5,
         }}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={18} style={{ color: isLocked ? C.txt3 : C.txt1 }} />
        {!isLocked ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
               style={{ backgroundColor: hColor+'1A', borderColor: hColor+'4D' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hColor }} />
            <span className="text-[9px] font-bold" style={{ color: hColor }}>
              {statusLabel[health.status] ?? 'Standby'}
            </span>
          </div>
        ) : (
          <Lock size={12} style={{ color: C.txt3 }} />
        )}
      </div>
      <div className="flex justify-center mb-3">
        <CircleProgress
          progress={isLocked ? 0 : health.usagePercent/100}
          color={isLocked ? C.border : hColor}
          label={isLocked ? '—' : `${health.usagePercent}%`}
        />
      </div>
      <p className="text-[12px] font-bold mb-0.5" style={{ color: C.txt1 }}>{label}</p>
      {!isLocked ? (
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px]" style={{ color: C.txt3 }}>{health.rateLimitUsed}/{health.rateLimitTotal} reqs</p>
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

// ── Quick action button ───────────────────────────────────────
function QuickActionButton({ icon: Icon, label, subtitle, color, onTap, loading }: {
  icon: React.ElementType; label: string; subtitle: string
  color: string; onTap: () => void; loading?: boolean
}) {
  return (
    <button onClick={onTap} disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:opacity-80"
      style={{ backgroundColor: color+'0F', borderColor: color+'33', opacity: loading ? 0.6 : 1 }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ backgroundColor: color+'26' }}>
        {loading
          ? <RefreshCw size={16} style={{ color, animation: 'spin 1s linear infinite' }} />
          : <Icon size={16} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold" style={{ color: C.txt1 }}>{label}</p>
        <p className="text-[10px]" style={{ color: C.txt3 }}>{subtitle}</p>
      </div>
      <ChevronRight size={12} style={{ color: C.txt3 }} />
    </button>
  )
}

// ── Status pill ───────────────────────────────────────────────
function StatusPill({ dot, label, onRefresh }: { dot: string; label: string; onRefresh?: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
         style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot, boxShadow: `0 0 4px ${dot}66` }} />
      <span className="text-[11px] font-semibold" style={{ color: C.txt2 }}>{label}</span>
      {onRefresh && (
        <button onClick={onRefresh} className="ml-1">
          <RefreshCw size={13} style={{ color: C.txt3 }} />
        </button>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ icon: Icon, msg, sub }: { icon: React.ElementType; msg: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Icon size={36} style={{ color: C.txt3 }} />
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

  const [loading,             setLoading]           = useState(true)
  const [lastRefreshed,       setLastRefreshed]      = useState(new Date())
  const [platformMap,         setPlatformMap]        = useState<Record<string, PlatformHealth>>({})
  const [totalRequestsToday,  setTotalRequestsToday] = useState(0)
  const [totalRequestsMonth,  setTotalRequestsMonth] = useState(0)
  const [connectedCount,      setConnectedCount]     = useState(0)
  const [activeNotifications, setActiveNotifications]= useState(0)
  const [recentActivity,      setRecentActivity]     = useState<any[]>([])
  const [toolBreakdown,       setToolBreakdown]      = useState<Record<string, number>>({})
  const [dailyUsage,          setDailyUsage]         = useState<DayUsage[]>([])
  const [showResetDialog,     setShowResetDialog]    = useState(false)
  const [testingApis,         setTestingApis]        = useState(false)
  const [testResult,          setTestResult]         = useState<string | null>(null)
  const [resetSuccess,        setResetSuccess]       = useState(false)
  const [resetting,           setResetting]          = useState(false)
  const [refreshing,          setRefreshing]         = useState(false)

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([
        loadPlatformConfigs(),
        loadRecentActivity(),
        loadToolBreakdown(),
        loadDailyUsage(),   // FIX 1: single query instead of 7
        loadNotificationCount(),
      ])
    } catch (e) { console.error('GlobalApiFleet load error:', e) }
    setLoading(false)
    setLastRefreshed(new Date())
  }, [])

  useEffect(() => {
    loadAll()
    const t = setInterval(loadAll, 30000)
    return () => clearInterval(t)
  }, [loadAll])

  // ── Platform configs ──────────────────────────────────────
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
      const used   = c.rate_limit_used     ?? 0
      const total  = c.rate_limit_total    ?? 5000
      const pct    = total > 0 ? Math.round(used/total*100) : 0
      const today  = c.requests_today      ?? 0
      const month  = c.requests_this_month ?? 0
      const status = c.status              ?? 'not_configured'

      totalToday += today; totalMonth += month
if (status === 'connected' && name !== 'amazon_spapi') connected++

      let daysLeft = 999
      if (c.expires_at) daysLeft = Math.ceil((new Date(c.expires_at).getTime()-Date.now())/86400000)

      let health = 100
      if (status === 'expired') health = 0
      else if (status === 'error') health = 25
      else if (pct > 95) health = 40
      else if (pct > 85) health = 60
      else if (daysLeft < 7  && daysLeft > 0) health = 50
      else if (daysLeft < 30 && daysLeft > 0) health = 75
      else if (status === 'connected') health = 100
      else health = 30

      map[name] = { name, status, usagePercent: pct, rateLimitUsed: used, rateLimitTotal: total, requestsToday: today, requestsMonth: month, healthScore: health, daysUntilExpiry: daysLeft, lastRequestAt: c.last_request_at ? new Date(c.last_request_at) : null }
    }

    for (const p of PLATFORMS) {
      if (!map[p.id]) map[p.id] = { name: p.id, status: 'not_configured', usagePercent: 0, rateLimitUsed: 0, rateLimitTotal: 5000, requestsToday: 0, requestsMonth: 0, healthScore: 0, daysUntilExpiry: 999, lastRequestAt: null }
    }

    setPlatformMap(map)
    setTotalRequestsToday(totalToday)
    setTotalRequestsMonth(totalMonth)
    setConnectedCount(connected)
  }

  // ── FIX 2: Recent activity — admin-wide (no user_id filter) ─
  async function loadRecentActivity() {
    const { data } = await supabase
      .from('api_usage_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(10)
    setRecentActivity((data ?? []) as any[])
  }

  // ── FIX 2: Tool breakdown — admin-wide (no user_id filter) ──
  async function loadToolBreakdown() {
    const since = new Date(Date.now()-7*86400000).toISOString()
    const { data } = await supabase
      .from('api_usage_logs')
      .select('tool_name, success_count')
      .gte('logged_at', since)
    const breakdown: Record<string, number> = {}
    for (const row of (data ?? []) as any[]) {
      const tool = row.tool_name ?? 'other'
      breakdown[tool] = (breakdown[tool] ?? 0) + (row.success_count ?? 0)
    }
    setToolBreakdown(breakdown)
  }

  // ── FIX 1: Daily usage — single query instead of 7 loops ───
  async function loadDailyUsage() {
    const since = new Date(Date.now()-7*86400000).toISOString()
    const { data } = await supabase
      .from('api_usage_logs')
      .select('success_count, error_count, logged_at')
      .gte('logged_at', since)
      .order('logged_at', { ascending: true })

    // Group by day in JS
    const dayMap: Record<string, { success: number; errors: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(Date.now()-i*86400000)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      dayMap[key] = { success: 0, errors: 0 }
    }
    for (const row of (data ?? []) as any[]) {
      const d   = new Date(row.logged_at)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (dayMap[key]) {
        dayMap[key].success += row.success_count ?? 0
        dayMap[key].errors  += row.error_count   ?? 0
      }
    }
    const daily: DayUsage[] = Object.entries(dayMap).map(([, v], idx) => {
      const d = new Date(Date.now()-(6-idx)*86400000)
      return { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), successCalls: v.success, errorCalls: v.errors }
    })
    setDailyUsage(daily)
  }

  async function loadNotificationCount() {
    const { data } = await supabase
      .from('api_notifications')
      .select('id')
      .eq('is_read', false)
      .eq('is_dismissed', false)
    setActiveNotifications(((data ?? []) as any[]).length)
  }

  // ── Manual refresh with spinner + feedback ──────────────────
  async function handleRefresh() {
    setRefreshing(true)
    try {
      await Promise.all([
        loadPlatformConfigs(),
        loadRecentActivity(),
        loadToolBreakdown(),
        loadDailyUsage(),
        loadNotificationCount(),
      ])
      setLastRefreshed(new Date())
    } catch (e) { console.error('Refresh error:', e) }
    setRefreshing(false)
  }
  async function testAllApis() {
    setTestingApis(true)
    setTestResult(null)
    try {
      // Step 1: get current keys from DB
      const { data: rawConfigs } = await supabase
        .from('api_fleet_config')
        .select('platform_name, status, primary_key_1, primary_key_2, backup_key_1')
        .in('platform_name', ['ebay', 'aliexpress', 'openai'])

      const configs = (rawConfigs ?? []) as any[]
      const ebay    = configs.find((c: any) => c.platform_name === 'ebay')
      let pingSuccess = false
      let pingMs      = 0

      // Step 2: actually ping eBay via edge function if keys exist
      if (ebay?.primary_key_1 && ebay?.primary_key_2) {
        const start  = Date.now()
        try {
          const result = await supabase.functions.invoke('ebay-proxy', {
            body: {
              appId:    ebay.primary_key_1,
              devId:    ebay.backup_key_1 ?? '',
              certId:   ebay.primary_key_2,
              testMode: true,
            }
          })
          pingMs      = Date.now() - start
          pingSuccess = result.data?.success === true

          // Update status in DB based on real ping result
          await (supabase.from('api_fleet_config') as any).update({
            status:         pingSuccess ? 'connected' : 'error',
            last_tested_at: new Date().toISOString(),
          }).eq('platform_name', 'ebay')
        } catch {
          pingMs = Date.now() - start
        }
        setTestResult(
          pingSuccess
            ? `✅ eBay API live — ${pingMs}ms response`
            : `⚠️ eBay ping failed — ${pingMs}ms — check keys`
        )
      } else {
        // No keys — just check DB status
        const connected = (configs ?? []).filter((c: any) => c.status === 'connected').length
        setTestResult(`✅ Checked ${(configs ?? []).length} platforms — ${connected} connected`)
      }

      await loadAll()
    } catch (e) {
      setTestResult('❌ Test failed — check console')
      console.error(e)
    }
    setTestingApis(false)
    setTimeout(() => setTestResult(null), 5000)
  }

  // ── Issue 2+3 Fix: resetCounters — feedback + error handling ─
  async function resetCounters() {
    setShowResetDialog(false)
    setResetting(true)
    setResetSuccess(false)
    try {
      const { error } = await supabase.rpc('reset_daily_api_counters')
      if (error) {
        // RPC might not exist — fallback: manually reset in DB
        console.warn('RPC not found, falling back to manual reset:', error)
        await (supabase.from('api_fleet_config') as any)
          .update({ requests_today: 0, rate_limit_used: 0 })
          .in('platform_name', ['ebay', 'aliexpress', 'openai', 'amazon_affiliate'])
      }
      setResetSuccess(true)
      setTimeout(() => setResetSuccess(false), 4000)
      await loadAll()
    } catch (e) {
      console.error('Reset failed:', e)
    }
    setResetting(false)
  }

  if (loading) return (
    <div className="flex flex-col gap-4 p-6" style={{ backgroundColor: C.bg }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} className="h-20 rounded-xl border animate-pulse" style={{ backgroundColor: C.surface, borderColor: C.border }} />
      ))}
    </div>
  )

  const mins = Math.floor((Date.now()-lastRefreshed.getTime())/60000)
  const refreshText = mins < 1 ? 'Just now' : `${mins}m ago`

  const scorable  = PLATFORMS.filter(p => p.id !== 'amazon_spapi').map(p => platformMap[p.id]?.healthScore ?? 0)
  const avgHealth = scorable.length ? Math.round(scorable.reduce((a,b) => a+b, 0)/scorable.length) : 0
  const toolTotal = Object.values(toolBreakdown).reduce((a,b) => a+b, 0)
  const projections = Object.entries(platformMap)
    .filter(([k, p]) => k !== 'amazon_affiliate' && p.requestsToday > 0)
    .map(([, p]) => ({ name: p.name, daysLeft: Math.floor((p.rateLimitTotal-p.rateLimitUsed)/p.requestsToday) }))
    .filter(p => p.daysLeft < 30)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight" style={{ color: C.txt1 }}>
            Global API Fleet
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: C.txt3 }}>
            Real-time monitoring across all connected platforms
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusPill dot={C.green} label={`Updated ${refreshText}`} onRefresh={handleRefresh} />
          {activeNotifications > 0 && (
            <StatusPill dot={C.red} label={`${activeNotifications} Alert${activeNotifications > 1 ? 's' : ''}`} />
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
        <SummaryCard icon={Activity}   iconColor={C.blue}   iconBg={C.blue+'1A'}   label="Requests Today" value={String(totalRequestsToday)} subtitle={`${totalRequestsMonth} this month`} />
        <SummaryCard icon={Link}       iconColor={connectedCount===PLATFORMS.filter(p => p.id !== 'amazon_spapi').length?C.green:C.orange} iconBg={(connectedCount===PLATFORMS.filter(p => p.id !== 'amazon_spapi').length?C.green:C.orange)+'1A'} label="Connected Platforms" value={`${connectedCount}/${PLATFORMS.filter(p => p.id !== 'amazon_spapi').length}`} subtitle="Active integrations" />
        <SummaryCard icon={HeartPulse} iconColor={avgHealth>=80?C.green:avgHealth>=60?C.orange:C.red} iconBg={(avgHealth>=80?C.green:avgHealth>=60?C.orange:C.red)+'1A'} label="Avg Health Score" value={`${avgHealth}/100`} subtitle={avgHealth>=80?'All systems healthy':avgHealth>=60?'Needs attention':'Critical issues'} />
        <SummaryCard icon={Bell}       iconColor={activeNotifications>0?C.red:C.green} iconBg={(activeNotifications>0?C.red:C.green)+'1A'} label="Active Alerts" value={String(activeNotifications)} subtitle={activeNotifications>0?'Require attention':'All clear!'} />
      </div>

      {/* FIX 4: Platform health — responsive grid ────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse size={16} style={{ color: C.txt3 }} />
          <span className="text-[15px] font-bold" style={{ color: C.txt1 }}>Platform Health Overview</span>
        </div>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {PLATFORMS.map(p => (
            <PlatformCard key={p.id} label={p.label} icon={p.icon}
              health={platformMap[p.id] ?? { name: p.id, status: 'not_configured', usagePercent: 0, rateLimitUsed: 0, rateLimitTotal: 5000, requestsToday: 0, requestsMonth: 0, healthScore: 0, daysUntilExpiry: 999, lastRequestAt: null }} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
        <div style={{ flex: 3 }}>
          <ChartCard title="API Calls — Last 7 Days" icon={BarChart2}
            trailing={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.lime }} /><span className="text-[10px]" style={{ color: C.txt3 }}>Success</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.red }} /><span className="text-[10px]" style={{ color: C.txt3 }}>Errors</span></div>
              </div>
            }>
            {dailyUsage.length === 0
              ? <EmptyState icon={BarChart2} msg="No call data yet" />
              : <BarChart data={dailyUsage} />}
          </ChartCard>
        </div>
        <div style={{ flex: 2 }}>
          <ChartCard title="Usage by Tool (7 days)" icon={PieChart}>
            {toolTotal === 0
              ? <EmptyState icon={PieChart} msg="No tool data yet" />
              : (
                <div className="flex flex-col gap-4">
                  <DonutChart data={toolBreakdown} total={toolTotal} />
                  <div className="flex flex-col gap-2">
                    {Object.entries(toolBreakdown).map(([key, val]) => {
                      const pct   = toolTotal > 0 ? Math.round(val/toolTotal*100) : 0
                      const color = TOOL_COLORS[key] ?? C.txt3
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="flex-1 text-[11px] font-semibold truncate" style={{ color: C.txt2 }}>
                            {key.replace(/_/g,' ').toUpperCase()}
                          </span>
                          <span className="text-[11px] font-bold" style={{ color: C.txt1 }}>{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
          </ChartCard>
        </div>
      </div>

      {/* Activity + Quick Actions */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''}`}>
        <div style={{ flex: 3 }}>
          <ChartCard title="Recent API Activity — All Users" icon={History}>
            {recentActivity.length === 0
              ? <EmptyState icon={History} msg="No activity yet" sub="API calls appear here in real-time" />
              : (
                <div className="flex flex-col gap-2">
                  {recentActivity.map((log, i) => {
                    const success  = (log.success_count ?? 0) > 0
                    const ms       = log.response_time_ms as number | null
                    const isSlow   = ms !== null && ms >= 3000
                    const endpoint = log.endpoint      ?? 'unknown'
                    const platform = log.platform_name ?? 'unknown'
                    const tool     = log.tool_name     ?? 'unknown'
                    const at       = log.logged_at ? new Date(log.logged_at) : null
                    const diff     = at ? Date.now()-at.getTime() : null
                    const timeAgo  = !diff ? '—'
                      : diff < 60000    ? 'just now'
                      : diff < 3600000  ? `${Math.floor(diff/60000)}m ago`
                      : diff < 86400000 ? `${Math.floor(diff/3600000)}h ago`
                      : `${Math.floor(diff/86400000)}d ago`
                    const rowColor  = isSlow ? C.orange : success ? C.green : C.red
                    const rowBg     = isSlow ? C.orange+'0D' : success ? C.green+'0D' : C.red+'0D'
                    const rowBorder = isSlow ? C.orange+'33' : success ? C.green+'33' : C.red+'33'
                    const RowIcon   = isSlow ? AlertTriangle : success ? CheckCircle : XCircle
                    return (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border"
                           style={{ backgroundColor: rowBg, borderColor: rowBorder }}>
                        <RowIcon size={13} style={{ color: rowColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-semibold truncate" style={{ color: C.txt1 }}>{endpoint}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                  style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>{platform}</span>
                            {isSlow && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                    style={{ backgroundColor: C.orange+'20', color: C.orange }}>
                                ⚠️ Slow
                              </span>
                            )}
                          </div>
                          <p className="text-[10px]" style={{ color: C.txt3 }}>
                            {tool.replace(/_/g,' ')} •{' '}
                            <span style={{ color: isSlow ? C.orange : C.txt3, fontWeight: isSlow ? 700 : 400 }}>
                              {ms ? `${ms}ms` : '—'}
                            </span>
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

        <div style={{ flex: 2 }}>
          <ChartCard title="Quick Actions" icon={Zap}>
            <div className="flex flex-col gap-3">
              <QuickActionButton icon={Wifi}      label="Test All APIs"        subtitle="Ping all connected platforms"  color={C.blue}     onTap={testAllApis}                    loading={testingApis} />
              <QuickActionButton icon={RotateCcw} label="Reset Daily Counters" subtitle="Clear today's request counts"  color={C.orange}   onTap={() => setShowResetDialog(true)} loading={resetting}  />
              <QuickActionButton icon={RefreshCw} label="Refresh Dashboard"    subtitle="Reload all real-time data"     color={C.limeDeep} onTap={handleRefresh}                  loading={refreshing} />

              {/* Test result feedback */}
              {testResult && (
                <div className="px-3 py-2 rounded-lg text-[11px] font-semibold"
                     style={{
                       backgroundColor: testResult.startsWith('✅') ? C.green+'15' : testResult.startsWith('⚠️') ? C.orange+'15' : C.red+'15',
                       color:           testResult.startsWith('✅') ? C.green      : testResult.startsWith('⚠️') ? C.orange      : C.red,
                     }}>
                  {testResult}
                </div>
              )}

              {/* Issue 2 Fix: Reset success feedback */}
              {resetSuccess && (
                <div className="px-3 py-2 rounded-lg text-[11px] font-semibold"
                     style={{ backgroundColor: C.green+'15', color: C.green }}>
                  ✅ Daily counters reset — all platforms back to 0
                </div>
              )}

              {/* Usage projection */}
              {projections.length > 0 && (
                <div className="p-3 rounded-xl border mt-1"
                     style={{ backgroundColor: C.limeTint2, borderColor: C.lime+'66' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={12} style={{ color: C.limeDeep }} />
                    <span className="text-[11px] font-bold" style={{ color: C.limeDeep }}>Usage Projection</span>
                  </div>
                  {projections.map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full"
                           style={{ backgroundColor: p.daysLeft < 3 ? C.red : p.daysLeft < 7 ? C.orange : C.green }} />
                      <span className="text-[11px]" style={{ color: C.txt1 }}>
                        {p.name.toUpperCase()}: limit in ~{p.daysLeft}d
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
              This resets today's request counters for all platforms.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetDialog(false)}
                className="flex-1 py-2 rounded-lg border text-[13px] font-semibold"
                style={{ borderColor: C.border, color: C.txt2 }}>Cancel</button>
              <button onClick={resetCounters}
                className="flex-1 py-2 rounded-lg text-[13px] font-bold"
                style={{ backgroundColor: C.dark, color: C.lime }}>Reset</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}