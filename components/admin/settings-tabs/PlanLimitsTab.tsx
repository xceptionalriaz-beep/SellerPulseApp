'use client'
// components/admin/settings-tabs/PlanLimitsTab.tsx
// ══════════════════════════════════════════════════════════════
// RIAZIFY — Plan Limits Tab
// Dynamic feature gating matrix — fully database driven
// Inline editing with secure save confirmation
// ══════════════════════════════════════════════════════════════

import React from 'react'
import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Users, Lock, Check, X, Edit3,
  ChevronDown, ChevronUp, Save, RefreshCw,
  Zap, BarChart2, Download, Globe, Star,
  AlertTriangle, Shield, Layout,
  CreditCard, Tag, Gift, Receipt, Wallet, TrendingUp,
} from 'lucide-react'
import PricingEditorModal from '@/components/admin/PricingEditorModal'
import ProDropdown from '@/components/ui/ProDropdown'

// ── Design tokens ──────────────────────────────────────────────
const C = {
  dark: '#0a0614',          // near-black for headings
  lime: '#b8fa33',          // accent yellow-green
  limeDeep: '#7530fb',          // primary violet
  limeTint: '#f5f1ff',          // very light violet tint — only for selected/active states
  border: '#e8e3f4',          // subtle border, not too purple
  bg: '#f5f4f8',          // off-white page bg — fresh, neutral
  text: '#111118',          // near-black body text — max readability
  muted: '#6b7280',          // medium gray — readable but subordinate
  surface: '#ffffff',          // pure white card/surface
  red: '#dc2626',
  amber: '#d97706',
  green: '#16a34a',
  blue: '#7530fb',
}

// ── Types ──────────────────────────────────────────────────────
interface PlanLimit {
  id: string
  tier: string
  plan_id: string | null
  display_name: string | null
  daily_searches: string | null
  vero_checks: string | null
  support_level: string | null
  max_monthly_searches: number | null
  max_vero_checks: number | null
  max_tracked_items: number | null
  max_orders_protected: number | null
  max_ebay_stores: number | null
  max_team_seats: number | null
  max_message_templates: number | null
  max_ai_optimize: number | null
  max_keyword_searches: number | null
  max_competitor_extract: number | null
  max_title_generations: number | null
  max_profit_calcs: number | null
  has_advanced_analytics: boolean
  has_bulk_export: boolean
  has_title_builder: boolean
  has_competitor_research: boolean
  has_api_access: boolean
  has_priority_support: boolean
  has_evidence_vault: boolean
  has_csv_export: boolean
  has_pdf_export: boolean
  has_multi_currency: boolean
  has_message_templates: boolean
  has_pro_charts_hud: boolean
  has_30d_trend: boolean
  has_bulk_title_gen: boolean
  has_vero_bulk_check: boolean
  has_vero_alerts: boolean
  has_ai_suggestions: boolean
  has_evidence_pdf: string | null
  has_buyer_profiling: string | null
  has_auto_sync: string | null
  has_analytics: string | null
  trial_days: number | null
  grace_period_days: number | null
  price_monthly: number
  price_annual: number
  is_active: boolean
  updated_at: string
}

interface HudStats {
  freeUsers: number
  premiumSubs: number
  gatingTunnels: number
  mrr: number
  starterCount: number
  growthCount: number
  customCount: number
}

