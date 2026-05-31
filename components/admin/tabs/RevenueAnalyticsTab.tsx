'use client'
// components/admin/tabs/RevenueAnalyticsTab.tsx
// Converted 1:1 from lib/pages/admin_tabs/revenue_analytics_tab.dart

import { useState, useEffect, useRef } from 'react'
import {
  Calculator, Link, Shield, User,
  TrendingUp, TrendingDown, DollarSign,
  MonitorOff, Map, RefreshCw, Gavel,
  FileText, ArrowUpCircle, CreditCard, RefreshCcw,
} from 'lucide-react'

const C = {
  dark:      '#0F172A',
  lime:      '#8FFF00',
  limeDeep:  '#4A8F00',
  limeTint:  'rgba(143,255,0,0.10)',
  limeBorder:'rgba(143,255,0,0.20)',
  border:    '#E2E8F0',
  surface:   '#fff',
  bg:        '#F8FAFC',
  textPri:   '#0F172A',
  textMuted: '#64748B',
  textHint:  '#94A3B8',
  green:     '#16A34A',
  red:       '#F87171',
}

interface Props {
  isDesktop?:           boolean
  isInvestorMode?:      boolean
  startChartAnimation?: boolean
}

function obscure(text: string, investorMode: boolean, isEmail = false): string {
  if (!investorMode) return text
  if (isEmail) {
    const parts = text.split('@')
    if (parts.length !== 2) return text
    return `${parts[0][0]}***@${parts[1]}`
  }
  return `${text[0]}***`
}

// ── Card decoration ────────────────────────────────────────────
function Card({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="p-5 rounded-2xl border"
         style={{
           backgroundColor: dark ? C.dark : C.surface,
           borderColor: dark ? 'rgba(143,255,0,0.25)' : C.border,
           boxShadow: dark ? '0 0 20px rgba(143,255,0,0.08)' : '0 4px 10px rgba(0,0,0,0.03)',
         }}>
      {children}
    </div>
  )
}

// ── Lime left accent bar ───────────────────────────────────────
function LimeBar() {
  return <div className="w-0.5 h-9 rounded-full shrink-0 mr-3" style={{ backgroundColor: C.lime }} />
}

// ── Card header ────────────────────────────────────────────────
function CardHeader({ title, subtitle, right, dark = false }: { title: string; subtitle: string; right?: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-start gap-0">
      <LimeBar />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-extrabold" style={{ color: dark ? '#fff' : C.textPri }}>{title}</p>
        <p className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.4)' : C.textMuted }}>{subtitle}</p>
      </div>
      {right}
    </div>
  )
}

// ── Animated bar (matches Dart AnimatedContainer) ────────────
function AnimBar({ height, color, delay, radius = '4px' }: { height: number; color: string; delay: number; radius?: string }) {
  const [h, setH] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (height === 0) { setH(0); return }
    timerRef.current = setTimeout(() => setH(height), delay)
    return () => clearTimeout(timerRef.current)
  }, [height]) // re-runs only when height changes (0→value on enter, value→0 on leave)
  return <div style={{ height: h, backgroundColor: color, borderRadius: radius, transition: `height 500ms cubic-bezier(0.34,1.56,0.64,1)` }} />
}

// ── Animated progress bar ─────────────────────────────────────
function AnimProgress({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [w, setW] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (pct === 0) { setW(0); return }
    timerRef.current = setTimeout(() => setW(pct), delay + 100)
    return () => clearTimeout(timerRef.current)
  }, [pct]) // re-runs only when pct changes (0→value on enter, value→0 on leave)
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.bg }}>
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
           style={{ width: `${w * 100}%`, backgroundColor: color }} />
    </div>
  )
}

