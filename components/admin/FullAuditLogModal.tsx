'use client'
// components/admin/FullAuditLogModal.tsx
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Full Kill Switch Audit Log
// â†’ Paginated (25 per page)
// â†’ Filter by tool, action, date range
// â†’ Stats summary
// â†’ CSV export
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  X, Download, ChevronLeft, ChevronRight,
  Filter, Activity, Calendar, User, RefreshCw,
} from 'lucide-react'

const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
  amber:    '#d97706',
  green:    '#16a34a',
}

const PAGE_SIZE = 25

interface AuditEntry {
  id:         string
  admin_id:   string | null
  action:     string
  details:    string | null
  metadata:   Record<string, any>
  ip_address: string | null
  created_at: string
  admin_name?: string | null
}

interface Stats {
  total:        number
  disabled:     number
  enabled:      number
  killAlls:     number
  scheduled:    number
  mostAffected: string | null
  totalOffline: string
  sla:          string
}

function actionLabel(action: string): { label: string; color: string; bg: string } {
  if (action === 'disable_kill_switch')  return { label: 'DISABLED',    color: C.red,      bg: 'rgba(185,28,28,0.08)'  }
  if (action === 'enable_kill_switch')   return { label: 'ENABLED',     color: C.green,    bg: 'rgba(22,163,74,0.08)'  }
  if (action === 'kill_all_switches')    return { label: 'KILL ALL',    color: '#fff',     bg: C.red                   }
  if (action === 'schedule_created')     return { label: 'SCHEDULED',   color: C.limeDeep, bg: C.limeTint              }
  if (action === 'schedule_deleted')     return { label: 'UNSCHEDULED', color: C.amber,    bg: 'rgba(217,119,6,0.08)'  }
  if (action === 'set_read_only')        return { label: 'READ-ONLY',   color: C.amber,    bg: 'rgba(217,119,6,0.08)'  }
  if (action === 'unset_read_only')      return { label: 'FULL ACCESS', color: C.green,    bg: 'rgba(22,163,74,0.08)'  }
  return { label: action.toUpperCase(), color: C.muted, bg: C.bg }
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const DATE_RANGES = [
  { label: 'Today',      value: 'today'      },
  { label: 'This Week',  value: 'week'       },
  { label: 'This Month', value: 'month'      },
  { label: 'Last Month', value: 'last_month' },
  { label: 'All Time',   value: 'all'        },
]

const ACTION_FILTERS = [
  { label: 'All Actions',  value: 'all'               },
  { label: 'Disabled',     value: 'disable_kill_switch'},
  { label: 'Enabled',      value: 'enable_kill_switch' },
  { label: 'Kill All',     value: 'kill_all_switches'  },
  { label: 'Scheduled',    value: 'schedule_created'   },
  { label: 'Unscheduled',  value: 'schedule_deleted'   },
  { label: 'Read-Only',    value: 'set_read_only'      },
  { label: 'Full Access',  value: 'unset_read_only'    },
]

function getDateRange(range: string): { from: string | null; to: string | null } {
  const now  = new Date()
  const from = new Date()
  if (range === 'today') {
    from.setHours(0, 0, 0, 0)
    return { from: from.toISOString(), to: now.toISOString() }
  }
  if (range === 'week') {
    from.setDate(now.getDate() - 7)
    return { from: from.toISOString(), to: now.toISOString() }
  }
  if (range === 'month') {
    from.setDate(1); from.setHours(0, 0, 0, 0)
    return { from: from.toISOString(), to: now.toISOString() }
  }
  if (range === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    return { from: start.toISOString(), to: end.toISOString() }
  }
  return { from: null, to: null }
}

interface Props {
  tools:   string[]
  onClose: () => void
}

export default function FullAuditLogModal({ tools, onClose }: Props) {
  const supabase = createClient()

  const [entries,    setEntries]    = useState<AuditEntry[]>([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [visible,    setVisible]    = useState(false)

  // Filters
  const [filterTool,   setFilterTool]   = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [filterDate,   setFilterDate]   = useState('month')

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const loadEntries = useCallback(async (pg: number) => {
    setLoading(true)
    try {
      const { from, to } = getDateRange(filterDate)

      const ALL_ACTIONS = [
        'disable_kill_switch', 'enable_kill_switch', 'kill_all_switches',
        'schedule_created', 'schedule_deleted', 'set_read_only', 'unset_read_only',
      ]

      let query = (supabase.from('admin_logs') as any)
        .select('*', { count: 'exact' })
        .in('action', filterAction === 'all' ? ALL_ACTIONS : [filterAction])
        .order('created_at', { ascending: false })
        .range((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE - 1)

      if (from) query = query.gte('created_at', from)
      if (to)   query = query.lte('created_at', to)

      // Filter by tool
      if (filterTool !== 'all') {
        query = query.eq('metadata->>switch_title', filterTool)
      }

      const { data, count, error } = await query

      if (error) throw error

      setTotalCount(count ?? 0)

      if (data && data.length > 0) {
        const adminIds = [...new Set((data as any[]).map((e: any) => e.admin_id).filter(Boolean))]
        let nameMap: Record<string, string> = {}
        if (adminIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles').select('id, name').in('id', adminIds)
          nameMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.name ?? 'Unknown']))
        }
        setEntries((data as any[]).map((e: any) => ({
          ...e,
          admin_name: e.admin_id ? (nameMap[e.admin_id] ?? 'Unknown') : null,
        })))
      } else {
        setEntries([])
      }
    } catch (e) {
      console.error('[FullAuditLogModal] loadEntries error:', e)
    }
    setLoading(false)
  }, [filterTool, filterAction, filterDate, supabase])

  // Load stats for current date range
  const loadStats = useCallback(async () => {
    try {
      const { from, to } = getDateRange(filterDate)
      const ALL_ACTIONS = [
        'disable_kill_switch', 'enable_kill_switch', 'kill_all_switches',
        'schedule_created', 'schedule_deleted', 'set_read_only', 'unset_read_only',
      ]
      let query = (supabase.from('admin_logs') as any)
        .select('action, metadata, created_at').in('action', ALL_ACTIONS)
      if (from) query = query.gte('created_at', from)
      if (to)   query = query.lte('created_at', to)

      const { data } = await query
      if (!data) return

      const disabled  = data.filter((e: any) => e.action === 'disable_kill_switch')
      const enabled   = data.filter((e: any) => e.action === 'enable_kill_switch')
      const killAlls  = data.filter((e: any) => e.action === 'kill_all_switches').length
      const scheduled = data.filter((e: any) => e.action === 'schedule_created').length

      // Most affected tool
      const toolCounts: Record<string, number> = {}
      for (const e of disabled) {
        const t = e.metadata?.switch_title
        if (t) toolCounts[t] = (toolCounts[t] ?? 0) + 1
      }
      const mostAffected = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

      // Calculate total offline duration by pairing DISABLED â†’ ENABLED
      let totalOfflineMs = 0
      for (const dis of disabled) {
        const title    = dis.metadata?.switch_title
        const disTime  = new Date(dis.created_at).getTime()
        const nextEnable = enabled
          .filter((e: any) => e.metadata?.switch_title === title && new Date(e.created_at).getTime() > disTime)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
        if (nextEnable) {
          totalOfflineMs += new Date(nextEnable.created_at).getTime() - disTime
        } else {
          // Still offline â€” count until now
          totalOfflineMs += Date.now() - disTime
        }
      }

      // Format offline duration
      const totalMins  = Math.floor(totalOfflineMs / 60000)
      const hours      = Math.floor(totalMins / 60)
      const mins       = totalMins % 60
      const offlineStr = totalMins < 1 ? '< 1m' : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

      // SLA % â€” based on date range
      const rangeDays = filterDate === 'today' ? 1 : filterDate === 'week' ? 7 : filterDate === 'month' ? 30 : filterDate === 'last_month' ? 30 : 365
      const rangeMs   = rangeDays * 24 * 60 * 60 * 1000
      const sla       = Math.max(0, ((rangeMs - totalOfflineMs) / rangeMs) * 100).toFixed(2)

      setStats({
        total:        data.length,
        disabled:     disabled.length,
        enabled:      enabled.length,
        killAlls,
        scheduled,
        mostAffected,
        totalOffline: offlineStr,
        sla,
      })
    } catch { /* silent */ }
  }, [filterDate, supabase])

  useEffect(() => {
    setPage(1)
    loadEntries(1)
    loadStats()
  }, [filterTool, filterAction, filterDate])

  useEffect(() => {
    loadEntries(page)
  }, [page])

  // CSV export
  function exportCSV() {
    const rows = [
      ['Action', 'Switch Name', 'Previous State', 'New State', 'Admin', 'Reason', 'User Message', 'IP Address', 'Time'],
      ...entries.map(e => [
        actionLabel(e.action).label,
        e.metadata?.switch_title ?? (e.details ?? ''),
        e.metadata?.previous === true ? 'ON' : e.metadata?.previous === false ? 'OFF' : 'â€”',
        e.metadata?.new_value === true ? 'ON' : e.metadata?.new_value === false ? 'OFF' : 'â€”',
        e.admin_name ?? e.metadata?.admin_name ?? 'Unknown',
        e.metadata?.change_note ?? e.metadata?.label ?? '',
        e.metadata?.user_message ?? '',
        e.ip_address ?? '',
        formatDate(e.created_at),
      ])
    ]
    const csv     = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = `kill-switch-audit-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-[10400] flex items-center justify-center p-4"
         style={{
           backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`,
           transition: 'background-color 0.25s ease',
         }}
         onClick={handleClose}>
      <div className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{
             backgroundColor: C.surface,
             maxHeight: '90vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Activity size={16} style={{ color: C.limeDeep }} />
          <div className="flex-1">
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Kill Switch Full History</p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {totalCount} events Â· filtered view
            </p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-80"
            style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
            <Download size={12} /> Export CSV
          </button>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="flex gap-3 px-6 py-3 border-b shrink-0"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            {[
              { label: 'Total Events',   value: stats.total,                    color: C.text     },
              { label: 'Disabled',       value: stats.disabled,                 color: C.red      },
              { label: 'Enabled',        value: stats.enabled,                  color: C.green    },
              { label: 'Kill Alls',      value: stats.killAlls,                 color: C.red      },
              { label: 'Total Offline',  value: stats.totalOffline,             color: C.amber    },
              { label: 'SLA Uptime',     value: `${stats.sla}%`,               color: Number(stats.sla) >= 99 ? C.green : Number(stats.sla) >= 95 ? C.amber : C.red },
              { label: 'Most Affected',  value: stats.mostAffected ?? 'â€”',      color: C.amber    },
            ].map((s, i) => (
              <div key={i} className="flex flex-col px-3 py-1.5 rounded-xl border"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}>
                <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{s.label.toUpperCase()}</p>
                <p className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 py-3 border-b shrink-0"
             style={{ borderColor: C.border }}>
          <Filter size={12} style={{ color: C.muted }} />

          {/* Tool filter */}
          <select value={filterTool} onChange={e => setFilterTool(e.target.value)}
            className="h-8 px-2 rounded-lg border text-[11px] outline-none"
            style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }}>
            <option value="all">All Tools</option>
            {tools.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Action filter */}
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="h-8 px-2 rounded-lg border text-[11px] outline-none"
            style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }}>
            {ACTION_FILTERS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>

          {/* Date filter */}
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="h-8 px-2 rounded-lg border text-[11px] outline-none"
            style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }}>
            {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>

          <button onClick={() => { setPage(1); loadEntries(1); loadStats() }}
            className="flex items-center gap-1 h-8 px-2 rounded-lg border text-[11px] hover:opacity-70"
            style={{ borderColor: C.border, backgroundColor: C.bg, color: C.muted }}>
            <RefreshCw size={11} /> Refresh
          </button>

          <p className="ml-auto text-[11px]" style={{ color: C.muted }}>
            {totalCount} results Â· Page {page} of {totalPages || 1}
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {/* Table header */}
          <div className="grid px-6 py-2 border-b sticky top-0"
               style={{
                 gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.7fr 1fr 0.6fr',
                 gap: 12,
                 borderColor: C.border,
                 backgroundColor: C.bg,
               }}>
            {['ACTION', 'SWITCH NAME', 'BEFOREâ†’AFTER', 'ADMIN', 'REASON', 'TIME'].map(h => (
              <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 p-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid gap-3 animate-pulse"
                     style={{ gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.7fr 1fr 0.6fr' }}>
                  <div className="h-5 w-16 rounded-lg" style={{ backgroundColor: C.bg }} />
                  <div className="h-4 w-32 rounded-full" style={{ backgroundColor: C.bg }} />
                  <div className="h-4 w-20 rounded-full" style={{ backgroundColor: C.bg }} />
                  <div className="h-4 w-20 rounded-full" style={{ backgroundColor: C.bg }} />
                  <div className="h-4 w-24 rounded-full" style={{ backgroundColor: C.bg }} />
                  <div className="h-4 w-12 rounded-full" style={{ backgroundColor: C.bg }} />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-2">
              <Activity size={24} style={{ color: C.border }} />
              <p className="text-[13px]" style={{ color: C.muted }}>No events found for this filter</p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const mapped      = actionLabel(entry.action)
              const isKillAll   = entry.action === 'kill_all_switches'
              const prevVal     = entry.metadata?.previous
              const newVal      = entry.metadata?.new_value
              const hasBefore   = typeof prevVal === 'boolean' && typeof newVal === 'boolean'
              const reason      = entry.metadata?.change_note ?? entry.metadata?.label ?? null
              const switchTitle = entry.metadata?.switch_title ?? (entry.details ?? 'â€”')

              return (
                <div key={entry.id}
                     className="grid px-6 py-3 border-b last:border-b-0 items-center hover:bg-[#fafcf8] transition-colors"
                     style={{
                       gridTemplateColumns: '0.7fr 1.4fr 0.6fr 0.7fr 1fr 0.6fr',
                       gap: 12,
                       borderColor: C.border,
                     }}>

                  {/* ACTION */}
                  <div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: mapped.bg, color: mapped.color }}>
                      {mapped.label}
                    </span>
                  </div>

                  {/* SWITCH NAME */}
                  <div className="min-w-0">
                    {isKillAll ? (
                      <div>
                        <p className="text-[11px] font-bold" style={{ color: C.red }}>ALL SYSTEMS</p>
                        <p className="text-[9px]" style={{ color: C.muted }}>
                          {entry.metadata?.count ?? '?'} switches killed
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] font-bold truncate" style={{ color: C.dark }}>
                        {switchTitle}
                      </p>
                    )}
                  </div>

                  {/* BEFOREâ†’AFTER */}
                  <div>
                    {hasBefore ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: prevVal ? C.limeTint : 'rgba(185,28,28,0.08)', color: prevVal ? C.limeDeep : C.red }}>
                          {prevVal ? 'ON' : 'OFF'}
                        </span>
                        <span className="text-[9px]" style={{ color: C.muted }}>â†’</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: newVal ? C.limeTint : 'rgba(185,28,28,0.08)', color: newVal ? C.limeDeep : C.red }}>
                          {newVal ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    ) : isKillAll ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>ON</span>
                        <span className="text-[9px]" style={{ color: C.muted }}>â†’</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>OFF</span>
                      </div>
                    ) : (
                      <span className="text-[10px]" style={{ color: C.muted }}>â€”</span>
                    )}
                  </div>

                  {/* ADMIN */}
                  <div className="flex items-center gap-1 min-w-0">
                    <User size={9} style={{ color: C.muted, flexShrink: 0 }} />
                    <p className="text-[10px] font-semibold truncate" style={{ color: C.text }}>
                      {entry.admin_name ?? entry.metadata?.admin_name ?? 'Unknown'}
                    </p>
                  </div>

                  {/* REASON */}
                  <div className="min-w-0">
                    {reason ? (
                      <p className="text-[10px] italic truncate" style={{ color: C.muted }}>
                        "{reason}"
                      </p>
                    ) : (
                      <span className="text-[10px]" style={{ color: C.muted }}>â€”</span>
                    )}
                  </div>

                  {/* TIME */}
                  <div>
                    <p className="text-[10px] font-semibold" style={{ color: C.muted }}>
                      {timeAgo(entry.created_at)}
                    </p>
                    <p className="text-[9px]" style={{ color: C.border }}>
                      {formatDate(entry.created_at)}
                    </p>
                  </div>

                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-semibold disabled:opacity-40 hover:opacity-70"
              style={{ borderColor: C.border, color: C.muted }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = i + 1
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className="w-7 h-7 rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: page === pg ? C.dark : 'transparent',
                      color:           page === pg ? C.lime : C.muted,
                      border:          `1px solid ${page === pg ? C.dark : C.border}`,
                    }}>
                    {pg}
                  </button>
                )
              })}
              {totalPages > 7 && <span className="text-[11px]" style={{ color: C.muted }}>... {totalPages}</span>}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-semibold disabled:opacity-40 hover:opacity-70"
              style={{ borderColor: C.border, color: C.muted }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
