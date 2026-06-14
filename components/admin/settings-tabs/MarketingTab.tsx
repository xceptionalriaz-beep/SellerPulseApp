'use client'
// components/admin/settings-tabs/MarketingTab.tsx
// ─────────────────────────────────────────────────────────────
// Full marketing campaign center
// Navigated to from User CRM "Email All" button
// Section 1: Campaign Builder
// Section 2: Campaign History
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient }         from '@/lib/supabase'
import {
  Mail, Send, Users, TrendingUp, Clock,
  ChevronDown, Check, X, AlertTriangle,
  CheckCircle, Activity, Wrench, BarChart2,
  ArrowRight, History, Zap,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  lime:     '#8fff00', limeDeep: '#4a8f00', limeTint: '#f4ffe6',
  dark:     '#0a0d08', text:     '#1a2410', muted:    '#6b7280',
  border:   '#e8ede2', surface:  '#fafcf8', bg:       '#f7f9f5',
  red:      '#b91c1c', amber:    '#d97706', green:    '#16a34a',
}

// ── Templates ──────────────────────────────────────────────────
const TEMPLATES = [
  { key: 'trial_ending',  label: 'Trial Ending Reminder', subject: "Don't lose access, {name} — trial ends in {days_left} days", desc: 'Standard urgency — best for active users'    },
  { key: 'upgrade_offer', label: 'Special Upgrade Offer',  subject: '⚡ Exclusive offer for {name} — expires soon',              desc: 'Best paired with a promo code'               },
  { key: 'welcome_back',  label: 'We Miss You',            subject: 'Hey {name}, you used {most_used_tool} {usage_count} times', desc: 'For low-engagement users who never came back' },
]

const PRO_PRICE = 49

// ── Lead scoring ────────────────────────────────────────────────
function getLeadScore(u: any) {
  const ms    = u.last_seen ? Date.now() - new Date(u.last_seen).getTime() : Infinity
  const tools = Array.isArray(u.toolUsage) ? u.toolUsage.length : 0
  const usage = Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s: number, t: any) => s + (t.usage_count ?? 1), 0) : 0
  const score = (ms < 86400000 ? 40 : ms < 259200000 ? 20 : 0) + Math.min(tools * 10, 30) + Math.min(usage * 2, 20)
  if (score >= 60) return { tier: 'hot',  label: '🔥 HOT',  color: C.red,   bg: 'rgba(185,28,28,0.08)', score }
  if (score >= 25) return { tier: 'warm', label: '⚡ WARM', color: C.amber, bg: 'rgba(217,119,6,0.08)', score }
  return             { tier: 'cold', label: '❄️ COLD', color: C.muted, bg: C.bg,                   score }
}

function resolveTokens(text: string, u: any): string {
  const days    = u._days ?? 0
  const topTool = Array.isArray(u.toolUsage) && u.toolUsage.length > 0
    ? u.toolUsage.sort((a: any, b: any) => (b.usage_count ?? 0) - (a.usage_count ?? 0))[0]?.tool_name ?? 'Orders'
    : 'Orders'
  const usage   = Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s: number, t: any) => s + (t.usage_count ?? 1), 0) : 0
  const name    = u.name ?? u.email?.split('@')[0] ?? 'there'
  return text
    .replace(/\{name\}/g,           name)
    .replace(/\{days_left\}/g,      String(days))
    .replace(/\{most_used_tool\}/g, topTool)
    .replace(/\{usage_count\}/g,    String(usage))
}

