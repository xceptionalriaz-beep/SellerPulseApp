'use client'

// app/affiliate/apply/page.tsx
// Clean, developer-crafted affiliate application form — Riazify v2.0

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ChevronDown, CheckCircle2,
  ArrowRight, X, Activity, Search
} from 'lucide-react'
import Link from 'next/link'

// ── Riazify Color Role Tokens (v2.0) ──────────────────────────
const C = {
  primary: '#7530fb',
  primaryHover: '#6020e0',
  primaryLight: '#f3eeff',
  accent: '#b8fa33',
  accentHover: '#a3e635',
  dark: '#1e1535',
  darkHover: '#2d1f4e',
  darkCard: '#271c42',
  border: '#ede9fe',
  borderDark: '#2d1f4e',
  borderInput: '#e5e0f5',
  bg: '#f8f7ff',
  surface: '#ffffff',
  text: '#1f1d2e',
  textDark: '#1e1535',
  muted: '#6b7280',
  textLight: '#a89cc8',
  red: '#dc2626',
}

// ── Platform Options ──────────────────────────────────────────
const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
  { value: 'tiktok', label: 'TikTok', logo: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64' },
  { value: 'instagram', label: 'Instagram', logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
  { value: 'twitter', label: 'Twitter / X', logo: 'https://www.google.com/s2/favicons?domain=x.com&sz=64' },
  { value: 'facebook', label: 'Facebook', logo: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64' },
  { value: 'blog', label: 'Blog / Website', logo: 'https://www.google.com/s2/favicons?domain=wordpress.com&sz=64' },
  { value: 'email', label: 'Email Newsletter', logo: 'https://www.google.com/s2/favicons?domain=mailchimp.com&sz=64' },
  { value: 'other', label: 'Other Channel' },
]

const NICHES = [
  'eBay Selling & Reselling',
  'eCommerce & Online Business',
  'Dropshipping & Sourcing',
  'Product Research & VeRO',
  'Making Money Online',
  'Amazon FBA & Cross-listing',
  'Other',
]

const PAYOUT_METHODS = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank', label: 'Direct Bank Transfer (ACH / Wire / SEPA)' },
  { value: 'crypto', label: 'Crypto (USDT / USDC)' },
]

// ── Countries ─────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'us', name: 'United States' }, { code: 'gb', name: 'United Kingdom' }, { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' }, { code: 'de', name: 'Germany' }, { code: 'fr', name: 'France' },
  { code: 'it', name: 'Italy' }, { code: 'es', name: 'Spain' }, { code: 'nl', name: 'Netherlands' },
  { code: 'br', name: 'Brazil' }, { code: 'in', name: 'India' }, { code: 'sg', name: 'Singapore' },
  { code: 'ae', name: 'United Arab Emirates' }, { code: 'nz', name: 'New Zealand' }, { code: 'ie', name: 'Ireland' },
  { code: 'se', name: 'Sweden' }, { code: 'ch', name: 'Switzerland' }, { code: 'at', name: 'Austria' },
  { code: 'be', name: 'Belgium' }, { code: 'pl', name: 'Poland' }, { code: 'mx', name: 'Mexico' },
  { code: 'za', name: 'South Africa' }, { code: 'jp', name: 'Japan' }, { code: 'ph', name: 'Philippines' },
  { code: 'pk', name: 'Pakistan' }, { code: 'bd', name: 'Bangladesh' }, { code: 'ng', name: 'Nigeria' },
]

function getPaymentPlaceholder(method: string) {
  if (method === 'paypal') return 'PayPal account email address'
  if (method === 'bank') return 'Bank name + Account/IBAN number'
  if (method === 'crypto') return 'USDT / USDC ERC-20 / TRC-20 wallet address'
  return 'Payment details'
}

// ── Developer Clean Input ─────────────────────────────────────
function FormInput({ value, onChange, placeholder, type = 'text', error }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; error?: string
}) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3.5 rounded-lg text-[13.5px] outline-none transition-colors border bg-white"
        style={{
          color: C.textDark,
          borderColor: error ? C.red : C.borderInput,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? C.red : C.borderInput }}
      />
      {error && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{error}</p>}
    </div>
  )
}

