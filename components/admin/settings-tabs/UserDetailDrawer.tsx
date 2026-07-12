'use client'
// components/admin/settings-tabs/UserDetailDrawer.tsx
// ─────────────────────────────────────────────────────────────
// User Detail Drawer — opens when admin clicks "Profile"
// Contains: notes, tags, timeline, LTV, eBay, impersonate,
//           suspension, quick actions, email modal
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useTabPermissions } from '@/hooks/useTabPermissions'
import {
  UserPlus, X, Mail, Lock, LogOut, DollarSign, Calendar,
  Store, Monitor, Smartphone, Copy, Trash2, ChevronDown,
  AlertTriangle, Check, Search, RefreshCw, Users,
  TimerOff, Headphones, MoreVertical, User, CloudOff,
  CheckCircle, Plus, Shield, Key, Activity, TrendingDown,
  Clock, Wifi, WifiOff, Zap, Gift, TrendingUp, XCircle,
  Award, Globe, AtSign, Camera, PlayCircle, HelpCircle,
  Link2, Wrench, MessageSquare,
} from 'lucide-react'

// ── Brand tokens ───────────────────────────────────────────────
const C = {
  dark:    '#0a0d08', lime:    '#8fff00', limeDeep: '#4a8f00',
  limeTint:'#f4ffe6', border:  '#e8ede2', bg:       '#f7f9f5',
  text:    '#1a2410', muted:   '#8a9e78', surface:  '#ffffff',
  red:     '#b91c1c', amber:   '#d97706', green:    '#16a34a',
}
const PAGE_SIZE = 25

// ── Badge helpers ──────────────────────────────────────────────
function planBadge(plan: string) {
  const p = (plan ?? '').toLowerCase()
  if (p.includes('elite') || p.includes('pro')) return { bg: C.lime,    text: C.dark  }
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

// ── Data helpers ───────────────────────────────────────────────
function getInitials(n: string) {
  const p = (n ?? '').trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (n ?? 'U').slice(0,2).toUpperCase()
}
function nameToColor(n: string) {
  const pal = ['#4a8f00','#1d70f5','#d97706','#8b5cf6','#e11d48','#0891b2']
  let h = 0; for (const c of n ?? '') h = c.charCodeAt(0) + ((h << 5) - h)
  return pal[Math.abs(h) % pal.length]
}

// ── Avatar — shows real Google profile photo if available ──────
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

// ── Health Score (0-100) ───────────────────────────────────────
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
  score += p.includes('elite') ? 10 : p.includes('pro') ? 7 : 3
  return Math.min(Math.round(score), 100)
}

// ── Churn Risk from Health Score ───────────────────────────────
function churnRisk(score: number) {
  if (score >= 70) return { label: 'Low Risk',    color: C.green, bg: 'rgba(22,163,74,0.10)'  }
  if (score >= 40) return { label: 'Medium Risk', color: C.amber, bg: 'rgba(217,119,6,0.10)'  }
  return               { label: 'High Risk',   color: C.red,   bg: 'rgba(185,28,28,0.10)'  }
}

// ── Trial Days Remaining ───────────────────────────────────────
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

// ── eBay Connection Status ─────────────────────────────────────
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

// ── Riazify Tool Definitions ───────────────────────────────────
const TOOLS = [
  { key: 'ebay_orders',        name: 'Orders'        },
  { key: 'profit_calculator',  name: 'Profit Calc'   },
  { key: 'title_builder',      name: 'Title Builder' },
  { key: 'product_research',   name: 'Product Res.'  },
  { key: 'competitor_research',name: 'Competitor'    },
]

// ── Tag config ─────────────────────────────────────────────────
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

// ── Get user's primary segment ─────────────────────────────────
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

// ── Export users to CSV ────────────────────────────────────────
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


