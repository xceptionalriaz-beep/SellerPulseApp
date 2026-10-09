'use client'
// components/admin/settings-tabs/EmailAutomationsTab.tsx
// ══════════════════════════════════════════════════════════════
// Full email automation system with:
// → HUD cards (sent today, open rate, revenue recovered, active flows)
// → Flow matrix table with toggles
// → Step editor popup
// → Last 50 email telemetry logs
// ══════════════════════════════════════════════════════════════

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import ProDropdown from '@/components/ui/ProDropdown'
import {
  Mail, Zap, BarChart2, DollarSign, Play, Pause,
  ChevronDown, ChevronUp, X, Save, Plus, Trash2,
  RefreshCw, Eye, Check, AlertTriangle, Clock, Search,
  Calendar, Filter, TrendingUp, Users, Award,
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
  stats?: {
    sent:      number
    openRate:  number
    clickRate: number
    queue:     number
    lastSent:  string | null
  }
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
    to_email:      string
    subject:       string
    flow_id:       string
    scheduled_for: string | null
    sent_at:       string | null
    email_flows?:  { name: string | null; title: string | null } | null
    email_flow_steps?: { step_order: number } | null
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
  step, flowName, onClose, onSaved, canSendTest = true, canEdit = true,
}: {
  step:     EmailStep
  flowName: string
  onClose:  () => void
  onSaved:  (updated: EmailStep) => void
  canSendTest?: boolean
  canEdit?:     boolean
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
          {canSendTest && <button onClick={async () => {
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
            </button>}
            {canEdit && <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              {saving ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} /> : <><Save size={14} /> Save Step</>}
            </button>}
          </div>
        </div>
    </div>
  )
}

