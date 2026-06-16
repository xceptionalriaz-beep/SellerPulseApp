'use client'
// components/admin/PersistentSidebar.tsx
// Updated: all 5 widgets wired to real Supabase data

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  TrendingUp, TrendingDown, AlertTriangle, CreditCard,
  Settings, UserPlus, Send, Minus, RefreshCw,
  ArrowUpCircle, Shield, Zap, Bug,
} from 'lucide-react'

interface Props { investorMode: boolean }

// ── Design tokens ──────────────────────────────────────────────
const C = {
  dark:   '#0F172A',
  lime:   '#8FFF00',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  text:   '#0F172A',
  muted:  '#64748B',
  hint:   '#94A3B8',
}

const BROADCAST_TARGETS = [
  'All Users', 'Starter', 'Free', 'Growth',
  'Orders Tool Users', 'Profit Calc Users', 'Title Builder Users',
]

// ── Time ago helper ────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000)    return 'Just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

// ── Initials helper ────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.length >= 2 ? name.substring(0, 2).toUpperCase() : (name || 'U').toUpperCase()
}

// ── Map notification type → icon + color ──────────────────────
function getActivityMeta(type: string) {
  switch (type) {
    case 'new_user':       return { Icon: UserPlus,      color: '#8B5CF6' }
    case 'payment_failed': return { Icon: CreditCard,    color: '#F87171' }
    case 'api_limit':      return { Icon: AlertTriangle, color: '#FB923C' }
    case 'high_risk_order':return { Icon: Shield,        color: '#F87171' }
    case 'new_ticket':     return { Icon: AlertTriangle, color: '#FB923C' }
    case 'kill_switch':    return { Icon: Zap,           color: '#F87171' }
    case 'tool_spike':     return { Icon: TrendingUp,    color: '#60A5FA' }
    case 'new_bug':        return { Icon: Bug,           color: '#F87171' }
    default:               return { Icon: Settings,      color: '#60A5FA' }
  }
}

// ── Obscure text for investor mode ─────────────────────────────
function obscureText(text: string): string {
  return text ? `${text[0]}***` : '***'
}

// ── Sidebar card ───────────────────────────────────────────────
function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full p-3.5 rounded-2xl border"
         style={{ backgroundColor: '#fff', borderColor: C.border }}>
      {children}
    </div>
  )
}

// ── Sidebar title ──────────────────────────────────────────────
function SidebarTitle({ title, color, dark = false }: {
  title: string; color: string; dark?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-0.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12px] font-bold" style={{ color: dark ? '#fff' : C.text }}>{title}</span>
    </div>
  )
}

