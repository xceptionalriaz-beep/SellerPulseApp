'use client'
// components/admin/settings-tabs/MarketingTab.tsx
// Full marketing center — 7 sections

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Mail, Send, Users, TrendingUp, Clock, Check, X,
  AlertTriangle, CheckCircle, Activity, BarChart2,
  History, Zap, Flame, Snowflake, RefreshCw,
  Eye, Tag, Gift, ArrowRight, Plus, Trash2,
  Target, Megaphone, DollarSign, Filter,
  ToggleLeft, ToggleRight, Calendar, Edit2,
  MousePointer, UserX, Search, ChevronDown, Rss,
} from 'lucide-react'

const C = {
  lime:     '#8fff00', limeDeep: '#4a8f00', limeTint: '#f4ffe6',
  dark:     '#0a0d08', text:     '#1a2410', muted:    '#8a9e78',
  border:   '#e8ede2', surface:  '#ffffff', bg:       '#f7f9f5',
  red:      '#b91c1c', amber:    '#d97706', green:    '#16a34a',
  blue:     '#1d4ed8',
}

const TEMPLATES = [
  { key: 'trial_ending',   label: 'Trial Ending Reminder', subject: "Your Riazify trial ends in {days_left} days, {name}", desc: 'Best for active free trial users' },
  { key: 'upgrade_offer',  label: 'Special Upgrade Offer',  subject: 'Exclusive offer for {name} — expires soon',          desc: 'Best paired with a promo code'   },
  { key: 'nudge_inactive', label: 'We Miss You',            subject: 'Hey {name}, we noticed you were away',               desc: 'For low-engagement inactive users' },
]

function getLeadScore(u: any) {
  const ms    = u.last_seen ? Date.now() - new Date(u.last_seen).getTime() : Infinity
  const tools = Array.isArray(u.toolUsage) ? u.toolUsage.length : 0
  const usage = Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s: number, t: any) => s + (t.usage_count ?? 1), 0) : 0
  const score = (ms < 86400000 ? 40 : ms < 259200000 ? 20 : 0) + Math.min(tools * 10, 30) + Math.min(usage * 2, 20)
  if (score >= 60) return { tier: 'hot',  label: 'HOT',  color: C.red,   bg: 'rgba(185,28,28,0.06)',  score }
  if (score >= 25) return { tier: 'warm', label: 'WARM', color: C.amber, bg: 'rgba(217,119,6,0.06)',  score }
  return             { tier: 'cold', label: 'COLD', color: C.muted, bg: C.bg,                     score }
}

function timeAgo(ts: string): string {
  const ms   = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 2)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function resolveTokens(text: string, u: any): string {
  const days    = u._days ?? 0
  const topTool = Array.isArray(u.toolUsage) && u.toolUsage.length > 0
    ? [...u.toolUsage].sort((a: any, b: any) => (b.usage_count ?? 0) - (a.usage_count ?? 0))[0]?.tool_name ?? 'Orders'
    : 'Orders'
  const usage = Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s: number, t: any) => s + (t.usage_count ?? 1), 0) : 0
  const name  = u.name ?? u.email?.split('@')[0] ?? 'there'
  return text
    .replace(/\{name\}/g,           name)
    .replace(/\{days_left\}/g,      String(days))
    .replace(/\{most_used_tool\}/g, topTool)
    .replace(/\{usage_count\}/g,    String(usage))
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: C.lime }} />
      <div>
        <p className="text-[13px] font-black tracking-wide" style={{ color: C.text }}>{title}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>{sub}</p>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------
