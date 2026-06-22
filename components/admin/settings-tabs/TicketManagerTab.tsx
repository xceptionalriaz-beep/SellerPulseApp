'use client'
// components/admin/settings-tabs/TicketManagerTab.tsx
// Full ticket management tab for admin panel

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  MessageCircle, Bug, HelpCircle, Lightbulb,
  CheckCircle, Clock, AlertTriangle, XCircle,
  Search, RefreshCw, ChevronRight, X, Send,
  User, Calendar, Tag, Flag, FileText,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  dark:     '#0a0d08',
  border:   '#e8ede2',
  bg:       '#f9fdf4',
  surface:  '#ffffff',
  text:     '#0a0d08',
  muted:    '#8a9e78',
  red:      '#b91c1c',
  amber:    '#d97706',
  green:    '#16a34a',
  blue:     '#2563eb',
}

// ── Helpers ────────────────────────────────────────────────────
function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function typeConfig(type: string) {
  switch (type) {
    case 'bug':     return { label: 'Bug',     color: C.red,   bg: 'rgba(185,28,28,0.08)',  Icon: Bug         }
    case 'feature': return { label: 'Feature', color: C.blue,  bg: 'rgba(37,99,235,0.08)',  Icon: Lightbulb   }
    default:        return { label: 'Question',color: C.amber, bg: 'rgba(217,119,6,0.08)',  Icon: HelpCircle  }
  }
}

function statusConfig(status: string) {
  switch (status) {
    case 'open':        return { label: 'Open',        color: C.amber, bg: 'rgba(217,119,6,0.08)',  dot: C.amber  }
    case 'in_progress': return { label: 'In Progress', color: C.blue,  bg: 'rgba(37,99,235,0.08)',  dot: C.blue   }
    case 'resolved':    return { label: 'Resolved',    color: C.green, bg: 'rgba(22,163,74,0.08)',  dot: C.green  }
    case 'closed':      return { label: 'Closed',      color: C.muted, bg: 'rgba(138,158,120,0.08)',dot: C.muted  }
    default:            return { label: status,        color: C.muted, bg: C.bg,                   dot: C.muted  }
  }
}

function priorityConfig(priority: string) {
  switch (priority) {
    case 'urgent': return { label: 'Urgent', color: C.red   }
    case 'high':   return { label: 'High',   color: C.amber }
    case 'medium': return { label: 'Medium', color: C.blue  }
    default:       return { label: 'Low',    color: C.muted }
  }
}

