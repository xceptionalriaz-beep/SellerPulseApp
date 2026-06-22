'use client'
// components/admin/settings-tabs/PlanLimitsTab.tsx
// ══════════════════════════════════════════════════════════════
// RIAZIFY — Plan Limits Tab
// Dynamic feature gating matrix — fully database driven
// Inline editing with secure save confirmation
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Users, Lock, Check, X, Edit3,
  ChevronDown, ChevronUp, Save, RefreshCw,
  Zap, BarChart2, Download, Globe, Star,
  AlertTriangle, Shield, Layout,
} from 'lucide-react'
import PricingEditorModal from '@/components/admin/PricingEditorModal'

// ── Design tokens ──────────────────────────────────────────────
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
interface PlanLimit {
  id:                      string
  tier:                    string
  plan_id:                 string | null
  display_name:            string | null
  daily_searches:          string | null
  vero_checks:             string | null
  support_level:           string | null
  max_monthly_searches:    number | null
  max_vero_checks:         number | null
  max_tracked_items:       number | null
  max_orders_protected:    number | null
  max_ebay_stores:         number | null
  max_team_seats:          number | null
  max_message_templates:   number | null
  max_ai_optimize:         number | null
  max_keyword_searches:    number | null
  max_competitor_extract:  number | null
  max_title_generations:   number | null
  max_profit_calcs:        number | null
  has_advanced_analytics:  boolean
  has_bulk_export:         boolean
  has_title_builder:       boolean
  has_competitor_research: boolean
  has_api_access:          boolean
  has_priority_support:    boolean
  has_evidence_vault:      boolean
  has_csv_export:          boolean
  has_pdf_export:          boolean
  has_multi_currency:      boolean
  has_message_templates:   boolean
  has_pro_charts_hud:      boolean
  has_30d_trend:           boolean
  has_bulk_title_gen:      boolean
  has_vero_bulk_check:     boolean
  has_vero_alerts:         boolean
  has_ai_suggestions:      boolean
  has_evidence_pdf:        string | null
  has_buyer_profiling:     string | null
  has_auto_sync:           string | null
  has_analytics:           string | null
  trial_days:              number | null
  grace_period_days:       number | null
  price_monthly:           number
  price_annual:            number
  is_active:               boolean
  updated_at:              string
}

interface HudStats {
  freeUsers:     number
  premiumSubs:   number
  gatingTunnels: number
  mrr:           number
  starterCount:  number
  growthCount:   number
  customCount:   number
}

interface EditState {
  max_monthly_searches:    string
  max_vero_checks:         string
  max_tracked_items:       string
  max_orders_protected:    string
  max_ebay_stores:         string
  max_team_seats:          string
  max_message_templates:   string
  max_ai_optimize:         string
  max_keyword_searches:    string
  max_competitor_extract:  string
  trial_days:              string
  grace_period_days:       string
  has_advanced_analytics:  boolean
  has_bulk_export:         boolean
  has_title_builder:       boolean
  has_competitor_research: boolean
  has_api_access:          boolean
  has_priority_support:    boolean
  has_evidence_vault:      boolean
  has_csv_export:          boolean
  has_pdf_export:          boolean
  has_multi_currency:      boolean
  has_message_templates:   boolean
  has_pro_charts_hud:      boolean
  has_30d_trend:           boolean
  has_bulk_title_gen:      boolean
  has_vero_bulk_check:     boolean
  has_vero_alerts:         boolean
  has_ai_suggestions:      boolean
  has_evidence_pdf:        string
  has_buyer_profiling:     string
  has_auto_sync:           string
  has_analytics:           string
  price_monthly:           string
  price_annual:            string
}

// ── Helpers ────────────────────────────────────────────────────
function displayLimit(value: number | null): string {
  if (value === null || value === undefined) return '—'
  if (value === -1) return '∞'
  return value.toLocaleString()
}

function isUnlimited(value: number | null): boolean {
  return value === -1
}

function countGatingTunnels(plans: PlanLimit[]): number {
  let count = 0
  const numericFields: (keyof PlanLimit)[] = [
    'max_monthly_searches', 'max_vero_checks',
    'max_tracked_items', 'max_orders_protected', 'max_ebay_stores',
  ]
  for (const plan of plans) {
    for (const field of numericFields) {
      const val = plan[field] as number | null
      if (val !== null && val !== -1 && val > 0) count++
    }
  }
  return count
}

