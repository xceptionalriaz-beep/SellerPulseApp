'use client'
// components/admin/settings-tabs/PromoManagerTab.tsx
// ══════════════════════════════════════════════════════════════
// RIAZIFY — Promo & Codes Tab
// Manages marketing promo codes + A/B pricing engine
// Separate from affiliate codes (managed in Affiliate Center)
// ══════════════════════════════════════════════════════════════

import { useTabPermissions } from '@/hooks/useTabPermissions'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Plus, Search, X, Download, Tag, CheckCircle,
  AlertTriangle, Copy, Edit3, Trash2, ToggleLeft,
  ToggleRight, MoreVertical, ChevronDown, Trophy,
  TrendingUp, BarChart2,
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
interface PromoCode {
  id:             string
  code:           string
  description:    string | null
  discount:       string | null
  discount_type:  string | null
  discount_value: number | null
  max_uses:       number | null
  uses_count:     number
  status:         string
  expires_at:     string | null
  created_at:     string
  created_by:     string | null
}

interface AbTest {
  id:                 string
  name:               string
  variant_a_label:    string
  variant_a_price:    number
  variant_a_visitors: number
  variant_a_signups:  number
  variant_a_mrr:      number
  variant_b_label:    string
  variant_b_price:    number
  variant_b_visitors: number
  variant_b_signups:  number
  variant_b_mrr:      number
  winner:             string | null
  status:             string
  created_at:         string
}

// ── Helpers ────────────────────────────────────────────────────
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

function formatDiscount(code: PromoCode): string {
  if (code.discount_type === 'percentage')  return `${code.discount_value}% off`
  if (code.discount_type === 'fixed_amount') return `$${code.discount_value} off`
  if (code.discount_type === 'free_period') return `${code.discount_value} month${(code.discount_value ?? 1) > 1 ? 's' : ''} free`
  return code.discount ?? '—'
}

function usagePct(code: PromoCode): number {
  if (!code.max_uses) return 0
  return Math.min((code.uses_count / code.max_uses) * 100, 100)
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const map = {
    success: { bg: C.dark,    border: C.lime,   color: C.lime  },
    error:   { bg: '#FEF2F2', border: '#FECACA', color: C.red   },
    info:    { bg: C.bg,      border: C.border,  color: C.text  },
  }
  const t = map[type]
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
         style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}>
      <CheckCircle size={15} style={{ color: t.color }} />
      <p className="text-[13px] font-bold" style={{ color: t.color }}>{msg}</p>
    </div>
  )
}

// ── HUD Cards ─────────────────────────────────────────────────
function HudCards({ codes }: { codes: PromoCode[] }) {
  const now       = new Date()
  const active    = codes.filter(c => {
    const isExpired = c.expires_at && new Date(c.expires_at) < now
    const isFull    = c.max_uses && c.uses_count >= c.max_uses
    return c.status === 'active' && !isExpired && !isFull
  }).length
  const totalUses = codes.reduce((s, c) => s + c.uses_count, 0)
  const expiring  = codes.filter(c => {
    const isExpired = c.expires_at && new Date(c.expires_at) < now
    return c.status === 'active' && !isExpired && c.expires_at && daysUntil(c.expires_at) <= 7 && daysUntil(c.expires_at) > 0
  }).length
  const disabled  = codes.filter(c => c.status === 'disabled').length

  const cards = [
    { title: 'Active Codes',     value: active,    sub: `of ${codes.length} total`,       icon: Tag,          color: C.limeDeep, bg: C.limeTint                     },
    { title: 'Total Uses',       value: totalUses, sub: 'across all codes',               icon: TrendingUp,   color: C.blue,     bg: 'rgba(29,78,216,0.08)'         },
    { title: 'Expiring Soon',    value: expiring,  sub: 'within 7 days',                  icon: AlertTriangle,color: expiring > 0 ? C.amber : C.muted, bg: expiring > 0 ? 'rgba(217,119,6,0.08)' : C.bg },
    { title: 'Disabled Codes',   value: disabled,  sub: 'manually turned off',            icon: ToggleLeft,   color: C.muted,    bg: C.bg                           },
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
            <p className="text-[28px] font-black tracking-tight" style={{ color: C.dark }}>
              {card.value}
            </p>
            <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ code }: { code: PromoCode }) {
  const isExpired    = code.expires_at && new Date(code.expires_at) < new Date()
  const isFull       = code.max_uses && code.uses_count >= code.max_uses
  const isNearlyFull = code.max_uses && !isFull && (code.uses_count / code.max_uses) >= 0.90
  const isExpiring   = code.status === 'active' && !isExpired && code.expires_at && daysUntil(code.expires_at) <= 7 && daysUntil(code.expires_at) > 0

  // disabled and expired checks come first — DB status is the source of truth
  if (code.status === 'disabled')
    return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: C.bg, color: C.muted }}>DISABLED</span>
  if (code.status === 'expired' || isExpired)
    return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>EXPIRED</span>
  if (isFull)
    return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(185,28,28,0.1)', color: C.red }}>FULL</span>
  if (isNearlyFull)
    return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(185,28,28,0.08)', color: C.red }}>NEARLY FULL</span>
  if (isExpiring)
    return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: C.amber }}>EXPIRING</span>
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>ACTIVE</span>
}

