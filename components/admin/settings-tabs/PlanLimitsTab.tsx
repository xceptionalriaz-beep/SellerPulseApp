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
  Shield, Users, Lock, Check, X, Edit3,
  ChevronDown, ChevronUp, Save, RefreshCw,
  Zap, BarChart2, Download, Globe, Star,
  AlertTriangle, Infinity,
} from 'lucide-react'

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
  has_advanced_analytics:  boolean
  has_bulk_export:         boolean
  has_title_builder:       boolean
  has_competitor_research: boolean
  has_api_access:          boolean
  has_priority_support:    boolean
  price_monthly:           number
  price_annual:            number
  is_active:               boolean
  updated_at:              string
}

interface HudStats {
  freeUsers:     number
  premiumSubs:   number
  gatingTunnels: number
}

interface EditState {
  max_monthly_searches:    string
  max_vero_checks:         string
  max_tracked_items:       string
  max_orders_protected:    string
  max_ebay_stores:         string
  has_advanced_analytics:  boolean
  has_bulk_export:         boolean
  has_title_builder:       boolean
  has_competitor_research: boolean
  has_api_access:          boolean
  has_priority_support:    boolean
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
    has_advanced_analytics:  plan.has_advanced_analytics,
    has_bulk_export:         plan.has_bulk_export,
    has_title_builder:       plan.has_title_builder,
    has_competitor_research: plan.has_competitor_research,
    has_api_access:          plan.has_api_access,
    has_priority_support:    plan.has_priority_support,
    price_monthly:           String(plan.price_monthly ?? ''),
    price_annual:            String(plan.price_annual  ?? ''),
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
      value: stats.freeUsers,
      sub:   'on Free Trial plan',
      icon:  Users,
      color: C.muted,
      bg:    C.bg,
    },
    {
      title: 'Premium Subscribers',
      value: stats.premiumSubs,
      sub:   'Pro + Elite combined',
      icon:  Star,
      color: C.limeDeep,
      bg:    C.limeTint,
    },
    {
      title: 'Active Gating Tunnels',
      value: stats.gatingTunnels,
      sub:   'capped feature limits',
      icon:  Lock,
      color: C.blue,
      bg:    'rgba(29,78,216,0.08)',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
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

// ── Boolean Toggle ─────────────────────────────────────────────
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

// ── Plan Row ───────────────────────────────────────────────────
function PlanRow({
  plan,
  isExpanded,
  onToggle,
}: {
  plan:       PlanLimit
  isExpanded: boolean
  onToggle:   () => void
}) {
  const planColors: Record<string, { color: string; bg: string }> = {
    free_trial: { color: C.muted,    bg: C.bg      },
    pro:        { color: C.blue,     bg: 'rgba(29,78,216,0.08)'  },
    elite:      { color: C.limeDeep, bg: C.limeTint },
  }
  const pc = planColors[plan.plan_id ?? ''] ?? { color: C.text, bg: C.bg }

  const numericCols = [
    { value: plan.max_monthly_searches, label: 'Searches'  },
    { value: plan.max_vero_checks,      label: 'VeRO'      },
    { value: plan.max_tracked_items,    label: 'Tracked'   },
    { value: plan.max_orders_protected, label: 'Orders'    },
    { value: plan.max_ebay_stores,      label: 'Stores'    },
  ]

  const boolCols = [
    { value: plan.has_advanced_analytics,  label: 'Analytics' },
    { value: plan.has_bulk_export,         label: 'Export'    },
    { value: plan.has_api_access,          label: 'API'       },
    { value: plan.has_priority_support,    label: 'Support'   },
  ]

  return (
    <div
      className="grid items-center px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-[#fafcf8] transition-colors"
      style={{
        gridTemplateColumns: '1.4fr 0.7fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.8fr',
        gap:             10,
        borderColor:     C.border,
        backgroundColor: isExpanded ? C.limeTint : undefined,
      }}
      onClick={onToggle}>

      {/* Plan name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="px-2 py-0.5 rounded-lg shrink-0"
             style={{ backgroundColor: pc.bg }}>
          <p className="text-[11px] font-black" style={{ color: pc.color }}>
            {plan.display_name ?? plan.tier}
          </p>
        </div>
        <p className="text-[11px] font-bold" style={{ color: C.muted }}>
          ${plan.price_monthly}/mo
        </p>
      </div>

      {/* Numeric limits */}
      {numericCols.map((col, i) => (
        <div key={i}>
          {isUnlimited(col.value) ? (
            <span className="text-[13px] font-black" style={{ color: C.limeDeep }}>∞</span>
          ) : (
            <span className="text-[12px] font-bold" style={{ color: C.text }}>
              {displayLimit(col.value)}
            </span>
          )}
        </div>
      ))}

      {/* Boolean flags */}
      {boolCols.map((col, i) => (
        <div key={i} className="flex items-center justify-center">
          {col.value ? (
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

      {/* Expand icon */}
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
          has_advanced_analytics:  edit.has_advanced_analytics,
          has_bulk_export:         edit.has_bulk_export,
          has_title_builder:       edit.has_title_builder,
          has_competitor_research: edit.has_competitor_research,
          has_api_access:          edit.has_api_access,
          has_priority_support:    edit.has_priority_support,
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

  const boolFeatures: { key: keyof EditState; label: string; icon: any }[] = [
    { key: 'has_advanced_analytics',  label: 'Advanced Analytics',  icon: BarChart2 },
    { key: 'has_bulk_export',         label: 'Bulk Export',         icon: Download  },
    { key: 'has_title_builder',       label: 'Title Builder',       icon: Edit3     },
    { key: 'has_competitor_research', label: 'Competitor Research', icon: Globe     },
    { key: 'has_api_access',          label: 'API Access',          icon: Zap       },
    { key: 'has_priority_support',    label: 'Priority Support',    icon: Star      },
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
              <NumericInput label="Monthly Searches"  value={edit.max_monthly_searches}    onChange={v => updateEdit('max_monthly_searches',    v)} hint="Daily cap on product searches" />
              <NumericInput label="VeRO Checks"       value={edit.max_vero_checks}         onChange={v => updateEdit('max_vero_checks',         v)} hint="VeRO scan limit per month"     />
              <NumericInput label="Tracked Items"     value={edit.max_tracked_items}       onChange={v => updateEdit('max_tracked_items',       v)} hint="Items in watchlist"            />
              <NumericInput label="Orders Protected"  value={edit.max_orders_protected}    onChange={v => updateEdit('max_orders_protected',    v)} hint="Protected orders cap"          />
              <NumericInput label="eBay Stores"       value={edit.max_ebay_stores}         onChange={v => updateEdit('max_ebay_stores',         v)} hint="Connected eBay stores"        />
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
              {boolFeatures.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <Icon size={13} style={{ color: edit[key] ? C.limeDeep : C.muted }} />
                    <p className="text-[12px] font-semibold"
                       style={{ color: edit[key] ? C.dark : C.muted }}>
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
  const columns = [
    'PLAN', 'SEARCHES', 'VERO', 'TRACKED', 'ORDERS', 'STORES',
    'ANALYTICS', 'EXPORT', 'API', 'SUPPORT', '', '',
  ]

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      {/* Header */}
      <div className="grid px-4 py-2.5 border-b"
           style={{
             gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.8fr 0.5fr',
             gap:         10,
             borderColor: C.border,
             backgroundColor: C.bg,
           }}>
        {columns.map((h, i) => (
          <span key={i} className="text-[9px] font-black tracking-wider text-center"
                style={{ color: C.muted }}>{h}</span>
        ))}
      </div>

      {/* Plan rows */}
      {plans.map(plan => (
        <div key={plan.id}>
          <PlanRow
            plan={plan}
            isExpanded={expandedId === plan.id}
            onToggle={() => onToggleExpand(plan.id)}
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
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function PlanLimitsTab({ isInvestorMode = false }: { isInvestorMode?: boolean }) {
  const supabase = createClient()

  const [plans,      setPlans]      = useState<PlanLimit[]>([])
  const [hudStats,   setHudStats]   = useState<HudStats>({ freeUsers: 0, premiumSubs: 0, gatingTunnels: 0 })
  const [loading,    setLoading]    = useState(true)
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
        { count: premiumCount },
      ] = await Promise.all([
        // Full plan limits data
        (supabase.from('plan_limits') as any)
          .select('*')
          .order('price_monthly', { ascending: true }),

        // Optimized count — HEAD query, no row data transferred
        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('plan_name', 'Free Trial'),

        // Optimized count — HEAD query, no row data transferred
        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('plan_name', ['Pro Plan', 'Elite Plan']),
      ])

      const loadedPlans = (plansData ?? []) as PlanLimit[]
      setPlans(loadedPlans)
      setHudStats({
        freeUsers:     freeCount    ?? 0,
        premiumSubs:   premiumCount ?? 0,
        gatingTunnels: countGatingTunnels(loadedPlans),
      })
    } catch (e) {
      console.error('[PlanLimitsTab] loadData error:', e)
      showToast('Failed to load plan limits', 'error')
    }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

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

  async function handleRefresh() {
    setRefreshing(true)
    await loadData()
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
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 h-9 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80 disabled:opacity-40"
          style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>
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

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}