// ── Donut chart (matches Dart TweenAnimationBuilder 1400ms easeOutCubic — plays once, stops) ──
function DonutChart({ sections, progress, center }: {
  sections: { value: number; color: string }[]
  progress: number
  center?: React.ReactNode
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef  = useRef<number>(0)
  const startRef  = useRef<number>(0)
  const doneRef   = useRef(false)

  function draw(p: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cx = 90, cy = 90, r = 72, sw = 18
    ctx.clearRect(0, 0, 180, 180)
    const total = sections.reduce((s, x) => s + x.value, 0)
    let angle = -Math.PI / 2
    for (const s of sections) {
      const sweep = (s.value / total) * 2 * Math.PI * p
      if (sweep <= 0) { angle += sweep; continue }
      ctx.beginPath()
      ctx.arc(cx, cy, r, angle, angle + sweep)
      ctx.strokeStyle = s.color
      ctx.lineWidth = sw
      ctx.lineCap = 'round'
      ctx.stroke()
      angle += sweep
    }
  }

  useEffect(() => {
    cancelAnimationFrame(frameRef.current)
    doneRef.current = false

    if (progress === 0) {
      draw(0)
      return
    }

    startRef.current = performance.now()
    function tick(now: number) {
      const t    = Math.min((now - startRef.current) / 1400, 1)
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic — matches Dart Curves.easeOutCubic
      draw(ease)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        doneRef.current = true  // ✅ animation complete — RAF stops, no more redraws
        draw(1)
      }
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [progress]) // only re-runs when progress flips (tab enter/leave)

  return (
    <div className="relative" style={{ width: 180, height: 180 }}>
      <canvas ref={canvasRef} width={180} height={180} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {center}
      </div>
    </div>
  )
}

// ── Pulse badge — isolated component so interval doesn't re-render entire tab ──
function PulseBadge() {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setOn(p => !p), 900)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="px-2 py-1 rounded-full border text-[9px] font-bold shrink-0 transition-opacity duration-300"
         style={{
           backgroundColor: 'rgba(251,146,60,0.12)',
           borderColor: 'rgba(251,146,60,0.4)',
           color: '#FB923C',
           opacity: on ? 1 : 0.4,
         }}>
      ⚠ Approaching Limit
    </div>
  )
}

// ── All transactions ───────────────────────────────────────────
const ALL_TX = [
  { icon: TrendingUp,    color: '#16A34A', amount: '+$99.00', user: 'Michael Scott', plan: 'Elite Upgrade',  time: '2 mins ago',  type: 'Upgrade', failed: false },
  { icon: RefreshCcw,    color: '#0F172A', amount: '+$49.00', user: 'Sarah Jenkins', plan: 'Pro Renewal',    time: '15 mins ago', type: 'Renewal', failed: false },
  { icon: CreditCard,    color: '#F87171', amount: 'FAILED',  user: 'David Chen',    plan: 'Card Expired',   time: '1 hour ago',  type: 'Failed',  failed: true  },
  { icon: TrendingUp,    color: '#16A34A', amount: '+$49.00', user: 'Emma Watson',   plan: 'Pro Upgrade',    time: '3 hours ago', type: 'Upgrade', failed: false },
  { icon: RefreshCcw,    color: '#0F172A', amount: '+$49.00', user: 'James Miller',  plan: 'Pro Renewal',    time: '5 hours ago', type: 'Renewal', failed: false },
  { icon: CreditCard,    color: '#F87171', amount: 'FAILED',  user: 'Lisa Turner',   plan: 'Expired Card',   time: '6 hours ago', type: 'Failed',  failed: true  },
]