function planToEditState(plan: PlanLimit): EditState {
  return {
    max_monthly_searches:    String(plan.max_monthly_searches    ?? ''),
    max_vero_checks:         String(plan.max_vero_checks         ?? ''),
    max_tracked_items:       String(plan.max_tracked_items       ?? ''),
    max_orders_protected:    String(plan.max_orders_protected    ?? ''),
    max_ebay_stores:         String(plan.max_ebay_stores         ?? ''),
    max_team_seats:          String(plan.max_team_seats          ?? ''),
    max_message_templates:   String(plan.max_message_templates   ?? ''),
    max_ai_optimize:         String(plan.max_ai_optimize         ?? ''),
    max_keyword_searches:    String(plan.max_keyword_searches    ?? ''),
    max_competitor_extract:  String(plan.max_competitor_extract  ?? ''),
    trial_days:              String(plan.trial_days              ?? ''),
    grace_period_days:       String(plan.grace_period_days       ?? ''),
    has_advanced_analytics:  plan.has_advanced_analytics,
    has_bulk_export:         plan.has_bulk_export,
    has_title_builder:       plan.has_title_builder,
    has_competitor_research: plan.has_competitor_research,
    has_api_access:          plan.has_api_access,
    has_priority_support:    plan.has_priority_support,
    has_evidence_vault:      plan.has_evidence_vault    ?? false,
    has_csv_export:          plan.has_csv_export        ?? false,
    has_pdf_export:          plan.has_pdf_export        ?? false,
    has_multi_currency:      plan.has_multi_currency    ?? false,
    has_message_templates:   plan.has_message_templates ?? true,
    has_pro_charts_hud:      plan.has_pro_charts_hud   ?? false,
    has_30d_trend:           plan.has_30d_trend         ?? false,
    has_bulk_title_gen:      plan.has_bulk_title_gen    ?? false,
    has_vero_bulk_check:     plan.has_vero_bulk_check   ?? false,
    has_vero_alerts:         plan.has_vero_alerts       ?? false,
    has_ai_suggestions:      plan.has_ai_suggestions    ?? false,
    has_evidence_pdf:        plan.has_evidence_pdf      ?? 'none',
    has_buyer_profiling:     plan.has_buyer_profiling   ?? 'none',
    has_auto_sync:           plan.has_auto_sync         ?? 'manual',
    has_analytics:           plan.has_analytics         ?? 'none',
    price_monthly:           String(plan.price_monthly  ?? ''),
    price_annual:            String(plan.price_annual   ?? ''),
  }
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,    border: C.lime,   color: C.lime },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: C.red  },
    info:    { bg: C.bg,      border: C.border,  color: C.text },
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
    {
      title: 'Free Users',
      value: stats.freeUsers.toString(),
      sub:   'on Free plan',
      icon:  Users,
      color: C.muted,
      bg:    C.bg,
    },
    {
      title: 'Paid Subscribers',
      value: stats.premiumSubs.toString(),
      sub:   `${stats.starterCount} Starter · ${stats.growthCount} Growth · ${stats.customCount} Custom`,
      icon:  Star,
      color: C.limeDeep,
      bg:    C.limeTint,
    },
    {
      title: 'MRR',
      value: `$${stats.mrr.toLocaleString()}`,
      sub:   `$${(stats.mrr * 12).toLocaleString()} annual run rate`,
      icon:  Zap,
      color: stats.mrr > 0 ? C.green : C.muted,
      bg:    stats.mrr > 0 ? 'rgba(22,163,74,0.08)' : C.bg,
    },
    {
      title: 'Active Gating Tunnels',
      value: stats.gatingTunnels.toString(),
      sub:   'capped feature limits',
      icon:  Lock,
      color: C.blue,
      bg:    'rgba(29,78,216,0.08)',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card, i) => {
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
              <p className="text-[28px] font-black tracking-tight" style={{ color: C.dark }}>
                {card.value}
              </p>
            )}
            <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{card.sub}</p>
          </div>
        )
      })}
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
function BoolToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)}
         className="relative w-10 h-5 rounded-full cursor-pointer transition-colors shrink-0"
         style={{ backgroundColor: value ? C.lime : C.border }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
           style={{ left: value ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ── Numeric Input ──────────────────────────────────────────────
function NumericInput({
  label, value, onChange, hint,
}: {
  label:    string
  value:    string
  onChange: (v: string) => void
  hint?:    string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>
        {label.toUpperCase()}
      </p>
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9-]/g, ''))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="-1 for unlimited"
        className="w-full h-9 px-3 rounded-xl border text-[13px] font-bold outline-none"
        style={{
          borderColor:     focused ? C.lime : C.border,
          backgroundColor: C.bg,
          color:           value === '-1' ? C.limeDeep : C.text,
          boxShadow:       focused ? '0 0 0 3px rgba(143,255,0,0.12)' : 'none',
          transition:      'border-color 0.2s, box-shadow 0.2s',
        }}
      />
      {hint && <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{hint}</p>}
    </div>
  )
}

// ── Shared grid columns — defined ONCE, used by both header and rows ──
const PLAN_GRID = '1fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.4fr'
const PLAN_COLS = ['PLAN', 'MONTHLY', 'ANNUAL', 'SEARCHES', 'VERO', 'ORDERS', 'TITLES/DAY', 'AI/DAY', 'STORES', 'SEATS', 'EVIDENCE', 'SYNC', 'ANALYTICS', 'EXPORT', 'API', 'SUPPORT', 'VAULT', 'TRIAL', 'GRACE', 'ACTIVE', '']

