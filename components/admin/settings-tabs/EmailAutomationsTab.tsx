'use client'
// components/admin/settings-tabs/EmailAutomationsTab.tsx
// ══════════════════════════════════════════════════════════════
// Full email automation system with:
// → HUD cards (sent today, open rate, revenue recovered, active flows)
// → Flow matrix table with toggles
// → Step editor popup
// → Last 50 email telemetry logs
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Mail, Zap, BarChart2, DollarSign, Play, Pause,
  ChevronDown, ChevronUp, X, Save, Plus, Trash2,
  RefreshCw, Eye, Check, AlertTriangle, Clock,
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

// ── Types ──────────────────────────────────────────────────────
interface EmailFlow {
  id:            string
  name:          string
  trigger_event: string
  description:   string | null
  is_active:     boolean
  created_at:    string
  steps?:        EmailStep[]
}

interface EmailStep {
  id:           string
  flow_id:      string
  step_order:   number
  delay_days:   number
  subject_line: string
  email_body:   string
}

interface TelemetryLog {
  id:          string
  queue_id:    string | null
  resend_id:   string | null
  event_type:  string
  occurred_at: string
  metadata:    Record<string, any>
  email_queue?: {
    to_email: string
    subject:  string
    flow_id:  string
  }
}

interface HudStats {
  sentToday:        number
  openRate:         number
  clickRate:        number
  activeFlows:      number
  pendingQueue:     number
  revenueRecovered: number
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

function triggerLabel(event: string): string {
  const map: Record<string, string> = {
    'user.signup':    'New Signup',
    'usage.limit_80': '80% Limit Hit',
    'payment.failed': 'Payment Failed',
    'user.inactive':  '14 Days Inactive',
    'plan.upgraded':  'Plan Upgraded',
    'plan.cancelled': 'Plan Cancelled',
  }
  return map[event] ?? event
}

function eventColor(type: string): { color: string; bg: string; label: string } {
  if (type === 'email.opened')    return { color: C.green,    bg: 'rgba(22,163,74,0.08)',   label: 'OPENED'    }
  if (type === 'email.clicked')   return { color: C.limeDeep, bg: C.limeTint,               label: 'CLICKED'   }
  if (type === 'email.delivered') return { color: C.blue,     bg: 'rgba(29,78,216,0.08)',   label: 'DELIVERED' }
  if (type === 'email.bounced')   return { color: C.red,      bg: 'rgba(185,28,28,0.08)',   label: 'BOUNCED'   }
  if (type === 'sent')            return { color: C.muted,    bg: C.bg,                     label: 'SENT'      }
  return { color: C.muted, bg: C.bg, label: type.toUpperCase() }
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark, border: C.lime,   color: C.lime },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: C.red  },
    info:    { bg: C.bg,   border: C.border, color: C.text },
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