interface EditState {
  max_monthly_searches: string
  max_vero_checks: string
  max_tracked_items: string
  max_orders_protected: string
  max_ebay_stores: string
  max_team_seats: string
  max_message_templates: string
  max_ai_optimize: string
  max_keyword_searches: string
  max_competitor_extract: string
  trial_days: string
  grace_period_days: string
  has_advanced_analytics: boolean
  has_bulk_export: boolean
  has_title_builder: boolean
  has_competitor_research: boolean
  has_api_access: boolean
  has_priority_support: boolean
  has_evidence_vault: boolean
  has_csv_export: boolean
  has_pdf_export: boolean
  has_multi_currency: boolean
  has_message_templates: boolean
  has_pro_charts_hud: boolean
  has_30d_trend: boolean
  has_bulk_title_gen: boolean
  has_vero_bulk_check: boolean
  has_vero_alerts: boolean
  has_ai_suggestions: boolean
  has_evidence_pdf: string
  has_buyer_profiling: string
  has_auto_sync: string
  has_analytics: string
  price_monthly: string
  price_annual: string
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
    max_monthly_searches: String(plan.max_monthly_searches ?? ''),
    max_vero_checks: String(plan.max_vero_checks ?? ''),
    max_tracked_items: String(plan.max_tracked_items ?? ''),
    max_orders_protected: String(plan.max_orders_protected ?? ''),
    max_ebay_stores: String(plan.max_ebay_stores ?? ''),
    max_team_seats: String(plan.max_team_seats ?? ''),
    max_message_templates: String(plan.max_message_templates ?? ''),
    max_ai_optimize: String(plan.max_ai_optimize ?? ''),
    max_keyword_searches: String(plan.max_keyword_searches ?? ''),
    max_competitor_extract: String(plan.max_competitor_extract ?? ''),
    trial_days: String(plan.trial_days ?? ''),
    grace_period_days: String(plan.grace_period_days ?? ''),
    has_advanced_analytics: plan.has_advanced_analytics,
    has_bulk_export: plan.has_bulk_export,
    has_title_builder: plan.has_title_builder,
    has_competitor_research: plan.has_competitor_research,
    has_api_access: plan.has_api_access,
    has_priority_support: plan.has_priority_support,
    has_evidence_vault: plan.has_evidence_vault ?? false,
    has_csv_export: plan.has_csv_export ?? false,
    has_pdf_export: plan.has_pdf_export ?? false,
    has_multi_currency: plan.has_multi_currency ?? false,
    has_message_templates: plan.has_message_templates ?? true,
    has_pro_charts_hud: plan.has_pro_charts_hud ?? false,
    has_30d_trend: plan.has_30d_trend ?? false,
    has_bulk_title_gen: plan.has_bulk_title_gen ?? false,
    has_vero_bulk_check: plan.has_vero_bulk_check ?? false,
    has_vero_alerts: plan.has_vero_alerts ?? false,
    has_ai_suggestions: plan.has_ai_suggestions ?? false,
    has_evidence_pdf: plan.has_evidence_pdf ?? 'none',
    has_buyer_profiling: plan.has_buyer_profiling ?? 'none',
    has_auto_sync: plan.has_auto_sync ?? 'manual',
    has_analytics: plan.has_analytics ?? 'none',
    price_monthly: String(plan.price_monthly ?? ''),
    price_annual: String(plan.price_annual ?? ''),
  }
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark, border: C.lime, color: C.lime },
    error: { bg: '#FEF2F2', border: '#FECACA', color: C.red },
    info: { bg: C.bg, border: C.border, color: C.text },
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
      sub: 'on Free plan',
      icon: Users,
      color: C.muted,
      bg: C.bg,
    },
    {
      title: 'Paid Subscribers',
      value: stats.premiumSubs.toString(),
      sub: `${stats.starterCount} Starter · ${stats.growthCount} Growth · ${stats.customCount} Custom`,
      icon: Star,
      color: C.limeDeep,
      bg: C.limeTint,
    },
    {
      title: 'MRR',
      value: `$${stats.mrr.toLocaleString()}`,
      sub: `$${(stats.mrr * 12).toLocaleString()} annual run rate`,
      icon: Zap,
      color: stats.mrr > 0 ? C.green : C.muted,
      bg: stats.mrr > 0 ? 'rgba(22,163,74,0.08)' : C.bg,
    },
    {
      title: 'Active Gating Tunnels',
      value: stats.gatingTunnels.toString(),
      sub: 'capped feature limits',
      icon: Lock,
      color: C.blue,
      bg: 'rgba(29,78,216,0.08)',
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
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  label: string
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
            borderColor: open ? C.lime : C.border,
            color: C.text,
            boxShadow: open ? '0 0 0 3px rgba(117,48,251,0.12)' : 'none',
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
                  className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold hover:bg-[#f5f1ff] transition-colors"
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
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
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
          borderColor: focused ? C.lime : C.border,
          backgroundColor: C.bg,
          color: value === '-1' ? C.limeDeep : C.text,
          boxShadow: focused ? '0 0 0 3px rgba(117,48,251,0.12)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
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
  canActivate = true,
}: {
  plan: PlanLimit
  isExpanded: boolean
  onToggle: () => void
  onToggleActive: (plan: PlanLimit) => void
  canActivate?: boolean
}) {
  const planColors: Record<string, { color: string; bg: string }> = {
    free: { color: C.muted, bg: C.bg },
    starter: { color: C.blue, bg: 'rgba(29,78,216,0.08)' },
    growth: { color: C.limeDeep, bg: C.limeTint },
    custom: { color: C.amber, bg: 'rgba(217,119,6,0.08)' },
  }
  const pc = planColors[plan.plan_id ?? ''] ?? { color: C.text, bg: C.bg }

  const numericCols = [
    { value: plan.max_monthly_searches, label: 'Searches' },
    { value: plan.max_vero_checks, label: 'VeRO' },
    { value: plan.max_orders_protected, label: 'Orders' },
    { value: plan.max_title_generations, label: 'Titles/day' },
    { value: plan.max_ai_optimize, label: 'AI/day' },
    { value: plan.max_ebay_stores, label: 'Stores' },
    { value: plan.max_team_seats, label: 'Seats' },
  ]

  const textCols = [
    { value: plan.has_evidence_pdf, label: 'Evidence' },
    { value: plan.has_auto_sync, label: 'Sync' },
  ]

  const boolCols = [
    { value: plan.has_advanced_analytics, label: 'Analytics' },
    { value: plan.has_bulk_export, label: 'Export' },
    { value: plan.has_api_access, label: 'API' },
    { value: plan.has_priority_support, label: 'Support' },
    { value: plan.has_evidence_vault, label: 'Vault' },
  ]

  return (
    <div
      className="grid items-center px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-[#f5f4f8] transition-colors"
      style={{
        gridTemplateColumns: PLAN_GRID,
        gap: 10,
        borderColor: C.border,
        backgroundColor: isExpanded ? C.limeTint : !plan.is_active ? 'rgba(100,116,139,0.04)' : undefined,
        opacity: plan.is_active ? 1 : 0.6,
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
      <div className="flex items-center justify-center" onClick={e => { e.stopPropagation(); canActivate && onToggleActive(plan) }}>
        <div className="relative w-9 h-5 rounded-full transition-colors"
          style={{ backgroundColor: plan.is_active ? C.dark : 'rgba(100,116,139,0.35)', cursor: canActivate ? 'pointer' : 'not-allowed', opacity: canActivate ? 1 : 0.5 }}>
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
            ? <ChevronUp size={13} style={{ color: C.limeDeep }} />
            : <ChevronDown size={13} style={{ color: C.muted }} />}
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
  canEdit = true,
}: {
  plan: PlanLimit
  onClose: () => void
  onSaved: (updated: PlanLimit) => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  canEdit?: boolean
}) {
  const supabase = createClient()
  const [edit, setEdit] = useState<EditState>(planToEditState(plan))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
      if (val < -1) { setError(`${field.replace(/_/g, ' ')} must be -1 (unlimited) or a positive number`); return false }
    }
    if (Number(edit.price_monthly) < 0) { setError('Monthly price cannot be negative'); return false }
    if (Number(edit.price_annual) < 0) { setError('Annual price cannot be negative'); return false }
    return true
  }

  async function handleSave() {
    if (!validateEdit()) return
    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/plan-limits/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          id: plan.id,
          max_monthly_searches: Number(edit.max_monthly_searches),
          max_vero_checks: Number(edit.max_vero_checks),
          max_tracked_items: Number(edit.max_tracked_items),
          max_orders_protected: Number(edit.max_orders_protected),
          max_ebay_stores: Number(edit.max_ebay_stores),
          max_team_seats: Number(edit.max_team_seats),
          has_advanced_analytics: edit.has_advanced_analytics,
          has_bulk_export: edit.has_bulk_export,
          has_title_builder: edit.has_title_builder,
          has_competitor_research: edit.has_competitor_research,
          has_api_access: edit.has_api_access,
          has_priority_support: edit.has_priority_support,
          has_evidence_vault: edit.has_evidence_vault,
          has_csv_export: edit.has_csv_export,
          has_pdf_export: edit.has_pdf_export,
          has_multi_currency: edit.has_multi_currency,
          has_message_templates: edit.has_message_templates,
          has_pro_charts_hud: edit.has_pro_charts_hud,
          has_30d_trend: edit.has_30d_trend,
          has_bulk_title_gen: edit.has_bulk_title_gen,
          has_vero_bulk_check: edit.has_vero_bulk_check,
          has_vero_alerts: edit.has_vero_alerts,
          has_ai_suggestions: edit.has_ai_suggestions,
          has_evidence_pdf: edit.has_evidence_pdf,
          has_buyer_profiling: edit.has_buyer_profiling,
          has_auto_sync: edit.has_auto_sync,
          has_analytics: edit.has_analytics,
          max_message_templates: Number(edit.max_message_templates),
          max_ai_optimize: Number(edit.max_ai_optimize),
          max_keyword_searches: Number(edit.max_keyword_searches),
          max_competitor_extract: Number(edit.max_competitor_extract),
          trial_days: Number(edit.trial_days),
          grace_period_days: Number(edit.grace_period_days),
          price_monthly: Number(edit.price_monthly),
          price_annual: Number(edit.price_annual),
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
    { key: 'has_title_builder', label: 'Title Builder', icon: Edit3, section: 'General' },
    { key: 'has_competitor_research', label: 'Competitor Research', icon: Globe, section: 'General' },
    { key: 'has_api_access', label: 'API Access', icon: Zap, section: 'General' },
    { key: 'has_priority_support', label: 'Priority Support', icon: Star, section: 'General' },
    { key: 'has_advanced_analytics', label: 'Advanced Analytics', icon: BarChart2, section: 'General' },
    { key: 'has_bulk_export', label: 'Bulk Export', icon: Download, section: 'General' },
    // Title Builder
    { key: 'has_pro_charts_hud', label: 'PRO Charts HUD', icon: BarChart2, section: 'Title' },
    { key: 'has_30d_trend', label: '30D Trend Visualizer', icon: BarChart2, section: 'Title' },
    { key: 'has_bulk_title_gen', label: 'Bulk Title Gen', icon: Edit3, section: 'Title' },
    { key: 'has_ai_suggestions', label: 'AI Suggestions', icon: Zap, section: 'Title' },
    // VeRO
    { key: 'has_vero_bulk_check', label: 'VeRO Bulk Check', icon: Shield, section: 'VeRO' },
    { key: 'has_vero_alerts', label: 'VeRO Alerts', icon: Shield, section: 'VeRO' },
    // Orders
    { key: 'has_evidence_vault', label: 'Evidence Vault', icon: Shield, section: 'Orders' },
    { key: 'has_csv_export', label: 'CSV Export', icon: Download, section: 'Orders' },
    { key: 'has_pdf_export', label: 'PDF Export', icon: Download, section: 'Orders' },
    { key: 'has_multi_currency', label: 'Multi-Currency', icon: Globe, section: 'Orders' },
    { key: 'has_message_templates', label: 'Message Templates', icon: Zap, section: 'Orders' },
  ]

  const tierOptions = [
    { label: 'None', value: 'none' },
    { label: 'Basic', value: 'basic' },
    { label: 'Full', value: 'full' },
  ]

  const syncOptions = [
    { label: 'Manual', value: 'manual' },
    { label: '30 min', value: '30min' },
    { label: '5 min', value: '5min' },
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
              <NumericInput label="Monthly Searches" value={edit.max_monthly_searches} onChange={v => updateEdit('max_monthly_searches', v)} hint="Product searches/month" />
              <NumericInput label="VeRO Checks" value={edit.max_vero_checks} onChange={v => updateEdit('max_vero_checks', v)} hint="VeRO scans/month" />
              <NumericInput label="Tracked Items" value={edit.max_tracked_items} onChange={v => updateEdit('max_tracked_items', v)} hint="Items in watchlist" />
              <NumericInput label="Orders Protected" value={edit.max_orders_protected} onChange={v => updateEdit('max_orders_protected', v)} hint="Orders cap/month" />
              <NumericInput label="eBay Stores" value={edit.max_ebay_stores} onChange={v => updateEdit('max_ebay_stores', v)} hint="Connected stores" />
              <NumericInput label="Team Seats" value={edit.max_team_seats} onChange={v => updateEdit('max_team_seats', v)} hint="-1 for unlimited" />
              <NumericInput label="Msg Templates" value={edit.max_message_templates} onChange={v => updateEdit('max_message_templates', v)} hint="-1 for unlimited" />
              <NumericInput label="AI Optimize/day" value={edit.max_ai_optimize} onChange={v => updateEdit('max_ai_optimize', v)} hint="Title AI uses per day" />
              <NumericInput label="Keyword Searches" value={edit.max_keyword_searches} onChange={v => updateEdit('max_keyword_searches', v)} hint="Keyword searches/day" />
              <NumericInput label="Competitor Extract" value={edit.max_competitor_extract} onChange={v => updateEdit('max_competitor_extract', v)} hint="Item ID extractions/day" />
              <NumericInput label="Trial Days" value={edit.trial_days} onChange={v => updateEdit('trial_days', v)} hint="Free trial duration" />
              <NumericInput label="Grace Period Days" value={edit.grace_period_days} onChange={v => updateEdit('grace_period_days', v)} hint="Days after expiry" />
            </div>

            {/* Orders Management tiered fields */}
            <p className="text-[10px] font-black tracking-wider mt-2" style={{ color: C.muted }}>
              ORDERS MANAGEMENT TIERS
            </p>
            <div className="grid grid-cols-2 gap-3">
              <CustomDropdown label="EVIDENCE PDF" value={edit.has_evidence_pdf} onChange={v => updateEdit('has_evidence_pdf', v)} options={tierOptions} />
              <CustomDropdown label="BUYER PROFILING" value={edit.has_buyer_profiling} onChange={v => updateEdit('has_buyer_profiling', v)} options={tierOptions} />
              <CustomDropdown label="AUTO SYNC" value={edit.has_auto_sync} onChange={v => updateEdit('has_auto_sync', v)} options={syncOptions} />
              <CustomDropdown label="ANALYTICS" value={edit.has_analytics} onChange={v => updateEdit('has_analytics', v)} options={tierOptions} />
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
                <NumericInput label="Annual ($)" value={edit.price_annual} onChange={v => updateEdit('price_annual', v)} />
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
          {canEdit && <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: '#7530fb', color: '#ffffff' }}>
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : <><Save size={14} /> Save Limits</>}
          </button>}
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
  canEdit = true,
  canActivate = true,
}: {
  plans: PlanLimit[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onPlanUpdated: (updated: PlanLimit) => void
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
  canEdit?: boolean
  canActivate?: boolean
}) {
  const supabase = createClient()
  const [togglingActive, setTogglingActive] = useState<string | null>(null)

  async function handleToggleActive(plan: PlanLimit) {
    if (togglingActive) return
    setTogglingActive(plan.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/plan-limits/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ id: plan.id, is_active: !plan.is_active }),
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
              gap: 10,
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
                canActivate={canActivate}
              />
              {expandedId === plan.id && (
                <EditPanel
                  plan={plan}
                  onClose={() => onToggleExpand(plan.id)}
                  onSaved={onPlanUpdated}
                  showToast={showToast}
                  canEdit={canEdit}
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
  const { can } = useTabPermissions('plan_limits')
  const supabase = createClient()

  const [plans, setPlans] = useState<PlanLimit[]>([])
  const [hudStats, setHudStats] = useState<HudStats>({ freeUsers: 0, premiumSubs: 0, gatingTunnels: 0, mrr: 0, starterCount: 0, growthCount: 0, customCount: 0 })
  const [loading, setLoading] = useState(true)
  const [showPricingEditor, setShowPricingEditor] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
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
        freeUsers: freeCount ?? 0,
        premiumSubs: (starterCount ?? 0) + (growthCount ?? 0) + (customCount ?? 0),
        gatingTunnels: countGatingTunnels(loadedPlans),
        mrr,
        starterCount: starterCount ?? 0,
        growthCount: growthCount ?? 0,
        customCount: customCount ?? 0,
      })
    } catch (e) {
      console.error('[PlanLimitsTab] loadData error:', e)
      showToast('Failed to load plan limits', 'error')
    }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  const [planHistory, setPlanHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)

  // ── AI Credits sub-tab ─────────────────────────────────────────
  const [activeSubTab, setActiveSubTab] = useState<'tool_plans' | 'ai_credits'>('tool_plans')

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

  useEffect(() => { loadData() }, [loadData])
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

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riazify-plans-${new Date().toISOString().slice(0, 10)}.csv`
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

      {/* ── Sub-tab toggle ───────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        background: C.bg,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        alignSelf: 'flex-start',
      }}>
        {(['tool_plans', 'ai_credits'] as const).map(tab => {
          const isActive = activeSubTab === tab
          const isLime = tab === 'ai_credits'
          const activeBg = isLime ? '#b8fa33' : '#7530fb'
          const activeColor = isLime ? '#0a0614' : '#ffffff'
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: '6px 16px',
                borderRadius: 9,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: isActive ? activeBg : 'transparent',
                color: isActive ? activeColor : C.muted,
                boxShadow: isActive
                  ? isLime
                    ? '0 2px 8px rgba(184,250,51,0.35)'
                    : '0 2px 8px rgba(117,48,251,0.30)'
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {tab === 'tool_plans' ? (
                <><Shield size={12} /> Tool Plans</>
              ) : (
                <><Zap size={12} fill="currentColor" /> AI Credits</>
              )}
            </button>
          )
        })}
      </div>

      {/* ── AI Credits Panel ─────────────────────────────────────── */}
      {activeSubTab === 'ai_credits' && (
        <AiCreditsPanel supabase={supabase} showToast={showToast} />
      )}

      {/* ── Tool Plans content (hidden when AI Credits active) ────── */}
      {activeSubTab === 'tool_plans' && <>

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
            {can('edit_pricing') && <button onClick={() => setShowPricingEditor(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl border hover:opacity-80"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
              title="Edit Landing Page Pricing">
              <Layout size={13} />
            </button>}
            {can('export_plans') && <button onClick={exportPlansCSV}
              className="flex items-center justify-center w-9 h-9 rounded-xl border hover:opacity-80"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
              title="Export plans as CSV">
              <Download size={13} />
            </button>}
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
        {!can('view_limits') ? (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[13px] font-bold" style={{ color: C.muted }}>You don't have access to view plan limits</p>
          </div>
        ) : loading ? (
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
            canEdit={can('edit_limits')}
            canActivate={can('activate_plan')}
          />
        )}

        {can('view_history') && <>
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
                {[0, 1, 2].map(i => (
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
                const changes = entry.metadata?.changes ?? {}
                const changeKeys = Object.keys(changes)
                const planName = entry.metadata?.plan_name ?? '—'
                const adminName = entry.metadata?.admin_name ?? 'Admin'
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(entry.created_at).getTime()
                  const mins = Math.floor(diff / 60000)
                  const hours = Math.floor(diff / 3600000)
                  const days = Math.floor(diff / 86400000)
                  if (mins < 1) return 'Just now'
                  if (mins < 60) return `${mins}m ago`
                  if (hours < 24) return `${hours}h ago`
                  return `${days}d ago`
                })()

                const planColorMap: Record<string, { color: string; bg: string }> = {
                  Free: { color: C.muted, bg: C.bg },
                  Starter: { color: C.blue, bg: 'rgba(29,78,216,0.08)' },
                  Growth: { color: C.limeDeep, bg: C.limeTint },
                  Custom: { color: C.amber, bg: 'rgba(217,119,6,0.08)' },
                }
                const planColor = planColorMap[planName] ?? { color: C.text, bg: C.bg }

                return (
                  <div key={entry.id}
                    className="grid items-start px-4 py-3 border-b last:border-b-0 hover:bg-[#f5f4f8] transition-colors"
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
                        const from = changes[key].from
                        const to = changes[key].to
                        const label = key.replace(/_/g, ' ').replace('max ', '').replace('has ', '')
                        const fmt = (v: any) => typeof v === 'boolean' ? (v ? 'ON' : 'OFF') : v === -1 ? '∞' : String(v ?? '—')
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
        </>}

        {/* Pricing Editor Modal */}
        {showPricingEditor && (
          <PricingEditorModal onClose={() => setShowPricingEditor(false)} />
        )}

      </> /* end activeSubTab === 'tool_plans' */}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Credits Panel — full admin suite
// Tabs: Packages · Action Costs · Settings · Transactions · Balances · Stats · Bulk Gift · Promo Codes
// ─────────────────────────────────────────────────────────────────────────────

interface AiPackage {
  id: string
  name: string
  description: string | null
  price_usd: number
  credits: number
  bonus_credits: number
  display_order: number
  is_active: boolean
  billing_type: 'one_time' | 'monthly'
  rollover_cap: number | null
  stripe_price_id: string | null
}

interface AiActionCost {
  id: string
  feature_key: string
  name: string
  credits_cost: number
  is_enabled: boolean
  description: string | null
}

// ── Credit sub-tab types ──────────────────────────────────────────
type CreditTab = 'packages' | 'costs' | 'settings' | 'transactions' | 'balances' | 'stats' | 'bulk_gift' | 'promo'

interface CreditSettings {
  signup_credits: string
  overage_policy: string
  credit_expiry_policy: string
}

interface TxRow {
  id: string
  user_id: string
  type: string
  amount: number
  balance_after: number
  feature_key: string | null
  note: string | null
  created_at: string
  profiles?: { email: string | null; full_name: string | null } | null
}

interface BalanceRow {
  user_id: string
  balance: number
  lifetime_credits: number
  lifetime_spent: number
  updated_at: string
  email: string | null
  full_name: string | null
  plan_name: string | null
}

interface StatsData {
  daily: { date: string; credits: number }[]
  byFeature: { feature_key: string; credits: number }[]
  topUsers: { user_id: string; lifetime_spent: number; email: string | null; full_name: string | null }[]
  totals: { totalBalance: number; totalIssued: number; totalSpent: number; activeWallets: number }
  days: number
}

interface PromoCode {
  id: string
  code: string
  description: string | null
  credits: number
  max_uses: number | null
  uses_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

function AiCreditsPanel({
  supabase,
  showToast,
}: {
  supabase: ReturnType<typeof createClient>
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [creditTab, setCreditTab] = useState<CreditTab>('packages')
  const [packages, setPackages] = useState<AiPackage[]>([])
  const [costs, setCosts] = useState<AiActionCost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPkg, setEditingPkg] = useState<string | null>(null)
  const [editingCost, setEditingCost] = useState<string | null>(null)
  const [pkgEdits, setPkgEdits] = useState<Partial<AiPackage>>({})
  const [costEdits, setCostEdits] = useState<Partial<AiActionCost>>({})
  const [saving, setSaving] = useState(false)

  // Gift credits (single user)
  const [giftEmail, setGiftEmail] = useState('')
  const [giftAmount, setGiftAmount] = useState('')
  const [giftNote, setGiftNote] = useState('')
  const [gifting, setGifting] = useState(false)

  // Credit Settings
  const [creditSettings, setCreditSettings] = useState<CreditSettings>({
    signup_credits: '25', overage_policy: 'block', credit_expiry_policy: 'rollover',
  })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Transactions
  const [txRows, setTxRows] = useState<TxRow[]>([])
  const [txTotal, setTxTotal] = useState(0)
  const [txPage, setTxPage] = useState(0)
  const [txLoading, setTxLoading] = useState(false)
  const [txFilter, setTxFilter] = useState({ user_id: '', type: '', feature_key: '' })

  // Balances
  const [balRows, setBalRows] = useState<BalanceRow[]>([])
  const [balTotal, setBalTotal] = useState(0)
  const [balPage, setBalPage] = useState(0)
  const [balLoading, setBalLoading] = useState(false)
  const [balSearch, setBalSearch] = useState('')

  // Stats
  const [stats, setStats] = useState<StatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsDays, setStatsDays] = useState(30)

  // Bulk Gift
  const [bulkPlan, setBulkPlan] = useState('all')
  const [bulkAmount, setBulkAmount] = useState('')
  const [bulkNote, setBulkNote] = useState('')
  const [bulking, setBulking] = useState(false)

  // Promo Codes
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [promoLoading, setPromoLoading] = useState(false)
  const [newPromo, setNewPromo] = useState({ code: '', description: '', credits: '', max_uses: '', expires_at: '' })
  const [creatingPromo, setCreatingPromo] = useState(false)

  useEffect(() => {
    Promise.all([
      (supabase.from('ai_credit_packages') as any)
        .select('*')
        .order('display_order', { ascending: true }),
      (supabase.from('ai_action_costs') as any)
        .select('*')
        .order('credits_cost', { ascending: true }),
    ]).then(([pkgRes, costRes]) => {
      setPackages(pkgRes.data ?? [])
      setCosts(costRes.data ?? [])
      setLoading(false)
    })
  }, [supabase])

  // ── Load credit settings ──────────────────────────────────────
  async function loadSettings() {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/admin/credits/settings')
      if (res.ok) setCreditSettings(await res.json())
    } catch { /* non-critical */ }
    setSettingsLoading(false)
  }

  async function saveSettings() {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/credits/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditSettings),
      })
      if (res.ok) showToast('Credit settings saved', 'success')
      else showToast('Failed to save settings', 'error')
    } catch { showToast('Network error', 'error') }
    setSavingSettings(false)
  }

  // ── Load transactions ─────────────────────────────────────────
  async function loadTransactions(page = 0) {
    setTxLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '50',
        ...(txFilter.user_id && { user_id: txFilter.user_id }),
        ...(txFilter.type && { type: txFilter.type }),
        ...(txFilter.feature_key && { feature_key: txFilter.feature_key }),
      })
      const res = await fetch(`/api/admin/credits/transactions?${params}`)
      const json = await res.json()
      setTxRows(json.rows ?? [])
      setTxTotal(json.total ?? 0)
      setTxPage(page)
    } catch { /* non-critical */ }
    setTxLoading(false)
  }

  // ── Load balances ─────────────────────────────────────────────
  async function loadBalances(page = 0) {
    setBalLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50', ...(balSearch && { search: balSearch }) })
      const res = await fetch(`/api/admin/credits/balances?${params}`)
      const json = await res.json()
      setBalRows(json.rows ?? [])
      setBalTotal(json.total ?? 0)
      setBalPage(page)
    } catch { /* non-critical */ }
    setBalLoading(false)
  }

  // ── Load stats ────────────────────────────────────────────────
  async function loadStats() {
    setStatsLoading(true)
    try {
      const res = await fetch(`/api/admin/credits/stats?days=${statsDays}`)
      if (res.ok) setStats(await res.json())
    } catch { /* non-critical */ }
    setStatsLoading(false)
  }

  // ── Load promo codes ──────────────────────────────────────────
  async function loadPromoCodes() {
    setPromoLoading(true)
    try {
      const res = await fetch('/api/admin/credits/promo-codes')
      if (res.ok) { const j = await res.json(); setPromoCodes(j.codes ?? []) }
    } catch { /* non-critical */ }
    setPromoLoading(false)
  }

  async function createPromoCode() {
    if (!newPromo.code || !newPromo.credits) return
    setCreatingPromo(true)
    try {
      const res = await fetch('/api/admin/credits/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromo.code,
          description: newPromo.description || null,
          credits: parseInt(newPromo.credits, 10),
          max_uses: newPromo.max_uses ? parseInt(newPromo.max_uses, 10) : null,
          expires_at: newPromo.expires_at || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Failed', 'error') }
      else {
        showToast(`Promo code "${newPromo.code.toUpperCase()}" created`, 'success')
        setNewPromo({ code: '', description: '', credits: '', max_uses: '', expires_at: '' })
        await loadPromoCodes()
      }
    } catch { showToast('Network error', 'error') }
    setCreatingPromo(false)
  }

  async function togglePromoCode(id: string, is_active: boolean) {
    await fetch('/api/admin/credits/promo-codes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active }),
    })
    setPromoCodes(prev => prev.map(c => c.id === id ? { ...c, is_active } : c))
    showToast(is_active ? 'Code activated' : 'Code deactivated', 'info')
  }

  // ── Bulk Gift ─────────────────────────────────────────────────
  async function handleBulkGift() {
    if (!bulkAmount) return
    setBulking(true)
    try {
      const res = await fetch('/api/admin/credits/bulk-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: bulkPlan,
          amount: parseInt(bulkAmount, 10),
          note: bulkNote || `Bulk gift to ${bulkPlan} plan`,
        }),
      })
      const json = await res.json()
      if (!res.ok) showToast(json.error ?? 'Failed', 'error')
      else showToast(`✅ Gifted ${bulkAmount} credits to ${json.successCount} users`, 'success')
    } catch { showToast('Network error', 'error') }
    setBulking(false)
  }

  // Load data when switching to a tab for the first time
  useEffect(() => {
    if (creditTab === 'settings') loadSettings()
    if (creditTab === 'transactions') loadTransactions(0)
    if (creditTab === 'balances') loadBalances(0)
    if (creditTab === 'stats') loadStats()
    if (creditTab === 'promo') loadPromoCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditTab, statsDays])

  // ── Save package ──────────────────────────────────────────────
  async function savePkg(id: string) {
    setSaving(true)
    const { error } = await (supabase.from('ai_credit_packages') as any)
      .update({ ...pkgEdits, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { showToast('Save failed: ' + error.message, 'error') }
    else {
      setPackages(prev => prev.map(p => p.id === id ? { ...p, ...pkgEdits } : p))
      showToast('Package updated', 'success')
      setEditingPkg(null)
    }
    setSaving(false)
  }

  // ── Save action cost ──────────────────────────────────────────
  async function saveCost(id: string) {
    setSaving(true)
    const { error } = await (supabase.from('ai_action_costs') as any)
      .update({ ...costEdits, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { showToast('Save failed: ' + error.message, 'error') }
    else {
      setCosts(prev => prev.map(c => c.id === id ? { ...c, ...costEdits } : c))
      showToast('Action cost updated', 'success')
      setEditingCost(null)
    }
    setSaving(false)
  }

  // ── Gift credits ──────────────────────────────────────────────
  async function handleGift() {
    if (!giftEmail.trim() || !giftAmount) return
    setGifting(true)
    try {
      const res = await fetch('/api/credits/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: giftEmail.trim(), // UI also accepts UUID
          amount: parseInt(giftAmount, 10),
          note: giftNote || 'Admin gift',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gift failed')
      showToast(`✅ Gifted ${giftAmount} credits — new balance: ${data.new_balance}`, 'success')
      setGiftEmail('')
      setGiftAmount('')
      setGiftNote('')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Gift failed', 'error')
    }
    setGifting(false)
  }

  const cell: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 12,
    color: C.text,
    borderBottom: `1px solid ${C.border}`,
  }
  const th: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    background: C.bg,
    borderBottom: `1px solid ${C.border}`,
    textAlign: 'left' as const,
  }
  const input: React.CSSProperties = {
    padding: '4px 8px',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 12,
    width: '100%',
    outline: 'none',
  }
  const actionBtn: React.CSSProperties = {
    padding: '4px 10px',
    border: 'none',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', color: C.muted }} />
      </div>
    )
  }

  // ── tab definitions ────────────────────────────────────────────
  const CREDIT_TABS: { key: CreditTab; label: string; icon: React.ReactNode }[] = [
    { key: 'packages', label: 'Packages', icon: <CreditCard size={11} /> },
    { key: 'costs', label: 'Action Costs', icon: <Zap size={11} /> },
    { key: 'settings', label: 'Settings', icon: <Shield size={11} /> },
    { key: 'transactions', label: 'Transactions', icon: <Receipt size={11} /> },
    { key: 'balances', label: 'Balances', icon: <Wallet size={11} /> },
    { key: 'stats', label: 'Usage Stats', icon: <TrendingUp size={11} /> },
    { key: 'bulk_gift', label: 'Bulk Gift', icon: <Gift size={11} /> },
    { key: 'promo', label: 'Promo Codes', icon: <Tag size={11} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Credit sub-tab bar ────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 4, flexWrap: 'wrap' as const,
        padding: 4, background: C.bg,
        borderRadius: 12, border: `1px solid ${C.border}`,
      }}>
        {CREDIT_TABS.map(t => (
          <button key={t.key} onClick={() => setCreditTab(t.key)} style={{
            padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
            background: creditTab === t.key ? C.limeDeep : 'transparent',
            color: creditTab === t.key ? '#fff' : C.muted,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: PACKAGES
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'packages' && (
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={15} color={C.lime} fill={C.lime} />
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Credit Packages</span>
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>Inline editable — changes take effect immediately</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Name', 'Description', 'Price (USD)', 'Credits', 'Bonus', 'Billing', 'Rollover Cap', 'Stripe Price ID', 'Active', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {packages.map(pkg => {
                  const isEditing = editingPkg === pkg.id
                  const billingType = (pkgEdits.billing_type ?? pkg.billing_type) as 'one_time' | 'monthly'
                  return (
                    <tr key={pkg.id} style={{ background: isEditing ? 'rgba(117,48,251,0.03)' : 'transparent' }}>
                      <td style={cell}>{isEditing ? <input style={input} value={pkgEdits.name ?? pkg.name} onChange={e => setPkgEdits(p => ({ ...p, name: e.target.value }))} /> : <strong>{pkg.name}</strong>}</td>
                      <td style={cell}>{isEditing ? <input style={input} value={pkgEdits.description ?? pkg.description ?? ''} onChange={e => setPkgEdits(p => ({ ...p, description: e.target.value }))} /> : <span style={{ color: C.muted }}>{pkg.description ?? '—'}</span>}</td>
                      <td style={cell}>{isEditing ? <input style={{ ...input, width: 80 }} type="number" step="0.01" value={pkgEdits.price_usd ?? pkg.price_usd} onChange={e => setPkgEdits(p => ({ ...p, price_usd: parseFloat(e.target.value) }))} /> : `$${pkg.price_usd.toFixed(2)}`}</td>
                      <td style={cell}>{isEditing ? <input style={{ ...input, width: 70 }} type="number" value={pkgEdits.credits ?? pkg.credits} onChange={e => setPkgEdits(p => ({ ...p, credits: parseInt(e.target.value, 10) }))} /> : pkg.credits.toLocaleString()}</td>
                      <td style={cell}>{isEditing ? <input style={{ ...input, width: 70 }} type="number" value={pkgEdits.bonus_credits ?? pkg.bonus_credits} onChange={e => setPkgEdits(p => ({ ...p, bonus_credits: parseInt(e.target.value, 10) }))} /> : (pkg.bonus_credits > 0 ? <span style={{ color: '#7530fb', fontWeight: 700 }}>+{pkg.bonus_credits}</span> : <span style={{ color: C.muted }}>0</span>)}</td>
                      {/* Billing type toggle */}
                      <td style={cell}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 0, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}`, width: 'fit-content' }}>
                            {(['one_time', 'monthly'] as const).map(bt => (
                              <button key={bt} onClick={() => setPkgEdits(p => ({ ...p, billing_type: bt }))}
                                style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: billingType === bt ? C.lime : C.bg, color: billingType === bt ? C.dark : C.muted, transition: 'background .15s' }}>
                                {bt === 'one_time' ? 'One-time' : 'Monthly'}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: pkg.billing_type === 'monthly' ? 'rgba(117,48,251,0.1)' : 'rgba(16,185,129,0.1)', color: pkg.billing_type === 'monthly' ? C.lime : '#10b981' }}>
                            {pkg.billing_type === 'monthly' ? '↺ Monthly' : '✓ One-time'}
                          </span>
                        )}
                      </td>
                      {/* Rollover cap — only relevant for monthly */}
                      <td style={cell}>
                        {isEditing && billingType === 'monthly' ? (
                          <input style={{ ...input, width: 70 }} type="number" placeholder="∞" value={pkgEdits.rollover_cap ?? pkg.rollover_cap ?? ''} onChange={e => setPkgEdits(p => ({ ...p, rollover_cap: e.target.value === '' ? null : parseInt(e.target.value, 10) }))} />
                        ) : pkg.billing_type === 'monthly' ? (
                          <span style={{ color: C.muted, fontSize: 12 }}>{pkg.rollover_cap != null ? `${pkg.rollover_cap} cr` : '∞ unlimited'}</span>
                        ) : <span style={{ color: C.muted }}>—</span>}
                      </td>
                      {/* Stripe Price ID — only relevant for monthly */}
                      <td style={cell}>
                        {isEditing && billingType === 'monthly' ? (
                          <input style={{ ...input, width: 140, fontFamily: 'monospace', fontSize: 11 }} placeholder="price_xxx" value={pkgEdits.stripe_price_id ?? pkg.stripe_price_id ?? ''} onChange={e => setPkgEdits(p => ({ ...p, stripe_price_id: e.target.value || null }))} />
                        ) : pkg.billing_type === 'monthly' && pkg.stripe_price_id ? (
                          <code style={{ fontSize: 10, color: C.muted, background: C.bg, padding: '2px 5px', borderRadius: 4 }}>{pkg.stripe_price_id}</code>
                        ) : <span style={{ color: C.muted }}>—</span>}
                      </td>
                      <td style={cell}>{isEditing ? <input type="checkbox" checked={pkgEdits.is_active ?? pkg.is_active} onChange={e => setPkgEdits(p => ({ ...p, is_active: e.target.checked }))} /> : (pkg.is_active ? <Check size={14} color="#7530fb" /> : <X size={14} color="#ef4444" />)}</td>
                      <td style={{ ...cell, whiteSpace: 'nowrap' as const }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => savePkg(pkg.id)} disabled={saving} style={{ ...actionBtn, background: C.lime, color: C.dark }}><Save size={11} /></button>
                            <button onClick={() => { setEditingPkg(null); setPkgEdits({}) }} style={{ ...actionBtn, background: C.bg, color: C.muted }}><X size={11} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingPkg(pkg.id); setPkgEdits({}) }} style={{ ...actionBtn, background: C.bg, color: C.muted }}><Edit3 size={11} /></button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: ACTION COSTS
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'costs' && (
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={15} color={C.blue} />
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Action Costs</span>
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>Credits charged per AI action — edit to reprice without code deploy</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Feature', 'Key', 'Credits / Use', 'Description', 'Enabled', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {costs.map(cost => {
                  const isEditing = editingCost === cost.id
                  return (
                    <tr key={cost.id} style={{ background: isEditing ? 'rgba(29,78,216,0.03)' : 'transparent' }}>
                      <td style={{ ...cell, fontWeight: 600 }}>{isEditing ? <input style={input} value={costEdits.name ?? cost.name} onChange={e => setCostEdits(p => ({ ...p, name: e.target.value }))} /> : cost.name}</td>
                      <td style={cell}><code style={{ fontSize: 11, color: C.muted, background: C.bg, padding: '2px 6px', borderRadius: 4 }}>{cost.feature_key}</code></td>
                      <td style={cell}>{isEditing ? <input style={{ ...input, width: 70 }} type="number" value={costEdits.credits_cost ?? cost.credits_cost} onChange={e => setCostEdits(p => ({ ...p, credits_cost: parseInt(e.target.value, 10) }))} /> : <span style={{ fontWeight: 700, color: '#7530fb' }}>{cost.credits_cost}</span>}</td>
                      <td style={cell}>{isEditing ? <input style={input} value={costEdits.description ?? cost.description ?? ''} onChange={e => setCostEdits(p => ({ ...p, description: e.target.value }))} /> : <span style={{ color: C.muted, fontSize: 11 }}>{cost.description ?? '—'}</span>}</td>
                      <td style={cell}>{isEditing ? <input type="checkbox" checked={costEdits.is_enabled ?? cost.is_enabled} onChange={e => setCostEdits(p => ({ ...p, is_enabled: e.target.checked }))} /> : (cost.is_enabled ? <Check size={14} color="#7530fb" /> : <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>OFF</span>)}</td>
                      <td style={{ ...cell, whiteSpace: 'nowrap' as const }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => saveCost(cost.id)} disabled={saving} style={{ ...actionBtn, background: C.lime, color: C.dark }}><Save size={11} /></button>
                            <button onClick={() => { setEditingCost(null); setCostEdits({}) }} style={{ ...actionBtn, background: C.bg, color: C.muted }}><X size={11} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingCost(cost.id); setCostEdits({}) }} style={{ ...actionBtn, background: C.bg, color: C.muted }}><Edit3 size={11} /></button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: SETTINGS (Free on Signup, Overage, Expiry)
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'settings' && (
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Shield size={15} color={C.limeDeep} />
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Credit Policy Settings</span>
          </div>
          {settingsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <RefreshCw size={18} style={{ animation: 'spin 0.8s linear infinite', color: C.muted }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

              {/* Free Credits on Signup */}
              <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>Free Credits on Signup</p>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Credits auto-gifted when a new user creates an account. Set to 0 to disable.</p>
                <input
                  type="number" min="0"
                  value={creditSettings.signup_credits}
                  onChange={e => setCreditSettings(s => ({ ...s, signup_credits: e.target.value }))}
                  style={{ ...input, width: '100%', fontSize: 18, fontWeight: 700, color: C.limeDeep, textAlign: 'center' as const }}
                />
              </div>

              {/* Overage Policy */}
              <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>Overage Policy</p>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>What happens when a user has 0 credits and tries to use an AI feature.</p>
                <ProDropdown
                  prefix=""
                  currentValue={creditSettings.overage_policy}
                  onChanged={v => setCreditSettings(s => ({ ...s, overage_policy: v }))}
                  width="full"
                  options={[
                    { val: 'block', label: 'Hard Block — reject with 402', enabled: true },
                    { val: 'warn', label: 'Warn — allow + show banner', enabled: true },
                    { val: 'allow_one', label: 'Allow 1 More — then block', enabled: true },
                  ]}
                />
              </div>

              {/* Credit Expiry / Reset Policy */}
              <div style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>Credit Expiry / Reset Policy</p>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>How unused credits are handled each billing cycle.</p>
                <ProDropdown
                  prefix=""
                  currentValue={creditSettings.credit_expiry_policy}
                  onChanged={v => setCreditSettings(s => ({ ...s, credit_expiry_policy: v }))}
                  width="full"
                  options={[
                    { val: 'rollover', label: 'Roll Over — accumulate forever', enabled: true },
                    { val: 'monthly_reset', label: 'Monthly Reset — resets on renewal', enabled: true },
                    { val: 'expire_90d', label: 'Expire After 90 Days', enabled: true },
                  ]}
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              style={{ ...actionBtn, padding: '10px 24px', background: C.limeDeep, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {savingSettings ? <RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={13} />}
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: TRANSACTIONS
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'transactions' && (
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
            <BarChart2 size={15} color={C.blue} />
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text, flex: 1 }}>Credit Transaction Log</span>
            <input placeholder="Filter by User ID" value={txFilter.user_id} onChange={e => setTxFilter(f => ({ ...f, user_id: e.target.value }))}
              style={{ ...input, width: 160 }} />
            <ProDropdown
              prefix=""
              currentValue={txFilter.type || 'all'}
              onChanged={v => setTxFilter(f => ({ ...f, type: v === 'all' ? '' : v }))}
              width={150}
              options={[
                { val: 'all', label: 'All Types', enabled: true },
                { val: 'deduction', label: 'Deduction', enabled: true },
                { val: 'purchase', label: 'Purchase', enabled: true },
                { val: 'gift', label: 'Gift', enabled: true },
                { val: 'promo', label: 'Promo', enabled: true },
                { val: 'signup', label: 'Signup', enabled: true },
              ]}
            />
            <button onClick={() => loadTransactions(0)} style={{ ...actionBtn, background: C.limeDeep, color: '#fff', padding: '6px 14px' }}>
              Search
            </button>
          </div>
          {txLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <RefreshCw size={18} style={{ animation: 'spin 0.8s linear infinite', color: C.muted }} />
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['User', 'Type', 'Amount', 'Balance After', 'Feature', 'Note', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {txRows.length === 0 ? (
                      <tr><td colSpan={7} style={{ ...cell, textAlign: 'center' as const, color: C.muted }}>No transactions found</td></tr>
                    ) : txRows.map((tx: TxRow) => (
                      <tr key={tx.id}>
                        <td style={cell}>
                          <span style={{ fontSize: 11, color: C.muted }}>{(tx as any).profiles?.email ?? tx.user_id.slice(0, 8) + '…'}</span>
                        </td>
                        <td style={cell}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            background: tx.type === 'deduction' ? 'rgba(220,38,38,0.08)' : tx.type === 'purchase' ? 'rgba(22,163,74,0.08)' : 'rgba(117,48,251,0.08)',
                            color: tx.type === 'deduction' ? C.red : tx.type === 'purchase' ? C.green : C.limeDeep,
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td style={cell}>
                          <span style={{ fontWeight: 700, color: tx.amount < 0 ? C.red : C.green }}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </td>
                        <td style={{ ...cell, color: C.muted }}>{tx.balance_after}</td>
                        <td style={cell}>
                          {tx.feature_key ? (
                            <code style={{ fontSize: 10, color: C.muted, background: C.bg, padding: '1px 4px', borderRadius: 3 }}>{tx.feature_key}</code>
                          ) : '—'}
                        </td>
                        <td style={{ ...cell, color: C.muted, fontSize: 11 }}>{tx.note ?? '—'}</td>
                        <td style={{ ...cell, color: C.muted, fontSize: 11, whiteSpace: 'nowrap' as const }}>
                          {new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.muted }}>{txTotal} total</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={txPage === 0} onClick={() => loadTransactions(txPage - 1)} style={{ ...actionBtn, background: C.bg, color: C.muted }}>← Prev</button>
                  <span style={{ fontSize: 11, color: C.muted, padding: '4px 8px' }}>Page {txPage + 1}</span>
                  <button disabled={(txPage + 1) * 50 >= txTotal} onClick={() => loadTransactions(txPage + 1)} style={{ ...actionBtn, background: C.bg, color: C.muted }}>Next →</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: BALANCES
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'balances' && (
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} color={C.limeDeep} />
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text, flex: 1 }}>User Credit Balances</span>
            <input placeholder="Search email or name…" value={balSearch} onChange={e => setBalSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadBalances(0)}
              style={{ ...input, width: 200 }} />
            <button onClick={() => loadBalances(0)} style={{ ...actionBtn, background: C.limeDeep, color: '#fff', padding: '6px 14px' }}>Search</button>
          </div>
          {balLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <RefreshCw size={18} style={{ animation: 'spin 0.8s linear infinite', color: C.muted }} />
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['User', 'Plan', 'Balance', 'Lifetime Issued', 'Lifetime Spent', 'Last Active'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {balRows.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...cell, textAlign: 'center' as const, color: C.muted }}>No wallets found</td></tr>
                  ) : balRows.map((row: BalanceRow) => (
                    <tr key={row.user_id}>
                      <td style={cell}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{row.email ?? 'Unknown'}</p>
                          <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{row.full_name ?? row.user_id.slice(0, 12) + '…'}</p>
                        </div>
                      </td>
                      <td style={cell}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: C.limeTint, color: C.limeDeep }}>
                          {row.plan_name ?? 'Free'}
                        </span>
                      </td>
                      <td style={cell}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: row.balance > 0 ? C.limeDeep : C.muted }}>{row.balance}</span>
                      </td>
                      <td style={{ ...cell, color: C.muted }}>{row.lifetime_credits}</td>
                      <td style={{ ...cell, color: row.lifetime_spent > 0 ? C.red : C.muted }}>{row.lifetime_spent}</td>
                      <td style={{ ...cell, color: C.muted, fontSize: 11 }}>
                        {row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-GB') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.muted }}>{balTotal} wallets total</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={balPage === 0} onClick={() => loadBalances(balPage - 1)} style={{ ...actionBtn, background: C.bg, color: C.muted }}>← Prev</button>
                  <span style={{ fontSize: 11, color: C.muted, padding: '4px 8px' }}>Page {balPage + 1}</span>
                  <button disabled={(balPage + 1) * 50 >= balTotal} onClick={() => loadBalances(balPage + 1)} style={{ ...actionBtn, background: C.bg, color: C.muted }}>Next →</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: USAGE STATS
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Day range selector */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => { setStatsDays(d) }} style={{
                ...actionBtn, padding: '6px 14px',
                background: statsDays === d ? C.limeDeep : C.bg,
                color: statsDays === d ? '#fff' : C.muted,
              }}>
                Last {d}d
              </button>
            ))}
            <button onClick={loadStats} style={{ ...actionBtn, background: C.bg, color: C.muted, marginLeft: 8 }}>
              <RefreshCw size={12} />
            </button>
          </div>

          {statsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', color: C.muted }} />
            </div>
          ) : stats ? (
            <>
              {/* Totals HUD */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Total Balance', value: stats.totals.totalBalance.toLocaleString(), color: C.limeDeep },
                  { label: 'Total Issued', value: stats.totals.totalIssued.toLocaleString(), color: C.green },
                  { label: 'Total Spent', value: stats.totals.totalSpent.toLocaleString(), color: C.red },
                  { label: 'Active Users', value: stats.totals.activeWallets.toLocaleString(), color: C.blue },
                ].map(card => (
                  <div key={card.label} style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 8px' }}>{card.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: card.color, margin: 0 }}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* By Feature */}
              <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Credits Spent by Feature — Last {statsDays} days</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Feature Key', 'Credits Spent', 'Share'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {stats.byFeature.map(row => {
                      const pct = stats.totals.totalSpent > 0 ? Math.round(row.credits / stats.totals.totalSpent * 100) : 0
                      return (
                        <tr key={row.feature_key}>
                          <td style={cell}><code style={{ fontSize: 11, color: C.muted, background: C.bg, padding: '2px 6px', borderRadius: 3 }}>{row.feature_key}</code></td>
                          <td style={cell}><span style={{ fontWeight: 700, color: C.limeDeep }}>{row.credits.toLocaleString()}</span></td>
                          <td style={cell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: C.limeDeep, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, color: C.muted, minWidth: 32 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Top Users */}
              <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Top 10 Credit Consumers (All Time)</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['#', 'User', 'Lifetime Spent'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {stats.topUsers.map((u, i) => (
                      <tr key={u.user_id}>
                        <td style={{ ...cell, color: C.muted, fontWeight: 700 }}>#{i + 1}</td>
                        <td style={cell}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{u.email ?? 'Unknown'}</p>
                          <p style={{ margin: 0, fontSize: 10, color: C.muted }}>{u.full_name ?? u.user_id.slice(0, 12)}</p>
                        </td>
                        <td style={cell}><span style={{ fontWeight: 700, color: C.red }}>{u.lifetime_spent.toLocaleString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' as const, padding: 40, color: C.muted }}>Click a date range to load stats</div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: BULK GIFT
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'bulk_gift' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Single user gift */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Star size={15} color={C.amber} fill={C.amber} />
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Gift Credits to Single User</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>User ID or Email</label>
                <input style={{ ...input, width: '100%' }} placeholder="user UUID from Supabase Auth" value={giftEmail} onChange={e => setGiftEmail(e.target.value)} />
              </div>
              <div style={{ flex: '0 1 100px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Credits</label>
                <input style={{ ...input, width: '100%' }} type="number" min="1" placeholder="e.g. 50" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Note (optional)</label>
                <input style={{ ...input, width: '100%' }} placeholder="e.g. Refund for bug" value={giftNote} onChange={e => setGiftNote(e.target.value)} />
              </div>
              <button onClick={handleGift} disabled={gifting || !giftEmail.trim() || !giftAmount} style={{
                ...actionBtn, padding: '8px 18px',
                background: giftEmail && giftAmount ? C.lime : C.bg,
                color: giftEmail && giftAmount ? C.dark : C.muted,
                fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
                {gifting ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={12} fill="currentColor" />}
                Gift Credits
              </button>
            </div>
          </div>

          {/* Bulk gift to plan */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Users size={15} color={C.limeDeep} />
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Bulk Gift to Plan</span>
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Gift credits to every user on a specific plan (or all users). Max 10,000 credits per user per action.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Target Plan</label>
                <ProDropdown
                  prefix=""
                  currentValue={bulkPlan}
                  onChanged={v => setBulkPlan(v)}
                  width="full"
                  options={[
                    { val: 'all', label: 'All Users', enabled: true },
                    { val: 'Free', label: 'Free Plan', enabled: true },
                    { val: 'Starter', label: 'Starter Plan', enabled: true },
                    { val: 'Growth', label: 'Growth Plan', enabled: true },
                    { val: 'Custom', label: 'Custom Plan', enabled: true },
                  ]}
                />
              </div>
              <div style={{ flex: '0 1 100px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Credits Each</label>
                <input style={{ ...input, width: '100%' }} type="number" min="1" max="10000" placeholder="e.g. 25" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Note</label>
                <input style={{ ...input, width: '100%' }} placeholder="e.g. Promo bonus for all Growth users" value={bulkNote} onChange={e => setBulkNote(e.target.value)} />
              </div>
              <button onClick={handleBulkGift} disabled={bulking || !bulkAmount} style={{
                ...actionBtn, padding: '8px 20px',
                background: bulkAmount ? '#7530fb' : C.bg,
                color: bulkAmount ? '#fff' : C.muted,
                fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
                {bulking ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={12} fill="currentColor" />}
                Bulk Gift
              </button>
            </div>
            <p style={{ fontSize: 10, color: C.amber, marginTop: 12 }}>⚠️ This cannot be undone. Double-check the target plan and amount before gifting.</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: PROMO CODES
      ══════════════════════════════════════════════════════ */}
      {creditTab === 'promo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Create new code */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={14} color={C.limeDeep} fill={C.limeDeep} />
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Create New Promo Code</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'flex-end' }}>
              <div style={{ flex: '0 1 130px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Code</label>
                <input style={{ ...input, width: '100%', fontWeight: 700, textTransform: 'uppercase' as const }} placeholder="SAVE25" value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Description</label>
                <input style={{ ...input, width: '100%' }} placeholder="Spring 2026 bonus" value={newPromo.description} onChange={e => setNewPromo(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ flex: '0 1 90px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Credits</label>
                <input style={{ ...input, width: '100%' }} type="number" min="1" placeholder="50" value={newPromo.credits} onChange={e => setNewPromo(p => ({ ...p, credits: e.target.value }))} />
              </div>
              <div style={{ flex: '0 1 90px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Max Uses</label>
                <input style={{ ...input, width: '100%' }} type="number" min="1" placeholder="∞" value={newPromo.max_uses} onChange={e => setNewPromo(p => ({ ...p, max_uses: e.target.value }))} />
              </div>
              <div style={{ flex: '0 1 140px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Expires At</label>
                <input style={{ ...input, width: '100%' }} type="date" value={newPromo.expires_at} onChange={e => setNewPromo(p => ({ ...p, expires_at: e.target.value }))} />
              </div>
              <button onClick={createPromoCode} disabled={creatingPromo || !newPromo.code || !newPromo.credits} style={{
                ...actionBtn, padding: '8px 18px',
                background: newPromo.code && newPromo.credits ? C.lime : C.bg,
                color: newPromo.code && newPromo.credits ? C.dark : C.muted,
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}>
                {creatingPromo ? <RefreshCw size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} />}
                Create Code
              </button>
            </div>
          </div>

          {/* Codes list */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text, flex: 1 }}>Promo Codes</span>
              <button onClick={loadPromoCodes} style={{ ...actionBtn, background: C.bg, color: C.muted }}>
                <RefreshCw size={12} />
              </button>
            </div>
            {promoLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <RefreshCw size={18} style={{ animation: 'spin 0.8s linear infinite', color: C.muted }} />
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Code', 'Description', 'Credits', 'Uses', 'Expires', 'Status', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {promoCodes.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...cell, textAlign: 'center' as const, color: C.muted }}>No promo codes yet</td></tr>
                  ) : promoCodes.map(code => (
                    <tr key={code.id} style={{ opacity: code.is_active ? 1 : 0.5 }}>
                      <td style={cell}>
                        <code style={{ fontWeight: 800, fontSize: 13, color: C.limeDeep, background: C.limeTint, padding: '2px 8px', borderRadius: 4 }}>
                          {code.code}
                        </code>
                      </td>
                      <td style={{ ...cell, color: C.muted, fontSize: 11 }}>{code.description ?? '—'}</td>
                      <td style={cell}><span style={{ fontWeight: 700, color: C.limeDeep }}>+{code.credits}</span></td>
                      <td style={cell}>
                        <span style={{ fontSize: 11, color: C.muted }}>
                          {code.uses_count}{code.max_uses != null ? ` / ${code.max_uses}` : ' / ∞'}
                        </span>
                      </td>
                      <td style={{ ...cell, fontSize: 11, color: C.muted }}>
                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString('en-GB') : 'Never'}
                      </td>
                      <td style={cell}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: code.is_active ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                          color: code.is_active ? C.green : C.red,
                        }}>
                          {code.is_active ? 'ACTIVE' : 'OFF'}
                        </span>
                      </td>
                      <td style={cell}>
                        <button onClick={() => togglePromoCode(code.id, !code.is_active)} style={{
                          ...actionBtn,
                          background: code.is_active ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)',
                          color: code.is_active ? C.red : C.green,
                        }}>
                          {code.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