// ── Plan Row ───────────────────────────────────────────────────
function PlanRow({
  plan,
  isExpanded,
  onToggle,
  onToggleActive,
}: {
  plan:           PlanLimit
  isExpanded:     boolean
  onToggle:       () => void
  onToggleActive: (plan: PlanLimit) => void
}) {
  const planColors: Record<string, { color: string; bg: string }> = {
    free:    { color: C.muted,    bg: C.bg                    },
    starter: { color: C.blue,     bg: 'rgba(29,78,216,0.08)'  },
    growth:  { color: C.limeDeep, bg: C.limeTint              },
    custom:  { color: C.amber,    bg: 'rgba(217,119,6,0.08)'  },
  }
  const pc = planColors[plan.plan_id ?? ''] ?? { color: C.text, bg: C.bg }

  const numericCols = [
    { value: plan.max_monthly_searches,  label: 'Searches'   },
    { value: plan.max_vero_checks,       label: 'VeRO'       },
    { value: plan.max_orders_protected,  label: 'Orders'     },
    { value: plan.max_title_generations, label: 'Titles/day' },
    { value: plan.max_ai_optimize,       label: 'AI/day'     },
    { value: plan.max_ebay_stores,       label: 'Stores'     },
    { value: plan.max_team_seats,        label: 'Seats'      },
  ]

  const textCols = [
    { value: plan.has_evidence_pdf, label: 'Evidence' },
    { value: plan.has_auto_sync,    label: 'Sync'     },
  ]

  const boolCols = [
    { value: plan.has_advanced_analytics, label: 'Analytics' },
    { value: plan.has_bulk_export,        label: 'Export'    },
    { value: plan.has_api_access,         label: 'API'       },
    { value: plan.has_priority_support,   label: 'Support'   },
    { value: plan.has_evidence_vault,     label: 'Vault'     },
  ]

  return (
    <div
      className="grid items-center px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-[#fafcf8] transition-colors"
      style={{
        gridTemplateColumns: PLAN_GRID,
        gap:             10,
        borderColor:     C.border,
        backgroundColor: isExpanded ? C.limeTint : !plan.is_active ? 'rgba(100,116,139,0.04)' : undefined,
        opacity:         plan.is_active ? 1 : 0.6,
      }}
      onClick={onToggle}>

      {/* 1 — Plan name */}
      <div className="flex items-center min-w-0">
        <div className="px-2 py-0.5 rounded-lg shrink-0"
             style={{ backgroundColor: pc.bg }}>
          <p className="text-[11px] font-black" style={{ color: pc.color }}>
            {plan.display_name ?? plan.tier}
          </p>
        </div>
      </div>

      {/* 2 — Monthly price */}
      <div className="flex items-center justify-center">
        <p className="text-[11px] font-bold" style={{ color: C.text }}>
          ${plan.price_monthly}/mo
        </p>
      </div>

      {/* 3 — Annual price */}
      <div className="flex flex-col items-center justify-center gap-0.5">
        {plan.price_annual > 0 ? (
          <>
            <p className="text-[11px] font-bold" style={{ color: C.limeDeep }}>
              ${plan.price_annual}/yr
            </p>
            {plan.price_monthly > 0 && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                SAVE {Math.round((1 - plan.price_annual / (plan.price_monthly * 12)) * 100)}%
              </span>
            )}
          </>
        ) : (
          <p className="text-[11px] font-bold" style={{ color: C.muted }}>—</p>
        )}
      </div>

      {/* 3–9 — Numeric limits */}
      {numericCols.map((col, i) => (
        <div key={i} className="flex items-center justify-center">
          {col.value === null || col.value === undefined ? (
            <span className="text-[12px]" style={{ color: C.muted }}>—</span>
          ) : isUnlimited(col.value) ? (
            <span className="text-[13px] font-black" style={{ color: C.limeDeep }}>∞</span>
          ) : (
            <span className="text-[12px] font-bold" style={{ color: C.text }}>
              {displayLimit(col.value)}
            </span>
          )}
        </div>
      ))}

      {/* 10–11 — Text tier columns (Evidence PDF, Auto Sync) */}
      {textCols.map((col, i) => (
        <div key={i} className="flex items-center justify-center">
          {!col.value || col.value === 'none' || col.value === 'manual' ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>
              {col.value === 'manual' ? 'Manual' : 'None'}
            </span>
          ) : (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize"
                  style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
              {col.value}
            </span>
          )}
        </div>
      ))}

      {/* 12–16 — Boolean flags */}
      {boolCols.map((col, i) => (
        <div key={i} className="flex items-center justify-center">
          {col.value == null ? (
            <span className="text-[12px]" style={{ color: C.muted }}>—</span>
          ) : col.value ? (
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: C.limeTint }}>
              <Check size={11} style={{ color: C.limeDeep }} />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(185,28,28,0.08)' }}>
              <X size={11} style={{ color: C.red }} />
            </div>
          )}
        </div>
      ))}

      {/* 18 — Trial days */}
      <div className="flex items-center justify-center">
        <span className="text-[11px] font-bold" style={{ color: C.text }}>
          {plan.trial_days != null ? `${plan.trial_days}d` : '—'}
        </span>
      </div>

      {/* 19 — Grace period */}
      <div className="flex items-center justify-center">
        <span className="text-[11px] font-bold" style={{ color: C.amber }}>
          {plan.grace_period_days != null ? `${plan.grace_period_days}d` : '—'}
        </span>
      </div>

      {/* 20 — Active toggle */}
      <div className="flex items-center justify-center" onClick={e => { e.stopPropagation(); onToggleActive(plan) }}>
        <div className="relative w-9 h-5 rounded-full cursor-pointer transition-colors"
             style={{ backgroundColor: plan.is_active ? C.dark : 'rgba(100,116,139,0.35)' }}>
          <div style={{
            position: 'absolute', top: '2px', left: '2px',
            width: '16px', height: '16px', borderRadius: '50%',
            backgroundColor: plan.is_active ? C.lime : '#fff',
            transform: plan.is_active ? 'translateX(17px)' : 'translateX(0px)',
            transition: 'transform 0.25s ease',
          }} />
        </div>
      </div>

      {/* 21 — Expand icon */}
      <div className="flex justify-end">
        <div className="w-7 h-7 flex items-center justify-center rounded-xl border"
             style={{ borderColor: isExpanded ? C.lime : C.border, backgroundColor: isExpanded ? C.limeTint : C.surface }}>
          {isExpanded
            ? <ChevronUp   size={13} style={{ color: C.limeDeep }} />
            : <ChevronDown size={13} style={{ color: C.muted    }} />}
        </div>
      </div>
    </div>
  )
}

