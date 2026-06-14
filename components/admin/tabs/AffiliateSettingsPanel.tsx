'use client'
// components/admin/tabs/AffiliateSettingsPanel.tsx
// Commission settings panel — changes apply everywhere automatically

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Settings, CheckCircle, X } from 'lucide-react'

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
  green:    '#16a34a',
  red:      '#b91c1c',
}

export interface AffiliateSettings {
  id:                 string
  commission_rate:    number
  commission_months:  number
  min_payout:         number
  cookie_days:        number
  is_program_active:  boolean
  default_discount:        number
  default_discount_months: number
  earn_on_discounted:      boolean
  updated_at:         string
  updated_by:         string | null
}

// ── FocusInput ────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder, suffix }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; suffix?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex items-center rounded-xl overflow-hidden"
         style={{
           border:     `1.5px solid ${focused ? C.lime : C.border}`,
           boxShadow:  focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
           transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
           backgroundColor: C.surface,
         }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 h-10 px-3 text-[14px] font-bold outline-none bg-transparent"
        style={{ color: C.text }}
      />
      {suffix && (
        <span className="px-3 text-[13px] font-bold shrink-0"
              style={{ color: C.muted, borderLeft: `1px solid ${C.border}` }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

interface Props {
  onClose:     () => void
  onSaved:     (settings: AffiliateSettings) => void
  settings:    AffiliateSettings | null
}

export default function AffiliateSettingsPanel({ onClose, onSaved, settings: initial }: Props) {
  const supabase = createClient()

  const [rate,       setRate]       = useState(String(Math.round((initial?.commission_rate   ?? 0.25) * 100)))
  const [months,     setMonths]     = useState(String(initial?.commission_months ?? 12))
  const [minPay,     setMinPay]     = useState(String(initial?.min_payout        ?? 50))
  const [cookie,     setCookie]     = useState(String(initial?.cookie_days       ?? 30))
  const [discount,   setDiscount]   = useState(String(initial?.default_discount  ?? 50))
  const [discMonths, setDiscMonths] = useState(String(initial?.default_discount_months ?? 1))
  const [earnOnDisc, setEarnOnDisc] = useState(initial?.earn_on_discounted       ?? true)
  const [active,     setActive]     = useState(initial?.is_program_active        ?? true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  function validate(): boolean {
    const r = Number(rate)
    const m = Number(months)
    const p = Number(minPay)
    const c = Number(cookie)
    const d = Number(discount)
    if (isNaN(r) || r < 1 || r > 100)  { setError('Commission rate must be 1–100%'); return false }
    if (isNaN(m) || m < 1 || m > 24)   { setError('Duration must be 1–24 months'); return false }
    if (isNaN(p) || p < 1)             { setError('Minimum payout must be at least $1'); return false }
    if (isNaN(c) || c < 1 || c > 365)  { setError('Cookie days must be 1–365'); return false }
    const dm = Number(discMonths)
    if (isNaN(d) || d < 0 || d > 100)  { setError('Discount must be 0–100%'); return false }
    if (isNaN(dm) || dm < 1 || dm > 12) { setError('Discount months must be 1–12'); return false }
    return true
  }

  async function save() {
    if (!validate()) return
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        commission_rate:    Number(rate) / 100,
        commission_months:  Number(months),
        min_payout:         Number(minPay),
        cookie_days:        Number(cookie),
        default_discount:        Number(discount),
        default_discount_months: Number(discMonths),
        earn_on_discounted: earnOnDisc,
        is_program_active:  active,
        updated_at:         new Date().toISOString(),
        updated_by:         user?.email ?? 'admin',
      }

      let result
      if (initial?.id) {
        const { data } = await (supabase.from('affiliate_settings') as any)
          .update(payload).eq('id', initial.id).select().single()
        result = data
      } else {
        const { data } = await (supabase.from('affiliate_settings') as any)
          .insert([payload]).select().single()
        result = data
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (result) onSaved(result as AffiliateSettings)
    } catch (e) {
      setError('Failed to save — please try again')
      console.error(e)
    }
    setSaving(false)
  }

  // Preview calculation
  const previewRate = Number(rate) / 100
  const proEarning  = (49 * previewRate).toFixed(2)
  const eliteEarning= (99 * previewRate).toFixed(2)
  const total12Pro  = (49 * previewRate * Number(months)).toFixed(2)

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6"
         style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Keyframes */}
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
          60%  { opacity: 1; transform: scale(1.01) translateY(-2px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes fadeInBg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Popup */}
      <div className="relative flex flex-col w-full"
           style={{
             backgroundColor: C.surface,
             borderRadius:    24,
             maxHeight:       '90vh',
             maxWidth:        820,
             boxShadow:       '0 24px 60px rgba(0,0,0,0.25)',
             animation:       'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
           }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
             style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <Settings size={18} style={{ color: C.muted }} />
            <div>
              <p className="text-[15px] font-bold" style={{ color: C.text }}>
                Commission Settings
              </p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                Changes apply everywhere automatically
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:opacity-70"
            style={{ backgroundColor: C.bg }}>
            <X size={16} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>

            {/* Left — Settings */}
            <div className="flex flex-col gap-5">

              {/* Error */}
              {error && (
                <div className="px-4 py-2.5 rounded-xl"
                     style={{ backgroundColor: '#FEF2F2', border: `1px solid #FECACA` }}>
                  <p className="text-[12px] font-bold" style={{ color: C.red }}>{error}</p>
                </div>
              )}

              {/* Saved */}
              {saved && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                     style={{ backgroundColor: C.limeTint, border: `1px solid ${C.lime}50` }}>
                  <CheckCircle size={14} style={{ color: C.limeDeep }} />
                  <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
                    Settings saved — all pages updated automatically
                  </p>
                </div>
              )}

              {/* Commission rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold" style={{ color: C.muted }}>
                    Commission Rate
                  </p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    Recommended: 20–35%
                  </span>
                </div>
                <FocusInput value={rate} onChange={setRate} placeholder="30" suffix="%" />
                <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                  % of each payment the affiliate earns
                </p>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold" style={{ color: C.muted }}>
                    Commission Duration
                  </p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    Recommended: 12 months
                  </span>
                </div>
                <FocusInput value={months} onChange={setMonths} placeholder="12" suffix="months" />
                <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                  How many months per referred user
                </p>
              </div>

              {/* Min payout */}
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: C.muted }}>
                  Minimum Payout
                </p>
                <FocusInput value={minPay} onChange={setMinPay} placeholder="50" suffix="USD" />
                <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                  Minimum balance needed to request withdrawal
                </p>
              </div>

              {/* Cookie days */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold" style={{ color: C.muted }}>
                    Cookie Duration
                  </p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    Recommended: 30 days
                  </span>
                </div>
                <FocusInput value={cookie} onChange={setCookie} placeholder="30" suffix="days" />
                <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                  How long referral link stays active after a click
                </p>
              </div>

              {/* Default discount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold" style={{ color: C.muted }}>
                    Default Coupon Discount
                  </p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    Applied to all new users
                  </span>
                </div>
                <FocusInput value={discount} onChange={setDiscount} placeholder="20" suffix="% off" />
                <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                  Discount % new users get when using any affiliate link or code
                </p>
              </div>

              {/* Discount duration */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold" style={{ color: C.muted }}>
                    Discount Duration
                  </p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    Recommended: 1 month
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(m => (
                    <button key={m} onClick={() => setDiscMonths(String(m))}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                      style={{
                        backgroundColor: discMonths === String(m) ? C.lime : C.bg,
                        color:           discMonths === String(m) ? C.dark : C.muted,
                        border:          `1.5px solid ${discMonths === String(m) ? C.lime : C.border}`,
                      }}>
                      {m} month{m > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                  How many months the discount applies after trial ends
                </p>
              </div>

              {/* Earn on discounted toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                   style={{ backgroundColor: C.bg }}>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: C.text }}>
                    Earn on discounted price
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {earnOnDisc
                      ? `Affiliate earns ${rate}% of $${(49 * (1 - Number(discount)/100)).toFixed(2)} (discounted)`
                      : `Affiliate earns ${rate}% of $49.00 (full price)`}
                  </p>
                </div>
                <div onClick={() => setEarnOnDisc(v => !v)}
                     className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
                     style={{ backgroundColor: earnOnDisc ? C.lime : C.border }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                       style={{ left: earnOnDisc ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>

              {/* Program active toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                   style={{ backgroundColor: C.bg }}>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: C.text }}>
                    Program Active
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    Disable to pause all affiliate signups
                  </p>
                </div>
                <div onClick={() => setActive(a => !a)}
                     className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
                     style={{ backgroundColor: active ? C.lime : C.border }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                       style={{ left: active ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>

            {/* Right — Live preview */}
            <div className="flex flex-col gap-4">
              <p className="text-[12px] font-bold uppercase tracking-wide"
                 style={{ color: C.muted }}>Live Preview</p>

              {/* Apply page preview */}
              <div className="p-4 rounded-2xl" style={{ backgroundColor: C.dark }}>
                <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Apply page hero
                </p>
                <p className="text-[16px] font-bold mb-2" style={{ color: '#fff' }}>
                  Earn <span style={{ color: C.lime }}>{rate}%</span> Per Referral
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Commission', val: `${rate}%`       },
                    { label: 'Duration',   val: `${months}mo`    },
                    { label: 'Discount',   val: `${discount}% off`},
                  ].map(t => (
                    <div key={t.label} className="p-2 rounded-lg text-center"
                         style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.label}</p>
                      <p className="text-[14px] font-extrabold" style={{ color: C.lime }}>{t.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings preview */}
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <p className="text-[12px] font-bold mb-3" style={{ color: C.text }}>
                  Earnings example <span className="font-normal text-[11px]" style={{ color: C.muted }}>(Pro $49 · Elite $99)</span>
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: C.muted }}>Pro / Elite plan price</span>
                    <span className="text-[12px] font-bold" style={{ color: C.text }}>$49 / $99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      {discount}% off for {discMonths} month{Number(discMonths)>1?'s':''}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: C.red }}>
                      -${(49 * Number(discount) / 100).toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      User pays (discounted month{Number(discMonths)>1?'s':''})
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: C.text }}>
                      ${(49 * (1 - Number(discount)/100)).toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="h-px my-1" style={{ backgroundColor: C.border }} />
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      Affiliate earns ({rate}% of {earnOnDisc ? 'discounted' : 'full'})
                    </span>
                    <span className="text-[13px] font-extrabold" style={{ color: C.limeDeep }}>
                      ${earnOnDisc
                        ? (49 * (1 - Number(discount)/100) * Number(rate)/100).toFixed(2)
                        : (49 * Number(rate)/100).toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      Pro total ({months}mo)
                    </span>
                    <span className="text-[13px] font-extrabold" style={{ color: C.limeDeep }}>
                      ${earnOnDisc
                        ? (49 * (1 - Number(discount)/100) * Number(rate)/100 * Number(months)).toFixed(2)
                        : (49 * Number(rate)/100 * Number(months)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px]" style={{ color: C.muted }}>
                      Elite total ({months}mo)
                    </span>
                    <span className="text-[13px] font-extrabold" style={{ color: C.green }}>
                      ${earnOnDisc
                        ? (99 * (1 - Number(discount)/100) * Number(rate)/100 * Number(months)).toFixed(2)
                        : (99 * Number(rate)/100 * Number(months)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Where it updates */}
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <p className="text-[12px] font-bold mb-2" style={{ color: C.text }}>
                  Updates automatically in:
                </p>
                {[
                  'Affiliate apply page',
                  'User affiliate dashboard',
                  'Admin affiliate center',
                  'Commission calculations',
                  'Payout amounts',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    <CheckCircle size={12} style={{ color: C.green, flexShrink: 0 }} />
                    <p className="text-[12px]" style={{ color: C.muted }}>{item}</p>
                  </div>
                ))}
              </div>

              {initial?.updated_at && (
                <p className="text-[11px] text-center" style={{ color: C.muted }}>
                  Last updated: {new Date(initial.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                  {initial.updated_by ? ` by ${initial.updated_by}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 flex gap-3"
             style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border text-[13px] font-bold transition-all"
            style={{ borderColor: C.border, color: C.muted }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = '#FECACA' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: C.dark, color: C.lime }}>
            {saving
              ? <><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin"
                       style={{ borderTopColor: C.lime }}></div> Saving...</>
              : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}