function timeAgo(ts: string): string {
  const ms   = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 2)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function MarketingTab({ initialUsers = [] }: { initialUsers?: any[] }) {
  const supabase = createClient()

  const [view,          setView]          = useState<'builder' | 'history'>(initialUsers.length > 0 ? 'builder' : 'history')
  const [campaignUsers, setCampaignUsers] = useState<any[]>(initialUsers)
  const [history,       setHistory]       = useState<any[]>([])
  const [loadingHist,   setLoadingHist]   = useState(true)
  const [stats,         setStats]         = useState({ sent: 0, campaigns: 0, thisWeek: 0 })

  // Load campaign history
  useEffect(() => {
    async function load() {
      setLoadingHist(true)
      try {
        const { data } = await (supabase.from('sent_messages') as any)
          .select('*, profile:user_id(name, email)')
          .order('sent_at', { ascending: false })
          .limit(50)
        const rows = (data ?? []) as any[]
        setHistory(rows)

        const weekAgo    = new Date(Date.now() - 7 * 86400000)
        const thisWeek   = rows.filter(r => new Date(r.sent_at) >= weekAgo).length
        const campaigns  = new Set(rows.map(r => r.template_name)).size
        setStats({ sent: rows.length, campaigns, thisWeek })
      } catch {}
      setLoadingHist(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-black" style={{ color:C.dark }}>Marketing</h2>
          <p className="text-[13px] mt-0.5" style={{ color:C.muted }}>
            Send conversion campaigns · Track results
          </p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2">
          {[
            { label:'Emails Sent', value: stats.sent,      color: C.dark      },
            { label:'This Week',   value: stats.thisWeek,  color: C.limeDeep  },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center px-4 py-2 rounded-xl border"
                 style={{ borderColor:C.border, backgroundColor:'#fff' }}>
              <p className="text-[18px] font-black" style={{ color:s.color }}>{s.value}</p>
              <p className="text-[9px] font-bold" style={{ color:C.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
           style={{ backgroundColor:C.bg, border:`1px solid ${C.border}` }}>
        {[
          { key:'builder', label:'Campaign Builder', Icon:Send    },
          { key:'history', label:'Campaign History', Icon:History },
        ].map(t => {
          const active = view === t.key
          return (
            <button key={t.key} onClick={() => setView(t.key as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all"
              style={{
                backgroundColor: active ? C.dark  : 'transparent',
                color:           active ? C.lime  : C.muted,
              }}>
              <t.Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Views ── */}
      {view === 'builder' && (
        <CampaignBuilder
          users={campaignUsers}
          onLoadUsers={setCampaignUsers}
          supabase={supabase}
          onSent={() => { setView('history'); }}
        />
      )}

      {view === 'history' && (
        <CampaignHistory
          history={history}
          loading={loadingHist}
          onNewCampaign={() => setView('builder')}
        />
      )}

    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CAMPAIGN BUILDER
// ══════════════════════════════════════════════════════════════
function CampaignBuilder({ users, onLoadUsers, supabase, onSent }: {
  users:        any[]
  onLoadUsers:  (u: any[]) => void
  supabase:     any
  onSent:       () => void
}) {
  const [excluded,     setExcluded]     = useState<Set<string>>(new Set())
  const [templateKey,  setTemplateKey]  = useState('trial_ending')
  const [subjectLine,  setSubjectLine]  = useState(TEMPLATES[0].subject)
  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promoCode,    setPromoCode]    = useState('')
  const [customNote,   setCustomNote]   = useState('')
  const [sortBy,       setSortBy]       = useState<'score'|'urgent'|'active'>('score')
  const [previewUser,  setPreviewUser]  = useState<any>(null)
  const [lastContacted,setLastContacted]= useState<Record<string,string>>({})
  const [sending,      setSending]      = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [done,         setDone]         = useState(false)
  const [toast,        setToast]        = useState<{msg:string;ok:boolean}|null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  // Load expiring users if none provided
  useEffect(() => {
    if (users.length === 0) loadExpiringUsers()
    if (users.length > 0) loadLastContacted(users.map(u => u.id))
  }, [])

  async function loadExpiringUsers() {
    try {
      const { data } = await (supabase.from('profiles') as any)
        .select('*, toolUsage:user_tool_usage(tool_name, usage_count)')
        .in('account_status', ['Active'])
      const now = Date.now()
      const expiring = ((data ?? []) as any[]).filter(u => {
        if (!u.created_at) return false
        const plan = (u.plan_name ?? '').toLowerCase()
        if (!plan.includes('free')) return false
        const age  = (now - new Date(u.created_at).getTime()) / 86400000
        return age >= 11 && age <= 14
      }).map(u => ({
        ...u,
        _days: Math.max(0, Math.ceil(14 - (now - new Date(u.created_at).getTime()) / 86400000)),
      }))
      onLoadUsers(expiring)
      if (expiring.length > 0) loadLastContacted(expiring.map((u:any) => u.id))
    } catch {}
  }

  async function loadLastContacted(ids: string[]) {
    if (ids.length === 0) return
    try {
      const { data } = await (supabase.from('sent_messages') as any)
        .select('user_id, sent_at').in('user_id', ids).order('sent_at', { ascending: false })
      const map: Record<string,string> = {}
      for (const row of (data ?? []) as any[]) {
        if (!map[row.user_id]) map[row.user_id] = row.sent_at
      }
      setLastContacted(map)
    } catch {}
  }

  function selectTemplate(key: string) {
    setTemplateKey(key)
    const t = TEMPLATES.find(t => t.key === key)
    if (t) setSubjectLine(t.subject)
  }

  function toggleUser(id: string) {
    setExcluded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function insertToken(token: string) {
    setSubjectLine(s => s + ' ' + token)
  }

  function recentlyContacted(id: string) {
    const last = lastContacted[id]
    return last ? (Date.now() - new Date(last).getTime()) < 3 * 86400000 : false
  }

  // Enrich users
  const enriched = users.map(u => ({
    ...u,
    _days:       u._days ?? 0,
    _lead:       getLeadScore(u),
    _topTool:    Array.isArray(u.toolUsage) && u.toolUsage.length > 0
                   ? [...u.toolUsage].sort((a:any,b:any) => (b.usage_count??0)-(a.usage_count??0))[0]?.tool_name ?? '—'
                   : '—',
    _usageCount: Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s:number,t:any) => s+(t.usage_count??1),0) : 0,
    _lastSeenMs: u.last_seen ? Date.now() - new Date(u.last_seen).getTime() : Infinity,
  }))

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'score')  return b._lead.score - a._lead.score
    if (sortBy === 'urgent') return a._days - b._days
    return a._lastSeenMs - b._lastSeenMs
  })

  const toSend      = sorted.filter(u => !excluded.has(u.id))
  const sendCount   = toSend.length
  const recentCount = users.filter(u => recentlyContacted(u.id)).length
  const hotCount    = enriched.filter(u => u._lead.tier === 'hot').length
  const potConvert  = Math.round(sendCount * 0.40)
  const potMRR      = potConvert * PRO_PRICE
  const selectedTpl = TEMPLATES.find(t => t.key === templateKey) ?? TEMPLATES[0]

  async function sendCampaign() {
    if (sending || sendCount === 0) return
    setSending(true); setProgress(0); setDone(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let sent = 0
      for (const u of toSend) {
        await fetch('/api/admin/send-email', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.access_token}` },
          body: JSON.stringify({
            userId:      u.id,
            templateKey,
            customNote:  [
              promoEnabled && promoCode ? `Use code ${promoCode} for a special discount.` : '',
              customNote || `Your trial expires in ${u._days} day${u._days !== 1 ? 's' : ''}. Upgrade now.`,
            ].filter(Boolean).join(' '),
          }),
        })
        sent++; setProgress(sent)
      }
      setDone(true)
      showToast(`✅ ${sent} emails sent successfully!`)
      setTimeout(() => { setDone(false); setProgress(0); onSent() }, 2000)
    } catch { showToast('Failed to send', false) }
    setSending(false)
  }

  if (users.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
           style={{ backgroundColor:C.bg }}>
        <Mail size={24} style={{ color:C.muted }} />
      </div>
      <p className="text-[15px] font-bold" style={{ color:C.dark }}>No campaign loaded</p>
      <p className="text-[13px]" style={{ color:C.muted }}>
        Click "Email All" from the User CRM banner to start a campaign
      </p>
      <button onClick={loadExpiringUsers}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold mt-2"
        style={{ backgroundColor:C.dark, color:C.lime }}>
        <Zap size={14} /> Load Expiring Trials
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border:`1px solid ${toast.ok ? C.lime : '#fecaca'}` }}>
          {toast.ok
            ? <CheckCircle size={15} style={{ color:C.lime }} />
            : <AlertTriangle size={15} style={{ color:C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
        </div>
      )}

      {/* Campaign stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Recipients',    value:String(sendCount),   color:C.dark,     icon:Users      },
          { label:'🔥 Hot Leads', value:String(hotCount),    color:C.red,      icon:Zap        },
          { label:'Est. Convert',  value:`~${potConvert}`,   color:C.limeDeep, icon:TrendingUp  },
          { label:'Potential MRR', value:`+$${potMRR}`,      color:C.green,    icon:BarChart2  },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border"
                 style={{ borderColor:C.border, backgroundColor:'#fff' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor:C.bg }}>
                <Icon size={16} style={{ color:s.color }} />
              </div>
              <div>
                <p className="text-[20px] font-black leading-none" style={{ color:s.color }}>{s.value}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color:C.muted }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Warning */}
      {recentCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
             style={{ backgroundColor:'rgba(185,28,28,0.06)', borderColor:'rgba(185,28,28,0.2)' }}>
          <AlertTriangle size={16} style={{ color:C.red }} />
          <p className="text-[13px] font-semibold" style={{ color:C.red }}>
            {recentCount} user{recentCount !== 1 ? 's were' : ' was'} emailed in the last 3 days — consider excluding them below
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">

        {/* LEFT: Template + Subject + Promo + Note */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl border"
             style={{ borderColor:C.border, backgroundColor:'#fff' }}>

          <p className="text-[13px] font-black" style={{ color:C.dark }}>Email Settings</p>

          {/* Template */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color:C.muted }}>TEMPLATE</p>
            <div className="flex flex-col gap-1.5">
              {TEMPLATES.map(t => {
                const active = templateKey === t.key
                return (
                  <button key={t.key} onClick={() => selectTemplate(t.key)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                    style={{ borderColor: active ? C.lime : C.border, backgroundColor: active ? C.limeTint : 'transparent' }}>
                    <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                         style={{ borderColor: active ? C.limeDeep : C.border }}>
                      {active && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor:C.limeDeep }} />}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: active ? C.limeDeep : C.text }}>{t.label}</p>
                      <p className="text-[10px]" style={{ color:C.muted }}>{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color:C.muted }}>SUBJECT LINE</p>
            <input
              value={subjectLine}
              onChange={e => setSubjectLine(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border text-[12px] font-semibold outline-none"
              style={{ borderColor: subjectLine !== selectedTpl.subject ? C.lime : C.border, backgroundColor:'#fff', color:C.dark }}
            />
            {subjectLine !== selectedTpl.subject && (
              <button onClick={() => setSubjectLine(selectedTpl.subject)}
                className="text-[10px] font-bold mt-1" style={{ color:C.muted }}>
                ↺ Reset to default
              </button>
            )}
            {/* Tokens */}
            <div className="mt-2">
              <p className="text-[9px] font-bold mb-1" style={{ color:C.muted }}>INSERT TOKEN:</p>
              <div className="flex flex-wrap gap-1">
                {['{name}','{days_left}','{most_used_tool}','{usage_count}'].map(tok => (
                  <button key={tok} onClick={() => insertToken(tok)}
                    className="px-1.5 py-0.5 rounded border text-[10px] font-bold hover:opacity-70"
                    style={{ backgroundColor:C.limeTint, borderColor:C.lime, color:C.limeDeep }}>
                    {tok}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Promo code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black tracking-wider" style={{ color:C.muted }}>PROMO CODE</p>
              <div onClick={() => setPromoEnabled(s => !s)}
                   className="relative w-9 h-5 rounded-full cursor-pointer"
                   style={{ backgroundColor: promoEnabled ? C.dark : '#CBD5E1' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                     style={{ backgroundColor: promoEnabled ? C.lime : '#fff', left: promoEnabled ? '18px' : '2px' }} />
              </div>
            </div>
            {promoEnabled && (
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full h-9 px-3 rounded-xl border text-[12px] font-mono font-bold outline-none uppercase"
                style={{ borderColor: promoCode ? C.lime : C.border, backgroundColor: promoCode ? C.limeTint : '#fff', color:C.dark }}
              />
            )}
          </div>

          {/* Note */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color:C.muted }}>
              PERSONAL NOTE <span style={{ color:C.border }}>— optional</span>
            </p>
            <textarea
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Add a message appended to each email..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
              style={{ borderColor: customNote ? C.lime : C.border, color:C.dark, backgroundColor:'#fff' }}
            />
          </div>
        </div>

        {/* RIGHT: Recipients */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border"
             style={{ borderColor:C.border, backgroundColor:'#fff' }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-black" style={{ color:C.dark }}>
              Recipients <span style={{ color:C.muted, fontWeight:500 }}>({sendCount}/{users.length})</span>
            </p>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border outline-none"
                style={{ borderColor:C.border, color:C.muted, backgroundColor:C.bg }}>
                <option value="score">Most likely</option>
                <option value="urgent">Most urgent</option>
                <option value="active">Most active</option>
              </select>
              <button onClick={() => setExcluded(excluded.size > 0 ? new Set() : new Set(users.map(u => u.id)))}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border"
                style={{ borderColor:C.border, color:C.muted }}>
                {excluded.size > 0 ? 'All' : 'None'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight:420 }}>
            {sorted.map(u => {
              const isExcluded = excluded.has(u.id)
              const wasRecent  = recentlyContacted(u.id)
              const lastDate   = lastContacted[u.id] ? timeAgo(lastContacted[u.id]) : null
              const name       = u.name ?? u.email?.split('@')[0] ?? 'Unknown'
              return (
                <div key={u.id} className="rounded-xl border overflow-hidden"
                     style={{ borderColor: isExcluded ? C.border : wasRecent ? 'rgba(185,28,28,0.3)' : u._lead.color + '40', opacity: isExcluded ? 0.45 : 1 }}>
                  {/* Row */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
                       style={{ backgroundColor: isExcluded ? '#fafafa' : u._lead.bg }}
                       onClick={() => toggleUser(u.id)}>
                    <div className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0"
                         style={{ backgroundColor: isExcluded ? 'transparent' : C.amber, borderColor: isExcluded ? C.border : C.amber }}>
                      {!isExcluded && <Check size={9} style={{ color:'#fff' }} />}
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                         style={{ backgroundColor: isExcluded ? C.muted : u._lead.tier === 'hot' ? C.red : u._lead.tier === 'warm' ? C.amber : C.muted }}>
                      {name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-bold truncate" style={{ color:C.dark }}>{name}</p>
                        <span className="text-[10px] font-bold shrink-0" style={{ color:u._lead.color }}>{u._lead.label}</span>
                      </div>
                      <p className="text-[10px] truncate" style={{ color:C.muted }}>
                        {u.email}
                        {lastDate && <span style={{ color: wasRecent ? C.red : C.muted }}> · ✉ {lastDate}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: u._days === 0 ? 'rgba(185,28,28,0.1)' : 'rgba(217,119,6,0.1)', color: u._days === 0 ? C.red : C.amber }}>
                        {u._days === 0 ? 'Today' : `${u._days}d`}
                      </span>
                      {wasRecent && !isExcluded && <span className="text-[9px] font-bold" style={{ color:C.red }}>⚠ recent</span>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); setPreviewUser(u) }}
                      className="px-2 py-1 rounded text-[10px] font-bold ml-1 shrink-0"
                      style={{ backgroundColor:C.bg, color:C.muted, border:`1px solid ${C.border}` }}>
                      👁
                    </button>
                  </div>
                  {/* Intelligence row */}
                  {!isExcluded && (
                    <div className="flex items-center gap-4 px-3 py-2 border-t text-[10px]"
                         style={{ borderColor: u._lead.color + '20', backgroundColor:'rgba(255,255,255,0.5)' }}>
                      <span style={{ color:C.muted }}>
                        💪 Health: <strong style={{ color: u._lead.color }}>{typeof u._health === 'number' ? u._health : '—'}</strong>
                      </span>
                      <span style={{ color:C.muted }}>
                        🔧 {u._usageCount > 0 ? `${u._usageCount} sessions · ${u._topTool}` : 'No tool usage'}
                      </span>
                      <span style={{ color:C.muted, marginLeft:'auto' }}>
                        🕐 {u.last_seen ? timeAgo(u.last_seen) : 'Never'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Send button */}
      <div className="flex items-center justify-between p-5 rounded-2xl border"
           style={{ borderColor: sendCount > 0 ? C.lime : C.border, backgroundColor:'#fff' }}>
        <div>
          <p className="text-[14px] font-black" style={{ color:C.dark }}>
            Ready to send to {sendCount} user{sendCount !== 1 ? 's' : ''}
          </p>
          <p className="text-[12px]" style={{ color:C.muted }}>
            Est. {potConvert} conversion{potConvert !== 1 ? 's' : ''} · +${potMRR} potential MRR
          </p>
        </div>
        <button
          onClick={sendCampaign}
          disabled={sending || done || sendCount === 0}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[14px] font-bold disabled:opacity-50"
          style={{ backgroundColor: done ? C.limeDeep : sendCount > 0 ? C.dark : C.border, color: done ? '#fff' : C.lime }}>
          {sending ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.lime }} />
              Sending {progress}/{sendCount}...
            </>
          ) : done ? (
            <><CheckCircle size={16} /> All Sent!</>
          ) : (
            <><Send size={16} /> Launch Campaign →</>
          )}
        </button>
      </div>

      {/* Per-user preview overlay */}
      {previewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
             onClick={() => setPreviewUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border"
               style={{ borderColor:C.border }}
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:C.border }}>
              <p className="text-[14px] font-black" style={{ color:C.dark }}>
                Email Preview — {previewUser.name ?? previewUser.email?.split('@')[0]}
              </p>
              <button onClick={() => setPreviewUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <X size={14} style={{ color:C.muted }} />
              </button>
            </div>
            <div className="p-5">
              <div className="p-4 rounded-xl border text-[12px] leading-relaxed"
                   style={{ borderColor:C.border, backgroundColor:C.bg }}>
                <p className="font-bold text-[11px] mb-2 pb-2 border-b" style={{ color:C.muted, borderColor:C.border }}>
                  To: {previewUser.email}<br/>
                  Subject: <span style={{ color:C.dark }}>{resolveTokens(subjectLine, previewUser)}</span>
                </p>
                <p className="font-bold mb-2">Hey {previewUser.name ?? 'there'},</p>
                <p className="mb-2">
                  Your free trial is ending soon.
                  {previewUser._usageCount > 0 && ` You've used ${previewUser._topTool} ${previewUser._usageCount} times.`}
                  {` Don't lose access in ${previewUser._days} day${previewUser._days !== 1 ? 's' : ''}.`}
                </p>
                {promoEnabled && promoCode && (
                  <div className="mb-2 px-3 py-2 rounded-lg font-bold" style={{ backgroundColor:C.limeTint, color:C.limeDeep }}>
                    🎁 Use code <strong>{promoCode}</strong> for a special discount
                  </div>
                )}
                {customNote && <p className="mb-2 italic" style={{ color:C.muted }}>"{customNote}"</p>}
                <p className="font-bold" style={{ color:C.limeDeep }}>→ Upgrade to Pro Plan →</p>
              </div>
              <div className="mt-3 text-[10px] flex gap-4" style={{ color:C.muted }}>
                <span>Lead: {previewUser._lead?.label}</span>
                <span>Health: {typeof previewUser._health === 'number' ? previewUser._health : '—'}</span>
                <span>Usage: {previewUser._usageCount} sessions</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CAMPAIGN HISTORY
// ══════════════════════════════════════════════════════════════
function CampaignHistory({ history, loading, onNewCampaign }: {
  history:         any[]
  loading:         boolean
  onNewCampaign:   () => void
}) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor:C.limeDeep }} />
    </div>
  )

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor:C.bg }}>
        <History size={24} style={{ color:C.muted }} />
      </div>
      <p className="text-[15px] font-bold" style={{ color:C.dark }}>No campaigns yet</p>
      <p className="text-[13px]" style={{ color:C.muted }}>Emails you send will appear here</p>
      <button onClick={onNewCampaign}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold mt-2"
        style={{ backgroundColor:C.dark, color:C.lime }}>
        <Send size={14} /> Start First Campaign
      </button>
    </div>
  )

  // Group by date
  const grouped: Record<string, any[]> = {}
  for (const row of history) {
    const date = new Date(row.sent_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(row)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-black" style={{ color:C.dark }}>
          {history.length} email{history.length !== 1 ? 's' : ''} sent
        </p>
        <button onClick={onNewCampaign}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold"
          style={{ backgroundColor:C.dark, color:C.lime }}>
          <Send size={13} /> New Campaign
        </button>
      </div>

      {Object.entries(grouped).map(([date, rows]) => (
        <div key={date}>
          <p className="text-[11px] font-bold mb-2 px-1" style={{ color:C.muted }}>{date} — {rows.length} sent</p>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => {
              const profile = row.profile ?? {}
              const name    = profile.name ?? profile.email?.split('@')[0] ?? row.recipient ?? 'Unknown'
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                     style={{ borderColor:C.border, backgroundColor:'#fff' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor:C.limeTint }}>
                    <Mail size={14} style={{ color:C.limeDeep }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color:C.dark }}>{name}</p>
                    <p className="text-[10px]" style={{ color:C.muted }}>
                      {row.template_name ?? 'Email'} · {timeAgo(row.sent_at)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor:C.limeTint, color:C.limeDeep }}>
                    Sent ✓
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}