// ── Flow Row ───────────────────────────────────────────────────
function FlowRow({
  flow, isExpanded, onToggle, onToggleActive, onEditStep,
  onDeleteFlow, onAddStep, onDeleteStep, toggling, canManage = true, canToggle = true, canDelete = true, canAddStep = true, canDeleteStep = true,
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
  canManage?:     boolean
  canToggle?:     boolean
  canDelete?:     boolean
  canAddStep?:    boolean
  canDeleteStep?: boolean
}) {
  return (
    <div>
      <div className="grid items-center px-4 py-3 border-b hover:bg-[#fafcf8] transition-colors cursor-pointer"
           style={{ gridTemplateColumns: '1.4fr 0.9fr 0.4fr 0.4fr 0.5fr 0.5fr 0.5fr 0.8fr 0.4fr 0.3fr 0.3fr', gap: 10, borderColor: C.border }}
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

        {/* Steps */}
        <div>
          <span className="text-[12px] font-bold" style={{ color: C.text }}>
            {flow.steps?.length ?? 0}
          </span>
        </div>

        {/* Sent */}
        <div>
          <span className="text-[12px] font-bold" style={{ color: C.text }}>
            {flow.stats?.sent ?? 0}
          </span>
        </div>

        {/* Open% */}
        <div>
          <span className="text-[12px] font-bold"
                style={{ color: (flow.stats?.openRate ?? 0) > 0 ? C.limeDeep : C.muted }}>
            {flow.stats?.sent ? `${flow.stats.openRate}%` : '—'}
          </span>
        </div>

        {/* Click% */}
        <div>
          <span className="text-[12px] font-bold"
                style={{ color: (flow.stats?.clickRate ?? 0) > 0 ? C.blue : C.muted }}>
            {flow.stats?.sent ? `${flow.stats.clickRate}%` : '—'}
          </span>
        </div>

        {/* Queue */}
        <div>
          <span className="text-[12px] font-bold"
                style={{ color: (flow.stats?.queue ?? 0) > 0 ? C.amber : C.muted }}>
            {flow.stats?.queue ?? 0}
          </span>
        </div>

        {/* Last Sent */}
        <div>
          <span className="text-[11px]" style={{ color: C.muted }}>
            {flow.stats?.lastSent ? timeAgo(flow.stats.lastSent) : '—'}
          </span>
        </div>

        {/* Active toggle */}
        <div onClick={e => { e.stopPropagation(); canToggle && onToggleActive(flow) }}>
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
        <div className="flex justify-center" onClick={e => { e.stopPropagation(); canDelete && onDeleteFlow(flow) }}>
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
            {canAddStep && <button onClick={() => onAddStep(flow.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold hover:opacity-80"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              <Plus size={11} /> Add Step
            </button>}
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
                     style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
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
                {canDeleteStep && <button onClick={() => onDeleteStep(step.id, flow.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-70 shrink-0"
                  style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
                  <Trash2 size={11} style={{ color: C.red }} />
                </button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Custom Dropdown ────────────────────────────────────────────
function CustomDropdown({
  value, onChange, options, label,
}: {
  value:    string
  onChange: (v: string) => void
  options:  { label: string; value: string }[]
  label:    string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div>
      <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>{label}</p>
      <div className="relative">
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between h-9 px-3 rounded-xl border text-[12px] font-bold transition-all"
          style={{
            backgroundColor: C.bg,
            borderColor:     open ? C.lime : C.border,
            color:           C.text,
            boxShadow:       open ? '0 0 0 3px rgba(143,255,0,0.12)' : 'none',
          }}>
          <span>{selected?.label ?? value}</span>
          <ChevronDown size={13} style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-20"
                 style={{ backgroundColor: C.surface, borderColor: C.border }}>
              {options.map(o => (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold hover:bg-[#f4ffe6] transition-colors"
                  style={{ color: o.value === value ? C.limeDeep : C.text }}>
                  {o.label}
                  {o.value === value && <Check size={12} style={{ color: C.limeDeep }} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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

          <CustomDropdown
            label="TRIGGER EVENT"
            value={triggerEvent}
            onChange={setTriggerEvent}
            options={TRIGGER_OPTIONS}
          />

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
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
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
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
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
// ── Data Retention Section ─────────────────────────────────────
function DataRetentionSection({
  showToast, supabase, canManage = true,
}: {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  supabase:  any
  canManage?: boolean
}) {
  const [settings,      setSettings]      = useState<any>(null)
  const [queueCount,    setQueueCount]    = useState(0)
  const [telCount,      setTelCount]      = useState(0)
  const [oldestQueue,   setOldestQueue]   = useState<string | null>(null)
  const [archiving,     setArchiving]     = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [retDays,       setRetDays]       = useState(90)
  const [autoArchive,   setAutoArchive]   = useState(true)
  const [expanded,      setExpanded]      = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [
          { data: s },
          { count: qc },
          { count: tc },
          { data: oldest },
        ] = await Promise.all([
          (supabase.from('email_retention_settings') as any).select('*').single(),
          (supabase.from('email_queue') as any).select('id', { count: 'exact', head: true }),
          (supabase.from('email_telemetry_logs') as any).select('id', { count: 'exact', head: true }),
          (supabase.from('email_queue') as any).select('created_at').order('created_at', { ascending: true }).limit(1),
        ])
        setSettings(s)
        setQueueCount(qc ?? 0)
        setTelCount(tc ?? 0)
        setOldestQueue(oldest?.[0]?.created_at ?? null)
        if (s) { setRetDays(s.retention_days); setAutoArchive(s.auto_archive_enabled) }
      } catch { /* silent */ }
    }
    load()
  }, [])

  async function handleArchiveNow() {
    setArchiving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/email-archive', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      const json = await res.json()
      if (res.ok) {
        showToast(`Archived ${json.archived_flows} flows · Deleted ${json.queue_deleted + json.telemetry_deleted} rows`, 'success')
        setQueueCount(prev => prev - (json.queue_deleted ?? 0))
        setTelCount(prev   => prev - (json.telemetry_deleted ?? 0))
      } else {
        showToast(json.error ?? 'Archive failed', 'error')
      }
    } catch { showToast('Archive failed', 'error') }
    setArchiving(false)
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      await (supabase.from('email_retention_settings') as any)
        .update({ retention_days: retDays, auto_archive_enabled: autoArchive, updated_at: new Date().toISOString() })
        .eq('id', settings?.id)
      showToast('Retention settings saved', 'success')
    } catch { showToast('Failed to save settings', 'error') }
    setSaving(false)
  }

  const oldestDays = oldestQueue
    ? Math.floor((Date.now() - new Date(oldestQueue).getTime()) / 86400000)
    : 0

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b cursor-pointer"
           style={{ borderColor: C.border, backgroundColor: C.bg }}
           onClick={() => setExpanded(p => !p)}>
        <Clock size={13} style={{ color: C.muted }} />
        <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>
          DATA RETENTION & ARCHIVE
        </p>
        {/* Quick stats */}
        <div className="flex items-center gap-4 mr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: C.muted }}>Queue:</span>
            <span className="text-[10px] font-black" style={{ color: queueCount > 10000 ? C.red : C.text }}>
              {queueCount.toLocaleString()} rows
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: C.muted }}>Telemetry:</span>
            <span className="text-[10px] font-black" style={{ color: telCount > 30000 ? C.red : C.text }}>
              {telCount.toLocaleString()} rows
            </span>
          </div>
          {oldestDays > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]" style={{ color: C.muted }}>Oldest:</span>
              <span className="text-[10px] font-black"
                    style={{ color: oldestDays > retDays ? C.red : C.muted }}>
                {oldestDays}d ago
                {oldestDays > retDays && ' ⚠️'}
              </span>
            </div>
          )}
        </div>
        {expanded
          ? <ChevronUp   size={13} style={{ color: C.muted }} />
          : <ChevronDown size={13} style={{ color: C.muted }} />}
      </div>

      {expanded && (
        <div className="p-5 flex flex-col gap-5">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Queue Rows',      value: queueCount.toLocaleString(),  warn: queueCount > 10000,  sub: 'email_queue table'          },
              { label: 'Telemetry Rows',  value: telCount.toLocaleString(),    warn: telCount > 30000,    sub: 'email_telemetry_logs table'  },
              { label: 'Oldest Record',   value: oldestDays > 0 ? `${oldestDays} days` : '—', warn: oldestDays > retDays, sub: 'days since first record' },
              { label: 'Last Archived',   value: settings?.last_archived_at ? timeAgo(settings.last_archived_at) : 'Never', warn: !settings?.last_archived_at, sub: 'auto-archive run' },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl border flex flex-col gap-1"
                   style={{ borderColor: s.warn ? 'rgba(185,28,28,0.25)' : C.border, backgroundColor: s.warn ? 'rgba(185,28,28,0.04)' : C.bg }}>
                <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{s.label.toUpperCase()}</p>
                <p className="text-[20px] font-black" style={{ color: s.warn ? C.red : C.dark }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>RETENTION PERIOD</p>
              <div className="flex gap-2">
                {[30, 60, 90, 180].map(d => (
                    <button key={d} onClick={() => setRetDays(d)}
                      className="flex-1 py-2 rounded-xl text-[12px] font-bold border transition-all"
                      style={{
                        backgroundColor: retDays === d ? '#1a2410' : C.bg,
                        color:           retDays === d ? C.lime : C.muted,
                        borderColor:     retDays === d ? '#1a2410' : C.border,
                      }}>
                      {d}d
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>AUTO-ARCHIVE</p>
              <div className="flex items-center gap-3">
                <div onClick={() => setAutoArchive(p => !p)}
                     className="relative w-10 h-5 rounded-full cursor-pointer"
                     style={{ backgroundColor: autoArchive ? C.dark : 'rgba(100,116,139,0.35)' }}>
                  <div style={{
                    position: 'absolute', top: 2, left: 2,
                    width: 16, height: 16, borderRadius: '50%',
                    backgroundColor: autoArchive ? C.lime : '#fff',
                    transform: autoArchive ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.25s ease',
                  }} />
                </div>
                <p className="text-[12px]" style={{ color: C.muted }}>
                  {autoArchive ? 'Runs daily via cron job' : 'Manual archive only'}
                </p>
              </div>
            </div>
          </div>

          {/* What gets deleted info */}
          <div className="p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>WHAT GETS ARCHIVED & DELETED</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.limeDeep }}>✅ Archived (kept forever)</p>
                <p className="text-[11px]" style={{ color: C.muted }}>Monthly stats per flow (sent, open rate, click rate)</p>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: C.red }}>🗑 Deleted after {retDays} days</p>
                <p className="text-[11px]" style={{ color: C.muted }}>Individual queue rows + telemetry events older than {retDays} days</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
            {canManage && <div className="flex gap-3">
              <button onClick={handleSaveSettings} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
                style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
                {saving
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.muted }} />
                  : <><Save size={13} /> Save Settings</>}
              </button>
              <button onClick={handleArchiveNow} disabled={archiving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                {archiving
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                  : <><RefreshCw size={13} /> Archive & Clean Now</>}
                </button>
            </div>}
          </div>
        )}
      </div>
  )
}

export default function EmailAutomationsTab() {
  const { can } = useTabPermissions('emails')
  const supabase = createClient()

  const [flows,       setFlows]       = useState<EmailFlow[]>([])
  const [telemetry,   setTelemetry]   = useState<TelemetryLog[]>([])
  const [telemetryError,  setTelemetryError]  = useState(false)
  const [telemetryLimit,  setTelemetryLimit]  = useState(50)
  const [telemetrySearch, setTelemetrySearch] = useState('')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [filterFlow,      setFilterFlow]      = useState('all')
  const [filterEvent,     setFilterEvent]     = useState('all')
  const [filterStatus,    setFilterStatus]    = useState('all')
  const [showFilters,     setShowFilters]     = useState(false)
  const [emailAnalytics,  setEmailAnalytics]  = useState<{
    totalSentMonth:  number
    avgOpenRate:     number
    topRecipient:    { email: string; count: number } | null
    topFlow:         { name: string; openRate: number } | null
    worstFlow:       { name: string; openRate: number } | null
    byDay:           { day: string; count: number }[]
  } | null>(null)
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

      // Merge steps into flows + calculate per-flow stats
      const mergedFlows = await Promise.all((flowsData ?? []).map(async (f: any) => {
        const flowId = f.id

        // Count sent emails for this flow
        const { count: sentCount } = await (supabase.from('email_queue') as any)
          .select('id', { count: 'exact', head: true })
          .eq('flow_id', flowId)
          .in('status', ['sent', 'delivered'])

        // Count pending emails for this flow
        const { count: queueCount } = await (supabase.from('email_queue') as any)
          .select('id', { count: 'exact', head: true })
          .eq('flow_id', flowId)
          .eq('status', 'pending')

        // Last sent email for this flow
        const { data: lastSentData } = await (supabase.from('email_queue') as any)
          .select('sent_at')
          .eq('flow_id', flowId)
          .in('status', ['sent', 'delivered'])
          .order('sent_at', { ascending: false })
          .limit(1)

        // Get queue IDs for telemetry lookup
        const { data: queueIds } = await (supabase.from('email_queue') as any)
          .select('id')
          .eq('flow_id', flowId)

        const ids = (queueIds ?? []).map((q: any) => q.id)

        // Count opens for this flow
        const { count: openCount } = ids.length > 0
          ? await (supabase.from('email_telemetry_logs') as any)
              .select('id', { count: 'exact', head: true })
              .eq('event_type', 'email.opened')
              .in('queue_id', ids)
          : { count: 0 }

        // Count clicks for this flow
        const { count: clickCount } = ids.length > 0
          ? await (supabase.from('email_telemetry_logs') as any)
              .select('id', { count: 'exact', head: true })
              .eq('event_type', 'email.clicked')
              .in('queue_id', ids)
          : { count: 0 }

        const sent      = sentCount ?? 0
        const openRate  = sent > 0 ? Math.round(((openCount  ?? 0) / sent) * 100) : 0
        const clickRate = sent > 0 ? Math.round(((clickCount ?? 0) / sent) * 100) : 0
        const lastSent  = lastSentData?.[0]?.sent_at ?? null

        return {
          ...f,
          name:          f.name          ?? f.title       ?? 'Unnamed Flow',
          trigger_event: f.trigger_event ?? f.trigger     ?? '',
          description:   f.description   ?? f.emails_desc ?? null,
          steps:         (stepsData ?? []).filter((s: any) => s.flow_id === f.id),
          stats:         { sent, openRate, clickRate, queue: queueCount ?? 0, lastSent },
        }
      }))
      setFlows(mergedFlows)

      // Fetch telemetry separately to handle errors gracefully
      let telemetryData: any[] = []
      try {
        const { data, error } = await (supabase.from('email_telemetry_logs') as any)
          .select(`
            *,
            email_queue (
              to_email,
              subject,
              scheduled_for,
              sent_at,
              flow_id,
              step_id,
              email_flows ( name, title ),
              email_flow_steps ( step_order )
            )
          `)
          .order('occurred_at', { ascending: false })
          .limit(telemetryLimit)
        if (error) throw error
        telemetryData = data ?? []
        setTelemetryError(false)
      } catch {
        setTelemetryError(true)
      }
      setTelemetry(telemetryData)

      // ── Email Analytics ───────────────────────────────────────
      try {
        const monthStart = new Date()
        monthStart.setDate(1)
        monthStart.setHours(0,0,0,0)

        // Total sent this month
        const { count: sentMonth } = await (supabase.from('email_queue') as any)
          .select('id', { count: 'exact', head: true })
          .in('status', ['sent', 'delivered'])
          .gte('sent_at', monthStart.toISOString())

        // Top recipient
        const { data: queueAll } = await (supabase.from('email_queue') as any)
          .select('to_email').in('status', ['sent', 'delivered'])
          .gte('sent_at', monthStart.toISOString())

        const recipientMap: Record<string, number> = {}
        ;(queueAll ?? []).forEach((q: any) => {
          recipientMap[q.to_email] = (recipientMap[q.to_email] ?? 0) + 1
        })
        const topRecipientEmail = Object.entries(recipientMap).sort((a,b) => b[1]-a[1])[0]
        const topRecipient = topRecipientEmail
          ? { email: topRecipientEmail[0], count: topRecipientEmail[1] }
          : null

        // By day (last 7 days)
        const byDay = Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return {
            day:   d.toLocaleDateString('en', { weekday: 'short' }),
            date:  d.toISOString().slice(0,10),
            count: (queueAll ?? []).filter((q: any) =>
              q.sent_at?.slice(0,10) === d.toISOString().slice(0,10)
            ).length,
          }
        })

        // Open rate overall
        const totalSent   = (queueAll ?? []).length
        const { count: totalOpened } = await (supabase.from('email_telemetry_logs') as any)
          .select('id', { count: 'exact', head: true })
          .eq('event_type', 'email.opened')
          .gte('occurred_at', monthStart.toISOString())

        const avgOpenRate = totalSent > 0
          ? Math.round(((totalOpened ?? 0) / totalSent) * 100)
          : 0

        setEmailAnalytics({
          totalSentMonth:  sentMonth ?? 0,
          avgOpenRate,
          topRecipient,
          topFlow:         null,
          worstFlow:       null,
          byDay:           byDay.map(d => ({ day: d.day, count: d.count })),
        })
      } catch { /* non-critical */ }

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
  }, [supabase, telemetryLimit])

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
          {can('create_flow') && <button onClick={() => setShowNewFlow(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            <Plus size={13} /> New Flow
          </button>}
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
        {!can('manage_flows') ? (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[13px] font-bold" style={{ color: C.muted }}>You don't have access to view email flows</p>
          </div>
        ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          {/* Header */}
          <div className="grid px-4 py-2.5 border-b"
               style={{ gridTemplateColumns: '1.4fr 0.9fr 0.4fr 0.4fr 0.5fr 0.5fr 0.5fr 0.8fr 0.4fr 0.3fr 0.3fr', gap: 10, borderColor: C.border, backgroundColor: C.bg }}>
            {['FLOW NAME', 'TRIGGER', 'STEPS', 'SENT', 'OPEN%', 'CLICK%', 'QUEUE', 'LAST SENT', 'ACTIVE', '', ''].map((h, i) => (
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
                canManage={can('manage_flows')}
                canToggle={can('toggle_flow')}
                canDelete={can('delete_flow')}
                canAddStep={can('add_step')}
                canDeleteStep={can('delete_step')}
                />
              ))
            )}
          </div>
        )}

      {/* Email Analytics */}
      {emailAnalytics && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <TrendingUp size={13} style={{ color: C.limeDeep }} />
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>EMAIL ANALYTICS — THIS MONTH</p>
          </div>
          <div className="p-4 grid grid-cols-4 gap-4">
            {/* Total sent */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>TOTAL SENT</p>
              <p className="text-[24px] font-black" style={{ color: C.dark }}>{emailAnalytics.totalSentMonth.toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: C.muted }}>this month</p>
            </div>
            {/* Avg open rate */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>AVG OPEN RATE</p>
              <p className="text-[24px] font-black" style={{ color: emailAnalytics.avgOpenRate > 30 ? C.limeDeep : C.amber }}>
                {emailAnalytics.avgOpenRate}%
              </p>
              <p className="text-[10px]" style={{ color: C.muted }}>industry avg: 21%</p>
            </div>
            {/* Top recipient */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>TOP RECIPIENT</p>
              {emailAnalytics.topRecipient ? (
                <>
                  <p className="text-[12px] font-black truncate" style={{ color: C.dark }}>
                    {emailAnalytics.topRecipient.email}
                  </p>
                  <p className="text-[10px]" style={{ color: emailAnalytics.topRecipient.count > 10 ? C.red : C.muted }}>
                    {emailAnalytics.topRecipient.count} emails sent
                    {emailAnalytics.topRecipient.count > 10 && ' ⚠️ high volume'}
                  </p>
                </>
              ) : (
                <p className="text-[12px]" style={{ color: C.muted }}>—</p>
              )}
            </div>
            {/* Last 7 days bar chart */}
            <div className="flex flex-col gap-1 p-3 rounded-xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <p className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>LAST 7 DAYS</p>
              <div className="flex items-end gap-1 h-10 mt-1">
                {emailAnalytics.byDay.map((d, i) => {
                  const max = Math.max(...emailAnalytics.byDay.map(x => x.count), 1)
                  const pct = (d.count / max) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-sm transition-all"
                           style={{
                             height: `${Math.max(pct, 8)}%`,
                             backgroundColor: d.count > 0 ? C.lime : C.border,
                             minHeight: 3,
                           }}
                           title={`${d.day}: ${d.count} emails`} />
                      <span className="text-[7px]" style={{ color: C.muted }}>{d.day[0]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry log */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <BarChart2 size={13} style={{ color: C.muted }} />
          <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
            EMAIL TELEMETRY LOG
          </p>

          {/* Search */}
          <div className="flex-1 mx-3 relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
            <input
              value={telemetrySearch}
              onChange={e => setTelemetrySearch(e.target.value)}
              placeholder="Search by email, subject, flow or event..."
              className="w-full h-7 pl-7 pr-3 rounded-lg border text-[11px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }}
            />
            {telemetrySearch && (
              <button onClick={() => setTelemetrySearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
                <X size={11} style={{ color: C.muted }} />
              </button>
            )}
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-1">
            {[25, 50, 100].map(limit => (
                <button key={limit} onClick={() => { setTelemetryLimit(limit); loadData() }}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all"
                  style={{
                    backgroundColor: telemetryLimit === limit ? C.lime : C.bg,
                    color:           telemetryLimit === limit ? '#1a2410' : C.muted,
                    border:          `1px solid ${telemetryLimit === limit ? C.lime : C.border}`,
                  }}>
                  {limit}
                </button>
              ))}
          </div>
          <p className="text-[10px] ml-1" style={{ color: C.muted }}>
            {telemetrySearch
              ? `${telemetry.filter(log => {
                  const q = telemetrySearch.toLowerCase()
                  const queue = log.email_queue
                  return (
                    log.event_type?.toLowerCase().includes(q) ||
                    queue?.subject?.toLowerCase().includes(q) ||
                    queue?.to_email?.toLowerCase().includes(q) ||
                    (queue?.email_flows?.name ?? queue?.email_flows?.title ?? '')?.toLowerCase().includes(q)
                  )
                }).length} of ${telemetry.length}`
              : `${telemetry.length}`} events
          </p>
          <button onClick={() => setShowFilters(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ml-1 hover:opacity-80"
              style={{
                backgroundColor: showFilters ? C.lime : C.bg,
                color:           showFilters ? '#1a2410' : C.muted,
                border:          `1px solid ${showFilters ? C.lime : C.border}`,
            }}>
            <Filter size={11} /> Filters
          </button>
        </div>

        {/* Filter bar */}
          {showFilters && (
            <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DATE RANGE</p>
                <ProDropdown
                  prefix=""
                  currentValue={filterDateRange}
                  options={[
                    { val: 'all',       label: 'All time',      enabled: true },
                    { val: 'today',     label: 'Today',         enabled: true },
                    { val: 'yesterday', label: 'Yesterday',     enabled: true },
                    { val: '7d',        label: 'Last 7 days',   enabled: true },
                    { val: '30d',       label: 'Last 30 days',  enabled: true },
                    { val: '3m',        label: 'Last 3 months', enabled: true },
                  ]}
                  onChanged={setFilterDateRange}
                  width="full"
                  maxItems={6}
                />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>FLOW</p>
                <ProDropdown
                  prefix=""
                  currentValue={filterFlow}
                  options={[
                    { val: 'all', label: 'All flows', enabled: true },
                    ...flows.map(f => ({ val: f.id, label: f.name, enabled: true })),
                  ]}
                  onChanged={setFilterFlow}
                  width="full"
                  maxItems={6}
                />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>EVENT TYPE</p>
                <ProDropdown
                  prefix=""
                  currentValue={filterEvent}
                  options={[
                    { val: 'all',             label: 'All events', enabled: true },
                    { val: 'sent',            label: 'Sent',       enabled: true },
                    { val: 'email.delivered', label: 'Delivered',  enabled: true },
                    { val: 'email.opened',    label: 'Opened',     enabled: true },
                    { val: 'email.clicked',   label: 'Clicked',    enabled: true },
                    { val: 'email.bounced',   label: 'Bounced',    enabled: true },
                  ]}
                  onChanged={setFilterEvent}
                  width="full"
                  maxItems={6}
                />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>STATUS</p>
                <ProDropdown
                  prefix=""
                  currentValue={filterStatus}
                  options={[
                    { val: 'all',       label: 'All statuses', enabled: true },
                    { val: 'pending',   label: 'Pending',      enabled: true },
                    { val: 'sent',      label: 'Sent',         enabled: true },
                      { val: 'delivered', label: 'Delivered',    enabled: true },
                      { val: 'failed',    label: 'Failed',       enabled: true },
                      { val: 'cancelled', label: 'Cancelled',    enabled: true },
                    ]}
                  onChanged={setFilterStatus}
                    width="full"
                    maxItems={6}
                  />
              </div>
            </div>
          )}

        {/* Log header */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: 900 }}>
            <div className="grid px-4 py-2 border-b"
                 style={{ gridTemplateColumns: '0.7fr 1fr 0.4fr 1.2fr 1.1fr 0.8fr 0.8fr 0.6fr', gap: 10, borderColor: C.border, backgroundColor: C.bg }}>
              {['EVENT', 'FLOW', 'STEP', 'SUBJECT', 'RECIPIENT', 'SCHEDULED', 'SENT AT', 'TIME'].map(h => (
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
              telemetry
                .filter(log => {
                  const queue = log.email_queue

                  // Search filter
                  if (telemetrySearch) {
                    const q = telemetrySearch.toLowerCase()
                    const matches =
                      log.event_type?.toLowerCase().includes(q) ||
                      queue?.subject?.toLowerCase().includes(q) ||
                      queue?.to_email?.toLowerCase().includes(q) ||
                      (queue?.email_flows?.name ?? queue?.email_flows?.title ?? '')?.toLowerCase().includes(q)
                    if (!matches) return false
                  }

                  // Event filter
                  if (filterEvent !== 'all' && log.event_type !== filterEvent) return false

                  // Flow filter
                  if (filterFlow !== 'all' && queue?.flow_id !== filterFlow) return false

                  // Date range filter
                  if (filterDateRange !== 'all') {
                    const now  = new Date()
                    const date = new Date(log.occurred_at)
                    if (filterDateRange === 'today') {
                      if (date.toDateString() !== now.toDateString()) return false
                    } else if (filterDateRange === 'yesterday') {
                      const yesterday = new Date(now)
                      yesterday.setDate(yesterday.getDate() - 1)
                      if (date.toDateString() !== yesterday.toDateString()) return false
                    } else if (filterDateRange === '7d') {
                      const cutoff = new Date(now)
                      cutoff.setDate(cutoff.getDate() - 7)
                      if (date < cutoff) return false
                    } else if (filterDateRange === '30d') {
                      const cutoff = new Date(now)
                      cutoff.setDate(cutoff.getDate() - 30)
                      if (date < cutoff) return false
                    } else if (filterDateRange === '3m') {
                      const cutoff = new Date(now)
                      cutoff.setMonth(cutoff.getMonth() - 3)
                      if (date < cutoff) return false
                    }
                  }

                  return true
                })
                .map(log => {
                const ev        = eventColor(log.event_type)
                const queue     = log.email_queue
                const flowName  = queue?.email_flows?.name ?? queue?.email_flows?.title ?? '—'
                const stepOrder = queue?.email_flow_steps?.step_order
                const subject   = queue?.subject   ?? log.metadata?.subject  ?? '—'
                const recipient = queue?.to_email   ?? log.metadata?.to_email ?? '—'
                const scheduled = queue?.scheduled_for ?? null
                const sentAt    = queue?.sent_at       ?? null

                const fmtDate = (iso: string | null) => {
                  if (!iso) return '—'
                  const d = new Date(iso)
                  return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
                }

                return (
                  <div key={log.id}
                       className="grid items-center px-4 py-2.5 border-b last:border-b-0 hover:bg-[#fafcf8]"
                       style={{ gridTemplateColumns: '0.7fr 1fr 0.4fr 1.2fr 1.1fr 0.8fr 0.8fr 0.6fr', gap: 10, borderColor: C.border }}>

                    {/* EVENT */}
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg w-fit"
                          style={{ backgroundColor: ev.bg, color: ev.color }}>
                      {ev.label}
                    </span>

                    {/* FLOW */}
                    <p className="text-[10px] font-semibold truncate" style={{ color: C.text }}>
                      {flowName}
                    </p>

                    {/* STEP */}
                    <div className="flex items-center justify-center">
                      {stepOrder != null ? (
                        <span className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                          {stepOrder}
                        </span>
                      ) : (
                        <span style={{ color: C.muted }}>—</span>
                      )}
                    </div>

                    {/* SUBJECT */}
                    <p className="text-[11px] font-semibold truncate" style={{ color: C.text }}>
                      {subject}
                    </p>

                    {/* RECIPIENT */}
                    <p className="text-[11px] truncate" style={{ color: C.muted }}>
                      {recipient}
                    </p>

                    {/* SCHEDULED */}
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {fmtDate(scheduled)}
                    </p>

                    {/* SENT AT */}
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {fmtDate(sentAt)}
                    </p>

                    {/* TIME */}
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      {timeAgo(log.occurred_at)}
                    </p>

                  </div>
                )
              })
            )}
          </div>
        </div>
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
            canSendTest={can('send_test')}
            canEdit={can('edit_templates')}
          />
      )}

      {/* Data Retention Section */}
      <DataRetentionSection showToast={showToast} supabase={supabase} canManage={can('manage_retention')} />

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}
