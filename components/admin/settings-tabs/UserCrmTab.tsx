'use client'
// components/admin/settings-tabs/UserCrmTab.tsx
// Complete production User CRM — security fixed, N+1 eliminated, full UI overhaul

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase'

// -- Inline presence helpers (from hooks/usePresence.ts) --------
// If you've created hooks/usePresence.ts you can replace this
// with: import { useOnlineUserIds, getOnlineCount } from '@/hooks/usePresence'

function useOnlineUserIds(): Set<string> {
  const supabase = createClient()
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    const channel = supabase.channel('riazify-presence')
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string }>()
        const ids   = new Set<string>()
        for (const presences of Object.values(state)) {
          for (const p of presences as any[]) {
            if (p.userId) ids.add(p.userId)
          }
        }
        setOnlineIds(ids)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])
  return onlineIds
}

function getOnlineCount(users: any[]): number {
  const THREE_MIN = 3 * 60 * 1000  // matches 2-min heartbeat + buffer
  return users.filter(u =>
    u.last_seen && (Date.now() - new Date(u.last_seen).getTime()) < THREE_MIN
  ).length
}
// --------------------------------------------------------------
import {
  UserPlus, X, Mail, Lock, LogOut, DollarSign, Calendar,
  Store, Monitor, Smartphone, Copy, Trash2, ChevronDown,
  AlertTriangle, Check, Search, RefreshCw, Users,
  TimerOff, Headphones, MoreVertical, User, CloudOff,
  CheckCircle, Plus, Shield, Key, Activity, TrendingDown,
  Clock, Wifi, WifiOff, Zap, Gift, TrendingUp, XCircle,
  Award, Globe, AtSign, Camera, PlayCircle, HelpCircle,
  Link2, Wrench, BarChart2 as BarChart, MessageSquare, Filter, ArrowRight, SlidersHorizontal, FileText,
} from 'lucide-react'

import { UserDetailDrawer } from './UserDetailDrawer'

// -- Brand tokens -----------------------------------------------
const C = {
  dark:    '#0a0d08', lime:    '#8fff00', limeDeep: '#4a8f00',
  limeTint:'#f4ffe6', border:  '#e8ede2', bg:       '#f7f9f5',
  text:    '#1a2410', muted:   '#8a9e78', surface:  '#ffffff',
  red:     '#b91c1c', amber:   '#d97706', green:    '#16a34a',
}
const PAGE_SIZES = [25, 50, 100]

// -- Badge helpers ----------------------------------------------
function planBadge(plan: string) {
  const p = (plan ?? '').toLowerCase()
  if (p.includes('growth') || p.includes('custom') || p.includes('starter')) return { bg: C.lime,    text: C.dark  }
  return                                                { bg: C.bg,      text: C.muted }
}
function statusBadge(status: string) {
  if (status === 'Active')    return { bg: 'rgba(22,163,74,0.10)',  text: C.green   }
  if (status === 'Past Due')  return { bg: 'rgba(217,119,6,0.10)',  text: C.amber   }
  if (status === 'Expired')   return { bg: 'rgba(185,28,28,0.10)',  text: C.red     }
  if (status === 'Suspended') return { bg: 'rgba(249,115,22,0.12)', text: '#c2410c' }
  if (status === 'Banned')    return { bg: 'rgba(127,29,29,0.15)',  text: '#7f1d1d' }
  return                             { bg: C.bg,                    text: C.muted   }
}