// ── Promo Codes Table ──────────────────────────────────────────
function PromoCodesTable({
  codes,
  onEdit,
  onToggle,
  onDelete,
  onCopy,
  obscureCode,
  obscureNumber,
  canEdit = true,
  canDelete = true,
  canToggle = true,
}: {
  codes:          PromoCode[]
  onEdit:         (code: PromoCode) => void
  onToggle:       (code: PromoCode) => void
  onDelete:       (code: PromoCode) => void
  onCopy:         (code: string) => void
  obscureCode:    (code: string) => string
  canEdit?:       boolean
  canDelete?:     boolean
  canToggle?:     boolean
  obscureNumber:  (val: number) => string
}) {
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  if (codes.length === 0) return (
    <div className="flex flex-col items-center py-16 gap-3 rounded-2xl border"
         style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <Tag size={24} style={{ color: C.border }} />
      <p className="text-[14px] font-bold" style={{ color: C.text }}>No promo codes found</p>
      <p className="text-[12px]" style={{ color: C.muted }}>Create your first promo code to get started</p>
    </div>
  )

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      {/* Header */}
      <div className="grid px-4 py-2.5 border-b"
           style={{ gridTemplateColumns: '1.5fr 2fr 1fr 1.5fr 1fr 0.8fr 0.6fr', gap: 12, borderColor: C.border, backgroundColor: C.bg }}>
        {['CODE', 'DESCRIPTION', 'DISCOUNT', 'USAGE', 'EXPIRES', 'STATUS', 'ACTIONS'].map((h, i) => (
          <span key={i} className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>{h === 'ACTIONS' ? '' : h}</span>
        ))}
      </div>

      {/* Rows */}
      {codes.map(code => {
        const pct     = usagePct(code)
        const barColor = pct >= 90 ? C.red : pct >= 60 ? C.amber : C.limeDeep
        const isExpired = code.expires_at && new Date(code.expires_at) < new Date()

        return (
          <div key={code.id}
               className="grid px-4 py-3 items-center border-b last:border-b-0 hover:bg-[#fafcf8] transition-colors"
               style={{ gridTemplateColumns: '1.5fr 2fr 1fr 1.5fr 1fr 0.8fr 0.6fr', gap: 12, borderColor: C.border,
                        opacity: code.status === 'disabled' || isExpired ? 0.6 : 1 }}>

            {/* Code */}
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-black px-2 py-1 rounded-lg font-mono tracking-wider"
                    style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                {obscureCode(code.code)}
              </span>
              <button
                onClick={e => { e.stopPropagation(); onCopy(code.code) }}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                title="Copy code">
                <Copy size={11} style={{ color: C.muted }} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[11px] truncate" style={{ color: C.muted }}>
              {code.description ?? '—'}
            </p>

            {/* Discount */}
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: code.discount_type === 'percentage'  ? 'rgba(29,78,216,0.08)' :
                                        code.discount_type === 'fixed_amount' ? 'rgba(22,163,74,0.08)' :
                                        'rgba(217,119,6,0.08)',
                      color: code.discount_type === 'percentage'  ? C.blue  :
                             code.discount_type === 'fixed_amount' ? C.green :
                             C.amber,
                    }}>
                {formatDiscount(code)}
              </span>
            </div>

            {/* Usage */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold" style={{ color: C.text }}>
                  {obscureNumber(code.uses_count)} / {code.max_uses ? obscureNumber(code.max_uses) : '∞'}
                </p>
                {code.max_uses && (
                  <p className="text-[10px]" style={{ color: C.muted }}>{Math.round(pct)}%</p>
                )}
              </div>
              {code.max_uses && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.bg }}>
                  <div className="h-full rounded-full transition-all"
                       style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              )}
            </div>

            {/* Expires */}
            <div>
              {code.expires_at ? (
                <div>
                  <p className="text-[11px] font-semibold"
                     style={{ color: isExpired ? C.red : daysUntil(code.expires_at) <= 7 ? C.amber : C.text }}>
                    {isExpired ? 'Expired' : `${daysUntil(code.expires_at)}d left`}
                  </p>
                  <p className="text-[9px]" style={{ color: C.muted }}>
                    {new Date(code.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] font-semibold" style={{ color: C.muted }}>Never</p>
              )}
            </div>

            {/* Status */}
            <StatusBadge code={code} />

            {/* Actions */}
            <div className="relative flex justify-end">
              <button onClick={() => setActionMenu(actionMenu === code.id ? null : code.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border hover:opacity-80"
                style={{ borderColor: C.border }}>
                <MoreVertical size={13} style={{ color: C.muted }} />
              </button>
              {actionMenu === code.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden py-1"
                       style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                    <button onClick={() => { onCopy(code.code); setActionMenu(null) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12px] font-bold hover:bg-gray-50"
                      style={{ color: C.text }}>
                      <Copy size={13} /> Copy Code
                    </button>
                    {canEdit && <button onClick={() => { onEdit(code); setActionMenu(null) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12px] font-bold hover:bg-gray-50"
                      style={{ color: C.text }}>
                      <Edit3 size={13} /> Edit
                    </button>}
                    {canToggle && <button onClick={() => { onToggle(code); setActionMenu(null) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12px] font-bold hover:bg-gray-50"
                      style={{ color: code.status === 'active' ? C.amber : C.green }}>
                      {code.status === 'active'
                        ? <><ToggleLeft  size={13} /> Disable</>
                        : <><ToggleRight size={13} /> Enable</>}
                    </button>}
                    <div className="h-px my-1" style={{ backgroundColor: C.border }} />
                    {canDelete && <button onClick={() => { onDelete(code); setActionMenu(null) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[12px] font-bold hover:bg-gray-50"
                      style={{ color: C.red }}>
                      <Trash2 size={13} /> Delete
                    </button>}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Create / Edit Modal ────────────────────────────────────────
function PromoCodeModal({
  code,
  onClose,
  onSaved,
}: {
  code:    PromoCode | null
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const isEdit   = !!code

  const [codeVal,     setCodeVal]     = useState(code?.code           ?? '')
  const [description, setDescription] = useState(code?.description    ?? '')
  const [discType,    setDiscType]    = useState(code?.discount_type  ?? 'percentage')
  const [discValue,   setDiscValue]   = useState(String(code?.discount_value ?? ''))
  const [maxUses,     setMaxUses]     = useState(String(code?.max_uses ?? ''))
  const [unlimited,   setUnlimited]   = useState(!code?.max_uses)
  const [expiryDate,  setExpiryDate]  = useState(
    code?.expires_at ? new Date(code.expires_at).toISOString().split('T')[0] : ''
  )
  const [neverExpires,setNeverExpires]= useState(!code?.expires_at)
  const [status,      setStatus]      = useState(code?.status ?? 'active')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  function generateCode() {
    const words  = description.trim().toUpperCase().split(/\s+/).filter(Boolean)
    const prefix = words.slice(0, 2).join('').replace(/[^A-Z0-9]/g, '').slice(0, 8)
    const suffix = Math.floor(10 + Math.random() * 90)
    setCodeVal(prefix ? `${prefix}${suffix}` : `PROMO${suffix}`)
  }

  function buildDiscountText(): string {
    if (discType === 'percentage')   return `${discValue}%`
    if (discType === 'fixed_amount') return `$${discValue} off`
    if (discType === 'free_period')  return `${discValue} month${Number(discValue) > 1 ? 's' : ''} free`
    return discValue
  }

  async function handleSave() {
    if (!codeVal.trim())   { setError('Code is required'); return }
    if (!discValue.trim()) { setError('Discount value is required'); return }
    if (isNaN(Number(discValue)) || Number(discValue) <= 0) { setError('Discount value must be a positive number'); return }
    if (!unlimited && maxUses && (isNaN(Number(maxUses)) || Number(maxUses) < 1)) { setError('Max uses must be a positive number'); return }

    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const payload = {
        code:           codeVal.trim().toUpperCase(),
        description:    description.trim() || null,
        discount:       buildDiscountText(),
        discount_type:  discType,
        discount_value: Number(discValue),
        max_uses:       unlimited ? null : Number(maxUses) || null,
        expires_at:     neverExpires ? null : expiryDate ? new Date(expiryDate).toISOString() : null,
        status,
        created_by:     session?.user?.id ?? null,
      }

      const res = await fetch(isEdit ? '/api/admin/promo/update' : '/api/admin/promo/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify(isEdit ? { id: code.id, ...payload } : payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to save')
        setSaving(false)
        return
      }
      // Call onSaved and onClose — modal unmounts after this
      // Do NOT set any state after this point
      onSaved()
      onClose()
    } catch {
      setError('Network error')
      setSaving(false)
    }
  }

  const discTypeOptions = [
    { value: 'percentage',   label: 'Percentage off' },
    { value: 'fixed_amount', label: 'Fixed $ amount' },
    { value: 'free_period',  label: 'Free months'    },
  ]

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: C.dark }}>
              <Tag size={16} style={{ color: C.lime }} />
            </div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>
              {isEdit ? 'Edit Promo Code' : 'Create Promo Code'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="px-3 py-2 rounded-xl border"
                 style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <p className="text-[12px] font-bold" style={{ color: C.red }}>{error}</p>
            </div>
          )}

          {/* Code */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>PROMO CODE</p>
            <div className="flex gap-2">
              <input value={codeVal} onChange={e => { if (!isEdit) setCodeVal(e.target.value.toUpperCase()) }}
                placeholder="e.g. BLACKFRIDAY50"
                readOnly={isEdit}
                className="flex-1 h-10 px-3 rounded-xl border text-[13px] font-mono font-bold outline-none"
                style={{
                  borderColor:     isEdit ? C.border : C.border,
                  backgroundColor: isEdit ? C.bg     : C.bg,
                  color:           isEdit ? C.muted  : C.text,
                  cursor:          isEdit ? 'not-allowed' : 'text',
                }} />
              {!isEdit && (
                <button onClick={generateCode}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold hover:opacity-80"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  Generate
                </button>
              )}
            </div>
            {isEdit && (
              <p className="text-[10px] mt-1 font-semibold" style={{ color: C.muted }}>
                Code cannot be changed after creation — editing would break live checkout URLs
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DESCRIPTION</p>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 50% off first 3 months — Black Friday campaign"
              className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>DISCOUNT TYPE</p>
              <div className="flex flex-col gap-1.5">
                {discTypeOptions.map(o => (
                  <button key={o.value} onClick={() => setDiscType(o.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[12px] font-semibold"
                    style={{
                      borderColor:     discType === o.value ? C.lime     : C.border,
                      backgroundColor: discType === o.value ? C.limeTint : C.bg,
                      color:           discType === o.value ? C.limeDeep : C.text,
                    }}>
                    {discType === o.value && <CheckCircle size={11} style={{ color: C.limeDeep }} />}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>
                {discType === 'percentage' ? 'PERCENTAGE' : discType === 'fixed_amount' ? 'AMOUNT ($)' : 'MONTHS'}
              </p>
              <input value={discValue} onChange={e => setDiscValue(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder={discType === 'percentage' ? '20' : discType === 'fixed_amount' ? '10' : '1'}
                className="w-full h-10 px-3 rounded-xl border text-[13px] font-bold outline-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
              {discValue && (
                <p className="text-[11px] mt-1 font-semibold" style={{ color: C.limeDeep }}>
                  → {buildDiscountText()}
                </p>
              )}
            </div>
          </div>

          {/* Max uses */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>MAX USES</p>
              <button onClick={() => setUnlimited(u => !u)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: unlimited ? C.limeTint : C.bg, color: unlimited ? C.limeDeep : C.muted }}>
                {unlimited ? '✓ Unlimited' : 'Set limit'}
              </button>
            </div>
            {!unlimited && (
              <input value={maxUses} onChange={e => setMaxUses(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 100"
                className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
            )}
          </div>

          {/* Expiry */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>EXPIRY DATE</p>
              <button onClick={() => setNeverExpires(n => !n)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: neverExpires ? C.limeTint : C.bg, color: neverExpires ? C.limeDeep : C.muted }}>
                {neverExpires ? '✓ Never expires' : 'Set expiry'}
              </button>
            </div>
            {!neverExpires && (
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
                style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>STATUS</p>
            <div className="flex gap-2">
              {['active', 'disabled'].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className="flex-1 py-2 rounded-xl border text-[12px] font-bold"
                  style={{
                    backgroundColor: status === s ? C.dark : C.bg,
                    borderColor:     status === s ? C.dark : C.border,
                    color:           status === s ? C.lime : C.muted,
                  }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
            style={{ borderColor: C.border, color: C.muted }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
            {saving
              ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
              : isEdit ? 'Save Changes' : 'Create Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Modal ───────────────────────────────────────
function DeleteConfirmModal({ code, onClose, onConfirm }: { code: PromoCode; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
              <Trash2 size={18} style={{ color: C.red }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: C.dark }}>Delete Promo Code</p>
              <p className="text-[11px]" style={{ color: C.muted }}>This cannot be undone</p>
            </div>
          </div>
          <p className="text-[13px]" style={{ color: C.muted }}>
            Are you sure you want to delete <span className="font-black font-mono" style={{ color: C.dark }}>{code.code}</span>?
            It has been used <strong>{code.uses_count}</strong> time{code.uses_count !== 1 ? 's' : ''}.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold" style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold" style={{ backgroundColor: C.red, color: '#fff' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Declare Winner Modal (Patch 2 — Double-lock) ───────────────
function DeclareWinnerModal({ test, variant, onClose, onConfirm }: {
  test:      AbTest
  variant:   'a' | 'b'
  onClose:   () => void
  onConfirm: () => void
}) {
  const [input,       setInput]       = useState('')
  const [confirming,  setConfirming]  = useState(false)
  const isValid  = input.trim() === 'CONFIRM'
  const winLabel = variant === 'a' ? test.variant_a_label : test.variant_b_label
  const winPrice = variant === 'a' ? test.variant_a_price  : test.variant_b_price
  const winMrr   = variant === 'a' ? test.variant_a_mrr    : test.variant_b_mrr

  async function handleConfirm() {
    if (!isValid) return
    setConfirming(true)
    try {
      await onConfirm()
      // onConfirm calls setWinnerModal(null) which unmounts this modal
      // Do NOT set any state after this point
    } catch {
      // Only reset confirming if something went wrong and modal is still mounted
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: 'rgba(143,255,0,0.04)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.limeTint }}>
            <Trophy size={18} style={{ color: C.limeDeep }} />
          </div>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Declare Winner</p>
            <p className="text-[11px]" style={{ color: C.muted }}>This changes global platform pricing</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Winner summary */}
          <div className="px-4 py-3 rounded-2xl border"
               style={{ backgroundColor: C.limeTint, borderColor: `${C.lime}60` }}>
            <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.limeDeep }}>DECLARING WINNER</p>
            <p className="text-[16px] font-black" style={{ color: C.dark }}>{winLabel}</p>
            <p className="text-[13px]" style={{ color: C.muted }}>
              ${winPrice}/mo · ${winMrr.toLocaleString()} MRR
            </p>
          </div>

          {/* Warning */}
          <div className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border"
               style={{ backgroundColor: 'rgba(217,119,6,0.04)', borderColor: 'rgba(217,119,6,0.3)' }}>
            {[
              'This will lock in the winning price globally',
              'The A/B test will be marked as completed',
              'This action is logged and cannot be auto-reversed',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.amber }} />
                <p className="text-[11px]" style={{ color: C.muted }}>{item}</p>
              </div>
            ))}
          </div>

          {/* Confirmation input */}
          <div>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
              Type <strong style={{ color: C.dark }}>CONFIRM</strong> to proceed
            </p>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type CONFIRM..."
              autoFocus
              className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none font-mono"
              style={{
                borderColor:     isValid ? C.lime : C.border,
                backgroundColor: C.bg,
                color:           C.text,
              }} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!isValid || confirming}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              {confirming
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                : <><Trophy size={14} /> Declare Winner</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delete A/B Test Modal ──────────────────────────────────────
function DeleteAbTestModal({
  test,
  onClose,
  onDeleted,
}: {
  test:      AbTest
  onClose:   () => void
  onDeleted: () => void
}) {
  const supabase    = createClient()
  const [input,     setInput]     = useState('')
  const [deleting,  setDeleting]  = useState(false)
  const [error,     setError]     = useState('')
  const isValid     = input.trim() === test.name.trim()

  async function handleDelete() {
    if (!isValid) return
    setDeleting(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/promo/delete-ab-test', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ testId: test.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to delete test')
        setDeleting(false)
        return
      }
      onDeleted()
      onClose()
    } catch {
      setError('Network error — please try again')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
         onClick={e => e.target === e.currentTarget && !deleting && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b"
             style={{ borderColor: C.border, backgroundColor: 'rgba(185,28,28,0.04)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'rgba(185,28,28,0.1)' }}>
            <Trash2 size={18} style={{ color: C.red }} />
          </div>
          <div>
            <p className="text-[15px] font-black" style={{ color: C.dark }}>Delete A/B Test</p>
            <p className="text-[11px]" style={{ color: C.muted }}>This cannot be undone</p>
          </div>
          <button onClick={onClose} disabled={deleting}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 rounded-xl border"
                 style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <p className="text-[12px] font-bold" style={{ color: C.red }}>{error}</p>
            </div>
          )}

          {/* Test info */}
          <div className="px-4 py-3 rounded-2xl border"
               style={{ backgroundColor: C.bg, borderColor: C.border }}>
            <p className="text-[11px] font-black tracking-wider mb-1" style={{ color: C.muted }}>DELETING TEST</p>
            <p className="text-[14px] font-black" style={{ color: C.dark }}>{test.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
              ${test.variant_a_price}/mo vs ${test.variant_b_price}/mo · {test.variant_a_visitors + test.variant_b_visitors} total visitors
            </p>
          </div>

          {/* Warning bullets */}
          <div className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border"
               style={{ backgroundColor: 'rgba(185,28,28,0.04)', borderColor: 'rgba(185,28,28,0.2)' }}>
            {[
              'All visitor and signup data will be permanently lost',
              'MRR tracking for this test will be deleted',
              'This action cannot be reversed',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: C.red }} />
                <p className="text-[11px]" style={{ color: C.muted }}>{item}</p>
              </div>
            ))}
          </div>

          {/* Type test name to confirm */}
          <div>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>
              Type the test name to confirm:{' '}
              <span className="font-black" style={{ color: C.dark }}>{test.name}</span>
            </p>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type test name exactly..."
              autoFocus
              className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
              style={{
                borderColor:     isValid ? C.lime : C.border,
                backgroundColor: C.bg,
                color:           C.text,
              }} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold disabled:opacity-40"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={!isValid || deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: C.red, color: '#fff' }}>
              {deleting
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#fff' }} />
                : <><Trash2 size={14} /> Delete Test</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── A/B Pricing Engine ─────────────────────────────────────────
function AbPricingEngine({
  tests,
  onDeclareWinner,
  onDeleteTest,
  canDelete,
}: {
  tests:           AbTest[]
  onDeclareWinner: (test: AbTest, variant: 'a' | 'b') => void
  onDeleteTest:    (test: AbTest) => void
  canDelete:       boolean
}) {
  if (tests.length === 0) return (
    <div className="flex flex-col items-center py-10 gap-2">
      <BarChart2 size={24} style={{ color: C.border }} />
      <p className="text-[13px]" style={{ color: C.muted }}>No A/B tests running</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {tests.map(test => {
        const aConv   = test.variant_a_visitors > 0 ? ((test.variant_a_signups / test.variant_a_visitors) * 100).toFixed(1) : '0.0'
        const bConv   = test.variant_b_visitors > 0 ? ((test.variant_b_signups / test.variant_b_visitors) * 100).toFixed(1) : '0.0'
        const hasData = test.variant_a_mrr > 0 || test.variant_b_mrr > 0
        const winner  = !hasData || test.variant_a_mrr === test.variant_b_mrr
          ? null
          : test.variant_a_mrr > test.variant_b_mrr ? 'a' : 'b'
        const isDone  = test.status === 'completed'

        return (
          <div key={test.id} className="rounded-2xl border overflow-hidden"
               style={{ borderColor: C.border, backgroundColor: C.surface }}>
            {/* Test header */}
            <div className="flex items-center justify-between px-5 py-3 border-b"
                 style={{ borderColor: C.border, backgroundColor: C.bg }}>
              <div>
                <p className="text-[13px] font-black" style={{ color: C.dark }}>{test.name}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>
                  Started {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isDone ? C.limeTint : 'rgba(29,78,216,0.08)',
                        color:           isDone ? C.limeDeep : C.blue,
                      }}>
                  {isDone ? 'COMPLETED' : 'RUNNING'}
                </span>
                {canDelete && (
                  <button
                    onClick={() => onDeleteTest(test)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border hover:opacity-80 transition-all"
                    style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.04)' }}
                    title="Delete test">
                    <Trash2 size={12} style={{ color: C.red }} />
                  </button>
                )}
              </div>
            </div>

            {/* Variants */}
            <div className="grid grid-cols-2 gap-0">
              {(['a', 'b'] as const).map(v => {
                const isWinner  = winner !== null && winner === v
                const label     = v === 'a' ? test.variant_a_label    : test.variant_b_label
                const price     = v === 'a' ? test.variant_a_price     : test.variant_b_price
                const visitors  = v === 'a' ? test.variant_a_visitors  : test.variant_b_visitors
                const signups   = v === 'a' ? test.variant_a_signups   : test.variant_b_signups
                const mrr       = v === 'a' ? test.variant_a_mrr       : test.variant_b_mrr
                const conv      = v === 'a' ? aConv : bConv
                const declared  = test.winner === v

                return (
                  <div key={v}
                       className="flex flex-col gap-4 p-5"
                       style={{
                         borderRight:     v === 'a' ? `1px solid ${C.border}` : 'none',
                         backgroundColor: isWinner && !isDone ? 'rgba(143,255,0,0.02)' : 'transparent',
                         borderLeft:      isWinner && !isDone ? `3px solid ${C.lime}` : '3px solid transparent',
                       }}>
                    {/* Variant header */}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-black" style={{ color: isWinner ? C.limeDeep : C.muted }}>
                        {label}
                      </p>
                      {isWinner && !isDone && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                          WINNING
                        </span>
                      )}
                      {declared && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                          🏆 WINNER
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <p className="text-[32px] font-black tracking-tight" style={{ color: C.dark }}>
                      ${price}<span className="text-[14px] font-semibold" style={{ color: C.muted }}>/mo</span>
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Visitors',   value: visitors.toLocaleString(), color: C.text   },
                        { label: 'Conversion', value: `${conv}%`,                color: C.text   },
                        { label: 'MRR',        value: `$${mrr.toLocaleString()}`,color: isWinner ? C.limeDeep : C.text },
                      ].map(stat => (
                        <div key={stat.label} className="p-2.5 rounded-xl"
                             style={{ backgroundColor: C.bg }}>
                          <p className="text-[9px] font-bold mb-0.5" style={{ color: C.muted }}>{stat.label}</p>
                          <p className="text-[14px] font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Declare winner button */}
                    {!isDone && (
                      <button onClick={() => onDeclareWinner(test, v)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold hover:opacity-80 transition-all"
                        style={{
                          backgroundColor: isWinner ? C.dark      : C.bg,
                          color:           isWinner ? C.lime      : C.muted,
                          border:          `1px solid ${isWinner ? C.dark : C.border}`,
                        }}>
                        <Trophy size={13} /> Declare Winner
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Create A/B Test Modal ──────────────────────────────────────
function CreateAbTestModal({
  onClose,
  onCreated,
}: {
  onClose:   () => void
  onCreated: () => void
}) {
  const supabase = createClient()

  const [testName,      setTestName]      = useState('')
  const [variantALabel, setVariantALabel] = useState('Variant A (Control)')
  const [variantAPrice, setVariantAPrice] = useState('')
  const [variantBLabel, setVariantBLabel] = useState('Variant B (Test)')
  const [variantBPrice, setVariantBPrice] = useState('')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')

  async function handleCreate() {
    if (!testName.trim())          { setError('Test name is required'); return }
    if (!variantAPrice.trim())     { setError('Variant A price is required'); return }
    if (!variantBPrice.trim())     { setError('Variant B price is required'); return }
    if (isNaN(Number(variantAPrice)) || Number(variantAPrice) <= 0) { setError('Variant A price must be a positive number'); return }
    if (isNaN(Number(variantBPrice)) || Number(variantBPrice) <= 0) { setError('Variant B price must be a positive number'); return }
    if (Number(variantAPrice) === Number(variantBPrice)) { setError('Variant prices must be different to run a meaningful test'); return }

    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/promo/create-ab-test', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({
          name:               testName.trim(),
          variant_a_label:    variantALabel.trim() || 'Variant A (Control)',
          variant_a_price:    Number(variantAPrice),
          variant_b_label:    variantBLabel.trim() || 'Variant B (Test)',
          variant_b_price:    Number(variantBPrice),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to create test')
        setSaving(false)
        return
      }
      onCreated()
      onClose()
    } catch {
      setError('Network error — please try again')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: C.dark }}>
              <BarChart2 size={16} style={{ color: C.lime }} />
            </div>
            <div>
              <p className="text-[15px] font-black" style={{ color: C.dark }}>New A/B Price Test</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Winner decided by highest MRR</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X size={15} style={{ color: C.muted }} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 rounded-xl border"
                 style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
              <p className="text-[12px] font-bold" style={{ color: C.red }}>{error}</p>
            </div>
          )}

          {/* Test name */}
          <div>
            <p className="text-[10px] font-black tracking-wider mb-1.5" style={{ color: C.muted }}>
              TEST NAME
            </p>
            <input value={testName} onChange={e => setTestName(e.target.value)}
              placeholder="e.g. Pro Plan Price Test Q3 2026"
              autoFocus
              className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.text }} />
          </div>

          {/* Variant A */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl border"
               style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.muted }}>
              VARIANT A — CONTROL
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>LABEL</p>
                <input value={variantALabel} onChange={e => setVariantALabel(e.target.value)}
                  placeholder="Variant A (Control)"
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.muted }}>PRICE ($/mo)</p>
                <input value={variantAPrice} onChange={e => setVariantAPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 29"
                  className="w-full h-9 px-3 rounded-xl border text-[12px] font-bold outline-none"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.text }} />
              </div>
            </div>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>VS</span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
          </div>

          {/* Variant B */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl border"
               style={{ borderColor: `${C.lime}40`, backgroundColor: C.limeTint }}>
            <p className="text-[10px] font-black tracking-wider" style={{ color: C.limeDeep }}>
              VARIANT B — TEST
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.limeDeep }}>LABEL</p>
                <input value={variantBLabel} onChange={e => setVariantBLabel(e.target.value)}
                  placeholder="Variant B (Test)"
                  className="w-full h-9 px-3 rounded-xl border text-[12px] outline-none"
                  style={{ borderColor: `${C.lime}60`, backgroundColor: C.surface, color: C.text }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: C.limeDeep }}>PRICE ($/mo)</p>
                <input value={variantBPrice} onChange={e => setVariantBPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 39"
                  className="w-full h-9 px-3 rounded-xl border text-[12px] font-bold outline-none"
                  style={{ borderColor: `${C.lime}60`, backgroundColor: C.surface, color: C.text }} />
              </div>
            </div>
          </div>

          {/* Info note */}
          <p className="text-[11px]" style={{ color: C.muted }}>
            Visitors, signups and MRR all start at 0. Use{' '}
            <span className="font-mono font-bold" style={{ color: C.text }}>
              POST /api/admin/promo/track-ab-event
            </span>{' '}
            from your landing page to increment counts in real time.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold"
              style={{ borderColor: C.border, color: C.muted }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
              style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
              {saving
                ? <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.lime }} />
                : <><BarChart2 size={14} /> Launch Test</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function PromoManagerTab({ isInvestorMode = false }: { isInvestorMode?: boolean }) {
  const { can } = useTabPermissions('promos')
  const supabase = createClient()

  // ── Investor mode obscuring ────────────────────────────────
  function obscureCode(code: string): string {
    if (!isInvestorMode) return code
    return `${code.slice(0, 3)}***`
  }

  function obscureNumber(val: number): string {
    if (!isInvestorMode) return val.toLocaleString()
    return '***'
  }

  const [codes,        setCodes]        = useState<PromoCode[]>([])
  const [abTests,      setAbTests]      = useState<AbTest[]>([])
  const [loading,      setLoading]      = useState(true)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<PromoCode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null)
  const [winnerModal,  setWinnerModal]  = useState<{ test: AbTest; variant: 'a' | 'b' } | null>(null)
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [showCreateTest,   setShowCreateTest]   = useState(false)
  const [canCreateTest,    setCanCreateTest]    = useState(false)
  const [deleteTestTarget, setDeleteTestTarget] = useState<AbTest | null>(null)

  function showToastMsg(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [{ data: codesData }, { data: testsData }] = await Promise.all([
        (supabase.from('promo_codes') as any).select('*').order('created_at', { ascending: false }),
        (supabase.from('ab_tests') as any).select('*').order('created_at', { ascending: false }),
      ])
      setCodes((codesData ?? []) as PromoCode[])
      setAbTests((testsData ?? []) as AbTest[])
    } catch (e) {
      console.error('[PromoManagerTab]', e)
      showToastMsg('Failed to load data — please refresh', 'error')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // ── Permission check — separate from data loading ─────────────
  useEffect(() => {
    async function checkPermission() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        const isFounder = (profile as any)?.role === 'admin'
        if (isFounder) {
          setCanCreateTest(true)
          return
        }
        // Check team_members table for admin role assignment + scopes
        const { data: memberData } = await (supabase.from('team_members') as any)
          .select('admin_role_id')
          .eq('user_id', session.user.id)
          .maybeSingle()
        if (memberData?.admin_role_id) {
          const { data: roleData } = await (supabase.from('admin_roles') as any)
            .select('scopes')
            .eq('id', memberData.admin_role_id)
            .maybeSingle()
          const scopes: string[] = (roleData as any)?.scopes ?? []
          setCanCreateTest(scopes.includes('manage_ab_tests'))
        }
      } catch (e) {
        console.error('[PromoManagerTab] permission check error:', e)
      }
    }
    checkPermission()
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // ── Toggle enable/disable ────────────────────────────────────
  async function handleToggle(code: PromoCode) {
    const newStatus = code.status === 'active' ? 'disabled' : 'active'
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/promo/toggle', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: code.id, status: newStatus }),
      })
      if (res.ok) {
        setCodes(prev => prev.map(c => c.id === code.id ? { ...c, status: newStatus } : c))
        showToastMsg(`${code.code} ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success')
      } else {
        const json = await res.json()
        showToastMsg(json.error ?? 'Failed to update status — please try again', 'error')
      }
    } catch {
      showToastMsg('Network error — status not updated', 'error')
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/promo/delete', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ id: deleteTarget.id }),
      })
      if (res.ok) {
        setCodes(prev => prev.filter(c => c.id !== deleteTarget.id))
        showToastMsg(`${deleteTarget.code} deleted`, 'success')
      } else {
        const json = await res.json()
        showToastMsg(json.error ?? 'Failed to delete — please try again', 'error')
      }
    } catch {
      showToastMsg('Network error — delete failed', 'error')
    }
    setDeleteTarget(null)
  }

  // ── Copy code ────────────────────────────────────────────────
  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    showToastMsg(`${code} copied to clipboard`, 'info')
  }

  // ── Declare winner ───────────────────────────────────────────
  async function handleDeclareWinner() {
    if (!winnerModal) return
    const { test, variant } = winnerModal
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/promo/declare-winner', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ testId: test.id, winner: variant }),
      })
      if (res.ok) {
        setAbTests(prev => prev.map(t => t.id === test.id ? { ...t, winner: variant, status: 'completed' } : t))
        showToastMsg('Winner declared — test completed', 'success')
      } else {
        showToastMsg('Failed to declare winner', 'error')
      }
    } catch { showToastMsg('Network error', 'error') }
    setWinnerModal(null)
  }

  // ── Export CSV ───────────────────────────────────────────────
  function exportCSV() {
    const escape  = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const headers = ['Code', 'Description', 'Discount', 'Type', 'Value', 'Uses', 'Max Uses', 'Status', 'Expires', 'Created']
    const rows    = codes.map(c => [
      escape(c.code),
      escape(c.description ?? ''),
      escape(formatDiscount(c)),
      escape(c.discount_type ?? ''),
      escape(c.discount_value ?? ''),
      escape(c.uses_count),
      escape(c.max_uses ?? 'Unlimited'),
      escape(c.status),
      escape(c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'),
      escape(new Date(c.created_at).toLocaleDateString()),
    ])
    const csv  = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `riazify-promo-codes-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link); link.click()
    document.body.removeChild(link); URL.revokeObjectURL(url)
    showToastMsg(`Exported ${codes.length} codes`, 'success')
  }

  // ── Filtered codes ───────────────────────────────────────────
  const filteredCodes = useMemo(() => {
    return codes.filter(c => {
      const matchSearch = !searchQuery ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const isExpired = c.expires_at && new Date(c.expires_at) < new Date()
      const effectiveStatus = isExpired ? 'expired' : c.status
      const matchStatus = statusFilter === 'all' || effectiveStatus === statusFilter
      return matchSearch && matchStatus
    })
  }, [codes, searchQuery, statusFilter])

  const statusOptions = [
    { value: 'all',      label: 'All Status'  },
    { value: 'active',   label: 'Active'      },
    { value: 'disabled', label: 'Disabled'    },
    { value: 'expired',  label: 'Expired'     },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.limeDeep }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-5">

      {/* HUD Cards */}
      {can('view_analytics') && <HudCards codes={codes} />}

      {/* Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border flex-1 min-w-[200px]"
             id="promo-search"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <Search size={14} style={{ color: C.muted, flexShrink: 0 }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search promo codes..."
            className="flex-1 text-[13px] bg-transparent"
            style={{ color: C.text, border: 'none', outline: 'none', boxShadow: 'none' }}
            onFocus={() => {
              const el = document.getElementById('promo-search')
              if (el) {
                el.style.borderColor = 'rgba(143,255,0,0.5)'
                el.style.boxShadow   = '0 0 0 3px rgba(143,255,0,0.15)'
              }
            }}
            onBlur={() => {
              const el = document.getElementById('promo-search')
              if (el) {
                el.style.borderColor = C.border
                el.style.boxShadow   = 'none'
              }
            }} />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X size={13} style={{ color: C.muted }} /></button>}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-2 h-10 px-3 rounded-xl border text-[12px] font-semibold"
            style={{ backgroundColor: C.surface, borderColor: filterOpen ? C.lime : C.border, color: C.text, minWidth: 130 }}>
            <span className="flex-1 text-left">{statusOptions.find(o => o.value === statusFilter)?.label}</span>
            <ChevronDown size={12} style={{ color: C.muted, transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 z-50 rounded-2xl border p-1.5 flex flex-col gap-0.5"
                   style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                {statusOptions.map(o => (
                  <button key={o.value} onClick={() => { setStatusFilter(o.value); setFilterOpen(false) }}
                    className="px-3 py-2 rounded-xl text-[12px] font-semibold text-left transition-all"
                    style={{ backgroundColor: statusFilter === o.value ? C.lime : 'transparent', color: statusFilter === o.value ? C.dark : C.text }}
                    onMouseEnter={e => { if (statusFilter !== o.value) e.currentTarget.style.backgroundColor = C.limeTint }}
                    onMouseLeave={e => { if (statusFilter !== o.value) e.currentTarget.style.backgroundColor = 'transparent' }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Export */}
          {can('export_promos') && <button onClick={exportCSV}
            className="flex items-center gap-2 h-10 px-3 rounded-xl border text-[12px] font-bold hover:opacity-80"
            style={{ backgroundColor: C.surface, borderColor: C.border, color: C.muted }}>
            <Download size={14} /> Export
        </button>}
        {/* New Code */}
        {can('create_promo') && <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-bold hover:opacity-80"
          style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
          <Plus size={14} /> New Code
        </button>}
      </div>

     {/* Promo Codes Table */}
        {can('view_promos') ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>
                PROMO CODES — {filteredCodes.length} {statusFilter !== 'all' ? statusFilter : 'total'}
              </p>
            </div>
            <PromoCodesTable
              codes={filteredCodes}
              onEdit={code => setEditTarget(code)}
              onToggle={handleToggle}
              onDelete={code => setDeleteTarget(code)}
              onCopy={handleCopy}
              obscureCode={obscureCode}
              obscureNumber={obscureNumber}
              canEdit={can('edit_promo')}
              canDelete={can('delete_promo')}
              canToggle={can('toggle_promo')}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.bg }}>
            <p className="text-[13px] font-bold" style={{ color: C.muted }}>You don't have access to view promo codes</p>
          </div>
        )}

      {/* A/B Pricing Engine */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-black tracking-wider" style={{ color: C.muted }}>A/B PRICING ENGINE</p>
            <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>
              Live pricing tests — winner declared by highest MRR
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                 style={{ backgroundColor: abTests.some(t => t.status === 'running') ? C.limeTint : C.bg }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                   style={{ backgroundColor: abTests.some(t => t.status === 'running') ? C.limeDeep : C.muted }} />
              <p className="text-[11px] font-bold" style={{ color: abTests.some(t => t.status === 'running') ? C.limeDeep : C.muted }}>
                {abTests.filter(t => t.status === 'running').length} running
              </p>
            </div>
           {can('create_ab_test') && (
                <button onClick={() => setShowCreateTest(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-bold hover:opacity-80"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  <Plus size={13} /> New Test
                </button>
            )}
          </div>
        </div>
        <AbPricingEngine
            tests={abTests}
            onDeclareWinner={(test, variant) => can('declare_winner') && setWinnerModal({ test, variant })}
            onDeleteTest={test => setDeleteTestTarget(test)}
            canDelete={can('delete_ab_test')}
        />
      </div>

      {/* Modals */}
      {deleteTestTarget && (
        <DeleteAbTestModal
          test={deleteTestTarget}
          onClose={() => setDeleteTestTarget(null)}
          onDeleted={() => {
            setAbTests(prev => prev.filter(t => t.id !== deleteTestTarget.id))
            setDeleteTestTarget(null)
            showToastMsg(`"${deleteTestTarget.name}" deleted`, 'success')
          }}
        />
      )}
      {showCreateTest && (
        <CreateAbTestModal
          onClose={() => setShowCreateTest(false)}
          onCreated={() => { setShowCreateTest(false); loadData(); showToastMsg('A/B test launched', 'success') }}
        />
      )}
      {showCreate && (
        <PromoCodeModal code={null} onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); loadData(); showToastMsg('Promo code created', 'success') }} />
      )}
      {editTarget && (
        <PromoCodeModal code={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); loadData(); showToastMsg('Promo code updated', 'success') }} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal code={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
      {winnerModal && (
        <DeclareWinnerModal test={winnerModal.test} variant={winnerModal.variant} onClose={() => setWinnerModal(null)} onConfirm={handleDeclareWinner} />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

    </div>
  )
}
