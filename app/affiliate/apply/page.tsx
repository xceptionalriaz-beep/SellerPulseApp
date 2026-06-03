'use client'
// app/affiliate/apply/page.tsx  OR  components/affiliate/AffiliateApplyPage.tsx
// Public-facing affiliate application form — matches Riazify brand

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Shield, ChevronDown, CheckCircle,
  ArrowRight, X, ExternalLink,
} from 'lucide-react'

// ── Brand tokens ──────────────────────────────────────────────
const C = {
  dark:     '#0a0d08',
  lime:     '#8fff00',
  limeDeep: '#4a8f00',
  limeMid:  '#6bcc00',
  limeTint: '#f4ffe6',
  border:   '#e8ede2',
  bg:       '#f7f9f5',
  text:     '#1a2410',
  muted:    '#8a9e78',
  surface:  '#ffffff',
  red:      '#b91c1c',
}

// ── Platform options with Google favicon logos ────────────────
const PLATFORMS = [
  { value: 'youtube',   label: 'YouTube',     logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64'   },
  { value: 'tiktok',    label: 'TikTok',      logo: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64'    },
  { value: 'instagram', label: 'Instagram',   logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
  { value: 'twitter',   label: 'Twitter / X', logo: 'https://www.google.com/s2/favicons?domain=x.com&sz=64'         },
  { value: 'facebook',  label: 'Facebook',    logo: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64'  },
  { value: 'blog',      label: 'Blog / Website', logo: 'https://www.google.com/s2/favicons?domain=wordpress.com&sz=64' },
  { value: 'email',     label: 'Email Newsletter', logo: 'https://www.google.com/s2/favicons?domain=mailchimp.com&sz=64' },
  { value: 'other',     label: 'Other'        },
]

const NICHES = [
  'eBay Selling & Reselling',
  'eCommerce & Online Business',
  'Dropshipping',
  'Product Research',
  'Making Money Online',
  'Amazon FBA',
  'Other',
]

const PAYOUT_METHODS = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank',   label: 'Bank Transfer' },
  { value: 'crypto', label: 'Crypto' },
]

// ── Helpers ───────────────────────────────────────────────────
function getPaymentPlaceholder(method: string) {
  if (method === 'paypal') return 'Your PayPal email address'
  if (method === 'bank')   return 'Bank name + account number (e.g. Chase — 123456789)'
  if (method === 'crypto') return 'Wallet address (e.g. 0x1a2b3c...)'
  return 'Payment details'
}

// ── FocusInput ────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder, type = 'text', className = '' }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; className?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className={`w-full h-11 px-4 rounded-xl text-[14px] ${className}`}
      style={{
        backgroundColor: C.surface,
        color:           C.text,
        outline:         'none',
        border:          `1.5px solid ${focused ? C.lime : C.border}`,
        boxShadow:       focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
        transition:      'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    />
  )
}

// ── Custom Select ─────────────────────────────────────────────
function FocusSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; logo?: string }[]
  placeholder?: string
}) {
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(s => !s); setFocused(true) }}
        onBlur={() => setFocused(false)}
        className="w-full h-11 px-4 rounded-xl text-[14px] text-left flex items-center justify-between"
        style={{
          backgroundColor: C.surface,
          color:           selected ? C.text : C.muted,
          outline:         'none',
          border:          `1.5px solid ${open || focused ? C.lime : C.border}`,
          boxShadow:       open || focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
          transition:      'border-color 0.2s ease, box-shadow 0.2s ease',
        }}>
        <div className="flex items-center gap-2.5">
          {selected?.logo && (
            <img src={selected.logo} alt="" className="w-5 h-5 rounded object-contain"
                 onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <span>{selected?.label ?? placeholder ?? 'Select...'}</span>
        </div>
        <ChevronDown size={16} style={{
          color:     C.muted,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setFocused(false) }} />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border py-2 px-2 flex flex-col gap-1"
               style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto' }}>
            {options.map(o => (
              <button key={o.value} type="button"
                onClick={() => { onChange(o.value); setOpen(false); setFocused(false) }}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold text-left flex items-center gap-2.5 transition-all"
                style={{
                  backgroundColor: value === o.value ? C.lime : 'transparent',
                  color:           value === o.value ? C.dark : C.text,
                }}>
                {o.logo && (
                  <img src={o.logo} alt="" className="w-5 h-5 rounded object-contain shrink-0"
                       onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
           style={{ backgroundColor: C.lime, color: C.dark }}>
        {num}
      </div>
      <div>
        <p className="text-[14px] font-bold" style={{ color: C.text }}>{title}</p>
        {subtitle && <p className="text-[11px]" style={{ color: C.muted }}>{subtitle}</p>}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function AffiliateApplyPage() {
  const supabase = createClient()
  const [appSettings, setAppSettings] = useState<{commission_rate:number;commission_months:number;min_payout:number} | null>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await (supabase.from('affiliate_settings') as any)
          .select('*').limit(1).single()
        if (data) setAppSettings(data)
      } catch (e) { console.error(e) }
    }
    loadSettings()
  }, [])

  const commRate   = appSettings ? (appSettings.commission_rate * 100).toFixed(0) : '30'
  const commMonths = appSettings?.commission_months ?? 12
  const minPayout  = appSettings?.min_payout ?? 50

  // Form state
  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [country,         setCountry]         = useState('')
  const [platform,        setPlatform]        = useState('')
  const [platformUrl,     setPlatformUrl]     = useState('')
  const [contentNiche,    setContentNiche]    = useState('')
  const [agreedToTerms,   setAgreedToTerms]   = useState(false)
  const [accuracyConfirm, setAccuracyConfirm] = useState(false)
  const [message,         setMessage]         = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [errors,     setErrors]     = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim())       e.fullName       = 'Full name is required'
    if (!email.trim())          e.email          = 'Email is required'
    if (!email.includes('@'))   e.email          = 'Enter a valid email'
    if (!country.trim())        e.country        = 'Country is required'
    if (!platform)              e.platform       = 'Select your primary platform'
    // platformUrl is optional — not required
    if (!contentNiche)          e.contentNiche   = 'Select your content niche'
    if (!agreedToTerms)         e.agreedToTerms  = 'You must agree to the terms'
    if (!accuracyConfirm)       e.accuracyConfirm= 'Please confirm accuracy'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { error } = await (supabase.from('affiliate_applications') as any).insert([{
        full_name:       fullName.trim(),
        email:           email.trim().toLowerCase(),
        country:         country.trim(),
        platform,
        platform_url:    platformUrl.trim(),
        content_niche:   contentNiche,
        agreed_to_terms: agreedToTerms,
        status:          'pending',
        message:         message.trim() || null,
      }])
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' })
      console.error(err)
    }
    setSubmitting(false)
  }

  // ── Success screen ──────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ backgroundColor: C.bg }}>
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
             style={{ backgroundColor: C.lime }}>
          <CheckCircle size={40} style={{ color: C.dark }} />
        </div>
        <h1 className="text-[28px] font-extrabold mb-3" style={{ color: C.text }}>
          Application Submitted! 🎉
        </h1>
        <p className="text-[15px] mb-6" style={{ color: C.muted }}>
          Thanks for applying to the Riazify Affiliate Program.
          We'll review your application and get back to you within
          <strong style={{ color: C.text }}> 2–3 business days</strong>.
        </p>
        <div className="p-4 rounded-2xl border mb-6"
             style={{ backgroundColor: C.limeTint, borderColor: C.lime+'50' }}>
          <p className="text-[13px] font-bold mb-1" style={{ color: C.limeDeep }}>
            What happens next?
          </p>
          <div className="flex flex-col gap-2 text-left mt-2">
            {[
              'We review your application',
              'We check your platform & content',
              'You get an email with our decision',
              'If approved — your referral code arrives!',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                     style={{ backgroundColor: C.lime, color: C.dark }}>{i+1}</div>
                <p className="text-[12px]" style={{ color: C.text }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
        <a href="/"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90"
          style={{ backgroundColor: C.dark, color: C.lime }}>
          Back to Riazify
        </a>
      </div>
    </div>
  )

  // ── Main form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>

      {/* Hero header */}
      <div style={{ backgroundColor: C.dark }}>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={24} style={{ color: C.lime }} />
            <span className="text-[13px] font-bold tracking-widest uppercase"
                  style={{ color: C.lime }}>Riazify Affiliate Program</span>
          </div>
          <h1 className="text-[36px] font-extrabold mb-3 leading-tight"
              style={{ color: '#fff' }}>
            Earn <span style={{ color: C.lime }}>{commRate}%</span> Per Referral
          </h1>
          <p className="text-[15px] mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Join our affiliate program and earn 30% recurring commission on every
            user you bring to Riazify. No minimum audience required.
          </p>

          {/* Commission model */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {[
              { label: 'Commission', val: `${commRate}%`,        sub: 'flat for everyone'  },
              { label: 'Duration',   val: `${commMonths} months`, sub: 'per referred user' },
              { label: 'Min. payout',val: `$${minPayout}`, sub: 'to request withdrawal' },
            ].map(t => (
              <div key={t.label} className="p-3 rounded-xl"
                   style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.label}</p>
                <p className="text-[20px] font-extrabold" style={{ color: C.lime }}>{t.val}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Submit error */}
          {errors.submit && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                 style={{ backgroundColor: '#FEF2F2', border: `1px solid #FECACA` }}>
              <X size={16} style={{ color: C.red }} />
              <p className="text-[13px] font-bold" style={{ color: C.red }}>{errors.submit}</p>
            </div>
          )}

          {/* ── Section 1: Personal Info ── */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <SectionLabel num="1" title="Personal Information" subtitle="Tell us about yourself" />
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold mb-1.5 block" style={{ color: C.muted }}>
                  Full Name *
                </label>
                <FocusInput value={fullName} onChange={setFullName} placeholder="Your full name" />
                {errors.fullName && <p className="text-[11px] mt-1" style={{ color: C.red }}>{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block" style={{ color: C.muted }}>
                  Email Address *
                </label>
                <FocusInput value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
                {errors.email && <p className="text-[11px] mt-1" style={{ color: C.red }}>{errors.email}</p>}
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block" style={{ color: C.muted }}>
                  Country *
                </label>
                <FocusInput value={country} onChange={setCountry} placeholder="e.g. United States, United Kingdom, Canada..." />
                {errors.country && <p className="text-[11px] mt-1" style={{ color: C.red }}>{errors.country}</p>}
              </div>
</div>
          </div>

          {/* ── Section 2: Platform Info ── */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <SectionLabel num="2" title="Your Platform" subtitle="How will you promote Riazify? (optional)" />
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold mb-1.5 block" style={{ color: C.muted }}>
                  Primary Platform *
                </label>
                <FocusSelect
                  value={platform}
                  onChange={setPlatform}
                  options={PLATFORMS}
                  placeholder="Select your platform..."
                />
                {errors.platform && <p className="text-[11px] mt-1" style={{ color: C.red }}>{errors.platform}</p>}
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block" style={{ color: C.muted }}>
                  Profile / Channel URL (optional)
                </label>
                <FocusInput
                  value={platformUrl}
                  onChange={setPlatformUrl}
                  placeholder="https://youtube.com/c/yourchannel (optional)"
                  type="url"
                />
                {errors.platformUrl && <p className="text-[11px] mt-1" style={{ color: C.red }}>{errors.platformUrl}</p>}
              </div>
              <div>
                <label className="text-[12px] font-bold mb-1.5 block" style={{ color: C.muted }}>
                  Content Niche *
                </label>
                <FocusSelect
                  value={contentNiche}
                  onChange={setContentNiche}
                  options={NICHES.map(n => ({ value: n, label: n }))}
                  placeholder="Select your niche..."
                />
                {errors.contentNiche && <p className="text-[11px] mt-1" style={{ color: C.red }}>{errors.contentNiche}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 4: Message ── */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <SectionLabel num="3" title="Message to Admin" subtitle="Optional — tell us anything you'd like us to know" />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. I've been selling on eBay for 5 years and have an active community. I'd love to promote Riazify to my audience..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-[14px] resize-none outline-none"
              style={{
                border:          `1.5px solid ${C.border}`,
                color:           C.text,
                backgroundColor: C.bg,
                transition:      'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = C.lime
                e.target.style.boxShadow   = '0 0 0 3px rgba(143,255,0,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = C.border
                e.target.style.boxShadow   = 'none'
              }}
            />
            <p className="text-[11px] mt-1.5" style={{ color: C.muted }}>
              This message is only visible to Riazify admins during review.
            </p>
          </div>

          {/* ── Section 5: Agreement ── */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <SectionLabel num="4" title="Agreement" subtitle="Please read and agree to our terms" />
            <div className="flex flex-col gap-3">

              {/* Terms */}
              <div className="p-4 rounded-xl text-[12px] leading-relaxed mb-1"
                   style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted, maxHeight: 120, overflowY: 'auto' }}>
                <p className="font-bold mb-2" style={{ color: C.text }}>Riazify Affiliate Program Terms</p>
                <p>• You will promote Riazify honestly and accurately.</p>
                <p>• You will not use spam, misleading content, or false claims.</p>
                <p>• You will not promote competitor tools alongside Riazify.</p>
                <p>• {commRate}% commission is earned on every valid payment for {commMonths} months per referred user.</p>
                <p>• Riazify reserves the right to terminate the program at any time.</p>
                <p>• Payouts are processed monthly with a ${minPayout} minimum threshold.</p>
                <p>• Self-referrals are strictly prohibited and will result in account termination.</p>
                <p>• Fraudulent traffic or click manipulation will result in immediate ban.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" className="sr-only"
                         checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} />
                  <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                       style={{
                         backgroundColor: agreedToTerms ? C.lime : C.surface,
                         border:          `2px solid ${agreedToTerms ? C.lime : C.border}`,
                       }}>
                    {agreedToTerms && <CheckCircle size={12} style={{ color: C.dark }} />}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: C.text }}>
                    I agree to the Riazify Affiliate Program Terms & Conditions *
                  </p>
                  {errors.agreedToTerms && <p className="text-[11px] mt-0.5" style={{ color: C.red }}>{errors.agreedToTerms}</p>}
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" className="sr-only"
                         checked={accuracyConfirm} onChange={e => setAccuracyConfirm(e.target.checked)} />
                  <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                       style={{
                         backgroundColor: accuracyConfirm ? C.lime : C.surface,
                         border:          `2px solid ${accuracyConfirm ? C.lime : C.border}`,
                       }}>
                    {accuracyConfirm && <CheckCircle size={12} style={{ color: C.dark }} />}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: C.text }}>
                    I confirm that all information provided is accurate and truthful *
                  </p>
                  {errors.accuracyConfirm && <p className="text-[11px] mt-0.5" style={{ color: C.red }}>{errors.accuracyConfirm}</p>}
                </div>
              </label>
            </div>
          </div>

          {/* Submit button */}
          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: submitting ? C.muted : C.dark, color: C.lime }}>
            {submitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-transparent animate-spin"
                     style={{ borderTopColor: C.lime }} />
                Submitting Application...
              </>
            ) : (
              <>
                Submit Application
                <ArrowRight size={18} style={{ color: C.lime }} />
              </>
            )}
          </button>

          <p className="text-center text-[12px]" style={{ color: C.muted }}>
            We review all applications within 2–3 business days.
            You'll receive an email with our decision.
          </p>

        </form>
      </div>
    </div>
  )
}