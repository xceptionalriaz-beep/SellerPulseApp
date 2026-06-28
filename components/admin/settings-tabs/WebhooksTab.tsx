'use client'
// components/admin/settings-tabs/WebhooksTab.tsx

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Webhook, Plus, Trash2, Check, X, Save, RefreshCw,
  ChevronDown, ChevronUp, Zap, AlertTriangle, Clock,
  Send, Eye, EyeOff, Copy, CheckCircle, Activity,
  MessageSquare, Gamepad2, Link2, User, DollarSign,
  XCircle, ShieldAlert, Wrench, BarChart2, Lock, Radio,
  PauseCircle,
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

// ── Payment event sources ──────────────────────────────────────
// plan.upgraded, plan.cancelled, payment.failed, payment.recovered
// fired by: /api/webhooks/stripe/route.ts
//       OR: /api/webhooks/lemonsqueezy/route.ts
// Both map to the same internal event names so Discord
// alerts fire regardless of which processor you use

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Users:    { color: C.blue,     bg: 'rgba(29,78,216,0.08)'  },
  Revenue:  { color: C.limeDeep, bg: C.limeTint              },
  System:   { color: C.red,      bg: 'rgba(185,28,28,0.08)'  },
  Orders:   { color: C.amber,    bg: 'rgba(217,119,6,0.08)'  },
  Security: { color: C.muted,    bg: C.bg                    },
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  slack:   MessageSquare,
  discord: Gamepad2,
  custom:  Link2,
}

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  slack:   { color: '#4A154B', bg: 'rgba(74,21,75,0.08)'   },
  discord: { color: '#5865F2', bg: 'rgba(88,101,242,0.08)' },
  custom:  { color: C.limeDeep, bg: C.limeTint             },
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
    { value: 'slack',   label: 'Slack',   Icon: MessageSquare },
    { value: 'discord', label: 'Discord', Icon: Gamepad2      },
    { value: 'custom',  label: 'Custom',  Icon: Link2         },
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
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[12px] font-bold transition-all"
                  style={{
                    backgroundColor: type === opt.value ? C.dark : C.bg,
                    color:           type === opt.value ? C.lime : C.muted,
                    borderColor:     type === opt.value ? C.dark : C.border,
                  }}>
                  <opt.Icon size={13} />
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
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
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