// ── Developer Clean Select ────────────────────────────────────
function FormSelect({ value, onChange, options, placeholder, error }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; logo?: string }[]
  placeholder?: string
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(s => !s)}
        className="w-full h-10 px-3.5 rounded-lg text-[13.5px] text-left flex items-center justify-between transition-colors border bg-white cursor-pointer"
        style={{
          color: selected ? C.textDark : C.muted,
          borderColor: error ? C.red : C.borderInput,
        }}>
        <div className="flex items-center gap-2.5 truncate">
          {selected?.logo && (
            <img src={selected.logo} alt="" className="w-4 h-4 rounded-xs object-contain shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <span className="truncate">{selected?.label ?? placeholder ?? 'Select...'}</span>
        </div>
        <ChevronDown size={15} style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border py-1.5 px-1.5 flex flex-col bg-white shadow-lg"
            style={{ borderColor: C.border, maxHeight: 220, overflowY: 'auto' }}>
            {options.map(o => (
              <button key={o.value} type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="w-full px-3 py-2 rounded-lg text-[13px] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: value === o.value ? C.primaryLight : 'transparent',
                  color: value === o.value ? C.primary : C.textDark,
                  fontWeight: value === o.value ? 600 : 400,
                }}>
                {o.logo && (
                  <img src={o.logo} alt="" className="w-4 h-4 rounded-xs object-contain shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{error}</p>}
    </div>
  )
}

// ── Developer Clean Country Select ────────────────────────────
function FormCountrySelect({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = COUNTRIES.find(c => c.name === value)
  const filteredC = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3.5 rounded-lg text-[13.5px] text-left flex items-center justify-between transition-colors border bg-white cursor-pointer"
        style={{
          color: value ? C.textDark : C.muted,
          borderColor: error ? C.red : C.borderInput,
        }}>
        <div className="flex items-center gap-2.5 truncate">
          {selected ? (
            <>
              <img src={`https://flagcdn.com/w20/${selected.code}.png`} alt="" className="w-4 h-auto rounded-xs shrink-0" />
              <span>{selected.name}</span>
            </>
          ) : (
            <span>Select country...</span>
          )}
        </div>
        <ChevronDown size={15} style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch('') }} />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border flex flex-col bg-white shadow-lg"
            style={{ borderColor: C.border, maxHeight: 260, overflow: 'hidden' }}>
            <div className="p-2 border-b" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border"
                style={{ backgroundColor: C.bg, borderColor: C.borderInput }}>
                <Search size={13} style={{ color: C.muted }} />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="flex-1 text-[12.5px] bg-transparent outline-none border-none"
                  style={{ color: C.textDark }}
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-1">
              {filteredC.length === 0 ? (
                <p className="text-center text-[12px] py-3" style={{ color: C.muted }}>No results</p>
              ) : filteredC.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.name); setOpen(false); setSearch('') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: value === c.name ? C.primaryLight : 'transparent',
                    color: value === c.name ? C.primary : C.textDark,
                    fontWeight: value === c.name ? 600 : 400,
                  }}>
                  <img src={`https://flagcdn.com/w20/${c.code}.png`} alt="" className="w-4 h-auto rounded-xs shrink-0" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {error && <p className="text-[11px] mt-1 font-medium" style={{ color: C.red }}>{error}</p>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN APPLICATION PAGE
// ════════════════════════════════════════════════════════════
export default function AffiliateApplyPage() {
  const supabase = createClient()
  const [appSettings, setAppSettings] = useState<{ commission_rate: number; commission_months: number; min_payout: number } | null>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await (supabase.from('affiliate_settings') as any).select('*').limit(1).single()
        if (data) setAppSettings(data)
      } catch (e) {
        console.error(e)
      }
    }
    loadSettings()
  }, [])

  const commRate = appSettings ? (appSettings.commission_rate * 100).toFixed(0) : '25'
  const commMonths = appSettings?.commission_months ?? 12
  const minPayout = appSettings?.min_payout ?? 50

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [platform, setPlatform] = useState('')
  const [platformUrl, setPlatformUrl] = useState('')
  const [contentNiche, setContentNiche] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('paypal')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [message, setMessage] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [accuracyConfirm, setAccuracyConfirm] = useState(false)

  // UI State
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Required'
    if (!email.trim()) e.email = 'Required'
    if (!email.includes('@')) e.email = 'Invalid email'
    if (!country.trim()) e.country = 'Required'
    if (!platform) e.platform = 'Required'
    if (!contentNiche) e.contentNiche = 'Required'
    if (!agreedToTerms) e.agreedToTerms = 'You must agree to continue'
    if (!accuracyConfirm) e.accuracyConfirm = 'Please confirm details'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { error } = await (supabase.from('affiliate_applications') as any).insert([{
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        country: country.trim(),
        platform,
        platform_url: platformUrl.trim() || null,
        content_niche: contentNiche,
        payout_method: payoutMethod,
        payment_details: paymentDetails.trim() || null,
        message: message.trim() || null,
        agreed_to_terms: agreedToTerms,
        status: 'pending',
      }])
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: 'Unable to submit application. Please try again.' })
      console.error(err)
    }
    setSubmitting(false)
  }

  // ── Success State ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }}>
        <div className="w-full max-w-md bg-white rounded-2xl border p-8 text-center shadow-sm" style={{ borderColor: C.border }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: C.primaryLight, borderColor: C.border }}>
            <CheckCircle2 size={24} style={{ color: C.primary }} />
          </div>
          <h1 className="text-[20px] font-bold font-syne mb-2" style={{ color: C.textDark }}>
            Application Submitted
          </h1>
          <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: C.muted }}>
            Thank you for applying to the Riazify Partner Network. Applications are reviewed manually within 24–48 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-lg text-[13.5px] font-bold transition-colors cursor-pointer"
            style={{ backgroundColor: C.dark, color: '#ffffff' }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // ── Main Form Layout ────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: C.bg }}>

      {/* Header Banner */}
      <header className="border-b bg-[#1e1535]" style={{ borderColor: C.borderDark }}>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 text-[11px] font-bold tracking-wide uppercase font-syne"
            style={{ backgroundColor: 'rgba(117,48,251,0.3)', color: C.accent }}>
            <Activity size={13} />
            <span>Affiliate Partner Network</span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-extrabold font-syne text-white tracking-tight">
            Apply to Become a Riazify Partner
          </h1>
          <p className="text-[14px] mt-2 max-w-lg mx-auto" style={{ color: C.textLight }}>
            Earn {commRate}% monthly recurring commission for up to {commMonths} months per subscriber.
          </p>

          {/* Clean Metric Strip */}
          <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-[11px] font-medium" style={{ color: C.textLight }}>Commission</p>
              <p className="text-[16px] font-bold font-syne text-white mt-0.5">{commRate}% Recurring</p>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div>
              <p className="text-[11px] font-medium" style={{ color: C.textLight }}>Cookie Window</p>
              <p className="text-[16px] font-bold font-syne text-white mt-0.5">30 Days</p>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div>
              <p className="text-[11px] font-medium" style={{ color: C.textLight }}>Payout Minimum</p>
              <p className="text-[16px] font-bold font-syne text-white mt-0.5">${minPayout} USD</p>
            </div>
          </div>
        </div>
      </header>

      {/* Single Main Form Card */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 md:p-8 shadow-xs" style={{ borderColor: C.border }}>

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-6 border text-[13px] font-medium"
              style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: C.red }}>
              <X size={15} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Section 1: Contact */}
          <div className="pb-6 border-b" style={{ borderColor: C.border }}>
            <h2 className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>1. Applicant Profile</h2>
            <p className="text-[12.5px] mb-4" style={{ color: C.muted }}>Primary contact information for account onboarding.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Full Name *</label>
                <FormInput value={fullName} onChange={setFullName} placeholder="e.g. Alex Morgan" error={errors.fullName} />
              </div>
              <div>
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Email Address *</label>
                <FormInput value={email} onChange={setEmail} placeholder="alex@domain.com" type="email" error={errors.email} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Country of Residence *</label>
                <FormCountrySelect value={country} onChange={setCountry} error={errors.country} />
              </div>
            </div>
          </div>

          {/* Section 2: Promotional Channels */}
          <div className="py-6 border-b" style={{ borderColor: C.border }}>
            <h2 className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>2. Traffic & Audience</h2>
            <p className="text-[12.5px] mb-4" style={{ color: C.muted }}>Where and how you intend to recommend Riazify.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Primary Channel *</label>
                <FormSelect value={platform} onChange={setPlatform} options={PLATFORMS} placeholder="Select channel..." error={errors.platform} />
              </div>
              <div>
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Audience Niche *</label>
                <FormSelect value={contentNiche} onChange={setContentNiche} options={NICHES.map(n => ({ value: n, label: n }))} placeholder="Select niche..." error={errors.contentNiche} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Channel or Website URL <span className="text-[#8a9e78] font-normal">(optional)</span></label>
                <FormInput value={platformUrl} onChange={setPlatformUrl} placeholder="https://youtube.com/@channel or website" type="url" />
              </div>
            </div>
          </div>

          {/* Section 3: Payout Setup */}
          <div className="py-6 border-b" style={{ borderColor: C.border }}>
            <h2 className="text-[15px] font-bold font-syne mb-1" style={{ color: C.textDark }}>3. Payout Method</h2>
            <p className="text-[12.5px] mb-4" style={{ color: C.muted }}>Preferred method for receiving monthly affiliate earnings.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Disbursement Method *</label>
                <FormSelect value={payoutMethod} onChange={setPayoutMethod} options={PAYOUT_METHODS} />
              </div>
              <div>
                <label className="text-[12px] font-semibold mb-1.5 block" style={{ color: C.textDark }}>Account / Address Details</label>
                <FormInput value={paymentDetails} onChange={setPaymentDetails} placeholder={getPaymentPlaceholder(payoutMethod)} />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="py-6 border-b" style={{ borderColor: C.border }}>
            <label className="text-[14px] font-bold font-syne mb-1 block" style={{ color: C.textDark }}>
              Additional Context <span className="text-[#8a9e78] font-normal text-[12px]">(optional)</span>
            </label>
            <p className="text-[12.5px] mb-3" style={{ color: C.muted }}>Briefly mention your promotional plans or monthly audience size.</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Creator channel with 10k monthly views covering eBay seller tools..."
              className="w-full p-3 rounded-lg text-[13px] outline-none border bg-white transition-colors resize-none"
              style={{ color: C.textDark, borderColor: C.borderInput }}
              onFocus={e => { e.currentTarget.style.borderColor = C.primary }}
              onBlur={e => { e.currentTarget.style.borderColor = C.borderInput }}
            />
          </div>

          {/* Section 5: Terms Checkboxes */}
          <div className="pt-6 pb-2 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7530fb] focus:ring-0 cursor-pointer"
              />
              <span className="text-[12.5px] leading-tight" style={{ color: C.textDark }}>
                I agree to the <strong className="font-semibold">Riazify Partner Agreement</strong> and pledge honest marketing practices without unauthorized spam or bid manipulation. *
              </span>
            </label>
            {errors.agreedToTerms && <p className="text-[11px] font-medium pl-6" style={{ color: C.red }}>{errors.agreedToTerms}</p>}

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={accuracyConfirm}
                onChange={e => setAccuracyConfirm(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#7530fb] focus:ring-0 cursor-pointer"
              />
              <span className="text-[12.5px] leading-tight" style={{ color: C.textDark }}>
                I confirm that all submitted promotional links and identification details are accurate. *
              </span>
            </label>
            {errors.accuracyConfirm && <p className="text-[11px] font-medium pl-6" style={{ color: C.red }}>{errors.accuracyConfirm}</p>}
          </div>

          {/* Submit Action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg text-[14px] font-bold font-syne flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: C.dark, color: C.accent }}
            >
              {submitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <span>Submit Partner Application</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
            <p className="text-center text-[11.5px] mt-3" style={{ color: C.muted }}>
              Reviewed by our partnerships team within 24–48 hours.
            </p>
          </div>

        </form>
      </main>
    </div>
  )
}
