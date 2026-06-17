'use client'
// components/admin/settings-tabs/WebhooksTab.tsx
// ══════════════════════════════════════════════════════════════
// Global System Webhooks Tab
// → HUD performance cards
// → Webhook destinations grid with event toggles
// → JSON delivery log with side drawer
// → Add/Edit/Delete destinations
// → Test webhook button
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Webhook, Plus, Trash2, Check, X, Save, RefreshCw,
  ChevronDown, ChevronUp, Zap, AlertTriangle, Clock,
  Send, Eye, Copy, CheckCircle, Activity,
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
  blue:     '#1d4ed8',
}

// ── Event definitions ──────────────────────────────────────────
const ALL_EVENTS = [
  { key: 'user.signup',           label: 'New Signup',           category: 'Users'    },
  { key: 'plan.upgraded',         label: 'Plan Upgraded',        category: 'Revenue'  },
  { key: 'plan.cancelled',        label: 'Plan Cancelled',       category: 'Revenue'  },
  { key: 'payment.failed',        label: 'Payment Failed',       category: 'Revenue'  },
  { key: 'payment.recovered',     label: 'Payment Recovered',    category: 'Revenue'  },
  { key: 'kill_switch.activated', label: 'Kill Switch',          category: 'System'   },
  { key: 'high_risk_order',       label: 'High Risk Order',      category: 'Orders'   },
  { key: 'api.failure',           label: 'API Failure',          category: 'System'   },
  { key: 'user.limit_hit',        label: 'Limit Hit',            category: 'Users'    },
  { key: 'admin.login',           label: 'Admin Login',          category: 'Security' },
]

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Users:    { color: C.blue,     bg: 'rgba(29,78,216,0.08)'  },
  Revenue:  { color: C.limeDeep, bg: C.limeTint              },
  System:   { color: C.red,      bg: 'rgba(185,28,28,0.08)'  },
  Orders:   { color: C.amber,    bg: 'rgba(217,119,6,0.08)'  },
  Security: { color: C.muted,    bg: C.bg                    },
}

const TYPE_ICONS: Record<string, string> = {
  slack:   '💬',
  discord: '🎮',
  custom:  '🔗',
}

// ── Helpers ────────────────────────────────────────────────────
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

function statusColor(status: string): { color: string; bg: string } {
  if (status === 'delivered') return { color: C.green,    bg: 'rgba(22,163,74,0.08)'  }
  if (status === 'failed')    return { color: C.red,      bg: 'rgba(185,28,28,0.08)'  }
  if (status === 'retrying')  return { color: C.amber,    bg: 'rgba(217,119,6,0.08)'  }
  if (status === 'pending')   return { color: C.muted,    bg: C.bg                    }
  return { color: C.muted, bg: C.bg }
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,     border: C.lime,   color: C.lime },
    error:   { bg: '#FEF2F2',  border: '#FECACA', color: C.red  },
    info:    { bg: C.bg,       border: C.border,  color: C.text },
  }
  const t = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
      <Check size={15} style={{ color: t.color }} />
      <p className="text-[13px] font-bold" style={{ color: t.color }}>{msg}</p>
    </div>
  )
}

// ── JSON Syntax Block ──────────────────────────────────────────
function JsonBlock({ data }: { data: any }) {
  const [copied, setCopied] = useState(false)
  const str = JSON.stringify(data, null, 2)

  function handleCopy() {
    navigator.clipboard.writeText(str)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b"
           style={{ borderColor: C.border, backgroundColor: C.dark }}>
        <span className="text-[10px] font-bold" style={{ color: C.muted }}>JSON</span>
        <button onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] hover:opacity-70"
          style={{ color: copied ? C.lime : C.muted }}>
          {copied ? <><CheckCircle size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
        </button>
      </div>
      <pre className="text-[11px] p-3 overflow-auto max-h-64 font-mono leading-relaxed"
           style={{ backgroundColor: '#0d1117', color: '#e6edf3' }}>
        {str}
      </pre>
    </div>
  )
}