function BlogSubscribersSection({ supabase }: { supabase: any }) {
  const [subscribers, setSubscribers]   = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [sending, setSending]           = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [nlSubject, setNlSubject]       = useState('')
  const [nlUrl, setNlUrl]               = useState('')
  const [toast, setToast]               = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  async function load() {
    setLoading(true)
    const { data } = await (supabase.from('newsletter_subscribers') as any)
      .select('*').order('subscribed_at', { ascending: false })
    setSubscribers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(id: string, current: boolean) {
    await (supabase.from('newsletter_subscribers') as any).update({ is_active: !current }).eq('id', id)
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
    showToast(!current ? 'Subscriber reactivated' : 'Subscriber unsubscribed')
  }

  async function deleteSubscriber(id: string) {
    await (supabase.from('newsletter_subscribers') as any).delete().eq('id', id)
    setSubscribers(prev => prev.filter(s => s.id !== id))
    showToast('Subscriber deleted')
  }

  function exportCSV() {
    const rows = [['Email', 'Source', 'Subscribed At', 'Active']]
    subscribers.forEach(s => rows.push([s.email, s.source, s.subscribed_at, s.is_active ? 'Yes' : 'No']))
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'blog-subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  async function sendNewsletter() {
    if (!nlUrl.trim()) { showToast('Enter a blog post URL'); return }
    if (!nlSubject.trim()) { showToast('Enter an email subject'); return }
    setShowModal(false)
    setSending(true)
    const post = nlUrl.trim()
    const title = nlSubject.trim()
    setSending(true)
    try {
      const active = subscribers.filter(s => s.is_active)
      let sent = 0
      for (const sub of active) {
        await fetch('/api/blog/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: sub.email,
            subject: title,
            html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <div style="background:#1a2410;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center">
                <h1 style="color:#8fff00;font-size:24px;margin:0">Riazify Blog</h1>
              </div>
              <h2 style="color:#1a2410;font-size:20px">${title}</h2>
              <p style="color:#8a9e78;font-size:14px;line-height:1.6">We just published a new article on the Riazify Blog. Click below to read it:</p>
              <a href="${post}" style="display:inline-block;background:#8fff00;color:#1a2410;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;margin:16px 0">Read Article →</a>
              <hr style="border:1px solid #e8ede2;margin:24px 0"/>
              <p style="color:#8a9e78;font-size:12px">You're receiving this because you subscribed to Riazify Blog updates. <a href="https://riazify.com/unsubscribe?email=${sub.email}" style="color:#4a8f00">Unsubscribe</a></p>
            </div>`
          })
        })
        sent++
      }
      showToast(`Newsletter sent to ${sent} subscribers ✓`)
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
    setSending(false)
  }

  const filtered = subscribers.filter(s =>
    !search || s.email?.toLowerCase().includes(search.toLowerCase()) || s.source?.toLowerCase().includes(search.toLowerCase())
  )
  const active   = subscribers.filter(s => s.is_active).length
  const inactive = subscribers.length - active

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}` }}>
          <CheckCircle size={14} style={{ color: C.lime }} />
          <p className="text-[13px] font-bold" style={{ color: C.lime }}>{toast}</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'TOTAL SUBSCRIBERS', value: subscribers.length, color: C.limeDeep },
          { label: 'ACTIVE',            value: active,             color: C.green    },
          { label: 'UNSUBSCRIBED',      value: inactive,           color: C.muted    },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border flex flex-col gap-1"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[24px] font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]"
             style={{ padding: 2, backgroundColor: 'transparent', borderRadius: 50 }}
             onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = C.lime}
             onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}>
          <div className="flex items-center gap-2 px-3 py-2"
               style={{ backgroundColor: C.surface, borderRadius: 50 }}>
            <Search size={13} style={{ color: C.muted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              className="flex-1 text-[12px] bg-transparent"
              style={{ color: C.text, border: 'none', outline: 'none' }} />
          </div>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-bold hover:opacity-70 transition-all"
          style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
          Export CSV
        </button>
        <button onClick={() => setShowModal(true)} disabled={sending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black hover:opacity-90 transition-all"
          style={{ backgroundColor: C.lime, color: C.dark }}>
          {sending ? 'Sending...' : `Send Newsletter (${active})`}
        </button>

        {/* Send Newsletter Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
               onClick={() => setShowModal(false)}>
            <div className="rounded-2xl border shadow-2xl p-6 w-full max-w-md mx-4"
                 style={{ backgroundColor: '#fff', borderColor: C.border }}
                 onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[16px] font-black" style={{ color: C.dark }}>Send Newsletter</p>
                  <p className="text-[12px]" style={{ color: C.muted }}>Will send to {active} active subscribers</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70" style={{ backgroundColor: C.bg }}>
                  <X size={14} style={{ color: C.muted }} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[11px] font-black mb-1.5" style={{ color: C.muted }}>EMAIL SUBJECT</p>
                  <input value={nlSubject} onChange={e => setNlSubject(e.target.value)}
                    placeholder="e.g. New Article: How to Scale Your eBay Business"
                    className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                    style={{ borderColor: C.border, color: C.dark, backgroundColor: C.surface }} />
                </div>
                <div>
                  <p className="text-[11px] font-black mb-1.5" style={{ color: C.muted }}>BLOG POST URL</p>
                  <input value={nlUrl} onChange={e => setNlUrl(e.target.value)}
                    placeholder="https://riazify.com/blog/your-post-slug"
                    className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                    style={{ borderColor: C.border, color: C.dark, backgroundColor: C.surface }} />
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: C.limeTint, border: '1px solid rgba(143,255,0,0.3)' }}>
                  <p className="text-[11px]" style={{ color: C.limeDeep }}>
                    This will send an email to <strong>{active} active subscribers</strong> via Resend.
                  </p>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border"
                    style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
                    Cancel
                  </button>
                  <button onClick={sendNewsletter} disabled={sending}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-black"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
                    {sending ? 'Sending...' : 'Send Now →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={20} className="animate-spin" style={{ color: C.limeDeep }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Mail size={32} style={{ color: C.muted }} />
            <p className="text-[14px] font-bold" style={{ color: C.text }}>No subscribers yet</p>
            <p className="text-[12px]" style={{ color: C.muted }}>Subscribers appear here when people sign up on the blog</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {['EMAIL', 'SOURCE', 'SUBSCRIBED', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black tracking-wider"
                      style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any, i: number) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-bold" style={{ color: C.text }}>{s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                      {s.source || 'blog'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px]" style={{ color: C.muted }}>
                      {s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: s.is_active ? C.limeTint : C.bg, color: s.is_active ? C.limeDeep : C.muted, border: `1px solid ${s.is_active ? 'rgba(143,255,0,0.3)' : C.border}` }}>
                      {s.is_active ? '● Active' : '○ Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleActive(s.id, s.is_active)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border hover:opacity-70"
                        style={{ borderColor: C.border, backgroundColor: C.bg }}
                        title={s.is_active ? 'Unsubscribe' : 'Reactivate'}>
                        {s.is_active ? <ToggleRight size={13} style={{ color: C.limeDeep }} /> : <ToggleLeft size={13} style={{ color: C.muted }} />}
                      </button>
                      <button onClick={() => deleteSubscriber(s.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
                        style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}
                        title="Delete">
                        <Trash2 size={12} style={{ color: C.red }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function MarketingTab({ initialUsers = [] }: { initialUsers?: any[] }) {
  const { can } = useTabPermissions('marketing')
  const supabase = createClient()

  const [view, setView] = useState<'overview' | 'campaign' | 'history' | 'broadcasts' | 'audience' | 'suppressed' | 'abtests' | 'attribution' | 'referrals' | 'blog_subscribers'>('overview')
  const [campaignUsers, setCampaignUsers] = useState<any[]>(initialUsers)
  const [history,       setHistory]       = useState<any[]>([])
  const [broadcasts,    setBroadcasts]    = useState<any[]>([])
  const [suppressed,    setSuppressed]    = useState<any[]>([])
  const [loadingHist,          setLoadingHist]          = useState(true)
  const [funnel,               setFunnel]               = useState({ free: 0, trial: 0, starter: 0, growth: 0, custom: 0 })
  const [stats,                setStats]                = useState({ sent: 0, thisWeek: 0, conversions: 0, activeBroadcasts: 0 })
  const [refreshing,           setRefreshing]           = useState(false)
  const [loadingCampaignUsers, setLoadingCampaignUsers] = useState(false)

  const loadAll = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadHistory(), loadFunnel(), loadBroadcasts(), loadSuppressed()])
    } catch (e) { console.error('[Marketing]', e) }
    setRefreshing(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function loadHistory() {
    setLoadingHist(true)
    try {
      const { data } = await (supabase.from('sent_messages') as any)
        .select('*, profile:user_id(name, email)')
        .order('sent_at', { ascending: false })
        .limit(100)
      const rows = (data ?? []) as any[]
      setHistory(rows)
      const weekAgo  = new Date(Date.now() - 7 * 86400000)
      const thisWeek = rows.filter(r => new Date(r.sent_at) >= weekAgo).length
      setStats(s => ({ ...s, sent: rows.length, thisWeek }))
    } catch {}
    setLoadingHist(false)
  }

  async function loadFunnel() {
    try {
      const { data } = await supabase.from('profiles').select('plan_name')
      const all = (data ?? []) as any[]
      const f = { free: 0, trial: 0, starter: 0, growth: 0, custom: 0 }
      for (const p of all) {
        const plan = (p.plan_name ?? '').toLowerCase()
        if (plan === 'free')             f.free++
        else if (plan === 'free trial')  f.trial++
        else if (plan === 'starter')     f.starter++
        else if (plan === 'growth')      f.growth++
        else if (plan === 'custom')      f.custom++
      }
      setFunnel(f)
      setStats(s => ({ ...s, conversions: f.starter + f.growth + f.custom }))
    } catch {}
  }

  async function loadBroadcasts() {
    try {
      const { data } = await (supabase.from('announcements') as any)
        .select('*').order('created_at', { ascending: false })
      const rows = (data ?? []) as any[]
      setBroadcasts(rows)
      setStats(s => ({ ...s, activeBroadcasts: rows.filter((b: any) => b.is_active).length }))
    } catch {}
  }

  async function loadSuppressed() {
    try {
      const { data } = await (supabase.from('email_suppressions') as any)
        .select('*').order('created_at', { ascending: false })
      setSuppressed(data ?? [])
    } catch {}
  }

  const TABS = [
    { key: 'overview',     label: 'Overview',       icon: BarChart2  },
    { key: 'campaign',     label: 'Campaign',        icon: Send       },
    { key: 'audience',     label: 'Audience',        icon: Filter     },
    { key: 'history',      label: 'History',         icon: History    },
    { key: 'broadcasts',   label: 'Broadcasts',      icon: Megaphone  },
    { key: 'abtests',      label: 'A/B Tests',       icon: Activity   },
    { key: 'attribution',  label: 'Attribution',     icon: TrendingUp },
    { key: 'referrals',    label: 'Referrals',       icon: Users      },
    { key: 'suppressed',       label: 'Unsubscribes',    icon: UserX },
    { key: 'blog_subscribers', label: 'Blog Subscribers', icon: Rss   },
  ]

  return (
    <div className="flex flex-col gap-6 px-6 py-6" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* -- Header -- */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-black tracking-tight" style={{ color: C.text }}>Marketing</h1>
          <p className="text-[13px] mt-0.5" style={{ color: C.muted }}>
            Campaigns · Broadcasts · Promo codes · Audience · Analytics
          </p>
        </div>
        <button onClick={loadAll} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:opacity-70 transition-all"
          style={{ backgroundColor: C.surface, borderColor: C.border, color: C.muted, fontSize: 12, fontWeight: 600 }}>
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* -- HUD Stats -- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'EMAILS SENT',      value: stats.sent,             icon: Mail,       color: C.blue    },
          { label: 'THIS WEEK',        value: stats.thisWeek,         icon: TrendingUp, color: C.limeDeep},
          { label: 'LIVE BROADCASTS',  value: stats.activeBroadcasts, icon: Megaphone,  color: C.amber   },
          { label: 'PAID USERS',       value: stats.conversions,      icon: DollarSign, color: C.green   },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold leading-tight" style={{ color: C.text }}>{s.value}</p>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: C.muted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* -- Tab switcher -- */}
      <div className="flex items-center gap-1 p-1 rounded-xl flex-wrap"
           style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
        {TABS.map(t => {
          const active = view === t.key
          return (
            <button key={t.key} onClick={() => setView(t.key as any)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all"
              style={{ backgroundColor: active ? '#8fff00' : 'transparent', color: active ? C.dark : C.muted }}>
              <t.icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* -- Views -- */}
      {view === 'overview'   && <OverviewSection funnel={funnel} stats={stats} history={history} broadcasts={broadcasts} onStartCampaign={() => setView('campaign')} onLoadUsers={setCampaignUsers} supabase={supabase} />}
      {view === 'campaign'   && <CampaignBuilder users={campaignUsers} onLoadUsers={setCampaignUsers} loadingUsers={loadingCampaignUsers} setLoadingUsers={setLoadingCampaignUsers} supabase={supabase} onSent={() => { loadHistory(); setView('history') }} canSend={can('send_broadcast')} />}
      {view === 'audience'   && <AudienceBuilder supabase={supabase} onLoadCampaign={(u) => { setCampaignUsers(u); setView('campaign') }} />}
      {view === 'history'    && <CampaignHistory history={history} loading={loadingHist} onNewCampaign={() => setView('campaign')} canCreate={can('create_campaign')} />}
      {view === 'broadcasts' && <BroadcastsSection broadcasts={broadcasts} supabase={supabase} onRefresh={loadBroadcasts} />}
      {view === 'abtests'    && <ABTestSection supabase={supabase} />}
      {view === 'attribution'&& <RevenueAttributionSection supabase={supabase} />}
      {view === 'referrals'  && <ReferralSection supabase={supabase} />}
      {view === 'suppressed' && <SuppressedSection suppressed={suppressed} supabase={supabase} onRefresh={loadSuppressed} />}
      {view === 'blog_subscribers' && <BlogSubscribersSection supabase={supabase} />}
    </div>
  )
}

// --------------------------------------------------------------
// OVERVIEW SECTION
// --------------------------------------------------------------
function OverviewSection({ funnel, stats, history, broadcasts, onStartCampaign, onLoadUsers, supabase }: any) {
  const total = funnel.free + funnel.trial + funnel.starter + funnel.growth + funnel.custom
  const paid  = funnel.starter + funnel.growth + funnel.custom

  const FUNNEL_STAGES = [
    { label: 'Free',    count: funnel.free,    color: C.muted,    pct: total > 0 ? Math.round(funnel.free/total*100)    : 0 },
    { label: 'Trial',   count: funnel.trial,   color: C.blue,     pct: total > 0 ? Math.round(funnel.trial/total*100)   : 0 },
    { label: 'Starter', count: funnel.starter, color: C.limeDeep, pct: total > 0 ? Math.round(funnel.starter/total*100) : 0 },
    { label: 'Growth',  count: funnel.growth,  color: C.lime,     pct: total > 0 ? Math.round(funnel.growth/total*100)  : 0 },
    { label: 'Custom',  count: funnel.custom,  color: C.amber,    pct: total > 0 ? Math.round(funnel.custom/total*100)  : 0 },
  ]

  async function loadExpiringUsers() {
    try {
      const { data } = await (supabase.from('profiles') as any)
        .select('*, toolUsage:user_tool_usage(tool_name, usage_count)')
      const now = Date.now()
      const expiring = ((data ?? []) as any[]).filter((u: any) => {
        const plan = (u.plan_name ?? '').toLowerCase()
        if (plan !== 'free' && plan !== 'free trial') return false
        const age = (now - new Date(u.created_at ?? now).getTime()) / 86400000
        return age >= 10 && age <= 14
      }).map((u: any) => ({
        ...u,
        _days: Math.max(0, Math.ceil(14 - (now - new Date(u.created_at ?? now).getTime()) / 86400000)),
      }))
      onLoadUsers(expiring)
      onStartCampaign()
    } catch {}
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Conversion Funnel */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <SectionHeader title="CONVERSION FUNNEL" sub={`${total} total users · ${paid} paid · ${total > 0 ? Math.round(paid/total*100) : 0}% conversion`} />
        <div className="flex flex-col gap-3">
          {FUNNEL_STAGES.map(stage => (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="text-[11px] font-bold w-14 shrink-0" style={{ color: C.muted }}>{stage.label}</span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ backgroundColor: C.bg }}>
                <div className="h-full rounded-lg transition-all duration-700"
                     style={{ width: `${Math.max(stage.pct, 2)}%`, backgroundColor: stage.color + '60' }} />
              </div>
              <span className="text-[13px] font-extrabold w-8 text-right shrink-0" style={{ color: stage.color }}>{stage.count}</span>
              <span className="text-[10px] w-8 shrink-0" style={{ color: C.muted }}>{stage.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two column — opportunities + recent activity */}
      <div className="grid grid-cols-2 gap-5">

        {/* Revenue Opportunities */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="OPPORTUNITIES" sub="Revenue waiting" />
            <button onClick={loadExpiringUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:opacity-80"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              <Send size={11} />
              Campaign
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Expiring trials',  value: funnel.trial,   color: C.blue,     desc: 'Trial users expiring soon'          },
              { label: 'Free users',       value: funnel.free,    color: C.muted,    desc: 'Never upgraded'                     },
              { label: 'Live broadcasts',  value: broadcasts.filter((b: any) => b.is_active).length, color: C.green, desc: 'Dashboard banners active' },
              { label: 'Paid users',       value: funnel.starter + funnel.growth + funnel.custom, color: C.limeDeep, desc: 'Converted users' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                   style={{ backgroundColor: C.bg }}>
                <span className="text-[18px] font-extrabold w-8 shrink-0" style={{ color: item.color }}>{item.value}</span>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>{item.label}</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <SectionHeader title="RECENT EMAILS" sub="Last 5 sent" />
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <Mail size={24} style={{ color: C.muted }} />
              <p className="text-[12px]" style={{ color: C.muted }}>No emails sent yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.slice(0, 5).map((row: any, i: number) => {
                const profile = row.profile ?? {}
                const name    = profile.name ?? profile.email?.split('@')[0] ?? 'Unknown'
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                       style={{ backgroundColor: C.bg }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                         style={{ backgroundColor: C.limeTint }}>
                      <Mail size={12} style={{ color: C.limeDeep }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>{name}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>
                        {row.template_name ?? 'Email'} · {timeAgo(row.sent_at)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>Sent</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Campaign analytics placeholder */}
      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <SectionHeader title="CAMPAIGN ANALYTICS" sub="Email performance metrics" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Sent',     value: stats.sent,     icon: Send,          color: C.blue    },
            { label: 'This Week',      value: stats.thisWeek, icon: TrendingUp,    color: C.limeDeep},
            { label: 'Unsubscribes',   value: '—',            icon: UserX,         color: C.red     },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-3 p-4 rounded-xl"
                 style={{ backgroundColor: C.bg }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: m.color + '18' }}>
                <m.icon size={16} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-[20px] font-extrabold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px] font-bold" style={{ color: C.muted }}>{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// AUDIENCE BUILDER
// --------------------------------------------------------------
function AudienceBuilder({ supabase, onLoadCampaign }: { supabase: any; onLoadCampaign: (u: any[]) => void }) {
  const [filters, setFilters] = useState({
    plans:       [] as string[],
    lastSeenDays: '',
    country:      '',
    toolUsed:     '',
    minUsage:     '',
    accountStatus:'',
  })
  const [results,   setResults]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(false)
  const [searched,  setSearched]  = useState(false)

  const PLAN_OPTIONS    = ['Free', 'Free Trial', 'Starter', 'Growth', 'Custom']
  const TOOL_OPTIONS    = ['orders', 'title_builder', 'product_research', 'competitor_research', 'profit_calculator']
  const STATUS_OPTIONS  = ['Active', 'Suspended', 'Banned']

  function togglePlan(plan: string) {
    setFilters(f => ({
      ...f,
      plans: f.plans.includes(plan) ? f.plans.filter(p => p !== plan) : [...f.plans, plan],
    }))
  }

  async function runSearch() {
    setLoading(true)
    setSearched(true)
    try {
      let query = (supabase.from('profiles') as any)
        .select('*, toolUsage:user_tool_usage(tool_name, usage_count)')

      if (filters.plans.length > 0) {
        query = query.in('plan_name', filters.plans)
      }
      if (filters.accountStatus) {
        query = query.eq('account_status', filters.accountStatus)
      }
      if (filters.country) {
        query = query.ilike('country', `%${filters.country}%`)
      }
      if (filters.lastSeenDays) {
        const cutoff = new Date(Date.now() - parseInt(filters.lastSeenDays) * 86400000).toISOString()
        query = query.lt('last_seen', cutoff)
      }

      const { data } = await query
      let results = (data ?? []) as any[]

      if (filters.toolUsed) {
        results = results.filter((u: any) =>
          Array.isArray(u.toolUsage) && u.toolUsage.some((t: any) => t.tool_name === filters.toolUsed)
        )
      }
      if (filters.minUsage) {
        results = results.filter((u: any) => {
          const total = Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s: number, t: any) => s + (t.usage_count ?? 0), 0) : 0
          return total >= parseInt(filters.minUsage)
        })
      }

      setResults(results)
    } catch { setResults([]) }
    setLoading(false)
  }

  function reset() {
    setFilters({ plans: [], lastSeenDays: '', country: '', toolUsed: '', minUsage: '', accountStatus: '' })
    setResults([])
    setSearched(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="AUDIENCE BUILDER" sub="Build custom segments for targeted campaigns" />

      <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <div className="grid grid-cols-2 gap-5">

          {/* Left filters */}
          <div className="flex flex-col gap-4">
            {/* Plan filter */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>PLAN</p>
              <div className="flex flex-wrap gap-1.5">
                {PLAN_OPTIONS.map(plan => (
                  <button key={plan} onClick={() => togglePlan(plan)}
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: filters.plans.includes(plan) ? C.dark : C.bg,
                      borderColor:     filters.plans.includes(plan) ? C.dark : C.border,
                      color:           filters.plans.includes(plan) ? C.lime : C.muted,
                    }}>
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Last seen */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>INACTIVE FOR (days)</p>
              <input value={filters.lastSeenDays}
                onChange={e => setFilters(f => ({ ...f, lastSeenDays: e.target.value }))}
                placeholder="e.g. 7 (not seen in 7+ days)"
                className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: filters.lastSeenDays ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>

            {/* Country */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>COUNTRY</p>
              <input value={filters.country}
                onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
                placeholder="e.g. US, GB, AU"
                className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: filters.country ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>
          </div>

          {/* Right filters */}
          <div className="flex flex-col gap-4">
            {/* Account status */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>ACCOUNT STATUS</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => setFilters(f => ({ ...f, accountStatus: f.accountStatus === s ? '' : s }))}
                    className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: filters.accountStatus === s ? C.dark : C.bg,
                      borderColor:     filters.accountStatus === s ? C.dark : C.border,
                      color:           filters.accountStatus === s ? C.lime : C.muted,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tool used */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>USED TOOL</p>
              <select value={filters.toolUsed}
                onChange={e => setFilters(f => ({ ...f, toolUsed: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: filters.toolUsed ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }}>
                <option value="">Any tool</option>
                {TOOL_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Min usage */}
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>MIN TOTAL USAGE</p>
              <input value={filters.minUsage}
                onChange={e => setFilters(f => ({ ...f, minUsage: e.target.value }))}
                placeholder="e.g. 5 (used 5+ times)"
                className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: filters.minUsage ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={runSearch} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            Search Audience
          </button>
          <button onClick={reset}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold border"
            style={{ borderColor: C.border, color: C.muted }}>
            Reset Filters
          </button>
          {searched && (
            <span className="text-[12px] font-bold ml-auto" style={{ color: C.limeDeep }}>
              {results.length} users match
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-black" style={{ color: C.text }}>
              {results.length} users found
            </p>
            <button onClick={() => onLoadCampaign(results)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              <Send size={12} />
              Launch Campaign for These Users
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
            {results.slice(0, 20).map((u: any, i: number) => {
              const lead = getLeadScore(u)
              const LeadIcon = lead.tier === 'hot' ? Flame : lead.tier === 'warm' ? Zap : Snowflake
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                       style={{ backgroundColor: lead.color }}>
                    {(u.name ?? u.email ?? 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>{u.name ?? u.email}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {u.plan_name ?? 'Free'} · {u.country ?? '—'} · {u.last_seen ? timeAgo(u.last_seen) : 'Never seen'}
                    </p>
                  </div>
                  <LeadIcon size={13} style={{ color: lead.color }} />
                </div>
              )
            })}
            {results.length > 20 && (
              <p className="text-center text-[11px] py-2" style={{ color: C.muted }}>
                +{results.length - 20} more users
              </p>
            )}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="flex flex-col items-center py-12 gap-2">
          <Users size={32} style={{ color: C.muted }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No users match these filters</p>
          <p className="text-[12px]" style={{ color: C.muted }}>Try adjusting your criteria</p>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// CAMPAIGN BUILDER — Upgraded with 10 new features
// --------------------------------------------------------------
function CampaignBuilder({ users, onLoadUsers, loadingUsers, setLoadingUsers, supabase, onSent, canSend = true }: {
  users: any[]; onLoadUsers: (u: any[]) => void
  loadingUsers: boolean; setLoadingUsers: (v: boolean) => void
  supabase: any; onSent: () => void; canSend?: boolean
}) {
  const cancelRef = useState({ cancelled: false })[0]

  // Core state
  const [excluded,       setExcluded]       = useState<Set<string>>(new Set())
  const [excludeReasons, setExcludeReasons] = useState<Record<string, string>>({})
  const [templateKey,    setTemplateKey]    = useState('trial_ending')
  const [subjectLine,    setSubjectLine]    = useState(TEMPLATES[0].subject)
  const [promoEnabled,   setPromoEnabled]   = useState(false)
  const [promoCode,      setPromoCode]      = useState('')
  const [customNote,     setCustomNote]     = useState('')
  const [campaignName,   setCampaignName]   = useState('')
  const [sortBy,         setSortBy]         = useState<'score' | 'urgent' | 'active'>('score')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [previewUser,    setPreviewUser]    = useState<any>(null)
  const [lastContacted,  setLastContacted]  = useState<Record<string, string>>({})
  const [sending,        setSending]        = useState(false)
  const [progress,       setProgress]       = useState(0)
  const [done,           setDone]           = useState(false)
  const [toast,          setToast]          = useState<{ msg: string; ok: boolean } | null>(null)
  const [segment,        setSegment]        = useState<'trial' | 'free' | 'all'>('trial')
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [scheduleMode,   setScheduleMode]   = useState(false)
  const [scheduleDate,   setScheduleDate]   = useState('')
  const [scheduleTime,   setScheduleTime]   = useState('09:00')
  const [sendingTest,    setSendingTest]    = useState(false)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (users.length === 0) loadSegment('trial')
    else loadLastContacted(users.map(u => u.id))
  }, [])

  async function loadSegment(seg: 'trial' | 'free' | 'all') {
    setSegment(seg)
    setLoadingUsers(true)
    try {
      // Query 1 — get profiles
      const { data: profiles, error } = await (supabase.from('profiles') as any)
        .select('*')
      if (error) { console.error('[loadSegment]', error); setLoadingUsers(false); return }

      // Query 2 — get tool usage separately
      const { data: toolUsage } = await (supabase.from('user_tool_usage') as any)
        .select('user_id, tool_name, usage_count')

      // Build tool usage map
      const toolMap: Record<string, any[]> = {}
      for (const t of (toolUsage ?? []) as any[]) {
        if (!toolMap[t.user_id]) toolMap[t.user_id] = []
        toolMap[t.user_id].push(t)
      }

      const now = Date.now()
      const filtered = ((profiles ?? []) as any[]).filter((u: any) => {
        const plan = (u.plan_name ?? '').toLowerCase().trim()
        if (seg === 'trial') return plan === 'free trial'
        if (seg === 'free')  return plan === 'free'
        return plan === 'free' || plan === 'free trial'
      }).map((u: any) => ({
        ...u,
        toolUsage: toolMap[u.id] ?? [],
        _days: Math.max(0, Math.ceil(14 - (now - new Date(u.created_at ?? now).getTime()) / 86400000)),
      }))

      onLoadUsers(filtered)
      if (filtered.length > 0) loadLastContacted(filtered.map((u: any) => u.id))
    } catch (e) { console.error('[loadSegment error]', e) }
    setLoadingUsers(false)
  }

  async function loadLastContacted(ids: string[]) {
    if (ids.length === 0) return
    try {
      const { data } = await (supabase.from('sent_messages') as any)
        .select('user_id, sent_at, template_name').in('user_id', ids).order('sent_at', { ascending: false })
      const map: Record<string, string> = {}
      const reasons: Record<string, string> = {}
      for (const row of (data ?? []) as any[]) {
        if (!map[row.user_id]) {
          map[row.user_id] = row.sent_at
          const daysSince = (Date.now() - new Date(row.sent_at).getTime()) / 86400000
          if (daysSince < 3) reasons[row.user_id] = `Emailed ${Math.round(daysSince * 24)}h ago`
        }
      }
      setLastContacted(map)
      setExcludeReasons(prev => ({ ...prev, ...reasons }))
    } catch {}
  }

  function toggleUser(id: string, reason?: string) {
    setExcluded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setExcludeReasons(r => { const n = { ...r }; delete n[id]; return n })
      } else {
        next.add(id)
        if (reason) setExcludeReasons(r => ({ ...r, [id]: reason }))
      }
      return next
    })
  }

  function recentlyContacted(id: string) {
    const last = lastContacted[id]
    return last ? (Date.now() - new Date(last).getTime()) < 3 * 86400000 : false
  }

  const enriched = users.map(u => ({
    ...u,
    _lead:       getLeadScore(u),
    _topTool:    Array.isArray(u.toolUsage) && u.toolUsage.length > 0
                   ? [...u.toolUsage].sort((a: any, b: any) => (b.usage_count ?? 0) - (a.usage_count ?? 0))[0]?.tool_name ?? '—'
                   : '—',
    _usageCount: Array.isArray(u.toolUsage) ? u.toolUsage.reduce((s: number, t: any) => s + (t.usage_count ?? 1), 0) : 0,
    _lastSeenMs: u.last_seen ? Date.now() - new Date(u.last_seen).getTime() : Infinity,
  }))

  // Search filter
  const searched = enriched.filter(u => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q)
  })

  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'score')  return b._lead.score - a._lead.score
    if (sortBy === 'urgent') return a._days - b._days
    return a._lastSeenMs - b._lastSeenMs
  })

  const toSend      = sorted.filter(u => !excluded.has(u.id))
  const sendCount   = toSend.length
  const recentCount = users.filter(u => recentlyContacted(u.id)).length
  const hotCount    = enriched.filter(u => u._lead.tier === 'hot').length
  const selectedTpl = TEMPLATES.find(t => t.key === templateKey) ?? TEMPLATES[0]

  // Duplicate send check
  const duplicateWarnings = toSend.filter(u => {
    const last = lastContacted[u.id]
    if (!last) return false
    return (Date.now() - new Date(last).getTime()) < 7 * 86400000
  })

  async function sendTestEmail() {
    setSendingTest(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } }    = await supabase.auth.getUser()
      await fetch('/api/admin/send-email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ userId: user?.id, templateKey, customNote: customNote || '', isTest: true }),
      })
      showToast('Test email sent to your inbox')
    } catch { showToast('Failed to send test', false) }
    setSendingTest(false)
  }

  async function sendCampaign() {
    setConfirmOpen(false)
    if (sending || sendCount === 0) return
    cancelRef.cancelled = false
    setSending(true); setProgress(0); setDone(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let sent = 0
      for (const u of toSend) {
        if (cancelRef.cancelled) break
        await fetch('/api/admin/send-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({
            userId:       u.id,
            templateKey,
            campaignName: campaignName || selectedTpl.label,
            customNote: [
              promoEnabled && promoCode ? `Use code ${promoCode} for a special discount.` : '',
              customNote || '',
            ].filter(Boolean).join(' '),
          }),
        })
        sent++
        setProgress(sent)
        // Rate limit — 10/sec max
        if (sent % 10 === 0) await new Promise(r => setTimeout(r, 1000))
      }
      if (!cancelRef.cancelled) {
        setDone(true)
        showToast(`${sent} emails sent successfully`)
        setTimeout(() => { setDone(false); setProgress(0); onSent() }, 2000)
      } else {
        showToast(`Cancelled after ${sent} emails`, false)
        setProgress(0)
      }
    } catch { showToast('Failed to send campaign', false) }
    setSending(false)
  }

  function cancelSend() {
    cancelRef.cancelled = true
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: toast.ok ? C.dark : '#FEF2F2', border: `1px solid ${toast.ok ? C.lime : '#fecaca'}` }}>
          {toast.ok ? <CheckCircle size={15} style={{ color: C.lime }} /> : <AlertTriangle size={15} style={{ color: C.red }} />}
          <p className="text-[13px] font-semibold" style={{ color: toast.ok ? C.lime : C.red }}>{toast.msg}</p>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border p-6"
               style={{ borderColor: C.border }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
              <AlertTriangle size={24} style={{ color: C.red }} />
            </div>
            <p className="text-[16px] font-black text-center mb-2" style={{ color: C.dark }}>
              Launch Campaign?
            </p>
            <p className="text-[13px] text-center mb-1" style={{ color: C.muted }}>
              You are about to send <strong style={{ color: C.dark }}>{sendCount} emails</strong>
            </p>
            <p className="text-[12px] text-center mb-4" style={{ color: C.muted }}>
              Template: {selectedTpl.label}
              {campaignName && ` · "${campaignName}"`}
              {scheduleMode && scheduleDate && ` · Scheduled for ${scheduleDate} at ${scheduleTime}`}
            </p>
            {duplicateWarnings.length > 0 && (
              <div className="px-3 py-2 rounded-xl mb-4"
                   style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                <p className="text-[11px] font-semibold" style={{ color: C.amber }}>
                  {duplicateWarnings.length} users were emailed in the last 7 days
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
              <button onClick={sendCampaign}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign name */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>
        <Edit2 size={16} style={{ color: C.muted, flexShrink: 0 }} />
        <input value={campaignName} onChange={e => setCampaignName(e.target.value)}
          placeholder="Campaign name (e.g. Trial Recovery June 25)"
          className="flex-1 text-[13px] font-semibold outline-none"
          style={{ backgroundColor: 'transparent', color: C.dark }} />
        {campaignName && (
          <button onClick={() => setCampaignName('')}>
            <X size={14} style={{ color: C.muted }} />
          </button>
        )}
      </div>

      {/* Segment selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[12px] font-bold" style={{ color: C.muted }}>TARGET:</p>
        {[{ key: 'trial', label: 'Free Trial' }, { key: 'free', label: 'Free Users' }, { key: 'all', label: 'All Free + Trial' }].map(s => (
          <button key={s.key} onClick={() => loadSegment(s.key as any)}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all"
            style={{ backgroundColor: segment === s.key ? C.dark : C.surface, borderColor: segment === s.key ? C.dark : C.border, color: segment === s.key ? C.lime : C.muted }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Recipients',  value: String(sendCount),           color: C.dark,  icon: Users },
          { label: 'Hot Leads',   value: String(hotCount),            color: C.red,   icon: Flame },
          { label: 'Recent 3d',   value: String(recentCount),         color: C.amber, icon: Clock },
          { label: 'Duplicates',  value: String(duplicateWarnings.length), color: duplicateWarnings.length > 0 ? C.red : C.muted, icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ borderColor: C.border, backgroundColor: C.surface }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: C.muted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {recentCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
             style={{ backgroundColor: 'rgba(185,28,28,0.06)', borderColor: 'rgba(185,28,28,0.2)' }}>
          <AlertTriangle size={16} style={{ color: C.red }} />
          <p className="text-[13px] font-semibold" style={{ color: C.red }}>
            {recentCount} user{recentCount !== 1 ? 's were' : ' was'} emailed in the last 3 days — consider excluding them
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">

        {/* LEFT: Email settings */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <p className="text-[13px] font-black" style={{ color: C.dark }}>Email Settings</p>

          {/* Template */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>TEMPLATE</p>
            <div className="flex flex-col gap-1.5">
              {TEMPLATES.map(t => {
                const active = templateKey === t.key
                return (
                  <button key={t.key} onClick={() => { setTemplateKey(t.key); setSubjectLine(t.subject) }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                    style={{ borderColor: active ? C.lime : C.border, backgroundColor: active ? C.limeTint : 'transparent' }}>
                    <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                         style={{ borderColor: active ? C.limeDeep : C.border }}>
                      {active && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.limeDeep }} />}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: active ? C.limeDeep : C.text }}>{t.label}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>SUBJECT LINE</p>
            <input value={subjectLine} onChange={e => setSubjectLine(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border text-[12px] font-semibold outline-none"
              style={{ borderColor: subjectLine !== selectedTpl.subject ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
            {subjectLine !== selectedTpl.subject && (
              <button onClick={() => setSubjectLine(selectedTpl.subject)}
                className="text-[10px] font-bold mt-1" style={{ color: C.muted }}>Reset to default</button>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {['{name}', '{days_left}', '{most_used_tool}'].map(tok => (
                <button key={tok} onClick={() => setSubjectLine(s => s + ' ' + tok)}
                  className="px-1.5 py-0.5 rounded border text-[10px] font-bold hover:opacity-70"
                  style={{ backgroundColor: C.limeTint, borderColor: C.lime, color: C.limeDeep }}>{tok}</button>
              ))}
            </div>
          </div>

          {/* Promo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>PROMO CODE</p>
              <div onClick={() => setPromoEnabled(s => !s)}
                   className="relative w-9 h-5 rounded-full cursor-pointer transition-all"
                   style={{ backgroundColor: promoEnabled ? C.dark : C.border }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                     style={{ backgroundColor: promoEnabled ? C.lime : '#fff', left: promoEnabled ? '18px' : '2px' }} />
              </div>
            </div>
            {promoEnabled && (
              <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full h-9 px-3 rounded-xl border text-[12px] font-mono font-bold outline-none uppercase"
                style={{ borderColor: promoCode ? C.lime : C.border, backgroundColor: promoCode ? C.limeTint : '#fff', color: C.dark }} />
            )}
          </div>

          {/* Note */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>PERSONAL NOTE (optional)</p>
            <textarea value={customNote} onChange={e => setCustomNote(e.target.value)}
              placeholder="Add a personal message..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
              style={{ borderColor: customNote ? C.lime : C.border, color: C.dark, backgroundColor: '#fff' }} />
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>SCHEDULE FOR LATER</p>
              <div onClick={() => setScheduleMode(s => !s)}
                   className="relative w-9 h-5 rounded-full cursor-pointer transition-all"
                   style={{ backgroundColor: scheduleMode ? C.dark : C.border }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                     style={{ backgroundColor: scheduleMode ? C.lime : '#fff', left: scheduleMode ? '18px' : '2px' }} />
              </div>
            </div>
            {scheduleMode && (
              <div className="flex gap-2">
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: scheduleDate ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="w-24 h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
            )}
          </div>

          {/* Send test */}
          {canSend && <button onClick={sendTestEmail} disabled={sendingTest}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-50 transition-all"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
            {sendingTest ? <RefreshCw size={13} className="animate-spin" /> : <Mail size={13} />}
            Send Test Email to Me
          </button>}
        </div>

        {/* RIGHT: Recipients */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-black" style={{ color: C.dark }}>
              Recipients <span style={{ color: C.muted, fontWeight: 500 }}>({sendCount}/{users.length})</span>
            </p>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border outline-none"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
                <option value="score">Most likely</option>
                <option value="urgent">Most urgent</option>
                <option value="active">Most active</option>
              </select>
              <button onClick={() => setExcluded(excluded.size > 0 ? new Set() : new Set(users.map(u => u.id)))}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border"
                style={{ borderColor: C.border, color: C.muted }}>
                {excluded.size > 0 ? 'Select all' : 'Deselect all'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border text-[12px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.dark }} />
          </div>

          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
              <p className="text-[12px]" style={{ color: C.muted }}>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Users size={28} style={{ color: C.muted }} />
              <p className="text-[13px] font-bold" style={{ color: C.muted }}>No users found</p>
              <p className="text-[11px]" style={{ color: C.muted }}>No users match this segment</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 380 }}>
              {sorted.map(u => {
                const isExcluded  = excluded.has(u.id)
                const wasRecent   = recentlyContacted(u.id)
                const lastDate    = lastContacted[u.id] ? timeAgo(lastContacted[u.id]) : null
                const name        = u.name ?? u.email?.split('@')[0] ?? 'Unknown'
                const LeadIcon    = u._lead.tier === 'hot' ? Flame : u._lead.tier === 'warm' ? Zap : Snowflake
                const excludeWhy  = excludeReasons[u.id]
                return (
                  <div key={u.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all"
                    style={{ borderColor: isExcluded ? C.border : wasRecent ? 'rgba(185,28,28,0.3)' : u._lead.color + '40', backgroundColor: isExcluded ? '#fafafa' : u._lead.bg, opacity: isExcluded ? 0.5 : 1 }}
                    onClick={() => toggleUser(u.id, wasRecent ? 'Recently contacted' : undefined)}>
                    <div className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center shrink-0"
                         style={{ backgroundColor: isExcluded ? 'transparent' : C.limeDeep, borderColor: isExcluded ? C.border : C.limeDeep }}>
                      {!isExcluded && <Check size={9} style={{ color: '#fff' }} />}
                    </div>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                         style={{ backgroundColor: isExcluded ? C.muted : u._lead.color }}>
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>{name}</p>
                        <LeadIcon size={11} style={{ color: u._lead.color, flexShrink: 0 }} />
                      </div>
                      <p className="text-[10px] truncate" style={{ color: C.muted }}>
                        {u.email}
                        {lastDate && <span style={{ color: wasRecent ? C.red : C.muted }}> · {lastDate}</span>}
                        {isExcluded && excludeWhy && <span style={{ color: C.muted }}> · {excludeWhy}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {wasRecent && !isExcluded && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>recent</span>
                      )}
                      {u._days > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: C.amber }}>{u._days}d</span>
                      )}
                      <button onClick={e => { e.stopPropagation(); setPreviewUser(u) }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70"
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                        <Eye size={11} style={{ color: C.muted }} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {searchQuery && sorted.length === 0 && (
                <p className="text-center text-[12px] py-4" style={{ color: C.muted }}>No users match "{searchQuery}"</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send bar */}
      <div className="flex items-center justify-between p-5 rounded-2xl border"
           style={{ borderColor: sendCount > 0 ? C.lime : C.border, backgroundColor: C.surface }}>
        <div>
          <p className="text-[14px] font-black" style={{ color: C.dark }}>
            {sending ? `Sending... ${progress}/${sendCount}` : `Ready to send to ${sendCount} user${sendCount !== 1 ? 's' : ''}`}
          </p>
          <p className="text-[12px]" style={{ color: C.muted }}>
            {campaignName || selectedTpl.label}
            {promoEnabled && promoCode && ` · Code: ${promoCode}`}
            {scheduleMode && scheduleDate && ` · Scheduled ${scheduleDate} ${scheduleTime}`}
          </p>
          {sending && (
            <div className="mt-2 h-1.5 rounded-full overflow-hidden w-48" style={{ backgroundColor: C.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${sendCount > 0 ? (progress/sendCount)*100 : 0}%`, backgroundColor: C.lime }} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {sending && (
            <button onClick={cancelSend}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold border"
              style={{ borderColor: C.red, color: C.red, backgroundColor: 'rgba(185,28,28,0.06)' }}>
              <X size={14} /> Stop
            </button>
          )}
          {canSend && <button onClick={() => setConfirmOpen(true)} disabled={sending || done || sendCount === 0}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[14px] font-bold disabled:opacity-50 transition-all"
            style={{ backgroundColor: done ? C.limeDeep : sendCount > 0 ? C.dark : C.border, color: done ? '#fff' : C.lime }}>
            {sending ? (
              <><RefreshCw size={16} className="animate-spin" /> Sending...</>
            ) : done ? (
              <><CheckCircle size={16} /> All Sent!</>
            ) : scheduleMode && scheduleDate ? (
              <><Calendar size={16} /> Schedule Campaign</>
            ) : (
              <><Send size={16} /> Launch Campaign</>
            )}
          </button>}
        </div>
      </div>

      {/* Preview overlay */}
      {previewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={() => setPreviewUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border"
               style={{ borderColor: C.border }}
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
              <p className="text-[14px] font-black" style={{ color: C.dark }}>
                Preview — {previewUser.name ?? previewUser.email?.split('@')[0]}
              </p>
              <button onClick={() => setPreviewUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <X size={14} style={{ color: C.muted }} />
              </button>
            </div>
            <div className="p-5">
              <div className="p-4 rounded-xl border text-[12px] leading-relaxed"
                   style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="font-bold text-[11px] mb-2 pb-2 border-b" style={{ color: C.muted, borderColor: C.border }}>
                  To: {previewUser.email}<br />
                  Subject: <span style={{ color: C.dark }}>{resolveTokens(subjectLine, previewUser)}</span>
                </p>
                <p className="font-bold mb-2">Hey {previewUser.name ?? 'there'},</p>
                <p className="mb-2">
                  {templateKey === 'trial_ending'
                    ? `Your free trial ends in ${previewUser._days} day${previewUser._days !== 1 ? 's' : ''}. Don't lose access.`
                    : templateKey === 'upgrade_offer'
                    ? 'We have an exclusive offer just for you. Upgrade now and save.'
                    : "We noticed you haven't been around. Come back and check your orders."}
                </p>
                {promoEnabled && promoCode && (
                  <div className="mb-2 px-3 py-2 rounded-lg font-bold" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    Use code <strong>{promoCode}</strong> for a special discount
                  </div>
                )}
                {customNote && <p className="mb-2 italic" style={{ color: C.muted }}>"{customNote}"</p>}
                <p className="font-bold" style={{ color: C.limeDeep }}>Upgrade to Pro Plan</p>
              </div>
              <div className="mt-3 flex gap-4 text-[10px]" style={{ color: C.muted }}>
                <span>Lead: <strong style={{ color: previewUser._lead?.color }}>{previewUser._lead?.label}</strong></span>
                <span>Usage: {previewUser._usageCount} sessions</span>
                <span>Top: {previewUser._topTool}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// CAMPAIGN HISTORY
// --------------------------------------------------------------
function CampaignHistory({ history, loading, onNewCampaign, canCreate }: {
  history: any[]; loading: boolean; onNewCampaign: () => void; canCreate?: boolean
}) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
    </div>
  )

  if (history.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <History size={36} style={{ color: C.muted }} />
      <p className="text-[15px] font-bold" style={{ color: C.dark }}>No campaigns yet</p>
      {canCreate && <button onClick={onNewCampaign}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold mt-2"
        style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
        <Send size={14} /> Start First Campaign
      </button>}
    </div>
  )

  const grouped: Record<string, any[]> = {}
  for (const row of history) {
    const date = new Date(row.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(row)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-black" style={{ color: C.dark }}>{history.length} email{history.length !== 1 ? 's' : ''} sent</p>
        {canCreate && <button onClick={onNewCampaign}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold"
          style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
          <Send size={13} /> New Campaign
        </button>}
      </div>
      {Object.entries(grouped).map(([date, rows]) => (
        <div key={date}>
          <p className="text-[11px] font-bold mb-2 px-1" style={{ color: C.muted }}>{date} — {rows.length} sent</p>
          <div className="flex flex-col gap-2">
            {rows.map((row: any, i: number) => {
              const profile = row.profile ?? {}
              const name    = profile.name ?? profile.email?.split('@')[0] ?? 'Unknown'
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                     style={{ borderColor: C.border, backgroundColor: C.surface }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: C.limeTint }}>
                    <Mail size={14} style={{ color: C.limeDeep }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>{name}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{row.template_name ?? 'Email'} · {timeAgo(row.sent_at)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>Sent</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}


// --------------------------------------------------------------
// BROADCASTS SECTION
// --------------------------------------------------------------
function BroadcastsSection({ broadcasts, supabase, onRefresh }: { broadcasts: any[]; supabase: any; onRefresh: () => void }) {
  const [creating,   setCreating]   = useState(false)
  const [message,    setMessage]    = useState('')
  const [actionUrl,  setActionUrl]  = useState('')
  const [actionText, setActionText] = useState('')
  const [target,     setTarget]     = useState('all')
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  async function createBroadcast() {
    if (!message.trim()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/broadcast', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ message: message.trim(), target, action_url: actionUrl || null, action_text: actionText || null }),
      })
      if (res.ok) {
        showToast('Broadcast sent')
        setMessage(''); setActionUrl(''); setActionText('')
        setCreating(false); onRefresh()
      }
    } catch { showToast('Failed to send') }
    setSaving(false)
  }

  async function toggleBroadcast(id: string, isActive: boolean) {
    await (supabase.from('announcements') as any).update({ is_active: !isActive }).eq('id', id)
    onRefresh()
  }

  async function deleteBroadcast(id: string) {
    await (supabase.from('announcements') as any).delete().eq('id', id)
    onRefresh()
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}` }}>
          <p className="text-[13px] font-semibold" style={{ color: C.lime }}>{toast}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <SectionHeader title="ANNOUNCEMENT BROADCASTS" sub="Banner messages shown on user dashboards" />
        <button onClick={() => setCreating(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold"
          style={{ backgroundColor: creating ? C.border : C.dark, color: creating ? C.muted : C.lime }}>
          <Plus size={13} /> New Broadcast
        </button>
      </div>

      {creating && (
        <div className="p-5 rounded-2xl border" style={{ borderColor: C.lime, backgroundColor: C.limeTint }}>
          <p className="text-[13px] font-black mb-4" style={{ color: C.limeDeep }}>New Broadcast</p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>MESSAGE</p>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Type your announcement..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
                style={{ borderColor: message ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>TARGET</p>
                <select value={target} onChange={e => setTarget(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }}>
                  <option value="all">All Users</option>
                  <option value="free">Free Users</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>ACTION TEXT (optional)</p>
                <input value={actionText} onChange={e => setActionText(e.target.value)} placeholder="e.g. Learn more"
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>ACTION URL (optional)</p>
                <input value={actionUrl} onChange={e => setActionUrl(e.target.value)} placeholder="https://..."
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: '#fff', color: C.dark }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createBroadcast} disabled={saving || !message.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold disabled:opacity-50"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                {saving ? <RefreshCw size={12} className="animate-spin" /> : <Megaphone size={12} />}
                Send Broadcast
              </button>
              <button onClick={() => setCreating(false)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold border"
                style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {broadcasts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Megaphone size={32} style={{ color: C.muted }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No broadcasts yet</p>
          <p className="text-[12px]" style={{ color: C.muted }}>Send an announcement to all users</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {broadcasts.map((b: any) => (
            <div key={b.id} className="flex items-center gap-3 p-4 rounded-2xl border"
                 style={{ backgroundColor: b.is_active ? C.limeTint : C.surface, borderColor: b.is_active ? 'rgba(143,255,0,0.3)' : C.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: b.is_active ? 'rgba(143,255,0,0.2)' : C.bg }}>
                <Megaphone size={14} style={{ color: b.is_active ? C.limeDeep : C.muted }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate" style={{ color: C.dark }}>{b.message}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  {b.target} · {timeAgo(b.created_at)}
                  {b.expires_at && ` · expires ${new Date(b.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: b.is_active ? C.limeTint : C.bg, color: b.is_active ? C.limeDeep : C.muted, border: `1px solid ${b.is_active ? 'rgba(143,255,0,0.3)' : C.border}` }}>
                  {b.is_active ? 'Live' : 'Inactive'}
                </span>
                <button onClick={() => toggleBroadcast(b.id, b.is_active)}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg border hover:opacity-70"
                  style={{ borderColor: C.border, color: C.muted }}>
                  {b.is_active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => deleteBroadcast(b.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
                  style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                  <Trash2 size={12} style={{ color: C.red }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// SUPPRESSED / UNSUBSCRIBES
// --------------------------------------------------------------
function SuppressedSection({ suppressed, supabase, onRefresh }: { suppressed: any[]; supabase: any; onRefresh: () => void }) {
  const [search, setSearch] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)

  async function removeFromSuppression(id: string) {
    setRemoving(id)
    try {
      await (supabase.from('email_suppressions') as any).delete().eq('id', id)
      onRefresh()
    } catch {}
    setRemoving(null)
  }

  const filtered = suppressed.filter(s =>
    !search || (s.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title="UNSUBSCRIBES" sub={`${suppressed.length} suppressed emails`} />

      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
           style={{ backgroundColor: 'rgba(185,28,28,0.06)', borderColor: 'rgba(185,28,28,0.2)' }}>
        <AlertTriangle size={16} style={{ color: C.red }} />
        <p className="text-[13px]" style={{ color: C.red }}>
          Emails on this list will never receive campaign emails. Remove carefully.
        </p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border text-[13px] outline-none"
          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.dark }} />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <UserX size={32} style={{ color: C.muted }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            {suppressed.length === 0 ? 'No unsubscribes yet' : 'No results found'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {['EMAIL', 'REASON', 'DATE', 'ACTION'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black tracking-wider"
                      style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any, i: number) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', backgroundColor: C.surface }}>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold" style={{ color: C.dark }}>{s.email ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: C.muted }}>{s.reason ?? 'Unsubscribed'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeFromSuppression(s.id)} disabled={removing === s.id}
                      className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all hover:opacity-70 disabled:opacity-50"
                      style={{ borderColor: C.border, color: C.muted }}>
                      {removing === s.id ? <RefreshCw size={11} className="animate-spin" /> : <X size={11} />}
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// AB TEST MANAGER
// --------------------------------------------------------------
function ABTestSection({ supabase }: { supabase: any }) {
  const [tests,      setTests]      = useState<any[]>([])
  const [creating,   setCreating]   = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [nameA,      setNameA]      = useState('')
  const [nameB,      setNameB]      = useState('')
  const [subjectA,   setSubjectA]   = useState('')
  const [subjectB,   setSubjectB]   = useState('')
  const [testName,   setTestName]   = useState('')
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => { loadTests() }, [])

  async function loadTests() {
    setLoading(true)
    try {
      const { data } = await (supabase.from('ab_tests') as any)
        .select('*').order('created_at', { ascending: false })
      setTests(data ?? [])
    } catch {}
    setLoading(false)
  }

  async function createTest() {
    if (!testName.trim() || !subjectA.trim() || !subjectB.trim()) return
    setSaving(true)
    try {
      await (supabase.from('ab_tests') as any).insert({
        name:        testName.trim(),
        variant_a:   { subject: subjectA.trim(), label: nameA || 'Variant A' },
        variant_b:   { subject: subjectB.trim(), label: nameB || 'Variant B' },
        status:      'active',
        clicks_a:    0,
        clicks_b:    0,
        views_a:     0,
        views_b:     0,
        created_at:  new Date().toISOString(),
      })
      showToast('A/B test created')
      setTestName(''); setSubjectA(''); setSubjectB(''); setNameA(''); setNameB('')
      setCreating(false)
      loadTests()
    } catch { showToast('Failed to create test') }
    setSaving(false)
  }

  async function declareWinner(id: string, winner: 'a' | 'b') {
    try {
      await (supabase.from('ab_tests') as any)
        .update({ status: 'completed', winner, completed_at: new Date().toISOString() })
        .eq('id', id)
      showToast(`Variant ${winner.toUpperCase()} declared winner`)
      loadTests()
    } catch {}
  }

  async function deleteTest(id: string) {
    try {
      await (supabase.from('ab_tests') as any).delete().eq('id', id)
      loadTests()
    } catch {}
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl"
             style={{ backgroundColor: C.dark, border: `1px solid ${C.lime}` }}>
          <p className="text-[13px] font-semibold" style={{ color: C.lime }}>{toast}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <SectionHeader title="A/B TEST MANAGER" sub="Test subject lines to find what converts best" />
        <button onClick={() => setCreating(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold"
          style={{ backgroundColor: creating ? C.border : C.dark, color: creating ? C.muted : C.lime }}>
          <Plus size={13} /> New A/B Test
        </button>
      </div>

      {creating && (
        <div className="p-5 rounded-2xl border" style={{ borderColor: C.lime, backgroundColor: C.limeTint }}>
          <p className="text-[13px] font-black mb-4" style={{ color: C.limeDeep }}>Create A/B Test</p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>TEST NAME</p>
              <input value={testName} onChange={e => setTestName(e.target.value)}
                placeholder="e.g. Trial ending subject test"
                className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                style={{ borderColor: testName ? C.lime : C.border, backgroundColor: '#fff', color: C.dark }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                <p className="text-[11px] font-black mb-2" style={{ color: C.limeDeep }}>VARIANT A</p>
                <input value={nameA} onChange={e => setNameA(e.target.value)}
                  placeholder="Label (optional)"
                  className="w-full h-8 px-3 rounded-lg border text-[11px] outline-none mb-2"
                  style={{ borderColor: C.border, backgroundColor: C.bg, color: C.dark }} />
                <textarea value={subjectA} onChange={e => setSubjectA(e.target.value)}
                  placeholder="Subject line A..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none resize-none"
                  style={{ borderColor: subjectA ? C.lime : C.border, backgroundColor: C.bg, color: C.dark }} />
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: C.border, backgroundColor: '#fff' }}>
                <p className="text-[11px] font-black mb-2" style={{ color: C.blue }}>VARIANT B</p>
                <input value={nameB} onChange={e => setNameB(e.target.value)}
                  placeholder="Label (optional)"
                  className="w-full h-8 px-3 rounded-lg border text-[11px] outline-none mb-2"
                  style={{ borderColor: C.border, backgroundColor: C.bg, color: C.dark }} />
                <textarea value={subjectB} onChange={e => setSubjectB(e.target.value)}
                  placeholder="Subject line B..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none resize-none"
                  style={{ borderColor: subjectB ? C.blue : C.border, backgroundColor: C.bg, color: C.dark }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createTest} disabled={saving || !testName || !subjectA || !subjectB}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold disabled:opacity-50"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                {saving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                Create Test
              </button>
              <button onClick={() => setCreating(false)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold border"
                style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <BarChart2 size={32} style={{ color: C.muted }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No A/B tests yet</p>
          <p className="text-[12px]" style={{ color: C.muted }}>Create a test to optimize your subject lines</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tests.map((test: any) => {
            const totalA   = test.views_a ?? 0
            const totalB   = test.views_b ?? 0
            const clickA   = test.clicks_a ?? 0
            const clickB   = test.clicks_b ?? 0
            const rateA    = totalA > 0 ? Math.round((clickA / totalA) * 100) : 0
            const rateB    = totalB > 0 ? Math.round((clickB / totalB) * 100) : 0
            const isActive = test.status === 'active'
            const winner   = test.winner
            return (
              <div key={test.id} className="p-5 rounded-2xl border"
                   style={{ backgroundColor: C.surface, borderColor: isActive ? C.border : 'rgba(143,255,0,0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[14px] font-black" style={{ color: C.dark }}>{test.name}</p>
                    <p className="text-[11px]" style={{ color: C.muted }}>
                      {isActive ? 'Running' : `Completed · Winner: Variant ${(winner ?? '?').toUpperCase()}`}
                      {' · '}{timeAgo(test.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <>
                        <button onClick={() => declareWinner(test.id, 'a')}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold border hover:opacity-80"
                          style={{ borderColor: C.lime, color: C.limeDeep, backgroundColor: C.limeTint }}>
                          A Wins
                        </button>
                        <button onClick={() => declareWinner(test.id, 'b')}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold border hover:opacity-80"
                          style={{ borderColor: C.blue, color: C.blue, backgroundColor: 'rgba(29,78,216,0.06)' }}>
                          B Wins
                        </button>
                      </>
                    )}
                    <button onClick={() => deleteTest(test.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
                      style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                      <Trash2 size={12} style={{ color: C.red }} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: test.variant_a?.label ?? 'Variant A', subject: test.variant_a?.subject, views: totalA, clicks: clickA, rate: rateA, color: C.limeDeep, bg: C.limeTint, isWinner: winner === 'a' },
                    { label: test.variant_b?.label ?? 'Variant B', subject: test.variant_b?.subject, views: totalB, clicks: clickB, rate: rateB, color: C.blue,     bg: 'rgba(29,78,216,0.06)', isWinner: winner === 'b' },
                  ].map((v, i) => (
                    <div key={i} className="p-4 rounded-xl border"
                         style={{ borderColor: v.isWinner ? v.color : C.border, backgroundColor: v.isWinner ? v.bg : C.bg }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-black" style={{ color: v.color }}>{v.label}</p>
                        {v.isWinner && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: v.color, color: '#fff' }}>WINNER</span>
                        )}
                      </div>
                      <p className="text-[12px] font-semibold mb-3 leading-snug" style={{ color: C.dark }}>{v.subject}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Sent',  value: v.views  },
                          { label: 'Clicks',value: v.clicks },
                          { label: 'Rate',  value: `${v.rate}%` },
                        ].map(m => (
                          <div key={m.label} className="text-center">
                            <p className="text-[16px] font-extrabold" style={{ color: v.color }}>{m.value}</p>
                            <p className="text-[9px] font-bold" style={{ color: C.muted }}>{m.label}</p>
                          </div>
                        ))}
                      </div>
                      {v.views > 0 && (
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                          <div className="h-full rounded-full" style={{ width: `${v.rate}%`, backgroundColor: v.color }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------
// REVENUE ATTRIBUTION
// --------------------------------------------------------------
function RevenueAttributionSection({ supabase }: { supabase: any }) {
  const [data,    setData]    = useState<any>({ byTemplate: [], byPromo: [], totalAttributed: 0, totalCampaigns: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [{ data: txns }, { data: emails }, { data: promos }] = await Promise.all([
        (supabase.from('transactions') as any).select('user_id, amount, status, created_at'),
        (supabase.from('sent_messages') as any).select('user_id, template_name, sent_at'),
        (supabase.from('promo_codes') as any).select('code, used_count, discount_value, discount_type'),
      ])

      const paidUserIds = new Set(
        (txns ?? []).filter((t: any) => t.status === 'paid' || t.status === 'active').map((t: any) => t.user_id)
      )
      const emailMap: Record<string, string[]> = {}
      for (const e of (emails ?? []) as any[]) {
        if (!emailMap[e.user_id]) emailMap[e.user_id] = []
        emailMap[e.user_id].push(e.template_name)
      }

      // Revenue by template
      const templateMap: Record<string, { sent: number; converted: number; revenue: number }> = {}
      for (const e of (emails ?? []) as any[]) {
        const key = e.template_name ?? 'unknown'
        if (!templateMap[key]) templateMap[key] = { sent: 0, converted: 0, revenue: 0 }
        templateMap[key].sent++
        if (paidUserIds.has(e.user_id)) {
          templateMap[key].converted++
          const userTxns = (txns ?? []).filter((t: any) => t.user_id === e.user_id && (t.status === 'paid' || t.status === 'active'))
          templateMap[key].revenue += userTxns.reduce((s: number, t: any) => s + parseFloat(t.amount ?? 0), 0)
        }
      }

      const byTemplate = Object.entries(templateMap).map(([name, d]) => ({
        name, ...d, convRate: d.sent > 0 ? Math.round((d.converted / d.sent) * 100) : 0,
      })).sort((a, b) => b.revenue - a.revenue)

      const byPromo = (promos ?? []).map((p: any) => ({
        code:     p.code,
        uses:     p.used_count ?? 0,
        discount: p.discount_type === 'percent' ? `${p.discount_value}%` : `$${p.discount_value}`,
      })).sort((a: any, b: any) => b.uses - a.uses)

      const totalAttributed = byTemplate.reduce((s, t) => s + t.revenue, 0)

      setData({ byTemplate, byPromo, totalAttributed, totalCampaigns: byTemplate.length })
    } catch {}
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="REVENUE ATTRIBUTION" sub="Which campaigns and promos drive conversions" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Attributed Revenue', value: `$${data.totalAttributed.toFixed(2)}`, color: C.green,    icon: DollarSign },
          { label: 'Campaign Templates',        value: data.totalCampaigns,                   color: C.limeDeep, icon: Mail       },
          { label: 'Promo Codes Used',          value: data.byPromo.reduce((s: number, p: any) => s + p.uses, 0), color: C.amber, icon: Tag },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold" style={{ color: C.muted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* By template */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[13px] font-black mb-3" style={{ color: C.dark }}>Revenue by Template</p>
          {data.byTemplate.length === 0 ? (
            <p className="text-[12px] text-center py-6" style={{ color: C.muted }}>No campaign data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.byTemplate.map((t: any) => (
                <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate capitalize" style={{ color: C.dark }}>
                      {t.name.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {t.sent} sent · {t.converted} converted · {t.convRate}% rate
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-extrabold" style={{ color: C.green }}>
                      ${t.revenue.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By promo */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[13px] font-black mb-3" style={{ color: C.dark }}>Promo Code Performance</p>
          {data.byPromo.length === 0 ? (
            <p className="text-[12px] text-center py-6" style={{ color: C.muted }}>No promo codes yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.byPromo.map((p: any) => (
                <div key={p.code} className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-mono font-bold" style={{ color: C.dark }}>{p.code}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>{p.discount} discount</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-extrabold" style={{ color: C.amber }}>{p.uses}</p>
                    <p className="text-[9px]" style={{ color: C.muted }}>uses</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------
// REFERRAL PROGRAM
// --------------------------------------------------------------
function ReferralSection({ supabase }: { supabase: any }) {
  const [referrals, setReferrals] = useState<any[]>([])
  const [affiliates,setAffiliates]= useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [stats,     setStats]     = useState({ totalReferrals: 0, pending: 0, paid: 0, totalEarned: 0 })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [{ data: refs }, { data: affs }] = await Promise.all([
        (supabase.from('affiliate_referrals') as any)
          .select('*, affiliate:affiliate_id(name, email, commission_rate)')
          .order('created_at', { ascending: false })
          .limit(50),
        (supabase.from('affiliates') as any)
          .select('*')
          .order('created_at', { ascending: false }),
      ])
      setReferrals(refs ?? [])
      setAffiliates(affs ?? [])

      const refList = (refs ?? []) as any[]
      const pending  = refList.filter((r: any) => r.status === 'pending').length
      const paid     = refList.filter((r: any) => r.status === 'paid').length
      const earned   = refList.filter((r: any) => r.status === 'paid').reduce((s: number, r: any) => s + parseFloat(r.commission_amount ?? 0), 0)
      setStats({ totalReferrals: refList.length, pending, paid, totalEarned: earned })
    } catch {}
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <RefreshCw size={24} className="animate-spin" style={{ color: C.limeDeep }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="REFERRAL PROGRAM" sub="Users who refer friends earn commission" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Referrals', value: stats.totalReferrals, color: C.blue,    icon: Users      },
          { label: 'Affiliates',      value: affiliates.length,    color: C.limeDeep,icon: Target     },
          { label: 'Pending Payouts', value: stats.pending,        color: C.amber,   icon: Clock      },
          { label: 'Total Earned',    value: `$${stats.totalEarned.toFixed(2)}`, color: C.green, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: s.color + '18' }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[18px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-bold" style={{ color: C.muted }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Affiliates list */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[13px] font-black mb-3" style={{ color: C.dark }}>Active Affiliates</p>
          {affiliates.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Users size={24} style={{ color: C.muted }} />
              <p className="text-[12px]" style={{ color: C.muted }}>No affiliates yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
              {affiliates.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                       style={{ backgroundColor: C.limeDeep }}>
                    {(a.name ?? a.email ?? 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>{a.name ?? a.email}</p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {a.commission_rate ?? 20}% commission · {a.status ?? 'active'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    {referrals.filter((r: any) => r.affiliate_id === a.id).length} refs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent referrals */}
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[13px] font-black mb-3" style={{ color: C.dark }}>Recent Referrals</p>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <ArrowRight size={24} style={{ color: C.muted }} />
              <p className="text-[12px]" style={{ color: C.muted }}>No referrals yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
              {referrals.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                     style={{ backgroundColor: C.bg }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold" style={{ color: C.dark }}>
                      {r.affiliate?.name ?? r.affiliate?.email ?? 'Unknown affiliate'}
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {timeAgo(r.created_at)} · ${parseFloat(r.commission_amount ?? 0).toFixed(2)} commission
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: r.status === 'paid' ? C.limeTint : r.status === 'pending' ? 'rgba(217,119,6,0.1)' : C.bg,
                          color:           r.status === 'paid' ? C.limeDeep : r.status === 'pending' ? C.amber : C.muted,
                        }}>
                    {r.status ?? 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
