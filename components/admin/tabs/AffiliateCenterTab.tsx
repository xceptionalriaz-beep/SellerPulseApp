'use client'
// components/admin/tabs/AffiliateCenterTab.tsx
// Full rebuild with real Supabase data

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Link, Download, Plus, Search,
  CheckCircle, RefreshCw, MoreVertical,
  X, ChevronDown, AlertTriangle,
  ClipboardList, Settings, Tag, Clock,
  Filter, DollarSign, TrendingUp,
  Mail, MessageCircle,
} from 'lucide-react'
import AffiliateApplicationsPanel, { Application } from '@/components/admin/tabs/AffiliateApplicationsPanel'
import AffiliateSettingsPanel, { AffiliateSettings } from '@/components/admin/tabs/AffiliateSettingsPanel'

// ── Brand colors ──────────────────────────────────────────────
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
  orange:   '#b45309',
  red:      '#b91c1c',
}

interface Affiliate {
  id:                string
  name:              string
  email:             string | null
  code:              string
  clicks:            number
  signups:           number
  mrr:               number
  payout:            number
  tier:              string | null
  status:            string | null
  payout_status:     string | null
  paid_at:           string | null
  payout_method:     string | null
  payment_details:   string | null
  custom_commission: number | null
  discount_percent:  number | null
  discount_months:   number | null
  notes:             string | null
  traffic_source:    string | null
  country:           string | null
  created_at:        string
}

interface Payout {
  id:             string
  affiliate_id:   string
  amount:         number
  status:         string
  paid_at:        string | null
  payment_method: string | null
  notes:          string | null
  created_at:     string
  affiliateName?: string
}

interface Withdrawal {
  id:               string
  affiliate_id:     string
  amount:           number
  status:           string
  payment_method:   string
  payment_details:  string | null
  requested_at:     string
  reviewed_at:      string | null
  paid_at:          string | null
  rejection_reason: string | null
  admin_notes:      string | null
  created_at:       string
  affiliateName?:   string
  affiliateEmail?:  string
}

interface Props { isInvestorMode?: boolean; isMobile?: boolean }

// ── Helpers ───────────────────────────────────────────────────
// ── Flat 30% recurring 12-month model ────────────────────────
const COMMISSION_RATE   = 0.25  // 25% flat — overridden by affiliate_settings DB
const COMMISSION_MONTHS = 12    // 12 months — overridden by affiliate_settings DB

function calcPayout(mrr: number, custom?: number | null): number {
  const rate = custom != null ? custom : COMMISSION_RATE
  return Math.round(mrr * rate * 100) / 100
}

function convRate(clicks: number, signups: number): string {
  if (!clicks) return '0%'
  return `${((signups / clicks) * 100).toFixed(1)}%`
}