// ── Main component ─────────────────────────────────────────────
export default function TicketManagerTab() {
  const supabase = createClient()

  const [tickets,       setTickets]       = useState<any[]>([])
  const [replies,       setReplies]       = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)
  const [selected,      setSelected]      = useState<any | null>(null)
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [filterType,    setFilterType]    = useState('all')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [replyText,     setReplyText]     = useState('')
  const [adminNote,     setAdminNote]     = useState('')
  const [sending,       setSending]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load tickets ───────────────────────────────────────────
  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await (supabase.from('tickets') as any)
        .select('*, profiles(full_name, email, plan_name)')
        .order('created_at', { ascending: false })
      setTickets((data ?? []) as any[])
    } catch (e) {
      console.error('[TicketManagerTab]', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadTickets() }, [loadTickets])

  // ── Load replies for selected ticket ──────────────────────
  async function loadReplies(ticketId: string) {
    const { data } = await (supabase.from('ticket_replies') as any)
      .select('*, profiles(full_name, email)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setReplies((data ?? []) as any[])
  }

  // ── Select ticket ──────────────────────────────────────────
  function selectTicket(ticket: any) {
    setSelected(ticket)
    setReplyText('')
    setAdminNote(ticket.admin_note ?? '')
    loadReplies(ticket.id)
  }

  // ── Update ticket status/priority ─────────────────────────
  async function updateTicket(id: string, updates: Record<string, any>) {
    setSaving(true)
    try {
      await (supabase.from('tickets') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
      if (selected?.id === id) setSelected((s: any) => ({ ...s, ...updates }))
      showToast('Updated successfully')
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  // ── Send reply ─────────────────────────────────────────────
  async function sendReply() {
    if (!replyText.trim() || !selected) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await (supabase.from('ticket_replies') as any).insert({
        ticket_id:   selected.id,
        author_id:   user?.id,
        author_type: 'admin',
        message:     replyText.trim(),
        created_at:  new Date().toISOString(),
      })
      // Update ticket status to in_progress if open
      if (selected.status === 'open') {
        await updateTicket(selected.id, { status: 'in_progress' })
      }
      setReplyText('')
      await loadReplies(selected.id)
      showToast('Reply sent!')
    } catch {
      showToast('Failed to send reply', 'error')
    }
    setSending(false)
  }

  // ── Save admin note ────────────────────────────────────────
  async function saveNote() {
    if (!selected) return
    await updateTicket(selected.id, { admin_note: adminNote })
  }

  // ── Filtered tickets ───────────────────────────────────────
  const filtered = tickets
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => filterType   === 'all' || t.type   === filterType)
    .filter(t => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        t.title?.toLowerCase().includes(q) ||
        t.user_email?.toLowerCase().includes(q) ||
        t.profiles?.email?.toLowerCase().includes(q)
      )
    })

  // ── HUD stats ─────────────────────────────────────────────
  const openCount     = tickets.filter(t => t.status === 'open').length
  const bugCount      = tickets.filter(t => t.type === 'bug').length
  const resolvedToday = tickets.filter(t => {
    const today = new Date(); today.setHours(0,0,0,0)
    return t.status === 'resolved' && t.resolved_at && new Date(t.resolved_at) >= today
  }).length
  const inProgress = tickets.filter(t => t.status === 'in_progress').length

  return (
    <div className="flex flex-col gap-6 p-6" style={{ backgroundColor: C.bg, minHeight: '100vh' }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg text-[13px] font-bold"
             style={{ backgroundColor: toast.type === 'success' ? C.dark : C.red, color: toast.type === 'success' ? C.lime : '#fff' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-black" style={{ color: C.dark }}>Support Tickets</h2>
          <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>
            Manage user support requests and bug reports
          </p>
        </div>
        <button onClick={loadTickets}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:opacity-70 text-[12px] font-bold"
          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* HUD Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Open Tickets',    value: openCount,     icon: AlertTriangle, color: C.amber, bg: 'rgba(217,119,6,0.08)'  },
          { title: 'Bug Reports',     value: bugCount,      icon: Bug,           color: C.red,   bg: 'rgba(185,28,28,0.08)'  },
          { title: 'In Progress',     value: inProgress,    icon: Clock,         color: C.blue,  bg: 'rgba(37,99,235,0.08)'  },
          { title: 'Resolved Today',  value: resolvedToday, icon: CheckCircle,   color: C.green, bg: 'rgba(22,163,74,0.08)'  },
        ].map((card, i) => (
          <div key={i} className="p-4 rounded-2xl border flex items-center gap-3"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: card.bg }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-[22px] font-black leading-none" style={{ color: C.dark }}>{card.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex gap-4" style={{ minHeight: 600 }}>

        {/* Ticket list */}
        <div className="flex flex-col rounded-2xl border overflow-hidden"
             style={{ backgroundColor: C.surface, borderColor: C.border, width: selected ? '40%' : '100%', transition: 'width 0.2s' }}>

          {/* List header */}
          <div className="p-4 border-b" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            {/* Search */}
            <div className="relative mb-3">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title or email..."
                className="w-full h-8 pl-8 pr-3 rounded-xl border text-[11px] outline-none"
                style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {['all','open','in_progress','resolved','closed'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all"
                  style={{
                    backgroundColor: filterStatus === s ? C.dark    : C.surface,
                    color:           filterStatus === s ? C.lime    : C.muted,
                    border:          `1px solid ${filterStatus === s ? C.dark : C.border}`,
                  }}>
                  {s.replace('_', ' ')}
                </button>
              ))}
              <div style={{ width: 1, height: 16, backgroundColor: C.border }} />
              {['all','bug','question','feature'].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all"
                  style={{
                    backgroundColor: filterType === t ? C.dark    : C.surface,
                    color:           filterType === t ? C.lime    : C.muted,
                    border:          `1px solid ${filterType === t ? C.dark : C.border}`,
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket rows */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
                     style={{ borderTopColor: C.lime }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <MessageCircle size={28} style={{ color: C.border }} />
                <p className="text-[13px] font-bold" style={{ color: C.muted }}>No tickets found</p>
              </div>
            ) : (
              filtered.map(ticket => {
                const tc = typeConfig(ticket.type)
                const sc = statusConfig(ticket.status)
                const isSelected = selected?.id === ticket.id
                return (
                  <div key={ticket.id}
                    onClick={() => selectTicket(ticket)}
                    className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer hover:opacity-80 transition-all"
                    style={{
                      borderColor:     C.border,
                      backgroundColor: isSelected ? C.limeTint : 'transparent',
                    }}>
                    {/* Type icon */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                         style={{ backgroundColor: tc.bg }}>
                      <tc.Icon size={14} style={{ color: tc.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>
                          {ticket.title}
                        </p>
                        <span className="text-[9px] font-bold shrink-0" style={{ color: C.muted }}>
                          {timeAgo(ticket.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] truncate mb-1.5" style={{ color: C.muted }}>
                        {ticket.profiles?.email ?? ticket.user_email ?? 'Unknown user'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {/* Status */}
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                          <span className="text-[9px] font-bold capitalize" style={{ color: sc.color }}>
                            {sc.label}
                          </span>
                        </div>
                        {/* Priority */}
                        {ticket.priority && ticket.priority !== 'medium' && (
                          <span className="text-[9px] font-bold"
                                style={{ color: priorityConfig(ticket.priority).color }}>
                            · {priorityConfig(ticket.priority).label}
                          </span>
                        )}
                        {/* Plan */}
                        {ticket.profiles?.plan_name && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold ml-auto"
                                style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                            {ticket.profiles.plan_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={12} style={{ color: C.muted, marginTop: 4 }} />
                  </div>
                )
              })
            )}
          </div>

          {/* List footer */}
          <div className="px-4 py-2 border-t text-[11px]" style={{ borderColor: C.border, color: C.muted }}>
            Showing {filtered.length} of {tickets.length} tickets
          </div>
        </div>

        {/* Ticket detail panel */}
        {selected && (
          <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>

            {/* Detail header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div className="flex items-center gap-3">
                {(() => {
                  const tc = typeConfig(selected.type)
                  return (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                         style={{ backgroundColor: tc.bg }}>
                      <tc.Icon size={16} style={{ color: tc.color }} />
                    </div>
                  )
                })()}
                <div>
                  <p className="text-[14px] font-black" style={{ color: C.dark }}>{selected.title}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {selected.profiles?.email ?? selected.user_email}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
                style={{ border: `1px solid ${C.border}` }}>
                <X size={14} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

              {/* User info */}
              <div className="p-4 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>USER INFO</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name',    value: selected.profiles?.full_name ?? '—',          icon: User     },
                    { label: 'Email',   value: selected.profiles?.email ?? selected.user_email ?? '—', icon: MessageCircle },
                    { label: 'Plan',    value: selected.profiles?.plan_name ?? '—',           icon: Tag      },
                    { label: 'Submitted', value: timeAgo(selected.created_at),               icon: Calendar },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <row.icon size={12} style={{ color: C.muted }} />
                      <div>
                        <p className="text-[9px] font-bold" style={{ color: C.muted }}>{row.label}</p>
                        <p className="text-[12px] font-semibold truncate" style={{ color: C.text, maxWidth: 140 }}>{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket description */}
              <div className="p-4 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>DESCRIPTION</p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>
                  {selected.description ?? 'No description provided.'}
                </p>
              </div>

              {/* Status + Priority controls */}
              <div className="grid grid-cols-2 gap-3">
                {/* Status */}
                <div>
                  <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>STATUS</p>
                  <div className="flex flex-col gap-1.5">
                    {['open','in_progress','resolved','closed'].map(s => {
                      const sc = statusConfig(s)
                      return (
                        <button key={s} onClick={() => updateTicket(selected.id, { status: s, ...(s === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold capitalize transition-all text-left"
                          style={{
                            borderColor:     selected.status === s ? sc.dot : C.border,
                            backgroundColor: selected.status === s ? sc.bg  : 'transparent',
                            color:           selected.status === s ? sc.color : C.muted,
                          }}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                          {sc.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>PRIORITY</p>
                  <div className="flex flex-col gap-1.5">
                    {['low','medium','high','urgent'].map(p => {
                      const pc = priorityConfig(p)
                      return (
                        <button key={p} onClick={() => updateTicket(selected.id, { priority: p })}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold capitalize transition-all text-left"
                          style={{
                            borderColor:     selected.priority === p ? pc.color : C.border,
                            backgroundColor: selected.priority === p ? pc.color + '15' : 'transparent',
                            color:           selected.priority === p ? pc.color : C.muted,
                          }}>
                          <Flag size={10} style={{ color: pc.color }} />
                          {pc.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>CONVERSATION</p>
                  <div className="flex flex-col gap-2">
                    {replies.map((r, i) => (
                      <div key={i} className={`flex ${r.author_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className="px-3 py-2 rounded-2xl max-w-[80%]"
                             style={{
                               backgroundColor: r.author_type === 'admin' ? C.dark : C.bg,
                               color:           r.author_type === 'admin' ? '#fff'  : C.text,
                               border:          r.author_type === 'admin' ? 'none'  : `1px solid ${C.border}`,
                             }}>
                          <p className="text-[12px] leading-relaxed">{r.message}</p>
                          <p className="text-[9px] mt-1 opacity-60">{timeAgo(r.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin note */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>
                  INTERNAL NOTE
                </p>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Add internal note (not visible to user)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }} />
              </div>
            </div>

            {/* Reply input */}
            <div className="px-5 py-4 border-t" style={{ borderColor: C.border }}>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>REPLY TO USER</p>
              <div className="flex gap-2">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl border text-[12px] outline-none resize-none"
                  style={{ backgroundColor: C.bg, borderColor: C.border, color: C.text }} />
                <button onClick={sendReply} disabled={sending || !replyText.trim()}
                  className="px-3 rounded-xl font-bold text-[12px] flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                  style={{ backgroundColor: C.dark, color: C.lime, minWidth: 60 }}>
                  {sending ? (
                    <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                         style={{ borderTopColor: C.lime }} />
                  ) : (
                    <><Send size={14} /><span>Send</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}