// ── Edit Panel ─────────────────────────────────────────────────
function EditPanel({
  plan,
  onClose,
  onSaved,
  showToast,
}: {
  plan:      PlanLimit
  onClose:   () => void
  onSaved:   (updated: PlanLimit) => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  const supabase          = createClient()
  const [edit, setEdit]   = useState<EditState>(planToEditState(plan))
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  function updateEdit(key: keyof EditState, value: string | boolean) {
    setEdit(prev => ({ ...prev, [key]: value }))
  }

  function validateEdit(): boolean {
    const numericFields: (keyof EditState)[] = [
      'max_monthly_searches', 'max_vero_checks',
      'max_tracked_items', 'max_orders_protected', 'max_ebay_stores',
      'max_team_seats', 'max_message_templates',
      'max_ai_optimize', 'max_keyword_searches', 'max_competitor_extract',
      'trial_days', 'grace_period_days',
    ]
    for (const field of numericFields) {
      const val = Number(edit[field])
      if (isNaN(val)) { setError(`${field.replace(/_/g, ' ')} must be a number`); return false }
      if (val < -1)   { setError(`${field.replace(/_/g, ' ')} must be -1 (unlimited) or a positive number`); return false }
    }
    if (Number(edit.price_monthly) < 0) { setError('Monthly price cannot be negative'); return false }
    if (Number(edit.price_annual)  < 0) { setError('Annual price cannot be negative');  return false }
    return true
  }

  async function handleSave() {
    if (!validateEdit()) return
    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/plan-limits/update', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({
          id:                      plan.id,
          max_monthly_searches:    Number(edit.max_monthly_searches),
          max_vero_checks:         Number(edit.max_vero_checks),
          max_tracked_items:       Number(edit.max_tracked_items),
          max_orders_protected:    Number(edit.max_orders_protected),
          max_ebay_stores:         Number(edit.max_ebay_stores),
          max_team_seats:          Number(edit.max_team_seats),
          has_advanced_analytics:  edit.has_advanced_analytics,
          has_bulk_export:         edit.has_bulk_export,
          has_title_builder:       edit.has_title_builder,
          has_competitor_research: edit.has_competitor_research,
          has_api_access:          edit.has_api_access,
          has_priority_support:    edit.has_priority_support,
          has_evidence_vault:      edit.has_evidence_vault,
          has_csv_export:          edit.has_csv_export,
          has_pdf_export:          edit.has_pdf_export,
          has_multi_currency:      edit.has_multi_currency,
          has_message_templates:   edit.has_message_templates,
          has_pro_charts_hud:      edit.has_pro_charts_hud,
          has_30d_trend:           edit.has_30d_trend,
          has_bulk_title_gen:      edit.has_bulk_title_gen,
          has_vero_bulk_check:     edit.has_vero_bulk_check,
          has_vero_alerts:         edit.has_vero_alerts,
          has_ai_suggestions:      edit.has_ai_suggestions,
          has_evidence_pdf:        edit.has_evidence_pdf,
          has_buyer_profiling:     edit.has_buyer_profiling,
          has_auto_sync:           edit.has_auto_sync,
          has_analytics:           edit.has_analytics,
          max_message_templates:   Number(edit.max_message_templates),
          max_ai_optimize:         Number(edit.max_ai_optimize),
          max_keyword_searches:    Number(edit.max_keyword_searches),
          max_competitor_extract:  Number(edit.max_competitor_extract),
          trial_days:              Number(edit.trial_days),
          grace_period_days:       Number(edit.grace_period_days),
          price_monthly:           Number(edit.price_monthly),
          price_annual:            Number(edit.price_annual),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save'); setSaving(false); return }
      onSaved(json.plan as PlanLimit)
      showToast(`${plan.display_name ?? plan.tier} limits updated`, 'success')
      onClose()
    } catch { setError('Network error — please try again') }
    setSaving(false)
  }

  const boolFeatures: { key: keyof EditState; label: string; icon: any; section: string }[] = [
    // General
    { key: 'has_title_builder',       label: 'Title Builder',       icon: Edit3,     section: 'General'  },
    { key: 'has_competitor_research', label: 'Competitor Research', icon: Globe,     section: 'General'  },
    { key: 'has_api_access',          label: 'API Access',          icon: Zap,       section: 'General'  },
    { key: 'has_priority_support',    label: 'Priority Support',    icon: Star,      section: 'General'  },
    { key: 'has_advanced_analytics',  label: 'Advanced Analytics',  icon: BarChart2, section: 'General'  },
    { key: 'has_bulk_export',         label: 'Bulk Export',         icon: Download,  section: 'General'  },
    // Title Builder
    { key: 'has_pro_charts_hud',      label: 'PRO Charts HUD',      icon: BarChart2, section: 'Title'    },
    { key: 'has_30d_trend',           label: '30D Trend Visualizer',icon: BarChart2, section: 'Title'    },
    { key: 'has_bulk_title_gen',      label: 'Bulk Title Gen',      icon: Edit3,     section: 'Title'    },
    { key: 'has_ai_suggestions',      label: 'AI Suggestions',      icon: Zap,       section: 'Title'    },
    // VeRO
    { key: 'has_vero_bulk_check',     label: 'VeRO Bulk Check',     icon: Shield,    section: 'VeRO'     },
    { key: 'has_vero_alerts',         label: 'VeRO Alerts',         icon: Shield,    section: 'VeRO'     },
    // Orders
    { key: 'has_evidence_vault',      label: 'Evidence Vault',      icon: Shield,    section: 'Orders'   },
    { key: 'has_csv_export',          label: 'CSV Export',          icon: Download,  section: 'Orders'   },
    { key: 'has_pdf_export',          label: 'PDF Export',          icon: Download,  section: 'Orders'   },
    { key: 'has_multi_currency',      label: 'Multi-Currency',      icon: Globe,     section: 'Orders'   },
    { key: 'has_message_templates',   label: 'Message Templates',   icon: Zap,       section: 'Orders'   },
  ]

  const tierOptions = [
    { label: 'None',      value: 'none'     },
    { label: 'Basic',     value: 'basic'    },
    { label: 'Full',      value: 'full'     },
  ]

  const syncOptions = [
    { label: 'Manual',    value: 'manual'   },
    { label: '30 min',    value: '30min'    },
    { label: '5 min',     value: '5min'     },
    { label: 'Real-time', value: 'realtime' },
  ]

  return (
    <div className="border-b overflow-hidden"
         style={{ borderColor: C.border, backgroundColor: C.limeTint }}>
      <div className="px-5 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit3 size={15} style={{ color: C.limeDeep }} />
            <p className="text-[14px] font-black" style={{ color: C.dark }}>
              Editing: {plan.display_name ?? plan.tier}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}40` }}>
              -1 = Unlimited
            </span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-white"
            style={{ color: C.muted }}>
            <X size={14} />
          </button>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-xl border mb-4"
               style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
            <p className="text-[12px] font-bold" style={{ color: C.red }}>{error}</p>
          </div>
        )}

        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* Left — Numeric limits */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl border bg-white"
               style={{ borderColor: C.border }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
              NUMERIC LIMITS
            </p>
            <div className="grid grid-cols-2 gap-3">
              <NumericInput label="Monthly Searches"    value={edit.max_monthly_searches}    onChange={v => updateEdit('max_monthly_searches',    v)} hint="Product searches/month"       />
              <NumericInput label="VeRO Checks"         value={edit.max_vero_checks}         onChange={v => updateEdit('max_vero_checks',         v)} hint="VeRO scans/month"            />
              <NumericInput label="Tracked Items"       value={edit.max_tracked_items}       onChange={v => updateEdit('max_tracked_items',       v)} hint="Items in watchlist"          />
              <NumericInput label="Orders Protected"    value={edit.max_orders_protected}    onChange={v => updateEdit('max_orders_protected',    v)} hint="Orders cap/month"            />
              <NumericInput label="eBay Stores"         value={edit.max_ebay_stores}         onChange={v => updateEdit('max_ebay_stores',         v)} hint="Connected stores"            />
              <NumericInput label="Team Seats"          value={edit.max_team_seats}          onChange={v => updateEdit('max_team_seats',          v)} hint="-1 for unlimited"            />
              <NumericInput label="Msg Templates"       value={edit.max_message_templates}   onChange={v => updateEdit('max_message_templates',   v)} hint="-1 for unlimited"            />
              <NumericInput label="AI Optimize/day"     value={edit.max_ai_optimize}         onChange={v => updateEdit('max_ai_optimize',         v)} hint="Title AI uses per day"       />
              <NumericInput label="Keyword Searches"    value={edit.max_keyword_searches}    onChange={v => updateEdit('max_keyword_searches',    v)} hint="Keyword searches/day"        />
              <NumericInput label="Competitor Extract"  value={edit.max_competitor_extract}  onChange={v => updateEdit('max_competitor_extract',  v)} hint="Item ID extractions/day"     />
              <NumericInput label="Trial Days"          value={edit.trial_days}              onChange={v => updateEdit('trial_days',              v)} hint="Free trial duration"         />
              <NumericInput label="Grace Period Days"   value={edit.grace_period_days}       onChange={v => updateEdit('grace_period_days',       v)} hint="Days after expiry"           />
            </div>

            {/* Orders Management tiered fields */}
            <p className="text-[10px] font-black tracking-wider mt-2" style={{ color: C.muted }}>
              ORDERS MANAGEMENT TIERS
            </p>
            <div className="grid grid-cols-2 gap-3">
              <CustomDropdown label="EVIDENCE PDF"    value={edit.has_evidence_pdf}    onChange={v => updateEdit('has_evidence_pdf',    v)} options={tierOptions} />
              <CustomDropdown label="BUYER PROFILING" value={edit.has_buyer_profiling}  onChange={v => updateEdit('has_buyer_profiling',  v)} options={tierOptions} />
              <CustomDropdown label="AUTO SYNC"       value={edit.has_auto_sync}        onChange={v => updateEdit('has_auto_sync',        v)} options={syncOptions} />
              <CustomDropdown label="ANALYTICS"       value={edit.has_analytics}        onChange={v => updateEdit('has_analytics',        v)} options={tierOptions} />
            </div>
          </div>

          {/* Right — Feature flags + Pricing */}
          <div className="flex flex-col gap-3">

            {/* Feature flags */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl border bg-white"
                 style={{ borderColor: C.border }}>
              <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>
                FEATURE FLAGS
              </p>
              {(['General', 'Title', 'VeRO', 'Orders'] as const).map(section => (
                <div key={section}>
                  <p className="text-[9px] font-black tracking-wider mt-2 mb-1" style={{ color: C.border }}>
                    {section === 'Title' ? 'TITLE BUILDER' : section === 'VeRO' ? 'VERO SCANNER' : section === 'Orders' ? 'ORDERS MANAGEMENT' : 'GENERAL'}
                  </p>
                  {boolFeatures.filter(f => f.section === section).map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Icon size={13} style={{ color: (edit[key] as boolean) ? C.limeDeep : C.muted }} />
                        <p className="text-[12px] font-semibold"
                           style={{ color: (edit[key] as boolean) ? C.dark : C.muted }}>
                          {label}
                        </p>
                      </div>
                      <BoolToggle
                        value={edit[key] as boolean}
                        onChange={v => updateEdit(key, v)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="flex flex-col gap-3 p-4 rounded-2xl border bg-white"
                 style={{ borderColor: C.border }}>
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
                PRICING
              </p>
              <div className="grid grid-cols-2 gap-3">
                <NumericInput label="Monthly ($)" value={edit.price_monthly} onChange={v => updateEdit('price_monthly', v)} />
                <NumericInput label="Annual ($)"  value={edit.price_annual}  onChange={v => updateEdit('price_annual',  v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <><Save size={14} /> Save Limits</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Feature Gating Matrix ──────────────────────────────────────
function GatingMatrix({
  plans,
  expandedId,
  onToggleExpand,
  onPlanUpdated,
  showToast,
}: {
  plans:          PlanLimit[]
  expandedId:     string | null
  onToggleExpand: (id: string) => void
  onPlanUpdated:  (updated: PlanLimit) => void
  showToast:      (msg: string, type: 'success' | 'error' | 'info') => void
}) {
  const supabase = createClient()
  const [togglingActive, setTogglingActive] = useState<string | null>(null)

  async function handleToggleActive(plan: PlanLimit) {
    if (togglingActive) return
    setTogglingActive(plan.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/plan-limits/update', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: plan.id, is_active: !plan.is_active }),
      })
      const json = await res.json()
      if (res.ok) {
        onPlanUpdated(json.plan as PlanLimit)
        showToast(`${plan.display_name} ${!plan.is_active ? 'activated' : 'deactivated'}`, !plan.is_active ? 'success' : 'info')
      } else {
        showToast(json.error ?? 'Failed to update', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    }
    setTogglingActive(null)
  }
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: '1100px' }}>
      {/* Header */}
      <div className="grid px-4 py-2.5 border-b"
           style={{
             gridTemplateColumns: PLAN_GRID,
             gap:         10,
             borderColor: C.border,
             backgroundColor: C.bg,
           }}>
        {PLAN_COLS.map((h, i) => (
          <span key={i}
            className={`text-[9px] font-black tracking-wider ${i === 0 ? 'text-left' : 'text-center'}`}
            style={{ color: C.muted }}>
            {h}
          </span>
        ))}
      </div>

      {/* Plan rows */}
      {plans.map(plan => (
        <div key={plan.id}>
          <PlanRow
            plan={plan}
            isExpanded={expandedId === plan.id}
            onToggle={() => onToggleExpand(plan.id)}
            onToggleActive={handleToggleActive}
          />
          {expandedId === plan.id && (
            <EditPanel
              plan={plan}
              onClose={() => onToggleExpand(plan.id)}
              onSaved={onPlanUpdated}
              showToast={showToast}
            />
          )}
        </div>
      ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function PlanLimitsTab({ isInvestorMode = false }: { isInvestorMode?: boolean }) {
  const supabase = createClient()

  const [plans,      setPlans]      = useState<PlanLimit[]>([])
  const [hudStats,   setHudStats]   = useState<HudStats>({ freeUsers: 0, premiumSubs: 0, gatingTunnels: 0, mrr: 0, starterCount: 0, growthCount: 0, customCount: 0 })
  const [loading,    setLoading]    = useState(true)
  const [showPricingEditor, setShowPricingEditor] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast,      setToast]      = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  function showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load data — optimized count queries ───────────────────────
  const loadData = useCallback(async () => {
    try {
      const [
        { data: plansData },
        { count: freeCount },
        { count: starterCount },
        { count: growthCount },
        { count: customCount },
        { data: mrrData },
      ] = await Promise.all([
        (supabase.from('plan_limits') as any)
          .select('*')
          .order('price_monthly', { ascending: true }),

        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('plan_name', 'Free'),

        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('plan_name', 'Starter'),

        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('plan_name', 'Growth'),

        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('plan_name', 'Custom'),

        (supabase.from('transactions') as any)
          .select('amount, billing')
          .eq('status', 'paid'),
      ])

      const loadedPlans = (plansData ?? []) as PlanLimit[]

      // Get prices from DB (not hardcoded)
      const planPrices = Object.fromEntries(
        loadedPlans.map((p: PlanLimit) => [p.display_name, p.price_monthly])
      )

      // Calculate real MRR from transactions
      const mrr = Math.round(
        (mrrData ?? []).reduce((sum: number, t: any) => {
          const amount = parseFloat(t.amount ?? 0)
          return sum + (t.billing === 'annual' ? amount / 12 : amount)
        }, 0)
      )
      setPlans(loadedPlans)
      setHudStats({
        freeUsers:     freeCount    ?? 0,
        premiumSubs:   (starterCount ?? 0) + (growthCount ?? 0) + (customCount ?? 0),
        gatingTunnels: countGatingTunnels(loadedPlans),
        mrr,
        starterCount:  starterCount ?? 0,
        growthCount:   growthCount  ?? 0,
        customCount:   customCount  ?? 0,
      })
    } catch (e) {
      console.error('[PlanLimitsTab] loadData error:', e)
      showToast('Failed to load plan limits', 'error')
    }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  const [planHistory,    setPlanHistory]    = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const { data } = await (supabase.from('admin_logs') as any)
        .select('*')
        .in('action', ['update_plan_limits', 'update_pricing'])
        .order('created_at', { ascending: false })
        .limit(showAllHistory ? 50 : 5)
      setPlanHistory(data ?? [])
    } catch { /* non-critical */ }
    setHistoryLoading(false)
  }, [supabase, showAllHistory])

  useEffect(() => { loadData()    }, [loadData])
  useEffect(() => { loadHistory() }, [loadHistory])

  function handleToggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  function handlePlanUpdated(updated: PlanLimit) {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))
    setHudStats(prev => ({
      ...prev,
      gatingTunnels: countGatingTunnels(
        plans.map(p => p.id === updated.id ? updated : p)
      ),
    }))
  }

  function exportPlansCSV() {
    const fmt = (v: any) => {
      if (v === null || v === undefined) return '—'
      if (v === -1) return '∞'
      if (typeof v === 'boolean') return v ? 'Yes' : 'No'
      return String(v)
    }

    const rows = [
      ['Plan', 'Monthly', 'Annual', 'Searches', 'VeRO', 'Orders', 'Titles/day', 'AI/day', 'Stores', 'Seats', 'Msg Templates', 'Evidence PDF', 'Buyer Profiling', 'Auto Sync', 'Analytics', 'CSV Export', 'PDF Export', 'API Access', 'Priority Support', 'Evidence Vault', 'Multi-Currency', 'PRO Charts', '30D Trend', 'Bulk Titles', 'VeRO Bulk', 'VeRO Alerts', 'Trial Days', 'Grace Days', 'Active'],
      ...plans.map(p => [
        p.display_name ?? p.tier,
        `$${p.price_monthly}/mo`,
        p.price_annual > 0 ? `$${p.price_annual}/yr` : '—',
        fmt(p.max_monthly_searches),
        fmt(p.max_vero_checks),
        fmt(p.max_orders_protected),
        fmt(p.max_title_generations),
        fmt(p.max_ai_optimize),
        fmt(p.max_ebay_stores),
        fmt(p.max_team_seats),
        fmt(p.max_message_templates),
        p.has_evidence_pdf ?? '—',
        p.has_buyer_profiling ?? '—',
        p.has_auto_sync ?? '—',
        p.has_analytics ?? '—',
        fmt(p.has_csv_export),
        fmt(p.has_pdf_export),
        fmt(p.has_api_access),
        fmt(p.has_priority_support),
        fmt(p.has_evidence_vault),
        fmt(p.has_multi_currency),
        fmt(p.has_pro_charts_hud),
        fmt(p.has_30d_trend),
        fmt(p.has_bulk_title_gen),
        fmt(p.has_vero_bulk_check),
        fmt(p.has_vero_alerts),
        fmt(p.trial_days),
        fmt(p.grace_period_days),
        p.is_active ? 'Active' : 'Inactive',
      ])
    ]

    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `riazify-plans-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black tracking-wider mb-0.5" style={{ color: C.muted }}>
            FEATURE GATING MATRIX
          </p>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Click any plan row to edit its limits inline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPricingEditor(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl border hover:opacity-80"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
            title="Edit Landing Page Pricing">
            <Layout size={13} />
          </button>
          <button onClick={exportPlansCSV}
            className="flex items-center justify-center w-9 h-9 rounded-xl border hover:opacity-80"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
            title="Export plans as CSV">
            <Download size={13} />
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* HUD Cards */}
      <HudCards stats={hudStats} loading={loading} />

      {/* Matrix */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: C.bg }} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-2xl border"
             style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <AlertTriangle size={24} style={{ color: C.border }} />
          <p className="text-[14px] font-bold" style={{ color: C.text }}>No plan limits configured</p>
          <p className="text-[12px]" style={{ color: C.muted }}>Run the SQL migration to populate plan limits</p>
        </div>
      ) : (
        <GatingMatrix
          plans={plans}
          expandedId={expandedId}
          onToggleExpand={handleToggleExpand}
          onPlanUpdated={handlePlanUpdated}
          showToast={showToast}
        />
      )}

      {/* Plan Change History */}
      <div className="rounded-2xl border overflow-hidden"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>

        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <RefreshCw size={13} style={{ color: C.muted }} />
          <p className="text-[10px] font-black tracking-wider flex-1" style={{ color: C.muted }}>
            PLAN CHANGE HISTORY
          </p>
          <button onClick={() => setShowAllHistory(p => !p)}
            className="text-[10px] font-bold hover:opacity-70 px-2.5 py-1 rounded-lg border"
            style={{ color: C.limeDeep, borderColor: `${C.limeDeep}33`, backgroundColor: C.limeTint }}>
            {showAllHistory ? 'Show Less ↑' : 'View All →'}
          </button>
        </div>

        {/* Table header */}
        <div className="grid px-4 py-2 border-b"
             style={{
               gridTemplateColumns: '0.8fr 1.8fr 0.8fr 0.6fr 0.5fr',
               gap: 12,
               borderColor: C.border,
               backgroundColor: C.bg,
             }}>
          {['PLAN', 'CHANGES', 'ADMIN', 'TIME', 'DATE'].map(h => (
            <span key={h} className="text-[9px] font-black tracking-wider" style={{ color: C.muted }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {historyLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[0,1,2].map(i => (
              <div key={i} className="h-10 rounded-xl animate-pulse" style={{ backgroundColor: C.bg }} />
            ))}
          </div>
        ) : planHistory.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-[12px]" style={{ color: C.muted }}>
              No plan changes yet — edits will appear here
            </p>
          </div>
        ) : (
          planHistory.map((entry: any) => {
            const changes   = entry.metadata?.changes ?? {}
            const changeKeys = Object.keys(changes)
            const planName  = entry.metadata?.plan_name ?? '—'
            const adminName = entry.metadata?.admin_name ?? 'Admin'
            const timeAgo = (() => {
              const diff  = Date.now() - new Date(entry.created_at).getTime()
              const mins  = Math.floor(diff / 60000)
              const hours = Math.floor(diff / 3600000)
              const days  = Math.floor(diff / 86400000)
              if (mins  <  1) return 'Just now'
              if (mins  < 60) return `${mins}m ago`
              if (hours < 24) return `${hours}h ago`
              return `${days}d ago`
            })()

            const planColorMap: Record<string, { color: string; bg: string }> = {
              Free:    { color: C.muted,    bg: C.bg                    },
              Starter: { color: C.blue,     bg: 'rgba(29,78,216,0.08)' },
              Growth:  { color: C.limeDeep, bg: C.limeTint              },
              Custom:  { color: C.amber,    bg: 'rgba(217,119,6,0.08)' },
            }
            const planColor = planColorMap[planName] ?? { color: C.text, bg: C.bg }

            return (
              <div key={entry.id}
                   className="grid items-start px-4 py-3 border-b last:border-b-0 hover:bg-[#fafcf8] transition-colors"
                   style={{ gridTemplateColumns: '0.8fr 1.8fr 0.8fr 0.6fr 0.5fr', gap: 12, borderColor: C.border }}>

                {/* PLAN */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                        style={{ backgroundColor: planColor.bg, color: planColor.color }}>
                    {planName}
                  </span>
                  {entry.action === 'update_pricing' && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full w-fit"
                          style={{ backgroundColor: 'rgba(29,78,216,0.08)', color: C.blue }}>
                      PRICING PAGE
                    </span>
                  )}
                </div>

                {/* CHANGES */}
                <div className="flex flex-col gap-0.5">
                  {changeKeys.length === 0 ? (
                    <p className="text-[10px]" style={{ color: C.muted }}>—</p>
                  ) : changeKeys.slice(0, 3).map(key => {
                    const from  = changes[key].from
                    const to    = changes[key].to
                    const label = key.replace(/_/g, ' ').replace('max ', '').replace('has ', '')
                    const fmt   = (v: any) => typeof v === 'boolean' ? (v ? 'ON' : 'OFF') : v === -1 ? '∞' : String(v ?? '—')
                    return (
                      <div key={key} className="flex items-center gap-1">
                        <p className="text-[9px] font-black uppercase truncate" style={{ color: C.muted }}>{label}:</p>
                        <span className="text-[9px] font-bold" style={{ color: C.red }}>{fmt(from)}</span>
                        <span className="text-[9px]" style={{ color: C.muted }}>→</span>
                        <span className="text-[9px] font-bold" style={{ color: C.limeDeep }}>{fmt(to)}</span>
                      </div>
                    )
                  })}
                  {changeKeys.length > 3 && (
                    <p className="text-[9px]" style={{ color: C.muted }}>+{changeKeys.length - 3} more</p>
                  )}
                </div>

                {/* ADMIN */}
                <p className="text-[11px] font-semibold" style={{ color: C.text }}>{adminName}</p>

                {/* TIME */}
                <p className="text-[11px]" style={{ color: C.muted }}>{timeAgo}</p>

                {/* DATE */}
                <p className="text-[10px]" style={{ color: C.muted }}>
                  {new Date(entry.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </p>

              </div>
            )
          })
        )}
      </div>

      {/* Pricing Editor Modal */}
      {showPricingEditor && (
        <PricingEditorModal onClose={() => setShowPricingEditor(false)} />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}