// ── Events Modal ───────────────────────────────────────────────
function EventsModal({
  destination, events, onClose, onToggleEvent, onToggleActive,
}: {
  destination:    any
  events:         any[]
  onClose:        () => void
  onToggleEvent:  (destId: string, eventType: string, val: boolean) => void
  onToggleActive: (id: string, val: boolean) => void
}) {
  const [visible, setVisible] = useState(false)
  const destEvents = events.filter(e => e.destination_id === destination.id)
  const isActive   = destination.is_active

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  const grouped = ALL_EVENTS.reduce((acc, ev) => {
    if (!acc[ev.category]) acc[ev.category] = []
    acc[ev.category].push(ev)
    return acc
  }, {} as Record<string, typeof ALL_EVENTS>)

  const Icon      = TYPE_ICONS[destination.type] ?? Link2
  const typeStyle = TYPE_COLORS[destination.type] ?? { color: C.muted, bg: C.bg }
  const enabledCount = destEvents.filter(e => e.is_enabled).length

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{
             backgroundColor: C.surface,
             maxHeight: '85vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: typeStyle.bg }}>
            <Icon size={16} style={{ color: typeStyle.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black truncate" style={{ color: C.dark }}>{destination.name}</p>
            <p className="text-[10px]" style={{ color: C.muted }}>{enabledCount}/{ALL_EVENTS.length} events active</p>
          </div>
          {/* Active toggle */}
          <div onClick={() => onToggleActive(destination.id, !isActive)}
               className="relative w-10 h-5 rounded-full cursor-pointer shrink-0"
               style={{ backgroundColor: isActive ? C.dark : 'rgba(100,116,139,0.35)' }}>
            <div style={{
              position: 'absolute', top: 2, left: 2,
              width: 16, height: 16, borderRadius: '50%',
              backgroundColor: isActive ? C.lime : '#fff',
              transform: isActive ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.25s ease',
            }} />
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70 shrink-0"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Paused banner */}
        {!isActive && (
          <div className="flex items-center gap-2 px-4 py-2 border-b"
               style={{ backgroundColor: 'rgba(100,116,139,0.08)', borderColor: C.border }}>
            <PauseCircle size={13} style={{ color: C.muted }} />
            <p className="text-[11px] font-bold" style={{ color: C.muted }}>
              This endpoint is paused — enable to activate events
            </p>
          </div>
        )}

        {/* Events */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
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
                    const destEvent = destEvents.find(de => de.event_type === ev.key)
                    const isEnabled = destEvent?.is_enabled ?? false
                    return (
                      <button key={ev.key}
                        onClick={() => isActive && onToggleEvent(destination.id, ev.key, !isEnabled)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
                        style={{
                          backgroundColor: isEnabled && isActive ? C.dark    : C.surface,
                          color:           isEnabled && isActive ? C.lime    : C.muted,
                          borderColor:     isEnabled && isActive ? C.dark    : C.border,
                          cursor:          isActive              ? 'pointer' : 'default',
                        }}>
                        {isEnabled
                          ? <Check size={10} style={{ color: isActive ? C.lime : C.muted }} />
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
    </div>
  )
}

// ── Destination Table Row ──────────────────────────────────────
function DestinationRow({
  destination, events, onToggleActive, onToggleEvent,
  onTest, onEdit, onDelete, onExpand, testing,
}: {
  destination:    any
  events:         any[]
  onToggleActive: (id: string, val: boolean) => void
  onToggleEvent:  (destId: string, eventType: string, val: boolean) => void
  onTest:         (id: string, eventType: string) => void
  onEdit:         (dest: any) => void
  onDelete:       (id: string) => void
  onExpand:       (dest: any) => void
  testing:        string | null
}) {
  const [showTestMenu, setShowTestMenu] = useState(false)
  const destEvents   = events.filter(e => e.destination_id === destination.id)
  const enabledCount = destEvents.filter(e => e.is_enabled).length
  const isActive     = destination.is_active

  const Icon      = TYPE_ICONS[destination.type] ?? Link2
  const typeStyle = TYPE_COLORS[destination.type] ?? { color: C.muted, bg: C.bg }

  const TEST_EVENTS = [
    { value: 'test.ping',             label: 'Generic Ping'         },
    { value: 'user.signup',           label: 'Simulate New Signup'  },
    { value: 'plan.upgraded',         label: 'Simulate Upgrade'     },
    { value: 'payment.failed',        label: 'Simulate Payment Fail'},
    { value: 'kill_switch.activated', label: 'Simulate Kill Switch' },
    { value: 'high_risk_order',       label: 'Simulate Risk Order'  },
  ]

  return (
    <div className="grid items-center px-4 py-3 border-b last:border-b-0 hover:bg-[#fafcf8] transition-colors"
         style={{ gridTemplateColumns: '2fr 0.7fr 1.6fr 0.6fr 0.5fr 0.8fr', gap: 12, borderColor: C.border, opacity: isActive ? 1 : 0.6 }}>

      {/* Name + type icon — click to open events modal */}
      <div className="flex items-center gap-2.5 cursor-pointer min-w-0"
           onClick={() => onExpand(destination)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
             style={{ backgroundColor: typeStyle.bg }}>
          <Icon size={14} style={{ color: typeStyle.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-black truncate" style={{ color: C.dark }}>{destination.name}</p>
          <p className="text-[10px] font-mono truncate" style={{ color: C.muted }}>
            {destination.url.length > 30 ? destination.url.slice(0, 30) + '...' : destination.url}
          </p>
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span className="text-[9px] font-black px-2 py-1 rounded-lg capitalize"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}>
          {destination.type}
        </span>
      </div>

      {/* Events progress */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onExpand(destination)}>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
          <div className="h-full rounded-full transition-all"
               style={{
                 width:           `${(enabledCount / ALL_EVENTS.length) * 100}%`,
                 backgroundColor: isActive ? C.lime : C.muted,
               }} />
        </div>
        <span className="text-[10px] font-bold shrink-0" style={{ color: C.muted }}>
          {enabledCount}/{ALL_EVENTS.length}
        </span>
      </div>

      {/* Active toggle */}
      <div onClick={() => onToggleActive(destination.id, !isActive)}
           className="relative w-10 h-5 rounded-full cursor-pointer"
           style={{ backgroundColor: isActive ? C.dark : 'rgba(100,116,139,0.35)' }}>
        <div style={{
          position: 'absolute', top: 2, left: 2,
          width: 16, height: 16, borderRadius: '50%',
          backgroundColor: isActive ? C.lime : '#fff',
          transform: isActive ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.25s ease',
        }} />
      </div>

      {/* Status */}
      <div>
        <span className="text-[9px] font-black px-2 py-1 rounded-lg"
              style={{
                backgroundColor: isActive ? 'rgba(22,163,74,0.08)' : C.bg,
                color:           isActive ? C.green : C.muted,
              }}>
          {isActive ? 'LIVE' : 'PAUSED'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 justify-end">
        {/* Test dropdown */}
        <div className="relative">
          <button onClick={() => setShowTestMenu(p => !p)} disabled={testing === destination.id}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
            {testing === destination.id
              ? <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.limeDeep }} />
              : <><Send size={10} /> Test <ChevronDown size={9} /></>}
          </button>
          {showTestMenu && (
            <>
              <div className="fixed inset-0 z-[200]" onClick={() => setShowTestMenu(false)} />
              <div className="fixed z-[201] rounded-xl border shadow-xl overflow-hidden w-44"
                   style={{ backgroundColor: C.surface, borderColor: C.border }}
                   ref={(el) => {
                     if (el) {
                       const btn = el.previousElementSibling?.previousElementSibling as HTMLElement
                       if (btn) {
                         const rect = btn.getBoundingClientRect()
                         el.style.top  = `${rect.bottom + 4}px`
                         el.style.left = `${rect.left - 80}px`
                       }
                     }
                   }}>
                {TEST_EVENTS.map(te => (
                  <button key={te.value}
                    onClick={() => { onTest(destination.id, te.value); setShowTestMenu(false) }}
                    className="w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-[#f4ffe6] transition-colors"
                    style={{ color: C.text }}>
                    {te.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Edit */}
        <button onClick={() => onEdit(destination)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
          style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          <Eye size={11} style={{ color: C.muted }} />
        </button>

        {/* Delete */}
        <button onClick={() => onDelete(destination.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70"
          style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
          <Trash2 size={11} style={{ color: C.red }} />
        </button>
      </div>
    </div>
  )
}

// ── Webhook Retention Section ──────────────────────────────────
function WebhookRetentionSection({
  supabase, showToast,
}: {
  supabase:  any
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  const [logCount,   setLogCount]   = useState(0)
  const [oldestLog,  setOldestLog]  = useState<string | null>(null)
  const [archiving,  setArchiving]  = useState(false)
  const [expanded,   setExpanded]   = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [{ count }, { data: oldest }] = await Promise.all([
          (supabase.from('webhook_delivery_log') as any).select('id', { count: 'exact', head: true }),
          (supabase.from('webhook_delivery_log') as any).select('created_at').order('created_at', { ascending: true }).limit(1),
        ])
        setLogCount(count ?? 0)
        setOldestLog(oldest?.[0]?.created_at ?? null)
      } catch { /* silent */ }
    }
    load()
  }, [])

  const oldestDays = oldestLog
    ? Math.floor((Date.now() - new Date(oldestLog).getTime()) / 86400000)
    : 0

  async function handleCleanNow() {
    setArchiving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-archive', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      const json = await res.json()
      if (res.ok) {
        showToast(`Cleaned ${json.webhook_deleted ?? 0} old webhook logs`, 'success')
        setLogCount(prev => prev - (json.webhook_deleted ?? 0))
      } else {
        showToast(json.error ?? 'Cleanup failed', 'error')
      }
    } catch { showToast('Cleanup failed', 'error') }
    setArchiving(false)
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
           style={{ backgroundColor: C.bg }}
           onClick={() => setExpanded(p => !p)}>
        <Clock size={13} style={{ color: C.muted }} />
        <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>
          DATA RETENTION
        </p>
        {/* Quick stats */}
        <div className="flex items-center gap-4 mr-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: C.muted }}>Delivery logs:</span>
            <span className="text-[10px] font-black"
                  style={{ color: logCount > 5000 ? C.red : C.text }}>
              {logCount.toLocaleString()} rows
            </span>
          </div>
          {oldestDays > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]" style={{ color: C.muted }}>Oldest:</span>
              <span className="text-[10px] font-black"
                    style={{ color: oldestDays > 30 ? C.amber : C.muted }}>
                {oldestDays}d ago
                {oldestDays > 30 && ' ⚠️'}
              </span>
            </div>
          )}
          <span className="text-[9px] font-black px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
            AUTO 30d
          </span>
        </div>
        {expanded
          ? <ChevronUp   size={13} style={{ color: C.muted }} />
          : <ChevronDown size={13} style={{ color: C.muted }} />}
      </div>

      {expanded && (
        <div className="p-4 border-t flex flex-col gap-4" style={{ borderColor: C.border }}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'DELIVERY LOGS',  value: logCount.toLocaleString(),              warn: logCount > 5000,   sub: 'webhook_delivery_log'  },
              { label: 'OLDEST RECORD',  value: oldestDays > 0 ? `${oldestDays} days` : '—', warn: oldestDays > 30, sub: 'days since first log' },
              { label: 'AUTO-CLEAN',     value: 'Every night',                          warn: false,             sub: 'via daily cron job'    },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl border flex flex-col gap-1"
                   style={{ borderColor: s.warn ? 'rgba(185,28,28,0.25)' : C.border, backgroundColor: s.warn ? 'rgba(185,28,28,0.04)' : C.bg }}>
                <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{s.label}</p>
                <p className="text-[18px] font-black" style={{ color: s.warn ? C.red : C.dark }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>HOW IT WORKS</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.limeDeep }}>Kept forever</p>
                <p className="text-[11px]" style={{ color: C.muted }}>Destinations, event subscriptions, monthly summary stats</p>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.amber }}>Deleted after 30 days</p>
                <p className="text-[11px]" style={{ color: C.muted }}>Individual delivery log rows older than 30 days</p>
              </div>
            </div>
          </div>

          {/* Clean button */}
          <button onClick={handleCleanNow} disabled={archiving}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-40 w-fit px-4"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {archiving
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <><RefreshCw size={13} /> Clean Now</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Delete Confirm Modal ───────────────────────────────────────
function DeleteConfirmModal({
  destination, onClose, onConfirm,
}: {
  destination: any
  onClose:     () => void
  onConfirm:   () => void
}) {
  const [visible,  setVisible]  = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  async function handleConfirm() {
    setDeleting(true)
    await onConfirm()
    handleClose()
  }

  const Icon      = TYPE_ICONS[destination.type] ?? Link2
  const typeStyle = TYPE_COLORS[destination.type] ?? { color: C.muted, bg: C.bg }

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
           style={{
             backgroundColor: C.surface,
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
            <Trash2 size={16} style={{ color: C.red }} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Delete Destination</p>
            <p className="text-[11px]" style={{ color: C.muted }}>This action cannot be undone</p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Destination info */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: typeStyle.bg }}>
              <Icon size={16} style={{ color: typeStyle.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black truncate" style={{ color: C.dark }}>{destination.name}</p>
              <p className="text-[11px] font-mono truncate" style={{ color: C.muted }}>
                {destination.url.length > 35 ? destination.url.slice(0, 35) + '...' : destination.url}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl border"
               style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
            <AlertTriangle size={14} style={{ color: C.red, flexShrink: 0, marginTop: 1 }} />
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-bold" style={{ color: C.red }}>
                Deleting this destination will:
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                → Stop all webhooks firing to this endpoint
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                → Delete all event subscriptions
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                → Remove from delivery log history
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold hover:opacity-80"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: C.red, color: '#ffffff' }}>
              {deleting
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                : <><Trash2 size={14} /> Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [expandedDest, setExpandedDest] = useState<any | null>(null)
  const [deletingDest, setDeletingDest] = useState<any | null>(null)

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

  async function handleTest(id: string, eventType: string = 'test.ping') {
    setTesting(id)

    // Instantly add mock row to delivery log
    const mockLog = {
      id:             `mock-${Date.now()}`,
      destination_id: id,
      event_type:     eventType,
      status:         'pending',
      attempt_number: 1,
      payload:        { event: eventType, source: 'riazify', test: true },
      response_code:  null,
      duration_ms:    null,
      created_at:     new Date().toISOString(),
      webhook_destinations: destinations.find(d => d.id === id),
    }
    setLogs(prev => [mockLog, ...prev])

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/webhooks/test', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ destination_id: id, event_type: eventType }),
      })
      const json = await res.json()

      // Update mock row with real result
      setLogs(prev => prev.map(l =>
        l.id === mockLog.id
          ? { ...l, status: json.success ? 'delivered' : 'failed', response_code: json.status_code, duration_ms: json.duration_ms }
          : l
      ))

      if (json.success) {
        showToast(`Test delivered in ${json.duration_ms}ms`, 'success')
      } else {
        showToast(`Test failed: ${json.response_body ?? json.error}`, 'error')
      }
    } catch {
      setLogs(prev => prev.map(l => l.id === mockLog.id ? { ...l, status: 'failed' } : l))
      showToast('Test failed', 'error')
    }
    setTesting(null)
  }

  async function handleDelete(id: string) {
    const dest = destinations.find(d => d.id === id)
    if (dest) setDeletingDest(dest)
  }

  async function confirmDelete() {
    if (!deletingDest) return
    const id = deletingDest.id
    setDeletingDest(null)
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
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
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

      {/* Destinations Table */}
      {loading ? (
        <div className="flex flex-col gap-2 rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
          {[0,1,2].map(i => <div key={i} className="h-14 animate-pulse" style={{ backgroundColor: C.bg }} />)}
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-2xl border"
             style={{ borderColor: C.border }}>
          <Webhook size={32} style={{ color: C.border }} />
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>No webhook destinations configured</p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={14} /> Add First Destination
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          {/* Table header */}
          <div className="grid px-4 py-2.5 border-b"
               style={{ gridTemplateColumns: '2fr 0.7fr 1.6fr 0.6fr 0.5fr 0.8fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
            {['DESTINATION', 'TYPE', 'EVENTS', 'ACTIVE', 'STATUS', 'ACTIONS'].map(h => (
              <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
            ))}
          </div>
          {/* Table rows */}
          {destinations.map(dest => (
            <DestinationRow
              key={dest.id}
              destination={dest}
              events={events}
              onToggleActive={handleToggleActive}
              onToggleEvent={handleToggleEvent}
              onTest={handleTest}
              onEdit={d => setEditDest(d)}
              onDelete={handleDelete}
              onExpand={d => setExpandedDest(d)}
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

      {/* Delete Confirm Modal */}
      {deletingDest && (
        <DeleteConfirmModal
          destination={deletingDest}
          onClose={() => setDeletingDest(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Events Modal */}
      {expandedDest && (
        <EventsModal
          destination={expandedDest}
          events={events}
          onClose={() => setExpandedDest(null)}
          onToggleEvent={handleToggleEvent}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Add/Edit Modal */}
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
      {/* Data Retention */}
      <WebhookRetentionSection supabase={supabase} showToast={showToast} />

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