// ── HUD Cards ──────────────────────────────────────────────────
function HudCards({ stats, loading }: { stats: HudStats; loading: boolean }) {
  const cards = [
    { title: 'Sent Today',        value: String(stats.sentToday),                    sub: 'emails dispatched',      icon: Mail,        color: C.muted,    bg: C.bg                    },
    { title: 'Open Rate',         value: `${stats.openRate.toFixed(1)}%`,             sub: 'avg across all flows',   icon: Eye,         color: C.limeDeep, bg: C.limeTint              },
    { title: 'Click Rate',        value: `${stats.clickRate.toFixed(1)}%`,            sub: 'link clicks tracked',    icon: Zap,         color: C.blue,     bg: 'rgba(29,78,216,0.08)'  },
    { title: 'Revenue Recovered', value: `$${stats.revenueRecovered.toLocaleString()}`, sub: 'from failed payments', icon: DollarSign,  color: C.green,    bg: 'rgba(22,163,74,0.08)'  },
    { title: 'Active Flows',      value: String(stats.activeFlows),                  sub: 'running automations',    icon: Play,        color: C.limeDeep, bg: C.limeTint              },
    { title: 'Queue Pending',     value: String(stats.pendingQueue),                 sub: 'emails scheduled',       icon: Clock,       color: C.amber,    bg: 'rgba(217,119,6,0.08)'  },
  ]
  return (
    <div className="grid grid-cols-6 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>
                {card.title.toUpperCase()}
              </p>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: card.bg }}>
                <Icon size={13} style={{ color: card.color }} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
            ) : (
              <p className="text-[22px] font-black tracking-tight" style={{ color: C.dark }}>{card.value}</p>
            )}
            <p className="text-[10px] font-semibold" style={{ color: C.muted }}>{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Step Editor Modal ──────────────────────────────────────────
function StepEditorModal({
  step, flowName, onClose, onSaved,
}: {
  step:     EmailStep
  flowName: string
  onClose:  () => void
  onSaved:  (updated: EmailStep) => void
}) {
  const supabase = createClient()
  const [subject,  setSubject]  = useState(step.subject_line)
  const [body,     setBody]     = useState(step.email_body)
  const [delay,    setDelay]    = useState(String(step.delay_days))
  const [saving,   setSaving]   = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [preview,  setPreview]  = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])

  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-flows/update-step', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: step.id, subject_line: subject, email_body: body, delay_days: Number(delay) }),
      })
      if (res.ok) {
        onSaved({ ...step, subject_line: subject, email_body: body, delay_days: Number(delay) })
        handleClose()
      }
    } catch { /* silent */ }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{
             backgroundColor: C.surface, maxHeight: '90vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity: visible ? 1 : 0, transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Mail size={16} style={{ color: C.limeDeep }} />
          <div className="flex-1">
            <p className="text-[15px] font-black" style={{ color: C.dark }}>{flowName} — Step {step.step_order}</p>
            <p className="text-[11px]" style={{ color: C.muted }}>Sent {step.delay_days === 0 ? 'immediately' : `after ${step.delay_days} day${step.delay_days > 1 ? 's' : ''}`}</p>
          </div>
          <button onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-80"
            style={{ backgroundColor: preview ? C.dark : C.limeTint, color: preview ? C.lime : C.limeDeep, border: `1px solid ${C.limeDeep}33` }}>
            <Eye size={12} /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {preview ? (
            /* Email preview */
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>EMAIL PREVIEW</p>
                <p className="text-[13px] font-bold mt-1" style={{ color: C.dark }}>Subject: {subject}</p>
              </div>
              <div className="p-6" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          ) : (
            <>
              {/* Delay setting */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>SEND DELAY</p>
                <div className="flex items-center gap-2">
                  <input value={delay} onChange={e => setDelay(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-20 h-9 px-3 rounded-xl border text-[13px] font-bold outline-none text-center"
                    style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
                  <p className="text-[13px]" style={{ color: C.muted }}>
                    {delay === '0' ? 'days — sends immediately' : `days after trigger`}
                  </p>
                </div>
              </div>

              {/* Subject line */}
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>SUBJECT LINE</p>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
              </div>

              {/* Email body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>EMAIL BODY (HTML)</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>Use {'{{name}}'} for personalization</p>
                </div>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={12}
                  className="w-full px-3 py-2 rounded-xl border text-[12px] font-mono outline-none resize-none"
                  style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t shrink-0" style={{ borderColor: C.border }}>
          <button onClick={handleClose}
            className="py-2.5 px-4 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>
            Cancel
          </button>
          <button onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user?.email) return
            const res = await fetch('/api/admin/email-queue/process', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET ?? '' },
              body:    JSON.stringify({ to_email: session.user.email, subject, html_body: body }),
            })
            if (res.ok) alert(`Test email sent to ${session.user.email}`)
            else alert('Failed to send test email')
          }}
            className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl border text-[13px] font-semibold hover:opacity-80"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.bg }}>
            <Mail size={13} /> Send Test
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            {saving ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> : <><Save size={14} /> Save Step</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Flow Row ───────────────────────────────────────────────────
function FlowRow({
  flow, isExpanded, onToggle, onToggleActive, onEditStep,
  onDeleteFlow, onAddStep, onDeleteStep, toggling,
}: {
  flow:           EmailFlow
  isExpanded:     boolean
  onToggle:       () => void
  onToggleActive: (flow: EmailFlow) => void
  onEditStep:     (step: EmailStep, flowName: string) => void
  onDeleteFlow:   (flow: EmailFlow) => void
  onAddStep:      (flowId: string) => void
  onDeleteStep:   (stepId: string, flowId: string) => void
  toggling:       string | null
}) {
  return (
    <div>
      <div className="grid items-center px-4 py-3 border-b hover:bg-[#fafcf8] transition-colors cursor-pointer"
           style={{ gridTemplateColumns: '1.6fr 1fr 0.6fr 0.5fr 0.3fr 0.3fr', gap: 12, borderColor: C.border }}
           onClick={onToggle}>

        {/* Flow name */}
        <div className="min-w-0">
          <p className="text-[13px] font-black truncate" style={{ color: C.dark }}>{flow.name}</p>
          {flow.description && (
            <p className="text-[11px] truncate" style={{ color: C.muted }}>{flow.description}</p>
          )}
        </div>

        {/* Trigger */}
        <div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
            {triggerLabel(flow.trigger_event)}
          </span>
        </div>

        {/* Steps count */}
        <div>
          <span className="text-[12px] font-bold" style={{ color: C.text }}>
            {flow.steps?.length ?? 0} step{(flow.steps?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Active toggle */}
        <div onClick={e => { e.stopPropagation(); onToggleActive(flow) }}>
          {toggling === flow.id ? (
            <div className="w-10 h-5 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                   style={{ borderTopColor: C.limeDeep }} />
            </div>
          ) : (
            <div className="relative w-10 h-5 rounded-full cursor-pointer"
                 style={{ backgroundColor: flow.is_active ? C.dark : 'rgba(100,116,139,0.35)' }}>
              <div style={{
                position: 'absolute', top: 2, left: 2,
                width: 16, height: 16, borderRadius: '50%',
                backgroundColor: flow.is_active ? C.lime : '#fff',
                transform: flow.is_active ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.25s ease',
              }} />
            </div>
          )}
        </div>

        {/* Delete flow */}
        <div className="flex justify-center" onClick={e => { e.stopPropagation(); onDeleteFlow(flow) }}>
          <div className="w-7 h-7 flex items-center justify-center rounded-xl cursor-pointer hover:opacity-80"
               style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
            <Trash2 size={13} style={{ color: C.red }} />
          </div>
        </div>

        {/* Expand */}
        <div className="flex justify-end">
          <div className="w-7 h-7 flex items-center justify-center rounded-xl border"
               style={{ borderColor: isExpanded ? C.lime : C.border, backgroundColor: isExpanded ? C.limeTint : C.surface }}>
            {isExpanded
              ? <ChevronUp   size={13} style={{ color: C.limeDeep }} />
              : <ChevronDown size={13} style={{ color: C.muted    }} />}
          </div>
        </div>
      </div>

      {/* Expanded steps */}
      {isExpanded && flow.steps && (
        <div className="border-b px-4 py-3" style={{ borderColor: C.border, backgroundColor: C.limeTint }}>

          {/* Exit/Goal condition */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border"
               style={{ backgroundColor: 'rgba(217,119,6,0.06)', borderColor: 'rgba(217,119,6,0.25)' }}>
            <AlertTriangle size={12} style={{ color: C.amber, flexShrink: 0 }} />
            <p className="text-[10px] font-bold" style={{ color: C.amber }}>
              EXIT CONDITION:{' '}
              <span className="font-normal" style={{ color: C.text }}>
                {flow.trigger_event === 'user.signup'    && 'User upgrades to any paid plan — remaining steps cancelled'}
                {flow.trigger_event === 'usage.limit_80' && 'User upgrades plan — sequence stops immediately'}
                {flow.trigger_event === 'payment.failed' && 'Payment succeeds — remaining recovery steps cancelled'}
                {!['user.signup','usage.limit_80','payment.failed'].includes(flow.trigger_event) && 'Sequence runs to completion unless manually stopped'}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>EMAIL STEPS</p>
            <button onClick={() => onAddStep(flow.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
              style={{ backgroundColor: C.dark, color: C.lime }}>
              <Plus size={11} /> Add Step
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {flow.steps.length === 0 && (
              <p className="text-[11px] text-center py-3" style={{ color: C.muted }}>
                No steps yet — click "Add Step" to create one
              </p>
            )}
            {flow.steps.map(step => (
              <div key={step.id}
                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-white"
                   style={{ borderColor: C.border }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black"
                     style={{ backgroundColor: C.dark, color: C.lime }}>
                  {step.step_order}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEditStep(step, flow.name)}>
                  <p className="text-[12px] font-bold truncate" style={{ color: C.dark }}>{step.subject_line}</p>
                  <p className="text-[10px]" style={{ color: C.muted }}>
                    {step.delay_days === 0 ? 'Sends immediately' : `Sends after ${step.delay_days} day${step.delay_days > 1 ? 's' : ''}`}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: C.limeTint, color: C.limeDeep }}
                      onClick={() => onEditStep(step, flow.name)}>
                  Edit →
                </span>
                <button onClick={() => onDeleteStep(step.id, flow.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 shrink-0"
                  style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                  <Trash2 size={11} style={{ color: C.red }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── New Flow Modal ─────────────────────────────────────────────
function NewFlowModal({
  onClose, onCreated,
}: {
  onClose:   () => void
  onCreated: (flow: EmailFlow) => void
}) {
  const supabase = createClient()
  const [name,          setName]          = useState('')
  const [triggerEvent,  setTriggerEvent]  = useState('user.signup')
  const [description,   setDescription]  = useState('')
  const [saving,        setSaving]        = useState(false)
  const [visible,       setVisible]       = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])

  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  const TRIGGER_OPTIONS = [
    { value: 'user.signup',    label: 'New Signup'         },
    { value: 'usage.limit_80', label: '80% Limit Hit'      },
    { value: 'payment.failed', label: 'Payment Failed'     },
    { value: 'user.inactive',  label: '14 Days Inactive'   },
    { value: 'plan.upgraded',  label: 'Plan Upgraded'      },
    { value: 'plan.cancelled', label: 'Plan Cancelled'     },
  ]

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-flows/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ name: name.trim(), trigger_event: triggerEvent, description: description.trim() || null }),
      })
      const json = await res.json()
      if (res.ok) {
        onCreated({ ...json.flow, steps: [] })
        handleClose()
      }
    } catch { /* silent */ }
    setSaving(false)
  }

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

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Mail size={16} style={{ color: C.limeDeep }} />
          <p className="text-[15px] font-black flex-1" style={{ color: C.dark }}>New Email Flow</p>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 p-5">
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>FLOW NAME</p>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Win-back Campaign"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>TRIGGER EVENT</p>
            <select value={triggerEvent} onChange={e => setTriggerEvent(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }}>
              {TRIGGER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DESCRIPTION (optional)</p>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What does this flow do?"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          <p className="text-[11px]" style={{ color: C.muted }}>
            Flow starts inactive — add steps then activate it.
          </p>

          <div className="flex gap-3">
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: C.dark, color: C.lime }}>
              {saving
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                : <><Plus size={14} /> Create Flow</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add Step Modal ─────────────────────────────────────────────
function AddStepModal({
  flowId, flowName, onClose, onAdded,
}: {
  flowId:   string
  flowName: string
  onClose:  () => void
  onAdded:  (step: EmailStep) => void
}) {
  const supabase = createClient()
  const [subject,  setSubject]  = useState('')
  const [body,     setBody]     = useState('<h2>Hello {{name}},</h2>\n<p>Your message here...</p>')
  const [delay,    setDelay]    = useState('0')
  const [saving,   setSaving]   = useState(false)
  const [visible,  setVisible]  = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])

  function handleClose() { setVisible(false); setTimeout(onClose, 250) }

  async function handleSave() {
    if (!subject.trim() || !body.trim()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-flows/add-step', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ flow_id: flowId, delay_days: Number(delay), subject_line: subject, email_body: body }),
      })
      const json = await res.json()
      if (res.ok) { onAdded(json.step as EmailStep); handleClose() }
    } catch { /* silent */ }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4"
         style={{ backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`, transition: 'background-color 0.25s ease' }}
         onClick={handleClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{
             backgroundColor: C.surface, maxHeight: '90vh',
             transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(16px)',
             opacity:   visible ? 1 : 0,
             transition: 'transform 0.25s ease, opacity 0.25s ease',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <Plus size={16} style={{ color: C.limeDeep }} />
          <div className="flex-1">
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Add Step — {flowName}</p>
            <p className="text-[11px]" style={{ color: C.muted }}>New email step added to end of sequence</p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:opacity-70"
            style={{ border: `1px solid ${C.border}` }}>
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>SEND DELAY</p>
            <div className="flex items-center gap-2">
              <input value={delay} onChange={e => setDelay(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-20 h-9 px-3 rounded-xl border text-[13px] font-bold outline-none text-center"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
              <p className="text-[13px]" style={{ color: C.muted }}>
                {delay === '0' ? 'days — sends immediately' : `days after trigger`}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>SUBJECT LINE</p>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Welcome to Riazify!"
              className="w-full h-9 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>EMAIL BODY (HTML)</p>
              <p className="text-[10px]" style={{ color: C.muted }}>Use {'{{name}}'} for personalization</p>
            </div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={10}
              className="w-full px-3 py-2 rounded-xl border text-[12px] font-mono outline-none resize-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t shrink-0" style={{ borderColor: C.border }}>
          <button onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !subject.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <><Save size={14} /> Save Step</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
export default function EmailAutomationsTab() {
  const supabase = createClient()

  const [flows,       setFlows]       = useState<EmailFlow[]>([])
  const [telemetry,   setTelemetry]   = useState<TelemetryLog[]>([])
  const [telemetryError, setTelemetryError] = useState(false)
  const [hudStats,    setHudStats]    = useState<HudStats>({ sentToday: 0, openRate: 0, clickRate: 0, activeFlows: 0, pendingQueue: 0, revenueRecovered: 0 })
  const [loading,     setLoading]     = useState(true)
  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const [toggling,    setToggling]    = useState<string | null>(null)
  const [editingStep,    setEditingStep]    = useState<{ step: EmailStep; flowName: string } | null>(null)
  const [showNewFlow,    setShowNewFlow]    = useState(false)
  const [addingStep,     setAddingStep]     = useState<{ flowId: string; flowName: string } | null>(null)
  const [toast,       setToast]       = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [refreshing,  setRefreshing]  = useState(false)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    try {
      // Fetch flows and steps
      const [
        { data: flowsData },
        { data: stepsData },
        { count: sentTodayCount },
        { count: pendingCount },
      ] = await Promise.all([
        (supabase.from('email_flows') as any).select('*').order('created_at', { ascending: true }),
        (supabase.from('email_flow_steps') as any).select('*').order('step_order', { ascending: true }),
        (supabase.from('email_queue') as any)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'sent')
          .gte('sent_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        (supabase.from('email_queue') as any)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ])

      // Merge steps into flows — handle both old and new column names
      const mergedFlows = (flowsData ?? []).map((f: any) => ({
        ...f,
        name:          f.name          ?? f.title        ?? 'Unnamed Flow',
        trigger_event: f.trigger_event ?? f.trigger      ?? '',
        description:   f.description   ?? f.emails_desc  ?? null,
        steps: (stepsData ?? []).filter((s: any) => s.flow_id === f.id),
      }))
      setFlows(mergedFlows)

      // Fetch telemetry separately to handle errors gracefully
      let telemetryData: any[] = []
      try {
        const { data, error } = await (supabase.from('email_telemetry_logs') as any)
          .select('*, email_queue(to_email, subject, flow_id)')
          .order('occurred_at', { ascending: false })
          .limit(50)
        if (error) throw error
        telemetryData = data ?? []
        setTelemetryError(false)
      } catch {
        setTelemetryError(true)
      }
      setTelemetry(telemetryData)

      // Calculate stats
      const logs      = telemetryData
      const totalSent = logs.filter((l: any) => l.event_type === 'sent').length
      const opened    = logs.filter((l: any) => l.event_type === 'email.opened').length
      const clicked   = logs.filter((l: any) => l.event_type === 'email.clicked').length
      const openRate  = totalSent > 0 ? (opened  / totalSent) * 100 : 0
      const clickRate = totalSent > 0 ? (clicked / totalSent) * 100 : 0

      // Revenue recovered — count delivered payment recovery emails × plan price
      const paymentFlow    = mergedFlows.find((f: any) => f.trigger_event === 'payment.failed')
      let revenueRecovered = 0
      if (paymentFlow) {
        const { count } = await (supabase.from('email_queue') as any)
          .select('id', { count: 'exact', head: true })
          .eq('flow_id', paymentFlow.id)
          .eq('status', 'delivered')
        revenueRecovered = ((count ?? 0) as number) * 19 // estimate $19 avg plan value
      }

      setHudStats({
        sentToday:        sentTodayCount ?? 0,
        openRate,
        clickRate,
        activeFlows:      mergedFlows.filter((f: any) => f.is_active).length,
        pendingQueue:     pendingCount   ?? 0,
        revenueRecovered,
      })
    } catch (e) {
      console.error('[EmailAutomationsTab]', e)
    }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleToggleActive(flow: EmailFlow) {
    setToggling(flow.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-flows/toggle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: flow.id, is_active: !flow.is_active }),
      })
      if (res.ok) {
        setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, is_active: !f.is_active } : f))
        showToast(`${flow.name} ${!flow.is_active ? 'activated' : 'paused'}`, !flow.is_active ? 'success' : 'info')
        setHudStats(prev => ({ ...prev, activeFlows: !flow.is_active ? prev.activeFlows + 1 : prev.activeFlows - 1 }))
      }
    } catch { showToast('Failed to update flow', 'error') }
    setToggling(null)
  }

  function handleStepSaved(updated: EmailStep) {
    setFlows(prev => prev.map(f => ({
      ...f,
      steps: f.steps?.map(s => s.id === updated.id ? updated : s),
    })))
    showToast('Step saved successfully', 'success')
  }

  function handleFlowCreated(flow: EmailFlow) {
    setFlows(prev => [...prev, flow])
    showToast(`${flow.name} created`, 'success')
    setHudStats(prev => ({ ...prev, activeFlows: prev.activeFlows }))
  }

  function handleStepAdded(flowId: string, step: EmailStep) {
    setFlows(prev => prev.map(f => {
      if (f.id !== flowId) return f
      return { ...f, steps: [...(f.steps ?? []), step] }
    }))
    showToast('Step added successfully', 'success')
  }

  async function handleDeleteFlow(flow: EmailFlow) {
    if (!confirm(`Delete "${flow.name}"? This cannot be undone.`)) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-flows/delete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: flow.id }),
      })
      if (res.ok) {
        setFlows(prev => prev.filter(f => f.id !== flow.id))
        showToast(`${flow.name} deleted`, 'info')
      }
    } catch { showToast('Failed to delete flow', 'error') }
  }

  async function handleDeleteStep(stepId: string, flowId: string) {
    if (!confirm('Delete this step? This cannot be undone.')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-flows/delete-step', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: stepId }),
      })
      if (res.ok) {
        setFlows(prev => prev.map(f => {
          if (f.id !== flowId) return f
          return { ...f, steps: f.steps?.filter(s => s.id !== stepId) }
        }))
        showToast('Step deleted', 'info')
      }
    } catch { showToast('Failed to delete step', 'error') }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black tracking-wider mb-0.5" style={{ color: C.muted }}>
            EMAIL AUTOMATIONS
          </p>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Automated email sequences — set once, runs forever
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNewFlow(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            <Plus size={13} /> New Flow
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
      <HudCards stats={hudStats} loading={loading} />

      {/* Flow Matrix */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        {/* Header */}
        <div className="grid px-4 py-2.5 border-b"
             style={{ gridTemplateColumns: '1.6fr 1fr 0.6fr 0.5fr 0.3fr 0.3fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
          {['FLOW NAME', 'TRIGGER', 'STEPS', 'ACTIVE', '', ''].map((h, i) => (
            <span key={i} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[0,1,2].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />)}
          </div>
        ) : flows.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <Mail size={24} style={{ color: C.border }} />
            <p style={{ color: C.muted }}>No email flows configured</p>
          </div>
        ) : (
          flows.map(flow => (
            <FlowRow
              key={flow.id}
              flow={flow}
              isExpanded={expandedId === flow.id}
              onToggle={() => setExpandedId(prev => prev === flow.id ? null : flow.id)}
              onToggleActive={handleToggleActive}
              onEditStep={(step, flowName) => setEditingStep({ step, flowName })}
              onDeleteFlow={handleDeleteFlow}
              onAddStep={(flowId) => setAddingStep({ flowId, flowName: flow.name })}
              onDeleteStep={handleDeleteStep}
              toggling={toggling}
            />
          ))
        )}
      </div>

      {/* Telemetry log */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <BarChart2 size={13} style={{ color: C.muted }} />
          <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>
            EMAIL TELEMETRY LOG
          </p>
          <p className="text-[10px]" style={{ color: C.muted }}>Last 50 events</p>
        </div>

        {/* Log header */}
        <div className="grid px-4 py-2 border-b"
             style={{ gridTemplateColumns: '0.8fr 1.6fr 1.4fr 0.7fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
          {['EVENT', 'SUBJECT', 'RECIPIENT', 'TIME'].map(h => (
            <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>

        {telemetryError ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <AlertTriangle size={24} style={{ color: C.amber }} />
            <p className="text-[13px] font-bold" style={{ color: C.text }}>Failed to load telemetry data</p>
            <p className="text-[11px]" style={{ color: C.muted }}>Database connection error — please retry</p>
            <button onClick={() => { setRefreshing(true); loadData() }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-bold hover:opacity-80"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
              <RefreshCw size={13} /> Retry Connection
            </button>
          </div>
        ) : telemetry.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-[12px]" style={{ color: C.muted }}>No email events yet — they appear here as emails are sent</p>
          </div>
        ) : (
          telemetry.map(log => {
            const ev = eventColor(log.event_type)
            return (
              <div key={log.id}
                   className="grid items-center px-4 py-2.5 border-b last:border-b-0 hover:bg-[#fafcf8]"
                   style={{ gridTemplateColumns: '0.8fr 1.6fr 1.4fr 0.7fr', gap: 12, borderColor: C.border }}>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-lg w-fit"
                      style={{ backgroundColor: ev.bg, color: ev.color }}>
                  {ev.label}
                </span>
                <p className="text-[11px] font-semibold truncate" style={{ color: C.text }}>
                  {log.email_queue?.subject ?? log.metadata?.subject ?? '—'}
                </p>
                <p className="text-[11px] truncate" style={{ color: C.muted }}>
                  {log.email_queue?.to_email ?? log.metadata?.to_email ?? '—'}
                </p>
                <p className="text-[10px]" style={{ color: C.muted }}>{timeAgo(log.occurred_at)}</p>
              </div>
            )
          })
        )}
      </div>

      {/* New Flow Modal */}
      {showNewFlow && (
        <NewFlowModal
          onClose={() => setShowNewFlow(false)}
          onCreated={handleFlowCreated}
        />
      )}

      {/* Add Step Modal */}
      {addingStep && (
        <AddStepModal
          flowId={addingStep.flowId}
          flowName={addingStep.flowName}
          onClose={() => setAddingStep(null)}
          onAdded={(step) => { handleStepAdded(addingStep.flowId, step); setAddingStep(null) }}
        />
      )}

      {/* Step Editor Modal */}
      {editingStep && (
        <StepEditorModal
          step={editingStep.step}
          flowName={editingStep.flowName}
          onClose={() => setEditingStep(null)}
          onSaved={handleStepSaved}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}