// ── Email Send Modal ───────────────────────────────────────────
function EmailModal({ user, supabase, showToast, onClose }: {
  user: any
  supabase: any
  showToast: (msg: string, type: 'success'|'error'|'info') => void
  onClose: () => void
}) {
  const EMAIL_TEMPLATES = [
    { key: 'nudge_inactive', label: 'Nudge — Inactive User',  desc: 'Re-engage users who went quiet',          Icon: Zap,         color: C.limeDeep, bg: C.limeTint },
    { key: 'trial_ending',   label: 'Trial Ending Soon',       desc: 'Push users to upgrade before trial ends', Icon: Clock,       color: C.amber,    bg: '#FFFBEB'  },
    { key: 'upgrade_offer',  label: 'Special Upgrade Offer',   desc: 'Send a personal upgrade pitch',           Icon: TrendingUp,  color: '#f97316',  bg: '#FFF7ED'  },
    { key: 'ebay_reconnect', label: 'eBay Reconnect Required', desc: 'Alert user their eBay token expired',     Icon: WifiOff,     color: C.red,      bg: '#FEF2F2'  },
    { key: 'welcome_back',   label: 'Welcome Back',            desc: 'Win back a dormant user',                 Icon: CheckCircle, color: '#1d70f5',  bg: '#EFF6FF'  },
  ]

  const [selectedTpl,  setSelectedTpl]  = useState('')
  const [customNote,   setCustomNote]   = useState('')
  const [sending,      setSending]      = useState(false)
  const [sent,         setSent]         = useState(false)

  const selectedCfg = EMAIL_TEMPLATES.find(t => t.key === selectedTpl)
  const userName    = user.name || (user.email ?? '').split('@')[0] || 'there'

  async function handleSend() {
    if (!selectedTpl) return
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch('/api/admin/send-email', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId:      user.id,
          templateKey: selectedTpl,
          customNote:  customNote.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSent(true)
      showToast(`Email sent: ${json.template}`, 'success')
      setTimeout(onClose, 1800)
    } catch (e: any) {
      showToast(e.message ?? 'Failed to send email', 'error')
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Send Email</p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              To: {userName} · {user.email}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={16} style={{ color: C.muted }} />
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: C.limeTint }}>
              <Check size={26} style={{ color: C.limeDeep }} />
            </div>
            <p className="text-[15px] font-bold" style={{ color: C.dark }}>Email Sent!</p>
            <p className="text-[12px]" style={{ color: C.muted }}>
              {selectedCfg?.label} delivered to {userName}
            </p>
          </div>
        ) : (
          <div className="p-6">

            {/* Step 1: Template picker */}
            <p className="text-[11px] font-black tracking-wider mb-3"
               style={{ color: C.muted }}>
              STEP 1 — PICK A TEMPLATE
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {EMAIL_TEMPLATES.map(t => {
                const TIcon  = t.Icon
                const active = selectedTpl === t.key
                return (
                  <button key={t.key} onClick={() => setSelectedTpl(t.key)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:opacity-90"
                    style={{
                      backgroundColor: active ? t.bg    : '#fafcf8',
                      borderColor:     active ? t.color : C.border,
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                         style={{ backgroundColor: active ? t.color + '20' : '#f0f0f0' }}>
                      <TIcon size={15} style={{ color: active ? t.color : C.muted }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold"
                         style={{ color: active ? t.color : C.text }}>{t.label}</p>
                      <p className="text-[11px]" style={{ color: C.muted }}>{t.desc}</p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                           style={{ backgroundColor: t.color }}>
                        <Check size={11} style={{ color: '#fff' }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Step 2: Personal note */}
            <p className="text-[11px] font-black tracking-wider mb-2"
               style={{ color: C.muted }}>
              STEP 2 — ADD A PERSONAL NOTE
              <span className="font-normal ml-1">(optional)</span>
            </p>
            <textarea
              value={customNote}
              onChange={e => setCustomNote(e.target.value.slice(0, 200))}
              placeholder={`Add a personal message for ${userName}...`}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border text-[13px] outline-none resize-none mb-1"
              style={{ borderColor: C.border, backgroundColor: '#fafcf8',
                       color: C.text, fontFamily: 'inherit' }} />
            <p className="text-[10px] text-right mb-5" style={{ color: C.muted }}>
              {customNote.length}/200
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border text-[13px] font-semibold hover:opacity-80"
                style={{ borderColor: C.border, color: C.muted }}>
                Cancel
              </button>
              <button onClick={handleSend}
                disabled={!selectedTpl || sending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: selectedTpl ? C.dark : C.border,
                         color: selectedTpl ? C.lime : C.muted }}>
                {sending
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                         style={{ borderTopColor: C.lime }} />
                  : <><Mail size={14} /> Send Email</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function UserDetailDrawer({ user, onClose, onUpdated, showToast, viewOnly = false }: {
  user:any; onClose:()=>void
  onUpdated:(id:string,f:string,v:any)=>void
  showToast:(msg:string,type:'success'|'error'|'info')=>void
  viewOnly?: boolean
}) {
  const { can } = useTabPermissions('user_crm')
  const supabase = createClient()

  const [stores,        setStores]        = useState<any[]>([])
  const [devices,       setDevices]       = useState<any[]>([])
  const [history,       setHistory]       = useState<any[]>([])
  const [journey,       setJourney]       = useState<any[]>([])
  const [notes,         setNotes]         = useState<any[]>([])
  const [transactions,  setTransactions]  = useState<any[]>([])
  const [noteContent,   setNoteContent]   = useState('')
  const [noteCategory,  setNoteCategory]  = useState('general')
  const [addingNote,    setAddingNote]    = useState(false)
  const [savingNote,    setSavingNote]    = useState(false)
  const [currentPlan,   setCurrentPlan]   = useState(planOf(user))
  const [currentStatus, setCurrentStatus] = useState(statusOf(user))
  const [loadingData,   setLoadingData]   = useState(true)
  const [resettingPass, setResettingPass] = useState(false)
  const [loggingOut,    setLoggingOut]    = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteText,    setDeleteText]    = useState('')
  const [deleting,      setDeleting]      = useState(false)
  const [activeTab,     setActiveTab]     = useState<'overview'|'actions'|'history'|'profile'>('overview')
  const [mounted,       setMounted]       = useState(false)
  // ── Moved from IIFEs to fix React Rules of Hooks ─────────────
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [editingRef,     setEditingRef]     = useState(false)
  const [refSource,      setRefSource]      = useState(user.referral_source?.source ?? 'unknown')
  const [refNote,        setRefNote]        = useState(user.referral_source?.ref ?? '')
  const [savingRef,      setSavingRef]      = useState(false)
  const [impersonating,  setImpersonating]  = useState(false)
  const [showWarning,    setShowWarning]    = useState(false)
  const [suspending,     setSuspending]     = useState(false)
  const [confirmSuspend, setConfirmSuspend] = useState(false)
  const [confirmBan,     setConfirmBan]     = useState(false)
  const [banText,        setBanText]        = useState('')

  // Trigger slide-in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const name    = user.name || (user.email ?? '').split('@')[0] || 'Unknown'
  const email   = user.email ?? '—'
  const mrr     = mrrOf(user)
  const maxStores = currentPlan.toLowerCase().includes('elite') ? 5 : currentPlan.toLowerCase().includes('pro') ? 2 : 1

  useEffect(() => {
    async function load() {
      try {
        const [sr, dr, hr, jr, nr, tr] = await Promise.all([
          supabase.from('user_stores').select('*').eq('user_id', user.id),
          supabase.from('user_devices').select('*').eq('user_id', user.id),
          supabase.from('login_history').select('*').eq('user_id', user.id)
            .order('login_at', { ascending:false }).limit(10),
          (supabase.from('user_events') as any).select('*').eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          (supabase.from('user_notes') as any).select('*').eq('user_id', user.id)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
          (supabase.from('transactions') as any)
            .select('amount, status, plan, billing, invoice, created_at, coupon')
            .eq('user_id', user.id)
            .eq('status', 'paid')
            .order('created_at', { ascending: false }),
        ])
        setStores(sr.data ?? [])
        setDevices(dr.data ?? [])
        setHistory(hr.data ?? [])
        setJourney(jr.data ?? [])
        setNotes(nr.data ?? [])
        setTransactions(tr.data ?? [])
      } catch {}
      setLoadingData(false)
    }
    load()
  }, [user.id])

  async function changePlan(p: string) {
    try {
      await (supabase.from('profiles') as any).update({ plan_name: p }).eq('id', user.id)
      await (supabase.from('subscriptions') as any).update({ plan_name: p }).eq('user_id', user.id)
      setCurrentPlan(p); onUpdated(user.id, 'plan_name', p)
      showToast(`Plan updated to ${p}`, 'success')
    } catch { showToast('Failed to update plan', 'error') }
  }

  async function changeStatus(s: string) {
    try {
      await (supabase.from('profiles') as any).update({ account_status: s }).eq('id', user.id)
      setCurrentStatus(s); onUpdated(user.id, 'account_status', s)
      showToast(`Status updated to ${s}`, 'success')
    } catch { showToast('Failed to update status', 'error') }
  }

  async function sendReset() {
    setResettingPass(true)
    try {
      await supabase.auth.resetPasswordForEmail(email)
      showToast('Password reset email sent', 'success')
    } catch { showToast('Failed to send reset email', 'error') }
    setResettingPass(false)
  }

  async function forceLogout() {
    setLoggingOut(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/force-logout', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error('Failed')
      showToast(`${name} has been logged out`, 'success')
    } catch { showToast('Force logout failed', 'error') }
    setLoggingOut(false); setConfirmLogout(false)
  }

  async function deleteUser() {
    if (deleteText !== 'DELETE') return
    setDeleting(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/delete-user', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error('Failed')
      onUpdated(user.id, 'deleted', true)
      showToast(`${name} has been permanently deleted`, 'error')
      onClose()
    } catch { showToast('Delete failed', 'error') }
    setDeleting(false); setConfirmDelete(false)
  }

  async function revokeDevice(deviceId: string) {
    try {
      await supabase.from('user_devices').delete().eq('device_id', deviceId)
      setDevices(d => d.filter(x => x.device_id !== deviceId))
      showToast('Device session revoked', 'success')
    } catch { showToast('Failed to revoke device', 'error') }
  }

  const pb = planBadge(currentPlan)
  const sb = statusBadge(currentStatus)

  const SectionLabel = ({ text, danger }: { text:string; danger?:boolean }) => (
    <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: danger ? C.red : C.muted }}>{text}</p>
  )

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end"
         style={{
           backgroundColor: mounted ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
           backdropFilter:  mounted ? 'blur(4px)' : 'blur(0px)',
           transition: 'background-color 0.25s ease, backdrop-filter 0.25s ease',
         }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[420px] h-full bg-white flex flex-col"
           style={{
             borderRadius: '20px 0 0 20px',
             boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
             transform:   mounted ? 'translateX(0)' : 'translateX(100%)',
             transition:  'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
           }}>

        {/* ── Sticky Header: Hero + Close ── */}
        <div className="shrink-0 px-6 pt-5 pb-3 border-b" style={{ borderColor: C.border }}>
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black tracking-widest" style={{ color:C.muted }}>USER PROFILE</p>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl border hover:bg-gray-50"
              style={{ borderColor:C.border }}>
              <X size={15} style={{ color:C.muted }} />
            </button>
          </div>

          {/* Avatar + name + email */}
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              name={name} size={52}
              avatarUrl={user.avatar_url ?? user.raw_user_meta_data?.avatar_url ?? null}
            />
            <div className="min-w-0">
              <h2 className="text-[16px] font-black truncate" style={{ color:C.text }}>{name}</h2>
              <div className="flex items-center gap-1">
                <p className="text-[12px] truncate" style={{ color:C.muted }}>{email}</p>
                <button onClick={() => navigator.clipboard.writeText(email)}>
                  <Copy size={11} style={{ color:C.muted }} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                      style={{ backgroundColor:pb.bg, color:pb.text }}>{currentPlan}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor:sb.bg, color:sb.text }}>{currentStatus}</span>
              </div>
            </div>
          </div>

          {/* ── Tab bar ── */}
          {(() => {
            const TABS = [
              { key:'overview', label:'Overview'  },
              { key:'actions',  label:'Actions'   },
              { key:'history',  label:'History'   },
              { key:'profile',  label:'Profile'   },
            ] as const
            return (
              <div className="flex gap-1.5">
                {TABS.map(t => {
                  const active = activeTab === t.key
                  return (
                    <button key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap"
                      style={{
                        backgroundColor: active ? C.dark   : C.bg,
                        color:           active ? C.lime   : C.muted,
                      }}>
                      {t.label}
                    </button>
                  )
                })}
              </div>
            )
          })()}
        </div>

        {/* ── Scrollable content area ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* View only banner */}
          {viewOnly && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, marginBottom:16 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#1d4ed8' }}>👁 View only — you can browse but cannot make changes.</span>
            </div>
          )}
          {/* ── ACTIONS TAB ── */}
          {activeTab === 'actions' && (<>
          {/* User Tags */}
          {(() => {
            const userTags: string[] = Array.isArray(user.tags) ? user.tags : []

            async function toggleTag(tagKey: string) {
              const hasTag    = userTags.includes(tagKey)
              const newTags   = hasTag
                ? userTags.filter(t => t !== tagKey)
                : [...userTags, tagKey]
              try {
                await (supabase.from('profiles') as any)
                  .update({ tags: newTags })
                  .eq('id', user.id)
                onUpdated(user.id, 'tags', newTags)
                showToast(hasTag ? 'Tag removed' : 'Tag added', 'success')
              } catch { showToast('Failed to update tag', 'error') }
            }

            return (
              <div className="mb-5">
                <SectionLabel text="USER TAGS" />
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TAG_CFG).map(([key, cfg]) => {
                    const TagIcon = cfg.Icon
                    const active  = userTags.includes(key)
                    return (
                      <button key={key} onClick={() => can('manage_tags') && toggleTag(key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: active ? cfg.bg        : 'transparent',
                          borderColor:     active ? cfg.color      : C.border,
                          color:           active ? cfg.color      : C.muted,
                        }}>
                        <TagIcon size={11} style={{ color: active ? cfg.color : C.muted }} />
                        {cfg.label}
                        {active && <X size={9} style={{ color: cfg.color }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          </>)}

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (<>
          {/* eBay Connection Status */}
          <SectionLabel text="EBAY CONNECTION" />
          {(() => {
            const es   = ebayStatus(user)
            const days = ebayDaysLeft(user)
            const conn = user.ebayConnection
            const statusMap = {
              connected:    { color: C.green, bg: 'rgba(22,163,74,0.08)', Icon: Wifi,    label: `Connected${days ? ` · ${days}d to expiry` : ''}` },
              expiring:     { color: C.amber, bg: 'rgba(217,119,6,0.08)', Icon: Wifi,    label: `Expiring in ${days} days — action needed!` },
              disconnected: { color: C.red,   bg: 'rgba(185,28,28,0.08)', Icon: WifiOff, label: 'Disconnected — user needs to reconnect' },
              none:         { color: C.muted, bg: C.bg,                   Icon: WifiOff, label: 'No eBay account connected' },
            }
            const cfg = statusMap[es]
            const CfgIcon = cfg.Icon
            return (
              <div className="flex items-center justify-between p-3.5 rounded-xl border mb-6"
                   style={{ backgroundColor: cfg.bg, borderColor: cfg.color + '40' }}>
                <div className="flex items-center gap-2.5">
                  <CfgIcon size={17} style={{ color: cfg.color }} />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                    {conn?.store_name && <p className="text-[10px]" style={{ color: C.muted }}>Store: {conn.store_name}</p>}
                  </div>
                </div>
                {(es === 'disconnected' || es === 'expiring') && (
                  <button
                    onClick={async () => {
                      await supabase.auth.resetPasswordForEmail(email)
                      showToast('Reconnect email sent to user', 'info')
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-80"
                    style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                    Send Reconnect
                  </button>
                )}
              </div>
            )
          })()}

          {/* Feature Adoption & Velocity */}
          <SectionLabel text="FEATURE ADOPTION & VELOCITY" />
          <div className="flex flex-col gap-2 mb-6">
            {TOOLS.map(tool => {
              const usage = (user.toolUsage ?? []).find((t: any) => t.tool_name === tool.key)
              const sessions = usage?.usage_count ?? 0
              const used = sessions > 0
              return (
                <div key={tool.key} className="flex items-center gap-3 p-2.5 rounded-xl border"
                     style={{ borderColor: C.border, backgroundColor: used ? C.surface : C.bg }}>
                  <div className="w-2 h-2 rounded-full shrink-0"
                       style={{ backgroundColor: used ? C.lime : C.border }} />
                  <span className="flex-1 text-[12px] font-semibold" style={{ color: used ? C.text : C.muted }}>
                    {tool.name}
                  </span>
                  {used ? (
                    <span className="text-[11px] font-bold" style={{ color: C.limeDeep }}>
                      {sessions} sessions
                    </span>
                  ) : (
                    <span className="text-[10px]" style={{ color: C.muted }}>Not used</span>
                  )}
                </div>
              )
            })}
          </div>

          </>)}

          {/* ── ACTIONS TAB ── */}
          {activeTab === 'actions' && (<>
          {/* Team Section */}
          {(() => {
            const teamMembers = (user.teamMembers ?? []) as any[]
            const teamOwners  = (user.teamOwners  ?? []) as any[]
            const hasTeam     = teamMembers.length > 0 || teamOwners.length > 0
            if (!hasTeam) return null

            async function removeMemberFromAdmin(ownerId: string, memberId: string) {
              try {
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch('/api/team/remove', {
                  method:  'POST',
                  headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                  },
                  body: JSON.stringify({ ownerId, memberId }),
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json.error)
                onUpdated(user.id, 'teamMembers', teamMembers.filter(m => m.member_id !== memberId))
                showToast('Team member removed', 'success')
              } catch (e: any) { showToast(e.message ?? 'Failed', 'error') }
            }

            return (
              <div className="mb-5">
                <SectionLabel text="TEAM" />

                {/* Owner: show their team members */}
                {teamMembers.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold mb-2" style={{ color: C.muted }}>
                      MANAGES {teamMembers.length} MEMBER{teamMembers.length !== 1 ? 'S' : ''}
                    </p>
                    <div className="flex flex-col gap-2">
                      {teamMembers.map((m: any) => {
                        const mem  = m.member ?? {}
                        const role = m.role === 'order_manager' ? 'Order Manager'
                                   : m.role === 'full_access'   ? 'Full Access' : 'Viewer'
                        const initials = ((mem.name ?? mem.email ?? 'U') as string)
                          .split(' ').map((p: string) => p[0]).join('').slice(0,2).toUpperCase()
                        return (
                          <div key={m.member_id}
                               className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
                               style={{ borderColor:C.border, backgroundColor:C.surface }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                                 style={{ backgroundColor:'#8b5cf6' }}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold truncate" style={{ color:C.text }}>
                                {mem.name ?? mem.email}
                              </p>
                              <p className="text-[10px]" style={{ color:C.muted }}>{role}</p>
                            </div>
                            <button
                              onClick={() => removeMemberFromAdmin(user.id, m.member_id)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg border hover:opacity-80"
                              style={{ borderColor:'rgba(185,28,28,0.3)', color:C.red, backgroundColor:'rgba(185,28,28,0.05)' }}>
                              Remove
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Member: show which teams they belong to */}
                {teamOwners.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold mb-2" style={{ color: C.muted }}>
                      MEMBER OF {teamOwners.length} TEAM{teamOwners.length !== 1 ? 'S' : ''}
                    </p>
                    <div className="flex flex-col gap-2">
                      {teamOwners.map((t: any) => {
                        const owner = t.owner ?? {}
                        const role  = t.role === 'order_manager' ? 'Order Manager'
                                    : t.role === 'full_access'   ? 'Full Access' : 'Viewer'
                        const initials = ((owner.name ?? owner.email ?? 'O') as string)
                          .split(' ').map((p: string) => p[0]).join('').slice(0,2).toUpperCase()
                        return (
                          <div key={t.owner_id}
                               className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
                               style={{ borderColor:C.border, backgroundColor:C.surface }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                                 style={{ backgroundColor:'#4a8f00' }}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold truncate" style={{ color:C.text }}>
                                {owner.name ?? owner.email}
                              </p>
                              <p className="text-[10px]" style={{ color:C.muted }}>{role}</p>
                            </div>
                            <button
                              onClick={() => removeMemberFromAdmin(t.owner_id, user.id)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg border hover:opacity-80"
                              style={{ borderColor:'rgba(185,28,28,0.3)', color:C.red, backgroundColor:'rgba(185,28,28,0.05)' }}>
                              Remove
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Quick Actions */}
          <SectionLabel text="QUICK ACTIONS" />
          <div className="flex flex-col gap-2 mb-6">
            {planOf(user).toLowerCase().includes('free') && (
              <button
                onClick={async () => {
                  try {
                    const sub    = user.subscriptions?.[0]
                    const newEnd = sub?.current_period_end
                      ? new Date(new Date(sub.current_period_end).getTime() + 7 * 86400000).toISOString()
                      : new Date(Date.now() + 7 * 86400000).toISOString()
                    await (supabase.from('subscriptions') as any)
                      .update({ current_period_end: newEnd })
                      .eq('user_id', user.id)
                    showToast('Trial extended by 7 days', 'success')
                  } catch { showToast('Failed to extend trial', 'error') }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80"
                style={{ borderColor: C.lime, backgroundColor: C.limeTint, color: C.limeDeep }}>
                <Clock size={13} /> Extend Trial by 7 Days
              </button>
            )}

            {/* Send Email — opens popup modal */}
            {(() => {
              return (
                <>
                  <button onClick={() => setShowEmailModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80"
                    style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}>
                    <Mail size={13} style={{ color: C.limeDeep }} /> Send Email
                  </button>
                  {showEmailModal && (
                    <EmailModal
                      user={user}
                      supabase={supabase}
                      showToast={showToast}
                      onClose={() => setShowEmailModal(false)}
                    />
                  )}
                </>
              )
            })()}

            <button
              onClick={() => showToast('Connect Promos tab to apply coupons', 'info')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}>
              <Gift size={13} style={{ color: C.amber }} /> Apply Promo Coupon
            </button>
          </div>

          <div className="h-px mb-5" style={{ backgroundColor:C.border }} />
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon:DollarSign, title:'Monthly Value', value: mrr > 0 ? `$${mrr.toFixed(0)}/mo` : 'Free' },
              { icon:Calendar,   title:'Member Since',  value: fmtDate(user.created_at) },
            ].map(({ icon:Icon, title, value }) => (
              <div key={title} className="p-3.5 rounded-xl border" style={{ borderColor:C.border, backgroundColor:C.surface }}>
                <Icon size={16} style={{ color:C.muted }} />
                <p className="text-[16px] font-black mt-2 mb-0.5" style={{ color:C.text }}>{value}</p>
                <p className="text-[10px] font-semibold" style={{ color:C.muted }}>{title}</p>
              </div>
            ))}
          </div>

          </>)}

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (<>
          {/* LTV + Payment History */}
          {(() => {
            const ltv          = transactions.reduce((sum, t) => sum + parseFloat(t.amount ?? 0), 0)
            const paymentCount = transactions.length
            return (
              <div className="rounded-xl border mb-6 overflow-hidden"
                   style={{ borderColor: ltv > 0 ? C.lime : C.border }}>
                {/* LTV header */}
                <div className="flex items-center justify-between px-4 py-3"
                     style={{ backgroundColor: ltv > 0 ? C.limeTint : C.bg }}>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} style={{ color: ltv > 0 ? C.limeDeep : C.muted }} />
                    <p className="text-[12px] font-bold"
                       style={{ color: ltv > 0 ? C.limeDeep : C.muted }}>
                      Lifetime Value (LTV)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-black"
                       style={{ color: ltv > 0 ? C.limeDeep : C.muted }}>
                      ${ltv.toFixed(2)}
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {paymentCount} payment{paymentCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {/* Payment rows */}
                {paymentCount > 0 ? (
                  <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
                    {transactions.slice(0, 5).map((t: any, i: number) => (
                      <div key={i}
                           className="flex items-center justify-between px-4 py-2.5"
                           style={{ backgroundColor: C.surface }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0"
                               style={{ backgroundColor: C.green }} />
                          <div>
                            <p className="text-[12px] font-semibold" style={{ color: C.text }}>
                              {t.plan ?? 'Payment'}
                              {t.billing && (
                                <span className="ml-1.5 text-[10px] font-normal capitalize"
                                      style={{ color: C.muted }}>
                                  ({t.billing})
                                </span>
                              )}
                            </p>
                            <p className="text-[10px]" style={{ color: C.muted }}>
                              {t.invoice && <span className="mr-1">{t.invoice} ·</span>}
                              {fmtDate(t.created_at)}
                            </p>
                            {t.coupon && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md mt-0.5 inline-block"
                                    style={{ backgroundColor: '#f4ffe6', color: '#4a8f00', border: '1px solid rgba(143,255,0,0.3)' }}>
                                {t.coupon}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold" style={{ color: C.green }}>
                            +${parseFloat(t.amount ?? 0).toFixed(2)}
                          </p>
                          <p className="text-[9px] font-semibold capitalize"
                             style={{ color: C.green }}>
                            paid
                          </p>
                        </div>
                      </div>
                    ))}
                    {paymentCount > 5 && (
                      <p className="text-center text-[10px] py-2" style={{ color: C.muted }}>
                        +{paymentCount - 5} more payment{paymentCount - 5 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-3 text-[12px]" style={{ color: C.muted }}>
                    No payments recorded yet
                  </p>
                )}
              </div>
            )
          })()}

          {/* Plan usage */}
          <SectionLabel text="PLAN USAGE" />
          <div className="p-4 rounded-xl border mb-6" style={{ borderColor:C.border, backgroundColor:C.bg }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold" style={{ color:C.text }}>
                {stores.length} / {maxStores} Stores
              </span>
              <span className="text-[11px]" style={{ color:C.muted }}>{currentPlan}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:C.border }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width:`${Math.min(stores.length/maxStores,1)*100}%`,
                            backgroundColor: stores.length > maxStores ? C.red : C.lime }} />
            </div>
          </div>

          {/* Connected stores */}
          <SectionLabel text="CONNECTED STORES" />
          {loadingData
            ? <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.limeDeep }} /></div>
            : stores.length > 0
              ? stores.map((s,i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                       style={{ borderColor:C.border, backgroundColor:C.surface }}>
                    <Store size={15} style={{ color:C.muted }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color:C.text }}>{s.name ?? 'eBay Store'}</p>
                      <p className="text-[10px]" style={{ color:C.muted }}>Synced: {s.last_sync ? timeAgo(s.last_sync) : '—'}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor:C.lime }}>
                      <Check size={9} style={{ color:C.dark }} />
                    </div>
                  </div>
                ))
              : <p className="text-center py-4 text-[12px] mb-6" style={{ color:C.muted }}>No stores connected</p>}

          <div className="h-px my-5" style={{ backgroundColor:C.border }} />

          {/* Active devices */}
          <SectionLabel text="ACTIVE DEVICES" />
          {loadingData
            ? <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.limeDeep }} /></div>
            : devices.length > 0
              ? devices.map((d,i) => {
                  const isMob = d.platform?.includes('iOS') || d.platform?.includes('Android')
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                         style={{ borderColor:C.border, backgroundColor: d.is_current ? C.bg : C.surface }}>
                      {isMob ? <Smartphone size={15} style={{ color:C.muted }} /> : <Monitor size={15} style={{ color:C.muted }} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold" style={{ color:C.text }}>{d.platform} · {d.browser}</p>
                          {d.is_current && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor:C.limeTint, color:C.limeDeep }}>Current</span>}
                        </div>
                        <p className="text-[10px]" style={{ color:C.muted }}>IP: {d.ip_address} · {timeAgo(d.last_active)}</p>
                      </div>
                      {!d.is_current && (
                        <button onClick={() => revokeDevice(d.device_id)}
                          className="px-2.5 py-1 rounded-lg border text-[10px] font-bold"
                          style={{ borderColor:'rgba(185,28,28,0.3)', color:C.red }}>Revoke</button>
                      )}
                    </div>
                  )
                })
              : <p className="text-center py-4 text-[12px] mb-6" style={{ color:C.muted }}>No devices recorded</p>}

          <div className="h-px my-5" style={{ backgroundColor:C.border }} />

          </>)}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (<>
          {/* Login history */}
          <SectionLabel text="SECURITY & LOGIN AUDIT" />
          {loadingData
            ? <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.limeDeep }} /></div>
            : history.length > 0
              ? history.map((h,i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                       style={{ borderColor:C.border, backgroundColor:C.surface }}>
                    <Monitor size={13} style={{ color:C.muted }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold" style={{ color:C.text }}>{h.device_info ?? 'Unknown Device'}</p>
                      <p className="text-[10px]" style={{ color:C.muted }}>IP: {h.ip_address} · {fmtDateTime(h.login_at)}</p>
                    </div>
                  </div>
                ))
              : <p className="text-center py-4 text-[12px] mb-6" style={{ color:C.muted }}>No login history found</p>}

          <div className="h-px my-5" style={{ backgroundColor:C.border }} />

          {/* Admin Notes History */}
          {(() => {
            const NOTE_CATS: Record<string, { label:string; color:string; bg:string; Icon:React.ElementType }> = {
              general:   { label:'General',   color:C.muted,    bg:C.bg,        Icon:MessageSquare  },
              support:   { label:'Support',   color:'#1d70f5',  bg:'#EFF6FF',   Icon:Headphones     },
              sales:     { label:'Sales',     color:C.limeDeep, bg:C.limeTint,  Icon:DollarSign     },
              warning:   { label:'Warning',   color:C.red,      bg:'#FEF2F2',   Icon:AlertTriangle  },
              technical: { label:'Technical', color:'#8b5cf6',  bg:'#F5F3FF',   Icon:Key            },
            }

            const hasWarning = notes.some(n => n.category === 'warning')

            async function addNote() {
              if (!noteContent.trim()) return
              setSavingNote(true)
              try {
                const { data: { user: admin } } = await supabase.auth.getUser()
                const { data: adminProfile }     = await supabase
                  .from('profiles').select('name').eq('id', admin?.id ?? '').single()
                const { data: newNote, error }   = await (supabase.from('user_notes') as any)
                  .insert({
                    user_id:    user.id,
                    admin_id:   admin?.id ?? '',
                    admin_name: (adminProfile as any)?.name ?? 'Admin',
                    content:    noteContent.trim(),
                    category:   noteCategory,
                    is_pinned:  false,
                  })
                  .select()
                  .single()
                if (error) throw error
                setNotes(prev => [newNote, ...prev])
                setNoteContent('')
                setNoteCategory('general')
                setAddingNote(false)
                showToast('Note added', 'success')
              } catch { showToast('Failed to add note', 'error') }
              setSavingNote(false)
            }

            async function togglePin(noteId: string, current: boolean) {
              try {
                await (supabase.from('user_notes') as any)
                  .update({ is_pinned: !current })
                  .eq('id', noteId)
                setNotes(prev => {
                  const updated = prev.map(n =>
                    n.id === noteId ? { ...n, is_pinned: !current } : n
                  )
                  return [...updated].sort((a, b) =>
                    b.is_pinned - a.is_pinned ||
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )
                })
              } catch { showToast('Failed to pin note', 'error') }
            }

            async function deleteNote(noteId: string) {
              try {
                await (supabase.from('user_notes') as any).delete().eq('id', noteId)
                setNotes(prev => prev.filter(n => n.id !== noteId))
                showToast('Note deleted', 'info')
              } catch { showToast('Failed to delete note', 'error') }
            }

            function noteTime(ts: string) {
              const d    = new Date(ts)
              const diff = (Date.now() - d.getTime()) / 1000
              if (diff < 3600)   return `${Math.floor(diff/60)}m ago`
              if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`
              if (diff < 604800) return `${Math.floor(diff/86400)}d ago`
              return d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
            }

            return (
              <div className="mb-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wider" style={{ color:C.muted }}>
                      ADMIN NOTES
                    </span>
                    {notes.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                            style={{ backgroundColor: hasWarning ? '#FEF2F2' : C.bg,
                                     color: hasWarning ? C.red : C.muted }}>
                        {notes.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setAddingNote(s => !s)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-80"
                    style={{ backgroundColor: addingNote ? C.border : C.dark, color: addingNote ? C.muted : C.lime }}>
                    {addingNote ? <><X size={10} /> Cancel</> : <><Plus size={10} /> Add Note</>}
                  </button>
                </div>

                {/* Add Note Form */}
                {addingNote && (
                  <div className="p-3.5 rounded-xl border mb-3"
                       style={{ backgroundColor:C.bg, borderColor:C.border }}>
                    {/* Category picker */}
                    <div className="flex gap-1.5 mb-2.5 flex-wrap">
                      {Object.entries(NOTE_CATS).map(([key, cfg]) => {
                        const CatIcon = cfg.Icon
                        const active  = noteCategory === key
                        return (
                          <button key={key} onClick={() => setNoteCategory(key)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all"
                            style={{
                              backgroundColor: active ? cfg.bg    : 'transparent',
                              borderColor:     active ? cfg.color : C.border,
                              color:           active ? cfg.color : C.muted,
                            }}>
                            <CatIcon size={9} />
                            {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                    {/* Textarea */}
                    <textarea
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value.slice(0, 500))}
                      placeholder="Write a note about this user..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none resize-none mb-1"
                      style={{ backgroundColor:C.surface, borderColor:C.border,
                               color:C.text, fontFamily:'inherit' }} />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color:C.muted }}>
                        {noteContent.length}/500
                      </span>
                      {can('add_notes') && <button onClick={addNote} disabled={!noteContent.trim() || savingNote}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold disabled:opacity-50"
                        style={{ backgroundColor:C.dark, color:C.lime }}>
                        {savingNote
                          ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                                 style={{ borderTopColor:C.lime }} />
                          : <><Check size={11} /> Save Note</>}
                      </button>}
                    </div>
                  </div>
                )}

                {/* Notes List */}
                {notes.length === 0 ? (
                  <p className="text-center py-4 text-[12px]" style={{ color:C.muted }}>
                    No notes yet — add the first one
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {notes.map((n: any) => {
                      const cat     = NOTE_CATS[n.category] ?? NOTE_CATS.general
                      const CatIcon = cat.Icon
                      return (
                        <div key={n.id}
                             className="p-3 rounded-xl border relative"
                             style={{
                               backgroundColor: n.is_pinned ? cat.bg : C.surface,
                               borderColor: n.is_pinned ? cat.color + '50' : C.border,
                               borderLeftWidth: n.category === 'warning' ? 3 : 1,
                               borderLeftColor: n.category === 'warning' ? C.red : undefined,
                             }}>
                          {/* Top row: category + time + actions */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {n.is_pinned && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                      style={{ backgroundColor:cat.color, color:'#fff' }}>
                                  PINNED
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <CatIcon size={10} style={{ color:cat.color }} />
                                <span className="text-[10px] font-bold" style={{ color:cat.color }}>
                                  {cat.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px]" style={{ color:C.muted }}>
                                {noteTime(n.created_at)}
                              </span>
                              {/* Pin toggle */}
                              {can('add_notes') && <button
                                onClick={() => togglePin(n.id, n.is_pinned)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:opacity-70"
                                title={n.is_pinned ? 'Unpin' : 'Pin'}>
                                <Shield size={10} style={{ color: n.is_pinned ? cat.color : C.muted }} />
                              </button>}
                              {/* Delete */}
                              {can('add_notes') && <button
                                onClick={() => deleteNote(n.id)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:opacity-70">
                                <X size={10} style={{ color:C.muted }} />
                              </button>}
                            </div>
                          </div>
                          {/* Note content */}
                          <p className="text-[12px] leading-relaxed" style={{ color:C.text }}>
                            {n.content}
                          </p>
                          {/* Footer: author */}
                          <p className="text-[10px] mt-1.5" style={{ color:C.muted }}>
                            by {n.admin_name}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          </>)}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (<>

          {/* Referral Source */}
          {(() => {
            const ref = user.referral_source
            const SOURCES: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
              google:    { label: 'Google',    Icon: Search,      color: '#1d70f5', bg: '#EFF6FF' },
              affiliate: { label: 'Affiliate', Icon: Link2,       color: C.limeDeep, bg: C.limeTint },
              twitter:   { label: 'Twitter/X', Icon: AtSign,      color: '#1d9bf0', bg: '#EFF6FF' },
              facebook:  { label: 'Facebook',  Icon: Users,       color: '#1877F2', bg: '#EFF6FF' },
              instagram: { label: 'Instagram', Icon: Camera,      color: '#e11d48', bg: '#FFF1F2' },
              youtube:   { label: 'YouTube',   Icon: PlayCircle,  color: '#ef4444', bg: '#FEF2F2' },
              direct:    { label: 'Direct',    Icon: Globe,       color: C.muted,   bg: C.bg      },
              email:     { label: 'Email',     Icon: Mail,        color: C.amber,   bg: '#FFFBEB' },
            }
            const src    = ref?.source ?? 'unknown'
            const cfg    = SOURCES[src] ?? { label: 'Unknown', Icon: HelpCircle, color: C.muted, bg: C.bg }
            const refCode= ref?.ref ?? null
            const medium = ref?.medium ?? null

            async function saveReferral() {
              setSavingRef(true)
              try {
                const val = { source: refSource, ref: refNote || null, medium: null, updated_by: 'admin' }
                await (supabase.from('profiles') as any)
                  .update({ referral_source: val })
                  .eq('id', user.id)
                onUpdated(user.id, 'referral_source', val)
                showToast('Referral source updated', 'success')
                setEditingRef(false)
              } catch { showToast('Failed to update', 'error') }
              setSavingRef(false)
            }

            return (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <SectionLabel text="REFERRAL SOURCE" />
                  <button onClick={() => setEditingRef(s => !s)}
                    className="text-[10px] font-bold mb-3 hover:opacity-70"
                    style={{ color: C.limeDeep }}>
                    {editingRef ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editingRef ? (
                  <div className="flex flex-col gap-2 p-3.5 rounded-xl border"
                       style={{ borderColor: C.border, backgroundColor: C.bg }}>
                    <select value={refSource} onChange={e => setRefSource(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}>
                      {Object.entries(SOURCES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                      <option value="unknown">Unknown</option>
                    </select>
                    <input value={refNote} onChange={e => setRefNote(e.target.value)}
                      placeholder="Affiliate code or campaign (optional)"
                      className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none"
                      style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }} />
                    <button onClick={saveReferral} disabled={savingRef}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-bold"
                      style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                      {savingRef
                        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                        : <><Check size={11} /> Save</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border"
                       style={{ borderColor: cfg.color + '40', backgroundColor: cfg.bg }}>
                    <cfg.Icon size={18} style={{ color: cfg.color, flexShrink: 0 }} />
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: cfg.color }}>
                        {cfg.label}
                        {medium ? ` · ${medium}` : ''}
                      </p>
                      {refCode && (
                        <p className="text-[10px] font-mono" style={{ color: C.muted }}>
                          ref: {refCode}
                        </p>
                      )}
                      {!ref && (
                        <p className="text-[10px]" style={{ color: C.muted }}>
                          Signed up before tracking · click Edit to set manually
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* System metadata */}
          <SectionLabel text="SYSTEM METADATA" />
          <div className="flex flex-col gap-2 mb-6">
            {[
              { label:'Display ID',   value: user.display_id ?? '—',  copy:true  },
              { label:'Account UUID', value: user.id ?? '—',          copy:true  },
              { label:'Last IP',      value: user.last_login_ip ?? '—',copy:false },
              { label:'Platform',     value: user.device_platform ?? '—',copy:false},
            ].map(({ label, value, copy }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-[11px]" style={{ color:C.muted }}>{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold font-mono" style={{ color:C.text, maxWidth:160 }} title={value}>
                    {value.length > 20 ? value.slice(0,18) + '…' : value}
                  </span>
                  {copy && <button onClick={() => navigator.clipboard.writeText(value)}><Copy size={11} style={{ color:C.muted }} /></button>}
                </div>
              </div>
            ))}
          </div>

          {/* User Journey Timeline */}
          <SectionLabel text="USER JOURNEY TIMELINE" />
          {loadingData ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                   style={{ borderTopColor: C.limeDeep }} />
            </div>
          ) : journey.length === 0 ? (
            <p className="text-center py-4 text-[12px] mb-6" style={{ color: C.muted }}>
              No journey events recorded yet
            </p>
          ) : (
            <div className="relative mb-6">
              {/* Vertical line */}
              <div className="absolute left-[17px] top-2 bottom-2 w-px"
                   style={{ backgroundColor: C.border }} />
              <div className="flex flex-col gap-0">
                {journey.map((ev: any, i: number) => {
                  // Event config
                  const cfg: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
                    signup:           { Icon: UserPlus,      color: C.limeDeep, bg: C.limeTint  },
                    email_verified:   { Icon: CheckCircle,   color: C.green,    bg: '#F0FDF4'   },
                    ebay_connected:   { Icon: Wifi,          color: '#1d70f5',  bg: '#EFF6FF'   },
                    ebay_disconnected:{ Icon: WifiOff,       color: C.red,      bg: '#FEF2F2'   },
                    plan_upgraded:    { Icon: TrendingUp,    color: C.limeDeep, bg: C.limeTint  },
                    plan_downgraded:  { Icon: TrendingDown,  color: C.amber,    bg: '#FFFBEB'   },
                    trial_expired:    { Icon: XCircle,       color: C.red,      bg: '#FEF2F2'   },
                    trial_started:    { Icon: Clock,         color: C.amber,    bg: '#FFFBEB'   },
                    tool_first_use:   { Icon: Zap,           color: '#8b5cf6',  bg: '#F5F3FF'   },
                    force_logout:     { Icon: Lock,          color: C.amber,    bg: '#FFFBEB'   },
                    device_revoked:   { Icon: Smartphone,    color: C.red,      bg: '#FEF2F2'   },
                    dispute_opened:   { Icon: AlertTriangle, color: C.red,      bg: '#FEF2F2'   },
                    dispute_resolved: { Icon: CheckCircle,   color: C.green,    bg: '#F0FDF4'   },
                    milestone:        { Icon: Award,         color: '#d97706',  bg: '#FFFBEB'   },
                    admin_impersonation: { Icon: Users,      color: '#8b5cf6',  bg: '#F5F3FF'   },
                    account_suspended:   { Icon: Lock,       color: '#c2410c',  bg: '#FFF7ED'   },
                    account_reactivated: { Icon: CheckCircle,color: C.green,    bg: '#F0FDF4'   },
                    account_banned:      { Icon: XCircle,    color: '#7f1d1d',  bg: '#FEF2F2'   },
                    admin_email_sent:    { Icon: Mail,       color: '#1d70f5',  bg: '#EFF6FF'   },
                  }
                  const e    = cfg[ev.event_type] ?? { Icon: Shield, color: C.muted, bg: C.bg }
                  const date = new Date(ev.created_at)
                  const CfgIcon = e.Icon

                  // Days from signup (first event)
                  const signupDate  = journey[0]?.created_at
                    ? new Date(journey[0].created_at) : date
                  const dayNum      = Math.max(0, Math.floor(
                    (date.getTime() - signupDate.getTime()) / 86400000
                  ))
                  const dateLabel   = date.toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })

                  return (
                    <div key={ev.id ?? i} className="flex items-start gap-3 pb-4 relative">
                      {/* Icon dot */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10"
                           style={{ backgroundColor: e.bg, border: `1.5px solid ${e.color}40` }}>
                        <CfgIcon size={15} style={{ color: e.color }} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 pt-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] font-bold leading-tight"
                             style={{ color: e.color }}>{ev.event_title}</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: e.bg, color: e.color }}>
                            Day {dayNum}
                          </span>
                        </div>
                        {ev.event_desc && (
                          <p className="text-[10px] mt-0.5 leading-snug"
                             style={{ color: C.muted }}>{ev.event_desc}</p>
                        )}
                        <p className="text-[10px] mt-1" style={{ color: C.muted }}>
                          {dateLabel}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="h-px mb-5" style={{ backgroundColor: C.border }} />

          {/* Impersonate User */}
          {(() => {

            async function handleImpersonate() {
              setImpersonating(true)
              try {
                const { data: { session } } = await supabase.auth.getSession()
                const res  = await fetch('/api/admin/impersonate', {
                  method:  'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                  },
                  body: JSON.stringify({ userId: user.id }),
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json.error)

                // Open magic link in a new tab — admin session stays intact
                window.open(json.magicLink, '_blank')
                setShowWarning(false)
                showToast(`Viewing as ${json.userName} in new tab`, 'info')
              } catch (e: any) {
                showToast(e.message ?? 'Failed to impersonate', 'error')
              }
              setImpersonating(false)
            }

            const isSuspended = currentStatus === 'Suspended'
            const isBanned    = currentStatus === 'Banned'
            const canImpersonate = !isBanned

            return (
              <div className="mb-5">
                <SectionLabel text="IMPERSONATE USER" />
                <div className="p-4 rounded-xl border"
                     style={{ borderColor: C.border, backgroundColor: C.bg }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                         style={{ backgroundColor: '#F5F3FF' }}>
                      <Users size={16} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: C.text }}>
                        Login as {name}
                      </p>
                      <p className="text-[11px]" style={{ color: C.muted }}>
                        Opens a new tab logged in as this user.
                        Their session is untouched.
                      </p>
                    </div>
                  </div>

                  {canImpersonate ? (
                    !showWarning ? (
                      <button onClick={() => setShowWarning(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold hover:opacity-80 border"
                        style={{ borderColor:'#c4b5fd', color:'#8b5cf6', backgroundColor:'#F5F3FF' }}>
                        <Users size={14} /> Login as User
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                             style={{ backgroundColor:'#FFFBEB', border:`1px solid #fde68a` }}>
                          <AlertTriangle size={12} style={{ color:C.amber, flexShrink:0 }} />
                          <p className="text-[11px]" style={{ color:'#92400e' }}>
                            You will open a new tab logged in as {name}. Close it when done.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowWarning(false)}
                            className="flex-1 py-2 rounded-xl border text-[12px] font-semibold"
                            style={{ borderColor:C.border, color:C.muted }}>
                            Cancel
                          </button>
                          {can('impersonate_user') && <button onClick={handleImpersonate} disabled={impersonating}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold disabled:opacity-50"
                            style={{ backgroundColor:'#8b5cf6', color:'#fff' }}>
                            {impersonating
                              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                                     style={{ borderTopColor:'#fff' }} />
                              : <><Users size={12} /> Open New Tab</>}
                          </button>}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                         style={{ backgroundColor:'#FEF2F2', border:`1px solid #fca5a5` }}>
                      <XCircle size={12} style={{ color:C.red, flexShrink:0 }} />
                      <p className="text-[11px]" style={{ color:C.red }}>
                        Cannot impersonate a banned account
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Account Control */}
          {(() => {
            const isSuspended = currentStatus === 'Suspended'
            const isBanned    = currentStatus === 'Banned'
            const isActive    = !isSuspended && !isBanned

            async function callSuspend(action: 'suspend'|'reactivate'|'ban') {
              setSuspending(true)
              try {
                const { data:{ session } } = await supabase.auth.getSession()
                const res = await fetch('/api/admin/suspend-user', {
                  method:  'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                  },
                  body: JSON.stringify({ userId: user.id, action }),
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json.error)
                const newStatus = action === 'suspend' ? 'Suspended' : action === 'ban' ? 'Banned' : 'Active'
                setCurrentStatus(newStatus)
                onUpdated(user.id, 'account_status', newStatus)
                setConfirmSuspend(false)
                setConfirmBan(false)
                setBanText('')
                showToast(json.message, 'success')
              } catch(e: any) { showToast(e.message ?? 'Action failed', 'error') }
              setSuspending(false)
            }

            return (
              <div className="mb-5">
                <SectionLabel text="ACCOUNT CONTROL" />

                {/* Current status indicator */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border mb-3"
                     style={{
                       backgroundColor: isBanned ? '#FEF2F2' : isSuspended ? '#FFF7ED' : '#F0FDF4',
                       borderColor:     isBanned ? '#fca5a5' : isSuspended ? '#fdba74'  : '#86efac',
                     }}>
                  <div>
                    <p className="text-[12px] font-bold"
                       style={{ color: isBanned ? '#7f1d1d' : isSuspended ? '#c2410c' : C.green }}>
                      {isBanned ? 'Permanently Banned' : isSuspended ? 'Account Suspended' : 'Account Active'}
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {isBanned    ? 'User cannot login. Requires manual admin lift.' :
                       isSuspended ? 'User is blocked from login. You can reactivate.' :
                                     'User has full access to Riazify.'}
                    </p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full"
                       style={{ backgroundColor: isBanned ? '#7f1d1d' : isSuspended ? '#f97316' : C.green }} />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {/* Reactivate suspended */}
                  {isSuspended && (
                    <button onClick={() => callSuspend('reactivate')} disabled={suspending}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor:'#F0FDF4', color:C.green, border:`1px solid #86efac` }}>
                      {suspending
                        ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.green }} />
                        : <><CheckCircle size={14} /> Reactivate Account</>}
                    </button>
                  )}
                  {/* Lift permanent ban */}
                  {isBanned && (
                    <div className="flex flex-col gap-2 p-3.5 rounded-xl border"
                         style={{ borderColor:'#fca5a5', backgroundColor:'#FEF2F2' }}>
                      <p className="text-[11px] font-bold" style={{ color:'#7f1d1d' }}>
                        Lift permanent ban? Type UNBAN to confirm.
                      </p>
                      <input
                        value={banText} onChange={e => setBanText(e.target.value.toUpperCase())}
                        placeholder="Type UNBAN"
                        className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none"
                        style={{ borderColor:'#fca5a5', backgroundColor:'#fff' }} />
                      <button onClick={() => callSuspend('reactivate')}
                        disabled={banText !== 'UNBAN' || suspending}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
                        style={{ backgroundColor:'#F0FDF4', color:C.green, border:`1px solid #86efac` }}>
                        {suspending
                          ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.green }} />
                          : <><CheckCircle size={14} /> Lift Ban & Reactivate</>}
                      </button>
                    </div>
                  )}
                  {/* Suspend active */}
                  {isActive && can('suspend_user') && (
                    <button onClick={() => setConfirmSuspend(true)} disabled={suspending}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold hover:opacity-80 disabled:opacity-50 border"
                      style={{ borderColor:'#fdba74', color:'#c2410c', backgroundColor:'#FFF7ED' }}>
                      <Lock size={14} /> Suspend Account
                    </button>
                  )}
                  {/* Permanent ban (only for non-banned) */}
                  {!isBanned && can('suspend_user') && (
                    <button onClick={() => { setBanText(''); setConfirmBan(true) }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold hover:opacity-80 border"
                      style={{ borderColor:'#fca5a5', color:'#7f1d1d', backgroundColor:'#FEF2F2' }}>
                      <XCircle size={14} /> Permanently Ban
                    </button>
                  )}
                </div>

                {/* Confirm Suspend */}
                {confirmSuspend && (
                  <div className="mt-3 p-4 rounded-xl border" style={{ borderColor:'#fdba74', backgroundColor:'#FFF7ED' }}>
                    <p className="text-[13px] font-bold mb-1" style={{ color:'#c2410c' }}>
                      Suspend {name}?
                    </p>
                    <p className="text-[11px] mb-3" style={{ color:C.muted }}>
                      They will be immediately logged out and blocked from logging in. You can reactivate at any time.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmSuspend(false)}
                        className="flex-1 py-2 rounded-xl border text-[12px] font-semibold"
                        style={{ borderColor:C.border, color:C.muted }}>Cancel</button>
                      <button onClick={() => callSuspend('suspend')} disabled={suspending}
                        className="flex-1 py-2 rounded-xl text-[12px] font-bold"
                        style={{ backgroundColor:'#c2410c', color:'#fff' }}>
                        {suspending ? 'Suspending...' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Ban */}
                {confirmBan && (
                  <div className="mt-3 p-4 rounded-xl border" style={{ borderColor:'#fca5a5', backgroundColor:'#FEF2F2' }}>
                    <p className="text-[13px] font-bold mb-1" style={{ color:'#7f1d1d' }}>
                      Permanently ban {name}?
                    </p>
                    <p className="text-[11px] mb-3" style={{ color:C.muted }}>
                      This is a permanent action. Type BAN to confirm.
                    </p>
                    <input
                      value={banText} onChange={e => setBanText(e.target.value.toUpperCase())}
                      placeholder="Type BAN to confirm"
                      className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none mb-2"
                      style={{ borderColor:'#fca5a5', backgroundColor:'#fff' }} />
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmBan(false)}
                        className="flex-1 py-2 rounded-xl border text-[12px] font-semibold"
                        style={{ borderColor:C.border, color:C.muted }}>Cancel</button>
                      <button onClick={() => callSuspend('ban')} disabled={banText !== 'BAN' || suspending}
                        className="flex-1 py-2 rounded-xl text-[12px] font-bold disabled:opacity-40"
                        style={{ backgroundColor:'#7f1d1d', color:'#fff' }}>
                        {suspending ? 'Banning...' : 'Permanently Ban'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="h-px mb-5" style={{ backgroundColor: C.border }} />
          <SectionLabel text="DANGER ZONE" danger />
          {can('delete_user') && <button onClick={() => { setDeleteText(''); setConfirmDelete(true) }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold hover:opacity-80"
            style={{ borderColor:'rgba(185,28,28,0.3)', color:C.red, backgroundColor:'rgba(185,28,28,0.03)' }}>
            <Trash2 size={14} /> Delete User Account
          </button>}
          </>)}
        </div>
      </div>

      {/* Confirm: Force Logout */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
             style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setConfirmLogout(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border" style={{ borderColor:C.border }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(217,119,6,0.1)' }}>
                <LogOut size={17} style={{ color:C.amber }} />
              </div>
              <p className="text-[15px] font-bold" style={{ color:C.text }}>Force Logout</p>
            </div>
            <p className="text-[13px] mb-5" style={{ color:C.muted }}>
              This will immediately sign <strong>{name}</strong> out of all devices and sessions.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                style={{ borderColor:C.border, color:C.muted }}>Cancel</button>
              <button onClick={forceLogout} disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
                style={{ backgroundColor:C.amber, color:'#fff' }}>
                {loggingOut ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:'#fff' }} /> : 'Force Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm: Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
             style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
             onClick={e => e.target === e.currentTarget && setConfirmDelete(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border" style={{ borderColor:'#FECACA' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor:'rgba(185,28,28,0.1)' }}>
                <Trash2 size={17} style={{ color:C.red }} />
              </div>
              <p className="text-[15px] font-bold" style={{ color:C.red }}>Delete User Forever</p>
            </div>
            <p className="text-[13px] mb-3" style={{ color:C.muted }}>
              Permanently deletes <strong>{name}</strong> and all their data. This cannot be undone.
            </p>
            <p className="text-[12px] font-bold mb-2" style={{ color:C.text }}>
              Type <code style={{ backgroundColor:C.bg, padding:'1px 5px', borderRadius:4, fontFamily:'monospace' }}>DELETE</code> to confirm:
            </p>
            <input value={deleteText} onChange={e => setDeleteText(e.target.value)}
              placeholder="DELETE" autoFocus
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none mb-4"
              style={{ fontFamily:'monospace', backgroundColor:C.bg,
                       borderColor: deleteText === 'DELETE' ? C.red : C.border, color:C.text }} />
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
                style={{ borderColor:C.border, color:C.muted }}>Cancel</button>
              <button onClick={deleteUser} disabled={deleteText !== 'DELETE' || deleting}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ backgroundColor:C.red, color:'#fff' }}>
                {deleting ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:'#fff' }} /> : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ADD USER DIALOG
// ══════════════════════════════════════════════════════════════