// ── Delivery Log Drawer ────────────────────────────────────────
function DeliveryDrawer({ log, onClose }: { log: any; onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const st = statusColor(log.status)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])

  function handleClose() { setVisible(false); setTimeout(onClose, 300) }

  return (
    <>
      <div className="fixed inset-0 z-[10400] bg-black/40"
           style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
           onClick={handleClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[10500] w-[480px] flex flex-col shadow-2xl overflow-hidden"
           style={{
             backgroundColor: C.surface,
             transform: visible ? 'translateX(0)' : 'translateX(100%)',
             transition: 'transform 0.3s ease',
           }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Activity size={16} style={{ color: C.limeDeep }} />
          <div className="flex-1">
            <p className="text-[14px] font-black" style={{ color: C.dark }}>Delivery Details</p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              {log.webhook_destinations?.name ?? '—'} · {timeAgo(log.created_at)}
            </p>
          </div>
          <span className="text-[10px] font-black px-2 py-1 rounded-lg"
                style={{ backgroundColor: st.bg, color: st.color }}>
            {log.status.toUpperCase()}
          </span>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'EVENT',         value: log.event_type             },
              { label: 'STATUS CODE',   value: log.response_code ?? '—'   },
              { label: 'DURATION',      value: log.duration_ms ? `${log.duration_ms}ms` : '—' },
              { label: 'ATTEMPTS',      value: log.attempt_number ?? 1    },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl border flex flex-col gap-1"
                   style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{label}</p>
                <p className="text-[13px] font-bold" style={{ color: C.dark }}>{String(value)}</p>
              </div>
            ))}
          </div>

          {/* Request Payload */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>REQUEST PAYLOAD</p>
            <JsonBlock data={log.payload ?? {}} />
          </div>

          {/* Response Body */}
          {log.response_body && (
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>RESPONSE BODY</p>
              <div className="rounded-xl border p-3 text-[11px] font-mono overflow-auto max-h-40"
                   style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }}>
                {log.response_body}
              </div>
            </div>
          )}

          {/* Error */}
          {log.error && (
            <div className="p-3 rounded-xl border" style={{ borderColor: 'rgba(185,28,28,0.25)', backgroundColor: 'rgba(185,28,28,0.04)' }}>
              <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.red }}>ERROR</p>
              <p className="text-[12px] font-mono" style={{ color: C.red }}>{log.error}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Add/Edit Destination Modal ─────────────────────────────────