// ── Stat row ───────────────────────────────────────────────────
function StatRow({ value, label, dotColor, valueColor }: {
  value: string; label: string; dotColor: string; valueColor: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      <span className="text-[13px] font-extrabold" style={{ color: valueColor }}>{value}</span>
      <span className="text-[10px]" style={{ color: C.muted }}>{label}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function PersistentSidebar({ investorMode }: Props) {
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────
  const [broadcastTarget, setBroadcastTarget] = useState('All Users')
  const [broadcastMsg,    setBroadcastMsg]    = useState('')
  const [isSending,       setIsSending]       = useState(false)
  const [sendSuccess,     setSendSuccess]     = useState(false)

  // Quick stats
  const [onlineNow,    setOnlineNow]    = useState(0)
  const [signupsToday, setSignupsToday] = useState(0)
  const [revToday,     setRevToday]     = useState(0)

  // Tickets
  const [openTickets,  setOpenTickets]  = useState(0)
  const [bugReports,   setBugReports]   = useState(0)
  const [newTickets,   setNewTickets]   = useState(0)
  const [bugChange,    setBugChange]    = useState(0)

  // Team
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  // Activity feed
  const [activityFeed, setActivityFeed] = useState<any[]>([])

  // Loading
  const [loading, setLoading] = useState(true)

  // ── Load all real data ─────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      await Promise.all([
        loadQuickStats(),
        loadTickets(),
        loadTeam(),
        loadActivity(),
      ])
    } catch (e) { console.error('Sidebar load error:', e) }
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── 1. Quick Stats ─────────────────────────────────────────
  async function loadQuickStats() {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('created_at, last_seen')

    const all = (profiles ?? []) as any[]

    // MRR + rev today from subscriptions table
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('amount, status, paid_at')

    const allSubs = (subs ?? []) as any[]

    const mrr = allSubs
      .filter((s: any) => s.status === 'active')
      .reduce((sum: number, s: any) => sum + (Number(s.amount) ?? 0), 0)

    // Rev today — real payments where paid_at >= today midnight
    const todayMidnight = new Date()
    todayMidnight.setHours(0, 0, 0, 0)
    const rev = allSubs
      .filter((s: any) =>
        s.paid_at && new Date(s.paid_at) >= todayMidnight
      )
      .reduce((sum: number, s: any) => sum + (Number(s.amount) ?? 0), 0)

    // Online now (last_seen within 5 mins)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const online = all.filter((p: any) =>
      p.last_seen && p.last_seen > fiveMinAgo
    ).length

    // Signups today
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const signups = all.filter((p: any) =>
      p.created_at && new Date(p.created_at) >= todayStart
    ).length

    setOnlineNow(online)
    setSignupsToday(signups)
    setRevToday(rev)
  }

  // ── 2. Tickets & Bugs ──────────────────────────────────────
  async function loadTickets() {
    const { data } = await supabase
      .from('tickets')
      .select('type, status, created_at')

    const all = (data ?? []) as any[]
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

    const open    = all.filter(t => t.status === 'open' && t.type !== 'bug').length
    const bugs    = all.filter(t => t.status === 'open' && t.type === 'bug').length
    const todayT  = all.filter(t =>
      t.type !== 'bug' && new Date(t.created_at) >= todayStart
    ).length
    const todayB  = all.filter(t =>
      t.type === 'bug' && new Date(t.created_at) >= todayStart
    ).length

    setOpenTickets(open)
    setBugReports(bugs)
    setNewTickets(todayT)
    setBugChange(todayB)
  }

  // ── 3. Team Online ─────────────────────────────────────────
  async function loadTeam() {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, role, last_seen')
      .eq('role', 'admin')

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const members = (data ?? []).map((p: any) => {
      const name = p.name?.trim() || p.email?.split('@')[0] || 'Admin'
      return {
        name,
        role:     'Admin',
        initials: getInitials(name),
        online:   p.last_seen ? p.last_seen > fiveMinAgo : false,
      }
    })

    // Sort: online first
    members.sort((a: any, b: any) => (b.online ? 1 : 0) - (a.online ? 1 : 0))
    setTeamMembers(members)
  }

  // ── 4. Activity Feed ───────────────────────────────────────
  async function loadActivity() {
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    setActivityFeed((data ?? []) as any[])
  }

  // ── 5. Send Broadcast ──────────────────────────────────────
  async function sendBroadcast() {
    if (!broadcastMsg.trim()) return
    setIsSending(true)
    setSendSuccess(false)

    try {
      // Get all target users
      let query = supabase.from('profiles').select('id, plan_name')

      const { data: users } = await query
      const allUsers = (users ?? []) as any[]

      // Filter by target segment
      const targets = allUsers.filter((u: any) => {
        if (broadcastTarget === 'All Users') return true
        const plan = (u.plan_name ?? '').toLowerCase()
        if (broadcastTarget === 'Starter')       return plan.includes('pro')
        if (broadcastTarget === 'Free')     return plan.includes('free')
        if (broadcastTarget === 'Growth')     return plan.includes('elite')
        return true
      })

      if (targets.length === 0) {
        setIsSending(false)
        return
      }

      // Insert notification for each target user
      const inserts = targets.map((u: any) => ({
        user_id:  u.id,
        type:     'broadcast',
        title:    `📢 Admin Broadcast`,
        message:  broadcastMsg.trim(),
        is_read:  false,
      }))

      await (supabase.from('admin_notifications') as any).insert(inserts)

      setBroadcastMsg('')
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 3000)
      await loadActivity()
    } catch (e) {
      console.error('Broadcast error:', e)
    }
    setIsSending(false)
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {/* ── 1. QUICK STATS ── */}
      <SidebarCard>
        <div className="flex items-center justify-between mb-2.5">
          <SidebarTitle title="Quick Stats" color={C.lime} />
          <button onClick={loadAll}>
            <RefreshCw size={11} style={{ color: C.hint }} />
          </button>
        </div>
        {loading ? (
          <div className="flex flex-col gap-1.5">
            {[1,2,3].map(i => (
              <div key={i} className="h-4 rounded animate-pulse"
                   style={{ backgroundColor: C.border, width: i === 2 ? '60%' : '75%' }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <StatRow
              value={String(onlineNow)}
              label="online now"
              dotColor={C.lime}
              valueColor="#4A8F00"
            />
            <StatRow
              value={String(signupsToday)}
              label="signups today"
              dotColor="#60A5FA"
              valueColor="#185FA5"
            />
            <StatRow
              value={`$${revToday}`}
              label="rev today"
              dotColor="#FBBF24"
              valueColor="#854F0B"
            />
          </div>
        )}
      </SidebarCard>

      {/* ── 2. GLOBAL BROADCAST ── */}
      <div className="p-3.5 rounded-2xl border"
           style={{ backgroundColor: C.dark, borderColor: 'rgba(143,255,0,0.2)' }}>
        <SidebarTitle title="Global Broadcast" color={C.lime} dark />
        <div className="flex flex-col gap-2 mt-2.5">
          {/* Target dropdown */}
          <div className="px-2.5 py-1 rounded-lg border"
               style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(143,255,0,0.2)' }}>
            <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)}
              className="w-full text-[11px] font-medium bg-transparent outline-none"
              style={{ color: '#fff' }}>
              {BROADCAST_TARGETS.map(t => (
                <option key={t} value={t} style={{ backgroundColor: '#1E293B' }}>{t}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <textarea rows={3} value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            className="w-full rounded-lg p-2.5 text-[12px] resize-none outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(143,255,0,0.15)',
              color: '#fff',
            }}
            placeholder="Type a message..." />

          {/* Send button */}
          <button onClick={sendBroadcast} disabled={isSending || !broadcastMsg.trim()}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all"
            style={{
              backgroundColor: sendSuccess ? '#16A34A' : C.lime,
              color: '#0F172A',
              opacity: (!broadcastMsg.trim() && !isSending) ? 0.6 : 1,
            }}>
            {isSending ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                   style={{ borderTopColor: '#0F172A' }} />
            ) : sendSuccess ? (
              '✅ Sent!'
            ) : (
              <>
                <Send size={12} />
                Push to {broadcastTarget}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 3. TICKETS + BUGS ── */}
      <SidebarCard>
        <SidebarTitle title="Tickets & Bugs" color="#F87171" />
        {loading ? (
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            {[1,2].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse"
                   style={{ backgroundColor: C.border }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            {/* Open tickets */}
            <div className="flex flex-col items-center p-2.5 rounded-xl border"
                 style={{ backgroundColor: '#FEF2F2', borderColor: '#FFCDD2' }}>
              <span className="text-[22px] font-extrabold" style={{ color: '#F87171' }}>
                {openTickets}
              </span>
              <span className="text-[9px] font-semibold text-center" style={{ color: '#F87171' }}>
                Open Tickets
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {newTickets > 0
                  ? <TrendingUp size={9} style={{ color: '#F87171' }} />
                  : <Minus      size={9} style={{ color: '#F87171' }} />}
                <span className="text-[8px]" style={{ color: '#9CA3AF' }}>
                  {newTickets > 0 ? `+${newTickets} today` : 'No change'}
                </span>
              </div>
            </div>
            {/* Bug reports */}
            <div className="flex flex-col items-center p-2.5 rounded-xl border"
                 style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
              <span className="text-[22px] font-extrabold" style={{ color: '#FB923C' }}>
                {bugReports}
              </span>
              <span className="text-[9px] font-semibold text-center" style={{ color: '#FB923C' }}>
                Bug Reports
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {bugChange > 0
                  ? <TrendingUp size={9} style={{ color: '#FB923C' }} />
                  : <Minus      size={9} style={{ color: '#FB923C' }} />}
                <span className="text-[8px]" style={{ color: '#9CA3AF' }}>
                  {bugChange > 0 ? `+${bugChange} today` : 'No change'}
                </span>
              </div>
            </div>
          </div>
        )}
      </SidebarCard>

      {/* ── 4. TEAM ONLINE ── */}
      <SidebarCard>
        <div className="flex items-center justify-between">
          <SidebarTitle title="Team Online" color={C.lime} />
          <div className="px-1.5 py-0.5 rounded-full border text-[9px] font-bold"
               style={{
                 backgroundColor: 'rgba(143,255,0,0.12)',
                 borderColor: 'rgba(143,255,0,0.3)',
                 color: '#4A8F00',
               }}>
            {teamMembers.filter(m => m.online).length} active
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 mt-2.5">
            {[1,2].map(i => (
              <div key={i} className="h-8 rounded-lg animate-pulse"
                   style={{ backgroundColor: C.border }} />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <p className="text-[11px] mt-2.5 text-center" style={{ color: C.hint }}>
            No team members found
          </p>
        ) : (
          <div className="flex flex-col gap-2 mt-2.5">
            {teamMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ backgroundColor: m.online ? C.dark : '#F1F5F9' }}>
                    <span className="text-[10px] font-extrabold"
                          style={{ color: m.online ? C.lime : C.hint }}>
                      {m.initials}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px] border-white"
                       style={{ backgroundColor: m.online ? C.lime : '#CBD5E1' }} />
                </div>
                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate"
                     style={{ color: m.online ? C.text : C.hint }}>
                    {investorMode ? obscureText(m.name) : m.name}
                  </p>
                  <p className="text-[9px]" style={{ color: C.hint }}>{m.role}</p>
                </div>
                {/* Status badge */}
                <div className="px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                     style={{
                       backgroundColor: m.online ? 'rgba(143,255,0,0.10)' : '#F1F5F9',
                       color: m.online ? '#4A8F00' : C.hint,
                     }}>
                  {m.online ? 'Active' : 'Offline'}
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarCard>

      {/* ── 5. LIVE ACTIVITY FEED ── */}
      <SidebarCard>
        <div className="flex items-center justify-between">
          <SidebarTitle title="Live Activity" color={C.lime} />
          <div className="w-1.5 h-1.5 rounded-full animate-pulse"
               style={{ backgroundColor: C.lime }} />
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5 mt-2.5">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 rounded-lg animate-pulse"
                   style={{ backgroundColor: C.border }} />
            ))}
          </div>
        ) : activityFeed.length === 0 ? (
          <div className="flex flex-col items-center py-5">
            <p className="text-[11px]" style={{ color: C.hint }}>No activity yet</p>
            <p className="text-[10px] mt-1" style={{ color: C.hint }}>
              Events will appear here in real-time
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-2.5">
            {activityFeed.map((a, i) => {
              const { Icon, color } = getActivityMeta(a.type ?? '')
              const text = a.message ?? a.title ?? 'System event'
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                       style={{ backgroundColor: color + '1A' }}>
                    <Icon size={11} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] leading-snug" style={{ color: C.text }}>
                      {investorMode ? obscureText(text) : text}
                    </p>
                    <p className="text-[9px]" style={{ color: C.hint }}>
                      {a.created_at ? timeAgo(a.created_at) : 'Just now'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SidebarCard>

    </div>
  )
}