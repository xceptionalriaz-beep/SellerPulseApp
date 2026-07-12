'use client'
// components/admin/settings-tabs/TicketManagerTab.tsx
// Full ticket management tab for admin panel

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  MessageCircle, Bug, HelpCircle, Lightbulb,
  CheckCircle, Clock, AlertTriangle, XCircle,
  Search, RefreshCw, ChevronRight, X, Send,
  User, Calendar, Tag, Flag, FileText, Trash2, Download,
} from 'lucide-react'

// -- Design tokens ----------------------------------------------
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

// -- Helpers ----------------------------------------------------
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

// -- Main component ---------------------------------------------

export default function TicketManagerTab({ onOpenCount }: { onOpenCount?: (count: number) => void }) {
  const { can } = useTabPermissions('tickets')
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
  const [confirmClean,  setConfirmClean]  = useState(false)
  const [cleaning,      setCleaning]      = useState(false)
  const [sending,       setSending]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // -- Load tickets -------------------------------------------
  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await (supabase.from('tickets') as any)
        .select('*, profiles(name, email, plan_name)')
        .order('created_at', { ascending: false })
      setTickets((data ?? []) as any[])
      onOpenCount?.((data ?? []).filter((t: any) => t.status === 'open').length)
    } catch (e) {
      console.error('[TicketManagerTab]', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadTickets() }, [loadTickets])

  // -- Load replies for selected ticket ----------------------
  async function loadReplies(ticketId: string) {
    const { data } = await (supabase.from('ticket_replies') as any)
      .select('*, profiles(full_name, email)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setReplies((data ?? []) as any[])
  }

  // -- Select ticket ------------------------------------------
  function selectTicket(ticket: any) {
    setSelected(ticket)
    setReplyText('')
    setAdminNote(ticket.admin_note ?? '')
    loadReplies(ticket.id)
  }

  // -- Update ticket status/priority -------------------------
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

  // -- Send reply ---------------------------------------------
  async function sendReply() {
    if (!replyText.trim() || !selected) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()

      // Save reply to DB
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

      // Send email notification to user
      const userEmail = selected.profiles?.email ?? selected.user_email
      if (userEmail && session?.access_token) {
        try {
          await fetch('/api/admin/send-email', {
            method:  'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              to:      userEmail,
              subject: `Re: ${selected.title} — Riazify Support`,
              html:    `<p>Hi,</p><p>Our support team has replied to your ticket:</p><blockquote>${replyText.trim()}</blockquote><p>You can view your ticket by logging into your Riazify dashboard.</p><p>— Riazify Support</p>`,
            }),
          })
        } catch { /* non-critical — reply still saved */ }
      }

      setReplyText('')
      await loadReplies(selected.id)
      showToast('Reply sent!')
    } catch {
      showToast('Failed to send reply', 'error')
    }
    setSending(false)
  }

  // -- Save admin note ----------------------------------------
  async function saveNote() {
    if (!selected) return
    await updateTicket(selected.id, { admin_note: adminNote })
  }

  // -- Delete ticket ------------------------------------------
  async function deleteTicket(id: string) {
    if (!confirm('Delete this ticket? This cannot be undone.')) return
    try {
      await (supabase.from('tickets') as any).delete().eq('id', id)
      setTickets(prev => prev.filter(t => t.id !== id))
      if (selected?.id === id) setSelected(null)
      showToast('Ticket deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  // -- Export tickets as CSV ----------------------------------
  function exportCSV() {
    const rows = [
      ['ID', 'Title', 'Type', 'Status', 'Priority', 'User Email', 'Plan', 'Created'],
      ...filtered.map(t => [
        t.id,
        t.title,
        t.type,
        t.status,
        t.priority ?? 'medium',
        t.profiles?.email ?? t.user_email ?? '',
        t.profiles?.plan_name ?? '',
        new Date(t.created_at).toLocaleDateString(),
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `tickets-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // -- Filtered tickets ---------------------------------------
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

  // -- HUD stats ---------------------------------------------
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
             style={{ backgroundColor: toast.type === 'success' ? '#8fff00' : C.red, color: toast.type === 'success' ? '#1a2410' : '#fff' }}>
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
        <div className="flex items-center gap-2">
          {can('delete_ticket') && <button onClick={() => setConfirmClean(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:opacity-70 text-[12px] font-bold"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <Trash2 size={13} /> Clean Old
          </button>}
          {can('export_tickets') && <button onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:opacity-70 text-[12px] font-bold"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <Download size={13} /> Export
          </button>}
          <button onClick={loadTickets}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:opacity-70 text-[12px] font-bold"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
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
          <div className="px-4 py-3 border-b flex items-center gap-2 flex-wrap"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>

            {/* Status filters */}
            {['all','open','in_progress','resolved','closed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all"
                style={{
                  backgroundColor: filterStatus === s ? '#8fff00' : C.surface,
                  color: filterStatus === s ? '#1a2410' : C.muted,
                  border:          `1px solid ${filterStatus === s ? '#8fff00' : C.border}`,
                }}>
                {s.replace('_', ' ')}
              </button>
            ))}

            <div style={{ width: 1, height: 16, backgroundColor: C.border }} />

            {/* Type filters */}
            {['all','bug','question','feature'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all"
                style={{
                  backgroundColor: filterType === t ? '#8fff00' : C.surface,
                  color:           filterType === t ? '#1a2410' : C.muted,
                  border:          `1px solid ${filterType === t ? '#8fff00' : C.border}`,
                }}>
                {t}
              </button>
            ))}

            {/* Search — pushed to right */}
            <div className="relative ml-auto" style={{ minWidth: 180 }}>
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 pl-8 pr-3 rounded-xl border text-[11px] outline-none w-full"
                style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
            </div>
          </div>

          {/* Column headers */}
          <div className="grid px-4 py-2 border-b text-[9px] font-black tracking-wider"
               style={{ borderColor: C.border, backgroundColor: C.bg, color: C.muted,
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px' }}>
            <span>TICKET</span>
            <span>TYPE</span>
            <span>STATUS</span>
            <span>PRIORITY</span>
            <span>PLAN</span>
            <span className="text-right">DATE</span>
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
                    className="grid items-center px-4 py-3 border-b cursor-pointer hover:opacity-80 transition-all"
                    style={{
                      borderColor:     C.border,
                      backgroundColor: isSelected ? C.limeTint : 'transparent',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                    }}>
                    {/* Ticket title + email */}
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                           style={{ backgroundColor: tc.bg }}>
                        <tc.Icon size={12} style={{ color: tc.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>
                          {ticket.title}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: C.muted }}>
                          {ticket.profiles?.email ?? ticket.user_email ?? 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize"
                            style={{ backgroundColor: tc.bg, color: tc.color }}>
                        {tc.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                      <span className="text-[10px] font-bold" style={{ color: sc.color }}>{sc.label}</span>
                    </div>

                    {/* Priority */}
                    <div>
                      <span className="text-[10px] font-bold capitalize"
                            style={{ color: priorityConfig(ticket.priority ?? 'medium').color }}>
                        {priorityConfig(ticket.priority ?? 'medium').label}
                      </span>
                    </div>

                    {/* Plan */}
                    <div>
                      {ticket.profiles?.plan_name && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                          {ticket.profiles.plan_name}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-right">
                      <span className="text-[10px]" style={{ color: C.muted }}>
                        {timeAgo(ticket.created_at)}
                      </span>
                    </div>
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
              <div className="flex items-center gap-2">
                {can('delete_ticket') && <button onClick={() => deleteTicket(selected.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
                  style={{ border: `1px solid rgba(185,28,28,0.3)`, backgroundColor: 'rgba(185,28,28,0.05)' }}>
                  <Trash2 size={13} style={{ color: C.red }} />
                </button>}
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
                  style={{ border: `1px solid ${C.border}` }}>
                  <X size={14} style={{ color: C.muted }} />
                </button>
              </div>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

              {/* User info */}
              <div className="p-4 rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>USER INFO</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name',    value: selected.profiles?.name ?? '—',          icon: User     },
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
                               backgroundColor: r.author_type === 'admin' ? '#1a2410' : C.bg,
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
                  style={{ backgroundColor: '#8fff00', color: '#1a2410', minWidth: 60 }}>
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
      {/* Clean Old Tickets Confirmation Modal */}
      {confirmClean && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
             onClick={() => setConfirmClean(false)}>
          <div className="w-full max-w-sm mx-4 p-6 rounded-2xl shadow-2xl"
               style={{ backgroundColor: C.surface }}
               onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
              <Trash2 size={22} style={{ color: C.red }} />
            </div>
            <p className="text-[16px] font-black text-center mb-2" style={{ color: C.dark }}>
              Clean Old Tickets?
            </p>
            <p className="text-[12px] text-center mb-6" style={{ color: C.muted }}>
              This will permanently delete:
              <br />
              <strong>Resolved/Closed</strong> tickets older than 30 days
              <br />
              <strong>Abandoned open</strong> tickets older than 90 days
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClean(false)}
                className="flex-1 py-2.5 rounded-2xl text-[13px] font-bold border hover:opacity-70"
                style={{ borderColor: C.border, color: C.muted }}>
                Cancel
              </button>
              <button
                disabled={cleaning}
                onClick={async () => {
                  setCleaning(true)
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const res = await fetch('/api/admin/cleanup-tickets', {
                      method:  'POST',
                      headers: { 'Authorization': `Bearer ${session?.access_token}` },
                    })
                    const data = await res.json()
                    if (data.success) {
                      showToast(`Cleaned ${data.deleted} old tickets`)
                      loadTickets()
                    } else {
                      showToast('Cleanup failed', 'error')
                    }
                  } catch {
                    showToast('Cleanup failed', 'error')
                  }
                  setCleaning(false)
                  setConfirmClean(false)
                }}
                className="flex-1 py-2.5 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: C.red, color: '#fff' }}>
                {cleaning
                  ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} /> Cleaning...</>
                  : <><Trash2 size={14} /> Yes, Clean</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