function formatMethod(method: string): string {
  if (method === 'paypal') return 'PayPal'
  if (method === 'bank')   return 'Bank Transfer'
  if (method === 'crypto') return 'Crypto'
  return method.charAt(0).toUpperCase() + method.slice(1)
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function obscure(text: string, mode: boolean): string {
  if (!mode || !text) return text
  return `${text[0]}***`
}

// ── FocusInput ────────────────────────────────────────────────
function FocusInput({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void
  placeholder?: string; className?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className={`h-10 px-3 rounded-xl text-[13px] ${className ?? ''}`}
      style={{
        backgroundColor: C.bg, color: C.text, outline: 'none',
        border:     `1.5px solid ${focused ? C.lime : C.border}`,
        boxShadow:  focused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }} />
  )
}

// ── Custom PillDropdown — matches brand design ────────────────
function PillDropdown({ value, options, onChange, className }: {
  value: string
  options: { value: string; label: string; logo?: string }[]
  onChange: (v: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <div className={`relative ${className ?? ''}`}>
      <button onClick={() => setOpen(s => !s)}
        className="w-full flex items-center justify-between h-10 px-3 rounded-xl text-[13px] font-semibold transition-all"
        style={{
          backgroundColor: C.bg,
          border:     `1.5px solid ${open ? C.lime : C.border}`,
          boxShadow:  open ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none',
          color:      C.text,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}>
        <div className="flex items-center gap-2">
          {selected?.logo && (
            <img src={selected.logo} alt="" className="w-5 h-5 rounded object-contain"
                 onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <span>{selected?.label ?? 'Select...'}</span>
        </div>
        <ChevronDown size={14} style={{
          color:      C.muted,
          transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border py-2 px-2 flex flex-col gap-1"
               style={{
                 backgroundColor: '#fff',
                 borderColor:     C.border,
                 boxShadow:       '0 8px 24px rgba(0,0,0,0.10)',
                 maxHeight:       240,
                 overflowY:       'auto',
               }}>
            {options.map(o => {
              const isSelected = o.value === value
              return (
                <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                  className="w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-left transition-all flex items-center gap-2.5"
                  style={{
                    backgroundColor: isSelected ? C.lime : 'transparent',
                    color:           isSelected ? C.dark : C.text,
                  }}>
                  {o.logo && (
                    <img src={o.logo} alt="" className="w-5 h-5 rounded object-contain shrink-0"
                         onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  {o.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}


function AddAffiliateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const supabase = createClient()
  const [name,           setName]           = useState('')
  const [email,          setEmail]          = useState('')
  const [code,           setCode]           = useState('')
  const [method,         setMethod]         = useState('paypal')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [customRate,     setCustomRate]     = useState('')
  const [trafficSource,  setTrafficSource]  = useState('')
  const [country,        setCountry]        = useState('')
  const [status,         setStatus]         = useState('active')
  const [notes,          setNotes]          = useState('')
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState('')
  const [visible,        setVisible]        = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  // Payment details placeholder based on method
  function getPaymentPlaceholder() {
    if (method === 'paypal') return 'PayPal email (e.g. affiliate@paypal.com)'
    if (method === 'bank')   return 'Bank name + account number (e.g. Chase — 1234567890)'
    if (method === 'crypto') return 'Wallet address (e.g. 0x1a2b3c...)'
    return 'Payment details'
  }

  // Auto-generate referral code from name
  function generateCode() {
    if (!name.trim()) { setError('Enter a name first to generate a code'); return }
    const prefix = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    const suffix = Math.floor(1000 + Math.random() * 9000)
    setCode(`${prefix}${suffix}`)
    setError('')
  }

  async function save() {
    if (!name.trim())   { setError('Full name is required'); return }
    if (!code.trim())   { setError('Referral code is required'); return }
    if (customRate && (isNaN(Number(customRate)) || Number(customRate) < 1 || Number(customRate) > 100)) {
      setError('Custom commission must be between 1–100%'); return
    }
    setSaving(true); setError('')
    try {
      const { error: err } = await (supabase.from('affiliates') as any).insert([{
        name:              name.trim(),
        email:             email.trim()          || null,
        code:              code.trim().toUpperCase(),
        clicks:            0,
        signups:           0,
        mrr:               0,
        payout:            0,
        tier:              'Bronze',
        status,
        payout_status:     'pending',
        payout_method:     method,
        payment_details:   paymentDetails.trim() || null,
        custom_commission: customRate ? Number(customRate) / 100 : null,
        traffic_source:    trafficSource.trim()  || null,
        country:           country.trim()        || null,
        notes:             notes.trim()          || null,
      }])
      if (err?.code === '23505') { setError('This referral code already exists!'); setSaving(false); return }
      if (err) { setError('Failed to save — please try again'); setSaving(false); return }
      onCreated(); onClose()
    } catch (e) { setError('Failed to save'); console.error(e) }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{
           backgroundColor: `rgba(0,0,0,${visible ? 0.4 : 0})`,
           transition: 'background-color 0.22s ease',
         }}
         onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="bg-white rounded-2xl border w-full max-w-md"
           style={{
             borderColor:  C.border,
             overflow:     'hidden',
             transform:    visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
             opacity:      visible ? 1 : 0,
             transition:   'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease',
           }}>
        <div className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[16px] font-bold" style={{ color: C.text }}>Add New Affiliate</p>
            <button onClick={handleClose}><X size={18} style={{ color: C.muted }} /></button>
          </div>

          <div className="flex flex-col gap-3">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                   style={{ backgroundColor: '#FEF2F2', border: `1px solid #FECACA` }}>
                <p className="text-[12px] font-bold" style={{ color: C.red }}>{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Full Name *</p>
              <FocusInput value={name} onChange={setName} placeholder="e.g. Tech Hustler" className="w-full" />
            </div>

            {/* Email */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Email</p>
              <FocusInput value={email} onChange={setEmail} placeholder="affiliate@email.com" className="w-full" />
            </div>

            {/* Referral Code + Auto-generate */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Referral Code *</p>
              <div className="flex gap-2">
                <FocusInput
                  value={code}
                  onChange={v => setCode(v.toUpperCase())}
                  placeholder="e.g. TECH20"
                  className="flex-1"
                />
                <button onClick={generateCode}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all hover:opacity-80"
                  style={{ backgroundColor: C.dark, color: C.lime, whiteSpace: 'nowrap' }}>
                  Generate
                </button>
              </div>
            </div>

            {/* Payout Method + Payment Details */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Payout Method</p>
              <PillDropdown
                value={method}
                onChange={v => { setMethod(v); setPaymentDetails('') }}
                options={[
                  { value: 'paypal', label: 'PayPal'        },
                  { value: 'bank',   label: 'Bank Transfer' },
                  { value: 'crypto', label: 'Crypto'        },
                ]}
              />
            </div>

            {/* Payment Details — dynamic based on method */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold" style={{ color: C.muted }}>Payment Details</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                  {method === 'paypal' ? 'PayPal' : method === 'bank' ? 'Bank' : 'Crypto'}
                </span>
              </div>
              <FocusInput
                value={paymentDetails}
                onChange={setPaymentDetails}
                placeholder={getPaymentPlaceholder()}
                className="w-full"
              />
            </div>

            {/* Traffic Source */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Traffic Source</p>
              <PillDropdown
                value={trafficSource || 'none'}
                onChange={v => setTrafficSource(v === 'none' ? '' : v)}
                options={[
                  { value: 'none',      label: 'Not specified'   },
                  { value: 'youtube',   label: 'YouTube',    logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64'   },
                  { value: 'tiktok',    label: 'TikTok',     logo: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=64'    },
                  { value: 'instagram', label: 'Instagram',  logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=64' },
                  { value: 'twitter',   label: 'Twitter / X',logo: 'https://www.google.com/s2/favicons?domain=x.com&sz=64'         },
                  { value: 'facebook',  label: 'Facebook',   logo: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=64'  },
                  { value: 'blog',      label: 'Blog / Website', logo: 'https://www.google.com/s2/favicons?domain=wordpress.com&sz=64' },
                  { value: 'email',     label: 'Email List', logo: 'https://www.google.com/s2/favicons?domain=mailchimp.com&sz=64' },
                  { value: 'other',     label: 'Other'       },
                ]}
              />
            </div>

            {/* Country */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Country</p>
              <FocusInput
                value={country}
                onChange={setCountry}
                placeholder="e.g. United States, UK, Canada..."
                className="w-full"
              />
            </div>

            {/* Initial Status */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Initial Status</p>
              <PillDropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'active',   label: 'Active — ready to earn'           },
                  { value: 'pending',  label: 'Pending — needs review first'     },
                  { value: 'inactive', label: 'Inactive — not earning yet'         },
                ]}
              />
            </div>

            {/* Custom Commission */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold" style={{ color: C.muted }}>Custom Commission</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                  VIP only — optional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FocusInput
                  value={customRate}
                  onChange={v => setCustomRate(v.replace(/[^0-9.]/g, ''))}
                  placeholder="Leave blank for tier rate (15/25/40%)"
                  className="flex-1"
                />
                {customRate && (
                  <span className="text-[13px] font-bold px-3 py-2 rounded-xl shrink-0"
                        style={{ backgroundColor: C.limeTint, color: C.limeDeep }}>
                    {customRate}%
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Admin Notes</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Met at eBay conference, YouTube creator with 50K subs..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-[13px] resize-none outline-none"
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
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-2">
              <button onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold transition-all"
                style={{ borderColor: C.border, color: C.muted, backgroundColor: '#fff' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#FEF2F2'
                  e.currentTarget.style.color           = C.red
                  e.currentTarget.style.borderColor     = '#FECACA'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fff'
                  e.currentTarget.style.color           = C.muted
                  e.currentTarget.style.borderColor     = C.border
                }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: C.dark, color: C.lime }}>
                {saving
                  ? <span className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin"
                           style={{ borderTopColor: C.lime }} />
                      Saving...
                    </span>
                  : 'Add Affiliate'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Generate Link Dialog ──────────────────────────────────────
function GenerateLinkDialog({ affiliates, onClose }: { affiliates: Affiliate[]; onClose: () => void }) {
  const [selected,      setSelected]      = useState(affiliates[0]?.id ?? '')
  const [copiedLink,    setCopiedLink]    = useState(false)
  const [copiedCoupon,  setCopiedCoupon]  = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [visible,       setVisible]       = useState(false)
  const [hoverClose,    setHoverClose]    = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  const filtered = affiliates.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const aff    = affiliates.find(a => a.id === selected)
  const link   = aff ? `https://riazify.com?ref=${aff.code}` : ''
  const coupon = aff?.code ?? ''

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000)
  }

  function copyCoupon() {
    navigator.clipboard.writeText(coupon)
    setCopiedCoupon(true); setTimeout(() => setCopiedCoupon(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
         style={{
           backgroundColor: `rgba(0,0,0,${visible ? 0.4 : 0})`,
           transition: 'background-color 0.22s ease',
         }}
         onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="bg-white rounded-2xl border overflow-hidden w-full max-w-md"
           style={{
             borderColor: C.border,
             transform:   visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
             opacity:     visible ? 1 : 0,
             transition:  'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease',
           }}>
        <div className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-[16px] font-bold" style={{ color: C.text }}>Share Affiliate Details</p>
            <button onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
              style={{ backgroundColor: hoverClose ? '#FEF2F2' : 'transparent', color: hoverClose ? C.red : C.muted }}
              onMouseEnter={() => setHoverClose(true)}
              onMouseLeave={() => setHoverClose(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4">

            {/* Searchable Affiliate Picker */}
            <div>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: C.muted }}>Select Affiliate</p>
              <div className="relative">

                {/* Search input */}
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl"
                     style={{ border: `1.5px solid ${dropdownOpen ? C.lime : C.border}`, backgroundColor: C.bg, boxShadow: dropdownOpen ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none' }}>
                  <Search size={14} style={{ color: C.muted, flexShrink: 0 }} />
                  <input
                    value={dropdownOpen ? searchQuery : (aff?.name ?? '')}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => { setDropdownOpen(true); setSearchQuery('') }}
                    placeholder="Search affiliates..."
                    className="flex-1 text-[13px] bg-transparent"
                    style={{ color: C.text, outline: 'none', border: 'none' }}
                  />
                  <ChevronDown size={14} style={{ color: C.muted, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                </div>

                {/* Dropdown list */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => { setDropdownOpen(false); setSearchQuery('') }} />
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border py-1.5 flex flex-col"
                         style={{ backgroundColor: '#fff', borderColor: C.border, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto' }}>
                      {filtered.length === 0 ? (
                        <p className="text-[12px] text-center py-4" style={{ color: C.muted }}>No affiliates found</p>
                      ) : filtered.map(a => (
                        <button key={a.id}
                          onClick={() => { setSelected(a.id); setDropdownOpen(false); setSearchQuery('') }}
                          className="flex items-center justify-between px-3 py-2 mx-1.5 rounded-xl hover:opacity-80 transition-all text-left"
                          style={{ backgroundColor: selected === a.id ? C.limeTint : 'transparent' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                 style={{ backgroundColor: C.dark, color: C.lime }}>
                              {a.name.charAt(0)}
                            </div>
                            <span className="text-[13px] font-semibold" style={{ color: C.text }}>{a.name}</span>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'monospace' }}>
                            {a.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {aff && (<>

              {/* Referral Link */}
              <div className="p-3 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold" style={{ color: C.muted }}>Referral Link</p>
                  <button onClick={copyLink}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all"
                    style={{ backgroundColor: copiedLink ? C.limeTint : 'transparent', color: copiedLink ? C.limeDeep : C.muted }}>
                    {copiedLink ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[12px] break-all" style={{ color: C.text }}>{link}</p>
              </div>

              {/* Coupon Code */}
              <div className="p-3 rounded-xl border" style={{ backgroundColor: C.limeTint, borderColor: `${C.lime}80` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold" style={{ color: C.limeDeep }}>Coupon Code</p>
                  <button onClick={copyCoupon}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all"
                    style={{ backgroundColor: copiedCoupon ? C.limeDeep : 'transparent', color: copiedCoupon ? '#fff' : C.limeDeep }}>
                    {copiedCoupon ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[20px] font-extrabold tracking-widest" style={{ color: C.limeDeep, fontFamily: 'monospace' }}>
                    {coupon}
                  </p>
                  <div className="text-right">
                    <p className="text-[11px] font-bold" style={{ color: C.limeDeep }}>
                      {aff.discount_percent ?? 30}% OFF
                    </p>
                    <p className="text-[10px]" style={{ color: C.muted }}>
                      for {aff.discount_months ?? 2} month{(aff.discount_months ?? 2) > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Message */}
              <div className="p-3 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold" style={{ color: C.muted }}>Ready-to-Share Message</p>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`Use code ${coupon} to get ${aff.discount_percent ?? 30}% off for ${aff.discount_months ?? 2} month${(aff.discount_months ?? 2) > 1 ? 's' : ''} on Riazify → ${link}`)
                    setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000)
                  }}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all"
                    style={{ backgroundColor: copiedLink ? C.limeTint : 'transparent', color: copiedLink ? C.limeDeep : C.muted }}>
                    {copiedLink ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: C.text }}>
                  Use code <span className="font-bold" style={{ color: C.limeDeep }}>{coupon}</span> to get <span className="font-bold">{aff.discount_percent ?? 30}% off</span> for {aff.discount_months ?? 2} month{(aff.discount_months ?? 2) > 1 ? 's' : ''} on Riazify → <span style={{ color: C.limeDeep }}>{link}</span>
                </p>
              </div>

              {/* Share buttons */}
              <div className="flex gap-2">
                <a href={`mailto:?subject=Special offer for you&body=Use code ${coupon} to get ${aff.discount_percent ?? 30}%25 off for ${aff.discount_months ?? 2} months on Riazify → ${link}`}
                   target="_blank" rel="noreferrer"
                   className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all hover:opacity-80"
                   style={{ borderColor: C.border, color: C.muted }}>
                  <Mail size={14} /> Email
                </a>
                <a href={`https://wa.me/?text=Use code ${coupon} to get ${aff.discount_percent ?? 30}%25 off for ${aff.discount_months ?? 2} months on Riazify → ${link}`}
                   target="_blank" rel="noreferrer"
                   className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all hover:opacity-80"
                   style={{ borderColor: '#25D366', color: '#25D366', backgroundColor: '#F0FDF4' }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>

            </>)}

          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

// Payout Line Chart using Chart.js
function PayoutLineChart({ payouts }: { payouts: Payout[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || payouts.length === 0) return

    const list   = payouts.slice(0, 8)
    const labels = list.map((p: Payout) =>
      new Date(p.paid_at ?? p.created_at)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )
    const data = list.map((p: Payout) => p.amount)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chartInstance: any = null

    import('chart.js').then(({ Chart, registerables }) => {
      if (!canvasRef.current) return
      Chart.register(...registerables)

      // Destroy any existing chart on this canvas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = (Chart as any).getChart(canvasRef.current)
      if (existing) existing.destroy()

      chartInstance = new Chart(canvasRef.current, {
        type: 'line' as const,
        data: {
          labels,
          datasets: [{
            label: 'Payout',
            data,
            borderColor: '#3B6D11',
            backgroundColor: 'rgba(59,109,17,0.08)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3B6D11',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { left: 4, right: 16, top: 8, bottom: 0 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label: (ctx: any) => '$' + ctx.parsed.y.toLocaleString(),
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                font: { size: 10 } as any,
                color: '#8a9e78',
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6,
              },
            },
            y: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              grid: { color: 'rgba(0,0,0,0.05)' } as any,
              ticks: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                font: { size: 10 } as any,
                color: '#8a9e78',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback: (v: any) => '$' + Number(v).toLocaleString(),
              },
              min: 0,
            },
          },
        },
      })
    })

    return () => { if (chartInstance) chartInstance.destroy() }
  }, [payouts])

  return (
    <div style={{ position: 'relative', height: 160 }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default function AffiliateCenterTab({ isInvestorMode = false, isMobile }: Props) {
  const supabase = createClient()

  const [loading,        setLoading]        = useState(true)
  const [affiliates,     setAffiliates]     = useState<Affiliate[]>([])
  const [payouts,        setPayouts]        = useState<Payout[]>([])
  const [withdrawals,    setWithdrawals]    = useState<Withdrawal[]>([])
  const [applications,   setApplications]   = useState<Application[]>([])
  const [rejectDialog,   setRejectDialog]   = useState<Withdrawal | null>(null)
  const [toast,          setToast]          = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [rejectReason,   setRejectReason]   = useState('')
  const [processingW,    setProcessingW]    = useState<string | null>(null)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [showAddDialog,  setShowAddDialog]  = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [markingPaid,    setMarkingPaid]    = useState<string | null>(null)
  const [confirmPay,     setConfirmPay]     = useState<Affiliate | null>(null)
  const [approveTarget,  setApproveTarget]  = useState<Withdrawal | null>(null)
  const [payMethodUsed,  setPayMethodUsed]  = useState('paypal')
  const [payMethodCustom,setPayMethodCustom]= useState('')
  const [actionMenu,     setActionMenu]     = useState<string | null>(null)
  const [searchFocused,  setSearchFocused]  = useState(false)
  const [confirmRemove,  setConfirmRemove]  = useState<string | null>(null)
  const [refreshing,     setRefreshing]     = useState(false)
  const [chartMounted,   setChartMounted]   = useState(false)

  useEffect(() => {
    if (affiliates.length === 0) return
    setChartMounted(false)
    const t = setTimeout(() => setChartMounted(true), 60)
    return () => clearTimeout(t)
  }, [affiliates.length])
  const [editDiscount,   setEditDiscount]   = useState<string | null>(null)
  const [discountInput,      setDiscountInput]      = useState('')
  const [discountMonthsInput,setDiscountMonthsInput] = useState('1')
  const [savingDiscount,     setSavingDiscount]     = useState(false)
  const [showApplications,  setShowApplications]  = useState(false)
  const [showSettings,      setShowSettings]       = useState(false)
  const [wdFilter,          setWdFilter]          = useState<'all' | 'pending' | 'paid' | 'rejected'>('pending')
  const [tableView,         setTableView]         = useState<'affiliates' | 'withdrawals' | 'history'>('affiliates')
  const [affiliateSettings, setAffiliateSettings]  = useState<AffiliateSettings | null>(null)
  const withdrawalRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const [{ data: affData }, { data: payData }, { data: wdData }, { data: appData }, { data: settingsData }] = await Promise.all([
        supabase.from('affiliates').select('*').order('signups', { ascending: false }),
        (supabase.from('affiliate_payouts') as any).select('*').order('created_at', { ascending: false }).limit(50),
        (supabase.from('affiliate_withdrawal_requests') as any).select('*').order('requested_at', { ascending: false }),
        (supabase.from('affiliate_applications') as any).select('*').order('created_at', { ascending: false }),
        (supabase.from('affiliate_settings') as any).select('*').limit(1).maybeSingle(),
      ])

      // Load settings
      if (settingsData) setAffiliateSettings(settingsData as AffiliateSettings)
      const commissionRate = (settingsData as any)?.commission_rate ?? COMMISSION_RATE

      const affs = (affData ?? []) as Affiliate[]
      const enriched = affs.map(a => ({
        ...a,
        tier:   'Standard',
        payout: a.payout,  // use real DB balance, not recalculated
      }))
      setAffiliates(enriched)

      const payList = (payData ?? []) as Payout[]
      setPayouts(payList.map(p => ({
        ...p,
        affiliateName: affs.find(a => a.id === p.affiliate_id)?.name ?? 'Unknown',
      })))

      const wdList = (wdData ?? []) as Withdrawal[]
      setWithdrawals(wdList.map(w => ({
        ...w,
        affiliateName:  affs.find(a => a.id === w.affiliate_id)?.name  ?? 'Unknown',
        affiliateEmail: affs.find(a => a.id === w.affiliate_id)?.email ?? '',
      })))
      setApplications((appData ?? []) as Application[])
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function markAsPaid(aff: Affiliate) {
    setMarkingPaid(aff.id)
    try {
      await (supabase.from('affiliate_payouts') as any).insert([{
        affiliate_id:   aff.id,
        amount:         aff.payout,
        status:         'paid',
        paid_at:        new Date().toISOString(),
        payment_method: aff.payout_method ?? 'paypal',
      }])
      await (supabase.from('affiliates') as any).update({
        payout_status: 'paid',
        paid_at:       new Date().toISOString(),
        payout:        0,  // ← reset balance to 0 after payment
      }).eq('id', aff.id)
      // Also close any pending withdrawal requests for this affiliate
      await (supabase.from('affiliate_withdrawal_requests') as any)
        .update({ status: 'paid', paid_at: new Date().toISOString(), reviewed_at: new Date().toISOString() })
        .eq('affiliate_id', aff.id)
        .eq('status', 'pending')
      await load()
      showToast('Payment recorded successfully')
    } catch (e) { console.error(e); showToast('Failed to record payment', 'error') }
    setMarkingPaid(null)
    setConfirmPay(null)
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function saveDiscount(affiliateId: string) {
    const val = Number(discountInput)
    if (isNaN(val) || val < 0 || val > 100) return
    setSavingDiscount(true)
    try {
      await (supabase.from('affiliates') as any)
        .update({ discount_percent: val, discount_months: Number(discountMonthsInput) })
        .eq('id', affiliateId)
      await load()
    } catch (e) { console.error(e) }
    setEditDiscount(null)
    setDiscountInput('')
    setSavingDiscount(false)
  }

  async function removeAffiliate(id: string) {
    try {
      // Cancel any pending withdrawal requests first
      await (supabase.from('affiliate_withdrawal_requests') as any)
        .update({ status: 'cancelled' })
        .eq('affiliate_id', id)
        .eq('status', 'pending')
      // Then remove affiliate
      await supabase.from('affiliates').delete().eq('id', id)
      await load()
      showToast('Affiliate removed')
    } catch (e) { console.error(e); showToast('Failed to remove affiliate', 'error') }
    setActionMenu(null)
    setConfirmRemove(null)
  }

  async function approveWithdrawal(w: Withdrawal, adminMethod: string) {
    setProcessingW(w.id)
    try {
      await (supabase.from('affiliate_withdrawal_requests') as any).update({
        status:      'paid',
        reviewed_at: new Date().toISOString(),
        paid_at:     new Date().toISOString(),
        admin_notes: `Paid via ${adminMethod}`,
      }).eq('id', w.id)

      await (supabase.from('affiliate_payouts') as any).insert([{
        affiliate_id:   w.affiliate_id,
        amount:         w.amount,
        status:         'paid',
        paid_at:        new Date().toISOString(),
        payment_method: adminMethod,  // ← admin's actual method saved ✅
        notes:          `Withdrawal — ${w.payment_details ?? ''}`,
      }])

      await (supabase.from('affiliates') as any).update({
        payout_status: 'paid',
        paid_at:       new Date().toISOString(),
        payout:        0,  // ← reset balance to 0 after payment
      }).eq('id', w.affiliate_id)

      await load()
      showToast('Withdrawal approved & paid')
    } catch (e) { console.error(e); showToast('Failed to approve withdrawal', 'error') }
    setProcessingW(null)
  }

  async function rejectWithdrawal(w: Withdrawal, reason: string) {
    setProcessingW(w.id)
    setRejectDialog(null)
    setRejectReason('')
    try {
      await (supabase.from('affiliate_withdrawal_requests') as any).update({
        status:           'rejected',
        reviewed_at:      new Date().toISOString(),
        rejection_reason: reason,
      }).eq('id', w.id)
      await load()
      showToast('Withdrawal rejected')
    } catch (e) { console.error(e); showToast('Failed to reject withdrawal', 'error') }
    setProcessingW(null)
  }

  function exportCSV() {
    // Safely quote a CSV cell value
    const q = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`

    const headers = [
      'Name',
      'Email',
      'Status',
      'Coupon Code',
      'Referral Link',
      'Commission Rate',
      'Duration (months)',
      'Discount %',
      'Discount Months',
      'Payment Method',
      'Pay To',
      'Clicks',
      'Signups',
      'Conv %',
      'Revenue (MRR)',
      'Pending Payout',
      'Payout Status',
      'Withdrawal Status',
      'Withdrawal Amount',
      'Total Paid Out',
      'Joined Date',
    ]

    const rows = affiliates.map(a => {
      const allPayouts    = payouts.filter(p => p.affiliate_id === a.id)
      const totalPaidOut  = allPayouts.reduce((s, p) => s + p.amount, 0)

      const allWd         = withdrawals.filter(w => w.affiliate_id === a.id)
      const latestWd      = allWd.sort((x, y) => new Date(y.requested_at).getTime() - new Date(x.requested_at).getTime())[0]
      const pendingWd     = allWd.find(w => w.status === 'pending')

      const commRate      = (a.custom_commission ?? affiliateSettings?.commission_rate ?? COMMISSION_RATE) * 100
      const discPct       = a.discount_percent   ?? affiliateSettings?.default_discount         ?? 50
      const discMonths    = a.discount_months     ?? affiliateSettings?.default_discount_months  ?? 1
      const commMonths    = affiliateSettings?.commission_months ?? COMMISSION_MONTHS
      const referralLink  = `https://riazify.com?ref=${a.code}`

      return [
        q(a.name),
        q(a.email ?? ''),
        q(a.status ?? 'active'),
        q(a.code),
        q(referralLink),
        q(`${commRate.toFixed(0)}%`),
        q(commMonths),
        q(`${discPct}%`),
        q(discMonths),
        q(a.payout_method ?? 'paypal'),
        q(a.payment_details ?? ''),
        q(a.clicks),
        q(a.signups),
        q(convRate(a.clicks, a.signups)),
        q(`$${a.mrr.toLocaleString()}`),
        q(pendingWd ? `$${pendingWd.amount.toFixed(2)}` : '—'),
        q(a.payout_status ?? 'pending'),
        q(latestWd ? latestWd.status : 'none'),
        q(latestWd ? `$${latestWd.amount.toFixed(2)}` : '—'),
        q(`$${totalPaidOut.toFixed(2)}`),
        q(a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'),
      ]
    })

    const csv  = [headers.map(h => q(h)), ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv, ], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `riazify-affiliates-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtered list
  const filtered = affiliates.filter(a => {
    const matchSearch = !searchQuery
      || a.name.toLowerCase().includes(searchQuery.toLowerCase())
      || a.code.toLowerCase().includes(searchQuery.toLowerCase())
      || (a.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchTier = true // flat rate — no tier filtering needed
    return matchSearch && matchTier
  })

  // Pagination
  const PAGE_SIZE    = 50
  const [page, setPage] = useState(1)
  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Summary stats
  const totalClicks   = affiliates.reduce((s, a) => s + a.clicks, 0)
  const totalSignups  = affiliates.reduce((s, a) => s + a.signups, 0)
  const pendingRequestIds = new Set(
    withdrawals.filter(w => w.status === 'pending').map(w => w.affiliate_id)
  )
  const totalPending  = affiliates
    .filter(a => a.payout > 0 && a.payout_status !== 'paid' && !pendingRequestIds.has(a.id))
    .reduce((s, a) => s + a.payout, 0)
  const totalRequested = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((s, w) => s + w.amount, 0)
  const activeCount   = affiliates.filter(a => a.status === 'active').length

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
           style={{ borderTopColor: C.dark }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-5">

      {/* Header — stats + buttons in one row */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
           style={{ backgroundColor: C.surface, borderColor: C.border }}>

        {/* 3 stat boxes — stretch to fill space */}
        <div className="flex gap-2 flex-1">
          {[
            { label: 'Commission', value: `${affiliateSettings ? (affiliateSettings.commission_rate * 100).toFixed(0) : '25'}% · ${affiliateSettings?.commission_months ?? 12}mo`, color: C.limeDeep, bg: C.limeTint },
            { label: 'Min payout', value: `$${affiliateSettings?.min_payout ?? 50}`,                                                                                              color: C.text,     bg: C.bg      },
            { label: 'Status',     value: affiliateSettings && !affiliateSettings.is_program_active ? 'Paused' : 'Active',                                                         color: affiliateSettings && !affiliateSettings.is_program_active ? '#f97316' : C.limeDeep, bg: affiliateSettings && !affiliateSettings.is_program_active ? '#FEF3C7' : C.bg },
          ].map((s, i) => (
            <div key={i} className="flex-1 px-3 py-2 rounded-xl text-center"
                 style={{ backgroundColor: s.bg }}>
              <p className="text-[10px] font-bold mb-0.5"
                 style={{ color: s.color === C.limeDeep ? C.limeDeep : s.color === '#f97316' ? '#92400E' : C.muted }}>
                {s.label}
              </p>
              <p className="text-[13px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 shrink-0" style={{ backgroundColor: C.border }} />

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowApplications(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-bold transition-all hover:opacity-80"
            style={{
              borderColor:     applications.filter(a => a.status === 'pending').length > 0 ? C.lime : C.border,
              color:           applications.filter(a => a.status === 'pending').length > 0 ? C.limeDeep : C.muted,
              backgroundColor: applications.filter(a => a.status === 'pending').length > 0 ? C.limeTint : C.surface,
            }}>
            <ClipboardList size={14} /> Applications
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: C.lime, color: C.dark }}>
                {applications.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
          {[
            { icon: Settings,  onClick: () => setShowSettings(true),   title: 'Commission Settings' },
            { icon: Download,  onClick: exportCSV,                     title: 'Export CSV'          },
            { icon: Link,      onClick: () => setShowLinkDialog(true), title: 'Generate Link'       },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} title={btn.title}
              className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all hover:opacity-80"
              style={{ borderColor: C.border, backgroundColor: C.surface }}>
              <btn.icon size={15} style={{ color: C.muted }} />
            </button>
          ))}

          {/* Refresh button — with spin animation */}
          <button onClick={handleRefresh} disabled={refreshing} title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all hover:opacity-80"
            style={{
              borderColor:     refreshing ? C.lime      : C.border,
              backgroundColor: refreshing ? C.limeTint  : C.surface,
            }}>
            <RefreshCw
              size={15}
              style={{
                color:     refreshing ? C.limeDeep : C.muted,
                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            />
          </button>
          <button onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: C.limeDeep, color: '#fff' }}>
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* 4 Summary cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {[
          { label: 'Total Affiliates', value: affiliates.length, sub: `${activeCount} active`,    color: C.text  },
          { label: 'Total Clicks',     value: totalClicks.toLocaleString(), sub: 'all time',     color: C.text  },
          { label: 'Total Signups',    value: totalSignups, sub: 'from referrals',               color: C.green },
          { label: 'Pending Payouts',
            value: `$${(totalPending + totalRequested).toFixed(2)}`,
            sub: `${totalRequested > 0 ? `$${totalRequested.toFixed(2)} requested` : `${affiliates.filter(a=>a.payout>0&&a.payout_status!=='paid').length} affiliates`}`,
            color: C.orange },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border"
               style={{ backgroundColor: C.surface, borderColor: C.border }}>
            <p className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>{s.label}</p>
            <p className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Chart 1 — Top affiliates by revenue */}
        <div className="p-5 rounded-2xl border"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[13px] font-bold mb-4" style={{ color: C.text }}>Top Affiliates by Revenue</p>
          <div className="flex flex-col gap-3">
            {[...affiliates]
              .sort((a, b) => b.mrr - a.mrr)
              .slice(0, 6)
              .map((aff, i) => {
                const max        = Math.max(...affiliates.map(a => a.mrr), 1)
                const pct        = (aff.mrr / max) * 100
                const barColors  = [C.limeDeep, '#5ab300', '#78c400', '#97c459', '#b5d97e', '#c0dd97']
                const badgeBgs   = ['#EAF3DE', '#EAF3DE', '#EAF3DE', '#EAF3DE', '#EAF3DE', '#EAF3DE']
                const badgeTexts = [C.limeDeep, '#3B6D11', '#3B6D11', '#3B6D11', '#3B6D11', '#639922']
                const barColor   = barColors[i] ?? '#c0dd97'
                return (
                  <div key={aff.id} className="flex items-center gap-3">
                    {/* Rank + Name */}
                    <div className="flex items-center gap-1.5 shrink-0 w-24">
                      <span className="text-[10px] font-bold w-4 text-center"
                            style={{ color: i === 0 ? C.limeDeep : C.muted }}>
                        #{i + 1}
                      </span>
                      <p className="text-[11px] font-bold truncate"
                         style={{ color: i === 0 ? C.text : C.muted }}>
                        {aff.name.split(' ')[0]}
                      </p>
                    </div>
                    {/* Bar */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <div className="h-5 rounded-lg shrink-0"
                           style={{
                             width:           chartMounted ? `${pct}%` : '0%',
                             maxWidth:        'calc(100% - 80px)',
                             backgroundColor: barColor,
                             minWidth:        chartMounted ? 4 : 0,
                             transition:      `width 0.65s cubic-bezier(0.34,1.2,0.64,1) ${i * 90}ms`,
                           }} />
                      {/* Revenue badge — fades in after bar */}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                            style={{
                              backgroundColor: badgeBgs[i],
                              color:           badgeTexts[i],
                              opacity:         chartMounted ? 1 : 0,
                              transition:      `opacity 0.3s ease ${i * 90 + 400}ms`,
                            }}>
                        ${aff.mrr.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Chart 2 — Payout history (Line chart via Chart.js) */}
        <div className="rounded-2xl border overflow-hidden"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <p className="text-[13px] font-bold" style={{ color: C.text }}>Payout History</p>
            <div className="text-right">
              <p className="text-[10px] font-bold mb-0.5" style={{ color: C.muted }}>Total paid out</p>
              <p className="text-[18px] font-extrabold" style={{ color: C.green }}>
                ${payouts.reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Chart canvas */}
          {payouts.length === 0 ? (
            <div className="flex items-center justify-center pb-8">
              <p className="text-[12px]" style={{ color: C.muted }}>No payout data yet</p>
            </div>
          ) : (
            <PayoutLineChart payouts={payouts} />
          )}
        </div>

      </div>

      {/* View tabs — proper tab bar */}
      <div style={{ borderBottom: `2px solid ${C.border}` }}>
        <div className="flex gap-0">
          {([
            { key: 'affiliates',  label: 'Affiliates',         count: affiliates.length,  badge: null },
            { key: 'withdrawals', label: 'Withdrawal Requests', count: withdrawals.length, badge: withdrawals.filter(w => w.status === 'pending').length },
            { key: 'history',     label: 'Payout History',      count: payouts.length,     badge: null },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setTableView(tab.key)}
              className="flex items-center gap-2 px-5 py-3 text-[13px] font-bold transition-all relative"
              style={{ color: tableView === tab.key ? C.limeDeep : C.muted, borderBottom: tableView === tab.key ? `2px solid ${C.limeDeep}` : '2px solid transparent', marginBottom: -2, background: 'transparent' }}>
              {tab.label}
              <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: tableView === tab.key ? C.limeTint : C.bg, color: tableView === tab.key ? C.limeDeep : C.muted }}>
                {tab.count}
              </span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: '#FDE68A', color: '#92400E' }}>
                  {tab.badge} pending
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar — affiliates only */}
      {tableView === 'affiliates' && (
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white"
             style={{ border: `1.5px solid ${searchFocused ? C.lime : C.border}`, boxShadow: searchFocused ? '0 0 0 3px rgba(143,255,0,0.15)' : 'none' }}>
          <Search size={15} style={{ color: searchFocused ? C.limeDeep : C.muted, flexShrink: 0 }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            placeholder="Search affiliates..."
            className="flex-1 text-[13px] bg-transparent"
            style={{ color: C.text, outline: 'none', border: 'none' }} />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} style={{ color: C.muted }} /></button>}
        </div>
      )}

      {/* Filter tabs — withdrawals only */}
      {tableView === 'withdrawals' && (
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'all',      label: `All (${withdrawals.length})`,                                             activeBg: C.dark,    activeColor: C.lime,    inactiveBg: C.bg,      inactiveColor: C.muted   },
            { key: 'pending',  label: `Pending (${withdrawals.filter(w=>w.status==='pending').length})`,         activeBg: '#92400E', activeColor: '#fff',    inactiveBg: '#FEF3C7', inactiveColor: '#92400E' },
            { key: 'paid',     label: `Paid (${withdrawals.filter(w=>w.status==='paid').length})`,               activeBg: '#166534', activeColor: '#fff',    inactiveBg: '#F0FDF4', inactiveColor: C.green   },
            { key: 'rejected', label: `Rejected (${withdrawals.filter(w=>w.status==='rejected').length})`,      activeBg: '#991B1B', activeColor: '#fff',    inactiveBg: '#FEF2F2', inactiveColor: C.red     },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setWdFilter(f.key)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={{ backgroundColor: wdFilter === f.key ? f.activeBg : f.inactiveBg, color: wdFilter === f.key ? f.activeColor : f.inactiveColor, border: `1px solid ${wdFilter === f.key ? f.activeBg : 'transparent'}` }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Affiliates Table */}
      {tableView === 'affiliates' && (<>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 rounded-2xl border"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <p className="text-[15px] font-bold" style={{ color: C.muted }}>
            {affiliates.length === 0 ? 'No affiliates yet' : 'No results found'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
             style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div style={{ overflowX: 'auto' }}>
          <div style={{ width: '100%', backgroundColor: C.surface }}>
          {/* Header */}
          <div className="grid items-center px-4 py-2.5"
               style={{ gridTemplateColumns: '1.4fr 1fr 1.1fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 0.7fr 1.1fr 40px', backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`, columnGap: 8 }}>
            {['Affiliate','Coupon','Discount','Commission','Clicks','Signups','Conv%','Revenue','Rate','Payout',''].map((h,i) => (
              <p key={i} className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{h}</p>
            ))}
          </div>
          {/* Rows */}
          <div className="divide-y" style={{ borderColor: C.border }}>
            {paginated.map((aff, rowIdx) => {
              const isPaying    = markingPaid === aff.id
              const alreadyPaid = aff.payout_status === 'paid'
              const wr          = withdrawals.filter(w => w.affiliate_id === aff.id).sort((a,b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())[0]
              const isInactive  = aff.status === 'inactive'
              return (
                <div key={aff.id} className="grid items-center px-4 py-2.5 hover:bg-opacity-50 transition-colors"
                     style={{ gridTemplateColumns: '1.4fr 1fr 1.1fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 0.7fr 1.1fr 40px', backgroundColor: rowIdx % 2 === 0 ? 'transparent' : C.bg, opacity: isInactive ? 0.6 : 1, columnGap: 8 }}>
                  {/* Affiliate */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                         style={{ backgroundColor: C.dark, color: C.lime }}>{aff.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>{aff.name}</p>
                        {isInactive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>Inactive</span>}
                      </div>
                      <p className="text-[10px] truncate" style={{ color: C.muted }}>{aff.email ?? '—'}</p>
                    </div>
                  </div>
                  {/* Coupon */}
                  <div>
                    <span className="inline-block text-[11px] font-bold px-2 py-1 rounded-lg"
                          style={{ backgroundColor: C.bg, color: C.text, border: `1px solid ${C.border}`, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {aff.code}
                    </span>
                  </div>
                  {/* Discount */}
                  <div>
                    {editDiscount === aff.id ? (
                      <div className="flex items-center gap-1">
                        <input value={discountInput} onChange={e => setDiscountInput(e.target.value.replace(/[^0-9]/g,''))}
                          placeholder="50" autoFocus className="w-9 h-5 px-1 rounded text-[10px] outline-none"
                          style={{ border: `1.5px solid ${C.lime}`, color: C.text }} />
                        <span className="text-[9px]" style={{ color: C.muted }}>%×</span>
                        <select value={discountMonthsInput} onChange={e => setDiscountMonthsInput(e.target.value)}
                          className="h-5 px-0.5 rounded text-[9px] outline-none"
                          style={{ border: `1.5px solid ${C.lime}`, color: C.text }}>
                          <option value="1">1mo</option><option value="2">2mo</option><option value="3">3mo</option>
                        </select>
                        <button onClick={() => saveDiscount(aff.id)} disabled={savingDiscount}
                          className="p-0.5 rounded" style={{ backgroundColor: C.lime, color: C.dark }}><CheckCircle size={9} /></button>
                        <button onClick={() => { setEditDiscount(null); setDiscountInput('') }}
                          className="p-0.5 rounded" style={{ backgroundColor: C.bg, color: C.muted }}><X size={9} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditDiscount(aff.id); setDiscountInput(String(aff.discount_percent ?? affiliateSettings?.default_discount ?? 50)); setDiscountMonthsInput(String(aff.discount_months ?? affiliateSettings?.default_discount_months ?? 1)) }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold hover:opacity-80"
                        style={{ backgroundColor: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
                        <Tag size={9} />{aff.discount_percent ?? affiliateSettings?.default_discount ?? 50}% × {aff.discount_months ?? affiliateSettings?.default_discount_months ?? 1}mo
                      </button>
                    )}
                  </div>
                  {/* Commission */}
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>
                      ${(49 * (aff.custom_commission ?? affiliateSettings?.commission_rate ?? COMMISSION_RATE)).toFixed(2)}
                    </p>
                    <p className="text-[9px]" style={{ color: C.muted }}>per user/mo</p>
                  </div>
                  {/* Stats */}
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>{aff.clicks.toLocaleString()}</p>
                  <p className="text-[12px] font-bold" style={{ color: C.limeDeep }}>{aff.signups}</p>
                  <p className="text-[12px]" style={{ color: C.text }}>{convRate(aff.clicks, aff.signups)}</p>
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>${aff.mrr.toLocaleString()}</p>
                  <p className="text-[12px] font-bold" style={{ color: C.text }}>{((aff.custom_commission ?? affiliateSettings?.commission_rate ?? COMMISSION_RATE)*100).toFixed(0)}%</p>
                  {/* Payout */}
                  <div>
                    {(() => {
                      if (!wr && aff.payout >= 50) return (
                        <button onClick={() => setConfirmPay(aff)} disabled={isPaying}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-80"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}50` }}>
                          {isPaying ? '...' : `$${aff.payout.toFixed(2)}`}
                        </button>
                      )
                      if (!wr && aff.payout > 0 && aff.payout < 50) return (
                        <div><p className="text-[11px] font-bold" style={{ color: C.muted }}>${aff.payout.toFixed(2)}</p><p className="text-[9px]" style={{ color: C.muted }}>Min. $50</p></div>
                      )
                      if (!wr && aff.payout === 0) return <span className="text-[11px]" style={{ color: C.muted }}>—</span>
                      if (wr?.status === 'pending') return (
                        <button onClick={() => setTableView('withdrawals')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                          <Clock size={10} /> ${wr.amount.toFixed(2)}
                        </button>
                      )
                      if (wr?.status === 'paid' || alreadyPaid) return (
                        <div>
                          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.green }}><CheckCircle size={10} /> Paid</span>
                          {aff.paid_at && <p className="text-[9px]" style={{ color: C.muted }}>{new Date(aff.paid_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>}
                        </div>
                      )
                      if (wr?.status === 'rejected') return <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.red }}><X size={10} /> Rejected</span>
                      if (wr?.status === 'cancelled') return (
                        <button onClick={() => setConfirmPay(aff)} disabled={isPaying}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-80"
                          style={{ backgroundColor: C.limeTint, color: C.limeDeep, border: `1px solid ${C.lime}50` }}>
                          ${aff.payout.toFixed(2)}
                        </button>
                      )
                      return <span className="text-[11px]" style={{ color: C.muted }}>—</span>
                    })()}
                  </div>
                  {/* Action menu */}
                  <div className="relative flex items-center justify-center">
                    <button onClick={() => setActionMenu(actionMenu === aff.id ? null : aff.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border hover:opacity-80"
                      style={{ borderColor: C.border }}>
                      <MoreVertical size={13} style={{ color: C.muted }} />
                    </button>
                    {actionMenu === aff.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden py-1"
                             style={{ backgroundColor: C.surface, borderColor: C.border, minWidth: 170, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                          <button onClick={() => { navigator.clipboard.writeText(`https://riazify.com?ref=${aff.code}`); setActionMenu(null) }}
                            className="w-full px-4 py-2.5 text-left text-[12px] font-bold hover:opacity-80"
                            style={{ color: C.text }}>Copy Referral Link</button>
                          <button onClick={() => { setConfirmRemove(aff.id); setActionMenu(null) }}
                            className="w-full px-4 py-2.5 text-left text-[12px] font-bold hover:opacity-80"
                            style={{ color: C.red }}>Remove Affiliate</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3"
                 style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.bg }}>
              <p className="text-[12px]" style={{ color: C.muted }}>
                Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 disabled:opacity-40"
                  style={{ borderColor: C.border, color: C.muted }}>← Prev</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    className="w-8 h-8 rounded-xl text-[12px] font-bold transition-all"
                    style={{ backgroundColor: page===p?C.dark:'transparent', color: page===p?C.lime:C.muted, border: `1px solid ${page===p?C.dark:C.border}` }}>{p}</button>
                ))}
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-bold border hover:opacity-80 disabled:opacity-40"
                  style={{ borderColor: C.border, color: C.muted }}>Next →</button>
              </div>
            </div>
          )}
          </div>
          </div>
        </div>
      )}
      </>)}

      {/* Withdrawal Requests Table */}
      {tableView === 'withdrawals' && (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: C.surface, borderColor: C.border }}>
          <div className="grid items-center px-4 py-2.5"
               style={{ gridTemplateColumns: '1.6fr 0.8fr 1fr 1fr 1fr 1fr 1.4fr', backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`, columnGap: 8 }}>
            {['Affiliate','Amount','Method','Pay To','Requested','Status','Actions'].map((h,i)=>(
              <p key={i} className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{h}</p>
            ))}
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {withdrawals
              .filter(w => wdFilter==='all'?true:wdFilter==='pending'?w.status==='pending':wdFilter==='paid'?w.status==='paid':w.status==='rejected')
              .sort((a,b)=>{const o={pending:0,rejected:1,paid:2,cancelled:3};if((o[a.status as keyof typeof o]??3)!==(o[b.status as keyof typeof o]??3))return(o[a.status as keyof typeof o]??3)-(o[b.status as keyof typeof o]??3);return b.amount-a.amount})
              .map((w,rowIdx)=>{
                const aff=affiliates.find(a=>a.id===w.affiliate_id)
                const isPending=w.status==='pending',isPaid=w.status==='paid',isRejected=w.status==='rejected',isCancelled=w.status==='cancelled'
                const isProcessing=processingW===w.id
                const statusColor=isPaid?C.green:isRejected?C.red:isCancelled?C.muted:'#92400E'
                const statusLabel=isPaid?'Paid':isRejected?'Rejected':isCancelled?'Cancelled':'Pending'
                return (
                  <div key={w.id} className="grid items-start px-4 py-3"
                       style={{ gridTemplateColumns:'1.6fr 0.8fr 1fr 1fr 1fr 1fr 1.4fr', backgroundColor:isPending?'#FFFBEB':isPaid?'#F0FDF4':isRejected?'#FEF2F2':rowIdx%2===0?'transparent':C.bg, borderLeft:`3px solid ${isPending?'#FDE68A':isPaid?'#86EFAC':isRejected?'#FECACA':'transparent'}`, columnGap:8 }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor:C.dark, color:C.lime }}>{aff?.name.charAt(0)??'?'}</div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold truncate" style={{ color:C.text }}>{aff?.name??'Unknown'}</p>
                        <p className="text-[10px] truncate" style={{ color:C.muted }}>{aff?.email??'—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[13px] font-extrabold" style={{ color:isPaid?C.green:isRejected?C.red:isCancelled?C.muted:C.limeDeep }}>${w.amount.toFixed(2)}</p>
                      {w.amount>=500&&isPending&&<span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor:'#FEF3C7',color:'#92400E' }}>HIGH</span>}
                    </div>
                    <p className="text-[12px]" style={{ color:C.text }}>{formatMethod(w.payment_method??'paypal')}</p>
                    <p className="text-[11px] truncate" style={{ color:C.muted }}>{w.payment_details??'—'}</p>
                    <p className="text-[11px]" style={{ color:C.muted }}>{new Date(w.requested_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                    <div>
                      <span className="flex items-center gap-1 text-[11px] font-bold w-fit" style={{ color:statusColor }}>
                        {isPaid?<CheckCircle size={11}/>:isRejected?<X size={11}/>:isCancelled?<X size={11}/>:<Clock size={11}/>}{statusLabel}
                      </span>
                      {isRejected&&w.rejection_reason&&<p className="text-[10px] mt-1" style={{ color:C.red }}>{w.rejection_reason}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isPending&&!isProcessing&&(<>
                        <button onClick={()=>{setRejectDialog(w);setRejectReason('')}} className="px-2.5 py-1 rounded-lg text-[11px] font-bold border hover:opacity-80" style={{ borderColor:C.border,color:C.muted }}>Reject</button>
                        <button onClick={()=>approveWithdrawal(w,w.payment_method??'paypal')} className="px-2.5 py-1 rounded-lg text-[11px] font-bold hover:opacity-80" style={{ backgroundColor:C.dark,color:C.lime }}>Approve</button>
                      </>)}
                      {isProcessing&&<div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.lime }}/><span className="text-[11px]" style={{ color:C.muted }}>Processing...</span></div>}
                      {(isPaid||isCancelled)&&<span className="text-[11px]" style={{ color:C.muted }}>—</span>}
                    </div>
                  </div>
                )
              })}
            {withdrawals.filter(w=>wdFilter==='all'?true:w.status===wdFilter).length===0&&(
              <div className="flex items-center justify-center py-10">
                <p className="text-[13px]" style={{ color:C.muted }}>No {wdFilter==='all'?'':wdFilter} requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout History Table */}
      {tableView === 'history' && (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor:C.surface,borderColor:C.border }}>
          <div className="grid items-center px-4 py-2.5"
               style={{ gridTemplateColumns:'1.8fr 0.8fr 1fr 1fr', backgroundColor:C.bg, borderBottom:`1px solid ${C.border}`, columnGap:8 }}>
            {['Affiliate','Amount','Method','Paid On'].map((h,i)=>(
              <p key={i} className="text-[10px] font-bold uppercase tracking-wide" style={{ color:C.muted }}>{h}</p>
            ))}
          </div>
          <div className="divide-y" style={{ borderColor:C.border }}>
            {payouts.length===0?(
              <div className="flex items-center justify-center py-10"><p className="text-[13px]" style={{ color:C.muted }}>No payouts yet</p></div>
            ):payouts.map((p,i)=>{
              const aff=affiliates.find(a=>a.id===p.affiliate_id)
              return (
                <div key={p.id} className="grid items-center px-4 py-3"
                     style={{ gridTemplateColumns:'1.8fr 0.8fr 1fr 1fr', backgroundColor:'#F0FDF4', borderLeft:'3px solid #86EFAC', columnGap:8 }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor:C.dark,color:C.lime }}>{aff?.name.charAt(0)??'?'}</div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color:C.text }}>{aff?.name??'Unknown'}</p>
                      <p className="text-[10px] truncate" style={{ color:C.muted }}>{aff?.email??'—'}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-extrabold" style={{ color:C.green }}>+${p.amount.toFixed(2)}</p>
                  <p className="text-[12px]" style={{ color:C.text }}>{formatMethod(p.payment_method??'paypal')}</p>
                  <p className="text-[12px]" style={{ color:C.muted }}>{p.paid_at?new Date(p.paid_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <AffiliateSettingsPanel settings={affiliateSettings} onClose={()=>setShowSettings(false)} onSaved={(s)=>{setAffiliateSettings(s);setShowSettings(false)}} />
      )}

      {/* Applications Panel */}
      {showApplications && (
        <AffiliateApplicationsPanel applications={applications} onClose={()=>setShowApplications(false)} onRefresh={load} />
      )}

      {/* Add Affiliate Dialog */}
      {showAddDialog && (
        <AddAffiliateDialog
          onClose={() => setShowAddDialog(false)}
          onCreated={() => { setShowAddDialog(false); load() }}
        />
      )}

      {/* Generate Link Dialog */}
      {showLinkDialog && (
        <GenerateLinkDialog
          affiliates={affiliates}
          onClose={() => setShowLinkDialog(false)}
        />
      )}

      {/* Confirm Pay Dialog */}
      {confirmPay && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
             onClick={e=>e.target===e.currentTarget&&setConfirmPay(null)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ backgroundColor:C.surface, boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
            <div className="px-5 py-4" style={{ borderBottom:`1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color:C.text }}>Mark as Paid</p>
            </div>
            <div className="p-5">
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor:C.bg }}>
                <div className="flex items-center justify-between mb-2"><span className="text-[12px]" style={{ color:C.muted }}>Amount</span><span className="text-[18px] font-extrabold" style={{ color:C.limeDeep }}>${confirmPay.payout.toFixed(2)}</span></div>
                <div className="flex items-center justify-between mb-2"><span className="text-[12px]" style={{ color:C.muted }}>Method</span><span className="text-[12px] font-bold" style={{ color:C.text }}>{formatMethod(confirmPay.payout_method??'paypal')}</span></div>
                {confirmPay.payment_details&&<div className="flex items-center justify-between mb-2"><span className="text-[12px]" style={{ color:C.muted }}>Pay to</span><span className="text-[12px] font-bold" style={{ color:C.limeDeep }}>{confirmPay.payment_details}</span></div>}
                <div className="flex items-center justify-between mb-2"><span className="text-[12px]" style={{ color:C.muted }}>Affiliate</span><span className="text-[12px] font-bold" style={{ color:C.text }}>{confirmPay.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-[12px]" style={{ color:C.muted }}>Commission</span><span className="text-[12px] font-bold" style={{ color:C.text }}>{((confirmPay.custom_commission??affiliateSettings?.commission_rate??COMMISSION_RATE)*100).toFixed(0)}% · {affiliateSettings?.commission_months??COMMISSION_MONTHS}mo</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setConfirmPay(null)} className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold" style={{ borderColor:C.border,color:C.muted }}>Cancel</button>
                <button onClick={()=>markAsPaid(confirmPay)} disabled={markingPaid===confirmPay.id}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor:C.dark,color:C.lime }}>
                  {markingPaid===confirmPay.id?<><div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor:C.lime }}/> Paying...</>:'Yes, Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
             onClick={e=>e.target===e.currentTarget&&setRejectDialog(null)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ backgroundColor:C.surface, boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
            <div className="px-5 py-4" style={{ borderBottom:`1px solid ${C.border}` }}>
              <p className="text-[15px] font-bold" style={{ color:C.text }}>Reject Withdrawal</p>
            </div>
            <div className="p-5">
              <p className="text-[13px] mb-3" style={{ color:C.muted }}>Rejecting ${rejectDialog.amount.toFixed(2)} for {affiliates.find(a=>a.id===rejectDialog.affiliate_id)?.name??'affiliate'}.</p>
              <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={3}
                className="w-full p-3 rounded-xl text-[13px] resize-none" style={{ border:`1.5px solid ${C.border}`,color:C.text,outline:'none' }} />
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setRejectDialog(null)} className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold" style={{ borderColor:C.border,color:C.muted }}>Cancel</button>
                <button onClick={()=>rejectWithdrawal(rejectDialog,rejectReason)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold" style={{ backgroundColor:C.red,color:'#fff' }}>Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
             onClick={e=>e.target===e.currentTarget&&setConfirmRemove(null)}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor:C.surface, boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
            <p className="text-[15px] font-bold mb-2" style={{ color:C.text }}>Remove Affiliate?</p>
            <p className="text-[13px] mb-4" style={{ color:C.muted }}>This will permanently remove the affiliate and cancel any pending withdrawal requests.</p>
            <div className="flex gap-2">
              <button onClick={()=>setConfirmRemove(null)} className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold" style={{ borderColor:C.border,color:C.muted }}>Cancel</button>
              <button onClick={()=>removeAffiliate(confirmRemove)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold" style={{ backgroundColor:C.red,color:'#fff' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
             style={{
               backgroundColor: toast.type === 'error' ? '#FEF2F2' : C.dark,
               border:          `1px solid ${toast.type === 'error' ? '#FECACA' : C.lime}`,
               color:           toast.type === 'error' ? C.red : C.lime,
               animation:       'slideInUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
             }}>
          {toast.type === 'error'
            ? <X size={15} />
            : <CheckCircle size={15} />}
          <p className="text-[13px] font-bold">{toast.msg}</p>
        </div>
      )}

    </div>
  )
}