function DestinationModal({
  destination, onClose, onSaved,
}: {
  destination?: any
  onClose:      () => void
  onSaved:      () => void
}) {
  const supabase = createClient()
  const isEdit   = !!destination

  const [name,      setName]      = useState(destination?.name      ?? '')
  const [type,      setType]      = useState(destination?.type      ?? 'slack')
  const [url,       setUrl]       = useState(destination?.url       ?? '')
  const [secret,    setSecret]    = useState(destination?.secret    ?? '')
  const [saving,    setSaving]    = useState(false)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])

  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  async function handleSave() {
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/webhooks/save', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: destination?.id, name, type, url, secret }),
      })
      if (res.ok) { onSaved(); handleClose() }
    } catch { /* silent */ }
    setSaving(false)
  }

  const TYPE_OPTIONS = [
    { value: 'slack',   label: '💬 Slack'   },
    { value: 'discord', label: '🎮 Discord' },
    { value: 'custom',  label: '🔗 Custom'  },
  ]

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
           style={{
             backgroundColor: C.surface,
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center gap-3 px-5 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Webhook size={16} style={{ color: C.limeDeep }} />
          <p className="text-[15px] font-black flex-1" style={{ color: C.dark }}>
            {isEdit ? 'Edit Destination' : 'New Webhook Destination'}
          </p>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>NAME</p>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Slack Revenue Alerts"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>TYPE</p>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setType(opt.value)}
                  className="py-2 rounded-xl border text-[12px] font-bold transition-all"
                  style={{
                    backgroundColor: type === opt.value ? C.dark : C.bg,
                    color:           type === opt.value ? C.lime : C.muted,
                    borderColor:     type === opt.value ? C.dark : C.border,
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>WEBHOOK URL</p>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder={type === 'slack' ? 'https://hooks.slack.com/services/...' : type === 'discord' ? 'https://discord.com/api/webhooks/...' : 'https://your-endpoint.com/webhook'}
              className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none font-mono"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>
              SECRET (optional — for HMAC signature verification)
            </p>
            <input value={secret} onChange={e => setSecret(e.target.value)}
              placeholder="your-webhook-secret"
              type="password"
              className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none font-mono"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim() || !url.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: C.dark, color: C.lime }}>
              {saving
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                : <><Save size={14} /> {isEdit ? 'Save Changes' : 'Add Destination'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Destination Card ───────────────────────────────────────────
function DestinationCard({
  destination, events, onToggleActive, onToggleEvent,
  onTest, onEdit, onDelete, testing,
}: {
  destination:   any
  events:        any[]
  onToggleActive: (id: string, val: boolean) => void
  onToggleEvent:  (destId: string, eventType: string, val: boolean) => void
  onTest:         (id: string) => void
  onEdit:         (dest: any) => void
  onDelete:       (id: string) => void
  testing:        string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const destEvents = events.filter(e => e.destination_id === destination.id)
  const enabledCount = destEvents.filter(e => e.is_enabled).length

  const grouped = ALL_EVENTS.reduce((acc, ev) => {
    const cat = ev.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ev)
    return acc
  }, {} as Record<string, typeof ALL_EVENTS>)

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-[20px]">{TYPE_ICONS[destination.type] ?? '🔗'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-black" style={{ color: C.dark }}>{destination.name}</p>
          <p className="text-[11px] font-mono truncate" style={{ color: C.muted }}>
            {destination.url.length > 40 ? destination.url.slice(0, 40) + '...' : destination.url}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Test button */}
          <button onClick={() => onTest(destination.id)} disabled={testing === destination.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
            {testing === destination.id
              ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.limeDeep }} />
              : <><Send size={10} /> Test</>}
          </button>
          {/* Edit */}
          <button onClick={() => onEdit(destination)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
            <Eye size={12} style={{ color: C.muted }} />
          </button>
          {/* Delete */}
          <button onClick={() => onDelete(destination.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
            style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
            <Trash2 size={12} style={{ color: C.red }} />
          </button>
          {/* Active toggle */}
          <div onClick={() => onToggleActive(destination.id, !destination.is_active)}
               className="relative w-10 h-5 rounded-full cursor-pointer"
               style={{ backgroundColor: destination.is_active ? C.dark : 'rgba(100,116,139,0.35)' }}>
            <div style={{
              position: 'absolute', top: 2, left: 2,
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: destination.is_active ? C.lime : '#fff',
              transform: destination.is_active ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.25s ease',
            }} />
          </div>
          {/* Expand */}
          <button onClick={() => setExpanded(p => !p)}
            className="w-7 h-7 flex items-center justify-center rounded-xl border"
            style={{ borderColor: expanded ? C.lime : C.border, backgroundColor: expanded ? C.limeTint : C.bg }}>
            {expanded
              ? <ChevronUp   size={13} style={{ color: C.limeDeep }} />
              : <ChevronDown size={13} style={{ color: C.muted    }} />}
          </button>
        </div>
      </div>

      {/* Event count bar */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
          <div className="h-full rounded-full transition-all"
               style={{ width: `${(enabledCount / ALL_EVENTS.length) * 100}%`, backgroundColor: C.lime }} />
        </div>
        <p className="text-[10px] font-bold shrink-0" style={{ color: C.muted }}>
          {enabledCount}/{ALL_EVENTS.length} events active
        </p>
      </div>

      {/* Events grid */}
      {expanded && (
        <div className="border-t px-4 py-3" style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <p className="text-[10px] font-black tracking-wider mb-3" style={{ color: C.muted }}>
            EVENT SUBSCRIPTIONS
          </p>
          <div className="flex flex-col gap-4">
            {Object.entries(grouped).map(([category, evList]) => {
              const catStyle = CATEGORY_COLORS[category] ?? { color: C.muted, bg: C.bg }
              return (
                <div key={category}>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: catStyle.bg, color: catStyle.color }}>
                    {category.toUpperCase()}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {evList.map(ev => {
                      const destEvent  = destEvents.find(de => de.event_type === ev.key)
                      const isEnabled  = destEvent?.is_enabled ?? false
                      return (
                        <button key={ev.key}
                          onClick={() => onToggleEvent(destination.id, ev.key, !isEnabled)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: isEnabled ? C.dark : C.surface,
                            color:           isEnabled ? C.lime : C.muted,
                            borderColor:     isEnabled ? C.dark : C.border,
                          }}>
                          {isEnabled
                            ? <Check size={10} style={{ color: C.lime }} />
                            : <X     size={10} style={{ color: C.muted }} />}
                          {ev.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function WebhooksTab() {
  const supabase = createClient()

  const [destinations, setDestinations] = useState<any[]>([])
  const [events,       setEvents]       = useState<any[]>([])
  const [logs,         setLogs]         = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [testing,      setTesting]      = useState<string | null>(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [editDest,     setEditDest]     = useState<any | null>(null)
  const [selectedLog,  setSelectedLog]  = useState<any | null>(null)
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [logSearch,    setLogSearch]    = useState('')

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/webhooks', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setDestinations(json.destinations ?? [])
        setEvents(json.events ?? [])
        setLogs(json.logs ?? [])
      }
    } catch (e) { console.error('[WebhooksTab]', e) }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleToggleActive(id: string, val: boolean) {
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, is_active: val } : d))
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/webhooks/save', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ id, is_active: val }),
    })
    showToast(val ? 'Webhook activated' : 'Webhook deactivated', val ? 'success' : 'info')
  }

  async function handleToggleEvent(destId: string, eventType: string, val: boolean) {
    setEvents(prev => prev.map(e =>
      e.destination_id === destId && e.event_type === eventType
        ? { ...e, is_enabled: val } : e
    ))
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/webhooks/save', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ id: destId, events: { [eventType]: val } }),
    })
  }

  async function handleTest(id: string) {
    setTesting(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/webhooks/test', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ destination_id: id }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(`Test delivered in ${json.duration_ms}ms`, 'success')
      } else {
        showToast(`Test failed: ${json.response_body ?? json.error}`, 'error')
      }
      loadData()
    } catch { showToast('Test failed', 'error') }
    setTesting(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this webhook destination?')) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/webhooks/delete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ id }),
    })
    setDestinations(prev => prev.filter(d => d.id !== id))
    showToast('Destination deleted', 'info')
  }

  // ── HUD stats ─────────────────────────────────────────────────
  const now24h      = new Date(Date.now() - 86400000).toISOString()
  const logs24h     = logs.filter(l => l.created_at > now24h)
  const delivered24 = logs24h.filter(l => l.status === 'delivered').length
  const failed24    = logs24h.filter(l => l.status === 'failed').length
  const avgSpeed    = logs24h.length > 0
    ? Math.round(logs24h.filter(l => l.duration_ms).reduce((s, l) => s + l.duration_ms, 0) / logs24h.filter(l => l.duration_ms).length)
    : 0
  const successRate = logs24h.length > 0 ? Math.round((delivered24 / logs24h.length) * 100) : 100

  const filteredLogs = logs.filter(log => {
    if (!logSearch) return true
    const q = logSearch.toLowerCase()
    return (
      log.event_type?.toLowerCase().includes(q) ||
      log.status?.toLowerCase().includes(q) ||
      log.webhook_destinations?.name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black tracking-wider mb-0.5" style={{ color: C.muted }}>
            WEBHOOKS
          </p>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Global outbound webhooks — Slack, Discord & custom endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            <Plus size={13} /> New Destination
          </button>
          <button onClick={() => { setRefreshing(true); loadData() }} disabled={refreshing}
            className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* HUD Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { title: 'Dispatched 24h',  value: String(logs24h.length),      sub: 'total webhooks fired',    icon: Zap,           color: C.limeDeep, bg: C.limeTint             },
          { title: 'Avg Speed',       value: avgSpeed ? `${avgSpeed}ms` : '—', sub: 'delivery latency',  icon: Clock,         color: C.blue,     bg: 'rgba(29,78,216,0.08)' },
          { title: 'Success Rate',    value: `${successRate}%`,            sub: 'delivered successfully',  icon: CheckCircle,   color: C.green,    bg: 'rgba(22,163,74,0.08)' },
          { title: 'Failed 24h',      value: String(failed24),             sub: 'failed deliveries',       icon: AlertTriangle, color: failed24 > 0 ? C.red : C.muted, bg: failed24 > 0 ? 'rgba(185,28,28,0.08)' : C.bg },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
                  {card.title.toUpperCase()}
                </p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: card.bg }}>
                  <Icon size={15} style={{ color: card.color }} />
                </div>
              </div>
              {loading ? (
                <div className="h-8 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
              ) : (
                <p className="text-[28px] font-black tracking-tight" style={{ color: C.dark }}>{card.value}</p>
              )}
              <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Destinations */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0,1,2].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: C.border }} />)}
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-2xl border"
             style={{ borderColor: C.border }}>
          <Webhook size={32} style={{ color: C.border }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No webhook destinations configured</p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            <Plus size={14} /> Add First Destination
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {destinations.map(dest => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              events={events}
              onToggleActive={handleToggleActive}
              onToggleEvent={handleToggleEvent}
              onTest={handleTest}
              onEdit={d => setEditDest(d)}
              onDelete={handleDelete}
              testing={testing}
            />
          ))}
        </div>
      )}

      {/* Delivery Log */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Activity size={13} style={{ color: C.muted }} />
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
            DELIVERY LOG
          </p>
          <div className="flex-1 mx-3 relative">
            <input
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Search by event, destination or status..."
              className="w-full h-7 pl-3 pr-3 rounded-lg border text-[11px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}
            />
          </div>
          <p className="text-[10px]" style={{ color: C.muted }}>{filteredLogs.length} entries</p>
        </div>

        {/* Header */}
        <div className="grid px-4 py-2 border-b"
             style={{ gridTemplateColumns: '0.7fr 1fr 1.2fr 0.6fr 0.6fr 0.5fr', gap: 10, borderColor: C.border, backgroundColor: C.bg }}>
          {['STATUS', 'EVENT', 'DESTINATION', 'CODE', 'SPEED', 'TIME'].map(h => (
            <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-[12px]" style={{ color: C.muted }}>
              No webhook deliveries yet — events appear here when fired
            </p>
          </div>
        ) : (
          filteredLogs.slice(0, 100).map(log => {
            const st = statusColor(log.status)
            return (
              <div key={log.id}
                   className="grid items-center px-4 py-2.5 border-b last:border-b-0 hover:bg-[#fafcf8] cursor-pointer transition-colors"
                   style={{ gridTemplateColumns: '0.7fr 1fr 1.2fr 0.6fr 0.6fr 0.5fr', gap: 10, borderColor: C.border }}
                   onClick={() => setSelectedLog(log)}>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg w-fit"
                      style={{ backgroundColor: st.bg, color: st.color }}>
                  {log.status.toUpperCase()}
                </span>
                <p className="text-[11px] font-semibold truncate" style={{ color: C.text }}>
                  {log.event_type}
                </p>
                <p className="text-[11px] truncate" style={{ color: C.muted }}>
                  {log.webhook_destinations?.name ?? '—'}
                </p>
                <p className="text-[11px]" style={{ color: log.response_code === 200 ? C.green : C.red }}>
                  {log.response_code ?? '—'}
                </p>
                <p className="text-[11px]" style={{ color: C.muted }}>
                  {log.duration_ms ? `${log.duration_ms}ms` : '—'}
                </p>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  {timeAgo(log.created_at)}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <DestinationModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { loadData(); showToast('Destination added', 'success') }}
        />
      )}
      {editDest && (
        <DestinationModal
          destination={editDest}
          onClose={() => setEditDest(null)}
          onSaved={() => { loadData(); showToast('Destination updated', 'success') }}
        />
      )}
      {selectedLog && (
        <DeliveryDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}