// -- Data helpers -----------------------------------------------
function getInitials(n: string) {
  const p = (n ?? '').trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (n ?? 'U').slice(0,2).toUpperCase()
}
function nameToColor(n: string) {
  const pal = ['#4a8f00','#1d70f5','#d97706','#8b5cf6','#e11d48','#0891b2']
  let h = 0; for (const c of n ?? '') h = c.charCodeAt(0) + ((h << 5) - h)
  return pal[Math.abs(h) % pal.length]
}
function fmtDate(iso: string) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }
  catch { return '—' }
}
function fmtDateTime(iso: string) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) }
  catch { return '—' }
}
function timeAgo(iso: string) {
  if (!iso) return 'Never'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`
}
function planOf(u: any)   { return u.subscriptions?.[0]?.plan_name ?? u.plan_name ?? 'Free Trial' }
function statusOf(u: any): string {
  const as   = (u.account_status ?? '').trim().toLowerCase()
  // Suspension takes highest priority
  if (as === 'suspended') return 'Suspended'
  if (as === 'banned')    return 'Banned'

  const s    = u.subscriptions?.[0]?.status
  const plan = planOf(u).toLowerCase()
  const isFree = plan.includes('free')

  function isTrialOver() {
    if (!isFree) return false
    const days = trialDaysLeft(u)
    return days !== null && days <= 0
  }

  if (s === 'active')   return isTrialOver() ? 'Expired' : 'Active'
  if (s === 'past_due') return 'Past Due'
  if (s === 'expired' || s === 'cancelled' || s === 'canceled') return 'Expired'

  if (as === 'active') return isTrialOver() ? 'Expired' : 'Active'
  if (as === 'past due' || as === 'Past Due') return 'Past Due'
  if (as === 'expired') return 'Expired'
  return isTrialOver() ? 'Expired' : 'Active'
}
function mrrOf(u: any)    { return Number(u.subscriptions?.find((s:any) => s.status==='active')?.amount ?? 0) }
function ltvOf(u: any)    {
  return (u.subscriptions ?? [])
    .filter((s: any) => Number(s.amount ?? 0) > 0)
    .reduce((sum: number, s: any) => sum + Number(s.amount ?? 0), 0)
}
function hasDispute(u: any){ return (u.disputes ?? []).some((d:any) => d.status !== 'resolved') }

// -- Health Score (0-100) ---------------------------------------
function calcHealthScore(u: any): number {
  let score = 0
  // Login recency (0-40 pts)
  if (u.last_seen) {
    const days = (Date.now() - new Date(u.last_seen).getTime()) / 86400000
    score += days < 1 ? 40 : days < 3 ? 30 : days < 7 ? 20 : days < 14 ? 10 : 0
  }
  // Tool usage (0-30 pts — 5 per tool used)
  const toolCount = (u.toolUsage ?? []).length
  score += Math.min(toolCount * 5, 30)
  // eBay connected (0-20 pts)
  if (u.ebayConnection?.is_connected) {
    const days = u.ebayConnection.expires_at
      ? (new Date(u.ebayConnection.expires_at).getTime() - Date.now()) / 86400000 : 365
    score += days > 7 ? 20 : days > 0 ? 10 : 0
  }
  // Plan tier (0-10 pts)
  const p = planOf(u).toLowerCase()
  score += p.includes('custom') ? 10 : p.includes('growth') ? 7 : p.includes('starter') ? 5 : 3
  return Math.min(Math.round(score), 100)
}

// -- Churn Risk from Health Score -------------------------------
function churnRisk(score: number) {
  if (score >= 70) return { label: 'Low Risk',    color: C.green, bg: 'rgba(22,163,74,0.10)'  }
  if (score >= 40) return { label: 'Medium Risk', color: C.amber, bg: 'rgba(217,119,6,0.10)'  }
  return               { label: 'High Risk',   color: C.red,   bg: 'rgba(185,28,28,0.10)'  }
}

// -- Trial Days Remaining ---------------------------------------
function trialDaysLeft(u: any): number | null {
  if (!planOf(u).toLowerCase().includes('free')) return null
  const sub = u.subscriptions?.[0]
  if (sub?.current_period_end) {
    const d = Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / 86400000)
    return Math.max(d, 0)
  }
  if (u.created_at) {
    const d = Math.ceil(14 - (Date.now() - new Date(u.created_at).getTime()) / 86400000)
    return Math.max(d, 0)
  }
  return null
}

// -- eBay Connection Status -------------------------------------
function ebayStatus(u: any): 'connected' | 'expiring' | 'disconnected' | 'none' {
  const conn = u.ebayConnection
  if (!conn) return 'none'
  if (!conn.is_connected) return 'disconnected'
  if (conn.expires_at) {
    const days = (new Date(conn.expires_at).getTime() - Date.now()) / 86400000
    if (days <= 0)  return 'disconnected'
    if (days <= 14) return 'expiring'
  }
  return 'connected'
}

function ebayDaysLeft(u: any): number | null {
  const e = u.ebayConnection?.expires_at
  if (!e) return null
  return Math.ceil((new Date(e).getTime() - Date.now()) / 86400000)
}

// -- Riazify Tool Definitions -----------------------------------
const TOOLS = [
  { key: 'ebay_orders',        name: 'Orders'        },
  { key: 'profit_calculator',  name: 'Profit Calc'   },
  { key: 'title_builder',      name: 'Title Builder' },
  { key: 'product_research',   name: 'Product Res.'  },
  { key: 'competitor_research',name: 'Competitor'    },
]

// -- Tag config -------------------------------------------------
const TAG_CFG: Record<string, { label:string; color:string; bg:string; Icon:React.ElementType }> = {
  vip:          { label:'VIP',          color:'#4a8f00', bg:'#f4ffe6', Icon: Award          },
  power_user:   { label:'Power User',   color:'#8b5cf6', bg:'#F5F3FF', Icon: Zap            },
  beta_tester:  { label:'Beta Tester',  color:'#1d70f5', bg:'#EFF6FF', Icon: Key            },
  influencer:   { label:'Influencer',   color:'#d97706', bg:'#FEF3C7', Icon: Users          },
  hot_lead:     { label:'Hot Lead',     color:'#f97316', bg:'#FFF7ED', Icon: TrendingUp     },
  at_risk:      { label:'At Risk',      color:'#d97706', bg:'#FFFBEB', Icon: AlertTriangle  },
  suspended:    { label:'Suspended',    color:'#b91c1c', bg:'#FEF2F2', Icon: XCircle        },
  partner:      { label:'Partner',      color:'#0d9488', bg:'#F0FDFA', Icon: Link2          },
}
const SEGMENT_CFG: Record<string, { label:string; Icon:React.ElementType; color:string; bg:string }> = {
  power:          { label:'Power Users',    Icon: Zap,          color:'#4a8f00', bg:'#f4ffe6' },
  new_user:       { label:'New Users',      Icon: UserPlus,     color:'#1d70f5', bg:'#EFF6FF' },
  at_risk:        { label:'At Risk',        Icon: AlertTriangle,color:'#d97706', bg:'#FFFBEB' },
  dormant:        { label:'Dormant',        Icon: TimerOff,     color:'#8a9e78', bg:'#f7f9f5' },
  high_value:     { label:'High Value',     Icon: DollarSign,   color:'#d97706', bg:'#FEF3C7' },
  trial_expiring: { label:'Trial Expiring', Icon: Clock,        color:'#b91c1c', bg:'#FEF2F2' },
}

// -- Get user's primary segment ---------------------------------
function getUserSegment(u: any): string | null {
  const health    = calcHealthScore(u)
  const lastSeen  = u.last_seen
    ? (Date.now() - new Date(u.last_seen).getTime()) / 86400000 : 999
  const joinedDays= (Date.now() - new Date(u.created_at).getTime()) / 86400000
  const toolCount = (u.toolUsage ?? []).length
  const ltv       = ltvOf(u)
  const trialDays = trialDaysLeft(u)

  // Order matters — most specific first
  if (trialDays !== null && trialDays <= 3 && trialDays >= 0) return 'trial_expiring'
  if (lastSeen >= 30)                                          return 'dormant'
  if (joinedDays < 7)                                          return 'new_user'
  if (health >= 70 && lastSeen < 3 && toolCount >= 2)          return 'power'
  if (health >= 40 && health < 70 && lastSeen >= 7)            return 'at_risk'
  if (ltv > 50 || mrrOf(u) > 0)                               return 'high_value'
  return null
}

// -- Export users to CSV ----------------------------------------
function exportToCSV(users: any[], filterLabel: string) {
  const headers = [
    'Name', 'Email', 'Plan', 'Status',
    'Joined', 'Last Active', 'Health Score',
    'Churn Risk', 'Monthly Value ($)', 'LTV ($)',
    'eBay Status', 'Trial Days Left',
    'Country', 'Platform', 'User ID',
  ]

  const escape = (val: any) =>
    `"${String(val ?? '').replace(/"/g, '""')}"`

  const rows = users.map(u => {
    const health = calcHealthScore(u)
    const risk   = churnRisk(health)
    const eStatus = ebayStatus(u)
    const days   = trialDaysLeft(u)
    return [
      escape(u.name ?? u.email?.split('@')[0] ?? 'Unknown'),
      escape(u.email ?? ''),
      escape(planOf(u)),
      escape(statusOf(u)),
      escape(fmtDate(u.created_at)),
      escape(timeAgo(u.last_seen)),
      escape(health),
      escape(risk.label),
      escape(mrrOf(u)),
      escape(ltvOf(u)),
      escape(
        eStatus === 'connected'    ? 'Connected' :
        eStatus === 'expiring'     ? 'Expiring Soon' :
        eStatus === 'disconnected' ? 'Disconnected' : 'Not Connected'
      ),
      escape(days !== null ? `${days} days` : 'N/A'),
      escape(u.country ?? u.verified_city ?? 'Unknown'),
      escape(u.device_platform ?? 'Unknown'),
      escape(u.id ?? ''),
    ]
  })

  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  link.href     = url
  link.download = `riazify-users-${filterLabel.toLowerCase().replace(/\s/g,'-')}-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// -- Avatar -----------------------------------------------------
function Avatar({ name, size = 36, avatarUrl }: {
  name: string; size?: number; avatarUrl?: string | null
}) {
  const bg = nameToColor(name)
  if (avatarUrl) {
    return (
      <div style={{ width:size, height:size, borderRadius:'50%',
        overflow:'hidden', flexShrink:0, backgroundColor: bg }}>
        <img
          src={avatarUrl}
          alt={name}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    )
  }
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', backgroundColor:bg,
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ color:'#fff', fontSize: size * 0.35, fontWeight:800 }}>
        {getInitials(name)}
      </span>
    </div>
  )
}

// -- Toast ------------------------------------------------------
function Toast({ msg, type }: { msg:string; type:'success'|'error'|'info' }) {
  const map = {
    success: { bg: C.dark, border: C.lime,   text: C.lime,  Icon: CheckCircle  },
    error:   { bg:'#FEF2F2', border:'#FECACA', text: C.red,  Icon: AlertTriangle },
    info:    { bg: C.bg,   border: C.border, text: C.text,  Icon: Shield        },
  }
  const { bg, border, text, Icon } = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: bg, border: `1px solid ${border}`, color: text }}>
      <Icon size={15} /><p className="text-[13px] font-bold">{msg}</p>
    </div>
  )
}

// --------------------------------------------------------------
// BLOCK 1 — HUD METRIC DECK
// --------------------------------------------------------------
function HudDeck({ users, onlineIds, showToast, onGoToMarketing, canDo = () => true }: {
    users: any[]
    onlineIds: Set<string>
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void
    onGoToMarketing: (users: any[]) => void
    canDo?: (action: string) => boolean
  }) {
  const supabase = createClient()
  const total      = users.length
  const activeSubs = users.filter(u => mrrOf(u) > 0).length
  const activeRatio= total > 0 ? activeSubs / total : 0

  const free      = users.filter(u => planOf(u).toLowerCase() === 'free').length
  const freeTrial = users.filter(u => planOf(u).toLowerCase() === 'free trial').length
  const starter   = users.filter(u => planOf(u).toLowerCase() === 'starter').length
  const growth    = users.filter(u => planOf(u).toLowerCase() === 'growth').length
  const custom    = users.filter(u => planOf(u).toLowerCase() === 'custom').length

  const highRisk   = users.filter(u => calcHealthScore(u) < 40).length
  const mediumRisk = users.filter(u => { const s = calcHealthScore(u); return s >= 40 && s < 70 }).length

  const ebayDisconnected = users.filter(u => {
    const s = ebayStatus(u); return s === 'disconnected' || s === 'expiring'
  }).length

  const dispCount = users.filter(hasDispute).length
  const firstDisp = users.find(hasDispute)

  // New this week
  const weekAgo        = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek    = users.filter(u => u.created_at && new Date(u.created_at) >= weekAgo).length

  // Trials expiring in 1–3 days — full list for emailing
  const expiringUsers = users.filter(u => {
    const days = trialDaysLeft(u)
    return days !== null && days >= 0 && days <= 3 &&
           planOf(u).toLowerCase().includes('free') &&
           statusOf(u) !== 'Expired'
  })
  const expiringTrials = expiringUsers.length

  // Email all expiring users
  const [emailingAll,   setEmailingAll]   = useState(false)
  const [emailProgress, setEmailProgress] = useState(0)
  const [emailDone,     setEmailDone]     = useState(false)

  async function emailAllExpiring(opts?: { templateKey: string; subject: string; promoCode: string; customNote: string; excluded: Set<string> }) {
    if (emailingAll) return
    const toSend = opts ? expiringUsers.filter(u => !opts.excluded.has(u.id)) : expiringUsers
    if (toSend.length === 0) return
    setEmailingAll(true); setEmailProgress(0); setEmailDone(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let sent = 0
      for (const u of toSend) {
        const days = trialDaysLeft(u) ?? 0
        await fetch('/api/admin/send-email', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            userId:      u.id,
            templateKey: opts?.templateKey ?? 'trial_ending',
            customNote:  [
              opts?.promoCode ? `Use code ${opts.promoCode} for a special discount.` : '',
              opts?.customNote || `Your trial expires in ${days} day${days !== 1 ? 's' : ''}. Upgrade now to keep access.`,
            ].filter(Boolean).join(' '),
          }),
        })
        sent++
        setEmailProgress(sent)
      }
      setEmailDone(true)
      showToast(`? ${sent} conversion email${sent !== 1 ? 's' : ''} sent!`, 'success')
      setTimeout(() => { setEmailDone(false); setEmailProgress(0) }, 4000)
    } catch {
      showToast('Failed to send emails', 'error')
    }
    setEmailingAll(false)
  }


  // Live count — take the HIGHER of Realtime OR last_seen count
  // Realtime: who is truly online (presence channel)
  // Heartbeat: who was active within 3 min (last_seen fallback)
  // Cross-check: if user is in onlineIds but last_seen > 5 min ? stale, drop them
  // Catches browsers that closed without a proper WebSocket goodbye
  const effectiveOnlineIds = new Set(
    Array.from(onlineIds).filter(id => {
      const u = users.find(u => u.id === id)
      if (!u?.last_seen) return true
      return (Date.now() - new Date(u.last_seen).getTime()) < 5 * 60 * 1000
    })
  )
  const liveFromPresence  = effectiveOnlineIds.size
  const liveFromHeartbeat = getOnlineCount(users)
  const liveCount = liveFromPresence > 0 ? liveFromPresence : liveFromHeartbeat

  const r = 18; const sw = 5; const circ = 2 * Math.PI * r

  function CircleProgress({ value, color }: { value:number; color:string }) {
    const dash = Math.max(value, 0.03) * circ
    return (
      <div style={{ position:'relative', width:44, height:44, flexShrink:0 }}>
        <svg width="44" height="44">
          <circle cx="22" cy="22" r={r} fill="none" stroke={C.bg} strokeWidth={sw} />
          <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*0.25} strokeLinecap="round" />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:10, fontWeight:800, color:C.text }}>{Math.round(value*100)}%</span>
        </div>
      </div>
    )
  }

  function MiniBar({ fill, color }: { fill:number; color:string }) {
    return (
      <div style={{ width:10, height:36, backgroundColor:C.bg, borderRadius:3, display:'flex', alignItems:'flex-end', overflow:'hidden' }}>
        <div style={{ width:'100%', height:`${Math.max(fill,0.05)*100}%`, backgroundColor:color, borderRadius:3 }} />
      </div>
    )
  }

  function HudCard({ title, value, sub, children }: { title:string; value:string; sub:string; children:React.ReactNode }) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border"
           style={{ backgroundColor:C.surface, borderColor:C.border }}>
        <div className="shrink-0">{children}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold truncate mb-1" style={{ color:C.muted }}>{title}</p>
          <p className="text-[14px] font-black truncate" style={{ color:C.text }}>{value}</p>
          <p className="text-[10px] font-semibold truncate mt-0.5" style={{ color:C.muted }}>{sub}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
        {/* -- Expiring Trials Alert Banner -- */}
        {expiringTrials > 0 && canDo('email_expiring') && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
             style={{ backgroundColor:'rgba(217,119,6,0.08)', borderColor:'rgba(217,119,6,0.3)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor:'rgba(217,119,6,0.15)' }}>
            <AlertTriangle size={15} style={{ color:C.amber }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black" style={{ color:C.amber }}>
              {expiringTrials} trial{expiringTrials !== 1 ? 's' : ''} expiring in 1–3 days
            </p>
            <p className="text-[11px]" style={{ color:C.muted }}>
              {emailingAll
                ? `Sending... ${emailProgress}/${expiringTrials}`
                : emailDone
                ? `All ${expiringTrials} emails sent ?`
                : 'Hot conversion opportunity — email them now before they churn'}
            </p>
          </div>
          <button
            onClick={() => onGoToMarketing(expiringUsers)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold shrink-0 hover:opacity-80 transition-all"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Mail size={13} /> Email All {expiringTrials} <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* -- 5 HUD Cards -- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <HudCard title="Active Subscribers" value={`${activeSubs}`} sub={`${total} total accounts`}>
          <CircleProgress value={activeRatio} color={C.lime} />
        </HudCard>
        <HudCard title="Plan Distribution" value={`Starter: ${starter}`} sub={`Free: ${free} - Trial: ${freeTrial} - Growth: ${growth} - Custom: ${custom}`}>
          <div className="flex items-end gap-1">
            <MiniBar fill={total>0?free/total:0}     color={C.muted}    />
            <MiniBar fill={total>0?starter/total:0}  color={C.lime}     />
            <MiniBar fill={total>0?growth/total:0}   color={C.limeDeep} />
            <MiniBar fill={total>0?custom/total:0}   color={C.dark}     />
          </div>
        </HudCard>
        <HudCard
          title="Live Right Now"
          value={liveCount > 0 ? `${liveCount} Online` : 'Nobody Online'}
          sub={liveCount > 0 ? `Using Riazify right now` : 'Check back soon'}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center relative"
               style={{ backgroundColor: liveCount > 0 ? 'rgba(22,163,74,0.08)' : C.bg }}>
            {liveCount > 0 && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                   style={{ backgroundColor: '#0a0d08' }} />
            )}
            <Users size={20} style={{ color: liveCount > 0 ? C.green : C.muted }} />
          </div>
        </HudCard>
        <HudCard title="New This Week" value={`+${newThisWeek}`}
          sub={newThisWeek > 0 ? `in the last 7 days` : 'No new signups yet'}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
               style={{ backgroundColor: newThisWeek > 0 ? 'rgba(143,255,0,0.12)' : C.bg }}>
            <UserPlus size={20} style={{ color: newThisWeek > 0 ? C.limeDeep : C.muted }} />
          </div>
        </HudCard>
        <HudCard title="Dispute Center" value={`${dispCount} Issues`}
          sub={ebayDisconnected > 0 ? `${ebayDisconnected} eBay disconnected` : dispCount > 0 ? `Queue: ${(firstDisp?.name ?? 'Unknown').split(' ')[0]}` : 'All systems OK'}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
               style={{ backgroundColor: dispCount > 0 || ebayDisconnected > 0 ? 'rgba(185,28,28,0.08)' : 'rgba(22,163,74,0.08)' }}>
            {dispCount > 0 || ebayDisconnected > 0
              ? <AlertTriangle size={20} style={{ color:C.red }}   />
              : <CheckCircle  size={20} style={{ color:C.green }} />}
          </div>
        </HudCard>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// BLOCK 2 — CONTROLS STRIP
// --------------------------------------------------------------
// -- Advanced filter types --------------------------------------
interface AdvancedFilters {
  plans:      string[]   // [] = all
  statuses:   string[]   // [] = all
  health:     string     // 'all'|'high'|'medium'|'low'
  ebay:       string     // 'all'|'connected'|'expiring'|'disconnected'
  joined:     string     // 'all'|'7d'|'30d'|'90d'|'custom'
  joinedFrom: string     // ISO date string e.g. '2026-01-01' (used when joined='custom')
  joinedTo:   string     // ISO date string e.g. '2026-06-10'
  lastActive: string     // 'all'|'today'|'7d'|'30d'|'inactive'
  ltv:        string     // 'all'|'zero'|'low'|'mid'|'high'
  dispute:    string     // 'all'|'yes'|'no'
  country:    string     // 'all' or country name
  contacted:  string     // 'all'|'never'|'recent'|'safe'
}
const DEFAULT_FILTERS: AdvancedFilters = {
  plans: [], statuses: [], health: 'all', ebay: 'all',
  joined: 'all', joinedFrom: '', joinedTo: '',
  lastActive: 'all', ltv: 'all',
  dispute: 'all', country: 'all', contacted: 'all',
}
function isDefaultFilters(f: AdvancedFilters) {
  return f.plans.length === 0 && f.statuses.length === 0 &&
    f.health === 'all' && f.ebay === 'all' && f.joined === 'all' &&
    !f.joinedFrom && !f.joinedTo &&
    f.lastActive === 'all' && f.ltv === 'all' &&
    f.dispute === 'all' && f.country === 'all' && f.contacted === 'all'
}
function applyAdvFilters(users: any[], f: AdvancedFilters): any[] {
  return users.filter(u => {
    // Plans
    if (f.plans.length > 0 && !f.plans.includes(planOf(u))) return false
    // Statuses
    if (f.statuses.length > 0 && !f.statuses.includes(statusOf(u))) return false
    // Health
    if (f.health !== 'all') {
      const h = calcHealthScore(u)
      if (f.health === 'high'   && h < 70)         return false
      if (f.health === 'medium' && (h < 40 || h >= 70)) return false
      if (f.health === 'low'    && h >= 40)         return false
    }
    // eBay
    if (f.ebay !== 'all') {
      const es = ebayStatus(u)
      if (f.ebay === 'connected'    && es !== 'connected')    return false
      if (f.ebay === 'expiring'     && es !== 'expiring')     return false
      if (f.ebay === 'disconnected' && es !== 'disconnected') return false
      if (f.ebay === 'none'         && es !== 'none')         return false
    }
    // Joined date — preset OR custom range
    if (f.joined === 'custom') {
      if (f.joinedFrom || f.joinedTo) {
        const joined = u.created_at ? new Date(u.created_at) : null
        if (!joined) return false
        if (f.joinedFrom && joined < new Date(f.joinedFrom))             return false
        if (f.joinedTo   && joined > new Date(f.joinedTo + 'T23:59:59')) return false
      }
    } else if (f.joined !== 'all' && u.created_at) {
      const days = (Date.now() - new Date(u.created_at).getTime()) / 86400000
      if (f.joined === '7d'  && days > 7)  return false
      if (f.joined === '30d' && days > 30) return false
      if (f.joined === '90d' && days > 90) return false
    }
    // Last active
    if (f.lastActive !== 'all' && u.last_seen) {
      const days = (Date.now() - new Date(u.last_seen).getTime()) / 86400000
      if (f.lastActive === 'today'    && days > 1)  return false
      if (f.lastActive === '7d'       && days > 7)  return false
      if (f.lastActive === '30d'      && days > 30) return false
      if (f.lastActive === 'inactive' && days <= 30) return false
    }
    // LTV
    if (f.ltv !== 'all') {
      const l = ltvOf(u)
      if (f.ltv === 'zero' && l > 0)          return false
      if (f.ltv === 'low'  && (l <= 0 || l > 50))   return false
      if (f.ltv === 'mid'  && (l <= 50 || l > 200))  return false
      if (f.ltv === 'high' && l <= 200)        return false
    }
    // Dispute
    if (f.dispute === 'yes' && !hasDispute(u)) return false
    if (f.dispute === 'no'  &&  hasDispute(u)) return false
    // Country
    if (f.country !== 'all' && (u.country ?? '') !== f.country) return false

    // Contacted filter
    if (f.contacted !== 'all') {
      const ci = u.contactInfo as any
      const msAgo = ci?.lastSent ? Date.now() - new Date(ci.lastSent).getTime() : null
      if (f.contacted === 'never'  && msAgo !== null)                   return false
      if (f.contacted === 'recent' && (msAgo === null || msAgo > 3 * 86400000)) return false
      if (f.contacted === 'safe'   && (msAgo === null || msAgo < 7 * 86400000)) return false
    }
    return true
  })
}

// -- Advanced Filter Panel --------------------------------------
function AdvancedFilterPanel({ users, filters, onApply, onClose, canDo = () => true }: {
    users: any[]
    filters: AdvancedFilters
    onApply: (f: AdvancedFilters) => void
    onClose: () => void
    canDo?: (action: string) => boolean
  }) {
    const [draft, setDraft] = useState<AdvancedFilters>({ ...filters })

    // Unique countries from data
    const countries = Array.from(new Set(
      users.map(u => u.country).filter(Boolean)
    )).sort() as string[]

    const previewCount = applyAdvFilters(users, draft).length

    function toggle(field: keyof AdvancedFilters, val: string) {
      if (!canDo('filter_search')) return
      if (field === 'plans' || field === 'statuses') {
        const arr = draft[field] as string[]
        setDraft(d => ({ ...d, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }))
      } else {
        setDraft(d => ({ ...d, [field]: draft[field] === val ? 'all' : val }))
      }
    }

  const ChipRow = ({ label, field, options }: {
    label: string
    field: keyof AdvancedFilters
    options: { value: string; label: string }[]
  }) => {
    const isMulti = field === 'plans' || field === 'statuses'
    const val     = draft[field]
    return (
      <div className="mb-4">
        <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: C.muted }}>
          {label}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {options.map(opt => {
            const active = isMulti
              ? (val as string[]).includes(opt.value)
              : val === opt.value
            return (
              <button key={opt.value} onClick={() => toggle(field, opt.value)}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                style={{
                  backgroundColor: active ? C.dark    : C.bg,
                  borderColor:     active ? C.dark    : C.border,
                  color:           active ? C.lime    : C.muted,
                }}>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[10050] flex"
         onClick={e => e.target === e.currentTarget && onClose()}>
      {/* Overlay */}
      <div className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      {/* Panel */}
      <div className="w-[340px] h-full bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
             style={{ borderColor: C.border }}>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Advanced Filters</p>
            <p className="text-[11px]" style={{ color: C.muted }}>Narrow down your user list</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDraft({ ...DEFAULT_FILTERS })}
              className="text-[11px] font-bold hover:opacity-70"
              style={{ color: C.red }}>
              Clear All
            </button>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
              <X size={14} style={{ color: C.muted }} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ChipRow label="PLAN" field="plans" options={[
            { value:'Free Trial', label:'Free Trial' },
            { value:'Pro Plan',   label:'Pro'        },
            { value:'Elite Plan', label:'Elite'      },
          ]} />
          <ChipRow label="STATUS" field="statuses" options={[
            { value:'Active',    label:'Active'    },
            { value:'Expired',   label:'Expired'   },
            { value:'Past Due',  label:'Past Due'  },
            { value:'Suspended', label:'Suspended' },
            { value:'Banned',    label:'Banned'    },
          ]} />
          <ChipRow label="HEALTH SCORE" field="health" options={[
            { value:'all',    label:'Any'           },
            { value:'high',   label:'High (70+)'    },
            { value:'medium', label:'Medium (40-70)'},
            { value:'low',    label:'Low (< 40)'    },
          ]} />
          <ChipRow label="EBAY CONNECTION" field="ebay" options={[
            { value:'all',          label:'Any'         },
            { value:'connected',    label:'Connected'   },
            { value:'expiring',     label:'Expiring'    },
            { value:'disconnected', label:'Offline'     },
            { value:'none',         label:'No Account'  },
          ]} />
          {/* JOINED DATE — presets + custom range */}
          <div className="mb-4">
            <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: C.muted }}>
              JOINED DATE
            </p>
            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                { value:'all',    label:'Any time' },
                { value:'7d',     label:'Last 7d'  },
                { value:'30d',    label:'Last 30d' },
                { value:'90d',    label:'Last 90d' },
                { value:'custom', label:'Custom'   },
              ].map(opt => {
                const active = draft.joined === opt.value
                return (
                  <button key={opt.value}
                      onClick={() => canDo('filter_search') && setDraft(d => ({
                        ...d,
                        joined:     opt.value,
                        joinedFrom: opt.value !== 'custom' ? '' : d.joinedFrom,
                        joinedTo:   opt.value !== 'custom' ? '' : d.joinedTo,
                      }))}
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: active ? C.dark : C.bg,
                      borderColor:     active ? C.dark : C.border,
                      color:           active ? C.lime : C.muted,
                    }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {/* Custom date range inputs */}
            {draft.joined === 'custom' && (
              <div className="flex flex-col gap-2 p-3 rounded-xl border"
                   style={{ borderColor: C.lime, backgroundColor: C.limeTint }}>
                <div>
                  <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color: C.limeDeep }}>FROM</p>
                  <input
                      type="date"
                      value={draft.joinedFrom}
                      onChange={e => canDo('filter_search') && setDraft(d => ({ ...d, joinedFrom: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border text-[12px] font-semibold outline-none cursor-pointer"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark, colorScheme: 'light' }}
                  />
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-wider mb-1.5" style={{ color: C.limeDeep }}>TO</p>
                  <input
                      type="date"
                      value={draft.joinedTo}
                      onChange={e => canDo('filter_search') && setDraft(d => ({ ...d, joinedTo: e.target.value }))}
                    className="w-full h-9 px-3 rounded-xl border text-[12px] font-semibold outline-none cursor-pointer"
                    style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark, colorScheme: 'light' }}
                  />
                </div>
              </div>
            )}
          </div>
          <ChipRow label="LAST ACTIVE" field="lastActive" options={[
            { value:'all',      label:'Any time'  },
            { value:'today',    label:'Today'     },
            { value:'7d',       label:'Last 7d'   },
            { value:'30d',      label:'Last 30d'  },
            { value:'inactive', label:'30d+ ago'  },
          ]} />
          <ChipRow label="LIFETIME VALUE" field="ltv" options={[
            { value:'all',  label:'Any'       },
            { value:'zero', label:'$0 (free)' },
            { value:'low',  label:'$1–$50'    },
            { value:'mid',  label:'$50–$200'  },
            { value:'high', label:'$200+'     },
          ]} />
          <ChipRow label="OPEN DISPUTE" field="dispute" options={[
            { value:'all', label:'Any' },
            { value:'yes', label:'Yes' },
            { value:'no',  label:'No'  },
          ]} />
          <ChipRow label="EMAIL STATUS" field="contacted" options={[
            { value:'all',    label:'Any'           },
            { value:'never',  label:'Never emailed' },
            { value:'recent', label:'< 3 days ago'  },
            { value:'safe',   label:'Safe to email' },
          ]} />
          {countries.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: C.muted }}>
                COUNTRY
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[{ value:'all', label:'Any' }, ...countries.map(c => ({ value: c, label: c }))].map(opt => (
                  <button key={opt.value}
                      onClick={() => canDo('filter_search') && setDraft(d => ({ ...d, country: d.country === opt.value ? 'all' : opt.value }))}
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: draft.country === opt.value ? C.dark : C.bg,
                      borderColor:     draft.country === opt.value ? C.dark : C.border,
                      color:           draft.country === opt.value ? C.lime : C.muted,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex gap-3 shrink-0" style={{ borderColor: C.border }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>
            Cancel
          </button>
          <button onClick={() => { canDo('filter_search') && onApply(draft); onClose() }}
              className="flex-[2] py-2.5 rounded-xl text-[13px] font-bold"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            Show {previewCount} user{previewCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// -- Team Detail Modal ------------------------------------------
function TeamDetailModal({ user, onClose }: { user: any; onClose: () => void }) {
  const teamMembers = (user.teamMembers ?? []) as any[]
  const teamOwners  = (user.teamOwners  ?? []) as any[]
  const name        = user.name ?? user.email ?? 'User'
  const isOwner     = teamMembers.length > 0

  const ROLE_COLORS: Record<string, { color:string; bg:string; label:string }> = {
    viewer:        { color:'#1d70f5', bg:'#EFF6FF',  label:'Viewer'        },
    order_manager: { color:C.limeDeep, bg:C.limeTint, label:'Order Manager' },
    full_access:   { color:'#8b5cf6', bg:'#F5F3FF',  label:'Full Access'   },
  }

  function getInitials(n: string) {
    return (n ?? 'U').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
           style={{ border:`1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
             style={{ borderColor:C.border }}>
          <div>
            <p className="text-[15px] font-black" style={{ color:C.dark }}>Team</p>
            <p className="text-[12px]" style={{ color:C.muted }}>
              {name} ·{' '}
              {isOwner
                ? `${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''}`
                : `member of ${teamOwners.length} team${teamOwners.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-right">
            {isOwner && (() => {
              const plan  = ((user.plan_name ?? 'free trial') as string).toLowerCase()
              const limit = plan.includes('elite') ? 10 : plan.includes('pro') ? 3 : 0
              const used  = teamMembers.length
              return limit > 0 ? (
                <p className="text-[10px] font-bold" style={{ color: used >= limit ? C.red : C.muted }}>
                  {used}/{limit} slots used
                </p>
              ) : null
            })()}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 mt-1">
              <X size={15} style={{ color:C.muted }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 flex flex-col gap-2" style={{ maxHeight:360, overflowY:'auto' }}>

          {/* Owner view — show their members */}
          {isOwner && (
            <>
              <p className="text-[10px] font-black tracking-wider mb-1" style={{ color:C.muted }}>
                TEAM MEMBERS
              </p>
              {teamMembers.map((m: any) => {
                const mem  = m.member ?? {}
                const rc   = ROLE_COLORS[m.role] ?? ROLE_COLORS.viewer
                const init = getInitials(mem.name ?? mem.email ?? 'U')
                return (
                  <div key={m.member_id}
                       className="flex items-center gap-3 px-3.5 py-3 rounded-xl border"
                       style={{ borderColor:C.border, backgroundColor:C.bg }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
                         style={{ backgroundColor:'#8b5cf6' }}>
                      {init}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color:C.dark }}>
                        {mem.name ?? mem.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] truncate" style={{ color:C.muted }}>
                        {mem.email}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                          style={{ backgroundColor:rc.bg, color:rc.color }}>
                      {rc.label}
                    </span>
                  </div>
                )
              })}
            </>
          )}

          {/* Member view — show teams they belong to */}
          {!isOwner && teamOwners.length > 0 && (
            <>
              <p className="text-[10px] font-black tracking-wider mb-1" style={{ color:C.muted }}>
                MEMBER OF
              </p>
              {teamOwners.map((t: any) => {
                const owner = t.owner ?? {}
                const rc    = ROLE_COLORS[t.role] ?? ROLE_COLORS.viewer
                const init  = getInitials(owner.name ?? owner.email ?? 'O')
                return (
                  <div key={t.owner_id}
                       className="flex items-center gap-3 px-3.5 py-3 rounded-xl border"
                       style={{ borderColor:C.border, backgroundColor:C.bg }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
                         style={{ backgroundColor:C.limeDeep }}>
                      {init}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color:C.dark }}>
                        {owner.name ?? owner.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] truncate" style={{ color:C.muted }}>
                        {owner.email}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                          style={{ backgroundColor:rc.bg, color:rc.color }}>
                      {rc.label}
                    </span>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t" style={{ borderColor:C.border }}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ backgroundColor:C.bg, color:C.muted }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// -- IP Detail Modal --------------------------------------------
function IpDetailModal({ user, onClose }: { user: any; onClose: () => void }) {
  const logs    = (user.ipLogs ?? []) as any[]
  const name    = user.name ?? user.email ?? 'User'

  // Build per-IP summary
  const ipSummary: Record<string, { count: number; lastSeen: string; location?: string }> = {}
  for (const log of logs) {
    const ip = log.ip_address
    if (!ip) continue
    if (!ipSummary[ip]) ipSummary[ip] = { count: 0, lastSeen: '', location: log.location_name }
    ipSummary[ip].count++
    if (!ipSummary[ip].lastSeen || log.login_at > ipSummary[ip].lastSeen) {
      ipSummary[ip].lastSeen = log.login_at
    }
  }

  const entries = Object.entries(ipSummary)
    .sort((a, b) => new Date(b[1].lastSeen).getTime() - new Date(a[1].lastSeen).getTime())

  const uniqueLocations = new Set(entries.map(([,v]) => v.location).filter(Boolean))

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>IP Address Details</p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              {name} · {entries.length} unique IPs
              {uniqueLocations.size > 1 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor:'rgba(185,28,28,0.1)', color:C.red }}>
                  {uniqueLocations.size} locations
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color:C.muted }} />
          </button>
        </div>

        {/* Risk summary */}
        {entries.length > 5 && (
          <div className="mx-5 mt-4 px-3 py-2.5 rounded-xl flex items-center gap-2"
               style={{ backgroundColor:'rgba(185,28,28,0.06)', border:`1px solid rgba(185,28,28,0.2)` }}>
            <AlertTriangle size={14} style={{ color:C.red }} />
            <div>
              <p className="text-[12px] font-bold" style={{ color:C.red }}>
                {entries.length} unique IPs detected
              </p>
              <p className="text-[10px]" style={{ color:C.muted }}>
                {entries.length > 8
                  ? 'Very high — likely account sharing or suspicious activity'
                  : 'Elevated — monitor for account sharing'}
              </p>
            </div>
          </div>
        )}

        {/* IP list */}
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: 380 }}>
          {entries.length === 0 ? (
            <p className="text-center text-[13px] py-6" style={{ color:C.muted }}>
              No login history found
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {entries.map(([ip, info], i) => (
                <div key={ip}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                  style={{ borderColor: C.border, backgroundColor: i === 0 ? C.bg : '#fff' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                       style={{ backgroundColor: 'rgba(143,255,0,0.1)' }}>
                    <Globe size={14} style={{ color:C.limeDeep }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold font-mono" style={{ color:C.dark }}>{ip}</p>
                      {i === 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor:C.limeTint, color:C.limeDeep }}>Latest</span>
                      )}
                    </div>
                    <p className="text-[10px]" style={{ color:C.muted }}>
                      {info.location || 'Location unknown'}
                      {' · '}{info.count} login{info.count !== 1 ? 's' : ''}
                      {' · '}{info.lastSeen ? timeAgo(info.lastSeen) : '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold" style={{ color:C.text }}>{info.count}×</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t" style={{ borderColor:C.border }}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ backgroundColor:C.bg, color:C.muted }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// -- Export Dropdown --------------------------------------------
function ExportDropdown({ onExportPage, users }: {
  onExportPage?: () => void
  users:         any[]
}) {
  const supabase    = createClient()
  const [open,      setOpen]      = useState(false)
  const [exporting, setExporting] = useState(false)

  async function exportAll() {
    setOpen(false)
    setExporting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/export-users', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      if (!res.ok) throw new Error('Export failed')

      // Trigger download
      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      const date     = new Date().toISOString().split('T')[0]
      a.href         = url
      a.download     = `riazify-users-${date}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export error:', e)
    }
    setExporting(false)
  }

  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen(s => !s)}
        className="flex items-center gap-2 px-4 h-11 rounded-xl text-[13px] font-bold hover:opacity-80 border"
        style={{ borderColor:C.border, backgroundColor:C.surface, color:C.muted }}>
        {exporting
          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.limeDeep }} />
          : '?'}
        Export
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'0.2s' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 z-50 rounded-2xl border overflow-hidden shadow-xl min-w-[200px]"
               style={{ backgroundColor:'#fff', borderColor:C.border }}>
            <button onClick={() => { onExportPage?.(); setOpen(false) }}
              className="w-full flex flex-col px-4 py-3 text-left hover:bg-gray-50 border-b transition-colors"
              style={{ borderColor:C.border }}>
              <p className="text-[13px] font-bold" style={{ color:C.dark }}>Export Current Page</p>
              <p className="text-[10px]" style={{ color:C.muted }}>{users.length} visible users</p>
            </button>
            <button onClick={exportAll} disabled={exporting}
              className="w-full flex flex-col px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50">
              <p className="text-[13px] font-bold" style={{ color:C.dark }}>Export All Users</p>
              <p className="text-[10px]" style={{ color:C.muted }}>Every user, all pages — full CSV</p>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ControlsBar({ users, searchInput, onSearch, onClear, filter, onFilter, segment, onSegment, activeTag, onTag, onAddUser, onRefresh, onExport, advFilters, onAdvFilters, pageSize, onPageSize, 
showing, total, canDo = () => true }: {
    users:any[]; searchInput:string; onSearch:(v:string)=>void; onClear:()=>void
    filter:string; onFilter:(f:string)=>void
    segment:string|null; onSegment:(s:string|null)=>void
    activeTag:string|null; onTag:(t:string|null)=>void
    onAddUser?:()=>void; onRefresh:()=>void; onExport?:()=>void
    advFilters: AdvancedFilters; onAdvFilters:(f:AdvancedFilters)=>void
    pageSize:number; onPageSize:(n:number)=>void
    showing:number; total:number
    canDo?: (action: string) => boolean
  }) {
  const [focused,        setFocused]        = useState(false)
  const [showAdvFilters, setShowAdvFilters] = useState(false)
  const [refreshing,     setRefreshing]     = useState(false)
  const hasActiveFilters = !isDefaultFilters(advFilters)

  async function handleRefresh() {
    setRefreshing(true)
    await onRefresh()
    setTimeout(() => setRefreshing(false), 600)
  }

  const pastDueCount  = users.filter(u => statusOf(u) === 'Past Due').length
  const expiredCount  = users.filter(u => statusOf(u) === 'Expired' && planOf(u).toLowerCase().includes('free')).length
  const supportCount  = users.filter(hasDispute).length

  // Count per segment
  const segmentCounts = Object.keys(SEGMENT_CFG).reduce((acc, key) => {
    acc[key] = users.filter(u => getUserSegment(u) === key).length
    return acc
  }, {} as Record<string, number>)

  // Count per tag
  const tagCounts = Object.keys(TAG_CFG).reduce((acc, key) => {
    acc[key] = users.filter(u => (Array.isArray(u.tags) ? u.tags : []).includes(key)).length
    return acc
  }, {} as Record<string, number>)

  const chips = [
    { label:'All',             icon:Users,         badge:undefined       },
    { label:'Paid Plans',      icon:Shield,         badge:undefined       },
    { label:'Expired Trials',  icon:TimerOff,       badge:expiredCount    },
    { label:'Past Due',        icon:AlertTriangle,  badge:pastDueCount    },
    { label:'Support Waiting', icon:Headphones,     badge:supportCount    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + buttons */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-xl border transition-all"
             style={{
               backgroundColor: C.surface,
               borderColor:     focused ? C.lime : C.border,
               boxShadow:       focused ? `0 0 0 3px rgba(143,255,0,0.15)` : 'none',
             }}>
          <Search size={15} style={{ color: focused ? C.limeDeep : C.muted, flexShrink:0 }} />
          <input
              value={searchInput}
              onChange={e => canDo('filter_search') && onSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            placeholder="Search users by name or email..."
            className="flex-1 text-[13px] bg-transparent"
            style={{ color:C.text, outline:'none', border:'none', boxShadow:'none' }} />
          {searchInput && (
            <button onClick={onClear}><X size={14} style={{ color:C.muted }} /></button>
          )}
        </div>

        {/* Advanced filter button */}
          <button onClick={() => setShowAdvFilters(true)}
          className="relative w-11 h-11 flex items-center justify-center rounded-xl border shrink-0 hover:opacity-80"
          title="Advanced Filters"
          style={{
            borderColor:     hasActiveFilters ? C.limeDeep : C.border,
            backgroundColor: hasActiveFilters ? C.limeTint  : C.surface,
          }}>
          <Filter size={15} style={{ color: hasActiveFilters ? C.limeDeep : C.muted }} />
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: C.limeDeep }}>
              <span className="text-[7px] font-black text-white">
                {[advFilters.plans.length > 0, advFilters.statuses.length > 0,
                  advFilters.health !== 'all', advFilters.ebay !== 'all',
                  advFilters.joined !== 'all', advFilters.lastActive !== 'all',
                  advFilters.ltv !== 'all', advFilters.dispute !== 'all',
                  advFilters.country !== 'all'].filter(Boolean).length}
              </span>
            </div>
          )}
        </button>

        <button onClick={handleRefresh} disabled={refreshing}
          className="w-11 h-11 flex items-center justify-center rounded-xl border shrink-0 hover:opacity-80 transition-all"
          style={{ borderColor:C.border, backgroundColor:C.surface }}>
          <RefreshCw size={15}
            className={refreshing ? 'animate-spin' : ''}
            style={{ color: refreshing ? C.limeDeep : C.muted }} />
        </button>
        {/* Export dropdown */}
        {onExport && <ExportDropdown onExportPage={onExport} users={users} />}
        {onAddUser && (
          <button onClick={onAddUser}
            className="flex items-center gap-2 px-4 h-11 rounded-xl text-[13px] font-bold shrink-0 hover:opacity-90"
            style={{ backgroundColor:C.dark, color:C.lime }}>
            <Plus size={14} /> Add New User
          </button>
        )}
      </div>

      {/* Active advanced filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black tracking-wider shrink-0" style={{ color:C.limeDeep }}>
            FILTERING BY
          </span>
          {advFilters.plans.map(p => (
            <button key={p}
              onClick={() => onAdvFilters({ ...advFilters, plans: advFilters.plans.filter(x => x !== p) })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              Plan: {p} <X size={8} />
            </button>
          ))}
          {advFilters.statuses.map(s => (
            <button key={s}
              onClick={() => onAdvFilters({ ...advFilters, statuses: advFilters.statuses.filter(x => x !== s) })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              Status: {s} <X size={8} />
            </button>
          ))}
          {advFilters.health !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, health: 'all' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              Health: {advFilters.health} <X size={8} />
            </button>
          )}
          {advFilters.ebay !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, ebay: 'all' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              eBay: {advFilters.ebay} <X size={8} />
            </button>
          )}
          {advFilters.joined !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, joined: 'all', joinedFrom: '', joinedTo: '' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              {advFilters.joined === 'custom'
                ? `Joined: ${advFilters.joinedFrom || '...'} ? ${advFilters.joinedTo || '...'}`
                : `Joined: ${advFilters.joined}`} <X size={8} />
            </button>
          )}
          {advFilters.lastActive !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, lastActive: 'all' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              Active: {advFilters.lastActive} <X size={8} />
            </button>
          )}
          {advFilters.ltv !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, ltv: 'all' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              LTV: {advFilters.ltv} <X size={8} />
            </button>
          )}
          {advFilters.dispute !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, dispute: 'all' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              Dispute: {advFilters.dispute} <X size={8} />
            </button>
          )}
          {advFilters.country !== 'all' && (
            <button onClick={() => onAdvFilters({ ...advFilters, country: 'all' })}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              {advFilters.country} <X size={8} />
            </button>
          )}
          <button onClick={() => onAdvFilters({ ...DEFAULT_FILTERS })}
            className="text-[10px] font-bold hover:opacity-70 ml-1"
            style={{ color: C.red }}>
            Clear all
          </button>
        </div>
      )}

      {/* Advanced filter panel */}
      {showAdvFilters && (
          <AdvancedFilterPanel
            users={users}
            filters={advFilters}
            onApply={onAdvFilters}
            onClose={() => setShowAdvFilters(false)}
            canDo={canDo}
          />
      )}

      {/* Row 2: filter chips + count */}
      <div className="flex items-center gap-2 flex-wrap">
        {chips.map(ch => {
          const Icon = ch.icon; const isActive = filter === ch.label && !segment
          return (
            <button key={ch.label} onClick={() => canDo('filter_search') && (onFilter(ch.label), onSegment(null))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all shrink-0"
              style={{
                backgroundColor: isActive ? C.dark    : C.surface,
                borderColor: isActive ? '#8fff00' : C.border,
                color:           isActive ? '#ffffff' : C.muted,
              }}>
              <Icon size={12} style={{ color: isActive ? C.lime : C.muted }} />
              {ch.label}
              {ch.badge != null && ch.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                      style={{ backgroundColor: isActive ? C.lime : C.red, color: isActive ? '#1a2410' : '#fff' }}>
                  {ch.badge}
                </span>
              )}
            </button>
          )
        })}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] font-semibold" style={{ color:C.muted }}>
            Showing {showing} of {total} users
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color:C.muted }}>Per page:</span>
            <div className="flex items-center gap-1">
              {PAGE_SIZES.map(n => (
                <button key={n} onClick={() => onPageSize(n)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    backgroundColor: pageSize === n ? C.dark    : C.bg,
                    color:           pageSize === n ? C.lime    : C.muted,
                    border:          `1px solid ${pageSize === n ? C.dark : C.border}`,
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: segment chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black tracking-wider shrink-0" style={{ color:C.muted }}>
          SEGMENTS
        </span>
        {Object.entries(SEGMENT_CFG).map(([key, cfg]) => {
          const count    = segmentCounts[key] ?? 0
          const isActive = segment === key
          return (
            <button key={key}
                onClick={() => canDo('filter_search') && (onSegment(isActive ? null : key), onFilter('All'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all shrink-0"
              style={{
                backgroundColor: isActive ? cfg.bg      : C.surface,
                borderColor:     isActive ? cfg.color   : C.border,
                color:           isActive ? cfg.color   : C.muted,
              }}>
              <cfg.Icon size={12} style={{ color: isActive ? cfg.color : C.muted }} />
              {cfg.label}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                      style={{
                        backgroundColor: isActive ? cfg.color : C.bg,
                        color:           isActive ? '#fff'    : cfg.color,
                      }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Row 4: tag filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black tracking-wider shrink-0" style={{ color:C.muted }}>
          TAGS
        </span>
        {Object.entries(TAG_CFG).map(([key, cfg]) => {
          const count    = tagCounts[key] ?? 0
          const isActive = activeTag === key
          if (count === 0) return null
          return (
            <button key={key}
                onClick={() => canDo('filter_search') && onTag(isActive ? null : key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all shrink-0"
              style={{
                backgroundColor: isActive ? cfg.bg    : C.surface,
                borderColor:     isActive ? cfg.color : C.border,
                color:           isActive ? cfg.color : C.muted,
              }}>
              <cfg.Icon size={11} style={{ color: isActive ? cfg.color : C.muted }} />
              {cfg.label}
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={{
                      backgroundColor: isActive ? cfg.color : C.bg,
                      color:           isActive ? '#fff'    : cfg.color,
                    }}>
                {count}
              </span>
            </button>
          )
        })}
        {Object.values(tagCounts).every(c => c === 0) && (
          <span className="text-[10px]" style={{ color:C.muted }}>No tags applied yet</span>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// BLOCK 3 — DATA REGISTRY TABLE
// --------------------------------------------------------------
// -- Checkbox ---------------------------------------------------
function Checkbox({ checked, onChange, indeterminate = false }: {
  checked: boolean; onChange: () => void; indeterminate?: boolean
}) {
  return (
    <div onClick={onChange}
         className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer shrink-0 transition-all"
         style={{
           backgroundColor: checked ? C.dark : 'transparent',
           borderColor:     checked ? C.dark : C.border,
         }}>
      {checked && <Check size={9} style={{ color: C.lime }} />}
      {indeterminate && !checked && (
        <div className="w-2 h-0.5 rounded" style={{ backgroundColor: C.muted }} />
      )}
    </div>
  )
}

function UserTable({ users, isInvestorMode, searchQuery, filter, segment, activeTag, advFilters, onlineIds, onDrawer, onUpdated, showToast, onGoToMarketing, canDo = () => true }: {
    users:any[]; isInvestorMode:boolean; searchQuery:string; filter:string
    segment:string|null; activeTag:string|null; advFilters: AdvancedFilters
    onlineIds: Set<string>
    onDrawer:(u:any)=>void; onUpdated:(id:string,field:string,val:any)=>void
    showToast:(msg:string,type:'success'|'error'|'info')=>void
    onGoToMarketing:(users:any[])=>void
    canDo?: (action: string) => boolean
  }) {
  const supabase = createClient()
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set())
  const [showPlanMenu,  setShowPlanMenu]  = useState(false)
  const [bulkLoading,   setBulkLoading]   = useState(false)
  const [showBulkSuspend, setShowBulkSuspend] = useState(false)
  const [sortField,     setSortField]     = useState<string>('created_at')
  const [sortDir,       setSortDir]       = useState<'asc'|'desc'>('desc')
  const [hiddenCols,    setHiddenCols]    = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('crm_hidden_cols') ?? '[]')) }
    catch { return new Set() }
  })
  const [showColMenu,   setShowColMenu]   = useState(false)

  function toggleCol(col: string) {
    setHiddenCols(prev => {
      const next = new Set(prev)
      next.has(col) ? next.delete(col) : next.add(col)
      localStorage.setItem('crm_hidden_cols', JSON.stringify([...next]))
      return next
    })
  }

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  // Apply filter + search + segment + tag + advanced filters
  let filtered = [...users]
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(u =>
      (u.name    ?? '').toLowerCase().includes(q) ||
      (u.email   ?? '').toLowerCase().includes(q) ||
      (u.country ?? '').toLowerCase().includes(q) ||
      (u.id      ?? '').toLowerCase().startsWith(q)
    )
  }
  if (segment) {
    filtered = filtered.filter(u => getUserSegment(u) === segment)
  } else if (filter !== 'All') {
    filtered = filtered.filter(u => {
      if (filter === 'Paid Plans')      return mrrOf(u) > 0
      if (filter === 'Expired Trials')  return statusOf(u) === 'Expired' && planOf(u).toLowerCase().includes('free')
      if (filter === 'Past Due')        return statusOf(u) === 'Past Due'
      if (filter === 'Support Waiting') return hasDispute(u)
      return true
    })
  }
  if (activeTag) {
    filtered = filtered.filter(u => Array.isArray(u.tags) && u.tags.includes(activeTag))
  }
  // Advanced filters applied last
  if (!isDefaultFilters(advFilters)) {
    filtered = applyAdvFilters(filtered, advFilters)
  }

  // -- Sort --------------------------------------------------
  filtered = [...filtered].sort((a, b) => {
    let aVal: any, bVal: any
    switch (sortField) {
      case 'name':       aVal = (a.name ?? a.email ?? '').toLowerCase();       bVal = (b.name ?? b.email ?? '').toLowerCase(); break
      case 'plan':       aVal = planOf(a);                                      bVal = planOf(b); break
      case 'status':     aVal = statusOf(a);                                    bVal = statusOf(b); break
      case 'health':     aVal = calcHealthScore(a);                             bVal = calcHealthScore(b); break
      case 'last_seen':  aVal = a.last_seen ? new Date(a.last_seen).getTime() : 0;  bVal = b.last_seen ? new Date(b.last_seen).getTime() : 0; break
      case 'created_at': aVal = a.created_at ? new Date(a.created_at).getTime() : 0; bVal = b.created_at ? new Date(b.created_at).getTime() : 0; break
      default:           aVal = 0; bVal = 0
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ?  1 : -1
    return 0
  })

  // -- Bulk action handlers ----------------------------------
  const selectedCount = selectedIds.size
  const allSelected   = filtered.length > 0 && filtered.every(u => selectedIds.has(u.id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(u => u.id)))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function bulkChangePlan(newPlan: string) {
    if (selectedCount === 0) return
    setBulkLoading(true); setShowPlanMenu(false)
    const ids = Array.from(selectedIds)
    try {
      await (supabase.from('profiles') as any).update({ plan_name: newPlan }).in('id', ids)
      await (supabase.from('subscriptions') as any).update({ plan_name: newPlan }).in('user_id', ids)
      ids.forEach(id => onUpdated(id, 'plan_name', newPlan))
      setSelectedIds(new Set())
      showToast(`${ids.length} users moved to ${newPlan}`, 'success')
    } catch { showToast('Bulk plan change failed', 'error') }
    setBulkLoading(false)
  }

  function bulkExport() {
    const selected = filtered.filter(u => selectedIds.has(u.id))
    exportToCSV(selected, 'selected')
    showToast(`Exported ${selected.length} users to CSV`, 'success')
  }

  function bulkEmail() {
    const selected = filtered.filter(u => selectedIds.has(u.id))
    const emails   = selected.map(u => u.email).filter(Boolean).join(',')
    if (!emails) { showToast('No email addresses found', 'error'); return }
    window.open(`mailto:${emails}`)
    showToast(`Opened email for ${selected.length} users`, 'info')
  }

  const someSelected = selectedCount > 0 && !allSelected

  const COL_WIDTHS: Record<string, string> = {
    PLAN:'1fr', STATUS:'1fr', JOINED:'0.9fr', ACTIVE:'0.9fr',
    LOCATION:'0.8fr', HEALTH:'1fr', EBAY:'0.8fr',
    IPS:'0.6fr', DEVICES:'0.6fr', TEAM:'0.6fr',
  }
  const TOGGLEABLE_COLS = Object.keys(COL_WIDTHS)
  const cols = '40px 2fr ' +
    TOGGLEABLE_COLS
      .filter(c => !hiddenCols.has(c))
      .map(c => COL_WIDTHS[c]).join(' ')
    + ' 0.8fr'

  const SORTABLE: Record<string, string> = {
    'USER': 'name', 'PLAN': 'plan', 'STATUS': 'status',
    'JOINED': 'created_at', 'ACTIVE': 'last_seen', 'HEALTH': 'health',
  }

  const HeaderCell = ({ label }: { label: string }) => {
    const field  = SORTABLE[label]
    const active = field && sortField === field
    if (!field) return (
      <span className="text-[10px] font-bold tracking-wider" style={{ color:C.muted }}>{label}</span>
    )
    return (
      <button onClick={() => toggleSort(field)}
        className="flex items-center gap-1 group"
        title={`Sort by ${label}`}>
        <span className="text-[10px] font-bold tracking-wider transition-colors"
              style={{ color: active ? C.limeDeep : C.muted }}>
          {label}
        </span>
        <span className="text-[9px] font-bold transition-all"
              style={{ color: active ? C.limeDeep : 'transparent', transform: active && sortDir === 'asc' ? 'rotate(180deg)' : 'none', display:'inline-block' }}>
          ?
        </span>
      </button>
    )
  }

  if (filtered.length === 0) return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor:C.surface, borderColor:C.border }}>
      <div className="flex flex-col items-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor:C.bg }}>
          <Users size={22} style={{ color:C.muted }} />
        </div>
        <p className="text-[14px] font-bold" style={{ color:C.text }}>No users match this filter</p>
        <p className="text-[12px]" style={{ color:C.muted }}>Try adjusting your search or filter</p>
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor:C.surface, borderColor:C.border }}>
      {/* Header */}
      <div className="grid px-5 py-3 border-b" style={{ gridTemplateColumns:cols, gap:12, borderColor:C.border, backgroundColor:C.bg }}>
        <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
        <HeaderCell label="USER" />
        {!hiddenCols.has('PLAN')     && <HeaderCell label="PLAN" />}
        {!hiddenCols.has('STATUS')   && <HeaderCell label="STATUS" />}
        {!hiddenCols.has('JOINED')   && <HeaderCell label="JOINED" />}
        {!hiddenCols.has('ACTIVE')   && <HeaderCell label="ACTIVE" />}
        {!hiddenCols.has('LOCATION') && <HeaderCell label="LOCATION" />}
        {!hiddenCols.has('HEALTH')   && <HeaderCell label="HEALTH" />}
        {!hiddenCols.has('EBAY')     && <HeaderCell label="EBAY" />}
        {!hiddenCols.has('IPS')      && <HeaderCell label="IPS" />}
        {!hiddenCols.has('DEVICES')  && <HeaderCell label="DEVICES" />}
        {!hiddenCols.has('TEAM')     && <HeaderCell label="TEAM" />}
        {/* Column visibility toggle */}
        <div className="flex items-center justify-end gap-1 relative">
          <HeaderCell label="ACTIONS" />
          <button onClick={() => setShowColMenu(s => !s)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors ml-1"
            title="Show/hide columns">
            <SlidersHorizontal size={11} style={{ color: hiddenCols.size > 0 ? C.limeDeep : C.muted }} />
          </button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
              <div className="absolute top-full right-0 mt-1 z-50 rounded-2xl border shadow-xl overflow-hidden min-w-[160px]"
                   style={{ backgroundColor:'#fff', borderColor:C.border }}>
                <div className="px-3 py-2 border-b flex items-center justify-between"
                     style={{ borderColor:C.border, backgroundColor:C.bg }}>
                  <p className="text-[10px] font-black tracking-wider" style={{ color:C.muted }}>COLUMNS</p>
                  {hiddenCols.size > 0 && (
                    <button onClick={() => {
                      setHiddenCols(new Set())
                      localStorage.removeItem('crm_hidden_cols')
                    }} className="text-[9px] font-bold" style={{ color:C.limeDeep }}>
                      Reset
                    </button>
                  )}
                </div>
                {TOGGLEABLE_COLS.map(col => (
                  <button key={col} onClick={() => toggleCol(col)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors"
                    style={{ borderBottom:`1px solid ${C.border}` }}>
                    <div className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0"
                         style={{
                           backgroundColor: !hiddenCols.has(col) ? C.dark    : 'transparent',
                           borderColor:     !hiddenCols.has(col) ? C.dark    : C.border,
                         }}>
                      {!hiddenCols.has(col) && <Check size={8} style={{ color: C.lime }} />}
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color:C.text }}>{col}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y" style={{ borderColor:'#f0f4ee' }}>
        {filtered.map((u, i) => (
            <UserRow
              key={u.id}
              u={u}
              i={i}
              cols={cols}
              onlineIds={onlineIds}
              selectedIds={selectedIds}
              toggleOne={toggleOne}
              onDrawer={onDrawer}
              isInvestorMode={isInvestorMode}
              onUpdated={onUpdated}
              showToast={showToast}
              hiddenCols={hiddenCols}
              canDo={canDo}
            />
          ))}
      </div>

      {/* -- Floating Bulk Action Bar ------------------------- */}
      {selectedCount > 0 && (
        <div className="fixed bottom-8 left-1/2 z-[9990] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
             style={{
               transform: 'translateX(-50%)',
               backgroundColor: C.dark,
               border: `1px solid rgba(143,255,0,0.3)`,
               boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
             }}>
          {/* Count badge */}
          <div className="flex items-center gap-2 pr-3"
               style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: C.lime }}>
              <span className="text-[10px] font-black" style={{ color: C.dark }}>{selectedCount}</span>
            </div>
            <span className="text-[12px] font-semibold text-white">
              user{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Change Plan dropdown */}
            {canDo('bulk_change_plan') && <div className="relative">
              <button onClick={() => setShowPlanMenu(s => !s)} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              {bulkLoading
                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                       style={{ borderTopColor: C.lime }} />
                : <Shield size={13} style={{ color: C.lime }} />}
              Change Plan
            </button>
            {showPlanMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPlanMenu(false)} />
                <div className="absolute bottom-full mb-2 left-0 z-50 rounded-xl border overflow-hidden shadow-xl"
                     style={{ backgroundColor: '#1a2410', borderColor: 'rgba(143,255,0,0.2)', minWidth: 160 }}>
                  {['Free Trial','Pro Plan','Elite Plan'].map(p => (
                    <button key={p} onClick={() => bulkChangePlan(p)}
                      className="w-full px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-white/10"
                      style={{ color: '#fff' }}>
                      {p}
                    </button>
                  ))}
                </div>
                </>
              )}
            </div>}

            {/* Export Selected */}
            {canDo('export_csv') && <button onClick={bulkExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              ? Export CSV
            </button>}

          {/* Suspend Selected */}
            {canDo('suspend_user') && <button onClick={() => setShowBulkSuspend(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80"
              style={{ backgroundColor: 'rgba(185,28,28,0.3)', color: '#fca5a5' }}>
              <Shield size={13} /> Suspend {selectedCount}
            </button>}

          {/* Email All */}
          <button onClick={bulkEmail}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
            <Mail size={13} style={{ color: C.lime }} /> Email All
          </button>

          {/* Clear selection */}
          <button onClick={() => setSelectedIds(new Set())}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      )}

      {/* Bulk Suspend Modal */}
      {showBulkSuspend && (
        <BulkSuspendModal
          users={filtered.filter((u:any) => selectedIds.has(u.id) && u.role !== 'admin')}
          onClose={() => setShowBulkSuspend(false)}
          onDone={(count: number) => {
            filtered.filter((u:any) => selectedIds.has(u.id)).forEach((u:any) =>
              onUpdated(u.id, 'account_status', 'Suspended')
            )
            setSelectedIds(new Set())
            setShowBulkSuspend(false)
            showToast(`${count} account${count !== 1 ? 's' : ''} suspended`, 'success')
          }}
        />
      )}
    </div>
  )
}

// --------------------------------------------------------------
// BULK SUSPEND MODAL
// --------------------------------------------------------------
const SUSPEND_REASONS = [
  { key: 'suspicious_activity',   label: 'Suspicious Activity'         },
  { key: 'account_sharing',       label: 'Account Sharing / Multi-login'},
  { key: 'payment_issue',         label: 'Payment Issue / Chargeback'  },
  { key: 'tos_violation',         label: 'TOS Violation'               },
  { key: 'fraud_risk',            label: 'Fraud Risk'                  },
  { key: 'other',                 label: 'Other'                       },
]

const DURATIONS = [
  { key: 'permanent', label: 'Permanent'  },
  { key: '7',         label: '7 days'     },
  { key: '30',        label: '30 days'    },
  { key: 'custom',    label: 'Custom'     },
]

function BulkSuspendModal({ users, onClose, onDone }: {
  users:   any[]
  onClose: () => void
  onDone:  (count: number) => void
}) {
  const supabase = createClient()
  const [excluded,     setExcluded]     = useState<Set<string>>(new Set())
  const [reason,       setReason]       = useState('')
  const [customReason, setCustomReason] = useState('')
  const [duration,     setDuration]     = useState('permanent')
  const [customDays,   setCustomDays]   = useState('')
  const [notify,       setNotify]       = useState(true)
  const [suspending,   setSuspending]   = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [done,         setDone]         = useState(false)
  const [undoTimer,    setUndoTimer]    = useState(0)
  const [suspended,    setSuspended]    = useState<string[]>([])

  const toSuspend   = users.filter(u => !excluded.has(u.id))
  const alreadySusp = users.filter(u => u.account_status === 'Suspended')
  const canProceed  = toSuspend.length > 0 && (reason !== '' && reason !== 'other' || customReason.trim().length > 2)
  const finalReason = reason === 'other' ? customReason.trim() : SUSPEND_REASONS.find(r => r.key === reason)?.label ?? ''

  function toggleUser(id: string) {
    setExcluded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function doSuspend() {
    if (!canProceed || suspending) return
    setSuspending(true); setProgress(0)
    const { data: { session } } = await supabase.auth.getSession()
    const ids: string[] = []

    for (const u of toSuspend) {
      try {
        await fetch('/api/admin/suspend-user', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            userId:  u.id,
            action:  'suspend',
            reason:  finalReason,
            notify,
          }),
        })
        ids.push(u.id)
      } catch {}
      setProgress(p => p + 1)
    }

    setSuspended(ids)
    setDone(true)
    setSuspending(false)

    // Start 10-second undo countdown
    let t = 10
    setUndoTimer(t)
    const interval = setInterval(() => {
      t--
      setUndoTimer(t)
      if (t <= 0) {
        clearInterval(interval)
        onDone(ids.length)
      }
    }, 1000)
  }

  async function doUndo() {
    const { data: { session } } = await supabase.auth.getSession()
    for (const id of suspended) {
      try {
        await fetch('/api/admin/suspend-user', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: id, action: 'reactivate' }),
        })
      } catch {}
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
         onClick={e => e.target === e.currentTarget && !suspending && !done && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: 'rgba(185,28,28,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
              <Shield size={18} style={{ color: C.red }} />
            </div>
            <div>
              <p className="text-[16px] font-black" style={{ color: C.dark }}>Suspend Accounts</p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                {toSuspend.length} account{toSuspend.length !== 1 ? 's' : ''} will lose access immediately
              </p>
            </div>
          </div>
          {!suspending && !done && (
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
              <X size={15} style={{ color: C.muted }} />
            </button>
          )}
        </div>

        <div className="px-6 py-4 flex flex-col gap-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

          {/* Done state */}
          {done ? (
            <div className="flex flex-col items-center py-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                <CheckCircle size={28} style={{ color: C.red }} />
              </div>
              <p className="text-[17px] font-black" style={{ color: C.dark }}>
                {suspended.length} account{suspended.length !== 1 ? 's' : ''} suspended
              </p>
              <p className="text-[12px]" style={{ color: C.muted }}>Reason: {finalReason}</p>
              <div className="w-full p-3 rounded-xl border flex items-center justify-between"
                   style={{ borderColor: C.amber + '40', backgroundColor: 'rgba(217,119,6,0.06)' }}>
                <p className="text-[12px] font-semibold" style={{ color: C.amber }}>
                  Closing in {undoTimer}s...
                </p>
                <button onClick={doUndo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold"
                  style={{ backgroundColor: C.amber, color: '#fff' }}>
                  ? Undo All
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Already suspended warning */}
              {alreadySusp.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                     style={{ backgroundColor: 'rgba(217,119,6,0.06)', borderColor: C.amber + '40' }}>
                  <AlertTriangle size={13} style={{ color: C.amber }} />
                  <p className="text-[11px]" style={{ color: C.amber }}>
                    {alreadySusp.length} user{alreadySusp.length !== 1 ? 's are' : ' is'} already suspended
                  </p>
                </div>
              )}

              {/* User list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
                    ACCOUNTS ({toSuspend.length}/{users.length})
                  </p>
                  <button onClick={() => setExcluded(excluded.size > 0 ? new Set() : new Set(users.map(u => u.id)))}
                    className="text-[10px] font-bold" style={{ color: C.limeDeep }}>
                    {excluded.size > 0 ? 'Select all' : 'Deselect all'}
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {users.map(u => {
                    const isExcluded  = excluded.has(u.id)
                    const isAlready   = u.account_status === 'Suspended'
                    const name        = u.name ?? u.email?.split('@')[0] ?? 'Unknown'
                    const days        = trialDaysLeft(u)
                    const plan        = planOf(u)
                    return (
                      <div key={u.id}
                        onClick={() => !isAlready && toggleUser(u.id)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                        style={{
                          borderColor:     isExcluded || isAlready ? C.border : 'rgba(185,28,28,0.3)',
                          backgroundColor: isExcluded || isAlready ? '#fafafa'  : 'rgba(185,28,28,0.04)',
                          opacity:         isExcluded || isAlready ? 0.5 : 1,
                          cursor:          isAlready ? 'default' : 'pointer',
                        }}>
                        <div className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0"
                             style={{
                               backgroundColor: isExcluded || isAlready ? 'transparent' : C.red,
                               borderColor:     isExcluded || isAlready ? C.border : C.red,
                             }}>
                          {!isExcluded && !isAlready && <Check size={9} style={{ color: '#fff' }} />}
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                             style={{ backgroundColor: isExcluded ? C.muted : C.red }}>
                          {name.slice(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>{name}</p>
                          <p className="text-[10px] truncate" style={{ color: C.muted }}>
                            {u.email} · {plan}
                            {days !== null && ` · ${days}d left`}
                            {isAlready && <span style={{ color: C.amber }}> · Already suspended</span>}
                          </p>
                        </div>
                        {/* Progress tick while suspending */}
                        {suspending && !isExcluded && (
                          <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin shrink-0"
                               style={{ borderTopColor: C.red }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                  REASON <span style={{ color: C.red }}>*</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUSPEND_REASONS.map(r => (
                    <button key={r.key} onClick={() => setReason(r.key)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all"
                      style={{
                        borderColor:     reason === r.key ? C.red      : C.border,
                        backgroundColor: reason === r.key ? 'rgba(185,28,28,0.06)' : 'transparent',
                      }}>
                      <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                           style={{ borderColor: reason === r.key ? C.red : C.border }}>
                        {reason === r.key && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.red }} />}
                      </div>
                      <span className="text-[12px] font-semibold"
                            style={{ color: reason === r.key ? C.red : C.text }}>{r.label}</span>
                    </button>
                  ))}
                  {reason === 'other' && (
                    <input
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      placeholder="Describe the reason..."
                      autoFocus
                      className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none mt-1"
                      style={{ borderColor: customReason.length > 2 ? C.red : C.border, color: C.dark }}
                    />
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <p className="text-[11px] font-black tracking-wider mb-2" style={{ color: C.muted }}>DURATION</p>
                <div className="flex gap-2 flex-wrap">
                  {DURATIONS.map(d => (
                    <button key={d.key} onClick={() => setDuration(d.key)}
                      className="px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all"
                      style={{
                        backgroundColor: duration === d.key ? C.dark   : 'transparent',
                        borderColor:     duration === d.key ? C.dark   : C.border,
                        color:           duration === d.key ? C.lime   : C.muted,
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {duration === 'custom' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      value={customDays}
                      onChange={e => setCustomDays(e.target.value.replace(/\D/g, ''))}
                      placeholder="30"
                      className="w-20 h-9 px-3 rounded-xl border text-[12px] outline-none text-center font-bold"
                      style={{ borderColor: C.border, color: C.dark }}
                    />
                    <span className="text-[12px]" style={{ color: C.muted }}>days</span>
                  </div>
                )}
              </div>

              {/* Notify toggle */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
                   style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: C.dark }}>Notify Users</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>
                    Send suspension email to each user
                  </p>
                </div>
                <div onClick={() => setNotify(s => !s)}
                     className="relative w-10 h-5 rounded-full cursor-pointer transition-colors"
                     style={{ backgroundColor: notify ? C.dark : '#CBD5E1' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                       style={{ backgroundColor: notify ? C.lime : '#fff', left: notify ? '22px' : '2px' }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="px-6 py-4 border-t flex items-center gap-3"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            {!canProceed && reason && (
              <p className="text-[11px] flex-1" style={{ color: C.muted }}>
                {reason === 'other' ? 'Enter a reason (min 3 chars)' : ''}
              </p>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={onClose} disabled={suspending}
                className="px-4 py-2.5 rounded-xl border text-[13px] font-semibold disabled:opacity-50"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}>
                Cancel
              </button>
              <button
                onClick={doSuspend}
                disabled={!canProceed || suspending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                style={{ backgroundColor: canProceed ? C.red : C.border, color: '#fff' }}>
                {suspending ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                         style={{ borderTopColor: '#fff' }} />
                    Suspending {progress}/{toSuspend.length}...
                  </>
                ) : (
                  <><Shield size={14} /> Suspend {toSuspend.length} Now</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// BLOCK 4 — PROFILE SLIDE-OUT DRAWER
// --------------------------------------------------------------

function AddUserDialog({ onClose, onCreated }: { onClose:()=>void; onCreated:()=>void }) {
  const supabase = createClient()
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [plan,        setPlan]        = useState('Free Trial')
  const [role,        setRole]        = useState('user')
  const [sendWelcome, setSendWelcome] = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState(false)
  const [tempPass,    setTempPass]    = useState('')
  const [copied,      setCopied]      = useState(false)

  function genPass(n: string) {
    const safe = (n ?? '').trim().replace(/\s/g,'')
    const pre  = safe.length >= 3 ? safe.slice(0,3) : 'Usr'
    return `${pre}#${Math.floor(Math.random()*9000)+1000}`
  }

  useEffect(() => { setTempPass(genPass(name || 'User')) }, [name])

  const isValidEmail = (e: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(e)
  const isValid      = name.trim().length >= 2 && isValidEmail(email)

  async function handleCreate() {
    if (!isValid || submitting) return
    setError(''); setSubmitting(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/create-user', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.access_token}` },
        body: JSON.stringify({ name, email:email.trim(), password:tempPass, plan, role, sendWelcome }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to create user'); return }
      setSuccess(true); onCreated()
    } catch { setError('Network error. Please try again.') }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)' }}
         onClick={e => e.target === e.currentTarget && !submitting && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-[440px] border overflow-hidden"
           style={{ borderColor:C.border, boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor:C.border }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor:C.dark }}>
              <UserPlus size={15} style={{ color:C.lime }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color:C.text }}>Add New User</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X size={15} style={{ color:C.muted }} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-10 px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor:C.limeTint }}>
              <CheckCircle size={32} style={{ color:C.limeDeep }} />
            </div>
            <p className="text-[17px] font-bold mb-1" style={{ color:C.text }}>User Created!</p>
            <p className="text-[12px] mb-5" style={{ color:C.muted }}>{name} has been added successfully</p>
            <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border" style={{ backgroundColor:C.bg, borderColor:C.border }}>
              <Key size={13} style={{ color:C.muted }} />
              <span className="flex-1 text-[13px] font-mono font-bold" style={{ color:C.text }}>{tempPass}</span>
              <button onClick={() => { navigator.clipboard.writeText(tempPass); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
                style={{ backgroundColor: copied ? C.limeTint : C.bg, color: copied ? C.limeDeep : C.muted }}>
                {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
            </div>
            <p className="text-[10px] mt-2" style={{ color:C.muted }}>Share this temp password with the user</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border" style={{ backgroundColor:'#FEF2F2', borderColor:'#FECACA' }}>
                <AlertTriangle size={13} style={{ color:C.red }} />
                <p className="text-[12px] font-semibold" style={{ color:C.red }}>{error}</p>
              </div>
            )}
            {[
              { label:'FULL NAME',      val:name,  set:setName,  type:'text',  placeholder:'Enter full name' },
              { label:'EMAIL ADDRESS',  val:email, set:setEmail, type:'email', placeholder:'email@example.com' },
            ].map(({ label, val, set, type, placeholder }) => (
              <div key={label}>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color:C.muted }}>{label}</p>
                <input value={val} onChange={e => set(e.target.value)} type={type} placeholder={placeholder}
                  className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: val.length > 0 ? C.lime : C.border, backgroundColor:C.bg, color:C.text }} />
              </div>
            ))}
            {/* Plan + Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color:C.muted }}>INITIAL PLAN</p>
                <select value={plan} onChange={e => setPlan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor:C.border, backgroundColor:C.bg, color:C.text }}>
                  {['Free Trial','Pro Plan','Elite Plan'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color:C.muted }}>ROLE</p>
                <div className="flex gap-1.5 h-10">
                  {['user','admin'].map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border text-[12px] font-bold transition-all"
                      style={{
                        backgroundColor: role===r ? C.dark : C.bg,
                        borderColor:     role===r ? C.dark : C.border,
                        color:           role===r ? C.lime : C.muted,
                      }}>
                      {r === 'admin' ? <><Key size={11} /> Admin</> : <><User size={11} /> User</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Temp password */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color:C.muted }}>TEMP PASSWORD</p>
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl border" style={{ backgroundColor:C.bg, borderColor:C.border }}>
                <Key size={13} style={{ color:C.muted }} />
                <span className="flex-1 text-[12px] font-mono font-bold" style={{ color:C.text }}>{tempPass}</span>
                <button onClick={() => setTempPass(genPass(name || 'User'))}
                  className="p-1 rounded hover:bg-gray-100" title="Regenerate password">
                  <RefreshCw size={11} style={{ color:C.muted }} />
                </button>
                <button onClick={() => { navigator.clipboard.writeText(tempPass); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                  className="p-1 rounded hover:bg-gray-100">
                  {copied
                    ? <Check size={11} style={{ color:C.limeDeep }} />
                    : <Copy  size={11} style={{ color:C.muted    }} />}
                </button>
              </div>
            </div>
            {/* Welcome email toggle */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border" style={{ backgroundColor:C.bg, borderColor:C.border }}>
              <div>
                <p className="text-[13px] font-bold" style={{ color:C.text }}>Send Welcome Email</p>
                <p className="text-[10px]" style={{ color:C.muted }}>Includes temporary password</p>
              </div>
              <div onClick={() => setSendWelcome(s => !s)}
                   className="relative w-11 h-6 rounded-full cursor-pointer"
                   style={{ backgroundColor: sendWelcome ? C.dark : '#CBD5E1' }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                     style={{ backgroundColor: sendWelcome ? C.lime : '#fff', left: sendWelcome ? '22px' : '2px' }} />
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                      style={{ borderColor:C.border, color:C.muted }}>Cancel</button>
              <button onClick={handleCreate} disabled={!isValid || submitting}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: isValid ? C.lime : C.bg, color: isValid ? C.dark : C.muted }}>
                {submitting
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.dark }} />
                  : <><Check size={13} /> Create User</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// MAIN — UserCrmTab
// --------------------------------------------------------------
export default function UserCrmTab({ isInvestorMode = false, isMobile = false, onGoToMarketing, viewOnly = false, canDo = () => true }: {
  isInvestorMode?:  boolean
  isMobile?:        boolean
  onGoToMarketing?: (users: any[]) => void
  viewOnly?:        boolean
  canDo?:           (action: string) => boolean
}) {
  const supabase = createClient()

  const [users,       setUsers]       = useState<any[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(0)
  const [pageSize,    setPageSize]    = useState(25)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter,      setFilter]      = useState('All')
  const [segment,     setSegment]     = useState<string|null>(null)
  const [activeTag,   setActiveTag]   = useState<string|null>(null)
  const [advFilters,  setAdvFilters]  = useState<AdvancedFilters>(DEFAULT_FILTERS)
  const [drawerUser,  setDrawerUser]  = useState<any|null>(null)
  const [showAdd,     setShowAdd]     = useState(false)
  const [toast,       setToast]       = useState<{ msg:string; type:'success'|'error'|'info' }|null>(null)

  // -- Realtime presence — who's online right now ---------------
  const onlineIds = useOnlineUserIds()

  // 300ms search debounce
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const showToast = useCallback((msg: string, type: 'success'|'error'|'info' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // -- Single batch load — eliminates N+1 ----------------------
  const loadUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const start = page * pageSize
      const end   = start + pageSize - 1

      // 1. Paginated profiles
      const { data: profiles, count } = await supabase
        .from('profiles')
        .select(
          'id, name, email, avatar_url, role, plan_name, account_status, ' +
          'tags, last_seen, active_team_owner_id, country, verified_city, ' +
          'country_code, created_at',
          { count: 'exact' }
        )
        .range(start, end)
        .order('created_at', { ascending:false })

      const rows = (profiles ?? []) as any[]
      setTotal(count ?? 0)

      if (rows.length === 0) { setUsers([]); if (!silent) setLoading(false); return }

      const ids = rows.map(r => r.id).filter(Boolean)

      // 2. Batch queries — login_history tries country/city but falls back gracefully
      // Single IP query — no fallback needed (location_name exists in your schema)
      const ipQuery = supabase.from('login_history')
        .select('user_id, ip_address, login_at, location_name')
        .in('user_id', ids)

      const [subRes, dispRes, ipResRaw, ebayRes, toolRes, notesRes, devicesRes, teamOwnerRes, teamMemberRes, msgRes] = await Promise.all([
        supabase.from('subscriptions').select('*').in('user_id', ids),
        supabase.from('disputes').select('id, user_id, status').in('user_id', ids),
        ipQuery,
        (supabase.from('ebay_connections') as any).select('user_id, is_connected, expires_at, store_name').in('user_id', ids),
        (supabase.from('user_tool_usage') as any).select('user_id, tool_name, usage_count, updated_at').in('user_id', ids),
        (supabase.from('user_notes') as any).select('user_id, category, content, is_pinned, created_at').in('user_id', ids).order('created_at', { ascending: false }),
        (supabase.from('user_devices') as any).select('user_id, platform, browser').in('user_id', ids),
        (supabase.from('team_members') as any).select('owner_id, member_id, role').in('owner_id', ids).eq('status', 'active'),
        (supabase.from('team_members') as any).select('owner_id, member_id, role').in('member_id', ids).eq('status', 'active'),
        // Sent messages — for contacted status
        (supabase.from('sent_messages') as any).select('user_id, template_name, sent_at').in('user_id', ids).order('sent_at', { ascending: false }),
      ])

      // Graceful error — empty array if query fails
      const ipRes = ipResRaw.error ? { data: [] } : ipResRaw

      // 3. Build lookup maps
      const subMap: Record<string, any[]>      = {}
      for (const s of (subRes.data ?? []) as any[]) {
        if (!subMap[s.user_id]) subMap[s.user_id] = []
        subMap[s.user_id].push(s)
      }
      const dispMap: Record<string, any[]>     = {}
      for (const d of (dispRes.data ?? []) as any[]) {
        if (!dispMap[d.user_id]) dispMap[d.user_id] = []
        dispMap[d.user_id].push(d)
      }
      const ipMap: Record<string, Set<string>> = {}
      const ipLogsMap: Record<string, any[]>   = {}
      for (const r of (ipRes.data ?? []) as any[]) {
        if (!ipMap[r.user_id]) { ipMap[r.user_id] = new Set(); ipLogsMap[r.user_id] = [] }
        if (r.ip_address) {
          ipMap[r.user_id].add(r.ip_address)
          ipLogsMap[r.user_id].push(r)
        }
      }
      const ebayMap: Record<string, any> = {}
      for (const e of (ebayRes.data ?? []) as any[]) {
        ebayMap[e.user_id] = e
      }
      const toolMap: Record<string, any[]> = {}
      for (const t of (toolRes.data ?? []) as any[]) {
        if (!toolMap[t.user_id]) toolMap[t.user_id] = []
        toolMap[t.user_id].push(t)
      }

      const warningMap:    Record<string, boolean> = {}
      const notesCountMap: Record<string, number>  = {}
      const notesMap:      Record<string, any[]>   = {}
      for (const n of (notesRes.data ?? []) as any[]) {
        if (n.category === 'warning') warningMap[n.user_id] = true
        notesCountMap[n.user_id] = (notesCountMap[n.user_id] ?? 0) + 1
        if (!notesMap[n.user_id]) notesMap[n.user_id] = []
        if (notesMap[n.user_id].length < 2) notesMap[n.user_id].push(n)
      }

      const devicesMap: Record<string, any[]> = {}
      for (const d of ((devicesRes.error ? [] : devicesRes.data) ?? []) as any[]) {
        if (!devicesMap[d.user_id]) devicesMap[d.user_id] = []
        devicesMap[d.user_id].push(d)
      }

      // Team maps — enrich from profiles already in memory (no extra JOIN needed)
      const profileIndex: Record<string, any> = {}
      for (const p of (profiles as any[] ?? [])) { profileIndex[p.id] = p }

      // Contact map — last email per user
      const contactMap: Record<string, { lastSent: string; count: number; lastTemplate: string }> = {}
      for (const m of ((msgRes as any)?.data ?? []) as any[]) {
        if (!contactMap[m.user_id]) {
          contactMap[m.user_id] = { lastSent: m.sent_at, count: 0, lastTemplate: m.template_name ?? '' }
        }
        contactMap[m.user_id].count++
      }

      const teamMembersMap: Record<string, any[]> = {}  // owner_id ? members[]
      for (const t of ((teamOwnerRes as any).data ?? []) as any[]) {
        if (!teamMembersMap[t.owner_id]) teamMembersMap[t.owner_id] = []
        teamMembersMap[t.owner_id].push({
          ...t,
          member: profileIndex[t.member_id] ?? { id: t.member_id, name: null, email: null },
        })
      }

      const teamOwnersMap: Record<string, any[]> = {}  // member_id ? owners[]
      for (const t of ((teamMemberRes as any).data ?? []) as any[]) {
        if (!teamOwnersMap[t.member_id]) teamOwnersMap[t.member_id] = []
        teamOwnersMap[t.member_id].push({
          ...t,
          owner: profileIndex[t.owner_id] ?? { id: t.owner_id, name: null, email: null },
        })
      }

      // 4. Merge
      const enriched = rows.map(r => ({
        ...r,
        subscriptions:   subMap[r.id]        ?? [],
        disputes:        dispMap[r.id]        ?? [],
        uniqueIps:       ipMap[r.id]?.size    ?? 0,
        ipLogs:          ipLogsMap[r.id]      ?? [],
        ebayConnection:  ebayMap[r.id]        ?? null,
        toolUsage:       toolMap[r.id]        ?? [],
        hasWarningNote:  warningMap[r.id]      ?? false,
        noteCount:       notesCountMap[r.id]   ?? 0,
        recentNotes:     notesMap[r.id]        ?? [],
        deviceList:      devicesMap[r.id]     ?? [],
        teamMembers:     teamMembersMap[r.id] ?? [],  // users I own as owner
        teamOwners:      teamOwnersMap[r.id]  ?? [],  // teams I belong to
        contactInfo:     contactMap[r.id]     ?? null, // last email sent
      }))

      setUsers(enriched)
    } catch (e) { console.error('[UserCrmTab]', e) }
    if (!silent) setLoading(false)
  }, [page, pageSize])

  useEffect(() => {
    loadUsers()                                            // initial load
    const interval = setInterval(() => loadUsers(true), 30 * 1000) // silent every 30s
    return () => clearInterval(interval)
  }, [loadUsers])

  // Instant silent reload when someone goes online/offline via Realtime
  useEffect(() => {
    if (users.length > 0) loadUsers(true)
  }, [onlineIds.size])

  // Optimistic local update
  function onUpdated(id: string, field: string, value: any) {
    if (field === 'deleted') {
      setUsers(u => u.filter(x => x.id !== id))
      return
    }
    setUsers(u => u.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* View only banner */}
      {viewOnly && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'#1d4ed8' }}>👁 View only — you can see this tab but cannot make changes. Contact your admin to request access.</span>
        </div>
      )}
      {/* Skeleton loader — shows table shape while data loads */}
      {loading && (
        <div className="flex flex-col gap-5">
          {/* HUD skeleton */}
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />
            ))}
          </div>
          {/* Controls skeleton */}
          <div className="h-10 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />
          {/* Table skeleton */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
            {/* Header */}
            <div className="h-10 animate-pulse" style={{ backgroundColor: C.border }} />
            {/* Rows */}
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-t"
                   style={{ borderColor: C.border }}>
                <div className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="w-9 h-9 rounded-xl animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3 w-32 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                  <div className="h-2 w-44 rounded-full animate-pulse" style={{ backgroundColor: C.border, opacity:0.6 }} />
                </div>
                <div className="h-5 w-16 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="h-5 w-14 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="h-5 w-20 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="h-5 w-24 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="h-5 w-12 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="h-5 w-10 rounded-full animate-pulse" style={{ backgroundColor: C.border }} />
                <div className="h-5 w-10 rounded-full animate-pulse ml-auto" style={{ backgroundColor: C.border }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Real content — hidden while skeleton loads */}
      {!loading && (<>
      <HudDeck users={users} onlineIds={onlineIds} showToast={showToast} onGoToMarketing={onGoToMarketing ?? (() => {})} canDo={canDo} />

      <ControlsBar
        users={users}
        searchInput={searchInput}
        onSearch={setSearchInput}
        onClear={() => { setSearchInput(''); setSearchQuery('') }}
        filter={filter}
        onFilter={setFilter}
        segment={segment}
        onSegment={setSegment}
        activeTag={activeTag}
        onTag={setActiveTag}
        onAddUser={canDo('create_user') ? () => setShowAdd(true) : undefined}
        onRefresh={loadUsers}
        advFilters={advFilters}
        onAdvFilters={setAdvFilters}
        pageSize={pageSize}
        onPageSize={(n) => { setPageSize(n); setPage(0) }}
        onExport={canDo('export_csv') ? () => {
          let filtered = [...users]
          if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(u =>
              (u.name ?? '').toLowerCase().includes(q) ||
              (u.email ?? '').toLowerCase().includes(q)
            )
          }
          if (segment) {
            filtered = filtered.filter(u => getUserSegment(u) === segment)
          } else if (filter !== 'All') {
            filtered = filtered.filter(u => {
              if (filter === 'Paid Plans')      return mrrOf(u) > 0
              if (filter === 'Expired Trials')  return statusOf(u) === 'Expired' && planOf(u).toLowerCase().includes('free')
              if (filter === 'Past Due')        return statusOf(u) === 'Past Due'
              if (filter === 'Support Waiting') return hasDispute(u)
              return true
            })
          }
          if (!isDefaultFilters(advFilters)) {
            filtered = applyAdvFilters(filtered, advFilters)
          }
          exportToCSV(filtered, segment ? (SEGMENT_CFG[segment]?.label ?? segment) : filter)
          showToast(`Exported ${filtered.length} users to CSV`, 'success')
        } : undefined}
        showing={users.length}
          total={total}
          canDo={canDo}
        />

      <UserTable
          users={users}
          isInvestorMode={isInvestorMode}
          searchQuery={searchQuery}
          filter={filter}
          segment={segment}
          activeTag={activeTag}
          advFilters={advFilters}
          onlineIds={onlineIds}
          onDrawer={setDrawerUser}
          onUpdated={onUpdated}
          showToast={showToast}
          onGoToMarketing={onGoToMarketing ?? (() => {})}
          canDo={canDo}
        />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 0} onClick={() => setPage(p => p-1)}
            className="px-4 py-2 rounded-xl border text-[12px] font-bold disabled:opacity-40 hover:opacity-80"
            style={{ borderColor:C.border, color:C.muted }}>? Previous</button>
          <span className="text-[12px]" style={{ color:C.muted }}>Page {page+1} of {totalPages}</span>
          <button disabled={page >= totalPages-1} onClick={() => setPage(p => p+1)}
            className="px-4 py-2 rounded-xl border text-[12px] font-bold disabled:opacity-40 hover:opacity-80"
            style={{ borderColor:C.border, color:C.muted }}>Next ?</button>
        </div>
      )}

      {drawerUser && (
        <UserDetailDrawer
          user={drawerUser}
          onClose={() => setDrawerUser(null)}
          onUpdated={onUpdated}
          showToast={showToast}
          viewOnly={viewOnly}
        />
      )}

      {showAdd && (
        <AddUserDialog
          onClose={() => setShowAdd(false)}
          onCreated={() => { loadUsers(); showToast('User created successfully') }}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>)}
    </div>
  )
}

// -- QuickNotePanel ---------------------------------------------
const NOTE_CATEGORIES = [
  { key:'general', label:'General', icon:'??', color:C.muted    },
  { key:'support', label:'Support', icon:'??', color:'#3b82f6'  },
  { key:'warning', label:'Warning', icon:'??',  color:C.red      },
  { key:'sales',   label:'Sales',   icon:'??', color:C.green    },
]

function QuickNotePanel({ userId, userName, recentNotes, onClose, onSaved }: {
  userId:      string
  userName:    string
  recentNotes: any[]
  onClose:     () => void
  onSaved:     (newCount: number) => void
}) {
  const supabase  = createClient()
  const [content,  setContent]  = useState('')
  const [category, setCategory] = useState('general')
  const [pinned,   setPinned]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const textRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { textRef.current?.focus() }, [])

  async function save() {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile  } = await (supabase.from('profiles') as any)
        .select('name').eq('id', user?.id).single()

      await (supabase.from('user_notes') as any).insert({
        user_id:    userId,
        admin_id:   user?.id,
        admin_name: profile?.name ?? user?.email?.split('@')[0] ?? 'Admin',
        content:    content.trim(),
        category,
        is_pinned:  pinned,
      })

      // Get updated count
      const { count } = await (supabase.from('user_notes') as any)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      onSaved(count ?? 0)
    } catch { setSaving(false) }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save() }
    if (e.key === 'Escape') onClose()
  }

  const catConfig = NOTE_CATEGORIES.find(c => c.key === category) ?? NOTE_CATEGORIES[0]

  return (
    <div className="border-t px-4 py-3 flex flex-col gap-3"
         style={{ backgroundColor:C.limeTint, borderColor:C.lime }}>

      {/* Existing notes */}
      {recentNotes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[9px] font-black tracking-wider" style={{ color:C.muted }}>RECENT NOTES</p>
          {recentNotes.map((n, i) => {
            const cat = NOTE_CATEGORIES.find(c => c.key === n.category)
            return (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl border"
                   style={{ backgroundColor:'#fff', borderColor:C.border }}>
                <span className="text-[11px] shrink-0">{cat?.icon ?? '??'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px]" style={{ color:C.text }}>{n.content}</p>
                  <p className="text-[9px] mt-0.5" style={{ color:C.muted }}>{timeAgo(n.created_at)}</p>
                </div>
                {n.is_pinned && <span className="text-[10px] shrink-0">??</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* New note input */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-black tracking-wider" style={{ color:C.muted }}>
          ADD NOTE FOR {userName.toUpperCase()}
        </p>
        <textarea
          ref={textRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a note... (Ctrl+Enter to save, Esc to close)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
          style={{ borderColor: content ? C.lime : C.border, color:C.dark, backgroundColor:'#fff' }}
        />

        {/* Category + pin + actions row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category pills */}
          <div className="flex items-center gap-1">
            {NOTE_CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: category === c.key ? C.dark      : 'transparent',
                  borderColor:     category === c.key ? C.dark      : C.border,
                  color:           category === c.key ? C.lime      : C.muted,
                }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Pin toggle */}
          <button onClick={() => setPinned(s => !s)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ml-auto"
            style={{
              backgroundColor: pinned ? 'rgba(74,143,0,0.1)' : 'transparent',
              borderColor:     pinned ? C.lime                : C.border,
              color:           pinned ? C.limeDeep            : C.muted,
            }}>
            ?? {pinned ? 'Pinned' : 'Pin'}
          </button>

          {/* Cancel + Save */}
          <button onClick={onClose}
            className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold"
            style={{ borderColor:C.border, color:C.muted, backgroundColor:'#fff' }}>
            Cancel
          </button>
          <button onClick={save} disabled={!content.trim() || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold disabled:opacity-40"
            style={{ backgroundColor: content.trim() ? C.dark : C.border, color: C.lime }}>
            {saving
              ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.lime }} />
              : <><Check size={11} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// -- ActionMenu -------------------------------------------------
function ActionMenu({ u, onDrawer, onUpdated, showToast, canDo = () => true }: {
    u: any
    onDrawer: (u: any) => void
    onUpdated: (id: string, field: string, value: any) => void
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void
    canDo?: (action: string) => boolean
  }) {
    const supabase = createClient()
    const [open, setOpen]           = useState(false)
    const [menuPos, setMenuPos]     = useState({ top: 0, left: 0, openUp: false })
    const btnRef = useRef<HTMLButtonElement>(null)
    const [loading, setLoading]     = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting]   = useState(false)
    const [impersonating, setImpersonating] = useState(false)
    const plan   = planOf(u)
    const status = statusOf(u)

    async function changePlan(newPlan: string) {
      if (!canDo('change_plan')) return
      setLoading(true); setOpen(false)
      onUpdated(u.id, 'plan_name', newPlan)
      try {
        await (supabase.from('profiles') as any).update({ plan_name: newPlan }).eq('id', u.id)
        await (supabase.from('subscriptions') as any).update({ plan_name: newPlan }).eq('user_id', u.id)
        showToast(`Plan changed to ${newPlan}`, 'success')
      } catch { onUpdated(u.id, 'plan_name', plan); showToast('Failed to change plan', 'error') }
      setLoading(false)
    }

    async function changeStatus(newStatus: string) {
      if (!canDo('suspend_user')) return
      setLoading(true); setOpen(false)
      onUpdated(u.id, 'account_status', newStatus)
      try {
        await (supabase.from('profiles') as any).update({ account_status: newStatus }).eq('id', u.id)
        showToast(`Status set to ${newStatus}`, 'success')
      } catch { showToast('Failed to update status', 'error') }
      setLoading(false)
    }

    async function handleDelete() {
      if (!canDo('delete_user')) return
      setDeleting(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin/delete-user', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: u.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to delete user')
        onUpdated(u.id, 'deleted', true)
        showToast('User deleted', 'success')
      } catch (e: any) {
        showToast(e.message ?? 'Failed to delete user', 'error')
      }
      setDeleting(false)
      setConfirmDelete(false)
      setOpen(false)
    }

    async function handleImpersonate() {
      if (!canDo('impersonate_user')) return
      setImpersonating(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin/impersonate', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: u.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to impersonate')
        window.open(data.magicLink, '_blank')
        showToast(`Viewing as ${data.userName}`, 'success')
      } catch (e: any) {
        showToast(e.message ?? 'Failed to impersonate', 'error')
      }
      setImpersonating(false)
      setOpen(false)
    }

    async function handleForceLogout() {
      if (!canDo('force_logout')) return
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin/force-logout', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId: u.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to force logout')
        showToast('User logged out from all devices', 'success')
      } catch (e: any) {
        showToast(e.message ?? 'Failed to force logout', 'error')
      }
      setLoading(false)
      setOpen(false)
    }

    const plans = ['Free Trial','Pro Plan','Elite Plan'].filter(p => p !== plan)

  return (
    <div className="flex items-center justify-end gap-1.5 relative">
      <button onClick={() => onDrawer(u)}
          title="View Profile"
          className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-80"
          style={{ backgroundColor:C.limeTint, borderColor:C.lime }}>
          <User size={14} style={{ color:C.limeDeep }} />
        </button>
      <button ref={btnRef} onClick={() => {
            if (!open && btnRef.current) {
              const rect = btnRef.current.getBoundingClientRect()
              const openUp = window.innerHeight - rect.bottom < 300
              setMenuPos({
                top:  openUp ? rect.top - 4 : rect.bottom + 4,
                left: rect.right - 190,
                openUp,
              })
            }
            setOpen(s => !s)
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg border hover:bg-gray-50"
          style={{ borderColor:C.border }}>
          {loading
            ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.limeDeep }} />
            : <MoreVertical size={13} style={{ color:C.muted }} />}
        </button>
        {open && createPortal(
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="fixed z-50 bg-white rounded-2xl border shadow-xl overflow-hidden"
                   style={{
                     borderColor:C.border, minWidth:190,
                     top:  menuPos.openUp ? 'auto' : menuPos.top,
                     bottom: menuPos.openUp ? window.innerHeight - menuPos.top : 'auto',
                     left: menuPos.left,
                   }}>
              {canDo('change_plan') && plans.map(p => (
                <button key={p} onClick={() => changePlan(p)}
                  className="w-full px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-gray-50 transition-colors"
                  style={{ color:C.text }}>Switch ? {p}</button>
              ))}
              {canDo('change_plan') && <div className="h-px" style={{ backgroundColor:C.border }} />}
              {canDo('suspend_user') && status !== 'Past Due' && (
                <button onClick={() => changeStatus('Past Due')}
                  className="w-full px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-amber-50 transition-colors"
                  style={{ color:C.amber }}>Suspend (Past Due)</button>
              )}
              {canDo('suspend_user') && status !== 'Active' && (
                <button onClick={() => changeStatus('Active')}
                  className="w-full px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-green-50 transition-colors"
                  style={{ color:C.green }}>Reactivate Account</button>
              )}
              {canDo('delete_user') && (
                <>
                  <div className="h-px" style={{ backgroundColor:C.border }} />
                  <button onClick={() => setConfirmDelete(true)}
                    className="w-full px-4 py-2.5 text-left text-[12px] font-semibold hover:bg-red-50 transition-colors"
                    style={{ color:'#b91c1c' }}>Delete Account</button>
                </>
              )}
            </div>
          </>,
          document.body
        )}
        {confirmDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
               style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
               onClick={e => e.target === e.currentTarget && !deleting && setConfirmDelete(false)}>
            <div className="bg-white rounded-2xl border p-6 w-full max-w-sm" style={{ borderColor: C.border }}>
              <p className="text-[15px] font-bold mb-2" style={{ color: C.text }}>Delete this account?</p>
              <p className="text-[13px] mb-5" style={{ color: C.muted }}>
                This permanently deletes <strong>{u.name ?? u.email}</strong> and all their data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                  className="flex-1 py-2 rounded-lg border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.muted }}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2 rounded-lg text-[13px] font-bold text-white disabled:opacity-50" style={{ backgroundColor: '#b91c1c' }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      )
    }

// -- UserRow — extracted so useState hooks are legal ------------
function UserRow({ u, i, cols, onlineIds, selectedIds, toggleOne, onDrawer, isInvestorMode, onUpdated, showToast, hiddenCols = new Set(), canDo = () => true }: {
    u: any; i: number; cols: string
    onlineIds: Set<string>
    selectedIds: Set<string>
    toggleOne: (id: string) => void
    onDrawer: (u: any) => void
    isInvestorMode: boolean
    onUpdated: (id: string, field: string, value: any) => void
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void
    hiddenCols?: Set<string>
    canDo?: (action: string) => boolean
  }) {
  const [showIpModal,    setShowIpModal]    = useState(false)
  const [showTeamModal,  setShowTeamModal]  = useState(false)
  const [showQuickNote,  setShowQuickNote]  = useState(false)
  const [hovered,        setHovered]        = useState(false)
  const supabase = createClient()

  const noteCount   = u.noteCount   ?? 0
  const recentNotes = u.recentNotes ?? []

  const name      = u.name || (u.email ?? '').split('@')[0] || 'Unknown'
  const email     = u.email ?? '—'
  const plan      = planOf(u)
  const status    = statusOf(u)
  const pb        = planBadge(plan)
  const sb        = statusBadge(status)
  const joined    = fmtDate(u.created_at)
  const lastSeen  = timeAgo(u.last_seen)
  const platform  = u.device_platform ?? 'Unknown'
  const shortId   = u.display_id ?? u.id?.slice(0,8) ?? '—'
  const uniqueIps  = u.uniqueIps  ?? 0
  const deviceList = (u.deviceList ?? []) as any[]
  const deviceCount = deviceList.length
  const lastSeenMs  = u.last_seen ? Date.now() - new Date(u.last_seen).getTime() : Infinity
  const isOnlineNow = onlineIds.has(u.id) || lastSeenMs < 2 * 60 * 1000
  const isRecent    = !isOnlineNow && lastSeenMs < 5 * 60 * 1000
  const isToday     = lastSeenMs < 24 * 60 * 60 * 1000
  const presenceDot = isOnlineNow ? C.lime : isRecent ? C.limeDeep : 'transparent'
  const presenceLabel = isOnlineNow ? 'Active now' : isRecent ? `Active ${lastSeen}` : `${lastSeen}`
  const health    = calcHealthScore(u)
  const risk      = churnRisk(health)
  const trialDays = trialDaysLeft(u)
  const eStatus   = ebayStatus(u)
  const eDays     = ebayDaysLeft(u)
  const userTags  = Array.isArray(u.tags) ? u.tags : []
  const dispName  = isInvestorMode ? `${name.split(' ')[0]} ***` : name
  const dispEmail = isInvestorMode && email.includes('@')
    ? `${email[0]}***@${email.split('@')[1]}` : email

  // Contacted status
  const contactInfo    = u.contactInfo as { lastSent: string; count: number; lastTemplate: string } | null
  const contactedMsAgo = contactInfo ? Date.now() - new Date(contactInfo.lastSent).getTime() : null
  const contactColor   = contactedMsAgo === null    ? null
                       : contactedMsAgo < 3 * 86400000 ? C.red    // < 3 days = too soon
                       : contactedMsAgo < 7 * 86400000 ? C.amber  // 3-7 days = recent
                       : C.muted                                    // > 7 days = safe
  const contactLabel   = contactedMsAgo === null ? null : timeAgo(contactInfo!.lastSent)
  const templateLabel  = contactInfo?.lastTemplate
    ?.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()) ?? ''

  return (
    <>
            <div key={u.id}
                 className="grid px-5 py-3 items-center hover:bg-[#fafcf8] transition-colors"
                 style={{
                   gridTemplateColumns: cols, gap: 12,
                   backgroundColor: selectedIds.has(u.id) ? '#f4ffe6' : undefined,
                   borderLeft:
                     u.account_status === 'Banned'    ? `3px solid #7f1d1d` :
                     u.account_status === 'Suspended' ? `3px solid #f97316` :
                     u.hasWarningNote                 ? `3px solid ${C.red}` :
                                                        '3px solid transparent',
                 }}>
              {/* Checkbox */}
              <Checkbox checked={selectedIds.has(u.id)} onChange={() => toggleOne(u.id)} />
              {/* 1. User */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <Avatar
                    name={name}
                    size={34}
                    avatarUrl={u.avatar_url ?? u.raw_user_meta_data?.avatar_url ?? null}
                  />
                  {(isOnlineNow || isRecent) && (<>
                    {isOnlineNow && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-ping"
                           style={{ backgroundColor: '#0a0d08', opacity: 0.5 }} />
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                         style={{
                           backgroundColor: presenceDot,
                           boxShadow: isOnlineNow ? `0 0 6px 1px rgba(143,255,0,0.5)` : 'none',
                         }} />
                  </>)}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color:C.text }}>{dispName}</p>
                  <p className="text-[10px] truncate" style={{ color:C.muted }}>{dispEmail}</p>
                  {/* Tag pills */}
                  {userTags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {userTags.slice(0, 2).map((tag: string) => {
                        const tc = TAG_CFG[tag]
                        if (!tc) return null
                        return (
                          <span key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                            style={{ backgroundColor: tc.bg, color: tc.color }}>
                            <tc.Icon size={8} />
                            {tc.label}
                          </span>
                        )
                      })}
                      {userTags.length > 2 && (
                        <span className="text-[9px] font-bold" style={{ color: C.muted }}>
                          +{userTags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contacted status badge */}
                  {contactInfo && contactColor && (
                    <div className="flex items-center gap-1 mt-1" title={`${templateLabel} · ${contactLabel}`}>
                      <Mail size={9} style={{ color: contactColor }} />
                      <span className="text-[9px] font-bold" style={{ color: contactColor }}>
                        {contactInfo.count > 1 ? `${contactInfo.count}×` : ''} {contactLabel}
                      </span>
                      {contactedMsAgo !== null && contactedMsAgo < 3 * 86400000 && (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded"
                              style={{ backgroundColor:'rgba(185,28,28,0.08)', color:C.red }}>
                          wait
                        </span>
                      )}
                    </div>
                  )}

                 {/* Note count badge */}
                    {noteCount > 0 && canDo('add_notes') && (
                      <button
                        onClick={e => { e.stopPropagation(); setShowQuickNote(s => !s) }}
                        className="flex items-center gap-1 mt-1 hover:opacity-70"
                        title={`${noteCount} note${noteCount !== 1 ? 's' : ''} — click to view`}>
                      <FileText size={9} style={{ color: C.limeDeep }} />
                      <span className="text-[9px] font-bold" style={{ color: C.limeDeep }}>
                        {noteCount} note{noteCount !== 1 ? 's' : ''}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Plan */}
              {!hiddenCols.has('PLAN') && (
              <div>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black"
                      style={{ backgroundColor:pb.bg, color:pb.text }}>{plan}</span>
              </div>
              )}

              {/* 3. Status */}
              {!hiddenCols.has('STATUS') && (
              <div className="flex flex-col gap-1">
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold w-fit"
                      style={{ backgroundColor:sb.bg, color:sb.text }}>{status}</span>
                {trialDays !== null && trialDays <= 7 && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold"
                        style={{ color: trialDays <= 3 ? C.red : C.amber }}>
                    <Clock size={8} /> {trialDays}d left
                  </span>
                )}
              </div>
              )}
              {/* 3. Joined — date only */}
              {!hiddenCols.has('JOINED') && (
              <div>
                <p className="text-[11px] font-semibold" style={{ color:C.text }}>{joined}</p>
              </div>
              )}

              {/* 4. Active — dedicated presence column */}
              {!hiddenCols.has('ACTIVE') && (
              <div className="flex items-center gap-1.5">
                {(isOnlineNow || isRecent) && (
                  <div className="relative shrink-0 w-2 h-2">
                    {/* Pulsing ring radiates outward */}
                    {isOnlineNow && (
                      <div className="absolute inset-0 rounded-full animate-ping"
                           style={{ backgroundColor: '#0a0d08', opacity: 0.4 }} />
                    )}
                    {/* Solid dot with lime glow shadow */}
                    <div className="w-2 h-2 rounded-full"
                         style={{
                           backgroundColor: presenceDot,
                           boxShadow: isOnlineNow
                             ? `0 0 0 2px rgba(0,0,0,0.15), 0 0 8px 2px rgba(143,255,0,0.45)`
                             : `0 0 0 2px rgba(0,0,0,0.1)`,
                         }} />
                  </div>
                )}
                <p className="text-[11px] font-semibold"
                   style={{ color: isOnlineNow ? C.limeDeep : isRecent ? C.limeDeep : C.muted }}>
                  {presenceLabel}
                </p>
              </div>
              )}

              {/* 5. Location — flag image + city + country */}
              {!hiddenCols.has('LOCATION') && (() => {
                const rawCity  = u.verified_city ?? ''
                const country  = u.country ?? ''
                const code     = (u.country_code ?? '').trim().toLowerCase()
                const cityName = rawCity.split(',')[0].trim()
                const hasData  = !!(cityName || country)
                return (
                  <div className="min-w-0">
                    {hasData ? (
                      <>
                        <div className="flex flex-row items-center gap-1.5 flex-nowrap min-w-0">
                          {code.length === 2 ? (
                            <img
                              src={`https://flagcdn.com/16x12/${code}.png`}
                              srcSet={`https://flagcdn.com/32x24/${code}.png 2x`}
                              alt={country}
                              className="shrink-0 rounded-sm"
                              style={{ width: 16, height: 12, objectFit: 'cover' }}
                            />
                          ) : (
                            <Globe size={11} style={{ color: C.muted, flexShrink: 0 }} />
                          )}
                          <span className="text-[11px] font-bold truncate" style={{ color: C.text }}>
                            {cityName || country}
                          </span>
                        </div>
                        {cityName && country && (
                          <p className="text-[10px] truncate mt-0.5" style={{ color: C.muted }}>
                            {country}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-row items-center gap-1">
                        <Globe size={11} style={{ color: C.muted }} />
                        <span className="text-[10px]" style={{ color: C.muted }}>Unknown</span>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* 5. Health Score — dedicated column */}
              {!hiddenCols.has('HEALTH') && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ maxWidth:40, backgroundColor:C.border }}>
                    <div className="h-full rounded-full"
                         style={{ width:`${health}%`,
                                  backgroundColor: health>=70 ? C.lime : health>=40 ? C.amber : C.red }} />
                  </div>
                  <span className="text-[10px] font-black"
                        style={{ color: health>=70 ? C.limeDeep : health>=40 ? C.amber : C.red }}>
                    {health}
                  </span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit"
                      style={{ backgroundColor: risk.bg, color: risk.color }}>
                  {risk.label}
                </span>
              </div>
              )}

              {/* 6. eBay Status — dedicated column */}
              {!hiddenCols.has('EBAY') && (
              <div>
                {eStatus === 'none'
                  ? <span className="text-[10px]" style={{ color:C.muted }}>—</span>
                  : <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{
                          backgroundColor: eStatus==='connected' ? C.green : eStatus==='expiring' ? C.amber : C.red
                        }} />
                        <span className="text-[10px] font-bold" style={{
                          color: eStatus==='connected' ? C.green : eStatus==='expiring' ? C.amber : C.red
                        }}>
                          {eStatus==='connected' ? 'Active' : eStatus==='expiring' ? 'Expiring' : 'Offline'}
                        </span>
                      </div>
                      {eDays !== null && eStatus !== 'connected' && (
                        <span className="text-[9px]" style={{ color:C.muted }}>{eDays}d left</span>
                      )}
                    </div>}
              </div>
              )}

              {/* 7. IPs — unique login locations, click to see details */}
                {!hiddenCols.has('IPS') && (
                <div>
                  {uniqueIps === 0
                    ? <span className="text-[11px]" style={{ color:C.muted }}>—</span>
                    : <>
                        <button onClick={() => canDo('view_security') && setShowIpModal(true)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:opacity-80 cursor-pointer"
                        style={{
                          backgroundColor: uniqueIps > 5 ? 'rgba(185,28,28,0.08)' : C.bg,
                          borderColor:     uniqueIps > 5 ? C.red                  : C.border,
                        }}>
                        {uniqueIps > 5
                          ? <AlertTriangle size={10} style={{ color:C.red }} />
                          : <Globe size={10} style={{ color:C.muted }} />}
                        <span className="text-[11px] font-bold"
                              style={{ color: uniqueIps > 5 ? C.red : C.text }}>
                          {uniqueIps}
                        </span>
                      </button>
                      {showIpModal && <IpDetailModal user={u} onClose={() => setShowIpModal(false)} />}
                    </>}
              </div>
              )}

              {/* 8. Devices — from user_devices table */}
              {!hiddenCols.has('DEVICES') && (
              <div>
                {deviceCount === 0
                  ? <span className="text-[11px]" style={{ color:C.muted }}>—</span>
                  : (() => {
                      const mobCount  = deviceList.filter(d => d.platform?.includes('iOS') || d.platform?.includes('Android')).length
                      const deskCount = deviceCount - mobCount
                      return (
                        <div className="flex items-center gap-1.5">
                          {deskCount > 0 && (
                            <div className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md border"
                                 style={{ backgroundColor:C.bg, borderColor:C.border }}>
                              <Monitor size={10} style={{ color:C.muted }} />
                              <span className="text-[10px] font-bold" style={{ color:C.text }}>{deskCount}</span>
                            </div>
                          )}
                          {mobCount > 0 && (
                            <div className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md border"
                                 style={{ backgroundColor:C.bg, borderColor:C.border }}>
                              <Smartphone size={10} style={{ color:C.muted }} />
                              <span className="text-[10px] font-bold" style={{ color:C.text }}>{mobCount}</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
              </div>
              )}

              {/* 9. Team */}
              {!hiddenCols.has('TEAM') && (
              <div>
                {(() => {
                  const teamMembers = (u.teamMembers ?? []) as any[]
                  const teamOwners  = (u.teamOwners  ?? []) as any[]
                  const hasTeam     = teamMembers.length > 0 || teamOwners.length > 0
                  if (!hasTeam) return <span className="text-[11px]" style={{ color:C.muted }}>—</span>

                  if (teamMembers.length > 0) {
                    return (
                      <>
                        <button onClick={() => setShowTeamModal(true)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:opacity-80 cursor-pointer"
                          style={{ backgroundColor:'#F5F3FF', borderColor:'#c4b5fd' }}>
                          <Users size={10} style={{ color:'#8b5cf6' }} />
                          <span className="text-[10px] font-bold" style={{ color:'#8b5cf6' }}>
                            {teamMembers.length}
                          </span>
                        </button>
                        {showTeamModal && <TeamDetailModal user={u} onClose={() => setShowTeamModal(false)} />}
                      </>
                    )
                  }
                  const ownerName = teamOwners[0].owner?.name?.split(' ')[0]
                    ?? teamOwners[0].owner?.email?.split('@')[0]
                    ?? 'Team'
                  return (
                    <>
                      <button onClick={() => setShowTeamModal(true)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:opacity-80 cursor-pointer"
                        style={{ backgroundColor:'#FEF3C7', borderColor:'#fde68a' }}>
                        <Users size={10} style={{ color:'#92400e' }} />
                        <span className="text-[10px] font-bold truncate max-w-[50px]"
                              style={{ color:'#92400e' }}>
                          {ownerName}
                        </span>
                      </button>
                      {showTeamModal && <TeamDetailModal user={u} onClose={() => setShowTeamModal(false)} />}
                    </>
                  )
                })()}
              </div>
              )}

              {/* 10. Actions */}
              <div className="flex items-center justify-end gap-1">
                {/* Quick note button */}
                  {canDo('add_notes') && <button
                    onClick={e => { e.stopPropagation(); setShowQuickNote(s => !s) }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: showQuickNote ? C.limeTint : 'transparent',
                    border: showQuickNote ? `1px solid ${C.lime}` : '1px solid transparent',
                  }}
                  title="Quick note">
                  <FileText size={13} style={{ color: showQuickNote ? C.limeDeep : C.muted }} />
                  </button>}
                  <ActionMenu u={u} onDrawer={onDrawer} onUpdated={onUpdated} showToast={showToast} canDo={canDo} />
              </div>
            </div>

            {/* Quick Note Panel — expands below row */}
            {showQuickNote && (
              <QuickNotePanel
                userId={u.id}
                userName={name}
                recentNotes={recentNotes}
                onClose={() => setShowQuickNote(false)}
                onSaved={(newCount) => {
                  onUpdated(u.id, 'noteCount', newCount)
                  setShowQuickNote(false)
                }}
              />
            )}
    </>
  )
}