export default function RevenueAnalyticsTab({ isDesktop = true, isInvestorMode = false, startChartAnimation = false }: Props) {
  const [txFilter,     setTxFilter]     = useState('All')
  const [donutProgress,setDonutProgress]= useState(0)

  useEffect(() => {
    if (startChartAnimation) setDonutProgress(1)
    else setDonutProgress(0)
  }, [startChartAnimation])

  const filteredTx = txFilter === 'All' ? ALL_TX : ALL_TX.filter(t => t.type === txFilter)
  const failedCount = ALL_TX.filter(t => t.failed).length

  // ── Mini stat card ─────────────────────────────────────────
  function MiniStat({ title, value, icon: Icon, trend, trendUp }: { title: string; value: string; icon: any; trend: string; trendUp: boolean }) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.limeTint }}>
          <Icon size={16} style={{ color: C.limeDeep }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-extrabold" style={{ color: C.textPri }}>{value}</p>
          <p className="text-[10px]" style={{ color: C.textMuted }}>{title}</p>
        </div>
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
             style={{ backgroundColor: trendUp ? '#16A34A1A' : '#F871711A' }}>
          {trendUp ? <TrendingUp size={9} style={{ color: '#16A34A' }} /> : <TrendingDown size={9} style={{ color: '#F87171' }} />}
          <span className="text-[9px] font-bold ml-0.5" style={{ color: trendUp ? '#16A34A' : '#F87171' }}>{trend}</span>
        </div>
      </div>
    )
  }

  // ── MRR Chart ──────────────────────────────────────────────
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const mrrData = [40,45,30,50,65,55,70,80,75,90,85,100]

  function MRRChart() {
    return (
      <Card>
        <CardHeader title="30-Day MRR Growth" subtitle="Daily revenue increases this month"
          right={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0"
                 style={{ backgroundColor: C.limeTint, borderColor: C.limeBorder }}>
              <TrendingUp size={12} style={{ color: C.limeDeep }} />
              <span className="text-[10px] font-bold" style={{ color: C.limeDeep }}>+14% vs last month</span>
            </div>
          } />
        <div className="flex items-end gap-1 mt-6" style={{ height: 200 }}>
          {mrrData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5">
              <AnimBar height={startChartAnimation ? v * 1.6 : 0} color={i === mrrData.length - 1 ? C.lime : C.dark}
                delay={500 + i * 80} radius="4px 4px 0 0" />
              <span className="text-[8px]" style={{ color: C.textHint }}>{months[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2.5">
          <span className="text-[9px]" style={{ color: C.textHint }}>$0</span>
          <span className="text-[9px]" style={{ color: C.textHint }}>$12.5K</span>
        </div>
      </Card>
    )
  }

  // ── Plan Distribution ──────────────────────────────────────
  const plans = [
    { label: 'Free',  pct: 60, color: C.border,  users: 505 },
    { label: 'Pro',   pct: 30, color: C.dark,    users: 253 },
    { label: 'Elite', pct: 10, color: C.lime,    users: 84  },
  ]

  function PlanDistribution() {
    return (
      <Card>
        <CardHeader title="Plan Distribution" subtitle="User breakdown by active tier" />
        <div className="flex justify-center mt-6">
          <DonutChart
            sections={plans.map(p => ({ value: p.pct, color: p.color }))}
            progress={donutProgress}
            center={
              <>
                <p className="text-[22px] font-extrabold" style={{ color: C.textPri }}>{Math.round(donutProgress * 842)}</p>
                <p className="text-[10px]" style={{ color: C.textMuted }}>Total Users</p>
              </>
            }
          />
        </div>
        <div className="flex flex-col gap-2.5 mt-5">
          {plans.map(p => (
            <div key={p.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm border shrink-0"
                   style={{ backgroundColor: p.color, borderColor: p.color === C.border ? C.textHint : p.color }} />
              <span className="flex-1 text-[12px]" style={{ color: C.textMuted }}>{p.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: C.textPri }}>{p.users} users</span>
              <div className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                   style={{ backgroundColor: C.bg, color: C.textMuted }}>{p.pct}%</div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // ── Sub Growth Trend ───────────────────────────────────────
  const weeks     = ['W1','W2','W3','W4','W5','W6','W7','W8']
  const newUsers  = [12,18,15,22,19,28,24,31]
  const churned   = [3,4,5,3,6,4,5,3]
  const maxVal    = 35

  function SubGrowth() {
    return (
      <Card>
        <CardHeader title="Subscription Growth Trend" subtitle="New signups vs churned per week"
          right={
            <div className="px-2.5 py-1 rounded-full border shrink-0"
                 style={{ backgroundColor: C.limeTint, borderColor: C.limeBorder }}>
              <span className="text-[10px] font-bold" style={{ color: C.limeDeep }}>Net +28 this month</span>
            </div>
          } />
        <div className="flex items-end gap-1 mt-5" style={{ height: 160 }}>
          {weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5">
              <div className="w-full flex flex-col">
                <AnimBar height={startChartAnimation ? (churned[i] / maxVal) * 120 : 0}
                  color="rgba(248,113,113,0.7)" delay={400 + i * 60} radius="3px 3px 0 0" />
                <AnimBar height={startChartAnimation ? (newUsers[i] / maxVal) * 120 : 0}
                  color={C.lime} delay={400 + i * 60} radius="0 0 3px 3px" />
              </div>
              <span className="text-[8px]" style={{ color: C.textHint }}>{w}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          {[{ color: C.lime, label: 'New signups' }, { color: 'rgba(248,113,113,0.7)', label: 'Churned' }].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[11px]" style={{ color: C.textMuted }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // ── Revenue Goals ──────────────────────────────────────────
  const goals = [
    { label: 'Monthly Goal',   current: 12450, target: 15000,  color: C.lime     },
    { label: 'Quarterly Goal', current: 34200, target: 45000,  color: '#60A5FA'  },
    { label: 'Annual Goal',    current: 89400, target: 180000, color: '#A78BFA'  },
  ]

  function RevenueGoals() {
    return (
      <Card>
        <CardHeader title="Revenue Goals" subtitle="Monthly, quarterly & annual targets" />
        <div className="flex flex-col gap-4 mt-5">
          {goals.map(g => {
            const pct = g.current / g.target
            return (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold" style={{ color: C.textPri }}>{g.label}</span>
                  <span className="text-[11px]">
                    <span className="font-bold" style={{ color: g.color }}>${(g.current/1000).toFixed(1)}K</span>
                    <span style={{ color: C.textHint }}> / ${(g.target/1000).toFixed(0)}K</span>
                  </span>
                </div>
                <AnimProgress pct={startChartAnimation ? pct : 0} color={g.color} />
                <p className="text-[9px] font-semibold mt-1" style={{ color: g.color }}>{Math.round(pct * 100)}% complete</p>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  // ── Transaction Ledger ─────────────────────────────────────
  function TransactionLedger() {
    return (
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-0">
            <LimeBar />
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: C.textPri }}>Live Transaction Ledger</p>
              <p className="text-[11px]" style={{ color: C.textMuted }}>Real-time Stripe activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {failedCount > 0 && (
              <div className="px-2 py-0.5 rounded-full border text-[10px] font-bold"
                   style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#F87171' }}>
                {failedCount} failed
              </div>
            )}
            <button className="text-[11px]" style={{ color: C.textMuted }}>View in Stripe →</button>
          </div>
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: 'none' }}>
          {['All','Upgrade','Renewal','Failed'].map(f => (
            <button key={f} onClick={() => setTxFilter(f)}
              className="px-3 py-1 rounded-full border text-[11px] font-semibold shrink-0 transition-all"
              style={{
                backgroundColor: txFilter === f ? C.dark : C.bg,
                borderColor: txFilter === f ? 'rgba(143,255,0,0.4)' : C.border,
                color: txFilter === f ? '#fff' : C.textMuted,
              }}>
              {f}
            </button>
          ))}
        </div>
        {/* Transactions */}
        {filteredTx.map((t, i) => {
          const Icon = t.icon
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                 style={{ borderColor: C.bg }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                   style={{ backgroundColor: t.color + '1A' }}>
                <Icon size={13} style={{ color: t.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate" style={{ color: C.textPri }}>
                  {obscure(t.user, isInvestorMode)}
                </p>
                <p className="text-[11px]" style={{ color: C.textMuted }}>{t.plan}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-bold" style={{ color: t.failed ? '#F87171' : '#16A34A' }}>{t.amount}</p>
                <p className="text-[10px]" style={{ color: C.textHint }}>{t.time}</p>
              </div>
            </div>
          )
        })}
      </Card>
    )
  }

  // ── P&L Tracker ────────────────────────────────────────────
  const grossRevenue = 12450
  const stripeFee    = (grossRevenue * 0.029) + (310 * 0.30)
  const serverCosts  = 45
  const affiliatePayout = 360
  const totalCosts   = stripeFee + serverCosts + affiliatePayout
  const netProfit    = grossRevenue - totalCosts
  const margin       = (netProfit / grossRevenue) * 100

  function ProfitAndLoss() {
    return (
      <Card dark>
        <div className="flex items-start gap-0 mb-5">
          <LimeBar />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-white">True Profit & Loss (P&L)</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Gross Revenue minus all expenses</p>
          </div>
          <div className="px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0"
               style={{ backgroundColor: C.lime, color: C.dark }}>
            {margin.toFixed(1)}% Margin
          </div>
        </div>
        <div className="flex items-center">
          {[
            { label: 'Gross Revenue', value: `$${grossRevenue.toFixed(2)}`, color: '#fff',   icon: DollarSign },
            { label: 'Total Costs',   value: `-$${totalCosts.toFixed(2)}`,  color: '#F87171', icon: MonitorOff },
            { label: 'Net Profit',    value: `$${netProfit.toFixed(2)}`,    color: C.lime,   icon: DollarSign },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                {i > 0 && <div className="absolute w-px h-12 opacity-10 bg-white" />}
                <Icon size={17} style={{ color: 'rgba(255,255,255,0.35)' }} />
                <p className="text-[18px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 p-3.5 rounded-xl border"
             style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
          {[
            ['Supabase', '$25/mo'],
            ['Vercel', '$20/mo'],
            [`Stripe Fees`, `$${stripeFee.toFixed(2)}/mo`],
            [`Affiliates`, `$${affiliatePayout.toFixed(2)}/mo`],
          ].map(([l, v], i) => (
            <span key={i} className="text-[11px]">
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>{l}: </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{v}</span>
            </span>
          ))}
        </div>
      </Card>
    )
  }

  // ── Geographic Heatmap ─────────────────────────────────────
  const regions = [
    { country: 'United States', pct: 0.65, users: '547', revenue: '$8,090', color: C.lime         },
    { country: 'United Kingdom',pct: 0.20, users: '168', revenue: '$2,490', color: '#60A5FA'       },
    { country: 'Australia',     pct: 0.10, users: '67',  revenue: '$1,245', color: '#FB923C'       },
    { country: 'Canada',        pct: 0.05, users: '42',  revenue: '$623',   color: '#C084FC'       },
    { country: 'Germany',       pct: 0.02, users: '18',  revenue: '$249',   color: '#2DD4BF'       },
    { country: 'France',        pct: 0.015,users: '12',  revenue: '$186',   color: '#F472B6'       },
    { country: 'Italy',         pct: 0.01, users: '8',   revenue: '$124',   color: '#22D3EE'       },
    { country: 'Spain',         pct: 0.005,users: '4',   revenue: '$62',    color: '#FDE047'       },
  ]

  function GeographicHeatmap() {
    return (
      <Card dark>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: C.limeTint }}>
            <Map size={14} style={{ color: C.lime }} />
          </div>
          <div>
            <p className="text-[14px] font-extrabold text-white">Geographic Heatmap</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Users & revenue by region</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-2 text-[9px] font-bold tracking-[0.8px] mb-2.5"
             style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span className="col-span-1">REGION</span>
          <span className="text-right">USERS</span>
          <span className="text-right" style={{ color: 'rgba(143,255,0,0.5)' }}>REVENUE</span>
        </div>
        {regions.map((r, i) => (
          <div key={i} className="mb-3">
            <div className="grid grid-cols-3 gap-x-2 mb-1.5">
              <span className="text-[12px] font-semibold text-white col-span-1 truncate">{r.country}</span>
              <span className="text-[11px] text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.users}</span>
              <span className="text-[11px] text-right font-semibold" style={{ color: 'rgba(143,255,0,0.85)' }}>{r.revenue}</span>
            </div>
            <AnimProgress pct={startChartAnimation ? r.pct : 0} color={r.color} delay={i * 80} />
          </div>
        ))}
      </Card>
    )
  }

  // ── Tax Compliance ─────────────────────────────────────────
  const taxBars = [
    { title: 'UK VAT Registration',       label: '£80,500 / £85,000',   pct: 0.94, color: '#FB923C' },
    { title: 'EU OSS Distance Selling',   label: '€3,200 / €10,000',    pct: 0.32, color: C.green  },
    { title: 'US Nexus (California)',      label: '$145k / $500k',        pct: 0.29, color: C.green  },
  ]

  function TaxCompliance() {
    return (
      <Card>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-0">
            <LimeBar />
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: C.textPri }}>Tax & VAT Compliance</p>
              <p className="text-[11px]" style={{ color: C.textMuted }}>Monitor regional revenue thresholds</p>
            </div>
          </div>
          <PulseBadge />
        </div>
        <div className="flex flex-col gap-3.5">
          {taxBars.map((t, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold" style={{ color: C.textPri }}>{t.title}</span>
                <span className="text-[11px] font-bold" style={{ color: t.color }}>{t.label}</span>
              </div>
              <AnimProgress pct={startChartAnimation ? t.pct : 0} color={t.color} delay={i * 100} />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // ── Dispute Defense ────────────────────────────────────────
  function DisputeDefense() {
    return (
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-0">
            <LimeBar />
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: C.textPri }}>Dispute Defense Center</p>
              <p className="text-[11px]" style={{ color: C.textMuted }}>Generate PDF evidence for Stripe disputes</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full border text-[10px] font-bold"
               style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#F87171' }}>
            1 Active
          </div>
        </div>
        <div className="p-3.5 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'rgba(248,113,113,0.1)' }}>
              <Gavel size={15} style={{ color: '#F87171' }} />
            </div>
            <div>
              <p className="text-[12px] font-bold" style={{ color: C.textPri }}>
                {obscure('David Chen (david.chen22@yahoo.com)', isInvestorMode, true)}
              </p>
              <p className="text-[11px]" style={{ color: C.textMuted }}>Disputed: $99.00 • Fraudulent</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-bold text-white"
                  style={{ backgroundColor: C.dark }}>
            <FileText size={13} />
            Submit Evidence (PDF)
          </button>
        </div>
      </Card>
    )
  }

  // ── Layout ─────────────────────────────────────────────────
  const desktop = isDesktop

  return (
    <div className="flex flex-col gap-4">
      {/* Mini stats */}
      <div className={`grid gap-3 ${desktop ? 'grid-cols-4' : 'grid-cols-1'}`}>
        <MiniStat title="Calculations Run"  value="4,200"  icon={Calculator}  trend="+8%" trendUp />
        <MiniStat title="eBay Links Fetched" value="1,850" icon={Link}        trend="+5%" trendUp />
        <MiniStat title="VeRO Checks"       value="340"   icon={Shield}      trend="-2%" trendUp={false} />
        <MiniStat title="ARPU"              value="$14.78" icon={User}        trend="+3%" trendUp />
      </div>

      {/* Row 1: MRR + Plan Distribution */}
      <div className={`grid gap-4 ${desktop ? 'grid-cols-10' : 'grid-cols-1'}`}>
        <div className={desktop ? 'col-span-6' : ''}><MRRChart /></div>
        <div className={desktop ? 'col-span-4' : ''}><PlanDistribution /></div>
      </div>

      {/* Row 2: Sub Growth + Revenue Goals */}
      <div className={`grid gap-4 ${desktop ? 'grid-cols-10' : 'grid-cols-1'}`}>
        <div className={desktop ? 'col-span-6' : ''}><SubGrowth /></div>
        <div className={desktop ? 'col-span-4' : ''}><RevenueGoals /></div>
      </div>

      {/* Row 3: Ledger+P&L left, Heatmap+Tax+Dispute right */}
      <div className={`grid gap-4 ${desktop ? 'grid-cols-10' : 'grid-cols-1'}`}>
        <div className={`flex flex-col gap-4 ${desktop ? 'col-span-6' : ''}`}>
          <TransactionLedger />
          <ProfitAndLoss />
        </div>
        <div className={`flex flex-col gap-4 ${desktop ? 'col-span-4' : ''}`}>
          <GeographicHeatmap />
          <TaxCompliance />
          <DisputeDefense />
        </div>
      </div>
    </div>
  )
}